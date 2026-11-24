'use server';

import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isOneOf, ALL_ROLES } from '@/lib/access';
import { testResultSchema, zodFieldErrors } from '@/lib/validation';
import { parseDateISO } from '@/lib/format';
import { revalidatePath } from 'next/cache';

export interface SaveTestResultResult {
  ok: boolean;
  /** Muncul bila ok === false dan bukan kasus konfirmasi retest. */
  error?: string;
  /** Peta field → pesan kesalahan validasi. */
  fieldErrors?: Record<string, string>;
  /** true bila entri terakhir SID sudah PASS dan butuh konfirmasi retest. */
  needsRetestConfirm?: boolean;
  /** Nomor attempt entri yang baru tersimpan (bila ok === true). */
  attemptNumber?: number;
  /** SID yang tersimpan (sudah dinormalisasi). */
  sid?: string;
}

export async function saveTestResultAction(input: unknown): Promise<SaveTestResultResult> {
  // 1. Sesi & role — diverifikasi di server, bukan hanya di UI.
  const session = await getSession();
  if (!session || !isOneOf(session.role, ALL_ROLES)) {
    return { ok: false, error: 'Akses ditolak. Hanya tim QC dan Product Manager yang dapat menyimpan hasil testing.' };
  }

  // 2. Validasi input di server (zod).
  const parsed = testResultSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Periksa kembali isian form.', fieldErrors: zodFieldErrors(parsed.error) };
  }

  const { sid, title, date, environment, status, notes, confirmRetest } = parsed.data;

  const testDate = parseDateISO(date) ?? new Date();

  // 3. Konfirmasi retest bila entri terakhir untuk SID ini berstatus PASS.
  const latestForSid = await prisma.testResult.findFirst({
    where: { sid },
    orderBy: { createdAt: 'desc' },
    select: { status: true },
  });

  if (latestForSid?.status === 'PASS' && !confirmRetest) {
    return {
      ok: false,
      needsRetestConfirm: true,
    };
  }

  // 4. attemptNumber dihitung di server: jumlah entri sebelumnya dengan SID sama + 1.
  const saved = await prisma.$transaction(async (tx) => {
    const previousAttempts = await tx.testResult.count({ where: { sid } });
    const attemptNumber = previousAttempts + 1;

    return tx.testResult.create({
      data: {
        sid,
        taskTitle: title,
        testerId: session.userId,
        testedAt: testDate,
        environment: environment === 'Production' ? 'PRODUCTION' : 'DEMO',
        status: status === 'PASS' ? 'PASS' : 'FAIL',
        note: notes ?? null,
        attemptNumber,
      },
      select: { id: true, attemptNumber: true },
    });
  });

  revalidatePath('/riwayat');
  revalidatePath('/dashboard');

  return {
    ok: true,
    attemptNumber: saved.attemptNumber,
    sid,
  };
}

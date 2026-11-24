import { z } from 'zod';

/**
 * Skema input hasil testing — dipakai bersama oleh validasi client
 * (halaman Input Testing) dan validasi server (server action).
 */
export const testResultSchema = z.object({
  sid: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, 'SDG/Ticket wajib diisi')
    .regex(/^(SDG|SID)-.+$/, 'SDG wajib diawali "SDG-" (contoh: SDG-234, SDG-2024-001)'),
  title: z.string().trim().min(1, 'Judul Task wajib diisi'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal tidak valid')
    .refine((v) => !Number.isNaN(new Date(`${v}T00:00:00`).getTime()), {
      error: 'Tanggal tidak valid',
    }),
  environment: z.enum(['Demo', 'Production'], { error: 'Pilih environment' }),
  status: z.enum(['PASS', 'FAIL'], { error: 'Pilih status hasil testing' }),
  notes: z
    .string()
    .trim()
    .max(2000, 'Catatan maksimal 2000 karakter')
    .optional()
    .transform((v) => (v ? v : undefined)),
  /** Konfirmasi dari pengguna bila SID terakhir berstatus PASS. */
  confirmRetest: z.boolean().optional(),
});

export type TestResultInput = z.input<typeof testResultSchema>;
export type TestResultParsed = z.output<typeof testResultSchema>;

/** Mengubah ZodError menjadi peta field → pesan (pesan pertama per field). */
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !out[key]) {
      out[key] = issue.message;
    }
  }
  return out;
}

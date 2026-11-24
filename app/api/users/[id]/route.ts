import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { isOneOf, ROLE_LABELS } from '@/lib/access';
import { hashPassword } from '@/lib/password';
import type { Role } from '@prisma/client';

const MANAGEABLE_ROLES: Role[] = ['QC_WEB', 'QC_MOBILE', 'QC_API', 'PRODUCT_MANAGER'];

/** Menolak aksi yang membuat jumlah role aktif menjadi nol. */
async function lastActiveRoleGuard(
  targetUser: { role: Role; isActive: boolean }
): Promise<string | null> {
  if (targetUser.isActive) {
    const activeCount = await prisma.user.count({
      where: { role: targetUser.role, isActive: true },
    });
    if (activeCount <= 1) {
      return `Sistem harus menyisakan minimal satu ${ROLE_LABELS[targetUser.role]} aktif.`;
    }
  }
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !isOneOf(session.role, ['PRODUCT_MANAGER'])) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  const { id } = await params;

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) {
    return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
  }

  const body = (await request.json()) as {
    role?: Role;
    isActive?: boolean;
    password?: string;
  };

  // Pengguna tidak dapat menonaktifkan atau menurunkan role akunnya sendiri
  if (id === session.userId) {
    if (body.isActive !== undefined || (body.role !== undefined && body.role !== session.role)) {
      return NextResponse.json(
        { error: 'Tidak dapat menonaktifkan atau menurunkan role akun sendiri.' },
        { status: 400 }
      );
    }
  }

  const updateData: {
    role?: Role;
    isActive?: boolean;
    passwordHash?: string;
  } = {};

  if (body.role !== undefined) {
    if (!MANAGEABLE_ROLES.includes(body.role)) {
      return NextResponse.json({ error: 'Role tidak valid.' }, { status: 400 });
    }

    if (targetUser.role !== body.role) {
      const guard = await lastActiveRoleGuard(targetUser);
      if (guard) {
        return NextResponse.json({ error: guard }, { status: 400 });
      }
    }

    updateData.role = body.role;
  }

  if (body.isActive !== undefined) {
    if (!body.isActive) {
      const guard = await lastActiveRoleGuard(targetUser);
      if (guard) {
        return NextResponse.json({ error: guard }, { status: 400 });
      }
    }
    updateData.isActive = body.isActive;
  }

  if (body.password !== undefined) {
    if (body.password.length < 6) {
      return NextResponse.json(
        { error: 'Password baru minimal 6 karakter.' },
        { status: 400 }
      );
    }
    updateData.passwordHash = await hashPassword(body.password);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user: updated });
}

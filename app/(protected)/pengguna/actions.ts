'use server';

import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { isOneOf, ROLE_LABELS } from '@/lib/access';
import { revalidatePath } from 'next/cache';
import type { Role } from '@prisma/client';

const MANAGEABLE_ROLES: Role[] = ['QC_WEB', 'QC_MOBILE', 'QC_API', 'PRODUCT_MANAGER'];

async function requireUserManager() {
  const session = await getSession();
  if (!session || !isOneOf(session.role, ['PRODUCT_MANAGER'])) {
    throw new Error('Akses ditolak. Tindakan ini hanya untuk Product Manager.');
  }
  return session;
}

/** Menolak aksi yang membuat jumlah role aktif menjadi nol (mis. PM terakhir). */
async function assertNotLastActiveOfRole(targetUserId: string, role: Role): Promise<string | null> {
  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) return 'Pengguna tidak ditemukan.';

  if (targetUser.role === role && targetUser.isActive) {
    const activeCount = await prisma.user.count({ where: { role, isActive: true } });
    if (activeCount <= 1) {
      return `Sistem harus menyisakan minimal satu ${ROLE_LABELS[role]} aktif.`;
    }
  }
  return null;
}

export async function createUserAction(data: {
  name: string;
  email: string;
  password: string;
  role: Role;
}) {
  try {
    await requireUserManager();

    const { name, email, password, role } = data;

    if (!name?.trim() || !email?.trim() || !password || !role) {
      return { error: 'Semua field wajib diisi.' };
    }

    if (password.length < 6) {
      return { error: 'Password minimal 6 karakter.' };
    }

    if (!MANAGEABLE_ROLES.includes(role)) {
      return { error: 'Role tidak valid.' };
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return { error: 'Email sudah terdaftar.' };
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    revalidatePath('/pengguna');
    return { success: true, user };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan server.';
    return { error: message };
  }
}

export async function updateUserRoleAction(
  targetUserId: string,
  newRole: Role
) {
  try {
    const session = await requireUserManager();

    if (targetUserId === session.userId) {
      return { error: 'Tidak dapat mengubah role akun sendiri.' };
    }

    if (!MANAGEABLE_ROLES.includes(newRole)) {
      return { error: 'Role tidak valid.' };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return { error: 'Pengguna tidak ditemukan.' };
    }

    // Menurunkan role dapat menghapus PM aktif terakhir.
    if (targetUser.role !== newRole) {
      const guard = await assertNotLastActiveOfRole(targetUserId, targetUser.role);
      if (guard) return { error: guard };
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    revalidatePath('/pengguna');
    return { success: true, user: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan server.';
    return { error: message };
  }
}

export async function toggleUserActiveAction(
  targetUserId: string,
  currentlyActive: boolean
) {
  try {
    const session = await requireUserManager();

    if (targetUserId === session.userId) {
      return { error: 'Tidak dapat menonaktifkan akun sendiri.' };
    }

    if (currentlyActive) {
      const guard = await assertNotLastActiveOfRole(targetUserId, 'PRODUCT_MANAGER');
      if (guard) return { error: guard };
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { isActive: !currentlyActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    revalidatePath('/pengguna');
    return { success: true, user: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan server.';
    return { error: message };
  }
}

export async function resetUserPasswordAction(
  targetUserId: string,
  newPassword: string
) {
  try {
    await requireUserManager();

    if (!newPassword || newPassword.length < 6) {
      return { error: 'Password baru minimal 6 karakter.' };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return { error: 'Pengguna tidak ditemukan.' };
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: targetUserId },
      data: { passwordHash },
    });

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan server.';
    return { error: message };
  }
}

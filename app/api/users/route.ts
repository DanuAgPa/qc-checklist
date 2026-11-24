import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { isOneOf } from '@/lib/access';
import { hashPassword } from '@/lib/password';
import type { Role } from '@prisma/client';

const MANAGEABLE_ROLES: Role[] = ['QC_WEB', 'QC_MOBILE', 'QC_API', 'PRODUCT_MANAGER'];

function canManage(session: { role: string } | null): boolean {
  return session !== null && isOneOf(session.role, ['PRODUCT_MANAGER']);
}

export async function GET() {
  const session = await getSession();
  if (!canManage(session)) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!canManage(session)) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
    role?: Role;
  };

  const { name, email, password, role } = body;

  if (!name?.trim() || !email?.trim() || !password || !role) {
    return NextResponse.json(
      { error: 'Semua field wajib diisi.' },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: 'Password minimal 6 karakter.' },
      { status: 400 }
    );
  }

  if (!MANAGEABLE_ROLES.includes(role)) {
    return NextResponse.json(
      { error: 'Role tidak valid.' },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    return NextResponse.json(
      { error: 'Email sudah terdaftar.' },
      { status: 409 }
    );
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

  return NextResponse.json({ user }, { status: 201 });
}

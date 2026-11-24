import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json() as { email?: string; password?: string };
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email dan password wajib diisi.' },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check rate limit
  const loginAttempt = await prisma.loginAttempt.findUnique({
    where: { email: normalizedEmail },
  });

  if (loginAttempt && loginAttempt.lockedUntil && loginAttempt.lockedUntil > new Date()) {
    const remainingMs = loginAttempt.lockedUntil.getTime() - Date.now();
    const remainingMin = Math.ceil(remainingMs / 60000);
    return NextResponse.json(
      { error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${remainingMin} menit.` },
      { status: 429 }
    );
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    await recordFailedAttempt(normalizedEmail);
    return NextResponse.json(
      { error: 'Email atau password salah.' },
      { status: 401 }
    );
  }

  // Check if active
  if (!user.isActive) {
    return NextResponse.json(
      { error: 'Akun ini dinonaktifkan. Hubungi Product Manager.' },
      { status: 403 }
    );
  }

  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    await recordFailedAttempt(normalizedEmail);
    return NextResponse.json(
      { error: 'Email atau password salah.' },
      { status: 401 }
    );
  }

  // Success — reset attempts
  await prisma.loginAttempt.deleteMany({
    where: { email: normalizedEmail },
  });

  // Create token and set cookie
  const token = await createToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const response = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  setAuthCookie(response, token);
  return response;
}

async function recordFailedAttempt(email: string): Promise<void> {
  const existing = await prisma.loginAttempt.findUnique({
    where: { email },
  });

  if (existing) {
    const newCount = existing.attemptCount + 1;
    await prisma.loginAttempt.update({
      where: { email },
      data: {
        attemptCount: newCount,
        lastAttemptAt: new Date(),
        lockedUntil: newCount >= 5 ? new Date(Date.now() + 5 * 60 * 1000) : null,
      },
    });
  } else {
    await prisma.loginAttempt.create({
      data: {
        email,
        attemptCount: 1,
        lastAttemptAt: new Date(),
      },
    });
  }
}

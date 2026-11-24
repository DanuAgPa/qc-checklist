import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  removeAuthCookie(response);
  return response;
}

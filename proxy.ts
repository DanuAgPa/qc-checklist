import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { ROLE_ACCESS, isOneOf } from '@/lib/access';

const COOKIE_NAME = 'qc-session';

const PUBLIC_PATHS = ['/login', '/403', '/api/auth/login'];

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role as string;

    // Check role-based access
    for (const [path, allowedRoles] of Object.entries(ROLE_ACCESS)) {
      if (pathname === path || pathname.startsWith(path + '/')) {
        if (!isOneOf(role, allowedRoles)) {
          return NextResponse.redirect(new URL('/403', request.url));
        }
        break;
      }
    }

    // Also protect API routes (must be authenticated, specific checks in route handlers)
    return NextResponse.next();
  } catch {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};

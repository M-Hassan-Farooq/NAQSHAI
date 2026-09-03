import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protected routes that require seller authentication
  const isProtectedRoute = pathname.startsWith('/sell') || pathname.startsWith('/dashboard');

  // Allow unauthenticated browsing on all public routes (/, /explore, /recommend, /login, /api/*)
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that don't require authentication
  const publicPaths = ['/', '/login', '/signup'];

  if (!publicPaths.includes(pathname)) {
    // For protected routes, let the client-side auth check handle it
    // since we can't directly access Supabase auth on the server
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

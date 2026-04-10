import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/join-club') ||
    pathname.startsWith('/resources') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Check for athlete session cookie
  const athleteId = request.cookies.get('mm_athlete_id')?.value;
  if (!athleteId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If Supabase is not configured, allow through with mock data
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

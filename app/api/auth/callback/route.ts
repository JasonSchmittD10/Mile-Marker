import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/strava/oauth';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const scope = searchParams.get('scope');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    const tokenData = await exchangeCodeForTokens(code);
    const { access_token, refresh_token, expires_at, athlete } = tokenData;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Upsert athlete record
    const { data: athleteRecord, error } = await supabase
      .from('athletes')
      .upsert(
        {
          strava_id: athlete.id,
          firstname: athlete.firstname,
          lastname: athlete.lastname,
          profile_medium: athlete.profile_medium,
          strava_profile_url: athlete.profile_medium ?? null,
          city: (athlete as { city?: string }).city ?? null,
          access_token,
          refresh_token,
          token_expires_at: expires_at,
          scopes_accepted: scope ?? 'read,activity:read_all',
        },
        { onConflict: 'strava_id' }
      )
      .select('id')
      .single();

    if (error || !athleteRecord) {
      console.error('Failed to upsert athlete:', error);
      return NextResponse.redirect(new URL('/login?error=db_error', request.url));
    }

    // Set session cookie
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('mm_athlete_id', athleteRecord.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Auth callback error:', err);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}

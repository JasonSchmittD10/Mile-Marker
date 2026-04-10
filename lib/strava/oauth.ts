import { createClient } from '@supabase/supabase-js';
import type { StravaTokenResponse } from '@/types';

export function buildStravaAuthURL(): string {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read_all',
  });
  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<StravaTokenResponse> {
  const response = await fetch('https://www.strava.com/api/v3/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error(`Strava token exchange failed: ${response.status}`);
  }

  return response.json() as Promise<StravaTokenResponse>;
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_at: number;
}> {
  const response = await fetch('https://www.strava.com/api/v3/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Strava token refresh failed: ${response.status}`);
  }

  return response.json();
}

export async function getValidAccessToken(athleteId: string): Promise<string> {
  // Use service role key for server-side token management
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: athlete, error } = await supabase
    .from('athletes')
    .select('access_token, refresh_token, token_expires_at')
    .eq('id', athleteId)
    .single();

  if (error || !athlete) {
    throw new Error(`Athlete not found: ${athleteId}`);
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const bufferSeconds = 300; // refresh 5 min early

  if (athlete.token_expires_at && athlete.token_expires_at > nowSeconds + bufferSeconds) {
    return athlete.access_token as string;
  }

  // Token expired or expiring soon — refresh it
  const refreshed = await refreshAccessToken(athlete.refresh_token as string);

  await supabase
    .from('athletes')
    .update({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token,
      token_expires_at: refreshed.expires_at,
    })
    .eq('id', athleteId);

  return refreshed.access_token;
}

import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/strava/oauth';

export async function POST(request: NextRequest) {
  // Only callable server-side via internal requests
  const athleteId = request.cookies.get('mm_athlete_id')?.value;

  if (!athleteId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const accessToken = await getValidAccessToken(athleteId);
    return NextResponse.json({ access_token: accessToken });
  } catch (err) {
    console.error('Token refresh error:', err);
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 });
  }
}

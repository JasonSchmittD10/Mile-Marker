import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getValidAccessToken } from '@/lib/strava/oauth';
import { getActivity } from '@/lib/strava/api';
import { checkAndAwardBadges } from '@/lib/gamification/badges';
import { recalculateStreak } from '@/lib/gamification/streaks';
import { generateHighlights } from '@/lib/gamification/highlights';
import type { StravaWebhookEvent } from '@/types';

// GET — Strava webhook subscription validation
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const verifyToken = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (
    mode === 'subscribe' &&
    verifyToken === process.env.STRAVA_WEBHOOK_VERIFY_TOKEN
  ) {
    return NextResponse.json({ 'hub.challenge': challenge });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// POST — Incoming Strava activity events
export async function POST(request: NextRequest) {
  // Always respond 200 immediately (Strava requires fast ack)
  const event: StravaWebhookEvent = await request.json();

  // Process async — don't await
  processWebhookEvent(event).catch((err) => {
    console.error('Webhook processing error:', err);
  });

  return NextResponse.json({ received: true });
}

async function processWebhookEvent(event: StravaWebhookEvent): Promise<void> {
  if (event.object_type !== 'activity' || event.aspect_type !== 'create') {
    return;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find athlete by Strava owner_id
  const { data: athlete } = await supabase
    .from('athletes')
    .select('id')
    .eq('strava_id', event.owner_id)
    .single();

  if (!athlete) {
    console.log(`No athlete found for strava_id: ${event.owner_id}`);
    return;
  }

  // Get fresh access token
  const accessToken = await getValidAccessToken(athlete.id);

  // Fetch full activity from Strava
  const stravaActivity = await getActivity(event.object_id, accessToken);

  // Insert into activities table
  const { data: insertedActivity, error: insertError } = await supabase
    .from('activities')
    .insert({
      athlete_id: athlete.id,
      strava_activity_id: stravaActivity.id,
      name: stravaActivity.name,
      sport_type: stravaActivity.sport_type,
      distance_meters: stravaActivity.distance,
      moving_time_seconds: stravaActivity.moving_time,
      start_date_local: stravaActivity.start_date_local,
      start_latlng: stravaActivity.start_latlng,
      summary_polyline: stravaActivity.map?.summary_polyline ?? null,
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('Failed to insert activity:', insertError);
    return;
  }

  await checkAndAwardBadges(
    { ...stravaActivity, db_id: insertedActivity.id },
    athlete.id
  );

  await generateHighlights(insertedActivity.id, athlete.id, {
    distance_meters: stravaActivity.distance,
    moving_time_seconds: stravaActivity.moving_time,
    start_date_local: stravaActivity.start_date_local,
  });

  await recalculateStreak(athlete.id);
}

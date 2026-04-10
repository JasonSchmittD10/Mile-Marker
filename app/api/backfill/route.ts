import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getValidAccessToken } from '@/lib/strava/oauth';
import { checkAndAwardBadges } from '@/lib/gamification/badges';
import { recalculateStreak } from '@/lib/gamification/streaks';
import type { StravaActivity } from '@/types';

export async function POST(request: NextRequest) {
  const athleteId = request.cookies.get('mm_athlete_id')?.value;
  if (!athleteId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const accessToken = await getValidAccessToken(athleteId);

    // Fetch activities from the past 30 days only
    const after = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
    const allActivities: StravaActivity[] = [];
    let page = 1;
    const perPage = 200;

    while (true) {
      const res = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}&page=${page}&after=${after}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!res.ok) {
        throw new Error(`Strava fetch failed: ${res.status}`);
      }

      const batch: StravaActivity[] = await res.json();
      if (batch.length === 0) break;

      allActivities.push(...batch);
      if (batch.length < perPage) break;
      page++;
    }

    // Upsert each activity (skip ones already in DB)
    let inserted = 0;
    let skipped = 0;

    for (const activity of allActivities) {
      const { data: existing } = await supabase
        .from('activities')
        .select('id')
        .eq('strava_activity_id', activity.id)
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      const { data: inserted_row, error } = await supabase
        .from('activities')
        .insert({
          athlete_id: athleteId,
          strava_activity_id: activity.id,
          name: activity.name,
          sport_type: activity.sport_type,
          distance_meters: activity.distance,
          moving_time_seconds: activity.moving_time,
          start_date_local: activity.start_date_local,
          start_latlng: activity.start_latlng,
          summary_polyline: activity.map?.summary_polyline ?? null,
        })
        .select('id')
        .single();

      if (error || !inserted_row) continue;

      await checkAndAwardBadges(
        { ...activity, db_id: inserted_row.id },
        athleteId
      );

      inserted++;
    }

    // Recalculate streak once after all inserts
    await recalculateStreak(athleteId);

    return NextResponse.json({
      success: true,
      total: allActivities.length,
      inserted,
      skipped,
    });
  } catch (err) {
    console.error('Backfill error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

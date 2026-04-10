import { createClient } from '@supabase/supabase-js';
import type { BadgeType, StravaActivity } from '@/types';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Haversine distance in meters between two lat/lng points
function haversineMeters(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function awardBadgeIfNotDuplicate(
  athleteId: string,
  activityId: string,
  badgeType: BadgeType
): Promise<void> {
  const supabase = getServiceClient();

  // Check if already awarded for this activity
  const { data: existing } = await supabase
    .from('badges')
    .select('id')
    .eq('athlete_id', athleteId)
    .eq('activity_id', activityId)
    .eq('badge_type', badgeType)
    .single();

  if (existing) return; // already awarded

  await supabase.from('badges').insert({
    athlete_id: athleteId,
    badge_type: badgeType,
    activity_id: activityId,
    earned_at: new Date().toISOString(),
  });
}

export async function checkAndAwardBadges(
  activity: StravaActivity & { db_id: string },
  athleteId: string
): Promise<void> {
  const supabase = getServiceClient();
  const activityId = activity.db_id;
  const startDate = new Date(activity.start_date_local);
  const hour = startDate.getHours();
  const day = startDate.getDay(); // 0 = Sunday

  // dawn_treader: activity before 6 AM
  if (hour < 6) {
    await awardBadgeIfNotDuplicate(athleteId, activityId, 'dawn_treader');
  }

  // sunday_stroll: Sunday at or after noon
  if (day === 0 && hour >= 12) {
    await awardBadgeIfNotDuplicate(athleteId, activityId, 'sunday_stroll');
  }

  // fellowship: another athlete's activity within 5 min and 100m
  if (activity.start_latlng && activity.start_latlng.length === 2) {
    const [lat, lng] = activity.start_latlng;
    const fiveMinMs = 5 * 60 * 1000;
    const startTime = startDate.getTime();

    const { data: nearbyActivities } = await supabase
      .from('activities')
      .select('athlete_id, start_date_local, start_latlng')
      .neq('athlete_id', athleteId)
      .not('start_latlng', 'is', null);

    let hasFellowship = false;
    for (const other of nearbyActivities ?? []) {
      if (!other.start_latlng || other.start_latlng.length < 2) continue;
      const otherTime = new Date(other.start_date_local).getTime();
      if (Math.abs(otherTime - startTime) > fiveMinMs) continue;
      const dist = haversineMeters(lat, lng, other.start_latlng[0], other.start_latlng[1]);
      if (dist < 100) {
        hasFellowship = true;
        break;
      }
    }

    if (hasFellowship) {
      await awardBadgeIfNotDuplicate(athleteId, activityId, 'fellowship');
    }
  }

  // pilgrim: cumulative distance >= 160934m (100 miles)
  const { data: distResult } = await supabase
    .from('activities')
    .select('distance_meters')
    .eq('athlete_id', athleteId);

  const totalMeters = (distResult ?? []).reduce(
    (sum: number, a: { distance_meters: number }) => sum + Number(a.distance_meters),
    0
  );

  if (totalMeters >= 160934) {
    // Only award once — check if pilgrim exists at all for this athlete
    const { data: pilgrimBadge } = await supabase
      .from('badges')
      .select('id')
      .eq('athlete_id', athleteId)
      .eq('badge_type', 'pilgrim')
      .single();

    if (!pilgrimBadge) {
      await supabase.from('badges').insert({
        athlete_id: athleteId,
        badge_type: 'pilgrim',
        activity_id: activityId,
        earned_at: new Date().toISOString(),
      });
    }
  }

  // on_fire: current streak >= 4 and not yet awarded this streak cycle
  const { data: streakData } = await supabase
    .from('streaks')
    .select('current_weeks')
    .eq('athlete_id', athleteId)
    .single();

  if (streakData && streakData.current_weeks >= 4) {
    await awardBadgeIfNotDuplicate(athleteId, activityId, 'on_fire');
  }

  // barnabas: >= 3 fellowship badges this calendar month
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  const { count } = await supabase
    .from('badges')
    .select('id', { count: 'exact' })
    .eq('athlete_id', athleteId)
    .eq('badge_type', 'fellowship')
    .gte('earned_at', monthStart);

  if ((count ?? 0) >= 3) {
    // Check if barnabas awarded this month
    const { data: existingBarnabas } = await supabase
      .from('badges')
      .select('id')
      .eq('athlete_id', athleteId)
      .eq('badge_type', 'barnabas')
      .gte('earned_at', monthStart)
      .single();

    if (!existingBarnabas) {
      await supabase.from('badges').insert({
        athlete_id: athleteId,
        badge_type: 'barnabas',
        activity_id: activityId,
        earned_at: new Date().toISOString(),
      });
    }
  }
}

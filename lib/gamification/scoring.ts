import { createClient } from '@supabase/supabase-js';

type ActivityRow = { athlete_id: string; distance_meters: number };
type MonthActivityRow = { athlete_id: string; distance_meters: number; moving_time_seconds: number; start_date_local: string };

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getWeekBounds(): { start: string; end: string } {
  const now = new Date();
  const day = now.getUTCDay();
  const diffToMonday = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diffToMonday);
  monday.setUTCHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);
  return {
    start: monday.toISOString(),
    end: sunday.toISOString(),
  };
}

function getMonthBounds(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function computeWeeklyStats() {
  const supabase = getServiceClient();
  const { start, end } = getWeekBounds();

  const { data: activities } = await supabase
    .from('activities')
    .select('athlete_id, distance_meters')
    .gte('start_date_local', start)
    .lte('start_date_local', end);

  const { data: badges } = await supabase
    .from('badges')
    .select('id')
    .gte('earned_at', start)
    .lte('earned_at', end);

  const { data: allActivities } = await supabase
    .from('activities')
    .select('distance_meters');

  const membersActive = new Set((activities ?? []).map((a: ActivityRow) => a.athlete_id)).size;
  const totalMilesThisWeek =
    (activities ?? []).reduce((sum: number, a: ActivityRow) => sum + Number(a.distance_meters), 0) / 1609.34;
  const badgesEarnedThisWeek = (badges ?? []).length;
  const totalMilesEver =
    (allActivities ?? []).reduce((sum: number, a: { distance_meters: number }) => sum + Number(a.distance_meters), 0) / 1609.34;

  return { membersActive, totalMilesThisWeek, badgesEarnedThisWeek, totalMilesEver };
}

export async function computeMonthlyStats() {
  const supabase = getServiceClient();
  const { start, end } = getMonthBounds();

  const { data: activities } = await supabase
    .from('activities')
    .select('athlete_id, distance_meters, moving_time_seconds, start_date_local')
    .gte('start_date_local', start)
    .lte('start_date_local', end);

  const athleteActiveDays = new Map<string, Set<string>>();
  const athleteTotalTime = new Map<string, number>();

  for (const activity of (activities ?? []) as MonthActivityRow[]) {
    const dateKey = activity.start_date_local.slice(0, 10);
    if (!athleteActiveDays.has(activity.athlete_id)) {
      athleteActiveDays.set(activity.athlete_id, new Set());
    }
    athleteActiveDays.get(activity.athlete_id)!.add(dateKey);

    const prev = athleteTotalTime.get(activity.athlete_id) ?? 0;
    athleteTotalTime.set(activity.athlete_id, prev + Number(activity.moving_time_seconds));
  }

  return { athleteActiveDays, athleteTotalTime };
}

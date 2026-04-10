import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export function getISOWeekString(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getPreviousISOWeek(isoWeek: string): string {
  // Parse "YYYY-Www" and subtract 7 days
  const [yearStr, weekStr] = isoWeek.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);

  // Find the Monday of the given ISO week
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dayOfWeek = simple.getDay();
  const monday = new Date(simple);
  monday.setDate(simple.getDate() - (dayOfWeek <= 4 ? dayOfWeek - 1 : dayOfWeek - 8));

  // Subtract 7 days to get the previous week's Monday
  const prevMonday = new Date(monday);
  prevMonday.setDate(monday.getDate() - 7);

  return getISOWeekString(prevMonday);
}

export async function recalculateStreak(athleteId: string): Promise<void> {
  const supabase = getServiceClient();

  // Get all activities for this athlete, newest first
  const { data: activities } = await supabase
    .from('activities')
    .select('start_date_local')
    .eq('athlete_id', athleteId)
    .order('start_date_local', { ascending: false });

  if (!activities || activities.length === 0) return;

  // Get unique ISO weeks
  const weeks = Array.from(new Set(
    activities.map((a: { start_date_local: string }) =>
      getISOWeekString(new Date(a.start_date_local))
    )
  )).sort().reverse(); // newest first

  const latestWeek = weeks[0];
  let currentStreak = 1;

  for (let i = 1; i < weeks.length; i++) {
    const expectedPrev = getPreviousISOWeek(weeks[i - 1]);
    if (weeks[i] === expectedPrev) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Get existing streak record
  const { data: existing } = await supabase
    .from('streaks')
    .select('id, longest_weeks')
    .eq('athlete_id', athleteId)
    .single();

  const longestWeeks = Math.max(currentStreak, existing?.longest_weeks ?? 0);

  if (existing) {
    await supabase
      .from('streaks')
      .update({
        current_weeks: currentStreak,
        longest_weeks: longestWeeks,
        last_active_iso_week: latestWeek,
        updated_at: new Date().toISOString(),
      })
      .eq('athlete_id', athleteId);
  } else {
    await supabase
      .from('streaks')
      .insert({
        athlete_id: athleteId,
        current_weeks: currentStreak,
        longest_weeks: longestWeeks,
        last_active_iso_week: latestWeek,
        updated_at: new Date().toISOString(),
      });
  }
}

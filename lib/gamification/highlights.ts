import { createClient } from '@supabase/supabase-js';

const METERS_PER_MILE = 1609.34;

const STANDARD_DISTANCES: Array<{ min: number; max: number; label: string; eventType: string }> = [
  { min: 4800,  max: 5500,  label: '5K',            eventType: 'first_5k' },
  { min: 9500,  max: 11000, label: '10K',           eventType: 'first_10k' },
  { min: 20000, max: 22530, label: 'Half Marathon', eventType: 'first_half_marathon' },
  { min: 41500, max: 43500, label: 'Marathon',      eventType: 'first_marathon' },
];

const MONTHLY_MILE_MILESTONES = [25, 50, 75, 100];

function mi(meters: number) {
  return (meters / METERS_PER_MILE).toFixed(1);
}

type ActivityInput = {
  distance_meters: number;
  moving_time_seconds: number;
  start_date_local: string; // ISO string, e.g. "2026-03-15T07:30:00"
};

export async function generateHighlights(
  activityDbId: string,
  athleteId: string,
  activity: ActivityInput
): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: athleteData } = await supabase
    .from('athletes')
    .select('firstname, club_id')
    .eq('id', athleteId)
    .single();

  const name = athleteData?.firstname ?? 'Someone';
  const clubId: string | null = athleteData?.club_id ?? null;
  const actDate = activity.start_date_local;

  type HighlightRow = {
    athlete_id: string;
    club_id: string | null;
    event_type: string;
    activity_id: string;
    value: number | null;
    description: string;
    created_at: string;
  };

  const toInsert: HighlightRow[] = [];

  // 1. Distance PR — compare against all activities before this one
  const { data: prevLongest } = await supabase
    .from('activities')
    .select('distance_meters')
    .eq('athlete_id', athleteId)
    .lt('start_date_local', actDate)
    .order('distance_meters', { ascending: false })
    .limit(1);

  const prevMax = Number(prevLongest?.[0]?.distance_meters ?? 0);
  if (activity.distance_meters > prevMax && activity.distance_meters > 800) {
    toInsert.push({
      athlete_id: athleteId, club_id: clubId,
      event_type: 'distance_pr',
      activity_id: activityDbId,
      value: activity.distance_meters,
      description: `${name} hit a new distance PR: ${mi(activity.distance_meters)} miles.`,
      created_at: actDate,
    });
  }

  // 2. First standard distances (5K, 10K, half, marathon)
  for (const range of STANDARD_DISTANCES) {
    if (activity.distance_meters >= range.min && activity.distance_meters <= range.max) {
      const { count } = await supabase
        .from('activities')
        .select('id', { count: 'exact', head: true })
        .eq('athlete_id', athleteId)
        .gte('distance_meters', range.min)
        .lte('distance_meters', range.max)
        .lt('start_date_local', actDate);

      if ((count ?? 0) === 0) {
        toInsert.push({
          athlete_id: athleteId, club_id: clubId,
          event_type: range.eventType,
          activity_id: activityDbId,
          value: activity.distance_meters,
          description: `${name} completed their first ${range.label}!`,
          created_at: actDate,
        });
      }
    }
  }

  // 3. Monthly mileage milestones
  const monthPrefix = actDate.slice(0, 7); // YYYY-MM
  const monthStart = `${monthPrefix}-01`;

  const { data: monthActs } = await supabase
    .from('activities')
    .select('distance_meters')
    .eq('athlete_id', athleteId)
    .gte('start_date_local', monthStart)
    .lte('start_date_local', actDate);

  const monthTotal = (monthActs ?? []).reduce((s, a) => s + Number(a.distance_meters), 0);
  const prevMonthTotal = monthTotal - activity.distance_meters;

  for (const milestone of MONTHLY_MILE_MILESTONES) {
    const thresh = milestone * METERS_PER_MILE;
    if (prevMonthTotal < thresh && monthTotal >= thresh) {
      toInsert.push({
        athlete_id: athleteId, club_id: clubId,
        event_type: `monthly_milestone_${milestone}`,
        activity_id: activityDbId,
        value: thresh,
        description: `${name} hit ${milestone} miles for the month!`,
        created_at: actDate,
      });
    }
  }

  // 4. First ever club run
  const { count: prevCount } = await supabase
    .from('activities')
    .select('id', { count: 'exact', head: true })
    .eq('athlete_id', athleteId)
    .lt('start_date_local', actDate);

  if ((prevCount ?? 0) === 0) {
    toInsert.push({
      athlete_id: athleteId, club_id: clubId,
      event_type: 'first_club_run',
      activity_id: activityDbId,
      value: null,
      description: `${name} logged their first run with the club!`,
      created_at: actDate,
    });
  }

  if (toInsert.length > 0) {
    await supabase
      .from('highlights')
      .upsert(toInsert, { onConflict: 'athlete_id,event_type,activity_id', ignoreDuplicates: true });
  }
}

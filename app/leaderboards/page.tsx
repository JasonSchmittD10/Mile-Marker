import {
  isMockMode,
  MOCK_ATHLETES_WITH_STATS,
  MOCK_ACTIVITIES,
  MOCK_STREAKS,
  getCurrentISOWeek,
  getISOWeek,
} from '@/mock/data';
import type { AthleteWithStats, LeaderboardEntry, MinistryEntry } from '@/types';

function Avatar({ initials, avatarBg, avatarText }: { initials: string; avatarBg: string; avatarText: string }) {
  return (
    <div className={`h-8 w-8 rounded-full ${avatarBg} ${avatarText} flex items-center justify-center text-xs font-medium flex-shrink-0`}>
      {initials}
    </div>
  );
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
      <div className="h-full bg-[#1D9E75] rounded-full" style={{ width: `${pct}%` }} />
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-amber-500 font-medium text-sm w-5 text-center">1</span>;
  if (rank === 2) return <span className="text-gray-400 font-medium text-sm w-5 text-center">2</span>;
  if (rank === 3) return <span className="text-amber-700 font-medium text-sm w-5 text-center">3</span>;
  return <span className="text-gray-400 text-sm w-5 text-center">{rank}</span>;
}

async function getLeaderboardData() {
  if (isMockMode) {
    const currentWeek = getCurrentISOWeek();
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    // 1. Consistency: active days this calendar month
    const consistencyEntries: LeaderboardEntry[] = MOCK_ATHLETES_WITH_STATS.map((athlete) => {
      const monthActivities = (athlete.activities ?? []).filter(
        (a) => new Date(a.start_date_local) >= monthStart
      );
      const activeDays = new Set(monthActivities.map((a) => a.start_date_local.slice(0, 10))).size;
      return {
        athlete,
        value: activeDays,
        rank: 0,
        streak: athlete.streak?.current_weeks ?? 0,
      };
    })
      .sort((a, b) => b.value - a.value)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    // 2. Time on feet: moving_time_seconds this calendar month
    const timeEntries: LeaderboardEntry[] = MOCK_ATHLETES_WITH_STATS.map((athlete) => {
      const totalSeconds = (athlete.activities ?? [])
        .filter((a) => new Date(a.start_date_local) >= monthStart)
        .reduce((s, a) => s + a.moving_time_seconds, 0);
      return { athlete, value: totalSeconds, rank: 0 };
    })
      .sort((a, b) => b.value - a.value)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    // 3. Ministry battle: group by ministry_group, sum distance this ISO week
    const groupMap = new Map<string, { miles: number; athletes: AthleteWithStats[] }>();
    for (const athlete of MOCK_ATHLETES_WITH_STATS) {
      if (!athlete.ministry_group) continue;
      const weekMiles = (athlete.activities ?? [])
        .filter((a) => getISOWeek(new Date(a.start_date_local)) === currentWeek)
        .reduce((s, a) => s + a.distance_meters, 0) / 1609.34;
      const existing = groupMap.get(athlete.ministry_group) ?? { miles: 0, athletes: [] };
      groupMap.set(athlete.ministry_group, {
        miles: existing.miles + weekMiles,
        athletes: [...existing.athletes, athlete],
      });
    }
    const ministryEntries: MinistryEntry[] = Array.from(groupMap.entries())
      .map(([groupName, { miles, athletes }]) => ({ groupName, memberCount: athletes.length, totalMiles: miles, rank: 0 }))
      .sort((a, b) => b.totalMiles - a.totalMiles)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    return { consistencyEntries, timeEntries, ministryEntries };
  }

  // Real Supabase path
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const day = now.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diffToMonday);
  monday.setUTCHours(0, 0, 0, 0);
  const weekStart = monday.toISOString();

  const [{ data: athletes }, { data: monthActivities }, { data: weekActivities }, { data: streaks }] = await Promise.all([
    supabase.from('athletes').select('*'),
    supabase.from('activities').select('athlete_id, moving_time_seconds, start_date_local').gte('start_date_local', monthStart),
    supabase.from('activities').select('athlete_id, distance_meters').gte('start_date_local', weekStart),
    supabase.from('streaks').select('*'),
  ]);

  const athleteList = (athletes ?? []) as AthleteWithStats[];
  const enriched = athleteList.map((a) => ({
    ...a,
    initials: `${a.firstname?.[0] ?? '?'}${a.lastname?.[0] ?? '?'}`,
    avatarBg: 'bg-teal-100',
    avatarText: 'text-teal-700',
    streak: (streaks ?? []).find((s: { athlete_id: string }) => s.athlete_id === a.id),
  }));

  // Consistency
  const activeDaysMap = new Map<string, Set<string>>();
  for (const a of monthActivities ?? []) {
    if (!activeDaysMap.has(a.athlete_id)) activeDaysMap.set(a.athlete_id, new Set());
    activeDaysMap.get(a.athlete_id)!.add(a.start_date_local.slice(0, 10));
  }
  const consistencyEntries: LeaderboardEntry[] = enriched
    .map((a) => ({ athlete: a, value: activeDaysMap.get(a.id)?.size ?? 0, rank: 0, streak: (a.streak as { current_weeks?: number })?.current_weeks ?? 0 }))
    .sort((a, b) => b.value - a.value)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  // Time on feet
  const timeMap = new Map<string, number>();
  for (const a of monthActivities ?? []) {
    timeMap.set(a.athlete_id, (timeMap.get(a.athlete_id) ?? 0) + Number(a.moving_time_seconds));
  }
  const timeEntries: LeaderboardEntry[] = enriched
    .map((a) => ({ athlete: a, value: timeMap.get(a.id) ?? 0, rank: 0 }))
    .sort((a, b) => b.value - a.value)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  // Ministry battle
  const groupMap = new Map<string, { miles: number; count: number }>();
  const weekMilesMap = new Map<string, number>();
  for (const a of weekActivities ?? []) {
    weekMilesMap.set(a.athlete_id, (weekMilesMap.get(a.athlete_id) ?? 0) + Number(a.distance_meters));
  }
  for (const a of enriched) {
    if (!a.ministry_group) continue;
    const miles = (weekMilesMap.get(a.id) ?? 0) / 1609.34;
    const existing = groupMap.get(a.ministry_group) ?? { miles: 0, count: 0 };
    groupMap.set(a.ministry_group, { miles: existing.miles + miles, count: existing.count + 1 });
  }
  const ministryEntries: MinistryEntry[] = Array.from(groupMap.entries())
    .map(([groupName, { miles, count }]) => ({ groupName, memberCount: count, totalMiles: miles, rank: 0 }))
    .sort((a, b) => b.totalMiles - a.totalMiles)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  return { consistencyEntries, timeEntries, ministryEntries };
}

export default async function LeaderboardsPage() {
  const { consistencyEntries, timeEntries, ministryEntries } = await getLeaderboardData();
  const maxTime = timeEntries[0]?.value ?? 1;
  const maxMiles = ministryEntries[0]?.totalMiles ?? 1;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-medium text-gray-900">Leaderboards</h1>

      {/* 1. Consistency board */}
      <section>
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Consistency — active days this month</h2>
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {consistencyEntries.map((entry) => (
            <div key={entry.athlete.id} className="flex items-center gap-3 px-4 py-3">
              <RankBadge rank={entry.rank} />
              <Avatar initials={entry.athlete.initials} avatarBg={entry.athlete.avatarBg} avatarText={entry.athlete.avatarText} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{entry.athlete.firstname} {entry.athlete.lastname}</div>
                <div className="text-xs text-gray-400">{entry.streak ?? 0}wk streak</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{entry.value}</div>
                <div className="text-xs text-gray-400">days</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-gray-200" />

      {/* 2. Time on feet */}
      <section>
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Time on feet — hours this month</h2>
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {timeEntries.map((entry) => {
            const hours = entry.value / 3600;
            return (
              <div key={entry.athlete.id} className="flex items-center gap-3 px-4 py-3">
                <RankBadge rank={entry.rank} />
                <Avatar initials={entry.athlete.initials} avatarBg={entry.athlete.avatarBg} avatarText={entry.athlete.avatarText} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{entry.athlete.firstname} {entry.athlete.lastname}</div>
                  <MiniBar value={entry.value} max={maxTime} />
                </div>
                <div className="text-sm font-medium text-gray-900 text-right w-12">{hours.toFixed(1)}h</div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="border-t border-gray-200" />

      {/* 3. Crew battle */}
      <section>
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Crew battle — miles this week</h2>
        {ministryEntries.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-sm text-gray-400 text-center">
            No crew data this week yet. Resets Monday. Set your crew in your profile.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
            {ministryEntries.map((entry) => (
              <div key={entry.groupName} className="flex items-center gap-3 px-4 py-3">
                <RankBadge rank={entry.rank} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{entry.groupName}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 rounded-full overflow-hidden flex-1 bg-gray-100">
                      <div
                        className="h-full bg-[#1D9E75] rounded-full"
                        style={{ width: `${Math.min(100, (entry.totalMiles / maxMiles) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-right ml-2">
                  <div className="text-sm font-medium text-gray-900">{entry.totalMiles.toFixed(1)}</div>
                  <div className="text-xs text-gray-400">{entry.memberCount} members</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

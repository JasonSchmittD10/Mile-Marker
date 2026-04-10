import Link from 'next/link';
import {
  isMockMode,
  MOCK_ATHLETES_WITH_STATS,
  MOCK_ACTIVITIES,
  MOCK_BADGES,
} from '@/mock/data';
import type { AthleteWithStats } from '@/types';

const RALEIGH_TO_JERUSALEM_MILES = 5843;
const MILESTONES = [1000, 2000, 3500, 5000];

function Avatar({ initials, avatarBg, avatarText }: { initials: string; avatarBg: string; avatarText: string }) {
  return (
    <div className={`h-9 w-9 rounded-full ${avatarBg} ${avatarText} flex items-center justify-center text-sm font-medium flex-shrink-0`}>
      {initials}
    </div>
  );
}

async function getClubData() {
  if (isMockMode) {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const totalMembers = MOCK_ATHLETES_WITH_STATS.length;
    const monthActivities = MOCK_ACTIVITIES.filter((a) => new Date(a.start_date_local) >= monthStart);
    const milesThisMonth = monthActivities.reduce((s, a) => s + a.distance_meters, 0) / 1609.34;
    const activitiesThisMonth = monthActivities.length;
    const totalBadges = MOCK_BADGES.length;
    const totalMilesEver = MOCK_ACTIVITIES.reduce((s, a) => s + a.distance_meters, 0) / 1609.34;

    // Member roster: sorted by total miles
    const roster: Array<AthleteWithStats & { activeDaysThisMonth: number }> = MOCK_ATHLETES_WITH_STATS.map((athlete) => {
      const monthActs = (athlete.activities ?? []).filter((a) => new Date(a.start_date_local) >= monthStart);
      const activeDaysThisMonth = new Set(monthActs.map((a) => a.start_date_local.slice(0, 10))).size;
      return { ...athlete, activeDaysThisMonth };
    }).sort((a, b) => (b.totalDistanceMeters ?? 0) - (a.totalDistanceMeters ?? 0));

    return { totalMembers, milesThisMonth, activitiesThisMonth, totalBadges, totalMilesEver, roster };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  const [
    { data: athletes },
    { data: allActivities },
    { data: monthActivities },
    { count: totalBadges },
    { data: streaks },
    { data: badges },
  ] = await Promise.all([
    supabase.from('athletes').select('*'),
    supabase.from('activities').select('athlete_id, distance_meters'),
    supabase.from('activities').select('athlete_id, distance_meters, start_date_local').gte('start_date_local', monthStart),
    supabase.from('badges').select('id', { count: 'exact', head: true }),
    supabase.from('streaks').select('*'),
    supabase.from('badges').select('athlete_id, badge_type'),
  ]);

  const totalMembers = (athletes ?? []).length;
  const milesThisMonth = (monthActivities ?? []).reduce((s: number, a: { distance_meters: number }) => s + Number(a.distance_meters), 0) / 1609.34;
  const activitiesThisMonth = (monthActivities ?? []).length;
  const totalMilesEver = (allActivities ?? []).reduce((s: number, a: { distance_meters: number }) => s + Number(a.distance_meters), 0) / 1609.34;

  // Build athlete total miles
  const totalMilesMap = new Map<string, number>();
  for (const a of allActivities ?? []) {
    totalMilesMap.set(a.athlete_id, (totalMilesMap.get(a.athlete_id) ?? 0) + Number(a.distance_meters));
  }

  // Active days this month per athlete
  const activeDaysMap = new Map<string, Set<string>>();
  for (const a of monthActivities ?? []) {
    if (!activeDaysMap.has(a.athlete_id)) activeDaysMap.set(a.athlete_id, new Set());
    activeDaysMap.get(a.athlete_id)!.add(a.start_date_local.slice(0, 10));
  }

  const roster = ((athletes ?? []) as AthleteWithStats[])
    .map((a) => ({
      ...a,
      initials: `${a.firstname?.[0] ?? '?'}${a.lastname?.[0] ?? '?'}`,
      avatarBg: 'bg-teal-100',
      avatarText: 'text-teal-700',
      totalDistanceMeters: totalMilesMap.get(a.id) ?? 0,
      activeDaysThisMonth: activeDaysMap.get(a.id)?.size ?? 0,
      streak: (streaks ?? []).find((s: { athlete_id: string }) => s.athlete_id === a.id),
      badges: (badges ?? []).filter((b: { athlete_id: string }) => b.athlete_id === a.id),
    }))
    .sort((a, b) => (b.totalDistanceMeters ?? 0) - (a.totalDistanceMeters ?? 0));

  return { totalMembers, milesThisMonth, activitiesThisMonth, totalBadges: totalBadges ?? 0, totalMilesEver, roster };
}

export default async function ClubPage() {
  const { totalMembers, milesThisMonth, activitiesThisMonth, totalBadges, totalMilesEver, roster } = await getClubData();
  const routeProgress = Math.min(100, (totalMilesEver / RALEIGH_TO_JERUSALEM_MILES) * 100);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-medium text-gray-900">The Club</h1>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-medium text-gray-900">{totalMembers}</div>
          <div className="text-xs text-gray-500 mt-0.5">total members</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-medium text-gray-900">{milesThisMonth.toFixed(0)}</div>
          <div className="text-xs text-gray-500 mt-0.5">miles this month</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-medium text-gray-900">{activitiesThisMonth}</div>
          <div className="text-xs text-gray-500 mt-0.5">activities this month</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-medium text-gray-900">{totalBadges}</div>
          <div className="text-xs text-gray-500 mt-0.5">badges awarded</div>
        </div>
      </div>

      {/* Route progress */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-sm font-medium text-gray-900">Raleigh &rarr; Jerusalem</span>
          <span className="text-xs text-gray-500">{totalMilesEver.toFixed(0)} / {RALEIGH_TO_JERUSALEM_MILES.toLocaleString()} mi</span>
        </div>
        <div className="relative h-3 bg-gray-100 rounded-full overflow-visible mb-3">
          <div
            className="h-full bg-[#1D9E75] rounded-full transition-all"
            style={{ width: `${routeProgress}%` }}
          />
          {/* Milestone markers */}
          {MILESTONES.map((m) => {
            const pct = (m / RALEIGH_TO_JERUSALEM_MILES) * 100;
            const reached = totalMilesEver >= m;
            return (
              <div
                key={m}
                className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${pct}%` }}
              >
                <div className={`h-3 w-0.5 ${reached ? 'bg-[#1D9E75]' : 'bg-gray-300'}`} />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          {MILESTONES.map((m) => (
            <span key={m} className={totalMilesEver >= m ? 'text-[#1D9E75]' : ''}>{m.toLocaleString()}mi</span>
          ))}
        </div>
        <div className="text-xs text-gray-400 mt-2">{routeProgress.toFixed(1)}% of the way there</div>
      </div>

      {/* Heatmap */}
      <Link
        href="/heatmap"
        className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-[#1D9E75]/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <rect x="3" y="4" width="3" height="3" rx="0.5" />
              <rect x="7" y="4" width="3" height="3" rx="0.5" />
              <rect x="11" y="4" width="3" height="3" rx="0.5" />
              <rect x="3" y="8" width="3" height="3" rx="0.5" />
              <rect x="7" y="8" width="3" height="3" rx="0.5" />
              <rect x="11" y="8" width="3" height="3" rx="0.5" />
              <rect x="3" y="12" width="3" height="3" rx="0.5" />
              <rect x="7" y="12" width="3" height="3" rx="0.5" />
              <rect x="11" y="12" width="3" height="3" rx="0.5" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Club Heatmap</div>
            <div className="text-xs text-gray-400 mt-0.5">Activity grid for all members</div>
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>

      {/* Member roster */}
      <section>
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Member roster</h2>
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {roster.map((member, idx) => {
            const totalMiles = (member.totalDistanceMeters ?? 0) / 1609.34;
            const maxMiles = (roster[0]?.totalDistanceMeters ?? 1) / 1609.34;
            return (
              <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xs text-gray-400 w-4 text-center">{idx + 1}</span>
                <Avatar initials={member.initials} avatarBg={member.avatarBg} avatarText={member.avatarText} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{member.firstname} {member.lastname}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1 rounded-full overflow-hidden bg-gray-100 flex-1">
                      <div className="h-full bg-[#1D9E75] rounded-full" style={{ width: `${Math.min(100, (totalMiles / maxMiles) * 100)}%` }} />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-gray-900">{totalMiles.toFixed(1)}mi</div>
                  <div className="text-xs text-gray-400">{(member as typeof member & { activeDaysThisMonth: number }).activeDaysThisMonth}d this mo</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

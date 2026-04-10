import { cookies } from 'next/headers';
import Link from 'next/link';
import {
  isMockMode,
  MOCK_ATHLETES_WITH_STATS,
  MOCK_ACTIVITIES,
  MOCK_BADGES,
  MOCK_STREAKS,
  getMockWeeklyStats,
  getMockFeedEvents,
  getCurrentISOWeek,
  getISOWeek,
} from '@/mock/data';
import type { AthleteWithStats, FeedEvent, WeeklyStats, Streak } from '@/types';
import RaceCard, { type RaceData } from '@/app/components/RaceCard';

const RALEIGH_TO_JERUSALEM_MILES = 5843;

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function Avatar({ initials, avatarBg, avatarText, size = 'md', imageUrl }: { initials: string; avatarBg: string; avatarText: string; size?: 'sm' | 'md' | 'lg'; imageUrl?: string | null }) {
  const sizeClass = size === 'sm' ? 'h-7 w-7 text-xs' : size === 'lg' ? 'h-12 w-12 text-base' : 'h-9 w-9 text-sm';
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt={initials} className={`${sizeClass} rounded-full object-cover flex-shrink-0`} />;
  }
  return (
    <div className={`${sizeClass} rounded-full ${avatarBg} ${avatarText} flex items-center justify-center font-medium flex-shrink-0`}>
      {initials}
    </div>
  );
}

const HIGHLIGHT_EMOJI: Record<string, string> = {
  distance_pr: '📏',
  first_5k: '🎽',
  first_10k: '🎽',
  first_half_marathon: '🏃',
  first_marathon: '🏅',
  monthly_milestone_25: '📅',
  monthly_milestone_50: '💪',
  monthly_milestone_75: '🔥',
  monthly_milestone_100: '⭐',
  first_club_run: '👋',
  badge: '🏆',
};

function ProgressBar({ value, max, color = '#1D9E75' }: { value: number; max: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

const MOCK_RACE: RaceData = {
  id: 'mock-race',
  title: 'Garmin Marathon',
  location: 'Durham, NC',
  race_date: '2026-05-02T11:00:00Z',
  image_url: null,
  description: null,
};

async function getPageData() {
  if (isMockMode) {
    const weeklyStats = getMockWeeklyStats();
    const feedEvents = getMockFeedEvents();
    const me = MOCK_ATHLETES_WITH_STATS[0];
    return { weeklyStats, feedEvents, me, race: MOCK_RACE, isAdmin: false };
  }

  // Real Supabase path
  const { createClient } = await import('@/lib/supabase/server');
  const cookieStore = await cookies();
  const athleteId = cookieStore.get('mm_athlete_id')?.value;
  const supabase = await createClient();

  // Weekly stats
  const now = new Date();
  const day = now.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diffToMonday);
  monday.setUTCHours(0, 0, 0, 0);
  const weekStart = monday.toISOString();

  const [
    { data: weekActivities },
    { data: allActivities },
    { count: weekBadgeCount },
    { data: raceRow },
  ] = await Promise.all([
    supabase.from('activities').select('athlete_id, distance_meters').gte('start_date_local', weekStart),
    supabase.from('activities').select('distance_meters'),
    supabase.from('badges').select('id', { count: 'exact', head: true }).gte('earned_at', weekStart),
    supabase.from('featured_race').select('*').eq('active', true).order('updated_at', { ascending: false }).limit(1).single(),
  ]);

  const membersActive = new Set((weekActivities ?? []).map((a: { athlete_id: string }) => a.athlete_id)).size;
  const totalMilesThisWeek = (weekActivities ?? []).reduce((s: number, a: { distance_meters: number }) => s + Number(a.distance_meters), 0) / 1609.34;
  const totalMilesEver = (allActivities ?? []).reduce((s: number, a: { distance_meters: number }) => s + Number(a.distance_meters), 0) / 1609.34;
  const weeklyStats: WeeklyStats = { membersActive, totalMilesThisWeek, badgesEarnedThisWeek: weekBadgeCount ?? 0, totalMilesEver };

  // Recent highlights for feed
  const { data: recentHighlights } = await supabase
    .from('highlights')
    .select('*, athletes(*)')
    .order('created_at', { ascending: false })
    .limit(30);

  const feedEvents: FeedEvent[] = (recentHighlights ?? []).map((h: {
    id: string; event_type: string; description: string; created_at: string;
    athletes: { id: string; firstname: string; lastname: string; strava_profile_url: string | null; ministry_group: string | null; created_at: string; strava_id: number; profile_medium: string | null; access_token: string | null; refresh_token: string | null; token_expires_at: number | null; scopes_accepted: string | null; city: string | null; motivating_verse: string | null; motivating_verse_ref: string | null; bio: string | null; club_id: string | null; is_admin: boolean | null };
  }) => ({
    id: `feed-${h.id}`,
    type: 'highlight' as const,
    athlete: {
      ...h.athletes,
      initials: `${h.athletes.firstname?.[0] ?? '?'}${h.athletes.lastname?.[0] ?? '?'}`,
      avatarBg: 'bg-teal-100',
      avatarText: 'text-teal-700',
    },
    description: h.description,
    timestamp: h.created_at,
    eventType: h.event_type,
  }));

  // Current user + admin check
  let me: AthleteWithStats | null = null;
  let isAdmin = false;
  if (athleteId) {
    const { data: athleteData } = await supabase
      .from('athletes')
      .select('*, streaks(*), badges(*), activities(*)')
      .eq('id', athleteId)
      .single();
    if (athleteData) {
      const fn = athleteData.firstname ?? '';
      const ln = athleteData.lastname ?? '';
      me = {
        ...athleteData,
        initials: `${fn[0] ?? '?'}${ln[0] ?? '?'}`,
        avatarBg: 'bg-teal-100',
        avatarText: 'text-teal-700',
        streak: athleteData.streaks?.[0],
        badges: athleteData.badges ?? [],
        activities: athleteData.activities ?? [],
        totalDistanceMeters: (athleteData.activities ?? []).reduce((s: number, a: { distance_meters: number }) => s + Number(a.distance_meters), 0),
      };
      isAdmin = !!athleteData.is_admin;
    }
  }

  const race: RaceData = raceRow ?? MOCK_RACE;
  return { weeklyStats, feedEvents, me, race, isAdmin };
}

export default async function HomePage() {
  const { weeklyStats, feedEvents, me, race, isAdmin } = await getPageData();
  const { membersActive, totalMilesThisWeek, badgesEarnedThisWeek, totalMilesEver } = weeklyStats;
  const routeProgress = Math.min(100, (totalMilesEver / RALEIGH_TO_JERUSALEM_MILES) * 100);
  const currentWeek = getCurrentISOWeek();

  // Build 12-week dot grid for logged-in athlete
  const weekDots: { week: string; active: boolean }[] = [];
  if (me) {
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      const wk = getISOWeek(d);
      const active = (me.activities ?? []).some(
        (a) => getISOWeek(new Date(a.start_date_local)) === wk
      );
      weekDots.push({ week: wk, active });
    }
  }

  const myMilesThisWeek = me
    ? (me.activities ?? [])
        .filter((a) => getISOWeek(new Date(a.start_date_local)) === currentWeek)
        .reduce((s, a) => s + a.distance_meters, 0) / 1609.34
    : 0;

  const myTotalMiles = (me?.totalDistanceMeters ?? 0) / 1609.34;

  return (
    <div className="space-y-5">
      {/* Current race */}
      <RaceCard race={race} isAdmin={isAdmin} />
      {/* Section 1: This week in the club */}
      <section>
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">This week in the club</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-medium text-gray-900">{membersActive}</div>
              <div className="text-xs text-gray-500 mt-0.5">members active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-gray-900">{totalMilesThisWeek.toFixed(1)}</div>
              <div className="text-xs text-gray-500 mt-0.5">miles run</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-gray-900">{badgesEarnedThisWeek}</div>
              <div className="text-xs text-gray-500 mt-0.5">badges earned</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-xs font-medium text-gray-700">Raleigh &rarr; Jerusalem</span>
              <span className="text-xs text-gray-500">{totalMilesEver.toFixed(0)} / {RALEIGH_TO_JERUSALEM_MILES.toLocaleString()} mi</span>
            </div>
            <ProgressBar value={totalMilesEver} max={RALEIGH_TO_JERUSALEM_MILES} />
            <div className="text-xs text-gray-400 mt-1">{routeProgress.toFixed(1)}% complete</div>
          </div>
        </div>
      </section>

      {/* Section 2: Highlight reel */}
      <section>
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Highlight reel</h2>
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {feedEvents.length === 0 ? (
            <p className="p-5 text-sm text-gray-400 text-center">No highlights yet — import your Strava activities to get started!</p>
          ) : (
            feedEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-4">
                <Link href={`/athletes/${event.athlete.id}`} className="flex-shrink-0">
                  <Avatar initials={event.athlete.initials} avatarBg={event.athlete.avatarBg} avatarText={event.athlete.avatarText} size="sm" imageUrl={event.athlete.strava_profile_url} />
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <Link href={`/athletes/${event.athlete.id}`} className="font-medium hover:underline">{event.athlete.firstname}</Link>{' '}
                    {event.description}
                    {event.eventType && (
                      <span className="ml-1">{HIGHLIGHT_EMOJI[event.eventType] ?? '🏃'}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(event.timestamp)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Section 3: Your stats */}
      {me && (
        <section>
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Your stats</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
            <div className="flex items-center gap-3">
              <Avatar initials={me.initials} avatarBg={me.avatarBg} avatarText={me.avatarText} size="lg" imageUrl={me.strava_profile_url} />
              <div>
                <div className="font-medium text-gray-900">{me.firstname} {me.lastname}</div>
                {me.ministry_group && (() => {
                  const crewColors: Record<string, { label: string; bg: string; text: string }> = {
                    syllabus_weekers: { label: 'The Syllabus Weekers', bg: '#EEEDFE', text: '#3C3489' },
                    quarter_lifers:   { label: 'The Quarter-Lifers',   bg: '#E6F1FB', text: '#0C447C' },
                    minivan_mafia:    { label: 'The Minivan Mafia',     bg: '#FAEEDA', text: '#633806' },
                    the_legends:      { label: 'The Legends',           bg: '#FAECE7', text: '#712B13' },
                  };
                  const crew = crewColors[me.ministry_group!] ?? { label: me.ministry_group, bg: '#F1EFE8', text: '#444441' };
                  return (
                    <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-0.5" style={{ backgroundColor: crew.bg, color: crew.text }}>
                      {crew.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-lg font-medium text-gray-900">{myMilesThisWeek.toFixed(1)}</div>
                <div className="text-xs text-gray-500">miles this week</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-lg font-medium text-gray-900">{me.streak?.current_weeks ?? 0}</div>
                <div className="text-xs text-gray-500">week streak</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-lg font-medium text-gray-900">{me.badges?.length ?? 0}</div>
                <div className="text-xs text-gray-500">badges earned</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-lg font-medium text-gray-900">{myTotalMiles.toFixed(1)}</div>
                <div className="text-xs text-gray-500">total miles</div>
              </div>
            </div>

            {/* Streak dot grid — last 12 ISO weeks */}
            <div>
              <div className="text-xs font-medium text-gray-700 mb-2">12-week activity</div>
              <div className="flex gap-1.5 flex-wrap">
                {weekDots.map(({ week, active }) => (
                  <div
                    key={week}
                    title={week}
                    className={`h-4 w-4 rounded-sm ${active ? 'bg-[#1D9E75]' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
            </div>


          </div>
        </section>
      )}
    </div>
  );
}

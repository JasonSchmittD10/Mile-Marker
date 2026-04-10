import { cookies } from 'next/headers';
import { BADGE_INFO, ALL_BADGE_TYPES } from '@/types';
import {
  isMockMode,
  MOCK_ATHLETES_WITH_STATS,
  MOCK_ACTIVITIES,
  getCurrentISOWeek,
  getISOWeek,
} from '@/mock/data';
import type { AthleteWithStats, Badge, Streak, Activity } from '@/types';
import ProfileEditForm from './ProfileEditForm';

export const dynamic = 'force-dynamic';

const CREW_MAP: Record<string, { label: string; bg: string; text: string }> = {
  syllabus_weekers: { label: 'The Syllabus Weekers', bg: '#EEEDFE', text: '#3C3489' },
  quarter_lifers:   { label: 'The Quarter-Lifers',   bg: '#E6F1FB', text: '#0C447C' },
  minivan_mafia:    { label: 'The Minivan Mafia',     bg: '#FAEEDA', text: '#633806' },
  the_legends:      { label: 'The Legends',           bg: '#FAECE7', text: '#712B13' },
};
const NO_CREW = { label: '— No crew yet', bg: '#F1EFE8', text: '#444441' };

function getCrewInfo(slug: string | null | undefined) {
  if (!slug) return NO_CREW;
  return CREW_MAP[slug] ?? NO_CREW;
}

function formatMemberSince(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

interface ProfileData {
  athlete: AthleteWithStats;
  badges: Badge[];
  streak: Streak | null;
  activities: Activity[];
  activityCount: number;
}

async function getProfileData(): Promise<ProfileData | null> {
  if (isMockMode) {
    const me = MOCK_ATHLETES_WITH_STATS[0];
    return {
      athlete: me,
      badges: me.badges ?? [],
      streak: me.streak ?? null,
      activities: me.activities ?? [],
      activityCount: me.activities?.length ?? 0,
    };
  }

  const cookieStore = await cookies();
  const athleteId = cookieStore.get('mm_athlete_id')?.value;
  if (!athleteId) return null;

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const [{ data: athlete }, { data: badges }, { data: streak }, { data: activities }] = await Promise.all([
    supabase.from('athletes').select('*').eq('id', athleteId).single(),
    supabase.from('badges').select('*').eq('athlete_id', athleteId).order('earned_at', { ascending: false }),
    supabase.from('streaks').select('*').eq('athlete_id', athleteId).single(),
    supabase.from('activities').select('id, start_date_local, distance_meters').eq('athlete_id', athleteId).order('start_date_local', { ascending: false }),
  ]);

  if (!athlete) return null;

  const fn = athlete.firstname ?? '';
  const ln = athlete.lastname ?? '';
  const enriched: AthleteWithStats = {
    ...athlete,
    initials: `${fn[0] ?? '?'}${ln[0] ?? '?'}`.toUpperCase(),
    avatarBg: 'bg-teal-100',
    avatarText: 'text-teal-700',
    totalDistanceMeters: (activities ?? []).reduce((s: number, a: { distance_meters: number }) => s + Number(a.distance_meters), 0),
  };

  return {
    athlete: enriched,
    badges: badges ?? [],
    streak: streak ?? null,
    activities: (activities ?? []) as Activity[],
    activityCount: (activities ?? []).length,
  };
}

export default async function ProfilePage() {
  const data = await getProfileData();

  if (!data) {
    return (
      <div className="text-center py-20 text-sm text-gray-400">
        Not logged in. <a href="/login" className="text-[#1D9E75] underline">Connect with Strava</a>
      </div>
    );
  }

  const { athlete, badges, streak, activities, activityCount } = data;
  const totalMiles = (athlete.totalDistanceMeters ?? 0) / 1609.34;
  const crew = getCrewInfo(athlete.ministry_group);

  // 12-week dot grid
  const weekDots: { week: string; active: boolean }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const wk = getISOWeek(d);
    const active = activities.some((a) => getISOWeek(new Date(a.start_date_local)) === wk);
    weekDots.push({ week: wk, active });
  }

  // Badge counts
  const badgeCounts = new Map<string, number>();
  for (const b of badges) {
    badgeCounts.set(b.badge_type, (badgeCounts.get(b.badge_type) ?? 0) + 1);
  }

  // Token status
  const nowSeconds = Math.floor(Date.now() / 1000);
  const tokenActive = athlete.token_expires_at ? athlete.token_expires_at > nowSeconds : false;

  // Last activity date
  const lastActivity = activities[0];
  const lastActivityStr = lastActivity
    ? new Date(lastActivity.start_date_local).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No activities yet';

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-medium text-gray-900">Profile</h1>

      {/* Card 1 — Identity */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-start gap-4">
          {athlete.strava_profile_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={athlete.strava_profile_url}
              alt={`${athlete.firstname} ${athlete.lastname}`}
              className="h-14 w-14 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className={`h-14 w-14 rounded-full ${athlete.avatarBg} ${athlete.avatarText} flex items-center justify-center text-lg font-medium flex-shrink-0`}>
              {athlete.initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 text-base">{athlete.firstname} {athlete.lastname}</div>
            {athlete.city && <div className="text-sm text-gray-500">{athlete.city}</div>}
            <div className="text-xs text-gray-400 mt-0.5">Member since {formatMemberSince(athlete.created_at)}</div>
            <div className="mt-2">
              <span
                className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: crew.bg, color: crew.text }}
              >
                {crew.label}
              </span>
            </div>
          </div>
        </div>

        <ProfileEditForm
          athleteId={athlete.id}
          initial={{
            motivating_verse: athlete.motivating_verse ?? null,
            motivating_verse_ref: athlete.motivating_verse_ref ?? null,
            bio: athlete.bio ?? null,
            ministry_group: athlete.ministry_group ?? null,
          }}
        />
      </div>

      {/* Card 2 — Current verse */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Current verse</h2>
        {athlete.motivating_verse ? (
          <div
            className="rounded-lg p-4 border"
            style={{ backgroundColor: '#E1F5EE', borderColor: '#9FE1CB' }}
          >
            <p className="text-sm italic text-gray-800 leading-relaxed">&ldquo;{athlete.motivating_verse}&rdquo;</p>
            {athlete.motivating_verse_ref && (
              <p className="text-sm font-medium text-gray-700 mt-2">— {athlete.motivating_verse_ref}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">Add a verse that&apos;s motivating you right now.</p>
        )}
        {athlete.bio && (
          <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">&ldquo;{athlete.bio}&rdquo;</p>
        )}
      </div>

      {/* Card 3 — Your stats */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Your stats</h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-medium text-gray-900">{totalMiles.toFixed(1)}</div>
            <div className="text-xs text-gray-500">total miles</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-medium text-gray-900">{streak?.current_weeks ?? 0}</div>
            <div className="text-xs text-gray-500">week streak</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-medium text-gray-900">{activityCount}</div>
            <div className="text-xs text-gray-500">total activities</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-medium text-gray-900">{badges.length}</div>
            <div className="text-xs text-gray-500">badges earned</div>
          </div>
        </div>

        {/* 12-week dot grid */}
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

        {/* Badge chips */}
        <div>
          <div className="text-xs font-medium text-gray-700 mb-2">Badges</div>
          <div className="flex flex-wrap gap-2">
            {ALL_BADGE_TYPES.map((type) => {
              const count = badgeCounts.get(type) ?? 0;
              const info = BADGE_INFO[type];
              const earned = count > 0;
              return (
                <div
                  key={type}
                  title={info.description}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    earned
                      ? 'bg-[#1D9E75]/10 border-[#1D9E75]/30 text-[#1D9E75]'
                      : 'bg-transparent border-gray-200 text-gray-400'
                  }`}
                >
                  <span>{info.emoji}</span>
                  <span>{info.label}</span>
                  {count > 1 && (
                    <span className="bg-[#1D9E75] text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                      {count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card 4 — Strava connection */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Strava connection</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Connected as</span>
            <span className="font-medium text-gray-900">{athlete.firstname} {athlete.lastname}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Permissions</span>
            <span className="text-gray-700 text-xs">{athlete.scopes_accepted ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Last activity</span>
            <span className="text-gray-700">{lastActivityStr}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Token status</span>
            {tokenActive ? (
              <span className="flex items-center gap-1.5 text-[#1D9E75] text-xs font-medium">
                <span className="h-2 w-2 rounded-full bg-[#1D9E75]" />
                Active
              </span>
            ) : (
              <span className="flex items-center gap-2 text-red-500 text-xs font-medium">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                Expired —{' '}
                <a href="/login" className="underline">Reconnect</a>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

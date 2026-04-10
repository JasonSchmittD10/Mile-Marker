import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { isMockMode, MOCK_ATHLETES_WITH_STATS } from '@/mock/data';

export const dynamic = 'force-dynamic';

const CREW_MAP: Record<string, { label: string; bg: string; text: string }> = {
  syllabus_weekers: { label: 'The Syllabus Weekers', bg: '#EEEDFE', text: '#3C3489' },
  quarter_lifers:   { label: 'The Quarter-Lifers',   bg: '#E6F1FB', text: '#0C447C' },
  minivan_mafia:    { label: 'The Minivan Mafia',     bg: '#FAEEDA', text: '#633806' },
  the_legends:      { label: 'The Legends',           bg: '#FAECE7', text: '#712B13' },
};

function formatPace(secPerMile: number) {
  const m = Math.floor(secPerMile / 60);
  const s = Math.floor(secPerMile % 60);
  return `${m}:${s.toString().padStart(2, '0')} /mi`;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const METERS_PER_MILE = 1609.34;
const STD = [
  { min: 4800,  max: 5500,  label: '5K' },
  { min: 9500,  max: 11000, label: '10K' },
  { min: 20000, max: 22530, label: 'Half Marathon' },
  { min: 41500, max: 43500, label: 'Marathon' },
];

export default async function AthleteProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;

  if (isMockMode) {
    const athlete = MOCK_ATHLETES_WITH_STATS.find(a => a.id === id);
    if (!athlete) notFound();
    // Render mock athlete — simplified
    return <MockProfile athlete={athlete} />;
  }

  // Require auth
  const cookieStore = await cookies();
  if (!cookieStore.get('mm_athlete_id')?.value) notFound();

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const [{ data: athlete }, { data: activities }, { data: streak }] = await Promise.all([
    supabase.from('athletes').select('*').eq('id', id).single(),
    supabase.from('activities').select('id, distance_meters, moving_time_seconds, start_date_local, sport_type').eq('athlete_id', id).order('start_date_local', { ascending: false }),
    supabase.from('streaks').select('*').eq('athlete_id', id).single(),
  ]);

  if (!athlete) notFound();

  const acts = activities ?? [];
  const totalMiles = acts.reduce((s, a) => s + Number(a.distance_meters), 0) / METERS_PER_MILE;

  // PR calculations
  const longestRun = acts.length > 0 ? Math.max(...acts.map(a => Number(a.distance_meters))) : 0;
  const validPaced = acts.filter(a => Number(a.distance_meters) > 800 && Number(a.moving_time_seconds) > 0);
  const bestPaceSecPerMile = validPaced.length > 0
    ? Math.min(...validPaced.map(a => Number(a.moving_time_seconds) / (Number(a.distance_meters) / METERS_PER_MILE)))
    : 0;

  const stdPRs = STD.map(range => {
    const matching = acts.filter(a => Number(a.distance_meters) >= range.min && Number(a.distance_meters) <= range.max);
    if (matching.length === 0) return null;
    const best = matching.sort((a, b) => Number(a.moving_time_seconds) - Number(b.moving_time_seconds))[0];
    return { label: range.label, time: Number(best.moving_time_seconds) };
  }).filter(Boolean) as { label: string; time: number }[];

  const crew = athlete.ministry_group ? (CREW_MAP[athlete.ministry_group] ?? null) : null;
  const memberSince = new Date(athlete.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-start gap-4">
          {athlete.strava_profile_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={athlete.strava_profile_url} alt={athlete.firstname} className="h-16 w-16 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xl font-medium flex-shrink-0">
              {athlete.firstname?.[0]}{athlete.lastname?.[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-lg">{athlete.firstname} {athlete.lastname}</div>
            {athlete.city && <div className="text-sm text-gray-500">{athlete.city}</div>}
            <div className="text-xs text-gray-400 mt-0.5">Member since {memberSince}</div>
            {crew && (
              <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: crew.bg, color: crew.text }}>
                {crew.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Verse */}
      {athlete.motivating_verse && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Current verse</h2>
          <div className="rounded-lg p-4 border" style={{ backgroundColor: '#E1F5EE', borderColor: '#9FE1CB' }}>
            <p className="text-sm italic text-gray-800 leading-relaxed">&ldquo;{athlete.motivating_verse}&rdquo;</p>
            {athlete.motivating_verse_ref && (
              <p className="text-sm font-medium text-gray-700 mt-2">— {athlete.motivating_verse_ref}</p>
            )}
          </div>
          {athlete.bio && (
            <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">&ldquo;{athlete.bio}&rdquo;</p>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Stats</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">{totalMiles.toFixed(1)}</div>
            <div className="text-xs text-gray-500">total miles</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">{streak?.current_weeks ?? 0}</div>
            <div className="text-xs text-gray-500">wk streak</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">{acts.length}</div>
            <div className="text-xs text-gray-500">activities</div>
          </div>
        </div>

        {/* PRs */}
        {(longestRun > 0 || stdPRs.length > 0) && (
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">Personal Records</div>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
              {longestRun > 0 && (
                <div className="flex justify-between px-3 py-2 text-sm bg-gray-50">
                  <span className="text-gray-600">Longest run</span>
                  <span className="font-medium text-gray-900">{(longestRun / METERS_PER_MILE).toFixed(1)} mi</span>
                </div>
              )}
              {bestPaceSecPerMile > 0 && (
                <div className="flex justify-between px-3 py-2 text-sm bg-white">
                  <span className="text-gray-600">Best pace</span>
                  <span className="font-medium text-gray-900">{formatPace(bestPaceSecPerMile)}</span>
                </div>
              )}
              {stdPRs.map((pr, i) => (
                <div key={pr.label} className={`flex justify-between px-3 py-2 text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <span className="text-gray-600">{pr.label}</span>
                  <span className="font-medium text-gray-900">{formatTime(pr.time)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MockProfile({ athlete }: { athlete: import('@/types').AthleteWithStats }) {
  const crew = athlete.ministry_group ? (CREW_MAP[athlete.ministry_group] ?? null) : null;
  const totalMiles = (athlete.totalDistanceMeters ?? 0) / METERS_PER_MILE;
  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-start gap-4">
          {athlete.strava_profile_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={athlete.strava_profile_url} alt={athlete.firstname} className="h-16 w-16 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className={`h-16 w-16 rounded-full ${athlete.avatarBg} ${athlete.avatarText} flex items-center justify-center text-xl font-medium flex-shrink-0`}>
              {athlete.initials}
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-900 text-lg">{athlete.firstname} {athlete.lastname}</div>
            {athlete.city && <div className="text-sm text-gray-500">{athlete.city}</div>}
            {crew && (
              <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: crew.bg, color: crew.text }}>
                {crew.label}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">{totalMiles.toFixed(1)}</div>
            <div className="text-xs text-gray-500">total miles</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">{athlete.streak?.current_weeks ?? 0}</div>
            <div className="text-xs text-gray-500">wk streak</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">{athlete.activities?.length ?? 0}</div>
            <div className="text-xs text-gray-500">activities</div>
          </div>
        </div>
      </div>
    </div>
  );
}

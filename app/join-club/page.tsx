import { createClient } from '@supabase/supabase-js';
import { joinClub } from '@/app/actions/club';

export const dynamic = 'force-dynamic';

async function getClubs() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return [{ id: 'mock', name: 'Antioch Raleigh Run Club', slug: 'antioch-raleigh', description: 'Running for the glory of God in the Triangle area.', location: 'Raleigh, NC', logo_url: null, created_at: '' }];
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase.from('clubs').select('*').order('name');
  return data ?? [];
}

export default async function JoinClubPage() {
  const clubs = await getClubs();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-3">🏃</div>
          <h1 className="text-2xl font-bold text-gray-900">Join a Run Club</h1>
          <p className="text-sm text-gray-500 mt-2">Select the club you run with to get started.</p>
        </div>

        <div className="space-y-3">
          {clubs.map((club) => (
            <form key={club.id} action={joinClub.bind(null, club.id)}>
              <button
                type="submit"
                className="w-full text-left bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#1D9E75] hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-4">
                  {club.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={club.logo_url} alt={club.name} className="h-12 w-12 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-[#1D9E75]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🏃</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 group-hover:text-[#1D9E75] transition-colors">
                      {club.name}
                    </div>
                    {club.location && (
                      <div className="text-xs text-gray-500 mt-0.5">{club.location}</div>
                    )}
                    {club.description && (
                      <div className="text-sm text-gray-600 mt-1 leading-snug">{club.description}</div>
                    )}
                  </div>
                  <div className="text-[#1D9E75] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs font-semibold text-[#1D9E75]">Join this club →</span>
                </div>
              </button>
            </form>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400">
          Don&apos;t see your club? Ask your club leader to add it.
        </p>
      </div>
    </div>
  );
}

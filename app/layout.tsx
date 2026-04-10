import type { Metadata } from 'next';
import './globals.css';
import { cookies } from 'next/headers';
import BottomNav from '@/app/components/BottomNav';

export const metadata: Metadata = {
  title: 'Mile Marker',
  description: 'Church run club gamification',
};

async function getNavProfile(): Promise<{ initials: string | null; profileImageUrl: string | null }> {
  try {
    const cookieStore = await cookies();
    const athleteId = cookieStore.get('mm_athlete_id')?.value;
    if (!athleteId || !process.env.NEXT_PUBLIC_SUPABASE_URL) return { initials: null, profileImageUrl: null };

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from('athletes')
      .select('firstname, lastname, strava_profile_url')
      .eq('id', athleteId)
      .single();

    if (!data) return { initials: null, profileImageUrl: null };
    const initials = `${data.firstname?.[0] ?? ''}${data.lastname?.[0] ?? ''}`.toUpperCase() || null;
    return { initials, profileImageUrl: data.strava_profile_url ?? null };
  } catch {
    return { initials: null, profileImageUrl: null };
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { initials, profileImageUrl } = await getNavProfile();

  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 h-12 flex items-center">
            <span className="text-gray-900 font-semibold text-base tracking-tight">
              Antioch Raleigh Run Club
            </span>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-5 pb-36">
          {children}
        </main>
        <BottomNav initials={initials} profileImageUrl={profileImageUrl} />
      </body>
    </html>
  );
}

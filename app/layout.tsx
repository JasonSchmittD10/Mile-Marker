import type { Metadata, Viewport } from 'next';
import { Merriweather } from 'next/font/google';
import './globals.css';
import { cookies } from 'next/headers';
import BottomNav from '@/app/components/BottomNav';

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-merriweather',
});

export const metadata: Metadata = {
  title: 'Mile Marker',
  description: 'Church run club gamification',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mile Marker',
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
    <html lang="en" className={merriweather.variable}>
      <body className="bg-gray-50 min-h-screen">
        <header className="bg-black border-b border-black sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 h-12 flex items-center">
            <span className="text-white font-bold text-base tracking-tight font-[family-name:var(--font-merriweather)]">
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

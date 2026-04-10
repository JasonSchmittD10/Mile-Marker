import { buildStravaAuthURL } from '@/lib/strava/oauth';

export default function LoginPage() {
  // In mock mode (no env vars), still show the login page but link goes nowhere meaningful
  const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL;
  const stravaUrl = isMockMode ? '#' : buildStravaAuthURL();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-[#1D9E75]/10 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <h1 className="text-xl font-medium text-gray-900 mb-1">Mile Marker</h1>
        <p className="text-sm text-gray-500 mb-6">Track your runs. Earn badges. Run together.</p>

        {isMockMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-700 text-left">
            Running in mock mode — no Strava credentials configured. Connect env vars to enable real OAuth.
          </div>
        )}

        <a
          href={stravaUrl}
          className="flex items-center justify-center gap-3 w-full bg-[#FC4C02] hover:bg-[#e84302] text-white font-medium rounded-lg px-4 py-3 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.172" />
          </svg>
          Connect with Strava
        </a>

        <p className="text-xs text-gray-400 mt-4">
          We only read your activity data. We never post on your behalf.
        </p>
      </div>
    </div>
  );
}

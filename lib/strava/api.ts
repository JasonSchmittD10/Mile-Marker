import type { StravaActivity } from '@/types';

export async function getActivity(activityId: number, accessToken: string): Promise<StravaActivity> {
  const response = await fetch(
    `https://www.strava.com/api/v3/activities/${activityId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Strava activity ${activityId}: ${response.status}`);
  }

  return response.json() as Promise<StravaActivity>;
}

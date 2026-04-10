'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function joinClub(clubId: string) {
  const cookieStore = await cookies();
  const athleteId = cookieStore.get('mm_athlete_id')?.value;
  if (!athleteId) throw new Error('Not authenticated');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from('athletes')
    .update({ club_id: clubId })
    .eq('id', athleteId);

  if (error) throw new Error(error.message);

  redirect('/');
}

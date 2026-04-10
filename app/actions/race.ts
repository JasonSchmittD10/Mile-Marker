'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function updateFeaturedRace(data: {
  id: string;
  title: string;
  location: string;
  race_date: string;
  image_url: string;
  description: string;
}) {
  const cookieStore = await cookies();
  const athleteId = cookieStore.get('mm_athlete_id')?.value;
  if (!athleteId) throw new Error('Not authenticated');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: athlete } = await supabase
    .from('athletes')
    .select('is_admin')
    .eq('id', athleteId)
    .single();

  if (!athlete?.is_admin) throw new Error('Not authorized');

  const { error } = await supabase
    .from('featured_race')
    .update({
      title: data.title,
      location: data.location || null,
      race_date: new Date(data.race_date).toISOString(),
      image_url: data.image_url || null,
      description: data.description || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.id);

  if (error) throw new Error(error.message);
  revalidatePath('/');
}

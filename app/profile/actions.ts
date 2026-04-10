'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

interface ProfileUpdate {
  motivating_verse?: string;
  motivating_verse_ref?: string;
  bio?: string;
  ministry_group?: string;
}

function truncate(val: string | undefined, max = 500): string | undefined {
  if (!val) return val;
  return val.slice(0, max);
}

export async function updateProfile(athleteId: string, data: ProfileUpdate) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from('athletes')
    .update({
      motivating_verse: truncate(data.motivating_verse),
      motivating_verse_ref: truncate(data.motivating_verse_ref),
      bio: truncate(data.bio),
      ministry_group: data.ministry_group ?? null,
    })
    .eq('id', athleteId);

  if (error) {
    console.error('updateProfile error:', error.message, error.details, error.hint);
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  revalidatePath('/profile');
}

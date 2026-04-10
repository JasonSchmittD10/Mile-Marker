-- Migration: add profile fields to athletes table
ALTER TABLE athletes
  ADD COLUMN IF NOT EXISTS strava_profile_url  text,
  ADD COLUMN IF NOT EXISTS city                text,
  ADD COLUMN IF NOT EXISTS motivating_verse    text,
  ADD COLUMN IF NOT EXISTS motivating_verse_ref text,
  ADD COLUMN IF NOT EXISTS bio                 text;

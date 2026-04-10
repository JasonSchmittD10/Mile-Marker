-- Add admin flag to athletes
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Set Jason Schmitt as admin by Strava ID
UPDATE athletes SET is_admin = true WHERE strava_id = 51126970;

-- Create featured_race table (singleton: one active race at a time)
CREATE TABLE IF NOT EXISTS featured_race (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Upcoming Race',
  location text,
  race_date timestamptz NOT NULL,
  image_url text,
  description text,
  active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Seed with Garmin Marathon (skip if already exists)
INSERT INTO featured_race (title, location, race_date, active)
SELECT 'Garmin Marathon', 'Durham, NC', '2026-05-02T11:00:00Z', true
WHERE NOT EXISTS (SELECT 1 FROM featured_race LIMIT 1);

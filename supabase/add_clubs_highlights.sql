-- Clubs table
CREATE TABLE IF NOT EXISTS clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  logo_url text,
  location text,
  created_at timestamptz DEFAULT now()
);

-- Seed Antioch Raleigh Run Club
INSERT INTO clubs (name, slug, description, location)
VALUES ('Antioch Raleigh Run Club', 'antioch-raleigh', 'Running for the glory of God in the Triangle area.', 'Raleigh, NC')
ON CONFLICT (slug) DO NOTHING;

-- Add club membership + admin to athletes
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS club_id uuid REFERENCES clubs(id);
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Set Jason Schmitt as admin
UPDATE athletes SET is_admin = true WHERE strava_id = 51126970;

-- Assign all existing athletes to Antioch Raleigh (only club)
UPDATE athletes
SET club_id = (SELECT id FROM clubs WHERE slug = 'antioch-raleigh')
WHERE club_id IS NULL;

-- Highlights feed table
CREATE TABLE IF NOT EXISTS highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE NOT NULL,
  club_id uuid REFERENCES clubs(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  activity_id uuid REFERENCES activities(id) ON DELETE SET NULL,
  value numeric,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Prevent duplicate highlights for the same athlete + event + activity
CREATE UNIQUE INDEX IF NOT EXISTS highlights_unique
  ON highlights(athlete_id, event_type, activity_id);

CREATE INDEX IF NOT EXISTS highlights_club_created
  ON highlights(club_id, created_at DESC);

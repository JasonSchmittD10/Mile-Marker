-- Mile Marker Database Schema
-- Run this against your Supabase project SQL editor

-- Athletes table
CREATE TABLE IF NOT EXISTS athletes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strava_id       bigint UNIQUE NOT NULL,
  firstname       text,
  lastname        text,
  profile_medium  text,
  access_token    text,
  refresh_token   text,
  token_expires_at bigint,
  scopes_accepted text,
  ministry_group  text,
  created_at      timestamptz DEFAULT now()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id          uuid REFERENCES athletes(id) ON DELETE CASCADE,
  strava_activity_id  bigint UNIQUE NOT NULL,
  name                text,
  sport_type          text,
  distance_meters     numeric,
  moving_time_seconds integer,
  start_date_local    timestamptz,
  start_latlng        numeric[],
  summary_polyline    text,
  created_at          timestamptz DEFAULT now()
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id  uuid REFERENCES athletes(id) ON DELETE CASCADE,
  badge_type  text NOT NULL,
  earned_at   timestamptz DEFAULT now(),
  activity_id uuid REFERENCES activities(id)
);

-- Streaks table
CREATE TABLE IF NOT EXISTS streaks (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id           uuid REFERENCES athletes(id) ON DELETE CASCADE UNIQUE,
  current_weeks        integer DEFAULT 0,
  longest_weeks        integer DEFAULT 0,
  last_active_iso_week text,
  updated_at           timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activities_athlete_id ON activities(athlete_id);
CREATE INDEX IF NOT EXISTS idx_activities_start_date_local ON activities(start_date_local);
CREATE INDEX IF NOT EXISTS idx_badges_athlete_id ON badges(athlete_id);
CREATE INDEX IF NOT EXISTS idx_streaks_athlete_id ON streaks(athlete_id);

-- Disable RLS for trusted club members
ALTER TABLE athletes DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE streaks DISABLE ROW LEVEL SECURITY;

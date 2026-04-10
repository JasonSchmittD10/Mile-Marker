import type { Athlete, Activity, Badge, Streak, AthleteWithStats, FeedEvent, WeeklyStats } from '@/types';

// ─── Athletes ────────────────────────────────────────────────────────────────

type AthleteSeed = Omit<Athlete, 'club_id' | 'is_admin'> & Partial<Pick<Athlete, 'club_id' | 'is_admin'>> & { initials: string; avatarBg: string; avatarText: string };

export const MOCK_ATHLETES: AthleteSeed[] = [
  {
    id: 'a1',
    strava_id: 10001,
    firstname: 'Marcus',
    lastname: 'Webb',
    profile_medium: null,
    access_token: null,
    refresh_token: null,
    token_expires_at: null,
    scopes_accepted: 'read,activity:read_all',
    ministry_group: 'syllabus_weekers',
    strava_profile_url: null,
    city: 'Durham, NC',
    motivating_verse: 'I can do all things through Christ who strengthens me.',
    motivating_verse_ref: 'Philippians 4:13',
    bio: 'Running keeps me sharp mentally and spiritually.',
    created_at: '2026-02-01T00:00:00Z',
    initials: 'MW',
    avatarBg: 'bg-teal-100',
    avatarText: 'text-teal-700',
  },
  {
    id: 'a2',
    strava_id: 10002,
    firstname: 'Sarah',
    lastname: 'Chen',
    profile_medium: null,
    access_token: null,
    refresh_token: null,
    token_expires_at: null,
    scopes_accepted: 'read,activity:read_all',
    ministry_group: 'minivan_mafia',
    strava_profile_url: null,
    city: 'Cary, NC',
    motivating_verse: 'She is clothed with strength and dignity.',
    motivating_verse_ref: 'Proverbs 31:25',
    bio: 'I run to show my kids what it looks like to keep going.',
    created_at: '2026-02-03T00:00:00Z',
    initials: 'SC',
    avatarBg: 'bg-blue-100',
    avatarText: 'text-blue-700',
  },
  {
    id: 'a3',
    strava_id: 10003,
    firstname: 'David',
    lastname: 'Okafor',
    profile_medium: null,
    access_token: null,
    refresh_token: null,
    token_expires_at: null,
    scopes_accepted: 'read,activity:read_all',
    ministry_group: 'the_legends',
    strava_profile_url: null,
    city: 'Raleigh, NC',
    motivating_verse: 'Let us run with endurance the race that is set before us.',
    motivating_verse_ref: 'Hebrews 12:1',
    bio: 'Early mornings on the trail are my prayer time.',
    created_at: '2026-02-05T00:00:00Z',
    initials: 'DO',
    avatarBg: 'bg-amber-100',
    avatarText: 'text-amber-700',
  },
  {
    id: 'a4',
    strava_id: 10004,
    firstname: 'Rachel',
    lastname: 'Torres',
    profile_medium: null,
    access_token: null,
    refresh_token: null,
    token_expires_at: null,
    scopes_accepted: 'read,activity:read_all',
    ministry_group: 'syllabus_weekers',
    strava_profile_url: null,
    city: 'Apex, NC',
    motivating_verse: 'The Lord is my strength and my shield.',
    motivating_verse_ref: 'Psalm 28:7',
    bio: 'Every mile is a reminder that I am stronger than I think.',
    created_at: '2026-02-07T00:00:00Z',
    initials: 'RT',
    avatarBg: 'bg-purple-100',
    avatarText: 'text-purple-700',
  },
  {
    id: 'a5',
    strava_id: 10005,
    firstname: 'James',
    lastname: 'Winters',
    profile_medium: null,
    access_token: null,
    refresh_token: null,
    token_expires_at: null,
    scopes_accepted: 'read,activity:read_all',
    ministry_group: 'the_legends',
    strava_profile_url: null,
    city: 'Wake Forest, NC',
    motivating_verse: 'Be strong and courageous. Do not be afraid.',
    motivating_verse_ref: 'Joshua 1:9',
    bio: 'Running with my crew keeps me accountable and grateful.',
    created_at: '2026-02-10T00:00:00Z',
    initials: 'JW',
    avatarBg: 'bg-rose-100',
    avatarText: 'text-rose-700',
  },
  {
    id: 'a6',
    strava_id: 10006,
    firstname: 'Naomi',
    lastname: 'Park',
    profile_medium: null,
    access_token: null,
    refresh_token: null,
    token_expires_at: null,
    scopes_accepted: 'read,activity:read_all',
    ministry_group: 'quarter_lifers',
    strava_profile_url: null,
    city: 'Raleigh, NC',
    motivating_verse: 'But those who hope in the Lord will renew their strength.',
    motivating_verse_ref: 'Isaiah 40:31',
    bio: 'Running reminds me I was made for more than comfort.',
    created_at: '2026-02-12T00:00:00Z',
    initials: 'NP',
    avatarBg: 'bg-indigo-100',
    avatarText: 'text-indigo-700',
  },
  {
    id: 'a7',
    strava_id: 10007,
    firstname: 'Daniel',
    lastname: 'Foster',
    profile_medium: null,
    access_token: null,
    refresh_token: null,
    token_expires_at: null,
    scopes_accepted: 'read,activity:read_all',
    ministry_group: 'minivan_mafia',
    strava_profile_url: null,
    city: 'Morrisville, NC',
    motivating_verse: 'Do you not know that your bodies are temples of the Holy Spirit?',
    motivating_verse_ref: '1 Corinthians 6:19',
    bio: 'I run to steward the body God gave me well.',
    created_at: '2026-02-15T00:00:00Z',
    initials: 'DF',
    avatarBg: 'bg-emerald-100',
    avatarText: 'text-emerald-700',
  },
  {
    id: 'a8',
    strava_id: 10008,
    firstname: 'Grace',
    lastname: 'Adeyemi',
    profile_medium: null,
    access_token: null,
    refresh_token: null,
    token_expires_at: null,
    scopes_accepted: 'read,activity:read_all',
    ministry_group: 'quarter_lifers',
    strava_profile_url: null,
    city: 'Raleigh, NC',
    motivating_verse: 'For we are God\'s handiwork, created in Christ Jesus to do good works.',
    motivating_verse_ref: 'Ephesians 2:10',
    bio: 'Running is how I worship — one step at a time.',
    created_at: '2026-02-18T00:00:00Z',
    initials: 'GA',
    avatarBg: 'bg-orange-100',
    avatarText: 'text-orange-700',
  },
];

// ─── Activities ───────────────────────────────────────────────────────────────
// ~40 activities spread across 6 ISO weeks (W10–W15 of 2026)
// Week 15: Apr 6–10 | Week 14: Mar 30–Apr 5 | Week 13: Mar 23–29
// Week 12: Mar 16–22 | Week 11: Mar 9–15 | Week 10: Mar 2–8

export const MOCK_ACTIVITIES: Activity[] = [
  // === WEEK 15 (Apr 6–10) ===
  { id: 'act1', athlete_id: 'a1', strava_activity_id: 90001, name: 'Morning Miles', sport_type: 'Run', distance_meters: 8046, moving_time_seconds: 2640, start_date_local: '2026-04-07T05:45:00Z', start_latlng: [35.7796, -78.6382], summary_polyline: 'mock_polyline_1', created_at: '2026-04-07T06:10:00Z' },
  { id: 'act2', athlete_id: 'a2', strava_activity_id: 90002, name: 'Easy Run', sport_type: 'Run', distance_meters: 6437, moving_time_seconds: 2280, start_date_local: '2026-04-08T07:00:00Z', start_latlng: [35.7820, -78.6400], summary_polyline: 'mock_polyline_2', created_at: '2026-04-08T07:40:00Z' },
  { id: 'act3', athlete_id: 'a3', strava_activity_id: 90003, name: 'Lunch Break Jog', sport_type: 'Run', distance_meters: 4828, moving_time_seconds: 1680, start_date_local: '2026-04-09T12:30:00Z', start_latlng: [35.7750, -78.6350], summary_polyline: 'mock_polyline_3', created_at: '2026-04-09T13:00:00Z' },
  { id: 'act4', athlete_id: 'a4', strava_activity_id: 90004, name: 'Dawn Patrol', sport_type: 'Run', distance_meters: 9656, moving_time_seconds: 3360, start_date_local: '2026-04-07T05:15:00Z', start_latlng: [35.7810, -78.6420], summary_polyline: 'mock_polyline_4', created_at: '2026-04-07T06:15:00Z' },
  { id: 'act5', athlete_id: 'a5', strava_activity_id: 90005, name: 'Tuesday Run', sport_type: 'Run', distance_meters: 5632, moving_time_seconds: 1920, start_date_local: '2026-04-08T06:30:00Z', start_latlng: [35.7770, -78.6370], summary_polyline: 'mock_polyline_5', created_at: '2026-04-08T07:02:00Z' },
  { id: 'act6', athlete_id: 'a6', strava_activity_id: 90006, name: 'Morning Walk', sport_type: 'Walk', distance_meters: 4023, moving_time_seconds: 2880, start_date_local: '2026-04-09T06:00:00Z', start_latlng: [35.7800, -78.6390], summary_polyline: 'mock_polyline_6', created_at: '2026-04-09T06:50:00Z' },
  { id: 'act7', athlete_id: 'a8', strava_activity_id: 90007, name: 'Neighborhood Loop', sport_type: 'Run', distance_meters: 6920, moving_time_seconds: 2400, start_date_local: '2026-04-10T07:15:00Z', start_latlng: [35.7830, -78.6410], summary_polyline: 'mock_polyline_7', created_at: '2026-04-10T08:00:00Z' },

  // === WEEK 14 (Mar 30–Apr 5) ===
  { id: 'act8', athlete_id: 'a1', strava_activity_id: 90008, name: 'Sunday Stroll', sport_type: 'Walk', distance_meters: 5632, moving_time_seconds: 3600, start_date_local: '2026-04-05T13:00:00Z', start_latlng: [35.7796, -78.6382], summary_polyline: 'mock_polyline_8', created_at: '2026-04-05T14:00:00Z' },
  { id: 'act9', athlete_id: 'a2', strava_activity_id: 90009, name: 'Spring Run', sport_type: 'Run', distance_meters: 8046, moving_time_seconds: 2820, start_date_local: '2026-04-02T06:45:00Z', start_latlng: [35.7820, -78.6400], summary_polyline: 'mock_polyline_9', created_at: '2026-04-02T07:32:00Z' },
  { id: 'act10', athlete_id: 'a3', strava_activity_id: 90010, name: 'Trail Hike', sport_type: 'Hike', distance_meters: 11265, moving_time_seconds: 7200, start_date_local: '2026-04-05T09:00:00Z', start_latlng: [35.7760, -78.6360], summary_polyline: 'mock_polyline_10', created_at: '2026-04-05T11:00:00Z' },
  { id: 'act11', athlete_id: 'a4', strava_activity_id: 90011, name: 'Pre-dawn Run', sport_type: 'Run', distance_meters: 12874, moving_time_seconds: 4500, start_date_local: '2026-04-01T05:30:00Z', start_latlng: [35.7810, -78.6420], summary_polyline: 'mock_polyline_11', created_at: '2026-04-01T06:45:00Z' },
  { id: 'act12', athlete_id: 'a5', strava_activity_id: 90012, name: 'Easy Miles', sport_type: 'Run', distance_meters: 6437, moving_time_seconds: 2280, start_date_local: '2026-04-03T07:00:00Z', start_latlng: [35.7770, -78.6370], summary_polyline: 'mock_polyline_12', created_at: '2026-04-03T07:38:00Z' },
  { id: 'act13', athlete_id: 'a6', strava_activity_id: 90013, name: 'Group Run', sport_type: 'Run', distance_meters: 8046, moving_time_seconds: 2700, start_date_local: '2026-04-04T06:30:00Z', start_latlng: [35.7800, -78.6390], summary_polyline: 'mock_polyline_13', created_at: '2026-04-04T07:15:00Z' },
  { id: 'act14', athlete_id: 'a7', strava_activity_id: 90014, name: 'Long Saturday Run', sport_type: 'Run', distance_meters: 16093, moving_time_seconds: 5760, start_date_local: '2026-04-04T07:00:00Z', start_latlng: [35.7840, -78.6430], summary_polyline: 'mock_polyline_14', created_at: '2026-04-04T08:36:00Z' },
  { id: 'act15', athlete_id: 'a8', strava_activity_id: 90015, name: 'Afternoon Walk', sport_type: 'Walk', distance_meters: 4828, moving_time_seconds: 3240, start_date_local: '2026-04-05T14:00:00Z', start_latlng: [35.7830, -78.6410], summary_polyline: 'mock_polyline_15', created_at: '2026-04-05T14:54:00Z' },

  // === WEEK 13 (Mar 23–29) ===
  { id: 'act16', athlete_id: 'a1', strava_activity_id: 90016, name: 'Mid-week Run', sport_type: 'Run', distance_meters: 9656, moving_time_seconds: 3120, start_date_local: '2026-03-25T06:00:00Z', start_latlng: [35.7796, -78.6382], summary_polyline: 'mock_polyline_16', created_at: '2026-03-25T06:52:00Z' },
  { id: 'act17', athlete_id: 'a2', strava_activity_id: 90017, name: 'Sunrise Run', sport_type: 'Run', distance_meters: 7242, moving_time_seconds: 2520, start_date_local: '2026-03-26T06:15:00Z', start_latlng: [35.7820, -78.6400], summary_polyline: 'mock_polyline_17', created_at: '2026-03-26T07:07:00Z' },
  { id: 'act18', athlete_id: 'a3', strava_activity_id: 90018, name: 'Recovery Walk', sport_type: 'Walk', distance_meters: 4023, moving_time_seconds: 2700, start_date_local: '2026-03-27T07:30:00Z', start_latlng: [35.7760, -78.6360], summary_polyline: 'mock_polyline_18', created_at: '2026-03-27T08:15:00Z' },
  { id: 'act19', athlete_id: 'a4', strava_activity_id: 90019, name: 'Early Bird', sport_type: 'Run', distance_meters: 11265, moving_time_seconds: 3900, start_date_local: '2026-03-24T05:45:00Z', start_latlng: [35.7810, -78.6420], summary_polyline: 'mock_polyline_19', created_at: '2026-03-24T06:50:00Z' },
  { id: 'act20', athlete_id: 'a6', strava_activity_id: 90020, name: 'Neighborhood Run', sport_type: 'Run', distance_meters: 6437, moving_time_seconds: 2100, start_date_local: '2026-03-26T06:45:00Z', start_latlng: [35.7800, -78.6391], summary_polyline: 'mock_polyline_20', created_at: '2026-03-26T07:20:00Z' },
  { id: 'act21', athlete_id: 'a7', strava_activity_id: 90021, name: 'Thursday Tempo', sport_type: 'Run', distance_meters: 8046, moving_time_seconds: 2520, start_date_local: '2026-03-26T06:30:00Z', start_latlng: [35.7840, -78.6430], summary_polyline: 'mock_polyline_21', created_at: '2026-03-26T07:12:00Z' },
  { id: 'act22', athlete_id: 'a8', strava_activity_id: 90022, name: 'Sunday Morning Walk', sport_type: 'Walk', distance_meters: 5632, moving_time_seconds: 3600, start_date_local: '2026-03-29T12:30:00Z', start_latlng: [35.7830, -78.6410], summary_polyline: 'mock_polyline_22', created_at: '2026-03-29T13:30:00Z' },

  // === WEEK 12 (Mar 16–22) ===
  { id: 'act23', athlete_id: 'a1', strava_activity_id: 90023, name: 'Monday Run', sport_type: 'Run', distance_meters: 8046, moving_time_seconds: 2640, start_date_local: '2026-03-16T06:00:00Z', start_latlng: [35.7796, -78.6382], summary_polyline: 'mock_polyline_23', created_at: '2026-03-16T06:44:00Z' },
  { id: 'act24', athlete_id: 'a3', strava_activity_id: 90024, name: 'Interval Training', sport_type: 'Run', distance_meters: 9656, moving_time_seconds: 3000, start_date_local: '2026-03-19T06:30:00Z', start_latlng: [35.7760, -78.6360], summary_polyline: 'mock_polyline_24', created_at: '2026-03-19T07:20:00Z' },
  { id: 'act25', athlete_id: 'a4', strava_activity_id: 90025, name: 'Long Run', sport_type: 'Run', distance_meters: 19312, moving_time_seconds: 7200, start_date_local: '2026-03-21T06:00:00Z', start_latlng: [35.7810, -78.6420], summary_polyline: 'mock_polyline_25', created_at: '2026-03-21T08:00:00Z' },
  { id: 'act26', athlete_id: 'a6', strava_activity_id: 90026, name: 'Easy Miles', sport_type: 'Run', distance_meters: 6437, moving_time_seconds: 2160, start_date_local: '2026-03-18T07:00:00Z', start_latlng: [35.7800, -78.6390], summary_polyline: 'mock_polyline_26', created_at: '2026-03-18T07:36:00Z' },
  { id: 'act27', athlete_id: 'a7', strava_activity_id: 90027, name: 'Hill Repeats', sport_type: 'Run', distance_meters: 6437, moving_time_seconds: 2400, start_date_local: '2026-03-17T06:00:00Z', start_latlng: [35.7840, -78.6430], summary_polyline: 'mock_polyline_27', created_at: '2026-03-17T06:40:00Z' },

  // === WEEK 11 (Mar 9–15) ===
  { id: 'act28', athlete_id: 'a1', strava_activity_id: 90028, name: 'Wednesday Workout', sport_type: 'Run', distance_meters: 7242, moving_time_seconds: 2400, start_date_local: '2026-03-11T06:00:00Z', start_latlng: [35.7796, -78.6382], summary_polyline: 'mock_polyline_28', created_at: '2026-03-11T06:40:00Z' },
  { id: 'act29', athlete_id: 'a4', strava_activity_id: 90029, name: 'Recovery Run', sport_type: 'Run', distance_meters: 4828, moving_time_seconds: 1800, start_date_local: '2026-03-12T07:00:00Z', start_latlng: [35.7810, -78.6420], summary_polyline: 'mock_polyline_29', created_at: '2026-03-12T07:30:00Z' },
  { id: 'act30', athlete_id: 'a6', strava_activity_id: 90030, name: 'Spring Hike', sport_type: 'Hike', distance_meters: 12874, moving_time_seconds: 9000, start_date_local: '2026-03-14T09:00:00Z', start_latlng: [35.7800, -78.6390], summary_polyline: 'mock_polyline_30', created_at: '2026-03-14T11:30:00Z' },
  { id: 'act31', athlete_id: 'a7', strava_activity_id: 90031, name: 'Sunday Long Run', sport_type: 'Run', distance_meters: 16093, moving_time_seconds: 6000, start_date_local: '2026-03-15T07:00:00Z', start_latlng: [35.7840, -78.6430], summary_polyline: 'mock_polyline_31', created_at: '2026-03-15T08:40:00Z' },

  // === WEEK 10 (Mar 2–8) ===
  { id: 'act32', athlete_id: 'a1', strava_activity_id: 90032, name: 'First Run of March', sport_type: 'Run', distance_meters: 8046, moving_time_seconds: 2640, start_date_local: '2026-03-03T06:30:00Z', start_latlng: [35.7796, -78.6382], summary_polyline: 'mock_polyline_32', created_at: '2026-03-03T07:14:00Z' },
  { id: 'act33', athlete_id: 'a4', strava_activity_id: 90033, name: 'Tempo Tuesday', sport_type: 'Run', distance_meters: 9656, moving_time_seconds: 3120, start_date_local: '2026-03-04T05:50:00Z', start_latlng: [35.7810, -78.6420], summary_polyline: 'mock_polyline_33', created_at: '2026-03-04T06:42:00Z' },
  { id: 'act34', athlete_id: 'a6', strava_activity_id: 90034, name: 'Monday Miles', sport_type: 'Run', distance_meters: 8046, moving_time_seconds: 2700, start_date_local: '2026-03-02T06:45:00Z', start_latlng: [35.7800, -78.6390], summary_polyline: 'mock_polyline_34', created_at: '2026-03-02T07:30:00Z' },
  { id: 'act35', athlete_id: 'a7', strava_activity_id: 90035, name: 'Saturday Run', sport_type: 'Run', distance_meters: 14484, moving_time_seconds: 5400, start_date_local: '2026-03-07T08:00:00Z', start_latlng: [35.7840, -78.6430], summary_polyline: 'mock_polyline_35', created_at: '2026-03-07T09:30:00Z' },
  { id: 'act36', athlete_id: 'a2', strava_activity_id: 90036, name: 'First Group Run', sport_type: 'Run', distance_meters: 6437, moving_time_seconds: 2280, start_date_local: '2026-03-05T06:30:00Z', start_latlng: [35.7820, -78.6401], summary_polyline: 'mock_polyline_36', created_at: '2026-03-05T07:08:00Z' },
  { id: 'act37', athlete_id: 'a5', strava_activity_id: 90037, name: 'Recovery Jog', sport_type: 'Run', distance_meters: 3218, moving_time_seconds: 1200, start_date_local: '2026-03-06T17:30:00Z', start_latlng: [35.7770, -78.6370], summary_polyline: 'mock_polyline_37', created_at: '2026-03-06T17:50:00Z' },
  { id: 'act38', athlete_id: 'a3', strava_activity_id: 90038, name: 'Hike Day', sport_type: 'Hike', distance_meters: 9656, moving_time_seconds: 6000, start_date_local: '2026-03-08T09:00:00Z', start_latlng: [35.7760, -78.6360], summary_polyline: 'mock_polyline_38', created_at: '2026-03-08T10:40:00Z' },
  { id: 'act39', athlete_id: 'a8', strava_activity_id: 90039, name: 'Choir Walk', sport_type: 'Walk', distance_meters: 4828, moving_time_seconds: 3000, start_date_local: '2026-03-07T10:00:00Z', start_latlng: [35.7830, -78.6410], summary_polyline: 'mock_polyline_39', created_at: '2026-03-07T10:50:00Z' },
  { id: 'act40', athlete_id: 'a5', strava_activity_id: 90040, name: 'Park Run', sport_type: 'Run', distance_meters: 5000, moving_time_seconds: 1740, start_date_local: '2026-03-03T07:00:00Z', start_latlng: [35.7775, -78.6375], summary_polyline: 'mock_polyline_40', created_at: '2026-03-03T07:29:00Z' },
];

// ─── Streaks ──────────────────────────────────────────────────────────────────

export const MOCK_STREAKS: Streak[] = [
  { id: 's1', athlete_id: 'a1', current_weeks: 6, longest_weeks: 8, last_active_iso_week: '2026-W15', updated_at: '2026-04-07T06:10:00Z' },
  { id: 's2', athlete_id: 'a2', current_weeks: 3, longest_weeks: 5, last_active_iso_week: '2026-W15', updated_at: '2026-04-08T07:40:00Z' },
  { id: 's3', athlete_id: 'a3', current_weeks: 4, longest_weeks: 4, last_active_iso_week: '2026-W15', updated_at: '2026-04-09T13:00:00Z' },
  { id: 's4', athlete_id: 'a4', current_weeks: 6, longest_weeks: 10, last_active_iso_week: '2026-W15', updated_at: '2026-04-07T06:15:00Z' },
  { id: 's5', athlete_id: 'a5', current_weeks: 2, longest_weeks: 4, last_active_iso_week: '2026-W15', updated_at: '2026-04-08T07:02:00Z' },
  { id: 's6', athlete_id: 'a6', current_weeks: 6, longest_weeks: 6, last_active_iso_week: '2026-W15', updated_at: '2026-04-09T06:50:00Z' },
  { id: 's7', athlete_id: 'a7', current_weeks: 4, longest_weeks: 6, last_active_iso_week: '2026-W14', updated_at: '2026-04-04T08:36:00Z' },
  { id: 's8', athlete_id: 'a8', current_weeks: 3, longest_weeks: 3, last_active_iso_week: '2026-W15', updated_at: '2026-04-10T08:00:00Z' },
];

// ─── Badges ───────────────────────────────────────────────────────────────────

export const MOCK_BADGES: Badge[] = [
  // Marcus - dawn_treader, on_fire, pilgrim
  { id: 'b1', athlete_id: 'a1', badge_type: 'dawn_treader', earned_at: '2026-04-07T06:10:00Z', activity_id: 'act1' },
  { id: 'b2', athlete_id: 'a1', badge_type: 'on_fire', earned_at: '2026-03-25T06:52:00Z', activity_id: 'act16' },
  { id: 'b3', athlete_id: 'a1', badge_type: 'pilgrim', earned_at: '2026-04-05T14:00:00Z', activity_id: 'act8' },

  // Sarah - sunday_stroll, fellowship
  { id: 'b4', athlete_id: 'a2', badge_type: 'sunday_stroll', earned_at: '2026-04-05T07:32:00Z', activity_id: 'act9' },
  { id: 'b5', athlete_id: 'a2', badge_type: 'fellowship', earned_at: '2026-03-26T07:07:00Z', activity_id: 'act17' },

  // David - fellowship, on_fire
  { id: 'b6', athlete_id: 'a3', badge_type: 'fellowship', earned_at: '2026-03-26T07:20:00Z', activity_id: 'act20' },
  { id: 'b7', athlete_id: 'a3', badge_type: 'on_fire', earned_at: '2026-04-09T13:00:00Z', activity_id: 'act3' },

  // Rachel - pilgrim, dawn_treader, barnabas
  { id: 'b8', athlete_id: 'a4', badge_type: 'pilgrim', earned_at: '2026-03-21T08:00:00Z', activity_id: 'act25' },
  { id: 'b9', athlete_id: 'a4', badge_type: 'dawn_treader', earned_at: '2026-04-01T06:45:00Z', activity_id: 'act11' },
  { id: 'b10', athlete_id: 'a4', badge_type: 'barnabas', earned_at: '2026-04-07T06:15:00Z', activity_id: 'act4' },
  { id: 'b11', athlete_id: 'a4', badge_type: 'on_fire', earned_at: '2026-04-07T06:15:00Z', activity_id: 'act4' },

  // James - sunday_stroll
  { id: 'b12', athlete_id: 'a5', badge_type: 'sunday_stroll', earned_at: '2026-03-08T07:02:00Z', activity_id: 'act37' },

  // Naomi - on_fire, fellowship
  { id: 'b13', athlete_id: 'a6', badge_type: 'on_fire', earned_at: '2026-03-26T07:20:00Z', activity_id: 'act20' },
  { id: 'b14', athlete_id: 'a6', badge_type: 'fellowship', earned_at: '2026-03-26T07:20:00Z', activity_id: 'act20' },

  // Daniel - pilgrim
  { id: 'b15', athlete_id: 'a7', badge_type: 'pilgrim', earned_at: '2026-04-04T08:36:00Z', activity_id: 'act14' },

  // Grace - sunday_stroll, fellowship
  { id: 'b16', athlete_id: 'a8', badge_type: 'sunday_stroll', earned_at: '2026-03-29T13:30:00Z', activity_id: 'act22' },
  { id: 'b17', athlete_id: 'a8', badge_type: 'fellowship', earned_at: '2026-04-05T14:54:00Z', activity_id: 'act15' },
];

// ─── Derived helpers ──────────────────────────────────────────────────────────

export function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getCurrentISOWeek(): string {
  return getISOWeek(new Date());
}

export function getPreviousISOWeek(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return getISOWeek(d);
}

export const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL;

export function buildAthleteWithStats(athlete: AthleteSeed): AthleteWithStats {
  const activities = MOCK_ACTIVITIES.filter(a => a.athlete_id === athlete.id);
  const badges = MOCK_BADGES.filter(b => b.athlete_id === athlete.id);
  const streak = MOCK_STREAKS.find(s => s.athlete_id === athlete.id);
  const totalDistanceMeters = activities.reduce((sum, a) => sum + a.distance_meters, 0);
  const currentWeek = getCurrentISOWeek();
  const activeThisWeek = activities.some(a => getISOWeek(new Date(a.start_date_local)) === currentWeek);

  return {
    ...athlete,
    activities,
    badges,
    streak,
    totalDistanceMeters,
    activeThisWeek,
  };
}

export const MOCK_ATHLETES_WITH_STATS: AthleteWithStats[] = MOCK_ATHLETES.map(buildAthleteWithStats);

export function getMockWeeklyStats(): WeeklyStats {
  const currentWeek = getCurrentISOWeek();
  const thisWeekActivities = MOCK_ACTIVITIES.filter(
    a => getISOWeek(new Date(a.start_date_local)) === currentWeek
  );
  const membersActive = new Set(thisWeekActivities.map(a => a.athlete_id)).size;
  const totalMilesThisWeek = thisWeekActivities.reduce((sum, a) => sum + a.distance_meters, 0) / 1609.34;
  const weekStart = getWeekStart(new Date());
  const badgesEarnedThisWeek = MOCK_BADGES.filter(b => new Date(b.earned_at) >= weekStart).length;
  const totalMilesEver = MOCK_ACTIVITIES.reduce((sum, a) => sum + a.distance_meters, 0) / 1609.34;

  return { membersActive, totalMilesThisWeek, badgesEarnedThisWeek, totalMilesEver };
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getMockFeedEvents(): FeedEvent[] {
  const events: FeedEvent[] = [];

  // Badge events
  for (const badge of MOCK_BADGES) {
    const athlete = MOCK_ATHLETES_WITH_STATS.find(a => a.id === badge.athlete_id);
    if (!athlete) continue;
    events.push({
      id: `feed-badge-${badge.id}`,
      type: 'badge',
      athlete,
      description: `earned the ${badge.badge_type.replace(/_/g, ' ')} badge`,
      timestamp: badge.earned_at,
      badgeType: badge.badge_type,
    });
  }

  // Streak milestones (multiples of 4)
  for (const streak of MOCK_STREAKS) {
    if (streak.current_weeks > 0 && streak.current_weeks % 4 === 0) {
      const athlete = MOCK_ATHLETES_WITH_STATS.find(a => a.id === streak.athlete_id);
      if (!athlete) continue;
      events.push({
        id: `feed-streak-${streak.id}`,
        type: 'streak_milestone',
        athlete,
        description: `hit a ${streak.current_weeks}-week streak`,
        timestamp: streak.updated_at,
        streakWeeks: streak.current_weeks,
      });
    }
  }

  // First activity ever
  const firstActivities = new Map<string, Activity>();
  for (const activity of [...MOCK_ACTIVITIES].sort((a, b) => new Date(a.start_date_local).getTime() - new Date(b.start_date_local).getTime())) {
    if (!firstActivities.has(activity.athlete_id)) {
      firstActivities.set(activity.athlete_id, activity);
    }
  }
  for (const [athleteId, activity] of Array.from(firstActivities.entries())) {
    const athlete = MOCK_ATHLETES_WITH_STATS.find(a => a.id === athleteId);
    if (!athlete) continue;
    events.push({
      id: `feed-first-${athleteId}`,
      type: 'first_activity',
      athlete,
      description: 'logged their first activity with the club',
      timestamp: activity.start_date_local,
    });
  }

  // Sort descending by timestamp, limit 20
  return events
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);
}

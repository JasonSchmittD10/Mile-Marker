export interface Athlete {
  id: string;
  strava_id: number;
  firstname: string;
  lastname: string;
  profile_medium: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: number | null;
  scopes_accepted: string | null;
  ministry_group: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  athlete_id: string;
  strava_activity_id: number;
  name: string;
  sport_type: string;
  distance_meters: number;
  moving_time_seconds: number;
  start_date_local: string;
  start_latlng: [number, number] | null;
  summary_polyline: string | null;
  created_at: string;
}

export type BadgeType =
  | 'dawn_treader'
  | 'sunday_stroll'
  | 'fellowship'
  | 'on_fire'
  | 'pilgrim'
  | 'barnabas';

export const BADGE_INFO: Record<BadgeType, { label: string; description: string; emoji: string }> = {
  dawn_treader: { label: 'Dawn Treader', description: 'Activity before 6 AM', emoji: '🌅' },
  sunday_stroll: { label: 'Sunday Stroll', description: 'Sunday afternoon activity', emoji: '⛪' },
  fellowship: { label: 'Fellowship', description: 'Activity within 5 min & 100m of another member', emoji: '🤝' },
  on_fire: { label: 'On Fire', description: '4+ week streak', emoji: '🔥' },
  pilgrim: { label: 'Pilgrim', description: '100 total miles', emoji: '🚶' },
  barnabas: { label: 'Barnabas', description: '3 fellowship badges this month', emoji: '💛' },
};

export const ALL_BADGE_TYPES: BadgeType[] = ['dawn_treader', 'sunday_stroll', 'fellowship', 'on_fire', 'pilgrim', 'barnabas'];

export interface Badge {
  id: string;
  athlete_id: string;
  badge_type: BadgeType;
  earned_at: string;
  activity_id: string | null;
}

export interface Streak {
  id: string;
  athlete_id: string;
  current_weeks: number;
  longest_weeks: number;
  last_active_iso_week: string | null;
  updated_at: string;
}

export interface AthleteWithStats extends Athlete {
  streak?: Streak;
  badges?: Badge[];
  activities?: Activity[];
  totalDistanceMeters?: number;
  activeThisWeek?: boolean;
  initials: string;
  avatarBg: string;
  avatarText: string;
}

export interface WeeklyStats {
  membersActive: number;
  totalMilesThisWeek: number;
  badgesEarnedThisWeek: number;
  totalMilesEver: number;
}

export interface FeedEvent {
  id: string;
  type: 'badge' | 'streak_milestone' | 'first_activity' | 'route_milestone';
  athlete: AthleteWithStats;
  description: string;
  timestamp: string;
  badgeType?: BadgeType;
  streakWeeks?: number;
}

export interface LeaderboardEntry {
  athlete: AthleteWithStats;
  value: number;
  rank: number;
  streak?: number;
}

export interface MinistryEntry {
  groupName: string;
  memberCount: number;
  totalMiles: number;
  rank: number;
}

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: StravaAthleteProfile;
}

export interface StravaAthleteProfile {
  id: number;
  firstname: string;
  lastname: string;
  profile_medium: string;
}

export interface StravaActivity {
  id: number;
  name: string;
  sport_type: string;
  distance: number;
  moving_time: number;
  start_date_local: string;
  start_latlng: [number, number] | null;
  map: {
    summary_polyline: string | null;
  };
}

export interface StravaWebhookEvent {
  object_type: string;
  aspect_type: string;
  object_id: number;
  owner_id: number;
  subscription_id: number;
  event_time: number;
}

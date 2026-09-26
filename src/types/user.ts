export type PlanTier = 'free' | 'pro';

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  plan_tier?: PlanTier;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  user_id: string;
  timezone: string | null;
  reminder_enabled: boolean;
  preferred_journal_time: string | null;
  theme: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
}

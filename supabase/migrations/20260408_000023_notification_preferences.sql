CREATE TABLE IF NOT EXISTS public.notification_preferences (
  guardian_id uuid PRIMARY KEY REFERENCES public.guardian_profiles(id) ON DELETE CASCADE,
  email_weekly_digest boolean NOT NULL DEFAULT true,
  email_milestone_alerts boolean NOT NULL DEFAULT true,
  email_daily_summary boolean NOT NULL DEFAULT false,
  push_session_complete boolean NOT NULL DEFAULT false,
  push_streak_reminder boolean NOT NULL DEFAULT true,
  quiet_hours_enabled boolean NOT NULL DEFAULT false,
  quiet_hours_start time NOT NULL DEFAULT '21:00',
  quiet_hours_end time NOT NULL DEFAULT '07:00',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

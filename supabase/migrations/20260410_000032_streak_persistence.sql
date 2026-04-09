ALTER TABLE public.progression_states
  ADD COLUMN IF NOT EXISTS last_session_date date;

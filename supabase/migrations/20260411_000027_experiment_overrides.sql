CREATE TABLE IF NOT EXISTS public.experiment_overrides (
  key              text PRIMARY KEY,
  enabled          boolean NOT NULL DEFAULT true,
  traffic_percent  integer NOT NULL DEFAULT 100 CHECK (traffic_percent BETWEEN 0 AND 100),
  kill_switch_at   timestamptz,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  updated_by       text NOT NULL DEFAULT 'owner'
);

ALTER TABLE public.experiment_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "server_access_only" ON public.experiment_overrides TO service_role USING (true) WITH CHECK (true);

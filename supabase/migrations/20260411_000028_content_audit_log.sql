CREATE TABLE IF NOT EXISTS public.content_audit_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  text NOT NULL,  -- 'skill', 'question', 'band', 'subject'
  entity_id    text NOT NULL,  -- skill_code or question key
  action       text NOT NULL,  -- 'created', 'updated', 'deleted', 'flagged', 'approved', 'rejected'
  changed_by   text NOT NULL,  -- 'owner', 'system', admin email
  previous_value jsonb,
  new_value      jsonb,
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_audit_log_entity_idx ON public.content_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS content_audit_log_created_idx ON public.content_audit_log(created_at DESC);

ALTER TABLE public.content_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "server_access_only" ON public.content_audit_log TO service_role USING (true) WITH CHECK (true);

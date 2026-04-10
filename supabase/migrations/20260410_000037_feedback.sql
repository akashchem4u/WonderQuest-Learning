CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text,
  role text, -- 'parent', 'teacher', 'other'
  rating integer CHECK (rating >= 1 AND rating <= 5),
  message text NOT NULL,
  source text DEFAULT 'web', -- 'web', 'whatsapp', etc.
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
-- Public insert allowed (no auth needed)
CREATE POLICY "anyone can submit feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (true);
-- Only service role can read
CREATE POLICY "service role reads feedback"
  ON public.feedback FOR SELECT
  USING (false);

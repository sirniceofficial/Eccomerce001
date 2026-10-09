
-- Realtime: restrict messages topic to caller's own order-updates channel
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can subscribe to own order channel" ON realtime.messages;
CREATE POLICY "Users can subscribe to own order channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'order-updates-' || auth.uid()::text
);

-- Auth error logs (no sensitive data, only error codes/messages and trace id)
CREATE TABLE IF NOT EXISTS public.auth_error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id text NOT NULL UNIQUE DEFAULT (encode(gen_random_bytes(6), 'hex')),
  event text NOT NULL,
  error_code text,
  error_message text,
  user_agent text,
  url text,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.auth_error_logs ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anon) can insert a log entry — required so failed sign-in attempts can be logged
DROP POLICY IF EXISTS "Anyone can insert auth error logs" ON public.auth_error_logs;
CREATE POLICY "Anyone can insert auth error logs"
ON public.auth_error_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can read
DROP POLICY IF EXISTS "Admins can view auth error logs" ON public.auth_error_logs;
CREATE POLICY "Admins can view auth error logs"
ON public.auth_error_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_auth_error_logs_created_at ON public.auth_error_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_error_logs_trace_id ON public.auth_error_logs (trace_id);

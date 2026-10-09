DROP POLICY IF EXISTS "Anyone can insert auth error logs" ON public.auth_error_logs;
CREATE POLICY "Anyone can insert auth error logs" ON public.auth_error_logs FOR INSERT TO anon, authenticated
WITH CHECK (
  event = ANY (ARRAY['signin_failed','signup_failed','oauth_failed','password_reset_failed','password_reset_requested','session_refresh_failed','signin_success','password_reset_completed'])
  AND char_length(COALESCE(error_message,'')) <= 500
  AND char_length(COALESCE(error_code,'')) <= 100
);
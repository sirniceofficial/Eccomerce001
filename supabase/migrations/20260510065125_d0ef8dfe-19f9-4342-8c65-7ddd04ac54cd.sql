
-- 1. Restrictive INSERT policies blocking direct client inserts (service role bypasses RLS)
CREATE POLICY "Block direct client order inserts"
ON public.orders AS RESTRICTIVE
FOR INSERT TO authenticated, anon
WITH CHECK (false);

CREATE POLICY "Block direct client order_items inserts"
ON public.order_items AS RESTRICTIVE
FOR INSERT TO authenticated, anon
WITH CHECK (false);

-- 2. Restrict product_reviews SELECT to own rows; public listing uses view
DROP POLICY IF EXISTS "Authenticated users can view reviews" ON public.product_reviews;

CREATE POLICY "Users can view their own reviews"
ON public.product_reviews
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Grant select on the public view to anon/authenticated
GRANT SELECT ON public.product_reviews_public TO anon, authenticated;

-- 3. Revoke EXECUTE on SECURITY DEFINER functions from public/anon/authenticated.
-- These are only used internally (RLS policies / auth trigger) and run with definer rights regardless.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

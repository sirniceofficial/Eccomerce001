
-- 1) Privilege escalation hardening: drop the duplicate permissive INSERT policy.
-- "Admins can manage roles" (FOR ALL) already lets admins insert.
-- "Block non-admin role inserts" (RESTRICTIVE) blocks everyone else.
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;

-- 2) Product reviews: stop exposing user_id to the public.
-- Replace the public SELECT policy with an authenticated-only one.
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.product_reviews;

CREATE POLICY "Authenticated users can view reviews"
ON public.product_reviews
FOR SELECT
TO authenticated
USING (true);

-- Public-facing view that excludes the reviewer's user_id.
CREATE OR REPLACE VIEW public.product_reviews_public
WITH (security_invoker = true) AS
SELECT
  id,
  product_id,
  rating,
  title,
  review_text,
  verified_purchase,
  created_at,
  updated_at
FROM public.product_reviews;

GRANT SELECT ON public.product_reviews_public TO anon, authenticated;


-- 1. Admin SELECT policy for order_items (consistent with orders)
CREATE POLICY "Admins can view all order items"
ON public.order_items FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Restrictive policy on user_roles to block non-admin inserts even if a permissive rule is added later
CREATE POLICY "Block non-admin role inserts"
ON public.user_roles AS RESTRICTIVE
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Realtime: scope topic subscriptions to per-user order channels
-- Enable RLS on realtime.messages (idempotent)
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if present, then recreate
DROP POLICY IF EXISTS "Users can subscribe to their own order channel" ON realtime.messages;

CREATE POLICY "Users can subscribe to their own order channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = ('order-updates-' || auth.uid()::text)
);

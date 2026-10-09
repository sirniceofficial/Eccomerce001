-- Product inventory table for server-side stock validation
CREATE TABLE IF NOT EXISTS public.product_inventory (
  product_id integer PRIMARY KEY,
  stock integer NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;

-- Public can read inventory (read-only product availability)
CREATE POLICY "Anyone can view inventory"
ON public.product_inventory FOR SELECT
USING (true);

-- Only admins can mutate
CREATE POLICY "Admins manage inventory"
ON public.product_inventory FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Order status transition validation trigger
CREATE OR REPLACE FUNCTION public.validate_order_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  allowed_next text[];
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    -- Only admins may change status
    IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'Only admins can change order status';
    END IF;

    CASE OLD.status
      WHEN 'pending' THEN allowed_next := ARRAY['processing','cancelled'];
      WHEN 'processing' THEN allowed_next := ARRAY['shipped','cancelled'];
      WHEN 'shipped' THEN allowed_next := ARRAY['delivered'];
      WHEN 'delivered' THEN allowed_next := ARRAY[]::text[];
      WHEN 'cancelled' THEN allowed_next := ARRAY[]::text[];
      ELSE allowed_next := ARRAY['pending','processing','shipped','delivered','cancelled'];
    END CASE;

    IF NOT (NEW.status = ANY(allowed_next)) THEN
      RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_order_status_transition ON public.orders;
CREATE TRIGGER trg_validate_order_status_transition
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.validate_order_status_transition();

-- Rate limit table for edge functions
CREATE TABLE IF NOT EXISTS public.edge_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  function_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_edge_rate_limits_lookup
  ON public.edge_rate_limits (user_id, function_name, created_at DESC);

ALTER TABLE public.edge_rate_limits ENABLE ROW LEVEL SECURITY;

-- No client access; only service role bypasses RLS
CREATE POLICY "No client access to rate limits"
ON public.edge_rate_limits FOR SELECT
USING (false);

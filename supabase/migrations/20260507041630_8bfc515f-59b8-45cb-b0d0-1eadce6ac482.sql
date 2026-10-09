CREATE POLICY "Users can mark whatsapp notified on own orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger to block users from changing anything except whatsapp_notified on their own orders
CREATE OR REPLACE FUNCTION public.guard_user_order_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Admins are unrestricted
  IF has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- Non-admin owners may only flip whatsapp_notified
  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.total_amount IS DISTINCT FROM OLD.total_amount
     OR NEW.shipping_address IS DISTINCT FROM OLD.shipping_address
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.customer_name IS DISTINCT FROM OLD.customer_name
     OR NEW.customer_email IS DISTINCT FROM OLD.customer_email
  THEN
    RAISE EXCEPTION 'Only admins can change order details';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_user_order_update_trg ON public.orders;
CREATE TRIGGER guard_user_order_update_trg
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.guard_user_order_update();

CREATE OR REPLACE FUNCTION public.decrement_stock_if_available(_product_id integer, _qty integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_rows integer;
BEGIN
  IF _qty IS NULL OR _qty <= 0 THEN
    RETURN false;
  END IF;
  UPDATE public.product_inventory
     SET stock = stock - _qty,
         updated_at = now()
   WHERE product_id = _product_id
     AND is_active = true
     AND stock >= _qty;
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows > 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.decrement_stock_if_available(integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_stock_if_available(integer, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.restore_stock(_product_id integer, _qty integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _qty IS NULL OR _qty <= 0 THEN RETURN; END IF;
  UPDATE public.product_inventory
     SET stock = stock + _qty,
         updated_at = now()
   WHERE product_id = _product_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.restore_stock(integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.restore_stock(integer, integer) TO service_role;

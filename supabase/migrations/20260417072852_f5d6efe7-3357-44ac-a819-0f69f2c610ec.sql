
-- Add admin RLS policies for orders
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Explicit INSERT policy for user_roles to prevent privilege escalation
CREATE POLICY "Only admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Length validation on product_reviews via trigger (CHECK constraints disallowed by guidelines for mutable validations; use trigger pattern)
CREATE OR REPLACE FUNCTION public.validate_product_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.title IS NOT NULL AND char_length(NEW.title) > 150 THEN
    RAISE EXCEPTION 'Review title must be 150 characters or less';
  END IF;
  IF NEW.review_text IS NOT NULL AND char_length(NEW.review_text) > 2000 THEN
    RAISE EXCEPTION 'Review text must be 2000 characters or less';
  END IF;
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_product_review_trigger ON public.product_reviews;
CREATE TRIGGER validate_product_review_trigger
BEFORE INSERT OR UPDATE ON public.product_reviews
FOR EACH ROW EXECUTE FUNCTION public.validate_product_review();

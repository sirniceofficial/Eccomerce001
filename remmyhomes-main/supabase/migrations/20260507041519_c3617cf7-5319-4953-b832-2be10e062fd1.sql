-- App settings table for admin-configurable values
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Public read so checkout / edge functions can fetch the WhatsApp number
CREATE POLICY "Anyone can read app settings"
ON public.app_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can insert settings"
ON public.app_settings FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update settings"
ON public.app_settings FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete settings"
ON public.app_settings FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed default WhatsApp number
INSERT INTO public.app_settings (key, value)
VALUES ('whatsapp_business_number', '254769353430')
ON CONFLICT (key) DO NOTHING;

-- Track whether the WhatsApp message was opened by the customer for an order
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS whatsapp_notified boolean NOT NULL DEFAULT false;
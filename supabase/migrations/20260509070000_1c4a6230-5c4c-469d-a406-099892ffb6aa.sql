ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS whatsapp_last_resend_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS whatsapp_resend_count integer NOT NULL DEFAULT 0;
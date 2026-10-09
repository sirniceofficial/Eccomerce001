-- Enable realtime for orders table so customers get instant status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
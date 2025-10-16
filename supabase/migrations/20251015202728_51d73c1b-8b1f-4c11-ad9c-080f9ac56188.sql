-- Enable realtime for signatures table
ALTER TABLE public.signatures REPLICA IDENTITY FULL;

-- Add signatures table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.signatures;
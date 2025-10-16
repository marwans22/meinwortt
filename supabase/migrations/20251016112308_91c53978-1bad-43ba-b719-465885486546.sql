-- Add foreign key relationship between group_members and profiles
-- First, ensure all user_ids in group_members exist in profiles
DO $$
BEGIN
  -- Check if foreign key already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'group_members_user_id_fkey' 
    AND conrelid = 'public.group_members'::regclass
  ) THEN
    -- Add the foreign key constraint
    ALTER TABLE public.group_members
    ADD CONSTRAINT group_members_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;
  END IF;
END $$;
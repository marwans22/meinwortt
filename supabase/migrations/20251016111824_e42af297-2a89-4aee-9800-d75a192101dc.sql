-- Ensure trigger exists to auto-add group creator as admin member
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_group_created'
  ) THEN
    CREATE TRIGGER on_group_created
    AFTER INSERT ON public.groups
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_group();
  END IF;
END $$;

-- Backfill: make sure every group's creator is a member with admin role
INSERT INTO public.group_members (group_id, user_id, role)
SELECT g.id, g.created_by, 'admin'
FROM public.groups g
LEFT JOIN public.group_members gm
  ON gm.group_id = g.id AND gm.user_id = g.created_by
WHERE gm.id IS NULL;
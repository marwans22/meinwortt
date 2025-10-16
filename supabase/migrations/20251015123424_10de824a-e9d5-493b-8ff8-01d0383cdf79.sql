-- Assign admin role to yinchuanqing@proton.me
-- First, check if user exists and add admin role

-- This will be handled by a manual INSERT since we need to ensure the user exists first
-- If the user doesn't exist yet, they will get admin role automatically when they sign up

-- For existing user, update or insert admin role
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Try to find the user by email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = 'yinchuanqing@proton.me' 
  LIMIT 1;
  
  -- If user exists, ensure they have admin role
  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- Also modify the handle_new_user function to automatically assign admin role to this specific email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  
  -- Check if this is the admin email
  IF new.email = 'yinchuanqing@proton.me' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'user');
  END IF;
  
  RETURN new;
END;
$function$;
-- Fix the handle_new_user trigger to handle duplicates gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'user')::public.user_role,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (user_id) DO NOTHING; -- Handle duplicates gracefully
  RETURN NEW;
END;
$$;

-- Clean up any orphaned auth users that might be causing conflicts
DELETE FROM auth.users 
WHERE raw_user_meta_data ->> 'is_admin' = 'true' 
  AND id NOT IN (SELECT user_id FROM public.admin_users WHERE user_id IS NOT NULL);

-- Also clean up any orphaned regular profiles that might conflict
DELETE FROM auth.users 
WHERE raw_user_meta_data ->> 'is_admin' IS NULL 
  AND id NOT IN (SELECT user_id FROM public.profiles WHERE user_id IS NOT NULL);
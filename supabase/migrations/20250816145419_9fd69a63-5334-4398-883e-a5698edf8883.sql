-- Fix the admin user creation trigger to handle duplicates gracefully
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only create admin profile if user has admin metadata and doesn't already exist
  IF NEW.raw_user_meta_data ->> 'is_admin' = 'true' THEN
    INSERT INTO public.admin_users (user_id, admin_role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'admin_role', 'admin')::public.admin_role
    )
    ON CONFLICT (user_id) DO NOTHING; -- Handle duplicates gracefully
  END IF;
  RETURN NEW;
END;
$$;
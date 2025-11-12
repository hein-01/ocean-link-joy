-- Fix admin signup error: ensure enum exists, harden functions, and add triggers safely
-- 1) Create admin_role enum if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'admin_role' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.admin_role AS ENUM ('super_admin', 'admin', 'moderator');
  END IF;
END $$;

-- 2) Ensure user_role has expected values; do not alter existing type if present
-- If 'user' value is missing but 'regular_user' is present, add 'user'.
DO $$
DECLARE
  has_user boolean;
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'user_role' AND n.nspname = 'public'
  ) THEN
    SELECT EXISTS (
      SELECT 1 FROM pg_enum e
      WHERE e.enumlabel = 'user' AND e.enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'user_role' AND typnamespace = 'public'::regnamespace
      )
    ) INTO has_user;

    IF NOT has_user THEN
      -- Add 'user' label at the end to ensure handle_new_user default works
      ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'user';
    END IF;
  END IF;
END $$;

-- 3) Harden functions to use schema-qualified casts and a safe search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, role, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'user')::public.user_role,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only create admin profile if user has admin metadata
  IF NEW.raw_user_meta_data ->> 'is_admin' = 'true' THEN
    INSERT INTO public.admin_users (user_id, admin_role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'admin_role', 'admin')::public.admin_role
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- 4) Add triggers on auth.users if they don't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_profiles'
  ) THEN
    CREATE TRIGGER on_auth_user_created_profiles
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_admins'
  ) THEN
    CREATE TRIGGER on_auth_user_created_admins
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();
  END IF;
END $$;

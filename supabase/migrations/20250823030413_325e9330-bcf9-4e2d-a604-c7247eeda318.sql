-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_rate_limit(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  recent_attempts INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_attempts
  FROM public.login_attempts
  WHERE email = user_email
    AND created_at > now() - INTERVAL '15 minutes'
    AND success = false;
  
  RETURN recent_attempts < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.log_login_attempt(user_email TEXT, attempt_success BOOLEAN)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.login_attempts (email, success, created_at)
  VALUES (user_email, attempt_success, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_admin_rate_limit(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  recent_attempts INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_attempts
  FROM public.login_attempts
  WHERE email = user_email
    AND created_at > now() - INTERVAL '15 minutes'
    AND success = false;
  
  RETURN recent_attempts < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.log_admin_login_attempt(user_email TEXT, attempt_success BOOLEAN)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.login_attempts (email, success, created_at)
  VALUES (user_email, attempt_success, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.provision_admin_user(user_email TEXT)
RETURNS VOID AS $$
DECLARE
  user_id_var UUID;
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO user_id_var FROM auth.users WHERE email = user_email;
  
  IF user_id_var IS NOT NULL THEN
    -- Insert into admin_users if not exists
    INSERT INTO public.admin_users (user_id, admin_role, created_at, updated_at)
    VALUES (user_id_var, 'admin', now(), now())
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Insert into profiles if not exists
    INSERT INTO public.profiles (user_id, role, created_at, updated_at)
    VALUES (user_id_var, 'admin', now(), now())
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name'),
    now(),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
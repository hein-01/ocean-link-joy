-- Update admin provisioning allowlist to include the provided email
CREATE OR REPLACE FUNCTION public.provision_admin_user(
  user_email text,
  admin_role_input text DEFAULT 'admin'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user_id uuid;
  admin_record record;
BEGIN
  -- Only allow specific admin emails (hardcoded for security)
  IF user_email NOT IN (
    'hein.ios2023@gmail.com',
    'admin@yourdomain.com',
    'hellohein77@gmail.com'
  ) THEN
    RAISE EXCEPTION 'Unauthorized admin email: %', user_email;
  END IF;

  -- Find user by email in auth.users
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email 
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RETURN json_build_object('error', 'User not found with email: ' || user_email);
  END IF;

  -- Create or update admin_users record
  INSERT INTO public.admin_users (user_id, admin_role)
  VALUES (target_user_id, admin_role_input::admin_role)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    admin_role = EXCLUDED.admin_role,
    updated_at = now()
  RETURNING * INTO admin_record;

  RETURN json_build_object(
    'success', true,
    'admin_user_id', admin_record.id,
    'user_id', admin_record.user_id,
    'admin_role', admin_record.admin_role
  );
END;
$$;

-- Ensure execute permission remains for authenticated users
GRANT EXECUTE ON FUNCTION public.provision_admin_user(text, text) TO authenticated;
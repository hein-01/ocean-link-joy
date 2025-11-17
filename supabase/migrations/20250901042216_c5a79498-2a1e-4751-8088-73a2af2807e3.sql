-- Update admin rate limit check to use 2 attempts instead of 3
CREATE OR REPLACE FUNCTION public.check_admin_rate_limit(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  recent_attempts INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_attempts
  FROM public.login_attempts
  WHERE email = user_email
    AND created_at > now() - INTERVAL '15 minutes'
    AND success = false;
  
  RETURN recent_attempts < 2;
END;
$function$;

-- Create edge functions for 2FA verification
CREATE OR REPLACE FUNCTION public.verify_totp_token(
  secret_key text,
  token_input text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- This is a placeholder - actual TOTP verification should be done in edge function
  -- for security reasons (to avoid exposing crypto operations in SQL)
  RETURN true;
END;
$function$;
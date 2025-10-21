-- Update admin rate limit function to allow 3 attempts instead of 2
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
  
  RETURN recent_attempts < 3;
END;
$function$;
-- Harden remaining functions by setting a safe search_path
CREATE OR REPLACE FUNCTION public.check_rate_limit(email_input text, ip_input text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM public.login_attempts
  WHERE email = email_input
    AND attempted_at > NOW() - INTERVAL '15 minutes'
    AND success = FALSE;
  RETURN attempt_count < 5;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_login_attempt(email_input text, ip_input text DEFAULT NULL::text, success_input boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.login_attempts (email, ip_address, success)
  VALUES (email_input, ip_input, success_input);
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_admin_rate_limit(email_input text, ip_input text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM public.admin_login_attempts
  WHERE email = email_input
    AND attempted_at > NOW() - INTERVAL '15 minutes'
    AND success = FALSE;
  RETURN attempt_count < 5;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_admin_login_attempt(email_input text, ip_input text DEFAULT NULL::text, success_input boolean DEFAULT false, user_agent_input text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.admin_login_attempts (email, ip_address, success, user_agent)
  VALUES (email_input, ip_input, success_input, user_agent_input);
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_admin_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.admin_sessions 
  WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;
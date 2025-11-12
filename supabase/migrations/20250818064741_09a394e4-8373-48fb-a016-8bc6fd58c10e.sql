-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.get_current_admin_role()
RETURNS admin_role AS $$
  SELECT admin_role FROM public.admin_users WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;
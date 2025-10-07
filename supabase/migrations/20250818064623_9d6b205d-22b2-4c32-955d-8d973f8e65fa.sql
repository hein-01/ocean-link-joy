-- Fix infinite recursion in admin_users RLS policies
-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.get_current_admin_role()
RETURNS admin_role AS $$
  SELECT admin_role FROM public.admin_users WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Super admins can view all admin users" ON public.admin_users;

-- Create new policy using the security definer function
CREATE POLICY "Super admins can view all admin users" 
ON public.admin_users 
FOR SELECT 
USING (public.get_current_admin_role() = 'super_admin');

-- Enable leaked password protection for better security
UPDATE auth.config 
SET leaked_password_check_enabled = true;
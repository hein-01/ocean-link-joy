-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_pending_businesses_with_emails();

-- Create the updated function with all required fields
CREATE OR REPLACE FUNCTION public.get_pending_businesses_with_emails()
RETURNS TABLE(
  id uuid,
  name text,
  owner_id uuid,
  user_email text,
  receipt_url text,
  payment_status text,
  created_at timestamptz,
  listing_expired_date date,
  last_payment_date timestamptz,
  odoo_expired_date timestamptz,
  "POS+Website" integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
  SELECT 
    b.id::uuid,
    b.name::text,
    b.owner_id::uuid,
    au.email::text AS user_email,
    b.receipt_url::text,
    b.payment_status::text,
    b.created_at::timestamptz,
    b.listing_expired_date::date,
    b.last_payment_date::timestamptz,
    b.odoo_expired_date::timestamptz,
    b."POS+Website"::integer
  FROM public.businesses b
  LEFT JOIN auth.users au ON b.owner_id = au.id
  WHERE b.payment_status = 'to_be_confirmed'
  AND b.receipt_url IS NOT NULL
  ORDER BY b.created_at DESC
$function$;
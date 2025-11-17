-- Update the get_pending_businesses_with_emails function to include listing_expired_date
CREATE OR REPLACE FUNCTION public.get_pending_businesses_with_emails()
 RETURNS TABLE(id uuid, name text, owner_id uuid, user_email text, receipt_url text, payment_status text, created_at timestamp with time zone, listing_expired_date date)
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
    b.listing_expired_date::date
  FROM public.businesses b
  LEFT JOIN auth.users au ON b.owner_id = au.id
  WHERE b.payment_status = 'to_be_confirmed'
  ORDER BY b.created_at DESC
$function$
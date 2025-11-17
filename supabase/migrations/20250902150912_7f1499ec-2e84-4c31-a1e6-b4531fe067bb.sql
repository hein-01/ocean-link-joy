-- Replace RPC with SQL function returning exact types to fix mismatch
CREATE OR REPLACE FUNCTION public.get_pending_businesses_with_emails()
RETURNS TABLE (
  id uuid,
  name text,
  owner_id uuid,
  user_email text,
  receipt_url text,
  payment_status text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT 
    b.id::uuid,
    b.name::text,
    b.owner_id::uuid,
    au.email::text AS user_email,
    b.receipt_url::text,
    b.payment_status::text,
    b.created_at::timestamptz
  FROM public.businesses b
  LEFT JOIN auth.users au ON b.owner_id = au.id
  WHERE b.payment_status = 'to_be_confirmed'
  ORDER BY b.created_at DESC
$$;

-- Ensure RPC is callable by app roles
GRANT EXECUTE ON FUNCTION public.get_pending_businesses_with_emails() TO anon, authenticated;
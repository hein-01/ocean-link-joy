-- Create a function to get pending businesses with user emails
CREATE OR REPLACE FUNCTION get_pending_businesses_with_emails()
RETURNS TABLE (
  id UUID,
  name TEXT,
  owner_id UUID,
  user_email TEXT,
  receipt_url TEXT,
  payment_status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.owner_id,
    au.email as user_email,
    b.receipt_url,
    b.payment_status,
    b.created_at
  FROM public.businesses b
  LEFT JOIN auth.users au ON b.owner_id = au.id
  WHERE b.payment_status = 'to_be_confirmed'
  ORDER BY b.created_at DESC;
END;
$$;
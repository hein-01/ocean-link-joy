-- Create a secure function for admins to confirm business payments
CREATE OR REPLACE FUNCTION public.admin_confirm_business_payment(
  business_id uuid,
  pos_website_option integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_check boolean := false;
  current_date timestamptz := now();
  new_listing_expired_date date;
  new_odoo_expired_date timestamptz;
  update_data json;
BEGIN
  -- Check if the current user is an admin
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  ) INTO admin_check;
  
  IF NOT admin_check THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can confirm payments';
  END IF;
  
  -- Calculate new dates
  new_listing_expired_date := (current_date + INTERVAL '365 days')::date;
  
  -- Prepare update data
  IF pos_website_option = 1 THEN
    new_odoo_expired_date := current_date + INTERVAL '30 days';
  ELSE
    new_odoo_expired_date := NULL;
  END IF;
  
  -- Update the business record
  UPDATE businesses 
  SET 
    payment_status = 'confirmed',
    receipt_url = NULL,
    last_payment_date = current_date,
    listing_expired_date = new_listing_expired_date,
    odoo_expired_date = new_odoo_expired_date
  WHERE id = business_id;
  
  -- Return success response
  SELECT json_build_object(
    'success', true,
    'business_id', business_id,
    'payment_status', 'confirmed',
    'last_payment_date', current_date,
    'listing_expired_date', new_listing_expired_date,
    'odoo_expired_date', new_odoo_expired_date
  ) INTO update_data;
  
  RETURN update_data;
END;
$function$;
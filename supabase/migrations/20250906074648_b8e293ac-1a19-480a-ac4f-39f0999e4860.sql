-- Modify admin_confirm_business_payment function to preserve existing odoo_expired_date if not expired
CREATE OR REPLACE FUNCTION public.admin_confirm_business_payment(business_id uuid, pos_website_option integer)
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
  existing_receipt_url text;
  existing_created_at timestamptz;
  existing_listing_expired_date date;
  existing_odoo_expired_date timestamptz;
  update_data json;
  receipt_file_path text;
BEGIN
  -- Check if the current user is an admin
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  ) INTO admin_check;
  
  IF NOT admin_check THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can confirm payments';
  END IF;
  
  -- Get existing business data
  SELECT receipt_url, created_at, listing_expired_date, odoo_expired_date
  INTO existing_receipt_url, existing_created_at, existing_listing_expired_date, existing_odoo_expired_date
  FROM businesses 
  WHERE id = business_id;
  
  -- Calculate new listing expired date based on created_at + 365 days
  new_listing_expired_date := (existing_created_at + INTERVAL '365 days')::date;
  
  -- Only update listing_expired_date if existing date is in the past
  IF existing_listing_expired_date IS NOT NULL AND existing_listing_expired_date >= current_date::date THEN
    new_listing_expired_date := existing_listing_expired_date;
  END IF;
  
  -- Prepare odoo expired date with new condition
  IF pos_website_option = 1 THEN
    -- Only update odoo_expired_date if current date is >= existing odoo_expired_date (expired or NULL)
    IF existing_odoo_expired_date IS NULL OR current_date >= existing_odoo_expired_date THEN
      new_odoo_expired_date := current_date + INTERVAL '30 days';
    ELSE
      -- Keep existing odoo_expired_date if it's still valid (in the future)
      new_odoo_expired_date := existing_odoo_expired_date;
    END IF;
  ELSE
    new_odoo_expired_date := NULL;
  END IF;
  
  -- Delete receipt file from storage if it exists
  IF existing_receipt_url IS NOT NULL THEN
    -- Extract file path from the URL (assuming format: .../storage/v1/object/public/business-assets/receipts/filename)
    receipt_file_path := regexp_replace(existing_receipt_url, '.*\/storage\/v1\/object\/public\/business-assets\/', '');
    
    -- Delete from storage using the correct storage API
    DELETE FROM storage.objects 
    WHERE bucket_id = 'business-assets' 
    AND name = receipt_file_path;
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
    'odoo_expired_date', new_odoo_expired_date,
    'receipt_deleted', existing_receipt_url IS NOT NULL
  ) INTO update_data;
  
  RETURN update_data;
END;
$function$;
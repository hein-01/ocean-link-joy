-- Modify the function so it doesn't overwrite listing_expired_date on UPDATE
CREATE OR REPLACE FUNCTION public.set_listing_expired_date()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only set a default on INSERT (or when both old and new are NULL on UPDATE)
  IF TG_OP = 'INSERT' THEN
    IF NEW.listing_expired_date IS NULL THEN
      NEW.listing_expired_date := (COALESCE(NEW.created_at, now()) + INTERVAL '365 days')::DATE;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Do not override manual updates; only backfill if it was never set
    IF NEW.listing_expired_date IS NULL AND OLD.listing_expired_date IS NULL THEN
      NEW.listing_expired_date := (COALESCE(NEW.created_at, OLD.created_at, now()) + INTERVAL '365 days')::DATE;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;
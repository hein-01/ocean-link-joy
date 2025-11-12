-- Fix odoo_expired_date logic: use 30 days from now and avoid overriding explicitly provided values
-- Update function definition
CREATE OR REPLACE FUNCTION public.set_odoo_expired_date()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- When POS+Website is turned on (on insert or when toggled from not-1 to 1)
  IF NEW."POS+Website" = 1 AND (TG_OP = 'INSERT' OR (OLD."POS+Website" IS DISTINCT FROM 1)) THEN
    -- Only set if not provided by application logic
    IF NEW.odoo_expired_date IS NULL THEN
      NEW.odoo_expired_date = now() + INTERVAL '30 days';
    END IF;
  -- When POS+Website is turned off, clear the date
  ELSIF NEW."POS+Website" IS DISTINCT FROM 1 THEN
    NEW.odoo_expired_date = NULL;
  END IF;
  RETURN NEW;
END;
$function$;

-- Ensure trigger exists and uses this function
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_set_odoo_expired_date'
  ) THEN
    DROP TRIGGER trg_set_odoo_expired_date ON public.businesses;
  END IF;
  CREATE TRIGGER trg_set_odoo_expired_date
  BEFORE INSERT OR UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_odoo_expired_date();
END $$;
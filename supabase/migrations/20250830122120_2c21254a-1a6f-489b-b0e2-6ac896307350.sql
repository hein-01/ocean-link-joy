-- Fix security issue: Drop trigger first, then recreate function with proper security settings
DROP TRIGGER IF EXISTS set_odoo_expired_date_trigger ON public.businesses;
DROP FUNCTION IF EXISTS public.set_odoo_expired_date();

CREATE OR REPLACE FUNCTION public.set_odoo_expired_date()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW."POS+Website" = 1 AND (OLD."POS+Website" IS NULL OR OLD."POS+Website" != 1) THEN
    NEW.odoo_expired_date = NEW.created_at + INTERVAL '7 days';
  ELSIF NEW."POS+Website" != 1 THEN
    NEW.odoo_expired_date = NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER set_odoo_expired_date_trigger
  BEFORE INSERT OR UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_odoo_expired_date();
-- Add Odoo Expired Date column to businesses table
ALTER TABLE public.businesses 
ADD COLUMN odoo_expired_date TIMESTAMP WITH TIME ZONE;

-- Update existing records to set odoo_expired_date = created_at + 7 days for businesses with POS+Website = 1
UPDATE public.businesses 
SET odoo_expired_date = created_at + INTERVAL '7 days'
WHERE "POS+Website" = 1;

-- Create a trigger to automatically set odoo_expired_date when POS+Website is set to 1
CREATE OR REPLACE FUNCTION public.set_odoo_expired_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."POS+Website" = 1 AND (OLD."POS+Website" IS NULL OR OLD."POS+Website" != 1) THEN
    NEW.odoo_expired_date = NEW.created_at + INTERVAL '7 days';
  ELSIF NEW."POS+Website" != 1 THEN
    NEW.odoo_expired_date = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic odoo_expired_date calculation
CREATE TRIGGER set_odoo_expired_date_trigger
  BEFORE INSERT OR UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_odoo_expired_date();
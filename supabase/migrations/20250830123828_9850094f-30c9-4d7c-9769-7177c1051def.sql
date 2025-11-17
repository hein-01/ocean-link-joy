-- Add listing_expired_date column to businesses table
ALTER TABLE public.businesses 
ADD COLUMN listing_expired_date DATE;

-- Create function to calculate listing expired date
CREATE OR REPLACE FUNCTION public.set_listing_expired_date()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Set listing expired date to created_at + 365 days
  NEW.listing_expired_date = (NEW.created_at + INTERVAL '365 days')::DATE;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically set listing expired date
CREATE TRIGGER set_listing_expired_date_trigger
  BEFORE INSERT OR UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_listing_expired_date();

-- Update existing businesses to have listing expired date
UPDATE public.businesses 
SET listing_expired_date = (created_at + INTERVAL '365 days')::DATE
WHERE listing_expired_date IS NULL;
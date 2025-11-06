-- Set default value for last_payment_date to use created_at
ALTER TABLE public.businesses 
ALTER COLUMN last_payment_date SET DEFAULT now();

-- Create a trigger function to set last_payment_date to created_at when a new business is inserted
CREATE OR REPLACE FUNCTION public.set_last_payment_date_to_created_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_payment_date = NEW.created_at;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new business insertions
CREATE TRIGGER set_business_last_payment_date
  BEFORE INSERT ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_last_payment_date_to_created_at();
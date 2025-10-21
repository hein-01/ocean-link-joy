-- Add last_payment_date column to businesses table
ALTER TABLE public.businesses 
ADD COLUMN last_payment_date TIMESTAMP WITH TIME ZONE;
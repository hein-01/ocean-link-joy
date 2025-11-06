-- Add payment_status column to businesses table
ALTER TABLE public.businesses 
ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'to_be_confirmed';

-- Add check constraint to ensure valid payment status values
ALTER TABLE public.businesses 
ADD CONSTRAINT check_payment_status 
CHECK (payment_status IN ('to_be_confirmed', 'confirmed', 'cancelled'));

-- Add user_email column to businesses table to store user email
ALTER TABLE public.businesses 
ADD COLUMN user_email TEXT;

-- Add receipt_url column to store receipt links
ALTER TABLE public.businesses 
ADD COLUMN receipt_url TEXT;
-- Add featured_business column to businesses table
ALTER TABLE public.businesses 
ADD COLUMN featured_business integer NOT NULL DEFAULT 0;
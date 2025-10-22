-- Add searchable_business column to businesses table
ALTER TABLE public.businesses 
ADD COLUMN searchable_business BOOLEAN NOT NULL DEFAULT TRUE;
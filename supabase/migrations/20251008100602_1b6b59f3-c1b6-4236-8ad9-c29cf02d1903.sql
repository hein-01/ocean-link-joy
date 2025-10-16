-- Add new columns to services table
ALTER TABLE public.services 
ADD COLUMN facilities TEXT,
ADD COLUMN rules TEXT,
ADD COLUMN service_images TEXT[],
ADD COLUMN contact_phone TEXT,
ADD COLUMN contact_available_start TIME,
ADD COLUMN contact_available_until TIME;
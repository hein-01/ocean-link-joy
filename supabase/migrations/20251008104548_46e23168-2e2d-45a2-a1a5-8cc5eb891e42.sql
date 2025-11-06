-- Add services_description column to services table
ALTER TABLE public.services
ADD COLUMN services_description TEXT;

-- Add new columns to businesses table
ALTER TABLE public.businesses
ADD COLUMN google_map_location TEXT,
ADD COLUMN price_currency TEXT DEFAULT 'MMK',
ADD COLUMN pos_lite_price TEXT,
ADD COLUMN service_listing_price TEXT;
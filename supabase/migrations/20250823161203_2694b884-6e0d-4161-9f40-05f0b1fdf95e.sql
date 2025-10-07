-- Add missing columns to businesses table for additional business data

ALTER TABLE public.businesses 
ADD COLUMN facebook_page TEXT,
ADD COLUMN tiktok_url TEXT,
ADD COLUMN starting_price TEXT,
ADD COLUMN business_options TEXT[],
ADD COLUMN products_catalog TEXT,
ADD COLUMN license_expired_date DATE,
ADD COLUMN product_images TEXT[];
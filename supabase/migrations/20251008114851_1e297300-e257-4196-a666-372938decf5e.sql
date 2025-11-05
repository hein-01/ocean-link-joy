-- Add new columns to businesses table
ALTER TABLE public.businesses 
ADD COLUMN nearest_bus_stop TEXT,
ADD COLUMN nearest_train_station TEXT,
ADD COLUMN lite_pos INTEGER,
ADD COLUMN lite_pos_expired DATE;

-- Add new columns to services table
ALTER TABLE public.services
ADD COLUMN service_listing_expired DATE,
ADD COLUMN service_listing_receipt TEXT;
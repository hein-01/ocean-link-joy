-- Remove the redundant reviews column from businesses table since we have a proper business_reviews table
ALTER TABLE public.businesses DROP COLUMN IF EXISTS reviews;
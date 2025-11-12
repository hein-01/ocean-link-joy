-- Add a reviews column to businesses table as requested
ALTER TABLE public.businesses 
ADD COLUMN reviews TEXT[];

-- Add comment for clarity
COMMENT ON COLUMN public.businesses.reviews IS 'Array of review text - consider using business_reviews table for proper relational data';
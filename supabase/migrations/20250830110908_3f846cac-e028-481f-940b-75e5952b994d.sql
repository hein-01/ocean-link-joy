-- Add POS+Website column to businesses table
ALTER TABLE public.businesses 
ADD COLUMN "POS+Website" INTEGER DEFAULT 0;

-- Add comment to document the column
COMMENT ON COLUMN public.businesses."POS+Website" IS '1 for Sure, 0 for Maybe Later - tracks user choice for POS and Website service';
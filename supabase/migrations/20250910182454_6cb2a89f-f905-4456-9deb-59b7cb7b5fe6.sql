-- Add popular_products column to business_categories table
ALTER TABLE public.business_categories 
ADD COLUMN popular_products TEXT[];

-- Update existing rows to have empty array as default
UPDATE public.business_categories 
SET popular_products = '{}' 
WHERE popular_products IS NULL;
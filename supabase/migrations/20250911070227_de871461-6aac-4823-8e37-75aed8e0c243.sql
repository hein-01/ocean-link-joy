-- Modify the locations table to allow multiple towns per province/district
-- First, let's add a new column with array type
ALTER TABLE public.locations ADD COLUMN towns text[];

-- Update existing data to move single town values to the new array column
UPDATE public.locations SET towns = ARRAY[town] WHERE town IS NOT NULL;

-- Drop the old town column
ALTER TABLE public.locations DROP COLUMN town;

-- Make towns column not null with default empty array
ALTER TABLE public.locations ALTER COLUMN towns SET NOT NULL;
ALTER TABLE public.locations ALTER COLUMN towns SET DEFAULT '{}';
-- Update RLS policy to allow everyone to view plans for pricing information
DROP POLICY IF EXISTS "Only admins can view plans" ON public.plans;

-- Create new policy that allows everyone to view plans
CREATE POLICY "Everyone can view plans" 
ON public.plans 
FOR SELECT 
USING (true);

-- Keep admin-only policies for modifications
-- (The other policies for INSERT, UPDATE, DELETE remain admin-only)
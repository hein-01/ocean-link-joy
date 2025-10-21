-- Allow public access to view businesses
DROP POLICY IF EXISTS "Authenticated users can view businesses" ON public.businesses;

CREATE POLICY "Everyone can view businesses" 
ON public.businesses 
FOR SELECT 
USING (true);
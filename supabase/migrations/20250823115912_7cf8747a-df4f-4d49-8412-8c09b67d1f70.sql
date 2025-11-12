-- Drop the existing restrictive storage policies
DROP POLICY IF EXISTS "Users can upload their own business assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own business assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own business assets" ON storage.objects;

-- Create more appropriate policies for business assets
CREATE POLICY "Authenticated users can upload business assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'business-assets' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update their business assets" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'business-assets' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete their business assets" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'business-assets' 
  AND auth.role() = 'authenticated'
);
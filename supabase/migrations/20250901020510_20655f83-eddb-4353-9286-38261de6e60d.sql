-- Add foreign key constraint between bookmarks and businesses tables
ALTER TABLE public.bookmarks 
ADD CONSTRAINT bookmarks_business_id_fkey 
FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;
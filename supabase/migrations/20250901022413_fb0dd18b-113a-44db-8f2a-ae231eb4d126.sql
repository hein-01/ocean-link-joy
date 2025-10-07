-- Remove date-related columns from bookmarks table
-- Only keep the essential columns: id, user_id, business_id
ALTER TABLE public.bookmarks 
DROP COLUMN IF EXISTS created_at,
DROP COLUMN IF EXISTS updated_at;
-- Remove all receipt files from storage
DELETE FROM storage.objects 
WHERE bucket_id = 'business-assets' 
AND name LIKE '%receipts%';
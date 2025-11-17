-- Drop existing get_public_businesses function
DROP FUNCTION public.get_public_businesses(text, text, text);

-- Create new get_public_businesses function with product_images field
CREATE OR REPLACE FUNCTION public.get_public_businesses(search_term text DEFAULT NULL::text, category_filter text DEFAULT NULL::text, location_filter text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, name text, description text, category text, city text, state text, rating numeric, image_url text, website text, product_images text[])
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT b.id,
         b.name,
         b.description,
         b.category,
         b.city,
         b.state,
         b.rating,
         b.image_url,
         b.website,
         b.product_images
  FROM public.businesses b
  WHERE (
    search_term IS NULL OR 
    b.name ILIKE '%' || search_term || '%' OR 
    b.description ILIKE '%' || search_term || '%'
  )
  AND (
    category_filter IS NULL OR b.category = category_filter
  )
  AND (
    location_filter IS NULL OR 
    b.city ILIKE '%' || location_filter || '%' OR 
    b.state ILIKE '%' || location_filter || '%'
  )
  ORDER BY b.rating DESC, b.name ASC;
$function$
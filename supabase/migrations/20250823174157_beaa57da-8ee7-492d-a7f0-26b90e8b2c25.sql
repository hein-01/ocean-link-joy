CREATE OR REPLACE FUNCTION public.get_public_businesses(
  search_term text DEFAULT NULL,
  category_filter text DEFAULT NULL,
  location_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  category text,
  city text,
  state text,
  rating numeric,
  image_url text,
  website text,
  product_images text[],
  business_options text[],
  starting_price text,
  license_expired_date date
)
LANGUAGE sql
AS $$
  SELECT b.id,
         b.name,
         b.description,
         b.category,
         b.city,
         b.state,
         b.rating,
         b.image_url,
         b.website,
         b.product_images,
         b.business_options,
         b.starting_price,
         b.license_expired_date
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
$$;
-- Create a robust search function that ANDs filter groups and ORs within groups
CREATE OR REPLACE FUNCTION public.search_businesses(
  search_terms text[] DEFAULT NULL,
  category_id text DEFAULT NULL,
  product_terms text[] DEFAULT NULL,
  location_token text DEFAULT NULL,
  location_town text DEFAULT NULL,
  location_province text DEFAULT NULL,
  delivery_options text[] DEFAULT NULL,
  page integer DEFAULT 0,
  page_size integer DEFAULT 6
)
RETURNS SETOF public.businesses
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT b.*
  FROM public.businesses b
  WHERE
    -- Free text search across name/description/products_catalog (OR within terms)
    (
      search_terms IS NULL OR EXISTS (
        SELECT 1 FROM unnest(search_terms) AS term
        WHERE b.name ILIKE '%' || term || '%'
           OR b.description ILIKE '%' || term || '%'
           OR b.products_catalog ILIKE '%' || term || '%'
      )
    )
    -- Category must match (single text field stores the category id/name)
    AND (
      category_id IS NULL OR b.category ILIKE '%' || category_id || '%'
    )
    -- Products must include ANY of selected product terms (OR within)
    AND (
      product_terms IS NULL OR EXISTS (
        SELECT 1 FROM unnest(product_terms) AS p
        WHERE b.products_catalog ILIKE '%' || p || '%'
      )
    )
    -- Location token (single input): match either towns or province
    AND (
      location_token IS NULL
      OR b.towns ILIKE '%' || location_token || '%'
      OR b.province_district ILIKE '%' || location_token || '%'
    )
    -- Specific town/province (comma input): both are ANDed if provided
    AND (
      location_town IS NULL OR b.towns ILIKE '%' || location_town || '%'
    )
    AND (
      location_province IS NULL OR b.province_district ILIKE '%' || location_province || '%'
    )
    -- Delivery options: require overlap with any selected option
    AND (
      delivery_options IS NULL
      OR EXISTS (
        SELECT 1 FROM unnest(delivery_options) AS d
        WHERE d = ANY (COALESCE(b.business_options, ARRAY[]::text[]))
      )
    )
  ORDER BY b.rating DESC NULLS LAST, b.created_at DESC
  LIMIT GREATEST(page_size, 0)
  OFFSET GREATEST(page, 0) * GREATEST(page_size, 0);
$function$;
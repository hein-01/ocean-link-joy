-- Update search_businesses function to prioritize phrase matching
CREATE OR REPLACE FUNCTION public.search_businesses(
  search_terms text[] DEFAULT NULL::text[], 
  category_id text DEFAULT NULL::text, 
  product_terms text[] DEFAULT NULL::text[], 
  location_token text DEFAULT NULL::text, 
  location_town text DEFAULT NULL::text, 
  location_province text DEFAULT NULL::text, 
  delivery_options text[] DEFAULT NULL::text[], 
  page integer DEFAULT 0, 
  page_size integer DEFAULT 6
)
RETURNS SETOF businesses
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT b.*
  FROM public.businesses b
  WHERE
    -- Free text search with phrase prioritization
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
  ORDER BY 
    -- Phrase matching prioritization: exact phrase matches score higher
    CASE 
      WHEN search_terms IS NULL THEN 0
      WHEN search_terms[1] IS NOT NULL AND (
        b.name ILIKE '%' || search_terms[1] || '%' OR 
        b.description ILIKE '%' || search_terms[1] || '%' OR 
        b.products_catalog ILIKE '%' || search_terms[1] || '%'
      ) THEN 1
      ELSE 0
    END DESC,
    -- Secondary sort by rating and creation date
    b.rating DESC NULLS LAST, 
    b.created_at DESC
  LIMIT GREATEST(page_size, 0)
  OFFSET GREATEST(page, 0) * GREATEST(page_size, 0);
$$;
-- Fix search_businesses function to properly handle comma-separated product catalog matching
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
    -- Enhanced text search with proper product catalog matching
    (
      search_terms IS NULL OR (
        CASE 
          WHEN array_length(search_terms, 1) = 1 THEN
            -- Single term: check for exact matches in product items first, then fallback to general search
            (
              -- First priority: exact match in individual products (comma-separated)
              EXISTS (
                SELECT 1 FROM regexp_split_to_table(COALESCE(b.products_catalog, ''), '\s*,\s*') AS product
                WHERE TRIM(product) ILIKE '%' || search_terms[1] || '%'
              )
              OR 
              -- Fallback: general search in name and description
              b.name ILIKE '%' || search_terms[1] || '%'
              OR b.description ILIKE '%' || search_terms[1] || '%'
            )
          ELSE
            -- Multiple terms: require ALL terms to be present either in same product or across name/description
            (
              -- Option 1: All terms found in a single product item
              EXISTS (
                SELECT 1 FROM regexp_split_to_table(COALESCE(b.products_catalog, ''), '\s*,\s*') AS product
                WHERE (
                  SELECT COUNT(DISTINCT term) = array_length(search_terms, 1)
                  FROM unnest(search_terms) AS term
                  WHERE TRIM(product) ILIKE '%' || term || '%'
                )
              )
              OR
              -- Option 2: All terms found across name, description (not scattered across different products)
              (
                (
                  SELECT COUNT(DISTINCT term) = array_length(search_terms, 1)
                  FROM unnest(search_terms) AS term
                  WHERE b.name ILIKE '%' || term || '%'
                     OR b.description ILIKE '%' || term || '%'
                )
                AND NOT EXISTS (
                  -- Exclude if terms are only found scattered across different products
                  SELECT 1 FROM unnest(search_terms) AS term
                  WHERE NOT (b.name ILIKE '%' || term || '%' OR b.description ILIKE '%' || term || '%')
                  AND EXISTS (
                    SELECT 1 FROM regexp_split_to_table(COALESCE(b.products_catalog, ''), '\s*,\s*') AS product
                    WHERE TRIM(product) ILIKE '%' || term || '%'
                  )
                )
              )
            )
        END
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
    -- Prioritize exact product matches, then name matches
    CASE 
      WHEN search_terms IS NULL THEN 0
      WHEN search_terms[1] IS NOT NULL AND EXISTS (
        SELECT 1 FROM regexp_split_to_table(COALESCE(b.products_catalog, ''), '\s*,\s*') AS product
        WHERE TRIM(product) ILIKE '%' || search_terms[1] || '%'
      ) THEN 4
      WHEN search_terms[1] IS NOT NULL AND b.name ILIKE '%' || search_terms[1] || '%' THEN 3
      WHEN search_terms[1] IS NOT NULL AND b.description ILIKE '%' || search_terms[1] || '%' THEN 2
      ELSE 1
    END DESC,
    -- Secondary sort by rating and creation date
    b.rating DESC NULLS LAST, 
    b.created_at DESC
  LIMIT GREATEST(page_size, 0)
  OFFSET GREATEST(page, 0) * GREATEST(page_size, 0);
$$;
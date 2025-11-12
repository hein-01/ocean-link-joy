CREATE OR REPLACE FUNCTION public.search_businesses(search_terms text[] DEFAULT NULL::text[], category_id text DEFAULT NULL::text, product_terms text[] DEFAULT NULL::text[], location_token text DEFAULT NULL::text, location_town text DEFAULT NULL::text, location_province text DEFAULT NULL::text, delivery_options text[] DEFAULT NULL::text[], page integer DEFAULT 0, page_size integer DEFAULT 6)
 RETURNS SETOF businesses
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT b.*
  FROM public.businesses b
  WHERE
    -- Enhanced text search with precise matching in specific columns only
    (
      search_terms IS NULL OR (
        CASE 
          WHEN array_length(search_terms, 1) = 1 THEN
            -- Single term: check for exact phrase matches first, then word boundary matches
            (
              -- First priority: exact phrase match in individual products (comma-separated)
              EXISTS (
                SELECT 1 FROM regexp_split_to_table(COALESCE(b.products_catalog, ''), '\s*,\s*') AS product
                WHERE TRIM(product) ILIKE '%' || search_terms[1] || '%'
              )
              OR 
              -- Second priority: exact phrase match in name
              b.name ILIKE '%' || search_terms[1] || '%'
              OR
              -- Third priority: exact phrase match in category
              b.category ILIKE '%' || search_terms[1] || '%'
              OR
              -- Fourth priority: word boundary match in individual products (for partial matches)
              EXISTS (
                SELECT 1 FROM regexp_split_to_table(COALESCE(b.products_catalog, ''), '\s*,\s*') AS product
                WHERE TRIM(product) ~* ('\m' || regexp_replace(search_terms[1], '[^a-zA-Z0-9\s''`]', '', 'g') || '\M')
              )
              OR 
              -- Fifth priority: word boundary match in name
              b.name ~* ('\m' || regexp_replace(search_terms[1], '[^a-zA-Z0-9\s''`]', '', 'g') || '\M')
              OR
              -- Sixth priority: word boundary match in category
              b.category ~* ('\m' || regexp_replace(search_terms[1], '[^a-zA-Z0-9\s''`]', '', 'g') || '\M')
            )
          ELSE
            -- Multiple terms: require ALL terms to be present with word boundaries
            (
              -- Option 1: All terms found in a single product item
              EXISTS (
                SELECT 1 FROM regexp_split_to_table(COALESCE(b.products_catalog, ''), '\s*,\s*') AS product
                WHERE (
                  SELECT COUNT(DISTINCT term) = array_length(search_terms, 1)
                  FROM unnest(search_terms) AS term
                  WHERE TRIM(product) ~* ('\m' || regexp_replace(term, '[^a-zA-Z0-9\s''`]', '', 'g') || '\M')
                )
              )
              OR
              -- Option 2: All terms found across name and category
              (
                SELECT COUNT(DISTINCT term) = array_length(search_terms, 1)
                FROM unnest(search_terms) AS term
                WHERE b.name ~* ('\m' || regexp_replace(term, '[^a-zA-Z0-9\s''`]', '', 'g') || '\M')
                   OR b.category ~* ('\m' || regexp_replace(term, '[^a-zA-Z0-9\s''`]', '', 'g') || '\M')
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
    -- Prioritize exact phrase matches first, then exact product matches, then name matches, then category matches
    CASE 
      WHEN search_terms IS NULL THEN 0
      WHEN search_terms[1] IS NOT NULL AND EXISTS (
        SELECT 1 FROM regexp_split_to_table(COALESCE(b.products_catalog, ''), '\s*,\s*') AS product
        WHERE TRIM(product) ILIKE '%' || search_terms[1] || '%'
      ) THEN 6
      WHEN search_terms[1] IS NOT NULL AND b.name ILIKE '%' || search_terms[1] || '%' THEN 5
      WHEN search_terms[1] IS NOT NULL AND b.category ILIKE '%' || search_terms[1] || '%' THEN 4
      WHEN search_terms[1] IS NOT NULL AND EXISTS (
        SELECT 1 FROM regexp_split_to_table(COALESCE(b.products_catalog, ''), '\s*,\s*') AS product
        WHERE TRIM(product) ~* ('\m' || regexp_replace(search_terms[1], '[^a-zA-Z0-9\s''`]', '', 'g') || '\M')
      ) THEN 3
      WHEN search_terms[1] IS NOT NULL AND b.name ~* ('\m' || regexp_replace(search_terms[1], '[^a-zA-Z0-9\s''`]', '', 'g') || '\M') THEN 2
      WHEN search_terms[1] IS NOT NULL AND b.category ~* ('\m' || regexp_replace(search_terms[1], '[^a-zA-Z0-9\s''`]', '', 'g') || '\M') THEN 1
      ELSE 0
    END DESC,
    -- Secondary sort by rating and creation date
    b.rating DESC NULLS LAST, 
    b.created_at DESC
  LIMIT GREATEST(page_size, 0)
  OFFSET GREATEST(page, 0) * GREATEST(page_size, 0);
$function$
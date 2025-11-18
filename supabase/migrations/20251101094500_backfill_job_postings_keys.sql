-- Backfill existing job_postings rows into new bilingual/keyed shape
-- Best-effort mapping from old free-text columns to new key-based fields.

-- 1) Salary type mapping from old labels to canonical values
UPDATE public.job_postings
SET salary_type = CASE
  WHEN salary_type IS NULL THEN NULL
  WHEN lower(salary_type) LIKE 'monthly%' THEN 'monthly'
  WHEN lower(salary_type) LIKE 'daily%' THEN 'daily'
  WHEN lower(salary_type) LIKE 'hourly%' THEN 'hourly'
  ELSE salary_type
END
WHERE TRUE;

-- 2) Salary structure + min/max from old salary_amount free-text where possible
-- If text looks like 'nego%': negotiable
-- If text is a simple integer: fixed (min=max=that value)
-- NOTE: Monthly conversion to Lakhs cannot be inferred without context; leave as-is.
UPDATE public.job_postings
SET salary_structure = COALESCE(salary_structure,
  CASE
    WHEN salary_amount ILIKE 'nego%' THEN 'negotiable'
    WHEN salary_amount ~ '^[0-9]+$' THEN 'fixed'
    ELSE salary_structure
  END
),
    salary_min = COALESCE(salary_min,
  CASE
    WHEN salary_amount ~ '^[0-9]+$' THEN (salary_amount)::numeric
    ELSE salary_min
  END
),
    salary_max = COALESCE(salary_max,
  CASE
    WHEN salary_amount ~ '^[0-9]+$' THEN (salary_amount)::numeric
    ELSE salary_max
  END
)
WHERE TRUE;

-- 3) Job title mapping to keys; default to custom
UPDATE public.job_postings
SET job_title_key = COALESCE(job_title_key,
  CASE
    WHEN lower(job_title) LIKE '%driver%' THEN 'driver'
    WHEN lower(job_title) LIKE '%rider%' THEN 'rider'
    WHEN lower(job_title) LIKE '%security%' THEN 'security_officer'
    WHEN lower(job_title) LIKE '%barista%' THEN 'barista'
    WHEN lower(job_title) LIKE '%cashier%' THEN 'cashier'
    ELSE 'custom'
  END
),
    job_title_custom = CASE
      WHEN COALESCE(job_title_key,
        CASE
          WHEN lower(job_title) LIKE '%driver%' THEN 'driver'
          WHEN lower(job_title) LIKE '%rider%' THEN 'rider'
          WHEN lower(job_title) LIKE '%security%' THEN 'security_officer'
          WHEN lower(job_title) LIKE '%barista%' THEN 'barista'
          WHEN lower(job_title) LIKE '%cashier%' THEN 'cashier'
          ELSE 'custom'
        END
      ) = 'custom'
      THEN COALESCE(job_title_custom, NULLIF(job_title, ''))
      ELSE job_title_custom
    END
WHERE TRUE;

-- 4) Location mapping to keys where trivially determinable; default leave null
UPDATE public.job_postings
SET job_location_key = COALESCE(job_location_key,
  CASE
    WHEN lower(job_location) = 'yangon' THEN 'yangon'
    WHEN lower(job_location) = 'mandalay' THEN 'mandalay'
    WHEN lower(job_location) = 'naypyidaw' THEN 'naypyidaw'
    ELSE job_location_key
  END
)
WHERE TRUE;

-- 5) Education mapping; default to custom on known phrases
UPDATE public.job_postings
SET education_key = COALESCE(education_key,
  CASE
    WHEN education_requirement IS NULL OR trim(education_requirement) = '' THEN 'edu_no_req'
    WHEN lower(education_requirement) LIKE '%no minimum%' THEN 'edu_no_req'
    WHEN lower(education_requirement) LIKE '%secondary%' THEN 'edu_secondary'
    WHEN lower(education_requirement) LIKE '%high school%' THEN 'edu_high_school_pref'
    ELSE 'custom'
  END
),
    education_custom = CASE
      WHEN COALESCE(education_key,
        CASE
          WHEN education_requirement IS NULL OR trim(education_requirement) = '' THEN 'edu_no_req'
          WHEN lower(education_requirement) LIKE '%no minimum%' THEN 'edu_no_req'
          WHEN lower(education_requirement) LIKE '%secondary%' THEN 'edu_secondary'
          WHEN lower(education_requirement) LIKE '%high school%' THEN 'edu_high_school_pref'
          ELSE 'custom'
        END
      ) = 'custom'
      THEN COALESCE(education_custom, NULLIF(education_requirement, ''))
      ELSE education_custom
    END
WHERE TRUE;

-- 6) Description: keep original into description_my if empty
UPDATE public.job_postings
SET description_my = COALESCE(description_my, NULLIF(description, ''))
WHERE TRUE;

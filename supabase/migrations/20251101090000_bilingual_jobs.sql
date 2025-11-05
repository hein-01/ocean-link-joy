/* -------------------------------------------
   1. TRANSLATION TABLE for JOB TITLES
   ------------------------------------------- */
CREATE TABLE IF NOT EXISTS public.job_titles_translation (
  title_key TEXT PRIMARY KEY,
  label_en TEXT NOT NULL,
  label_my TEXT NOT NULL
);

-- Add RLS policy so the app can read this list
ALTER TABLE public.job_titles_translation ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow public read access to job titles"
  ON public.job_titles_translation FOR SELECT
  TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Insert sample data
INSERT INTO public.job_titles_translation (title_key, label_en, label_my) VALUES
  ('driver', 'Driver', 'ယာဉ်မောင်း'),
  ('rider', 'Rider', 'ဆိုင်ကယ်ပို့ဆောင်ရေး'),
  ('security_officer', 'Security Officer', 'လုံခြုံရေးဝန်ထမ်း'),
  ('barista', 'Barista', 'ဘရာစ်တာ'),
  ('cashier', 'Cashier', 'ငွေကိုင်'),
  ('custom', 'Custom', 'အခြား')
ON CONFLICT (title_key) DO NOTHING;

/* -------------------------------------------
   2. TRANSLATION TABLE for LOCATIONS
   (This REPLACES your old hybrid table)
   ------------------------------------------- */
CREATE TABLE IF NOT EXISTS public.locations_translation (
  location_key TEXT PRIMARY KEY,
  label_en TEXT NOT NULL,
  label_my TEXT NOT NULL
);

-- Add RLS policy so the app can read this list
ALTER TABLE public.locations_translation ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow public read access to locations"
  ON public.locations_translation FOR SELECT
  TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Insert sample data
INSERT INTO public.locations_translation (location_key, label_en, label_my) VALUES
  ('yangon', 'Yangon', 'ရန်ကုန်'),
  ('mandalay', 'Mandalay', 'မန္တလေး'),
  ('naypyidaw', 'Naypyidaw', 'နေပြည်တော်')
ON CONFLICT (location_key) DO NOTHING;

/* -------------------------------------------
   3. TRANSLATION TABLE for EDUCATION
   ------------------------------------------- */
CREATE TABLE IF NOT EXISTS public.education_translation (
  education_key TEXT PRIMARY KEY,
  label_en TEXT NOT NULL,
  label_my TEXT NOT NULL
);

-- Add RLS policy so the app can read this list
ALTER TABLE public.education_translation ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow public read access to education"
  ON public.education_translation FOR SELECT
  TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Insert sample data
INSERT INTO public.education_translation (education_key, label_en, label_my) VALUES
  ('edu_no_req', 'Not a necessary requirement', 'ပညာအရည်အချင်းမလိုအပ်ပါ'),
  ('edu_secondary', 'Secondary education preferred', 'အလယ်တန်းအောင်'),
  ('edu_high_school_pref', 'High School Graduates Preferred', 'အထက်တန်းအောင်'),
  ('custom', 'Custom', 'အခြား')
ON CONFLICT (education_key) DO NOTHING;

/* -------------------------------------------
   4. FINAL 'job_postings' TABLE
   (This is the main table, now using keys)
   ------------------------------------------- */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Renamed columns to use keys
  job_title_key TEXT REFERENCES public.job_titles_translation(title_key),
  job_location_key TEXT REFERENCES public.locations_translation(location_key),
  education_key TEXT REFERENCES public.education_translation(education_key),

  -- Custom free-text fields
  job_title_custom TEXT, -- Only used if job_title_key is 'custom'
  education_custom TEXT, -- Only used if education_key is 'custom'
  
  -- Salary columns
  salary_structure TEXT NOT NULL, -- 'fixed', 'range', 'min_only', 'max_only', 'negotiable'
  salary_type TEXT NOT NULL,      -- 'monthly', 'daily', 'hourly'
  salary_min NUMERIC,
  salary_max NUMERIC,
  
  -- Description (storing both)
  description_my TEXT, -- The original text from the user
  description_en TEXT, -- AI-translated version for search

  -- Other fields
  business_name TEXT,
  job_type TEXT,
  age_min SMALLINT,
  age_max SMALLINT,
  benefits TEXT[],
  application_deadline DATE,
  whatsapp_number TEXT,
  phone_number TEXT
);

-- Add RLS policies for public insert/read
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow public insert access"
  ON public.job_postings FOR INSERT
  TO anon, authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public read access"
  ON public.job_postings FOR SELECT
  TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

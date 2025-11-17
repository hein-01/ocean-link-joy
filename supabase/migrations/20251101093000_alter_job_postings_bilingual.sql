-- Safe migration to update existing schema in-place for bilingual jobs
-- This augments existing tables without dropping old columns.

/* 0) Ensure UUID extension exists (used by earlier scripts) */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

/* 1) Ensure translation tables exist (idempotent) */
CREATE TABLE IF NOT EXISTS public.job_titles_translation (
  title_key TEXT PRIMARY KEY,
  label_en TEXT NOT NULL,
  label_my TEXT NOT NULL
);
ALTER TABLE public.job_titles_translation ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow public read access to job titles"
  ON public.job_titles_translation FOR SELECT
  TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.locations_translation (
  location_key TEXT PRIMARY KEY,
  label_en TEXT NOT NULL,
  label_my TEXT NOT NULL
);
ALTER TABLE public.locations_translation ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow public read access to locations"
  ON public.locations_translation FOR SELECT
  TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.education_translation (
  education_key TEXT PRIMARY KEY,
  label_en TEXT NOT NULL,
  label_my TEXT NOT NULL
);
ALTER TABLE public.education_translation ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow public read access to education"
  ON public.education_translation FOR SELECT
  TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

/* Minimal seed (optional) */
INSERT INTO public.job_titles_translation (title_key, label_en, label_my) VALUES
  ('driver', 'Driver', 'ယာဉ်မောင်း'),
  ('rider', 'Rider', 'ဆိုင်ကယ်ပို့ဆောင်ရေး'),
  ('security_officer', 'Security Officer', 'လုံခြုံရေးဝန်ထမ်း'),
  ('barista', 'Barista', 'ဘရာစ်တာ'),
  ('cashier', 'Cashier', 'ငွေကိုင်'),
  ('custom', 'Custom', 'အခြား')
ON CONFLICT (title_key) DO NOTHING;

INSERT INTO public.locations_translation (location_key, label_en, label_my) VALUES
  ('yangon', 'Yangon', 'ရန်ကုန်'),
  ('mandalay', 'Mandalay', 'မန္တလေး'),
  ('naypyidaw', 'Naypyidaw', 'နေပြည်တော်')
ON CONFLICT (location_key) DO NOTHING;

INSERT INTO public.education_translation (education_key, label_en, label_my) VALUES
  ('edu_no_req', 'Not a necessary requirement', 'ပညာအရည်အချင်းမလိုအပ်ပါ'),
  ('edu_secondary', 'Secondary education preferred', 'အလယ်တန်းအောင်'),
  ('edu_high_school_pref', 'High School Graduates Preferred', 'အထက်တန်းအောင်'),
  ('custom', 'Custom', 'အခြား')
ON CONFLICT (education_key) DO NOTHING;

/* 2) Augment existing job_postings table with new bilingual+salary fields */
ALTER TABLE public.job_postings
  ADD COLUMN IF NOT EXISTS job_title_key TEXT,
  ADD COLUMN IF NOT EXISTS job_location_key TEXT,
  ADD COLUMN IF NOT EXISTS education_key TEXT,
  ADD COLUMN IF NOT EXISTS job_title_custom TEXT,
  ADD COLUMN IF NOT EXISTS education_custom TEXT,
  ADD COLUMN IF NOT EXISTS salary_structure TEXT,
  ADD COLUMN IF NOT EXISTS salary_type TEXT,
  ADD COLUMN IF NOT EXISTS salary_min NUMERIC,
  ADD COLUMN IF NOT EXISTS salary_max NUMERIC,
  ADD COLUMN IF NOT EXISTS description_my TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS job_type TEXT,
  ADD COLUMN IF NOT EXISTS age_min SMALLINT,
  ADD COLUMN IF NOT EXISTS age_max SMALLINT,
  ADD COLUMN IF NOT EXISTS benefits TEXT[],
  ADD COLUMN IF NOT EXISTS application_deadline DATE;

/* 3) Add FKs to translation tables if not present */
DO $$ BEGIN
  ALTER TABLE public.job_postings
    ADD CONSTRAINT job_postings_job_title_key_fkey FOREIGN KEY (job_title_key)
    REFERENCES public.job_titles_translation(title_key);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.job_postings
    ADD CONSTRAINT job_postings_job_location_key_fkey FOREIGN KEY (job_location_key)
    REFERENCES public.locations_translation(location_key);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.job_postings
    ADD CONSTRAINT job_postings_education_key_fkey FOREIGN KEY (education_key)
    REFERENCES public.education_translation(education_key);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

/* 4) Ensure RLS and basic policies exist on job_postings */
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

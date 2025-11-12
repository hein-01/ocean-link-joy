-- Create benefits_translation table with bilingual labels
CREATE TABLE IF NOT EXISTS public.benefits_translation (
  benefit_key TEXT PRIMARY KEY,
  label_en TEXT NOT NULL,
  label_my TEXT NOT NULL
);

-- Enable RLS and allow public read access
ALTER TABLE public.benefits_translation ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow public read access to benefits"
  ON public.benefits_translation FOR SELECT
  TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed common benefits (keys must match UI spec)
INSERT INTO public.benefits_translation (benefit_key, label_en, label_my) VALUES
  ('no_resume', 'No Resume Needed (Walk-in Interview)', 'ကိုယ်ရေးရာဇဝင်မလို (Walk-in မျက်နှာချင်းဆိုင် အင်တာဗျူး)'),
  ('no_experience', 'No Experience Required', 'အတွေ့အကြုံ မလိုအပ်'),
  ('seniors_welcome', 'Seniors Welcome', 'အသက်ကြီးသူများ ကြိုဆိုသည်'),
  ('training_provided', 'Training Provided', 'လေ့ကျင့်သင်ကြားပေးမည်'),
  ('flexible_hours', 'Flexible Working Hours', 'အချိန်အလျှောက်လုပ်ကိုင်နိုင်သည်'),
  ('immediate_start', 'Immediate Start', 'ချက်ချင်း စတင်လုပ်ကိုင်နိုင်'),
  ('students_ok', 'Students OK', 'ကျောင်းသား/ကျောင်းသူများလည်း လုပ်နိုင်')
ON CONFLICT (benefit_key) DO NOTHING;

-- Backfill existing job_postings.benefits (English labels) to keys
-- This converts arrays of English labels to arrays of benefit_key
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_postings' AND column_name = 'benefits'
  ) THEN
    UPDATE public.job_postings jp
    SET benefits = (
      SELECT COALESCE(array_agg(bt.benefit_key), ARRAY[]::text[])
      FROM unnest(COALESCE(jp.benefits, ARRAY[]::text[])) AS b
      JOIN public.benefits_translation bt ON bt.label_en = b
    )
    WHERE jp.benefits IS NOT NULL;
  END IF;
END $$;

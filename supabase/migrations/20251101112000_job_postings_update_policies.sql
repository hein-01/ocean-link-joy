-- RLS policies to allow admins to update any job_postings row and owners to update their own
-- Safe/idempotent: guarded with DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN NULL; END $$;

/* Ensure RLS is enabled */
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

/* Allow owners (poster) to update their own job postings */
DO $$ BEGIN
  CREATE POLICY "Owners can update their own job postings"
  ON public.job_postings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

/* Allow admins to update any job postings */
DO $$ BEGIN
  CREATE POLICY "Admins can update any job postings"
  ON public.job_postings FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()
  ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

/* Optionally, allow admins to delete any job postings (uncomment if desired)
DO $$ BEGIN
  CREATE POLICY "Admins can delete any job postings"
  ON public.job_postings FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()
  ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
*/

-- NOTE: Updates to job_title_key must satisfy the foreign key constraint:
-- the value must exist in public.job_titles_translation(title_key).

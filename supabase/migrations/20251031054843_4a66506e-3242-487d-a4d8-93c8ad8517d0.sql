-- Create job_reports table
CREATE TABLE public.job_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_post_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.job_reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous users) to insert reports
CREATE POLICY "Anyone can submit job reports"
ON public.job_reports
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view reports
CREATE POLICY "Only admins can view job reports"
ON public.job_reports
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);

-- Only admins can delete reports
CREATE POLICY "Only admins can delete job reports"
ON public.job_reports
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_job_reports_updated_at
BEFORE UPDATE ON public.job_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
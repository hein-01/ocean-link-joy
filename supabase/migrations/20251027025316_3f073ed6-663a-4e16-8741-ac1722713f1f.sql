-- Create job_postings table
CREATE TABLE public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_title TEXT NOT NULL,
  business_name TEXT NOT NULL,
  job_location TEXT NOT NULL,
  job_type TEXT NOT NULL,
  salary_type TEXT NOT NULL,
  salary_amount NUMERIC NOT NULL,
  age_min SMALLINT,
  age_max SMALLINT,
  education_requirement TEXT NOT NULL,
  benefits TEXT[],
  application_deadline DATE NOT NULL,
  contact_number TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

-- Create policies for job_postings
CREATE POLICY "Users can view all job postings"
ON public.job_postings
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own job postings"
ON public.job_postings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job postings"
ON public.job_postings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job postings"
ON public.job_postings
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_job_postings_updated_at
BEFORE UPDATE ON public.job_postings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
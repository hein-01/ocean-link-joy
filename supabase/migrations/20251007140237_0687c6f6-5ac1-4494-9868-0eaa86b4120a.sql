-- Create business_resources table
CREATE TABLE public.business_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 1,
  base_price NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_resources ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Resources are viewable by everyone" 
ON public.business_resources 
FOR SELECT 
USING (true);

CREATE POLICY "Business owners can create their own resources" 
ON public.business_resources 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM businesses 
    WHERE businesses.id = business_id 
    AND businesses.owner_id = auth.uid()
  )
);

CREATE POLICY "Business owners can update their own resources" 
ON public.business_resources 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM businesses 
    WHERE businesses.id = business_id 
    AND businesses.owner_id = auth.uid()
  )
);

CREATE POLICY "Business owners can delete their own resources" 
ON public.business_resources 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM businesses 
    WHERE businesses.id = business_id 
    AND businesses.owner_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_business_resources_updated_at
BEFORE UPDATE ON public.business_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
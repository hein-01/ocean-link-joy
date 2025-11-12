-- Add slot_name column to slots table
ALTER TABLE public.slots 
ADD COLUMN slot_name TEXT;

-- Create business_schedules table
CREATE TABLE public.business_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES public.business_resources(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  applies_to_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Schedules are viewable by everyone" 
ON public.business_schedules 
FOR SELECT 
USING (true);

CREATE POLICY "Business owners can create schedules for their resources" 
ON public.business_schedules 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM business_resources br
    JOIN businesses b ON br.business_id = b.id
    WHERE br.id = resource_id 
    AND b.owner_id = auth.uid()
  )
);

CREATE POLICY "Business owners can update their resource schedules" 
ON public.business_schedules 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM business_resources br
    JOIN businesses b ON br.business_id = b.id
    WHERE br.id = resource_id 
    AND b.owner_id = auth.uid()
  )
);

CREATE POLICY "Business owners can delete their resource schedules" 
ON public.business_schedules 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM business_resources br
    JOIN businesses b ON br.business_id = b.id
    WHERE br.id = resource_id 
    AND b.owner_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_business_schedules_updated_at
BEFORE UPDATE ON public.business_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_business_schedules_resource_id ON public.business_schedules(resource_id);
CREATE INDEX idx_business_schedules_day_of_week ON public.business_schedules(day_of_week);
CREATE INDEX idx_business_schedules_applies_to_date ON public.business_schedules(applies_to_date) WHERE applies_to_date IS NOT NULL;
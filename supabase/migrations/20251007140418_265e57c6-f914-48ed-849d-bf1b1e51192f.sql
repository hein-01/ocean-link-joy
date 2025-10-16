-- Create slots table
CREATE TABLE public.slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES public.business_resources(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  slot_price NUMERIC(10, 2) NOT NULL,
  is_booked BOOLEAN NOT NULL DEFAULT FALSE,
  booking_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Slots are viewable by everyone" 
ON public.slots 
FOR SELECT 
USING (true);

CREATE POLICY "Business owners can create slots for their resources" 
ON public.slots 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM business_resources br
    JOIN businesses b ON br.business_id = b.id
    WHERE br.id = resource_id 
    AND b.owner_id = auth.uid()
  )
);

CREATE POLICY "Business owners can update their resource slots" 
ON public.slots 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM business_resources br
    JOIN businesses b ON br.business_id = b.id
    WHERE br.id = resource_id 
    AND b.owner_id = auth.uid()
  )
);

CREATE POLICY "Business owners can delete their resource slots" 
ON public.slots 
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
CREATE TRIGGER update_slots_updated_at
BEFORE UPDATE ON public.slots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance on common queries
CREATE INDEX idx_slots_resource_id ON public.slots(resource_id);
CREATE INDEX idx_slots_start_time ON public.slots(start_time);
CREATE INDEX idx_slots_booking_id ON public.slots(booking_id) WHERE booking_id IS NOT NULL;
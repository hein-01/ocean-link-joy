-- Create payment_methods table
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  method_type TEXT NOT NULL,
  account_name TEXT,
  account_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Business owners can view their payment methods" 
ON public.payment_methods 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM businesses b
    WHERE b.id = payment_methods.business_id 
    AND b.owner_id = auth.uid()
  )
);

CREATE POLICY "Business owners can create payment methods for their businesses" 
ON public.payment_methods 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM businesses b
    WHERE b.id = payment_methods.business_id 
    AND b.owner_id = auth.uid()
  )
);

CREATE POLICY "Business owners can update their payment methods" 
ON public.payment_methods 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM businesses b
    WHERE b.id = payment_methods.business_id 
    AND b.owner_id = auth.uid()
  )
);

CREATE POLICY "Business owners can delete their payment methods" 
ON public.payment_methods 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM businesses b
    WHERE b.id = payment_methods.business_id 
    AND b.owner_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_payment_methods_business_id ON public.payment_methods(business_id);
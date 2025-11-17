-- Create bookings table for tracking customer bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL UNIQUE REFERENCES public.slots(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.business_resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  payment_amount NUMERIC(10,2) NOT NULL,
  receipt_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  confirmed_by_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_resource_id ON public.bookings(resource_id);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own bookings"
  ON public.bookings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Business owners can view bookings for their resources"
  ON public.bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_resources br
      JOIN public.businesses b ON br.business_id = b.id
      WHERE br.id = bookings.resource_id
      AND b.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update bookings for their resources"
  ON public.bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.business_resources br
      JOIN public.businesses b ON br.business_id = b.id
      WHERE br.id = bookings.resource_id
      AND b.owner_id = auth.uid()
    )
  );

-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for receipts
CREATE POLICY "Users can upload their own receipts"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts' 
    AND auth.uid()::text = (storage.foldername(storage.objects.name))[1]
  );

CREATE POLICY "Users can view their own receipts"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'receipts' 
    AND auth.uid()::text = (storage.foldername(storage.objects.name))[1]
  );

CREATE POLICY "Business owners can view receipts for their bookings"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'receipts'
    AND EXISTS (
      SELECT 1 FROM public.bookings bk
      JOIN public.business_resources br ON bk.resource_id = br.id
      JOIN public.businesses b ON br.business_id = b.id
      WHERE b.owner_id = auth.uid()
      AND bk.receipt_url LIKE '%' || storage.objects.name || '%'
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
-- Create bookings table to manage slot reservations and related metadata
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL UNIQUE REFERENCES public.slots(id) ON DELETE RESTRICT,
  resource_id UUID NOT NULL REFERENCES public.business_resources(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  payment_amount NUMERIC(10, 2) NOT NULL,
  receipt_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_by_id UUID REFERENCES auth.users(id)
);

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check CHECK (status IN ('Pending', 'Confirmed', 'Rejected'));

CREATE INDEX idx_bookings_resource_id ON public.bookings(resource_id);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);

ALTER TABLE public.slots
  ADD CONSTRAINT slots_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can insert their own bookings"
ON public.bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Customers can view their bookings"
ON public.bookings
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM business_resources br
    JOIN businesses b ON br.business_id = b.id
    WHERE br.id = resource_id AND b.owner_id = auth.uid()
  )
);

CREATE POLICY "Business owners can manage booking status"
ON public.bookings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM business_resources br
    JOIN businesses b ON br.business_id = b.id
    WHERE br.id = resource_id AND b.owner_id = auth.uid()
  )
)
WITH CHECK (true);


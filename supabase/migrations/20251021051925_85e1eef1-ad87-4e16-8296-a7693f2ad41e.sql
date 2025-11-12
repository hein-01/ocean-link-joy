-- Allow everyone to view payment methods (they need to be public for service cards)
CREATE POLICY "Payment methods are viewable by everyone"
ON public.payment_methods
FOR SELECT
USING (true);

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Business owners can view their payment methods" ON public.payment_methods;
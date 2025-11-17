-- Add payment_method column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN payment_method TEXT;

-- Add a comment to the column
COMMENT ON COLUMN public.bookings.payment_method IS 'The payment method type used for this booking (e.g., Cash on Arrival, Bank Transfer, E-Wallet)';
-- Add currency_symbol column to plans table
ALTER TABLE public.plans 
ADD COLUMN currency_symbol text DEFAULT '$';
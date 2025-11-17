-- Add RLS policies for business_categories table to allow admin operations
CREATE POLICY "Only admins can create categories" 
ON public.business_categories 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  )
);

CREATE POLICY "Only admins can update categories" 
ON public.business_categories 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  )
);

CREATE POLICY "Only admins can delete categories" 
ON public.business_categories 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  )
);
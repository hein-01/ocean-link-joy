-- Create businesses table
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  image_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false
);

-- Create business reviews table
CREATE TABLE public.business_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, user_id)
);

-- Create business categories table
CREATE TABLE public.business_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.business_categories (name, description, icon) VALUES
('Restaurant', 'Dining and food services', 'utensils'),
('Shopping', 'Retail stores and shops', 'shopping-bag'),
('Health', 'Healthcare and medical services', 'heart'),
('Automotive', 'Car services and repairs', 'car'),
('Beauty', 'Salons and beauty services', 'scissors'),
('Technology', 'IT and tech services', 'laptop'),
('Education', 'Schools and learning centers', 'graduation-cap'),
('Entertainment', 'Entertainment and recreation', 'music'),
('Professional', 'Business and professional services', 'briefcase'),
('Home Services', 'Home improvement and maintenance', 'home');

-- Enable Row Level Security
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;

-- Policies for businesses
CREATE POLICY "Anyone can view published businesses" 
ON public.businesses 
FOR SELECT 
USING (true);

CREATE POLICY "Business owners can create businesses" 
ON public.businesses 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Business owners can update their businesses" 
ON public.businesses 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Business owners can delete their businesses" 
ON public.businesses 
FOR DELETE 
USING (auth.uid() = owner_id);

-- Policies for reviews
CREATE POLICY "Anyone can view reviews" 
ON public.business_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create reviews" 
ON public.business_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.business_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
ON public.business_reviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- Policies for categories
CREATE POLICY "Anyone can view categories" 
ON public.business_categories 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_businesses_updated_at
BEFORE UPDATE ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update business rating
CREATE OR REPLACE FUNCTION public.update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.businesses 
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0.0)
      FROM public.business_reviews 
      WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.business_reviews 
      WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
    )
  WHERE id = COALESCE(NEW.business_id, OLD.business_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update business rating when reviews change
CREATE TRIGGER update_rating_on_review_change
AFTER INSERT OR UPDATE OR DELETE ON public.business_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_business_rating();
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BusinessCategory {
  id: string;
  name: string;
  popular_products: string[] | null;
}

export function useBusinessCategories() {
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('business_categories')
          .select('*')
          .order('name');

        if (error) throw error;

        setCategories(data || []);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getProductsForCategories = (selectedCategoryIds: string[]): string[] => {
    if (selectedCategoryIds.length === 0) return [];
    
    const allProducts = new Set<string>();
    
    selectedCategoryIds.forEach(categoryId => {
      const category = categories.find(cat => cat.id === categoryId);
      if (category?.popular_products) {
        category.popular_products.forEach(product => allProducts.add(product));
      }
    });
    
    return Array.from(allProducts);
  };

  return {
    categories,
    loading,
    error,
    getProductsForCategories
  };
}
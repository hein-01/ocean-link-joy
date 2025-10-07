import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PopularBusinessCard } from "@/components/PopularBusinessCard";
import { SearchFilters } from "@/components/SearchFilters";
import { Navbar } from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { expandSearchTerms, normalizeCategoryName } from "@/utils/synonymDictionary";

interface Business {
  id: string;
  name: string;
  description?: string;
  category: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  image_url?: string;
  rating: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  name: string;
}

export default function BusinessDirectory() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetchCategories();
    fetchBusinesses();
  }, []);

  useEffect(() => {
    setCurrentPage(0);
    setHasMore(true);
    fetchBusinesses(true);
  }, [searchTerm, selectedCategory, locationFilter]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("business_categories")
        .select("name")
        .order("name");

      if (error) throw error;
      setCategories(data.map((cat: Category) => cat.name));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBusinesses = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setBusinesses([]);
      } else {
        setLoadingMore(true);
      }

      const page = reset ? 0 : currentPage;
      let query = supabase
        .from("businesses")
        .select("*")
        .order("rating", { ascending: false })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

      // Apply enhanced search filter with improved product catalog matching
      if (searchTerm) {
        const trimmedTerm = searchTerm.toLowerCase().trim();
        
        // Always use synonym expansion for comprehensive search
        const { exactPhrases, individualTerms } = expandSearchTerms(searchTerm);
        
        // Check if it's a compound term that should prioritize exact matching
        const isCompoundTerm = trimmedTerm.includes("'") || 
                              (trimmedTerm.split(/\s+/).length > 1 && 
                               (trimmedTerm.includes("women") || trimmedTerm.includes("men") || 
                                trimmedTerm.includes("kids") || trimmedTerm.includes("children")));
        
        if (isCompoundTerm && exactPhrases.length > 0) {
          // For compound terms, search using all exact phrase variations (including synonyms)
          const exactQuery = exactPhrases
            .map(phrase => `name.ilike.%${phrase}%,description.ilike.%${phrase}%,products_catalog.ilike.%${phrase}%`)
            .join(',');
          query = query.or(exactQuery);
        } else if (exactPhrases.length > 0) {
          // Use exact phrases when available
          const exactQuery = exactPhrases
            .map(phrase => `name.ilike.%${phrase}%,description.ilike.%${phrase}%,products_catalog.ilike.%${phrase}%`)
            .join(',');
          query = query.or(exactQuery);
        } else {
          // For multi-word queries, use AND logic
          const words = trimmedTerm.split(/\s+/);
          if (words.length > 1) {
            words.forEach(word => {
              const wordQuery = `name.ilike.%${word}%,description.ilike.%${word}%,products_catalog.ilike.%${word}%`;
              query = query.or(wordQuery);
            });
          } else {
            const searchQuery = individualTerms
              .map(term => `name.ilike.%${term}%,description.ilike.%${term}%,products_catalog.ilike.%${term}%`)
              .join(',');
            query = query.or(searchQuery);
          }
        }
      }

      // Apply category filter with normalization
      if (selectedCategory !== "all") {
        const normalizedCategory = normalizeCategoryName(selectedCategory);
        query = query.eq("category", normalizedCategory);
      }

      // Apply location filter
      if (locationFilter) {
        query = query.or(`city.ilike.%${locationFilter}%,state.ilike.%${locationFilter}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const newBusinesses = data || [];
      
      if (reset) {
        setBusinesses(newBusinesses);
        setCurrentPage(0);
      } else {
        setBusinesses(prev => [...prev, ...newBusinesses]);
        setCurrentPage(page + 1);
      }
      
      setHasMore(newBusinesses.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch businesses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchBusinesses(false);
    }
  };

  const BusinessSkeleton = () => (
    <div className="w-[290px]">
      <Skeleton className="h-[290px] w-full rounded-t-lg" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Business Directory</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing local businesses in your area. From restaurants to services, find exactly what you're looking for.
          </p>
        </div>

        <SearchFilters
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
          onLocationChange={setLocationFilter}
          categories={categories}
        />

        {loading ? (
          <div className="flex flex-wrap justify-center gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <BusinessSkeleton key={i} />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold mb-4">No businesses found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or browse all categories.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-wrap justify-center gap-5 max-w-[590px] md:max-w-[590px] lg:max-w-[915px] mx-auto">
              {businesses.map((business) => (
                <PopularBusinessCard key={business.id} business={business} />
              ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
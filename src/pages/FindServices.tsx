import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PopularServiceCard } from "@/components/PopularServiceCard";
import { SearchFilters } from "@/components/SearchFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTypingEffect } from "@/hooks/useTypingEffect";
import { useAuth } from "@/hooks/useAuth";
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description?: string;
  category?: string;
  address?: string;
  towns?: string;
  province_district?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  image_url?: string;
  images?: string[];
  rating?: number;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
  business_id?: string;
  business_name?: string;
  starting_price?: string | null;
  base_price?: number | null;
  whatsapp?: string;
  facebook?: string;
  tiktok?: string;
  instagram?: string;
  product_images?: string[] | null;
  service_images?: string[] | null;
  business_options?: string[] | null;
  license_expired_date?: string | null;
  products_catalog?: string | null;
  facebook_page?: string | null;
  tiktok_url?: string | null;
  popular_products?: string | null;
  information_website?: string | null;
}

export default function FindServices() {
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [userBusinessIds, setUserBusinessIds] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const ITEMS_PER_PAGE = 6;
  
  // Embla carousel setup for service category slider
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });
  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();
  
  // Service category filter items with placeholder images
  const serviceCategoryItems = [
    { label: 'All Services', key: 'all_services', imageUrl: 'https://placehold.co/110x196/95a5a6/ffffff?text=All' },
    { label: 'Beauty & Spa', key: 'beauty', imageUrl: 'https://placehold.co/110x196/e74c3c/ffffff?text=Beauty' },
    { label: 'Home Services', key: 'home', imageUrl: 'https://placehold.co/110x196/3498db/ffffff?text=Home' },
    { label: 'Health & Wellness', key: 'health', imageUrl: 'https://placehold.co/110x196/2ecc71/ffffff?text=Health' },
    { label: 'Education', key: 'education', imageUrl: 'https://placehold.co/110x196/9b59b6/ffffff?text=Education' },
    { label: 'Auto Services', key: 'auto', imageUrl: 'https://placehold.co/110x196/f39c12/ffffff?text=Auto' },
    { label: 'Pet Services', key: 'pet', imageUrl: 'https://placehold.co/110x196/1abc9c/ffffff?text=Pet' },
    { label: 'Events', key: 'events', imageUrl: 'https://placehold.co/110x196/e67e22/ffffff?text=Events' },
  ];
  const [selectedServiceCategory, setSelectedServiceCategory] = useState(serviceCategoryItems[0]);

  useEffect(() => {
    fetchCategories();
    fetchUserBusinesses();
    
    const urlSearchTerm = searchParams.get('search');
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, [searchParams, user]);

  const fetchUserBusinesses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id);

      if (error) throw error;
      setUserBusinessIds((data || []).map(b => b.id));
    } catch (error) {
      console.error("Error fetching user businesses:", error);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
    setHasMore(true);
    if (searchTerm || selectedCategory !== "all" || selectedProducts.length > 0 || locationFilter || deliveryFilter.length > 0) {
      fetchServices(true);
    } else {
      setServices([]);
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedProducts, locationFilter, deliveryFilter]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("business_categories")
        .select("id, name")
        .order("name");

      if (error) throw error;
      const categoriesData = data || [];
      setCategories(categoriesData);
      setCategoryNames(categoriesData.map(cat => cat.name));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchServices = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setServices([]);
      } else {
        setLoadingMore(true);
      }

      const page = reset ? 0 : currentPage;
      const offset = page * ITEMS_PER_PAGE;

      let query: any = supabase
        .from("services")
        .select(`
          *,
          business_resources (
            business_id,
            businesses (
              name,
              category,
              address,
              towns,
              province_district,
              zip_code,
              phone,
              email,
              website,
              rating,
              whatsapp,
              facebook,
              tiktok,
              instagram
            )
          )
        `)
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply category filter
      if (selectedCategory !== "all") {
        const categoryData = categories.find(cat => cat.name === selectedCategory);
        if (categoryData) {
          query = query.eq('category', categoryData.name);
        }
      }

      // Apply location filter
      if (locationFilter) {
        if (locationFilter.includes(",")) {
          const [town, province] = locationFilter.split(",").map((s) => s.trim());
          if (town) {
            query = query.ilike('towns', `%${town}%`);
          }
          if (province) {
            query = query.ilike('province_district', `%${province}%`);
          }
        } else {
          query = query.or(`towns.ilike.%${locationFilter}%,province_district.ilike.%${locationFilter}%,address.ilike.%${locationFilter}%`);
        }
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const servicesData: Service[] = (data || [])
        .filter((service: any) => {
          const businessResource = service.business_resources?.[0];
          const businessId = businessResource?.business_id;
          // Filter out services belonging to the current user's businesses
          return !businessId || !userBusinessIds.includes(businessId);
        })
        .map((service: any): Service => {
        const businessResource = service.business_resources?.[0];
        const business = businessResource?.businesses;
        
        return {
          id: service.id,
          name: service.name,
          description: service.description,
          category: business?.category || service.category,
          address: business?.address || service.address,
          towns: business?.towns || service.towns,
          province_district: business?.province_district || service.province_district,
          zip_code: business?.zip_code || service.zip_code,
          phone: business?.phone || service.phone,
          email: business?.email || service.email,
          website: business?.website || service.website,
          rating: business?.rating || service.rating || 0,
          image_url: service.image_url,
          images: service.images,
          owner_id: service.owner_id,
          created_at: service.created_at,
          updated_at: service.updated_at,
          business_id: businessResource?.business_id,
          business_name: business?.name,
          starting_price: service.starting_price,
          base_price: service.base_price,
          whatsapp: business?.whatsapp,
          facebook: business?.facebook,
          tiktok: business?.tiktok,
          instagram: business?.instagram,
          product_images: service.product_images,
          service_images: service.service_images,
          business_options: service.business_options,
          license_expired_date: service.license_expired_date,
          products_catalog: service.products_catalog,
          facebook_page: service.facebook_page,
          tiktok_url: service.tiktok_url,
          popular_products: service.popular_products,
          information_website: service.information_website,
        };
      });
      
      if (reset) {
        setServices(servicesData);
        setCurrentPage(0);
      } else {
        setServices(prev => [...prev, ...servicesData]);
        setCurrentPage(page + 1);
      }
      
      setHasMore(servicesData.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast({
        title: "Error",
        description: "Failed to fetch services. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchServices(false);
    }
  };

  const ServiceSkeleton = () => (
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

  const EmptyStateGuidance = () => {
    const guidanceText = useTypingEffect("Use the search bar to find local services. You can search by:", 50);
    
    return (
      <div className="text-center py-16 w-full max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 border border-border/50 shadow-lg">
          <h2 className="text-2xl font-semibold text-foreground mb-6 min-h-[2rem]">
            {guidanceText}
          </h2>
          
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border border-border/30">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-medium text-foreground">Keyword:</span>
                <span className="text-muted-foreground ml-2">e.g., "haircut," "plumbing," "tutoring"</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border border-border/30">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-medium text-foreground">Category:</span>
                <span className="text-muted-foreground ml-2">Filters-&gt;Choose a Category: e.g., "Beauty," "Home Services," "Education"</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border border-border/30">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-medium text-foreground">Location:</span>
                <span className="text-muted-foreground ml-2">Filters-&gt;Location (e.g., "Yangon," "Mandalay")</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border border-border/30">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <span className="font-medium text-foreground">Service Name:</span>
                <span className="text-muted-foreground ml-2">e.g., "Premium Haircut," "AC Repair"</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 md:pt-24 pb-8">
        {/* Service Filters Section */}
        <div className="mb-8 p-4 md:p-6 border rounded-lg bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            {/* Category Dropdown */}
            <div className="flex-1 md:flex-1">
              <Select
                onValueChange={(val) => setSelectedCategory(val)}
                value={selectedCategory}
              >
                <SelectTrigger className="w-full md:w-full md:rounded-r-none justify-between">
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50 max-h-80 overflow-auto">
                  <SelectItem value="all">All Services</SelectItem>
                  {categoryNames.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Applied hint */}
          <div className="mt-3 text-xs text-muted-foreground">
            {selectedCategory === 'all' ? 'Showing all services' : `Selected: ${selectedCategory}`}
          </div>
        </div>

        {/* Service Category Slider Section */}
        <div className="mb-8 relative overflow-x-hidden">
          {/* Desktop arrows */}
          <button
            type="button"
            aria-label="Previous"
            onClick={scrollPrev}
            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-50 absolute left-0 top-1/2 -translate-y-1/2 z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={scrollNext}
            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-50 absolute right-0 top-1/2 -translate-y-1/2 z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="embla w-full" ref={emblaRef}>
            <div className="flex justify-start space-x-3 py-4">
              {serviceCategoryItems.map((category) => {
                const active = selectedServiceCategory?.key === category.key;
                return (
                  <button
                    key={category.key}
                    onClick={() => setSelectedServiceCategory(category)}
                    className={`flex-shrink-0 w-[110px] h-[195.5px] rounded-md overflow-hidden relative ${active ? 'border-4 border-primary shadow-[0_0_20px_rgba(166,107,255,0.4)]' : 'border-2 border-transparent'} shadow-md`}
                  >
                    <img src={category.imageUrl} alt={category.label} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs p-2 text-center">{category.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex flex-wrap justify-center gap-5 max-w-[590px] md:max-w-[590px] lg:max-w-[915px] mx-auto">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <ServiceSkeleton key={index} />
              ))
            ) : services.length > 0 ? (
              services.map((service) => (
                <PopularServiceCard key={service.id} service={service} />
              ))
            ) : searchTerm || selectedCategory !== "all" || selectedProducts.length > 0 || locationFilter || deliveryFilter.length > 0 ? (
              <div className="text-center py-12 w-full">
                <p className="text-xl text-muted-foreground">
                  No services found matching your criteria.
                </p>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your search filters or browse all categories.
                </p>
              </div>
            ) : (
              <EmptyStateGuidance />
            )}
          </div>
          
          {!loading && services.length > 0 && hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg border-2 border-primary shadow-lg hover:shadow-xl hover:bg-primary/90 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
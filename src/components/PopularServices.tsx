import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PopularServiceCard } from '@/components/PopularServiceCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Service {
  id: string;
  business_id?: string | null;
  name: string;
  description?: string;
  category?: string;
  towns?: string;
  province_district?: string;
  address?: string;
  rating?: number;
  image_url?: string;
  website?: string;
  information_website?: string;
  product_images?: string[] | null;
  service_images?: string[] | null;
  business_options?: string[] | null;
  base_price?: number | null;
  starting_price?: string | null;
  license_expired_date?: string | null;
  products_catalog?: string | null;
  facebook_page?: string | null;
  tiktok_url?: string | null;
  phone?: string | null;
  popular_products?: string | null;
  business_name?: string | null;
  payment_methods?: Array<{ method_type: string; account_name: string | null; account_number: string | null }>; 
}

const PopularServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [userBusinessIds, setUserBusinessIds] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserBusinesses();
    }
  }, [user]);

  useEffect(() => {
    fetchServices();
  }, [userBusinessIds]);

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

  const fetchServices = async () => {
    try {
      // Step 1: Fetch latest 5 services directly
      const { data: latestServices, error: servicesError } = await supabase
        .from('services')
        .select('id, service_key, popular_products, services_description, facilities, service_images, contact_phone, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        return;
      }

      console.log('Fetched latest services:', latestServices);

      if (!latestServices || latestServices.length === 0) {
        setServices([]);
        return;
      }

      // Step 2: For each service, get business data through business_resources
      const servicesWithBusinessData = await Promise.all(
        latestServices.map(async (service) => {
          // Get business_resources for this service
          const { data: resources } = await supabase
            .from('business_resources')
            .select(`
              business_id,
              base_price,
              businesses!inner (
                id,
                name,
                category,
                towns,
                province_district,
                address,
                rating,
                image_url,
                website,
                information_website,
                product_images,
                business_options,
                starting_price,
                license_expired_date,
                facebook_page,
                tiktok_url,
                phone,
                searchable_business
              )
            `)
            .eq('service_id', service.id)
            .eq('businesses.searchable_business', true)
            .limit(1)
            .maybeSingle();

          const business = resources?.businesses;

          // Naming rule: business.name → service.popular_products → 'Unnamed Service'
          const displayName = business?.name || service.popular_products || 'Unnamed Service';

          return {
            id: `service_${service.service_key || service.id}_${business?.id || 'no-business'}`,
            business_id: business?.id || null,
            name: displayName,
            business_name: business?.name,
            description: service.services_description,
            category: business?.category,
            towns: business?.towns,
            province_district: business?.province_district,
            address: business?.address,
            rating: business?.rating,
            image_url: business?.image_url,
            website: business?.website,
            information_website: business?.information_website,
            service_images: service.service_images,
            product_images: business?.product_images,
            business_options: business?.business_options,
            base_price: resources?.base_price || null,
            starting_price: business?.starting_price,
            license_expired_date: business?.license_expired_date,
            products_catalog: service.facilities,
            facebook_page: business?.facebook_page,
            tiktok_url: business?.tiktok_url,
            phone: service.contact_phone || business?.phone,
            popular_products: service.popular_products,
          };
        })
      );

      // Step 3: Batch fetch payment methods for all services' businesses
      const businessIds = Array.from(new Set(
        servicesWithBusinessData
          .map(s => s.business_id)
          .filter((id): id is string => !!id)
      ));

      let paymentMap: Record<string, Array<{ method_type: string; account_name: string | null; account_number: string | null }>> = {};
      if (businessIds.length > 0) {
        const { data: pmRows, error: pmError } = await supabase
          .from('payment_methods')
          .select('business_id, method_type, account_name, account_number')
          .in('business_id', businessIds);

        if (pmError) {
          console.error('Error fetching payment methods (batch):', pmError);
        } else if (pmRows) {
          for (const row of pmRows as any[]) {
            const bId = row.business_id as string;
            if (!paymentMap[bId]) paymentMap[bId] = [];
            const already = paymentMap[bId].some(m => m.method_type === row.method_type && m.account_number === row.account_number);
            if (!already) {
              paymentMap[bId].push({
                method_type: row.method_type,
                account_name: row.account_name ?? null,
                account_number: row.account_number ?? null,
              });
            }
          }
        }
      }

      // Attach payment methods to each service
      const enriched = servicesWithBusinessData
        .filter(s => !s.business_id || !userBusinessIds.includes(s.business_id))
        .map(s => ({
          ...s,
          payment_methods: s.business_id ? (paymentMap[s.business_id] || []) : [],
        }));

      console.log('Services with business data:', enriched);
      setServices(enriched);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Popular Services</h2>
          <div className="flex justify-center">
            <div className="text-muted-foreground">Loading services...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Popular Services</h2>
        
        <div className="hidden md:block bg-muted/30 rounded-2xl p-8 mx-4 overflow-hidden">
          <div className="relative">
            <Swiper
              modules={[Pagination]}
              pagination={{ 
                clickable: true,
                dynamicBullets: false,
                horizontalClass: 'swiper-pagination-horizontal',
                bulletClass: 'swiper-pagination-bullet',
                bulletActiveClass: 'swiper-pagination-bullet-active'
              }}
              spaceBetween={20}
              slidesPerView={'auto'}
              loop={false}
              grabCursor={true}
              centeredSlides={false}
              className="popular-businesses-swiper pb-12"
            >
            {services.map((service) => (
              <SwiperSlide key={service.id} className="!w-[260px] sm:!w-[290px]">
                <PopularServiceCard service={service} />
              </SwiperSlide>
            ))}
            
            <SwiperSlide key="discover-more" className="!w-[260px] sm:!w-[290px]">
              <Card className="group w-[290px] h-[555px] flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 mx-auto bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="relative overflow-hidden rounded-t-lg h-[290px] bg-gradient-to-br from-slate-700 to-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=290&h=290&fit=crop"
                    alt="Discover more services"
                    className="w-full h-[290px] opacity-30"
                    style={{ objectFit: 'none', objectPosition: 'top left' }}
                  />
                </div>
                
                <CardContent className="flex-1 p-3 flex flex-col justify-center items-center text-center">
                  <div className="space-y-4">
                    <h3 className="text-white text-lg font-bold">
                      Discover more services
                    </h3>
                    <p className="text-white/80 text-sm">
                      Explore hundreds of services and find exactly what you're looking for
                    </p>
                    <Button 
                      style={{ backgroundColor: '#EAB33A' }}
                      className="w-full h-10 text-black font-medium hover:opacity-90 transition-opacity"
                    >
                      Go Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </SwiperSlide>
           </Swiper>
          </div>
        </div>
        
        <div className="block md:hidden">
          <Swiper
            modules={[Pagination]}
            pagination={{ 
              clickable: true,
              dynamicBullets: false,
              horizontalClass: 'swiper-pagination-horizontal'
            }}
            spaceBetween={16}
            slidesPerView={'auto'}
            loop={false}
            grabCursor={true}
            centeredSlides={false}
            className="popular-businesses-swiper-mobile pb-12 pl-4"
            style={{ '--swiper-pagination-color': 'var(--primary)' } as React.CSSProperties}
          >
          {services.map((service) => (
            <SwiperSlide key={service.id} className="!w-[290px] first:!ml-0 last:!mr-4">
              <PopularServiceCard service={service} />
            </SwiperSlide>
          ))}
            
            <SwiperSlide key="discover-more-mobile" className="!w-[290px] last:!mr-4">
              <Card className="group w-[290px] h-[555px] flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 mx-auto bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="relative overflow-hidden rounded-t-lg h-[290px] bg-gradient-to-br from-slate-700 to-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=290&h=290&fit=crop"
                    alt="Discover more services"
                    className="w-full h-[290px] opacity-30"
                    style={{ objectFit: 'none', objectPosition: 'top left' }}
                  />
                </div>
                
                <CardContent className="flex-1 p-3 flex flex-col justify-center items-center text-center">
                  <div className="space-y-4">
                    <h3 className="text-white text-lg font-bold">
                      Discover more services
                    </h3>
                    <p className="text-white/80 text-sm">
                      Explore hundreds of services and find exactly what you're looking for
                    </p>
                    <Button 
                      style={{ backgroundColor: '#EAB33A' }}
                      className="w-full h-10 text-black font-medium hover:opacity-90 transition-opacity"
                    >
                      Go Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default PopularServices;

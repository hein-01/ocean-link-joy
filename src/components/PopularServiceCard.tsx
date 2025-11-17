import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bookmark, Check, BadgeCheck, MapPin, ChevronRight, ChevronLeft, Star, Globe, Banknote, Smartphone, CreditCard, Wallet } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import facebookIcon from "@/assets/facebook-icon.jpg";
import tiktokIcon from "@/assets/tiktok-icon.jpg";
import phoneIcon from "@/assets/phone-icon-new.png";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDateWithOrdinal } from '@/lib/dateUtils';
import { format as formatDate } from 'date-fns';
import { fetchServicePaymentMethods } from '@/lib/paymentUtils';
import AuthModal from './AuthModal';
import { InlineAuthForm } from './InlineAuthForm';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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

interface PopularServiceCardProps {
  service: Service;
}

export const PopularServiceCard = ({ service }: PopularServiceCardProps) => {
  console.log('PopularServiceCard service data:', service);
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReviews, setExistingReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showAuthInReviewModal, setShowAuthInReviewModal] = useState(false);
  const [slotCount, setSlotCount] = useState<number>(0);
  const [scheduleHours, setScheduleHours] = useState<string>('');
  const [fieldType, setFieldType] = useState<string>('');
  const [firstResourceId, setFirstResourceId] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<Array<{ method_type: string; account_name: string | null; account_number: string | null }>>(service.payment_methods || []);
  const { toast } = useToast();

  // Fetch existing reviews when modal opens
  useEffect(() => {
    if (openReviewModal) {
      fetchReviews();
    }
  }, [openReviewModal, service.id]);

  // Check if service is bookmarked when component mounts
  useEffect(() => {
    checkBookmarkStatus();
  }, [service.id]);

  // Fetch slot count for futsal services
  useEffect(() => {
    const fetchSlotCount = async () => {
      if (service.popular_products === 'Futsal Booking') {
        try {
          // Extract UUID from service ID if it has a prefix
          const extractUUID = (id: string) => {
            const parts = id.split('_');
            const lastPart = parts[parts.length - 1];
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            return uuidRegex.test(lastPart) ? lastPart : id;
          };

          const businessId = extractUUID(service.id);

          // First get all business_resources for this service
          const { data: resources, error: resourceError } = await supabase
            .from('business_resources')
            .select('id')
            .eq('business_id', businessId);

          if (resourceError) throw resourceError;

          if (resources && resources.length > 0) {
            const resourceIds = resources.map(r => r.id);
            // Remember the first resource to deep-link into availability
            setFirstResourceId(resourceIds[0]);
            
            // Then count all slots for these resources
            const { count, error: slotError } = await supabase
              .from('slots')
              .select('*', { count: 'exact', head: true })
              .in('resource_id', resourceIds);

            if (slotError) throw slotError;
            setSlotCount(count || 0);
          }
        } catch (error) {
          console.error('Error fetching slot count:', error);
        }
      }
    };

    fetchSlotCount();
  }, [service.id, service.popular_products]);

  // Fetch schedule hours
  useEffect(() => {
    const fetchScheduleHours = async () => {
      try {
        // Extract UUID from service ID if it has a prefix
        const extractUUID = (id: string) => {
          const parts = id.split('_');
          const lastPart = parts[parts.length - 1];
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          return uuidRegex.test(lastPart) ? lastPart : id;
        };

        const businessId = extractUUID(service.id);

        // First get business_resources for this service
        const { data: resources, error: resourceError } = await supabase
          .from('business_resources')
          .select('id, field_type')
          .eq('business_id', businessId)
          .limit(1);

        if (resourceError) throw resourceError;

        if (resources && resources.length > 0) {
          // Set field_type if available
          if (resources[0].field_type) {
            setFieldType(resources[0].field_type);
          }
          // Capture the first resource id for navigation
          setFirstResourceId(resources[0].id);
          // Get the schedule for this resource
          const { data: schedules, error: scheduleError } = await supabase
            .from('business_schedules')
            .select('open_time, close_time')
            .eq('resource_id', resources[0].id)
            .eq('is_open', true)
            .limit(1)
            .maybeSingle();

          if (scheduleError) throw scheduleError;

          if (schedules) {
            // Format times (e.g., "06:00:00" to "6AM")
            const formatTime = (timeStr: string) => {
              const [hours, minutes] = timeStr.split(':');
              const hour = parseInt(hours);
              const ampm = hour >= 12 ? 'PM' : 'AM';
              const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
              return `${displayHour}${ampm}`;
            };

            const openTime = formatTime(schedules.open_time);
            const closeTime = formatTime(schedules.close_time);
            setScheduleHours(`${openTime} - ${closeTime}`);
          }
        }
      } catch (error) {
        console.error('Error fetching schedule hours:', error);
      }
    };

    fetchScheduleHours();
  }, [service.id]);

  // Prefer preloaded payment methods from parent; fallback to fetching
  useEffect(() => {
    const fromParent = service.payment_methods && service.payment_methods.length > 0;
    if (fromParent) {
      setPaymentMethods(service.payment_methods!);
      return;
    }
    const loadPaymentMethods = async () => {
      const data = await fetchServicePaymentMethods(service.id);
      if (data && data.length > 0) setPaymentMethods(data);
    };
    if (service.id) loadPaymentMethods();
  }, [service.id, service.payment_methods]);

  const checkBookmarkStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('business_id', service.id)
        .maybeSingle();

      if (error) throw error;
      setIsBookmarked(!!data);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const { data, error } = await supabase
        .from('business_reviews')
        .select(`
          id,
          comment,
          rating,
          created_at,
          user_id
        `)
        .eq('business_id', service.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately to get display names
      if (data && data.length > 0) {
        const userIds = data.map(review => review.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', userIds);

        // Merge reviews with profile data
        const reviewsWithProfiles = data.map(review => ({
          ...review,
          profiles: profiles?.find(p => p.user_id === review.user_id) || null
        }));

        setExistingReviews(reviewsWithProfiles);
      } else {
        setExistingReviews(data || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setExistingReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setShowAuthInReviewModal(true);
        return;
      }

      // Insert review into business_reviews table
      const { error } = await supabase
        .from('business_reviews')
        .insert({
          business_id: service.id,
          user_id: user.id,
          rating: reviewData.rating,
          comment: reviewData.comment,
        });

      if (error) {
        // Handle duplicate review error
        if (error.code === '23505') {
          toast({
            title: "Review already exists",
            description: "You have already reviewed this service. You can only submit one review per service.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
      });

      setReviewData({ rating: 5, comment: '' });
      // Refresh reviews list
      await fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookmarkToggle = async () => {
    setIsBookmarkLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setAuthModalOpen(true);
        return;
      }

      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('business_id', service.id);

        if (error) throw error;

        setIsBookmarked(false);
        toast({
          title: "Bookmark removed",
          description: "Service removed from your bookmarks.",
        });
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            business_id: service.id,
          });

        if (error) throw error;

        setIsBookmarked(true);
        toast({
          title: "Service bookmarked",
          description: "Service added to your bookmarks.",
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  const getOptionColors = (index: number) => {
    const colors = [
      'border-green-600 text-green-600',
      'border-blue-600 text-blue-600', 
      'border-purple-600 text-purple-600',
      'border-orange-600 text-orange-600',
      'border-pink-600 text-pink-600',
      'border-indigo-600 text-indigo-600',
      'border-teal-600 text-teal-600',
      'border-red-600 text-red-600'
    ];
    return colors[index % colors.length];
  };

  const isLicenseValid = (licenseDate?: string | null) => {
    if (!licenseDate) return false;
    
    const expiryDate = new Date(licenseDate);
    const currentDate = new Date();
    
    // Set both dates to start of day for accurate date comparison
    expiryDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    
    return expiryDate >= currentDate;
  };

  const getPaymentMethodIcon = (methodType: string) => {
    const normalizedType = methodType.toLowerCase().replace(/[\s-]/g, '');
    
    // Map payment method types to image URLs
    const iconMap: Record<string, string> = {
      'cashonarrival': 'https://raw.githubusercontent.com/hein-01/payments-icons/1d40ae68a7b71566733aa7ea5a420c376f8fe388/Cash-on-arrival.jpg',
      'cash': 'https://raw.githubusercontent.com/hein-01/payments-icons/1d40ae68a7b71566733aa7ea5a420c376f8fe388/Cash-on-arrival.jpg',
      'truemoney': 'https://raw.githubusercontent.com/hein-01/payments-icons/1d40ae68a7b71566733aa7ea5a420c376f8fe388/grab-pay.jpg',
      'kpay': 'https://raw.githubusercontent.com/hein-01/payments-icons/2469c77d1908221b5ab4efecb7c8ec16d8eefda4/kbz-pay-revised-1.jpg',
      'kbzpay': 'https://raw.githubusercontent.com/hein-01/payments-icons/2469c77d1908221b5ab4efecb7c8ec16d8eefda4/kbz-pay-revised-1.jpg',
      'paylah': 'https://raw.githubusercontent.com/hein-01/payments-icons/2469c77d1908221b5ab4efecb7c8ec16d8eefda4/pay-lah-revsied-1.jpg',
      'grabpay': 'https://raw.githubusercontent.com/hein-01/payments-icons/1d40ae68a7b71566733aa7ea5a420c376f8fe388/true-money.jpg',
    };
    
    // Find matching icon URL
    let iconUrl = '';
    for (const [key, url] of Object.entries(iconMap)) {
      if (normalizedType.includes(key)) {
        iconUrl = url;
        break;
      }
    }
    
    // Log for debugging
    console.log('Payment method:', methodType, '-> Normalized:', normalizedType, '-> Icon URL:', iconUrl || 'NOT FOUND');
    
    // Default to wallet icon if no match found
    if (!iconUrl) {
      return <Wallet className="w-5 h-5" />;
    }
    
    return (
      <img 
        src={iconUrl} 
        alt={methodType}
        className="w-full h-full object-cover object-top"
      />
    );
  };

  const parseServicesCatalog = (catalogString?: string | null) => {
    if (!catalogString || catalogString.trim() === '') {
      return [];
    }
    
    // Try to parse as JSON first (in case it's stored as JSON array)
    try {
      const parsed = JSON.parse(catalogString);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      // If JSON parsing fails, treat as comma-separated string
    }
    
    // Parse as comma-separated string
    const services = catalogString
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    return services;
  };

  const hasMultipleImages = service.service_images && service.service_images.length > 1;

  const getFirstPopularProduct = () => {
    if (!service.popular_products) return '';
    const products = service.popular_products.split(',').map(p => p.trim()).filter(p => p);
    return products.length > 0 ? products[0] : '';
  };

  const getFormattedTitle = () => {
    const firstProduct = getFirstPopularProduct();
    const businessName = service.business_name || service.name;
    return firstProduct ? `[${firstProduct}] ${businessName}` : businessName;
  };

  return (
    <>
      <Card className="group w-[290px] h-[615px] flex flex-col shadow-xl hover:shadow-2xl transition-all duration-300 mx-auto bg-gradient-to-b from-background to-muted/20 relative">
      <div className="relative overflow-hidden rounded-t-lg w-full" style={{ aspectRatio: '4/3' }}>
          <Swiper
            modules={[Navigation, Pagination]}
            navigation={{
              nextEl: `.swiper-button-next-${service.id}`,
              prevEl: `.swiper-button-prev-${service.id}`,
              enabled: true
            }}
            pagination={{ 
              clickable: true,
              enabled: false 
            }}
            spaceBetween={0}
            slidesPerView={1}
            loop={hasMultipleImages}
            className="service-carousel"
            style={{ width: '100%', height: '100%' }}
          >
          {service.service_images && service.service_images.length > 0 ? (
            service.service_images.map((image, index) => (
              <SwiperSlide key={index}>
                <img
                  src={image}
                  alt={`${service.name} service ${index + 1}`}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover'
                  }}
                />
              </SwiperSlide>
            ))
          ) : service.image_url ? (
            <SwiperSlide>
              <img
                src={service.image_url}
                alt={`${service.name} main image`}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover'
                }}
              />
            </SwiperSlide>
          ) : (
            <SwiperSlide>
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=290&h=290&fit=crop"
                alt={`${service.name} services`}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover'
                }}
              />
            </SwiperSlide>
          )}
          
          {/* Custom Navigation Arrows - only show if multiple images */}
          {service.service_images && service.service_images.length > 1 && (
            <>
              <button 
                className={`swiper-button-prev-${service.id} absolute left-2 top-1/2 -translate-y-1/2 z-30 w-6 h-6 bg-white/95 rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-all duration-200 shadow-lg border border-gray-200`}
                type="button"
              >
                <ChevronLeft className="w-3 h-3 text-gray-800" />
              </button>
              <button 
                className={`swiper-button-next-${service.id} absolute right-2 top-1/2 -translate-y-1/2 z-30 w-6 h-6 bg-white/95 rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-all duration-200 shadow-lg border border-gray-200`}
                type="button"
              >
                <ChevronRight className="w-3 h-3 text-gray-800" />
              </button>
            </>
          )}
        </Swiper>
        
        {/* Starting Price Tag - Top Left Corner */}
        {service.base_price && (
          <div className="absolute top-2 left-2 z-40">
            <span className="text-white text-xs font-medium px-2 py-1 shadow-lg" style={{ backgroundColor: '#8E6CF4' }}>
              From ${service.base_price}/hour
            </span>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 px-1 py-2 h-auto w-6 bg-white/80 hover:bg-white z-40"
          onClick={handleBookmarkToggle}
          disabled={isBookmarkLoading}
        >
          <Bookmark 
            className={`w-3 h-3 transition-colors ${
              isBookmarked ? 'text-primary fill-primary' : 'text-gray-600'
            }`} 
          />
        </Button>
      </div>
      
      {/* Rectangular section with See Services button - positioned at exactly 217.5px from top */}
      <div className="absolute top-[217.5px] left-0 w-full h-[30px] flex items-center justify-between px-4 z-10" style={{ backgroundColor: '#F1F5F9' }}>
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="h-5 text-[10px] px-1 bg-white hover:bg-[#8461F5] hover:text-white border-[#8461F5] text-[#8461F5] -ml-2 rounded-sm"
            >
              SEE FACILITIES
            </Button>
          </DialogTrigger>
        </Dialog>
        
        <div className="flex items-center gap-1">
          {isLicenseValid(service.license_expired_date) && (
            <>
              <BadgeCheck className="w-3 h-3 text-black" />
              <span className="text-black text-xs font-medium">VERIFIED</span>
            </>
          )}
        </div>
      </div>
      
      {/* Hidden dialog for services functionality */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogTrigger asChild>
          <div style={{ display: 'none' }}>
            <Button>SEE SERVICES</Button>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{service.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {parseServicesCatalog(service.products_catalog).length > 0 ? (
              parseServicesCatalog(service.products_catalog).map((item: string, index: number) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">{item}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No services catalog available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Hidden dialog for reviews functionality */}
      <Dialog open={openReviewModal} onOpenChange={(open) => {
        setOpenReviewModal(open);
        if (!open) {
          setShowAuthInReviewModal(false);
        }
      }}>
        <DialogTrigger asChild>
          <div style={{ display: 'none' }}>
            <Button>REVIEWS</Button>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showAuthInReviewModal ? 'Sign In to Review' : `Reviews for ${service.name}`}
            </DialogTitle>
          </DialogHeader>
          
          {showAuthInReviewModal ? (
            /* Authentication Form */
            <div className="space-y-4">
              <InlineAuthForm 
                onSuccess={() => {
                  setShowAuthInReviewModal(false);
                  toast({
                    title: "Success",
                    description: "You can now submit your review!",
                  });
                }}
              />
              <div className="flex justify-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAuthInReviewModal(false)}
                  className="text-sm"
                >
                  Back to Reviews
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Existing Reviews Section */}
              <div className="space-y-4 mb-6">
                {loadingReviews ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Loading reviews...</p>
                  </div>
                ) : existingReviews.length > 0 ? (
                  <>
                    <h3 className="font-medium text-sm text-foreground">Customer Reviews ({existingReviews.length})</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {existingReviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-3 bg-muted/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">
                              {review.profiles?.display_name || 'Anonymous'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDateWithOrdinal(review.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </div>
              
              {/* Review Form */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-sm text-foreground mb-4">Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="comment">Your Review</Label>
                  <Textarea
                    id="comment"
                    placeholder="Share your experience with this service..."
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    required
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setOpenReviewModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !reviewData.comment.trim()}>
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </form>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <CardContent className="flex-1 pt-3 px-3 pb-2 flex flex-col justify-between mt-[35px]">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2">
              {getFormattedTitle()}
            </h3>
          </div>
          
           {(service.address || service.towns || service.province_district) && (
             <p className="text-xs text-muted-foreground flex items-start gap-1">
               <MapPin className="w-3 h-3 text-gray-500 flex-shrink-0" />
               <span className="line-clamp-2">
                 {service.address || [service.towns, service.province_district].filter(Boolean).join(', ')}
               </span>
             </p>
           )}
          
          {/* Slot Count for Futsal Services */}
          {service.popular_products === 'Futsal Booking' && slotCount > 0 && (
            <>
              {/* Row 1: Summary Line - Fields, Hours, Type */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-green-600 font-medium">
                  {slotCount} {slotCount === 1 ? 'Field' : 'Fields'}
                </span>
                {scheduleHours && (
                  <>
                    <span className="text-xs text-black">|</span>
                    <span className="text-xs text-blue-600">{scheduleHours}</span>
                  </>
                )}
                {fieldType && (
                  <>
                    <span className="text-xs text-black">|</span>
                    <span className="text-xs text-purple-600">{fieldType}</span>
                  </>
                )}
              </div>
              
              {/* Row 2: Payment Methods */}
              {paymentMethods && paymentMethods.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((payment, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-center rounded border border-gray-300 shadow-sm bg-white hover:shadow-md transition-shadow w-[48px] h-[24px] overflow-hidden"
                      title={payment.method_type}
                    >
                      {getPaymentMethodIcon(payment.method_type)}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Service Options for Non-Futsal Services */}
          {service.popular_products !== 'Futsal Booking' && (
            <>
              {/* Payment Methods for Non-Futsal Services */}
              {paymentMethods && paymentMethods.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((payment, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-center rounded border border-gray-300 shadow-sm bg-white hover:shadow-md transition-shadow w-[48px] h-[24px] overflow-hidden"
                      title={payment.method_type}
                    >
                      {getPaymentMethodIcon(payment.method_type)}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Other Service Options */}
              {service.business_options && service.business_options.length > 0 && (
                <div className="flex flex-wrap gap-x-1 gap-y-1 mt-2">
                  {service.business_options.map((option, index) => (
                    <React.Fragment key={index}>
                      <span 
                        className={`text-xs px-2 py-0.5 rounded ${
                          option === "We Sell Online" 
                            ? "text-[#B8860B]" 
                            : getOptionColors(index)
                        }`}
                      >
                        {option === "Free Wifi" ? "FREE WIFI" : 
                         option === "We Sell Online" ? "WE SELL ONLINE" : 
                         option}
                      </span>
                      {index < service.business_options.length - 1 && (
                        <span className="text-xs text-black">|</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="mt-2">
          <Button
            className="w-full h-8 text-xs flex items-center justify-center gap-1"
            onClick={async () => {
              if (firstResourceId) {
                try {
                  // Find the next available slot for this resource and deep-link to its date
                  const { data, error } = await supabase
                    .from('slots')
                    .select('start_time')
                    .eq('resource_id', firstResourceId)
                    .gte('start_time', new Date().toISOString())
                    .order('start_time', { ascending: true })
                    .limit(1);
                  if (error) throw error;
                  const targetDate = data && data.length > 0
                    ? formatDate(new Date(data[0].start_time), 'yyyy-MM-dd')
                    : formatDate(new Date(), 'yyyy-MM-dd');
                  navigate(`/availability?resourceId=${firstResourceId}&date=${targetDate}`);
                } catch (e) {
                  const fallback = formatDate(new Date(), 'yyyy-MM-dd');
                  navigate(`/availability?resourceId=${firstResourceId}&date=${fallback}`);
                }
              } else if (service.website) {
                window.open(service.website, '_blank');
              }
            }}
          >
            Check Availability
            <ChevronRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
         </div>
       </CardContent>
       
       {/* Light gray bottom section with Reviews button and social icons */}
       <div className="h-[50px] bg-muted rounded-b-lg border-t border-border flex items-center justify-between px-3">
         <Dialog open={openReviewModal} onOpenChange={(open) => {
           setOpenReviewModal(open);
           if (!open) {
             setShowAuthInReviewModal(false);
           }
         }}>
           <DialogTrigger asChild>
             <Button 
               variant="outline" 
               className="h-7 text-xs px-3 bg-[#F5F8FA] hover:bg-[#E8EEF2] border-border flex items-center gap-1"
             >
               <Star className="w-3 h-3" />
               Reviews
             </Button>
           </DialogTrigger>
         </Dialog>
         
           <div className="flex items-center gap-1">
             {service.information_website && (
               <TooltipProvider>
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <Globe 
                       className="w-7 h-7 text-gray-500 cursor-pointer hover:opacity-80 transition-opacity"
                       onClick={() => window.open(service.information_website, '_blank')}
                     />
                   </TooltipTrigger>
                   <TooltipContent>
                     <p>Visit Our Information Website</p>
                   </TooltipContent>
                 </Tooltip>
               </TooltipProvider>
             )}
             {service.tiktok_url && (
               <img 
                 src={tiktokIcon}
                 alt="TikTok"
                 className="w-7 h-7 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                 onClick={() => window.open(service.tiktok_url, '_blank')}
               />
             )}
             {service.facebook_page && (
               <img 
                 src={facebookIcon}
                 alt="Facebook"
                 className="w-7 h-7 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                 onClick={() => window.open(service.facebook_page, '_blank')}
               />
             )}
            {service.phone && (
              <Button
                size="sm"
                className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white border-0 flex items-center gap-1"
                onClick={() => window.open(`tel:${service.phone}`, '_self')}
              >
                <img 
                  src={phoneIcon}
                  alt="Call"
                  className="w-4 h-4 rounded-sm"
                />
                <span className="text-xs">Call</span>
              </Button>
            )}
          </div>
       </div>
     </Card>
     
     <AuthModal 
       open={authModalOpen} 
       onOpenChange={setAuthModalOpen} 
     />
   </>
  );
};


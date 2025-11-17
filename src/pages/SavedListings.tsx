import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { PopularBusinessCard } from "@/components/PopularBusinessCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import MobileNavBar from "@/components/MobileNavBar";

export default function SavedListings() {
  const { user } = useAuth();
  const [bookmarkedBusinesses, setBookmarkedBusinesses] = React.useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = React.useState(false);

  const fetchBookmarkedBusinesses = async () => {
    if (!user?.id) return;
    
    setLoadingBookmarks(true);
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          id,
          businesses (
            id,
            name,
            description,
            category,
            city,
            state,
            rating,
            image_url,
            website,
            product_images,
            business_options,
            starting_price,
            license_expired_date,
            products_catalog,
            facebook_page,
            tiktok_url,
            phone
          )
        `)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching bookmarks:', error);
        return;
      }
      
      // Transform the data to match the expected business format
      const transformedData = data?.map(bookmark => {
        const business = bookmark.businesses as any;
        if (!business) return null;
        return {
          id: business.id,
          name: business.name,
          description: business.description,
          category: business.category,
          towns: business.towns,
          province_district: business.province_district,
          rating: business.rating,
          image_url: business.image_url,
          website: business.website,
          product_images: business.product_images,
          business_options: business.business_options,
          starting_price: business.starting_price,
          license_expired_date: business.license_expired_date,
          products_catalog: business.products_catalog,
          facebook_page: business.facebook_page,
          tiktok_url: business.tiktok_url,
          phone: business.phone,
          bookmarkId: bookmark.id
        };
      }).filter(Boolean) || [];
      
      setBookmarkedBusinesses(transformedData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingBookmarks(false);
    }
  };

  React.useEffect(() => {
    if (user?.id) {
      fetchBookmarkedBusinesses();
    }
  }, [user?.id]);

  const handleDeleteBookmark = async (bookmarkId: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error deleting bookmark:', error);
        return;
      }
      
      // Refresh bookmarked businesses
      fetchBookmarkedBusinesses();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-20 md:pb-8">
        <div className="container mx-auto px-4">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-dashboard-gradient-start to-dashboard-gradient-end bg-clip-text text-transparent">
              Saved Listings
            </h1>
            {loadingBookmarks ? (
              <LoadingSpinner />
            ) : bookmarkedBusinesses.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {bookmarkedBusinesses.map((business) => (
                  <PopularBusinessCard key={business.id} business={business} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center py-8">
                    No saved listings yet. Start exploring businesses and bookmark your favorites!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <MobileNavBar />
    </div>
  );
}
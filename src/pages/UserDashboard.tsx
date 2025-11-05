import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { PopularBusinessCard } from "@/components/PopularBusinessCard";
import { BackButton } from "@/components/BackButton";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import BusinessForm from "@/components/BusinessForm";
import UpgradeModal from "@/components/UpgradeModal";
import { addDays, format } from "date-fns";
import { formatDateWithOrdinal } from "@/lib/dateUtils";
import { 
  User, 
  Mail, 
  Heart, 
  Building2, 
  Plus, 
  Globe, 
  CreditCard, 
  LogOut,
  Home,
  Edit,
  ArrowUp,
  Calendar
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const sidebarItems = [
  { title: "Dashboard", icon: Home, action: "dashboard" },
  { title: "Saved Listings", icon: Heart, action: "wishlists" },
  { title: "List Your Business", icon: Plus, action: "add-listing" },
  { title: "Get Website + POS", icon: Globe, action: "website-pos" },
  { title: "My Listings", icon: Building2, action: "listings" },
  { title: "Profile Info", icon: User, action: "profile" },
  { title: "Email Settings", icon: Mail, action: "email" },
];

export default function UserDashboard() {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = React.useState("dashboard");
  const [userBusinesses, setUserBusinesses] = React.useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editingBusiness, setEditingBusiness] = React.useState(null);
  const [bookmarkedBusinesses, setBookmarkedBusinesses] = React.useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = React.useState(false);
  const [businessCount, setBusinessCount] = React.useState(0);
  const [bookmarkCount, setBookmarkCount] = React.useState(0);
  const [upgradeModalOpen, setUpgradeModalOpen] = React.useState(false);
  const [selectedBusiness, setSelectedBusiness] = React.useState(null);
  const [modalType, setModalType] = React.useState<'upgrade' | 'pos-website'>('upgrade');
  const [listingPrice, setListingPrice] = React.useState("");
  const [odooPrice, setOdooPrice] = React.useState("");

  const fetchUserBusinesses = async () => {
    if (!user?.id) return;
    
    setLoadingBusinesses(true);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user businesses:', error);
        return;
      }
      
      setUserBusinesses(data || []);
      setBusinessCount(data?.length || 0);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const fetchDashboardCounts = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch business count
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id);
      
      if (!businessError) {
        setBusinessCount(businessData?.length || 0);
      }

      // Fetch bookmark count
      const { data: bookmarkData, error: bookmarkError } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id);
      
      if (!bookmarkError) {
        setBookmarkCount(bookmarkData?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching dashboard counts:', error);
    }
  };

  // Fetch plan prices when component mounts
  const fetchPlanPrices = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('name, pricing, currency_symbol, duration');

      if (error) {
        console.error('Error fetching plan prices:', error);
        return;
      }

      const normalize = (s: string | null | undefined) =>
        (s ?? '').toLowerCase().replace(/[^a-z0-9+\s]/g, '');

      const listingPlan = data?.find((plan: any) =>
        normalize(plan.name).includes('listing')
      );

      const odooPlan = data?.find((plan: any) => {
        const n = normalize(plan.name);
        return n.includes('odoo') || n.includes('pos') || n.includes('website');
      });

      const formatPrice = (plan: any) => {
        if (!plan) return '';
        const symbol = plan.currency_symbol || '';
        const price = plan.pricing || '';
        const duration = plan.duration || '';
        return `${symbol}${price}${duration}`.trim();
      };

      setListingPrice(formatPrice(listingPlan));
      setOdooPrice(formatPrice(odooPlan));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  React.useEffect(() => {
    if (user?.id) {
      fetchDashboardCounts();
      fetchUserBusinesses();
      fetchPlanPrices();
    }
  }, [user?.id]);

  const fetchBookmarkedBusinesses = async () => {
    console.log('fetchBookmarkedBusinesses called, user ID:', user?.id);
    if (!user?.id) {
      console.log('No user ID, returning early');
      return;
    }
    
    setLoadingBookmarks(true);
    try {
      console.log('Fetching bookmarks for user:', user.id);
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
      
      console.log('Bookmarks query result:', { data, error });
      
      if (error) {
        console.error('Error fetching bookmarks:', error);
        return;
      }
      
      // Transform the data to match the expected business format
      const transformedData = data?.map(bookmark => {
        console.log('Processing bookmark:', bookmark);
        const business = bookmark.businesses as any;
        if (!business) {
          console.log('No business data found for bookmark:', bookmark.id);
          return null;
        }
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
      
      console.log('Transformed bookmarked businesses:', transformedData);
      setBookmarkedBusinesses(transformedData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingBookmarks(false);
    }
  };

  const handleSidebarAction = (action: string) => {
    console.log('Sidebar action triggered:', action);
    setActiveSection(action);
    
    if (action === "website-pos") {
      navigate("/list-&-get-pos-website");
    } else if (action === "listings") {
      fetchUserBusinesses();
    } else if (action === "wishlists") {
      console.log('Wishlists section selected, fetching bookmarks');
      fetchBookmarkedBusinesses();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleEditBusiness = (business: any) => {
    setEditingBusiness(business);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setEditingBusiness(null);
    fetchUserBusinesses();
  };

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

  const getDashboardContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-dashboard-gradient-start to-dashboard-gradient-end bg-clip-text text-transparent">Profile Information</h2>
            <Card className="bg-dashboard-card-bg border-0 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-dashboard-gradient-start/5 to-dashboard-gradient-end/5"></div>
              <CardContent className="pt-8 relative">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24 ring-4 ring-primary/20 shadow-lg">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-dashboard-gradient-start to-dashboard-gradient-end text-white text-2xl">
                      {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">
                      {profile?.display_name || "No display name set"}
                    </h3>
                    <p className="text-muted-foreground text-lg">{user?.email}</p>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-primary/10 rounded-full">
                        <p className="text-sm font-medium text-primary capitalize">
                          {profile?.role || "user"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case "email":
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-dashboard-gradient-start to-dashboard-gradient-end bg-clip-text text-transparent">Email Settings</h2>
            <Card>
              <CardHeader>
                <CardTitle>Primary Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">{user?.email}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Email verified: {user?.email_confirmed_at ? "Yes" : "No"}
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case "wishlists":
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-dashboard-gradient-start to-dashboard-gradient-end bg-clip-text text-transparent">Saved Listings</h2>
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
        );

      case "listings":
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-dashboard-gradient-start to-dashboard-gradient-end bg-clip-text text-transparent">My Business Listings</h2>
            {loadingBusinesses ? (
              <LoadingSpinner />
            ) : userBusinesses.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userBusinesses.map((business) => (
            <div key={business.id} className="relative">
              <div className="absolute top-2 right-12 z-40">
                <Button
                  onClick={() => handleEditBusiness(business)}
                  size="sm"
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-2 py-1 h-auto text-xs rounded"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
              <PopularBusinessCard business={business} />
            </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center py-8">
                    No business listings yet. 
                    <Button 
                      variant="link" 
                      className="ml-2 p-0 h-auto"
                      onClick={() => navigate("/list-business")}
                    >
                      Create your first listing
                    </Button>
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "add-listing":
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-dashboard-gradient-start to-dashboard-gradient-end bg-clip-text text-transparent">List Your Business</h2>
            <BusinessForm onSuccess={() => {
              setActiveSection("listings");
              fetchUserBusinesses();
            }} />
          </div>
        );



      default:
        return (
          <div className="space-y-8">
            {/* Quick Actions Section */}
            <div className="animate-slide-up">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Quick Actions
              </h3>
               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Button 
                  onClick={() => handleSidebarAction("add-listing")}
                  className="h-24 md:h-32 p-4 md:p-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:from-purple-500 hover:via-pink-500 hover:to-primary animate-gradient bg-[length:200%_200%] flex-col gap-2 md:gap-3 border-0 shadow-lg text-white"
                >
                  <Plus className="h-5 w-5 md:h-6 md:w-6" />
                  <div className="flex flex-col items-center text-center space-y-1">
                    <span className="font-medium text-sm">List Your Business</span>
                    <span className="text-xs opacity-80 leading-tight max-w-full">(Get Discovered by New Customers)</span>
                  </div>
                </Button>
                <Button 
                  onClick={() => navigate("/service-selection")}
                  variant="outline"
                  className="h-24 md:h-32 p-4 md:p-6 flex-col gap-2 md:gap-3 bg-[hsl(var(--quick-actions-service))] hover:bg-[hsl(var(--quick-actions-service-hover))] border-[hsl(var(--quick-actions-service-foreground))]/20 text-[hsl(var(--quick-actions-service-foreground))] shadow-lg shadow-[hsl(var(--quick-actions-service-foreground))]/10 transition-all duration-200"
                >
                  <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--quick-actions-service-foreground))]" />
                  <div className="flex flex-col items-center text-center space-y-1">
                    <span className="font-medium text-sm">List Your Service</span>
                    <span className="text-xs opacity-80 leading-tight max-w-full">(Manage Bookings & Accept Payments)</span>
                  </div>
                </Button>
                <Button 
                  onClick={() => console.log("Manage Bookings clicked")}
                  variant="outline"
                  className="h-24 md:h-32 p-4 md:p-6 flex-col gap-2 md:gap-3 bg-[hsl(var(--quick-actions-bookings))] hover:bg-[hsl(var(--quick-actions-bookings-hover))] border-[hsl(var(--quick-actions-bookings-foreground))]/20 text-[hsl(var(--quick-actions-bookings-foreground))] shadow-lg shadow-[hsl(var(--quick-actions-bookings-foreground))]/10 transition-all duration-200"
                >
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--quick-actions-bookings-foreground))]" />
                  <div className="flex flex-col items-center text-center space-y-1">
                    <span className="font-medium text-sm">Manage Bookings</span>
                    <span className="text-xs opacity-80 leading-tight max-w-full">Create and view appointments</span>
                  </div>
                </Button>
                <Button 
                  onClick={() => handleSidebarAction("website-pos")}
                  variant="outline"
                  className="h-24 md:h-32 p-4 md:p-6 flex-col gap-2 md:gap-3 bg-[hsl(var(--quick-actions-website))] hover:bg-[hsl(var(--quick-actions-website-hover))] border-[hsl(var(--quick-actions-website-foreground))]/20 text-[hsl(var(--quick-actions-website-foreground))] shadow-lg shadow-[hsl(var(--quick-actions-website-foreground))]/10 transition-all duration-200"
                >
                  <Globe className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--quick-actions-website-foreground))]" />
                  <div className="flex flex-col items-center text-center space-y-1">
                    <span className="font-medium text-sm">Get Website + POS</span>
                    <span className="text-xs opacity-80 leading-tight max-w-full">(Only $10, pay monthly)</span>
                  </div>
                </Button>
                <Button 
                  onClick={() => handleSidebarAction("wishlists")}
                  variant="outline"
                  className="h-24 md:h-32 p-4 md:p-6 flex-col gap-2 md:gap-3 bg-[hsl(var(--quick-actions-saved))] hover:bg-[hsl(var(--quick-actions-saved-hover))] border-[hsl(var(--quick-actions-saved-foreground))]/20 text-[hsl(var(--quick-actions-saved-foreground))] shadow-lg shadow-[hsl(var(--quick-actions-saved-foreground))]/10 transition-all duration-200"
                >
                  <Heart className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--quick-actions-saved-foreground))]" />
                  <div className="flex flex-col items-center text-center space-y-1">
                    <span className="font-medium text-sm">View Saved</span>
                    <span className="text-xs opacity-80 leading-tight max-w-full">(Compare Prices & Book Later)</span>
                  </div>
                </Button>
                <Button 
                  onClick={() => handleSidebarAction("listings")}
                  variant="outline"
                  className="h-24 md:h-32 p-4 md:p-6 flex-col gap-2 md:gap-3 bg-[hsl(var(--quick-actions-manage))] hover:bg-[hsl(var(--quick-actions-manage-hover))] border-[hsl(var(--quick-actions-manage-foreground))]/20 text-[hsl(var(--quick-actions-manage-foreground))] shadow-lg shadow-[hsl(var(--quick-actions-manage-foreground))]/10 transition-all duration-200"
                >
                  <Building2 className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--quick-actions-manage-foreground))]" />
                  <div className="flex flex-col items-center text-center space-y-1">
                    <span className="font-medium text-sm">Manage Listings</span>
                    <span className="text-xs opacity-80 leading-tight max-w-full">(Edit, Update, or Add New)</span>
                  </div>
                </Button>
              </div>
            </div>
            
            {/* Upgrade Listings Section */}
            <div className="animate-slide-up">
               <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                 <ArrowUp className="h-5 w-5 text-primary" />
                 Business Listings
               </h3>
              {loadingBusinesses ? (
                <LoadingSpinner />
              ) : userBusinesses.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Business Name</TableHead>
                          <TableHead>Listing Price</TableHead>
                          <TableHead>Odoo Price</TableHead>
                          <TableHead>Listing Expires</TableHead>
                          <TableHead>Odoo Expires</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userBusinesses.map((business) => {
                          const currentDate = new Date();
                          const listingExpired = business.listing_expired_date && new Date(business.listing_expired_date) < currentDate;
                          const odooExpired = business.odoo_expired_date && new Date(business.odoo_expired_date) < currentDate;
                          const canUpgrade = listingExpired || odooExpired;
                          
                          return (
                            <TableRow key={business.id}>
                              <TableCell className="font-medium">{business.name}</TableCell>
                              <TableCell>
                                <span className="text-muted-foreground">
                                  {listingPrice || 'Loading...'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-muted-foreground">
                                  {odooPrice || 'Loading...'}
                                </span>
                              </TableCell>
                              <TableCell>
                                {business.listing_expired_date ? (
                                  <span className={listingExpired ? 'text-destructive' : 'text-muted-foreground'}>
                                    {formatDateWithOrdinal(business.listing_expired_date)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">No expiry</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-2">
                                  {business.odoo_expired_date && (
                                    <span className={odooExpired ? 'text-destructive' : 'text-muted-foreground'}>
                                      {formatDateWithOrdinal(business.odoo_expired_date)}
                                    </span>
                                  )}
                                   {business['POS+Website'] === 0 && (
                                     <Button
                                       size="sm"
                                       onClick={() => {
                                         setSelectedBusiness(business);
                                         setModalType('pos-website');
                                         setUpgradeModalOpen(true);
                                       }}
                                       className="text-white w-full px-2 hover:bg-opacity-80 transition-all duration-200 hover:shadow-lg"
                                       style={{ backgroundColor: '#D4A029' }}
                                     >
                                       Get POS + Website
                                     </Button>
                                   )}
                                </div>
                              </TableCell>
                               <TableCell>
                                 <Button
                                   size="sm"
                                   disabled={!canUpgrade}
                                   onClick={() => {
                                     setSelectedBusiness(business);
                                     setModalType('upgrade');
                                     setUpgradeModalOpen(true);
                                   }}
                                   className={canUpgrade ? "bg-primary hover:bg-primary/90" : ""}
                                 >
                                   Upgrade
                                 </Button>
                               </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8">
                    <p className="text-muted-foreground text-center">
                      No business listings found. 
                      <Button 
                        variant="link" 
                        className="ml-2 p-0 h-auto"
                        onClick={() => setActiveSection("add-listing")}
                      >
                        Create your first listing
                      </Button>
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
            
            
          </div>
        );
    }
  };

  const AppSidebar = () => {
    const { setOpenMobile, isMobile } = useSidebar();
    
    const handleMenuClick = (action: string) => {
      handleSidebarAction(action);
      // Close mobile sidebar when a menu item is clicked
      if (isMobile) {
        setOpenMobile(false);
      }
    };

    const handleLogoutClick = () => {
      handleSignOut();
      // Close mobile sidebar when logout is clicked
      if (isMobile) {
        setOpenMobile(false);
      }
    };

    return (
      <Sidebar className="border-r md:mt-16 md:h-[calc(100vh-4rem)] bg-sidebar/50 backdrop-blur-sm">
        <SidebarContent>
          {/* User Info Section */}
          <div className="p-6 border-b border-sidebar-border/50">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-dashboard-gradient-start to-dashboard-gradient-end text-white">
                  {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">
                  {profile?.display_name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
          
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => handleMenuClick(item.action)}
                      isActive={activeSection === item.action}
                      className="w-full justify-start py-3 px-4 rounded-lg transition-all duration-200 hover:bg-sidebar-accent/80 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/10 data-[active=true]:to-primary/5 data-[active=true]:border-primary/20 data-[active=true]:shadow-sm"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleLogoutClick}
                    className="w-full justify-start text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-lg">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Please sign in to access your dashboard.</p>
            <Button 
              onClick={() => navigate("/auth/signin")} 
              className="w-full mt-4"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard-bg pt-16">
      <Navbar />
      <div className="flex">
        <SidebarProvider>
          <div className="hidden md:block">
            <AppSidebar />
          </div>
          <div className="md:hidden">
            <AppSidebar />
          </div>
          <main className="flex-1 p-6 lg:p-8 overflow-auto ml-0 bg-gradient-to-br from-dashboard-bg via-dashboard-accent to-dashboard-bg">
            {/* Back Button - appears above greeting for non-dashboard sections */}
            {activeSection !== "dashboard" && (
              <div className="mb-4">
                <BackButton 
                  to="/dashboard" 
                  className=""
                  onClick={() => setActiveSection("dashboard")} 
                />
              </div>
            )}
            
            {/* Header Section with Gradient */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-dashboard-gradient-start to-dashboard-gradient-end rounded-2xl opacity-10"></div>
              <div className="relative flex items-center justify-between p-6 rounded-2xl bg-dashboard-card-bg/50 backdrop-blur-sm border border-white/20 shadow-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-xl font-bold">
                       <span className="text-primary">Sawasdee krap,</span> <span className="text-orange-500 font-extrabold">{profile?.display_name || "User"}!</span> <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
                     </h1>
                     <p className="text-muted-foreground">Wishing you a lovely day</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="animate-fade-in">
              {getDashboardContent()}
            </div>
          </main>
        </SidebarProvider>
      </div>
      
      
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        businessId={selectedBusiness?.id || ''}
        businessName={selectedBusiness?.name || ''}
        odooPrice={odooPrice}
        modalType={modalType}
        onSuccess={() => window.location.reload()}
        listingPrice={listingPrice}
        listingExpiredDate={selectedBusiness?.listing_expired_date}
        odooExpiredDate={selectedBusiness?.odoo_expired_date}
      />
      
      {/* Edit Business Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Business Listing</DialogTitle>
          </DialogHeader>
          {editingBusiness && (
            <BusinessForm 
              editingBusiness={editingBusiness}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
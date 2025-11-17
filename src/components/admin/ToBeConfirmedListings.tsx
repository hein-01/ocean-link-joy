import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, CheckCircle, Edit, Trash2, AlertCircle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDateWithOrdinal } from "@/lib/dateUtils";

interface Business {
  id: string;
  name: string;
  owner_id: string;
  user_email: string;
  receipt_url: string;
  payment_status: string;
  created_at: string;
  listing_expired_date: string;
  last_payment_date: string;
  odoo_expired_date: string;
  "POS+Website": number;
}

export default function ToBeConfirmedListings() {
  const [listings, setListings] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDates, setEditingDates] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  const fetchPendingListings = async () => {
    try {
      console.log('Fetching pending listings...');
      const { data, error } = await supabase
        .rpc('get_pending_businesses_with_emails');

      if (error) {
        console.error('Error fetching listings:', error);
        throw error;
      }
      
      console.log('Raw database result:', data);
      console.log('Number of listings found:', data?.length || 0);
      
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching pending listings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (businessId: string) => {
    try {
      console.log('Starting payment confirmation for business:', businessId);
      
      // Get business details first to get POS+Website value
      const business = listings.find(listing => listing.id === businessId);
      if (!business) {
        throw new Error('Business not found in current listings');
      }

      console.log('Business details:', business);

      // Call the secure admin function to confirm payment
      const { data: result, error } = await supabase
        .rpc('admin_confirm_business_payment', {
          business_id: businessId,
          pos_website_option: business["POS+Website"] || 0
        });

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Update successful, result:', result);

      // Remove the listing from local state immediately
      setListings(prev => prev.filter(listing => listing.id !== businessId));

      toast({
        title: "Success",
        description: "Payment confirmed successfully",
      });

      console.log('Refreshing listings...');
      // Refresh the listings to ensure consistency
      await fetchPendingListings();
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm payment",
        variant: "destructive",
      });
    }
  };

  const deleteListing = async (businessId: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });

      // Refresh the listings
      fetchPendingListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive",
      });
    }
  };

  const editListing = (businessId: string) => {
    // Navigate to edit page - you can implement this based on your routing structure
    window.open(`/business/${businessId}/edit`, '_blank');
  };

  const updateListingExpiredDate = async (businessId: string, newDate: string) => {
    if (!newDate) {
      toast({
        title: "Error",
        description: "Please select a valid date",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Updating listing expired date:', { businessId, newDate });
      
      const { data, error } = await supabase
        .from('businesses')
        .update({ listing_expired_date: newDate })
        .eq('id', businessId)
        .select('listing_expired_date');

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Database updated successfully:', data);

      toast({
        title: "Success",
        description: `Listing expired date updated to ${formatDateWithOrdinal(newDate)}`,
      });

      // Remove from editing state
      setEditingDates(prev => {
        const newState = { ...prev };
        delete newState[businessId];
        return newState;
      });

      // Refresh the listings to show updated data
      fetchPendingListings();
    } catch (error) {
      console.error('Error updating listing expired date:', error);
      toast({
        title: "Error",
        description: "Failed to update listing expired date. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDateChange = (businessId: string, value: string) => {
    setEditingDates(prev => ({
      ...prev,
      [businessId]: value
    }));
  };

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const getPackageType = (listing: Business) => {
    const currentDate = new Date();
    const listingTargetDate = new Date(currentDate);
    listingTargetDate.setDate(currentDate.getDate() + 365);
    
    const odooTargetDate = new Date(currentDate);
    odooTargetDate.setDate(currentDate.getDate() + 30);

    const listingMatches = listing.listing_expired_date ? 
      new Date(listing.listing_expired_date).toDateString() === listingTargetDate.toDateString() : false;
    const odooMatches = listing.odoo_expired_date ? 
      new Date(listing.odoo_expired_date).toDateString() === odooTargetDate.toDateString() : false;

    if (listingMatches && odooMatches) {
      return "Odoo & Listing";
    } else if (odooMatches) {
      return "Odoo";
    } else if (listingMatches) {
      return "Listing";
    }
    
    return "";
  };

  useEffect(() => {
    fetchPendingListings();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>To Be Confirmed Listings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>To Be Confirmed Listings</span>
          <Badge variant="secondary">{listings.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {listings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No listings pending confirmation
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop Name</TableHead>
                  <TableHead>User Email</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Listing Expired Date</TableHead>
                  <TableHead>Odoo Expired Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium">{listing.name}</TableCell>
                    <TableCell>{listing.user_email || 'No email provided'}</TableCell>
                     <TableCell>
                       {listing.receipt_url ? (
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => window.open(listing.receipt_url, '_blank')}
                           className="flex items-center space-x-2"
                         >
                           <ExternalLink className="h-4 w-4" />
                           <span>
                             {getPackageType(listing) && `For ${getPackageType(listing)}. `}View Receipt
                           </span>
                         </Button>
                       ) : (
                         <span className="text-muted-foreground">No receipt</span>
                       )}
                     </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                        To Be Confirmed
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateWithOrdinal(listing.created_at)}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center space-x-2">
                        <Input
                          type="date"
                          value={editingDates[listing.id] !== undefined 
                            ? editingDates[listing.id] 
                            : formatDateForInput(listing.listing_expired_date)
                          }
                          onChange={(e) => handleDateChange(listing.id, e.target.value)}
                          className="w-40"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateListingExpiredDate(
                            listing.id, 
                            editingDates[listing.id] !== undefined 
                              ? editingDates[listing.id] 
                              : formatDateForInput(listing.listing_expired_date)
                          )}
                          className="flex items-center space-x-1"
                        >
                          <Save className="h-3 w-3" />
                          <span>Save</span>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {listing.odoo_expired_date 
                        ? formatDateWithOrdinal(listing.odoo_expired_date)
                        : listing["POS+Website"] === 1 ? 'Will be set on confirm' : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => confirmPayment(listing.id)}
                          className="flex items-center space-x-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Confirm</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editListing(listing.id)}
                          className="flex items-center space-x-1"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteListing(listing.id)}
                          className="flex items-center space-x-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
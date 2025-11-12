import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDateWithOrdinal } from "@/lib/dateUtils";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  odooPrice: string;
  modalType?: 'upgrade' | 'pos-website';
  onSuccess?: () => void;
  listingPrice?: string;
  listingExpiredDate?: string;
  odooExpiredDate?: string;
}

export default function UpgradeModal({ isOpen, onClose, businessId, businessName, odooPrice, modalType = 'upgrade', onSuccess, listingPrice = '', listingExpiredDate, odooExpiredDate }: UpgradeModalProps) {
  const [totalAmount, setTotalAmount] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [odooExpiredDateState, setOdooExpiredDate] = useState<string>("");
  const { toast } = useToast();

  // Calculate total price based on expiration dates for upgrade modal
  const calculateTotalPrice = () => {
    if (modalType !== 'upgrade') return odooPrice;
    
    const currentDate = new Date();
    const isListingExpired = listingExpiredDate && new Date(listingExpiredDate) < currentDate;
    const isOdooExpired = odooExpiredDate && new Date(odooExpiredDate) < currentDate;
    
    if (isOdooExpired && isListingExpired) {
      // Both expired: Listing + Odoo price
      const listingNum = parseFloat(listingPrice.replace(/[^0-9.]/g, '')) || 0;
      const odooNum = parseFloat(odooPrice.replace(/[^0-9.]/g, '')) || 0;
      return `$${(listingNum + odooNum).toFixed(2)}`;
    } else if (isOdooExpired) {
      // Only Odoo expired
      return odooPrice;
    } else if (isListingExpired) {
      // Only listing expired
      return listingPrice;
    }
    
    return '$0.00'; // Nothing expired
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!receiptFile) {
      toast({
        title: "Error",
        description: "Please upload a receipt",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First, get the current business data to check listing_expired_date and odoo_expired_date
      const { data: currentBusiness, error: fetchError } = await supabase
        .from('businesses')
        .select('listing_expired_date, odoo_expired_date')
        .eq('id', businessId)
        .single();

      if (fetchError) throw fetchError;

      // Upload receipt to Supabase storage
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${businessId}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('business-assets')
        .upload(`receipts/${fileName}`, receiptFile);

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('business-assets')
        .getPublicUrl(`receipts/${fileName}`);

      const currentDate = new Date();
      const updateData: any = {
        receipt_url: urlData.publicUrl,
        payment_status: 'to_be_confirmed',
        last_payment_date: new Date().toISOString(),
        'POS+Website': 1
      };

      // Only update odoo_expired_date if current odoo_expired_date is expired (in the past) or null
      if (!currentBusiness.odoo_expired_date || new Date(currentBusiness.odoo_expired_date) < currentDate) {
        const odooExpiredDate = new Date();
        odooExpiredDate.setDate(odooExpiredDate.getDate() + 30);
        updateData.odoo_expired_date = odooExpiredDate.toISOString();
      }

      // If listing_expired_date is in the past, update it to today + 365 days
      if (currentBusiness.listing_expired_date && new Date(currentBusiness.listing_expired_date) < currentDate) {
        const newListingExpiredDate = new Date();
        newListingExpiredDate.setDate(newListingExpiredDate.getDate() + 365);
        updateData.listing_expired_date = newListingExpiredDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      }

      // Update business with new receipt URL, payment status, POS+Website option, and dates
      const { error: updateError } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', businessId);

      if (updateError) throw updateError;

      // Fetch the updated business to get the new odoo_expired_date
      const { data: updatedBusiness, error: updateFetchError } = await supabase
        .from('businesses')
        .select('odoo_expired_date')
        .eq('id', businessId)
        .single();

      if (updateFetchError) throw updateFetchError;

      toast({
        title: "Success",
        description: "Receipt uploaded successfully. Your upgrade request has been submitted for admin confirmation.",
      });

      // Close the modal and refresh the page after successful submission
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast({
        title: "Error",
        description: "Failed to upload receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upgrade Business Listing</DialogTitle>
        </DialogHeader>
{submitted ? (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Business Name</Label>
              <div className="mt-1 p-3 bg-muted rounded-md">
                <p className="text-sm">{businessName}</p>
              </div>
            </div>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Upgrade Request Submitted Successfully!</AlertTitle>
              <AlertDescription>
                Your upgrade request has been submitted for admin confirmation.
              </AlertDescription>
            </Alert>

            {odooExpiredDateState && (
              <div>
                <Label className="text-sm font-medium">POS+Website Access Valid Until</Label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p className="text-sm font-semibold text-primary">
                    {formatDateWithOrdinal(odooExpiredDateState)}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Business Name</Label>
              <div className="mt-1 p-3 bg-muted rounded-md">
                <p className="text-sm">{businessName}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Total Amount</Label>
              <div className="mt-1 p-3 bg-muted rounded-md">
                <p className="text-sm">The total amount is {modalType === 'pos-website' ? odooPrice : calculateTotalPrice()}</p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="receipt" className="text-sm font-medium">
                Upload Receipt
              </Label>
              <Input
                id="receipt"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="mt-1"
                required
              />
              {receiptFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {receiptFile.name}
                </p>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Uploading..." : "Submit Upgrade Request"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
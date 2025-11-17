import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2, XCircle, User, Receipt, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { processBookingFinalization } from "@/lib/bookingActions";

interface RenterConfirmationScreenProps {
  bookingId: string;
  onSuccess?: () => void;
}

interface BookingData {
  id: string;
  status: string;
  payment_amount: number;
  receipt_url: string | null;
  payment_method: string | null;
  created_at: string;
  user_id: string;
  customer_name?: string | null;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "MMK",
  maximumFractionDigits: 0,
});

export default function RenterConfirmationScreen({
  bookingId,
  onSuccess,
}: RenterConfirmationScreenProps) {
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setError(null);
        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .select("id, status, payment_amount, receipt_url, payment_method, created_at, user_id")
          .eq("id", bookingId)
          .maybeSingle();

        if (bookingError) throw bookingError;
        if (!bookingData) {
          throw new Error("Booking not found.");
        }

        // Fetch profile separately
        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", bookingData.user_id)
          .maybeSingle();

        setBooking({
          ...bookingData,
          customer_name: profileData?.display_name || null,
        });
      } catch (err) {
        console.error("Failed to load booking details", err);
        const message =
          err instanceof Error ? err.message : "Unable to load booking details.";
        setError(message);
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handleAction = async (actionType: "confirm" | "reject") => {
    if (!booking) return;

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to perform this action.");
      }

      const result = await processBookingFinalization(bookingId, user.id, actionType);

      if (result.success) {
        toast({
          title: actionType === "confirm" ? "Payment Confirmed" : "Payment Rejected",
          description: actionType === "confirm" 
            ? "The booking has been confirmed and the slot is now marked as booked."
            : "The booking has been rejected and the slot is now available again.",
        });
        onSuccess?.();
      } else {
        throw new Error("error" in result ? result.error : "Unknown error occurred");
      }
    } catch (err) {
      console.error(`Failed to ${actionType} booking`, err);
      const message =
        err instanceof Error ? err.message : `Unable to ${actionType} booking.`;
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading booking details…</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !booking) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <p className="text-lg font-semibold text-destructive">{error || "Booking not found"}</p>
        </CardContent>
      </Card>
    );
  }

  const customerName = booking.customer_name || "Customer";
  const isAlreadyProcessed = booking.status !== "Pending";

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Payment Confirmation</CardTitle>
          <Badge variant={isAlreadyProcessed ? "secondary" : "default"}>
            {booking.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <User className="h-4 w-4" />
            Customer Name
          </div>
          <div className="text-xl font-semibold">{customerName}</div>
        </div>

        <Separator />

        {/* Receipt */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Receipt className="h-4 w-4" />
            Payment Receipt
          </div>
          {booking.payment_method?.toLowerCase() === "cash on arrival" ? (
            <div className="rounded-lg border bg-muted/30 p-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <Receipt className="h-12 w-12 text-primary" />
                <p className="text-lg font-semibold text-foreground">Cash on Arrival</p>
                <p className="text-sm text-muted-foreground">
                  Payment will be collected upon arrival
                </p>
              </div>
            </div>
          ) : booking.receipt_url ? (
            <div className="rounded-lg border overflow-hidden bg-muted/30">
              <img
                src={booking.receipt_url}
                alt="Payment Receipt"
                className="w-full h-auto max-h-96 object-contain"
              />
              <div className="p-3 bg-background border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(booking.receipt_url!, "_blank")}
                >
                  View Full Size
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No receipt available</p>
          )}
        </div>

        <Separator />

        {/* Payment Amount */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            Total Payment Amount
          </div>
          <div className="text-3xl font-bold text-primary">
            {currencyFormatter.format(Number(booking.payment_amount || 0))}
          </div>
          <p className="text-xs text-muted-foreground">
            Submitted on {format(new Date(booking.created_at), "dd MMM yyyy, h:mm a")}
          </p>
        </div>

        <Separator />

        {/* Action Buttons */}
        {isAlreadyProcessed ? (
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              This booking has already been {booking.status.toLowerCase()}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="destructive"
              size="lg"
              onClick={() => handleAction("reject")}
              disabled={processing}
              className="w-full"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Reject Payment
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={() => handleAction("confirm")}
              disabled={processing}
              className="w-full"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Confirm Payment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

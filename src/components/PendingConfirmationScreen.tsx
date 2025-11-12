import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Phone } from "lucide-react";
import { addHours, format, formatDistanceToNow, formatDistanceToNowStrict } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface PendingConfirmationScreenProps {
  bookingId: string;
}

type BookingRow = Pick<
  Tables<"bookings">,
  "id" | "status" | "payment_amount" | "created_at" | "resource_id"
>;

type ResourceRow = Pick<Tables<"business_resources">, "service_id">;

type ServiceRow = Pick<Tables<"services">, "contact_phone">;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "MMK",
  maximumFractionDigits: 0,
});

export default function PendingConfirmationScreen({
  bookingId,
}: PendingConfirmationScreenProps) {
  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [contactPhone, setContactPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusBadgeVariant = useMemo(() => {
    switch (booking?.status) {
      case "Confirmed":
        return "default" as const;
      case "Rejected":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  }, [booking?.status]);

  const statusLabel = useMemo(() => {
    switch (booking?.status) {
      case "Confirmed":
        return "Status: Confirmed";
      case "Rejected":
        return "Status: Rejected";
      default:
        return "Status: Pending Confirmation";
    }
  }, [booking?.status]);

  useEffect(() => {
    let cancelled = false;

    const fetchBooking = async () => {
      try {
        if (cancelled) return;
        setError(null);
        const { data, error: bookingError } = await supabase
          .from("bookings")
          .select("id, status, payment_amount, created_at, resource_id")
          .eq("id", bookingId)
          .maybeSingle<BookingRow>();

        if (bookingError) throw bookingError;
        if (!data) {
          throw new Error("Booking could not be found.");
        }

        if (cancelled) return;
        setBooking(data);
        setContactPhone(null);

        if (data.resource_id) {
          const { data: resource, error: resourceError } = await supabase
            .from("business_resources")
            .select("service_id")
            .eq("id", data.resource_id)
            .maybeSingle<ResourceRow>();

          if (resourceError) throw resourceError;
          if (cancelled) return;

          if (resource?.service_id) {
            const { data: service, error: serviceError } = await supabase
              .from("services")
              .select("contact_phone")
              .eq("id", resource.service_id)
              .maybeSingle<ServiceRow>();

            if (serviceError) throw serviceError;
            if (cancelled) return;
            setContactPhone(service?.contact_phone ?? null);
          }
        }
      } catch (err) {
        console.error("Failed to load booking details", err);
        const message =
          err instanceof Error ? err.message : "Unable to load booking details.";
        if (!cancelled) {
          setError(message);
          toast({
            title: "Booking unavailable",
            description: message,
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchBooking();
    const interval = setInterval(fetchBooking, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [bookingId]);

  const createdAtDate = booking ? new Date(booking.created_at) : null;
  const confirmationWindowEnd = createdAtDate ? addHours(createdAtDate, 2) : null;
  const timeSinceSubmission = createdAtDate
    ? formatDistanceToNow(createdAtDate, { addSuffix: true })
    : null;
  const timeRemaining = confirmationWindowEnd
    ? formatDistanceToNowStrict(confirmationWindowEnd, { addSuffix: false })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-3xl shadow-2xl border-primary/20">
        {loading ? (
          <CardContent className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading booking status…</p>
          </CardContent>
        ) : error ? (
          <CardContent className="py-16 text-center space-y-4">
            <p className="text-lg font-semibold text-destructive">{error}</p>
            <p className="text-sm text-muted-foreground">
              Please contact the renter for assistance if this persists.
            </p>
          </CardContent>
        ) : booking ? (
          <CardContent className="space-y-6 p-8">
            <div className="space-y-2 text-center">
              <Badge variant={statusBadgeVariant} className="px-3 py-1 text-sm uppercase tracking-wide">
                {statusLabel}
              </Badge>
              <h1 className="text-3xl font-semibold text-foreground">
                We received your payment receipt
              </h1>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                We will notify you when it is confirmed. Standard confirmation can take up to 6 hours.
              </p>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">Payment Summary</h2>
                <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Amount paid</span>
                    <span className="text-base font-semibold text-foreground">
                      {currencyFormatter.format(Number(booking.payment_amount || 0))}
                    </span>
                  </div>
                  {createdAtDate && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Submitted</span>
                      <span>{format(createdAtDate, "dd MMM yyyy, h:mm a")}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">Stay reachable</h2>
                <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-sm text-muted-foreground">
                  {confirmationWindowEnd && booking.status === "Pending" ? (
                    <>
                      <p>
                        Our team is verifying your transfer. Please stay available in the next {timeRemaining} for a confirmation call.
                      </p>
                      <p className="text-xs uppercase tracking-wide text-foreground/70">
                        Submitted {timeSinceSubmission}
                      </p>
                    </>
                  ) : (
                    <p>
                      Thank you for your patience. We will keep you posted with any updates immediately.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground text-center md:text-left">
                Need to follow up? Call the renter directly for urgent updates.
              </div>
              {contactPhone ? (
                <Button size="lg" className="w-full md:w-auto" asChild>
                  <a href={`tel:${contactPhone}`} className="inline-flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Call renter
                  </a>
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full md:w-auto inline-flex items-center gap-2"
                  disabled
                >
                  <Phone className="h-4 w-4" /> Contact unavailable
                </Button>
              )}
            </div>
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
}

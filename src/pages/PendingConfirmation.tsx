import PendingConfirmationScreen from "@/components/PendingConfirmationScreen";
import { Card, CardContent } from "@/components/ui/card";
import { useParams } from "react-router-dom";

export default function PendingConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>();

  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
        <Card className="max-w-md w-full shadow-lg">
          <CardContent className="p-8 text-center space-y-3">
            <h1 className="text-xl font-semibold text-foreground">Booking not found</h1>
            <p className="text-sm text-muted-foreground">
              We could not locate the booking you are looking for. Please check the link and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <PendingConfirmationScreen bookingId={bookingId} />;
}

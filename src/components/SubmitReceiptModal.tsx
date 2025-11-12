import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, Copy, Upload, X } from "lucide-react";

export type PaymentMethodInfo = {
  method_type: string;
  account_name: string | null;
  account_number: string | null;
};

interface SubmitReceiptModalProps {
  open: boolean;
  onClose: () => void;
  paymentMethods: PaymentMethodInfo[];
  amount: number;
  isSubmitting: boolean;
  onSubmit: (file: File) => Promise<void>;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "MMK",
  maximumFractionDigits: 0,
});

export function SubmitReceiptModal({
  open,
  onClose,
  paymentMethods,
  amount,
  isSubmitting,
  onSubmit,
}: SubmitReceiptModalProps) {
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const selectedMethod = useMemo(
    () => paymentMethods[selectedMethodIndex] ?? null,
    [paymentMethods, selectedMethodIndex]
  );

  useEffect(() => {
    if (!open) {
      setReceiptFile(null);
      setPreviewUrl(null);
      setSelectedMethodIndex(0);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleCopyAccountNumber = async () => {
    if (!selectedMethod?.account_number) return;
    try {
      await navigator.clipboard.writeText(selectedMethod.account_number);
      toast({
        title: "Account number copied!",
        description: "Paste it in your banking or wallet app to complete the transfer.",
      });
    } catch (error) {
      console.error("Failed to copy account number", error);
      toast({
        title: "Copy failed",
        description: "Please copy the account number manually.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setReceiptFile(null);
      setPreviewUrl(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Unsupported file",
        description: "Please upload an image of your payment receipt.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    // Check file size (1MB = 1024 * 1024 bytes)
    const maxSize = 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Receipt image must be less than 1MB. Please compress or resize your image.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    setReceiptFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  };

  const handleSubmit = async () => {
    if (!receiptFile) return;
    await onSubmit(receiptFile);
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b bg-muted/20">
          <DialogTitle className="text-2xl font-semibold text-foreground">
            Submit Receipt
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Complete your booking by confirming the off-platform payment.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-6 space-y-6">
            <section className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Payment Method
                  </p>
                  <h3 className="text-xl font-semibold text-foreground">
                    {selectedMethod?.method_type || "Payment Details"}
                  </h3>
                </div>
                <Badge variant="secondary" className="text-base font-medium px-3 py-1">
                  {currencyFormatter.format(amount)} due
                </Badge>
              </div>

              {paymentMethods.length === 0 ? (
                <Card className="border-dashed border-muted-foreground/50 bg-muted/20">
                  <CardContent className="p-6 text-sm text-muted-foreground space-y-2">
                    <p>No payment instructions are available for this service yet.</p>
                    <p>Please contact the renter directly to obtain the transfer details.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {paymentMethods.map((method, index) => {
                    const isSelected = index === selectedMethodIndex;
                    return (
                      <button
                        key={`${method.method_type}-${index}`}
                        type="button"
                        className={`text-left rounded-xl border transition-all p-4 space-y-2 hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          isSelected ? "border-primary shadow-md bg-primary/5" : "border-border bg-background"
                        }`}
                        onClick={() => setSelectedMethodIndex(index)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">{method.method_type}</span>
                          {isSelected ? <CheckCircle2 className="h-5 w-5 text-primary" /> : null}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium">{method.account_name || "Account name unavailable"}</p>
                          <p className="font-mono text-base text-foreground">
                            {method.account_number || "—"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedMethod?.account_number && (
                <Button
                  variant="outline"
                  size="sm"
                  className="inline-flex items-center gap-2"
                  onClick={handleCopyAccountNumber}
                >
                  <Copy className="h-4 w-4" /> Copy account number
                </Button>
              )}
            </section>

            <section className="space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">Status: Payment Must Be Completed Externally</p>
                <p className="text-sm text-muted-foreground">
                  Please complete the transfer in your banking or wallet app now before proceeding.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-lg font-semibold text-foreground">Upload Screenshot of Payment Receipt</h4>
                <p className="text-sm text-muted-foreground">
                  Attach the screenshot once your transfer is complete. A quick preview will appear for confirmation.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-[1.5fr,1fr] items-start">
                <Label
                  htmlFor="receipt-upload"
                  className="flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-10 px-6 text-center cursor-pointer hover:border-primary transition"
                >
                  <Upload className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Select receipt image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, or JPEG (max 1MB)</p>
                  </div>
                  <Input id="receipt-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </Label>

                {previewUrl ? (
                  <div className="relative w-full overflow-hidden rounded-xl border bg-muted/20">
                    <img src={previewUrl} alt="Payment receipt preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full bg-background/80 p-2 text-muted-foreground shadow"
                      onClick={() => {
                        setReceiptFile(null);
                        setPreviewUrl((prev) => {
                          if (prev) URL.revokeObjectURL(prev);
                          return null;
                        });
                      }}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove receipt</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex h-full min-h-[160px] items-center justify-center rounded-xl border border-dashed border-muted-foreground/40 bg-muted/10">
                    <p className="text-sm text-muted-foreground text-center px-6">
                      Once you choose an image, a preview will appear here for double-checking.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </ScrollArea>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 border-t bg-muted/10 px-6 py-4">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={handleSubmit}
            disabled={!receiptFile || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit My Booking"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SubmitReceiptModal;

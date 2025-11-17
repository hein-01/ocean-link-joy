import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface JobCardProps {
  id: string;
  businessName: string;
  jobTitleMy: string;
  salaryDisplay: string;
  jobLocationMy: string;
  jobType: string;
  educationMy: string;
  ageMin: number | null;
  ageMax: number | null;
  benefits: string[] | null;
  applicationDeadline: string;
  descriptionMy: string;
  contactNumber?: string | null;
}

export const JobCard = ({
  id,
  businessName,
  jobTitleMy,
  salaryDisplay,
  jobLocationMy,
  jobType,
  educationMy,
  ageMin,
  ageMax,
  benefits,
  applicationDeadline,
  descriptionMy,
  contactNumber,
}: JobCardProps) => {
  const [showDescription, setShowDescription] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [benefitLabelsMy, setBenefitLabelsMy] = useState<string[] | null>(null);
  const { toast } = useToast();

  const handleApply = () => {
    // 1) Get contact number (local format like 09123456 or 9123456)
    let raw = (contactNumber || '').trim();
    // Remove any non-digit characters (spaces, dashes, pluses)
    raw = raw.replace(/[^\d]/g, '');

    // 2) Clean number
    // Step A: strip a leading 0 (handle multiple just in case)
    raw = raw.replace(/^0+/, '');
    // Step B: prepend Myanmar country code 95 (avoid double-prefix)
    const intl = raw.startsWith('95') ? raw : `95${raw}`;

    // Guard: if nothing left, don't attempt to open
    if (!intl || /[^\d]/.test(intl)) {
      return;
    }

    // 3) Build Viber URL without plus sign
    const viberLink = `viber://chat?number=${intl}`;
    window.open(viberLink, '_blank');
  };

  const handleReport = () => {
    setShowReport(true);
  };

  // Load Myanmar labels for benefit keys
  useEffect(() => {
    const loadBenefits = async () => {
      try {
        if (!benefits || benefits.length === 0) {
          setBenefitLabelsMy(null);
          return;
        }
        const { data, error } = await (supabase as any)
          .from('benefits_translation')
          .select('benefit_key,label_my')
          .in('benefit_key', benefits);
        if (error) throw error;
        const labels = (data ?? []).map((r: any) => r.label_my).filter(Boolean);
        setBenefitLabelsMy(labels);
      } catch (err) {
        console.error('Error loading benefit labels', err);
        // Fallback to showing keys as-is
        setBenefitLabelsMy(benefits ?? null);
      }
    };
    loadBenefits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(benefits)]);

  const submitReport = async () => {
    try {
      if (!reportReason.trim()) {
        toast({
          title: "Reason required",
          description: "Please enter a reason for your report.",
          variant: "destructive",
        });
        return;
      }
      setSubmittingReport(true);
      const { error } = await supabase
        .from("job_reports")
        .insert({ reason: reportReason.trim(), job_post_id: id });
      if (error) throw error;
      toast({
        title: "Report submitted",
        description: "Thanks for helping us keep listings safe.",
      });
      setReportReason("");
      setShowReport(false);
    } catch (err: unknown) {
      console.error("Error submitting report", err);
      const getErrMsg = (e: unknown): string => {
        if (typeof e === 'string') return e;
        if (e && typeof e === 'object') {
          const o = e as Record<string, unknown>;
          return (
            (typeof o.message === 'string' && o.message) ||
            (typeof o.error_description === 'string' && o.error_description) ||
            (typeof o.hint === 'string' && o.hint) ||
            (typeof o.details === 'string' && o.details) ||
            "We couldn't submit your report. Please try again."
          );
        }
        return "We couldn't submit your report. Please try again.";
      };
      const desc = getErrMsg(err);
      toast({
        title: "Submission failed",
        description: desc,
        variant: "destructive",
      });
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <>
  <div className="bg-card border border-border px-6 pb-6 pt-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] relative h-full flex flex-col">
        {/* Report Button */}
        <Button
          variant="destructive"
          onClick={handleReport}
          className="absolute top-0 right-0 text-[10px] px-2 py-1 h-auto leading-none rounded-none"
        >
          REPORT THIS JOB
        </Button>

        {/* Body (grows to push footer down) */}
        <div className="flex-grow">
          {/* Header */}
          <div className="mb-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase mb-1">{businessName}</p>
              <h3 className="text-2xl font-bold text-foreground mb-2">{jobTitleMy}</h3>
              <p className="text-base font-semibold text-[hsl(var(--primary))]">{salaryDisplay}</p>
            </div>
          </div>

          {/* Info Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className="bg-muted text-muted-foreground rounded-none">
              {jobLocationMy}
            </Badge>
            <Badge variant="secondary" className="bg-muted text-muted-foreground rounded-none">
              {jobType}
            </Badge>
            <Badge variant="secondary" className="bg-muted text-muted-foreground rounded-none">
              {educationMy}
            </Badge>
          </div>

          {/* Age Range */}
          {(ageMin || ageMax) && (
            <p className="text-xs text-muted-foreground mb-2">
              Age: {ageMin} - {ageMax}
            </p>
          )}

          {/* Benefits (comma-separated; allow wrapping to avoid overflow) */}
          {(benefitLabelsMy && benefitLabelsMy.length > 0) && (
            <div className="mb-3">
              <p className="text-[13px] text-[#4da7a6] whitespace-normal break-words">
                {benefitLabelsMy.join(", ")}
              </p>
            </div>
          )}

          {/* Deadline and Description Button */}
          <div className="flex items-center gap-4 mb-2 w-full justify-between">
            <Button
              variant="default"
              onClick={() => setShowDescription(true)}
              className="bg-foreground text-background rounded-none text-xs h-8 px-3 py-1 leading-none border border-transparent hover:bg-white hover:text-black hover:border-black"
            >
              SEE JOB DESCRIPTION
            </Button>
            <p className="text-sm text-muted-foreground ml-auto">
              Deadline: {new Date(applicationDeadline).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Apply Section (light lavender background with button on the right) */}
  <div className="bg-[#f3edfb] text-foreground p-4 -mx-6 -mb-6 mt-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] text-[#64748b] m-0 flex-1 break-words">
              When ready to apply, please click the button to open the chat with this job poster on Viber.
              Send your CV or ask them anything. (Make sure you have Viber installed!)
            </p>
            <Button onClick={handleApply} className="rounded-none shrink-0">APPLY</Button>
          </div>
        </div>
      </div>

      {/* Description Modal */}
      <Dialog open={showDescription} onOpenChange={setShowDescription}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{jobTitleMy}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {businessName}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 whitespace-pre-wrap text-foreground">
            {descriptionMy}
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Modal */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Report this Job Post</DialogTitle>
            <DialogDescription>
              Tell us briefly why this post should be reviewed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Type your reason here..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="min-h-32"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowReport(false)}
                disabled={submittingReport}
                className="rounded-none"
              >
                Cancel
              </Button>
              <Button
                onClick={submitReport}
                disabled={submittingReport}
                className="rounded-none"
              >
                {submittingReport ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

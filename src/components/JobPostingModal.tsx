import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import JobPostingForm from "./JobPostingForm";

interface JobPostingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JobPostingModal = ({ open, onOpenChange }: JobPostingModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Post a Job</DialogTitle>
          <DialogDescription>
            Fill in the details below to post your job opening
          </DialogDescription>
        </DialogHeader>
        <JobPostingForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default JobPostingModal;

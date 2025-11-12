import { Navbar } from "@/components/Navbar";
import { BackButton } from "@/components/BackButton";
import JobPostingForm from "@/components/JobPostingForm";
import { useNavigate } from "react-router-dom";

const PostAJob = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/find-jobs");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 pb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <BackButton />
            <div className="mt-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">Post a Job</h1>
              <p className="text-muted-foreground mb-8">
                Fill in the details below to post your job opening
              </p>
              <JobPostingForm onSuccess={handleSuccess} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostAJob;

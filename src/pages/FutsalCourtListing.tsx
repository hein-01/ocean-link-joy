import React from "react";
import { BackButton } from "@/components/BackButton";
import { FutsalCourtForm } from "@/components/FutsalCourtForm";

export default function FutsalCourtListing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 pt-24 pb-8 max-w-4xl">
        <BackButton to="/service-selection" />
        
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
            List Your Futsal Court
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fill in the details below to list your futsal court rental service
          </p>
        </div>

        <FutsalCourtForm />
      </div>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const serviceTypes = [
  "Futsal Court Rental",
  "Badminton Court Rental", 
  "Swimming Class",
  "Gym Access Pass",
  "Swimming Pool Access Pass",
  "Language Class",
  "Yoga Class",
  "Other"
];

export default function ServiceSelection() {
  const navigate = useNavigate();

  const handleServiceSelect = (serviceType: string) => {
    // Navigate to specific form for Futsal Court Rental
    if (serviceType === "Futsal Court Rental") {
      navigate("/list-futsal-court");
    } else {
      // Navigate to general list business form with service type pre-selected
      navigate("/list-business", { state: { serviceType } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 pt-24 pb-8 max-w-6xl">
        <BackButton />
        
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
            Select Your Service Type
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the type of service you want to list. This helps us customize your listing form and connect you with the right customers.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {serviceTypes.map((serviceType, index) => (
            <Card 
              key={serviceType} 
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer bg-card hover:bg-card/80 border-border hover:border-primary/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-center group-hover:text-primary transition-colors">
                  {serviceType}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => handleServiceSelect(serviceType)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group-hover:shadow-md transition-all duration-200"
                >
                  Create
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
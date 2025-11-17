import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  pricing: z.string().min(1, "Pricing is required"),
  currency_symbol: z.string().min(1, "Currency symbol is required"),
  duration: z.enum(["/Month", "/Year"], {
    required_error: "Please select a duration",
  }),
  features: z.string().min(1, "Features are required"),
});

type FormData = z.infer<typeof formSchema>;

interface Plan {
  id: string;
  name: string;
  pricing: string;
  currency_symbol: string;
  duration: string;
  features: string;
}

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  plan?: Plan | null;
}

export function PlanFormModal({ isOpen, onClose, onSubmit, plan }: PlanFormModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      pricing: "",
      currency_symbol: "$",
      duration: "/Month",
      features: "",
    },
  });

  useEffect(() => {
    if (plan) {
      form.reset({
        name: plan.name,
        pricing: plan.pricing,
        currency_symbol: plan.currency_symbol,
        duration: plan.duration as "/Month" | "/Year",
        features: plan.features,
      });
    } else {
      form.reset({
        name: "",
        pricing: "",
        currency_symbol: "$",
        duration: "/Month",
        features: "",
      });
    }
  }, [plan, form]);

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const planData = {
        name: data.name,
        pricing: data.pricing,
        currency_symbol: data.currency_symbol,
        duration: data.duration,
        features: data.features,
      };

      if (plan) {
        // Update existing plan
        const { error } = await supabase
          .from('plans')
          .update(planData)
          .eq('id', plan.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Plan updated successfully",
        });
      } else {
        // Create new plan
        const { error } = await supabase
          .from('plans')
          .insert([planData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Plan created successfully",
        });
        
        // Refresh the page after creating a new plan
        window.location.reload();
      }

      onSubmit();
      onClose();
      form.reset();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: "Error",
        description: "Failed to save plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {plan ? 'Edit Plan' : 'Add New Plan'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter plan name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="pricing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pricing</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 29.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="currency_symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency Symbol</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., $, €, £" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="/Month">/Month</SelectItem>
                      <SelectItem value="/Year">/Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Features</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the plan features..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (plan ? 'Updating...' : 'Creating...') : (plan ? 'Update Plan' : 'Create Plan')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
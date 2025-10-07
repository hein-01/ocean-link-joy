import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: {
    id: string;
    name: string;
    popular_products: string[];
  } | null;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  onSuccess,
  category,
}: CategoryFormModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    popularProducts: "",
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        popularProducts: category.popular_products?.join(", ") || "",
      });
    } else {
      setFormData({
        name: "",
        popularProducts: "",
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const popularProductsArray = formData.popularProducts
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      if (category) {
        // Update existing category
        const { error } = await supabase
          .from("business_categories")
          .update({
            name: formData.name,
            popular_products: popularProductsArray,
          })
          .eq("id", category.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        // Create new category
        const { error } = await supabase
          .from("business_categories")
          .insert({
            name: formData.name,
            popular_products: popularProductsArray,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Add New Category"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter category name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="popularProducts">Popular Products</Label>
            <Textarea
              id="popularProducts"
              value={formData.popularProducts}
              onChange={(e) =>
                setFormData({ ...formData, popularProducts: e.target.value })
              }
              placeholder="Enter popular products separated by commas"
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              Separate multiple products with commas (e.g., "Shoes, Bags, Accessories")
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
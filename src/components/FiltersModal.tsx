import { useState, useEffect, cloneElement, isValidElement } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import type { CarouselApi } from "@/components/ui/carousel";

interface FiltersModalProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onLocationChange: (location: string) => void;
  onProductChange?: (products: string[] | string) => void;
  categories: string[];
  initialSearchTerm?: string;
  initialCategory?: string;
  initialProduct?: string;
  children: React.ReactNode;
}

export const FiltersModal = ({
  onSearchChange,
  onCategoryChange,
  onLocationChange,
  onProductChange,
  categories,
  initialSearchTerm = "",
  initialCategory = "all",
  initialProduct = "All Products",
  children,
}: FiltersModalProps) => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>(["All Products"]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, string[]>>({
    "all": ["All Products"]
  });
  const [categoryCarouselApi, setCategoryCarouselApi] = useState<CarouselApi>();
  const [productsCarouselApi, setProductsCarouselApi] = useState<CarouselApi>();
  const [canScrollCategoryPrev, setCanScrollCategoryPrev] = useState(false);
  const [canScrollProductsPrev, setCanScrollProductsPrev] = useState(false);
  const [canScrollProductsNext, setCanScrollProductsNext] = useState(true);

  // Fetch categories and their popular products
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("business_categories")
          .select("name, popular_products")
          .order("name");

        if (error) throw error;

        const productsMap: Record<string, string[]> = {
          "all": ["All Products"]
        };

        data?.forEach((categoryData) => {
          const categoryName = categoryData.name;
          const products = categoryData.popular_products || [];
          productsMap[categoryName] = products.length > 0 ? ["All Products", ...products] : ["All Products"];
        });

        setCategoryProducts(productsMap);
      } catch (error) {
        console.error("Error fetching category products:", error);
        // Keep default fallback
        setCategoryProducts({
          "all": ["All Products"]
        });
      }
    };

    fetchCategoryProducts();
  }, []);

  // Update scroll state for category carousel
  useEffect(() => {
    if (!categoryCarouselApi) return;

    const onSelect = () => {
      setCanScrollCategoryPrev(categoryCarouselApi.canScrollPrev());
    };

    categoryCarouselApi.on("select", onSelect);
    onSelect();

    return () => {
      categoryCarouselApi.off("select", onSelect);
    };
  }, [categoryCarouselApi]);

  // Update scroll state for products carousel
  useEffect(() => {
    if (!productsCarouselApi) return;

    const onSelect = () => {
      setCanScrollProductsPrev(productsCarouselApi.canScrollPrev());
      setCanScrollProductsNext(productsCarouselApi.canScrollNext());
    };

    productsCarouselApi.on("select", onSelect);
    onSelect();

    return () => {
      productsCarouselApi.off("select", onSelect);
    };
  }, [productsCarouselApi]);

  const currentProducts = categoryProducts[category] || ["All Products"];

  // Check if filters are active
  const isFiltersActive = category !== "all" || (selectedProducts.length > 1 || (selectedProducts.length === 1 && selectedProducts[0] !== "All Products"));

  useEffect(() => {
    // Reset product selection when category changes
    if (category === "all") {
      setSelectedProducts(["All Products"]);
    } else if (currentProducts.length > 0) {
      setSelectedProducts([currentProducts[0]]);
    }
  }, [category, currentProducts]);

  const handleProductSelect = (product: string) => {
    if (product === "All Products") {
      setSelectedProducts(["All Products"]);
    } else {
      setSelectedProducts(prev => {
        // Remove "All Products" if selecting individual products
        const filtered = prev.filter(p => p !== "All Products");
        
        if (filtered.includes(product)) {
          // Remove product if already selected
          const newSelection = filtered.filter(p => p !== product);
          return newSelection.length === 0 ? ["All Products"] : newSelection;
        } else {
          // Add product to selection
          return [...filtered, product];
        }
      });
    }
  };

  const handleSearch = () => {
    onCategoryChange(category);
    onProductChange?.(selectedProducts.length === 1 && selectedProducts[0] === "All Products" ? "all" : selectedProducts);
    setOpen(false);
  };

  const handleReset = () => {
    setCategory("all");
    setSelectedProducts(["All Products"]);
    onCategoryChange("all");
    onProductChange?.("all");
  };

  // Clone children to add active styling
  const triggerButton = isValidElement(children) 
    ? cloneElement(children, {
        ...children.props,
        className: `${children.props.className || ""} ${
          isFiltersActive 
            ? "border-purple-500 bg-purple-50 text-purple-700 hover:bg-purple-100" 
            : ""
        }`.trim()
      })
    : children;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-2xl border-0 max-h-[90vh] overflow-hidden [&>button]:bg-purple-200 [&>button]:hover:bg-purple-300 [&>button]:rounded-full [&>button]:opacity-100 [&>button>svg]:text-purple-700">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-foreground">
            Search filters
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col min-h-0 overflow-hidden">
          <div className="py-4 px-1 space-y-6">
            {/* Category Section */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Category
              </Label>
              <div className="w-full overflow-hidden relative">
                <Carousel
                  setApi={setCategoryCarouselApi}
                  opts={{
                    align: "start",
                    dragFree: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2">
                    <CarouselItem className="pl-2 basis-auto">
                      <button
                        type="button"
                        onClick={() => setCategory("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm whitespace-nowrap ${
                          category === "all"
                            ? "bg-blue-100 text-blue-700 shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm"
                        }`}
                      >
                        Any
                      </button>
                    </CarouselItem>
                    {categories.map((cat) => (
                      <CarouselItem key={cat} className="pl-2 basis-auto">
                        <button
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm whitespace-nowrap ${
                            category === cat
                              ? "bg-blue-100 text-blue-700 shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm"
                          }`}
                        >
                          {cat}
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {canScrollCategoryPrev && (
                    <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 bg-white shadow-md border border-gray-200 hover:bg-gray-50" />
                  )}
                  <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 bg-white shadow-md border border-gray-200 hover:bg-gray-50" />
                </Carousel>
              </div>
            </div>

            {/* Products Section */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Products
              </Label>
              <div className="w-full overflow-hidden relative">
                <Carousel
                  setApi={setProductsCarouselApi}
                  opts={{
                    align: "start",
                    dragFree: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2">
                    {currentProducts.map((prod) => (
                      <CarouselItem key={prod} className="pl-2 basis-auto">
                        <button
                          type="button"
                          onClick={() => handleProductSelect(prod)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm whitespace-nowrap ${
                            selectedProducts.includes(prod)
                              ? "bg-blue-100 text-blue-700 shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm"
                          }`}
                        >
                          {prod}
                          {selectedProducts.includes(prod) && prod !== "All Products" && (
                            <span className="ml-2 text-blue-600">✓</span>
                          )}
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {canScrollProductsPrev && (
                    <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 bg-white shadow-md border border-gray-200 hover:bg-gray-50" />
                  )}
                  {canScrollProductsNext && (
                    <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 bg-white shadow-md border border-gray-200 hover:bg-gray-50" />
                  )}
                </Carousel>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100 px-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-gray-200 hover:bg-gray-50"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              type="button"
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
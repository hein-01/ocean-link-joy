import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Filter, Truck, Store, MapPin } from "lucide-react";
import { FiltersModal } from "./FiltersModal";
import { LocationsModal } from "./LocationsModal";

interface SearchFiltersProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onLocationChange: (location: string) => void;
  onProductChange?: (products: string[] | string) => void;
  onDeliveryFilter?: (type: string) => void;
  categories: string[];
  initialSearchTerm?: string;
  initialCategory?: string;
}

export const SearchFilters = ({
  onSearchChange,
  onCategoryChange,
  onLocationChange,
  onProductChange,
  onDeliveryFilter,
  categories,
  initialSearchTerm = "",
  initialCategory = "all",
}: SearchFiltersProps) => {
  const [search, setSearch] = useState(initialSearchTerm);
  const [selectedDelivery, setSelectedDelivery] = useState<string[]>([]);
  const [resetVersion, setResetVersion] = useState(0);

  useEffect(() => {
    setSearch(initialSearchTerm);
  }, [initialSearchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(search);
  };

  return (
    <Card className="p-6 mb-6 shadow-lg md:border-2 border-b-2 border-t-0 border-l-0 border-r-0 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/30 md:mx-0 mx-0 md:rounded-lg rounded-none md:mt-0 mt-0 w-full">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-primary">
          <Filter className="h-5 w-5" />
          Search & Filters
        </div>
        
        <div className="space-y-2 md:space-y-4">
          {/* Desktop layout */}
          <div className="hidden md:flex gap-2">
            <div className="relative flex-1 flex">
              <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <Input
                  placeholder="Search businesses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-2 shadow-sm hover:shadow-md focus:shadow-lg focus:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500/20 transition-all duration-200 rounded-r-none border-r-0"
                />
              </form>
              <Button 
                type="button" 
                onClick={() => handleSearchSubmit(new Event('submit') as any)}
                className="shadow-md hover:shadow-lg transition-shadow duration-200 rounded-l-none"
              >
                Search
              </Button>
            </div>
            
            <FiltersModal key={`filters-${resetVersion}`}
              onSearchChange={onSearchChange}
              onCategoryChange={onCategoryChange}
              onLocationChange={onLocationChange}
              onProductChange={onProductChange}
              categories={categories}
              initialSearchTerm={initialSearchTerm}
              initialCategory={initialCategory}
              initialProduct={"All Products"}
            >
              <Button 
                type="button" 
                variant="outline"
                className="border-2 shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </FiltersModal>
            
            <LocationsModal key={`locations-${resetVersion}`} onLocationChange={onLocationChange}>
              <Button 
                type="button" 
                variant="outline"
                className="border-2 shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Locations
              </Button>
            </LocationsModal>
          </div>

          {/* Mobile layout */}
          <div className="md:hidden space-y-2">
            {/* Search input with search button */}
            <div className="flex w-full">
              <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <Input
                  placeholder="Search businesses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-2 shadow-sm hover:shadow-md focus:shadow-lg focus:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500/20 transition-all duration-200 rounded-r-none border-r-0 placeholder:text-sm w-full"
                />
              </form>
              <Button 
                type="button" 
                onClick={() => handleSearchSubmit(new Event('submit') as any)}
                className="shadow-md hover:shadow-lg transition-shadow duration-200 rounded-l-none"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Location and Filter buttons */}
            <div className="flex gap-1 w-full">
              <LocationsModal key={`locations-${resetVersion}`} onLocationChange={onLocationChange}>
                <Button 
                  type="button" 
                  variant="outline"
                  className="border-2 shadow-md hover:shadow-lg transition-shadow duration-200 flex-1 h-8 md:h-10"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Locations
                </Button>
              </LocationsModal>
              
              <FiltersModal key={`filters-${resetVersion}`}
                onSearchChange={onSearchChange}
                onCategoryChange={onCategoryChange}
                onLocationChange={onLocationChange}
                onProductChange={onProductChange}
                categories={categories}
                initialSearchTerm={initialSearchTerm}
                initialCategory={initialCategory}
                initialProduct={"All Products"}
              >
                <Button 
                  type="button" 
                  variant="outline"
                  className="border-2 shadow-md hover:shadow-lg transition-shadow duration-200 flex-1 h-8 md:h-10"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </FiltersModal>
            </div>
          </div>
          
          {/* Centered delivery and filter buttons */}
          <div className="flex gap-2 w-full md:w-auto md:justify-center">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              className={`border-2 shadow-md hover:shadow-lg transition-all duration-200 text-xs px-2 py-1 h-6 flex-1 md:h-9 md:px-4 md:text-sm md:flex-initial ${
                selectedDelivery.includes("Cash on Delivery") 
                  ? "text-green-700 border-green-500 bg-green-50" 
                  : "hover:text-green-700 hover:border-green-500 hover:bg-green-50"
              }`}
              onClick={() => {
                const newSelection = selectedDelivery.includes("Cash on Delivery")
                  ? selectedDelivery.filter(item => item !== "Cash on Delivery")
                  : [...selectedDelivery, "Cash on Delivery"];
                setSelectedDelivery(newSelection);
                onDeliveryFilter?.(newSelection.join(","));
              }}
            >
              Cash on Delivery
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              className={`border-2 shadow-md hover:shadow-lg transition-all duration-200 text-xs px-2 py-1 h-6 flex-1 md:h-9 md:px-4 md:text-sm md:flex-initial ${
                selectedDelivery.includes("Pickup In-Store") 
                  ? "text-blue-700 border-blue-500 bg-blue-50" 
                  : "hover:text-blue-700 hover:border-blue-500 hover:bg-blue-50"
              }`}
              onClick={() => {
                const newSelection = selectedDelivery.includes("Pickup In-Store")
                  ? selectedDelivery.filter(item => item !== "Pickup In-Store")
                  : [...selectedDelivery, "Pickup In-Store"];
                setSelectedDelivery(newSelection);
                onDeliveryFilter?.(newSelection.join(","));
              }}
            >
              Store Pickup
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              className="border-2 shadow-md hover:shadow-lg transition-shadow duration-200 text-xs px-2 py-1 h-6 flex-1 md:h-9 md:px-4 md:text-sm md:flex-initial"
              onClick={() => {
                setSearch("");
                setSelectedDelivery([]);
                onSearchChange("");
                onLocationChange("");
                onCategoryChange("all");
                onProductChange?.([]);
                onDeliveryFilter?.(""); // Reset delivery filters
                setResetVersion((v) => v + 1);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
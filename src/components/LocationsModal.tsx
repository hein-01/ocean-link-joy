import { useState, useEffect, cloneElement, isValidElement } from "react";
import { MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";

interface Location {
  id: string;
  province_district: string;
  towns: string[];
}

interface LocationsModalProps {
  onLocationChange: (location: string) => void;
  children: React.ReactNode;
}

export const LocationsModal = ({
  onLocationChange,
  children,
}: LocationsModalProps) => {
  const [open, setOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [selectedTown, setSelectedTown] = useState<string>("all");
  const [locations, setLocations] = useState<Location[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [towns, setTowns] = useState<string[]>([]);
  const [canScrollPrevProvince, setCanScrollPrevProvince] = useState(false);
  const [canScrollPrevTown, setCanScrollPrevTown] = useState(false);

  // Fetch locations from database
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from("locations")
          .select("id, province_district, towns")
          .order("province_district");

        if (error) throw error;

        setLocations(data || []);
        
        // Extract unique provinces
        const uniqueProvinces = Array.from(
          new Set(data?.map(loc => loc.province_district) || [])
        );
        setProvinces(uniqueProvinces);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);

  // Update towns when province changes
  useEffect(() => {
    if (selectedProvince === "all") {
      setTowns([]);
      setSelectedTown("all");
    } else {
      const provinceTowns = locations
        .filter(loc => loc.province_district === selectedProvince)
        .flatMap(loc => loc.towns || []);
      // Remove duplicates
      const uniqueTowns = Array.from(new Set(provinceTowns));
      setTowns(uniqueTowns);
      setSelectedTown("all");
    }
  }, [selectedProvince, locations]);

  // Check if filters are active
  const isFiltersActive = selectedProvince !== "all" || selectedTown !== "all";

  const handleSearch = () => {
    let locationFilter = "";
    
    if (selectedProvince !== "all" && selectedTown !== "all") {
      locationFilter = `${selectedTown}, ${selectedProvince}`;
    } else if (selectedProvince !== "all") {
      locationFilter = selectedProvince;
    } else if (selectedTown !== "all") {
      locationFilter = selectedTown;
    }
    
    onLocationChange(locationFilter);
    setOpen(false);
  };

  const handleReset = () => {
    setSelectedProvince("all");
    setSelectedTown("all");
    onLocationChange("");
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
            Select Location
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col min-h-0 overflow-hidden">
          <div className="py-4 px-1 space-y-6">
            {/* Province/District Section */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Province/District
              </Label>
              <div className="w-full overflow-hidden relative">
                <Carousel
                  opts={{
                    align: "start",
                    dragFree: true,
                  }}
                  className="w-full"
                  setApi={(api) => {
                    if (!api) return;
                    
                    const updateScrollState = () => {
                      setCanScrollPrevProvince(api.canScrollPrev());
                    };
                    
                    api.on('select', updateScrollState);
                    api.on('reInit', updateScrollState);
                    updateScrollState();
                  }}
                >
                  <CarouselContent className="-ml-2">
                    <CarouselItem className="pl-2 basis-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedProvince("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm whitespace-nowrap ${
                          selectedProvince === "all"
                            ? "bg-blue-100 text-blue-700 shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm"
                        }`}
                      >
                        Any Province
                      </button>
                    </CarouselItem>
                    {provinces.map((province) => (
                      <CarouselItem key={province} className="pl-2 basis-auto">
                        <button
                          type="button"
                          onClick={() => setSelectedProvince(province)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm whitespace-nowrap ${
                            selectedProvince === province
                              ? "bg-blue-100 text-blue-700 shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm"
                          }`}
                        >
                          {province}
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {canScrollPrevProvince && (
                    <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 bg-white shadow-md border border-gray-200 hover:bg-gray-50" />
                  )}
                  <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 bg-white shadow-md border border-gray-200 hover:bg-gray-50" />
                </Carousel>
              </div>
            </div>

            {/* Towns Section */}
            {selectedProvince !== "all" && towns.length > 0 && (
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">
                  Town
                </Label>
                <div className="w-full overflow-hidden relative">
                  <Carousel
                    opts={{
                      align: "start",
                      dragFree: true,
                    }}
                    className="w-full"
                    setApi={(api) => {
                      if (!api) return;
                      
                      const updateScrollState = () => {
                        setCanScrollPrevTown(api.canScrollPrev());
                      };
                      
                      api.on('select', updateScrollState);
                      api.on('reInit', updateScrollState);
                      updateScrollState();
                    }}
                  >
                    <CarouselContent className="-ml-2">
                      <CarouselItem className="pl-2 basis-auto">
                        <button
                          type="button"
                          onClick={() => setSelectedTown("all")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm whitespace-nowrap ${
                            selectedTown === "all"
                              ? "bg-blue-100 text-blue-700 shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm"
                          }`}
                        >
                          Any Town
                        </button>
                      </CarouselItem>
                      {towns.map((town) => (
                        <CarouselItem key={town} className="pl-2 basis-auto">
                          <button
                            type="button"
                            onClick={() => setSelectedTown(town)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm whitespace-nowrap ${
                              selectedTown === town
                                ? "bg-blue-100 text-blue-700 shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm"
                            }`}
                          >
                            {town}
                          </button>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {canScrollPrevTown && (
                      <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 bg-white shadow-md border border-gray-200 hover:bg-gray-50" />
                    )}
                    <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 bg-white shadow-md border border-gray-200 hover:bg-gray-50" />
                  </Carousel>
                </div>
              </div>
            )}
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
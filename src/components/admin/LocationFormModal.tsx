import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Location {
  id: string;
  province_district: string;
  towns: string[];
  created_at: string;
}

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: Location | null;
}

export function LocationFormModal({ isOpen, onClose, location }: LocationFormModalProps) {
  const [provinceDistrict, setProvinceDistrict] = useState("");
  const [towns, setTowns] = useState<string[]>([]);
  const [newTown, setNewTown] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (location) {
      setProvinceDistrict(location.province_district);
      setTowns(location.towns || []);
    } else {
      setProvinceDistrict("");
      setTowns([]);
    }
    setNewTown("");
  }, [location]);

  const addTown = () => {
    if (newTown.trim() && !towns.includes(newTown.trim())) {
      setTowns([...towns, newTown.trim()]);
      setNewTown("");
    }
  };

  const removeTown = (townToRemove: string) => {
    setTowns(towns.filter(town => town !== townToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!provinceDistrict.trim() || towns.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in province/district and add at least one town",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (location) {
        // Update existing location
        const { error } = await supabase
          .from('locations')
          .update({
            province_district: provinceDistrict.trim(),
            towns: towns,
          })
          .eq('id', location.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Location updated successfully",
        });
      } else {
        // Create new location
        const { error } = await supabase
          .from('locations')
          .insert([{
            province_district: provinceDistrict.trim(),
            towns: towns,
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Location created successfully",
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving location:', error);
      toast({
        title: "Error",
        description: `Failed to ${location ? 'update' : 'create'} location`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setProvinceDistrict("");
    setTowns([]);
    setNewTown("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {location ? 'Edit Location' : 'Add New Location'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="province-district">Province/District</Label>
            <Input
              id="province-district"
              type="text"
              value={provinceDistrict}
              onChange={(e) => setProvinceDistrict(e.target.value)}
              placeholder="Enter province or district name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="towns">Towns</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="new-town"
                  type="text"
                  value={newTown}
                  onChange={(e) => setNewTown(e.target.value)}
                  placeholder="Enter town name"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTown();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTown}
                  disabled={!newTown.trim()}
                >
                  Add
                </Button>
              </div>
              
              {/* Display added towns */}
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-muted/50">
                {towns.length === 0 ? (
                  <span className="text-muted-foreground text-sm">No towns added yet</span>
                ) : (
                  towns.map((town, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                    >
                      {town}
                      <button
                        type="button"
                        onClick={() => removeTown(town)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (location ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
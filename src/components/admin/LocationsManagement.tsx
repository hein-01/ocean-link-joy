import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LocationFormModal } from "./LocationFormModal";

interface Location {
  id: string;
  province_district: string;
  towns: string[];
  created_at: string;
}

export function LocationsManagement() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const { toast } = useToast();

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('province_district', { ascending: true });

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch locations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
      
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingLocation(null);
    fetchLocations();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <CardTitle>Locations</CardTitle>
          </div>
          <Button onClick={handleAddNew} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Location</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Province/District</TableHead>
                <TableHead>Town</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    No locations found. Add your first location!
                  </TableCell>
                </TableRow>
              ) : (
                locations.map((location) => (
                  <TableRow key={location.id}>
                  <TableCell className="font-medium">
                    {location.province_district}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {location.towns.map((town, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                        >
                          {town}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(location)}
                          className="flex items-center space-x-1"
                        >
                          <Pencil className="h-3 w-3" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(location.id)}
                          className="flex items-center space-x-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <LocationFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        location={editingLocation}
      />
    </Card>
  );
}
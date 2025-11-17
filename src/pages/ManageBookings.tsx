import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { BackButton } from "@/components/BackButton";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle, XCircle } from "lucide-react";

type Business = {
  id: string;
  name: string;
};

type Resource = {
  id: string;
  name: string;
  business_id: string;
};

type Slot = {
  id: string;
  start_time: string;
  end_time: string;
  slot_price: number;
  is_booked: boolean;
  resource_id: string;
  booking_id: string | null;
};

export default function ManageBookings() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [selectedResource, setSelectedResource] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [updatingSlot, setUpdatingSlot] = useState<string | null>(null);

  // Fetch user's businesses
  useEffect(() => {
    if (user?.id) {
      fetchBusinesses();
    }
  }, [user?.id]);

  // Fetch resources when business is selected
  useEffect(() => {
    if (selectedBusiness) {
      fetchResources(selectedBusiness);
    } else {
      setResources([]);
      setSelectedResource("");
    }
  }, [selectedBusiness]);

  // Fetch slots when resource and date are selected
  useEffect(() => {
    if (selectedResource && selectedDate) {
      fetchSlots(selectedResource, selectedDate);
    } else {
      setSlots([]);
    }
  }, [selectedResource, selectedDate]);

  // Real-time subscription for slot updates
  useEffect(() => {
    if (!selectedResource || !selectedDate) return;

    const channel = supabase
      .channel('slots_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'slots',
          filter: `resource_id=eq.${selectedResource}`
        },
        (payload) => {
          console.log('Slot changed:', payload);
          fetchSlots(selectedResource, selectedDate);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedResource, selectedDate]);

  const fetchBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('owner_id', user!.id)
        .order('name');

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast({
        title: "Error",
        description: "Failed to load your businesses",
        variant: "destructive",
      });
    }
  };

  const fetchResources = async (businessId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_resources')
        .select('id, name, business_id')
        .eq('business_id', businessId)
        .order('name');

      if (error) throw error;
      setResources(data || []);
      if (data && data.length > 0) {
        setSelectedResource(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: "Error",
        description: "Failed to load resources",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (resourceId: string, date: Date) => {
    setLoading(true);
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      const [year, month, dayNum] = dateString.split("-").map(Number);
      const myanmarOffsetMs = 6.5 * 60 * 60 * 1000;
      const startUTC = new Date(Date.UTC(year, month - 1, dayNum, 0, 0, 0) - myanmarOffsetMs);
      const endUTC = new Date(Date.UTC(year, month - 1, dayNum + 1, 0, 0, 0) - myanmarOffsetMs);

      const { data, error } = await supabase
        .from('slots')
        .select('id, start_time, end_time, slot_price, is_booked, resource_id, booking_id')
        .eq('resource_id', resourceId)
        .gte('start_time', startUTC.toISOString())
        .lt('start_time', endUTC.toISOString())
        .order('start_time');

      if (error) throw error;
      setSlots(data || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast({
        title: "Error",
        description: "Failed to load slots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSlotStatus = async (slotId: string, currentStatus: boolean) => {
    setUpdatingSlot(slotId);
    try {
      const { error } = await supabase
        .from('slots')
        .update({ is_booked: !currentStatus })
        .eq('id', slotId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Slot ${!currentStatus ? 'marked as booked' : 'marked as available'}`,
      });

      // Refresh slots
      if (selectedResource && selectedDate) {
        fetchSlots(selectedResource, selectedDate);
      }
    } catch (error) {
      console.error('Error updating slot:', error);
      toast({
        title: "Error",
        description: "Failed to update slot status",
        variant: "destructive",
      });
    } finally {
      setUpdatingSlot(null);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'hh:mm a');
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    navigate("/auth/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Manage Bookings</h1>
          <p className="text-muted-foreground">
            Manually book or unbook slots for your business resources
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Filters */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Select business, resource, and date</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Business Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Business</label>
                <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a business" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map((business) => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Resource Selection */}
              {selectedBusiness && resources.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Resource</label>
                  <Select value={selectedResource} onValueChange={setSelectedResource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Date Selection */}
              {selectedResource && (
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Select Date
                  </label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Slots */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Available Slots</CardTitle>
              <CardDescription>
                {selectedDate && `Showing slots for ${format(selectedDate, 'MMMM dd, yyyy')}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : !selectedResource ? (
                <div className="text-center py-12 text-muted-foreground">
                  Please select a business and resource to view slots
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No slots available for the selected date
                </div>
              ) : (
                <div className="space-y-2">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Price: {slot.slot_price} MMK
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={slot.is_booked ? "destructive" : "default"}>
                          {slot.is_booked ? "Booked" : "Available"}
                        </Badge>
                        <Button
                          size="sm"
                          variant={slot.is_booked ? "outline" : "default"}
                          onClick={() => toggleSlotStatus(slot.id, slot.is_booked)}
                          disabled={updatingSlot === slot.id}
                        >
                          {updatingSlot === slot.id ? (
                            "Updating..."
                          ) : slot.is_booked ? (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Mark Available
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Booked
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { fetchResources, fetchDailySlots, fetchWeeklySchedule } from "@/lib/bookingUtils";
import { format } from "date-fns";

interface Resource {
  id: string;
  name: string;
}

interface Slot {
  id: string;
  start_time: string;
  end_time: string;
  slot_price: number;
  is_booked: boolean;
}

interface WeeklySchedule {
  day_of_week: number;
  is_open: boolean;
}

export default function BookingAvailability() {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("businessId");
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load resources on mount
  useEffect(() => {
    if (businessId) {
      loadResources();
    }
  }, [businessId]);

  // Load weekly schedule when resource changes
  useEffect(() => {
    if (selectedResource) {
      loadWeeklySchedule();
      loadSlots();
    }
  }, [selectedResource]);

  // Load slots when date changes
  useEffect(() => {
    if (selectedResource && selectedDate) {
      loadSlots();
    }
  }, [selectedDate]);

  const loadResources = async () => {
    try {
      const data = await fetchResources(businessId!);
      setResources(data);
      if (data.length > 0) {
        setSelectedResource(data[0].id);
      }
    } catch (error: any) {
      toast.error("Failed to load venues");
    }
  };

  const loadWeeklySchedule = async () => {
    try {
      const data = await fetchWeeklySchedule(selectedResource);
      setWeeklySchedule(data);
    } catch (error: any) {
      console.error("Failed to load weekly schedule:", error);
    }
  };

  const loadSlots = async () => {
    if (!selectedResource || !selectedDate) return;
    
    setLoading(true);
    try {
      const dateString = format(selectedDate, "yyyy-MM-dd");
      const data = await fetchDailySlots(selectedResource, dateString);
      setSlots(data);
    } catch (error: any) {
      toast.error("Failed to load available slots");
    } finally {
      setLoading(false);
    }
  };

  const toggleSlot = (slotId: string, isBooked: boolean) => {
    if (isBooked) return;
    
    setSelectedSlots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(slotId)) {
        newSet.delete(slotId);
      } else {
        newSet.add(slotId);
      }
      return newSet;
    });
  };

  const totalCharges = slots
    .filter((slot) => selectedSlots.has(slot.id))
    .reduce((sum, slot) => sum + slot.slot_price, 0);

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  const isDateDisabled = (date: Date) => {
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Convert Sunday from 0 to 7
    const schedule = weeklySchedule.find((s) => s.day_of_week === dayOfWeek);
    return schedule ? !schedule.is_open : false;
  };

  const handleBookNow = () => {
    if (totalCharges === 0) return;
    
    toast.success("Proceeding to checkout...");
    // TODO: Implement checkout logic
  };

  if (!businessId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Invalid booking link</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pb-24">
      <div className="container mx-auto px-4 pt-24 pb-8">
        <BackButton />
        
        <div className="mt-8 space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Check Availability</h1>
            <p className="text-muted-foreground">Select a venue, date, and time slots to book</p>
          </div>

          {/* Venue Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Venue</label>
            <Select value={selectedResource} onValueChange={setSelectedResource}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a venue" />
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

          {/* Calendar and Schedule Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Calendar */}
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Select Date</h2>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={isDateDisabled}
                className="rounded-md border"
              />
              <p className="text-xs text-muted-foreground mt-2">
                * Grayed out dates are closed
              </p>
            </Card>

            {/* Schedule Table */}
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">
                Available Slots - {format(selectedDate, "MMM dd, yyyy")}
              </h2>
              
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading slots...</p>
              ) : slots.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No slots available for this date</p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      onClick={() => toggleSlot(slot.id, slot.is_booked)}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        slot.is_booked
                          ? "bg-muted/50 border-muted cursor-not-allowed"
                          : selectedSlots.has(slot.id)
                          ? "bg-primary/10 border-primary"
                          : "bg-background border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          slot.is_booked
                            ? "bg-destructive/20"
                            : "bg-success/20"
                        }`}>
                          {slot.is_booked ? (
                            <X className="w-5 h-5 text-destructive" />
                          ) : (
                            <Check className="w-5 h-5 text-success" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {slot.is_booked ? "Booked" : "Available"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${slot.slot_price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-black text-white py-4 px-4 shadow-lg z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70">Total Charges</p>
            <p className="text-2xl font-bold">${totalCharges.toFixed(2)}</p>
          </div>
          <Button
            size="lg"
            disabled={totalCharges === 0}
            onClick={handleBookNow}
            className="bg-white text-black hover:bg-white/90 font-semibold px-8"
          >
            BOOK NOW
          </Button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, startOfDay, endOfDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Minimal currency formatter – adjust currency if needed
const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

// Types from generated supabase types
type Resource = Pick<Tables<"business_resources">, "id" | "name" | "business_id">;

type SlotRow = Pick<
  Tables<"slots">,
  "id" | "start_time" | "end_time" | "is_booked" | "slot_price" | "resource_id"
>;

export type ServiceAvailabilityProps = {
  initialResourceId?: string; // also read from URL ?resourceId=
  initialDate?: string | Date; // also read from URL ?date=YYYY-MM-DD
};

function toISODateOnly(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function toDisplayHeader(d: Date) {
  // Example: AVAILABLE SCHEDULE (11 NOV 2025)
  return format(d, "d LLL yyyy").toUpperCase();
}

function formatTimeRange(startISO: string, endISO: string) {
  try {
    const s = new Date(startISO);
    const e = new Date(endISO);
    const sStr = format(s, "ha").toLowerCase();
    const eStr = format(e, "ha").toLowerCase();
    return `${sStr.replace("m", "m")} - ${eStr.replace("m", "m")}`; // keep am/pm lowercase like screenshot
  } catch {
    return `${startISO} - ${endISO}`;
  }
}

export default function ServiceAvailability(props: ServiceAvailabilityProps) {
  // From URL if available
  const url = new URL(location.href);
  const urlResourceId = url.searchParams.get("resourceId") || undefined;
  const urlDate = url.searchParams.get("date") || undefined; // YYYY-MM-DD

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (props.initialDate instanceof Date) return props.initialDate;
    if (typeof props.initialDate === "string") return new Date(props.initialDate);
    if (urlDate) return new Date(urlDate);
    return new Date();
  });

  const [initialResourceId] = useState<string | undefined>(
    props.initialResourceId || urlResourceId
  );

  const [resources, setResources] = useState<Array<Pick<Resource, "id" | "name">>>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string | undefined>(
    props.initialResourceId || urlResourceId
  );
  const [selectedResourceName, setSelectedResourceName] = useState<string>("");
  const [loadingResources, setLoadingResources] = useState(false);
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedSlotIds, setSelectedSlotIds] = useState<Set<string>>(new Set());

  const total = useMemo(() => {
    const selected = new Set(selectedSlotIds);
    return slots
      .filter((s) => selected.has(s.id))
      .reduce((sum, s) => sum + (s.slot_price || 0), 0);
  }, [selectedSlotIds, slots]);

  // Step 1: fetch initial resource to learn business_id, then all sibling resources
  useEffect(() => {
    async function loadResources() {
      if (!initialResourceId) return;
      setLoadingResources(true);
      setError(null);
      try {
        const { data: initialRes, error: rerr } = await supabase
          .from("business_resources")
          .select("id,name,business_id")
          .eq("id", initialResourceId)
          .maybeSingle();
        if (rerr) throw rerr;
        if (!initialRes) throw new Error("Resource not found");

        // Remember name for table column
        setSelectedResourceName(initialRes.name);

        const { data: siblings, error: serr } = await supabase
          .from("business_resources")
          .select("id,name")
          .eq("business_id", (initialRes as Resource).business_id)
          .order("name", { ascending: true });
        if (serr) throw serr;
        setResources(siblings || []);

        // Ensure selectedResourceId is valid
        setSelectedResourceId((prev) => prev || initialRes.id);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load resources";
        setError(message);
      } finally {
        setLoadingResources(false);
      }
    }
    loadResources();
  }, [initialResourceId]);

  // Step 2: load slots when resource/date changes
  useEffect(() => {
    async function loadSlots() {
      if (!selectedResourceId || !selectedDate) return;
      setLoadingSlots(true);
      setError(null);
      setSelectedSlotIds(new Set()); // reset selections when date/resource changes
      try {
        const start = startOfDay(selectedDate);
        const end = endOfDay(selectedDate);

        const { data, error: serr } = await supabase
          .from("slots")
          .select("id, start_time, end_time, is_booked, slot_price, resource_id")
          .eq("resource_id", selectedResourceId)
          .gte("start_time", start.toISOString())
          .lt("start_time", end.toISOString())
          .order("start_time", { ascending: true });
        if (serr) throw serr;
        setSlots(data || []);

        // Also update selected resource name for the table column
        const r = resources.find((x) => x.id === selectedResourceId);
        if (r) setSelectedResourceName(r.name);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load slots";
        setError(message);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [selectedResourceId, selectedDate, resources]);

  function toggleSelect(slot: SlotRow) {
    if (slot.is_booked) return; // can't select booked slot
    setSelectedSlotIds((prev) => {
      const next = new Set(prev);
      if (next.has(slot.id)) next.delete(slot.id);
      else next.add(slot.id);
      return next;
    });
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted/20 to-background flex flex-col">
      <div className="max-w-6xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Venue Selection Card */}
        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle className="text-foreground">Select Venue</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedResourceId || ""}
              onValueChange={(value) => setSelectedResourceId(value)}
              disabled={loadingResources}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a venue" />
              </SelectTrigger>
              <SelectContent>
                {resources.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Calendar Card - Centered */}
        <Card className="shadow-xl border-primary/20">
          <CardHeader>
            <CardTitle className="text-center text-foreground">Choose Your Date</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <div className="inline-block">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                showOutsideDays
                weekStartsOn={1}
                className="pointer-events-auto"
                styles={{
                  caption: { textTransform: "capitalize" },
                  day: { borderRadius: 8 },
                  head_cell: { fontWeight: 600 },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule Table Card */}
        <Card className="shadow-lg border-primary/10">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-sm md:text-base font-semibold tracking-wide text-foreground">
              AVAILABLE SCHEDULE ({toDisplayHeader(selectedDate)})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary/10 text-foreground border-b border-primary/20">
                    <th className="text-left px-4 py-3 font-semibold">Time</th>
                    <th className="text-left px-4 py-3 font-semibold">Price</th>
                    <th className="text-left px-4 py-3 font-semibold">{selectedResourceName || "Resource"}</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingSlots && (
                    <tr>
                      <td className="px-4 py-8 text-center text-muted-foreground" colSpan={3}>
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                          <span>Loading schedule…</span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!loadingSlots && slots.length === 0 && (
                    <tr>
                      <td className="px-4 py-8 text-center text-muted-foreground" colSpan={3}>
                        No slots found for {toISODateOnly(selectedDate)}
                      </td>
                    </tr>
                  )}
                  {!loadingSlots && slots.map((slot, idx) => {
                    const isSelected = selectedSlotIds.has(slot.id);
                    const icon = slot.is_booked ? (
                      <XCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <CheckCircle2 className={`h-5 w-5 transition-colors ${isSelected ? "text-primary" : "text-green-500"}`} />
                    );
                    return (
                      <tr
                        key={slot.id}
                        className={`
                          ${idx % 2 ? "bg-background" : "bg-muted/20"} 
                          ${!slot.is_booked ? "cursor-pointer hover:bg-primary/5 transition-colors" : "opacity-60"} 
                          ${isSelected ? "ring-2 ring-primary ring-inset bg-primary/10" : ""}
                        `}
                        onClick={() => toggleSelect(slot)}
                      >
                        <td className="px-4 py-4 font-medium">{formatTimeRange(slot.start_time, slot.end_time)}</td>
                        <td className="px-4 py-4 font-semibold text-primary">{currency.format(slot.slot_price)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {icon}
                            <span>{selectedResourceName || "Resource"}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-b-lg">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sticky footer / checkout with shadow */}
      <div className="sticky bottom-0 left-0 right-0 bg-primary text-primary-foreground shadow-2xl border-t border-primary/20">
        <div className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 md:px-8 py-4">
          <div className="text-center sm:text-left">
            <div className="text-xs tracking-wide opacity-90 uppercase">Total Charges</div>
            <div className="text-2xl md:text-3xl font-bold">{currency.format(total)}</div>
          </div>
          <Button
            size="lg"
            variant="secondary"
            className="w-full sm:w-auto px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            disabled={selectedSlotIds.size === 0}
            onClick={() => {
              // Placeholder booking handler – integrate your booking flow here
              console.log("Booking slots:", Array.from(selectedSlotIds));
            }}
          >
            BOOK NOW
          </Button>
        </div>
      </div>
    </div>
  );
}

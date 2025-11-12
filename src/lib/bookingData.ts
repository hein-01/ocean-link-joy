import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

// Shared types
export type ResourceLite = Pick<Tables<"business_resources">, "id" | "name">;
export type SlotLite = Pick<
  Tables<"slots">,
  "id" | "start_time" | "end_time" | "slot_price" | "is_booked" | "resource_id"
>;

export type SlotWithResource = SlotLite & { resource_name: string };
export type WeeklyRule = Pick<Tables<"business_schedules">, "day_of_week" | "is_open">;

// I. Data Fetching Functions (Foundation)

// 1) Fetch resources for a business
export async function fetchResources(businessId: string): Promise<ResourceLite[]> {
  const { data, error } = await supabase
    .from("business_resources")
    .select("id,name")
    .eq("business_id", businessId)
    .order("name", { ascending: true });
  if (error) throw error;
  return data || [];
}

// 2) Fetch all daily slots for a resource on a given date (YYYY-MM-DD)
export async function fetchDailySlots(
  resourceId: string,
  dateString: string
): Promise<SlotWithResource[]> {
  const { data: resource, error: resourceError } = await supabase
    .from("business_resources")
    .select("id,business_id")
    .eq("id", resourceId)
    .maybeSingle();

  if (resourceError) throw resourceError;
  if (!resource?.business_id) {
    throw new Error("Resource does not belong to a business");
  }

  return fetchAllSlotsForBusiness(resource.business_id, dateString);
}

// Fetch slots for every resource under a business for the provided date
export async function fetchAllSlotsForBusiness(
  businessId: string,
  dateString: string
): Promise<SlotWithResource[]> {
  const [year, month, dayNum] = dateString.split("-").map(Number);
  const myanmarOffsetMs = 6.5 * 60 * 60 * 1000; // UTC+6:30
  const startUTC = new Date(Date.UTC(year, month - 1, dayNum, 0, 0, 0) - myanmarOffsetMs);
  const endUTC = new Date(Date.UTC(year, month - 1, dayNum + 1, 0, 0, 0) - myanmarOffsetMs);

  const { data, error } = await supabase
    .from("slots")
    .select(
      `id, start_time, end_time, slot_price, is_booked, resource_id,
       business_resources:resource_id (id, name, business_id)`
    )
    .eq("business_resources.business_id", businessId)
    .gte("start_time", startUTC.toISOString())
    .lt("start_time", endUTC.toISOString())
    .order("start_time", { ascending: true });

  if (error) throw error;

  const slotsWithResources: SlotWithResource[] = (data || [])
    .filter((slot) => slot.business_resources)
    .map((slot) => ({
      id: slot.id,
      start_time: slot.start_time,
      end_time: slot.end_time,
      slot_price: slot.slot_price,
      is_booked: slot.is_booked,
      resource_id: slot.resource_id,
      resource_name: slot.business_resources.name,
    }));

  return slotsWithResources;
}

// 3) Fetch weekly schedule rules for a resource
export async function fetchWeeklySchedule(resourceId: string): Promise<WeeklyRule[]> {
  const { data, error } = await supabase
    .from("business_schedules")
    .select("day_of_week, is_open")
    .eq("resource_id", resourceId);
  if (error) throw error;
  return data || [];
}

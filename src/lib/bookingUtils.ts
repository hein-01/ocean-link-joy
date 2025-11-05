import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch all resources for a given business
 */
export async function fetchResources(businessId: string) {
  const { data, error } = await supabase
    .from('business_resources')
    .select('id, name')
    .eq('business_id', businessId)
    .order('name');

  if (error) throw error;
  return data || [];
}

/**
 * Fetch all time slots for a specific resource on a given date
 */
export async function fetchDailySlots(resourceId: string, dateString: string) {
  // Create start and end of day timestamps
  const startOfDay = new Date(dateString);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(dateString);
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('slots')
    .select('id, start_time, end_time, slot_price, is_booked')
    .eq('resource_id', resourceId)
    .gte('start_time', startOfDay.toISOString())
    .lte('start_time', endOfDay.toISOString())
    .order('start_time');

  if (error) throw error;
  return data || [];
}

/**
 * Fetch weekly schedule (recurring rules) for a resource
 */
export async function fetchWeeklySchedule(resourceId: string) {
  const { data, error } = await supabase
    .from('business_schedules')
    .select('day_of_week, is_open, open_time, close_time')
    .eq('resource_id', resourceId)
    .order('day_of_week');

  if (error) throw error;
  return data || [];
}

/**
 * Create a new pricing rule for a resource
 */
export async function createPricingRule(pricingRule: {
  resource_id: string;
  rule_name: string;
  price_override: number;
  day_of_week: number[];
  start_time: string;
  end_time: string;
}) {
  const { data, error } = await supabase
    .from('resource_pricing_rules' as any)
    .insert(pricingRule as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch pricing rules for a resource
 */
export async function fetchPricingRules(resourceId: string) {
  const { data, error } = await supabase
    .from('resource_pricing_rules' as any)
    .select('*')
    .eq('resource_id', resourceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Delete a pricing rule
 */
export async function deletePricingRule(ruleId: string) {
  const { error } = await supabase
    .from('resource_pricing_rules' as any)
    .delete()
    .eq('id', ruleId);

  if (error) throw error;
}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateSlotsRequest {
  resourceId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  slotDurationMinutes?: number; // Default 60
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { resourceId, startDate, endDate, slotDurationMinutes = 60 }: GenerateSlotsRequest = await req.json();

    console.log(`Generating slots for resource ${resourceId} from ${startDate} to ${endDate}`);

    // 1. Fetch resource details to get base_price
    const { data: resource, error: resourceError } = await supabase
      .from('business_resources')
      .select('id, name, base_price, business_id')
      .eq('id', resourceId)
      .single();

    if (resourceError || !resource) {
      console.error('Resource fetch error:', resourceError);
      return new Response(
        JSON.stringify({ error: 'Resource not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found resource: ${resource.name}, base_price: ${resource.base_price}`);

    // 2. Fetch weekly schedule rules for this resource
    const { data: schedules, error: scheduleError } = await supabase
      .from('business_schedules')
      .select('day_of_week, is_open, open_time, close_time')
      .eq('resource_id', resourceId);

    if (scheduleError) {
      console.error('Schedule fetch error:', scheduleError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch schedules' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${schedules?.length || 0} schedule rules`);

    // 3. Fetch pricing rules for this resource
    const { data: pricingRules, error: pricingError } = await supabase
      .from('resource_pricing_rules')
      .select('rule_name, day_of_week, start_time, end_time, price_override')
      .eq('resource_id', resourceId);

    if (pricingError) {
      console.error('Pricing rules fetch error:', pricingError);
      // Don't fail - just use base price
    }

    console.log(`Found ${pricingRules?.length || 0} pricing rules`);

    // Helper function to check if a time falls within a pricing rule
    const getPriceForSlot = (slotStart: Date, dayOfWeek: number): number => {
      if (!pricingRules || pricingRules.length === 0) {
        console.log(`No pricing rules found, using base price: ${resource.base_price}`);
        return resource.base_price || 0;
      }

      // Convert UTC time to Myanmar time (UTC+6:30)
      const myanmarOffset = 6.5 * 60; // 6.5 hours in minutes
      const myanmarTime = new Date(slotStart.getTime() + myanmarOffset * 60 * 1000);
      
      const hours = myanmarTime.getUTCHours().toString().padStart(2, '0');
      const minutes = myanmarTime.getUTCMinutes().toString().padStart(2, '0');
      const seconds = myanmarTime.getUTCSeconds().toString().padStart(2, '0');
      const slotTime = `${hours}:${minutes}:${seconds}`;

      console.log(`Slot UTC time: ${slotStart.toISOString()}, Myanmar time: ${slotTime}, day: ${dayOfWeek}`);

      for (const rule of pricingRules) {
        console.log(`Checking rule "${rule.rule_name}": slotTime=${slotTime}, dayOfWeek=${dayOfWeek}, ruleDays=${JSON.stringify(rule.day_of_week)}, start=${rule.start_time}, end=${rule.end_time}`);
        
        const ruleDaysRaw = rule.day_of_week || [];
        const normalizedRuleDays = ruleDaysRaw.map((d: any) => {
          const n = parseInt(d as string, 10);
          if (isNaN(n)) return d;
          return (n === 0 ? 7 : n).toString();
        });
        if (normalizedRuleDays.length > 0 && !normalizedRuleDays.includes(dayOfWeek.toString())) {
          console.log(`  -> Day ${dayOfWeek} not in ruleDays (${JSON.stringify(normalizedRuleDays)}), skipping`);
          continue;
        }

        // Check if slot time falls within rule's time range
        if (slotTime >= rule.start_time && slotTime < rule.end_time) {
          console.log(`✓ APPLYING rule "${rule.rule_name}" - Price: ${rule.price_override} (was ${resource.base_price})`);
          return rule.price_override;
        } else {
          console.log(`  -> Time ${slotTime} not in range [${rule.start_time}, ${rule.end_time})`);
        }
      }

      console.log(`No matching rule found, using base price: ${resource.base_price}`);
      return resource.base_price || 0;
    };

    // 4. Create a map of day_of_week -> schedule
    const scheduleMap = new Map();
    schedules?.forEach((s) => {
      scheduleMap.set(s.day_of_week, s);
    });

    // 4. Generate slots for each day in the date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const slotsToInsert = [];

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      // Day of week based on the calendar date (Monday=1..Sunday=7)
      const jsDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())).getUTCDay();
      const dayOfWeek = jsDay === 0 ? 7 : jsDay;
      const schedule = scheduleMap.get(dayOfWeek);

      console.log(`Processing ${date.toISOString().split('T')[0]}, day_of_week: ${dayOfWeek}`);

      // Skip if day is not open
      if (!schedule || !schedule.is_open) {
        console.log(`Skipping - not open`);
        continue;
      }

      // Parse open and close times
      const [openHour, openMin] = schedule.open_time.split(':').map(Number);
      const [closeHour, closeMin] = schedule.close_time.split(':').map(Number);

      // Generate slots for this day (interpret schedule times in Myanmar local time)
      const myanmarOffsetMs = 6.5 * 60 * 60 * 1000; // UTC+6:30
      const y = date.getUTCFullYear();
      const m = date.getUTCMonth();
      const d = date.getUTCDate();
      // Build UTC instants that correspond to the local Myanmar schedule times
      let currentTime = new Date(Date.UTC(y, m, d, openHour, openMin, 0) - myanmarOffsetMs);
      let closeTime = new Date(Date.UTC(y, m, d, closeHour, closeMin, 0) - myanmarOffsetMs);
      // If close time is past midnight, push to next day
      if (closeTime <= currentTime) {
        closeTime = new Date(Date.UTC(y, m, d + 1, closeHour, closeMin, 0) - myanmarOffsetMs);
      }

      console.log(`Generating slots from ${currentTime.toISOString()} to ${closeTime.toISOString()}`);

      while (currentTime < closeTime) {
        const slotEnd = new Date(currentTime);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDurationMinutes);

        // Don't create slot if it would end after close time
        if (slotEnd > closeTime) {
          break;
        }

        slotsToInsert.push({
          resource_id: resourceId,
          start_time: currentTime.toISOString(),
          end_time: slotEnd.toISOString(),
          slot_price: getPriceForSlot(currentTime, dayOfWeek),
          is_booked: false,
          slot_name: resource.name,
        });

        // Move to next slot
        currentTime = slotEnd;
      }
    }

    console.log(`Generated ${slotsToInsert.length} slots`);

    if (slotsToInsert.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No slots generated - check if resource has open schedules' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Regenerate: delete existing slots in the date range for this resource, then insert new ones
    const myanmarOffsetMs = 6.5 * 60 * 60 * 1000; // UTC+6:30
    const startRangeUTC = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), 0, 0, 0) - myanmarOffsetMs);
    const endRangeUTCExclusive = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1, 0, 0, 0) - myanmarOffsetMs);

    console.log(`Deleting existing slots for resource ${resourceId} between ${startRangeUTC.toISOString()} and ${endRangeUTCExclusive.toISOString()}`);
    const { error: deleteError, count: deleteCount } = await supabase
      .from('slots')
      .delete({ count: 'exact' })
      .eq('resource_id', resourceId)
      .gte('start_time', startRangeUTC.toISOString())
      .lt('start_time', endRangeUTCExclusive.toISOString());

    if (deleteError) {
      console.error('Delete existing slots error:', deleteError);
    } else {
      console.log(`Deleted ${deleteCount || 0} existing slots`);
    }

    const { data: insertedSlots, error: insertError } = await supabase
      .from('slots')
      .insert(slotsToInsert)
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to insert slots', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully inserted ${insertedSlots?.length || 0} slots`);

    return new Response(
      JSON.stringify({
        success: true,
        slotsCreated: insertedSlots?.length || 0,
        message: `Generated ${insertedSlots?.length || 0} slots for ${resource.name}`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

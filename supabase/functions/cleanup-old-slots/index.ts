import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting cleanup of old slots...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate cutoff date (7 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    const cutoffIso = cutoffDate.toISOString();

    console.log(`Deleting unbooked slots older than: ${cutoffIso}`);

    // Delete old unbooked slots
    const { data: deletedSlots, error } = await supabase
      .from('slots')
      .delete()
      .lt('end_time', cutoffIso)
      .eq('is_booked', false)
      .select('id');

    if (error) {
      console.error('Error deleting old slots:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    const deletedCount = deletedSlots?.length || 0;
    console.log(`Successfully deleted ${deletedCount} old unbooked slots`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        deletedCount,
        cutoffDate: cutoffIso,
        message: `Deleted ${deletedCount} unbooked slots older than ${cutoffIso}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Unexpected error during slot cleanup:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

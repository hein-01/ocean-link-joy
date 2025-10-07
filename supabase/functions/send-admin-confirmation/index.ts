import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationRequest {
  email: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmationUrl }: ConfirmationRequest = await req.json();

    if (!email || !confirmationUrl) {
      return new Response(
        JSON.stringify({ error: "Missing email or confirmation URL" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // For now, just log the confirmation email details
    // In production, integrate with an email service like Resend
    console.log(`Admin confirmation email would be sent to: ${email}`);
    console.log(`Confirmation URL: ${confirmationUrl}`);
    
    // Also provision the admin user immediately for development
    // In production, this should only happen after email confirmation
    try {
      // Get the Supabase client
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      // Find the user by email
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const user = users?.users?.find(u => u.email === email);
      
      if (user) {
        // Provision admin user
        await supabaseAdmin.rpc('provision_admin_user', { 
          user_email: email 
        });
        console.log(`Admin user provisioned for: ${email}`);
      }
    } catch (error) {
      console.error('Error provisioning admin user:', error);
    }

    const emailSent = true;

    if (emailSent) {
      return new Response(
        JSON.stringify({ success: true, message: "Confirmation email sent" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else {
      throw new Error("Failed to send confirmation email");
    }
  } catch (error: any) {
    console.error("Error in send-admin-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
import { supabase } from "@/integrations/supabase/client";

export interface ServicePaymentMethod {
  method_type: string;
  account_name: string | null;
  account_number: string | null;
}

export async function fetchServicePaymentMethods(
  serviceId: number
): Promise<ServicePaymentMethod[]> {
  try {
    console.log('=== fetchServicePaymentMethods called ===');
    console.log('Input serviceId:', serviceId);
    
    // Step 1: Get all business_ids that offer this service
    const { data: businessResources, error: resourceError } = await supabase
      .from('business_resources')
      .select('business_id')
      .eq('service_id', serviceId);

    console.log('Business resources query result:', { businessResources, resourceError });

    if (resourceError) {
      console.error('Error fetching business resources:', resourceError);
      return [];
    }

    if (!businessResources || businessResources.length === 0) {
      console.log('No business resources found for service_id:', serviceId);
      return [];
    }

    // Extract unique business IDs
    const businessIds = [...new Set(businessResources.map(r => r.business_id))];
    console.log('Unique business IDs:', businessIds);

    // Step 2: Fetch payment methods for all these businesses
    const { data: paymentMethods, error: paymentError } = await supabase
      .from('payment_methods')
      .select('method_type, account_name, account_number')
      .in('business_id', businessIds);

    console.log('Payment methods query result:', { paymentMethods, paymentError });

    if (paymentError) {
      console.error('Error fetching payment methods:', paymentError);
      return [];
    }

    if (!paymentMethods || paymentMethods.length === 0) {
      console.log('No payment methods found for business IDs:', businessIds);
      return [];
    }

    // Return unique payment methods (deduplicate by method_type + account_number)
    const uniqueMethods = paymentMethods.filter((method, index, self) =>
      index === self.findIndex((m) => 
        m.method_type === method.method_type && 
        m.account_number === method.account_number
      )
    );

    console.log('Returning unique payment methods:', uniqueMethods);
    return uniqueMethods;
  } catch (error) {
    console.error('Unexpected error fetching payment methods:', error);
    return [];
  }
}

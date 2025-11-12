import { supabase } from "@/integrations/supabase/client";

export interface ServicePaymentMethod {
  method_type: string;
  account_name: string | null;
  account_number: string | null;
}

export async function fetchServicePaymentMethods(
  serviceId: string
): Promise<ServicePaymentMethod[]> {
  try {
    console.log('=== fetchServicePaymentMethods called ===');
    console.log('Input serviceId:', serviceId);
    
    // Extract UUID from service ID if it has a prefix
    const extractUUID = (id: string) => {
      const parts = id.split('_');
      const lastPart = parts[parts.length - 1];
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(lastPart) ? lastPart : id;
    };

    const businessId = extractUUID(serviceId);
    console.log('Extracted businessId:', businessId);
    
    // Query payment methods directly using the business_id
    const { data: paymentMethods, error: paymentError } = await supabase
      .from('payment_methods')
      .select('method_type, account_name, account_number')
      .eq('business_id', businessId);

    console.log('Payment methods query result:', { paymentMethods, paymentError });

    if (paymentError) {
      console.error('Error fetching payment methods:', paymentError);
      return [];
    }

    if (!paymentMethods || paymentMethods.length === 0) {
      console.log('No payment methods found for business ID:', businessId);
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

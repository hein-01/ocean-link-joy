import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Get user from auth header
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const formData = await req.formData();
    
    console.log('Processing futsal listing submission for user:', user.id);

    // Parse form data
    const businessName = formData.get('businessName') as string;
    const numberOfFields = parseInt(formData.get('numberOfFields') as string);
    const streetAddress = formData.get('streetAddress') as string;
    const town = formData.get('town') as string;
    const province = formData.get('province') as string;
    const nearestBusStop = formData.get('nearestBusStop') as string;
    const nearestTrainStation = formData.get('nearestTrainStation') as string;
    const googleMapLocation = formData.get('googleMapLocation') as string;
    const facebook = formData.get('facebook') as string;
    const tiktok = formData.get('tiktok') as string;
    const infoWebsite = formData.get('infoWebsite') as string;
    const priceCurrency = formData.get('priceCurrency') as string;
    const posLitePrice = formData.get('posLitePrice') as string;
    const serviceListingPrice = formData.get('serviceListingPrice') as string;
    const posLiteOption = formData.get('posLiteOption') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const bookingStartTime = formData.get('bookingStartTime') as string;
    const bookingEndTime = formData.get('bookingEndTime') as string;
    const description = formData.get('description') as string;
    const facilities = formData.get('facilities') as string; // JSON string
    const rules = formData.get('rules') as string; // JSON string
    const popularProducts = formData.get('popularProducts') as string;
    const maxCapacity = parseInt(formData.get('maxCapacity') as string);
    
    // Parse field details
    const fieldDetailsStr = formData.get('fieldDetails') as string;
    const fieldDetails = JSON.parse(fieldDetailsStr);
    
    // Parse operating hours
    const operatingHoursStr = formData.get('operatingHours') as string;
    const operatingHours = JSON.parse(operatingHoursStr);
    
    // Parse payment methods
    const paymentMethodsStr = formData.get('paymentMethods') as string;
    const paymentMethodsData = JSON.parse(paymentMethodsStr);

    // Upload service images
    const imageFiles: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof File) {
        imageFiles.push(value);
      }
    }

    const uploadedImageUrls: string[] = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('business-assets')
        .upload(`services/${fileName}`, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('business-assets')
        .getPublicUrl(`services/${fileName}`);
      
      uploadedImageUrls.push(publicUrl);
    }

    // Upload receipt
    let receiptUrl = null;
    const receiptFile = formData.get('receiptFile') as File | null;
    if (receiptFile) {
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_receipt.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('business-assets')
        .upload(`receipts/${fileName}`, receiptFile, {
          contentType: receiptFile.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Receipt upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('business-assets')
        .getPublicUrl(`receipts/${fileName}`);
      
      receiptUrl = publicUrl;
    }

    // Calculate dates
    const today = new Date();
    const serviceListingExpired = new Date(today);
    serviceListingExpired.setDate(serviceListingExpired.getDate() + 365);
    
    let litePosValue = null;
    let litePosExpired = null;
    
    if (posLiteOption === 'accept') {
      litePosValue = 1;
      litePosExpired = new Date(today);
      litePosExpired.setDate(litePosExpired.getDate() + 365);
    }

    // 1. Create business record
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert({
        owner_id: user.id,
        name: businessName,
        address: streetAddress,
        towns: town,
        province_district: province,
        google_map_location: googleMapLocation,
        facebook_page: facebook,
        tiktok_url: tiktok,
        website: infoWebsite,
        nearest_bus_stop: nearestBusStop,
        nearest_train_station: nearestTrainStation,
        price_currency: priceCurrency,
        pos_lite_price: posLitePrice,
        service_listing_price: serviceListingPrice,
        lite_pos: litePosValue,
        lite_pos_expired: litePosExpired?.toISOString().split('T')[0],
        payment_status: 'to_be_confirmed',
        searchable_business: false,
      })
      .select()
      .single();

    if (businessError) {
      console.error('Business creation error:', businessError);
      throw businessError;
    }

    console.log('Business created:', business.id);

    // 2. Create services record FIRST to get the service_id
    // Generate unique service_key using business_id
    const uniqueServiceKey = `futsal_booking_${business.id}`;
    
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .insert({
        category_id: '2f12b3d2-35fa-4fda-ba30-6ca0ceab58d7', // Futsal category
        service_key: uniqueServiceKey,
        popular_products: popularProducts,
        services_description: description,
        facilities: facilities,
        rules: rules,
        service_images: uploadedImageUrls,
        contact_phone: phoneNumber,
        contact_available_start: bookingStartTime,
        contact_available_until: bookingEndTime,
        service_listing_receipt: receiptUrl,
        service_listing_expired: serviceListingExpired.toISOString().split('T')[0],
        default_duration_min: 60,
      })
      .select()
      .single();

    if (serviceError) {
      console.error('Service creation error:', serviceError);
      throw serviceError;
    }

    console.log('Service created:', service.id);

    // Calculate base price (minimum of all slot prices)
    const prices = fieldDetails.map((f: any) => {
      const price = parseFloat(f.price);
      if (isNaN(price) || !isFinite(price)) {
        throw new Error(`Invalid price value: ${f.price}`);
      }
      return price;
    });
    
    if (prices.length === 0) {
      throw new Error('No field details provided');
    }
    
    const basePrice = Math.min(...prices);
    console.log('Calculated base price:', basePrice);

    // 3. Create business_resources record using the service_id from step 2
    const { data: resource, error: resourceError } = await supabase
      .from('business_resources')
      .insert({
        business_id: business.id,
        name: businessName,
        service_id: service.id,
        max_capacity: maxCapacity,
        base_price: basePrice,
      })
      .select()
      .single();

    if (resourceError) {
      console.error('Resource creation error:', resourceError);
      throw resourceError;
    }

    console.log('Resource created:', resource.id);

    // 4. Create slots for each field
    const slotsToInsert = fieldDetails.map((field: any) => ({
      resource_id: resource.id,
      slot_name: field.name,
      slot_price: parseFloat(field.price),
      start_time: new Date().toISOString(), // Placeholder
      end_time: new Date().toISOString(), // Placeholder
      is_booked: false,
    }));

    const { error: slotsError } = await supabase
      .from('slots')
      .insert(slotsToInsert);

    if (slotsError) {
      console.error('Slots creation error:', slotsError);
      throw slotsError;
    }

    console.log('Slots created:', slotsToInsert.length);

    // 5. Create business_schedules for each day (only insert open days)
    const schedulesToInsert = operatingHours
      .map((hour: any, index: number) => {
        // Skip closed days - don't insert records for them
        if (hour.closed) {
          return null;
        }
        
        return {
          resource_id: resource.id,
          day_of_week: index + 1, // 1 = Monday, 7 = Sunday
          is_open: true,
          open_time: hour.openTime,
          close_time: hour.closeTime,
        };
      })
      .filter((schedule: any) => schedule !== null); // Remove null entries for closed days

    // Only insert if there are open days
    if (schedulesToInsert.length > 0) {
      const { error: schedulesError } = await supabase
        .from('business_schedules')
        .insert(schedulesToInsert);

      if (schedulesError) {
        console.error('Schedules creation error:', schedulesError);
        throw schedulesError;
      }

      console.log('Schedules created:', schedulesToInsert.length);
    } else {
      console.log('No open days - skipping schedule creation');
    }

    // 6. Create payment_methods records
    const paymentMethodsToInsert: any[] = [];
    
    if (paymentMethodsData.cash) {
      paymentMethodsToInsert.push({
        business_id: business.id,
        method_type: 'Cash on Arrival',
        account_name: null,
        account_number: null,
      });
    }
    
    if (paymentMethodsData.wechat) {
      paymentMethodsToInsert.push({
        business_id: business.id,
        method_type: 'WeChat Pay',
        account_name: paymentMethodsData.wechatName,
        account_number: paymentMethodsData.wechatPhone,
      });
    }
    
    if (paymentMethodsData.kpay) {
      paymentMethodsToInsert.push({
        business_id: business.id,
        method_type: 'KBZ Pay',
        account_name: paymentMethodsData.kpayName,
        account_number: paymentMethodsData.kpayPhone,
      });
    }
    
    if (paymentMethodsData.paylah) {
      paymentMethodsToInsert.push({
        business_id: business.id,
        method_type: 'PayLah!',
        account_name: paymentMethodsData.paylahName,
        account_number: paymentMethodsData.paylahPhone,
      });
    }

    if (paymentMethodsToInsert.length > 0) {
      const { error: paymentError } = await supabase
        .from('payment_methods')
        .insert(paymentMethodsToInsert);

      if (paymentError) {
        console.error('Payment methods creation error:', paymentError);
        throw paymentError;
      }

      console.log('Payment methods created:', paymentMethodsToInsert.length);
    }

    return new Response(
      JSON.stringify({
        success: true,
        business_id: business.id,
        resource_id: resource.id,
        service_id: service.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing futsal listing:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

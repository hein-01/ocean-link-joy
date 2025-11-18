import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Phone, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { convertTo24HourFormat } from "@/lib/timeUtils";

const formSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  numberOfFields: z.string().min(1, "Number of fields is required"),
  fieldType: z.enum(["Indoor", "Outdoor", "Indoor/Outdoor"], {
    required_error: "Please select field type",
  }),
  fieldDetails: z.array(z.object({
    name: z.string().min(1, "Field name is required"),
    price: z.string().min(1, "Price is required"),
  })),
  operatingHours: z.array(z.object({
    day: z.string(),
    closed: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  })),
  paymentMethods: z.object({
    cash: z.boolean(),
    truemoney: z.boolean(),
    truemoneyPhone: z.string().optional(),
    truemoneyName: z.string().optional(),
    kpay: z.boolean(),
    kpayPhone: z.string().optional(),
    kpayName: z.string().optional(),
    paylah: z.boolean(),
    paylahPhone: z.string().optional(),
    paylahName: z.string().optional(),
    grabpay: z.boolean(),
    grabpayPhone: z.string().optional(),
    grabpayName: z.string().optional(),
  }),
  facilities: z.array(z.string()),
  rules: z.array(z.string()),
  description: z.string().min(10, "Description must be at least 10 characters"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  bookingEndTime: z.string().min(1, "Booking end time is required"),
  bookingStartTime: z.string().min(1, "Booking start time is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  province: z.string().min(1, "Province is required"),
  town: z.string().min(1, "Town is required"),
  nearestBusStop: z.string().optional(),
  nearestTrainStation: z.string().optional(),
  zipCode: z.string().optional(),
  googleMapLocation: z.string().optional(),
  infoWebsite: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
  priceCurrency: z.string().default("฿"),
  posLitePrice: z.string().default("10"),
  serviceListingPrice: z.string().default("3"),
  posLiteOption: z.enum(["accept", "postpone"]),
  paymentOption: z.enum(["stripe", "bank"]),
});

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const facilities = [
  "Shoes Rental",
  "Changing Rooms",
  "Locker Rental",
  "Towel Rental",
  "Ball Rental",
  "Bottled Water",
  "Free Drinking Water",
  "Energy Drinks",
  "Soft Drinks",
  "Snacks",
  "Pain Relief Spray/Balm",
  "Antiseptic Wipes/Swabs",
  "Plasters",
  "Facility-branded t-shirts",
  "Selling footballs/futsal balls",
  "First Aid Kit",
  "CCTV Security",
  "Toilets",
  "Car Parking",
  "Free Wi-Fi",
  "Floodlights (for night games)",
  "Seating Area / Bleachers",
  "Near Bus Stop",
  "Near Train Station",
];

const rules = [
  "Bare bodies and bare feet prohibited",
  "Respect all staff and other players",
  "No competitions without prior permission",
  "Please leave the court on time for the next group.",
  "Players under 18 to be accompanied and supervised by a responsible adult",
  "Proper Footwear Required(Futsal shoes or flat-soled shoes only)",
  "Footwear Consistency for Safety - All players should either wear shoes or play barefoot",
  "No smoking",
  "No littering (Garbage bins provided)",
  "No Alcohol or Drugs",
  "No Glass Bottles / Containers",
  "Any damage to the facility will be charged to the booker",
  "Cancellations made more than 48 hours in advance receive a full refund or credit.",
  "Cancellations made within 24 hours forfeit the deposit/fee.",
  "The business reserves the right to cancel bookings due to unforeseen field issues (e.g., weather) and will offer a full refund or reschedule.",
  "Goals are not to be moved by renters unless explicitly instructed by staff.",
];

export const FutsalCourtForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [pricingRules, setPricingRules] = useState<Array<{
    id: string;
    rule_name: string;
    price_override: string; // numeric string
    day_of_week: number[]; // 1..7
    start_time: string; // HH:MM
    end_time: string; // HH:MM
  }>>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      numberOfFields: "1",
      fieldType: "Indoor" as "Indoor" | "Outdoor" | "Indoor/Outdoor",
      fieldDetails: [{ name: "Field 1", price: "" }],
      operatingHours: days.map(day => ({
        day,
        closed: false,
        openTime: "09:00",
        closeTime: "22:00",
      })),
      paymentMethods: {
        cash: false,
        truemoney: false,
        kpay: false,
        paylah: false,
        grabpay: false,
      },
      facilities: [],
      rules: [],
      description: "",
      phoneNumber: "",
      bookingEndTime: "",
      bookingStartTime: "",
      streetAddress: "",
      province: "",
      town: "",
      nearestBusStop: "",
      nearestTrainStation: "",
      zipCode: "",
      googleMapLocation: "",
      infoWebsite: "",
      facebook: "",
      tiktok: "",
      priceCurrency: "฿",
      posLitePrice: "10",
      serviceListingPrice: "3",
      posLiteOption: "accept",
      paymentOption: "bank",
    },
  });

  const numberOfFields = form.watch("numberOfFields");
  const fieldDetails = form.watch("fieldDetails");
  const paymentOption = form.watch("paymentOption");
  const posLiteOption = form.watch("posLiteOption");
  const priceCurrency = form.watch("priceCurrency");
  const posLitePrice = form.watch("posLitePrice");
  const serviceListingPrice = form.watch("serviceListingPrice");

  const totalAmount = posLiteOption === "accept" 
    ? (parseInt(posLitePrice) + parseInt(serviceListingPrice)).toString()
    : serviceListingPrice;

  const baseHourlyPricePreview = useMemo(() => {
    try {
      const nums = (fieldDetails || [])
        .map((f: any) => {
          const m = (f?.price || '').toString().match(/\d+(?:[\.,]\d+)?/);
          if (!m) return NaN;
          return parseFloat(m[0].replace(',', ''));
        })
        .filter((n: number) => !isNaN(n) && isFinite(n));
      if (nums.length === 0) return null;
      return Math.min(...nums);
    } catch {
      return null;
    }
  }, [fieldDetails]);

  const addPricingRule = () => {
    setPricingRules(prev => ([
      ...prev,
      {
        id: crypto.randomUUID(),
        rule_name: '',
        price_override: '',
        day_of_week: [],
        start_time: '',
        end_time: '',
      }
    ]));
  };

  const updateRule = (id: string, patch: Partial<{ rule_name: string; price_override: string; day_of_week: number[]; start_time: string; end_time: string }>) => {
    setPricingRules(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const toggleRuleDay = (id: string, day: number) => {
    setPricingRules(prev => prev.map(r => {
      if (r.id !== id) return r;
      const has = r.day_of_week.includes(day);
      return { ...r, day_of_week: has ? r.day_of_week.filter(d => d !== day) : [...r.day_of_week, day].sort((a,b)=>a-b) };
    }));
  };

  const removeRule = (id: string) => setPricingRules(prev => prev.filter(r => r.id !== id));

  React.useEffect(() => {
    if (numberOfFields) {
      const count = parseInt(numberOfFields);
      const currentFields = form.getValues("fieldDetails") || [];
      const newFields = Array.from({ length: count }, (_, i) => 
        currentFields[i] || { name: `Field ${i + 1}`, price: "" }
      );
      form.setValue("fieldDetails", newFields);
    }
  }, [numberOfFields, form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 2) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 2 images",
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 1MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setImages([...images, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreview(imagePreview.filter((_, i) => i !== index));
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Receipt must be less than 1MB",
          variant: "destructive",
        });
        return;
      }
      setReceiptFile(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create a listing",
          variant: "destructive",
        });
        return;
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('businessName', values.businessName);
      formData.append('numberOfFields', values.numberOfFields);
      formData.append('streetAddress', values.streetAddress);
      formData.append('town', values.town);
      formData.append('province', values.province);
      formData.append('nearestBusStop', values.nearestBusStop || '');
      formData.append('nearestTrainStation', values.nearestTrainStation || '');
      formData.append('googleMapLocation', values.googleMapLocation || '');
      formData.append('facebook', values.facebook || '');
      formData.append('tiktok', values.tiktok || '');
      formData.append('infoWebsite', values.infoWebsite || '');
      formData.append('priceCurrency', values.priceCurrency);
      formData.append('posLitePrice', values.posLitePrice);
      formData.append('serviceListingPrice', values.serviceListingPrice);
      formData.append('posLiteOption', values.posLiteOption);
      formData.append('phoneNumber', values.phoneNumber);
      formData.append('bookingStartTime', convertTo24HourFormat(values.bookingStartTime));
      formData.append('bookingEndTime', convertTo24HourFormat(values.bookingEndTime));
      formData.append('description', values.description);
      formData.append('facilities', JSON.stringify(values.facilities));
      formData.append('rules', JSON.stringify(values.rules));
      formData.append('popularProducts', 'Futsal Booking');
      formData.append('maxCapacity', '1');
      formData.append('fieldType', values.fieldType);
      formData.append('fieldDetails', JSON.stringify(values.fieldDetails));
      formData.append('operatingHours', JSON.stringify(values.operatingHours));
      formData.append('paymentMethods', JSON.stringify(values.paymentMethods));

      // Add images
      images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });

      // Add receipt
      if (receiptFile) {
        formData.append('receiptFile', receiptFile);
      }

      const pricingRulesPayload = pricingRules
        .filter((rule) => rule.rule_name && rule.price_override && rule.start_time && rule.end_time)
        .map((rule) => ({
          rule_name: rule.rule_name,
          price_override: parseFloat(rule.price_override),
          day_of_week: rule.day_of_week.length ? rule.day_of_week : null,
          start_time: rule.start_time.length === 5 ? `${rule.start_time}:00` : rule.start_time,
          end_time: rule.end_time.length === 5 ? `${rule.end_time}:00` : rule.end_time,
        }));

      formData.append("pricingRules", JSON.stringify(pricingRulesPayload));

      // Submit to edge function
      const response = await fetch(
        `https://mfclqtbudstlthtnhqpj.supabase.co/functions/v1/submit-futsal-listing`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create listing');
      }

      toast({
        title: "Success!",
        description: "Your futsal court listing has been created and is pending approval",
      });

      // Reset form
      form.reset();
      setImages([]);
      setImagePreview([]);
      setReceiptFile(null);
      setPricingRules([]);

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Hidden fields */}
        <input type="hidden" name="searchable_business" value="1" />
        <input type="hidden" name="business_categories.id" value="2f12b3d2-35fa-4fda-ba30-6ca0ceab58d7" />
        <input type="hidden" name="popular_products" value="Futsal Booking" />
        <input type="hidden" name="max_capacity" value="1" />
        <input type="hidden" name="service_key" value="futsal_booking" />
        <input type="hidden" name="default_duration_min" value="60" />
        
        {/* 1. Business Basic Information */}
        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is the name of your Futsal court? *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Plaza 8 Pitch, CLUB 15 FUTSAL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 2. Field Configuration */}
        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Field Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="fieldType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Are the field(s) you're listing for rent primarily indoor, outdoor, or do you offer both types? *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Indoor">Indoor</SelectItem>
                      <SelectItem value="Outdoor">Outdoor</SelectItem>
                      <SelectItem value="Indoor/Outdoor">Indoor/Outdoor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numberOfFields"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How many fields can be rented at your location? *</FormLabel>
                  <p className="text-sm text-muted-foreground mb-2">
                    We recommend using distinct and easy-to-remember names for each field. This will help both you and your clients differentiate them easily.
                  </p>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of fields" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {fieldDetails?.map((_, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <FormField
                  control={form.control}
                  name={`fieldDetails.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field {index + 1} Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Field 1, Futsal 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`fieldDetails.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Price *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., $50, 50,000 MMK" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 3. Operating Hours */}
        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Operating Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Please provide your business's opening and closing hours. If your business is closed on a particular day (e.g., Sunday), you may check the 'Close' checkbox for that day.
            </p>
            {days.map((day, index) => (
              <div key={day} className="grid grid-cols-4 gap-4 items-center">
                <div className="font-medium">{day}</div>
                <FormField
                  control={form.control}
                  name={`operatingHours.${index}.closed`}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Closed</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`operatingHours.${index}.openTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={form.watch(`operatingHours.${index}.closed`)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`operatingHours.${index}.closeTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={form.watch(`operatingHours.${index}.closed`)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 3b. Dynamic Pricing Rules */}
        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Dynamic Pricing Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {baseHourlyPricePreview !== null && (
              <div className="p-3 bg-muted/40 rounded text-sm">
                <span className="font-medium">Base Hourly Price (default): </span>
                <span>{baseHourlyPricePreview}</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Note: Pricing rules only apply to days already marked as OPEN in your Operating Hours schedule.
            </p>

            <div className="space-y-4">
              {pricingRules.map((rule, idx) => (
                <div key={rule.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Rule {idx + 1}</div>
                    <Button type="button" variant="outline" size="sm" onClick={() => removeRule(rule.id)}>Remove</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Rule Name</Label>
                      <Input value={rule.rule_name} onChange={(e)=>updateRule(rule.id,{rule_name:e.target.value})} placeholder="e.g., Weekend Prime Rate" />
                    </div>
                    <div>
                      <Label>Price Override</Label>
                      <Input type="number" inputMode="decimal" value={rule.price_override} onChange={(e)=>updateRule(rule.id,{price_override:e.target.value})} placeholder="e.g., 250" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Start Time</Label>
                        <Input type="time" value={rule.start_time} onChange={(e)=>updateRule(rule.id,{start_time:e.target.value})} />
                      </div>
                      <div>
                        <Label>End Time</Label>
                        <Input type="time" value={rule.end_time} onChange={(e)=>updateRule(rule.id,{end_time:e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Days Applicable</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mt-2">
                      {days.map((d, i) => {
                        const dayNum = i + 1; // 1=Mon, 7=Sun
                        const checked = rule.day_of_week.includes(dayNum);
                        return (
                          <label key={d} className="flex items-center gap-2 text-sm">
                            <Checkbox checked={checked} onCheckedChange={()=>toggleRuleDay(rule.id, dayNum)} />
                            <span>{d.slice(0,3)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button type="button" onClick={addPricingRule}>+ Add Pricing Rule</Button>
          </CardContent>
        </Card>

        {/* 4. Payment Methods */}
        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Payment Methods for Bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              We highly recommend accepting at least one method of online prepayment. Without collecting money upfront, you run the risk of customers canceling at the last minute or failing to show up—the single biggest risk. This results in lost revenue for that time slot because you have no guarantee the customer has the funds, making it too late to rent the field to another party.
            </p>
            <FormField
              control={form.control}
              name="paymentMethods.cash"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Cash on Arrival</FormLabel>
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="paymentMethods.truemoney"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      True Money <span className="text-xs text-muted-foreground">(Please provide the phone number and name registered with your True Money account.)</span>
                    </FormLabel>
                  </FormItem>
                )}
              />
              {form.watch("paymentMethods.truemoney") && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <FormField
                    control={form.control}
                    name="paymentMethods.truemoneyPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Phone Number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentMethods.truemoneyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="paymentMethods.kpay"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      KPay <span className="text-xs text-muted-foreground">(Please provide the phone number and name registered with your KPay account.)</span>
                    </FormLabel>
                  </FormItem>
                )}
              />
              {form.watch("paymentMethods.kpay") && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <FormField
                    control={form.control}
                    name="paymentMethods.kpayPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Phone Number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentMethods.kpayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="paymentMethods.paylah"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      Paylah <span className="text-xs text-muted-foreground">(Please provide the phone number and name registered with your Paylah account.)</span>
                    </FormLabel>
                  </FormItem>
                )}
              />
              {form.watch("paymentMethods.paylah") && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <FormField
                    control={form.control}
                    name="paymentMethods.paylahPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Phone Number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentMethods.paylahName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="paymentMethods.grabpay"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      Grab Pay <span className="text-xs text-muted-foreground">(Please provide the phone number and name registered with your Grab Pay account.)</span>
                    </FormLabel>
                  </FormItem>
                )}
              />
              {form.watch("paymentMethods.grabpay") && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <FormField
                    control={form.control}
                    name="paymentMethods.grabpayPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Phone Number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentMethods.grabpayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 5. Facilities */}
        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Available Facilities & Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This facility list is compiled based on today's global industry standards and data from similar field rental businesses. Please check only the items that your business currently offers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {facilities.map((facility) => (
                <FormField
                  key={facility}
                  control={form.control}
                  name="facilities"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(facility)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...(field.value || []), facility]
                              : field.value?.filter((v) => v !== facility);
                            field.onChange(newValue);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0 font-normal">{facility}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 6. Player Rules */}
        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Rules & Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              This list of player rules is based on data from similar field rental businesses in other countries and current global industry standards. Please choose the rules that are relevant to your business. You can refer to the FAQ section for more information on why similar businesses worldwide implement these policies.
            </p>

            <div className="mb-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    Why bare bodies and bare feet are prohibited in some field rental businesses?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Playing without proper Soccer shoes is a safety concern. Football fields, especially artificial turf, can be abrasive, increasing the risk of cuts, blisters, and turf burns on bare skin. Kicking a hard football or colliding with another player's foot while barefoot can easily lead to broken toes. Sliding or falling on abrasive turf without a shirt can result in severe and painful turf burns that are prone to infection. <span className="bg-purple-500/20 px-1 rounded">However, banning players who can't afford proper Soccer shoes goes against the goal of a community-focused business.</span> <span className="bg-purple-500/20 px-1 rounded">To balance safety with accessibility, a field rental business can offer a shoe loan or rental program.</span> You can maintain a "shoe library" of turf shoes in various sizes, charging a small rental fee to cover cleaning and replacement. Requiring a refundable deposit and the use of socks with all rental shoes can ensure the program is both sustainable and hygienic.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    Why no competitions are allowed in some field rental businesses?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Organized competitions, such as tournaments or league matches, inherently involve higher stakes, more intense physical play, and greater potential for severe injuries than a casual practice or friendly "pick-up" game. More importantly, when competition is combined with significant money incentives (either from illegal betting or prize money), the level of physical intensity escalates far beyond a casual game. Players are more likely to commit dangerous fouls, argue aggressively, and resort to violence to protect their financial stake. Fighting on the field is a direct threat to the safety of all patrons and the facility itself.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    Why some field rental businesses require players under 18 to be accompanied and supervised by a responsible adult?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    This is a mandatory, non-negotiable rule for nearly all sports facility rentals and is primarily driven by three core concerns: Liability, Safety, and Facility Protection. By requiring a responsible adult, the facility is legally transferring the direct supervision and immediate liability for the minor's safety and conduct to that adult (parent, guardian, or authorized coach). In a severe emergency, the facility staff cannot authorize medical treatment for a minor. The accompanying adult serves as the crucial link to parents, providing immediate consent for medical care.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">
                    Why Proper Footwear Required rule is NOT always mandatory
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Although futsal shoes are the best option because they are low-profile, lightweight, and have a flat, gum-rubber sole for optimal grip and ball control, they also help protect the facility's expensive surfaces and, more importantly, keep players safe from preventable injuries while preserving the fast, skillful nature of the game.
                    This rule is not always mandatory, as the goal is to balance safety with accessibility, keeping the game open to everyone while still encouraging good practice.
                    If you plan to implement a "Proper Footwear Required" rule at your facility, it is recommended to offer affordable or accessible alternatives so everyone can participate. For example: provide shoe rental or borrowing options, or offer discounted/second-hand pairs through local partnerships or sponsorships.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">
                    Why Footwear Consistency for Safety?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Barefoot players are at higher risk of being stepped on by players wearing shoes, which can lead to bruises, cuts, or even broken toes. Shoes, even futsal shoes with firm soles, can cause injury to someone playing barefoot during fast or physical play.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left">
                    Why No Glass Bottles / Containers?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    If a glass bottle shatters, it creates an invisible field of tiny, sharp shards. Players frequently slide, dive, and fall on the court. A fall onto broken glass can cause deep cuts, severed tendons, or serious ligament damage. Such injuries can be career-ending for athletes and have lifelong consequences. The risk is simply too high. Even if it doesn't break, glass being knocked over can scratch and gouge the expensive court surface (whether it's wood, synthetic, or acrylic). The rule is a non-negotiable safety measure. The combination of high-intensity athletic movement and the fragile, dangerous nature of broken glass makes it an unacceptable risk in a Futsal environment. It protects the players, the facility, and the business itself.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map((rule) => (
                <FormField
                  key={rule}
                  control={form.control}
                  name="rules"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(rule)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...(field.value || []), rule]
                              : field.value?.filter((v) => v !== rule);
                            field.onChange(newValue);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0 font-normal">{rule}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 7. Service Description */}
        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Service Description</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Describe your business, services, and what makes you unique..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 8. Upload Images */}
        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Upload Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Please use your mobile phone to take photos. No cropping or editing is needed. You may upload up to two images(max 1MB each).
            </div>
            
            {imagePreview.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {images.length < 2 && (
              <div>
                <Input
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Label htmlFor="image-upload">
                  <div className="border-2 border-dashed border-primary/50 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload images
                    </p>
                  </div>
                </Label>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 9. Contact Information */}
        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Please provide the Contact Person's phone number for accepting customer bookings. Please make sure that the contact person has this app installed on their phone as well.
                    Enter the phone number without a country code or special characters. (e.g. 091234567, 019876543). *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="091234567"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="bookingEndTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Until what time is the contact person available to receive booking calls (e.g., 8 PM)? *
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4 PM">4 PM</SelectItem>
                          <SelectItem value="5 PM">5 PM</SelectItem>
                          <SelectItem value="6 PM">6 PM</SelectItem>
                          <SelectItem value="7 PM">7 PM</SelectItem>
                          <SelectItem value="8 PM">8 PM</SelectItem>
                          <SelectItem value="9 PM">9 PM</SelectItem>
                          <SelectItem value="10 PM">10 PM</SelectItem>
                          <SelectItem value="11 PM">11 PM</SelectItem>
                          <SelectItem value="12 AM (Midnight)">12 AM (Midnight)</SelectItem>
                          <SelectItem value="1 AM">1 AM</SelectItem>
                          <SelectItem value="2 AM">2 AM</SelectItem>
                          <SelectItem value="3 AM">3 AM</SelectItem>
                          <SelectItem value="4 AM">4 AM</SelectItem>
                          <SelectItem value="5 AM">5 AM</SelectItem>
                          <SelectItem value="6 AM">6 AM</SelectItem>
                          <SelectItem value="7 AM">7 AM</SelectItem>
                          <SelectItem value="8 AM">8 AM</SelectItem>
                          <SelectItem value="9 AM">9 AM</SelectItem>
                          <SelectItem value="10 AM">10 AM</SelectItem>
                          <SelectItem value="11 AM">11 AM</SelectItem>
                          <SelectItem value="12 PM (Noon)">12 PM (Noon)</SelectItem>
                          <SelectItem value="1 PM">1 PM</SelectItem>
                          <SelectItem value="2 PM">2 PM</SelectItem>
                          <SelectItem value="3 PM">3 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bookingStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      At what hour does that contact person begin processing booking calls (e.g., 7 AM)? *
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6 AM">6 AM</SelectItem>
                          <SelectItem value="7 AM">7 AM</SelectItem>
                          <SelectItem value="8 AM">8 AM</SelectItem>
                          <SelectItem value="9 AM">9 AM</SelectItem>
                          <SelectItem value="10 AM">10 AM</SelectItem>
                          <SelectItem value="11 AM">11 AM</SelectItem>
                          <SelectItem value="12 PM (Noon)">12 PM (Noon)</SelectItem>
                          <SelectItem value="1 PM">1 PM</SelectItem>
                          <SelectItem value="2 PM">2 PM</SelectItem>
                          <SelectItem value="3 PM">3 PM</SelectItem>
                          <SelectItem value="4 PM">4 PM</SelectItem>
                          <SelectItem value="5 PM">5 PM</SelectItem>
                          <SelectItem value="6 PM">6 PM</SelectItem>
                          <SelectItem value="7 PM">7 PM</SelectItem>
                          <SelectItem value="8 PM">8 PM</SelectItem>
                          <SelectItem value="9 PM">9 PM</SelectItem>
                          <SelectItem value="10 PM">10 PM</SelectItem>
                          <SelectItem value="11 PM">11 PM</SelectItem>
                          <SelectItem value="12 AM (Midnight)">12 AM (Midnight)</SelectItem>
                          <SelectItem value="1 AM">1 AM</SelectItem>
                          <SelectItem value="2 AM">2 AM</SelectItem>
                          <SelectItem value="3 AM">3 AM</SelectItem>
                          <SelectItem value="4 AM">4 AM</SelectItem>
                          <SelectItem value="5 AM">5 AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* 10. Location Information */}
        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Location Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="streetAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Province/District/State *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yangon">Yangon</SelectItem>
                      <SelectItem value="mandalay">Mandalay</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="town"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Town *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select town" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="downtown">Downtown</SelectItem>
                      <SelectItem value="suburb">Suburb</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nearestBusStop"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nearest Bus Stop name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g ABC Stop" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nearestTrainStation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nearest Train Station</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g ABC Station" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="googleMapLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Map Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Google Maps URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter zip code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 11. Online Presence */}
        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Social Media & Online Presence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook Page</FormLabel>
                  <FormControl>
                    <Input placeholder="https://facebook.com/yourpage" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tiktok"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TikTok</FormLabel>
                  <FormControl>
                    <Input placeholder="https://tiktok.com/@yourusername" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="infoWebsite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-info-website.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Hidden pricing fields */}
            <FormField
              control={form.control}
              name="priceCurrency"
              render={({ field }) => (
                <input type="hidden" {...field} />
              )}
            />
            <FormField
              control={form.control}
              name="posLitePrice"
              render={({ field }) => (
                <input type="hidden" {...field} />
              )}
            />
            <FormField
              control={form.control}
              name="serviceListingPrice"
              render={({ field }) => (
                <input type="hidden" {...field} />
              )}
            />
          </CardContent>
        </Card>

        {/* 12. Listing Validity & POS Lite System */}
        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">POS Lite System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                This listing is valid for one full year (365 days) for a fee of just {priceCurrency}{serviceListingPrice}. We take no commission or cut from any successful bookings/transactions made with your customers. The platform will provide access to a booking management system as well as a financial management tool. This tool is essential for tracking and analyzing key calculations, including: Daily/Monthly Sales, Profit, Expenses, and potential Losses.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">POS Lite</h4>
                <p>
                  If you plan to sell physical items (such as drinks, snacks, rental shoes, balls, or shirts), we recommend the POS Lite system for just {priceCurrency}{posLitePrice} per year. Your Booking Management System, which comes with your service listing, manages your schedule and time slots. POS Lite, however, handles the entire retail side and your tangible goods by tracking your inventory instantly to prevent stockouts and waste, providing quick payment processing (cash, card, mobile) for faster customer checkout, speeding up sales with barcode scanning using a phone camera.
                </p>
                <p>
                  The benefits of combining all your business data into a single online database are enormous. Sales revenue from physical goods is now recorded in real-time and immediately combined with your rental income. It will enable Owners and staff gain immediate, complete control over bookings, and money(real-time cash flow) from any device (laptop, mobile, tablet), anywhere, at any time. Live Stock Management: When a drink is sold using POS Lite, the inventory count updates instantly. Staff know immediately if they need to reorder stock without checking a clipboard, allowing them to make proactive decisions
                </p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="posLiteOption"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-3"
                    >
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="accept" id="accept-pos" className="mt-1" />
                        <Label htmlFor="accept-pos" className="font-normal cursor-pointer">
                          Okay, I will accept your offer of POS Lite at {priceCurrency}{posLitePrice}/year.
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="postpone" id="postpone-pos" className="mt-1" />
                        <Label htmlFor="postpone-pos" className="font-normal cursor-pointer">
                          I would like to postpone the adoption of POS Lite. I will proceed with the listing only at this time.
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 14. Payment Options */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Payment Options</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              The total is {priceCurrency}{totalAmount}. Kindly choose one of the following digital payment methods.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="paymentOption"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="stripe" id="stripe" />
                        <Label htmlFor="stripe">Stripe</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bank" id="bank" />
                        <Label htmlFor="bank">Bank/Digital Payments</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {paymentOption === "bank" && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="text-sm">
                  <p className="font-semibold mb-2">Payment Instructions:</p>
                  <p>Please click the Copy button for the number related to your preferred payment provider below and upload your receipt.</p>
                </div>
                
                <div className="relative">
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap z-10">
                    PayNow
                  </div>
                  <Input
                    id="paynow"
                    type="text"
                    value="091234567"
                    readOnly
                    className="pl-24 pr-20"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText("091234567");
                      toast({ title: "Copied to clipboard!" });
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                  >
                    Copy
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap z-10">
                    WeChatPay
                  </div>
                  <Input
                    id="wechatpay"
                    type="text"
                    value="0987654321"
                    readOnly
                    className="pl-32 pr-20"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText("0987654321");
                      toast({ title: "Copied to clipboard!" });
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                  >
                    Copy
                  </Button>
                </div>
                
                <div>
                  <Label htmlFor="receipt">Upload Receipt *</Label>
                  <Input
                    id="receipt"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleReceiptUpload}
                    className="mt-2 h-auto py-3 file:bg-primary file:text-primary-foreground file:border-0 file:rounded file:px-4 file:py-2 file:mr-4 hover:file:bg-primary/90 file:cursor-pointer"
                  />
                  {receiptFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {receiptFile.name}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 14. Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full shadow-lg hover:shadow-xl transition-all"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Listing..." : "List My Service"}
        </Button>
      </form>
    </Form>
  );
};

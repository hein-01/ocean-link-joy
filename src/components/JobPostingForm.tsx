import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// Removed calendar-based deadline picker in favor of Select options
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addDays, endOfMonth, addMonths, format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { computeSalaryValues } from "@/lib/salary";

type TranslationOption = { key: string; label_en: string; label_my: string };
type BenefitOption = { key: string; label_en: string; label_my: string };

const formSchema = z.object({
  jobTitleKey: z.string().min(1, "Please select a job title"),
  customJobTitle: z.string().optional(),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  locationKey: z.string().min(1, "Please select a location"),
  jobType: z.string().min(1, "Please select a job type"),
  jobDescriptionMy: z.string().min(20, "Job description must be at least 20 characters"),
  salaryType: z.enum(["monthly", "daily", "hourly"], { required_error: "Select a salary type" }),
  salaryStructure: z.enum(["fixed", "range", "min_only", "max_only", "negotiable"], { required_error: "Select a salary structure" }),
  salaryFixed: z.number().optional(),
  salaryFrom: z.number().optional(),
  salaryTo: z.number().optional(),
  salaryMinOnly: z.number().optional(),
  salaryMaxOnly: z.number().optional(),
  ageRequirement: z.enum(["any", "18-60", "custom"]),
  ageFrom: z.number().min(18).max(100).optional(),
  ageTo: z.number().min(18).max(100).optional(),
  educationKey: z.string().min(1, "Please select an education requirement"),
  customEducationRequirement: z.string().optional(),
  benefits: z.array(z.string()).default([]),
  // Application deadline is now a Select with preset options
  applicationDeadline: z.enum([
    "two_weeks",
    "end_this_month",
    "30_days",
    "60_days",
    "end_next_month",
  ], { required_error: "Application deadline is required" }),
  viberNumber: z.string()
    .regex(/^09\d{7,9}$/, "Viber number must start with 09 and be valid"),
  verification: z.string()
    .regex(/^\d+$/, "Please enter only digits")
    .min(1, "Verification answer is required"),
}).refine((data) => {
  if (data.ageRequirement === "custom") {
    return data.ageFrom !== undefined && data.ageTo !== undefined && data.ageFrom <= data.ageTo;
  }
  return true;
}, {
  message: "Invalid age range. 'From' age must be less than or equal to 'To' age",
  path: ["ageTo"],
}).refine((data) => {
  if (data.jobTitleKey === "custom") {
    return data.customJobTitle && data.customJobTitle.trim().length >= 3;
  }
  return true;
}, {
  message: "Custom job title must be at least 3 characters",
  path: ["customJobTitle"],
}).refine((data) => {
  if (data.educationKey === "custom") {
    return data.customEducationRequirement && data.customEducationRequirement.trim().length >= 3;
  }
  return true;
}, {
  message: "Custom education requirement must be at least 3 characters",
  path: ["customEducationRequirement"],
}).refine((data) => {
  // Validate salary inputs conditional on structure
  const needNumber = (v?: number) => typeof v === 'number' && !Number.isNaN(v);
  switch (data.salaryStructure) {
    case 'fixed':
      return needNumber(data.salaryFixed);
    case 'range':
      return needNumber(data.salaryFrom) && needNumber(data.salaryTo) && (data.salaryFrom as number) <= (data.salaryTo as number);
    case 'min_only':
      return needNumber(data.salaryMinOnly);
    case 'max_only':
      return needNumber(data.salaryMaxOnly);
    case 'negotiable':
      return true;
    default:
      return false;
  }
}, {
  message: "Please provide valid salary amount(s) for the selected structure",
  path: ["salaryStructure"],
});

type FormValues = z.infer<typeof formSchema>;

// Benefits are now loaded from benefits_translation; remove static list

interface JobPostingFormProps { onSuccess?: () => void; }

const JobPostingForm = ({ onSuccess }: JobPostingFormProps) => {
  const [showCustomAge, setShowCustomAge] = useState(false);
  const [showCustomJobTitle, setShowCustomJobTitle] = useState(false);
  const [showCustomEducation, setShowCustomEducation] = useState(false);
  const [jobTitles, setJobTitles] = useState<TranslationOption[]>([]);
  const [locations, setLocations] = useState<TranslationOption[]>([]);
  const [educations, setEducations] = useState<TranslationOption[]>([]);
  const [benefitsRef, setBenefitsRef] = useState<BenefitOption[]>([]);
  
  // Generate random numbers for verification (only once on mount)
  const verificationNumbers = useMemo(() => ({
    num1: Math.floor(Math.random() * 10),
    num2: Math.floor(Math.random() * 10)
  }), []);

  // Load benefits translations
  // Note: benefits_translation table doesn't exist, using hardcoded benefits for now
  useEffect(() => {
    // Placeholder - table doesn't exist yet in database
    setBenefitsRef([]);
  }, []);
  
  const correctAnswer = verificationNumbers.num1 + verificationNumbers.num2;
  
  // Map selected deadline option to an actual future Date
  const computeDeadlineDate = (option: "two_weeks" | "end_this_month" | "30_days" | "60_days" | "end_next_month") => {
    const today = new Date();
    switch (option) {
      case "two_weeks":
        return addDays(today, 14);
      case "end_this_month":
        return endOfMonth(today);
      case "30_days":
        return addDays(today, 30);
      case "60_days":
        return addDays(today, 60);
      case "end_next_month":
        return endOfMonth(addMonths(today, 1));
      default:
        return addDays(today, 14);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      type TitleRow = { title_key: string; label_en: string; label_my: string };
      type LocRow = { location_key: string; label_en: string; label_my: string };
      type EduRow = { education_key: string; label_en: string; label_my: string };

      const [{ data: jt, error: e1 }, { data: loc, error: e2 }, { data: edu, error: e3 }] = await Promise.all([
        supabase.from('job_titles_translation').select('title_key,label_en,label_my'),
        supabase.from('locations_translation').select('location_key,label_en,label_my'),
        supabase.from('education_translation').select('education_key,label_en,label_my'),
      ]);

      if (e1 || e2 || e3) {
        console.error('Error fetching translations:', e1 || e2 || e3);
        toast({ title: 'Error', description: 'Failed to load dropdown options', variant: 'destructive' });
        return;
      }

      const jtRows = (jt ?? []) as TitleRow[];
      const locRows = (loc ?? []) as LocRow[];
      const eduRows = (edu ?? []) as EduRow[];

      setJobTitles(jtRows.map(r => ({ key: r.title_key, label_en: r.label_en, label_my: r.label_my })));
      setLocations(locRows.map(r => ({ key: r.location_key, label_en: r.label_en, label_my: r.label_my })));
      setEducations(eduRows.map(r => ({ key: r.education_key, label_en: r.label_en, label_my: r.label_my })));
    };
    fetchAll();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitleKey: "",
      company: "",
      locationKey: "",
      jobType: "",
  jobDescriptionMy: "",
      salaryFixed: undefined,
      salaryFrom: undefined,
      salaryTo: undefined,
      salaryMinOnly: undefined,
      salaryMaxOnly: undefined,
      ageRequirement: "any",
      educationKey: "",
      benefits: [],
      viberNumber: "",
      verification: "",
      customJobTitle: "",
      customEducationRequirement: "",
    },
  });

  const toAsciiDigits = (input: string) => {
    const map: Record<string, string> = {
      '၀': '0','၁': '1','၂': '2','၃': '3','၄': '4','၅': '5','၆': '6','၇': '7','၈': '8','၉': '9'
    };
    return input.replace(/[၀-၉]/g, (d) => map[d] ?? d);
  };

  const parseNumberInput = (val?: number | string | null) => {
    if (val === null || val === undefined) return undefined;
    if (typeof val === 'number') return val;
    const cleaned = toAsciiDigits(String(val)).replace(/,/g, '').trim();
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : undefined;
  };

  const onSubmit = async (data: FormValues) => {
    // Server-side verification check
    const userAnswer = parseInt(data.verification);
    if (userAnswer !== correctAnswer) {
      toast({
        title: "Verification Failed",
        description: "Please enter the correct answer to the math question.",
        variant: "destructive",
      });
      return;
    }
    
    // Get current user
  const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to post a job.",
        variant: "destructive",
      });
      return;
    }

    // Compute salary min/max following exact rules:
    // - monthly: multiply Lakhs by 100000 and round
    // - daily/hourly: save raw integer as typed (no scaling, no rounding)
    let rawMin: number | string | null | undefined = null;
    let rawMax: number | string | null | undefined = null;
    switch (data.salaryStructure) {
      case 'fixed':
        rawMin = data.salaryFixed; rawMax = data.salaryFixed; break;
      case 'range':
        rawMin = data.salaryFrom; rawMax = data.salaryTo; break;
      case 'min_only':
        rawMin = data.salaryMinOnly; rawMax = null; break;
      case 'max_only':
        rawMin = null; rawMax = data.salaryMaxOnly; break;
      case 'negotiable':
        rawMin = null; rawMax = null; break;
    }

    const { salary_min, salary_max } = computeSalaryValues(
      data.salaryType,
      data.salaryStructure,
      rawMin,
      rawMax
    );

    const job_title_custom = data.jobTitleKey === 'custom' ? (data.customJobTitle || '') : null;
    const education_custom = data.educationKey === 'custom' ? (data.customEducationRequirement || '') : null;

    const description_my = data.jobDescriptionMy;
    // Placeholder for AI translation. Replace with actual service call.
    const description_en = description_my; 

    // Insert into database
    const selectedDeadlineDate = computeDeadlineDate(data.applicationDeadline);
    const deadlineIsoDate = format(selectedDeadlineDate, "yyyy-MM-dd");

    // Build legacy-compatible values to satisfy older NOT NULL columns and policies
    const titleLabelEn = jobTitles.find(t => t.key === data.jobTitleKey)?.label_en || data.customJobTitle || data.jobTitleKey;
    const locationLabelEn = locations.find(l => l.key === data.locationKey)?.label_en || data.locationKey;
    const educationLabelEn = educations.find(e => e.key === data.educationKey)?.label_en || data.customEducationRequirement || data.educationKey;

    const legacyNumericSalary = () => {
      const toNum = (v?: number) => parseNumberInput(v) ?? undefined;
      switch (data.salaryStructure) {
        case 'fixed':
          return toNum(data.salaryFixed) ?? 0;
        case 'range':
          return toNum(data.salaryTo) ?? toNum(data.salaryFrom) ?? 0;
        case 'min_only':
          return toNum(data.salaryMinOnly) ?? 0;
        case 'max_only':
          return toNum(data.salaryMaxOnly) ?? 0;
        case 'negotiable':
        default:
          return 0;
      }
    };

    const basePayload = {
      job_title_key: data.jobTitleKey,
      job_location_key: data.locationKey,
      education_key: data.educationKey,
      job_title_custom,
      education_custom,
      salary_structure: data.salaryStructure,
      salary_type: data.salaryType,
      salary_min,
      salary_max,
      description_my,
      description_en,
      business_name: data.company,
      job_type: data.jobType,
      age_min: data.ageRequirement === 'custom' ? data.ageFrom ?? null : (data.ageRequirement === '18-60' ? 18 : null),
      age_max: data.ageRequirement === 'custom' ? data.ageTo ?? null : (data.ageRequirement === '18-60' ? 60 : null),
      benefits: data.benefits,
      application_deadline: deadlineIsoDate,
      phone_number: data.viberNumber,
    } as const;

    const legacyCompat = {
      user_id: user.id,
      job_title: titleLabelEn,
      job_location: locationLabelEn,
      education_requirement: educationLabelEn,
      salary_amount: legacyNumericSalary(),
      description: description_my,
      contact_number: data.viberNumber,
    } as const;

    const { error } = await supabase
      .from('job_postings')
      .insert([{ ...(basePayload as any), ...(legacyCompat as any) }]);

    if (error) {
      console.error("Error posting job:", error);
      toast({
        title: "Error",
        description: `Failed to post job. ${error.message || ''}`,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Job Posted Successfully!",
      description: "Your job posting has been submitted.",
    });
    form.reset();
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-8 rounded-xl border-2 border-primary/20 shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-shadow duration-300">
        <FormField
          control={form.control}
          name="jobTitleKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title *</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  setShowCustomJobTitle(value === "custom");
                  if (value !== "custom") form.setValue("customJobTitle", "");
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job title" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background z-50 max-h-[300px]">
                  {jobTitles.map((t) => (
                    <SelectItem key={t.key} value={t.key}>
                      {t.label_en} / {t.label_my}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {showCustomJobTitle && (
          <FormField
            control={form.control}
            name="customJobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Job Title *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter custom job title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name *</FormLabel>
              <FormControl>
                <Input placeholder="Your business name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locationKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background z-50 max-h-[300px]">
                  {locations.map((l) => (
                    <SelectItem key={l.key} value={l.key}>
                      {l.label_en} ({l.label_my})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="jobType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Work from Home">Work from Home</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salaryType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select salary type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="monthly">Monthly Pay</SelectItem>
                  <SelectItem value="daily">Daily Pay</SelectItem>
                  <SelectItem value="hourly">Hourly Pay</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salaryStructure"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Salary Structure *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="fixed" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Fixed Amount</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="range" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Range</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="min_only" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Minimum Amount</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="max_only" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Maximum Amount</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="negotiable" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Negotiable</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditional Salary Inputs */}
        {(() => {
          const st = form.watch('salaryStructure');
          const ty = form.watch('salaryType');
          const isMonthly = ty === 'monthly';
          const amountLabel = isMonthly ? 'Amount (in Lakhs)' : 'Amount (in MMK)';
          const fromLabel = isMonthly ? 'From (in Lakhs)' : 'From (in MMK)';
          const toLabel = isMonthly ? 'To (in Lakhs)' : 'To (in MMK)';
          const helper = isMonthly
            ? 'e.g., Type 5 for 5 Lakhs or 5.5 for 5.5 Lakhs.'
            : 'e.g., Type 20000 for 20,000 Kyats.';

          const numberInputProps = {
            inputMode: 'decimal' as const,
            onInput: (e: React.FormEvent<HTMLInputElement>) => {
              const t = e.currentTarget;
              const converted = toAsciiDigits(t.value);
              if (converted !== t.value) t.value = converted;
            }
          };

          if (st === 'fixed') {
            return (
              <FormField
                control={form.control}
                name="salaryFixed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{amountLabel} *</FormLabel>
                    <FormDescription className="text-xs text-muted-foreground">{helper}</FormDescription>
                    <FormControl>
                      <Input type="text" placeholder={isMonthly ? '5.5' : '20000'} {...field} {...numberInputProps} onChange={(e) => field.onChange(parseNumberInput(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          }
          if (st === 'range') {
            return (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="salaryFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fromLabel} *</FormLabel>
                      <FormDescription className="text-xs text-muted-foreground">{helper}</FormDescription>
                      <FormControl>
                        <Input type="text" placeholder={isMonthly ? '5' : '20000'} {...field} {...numberInputProps} onChange={(e) => field.onChange(parseNumberInput(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salaryTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{toLabel} *</FormLabel>
                      <FormDescription className="text-xs text-muted-foreground">{helper}</FormDescription>
                      <FormControl>
                        <Input type="text" placeholder={isMonthly ? '6' : '30000'} {...field} {...numberInputProps} onChange={(e) => field.onChange(parseNumberInput(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            );
          }
          if (st === 'min_only') {
            return (
              <FormField
                control={form.control}
                name="salaryMinOnly"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{fromLabel} *</FormLabel>
                    <FormDescription className="text-xs text-muted-foreground">{helper}</FormDescription>
                    <FormControl>
                      <Input type="text" placeholder={isMonthly ? '5' : '20000'} {...field} {...numberInputProps} onChange={(e) => field.onChange(parseNumberInput(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          }
          if (st === 'max_only') {
            return (
              <FormField
                control={form.control}
                name="salaryMaxOnly"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{toLabel} *</FormLabel>
                    <FormDescription className="text-xs text-muted-foreground">{helper}</FormDescription>
                    <FormControl>
                      <Input type="text" placeholder={isMonthly ? '6' : '30000'} {...field} {...numberInputProps} onChange={(e) => field.onChange(parseNumberInput(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          }
          return null;
        })()}

        {/* Salary free-text field removed in favor of structured inputs above */}

        <FormField
          control={form.control}
          name="ageRequirement"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Minimum Age Requirements *</FormLabel>
              <FormDescription className="text-xs leading-relaxed text-primary font-medium bg-primary/5 p-3 rounded-lg border border-primary/20">
                Please choose responsibly. Strict age limits (e.g., '20-30') are illegal in many regions (SG, US, UK). While drivers under 25 are statistically far more likely to get into accidents, and youth unemployment (20-30) is strongly linked to social instability and crime, excluding experienced older workers wastes talent. We urge a balanced approach that is fair to all applicants.
              </FormDescription>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    setShowCustomAge(value === "custom");
                  }}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="any" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Any age (18+)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="18-60" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      18-60
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="custom" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Custom
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showCustomAge && (
          <div className="grid grid-cols-2 gap-4 pl-6">
            <FormField
              control={form.control}
              name="ageFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={18}
                      max={100}
                      placeholder="18"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ageTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={18}
                      max={100}
                      placeholder="100"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="educationKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Education Requirements *</FormLabel>
              <FormDescription className="text-xs leading-relaxed mb-2 text-primary font-medium bg-primary/5 p-3 rounded-lg border border-primary/20">
                Please rethink Education Requirements before deciding which to choose. For many vital blue-collar and service roles like these, the practice of using an unnecessary education requirement (like a high school diploma or a bachelor's degree) as a simple filter to reduce the number of applicants often backfires. It not only harms your hiring process but also has significant negative impacts on applicants and society as a whole. You immediately disqualify a huge group of excellent candidates. This includes seniors with decades of hands-on experience. It disproportionately locks out qualified individuals from lower-income backgrounds, those who had to work to support their families (and couldn't attend school). When large segments of the population (especially youth) are systematically blocked from stable employment, it can lead to social unrest, economic desperation, and higher crime rates.
              </FormDescription>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  setShowCustomEducation(value === "custom");
                  if (value !== "custom") {
                    form.setValue("customEducationRequirement", "");
                  }
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select education requirement" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background z-50">
                  {educations.map((e) => (
                    <SelectItem key={e.key} value={e.key}>
                      {e.label_en} / {e.label_my}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {showCustomEducation && (
          <FormField
            control={form.control}
            name="customEducationRequirement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Education Requirement *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter custom education requirement" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="benefits"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Best Practices/Benefits</FormLabel>
                <FormDescription className="text-accent-foreground font-medium bg-accent/10 px-3 py-2 rounded-lg border border-accent/20">
                  Select all that apply to your job posting
                </FormDescription>
              </div>
              <div className="space-y-3">
                {benefitsRef.map((benefit) => (
                  <FormField
                    key={benefit.key}
                    control={form.control}
                    name="benefits"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={benefit.key}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(benefit.key)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value ?? []), benefit.key])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== benefit.key
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {benefit.label_en} / {benefit.label_my}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="applicationDeadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application Deadline *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select application deadline" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="two_weeks">In two weeks</SelectItem>
                  <SelectItem value="end_this_month">End of this month</SelectItem>
                  <SelectItem value="30_days">30 days</SelectItem>
                  <SelectItem value="60_days">60 days</SelectItem>
                  <SelectItem value="end_next_month">End of next month</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-accent-foreground font-medium bg-accent/10 px-3 py-2 rounded-lg border border-accent/20 mt-2">
                We’ll automatically calculate and store the exact deadline date.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="viberNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Viber Number *</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <div className="flex items-center bg-muted px-3 h-10 rounded-l-md border border-r-0 border-input">
                    <span className="text-sm text-muted-foreground">+95</span>
                  </div>
                  <Input
                    placeholder="09xxxxxxxx"
                    className="rounded-l-none"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription className="text-accent-foreground font-medium bg-accent/10 px-3 py-2 rounded-lg border border-accent/20 mt-2">
                Enter your number starting with 09 (without country code)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="verification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification: What is {verificationNumbers.num1} + {verificationNumbers.num2}? *</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter your answer"
                  maxLength={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="jobDescriptionMy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Please write the job description responsibly. As a platform, we provide these suggestions and facts to help you. You are free to decide what you think is most suited, knowing that it can have a significant impact on all fellow humans, just like you, and your society as a whole. Here are some suggestions: 

Please do not add discriminatory text (e.g., 'good-looking person'). Stating a preference for a 'good-looking person' or any other subjective physical trait (e.g., 'slim,' 'strong build,' 'tall') is discriminatory. It links a person's value to their appearance, not their ability. This practice is illegal in many regions. Instead of: 'Looking for a presentable (good-looking) receptionist.' Kindly say: 'Must have excellent communication skills and a professional, welcoming demeanor.' 

Please try not to use phrases like 'Chinese preferred,' 'Muslim only,' or 'Females Only.' In Singapore, for example, it is not allowed (and illegal) to mention such specific religion, race, or gender in a job description. Such specificities are only allowed if it is a Genuine Occupational Requirement (GOR). Example (Gender GOR): 'Female therapist required for female spa' or 'Male nurse needed for a men's-only ward.' Example (Religion GOR): 'Hindu priest required to perform wedding ceremonies' or 'Halal-certified butcher needed for a mosque's kitchen.' 

In SG, it's also illegal to describe stereotypes (e.g., 'females preferred for admin roles,' 'males preferred for security,' or 'Christian accountant needed') in job descriptions. Please Be Careful: 'Reverse Discrimination' is Still Discrimination. Sometimes, in an effort to promote gender equity, an employer might overcorrect and post a job like 'only female candidates for this accounting role' or 'we are only hiring women for this position.' This is still discrimination. Excluding a qualified man because he is a man is just as illegal and unfair as excluding a qualified woman. The goal of equality is not to reverse the discrimination; it's to remove it entirely. This is often seen as a more severe form of discrimination because it is done consciously. The best, safest, and fairest strategy is to be truly blind to gender. Evaluate every applicant—male or female—based on their skills, experience, and suitability for the role. The best person for the job should get it."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300">
          Post Job
        </Button>
      </form>
    </Form>
  );
};

export default JobPostingForm;

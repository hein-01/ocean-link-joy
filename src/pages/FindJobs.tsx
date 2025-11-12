import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useEmblaCarousel from 'embla-carousel-react';
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { JobCard } from "@/components/JobCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import jobBannerBg from "@/assets/job-banner-bg.jpg";
import { ChevronLeft, ChevronRight } from "lucide-react";
// removed dropdown chevron import since we now use Select

type JobRow = {
  id: string;
  business_name: string | null;
  job_title_key: string | null;
  job_title_custom: string | null;
  job_title?: string | null;
  job_titles_translation?: { label_en: string; label_my: string } | null;
  job_location_key: string | null;
  locations_translation?: { label_en: string; label_my: string } | null;
  education_key: string | null;
  education_custom: string | null;
  education_translation?: { label_en: string; label_my: string } | null;
  salary_structure: string;
  salary_type: 'monthly' | 'daily' | 'hourly';
  salary_min: number | null;
  salary_max: number | null;
  job_type: string | null;
  age_min: number | null;
  age_max: number | null;
  benefits: string[] | null;
  application_deadline: string | null;
  description_my: string | null;
  phone_number: string | null;
};

type Title = { key: string; en: string; my: string };
type Location = { key: string; en: string; my: string };
type Education = { key: string; en: string; my: string };
type FilterItem = {
  label: string;
  queryType: 'education' | 'title';
  queryKey: string;
  imageUrl: string;
};

type CardData = {
  id: string;
  businessName: string;
  jobTitleMy: string;
  salaryDisplay: string;
  jobLocationMy: string;
  jobType: string;
  educationMy: string;
  ageMin: number | null;
  ageMax: number | null;
  benefits: string[] | null;
  applicationDeadline: string;
  descriptionMy: string;
  contactNumber?: string | null;
};

const FindJobs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [triggerWidth, setTriggerWidth] = useState(0);
  const [titles, setTitles] = useState<Title[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [refsLoaded, setRefsLoaded] = useState(false);
  const [filterCategories, setFilterCategories] = useState<FilterItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterItem | null>(null);
  const titleMap = useMemo(() => Object.fromEntries(titles.map(t => [t.key, t])), [titles]);
  const locMap = useMemo(() => Object.fromEntries(locations.map(l => [l.key, l])), [locations]);
  const eduMap = useMemo(() => Object.fromEntries(educations.map(e => [e.key, e])), [educations]);

  useEffect(() => {
    if (!triggerRef.current) return;
    const el = triggerRef.current;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setTriggerWidth(rect.width);
    });
    ro.observe(el);
    // Initial measure
    setTriggerWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);
  // Single-selection merged filter

  // Helpers for placeholder images (110x196) with unique colors
  const educationColorMap: Record<string, string> = {
    all_jobs: '95a5a6',
    edu_no_req: '3498db',
    edu_middle_school_pref: '2ecc71',
    edu_high_school_pref: '9b59b6',
    edu_high_school_grad_pref: 'e74c3c',
    edu_degree_pref: '1abc9c',
  };
  const titleColorPalette = [
    'e67e22', 'f1c40f', '34495e', '2c3e50', 'd35400', '16a085', '8e44ad', 'c0392b',
    '2980b9', '27ae60', 'f39c12', 'bdc3c7', '7f8c8d', 'e84393', '00b894', 'fdcb6e',
  ];
  const colorForTitleKey = (key: string) => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    return titleColorPalette[hash % titleColorPalette.length];
  };
  const placeholderUrl = (key: string, hex?: string) => {
    const bg = hex || '7f8c8d';
    const text = encodeURIComponent(key);
    return `https://placehold.co/110x196/${bg}/ffffff?text=${text}`;
  };

  // Hard-coded education filter items with placeholder images
  const educationFilterItems: FilterItem[] = [
    { label: 'အလုပ်များအားလုံး', queryType: 'education', queryKey: 'all_jobs', imageUrl: placeholderUrl('all_jobs', educationColorMap['all_jobs']) },
    { label: 'အတန်းပညာကန့်သတ်မှုမရှိသော အလုပ်များ', queryType: 'education', queryKey: 'edu_no_req', imageUrl: placeholderUrl('edu_no_req', educationColorMap['edu_no_req']) },
    { label: 'အနည်းဆုံးအလယ်တန်းတက်ရောက်ဖူးသူများအတွက်အလုပ်များ', queryType: 'education', queryKey: 'edu_middle_school_pref', imageUrl: placeholderUrl('edu_middle_school_pref', educationColorMap['edu_middle_school_pref']) },
    { label: 'အနည်းဆုံးအထက်တန်းတက်ရောက်ဖူးသူတိုင်းများအတွက်အလုပ်များ', queryType: 'education', queryKey: 'edu_high_school_pref', imageUrl: placeholderUrl('edu_high_school_pref', educationColorMap['edu_high_school_pref']) },
    { label: 'အထက်တန်းအောင်မြင်ပြီးသူဦးစားပေးအလုပ်များ', queryType: 'education', queryKey: 'edu_high_school_grad_pref', imageUrl: placeholderUrl('edu_high_school_grad_pref', educationColorMap['edu_high_school_grad_pref']) },
    { label: 'ဘွဲ့ရပြီးသူဦးစားပေးအလုပ်များ', queryType: 'education', queryKey: 'edu_degree_pref', imageUrl: placeholderUrl('edu_degree_pref', educationColorMap['edu_degree_pref']) },
  ];

  useEffect(() => {
    const fetchRefs = async () => {
      try {
        type TitleRow = { title_key: string; label_en: string; label_my: string };
        type LocRow = { location_key: string; label_en: string; label_my: string };
        type EduRow = { education_key: string; label_en: string; label_my: string };

        const [{ data: jt, error: e1 }, { data: lc, error: e2 }, { data: ed, error: e3 }] = await Promise.all([
          supabase.from('job_titles_translation').select('title_key,label_en,label_my'),
          supabase.from('locations_translation').select('location_key,label_en,label_my'),
          supabase.from('education_translation').select('education_key,label_en,label_my'),
        ]);
        if (e1 || e2 || e3) throw (e1 || e2 || e3);
        const jtRows = (jt ?? []) as TitleRow[];
        const lcRows = (lc ?? []) as LocRow[];
        const edRows = (ed ?? []) as EduRow[];

        const titlesProcessed = jtRows.map(r => ({ key: r.title_key, en: r.label_en, my: r.label_my }));
        setTitles(titlesProcessed);
        setLocations(lcRows.map(r => ({ key: r.location_key, en: r.label_en, my: r.label_my })));
        setEducations(edRows.map(r => ({ key: r.education_key, en: r.label_en, my: r.label_my })));
        setRefsLoaded(true);

        // Build merged filter categories
        const titleItems: FilterItem[] = titlesProcessed.map(t => ({
          label: `${t.en} / ${t.my}`,
          queryType: 'title',
          queryKey: t.key,
          imageUrl: placeholderUrl(t.key, colorForTitleKey(t.key)),
        }));
        // Add manual 'Others'
        titleItems.push({ label: 'Others / အခြား', queryType: 'title', queryKey: 'others', imageUrl: placeholderUrl('others', '2d3436') });
        const merged = [...educationFilterItems, ...titleItems];
        setFilterCategories(merged);
        // Default selection to All Jobs
        const defaultItem = merged.find(i => i.queryType === 'education' && i.queryKey === 'all_jobs') || merged[0];
        setSelectedFilter(defaultItem);
      } catch (err) {
        console.error('Error fetching reference data', err);
        toast({ title: 'Error', description: 'Failed to load reference lists', variant: 'destructive' });
      }
    };
    fetchRefs();
  }, []);

  const buildSalaryText = (row: JobRow) => {
    const typeText = row.salary_type === 'monthly' ? '(Monthly)' : row.salary_type === 'daily' ? '(Daily)' : '(Hourly)';
    const isMonthly = row.salary_type === 'monthly';
    const toDisplay = (v: number | null | undefined) => {
      if (v === null || v === undefined) return undefined;
      return isMonthly ? (v / 100000) : v;
    };
    const unit = isMonthly ? 'Lakhs' : 'MMK';
    const min = toDisplay(row.salary_min);
    const max = toDisplay(row.salary_max);
    switch (row.salary_structure) {
      case 'negotiable':
        return `Salary: Negotiable ${typeText}`;
      case 'fixed':
        return `${min} ${unit} ${typeText}`;
      case 'range':
        return `${min} - ${max} ${unit} ${typeText}`;
      case 'min_only':
        return `From ${min} ${unit} ${typeText}`;
      case 'max_only':
        return `Up to ${max} ${unit} ${typeText}`;
      default:
        return '';
    }
  };

  const toCard = (row: JobRow): CardData => {
    // Prefer embedded translations from DB; fall back to client-side maps; then legacy columns
    const titleFromEmbed = row.job_titles_translation?.label_my || row.job_titles_translation?.label_en;
    const titleFromMap = row.job_title_key ? (titleMap[row.job_title_key]?.my || titleMap[row.job_title_key]?.en) : undefined;
    const title = row.job_title_key === 'custom'
      ? (row.job_title_custom || row.job_title || '')
      : (titleFromEmbed || titleFromMap || row.job_title || row.job_title_key || '');

    const locFromEmbed = row.locations_translation?.label_my || row.locations_translation?.label_en;
    const locFromMap = row.job_location_key ? (locMap[row.job_location_key]?.my || locMap[row.job_location_key]?.en) : undefined;
    const loc = locFromEmbed || locFromMap || row.job_location_key || '';

    const eduFromEmbed = row.education_translation?.label_my || row.education_translation?.label_en;
    const eduFromMap = row.education_key ? (eduMap[row.education_key]?.my || eduMap[row.education_key]?.en) : undefined;
    const edu = row.education_key === 'custom'
      ? (row.education_custom || '')
      : (eduFromEmbed || eduFromMap || row.education_key || '');
    return {
      id: row.id,
      businessName: row.business_name || '',
      jobTitleMy: title,
      salaryDisplay: buildSalaryText(row),
      jobLocationMy: loc,
      jobType: row.job_type || '',
      educationMy: edu,
      ageMin: row.age_min,
      ageMax: row.age_max,
      benefits: row.benefits,
      applicationDeadline: row.application_deadline || new Date().toISOString(),
      descriptionMy: row.description_my || '',
      contactNumber: row.phone_number,
    };
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("job_postings")
        .select("id,business_name,job_title_key,job_title_custom,job_title,job_titles_translation(label_en,label_my),job_location_key,locations_translation(label_en,label_my),education_key,education_custom,education_translation(label_en,label_my),salary_structure,salary_type,salary_min,salary_max,job_type,age_min,age_max,benefits,application_deadline,description_my,phone_number")
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;
      const rows = (data || []) as unknown as JobRow[];
      setJobs(rows.map(toCard));
      setHasMore(rows.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load job postings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Education filter mapping per spec
  const buildEducationQueryKeys = (eduKey: string): string[] => {
    switch (eduKey) {
      case 'all_jobs':
        return [];
      case 'edu_no_req':
        return ['edu_no_req'];
      case 'edu_middle_school_pref':
        return ['edu_middle_school_pref', 'edu_no_req'];
      case 'edu_high_school_pref':
        return ['edu_high_school_pref', 'edu_middle_school_pref', 'edu_no_req'];
      case 'edu_high_school_grad_pref':
        return ['edu_high_school_grad_pref', 'edu_high_school_pref', 'edu_middle_school_pref', 'edu_no_req'];
      case 'edu_degree_pref':
        return ['edu_degree_pref', 'edu_high_school_grad_pref', 'edu_high_school_pref', 'edu_middle_school_pref', 'edu_no_req'];
      default:
        return [];
    }
  };

  // Build and run a filtered page query based on selectedFilter
  const runFilteredQuery = async (from: number, to: number) => {
    let query = supabase
      .from("job_postings")
      .select("id,business_name,job_title_key,job_title_custom,job_title,job_titles_translation(label_en,label_my),job_location_key,locations_translation(label_en,label_my),education_key,education_custom,education_translation(label_en,label_my),salary_structure,salary_type,salary_min,salary_max,job_type,age_min,age_max,benefits,application_deadline,description_my,phone_number")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (selectedFilter) {
      if (selectedFilter.queryType === 'education') {
        const educationQueryKeys = buildEducationQueryKeys(selectedFilter.queryKey);
        if (educationQueryKeys.length > 0) {
          query = query.in('education_key', educationQueryKeys);
        }
      } else if (selectedFilter.queryType === 'title') {
        if (selectedFilter.queryKey === 'others') {
          const predefinedTitleKeys = filterCategories
            .filter(i => i.queryType === 'title' && i.queryKey !== 'others')
            .map(i => i.queryKey);
          if (predefinedTitleKeys.length > 0) {
            // Select any job_title_key not in known titles
            query = query.not('job_title_key', 'in', predefinedTitleKeys);
          }
        } else {
          query = query.eq('job_title_key', selectedFilter.queryKey);
        }
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    const rows = (data || []) as unknown as JobRow[];
    return rows;
  };

  // Auto-trigger query when selectedFilter changes
  useEffect(() => {
    if (!selectedFilter) return;
    (async () => {
      try {
        setLoading(true);
        const rows = await runFilteredQuery(0, PAGE_SIZE - 1);
        setJobs(rows.map(toCard));
        setHasMore(rows.length === PAGE_SIZE);
      } catch (error) {
        console.error('Error fetching filtered jobs:', error);
        toast({ title: 'Error', description: 'Failed to load job postings', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedFilter]);

  // Embla carousel setup for filter slider (with API for arrows)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });
  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const loadMoreJobs = async () => {
    try {
      setLoadingMore(true);
      const from = jobs.length;
      const to = from + PAGE_SIZE - 1;
      const rows = await runFilteredQuery(from, to);
      setJobs((prev) => [...prev, ...rows.map(toCard)]);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error loading more jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load more job postings",
        variant: "destructive",
      });
    } finally {
      setLoadingMore(false);
    }
  };

  // No multi-select; using single merged selectedFilter

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--jobs-gradient-start))] to-[hsl(var(--jobs-gradient-end))]">
      <Navbar />
      <main className="pt-16 pb-8">
        {/* Banner Section */}
        <div 
          className="relative h-[200px] md:h-[250px] bg-cover bg-center flex items-center justify-center shadow-2xl"
          style={{ backgroundImage: `url(${jobBannerBg})` }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--jobs-overlay-start))]/60 via-purple-900/50 to-[hsl(var(--jobs-overlay-end))]/60" />
          
          {/* Content */}
          <div className="relative z-10 text-center px-4">
            <Button 
              size="lg"
              onClick={() => navigate("/post-a-job")}
              className="text-lg px-8 py-6 hover-scale"
            >
              Post a job FREE
            </Button>
          </div>
        </div>

        {/* Jobs Listing Section */}
        <div className="container mx-auto px-4 pt-12">
          <div className="max-w-6xl mx-auto">
            
            {/* Filters Section: Merged dropdown and slider; auto-query on change */}
            <div className="mb-8 p-4 md:p-6 border rounded-lg bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Merged Dropdown */}
                <div className="flex-1 md:flex-1">
                  <Select
                    onValueChange={(val) => {
                      const found = filterCategories.find(f => f.queryKey === val);
                      if (found) setSelectedFilter(found);
                    }}
                    value={selectedFilter?.queryKey}
                  >
                    <SelectTrigger ref={triggerRef} className="w-full md:w-full md:rounded-r-none justify-between">
                      <SelectValue placeholder="အလုပ်များအားလုံး" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50 max-h-80 overflow-auto">
                      {filterCategories.map(item => (
                        <SelectItem key={item.queryKey} value={item.queryKey}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* No multi-select and no Find Jobs button */}
              </div>
              {/* Applied hint */}
              <div className="mt-3 text-xs text-muted-foreground">
                {selectedFilter?.queryType === 'education'
                  ? (selectedFilter.queryKey === 'all_jobs' ? 'Showing all jobs' : `Selected: ${selectedFilter.label}`)
                  : selectedFilter ? `Selected: ${selectedFilter.label}` : 'Showing all jobs'}
              </div>
            </div>

            {/* Slider Section (category cards with desktop arrows) */}
            <div className="mb-8 relative overflow-x-hidden">
              {/* Desktop arrows */}
              <button
                type="button"
                aria-label="Previous"
                onClick={scrollPrev}
                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-50 absolute left-0 top-1/2 -translate-y-1/2 z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={scrollNext}
                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-50 absolute right-0 top-1/2 -translate-y-1/2 z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="embla w-full" ref={emblaRef}>
                <div className="flex justify-start space-x-3 py-4">
                  {filterCategories.map((c) => {
                    const active = selectedFilter?.queryKey === c.queryKey;
                    return (
                      <button
                        key={c.queryKey}
                        onClick={() => setSelectedFilter(c)}
                        className={`flex-shrink-0 w-[110px] h-[195.5px] rounded-md overflow-hidden relative ${active ? 'border-4 border-primary shadow-[0_0_20px_rgba(166,107,255,0.4)]' : 'border-2 border-transparent'} shadow-md`}
                      >
                        <img src={c.imageUrl} alt={c.label} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs p-2 text-center">{c.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No jobs posted yet. Be the first to post a job!
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      id={job.id}
                      businessName={job.businessName}
                      jobTitleMy={job.jobTitleMy}
                      salaryDisplay={job.salaryDisplay}
                      jobLocationMy={job.jobLocationMy}
                      jobType={job.jobType}
                      educationMy={job.educationMy}
                      ageMin={job.ageMin}
                      ageMax={job.ageMax}
                      benefits={job.benefits}
                      applicationDeadline={job.applicationDeadline}
                      descriptionMy={job.descriptionMy}
                      contactNumber={job.contactNumber}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button onClick={loadMoreJobs} disabled={loadingMore} className="rounded-none">
                      {loadingMore ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FindJobs;

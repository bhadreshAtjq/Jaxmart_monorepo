'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button, Input, Textarea, Select, Card, Badge, Container } from '@/components/ui';
import { rfqApi, categoryApi } from '@/lib/api';
import { useCategories } from '@/lib/hooks';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import {
  FaCubes,
  FaWrench,
  FaCircleCheck,
  FaCircleInfo,
  FaLightbulb,
  FaBolt,
  FaShieldHalved,
  FaArrowRight,
  FaArrowLeft,
  FaClock,
  FaLocationDot,
  FaTag,
  FaFileLines,
  FaPaperclip,
  FaBuilding,
  FaTruckFast,
  FaBoxesStacked,
  FaCheck,
  FaMagnifyingGlass,
  FaChevronDown,
  FaXmark,
} from 'react-icons/fa6';
import { ShieldCheck, Award, Sparkles, CheckCircle2, TrendingUp, Layers } from 'lucide-react';

const STEPS = [
  { id: 0, title: 'Product & Category', subtitle: 'What are you sourcing?' },
  { id: 1, title: 'Volume & Budget', subtitle: 'Quantity & price target' },
  { id: 2, title: 'Shipping & Specs', subtitle: 'Delivery location & terms' },
];

const UNIT_OPTIONS = [
  'Pieces',
  'Metric Tons',
  'Kilograms',
  'Meters',
  'Boxes',
  'Sets',
  'Rolls',
  'Liters',
  'Containers',
];

// Smart Category-specific Quick Specs Chips
const CATEGORY_PROMPTS: Record<string, { unit: string; chips: string[] }> = {
  textiles: {
    unit: 'Pieces',
    chips: [
      '100% Combed Cotton',
      'GSM 180-220',
      'Custom Brand Label / OEM',
      'Sizes: S, M, L, XL, XXL',
      'Bio-Washed & Pre-Shrunk',
      'Export Quality Double Stitch',
    ],
  },
  construction: {
    unit: 'Metric Tons',
    chips: [
      'Fe 500D Grade',
      'ISI / BIS Certified',
      'Mill Test Certificate (MTC) Required',
      'Standard Length: 12 Meters',
      'Anti-Corrosive Coating',
      'Immediate Site Delivery',
    ],
  },
  'industrial-supplies': {
    unit: 'Pieces',
    chips: [
      'High Tensile Grade 8.8 / 10.9',
      'SS 304 / SS 316 Stainless Steel',
      'Galvanized Zinc Plated',
      'Standard ISO / DIN Compliance',
      'Tolerance ±0.05mm',
      'Batch Quality Test Report',
    ],
  },
  packaging: {
    unit: 'Boxes',
    chips: [
      '5-Ply Corrugated Heavy Duty',
      'Kraft Paper 180+ GSM',
      'Custom Multi-Color Logo Print',
      'Bursting Factor 16+ BF',
      'Moisture Resistant Film',
      'Flat Packed for Logistics',
    ],
  },
  chemicals: {
    unit: 'Kilograms',
    chips: [
      'Purity 99.5% Tech/Pharma Grade',
      'MSDS & Certificate of Analysis (COA)',
      '200L Sealed HDPE Drums',
      'Hazardous Material Handling Compliant',
      'Batch Expiry > 24 Months',
    ],
  },
  electronics: {
    unit: 'Pieces',
    chips: [
      'CE & RoHS Certified',
      'Input Voltage 220V-240V / 50Hz',
      '1 Year Replacement Warranty',
      'OEM White-Label Custom Packaging',
      'Surge Protection 4kV',
    ],
  },
  agriculture: {
    unit: 'Metric Tons',
    chips: [
      'Export Grade Sortex Cleaned',
      'Moisture Content < 12%',
      'FSSAI & APEDA Certified',
      '50kg Jute / PP Bag Packaging',
      'Phytosanitary Certificate Required',
    ],
  },
  services: {
    unit: 'Sets',
    chips: [
      'SLA Guaranteed Service Window',
      'On-Site Deployment with Certified Engineers',
      'Post-Handover 6 Months Maintenance',
      'GST Compliant Invoicing',
    ],
  },
};

export default function RfqPostPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-bold text-gray-500">Loading RFQ Form...</div>}>
      <RfqPostContent />
    </Suspense>
  );
}

function RfqPostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form states
  const [form, setForm] = useState({
    rfqType: 'PRODUCT',
    categoryId: searchParams.get('categoryId') || '',
    title: searchParams.get('title') || '',
    description: '',
    quantity: searchParams.get('qty') || '',
    unitOfMeasure: searchParams.get('unit') || 'Pieces',
    locationPreference: '',
    preferredDeliveryDate: '',
    preferredProviderType: 'ALL',
    budgetMin: '',
    budgetMax: searchParams.get('budget') || '',
    hasBudget: !!searchParams.get('budget'),
    deadline: '',
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  // Dynamic Auto-Fetched Category Matches
  const [matchedCategories, setMatchedCategories] = useState<any[]>([]);
  const [selectedCategoryObj, setSelectedCategoryObj] = useState<any>(null);
  const [isSearchingCategory, setIsSearchingCategory] = useState(false);

  // Combobox modal state
  const [showCombobox, setShowCombobox] = useState(false);
  const [comboboxQuery, setComboboxQuery] = useState('');
  const [comboboxResults, setComboboxResults] = useState<any[]>([]);
  const comboboxRef = useRef<HTMLDivElement>(null);

  // Debounced live category auto-fetcher as buyer types
  useEffect(() => {
    const query = form.title.trim();
    if (query.length < 2) {
      setMatchedCategories([]);
      return;
    }

    setIsSearchingCategory(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/categories?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setMatchedCategories(data);

          // Auto-select the top match if no category has been manually selected yet or if title was changed
          const topMatch = data[0];
          setSelectedCategoryObj(topMatch);
          set('categoryId', topMatch.id);

          // Auto-set smart unit if category root matches
          const rootSlug = topMatch.parent?.parent?.slug || topMatch.parent?.slug || topMatch.slug;
          if (rootSlug && CATEGORY_PROMPTS[rootSlug]) {
            set('unitOfMeasure', CATEGORY_PROMPTS[rootSlug].unit);
          }
        } else {
          setMatchedCategories([]);
        }
      } catch (err) {
        console.error('Failed to auto-fetch categories:', err);
      } finally {
        setIsSearchingCategory(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [form.title]);

  // Handle combobox search
  useEffect(() => {
    if (!showCombobox) return;
    const q = comboboxQuery.trim();
    const url = q ? `/api/categories?search=${encodeURIComponent(q)}` : `/api/categories?all=true`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setComboboxResults(data);
        }
      })
      .catch(() => setComboboxResults([]));
  }, [comboboxQuery, showCombobox]);

  // Helper to format breadcrumbs
  const getCategoryBreadcrumb = (cat: any) => {
    if (!cat) return '';
    const parts = [];
    if (cat.parent?.parent) parts.push(cat.parent.parent.name);
    if (cat.parent) parts.push(cat.parent.name);
    parts.push(cat.name);
    return parts.join(' → ');
  };

  // Helper to get active prompt chips based on selected category
  const activePromptGroup = useMemo(() => {
    if (!selectedCategoryObj) return CATEGORY_PROMPTS['industrial-supplies'];
    const rootSlug =
      selectedCategoryObj.parent?.parent?.slug ||
      selectedCategoryObj.parent?.slug ||
      selectedCategoryObj.slug;
    return CATEGORY_PROMPTS[rootSlug] || CATEGORY_PROMPTS['industrial-supplies'];
  }, [selectedCategoryObj]);

  // Append a prompt chip to the description
  const handleAddPromptChip = (chip: string) => {
    setForm((prev) => {
      const current = prev.description.trim();
      const addition = `• ${chip}`;
      if (current.includes(chip)) return prev;
      return {
        ...prev,
        description: current ? `${current}\n${addition}` : addition,
      };
    });
  };

  // Live Sourcing Completeness Score
  const scoreData = useMemo(() => {
    const checks = [
      { label: 'Requirement Title', score: 20, met: form.title.trim().length >= 4 },
      { label: 'Category Auto-Assigned', score: 25, met: !!form.categoryId },
      { label: 'Specifications & Details', score: 25, met: form.description.trim().length >= 20 },
      { label: 'Quantity & Sourcing Unit', score: 15, met: !!form.quantity },
      { label: 'Destination City / Pincode', score: 15, met: !!form.locationPreference },
    ];

    const currentScore = checks.filter((c) => c.met).reduce((acc, c) => acc + c.score, 0);
    return { checks, score: currentScore };
  }, [form]);

  const handleSubmitRfq = async () => {
    if (!form.title.trim()) {
      toast.error('Please enter what product or service you need');
      setStep(0);
      return;
    }
    if (!form.categoryId) {
      toast.error('Please select or confirm a category');
      setStep(0);
      return;
    }
    if (!form.description.trim()) {
      toast.error('Please add your technical specifications');
      setStep(0);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        rfqType: form.rfqType,
        title: form.title.trim(),
        description: form.description.trim(),
        categoryId: form.categoryId,
        quantity: form.quantity ? parseFloat(form.quantity) : null,
        unitOfMeasure: form.unitOfMeasure,
        budgetMin: form.hasBudget && form.budgetMin ? parseFloat(form.budgetMin) : null,
        budgetMax: form.hasBudget && form.budgetMax ? parseFloat(form.budgetMax) : null,
        locationPreference: form.locationPreference || 'Pan India',
        preferredProviderType: form.preferredProviderType,
        preferredDeliveryDate: form.preferredDeliveryDate ? new Date(form.preferredDeliveryDate) : null,
        deadline: form.deadline ? new Date(form.deadline) : null,
      };

      const res = await rfqApi.create(payload);
      toast.success('🎉 RFQ posted! Verified suppliers are preparing quotes.');
      router.push(`/rfq/${res.data.rfq.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to post RFQ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="bg-slate-50 min-h-screen pb-24 pt-6">
        <Container size="xl">
          {/* Header */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 bg-jungle-green-100 text-jungle-green-800 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3">
              <Sparkles className="h-3.5 w-3.5 text-jungle-green-600" />
              Smart AI Sourcing Engine
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-black text-gray-900 tracking-tight">
              Post a Buy Requirement / RFQ
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Type what you need — our AI automatically detects your industry category and routes to verified factories.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Form (8 Cols) */}
            <div className="lg:col-span-8 bg-white border border-gray-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
              {/* Stepper Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
                {STEPS.map((s, idx) => (
                  <div
                    key={s.id}
                    onClick={() => setStep(s.id)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      className={clsx(
                        'h-9 w-9 rounded-2xl flex items-center justify-center font-black text-xs transition-all shadow-xs',
                        step === s.id
                          ? 'bg-jungle-green-600 text-white shadow-md'
                          : step > s.id
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-400'
                      )}
                    >
                      {step > s.id ? <FaCheck className="h-3 w-3" /> : s.id + 1}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p
                        className={clsx(
                          'text-xs font-bold leading-tight',
                          step === s.id ? 'text-gray-900' : 'text-gray-400'
                        )}
                      >
                        {s.title}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">{s.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* STEP 0: PRODUCT & CATEGORY */}
              {step === 0 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Title & Live Sourcing Input */}
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-gray-700 block mb-2">
                      What product or service are you sourcing? *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        autoFocus
                        placeholder="Type product name, e.g. Men's Cotton Shirts, TMT Rebar 12mm, Corrugated Boxes, CNC Lathe..."
                        value={form.title}
                        onChange={(e) => set('title', e.target.value)}
                        className="w-full border-2 border-gray-200 focus:border-jungle-green-600 rounded-2xl pl-4 pr-10 py-3.5 text-sm font-bold text-gray-900 outline-none shadow-xs transition-all"
                      />
                      {isSearchingCategory ? (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="h-4 w-4 rounded-full border-2 border-jungle-green-600 border-t-transparent animate-spin" />
                        </div>
                      ) : form.categoryId ? (
                        <FaCircleCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 h-4 w-4" />
                      ) : null}
                    </div>
                  </div>

                  {/* Auto-Detected Category Highlight Banner */}
                  {selectedCategoryObj && (
                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          <Sparkles className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                              Auto-Detected Category
                            </span>
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                              <FaCheck className="h-2.5 w-2.5" /> Matched
                            </span>
                          </div>
                          <p className="font-heading font-black text-gray-900 text-sm mt-0.5">
                            {getCategoryBreadcrumb(selectedCategoryObj)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowCombobox(true)}
                        className="text-xs font-bold text-jungle-green-700 hover:text-jungle-green-800 underline shrink-0 text-left"
                      >
                        Change Category
                      </button>
                    </div>
                  )}

                  {/* Alternative Suggested Category Badges */}
                  {matchedCategories.length > 1 && (
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 mb-2">
                        Did you mean one of these specific subcategories?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {matchedCategories.slice(0, 4).map((c: any) => (
                          <button
                            type="button"
                            key={c.id}
                            onClick={() => {
                              setSelectedCategoryObj(c);
                              set('categoryId', c.id);
                            }}
                            className={clsx(
                              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-1.5',
                              form.categoryId === c.id
                                ? 'bg-jungle-green-700 text-white shadow-sm ring-2 ring-jungle-green-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            )}
                          >
                            <span className="truncate">{c.name}</span>
                            {form.categoryId === c.id && <FaCheck className="h-2.5 w-2.5" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* If no title typed yet, allow manual selection */}
                  {!selectedCategoryObj && (
                    <div>
                      <label className="text-xs font-black uppercase tracking-wider text-gray-700 block mb-2">
                        Industry Category *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCombobox(true)}
                        className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm text-left font-medium text-gray-500 bg-white hover:border-jungle-green-600 flex items-center justify-between shadow-xs"
                      >
                        <span>Select or search category...</span>
                        <FaChevronDown className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
                  )}

                  {/* Detailed Description & Smart Specification Chips */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                        Detailed Technical Specifications & Requirements *
                      </label>
                      <span className="text-[11px] text-gray-400 font-medium">Click tags to insert specs</span>
                    </div>

                    {/* Quick Smart Spec Tags */}
                    {activePromptGroup?.chips && (
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {activePromptGroup.chips.map((chip, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => handleAddPromptChip(chip)}
                            className="bg-slate-100 hover:bg-jungle-green-50 hover:text-jungle-green-800 text-gray-600 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-gray-200 hover:border-jungle-green-300 transition-colors flex items-center gap-1"
                          >
                            <span>+ {chip}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <textarea
                      rows={5}
                      required
                      placeholder="Specify material grades, dimensions, tolerances, required certifications (e.g. ISO/BIS/MTC), packaging format, and application..."
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                      className="w-full border border-gray-300 focus:border-jungle-green-600 rounded-2xl p-4 text-sm font-medium text-gray-900 outline-none resize-none shadow-xs"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Minimum 20 characters. Detailed RFQs receive 3x more competitive manufacturer bids.
                    </p>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => {
                        if (!form.title.trim()) {
                          toast.error('Please enter a product title');
                          return;
                        }
                        if (!form.categoryId) {
                          toast.error('Please select or confirm a category');
                          return;
                        }
                        if (!form.description.trim()) {
                          toast.error('Please specify your requirements');
                          return;
                        }
                        setStep(1);
                      }}
                      className="bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-2xl font-bold text-xs px-8 py-3.5 flex items-center gap-2 shadow-md"
                    >
                      Continue to Volume & Budget <FaArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 1: VOLUME & BUDGET */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Quantity & Unit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black uppercase tracking-wider text-gray-700 block mb-2">
                        Target Sourcing Quantity *
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 500"
                        value={form.quantity}
                        onChange={(e) => set('quantity', e.target.value)}
                        className="w-full border border-gray-300 focus:border-jungle-green-600 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black uppercase tracking-wider text-gray-700 block mb-2">
                        Unit of Measure
                      </label>
                      <select
                        value={form.unitOfMeasure}
                        onChange={(e) => set('unitOfMeasure', e.target.value)}
                        className="w-full border border-gray-300 focus:border-jungle-green-600 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 outline-none bg-white"
                      >
                        {UNIT_OPTIONS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Target Budget */}
                  <div className="bg-slate-50 border border-gray-200/80 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
                          Target Sourcing Budget
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Helps suppliers give realistic quotes within your commercial range
                        </p>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                        <input
                          type="checkbox"
                          checked={form.hasBudget}
                          onChange={(e) => set('hasBudget', e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-jungle-green-600 focus:ring-jungle-green-500"
                        />
                        Specify Budget Range
                      </label>
                    </div>

                    {form.hasBudget && (
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 block mb-1">
                            Min Budget (₹)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 50,000"
                            value={form.budgetMin}
                            onChange={(e) => set('budgetMin', e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 block mb-1">
                            Max Budget (₹)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 2,00,000"
                            value={form.budgetMax}
                            onChange={(e) => set('budgetMax', e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-bold"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(0)}
                      className="rounded-2xl font-bold text-xs px-6 py-3 flex items-center gap-2"
                    >
                      <FaArrowLeft className="h-3 w-3" /> Back
                    </Button>
                    <Button
                      onClick={() => setStep(2)}
                      className="bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-2xl font-bold text-xs px-8 py-3.5 flex items-center gap-2 shadow-md"
                    >
                      Continue to Shipping & Timeline <FaArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: SHIPPING, TIMELINE & SUBMIT */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Delivery Location */}
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-gray-700 block mb-2">
                      Delivery Destination (City / Pincode)
                    </label>
                    <div className="relative">
                      <FaLocationDot className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="e.g. Surat, Gujarat (395002) or Pan India"
                        value={form.locationPreference}
                        onChange={(e) => set('locationPreference', e.target.value)}
                        className="w-full border border-gray-300 focus:border-jungle-green-600 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 outline-none"
                      />
                    </div>
                  </div>

                  {/* Delivery Urgency / Timeline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black uppercase tracking-wider text-gray-700 block mb-2">
                        Preferred Delivery Date
                      </label>
                      <input
                        type="date"
                        value={form.preferredDeliveryDate}
                        onChange={(e) => set('preferredDeliveryDate', e.target.value)}
                        className="w-full border border-gray-300 focus:border-jungle-green-600 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 outline-none bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black uppercase tracking-wider text-gray-700 block mb-2">
                        Supplier Audit Preference
                      </label>
                      <select
                        value={form.preferredProviderType}
                        onChange={(e) => set('preferredProviderType', e.target.value)}
                        className="w-full border border-gray-300 focus:border-jungle-green-600 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 outline-none bg-white"
                      >
                        <option value="ALL">Any Verified Supplier</option>
                        <option value="MANUFACTURER">Direct Manufacturers Only</option>
                        <option value="DISTRIBUTOR">Authorized Distributors & Stockists</option>
                      </select>
                    </div>
                  </div>

                  {/* JaxMart Assured Deal Escrow Notice */}
                  <div className="bg-jungle-green-900 text-white rounded-3xl p-6 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                      <ShieldCheck className="h-4 w-4" /> JaxMart Assured Sourcing Protection
                    </div>
                    <p className="text-xs text-jungle-green-100 leading-relaxed">
                      Posting this requirement is 100% free. When you accept a supplier quote, convert it into an Assured Deal with escrow milestone payment security.
                    </p>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="rounded-2xl font-bold text-xs px-6 py-3 flex items-center gap-2"
                    >
                      <FaArrowLeft className="h-3 w-3" /> Back
                    </Button>
                    <Button
                      onClick={handleSubmitRfq}
                      disabled={loading}
                      className="bg-amber-400 hover:bg-amber-500 text-gray-950 rounded-2xl font-black text-xs uppercase tracking-wider px-10 py-3.5 shadow-xl flex items-center gap-2"
                    >
                      {loading ? 'Broadcasting RFQ...' : 'Submit Buy Requirement Now'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sourcing Strength & Factory Matching Preview (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Strength Meter */}
              <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Sourcing Match Score
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-heading font-black text-gray-900">
                      {scoreData.score}%
                    </span>
                    <span
                      className={clsx(
                        'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full',
                        scoreData.score >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : scoreData.score >= 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      {scoreData.score >= 80 ? 'High Match' : 'Basic Match'}
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
                    <div
                      className="bg-jungle-green-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${scoreData.score}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
                  {scoreData.checks.map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-gray-600">
                      <span className={c.met ? 'text-gray-900 font-bold' : 'text-gray-400'}>
                        {c.label}
                      </span>
                      {c.met ? (
                        <FaCircleCheck className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <span className="text-[10px] text-gray-300">+ {c.score}%</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Factories Preview */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-jungle-green-300 text-xs font-bold uppercase tracking-wider">
                  <Award className="h-4 w-4 text-amber-400" />
                  Supplier Network Active
                </div>
                <h4 className="font-heading font-black text-white text-base">
                  ~14 Verified Factories Matched
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Upon submission, your requirement will be broadcast to audited manufacturers in your category for rapid quotes.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Category Combobox Search Modal */}
      {showCombobox && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-jungle-green-600" />
                <h3 className="font-heading font-black text-gray-900 text-base">
                  Browse & Search Categories
                </h3>
              </div>
              <button
                onClick={() => setShowCombobox(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <FaXmark className="h-5 w-5" />
              </button>
            </div>

            {/* Search input in modal */}
            <div className="pt-4 pb-2">
              <div className="relative">
                <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type to filter e.g. Shirt, Fasteners, Rebar, Bags..."
                  value={comboboxQuery}
                  onChange={(e) => setComboboxQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:border-jungle-green-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Results list */}
            <div className="flex-1 overflow-y-auto space-y-1 py-2 divide-y divide-gray-50">
              {comboboxResults.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  No matching categories found.
                </div>
              ) : (
                comboboxResults.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryObj(cat);
                      set('categoryId', cat.id);
                      setShowCombobox(false);
                    }}
                    className={clsx(
                      'w-full text-left p-3 rounded-xl hover:bg-jungle-green-50 transition-colors flex items-center justify-between text-xs font-bold',
                      form.categoryId === cat.id
                        ? 'bg-jungle-green-50 text-jungle-green-900'
                        : 'text-gray-700'
                    )}
                  >
                    <div>
                      <p className="font-heading font-black text-gray-900">{cat.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{getCategoryBreadcrumb(cat)}</p>
                    </div>
                    {form.categoryId === cat.id && (
                      <FaCheck className="h-3 w-3 text-jungle-green-600 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

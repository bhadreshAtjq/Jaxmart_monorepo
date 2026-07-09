'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button, Input, Textarea, Select, Card, Badge, Avatar } from '@/components/ui';
import { rfqApi, categoryApi, listingApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import {
  FaCubes,
  FaWrench,
  FaCircleCheck,
  FaLightbulb,
  FaCircleInfo,
  FaBolt,
  FaShieldHalved
} from 'react-icons/fa6';
import { RequirementGate } from '@/components/common/RequirementGate';

const STEPS = ['Category & Type', 'Details', 'Shipping & Budget'];

export default function RfqPostPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [suggestedCategories, setSuggestedCategories] = useState<any[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const getCategoryPath = (cat: any) => {
    if (!cat) return '';
    const parts = [];
    let curr = cat;
    while (curr) {
      parts.unshift(curr.name);
      curr = curr.parent;
    }
    return parts.join(' >> ');
  };

  useEffect(() => {
    categoryApi.getAll()
      .then(res => setCategories(res.data))
      .catch(err => console.error('Failed to fetch categories:', err));
  }, []);

  const [form, setForm] = useState({
    rfqType: 'PRODUCT', categoryId: '', title: '', description: '',
    locationPreference: '', deadline: '', preferredProviderType: '',
    budgetMin: '', budgetMax: '', hasBudget: false,
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const scoreData = useMemo(() => {
    const checks = [
      { label: 'Product Name', score: 3, met: form.title.length >= 3 },
      { label: 'Product Details', score: 43, met: form.description.length > 50 },
      { label: 'Sourcing Type', score: 3, met: !!form.rfqType },
      { label: 'Delivery Location', score: 3, met: !!form.locationPreference },
      { label: 'Target Price', score: 3, met: form.hasBudget && !!form.budgetMax },
      { label: 'Valid Until', score: 1, met: !!form.deadline },
    ];

    const currentScore = checks.filter(c => c.met).reduce((acc, c) => acc + c.score, 0);
    const totalPotential = checks.reduce((acc, c) => acc + c.score, 0);
    const percentage = Math.round((currentScore / totalPotential) * 100);

    return { checks, percentage };
  }, [form]);

  useEffect(() => {
    if (form.title.length < 3) {
      setSuggestedCategories([]);
      setSuggestedProducts([]);
      setIsSearching(false);
      return;
    }
    const titleLower = form.title.toLowerCase();

    // Auto-detect service vs product based on English keywords
    const serviceKeywords = ['service', 'repair', 'installation', 'support', 'logistics', 'consulting', 'maintenance', 'design', 'agency', 'contractor', 'freelance'];
    if (serviceKeywords.some(k => titleLower.includes(k))) {
      setForm(f => ({ ...f, rfqType: 'SERVICE' }));
    } else {
      setForm(f => ({ ...f, rfqType: 'PRODUCT' }));
    }

    const keywords = titleLower.split(' ').filter(k => k.length > 2);

    const nameMatches = categories.filter(c =>
      keywords.some(k => c.name.toLowerCase().includes(k))
    );

    setIsSearching(true);
    // Fetch matching products from the database
    const timer = setTimeout(() => {
      listingApi.search({ q: form.title, limit: 5 })
        .then(res => {
          const products = res.data?.listings || [];
          setSuggestedProducts(products);

          // Dynamically extract categories from matched products
          const dbCategoryIds = new Set();
          const dbCategories: any[] = [];
          products.forEach((p: any) => {
            if (p.category && !dbCategoryIds.has(p.category.id)) {
              dbCategoryIds.add(p.category.id);
              dbCategories.push(p.category);
            }
          });

          // Combine direct name matches with database-derived categories
          const combinedCats = [...nameMatches];
          dbCategories.forEach(dc => {
            if (!combinedCats.find(c => c.id === dc.id)) {
              combinedCats.push(dc);
            }
          });

          setSuggestedCategories(combinedCats.slice(0, 5));
        })
        .catch(err => console.error('Failed to fetch products:', err))
        .finally(() => setIsSearching(false));
    }, 500);

    return () => clearTimeout(timer);
  }, [form.title, categories]);

  const submit = async () => {
    setLoading(true);
    try {
      const payload: any = {
        rfqType: form.rfqType, title: form.title, description: form.description,
        categoryId: form.categoryId || undefined,
        locationPreference: form.locationPreference || undefined,
        deadline: form.deadline || undefined,
        preferredProviderType: form.preferredProviderType || undefined,
      };
      if (form.hasBudget) {
        payload.budgetMin = parseFloat(form.budgetMin) || 0;
        payload.budgetMax = parseFloat(form.budgetMax) || 0;
      }
      const { data } = await rfqApi.create(payload);
      toast.success('Request posted. Sellers are being notified.');
      router.push(`/rfq/${data.id}`);
    } catch { toast.error('Failed to post request. Please try again.'); }
    finally { setLoading(false); }
  };

  const canNext = () => {
    if (step === 0) return form.title.length >= 3;
    if (step === 1) return form.description.length >= 20;
    return true;
  };

  return (
    <AppLayout>
      <RequirementGate>
        <div className="max-w-6xl mx-auto pb-20 pt-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Main Form Area */}
            <div className="flex-1 w-full max-w-3xl">
              <div className="mb-10">
                <h1 className="text-3xl font-heading font-black text-jax-dark tracking-tighter uppercase leading-none mb-3">Post a Request</h1>
                <p className="text-sm text-gray-400 font-medium italic">Post your request and get quotes from verified sellers.</p>
              </div>

              {/* Progress Header */}
              <div className="bg-white border border-gray-100 p-2 rounded-2xl flex items-center mb-8 shadow-sm">
                {STEPS.map((s, i) => (
                  <div key={i} className="flex-1 flex items-center">
                    <div className={clsx(
                      "flex-1 flex items-center justify-center gap-3 py-3 rounded-xl transition-all duration-500",
                      i === step ? "bg-jax-dark text-white shadow-lg" : "text-gray-400"
                    )}>
                      <span className={clsx(
                        "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black border-2",
                        i === step ? "border-white/20 bg-white/10" : "border-gray-200"
                      )}>{i + 1}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{s}</span>
                    </div>
                  </div>
                ))}
              </div>

              <Card className="p-10 mb-8 border-gray-100 shadow-xl shadow-gray-100/20 rounded-[32px]">
                {step === 0 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                      <label className="text-[11px] font-black text-jax-dark uppercase tracking-[0.2em] mb-4 block">1. What are you looking for?</label>
                      <div className="relative">
                        <Input
                          value={form.title}
                          onChange={e => set('title', e.target.value)}
                          placeholder="e.g. Stainless steel bolts, cotton yarns..."
                          className="text-lg font-heading font-bold h-16 rounded-2xl border-gray-100 focus:border-jax-blue transition-all pr-36"
                        />
                        {isSearching && (
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 text-jax-blue animate-pulse pointer-events-none">
                            <span className="w-4 h-4 border-2 border-jax-blue border-t-transparent rounded-full animate-spin"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Searching...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {suggestedProducts.length > 0 && (
                      <div className="mb-8">
                        <label className="text-[11px] font-black text-jax-blue uppercase tracking-[0.2em] mb-4 block">Database Matches</label>
                        <div className="p-4 bg-jax-blue/5 border border-jax-blue/20 rounded-2xl">
                          <p className="text-xs text-jax-dark mb-4 font-medium">We found these products in the database matching "{form.title}". Select one to auto-fill:</p>
                          <div className="space-y-2">
                            {suggestedProducts.map(p => (
                              <button
                                key={p.id}
                                onClick={() => {
                                  set('title', p.title);
                                  set('categoryId', p.categoryId);
                                  if (p.listingType) set('rfqType', p.listingType);
                                  setSuggestedProducts([]); // Hide after selection
                                }}
                                className="w-full text-left px-4 py-3 bg-white border border-gray-100 hover:border-jax-blue hover:shadow-md rounded-xl transition-all flex items-center justify-between group"
                              >
                                <div>
                                  <p className="text-sm font-bold text-jax-dark group-hover:text-jax-blue">{p.title}</p>
                                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Category: {getCategoryPath(p.category) || p.category?.name || 'Unknown'}</p>
                                </div>
                                <FaCubes className="text-gray-300 group-hover:text-jax-blue transition-colors h-4 w-4" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-black text-jax-dark uppercase tracking-[0.2em] mb-4 block">2. What do you need?</label>
                      <div className="grid grid-cols-2 gap-4">
                        {[{ v: 'PRODUCT', icon: FaCubes, title: 'Products', sub: 'Materials, machinery, parts' },
                        { v: 'SERVICE', icon: FaWrench, title: 'Services', sub: 'Installation, logistics, support' }].map(({ v, icon: Icon, title, sub }) => (
                          <button key={v} onClick={() => set('rfqType', v)} className={clsx('p-5 rounded-2xl border-2 text-left transition-all duration-300 relative overflow-hidden group', form.rfqType === v ? 'border-jax-blue bg-jax-blue/[0.02]' : 'border-gray-50 hover:border-gray-200')}>
                            <div className={clsx('h-10 w-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110', form.rfqType === v ? 'bg-jax-blue text-white shadow-lg' : 'bg-gray-100 text-gray-400')}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <p className="font-heading font-black text-sm text-jax-dark uppercase tracking-wide">{title}</p>
                            <p className="text-[10px] text-gray-400 mt-1 font-medium italic">{sub}</p>
                            {form.rfqType === v && <div className="absolute top-2 right-2 h-4 w-4 bg-jax-blue rounded-full flex items-center justify-center"><FaCircleCheck className="text-white h-2.5 w-2.5" /></div>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div>
                      <label className="text-[11px] font-black text-jax-dark uppercase tracking-[0.2em] mb-4 block">Product Details</label>
                      <Textarea
                        value={form.description}
                        onChange={e => set('description', e.target.value)}
                        placeholder="Enter detailed requirements including quantity, material specs, quality certifications required, and delivery terms..."
                        className="min-h-[300px] rounded-2xl border-gray-100 focus:border-jax-blue p-6 leading-relaxed italic"
                        hint={`${form.description.length} chars -- Aim for at least 100 for high quality responses`}
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Delivery Location" value={form.locationPreference} onChange={e => set('locationPreference', e.target.value)} placeholder="e.g. Mumbai Hub, India" />
                      <Input label="Desired Delivery Date" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} min={new Date().toISOString().split('T')[0]} />
                    </div>

                    <Select label="Partner Verification Tier" value={form.preferredProviderType} onChange={e => set('preferredProviderType', e.target.value)}
                      options={[{ value: '', label: 'Global Standard (Open)' }, { value: 'INDIVIDUAL', label: 'Verified Individual Expert' }, { value: 'BUSINESS', label: 'Certified Corporate Entity' }]} />

                    <div className="p-6 bg-jax-light rounded-2xl border border-gray-100">
                      <label className="flex items-center gap-3 mb-4 cursor-pointer">
                        <input type="checkbox" checked={form.hasBudget} onChange={e => set('hasBudget', e.target.checked)} className="accent-jax-blue h-5 w-5 rounded-lg" />
                        <span className="text-xs font-black text-jax-dark uppercase tracking-widest">Enable Budget Controls</span>
                      </label>
                      {form.hasBudget && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                          <Input label="Target Min (INR)" type="number" value={form.budgetMin} onChange={e => set('budgetMin', e.target.value)} placeholder="0" className="bg-white" />
                          <Input label="Ceiling Max (INR)" type="number" value={form.budgetMax} onChange={e => set('budgetMax', e.target.value)} placeholder="1,0,00,000" className="bg-white" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>

              {/* Navigation */}
              <div className="flex gap-4">
                {step > 0 && (
                  <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1 h-14 rounded-2xl border-gray-200">
                    Back
                  </Button>
                )}
                <Button
                  onClick={step === 2 ? submit : () => setStep(s => s + 1)}
                  disabled={!canNext()}
                  loading={loading}
                  className={clsx("flex-1 h-14 rounded-2xl shadow-lg transition-all", step === 2 ? "bg-jax-blue" : "bg-jax-dark")}
                >
                  {step === 2 ? 'Post Request' : 'Next'}
                </Button>
              </div>
            </div>

            {/* Scoring & Trust Sidebar */}
            <aside className="w-full lg:w-[320px] sticky top-8">
              <Card className="p-8 border-gray-100 shadow-xl rounded-[32px] overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <FaBolt className="h-20 w-20 text-jax-blue" />
                </div>

                <div className="relative z-10 text-center mb-10">
                  <p className="text-[10px] font-black text-jax-blue uppercase tracking-[0.2em] mb-6">Request Quality Score</p>

                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle
                        cx="80" cy="80" r="70"
                        fill="transparent"
                        stroke="#F1F5F9"
                        strokeWidth="12"
                      />
                      <circle
                        cx="80" cy="80" r="70"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * scoreData.percentage) / 100}
                        className={clsx(
                          "transition-all duration-1000 ease-out",
                          scoreData.percentage > 70 ? "text-emerald-500" : scoreData.percentage > 40 ? "text-amber-500" : "text-jax-blue"
                        )}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-black text-jax-dark leading-none">{scoreData.percentage}%</span>
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Completeness</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-50">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Details Checklist</p>
                  {scoreData.checks.map((check, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          "h-4 w-4 rounded-full flex items-center justify-center transition-all",
                          check.met ? "bg-emerald-500 border-none" : "border border-gray-200"
                        )}>
                          {check.met && <FaCircleCheck className="text-white h-2 w-2" />}
                        </div>
                        <span className={clsx(
                          "text-[11px] font-bold transition-colors",
                          check.met ? "text-jax-dark" : "text-gray-400"
                        )}>{check.label}</span>
                      </div>
                      <span className={clsx(
                        "text-[10px] font-black font-mono",
                        check.met ? "text-jax-blue" : "text-gray-300"
                      )}>{check.score}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-10 p-5 bg-jax-dark rounded-2xl text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <FaShieldHalved className="text-jax-teal h-4 w-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Safety Guarantee</p>
                  </div>
                  <p className="text-[9px] text-white/60 leading-relaxed font-medium">Your contact details are protected. Only selected sellers can access your profile during negotiation.</p>
                </div>
              </Card>
            </aside>

          </div>
        </div>
      </RequirementGate>
    </AppLayout>
  );
}

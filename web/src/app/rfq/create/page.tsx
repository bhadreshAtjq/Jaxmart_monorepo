'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button, Input, Textarea, Select, Card, Badge, Avatar } from '@/components/ui';
import { rfqApi, categoryApi } from '@/lib/api';
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

const STEPS = ['Identity & Category', 'Specifications', 'Trade Terms'];

// Keywords mapping for the JaxMart ecosystem
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'electronics': ['solar', 'panel', 'battery', 'wiring', 'chip', 'sensor', 'led', 'camera', 'monitor'],
  'industrial-supplies': ['drill', 'machinery', 'pump', 'valve', 'bearing', 'seal', 'motor', 'compressor'],
  'construction': ['concrete', 'steel', 'brick', 'rebar', 'cement', 'tile', 'roofing'],
  'textiles': ['cotton', 'fabric', 'yarn', 'silk', 'polyester', 'denim', 'wool'],
  'services': ['consulting', 'logistics', 'shipping', 'maintenance', 'installation', 'cleaning'],
};

export default function RfqPostPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [suggestedCategories, setSuggestedCategories] = useState<any[]>([]);

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

  // Scoring Logic based on the reference image
  const scoreData = useMemo(() => {
    const checks = [
      { label: 'Product Name', score: 3, met: form.title.length >= 3 },
      { label: 'Product Category', score: 5, met: !!form.categoryId },
      { label: 'About Your Product', score: 43, met: form.description.length > 50 },
      { label: 'Sourcing Type', score: 3, met: !!form.rfqType },
      { label: 'Location Preference', score: 3, met: !!form.locationPreference },
      { label: 'Preferred Unit Price', score: 3, met: form.hasBudget && !!form.budgetMax },
      { label: 'Valid To', score: 1, met: !!form.deadline },
    ];
    
    const currentScore = checks.filter(c => c.met).reduce((acc, c) => acc + c.score, 0);
    const totalPotential = checks.reduce((acc, c) => acc + c.score, 0);
    const percentage = Math.round((currentScore / totalPotential) * 100);

    return { checks, percentage };
  }, [form]);

  // Suggested categories logic based on title AND keywords
  useEffect(() => {
    if (form.title.length < 3) {
      setSuggestedCategories([]);
      return;
    }
    const titleLower = form.title.toLowerCase();
    const keywords = titleLower.split(' ').filter(k => k.length > 2);
    
    // 1. Direct name matches
    const nameMatches = categories.filter(c => 
      keywords.some(k => c.name.toLowerCase().includes(k))
    );

    // 2. Keyword mapping matches
    const keywordMatches = categories.filter(c => {
      const catKeywords = CATEGORY_KEYWORDS[c.slug] || [];
      return catKeywords.some(kw => titleLower.includes(kw));
    });

    // Combine and deduplicate
    const combined = Array.from(new Set([...keywordMatches, ...nameMatches])).slice(0, 5);
    setSuggestedCategories(combined);
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
      toast.success('RFQ posted -- Providers are being notified.');
      router.push(`/rfq/${data.id}`);
    } catch { toast.error('Failed to post RFQ. Please try again.'); }
    finally { setLoading(false); }
  };

  const canNext = () => {
    if (step === 0) return form.title.length >= 3 && !!form.categoryId;
    if (step === 1) return form.description.length >= 20;
    return true;
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto pb-20 pt-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Main Form Area */}
          <div className="flex-1 w-full max-w-3xl">
            <div className="mb-10">
              <h1 className="text-3xl font-heading font-black text-jax-dark tracking-tighter uppercase leading-none mb-3">Request for Quotation</h1>
              <p className="text-sm text-gray-400 font-medium italic">Broadcast your requirements to thousands of verified manufacturers.</p>
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
              {/* Step 0: Identity & Category */}
              {step === 0 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div>
                    <label className="text-[11px] font-black text-jax-dark uppercase tracking-[0.2em] mb-4 block">1. What are you looking for?</label>
                    <Input 
                      value={form.title} 
                      onChange={e => set('title', e.target.value)} 
                      placeholder="e.g. Industrial Rolex Professional Edition Watches"
                      className="text-lg font-heading font-bold h-16 rounded-2xl border-gray-100 focus:border-jax-blue transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-jax-dark uppercase tracking-[0.2em] mb-4 block">2. Select Product Category</label>
                    <Select 
                      value={form.categoryId} 
                      onChange={e => set('categoryId', e.target.value)}
                      options={[{ value: '', label: 'Choose the closest matching category' }, ...categories.map(c => ({ value: c.id, label: c.name }))]} 
                      className="h-14 rounded-2xl border-gray-100"
                    />
                    
                    {suggestedCategories.length > 0 && !form.categoryId && (
                      <div className="mt-6 p-6 bg-jax-light/50 rounded-2xl border border-dashed border-jax-blue/20">
                        <div className="flex items-center gap-2 mb-4">
                          <FaLightbulb className="text-amber-500 h-3.5 w-3.5" />
                          <p className="text-[10px] font-black text-jax-blue uppercase tracking-widest">Suggested categories based on title :</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {suggestedCategories.map(c => (
                            <button 
                              key={c.id} 
                              onClick={() => set('categoryId', c.id)}
                              className="text-left px-4 py-3 bg-white border border-gray-100 hover:border-jax-blue hover:shadow-sm rounded-xl transition-all group"
                            >
                              <p className="text-xs font-bold text-jax-dark group-hover:text-jax-blue">{c.name}</p>
                              <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-tight">Marketplace &gt;&gt; Global Supply</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                   <div>
                    <label className="text-[11px] font-black text-jax-dark uppercase tracking-[0.2em] mb-4 block">3. Sourcing Protocol</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[{ v: 'PRODUCT', icon: FaCubes, title: 'Product Sourcing', sub: 'Inventory, Raw Materials, components' },
                        { v: 'SERVICE', icon: FaWrench, title: 'Service Contract', sub: 'Maintenance, Consultation, Logistics' }].map(({ v, icon: Icon, title, sub }) => (
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

              {/* Step 1: Describe Need */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div>
                    <label className="text-[11px] font-black text-jax-dark uppercase tracking-[0.2em] mb-4 block">Technical specifications</label>
                    <Textarea 
                      value={form.description} 
                      onChange={e => set('description', e.target.value)} 
                      placeholder="Enter detailed requirements including quantity, material specs, quality certifications required, and preferred manufacturing process..." 
                      className="min-h-[300px] rounded-2xl border-gray-100 focus:border-jax-blue p-6 leading-relaxed italic"
                      hint={`${form.description.length} chars -- Aim for at least 100 for high quality responses`} 
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Trade Terms */}
              {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Fulfilment Location" value={form.locationPreference} onChange={e => set('locationPreference', e.target.value)} placeholder="e.g. Mumbai Hub, India" />
                    <Input label="Desired Delivery" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} min={new Date().toISOString().split('T')[0]} />
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
                        <Input label="Ceiling Max (INR)" type="number" value={form.budgetMax} onChange={e => set('budgetMax', e.target.value)} placeholder="1,00,000" className="bg-white" />
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
                  Return to Phase {step}
                </Button>
              )}
              <Button 
                onClick={step === 2 ? submit : () => setStep(s => s + 1)} 
                disabled={!canNext()} 
                loading={loading} 
                className={clsx("flex-1 h-14 rounded-2xl shadow-lg transition-all", step === 2 ? "bg-jax-blue" : "bg-jax-dark")}
              >
                {step === 2 ? 'Initiate Broadcast' : 'Continue Execution'}
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
                <p className="text-[10px] font-black text-jax-blue uppercase tracking-[0.2em] mb-6">Requirement Health Score</p>
                
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
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Precision Audit</p>
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
                  <p className="text-[10px] font-black uppercase tracking-widest">Privacy Protocol</p>
                </div>
                <p className="text-[9px] text-white/60 leading-relaxed font-medium">Your contact details are protected. Only selected bidders can access your secure profile during negotiation.</p>
              </div>
            </Card>
          </aside>

        </div>
      </div>
    </AppLayout>
  );
}

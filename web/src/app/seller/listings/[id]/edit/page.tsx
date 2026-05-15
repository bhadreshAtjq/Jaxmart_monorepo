'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  FaCheck, FaIndustry, FaArrowRight, FaArrowLeft,
  FaFileLines, FaIndianRupeeSign, FaCloudArrowUp,
  FaCircleCheck, FaBox, FaBolt
} from 'react-icons/fa6';
import { AppLayout } from '@/components/layout/AppLayout';
import { listingApi } from '@/lib/api';
import { useCategories } from '@/lib/hooks';
import { Card, Button, PageLoader, Container, Input } from '@/components/ui';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { RequirementGate } from '@/components/common/RequirementGate';
import { ImageUpload } from '@/components/ui/ImageUpload';

const STEPS = [
  { id: 'type', label: 'Classification', icon: FaIndustry },
  { id: 'details', label: 'Technical Specs', icon: FaFileLines },
  { id: 'commercial', label: 'Commercial Terms', icon: FaIndianRupeeSign },
  { id: 'media', label: 'Media Index', icon: FaCloudArrowUp },
];

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState<any>({
    listingType: 'PRODUCT',
    categoryId: '',
    title: '',
    description: '',
    tags: [],
    productDetail: {
      brand: '',
      sku: '',
      unitOfMeasure: 'Units',
      minOrderQty: 1,
      pricePerUnit: 0,
      priceOnRequest: false,
      leadTimeDays: 7,
      countryOfOrigin: 'India',
    },
    serviceDetail: {
      serviceMode: 'REMOTE',
      typicalDuration: '',
    },
    images: []
  });

  const { data: categories } = useCategories();

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      const { data } = await listingApi.get(id);
      setFormData({
        ...data,
        listingType: data.listingType,
        productDetail: data.productDetail || formData.productDetail,
        serviceDetail: data.serviceDetail || formData.serviceDetail,
        images: data.media.map((m: any) => ({ url: m.url, isPrimary: m.isPrimary }))
      });
    } catch (err) {
      toast.error('Failed to load listing data');
      router.push('/seller/listings');
    } finally {
      setFetching(false);
    }
  };

  const next = () => setStep(s => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await listingApi.update(id, formData);
      toast.success('Listing Updated Successfully');
      router.push('/seller/listings');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <AppLayout><PageLoader /></AppLayout>;

  return (
    <AppLayout>
      <RequirementGate>
        <div className="bg-white border-b border-gray-100 mb-12">
          <Container size="xl" className="py-12">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <button onClick={() => router.push('/seller/listings')} className="flex items-center gap-2 text-[10px] font-black text-jax-blue uppercase tracking-widest hover:gap-3 transition-all mb-4">
                    <FaArrowLeft className="h-3 w-3" /> Back to Ledger
                  </button>
                  <h1 className="text-3xl font-heading font-black text-jax-dark tracking-tighter uppercase leading-none mb-2">Edit Storefront SKU</h1>
                  <p className="text-sm text-gray-500 font-medium">Modify existing industrial product or technical service details.</p>
                </div>
                
                <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                  {STEPS.map((s, i) => (
                    <div 
                      key={s.id} 
                      className={clsx(
                        "flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-500",
                        step === i ? "bg-jax-dark text-white shadow-lg" : "text-gray-400"
                      )}
                    >
                      <s.icon className={clsx("h-3.5 w-3.5", step === i ? "text-jax-accent" : "text-gray-300")} />
                      <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">{s.label}</span>
                      {step > i && <FaCircleCheck className="h-3 w-3 text-emerald-500" />}
                    </div>
                  ))}
                </div>
             </div>
          </Container>
        </div>

        <Container size="xl" className="pb-32">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {step === 0 && (
                  <Card className="p-10 border-none shadow-2xl shadow-black/[0.03] space-y-10 text-center">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-jax-accent uppercase tracking-[0.2em]">Step 01 / Registry Type</p>
                      <h2 className="text-2xl font-black text-jax-dark uppercase tracking-tight">How is this asset classified?</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(['PRODUCT', 'SERVICE'] as const).map(type => (
                        <button
                          key={type}
                          disabled={true} // Usually can't change type after creation
                          className={clsx(
                            "relative p-8 rounded-3xl border-2 transition-all group overflow-hidden opacity-80",
                            formData.listingType === type ? "border-jax-accent bg-jax-accent/5" : "border-gray-100 bg-white"
                          )}
                        >
                          <div className={clsx(
                            "h-16 w-16 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-all",
                            formData.listingType === type ? "bg-jax-accent text-white" : "bg-gray-50 text-gray-300"
                          )}>
                            {type === 'PRODUCT' ? <FaBox className="h-7 w-7" /> : <FaBolt className="h-7 w-7" />}
                          </div>
                          <h3 className="font-black text-jax-dark uppercase tracking-tight mb-2">{type === 'PRODUCT' ? 'Industrial Good' : 'Technical Service'}</h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                            {type === 'PRODUCT' ? 'Movable assets, machinery, spare parts or raw materials' : 'Consulting, installation, maintenance or specialized labor'}
                          </p>
                          <div className="absolute top-4 right-4 text-[8px] font-black uppercase text-gray-300">Locked</div>
                        </button>
                      ))}
                    </div>

                    <div className="max-w-md mx-auto text-left space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-2">Technical Industry Vertical</label>
                      <select 
                        value={formData.categoryId} 
                        onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-sm font-black uppercase tracking-tight outline-none focus:ring-2 ring-jax-accent/10"
                      >
                        <option value="">Select Vertical Registry...</option>
                        {categories?.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </Card>
                )}

                {step === 1 && (
                  <Card className="p-10 border-none shadow-2xl shadow-black/[0.03] space-y-10">
                    <div className="space-y-4 text-center">
                      <p className="text-[10px] font-black text-jax-accent uppercase tracking-[0.2em]">Step 02 / Spec Sheet</p>
                      <h2 className="text-2xl font-black text-jax-dark uppercase tracking-tight">Core Marketplace Identification</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="md:col-span-2">
                          <Input label="Registry Title" placeholder="e.g. Industrial Grade High-Torque AC Motor 5HP" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                      </div>
                      <Input label="Brand / Manufacturer" placeholder="Organization name" value={formData.productDetail.brand} onChange={e => setFormData({ ...formData, productDetail: { ...formData.productDetail, brand: e.target.value } })} />
                      <Input label="Part Number / SKU" placeholder="Internal registry ID" value={formData.productDetail.sku} onChange={e => setFormData({ ...formData, productDetail: { ...formData.productDetail, sku: e.target.value } })} />
                      <div className="md:col-span-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 pl-2">Market Prospectus (Description)</label>
                          <textarea 
                            rows={6} 
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-6 text-sm font-medium outline-none focus:ring-2 ring-jax-accent/10" 
                            placeholder="Provide detailed technical specifications, certifications, and capabilities..."
                          />
                      </div>
                    </div>
                  </Card>
                )}

                {step === 2 && (
                  <Card className="p-10 border-none shadow-2xl shadow-black/[0.03] space-y-10">
                    <div className="space-y-4 text-center">
                      <p className="text-[10px] font-black text-jax-accent uppercase tracking-[0.2em]">Step 03 / Commercial Ops</p>
                      <h2 className="text-2xl font-black text-jax-dark uppercase tracking-tight">Supply Chain Terms & Pricing</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-3 pb-4 border-b border-gray-100">
                          <label className="flex items-center gap-4 cursor-pointer group">
                            <div className={clsx(
                              "h-6 w-11 rounded-full relative transition-colors",
                              formData.productDetail.priceOnRequest ? "bg-jax-accent" : "bg-gray-200"
                            )}>
                                <div className={clsx(
                                  "absolute top-1 h-4 w-4 rounded-full bg-white transition-all",
                                  formData.productDetail.priceOnRequest ? "left-6" : "left-1"
                                )} />
                                <input type="checkbox" className="hidden" checked={formData.productDetail.priceOnRequest} onChange={e => setFormData({ ...formData, productDetail: { ...formData.productDetail, priceOnRequest: e.target.checked } })} />
                            </div>
                            <span className="text-[11px] font-black text-jax-dark uppercase tracking-widest">Hide exact price (Request Quote Mode)</span>
                          </label>
                      </div>

                      {!formData.productDetail.priceOnRequest && (
                        <Input type="number" label="Unit Price (INR)" value={formData.productDetail.pricePerUnit} onChange={e => setFormData({ ...formData, productDetail: { ...formData.productDetail, pricePerUnit: Number(e.target.value) } })} />
                      )}
                      <Input label="Sourcing Unit" placeholder="e.g. Kg, Pcs, MT" value={formData.productDetail.unitOfMeasure} onChange={e => setFormData({ ...formData, productDetail: { ...formData.productDetail, unitOfMeasure: e.target.value } })} />
                      <Input type="number" label="Minimum Order Qty" value={formData.productDetail.minOrderQty} onChange={e => setFormData({ ...formData, productDetail: { ...formData.productDetail, minOrderQty: Number(e.target.value) } })} />
                      <Input type="number" label="Global Lead Time (Days)" value={formData.productDetail.leadTimeDays} onChange={e => setFormData({ ...formData, productDetail: { ...formData.productDetail, leadTimeDays: Number(e.target.value) } })} />
                      <Input label="Origin Hierarchy" placeholder="Country of manufacture" value={formData.productDetail.countryOfOrigin} onChange={e => setFormData({ ...formData, productDetail: { ...formData.productDetail, countryOfOrigin: e.target.value } })} />
                    </div>
                  </Card>
                )}

                {step === 3 && (
                  <Card className="p-10 border-none shadow-2xl shadow-black/[0.03] space-y-10 text-center">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-jax-accent uppercase tracking-[0.2em]">Step 04 / Core Media</p>
                      <h2 className="text-2xl font-black text-jax-dark uppercase tracking-tight">Visual Asset Registry</h2>
                    </div>

                    <div className="max-w-2xl mx-auto">
                      <ImageUpload 
                        onUpload={(urls) => setFormData((d: any) => ({
                          ...d,
                          images: urls.map((url, i) => ({ url, isPrimary: i === 0 }))
                        }))} 
                        maxFiles={5}
                      />
                      {formData.images?.length > 0 && (
                        <div className="mt-8 grid grid-cols-5 gap-4">
                          {formData.images.map((img: any, i: number) => (
                            <div key={i} className="aspect-square rounded-xl overflow-hidden border border-gray-100 relative group">
                              <img src={img.url} className="w-full h-full object-cover" alt="" />
                              <button onClick={() => setFormData((d: any) => ({ ...d, images: d.images.filter((_: any, idx: number) => idx !== i) }))} className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><FaCircleCheck className="rotate-45" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-10 border-t border-gray-100">
                      <div className="flex items-center gap-3 p-6 bg-emerald-50 border border-emerald-100/50 rounded-2xl max-w-xl mx-auto">
                          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                            <FaCircleCheck className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-black text-emerald-800 uppercase tracking-tight">Ready for Sync Update</p>
                            <p className="text-[10px] text-emerald-700/70 font-bold uppercase tracking-widest">Update payload is coherent and ready for synchronization.</p>
                          </div>
                      </div>
                    </div>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 flex items-center justify-between gap-6">
              <Button 
                variant="ghost" 
                onClick={back} 
                disabled={step === 0} 
                className="h-14 px-10 text-[10px] font-black uppercase tracking-widest text-gray-400 disabled:opacity-0 transition-all"
                icon={<FaArrowLeft />}
              >
                Previous Protocol
              </Button>
              
              {step < STEPS.length - 1 ? (
                <Button 
                  onClick={next} 
                  className="h-14 px-12 bg-jax-dark text-white shadow-xl shadow-black/10 border-none text-[10px] font-black uppercase tracking-[0.2em]"
                  icon={<FaArrowRight />}
                >
                  Proceed to {STEPS[step + 1].label}
                </Button>
              ) : (
                <Button 
                  onClick={handleUpdate} 
                  loading={loading}
                  className="h-14 px-16 bg-jax-accent text-white shadow-xl shadow-jax-accent/30 border-none text-[10px] font-black uppercase tracking-[0.2em]"
                  icon={<FaCheck />}
                >
                  Apply Update Sync
                </Button>
              )}
            </div>
          </div>
        </Container>
      </RequirementGate>
    </AppLayout>
  );
}

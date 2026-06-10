'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

import {
  FaPlus, FaCheck, FaIndustry, FaArrowRight, FaArrowLeft,
  FaFileLines, FaIndianRupeeSign, FaCloudArrowUp,
  FaCircleCheck, FaBox, FaBolt, FaTrashCan
} from 'react-icons/fa6';
import { AppLayout } from '@/components/layout/AppLayout';
import { listingApi } from '@/lib/api';
import { useCategories, useCategoryAttributes } from '@/lib/hooks';
import { Card, Button, Container, Input, Textarea, PageLoader } from '@/components/ui';
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

interface BulkSlab {
  minQty: number;
  maxQty: number;
  price: number;
}

interface VariantAttribute {
  attributeId: string;
  value: string;
}

interface ProductVariantInput {
  id?: string;
  title: string;
  sku: string;
  priceOverride?: number;
  stockQty: number;
  attributeValues: VariantAttribute[];
}

interface ServicePackageInput {
  id?: string;
  name: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisionsCount: number;
  includesItems: string[];
  isPopular: boolean;
}

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Core Form State
  const [listingType, setListingType] = useState<'PRODUCT' | 'SERVICE'>('PRODUCT');
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Product Specific State
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('Pieces');
  const [minOrderQty, setMinOrderQty] = useState(1);
  const [priceType, setPriceType] = useState<'FIXED' | 'RANGE' | 'NEGOTIABLE' | 'ON_REQUEST'>('FIXED');
  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [priceRangeMin, setPriceRangeMin] = useState(0);
  const [priceRangeMax, setPriceRangeMax] = useState(0);
  const [leadTimeDays, setLeadTimeDays] = useState(7);
  const [countryOfOrigin, setCountryOfOrigin] = useState('India');
  const [hsnCode, setHsnCode] = useState('');
  const [gstRate, setGstRate] = useState(18);
  const [supplyAbility, setSupplyAbility] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [packagingDetails, setPackagingDetails] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [fobPort, setFobPort] = useState('');
  const [warranty, setWarranty] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');
  const [sampleAvailable, setSampleAvailable] = useState(false);
  const [samplePrice, setSamplePrice] = useState(0);

  // Specifications (Dynamic Category Attributes + Custom spec rows)
  const [specifications, setSpecifications] = useState<Record<string, string>>({});
  const [customSpecRows, setCustomSpecRows] = useState<{ key: string; val: string }[]>([]);

  // Product Variants State
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariantInput[]>([]);

  // Service Specific State
  const [serviceMode, setServiceMode] = useState<'REMOTE' | 'ON_SITE' | 'HYBRID'>('REMOTE');
  const [typicalDuration, setTypicalDuration] = useState('');
  const [teamSize, setTeamSize] = useState(1);
  const [avgResponseHrs, setAvgResponseHrs] = useState(24);
  const [languages, setLanguages] = useState('English');
  const [skillsTagsInput, setSkillsTagsInput] = useState('');

  // Tiered Service Packages
  const [packages, setPackages] = useState<ServicePackageInput[]>([
    { name: 'Basic', description: '', price: 0, deliveryDays: 3, revisionsCount: 1, includesItems: [], isPopular: false },
    { name: 'Standard', description: '', price: 0, deliveryDays: 7, revisionsCount: 3, includesItems: [], isPopular: true },
    { name: 'Premium', description: '', price: 0, deliveryDays: 14, revisionsCount: 10, includesItems: [], isPopular: false },
  ]);

  // Bulk Price Slabs State
  const [bulkPriceSlabs, setBulkPriceSlabs] = useState<BulkSlab[]>([]);

  // Certifications Checklist State
  const [certs, setCerts] = useState<string[]>([]);
  const [customCertInput, setCustomCertInput] = useState('');

  // Media State
  const [images, setImages] = useState<{ url: string; isPrimary: boolean }[]>([]);

  // Fetching categories and attributes
  const { data: categories } = useCategories();
  const { data: categoryAttributes } = useCategoryAttributes(categoryId);

  useEffect(() => {
    if (id) {
      fetchListingDetails();
    }
  }, [id]);

  const fetchListingDetails = async () => {
    try {
      const { data } = await listingApi.get(id);

      setListingType(data.listingType);
      setCategoryId(data.categoryId || '');
      setTitle(data.title || '');
      setDescription(data.description || '');
      setTagsInput(data.tags?.join(', ') || '');
      setImages(data.media?.map((m: any) => ({ url: m.url, isPrimary: m.isPrimary })) || []);

      if (data.listingType === 'PRODUCT' && data.productDetail) {
        const pd = data.productDetail;
        setBrand(pd.brand || '');
        setSku(pd.sku || '');
        setUnitOfMeasure(pd.unitOfMeasure || 'Pieces');
        setMinOrderQty(pd.minOrderQty || 1);
        setPriceType(pd.priceType || 'FIXED');
        setPricePerUnit(pd.pricePerUnit || 0);
        setPriceRangeMin(pd.priceRangeMin || 0);
        setPriceRangeMax(pd.priceRangeMax || 0);
        setLeadTimeDays(pd.leadTimeDays || 7);
        setCountryOfOrigin(pd.countryOfOrigin || 'India');
        setHsnCode(pd.hsnCode || '');
        setGstRate(pd.gstRate || 18);
        setSupplyAbility(pd.supplyAbility || '');
        setDeliveryTime(pd.deliveryTime || '');
        setPackagingDetails(pd.packagingDetails || '');
        setPaymentTerms(pd.paymentTerms || '');
        setFobPort(pd.fobPort || '');
        setWarranty(pd.warranty || '');
        setReturnPolicy(pd.returnPolicy || '');
        setSampleAvailable(pd.sampleAvailable || false);
        setSamplePrice(pd.samplePrice || 0);
        setCerts(pd.certifications || []);

        // Parse specifications
        const specs = pd.specifications || {};
        setSpecifications(specs);

        // Populate custom specifications that aren't category-defined
        const customRows: { key: string; val: string }[] = [];
        setCustomSpecRows(customRows);

        if (data.variants && data.variants.length > 0) {
          setHasVariants(true);
          setVariants(data.variants.map((v: any) => ({
            id: v.id,
            title: v.title,
            sku: v.sku,
            priceOverride: v.priceOverride || undefined,
            stockQty: v.stockQty || 0,
            attributeValues: v.attributeValues?.map((av: any) => ({
              attributeId: av.attributeId,
              value: av.value,
            })) || []
          })));
        }

        setBulkPriceSlabs(pd.bulkPriceSlabs || []);
      } else if (data.listingType === 'SERVICE' && data.serviceDetail) {
        const sd = data.serviceDetail;
        setServiceMode(sd.serviceMode || 'REMOTE');
        setTypicalDuration(sd.typicalDuration || '');
        setTeamSize(sd.teamSize || 1);
        setAvgResponseHrs(sd.avgResponseHrs || 24);
        setLanguages(sd.languages?.join(', ') || 'English');
        setSkillsTagsInput(sd.skillsTags?.join(', ') || '');

        if (sd.packages && sd.packages.length > 0) {
          setPackages(sd.packages.map((pkg: any) => ({
            id: pkg.id,
            name: pkg.name,
            description: pkg.description || '',
            price: pkg.price || 0,
            deliveryDays: pkg.deliveryDays || 3,
            revisionsCount: pkg.revisionsCount || 1,
            includesItems: pkg.includesItems || [],
            isPopular: pkg.isPopular || false,
          })));
        }
      }
    } catch (err) {
      toast.error('Failed to retrieve listing details');
      router.push('/seller/listings');
    } finally {
      setFetching(false);
    }
  };

  const next = () => setStep(s => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  // Specs helpers
  const addCustomSpecRow = () => {
    setCustomSpecRows(r => [...r, { key: '', val: '' }]);
  };

  const removeCustomSpecRow = (index: number) => {
    setCustomSpecRows(customSpecRows.filter((_, i) => i !== index));
  };

  const updateCustomSpecRow = (index: number, key: string, val: string) => {
    const updated = [...customSpecRows];
    updated[index] = { key, val };
    setCustomSpecRows(updated);
  };

  // Variants helpers
  const addVariantRow = () => {
    const defaultAttrs = categoryAttributes ? categoryAttributes.map((attr: any) => ({
      attributeId: attr.id,
      value: '',
    })) : [];

    setVariants(v => [
      ...v,
      { title: '', sku: '', priceOverride: undefined, stockQty: 0, attributeValues: defaultAttrs }
    ]);
  };

  const removeVariantRow = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof ProductVariantInput, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const updateVariantAttr = (varIndex: number, attrId: string, val: string) => {
    const updated = [...variants];
    const attrs = [...updated[varIndex].attributeValues];
    const idx = attrs.findIndex(a => a.attributeId === attrId);
    if (idx > -1) {
      attrs[idx] = { attributeId: attrId, value: val };
    } else {
      attrs.push({ attributeId: attrId, value: val });
    }
    updated[varIndex] = { ...updated[varIndex], attributeValues: attrs };
    setVariants(updated);
  };

  // Bulk Price Slabs helper functions
  const addBulkPriceSlab = () => {
    setBulkPriceSlabs(s => [...s, { minQty: 1, maxQty: 10, price: 0 }]);
  };

  const removeBulkPriceSlab = (index: number) => {
    setBulkPriceSlabs(bulkPriceSlabs.filter((_, i) => i !== index));
  };

  const updateBulkPriceSlab = (index: number, field: keyof BulkSlab, value: number) => {
    const updated = [...bulkPriceSlabs];
    updated[index] = { ...updated[index], [field]: value };
    setBulkPriceSlabs(updated);
  };

  // Service package helper functions
  const updateServicePackage = (index: number, field: keyof ServicePackageInput, value: any) => {
    const updated = [...packages];
    updated[index] = { ...updated[index], [field]: value };
    setPackages(updated);
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const finalSpecifications: Record<string, string> = { ...specifications };
      customSpecRows.forEach(row => {
        if (row.key.trim()) {
          finalSpecifications[row.key.trim()] = row.val;
        }
      });

      const payload: any = {
        title,
        description,
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        status: 'ACTIVE',
        images,
      };

      if (listingType === 'PRODUCT') {
        payload.productDetail = {
          brand,
          sku,
          unitOfMeasure,
          minOrderQty,
          pricePerUnit,
          priceType,
          priceRangeMin,
          priceRangeMax,
          bulkPriceSlabs,
          stockAvailable: true,
          leadTimeDays,
          hsnCode,
          gstRate,
          specifications: finalSpecifications,
          supplyAbility,
          deliveryTime,
          packagingDetails,
          paymentTerms,
          fobPort,
          sampleAvailable,
          samplePrice,
          warranty,
          returnPolicy,
          certifications: certs,
        };

        if (hasVariants && variants.length > 0) {
          payload.variants = variants;
        } else {
          payload.variants = [];
        }
      } else {
        payload.serviceDetail = {
          serviceMode,
          typicalDuration,
          teamSize,
          avgResponseHrs,
          languages: languages.split(',').map(l => l.trim()).filter(Boolean),
          skillsTags: skillsTagsInput.split(',').map(s => s.trim()).filter(Boolean),
          basePrice: packages[0]?.price || 0,
          priceUnit: 'PROJECT',
          currency: 'INR',
        };
        payload.packages = packages;
      }

      await listingApi.update(id, payload);
      toast.success('Listing Updated Successfully');
      router.push('/seller/listings');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update registry database');
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
                <h1 className="text-3xl font-heading font-black text-jax-dark tracking-tighter uppercase leading-none mb-2 font-heading">Edit Storefront SKU</h1>
                <p className="text-sm text-gray-500 font-medium font-sans">Modify existing industrial product or technical service details.</p>
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
                {/* STEP 1: CLASSIFICATION */}
                {step === 0 && (
                  <Card className="p-10 border-none shadow-2xl shadow-black/[0.03] space-y-10 text-center">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-jax-accent uppercase tracking-[0.2em]">Step 01 / Registry Type</p>
                      <h2 className="text-2xl font-black text-jax-dark uppercase tracking-tight font-heading">Registry classification profile</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(['PRODUCT', 'SERVICE'] as const).map(type => (
                        <button
                          key={type}
                          disabled={true}
                          className={clsx(
                            "relative p-8 rounded-3xl border-2 transition-all group overflow-hidden opacity-85 cursor-not-allowed",
                            listingType === type ? "border-jax-accent bg-jax-accent/5" : "border-gray-100 bg-white"
                          )}
                        >
                          <div className={clsx(
                            "h-16 w-16 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-all",
                            listingType === type ? "bg-jax-accent text-white" : "bg-gray-50 text-gray-300"
                          )}>
                            {type === 'PRODUCT' ? <FaBox className="h-7 w-7" /> : <FaBolt className="h-7 w-7" />}
                          </div>
                          <h3 className="font-black text-jax-dark uppercase tracking-tight mb-2 font-heading">{type === 'PRODUCT' ? 'Industrial Good' : 'Technical Service'}</h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                            {type === 'PRODUCT' ? 'Movable assets, machinery, spare parts or raw materials' : 'Consulting, installation, maintenance or specialized labor'}
                          </p>
                          <span className="absolute top-3 right-3 text-[8px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded border border-gray-100">Locked</span>
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-2">Technical Industry Vertical</label>
                        <select
                          value={categoryId}
                          onChange={e => setCategoryId(e.target.value)}
                          className="w-full h-14 bg-gray-50 border border-gray-150 rounded-2xl px-6 text-sm font-black uppercase tracking-tight outline-none focus:ring-2 ring-jax-accent/10"
                        >
                          <option value="">Select Vertical Registry...</option>
                          {categories?.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <Input
                        label="Search Tags (Comma separated)"
                        placeholder="e.g. steel, high-tensile, construction"
                        value={tagsInput}
                        onChange={e => setTagsInput(e.target.value)}
                      />
                    </div>
                  </Card>
                )}

                {/* STEP 2: TECHNICAL SPECS */}
                {step === 1 && (
                  <Card className="p-10 border-none shadow-2xl shadow-black/[0.03] space-y-10">
                    <div className="space-y-4 text-center">
                      <p className="text-[10px] font-black text-jax-accent uppercase tracking-[0.2em]">Step 02 / Spec Sheet</p>
                      <h2 className="text-2xl font-black text-jax-dark uppercase tracking-tight font-heading">Core Marketplace Identification</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="md:col-span-2">
                        <Input label="Registry Title" placeholder="e.g. Industrial Grade High-Torque AC Motor 5HP" value={title} onChange={e => setTitle(e.target.value)} required />
                      </div>

                      {listingType === 'PRODUCT' ? (
                        <>
                          <Input label="Brand / Manufacturer" placeholder="Organization name" value={brand} onChange={e => setBrand(e.target.value)} />
                          <Input label="Part Number / SKU" placeholder="Internal registry ID" value={sku} onChange={e => setSku(e.target.value)} />
                          <Input label="Sourcing Unit" placeholder="e.g. Kg, Pcs, Metric Tons" value={unitOfMeasure} onChange={e => setUnitOfMeasure(e.target.value)} />
                          <Input type="number" label="Global Lead Time (Days)" value={leadTimeDays} onChange={e => setLeadTimeDays(Number(e.target.value))} />
                          <Input label="Country of Origin" value={countryOfOrigin} onChange={e => setCountryOfOrigin(e.target.value)} />
                          <Input label="HSN Code" placeholder="Harmonized System Nomenclature" value={hsnCode} onChange={e => setHsnCode(e.target.value)} />
                          <Input type="number" label="GST Rate (%)" value={gstRate} onChange={e => setGstRate(Number(e.target.value))} />
                          <Input label="FOB Port" placeholder="e.g. Port of Mumbai" value={fobPort} onChange={e => setFobPort(e.target.value)} />
                        </>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-2">Service Delivery Mode</label>
                            <select
                              value={serviceMode}
                              onChange={e => setServiceMode(e.target.value as any)}
                              className="w-full h-14 bg-gray-50 border border-gray-150 rounded-2xl px-6 text-sm font-black uppercase tracking-tight outline-none focus:ring-2 ring-jax-accent/10"
                            >
                              <option value="REMOTE">Fully Remote / Digital</option>
                              <option value="ON_SITE">On-Site Client Office</option>
                              <option value="HYBRID">Hybrid Operational Model</option>
                            </select>
                          </div>
                          <Input label="Typical Project Duration" placeholder="e.g. 4-6 Weeks" value={typicalDuration} onChange={e => setTypicalDuration(e.target.value)} />
                          <Input type="number" label="Dedicated Team Size" value={teamSize} onChange={e => setTeamSize(Number(e.target.value))} />
                          <Input type="number" label="Avg Response Time (Hours)" value={avgResponseHrs} onChange={e => setAvgResponseHrs(Number(e.target.value))} />
                          <div className="md:col-span-2">
                            <Input label="Supported Operational Languages" placeholder="e.g. English, Hindi, German" value={languages} onChange={e => setLanguages(e.target.value)} />
                          </div>
                          <div className="md:col-span-2">
                            <Input label="Specialized Skills / Tools Tags" placeholder="e.g. ISO 27001, Penetration Testing, Python" value={skillsTagsInput} onChange={e => setSkillsTagsInput(e.target.value)} />
                          </div>
                        </>
                      )}

                      {/* Dynamic Specifications based on categoryAttributes */}
                      {listingType === 'PRODUCT' && categoryAttributes && categoryAttributes.length > 0 && (
                        <div className="md:col-span-2 pt-6 border-t border-gray-100 space-y-4">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-2">Category-Specific Technical Attributes</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categoryAttributes.map((attr: any) => (
                              <div key={attr.id} className="space-y-1">
                                <label className="text-xs font-black text-jax-dark uppercase tracking-tight">{attr.name} {attr.isRequired && <span className="text-red-500">*</span>}</label>
                                {attr.options && attr.options.length > 0 ? (
                                  <select
                                    value={specifications[attr.name] || ''}
                                    onChange={e => setSpecifications({ ...specifications, [attr.name]: e.target.value })}
                                    className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-bold text-jax-dark outline-none focus:ring-2 ring-jax-accent/10"
                                  >
                                    <option value="">Select option...</option>
                                    {attr.options.map((opt: string) => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    placeholder={`Enter ${attr.name.toLowerCase()}...`}
                                    value={specifications[attr.name] || ''}
                                    onChange={e => setSpecifications({ ...specifications, [attr.name]: e.target.value })}
                                    className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-bold text-jax-dark outline-none focus:ring-2 ring-jax-accent/10"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Custom Specifications */}
                      {listingType === 'PRODUCT' && (
                        <div className="md:col-span-2 pt-6 border-t border-gray-100 space-y-4">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Key Product Specifications (Custom Attributes)</label>
                            <button
                              type="button"
                              onClick={addCustomSpecRow}
                              className="text-[10px] font-black text-jax-blue uppercase tracking-widest hover:text-jax-accent transition-colors flex items-center gap-1.5"
                            >
                              <FaPlus className="h-3 w-3" /> Add Custom Spec
                            </button>
                          </div>

                          <div className="space-y-3">
                            {customSpecRows.map((row, idx) => (
                              <div key={idx} className="flex gap-4 items-center animate-in fade-in duration-300">
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    placeholder="Specification Name (e.g. Material)"
                                    value={row.key}
                                    onChange={e => updateCustomSpecRow(idx, e.target.value, row.val)}
                                    className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-bold text-jax-dark outline-none focus:ring-2 ring-jax-accent/10"
                                  />
                                </div>
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    placeholder="Value (e.g. Stainless Steel)"
                                    value={row.val}
                                    onChange={e => updateCustomSpecRow(idx, row.key, e.target.value)}
                                    className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-bold text-jax-dark outline-none focus:ring-2 ring-jax-accent/10"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeCustomSpecRow(idx)}
                                  className="h-9 w-9 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition-colors font-bold text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Product Variants Section */}
                      {listingType === 'PRODUCT' && (
                        <div className="md:col-span-2 pt-6 border-t border-gray-100 space-y-4">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={hasVariants}
                              onChange={e => {
                                setHasVariants(e.target.checked);
                                if (e.target.checked && variants.length === 0) addVariantRow();
                              }}
                              className="rounded border-gray-300 text-jax-accent focus:ring-jax-accent h-4 w-4"
                            />
                            <span className="text-xs font-black text-jax-dark uppercase tracking-widest">This product has variants (e.g. size, color, configuration overrides)</span>
                          </label>

                          {hasVariants && (
                            <div className="space-y-4 mt-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                              <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black text-jax-dark uppercase tracking-widest">Configure SKUs / Variants</h3>
                                <button
                                  type="button"
                                  onClick={addVariantRow}
                                  className="text-[10px] font-black text-jax-blue uppercase tracking-widest hover:text-jax-accent transition-colors flex items-center gap-1.5"
                                >
                                  <FaPlus className="h-3.5 w-3.5" /> Add Variant
                                </button>
                              </div>

                              <div className="space-y-6">
                                {variants.map((v, varIdx) => (
                                  <div key={varIdx} className="bg-white p-4 rounded-xl border border-gray-150 space-y-4 relative shadow-sm">
                                    <button
                                      type="button"
                                      onClick={() => removeVariantRow(varIdx)}
                                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                      <FaTrashCan className="h-4 w-4" />
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                      <div className="md:col-span-2">
                                        <Input label="Variant Name (e.g. Silver / 128GB)" placeholder="Variant descriptor" value={v.title} onChange={e => updateVariant(varIdx, 'title', e.target.value)} required />
                                      </div>
                                      <Input label="Variant SKU" placeholder="Unique SKU ID" value={v.sku} onChange={e => updateVariant(varIdx, 'sku', e.target.value)} required />
                                      <Input type="number" label="Stock Quantity" value={v.stockQty} onChange={e => updateVariant(varIdx, 'stockQty', Number(e.target.value))} required />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <Input type="number" label="Price Override (Optional)" placeholder="Leave empty for base price" value={v.priceOverride || ''} onChange={e => updateVariant(varIdx, 'priceOverride', e.target.value ? Number(e.target.value) : undefined)} />

                                      {/* Match variant attributes dynamically */}
                                      {categoryAttributes && categoryAttributes.map((attr: any) => {
                                        const valObj = v.attributeValues.find(av => av.attributeId === attr.id);
                                        return (
                                          <div key={attr.id} className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{attr.name} Value</label>
                                            {attr.options && attr.options.length > 0 ? (
                                              <select
                                                value={valObj?.value || ''}
                                                onChange={e => updateVariantAttr(varIdx, attr.id, e.target.value)}
                                                className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-bold text-jax-dark outline-none focus:ring-2 ring-jax-accent/10"
                                              >
                                                <option value="">Select option...</option>
                                                {attr.options.map((opt: string) => (
                                                  <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                              </select>
                                            ) : (
                                              <input
                                                type="text"
                                                placeholder={`Variant ${attr.name.toLowerCase()} value`}
                                                value={valObj?.value || ''}
                                                onChange={e => updateVariantAttr(varIdx, attr.id, e.target.value)}
                                                className="w-full h-11 bg-gray-50 border border-gray-150 rounded-xl px-4 text-xs font-bold text-jax-dark outline-none focus:ring-2 ring-jax-accent/10"
                                              />
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 pl-2">Market Prospectus (Description)</label>
                        <Textarea
                          rows={6}
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          placeholder="Provide detailed technical specifications, certifications, and capabilities..."
                        />
                      </div>
                    </div>
                  </Card>
                )}

                {/* STEP 3: COMMERCIAL OPS */}
                {step === 2 && (
                  <Card className="p-10 border-none shadow-2xl shadow-black/[0.03] space-y-10">
                    <div className="space-y-4 text-center">
                      <p className="text-[10px] font-black text-jax-accent uppercase tracking-[0.2em]">Step 03 / Commercial Ops</p>
                      <h2 className="text-2xl font-black text-jax-dark uppercase tracking-tight font-heading">Supply Chain Terms & Pricing</h2>
                    </div>

                    {listingType === 'PRODUCT' ? (
                      <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Product Pricing Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-2">Pricing Operational Model</label>
                            <select
                              value={priceType}
                              onChange={e => setPriceType(e.target.value as any)}
                              className="w-full h-14 bg-gray-50 border border-gray-150 rounded-2xl px-6 text-sm font-black uppercase tracking-tight outline-none focus:ring-2 ring-jax-accent/10"
                            >
                              <option value="FIXED">Fixed Unit Price</option>
                              <option value="RANGE">Variable Price Range</option>
                              <option value="NEGOTIABLE">Fully Negotiable / Target Price</option>
                              <option value="ON_REQUEST">Request For Quote (RFQ) Mode</option>
                            </select>
                          </div>

                          {priceType === 'FIXED' && (
                            <Input type="number" label="Unit Price (INR)" value={pricePerUnit} onChange={e => setPricePerUnit(Number(e.target.value))} />
                          )}

                          {priceType === 'RANGE' && (
                            <>
                              <Input type="number" label="Min Price (INR)" value={priceRangeMin} onChange={e => setPriceRangeMin(Number(e.target.value))} />
                              <Input type="number" label="Max Price (INR)" value={priceRangeMax} onChange={e => setPriceRangeMax(Number(e.target.value))} />
                            </>
                          )}

                          {priceType === 'NEGOTIABLE' && (
                            <Input type="number" label="Target Price (INR)" value={pricePerUnit} onChange={e => setPricePerUnit(Number(e.target.value))} />
                          )}

                          <Input type="number" label="Minimum Order Qty" value={minOrderQty} onChange={e => setMinOrderQty(Number(e.target.value))} />
                        </div>

                        {/* Bulk Price Slabs */}
                        {priceType !== 'ON_REQUEST' && (
                          <div className="pt-6 border-t border-gray-100 space-y-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="text-xs font-black text-jax-dark uppercase tracking-widest">Tiered Wholesale/Bulk Pricing Slabs</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Specify custom unit price based on larger volume sizes.</p>
                              </div>
                              <button
                                type="button"
                                onClick={addBulkPriceSlab}
                                className="text-[10px] font-black text-jax-blue uppercase tracking-widest hover:text-jax-accent transition-colors flex items-center gap-1.5"
                              >
                                <FaPlus className="h-3 w-3" /> Add Pricing Slab
                              </button>
                            </div>

                            <div className="space-y-3">
                              {bulkPriceSlabs.map((slab, idx) => (
                                <div key={idx} className="flex gap-4 items-center animate-in fade-in duration-300">
                                  <Input type="number" placeholder="Min Qty" label="Min Order Volume" value={slab.minQty} onChange={e => updateBulkPriceSlab(idx, 'minQty', Number(e.target.value))} />
                                  <Input type="number" placeholder="Max Qty" label="Max Order Volume" value={slab.maxQty} onChange={e => updateBulkPriceSlab(idx, 'maxQty', Number(e.target.value))} />
                                  <Input type="number" placeholder="Price" label="Slab Unit Price (INR)" value={slab.price} onChange={e => updateBulkPriceSlab(idx, 'price', Number(e.target.value))} />
                                  <button
                                    type="button"
                                    onClick={() => removeBulkPriceSlab(idx)}
                                    className="h-11 w-11 mt-6 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl flex items-center justify-center transition-colors font-bold text-xs shrink-0"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Logistics, Packaging & Warranties */}
                        <div className="pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                          <Input label="Supply Ability" placeholder="e.g. 5000 Metric Tons/Month" value={supplyAbility} onChange={e => setSupplyAbility(e.target.value)} />
                          <Input label="Logistics Delivery Time" placeholder="e.g. 10-15 Days after confirmation" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} />
                          <Input label="Packaging & Carton Specifications" placeholder="e.g. Industrial Palletized, Shrink-wrapped" value={packagingDetails} onChange={e => setPackagingDetails(e.target.value)} />
                          <Input label="Standard Payment Terms" placeholder="e.g. 30% Advance, 70% Letter of Credit" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} />
                          <Input label="Warranty Duration" placeholder="e.g. 1 Year Manufacturer Warranty" value={warranty} onChange={e => setWarranty(e.target.value)} />
                          <Input label="Industrial Return Policy" placeholder="e.g. 15-day return on defective goods" value={returnPolicy} onChange={e => setReturnPolicy(e.target.value)} />
                        </div>

                        {/* Samples Provision */}
                        <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row gap-8 items-start">
                          <label className="flex items-center gap-4 cursor-pointer group mt-4">
                            <input
                              type="checkbox"
                              checked={sampleAvailable}
                              onChange={e => setSampleAvailable(e.target.checked)}
                              className="rounded border-gray-300 text-jax-accent focus:ring-jax-accent h-4 w-4"
                            />
                            <span className="text-xs font-black text-jax-dark uppercase tracking-widest">Evaluation Sample Available</span>
                          </label>
                          {sampleAvailable && (
                            <Input type="number" label="Evaluation Sample Cost (INR)" value={samplePrice} onChange={e => setSamplePrice(Number(e.target.value))} />
                          )}
                        </div>

                        {/* Certifications Checklist */}
                        <div className="pt-6 border-t border-gray-100 space-y-4">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Regulatory Compliance & Certifications</label>
                          <div className="flex flex-wrap gap-3">
                            {['ISO 9001', 'CE Certified', 'RoHS Compliant', 'ISI Mark', 'BIS Standard', 'FSSAI Certified'].map(c => {
                              const isChecked = certs.includes(c);
                              return (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => {
                                    if (isChecked) setCerts(certs.filter(item => item !== c));
                                    else setCerts([...certs, c]);
                                  }}
                                  className={clsx(
                                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                    isChecked
                                      ? "bg-jax-accent text-white border-jax-accent shadow-sm"
                                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                  )}
                                >
                                  {c}
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex gap-4 max-w-md pt-2">
                            <input
                              type="text"
                              placeholder="Add Custom Certification..."
                              value={customCertInput}
                              onChange={e => setCustomCertInput(e.target.value)}
                              className="flex-1 h-11 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-bold text-jax-dark outline-none focus:ring-2 ring-jax-accent/10"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (customCertInput.trim()) {
                                  setCerts([...certs, customCertInput.trim()]);
                                  setCustomCertInput('');
                                }
                              }}
                              className="h-11 px-5 bg-jax-dark text-white rounded-xl text-xs font-black uppercase tracking-widest"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Service Tiered Packages Builder */
                      <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="text-center">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Tiered Professional Service Packages</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {packages.map((pkg, idx) => (
                            <div key={idx} className={clsx(
                              "p-6 rounded-3xl border-2 space-y-6 relative overflow-hidden",
                              pkg.isPopular ? "border-jax-accent bg-jax-accent/5" : "border-gray-100 bg-white"
                            )}>
                              {pkg.isPopular && (
                                <div className="absolute top-3 right-3 bg-jax-accent text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                                  Popular
                                </div>
                              )}

                              <h3 className="text-sm font-black text-jax-dark uppercase tracking-widest">{pkg.name} Package</h3>

                              <textarea
                                value={pkg.description}
                                onChange={e => updateServicePackage(idx, 'description', e.target.value)}
                                placeholder={`Scope, terms & details of the ${pkg.name.toLowerCase()} package...`}
                                rows={4}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-medium outline-none focus:ring-2 ring-jax-accent/10"
                              />

                              <Input type="number" label="Rate (INR)" value={pkg.price} onChange={e => updateServicePackage(idx, 'price', Number(e.target.value))} />
                              <Input type="number" label="Expected Delivery (Days)" value={pkg.deliveryDays} onChange={e => updateServicePackage(idx, 'deliveryDays', Number(e.target.value))} />
                              <Input type="number" label="Revision Rounds Allowed" value={pkg.revisionsCount} onChange={e => updateServicePackage(idx, 'revisionsCount', Number(e.target.value))} />

                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-2">Includes / Deliverables</label>
                                <input
                                  type="text"
                                  placeholder="e.g. PDF Report, Source Code (Comma sep)"
                                  value={pkg.includesItems.join(', ')}
                                  onChange={e => updateServicePackage(idx, 'includesItems', e.target.value.split(',').map(item => item.trim()).filter(Boolean))}
                                  className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-bold text-jax-dark outline-none focus:ring-2 ring-jax-accent/10"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {/* STEP 4: CORE MEDIA */}
                {step === 3 && (
                  <Card className="p-10 border-none shadow-2xl shadow-black/[0.03] space-y-10 text-center">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-jax-accent uppercase tracking-[0.2em]">Step 04 / Core Media</p>
                      <h2 className="text-2xl font-black text-jax-dark uppercase tracking-tight font-heading">Visual Asset Registry</h2>
                    </div>

                    <div className="max-w-2xl mx-auto">
                      <ImageUpload
                        onUpload={(urls) => setImages(
                          urls.map((url, i) => ({ url, isPrimary: i === 0 }))
                        )}
                        maxFiles={5}
                      />
                      {images.length > 0 && (
                        <div className="mt-8 grid grid-cols-5 gap-4">
                          {images.map((img, i) => (
                            <div key={i} className="aspect-square rounded-xl overflow-hidden border border-gray-150 relative group">
                              <img src={img.url} className="w-full h-full object-cover" alt="" />
                              <button
                                type="button"
                                onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                                className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-[10px]"
                              >
                                ✕
                              </button>
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
                          <p className="text-xs font-black text-emerald-800 uppercase tracking-tight font-heading">Ready for Registry Update Sync</p>
                          <p className="text-[10px] text-emerald-700/70 font-bold uppercase tracking-widest font-sans">Update parameters verified and aligned for synchronization.</p>
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
                  Apply Registry Update
                </Button>
              )}
            </div>
          </div>
        </Container>
      </RequirementGate>
    </AppLayout>
  );
}

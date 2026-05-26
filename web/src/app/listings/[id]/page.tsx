'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FaShieldHalved, FaStar, FaCircleCheck, FaBolt, FaArrowRight, 
  FaTruck, FaGlobe, FaBoxOpen, FaCubes, FaHeart, FaShareNodes, 
  FaCheck, FaBuilding, FaIndustry, FaCertificate, FaFlask, FaClock, 
  FaLanguage, FaUsers, FaMessage, FaBox
} from 'react-icons/fa6';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useListing } from '@/lib/hooks';
import { messageApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button, Card, Badge, Avatar, TrustScore, Container, Skeleton, Input } from '@/components/ui';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

function getSpecifications(listing: any) {
  const dbSpecs = listing.productDetail?.specifications;
  if (dbSpecs && typeof dbSpecs === 'object' && Object.keys(dbSpecs).length > 0) {
    return Object.entries(dbSpecs).map(([key, val]) => ({ name: key, value: String(val) }));
  }
  return [];
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [activeServiceTab, setActiveServiceTab] = useState<'Basic' | 'Standard' | 'Premium'>('Basic');
  const [inquiryQty, setInquiryQty] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [sending, setSending] = useState(false);
  const { data: listing, isLoading, error } = useListing(id as string);
  const { user, isLoggedIn } = useAuthStore();
  const isOwner = user?.id === listing?.sellerId;

  if (isLoading) {
    return (
      <PublicLayout>
        <Container size="xl" className="py-20 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <Skeleton className="aspect-square rounded-3xl" />
            </div>
            <div className="lg:col-span-7 space-y-6">
              <Skeleton className="h-10 w-3/4 rounded-xl" />
              <Skeleton className="h-6 w-1/4 rounded-xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-12 w-1/2 rounded-xl" />
            </div>
          </div>
        </Container>
      </PublicLayout>
    );
  }

  if (error || !listing) {
    return (
      <PublicLayout>
        <Container className="py-40 text-center space-y-6">
          <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
            <FaBoxOpen className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-jax-dark uppercase tracking-tight font-heading">Asset Registry Offline</h1>
            <p className="text-sm text-gray-500 font-medium">The requested listing is either deprecated or does not exist in the index.</p>
          </div>
          <Button className="px-8 py-3.5 bg-jax-dark text-white text-xs font-black uppercase tracking-widest" onClick={() => router.push('/search')}>Browse Index</Button>
        </Container>
      </PublicLayout>
    );
  }

  const isProduct = listing.listingType === 'PRODUCT';
  const pd = listing.productDetail;
  const sd = listing.serviceDetail;
  const seller = listing.seller;
  const bp = seller?.businessProfile;

  // Pricing calculations
  const priceType = pd?.priceType || 'FIXED';
  const activeVariant = selectedVariant || listing.variants?.[0];
  const effectivePrice = activeVariant?.priceOverride ?? pd?.pricePerUnit;
  const specs = getSpecifications(listing);
  const hasBulkSlabs = pd?.bulkPriceSlabs && Array.isArray(pd.bulkPriceSlabs) && pd.bulkPriceSlabs.length > 0;
  const hasCerts = (pd?.certifications?.length > 0) || (bp?.certifications?.length > 0);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error('Please log in to send inquiries to suppliers.');
      router.push('/auth/login');
      return;
    }
    if (listing.sellerId === user?.id) {
      toast.error('You cannot start a conversation with yourself.');
      return;
    }
    setSending(true);
    try {
      const targetQuantity = inquiryQty ? `${inquiryQty} ${isProduct ? (pd?.unitOfMeasure || 'units') : 'project scope'}` : '';
      const msg = inquiryMsg.trim() || `Hi, I am interested in sourcing your ${isProduct ? 'product' : 'service'}: "${listing.title}". Please send a quote.`;
      
      const payloadMessage = targetQuantity 
        ? `${msg}\n\n*Target Volume: ${targetQuantity}*`
        : msg;

      const { data: conv } = await messageApi.startConversation(listing.sellerId, payloadMessage, undefined, undefined, listing.id);
      toast.success('Inquiry initiated!');
      router.push(`/inbox?id=${conv.id}&recipientId=${listing.sellerId}`);
    } catch {
      toast.error('Failed to send inquiry.');
    } finally {
      setSending(false);
    }
  };

  // Product technical specs matching original fields
  const productInfoRows = isProduct ? [
    { label: 'Brand / Manufacturer', value: pd?.brand || 'OEM/ODM' },
    pd?.sku && { label: 'Model SKU', value: activeVariant?.sku || pd.sku },
    { label: 'Place of Origin', value: pd?.countryOfOrigin || 'India' },
    { label: 'Min. Order Quantity', value: `${pd?.minOrderQty || 1} ${pd?.unitOfMeasure || 'Pieces'}` },
    pd?.leadTimeDays && { label: 'Global Lead Time', value: `${pd.leadTimeDays} Days` },
    pd?.supplyAbility && { label: 'Supply Capacity', value: pd.supplyAbility },
    pd?.deliveryTime && { label: 'Transit Terms', value: pd.deliveryTime },
    pd?.packagingDetails && { label: 'Packaging Format', value: pd.packagingDetails },
    pd?.paymentTerms && { label: 'Payment Terms', value: pd.paymentTerms },
    pd?.fobPort && { label: 'FOB Port', value: pd.fobPort },
    pd?.warranty && { label: 'Warranty Duration', value: pd.warranty },
    pd?.returnPolicy && { label: 'Industrial Return Policy', value: pd.returnPolicy },
    pd?.hsnCode && { label: 'HSN Code', value: pd.hsnCode },
    pd?.gstRate && { label: 'GST Rate', value: `${pd.gstRate}%` },
  ].filter(Boolean) as { label: string; value: string }[] : [];

  return (
    <PublicLayout>
      <div className="bg-gray-50 min-h-screen pb-24">
        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-100">
          <Container size="xl" className="py-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span className="hover:text-jax-blue cursor-pointer transition-colors" onClick={() => router.push('/')}>Index</span>
              <span>/</span>
              <span className="hover:text-jax-blue cursor-pointer transition-colors" onClick={() => router.push(`/search?category=${listing.category?.id}`)}>{listing.category?.name}</span>
              <span>/</span>
              <span className="text-gray-800 truncate max-w-[200px]">{listing.title}</span>
            </div>
          </Container>
        </div>

        <Container size="xl" className="py-12">
          {/* Main Hero Card */}
          <div className="bg-white rounded-3xl border border-gray-200/60 p-8 shadow-xl shadow-black/[0.02] mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Visual Assets Panel */}
              <div className="lg:col-span-5 space-y-4">
                <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative group flex items-center justify-center p-4">
                  {listing.media && listing.media.length > 0 ? (
                    <img 
                      src={listing.media[activeImg]?.url} 
                      alt={listing.title} 
                      className="max-h-full max-w-full object-contain mix-blend-multiply" 
                    />
                  ) : (
                    <div className="text-gray-300 flex flex-col items-center gap-2">
                      <FaBoxOpen className="h-16 w-16" />
                      <span className="text-[10px] font-black uppercase tracking-widest">No Visual Assets Registered</span>
                    </div>
                  )}
                </div>

                {listing.media && listing.media.length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                    {listing.media.map((m: any, i: number) => (
                      <button 
                        key={i} 
                        onClick={() => setActiveImg(i)} 
                        className={clsx(
                          'h-16 w-16 rounded-xl border overflow-hidden shrink-0 transition-all p-1 bg-white',
                          activeImg === i ? 'ring-2 ring-jax-accent border-transparent' : 'border-gray-250 opacity-70 hover:opacity-100'
                        )}
                      >
                        <img src={m.url} className="w-full h-full object-cover rounded-lg" alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Transaction Details & Action Panel */}
              <div className="lg:col-span-4 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge status={listing.listingType} />
                    <Badge status={listing.status} />
                  </div>
                  <h1 className="text-2xl font-black text-jax-dark tracking-tight uppercase font-heading leading-tight">{listing.title}</h1>
                  
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <div className="flex items-center gap-1 text-amber-500">
                      <FaStar className="h-3.5 w-3.5 fill-current" />
                      <span className="font-bold text-gray-700">{listing.avgRating || '4.9'}</span>
                    </div>
                    <span>•</span>
                    <span>{listing.reviewCount || 0} reviews</span>
                  </div>
                </div>

                {/* Price Matrix block */}
                {isProduct ? (
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-150 space-y-4">
                    {priceType === 'FIXED' && typeof effectivePrice === 'number' ? (
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">FOB Unit Rate</p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-black text-jax-dark">₹{effectivePrice.toLocaleString('en-IN')}</span>
                          <span className="text-xs text-gray-500 font-bold">/ {pd?.unitOfMeasure || 'Piece'}</span>
                        </div>
                      </div>
                    ) : priceType === 'RANGE' && pd?.priceRangeMin ? (
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing Matrix Range</p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-black text-jax-dark">₹{pd.priceRangeMin.toLocaleString('en-IN')} – ₹{pd.priceRangeMax?.toLocaleString('en-IN')}</span>
                          <span className="text-xs text-gray-500 font-bold">/ {pd?.unitOfMeasure || 'Piece'}</span>
                        </div>
                      </div>
                    ) : priceType === 'NEGOTIABLE' && typeof effectivePrice === 'number' ? (
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Negotiable Target Unit Price</p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-black text-jax-dark">₹{effectivePrice.toLocaleString('en-IN')}</span>
                          <span className="text-xs text-gray-500 font-bold">/ {pd?.unitOfMeasure || 'Piece'}</span>
                        </div>
                        <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2.5 py-0.5 rounded border border-amber-100/50 mt-1 inline-block">Flexible Negotiable Terms</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-sans">Unit pricing</p>
                        <p className="text-lg font-black text-jax-blue mt-1 uppercase tracking-tight">On-Request Custom Quote</p>
                      </div>
                    )}

                    {/* Specifications inside variant box */}
                    <div className="flex flex-wrap gap-2.5 pt-3 border-t border-gray-200/60">
                      {pd?.sampleAvailable && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-xl text-[10px] font-bold text-jax-blue border border-gray-150">
                          <FaFlask className="h-3 w-3" /> Evaluation Sample: {pd.samplePrice ? `₹${pd.samplePrice}` : 'Free'}
                        </span>
                      )}
                      {pd?.warranty && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-xl text-[10px] font-bold text-indigo-600 border border-gray-150">
                          <FaShieldHalved className="h-3 w-3" /> {pd.warranty}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Service mode key features info */
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-150 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Delivery Mode</span>
                        <span className="text-xs font-black text-jax-dark uppercase tracking-tight flex items-center gap-1.5 mt-1">
                          <FaGlobe className="h-3.5 w-3.5 text-jax-blue" /> {sd?.serviceMode}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Project Lead Time</span>
                        <span className="text-xs font-black text-jax-dark uppercase tracking-tight flex items-center gap-1.5 mt-1">
                          <FaClock className="h-3.5 w-3.5 text-jax-blue" /> {sd?.typicalDuration || 'Flexible'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200/60 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg text-[10px] font-bold text-gray-600 border border-gray-150">
                        <FaUsers className="h-3.5 w-3.5 text-gray-400" /> Crew size: {sd?.teamSize || 1}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg text-[10px] font-bold text-gray-600 border border-gray-150">
                        <FaLanguage className="h-3.5 w-3.5 text-gray-400" /> {sd?.languages?.join(', ') || 'English'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Product Variant Selector */}
                {isProduct && listing.variants && listing.variants.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 block">Selected Configuration</label>
                    <div className="flex flex-wrap gap-2">
                      {listing.variants.map((v: any) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={clsx(
                            'px-4 py-2.5 rounded-xl text-xs font-bold border transition-all shadow-sm',
                            (activeVariant?.id === v.id)
                              ? 'border-jax-accent bg-jax-accent/5 text-jax-dark font-black'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          )}
                        >
                          {v.title}
                          {v.priceOverride && <span className="ml-1.5 text-[10px] font-medium text-gray-400">₹{v.priceOverride.toLocaleString('en-IN')}</span>}
                        </button>
                      ))}
                    </div>
                    {activeVariant && activeVariant.stockQty !== undefined && (
                      <p className="text-[10px] font-bold text-gray-400 mt-1 pl-1">
                        {activeVariant.stockQty > 0 ? `${activeVariant.stockQty} Units available for immediate dispatch` : 'Configuration out of stock'}
                      </p>
                    )}
                  </div>
                )}

                {/* Main buttons */}
                <div className="space-y-3">
                  <Button 
                    fullWidth 
                    disabled={isOwner} 
                    className="h-14 bg-jax-dark text-white border-none text-[10px] font-black uppercase tracking-[0.2em] shadow-lg rounded-xl" 
                    onClick={() => document.getElementById('inquiry-section')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {isOwner ? 'Own Merchant Catalog' : 'Initiate Inquiry Dispatch'}
                  </Button>
                </div>
              </div>

              {/* Vendor Trust Badge Sidebar */}
              <div className="lg:col-span-3">
                <div className="border border-gray-250 rounded-3xl overflow-hidden shadow-sm">
                  <div className="bg-jax-dark text-white p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={bp?.businessName || seller?.fullName} size="md" className="border-2 border-white/10" />
                      <div className="min-w-0">
                        <h3 className="font-heading font-black text-sm uppercase tracking-tight truncate">{bp?.businessName || seller?.fullName}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <FaCircleCheck className="h-3 w-3 text-emerald-400" />
                          <span className="text-[9px] text-emerald-300 font-bold uppercase tracking-widest">Verified Supplier</span>
                        </div>
                      </div>
                    </div>
                    <TrustScore score={seller?.trustScore || 90} />
                  </div>

                  <div className="p-6 space-y-4 text-xs font-medium text-gray-600">
                    <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-400">Registry Profile</span><span className="font-bold text-jax-dark uppercase">Manufacturer / Supplier</span></div>
                    <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-400">Establishment Year</span><span className="font-bold text-jax-dark">{bp?.establishedYear || '2015'}</span></div>
                    <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-400">Operational Workforce</span><span className="font-bold text-jax-dark">{bp?.employeeRange || '11-50'} Employees</span></div>
                    {bp?.gstin && <div className="flex justify-between"><span className="text-gray-400 font-sans">GST Registry ID</span><span className="font-bold text-jax-dark text-[11px] font-mono">{bp.gstin}</span></div>}
                  </div>

                  <div className="bg-emerald-50/50 p-4 border-t border-gray-100">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-emerald-150/40">
                      <FaShieldHalved className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-emerald-950 uppercase tracking-tight font-heading">Trade Assurance Index</p>
                        <p className="text-[9px] text-emerald-700/80 font-semibold mt-0.5 leading-relaxed font-sans">Contracts registered under Trade Assurance include escrow protection and transit compliance guarantees.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Service tiered packages comparison layout */}
          {!isProduct && sd?.packages && sd.packages.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-250/60 p-8 shadow-xl shadow-black/[0.01] mb-8 space-y-6">
              <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-jax-accent uppercase tracking-[0.25em]">Fiverr-Style Tiered packages</p>
                <h2 className="text-xl font-black text-jax-dark uppercase tracking-tight font-heading">Choose a Technical Service Tier</h2>
              </div>

              {/* Tab navigation for mobile views, Grid for larger monitors */}
              <div className="block lg:hidden flex border-b border-gray-150 mb-6">
                {sd.packages.map((pkg: any) => (
                  <button
                    key={pkg.name}
                    onClick={() => setActiveServiceTab(pkg.name)}
                    className={clsx(
                      "flex-1 py-3 text-xs font-black uppercase tracking-widest border-b-2 text-center",
                      activeServiceTab === pkg.name ? "border-jax-accent text-jax-dark" : "border-transparent text-gray-400"
                    )}
                  >
                    {pkg.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {sd.packages.map((pkg: any) => (
                  <div 
                    key={pkg.id} 
                    className={clsx(
                      "p-6 rounded-2xl border-2 space-y-6 relative transition-all duration-300",
                      pkg.isPopular ? "border-jax-accent bg-jax-accent/5" : "border-gray-200 bg-white",
                      "lg:block",
                      activeServiceTab === pkg.name ? "block" : "hidden"
                    )}
                  >
                    {pkg.isPopular && (
                      <div className="absolute top-3 right-3 bg-jax-accent text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                        Recommended
                      </div>
                    )}
                    
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{pkg.name} Package</span>
                      <h3 className="text-2xl font-black text-jax-dark uppercase mt-1">₹{pkg.price?.toLocaleString('en-IN')}</h3>
                    </div>

                    <p className="text-xs text-gray-500 font-medium font-sans leading-relaxed">{pkg.description || 'Custom service package configured for B2B project deliverables.'}</p>

                    <div className="space-y-2.5 text-xs text-gray-600 font-semibold border-t border-gray-150 pt-4">
                      <div className="flex justify-between"><span className="text-gray-400">Expected Delivery</span><span className="text-jax-dark">{pkg.deliveryDays} Days</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Revision Rounds</span><span className="text-jax-dark">{pkg.revisionsCount} Rounds</span></div>
                    </div>

                    {pkg.includesItems && pkg.includesItems.length > 0 && (
                      <div className="space-y-2 border-t border-gray-150 pt-4">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Deliverables Included:</span>
                        <ul className="space-y-1.5">
                          {pkg.includesItems.map((item: string, i: number) => (
                            <li key={i} className="flex items-center gap-2 text-xs font-bold text-gray-700">
                              <FaCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                              <span className="truncate">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button 
                      fullWidth 
                      className="mt-4 py-3 bg-jax-dark text-white text-xs font-black uppercase tracking-widest rounded-xl"
                      onClick={() => {
                        setInquiryMsg(`Hi, I would like to inquire about your "${pkg.name}" package under the service: "${listing.title}". Please confirm timeline and onboarding.`);
                        document.getElementById('inquiry-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Inquire on {pkg.name} Tier
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detail specs sheet, certifications, description details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-9 space-y-8">
              
              {/* Product Specifications Registry */}
              {isProduct && productInfoRows.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-250/60 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-150 bg-gray-50/50">
                    <h2 className="text-sm font-black text-jax-dark uppercase tracking-widest font-heading">Product Specifications Registry</h2>
                  </div>
                  <table className="w-full text-xs font-medium text-gray-600">
                    <tbody>
                      {productInfoRows.map((row, i) => (
                        <tr key={i} className={clsx("border-b border-gray-100", i % 2 === 0 ? 'bg-white' : 'bg-gray-50/20')}>
                          <td className="px-6 py-3.5 text-gray-400 font-bold uppercase tracking-widest w-1/3 border-r border-gray-100">{row.label}</td>
                          <td className="px-6 py-3.5 text-jax-dark font-bold font-sans">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Dynamic specifications & technical features */}
              {isProduct && specs.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-250/60 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-150 bg-gray-50/50">
                    <h2 className="text-sm font-black text-jax-dark uppercase tracking-widest font-heading">Technical Specifications & Custom Parameters</h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {specs.map((spec, i) => (
                      <div key={i} className="flex gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                        <strong className="text-gray-400 uppercase font-black tracking-wider w-1/3 shrink-0">{spec.name}:</strong>
                        <span className="text-jax-dark font-bold font-sans">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bulk Pricing Slabs matrix */}
              {isProduct && hasBulkSlabs && (
                <div className="bg-white rounded-3xl border border-gray-250/60 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-150 bg-gray-50/50">
                    <h2 className="text-sm font-black text-jax-dark uppercase tracking-widest font-heading">Tiered Bulk Slabs Pricing matrix</h2>
                  </div>
                  <table className="w-full text-xs font-semibold text-gray-600">
                    <thead className="bg-gray-50 text-gray-400 text-left">
                      <tr>
                        <th className="px-6 py-3.5 font-bold uppercase tracking-widest">Min Qty Volume</th>
                        <th className="px-6 py-3.5 font-bold uppercase tracking-widest">Max Qty Volume</th>
                        <th className="px-6 py-3.5 font-bold uppercase tracking-widest">Unit Rate Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(pd.bulkPriceSlabs as any[]).map((slab: any, i: number) => (
                        <tr key={i} className={clsx("border-b border-gray-100", i % 2 === 0 ? 'bg-white' : 'bg-gray-50/20')}>
                          <td className="px-6 py-3.5 font-bold text-jax-dark font-sans">{slab.minQty?.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-3.5 font-medium text-gray-500 font-sans">{slab.maxQty ? slab.maxQty.toLocaleString('en-IN') : '∞'}</td>
                          <td className="px-6 py-3.5 font-black text-jax-accent font-sans">₹{slab.price?.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Compliance & certifications checklist */}
              {hasCerts && (
                <div className="bg-white rounded-3xl border border-gray-250/60 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-150 bg-gray-50/50">
                    <h2 className="text-sm font-black text-jax-dark uppercase tracking-widest font-heading">Regulatory Standards & Compliance Certificates</h2>
                  </div>
                  <div className="p-6 flex flex-wrap gap-3">
                    {pd?.certifications?.map((cert: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200/50 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm">
                        <FaCertificate className="h-4 w-4" /> {cert}
                      </span>
                    ))}
                    {bp?.certifications?.map((cert: any, i: number) => (
                      <span key={`bp-${i}`} className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200/50 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm">
                        <FaCertificate className="h-4 w-4" /> {cert.certName} {cert.isVerified && <FaCircleCheck className="h-3.5 w-3.5 text-emerald-500" />}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Service custom skills and tools tags */}
              {!isProduct && sd?.skillsTags && sd.skillsTags.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-250/60 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-150 bg-gray-50/50">
                    <h2 className="text-sm font-black text-jax-dark uppercase tracking-widest font-heading">Skills Registry & Technical Toolkit</h2>
                  </div>
                  <div className="p-6 flex flex-wrap gap-2">
                    {sd.skillsTags.map((tag: string, i: number) => (
                      <span key={i} className="px-3.5 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold font-sans">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Core description text box */}
              <div className="bg-white rounded-3xl border border-gray-250/60 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-150 bg-gray-50/50">
                  <h2 className="text-sm font-black text-jax-dark uppercase tracking-widest font-heading">Technical Prospectus & Scope Description</h2>
                </div>
                <div className="p-8">
                  <p className="text-sm text-gray-600 leading-relaxed font-sans whitespace-pre-line">{listing.description}</p>
                </div>
              </div>

              {/* Inquiry Form panel */}
              <div id="inquiry-section" className="bg-white rounded-3xl border border-gray-250/60 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-150 bg-gray-50/50 flex items-center justify-between">
                  <h2 className="text-sm font-black text-jax-dark uppercase tracking-widest font-heading">Dispatch Supplier Inquiry</h2>
                  <FaMessage className="h-4 w-4 text-gray-400" />
                </div>
                <div className="p-8">
                  <form onSubmit={handleInquiry} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input 
                        type="number" 
                        min="1" 
                        required 
                        value={inquiryQty} 
                        onChange={e => setInquiryQty(e.target.value)} 
                        label={isProduct ? `Target Volume (${pd?.unitOfMeasure || 'units'}) *` : 'Project Phase / Slabs count *'} 
                        placeholder={isProduct ? `Min volume order quantity: ${pd?.minOrderQty || 1}` : 'e.g. 1 Project'}
                      />
                      <Input 
                        type="text" 
                        disabled 
                        value={isProduct ? (pd?.unitOfMeasure || 'Pieces') : 'B2B Custom Project'} 
                        label="Logistics Unit Type" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 pl-2">Inquiry Specifications message *</label>
                      <textarea 
                        rows={4} 
                        required 
                        value={inquiryMsg} 
                        onChange={e => setInquiryMsg(e.target.value)} 
                        placeholder={`Provide clear scope descriptions, delivery constraints, or target SLA terms for "${listing.title}"...`} 
                        className="w-full p-4 border border-gray-250 rounded-2xl text-sm font-medium focus:ring-2 ring-jax-accent/10 focus:border-jax-accent outline-none leading-relaxed font-sans" 
                      />
                    </div>
                    <Button 
                      type="submit" 
                      loading={sending} 
                      className="h-14 px-12 bg-jax-accent text-white border-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-jax-accent/20 rounded-xl"
                    >
                      Dispatch RFQ Message
                    </Button>
                  </form>
                </div>
              </div>

            </div>

            {/* Sidebar widgets */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Profile card summary */}
              <div className="bg-white rounded-3xl border border-gray-250/60 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-150 bg-gray-50/50">
                  <h3 className="text-xs font-black text-jax-dark uppercase tracking-widest font-heading">Merchant Profile</h3>
                </div>
                <div className="p-6 space-y-4 text-xs font-semibold text-gray-600">
                  <div className="flex gap-3">
                    <FaBuilding className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-jax-dark font-bold font-heading uppercase tracking-tight">{bp?.businessName || seller?.fullName}</p>
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Verified Supplier Registry</p>
                    </div>
                  </div>
                  <p className="text-gray-500 font-medium font-sans leading-relaxed border-t border-gray-100 pt-4">
                    {bp?.description || 'Registered commercial supplier on JaxMart verified for professional cross-border and domestic trade operations.'}
                  </p>
                  {bp?.website && (
                    <a href={bp.website} target="_blank" rel="noreferrer" className="text-jax-blue font-bold hover:underline flex items-center gap-1.5 pt-2">
                      <FaGlobe className="h-4 w-4" /> Visit Corporate Portal
                    </a>
                  )}
                </div>
              </div>

              {/* Accepted Payments Info Widget */}
              <div className="bg-white rounded-3xl border border-gray-250/60 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-150 bg-gray-50/50">
                  <h3 className="text-xs font-black text-jax-dark uppercase tracking-widest font-heading">Accepted Settlement channels</h3>
                </div>
                <div className="p-6 space-y-3.5 text-xs font-semibold text-gray-600">
                  {[
                    'JaxMart Escrow Clearing (Recommended)',
                    'Telegraphic Transfer (T/T Advance)',
                    'Irrevocable Letter of Credit (L/C)',
                    'Net Banking / NEFT Settlement / UPI'
                  ].map((p, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <FaCircleCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="text-gray-700 font-bold uppercase tracking-tight">{p}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </Container>
      </div>
    </PublicLayout>
  );
}

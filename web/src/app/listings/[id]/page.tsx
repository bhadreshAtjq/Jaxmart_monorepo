'use client';
import { useState } from 'react';

import { useParams, useRouter } from 'next/navigation';
import { 
  FaCartShopping, FaComment, FaShieldHalved, FaLocationDot, 
  FaBuilding, FaCubes, FaTruck, FaShareNodes, FaHeart, 
  FaStar, FaCircleCheck, FaBolt, FaArrowRight, FaBoxOpen, FaGlobe
} from 'react-icons/fa6';
import { AppLayout } from '@/components/layout/AppLayout';
import { useListing } from '@/lib/hooks';
import { rfqApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button, Card, Badge, Avatar, TrustScore, Container, Skeleton } from '@/components/ui';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [quickQuoteOpen, setQuickQuoteOpen] = useState(false);

  const { data: listing, isLoading, error } = useListing(id as string);
  const { user } = useAuthStore();
  const isOwner = user?.id === listing?.sellerId;

  if (isLoading) return <ListingSkeleton />;
  
  if (error || !listing) return (
    <AppLayout>
      <Container className="flex flex-col items-center justify-center py-40">
        <div className="h-20 w-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mb-6">
           <FaTriangleExclamation className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-heading font-black text-jax-dark tracking-tighter">LISTING UNAVAILABLE</h1>
        <p className="text-gray-400 font-medium mt-2">The requested trade offer has expired or been removed.</p>
        <Button className="mt-10 px-10" onClick={() => router.push('/search')}>Back to Marketplace</Button>
      </Container>
    </AppLayout>
  );

  const pd = listing.productDetail;
  const price = pd?.pricePerUnit;

  return (
    <AppLayout>
      <Container size="xl" className="pb-32 pt-6">
        <AnimatePresence>
          {quickQuoteOpen && (
            <QuickQuoteModal 
              listing={listing} 
              onClose={() => setQuickQuoteOpen(false)} 
              onSuccess={() => {
                setQuickQuoteOpen(false);
                router.push('/rfq');
              }}
            />
          )}
        </AnimatePresence>

        {/* Header Actions */}
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              <span className="hover:text-jax-blue cursor-pointer" onClick={() => router.push('/')}>Market</span>
              <FaArrowRight className="h-2 w-2" />
              <span className="hover:text-jax-blue cursor-pointer">{listing.category?.name}</span>
              <FaArrowRight className="h-2 w-2" />
              <span className="text-jax-blue truncate max-w-[150px]">{listing.title}</span>
           </div>
           <div className="flex gap-2">
              <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 transition-all"><FaHeart className="h-4 w-4" /></button>
              <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-jax-blue hover:border-jax-blue/20 transition-all"><FaShareNodes className="h-4 w-4" /></button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Product Media Experience */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="aspect-[16/10] bg-white rounded-[2.5rem] p-4 shadow-2xl shadow-jax-dark/5 border border-gray-100 overflow-hidden group relative"
            >
              <div className="w-full h-full rounded-[2rem] overflow-hidden">
                <img 
                  src={listing.media?.[activeImage]?.url || listing.media?.[0]?.url} 
                  alt={listing.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                />
              </div>
              <div className="absolute top-8 left-8 flex gap-2">
                 <Badge status={listing.listingType} className="shadow-2xl backdrop-blur-md" />
                 {listing.isFeatured && <Badge status="ACTIVE" label="Verified Merchant" className="bg-jax-blue text-white shadow-2xl" />}
              </div>
            </motion.div>
            
            {listing.media?.length > 1 && (
              <div className="flex gap-4 px-2">
                {listing.media.map((m: any, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(idx)} 
                    className={clsx(
                      'h-24 w-24 rounded-3xl border-4 overflow-hidden shrink-0 transition-all duration-300 transform', 
                      activeImage === idx ? 'border-jax-blue scale-105 shadow-xl' : 'border-transparent grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                    )}
                  >
                    <img src={m.url} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Sourcing Console */}
          <div className="lg:col-span-1 space-y-8 sticky top-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100">
                    <FaStar className="h-3 w-3 text-amber-500" />
                    <span className="text-xs font-black text-amber-700">{listing.avgRating || '4.9'}</span>
                 </div>
                 <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{listing.reviewCount || 0} TRADE REVIEWS</span>
              </div>
              
              <h1 className="text-4xl font-heading font-black text-jax-dark tracking-tighter uppercase leading-[0.9]">{listing.title}</h1>
              
              <div className="flex items-end gap-3 pt-4">
                {typeof price === 'number' ? (
                  <>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Procurement Price</span>
                       <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-heading font-black text-jax-blue tracking-tighter">{'\u20B9'}{price.toLocaleString('en-IN')}</span>
                          <span className="text-xs font-bold text-gray-400">/ {pd?.unitOfMeasure}</span>
                       </div>
                    </div>
                  </>
                ) : (
                  <div className="px-6 py-4 bg-jax-blue/5 border-2 border-dashed border-jax-blue/20 rounded-3xl">
                     <span className="text-xl font-heading font-black text-jax-blue tracking-tighter uppercase">Price on Request</span>
                  </div>
                )}
              </div>
            </div>

            {/* Logistics & Order Specs */}
            <Card className="p-8 grid grid-cols-2 gap-y-6 gap-x-8 bg-white border-2 border-gray-50 shadow-none">
              <StatRow icon={<FaCubes />} label="Minimum Order" value={`${pd?.minOrderQty || 1} Units`} />
              <StatRow icon={<FaTruck />} label="Lead Time" value={`${pd?.leadTimeDays || '7-14'} Days`} />
              <StatRow icon={<FaGlobe />} label="Shipment From" value={pd?.countryOfOrigin || 'Direct (India)'} />
              <StatRow icon={<FaBoxOpen />} label="Stock Status" value={pd?.stockAvailable ? 'In Warehouse' : 'By Order'} color={pd?.stockAvailable ? 'text-emerald-500' : 'text-amber-500'} />
            </Card>

            <div className="flex flex-col gap-3">
              <Button 
                size="lg" 
                disabled={isOwner}
                className={clsx(
                   "h-16 text-sm font-black uppercase tracking-widest",
                   isOwner ? "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed" : "shadow-2xl shadow-jax-blue/20"
                )}
                icon={<FaBolt className="h-4 w-4" />} 
                onClick={() => setQuickQuoteOpen(true)}
              >
                {isOwner ? 'Ownership Console' : 'Initiate Instant Quote'}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                 <Button variant="outline" className="h-12 text-[10px] uppercase font-black tracking-widest border-gray-200">Contact Factory</Button>
                 <Button variant="outline" className="h-12 text-[10px] uppercase font-black tracking-widest border-gray-200" icon={<FaCartShopping className="h-3 w-3" />}>Sample Request</Button>
              </div>
            </div>

            {/* Professional Seller Console */}
            <Card className="p-0 overflow-hidden border-2 border-jax-blue/10 bg-gradient-to-br from-white to-gray-50/50">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <Avatar name={listing.seller?.businessProfile?.businessName || listing.seller?.fullName} size="lg" className="border-4 border-white shadow-xl" />
                    <div>
                        <div className="flex items-center gap-2">
                           <h3 className="font-heading font-black text-jax-dark text-sm uppercase tracking-tight">
                              {listing.seller?.businessProfile?.businessName || listing.seller?.fullName}
                           </h3>
                           <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[8px]"><FaCircleCheck /></div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Verified Supply Partner</p>
                    </div>
                 </div>
                 <TrustScore score={listing.seller?.trustScore || 88} />
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-100">
                 <div className="p-4 text-center">
                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">Market Tenure</p>
                    <p className="text-xs font-black text-jax-dark">12+ Years</p>
                 </div>
                 <div className="p-4 text-center">
                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">Response Time</p>
                    <p className="text-xs font-black text-jax-blue font-heading tracking-tighter">Under 2h</p>
                 </div>
              </div>
              <button 
                className="w-full py-4 bg-jax-dark text-white text-[10px] font-black uppercase tracking-[0.25em] hover:bg-jax-blue transition-colors"
                onClick={() => router.push(`/seller/${listing.sellerId}`)}
              >
                Access Merchant Profile
              </button>
            </Card>
          </div>
        </div>

        {/* Detailed Intelligence Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            <section>
              <div className="flex items-center gap-4 mb-8">
                 <div className="h-1px flex-1 bg-gray-200" />
                 <h2 className="text-[10px] font-black text-jax-blue uppercase tracking-[0.4em] whitespace-nowrap">Technical Specifications</h2>
                 <div className="h-1px flex-1 bg-gray-200" />
              </div>
              <div className="text-jax-dark text-sm leading-relaxed font-semibold whitespace-pre-line tracking-tight">
                {listing.description}
              </div>
            </section>

            {pd?.specifications && (
               <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {Object.entries(pd.specifications as any).map(([k, v]) => (
                     <div key={k} className="p-6 bg-gray-50 border border-gray-100 rounded-[2rem]">
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">{k}</p>
                        <p className="text-xs font-black text-jax-dark truncate">{v as string}</p>
                     </div>
                  ))}
               </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-10 space-y-8">
               <Card variant="dark" className="p-8 relative overflow-hidden group">
                  <div className="relative z-10">
                     <div className="h-14 w-14 rounded-2xl bg-jax-teal/10 flex items-center justify-center text-jax-teal mb-8">
                        <FaShieldHalved className="h-6 w-6" />
                     </div>
                     <h3 className="text-xl font-heading font-black mb-2 tracking-tighter uppercase text-white">JaxMart Trade Safeguard</h3>
                     <p className="text-xs text-white/60 mb-10 leading-loose">
                        Your transaction is protected by our Tier-1 Escrow Protocol. Funds are only released to the seller upon verified shipment reaching your docks.
                     </p>
                     <ul className="space-y-5">
                        <li className="flex items-center gap-3">
                           <div className="h-6 w-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400"><FaCircleCheck className="h-3 w-3" /></div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-white">Secured Payments</span>
                        </li>
                        <li className="flex items-center gap-3">
                           <div className="h-6 w-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400"><FaCircleCheck className="h-3 w-3" /></div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-white">Pre-Shipment Audit</span>
                        </li>
                        <li className="flex items-center gap-3">
                           <div className="h-6 w-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400"><FaCircleCheck className="h-3 w-3" /></div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-white">Logistics Tracking</span>
                        </li>
                     </ul>
                  </div>
                  <FaShieldHalved className="h-40 w-40 absolute -bottom-10 -right-10 text-white/[0.03] group-hover:scale-125 transition-transform duration-1000" />
               </Card>
               
               <div className="p-8 bg-jax-blue/5 border border-jax-blue/10 rounded-[2.5rem] flex flex-col items-center text-center">
                   <h4 className="text-[10px] font-black text-jax-blue uppercase tracking-widest mb-4">Bulk Inquiry Specialist</h4>
                   <Avatar name="Support" size="md" className="border-4 border-white mb-4" />
                   <p className="text-[11px] font-bold text-gray-500 leading-relaxed mb-6">Need custom sizing or direct factory inspection? Our trade agents can assist 24/7.</p>
                   <Button variant="outline" size="sm" className="w-full bg-white font-black text-[9px] uppercase tracking-widest border-jax-blue/20">Chat with Agent</Button>
               </div>
            </div>
          </div>
        </div>
      </Container>
    </AppLayout>
  );
}

function QuickQuoteModal({ listing, onClose, onSuccess }: { listing: any, onClose: () => void, onSuccess: () => void }) {
  const [step, setStep] = useState(1);
  const [qty, setQty] = useState(listing.productDetail?.minOrderQty || 100);
  const [route, setRoute] = useState('ROAD');
  const [loading, setLoading] = useState(false);

  const total = (listing.productDetail?.pricePerUnit || 0) * qty;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await rfqApi.create({
        title: `Instant Quote: ${listing.title}`,
        description: `Automated instant quote request for ${qty} units of ${listing.title}.`,
        rfqType: listing.listingType,
        categoryId: listing.categoryId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        items: [{
          listingId: listing.id,
          quantity: qty,
          targetPrice: listing.productDetail?.pricePerUnit,
          specifications: { logistics: route }
        }]
      });
      toast.success('Procurement Request Initiated');
      onSuccess();
    } catch (err) {
      toast.error('Failed to initiate quote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-jax-dark/60 backdrop-blur-xl" 
        onClick={onClose} 
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
      >
        <div className="p-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-lg bg-jax-blue/10 flex items-center justify-center text-jax-blue">
                   <FaBolt className="h-3 w-3" />
                </div>
                <span className="text-[10px] font-black text-jax-blue uppercase tracking-widest">Instant Sourcing Wizard</span>
              </div>
              <h2 className="text-3xl font-heading font-black text-jax-dark tracking-tighter leading-tight">
                {step === 1 ? 'Select Quantity' : step === 2 ? 'Logistics Route' : 'Finalize Request'}
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Stepper Display */}
          <div className="flex gap-2 mb-10">
             {[1,2,3].map(s => (
                <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-jax-blue' : 'bg-gray-100'}`} />
             ))}
          </div>

          <div className="min-h-[240px]">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-3 gap-4">
                  {[100, 500, 1000].map(v => (
                    <button 
                       key={v}
                       onClick={() => setQty(v)}
                       className={clsx(
                         "py-6 rounded-3xl border-2 font-heading font-black text-xl transition-all",
                         qty === v ? "bg-jax-blue border-jax-blue text-white shadow-xl shadow-jax-blue/20" : "bg-white border-gray-100 text-gray-400 hover:border-jax-blue/30"
                       )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Custom Volume</label>
                   <input 
                     type="number" 
                     className="w-full h-16 px-6 bg-gray-50 border-none rounded-2xl text-xl font-heading font-black text-jax-dark focus:ring-2 focus:ring-jax-blue/20 transition-all font-heading"
                     value={qty}
                     onChange={(e) => setQty(Number(e.target.value))}
                   />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
                {[
                  { id: 'ROAD', label: 'Land Freight', sub: '7-10 Days Delivery', icon: FaTruck },
                  { id: 'SEA', label: 'Ocean Freight', sub: '20-30 Days Economy', icon: FaGlobe },
                  { id: 'AIR', label: 'Priority Air', sub: '3-5 Days Express', icon: FaBolt },
                ].map(r => (
                  <button 
                    key={r.id}
                    onClick={() => setRoute(r.id)}
                    className={clsx(
                      "flex items-center gap-6 p-6 rounded-3xl border-2 transition-all text-left",
                      route === r.id ? "bg-jax-blue/5 border-jax-blue shadow-sm" : "bg-white border-gray-100 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                    )}
                  >
                    <div className={clsx("h-14 w-14 rounded-2xl flex items-center justify-center", route === r.id ? "bg-jax-blue text-white" : "bg-gray-100 text-gray-400")}>
                       <r.icon className="h-6 w-6" />
                    </div>
                    <div>
                       <p className={clsx("font-heading font-black text-base tracking-tight", route === r.id ? "text-jax-blue" : "text-jax-dark")}>{r.label}</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{r.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <Card variant="dark" className="p-8 border-none shadow-2xl overflow-hidden relative">
                   <div className="relative z-10 space-y-6">
                      <div className="flex justify-between items-end border-b border-white/10 pb-6">
                         <div>
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Contract Value</p>
                            <p className="text-3xl font-heading font-black text-jax-teal tracking-tighter">{'\u20B9'}{total.toLocaleString('en-IN')}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Quantity</p>
                            <p className="text-xl font-heading font-black text-white">{qty} Units</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-jax-teal"><FaShieldHalved /></div>
                         <p className="text-[9px] font-black uppercase tracking-widest leading-loose text-white/80">
                           Escrow Safeguard <span className="text-jax-teal mx-1">/</span> 
                           Direct Factory Inspection <span className="text-jax-teal mx-1">/</span> 
                           Verified Logistics
                         </p>
                      </div>
                   </div>
                   <FaShieldHalved className="h-40 w-40 absolute -bottom-10 -right-10 text-white/[0.03]" />
                </Card>
              </div>
            )}
          </div>

          <div className="mt-12 flex gap-4">
            {step > 1 && (
              <Button variant="outline" className="h-16 w-20 rounded-3xl" onClick={() => setStep(step - 1)}>
                <FaArrowRight className="h-5 w-5 rotate-180" />
              </Button>
            )}
            <Button 
               className="h-16 flex-1 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-jax-blue/20"
               loading={loading}
               onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
            >
              {step < 3 ? 'Proceed to Logistics' : 'Establish Trade Contract'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatRow({ icon, label, value, color = 'text-jax-dark' }: { icon: any; label: string; value: string; color?: string }) {
   return (
      <div className="flex flex-col">
         <div className="flex items-center gap-2 mb-1.5 grayscale opacity-50">
            <span className="text-jax-blue overflow-hidden h-3.5 w-3.5 flex items-center justify-center">{icon}</span>
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
         </div>
         <p className={clsx('text-xs font-black uppercase tracking-tight', color)}>{value}</p>
      </div>
   );
}

function ListingSkeleton() {
   return (
      <AppLayout>
         <Container size="xl" className="py-20 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
               <div className="lg:col-span-7"><Skeleton className="aspect-[16/10] rounded-[2.5rem]" /></div>
               <div className="lg:col-span-5 space-y-8">
                  <Skeleton className="h-10 w-1/3" />
                  <Skeleton className="h-20 w-3/4" />
                  <Skeleton className="h-32 rounded-3xl" />
                  <Skeleton className="h-16 rounded-2xl" />
               </div>
            </div>
         </Container>
      </AppLayout>
   );
}

function FaTriangleExclamation(props: any) {
   return <svg {...props} fill="currentColor" stroke="currentColor" strokeWidth="0" viewBox="0 0 512 512"><path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .3-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"></path></svg>;
}

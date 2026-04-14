'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FaFileLines, FaClock, FaCubes, FaComment, 
  FaCircleCheck, FaStar, FaArrowLeft, FaShieldHalved,
  FaBolt, FaAward, FaCalendarCheck
} from 'react-icons/fa6';
import { AppLayout } from '@/components/layout/AppLayout';
import { rfqApi } from '@/lib/api';
import { useRfq, revalidate } from '@/lib/hooks';
import { Button, Card, Badge, Avatar, SectionHeader, EmptyState, Container, TrustScore, RfqDetailSkeleton } from '@/components/ui';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

export default function RfqDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: rfq, isLoading, mutate } = useRfq(id as string);

  const { user } = useAuthStore();
  const isSeller = user?.userType === 'SELLER' || user?.userType === 'BOTH';
  const hasQuoted = rfq?.quotes && rfq.quotes.length > 0;

  const [awarding, setAwarding] = useState(false);
  const handleAward = async (quoteId: string) => {
    setAwarding(true);
    try {
      await rfqApi.awardQuote(id as string, quoteId);
      mutate(); // Revalidate this specific RFQ
      revalidate.rfqs(); // Revalidate all RFQ lists
      toast.success('Quote awarded -- Order created successfully.');
      router.push('/orders');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to award quote');
    } finally {
      setAwarding(false);
    }
  };

  if (isLoading) return <AppLayout><RfqDetailSkeleton /></AppLayout>;
  if (!rfq) return <AppLayout><EmptyState title="Sourcing Request Not Found" /></AppLayout>;

  return (
    <AppLayout>
      <div className="bg-white border-b border-gray-100 mb-8">
        <Container size="xl" className="py-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <button onClick={() => router.push('/rfq')} className="flex items-center gap-2 text-[10px] font-black text-jax-blue uppercase tracking-widest hover:gap-3 transition-all mb-4">
                  <FaArrowLeft className="h-3 w-3" /> Back to Master Console
                </button>
                <div className="flex items-center gap-3 mb-2">
                   <Badge status={rfq.status} className="bg-jax-accent/10 text-jax-accent border-jax-accent/20" />
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">ID: #{rfq.id.slice(0, 12)}</span>
                </div>
                <h1 className="text-3xl font-heading font-black text-jax-dark tracking-tighter uppercase leading-tight mb-2">
                   {rfq.title}
                </h1>
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      <FaClock className="h-3 w-3" />
                      Broadcast {formatDistanceToNow(new Date(rfq.createdAt), { addSuffix: true })}
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-bold text-jax-accent uppercase tracking-wide">
                      <FaBolt className="h-3 w-3" />
                      {rfq.category?.name}
                   </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                 <div className="h-16 w-16 rounded-2xl bg-jax-blue text-white flex flex-col items-center justify-center shadow-lg">
                    <span className="text-xl font-black leading-none">{rfq.quotes?.length || 0}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest mt-1">Quotes</span>
                 </div>
              </div>
           </div>
        </Container>
      </div>

      <Container size="xl" className="pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-xs font-black text-jax-dark uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <FaFileLines className="text-jax-accent" /> Technical Specifications
              </h2>
              <Card className="p-10 border-none shadow-xl shadow-black/[0.02]">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-10 pb-8 border-b border-gray-100">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Global Industry</p>
                    <p className="text-sm font-black text-jax-dark uppercase">{rfq.category?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Sourcing Target</p>
                    <p className="text-sm font-black text-jax-blue uppercase">{rfq.rfqType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Deadline Mode</p>
                    <div className="flex items-center gap-2">
                       <FaCalendarCheck className="h-3.5 w-3.5 text-jax-accent" />
                       <p className="text-sm font-black text-jax-dark">{rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : 'Active Sourcing'}</p>
                    </div>
                  </div>
                </div>

                <div className="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none">
                  {rfq.description}
                </div>
              </Card>
            </section>

            <section>
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xs font-black text-jax-dark uppercase tracking-[0.2em] flex items-center gap-2">
                    <FaBolt className="text-jax-accent" /> Verified Quote Ledger
                 </h2>
                 <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Best Match AI Priority
                 </span>
              </div>
              
              <div className="space-y-6">
                {rfq.quotes?.length > 0 ? rfq.quotes.map((quote: any, i: number) => (
                  <motion.div
                    key={quote.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="relative overflow-hidden group hover:border-jax-accent/30 transition-all p-0 shadow-sm hover:shadow-2xl">
                      {quote.status === 'WON' && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-bl-3xl shadow-lg z-10 flex items-center gap-2">
                          <FaAward /> Awarded & Sealed
                        </div>
                      )}
                      
                      <div className="flex flex-col md:flex-row">
                         <div className="p-8 flex-1">
                            <div className="flex items-start gap-5 mb-6">
                               <Avatar name={quote.seller?.businessProfile?.businessName || quote.seller?.fullName} size="lg" className="rounded-2xl shadow-lg ring-4 ring-gray-50" />
                               <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                     <h4 className="font-black text-jax-dark text-lg uppercase tracking-tight truncate">
                                        {quote.seller?.businessProfile?.businessName || quote.seller?.fullName}
                                     </h4>
                                     <Badge status="ACTIVE" label="Verified Mfg" className="text-[8px] bg-emerald-50 text-emerald-600 border-none px-2" />
                                  </div>
                                  <div className="flex items-center gap-4">
                                     <div className="flex items-center gap-1.5">
                                        <FaStar className="h-3 w-3 text-amber-400" />
                                        <span className="text-[11px] font-black text-jax-dark">{quote.seller?.avgRating || '4.8'}</span>
                                     </div>
                                     <TrustScore score={quote.seller?.trustScore || 92} />
                                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <FaClock className="h-3 w-3" /> {quote.timelineDays}d lead time
                                     </div>
                                  </div>
                               </div>
                            </div>
                            
                            <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 flex items-start gap-3">
                               <FaComment className="h-4 w-4 text-jax-blue mt-1 shrink-0" />
                               <p className="text-sm text-gray-500 italic leading-relaxed">&quot;{quote.proposalText}&quot;</p>
                            </div>
                            
                            <div className="mt-8 flex items-center justify-between pt-6 border-t border-dashed border-gray-100">
                              <button className="flex items-center gap-2.5 text-jax-blue font-black text-[10px] uppercase tracking-[0.2em] hover:text-jax-accent transition-colors">
                                <FaComment className="h-3.5 w-3.5" /> Direct Message Seller
                              </button>
                              
                              {rfq.status === 'OPEN' && (
                                <Button 
                                  size="sm" 
                                  variant="primary" 
                                  className="bg-jax-accent border-none shadow-xl shadow-jax-accent/20 px-8"
                                  loading={awarding} 
                                  onClick={() => handleAward(quote.id)}
                                >
                                  Award Contract
                                </Button>
                              )}
                            </div>
                         </div>
                         
                         <div className="bg-jax-dark text-white md:w-56 p-8 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-1 shrink-0">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Commercial Quote</p>
                            <p className="text-2xl font-black text-jax-accent tracking-tighter">₹{quote.quotedAmount?.toLocaleString('en-IN')}</p>
                            <p className="text-[8px] font-bold text-white/30 uppercase mt-2">DDP/Ex-Works Basis</p>
                         </div>
                      </div>
                    </Card>
                  </motion.div>
                )) : (
                  <Card className="py-24 flex flex-col items-center text-center border-dashed border-2">
                    <div className="h-20 w-20 rounded-full bg-jax-blue/5 flex items-center justify-center text-jax-blue mb-6">
                       <FaBolt className="h-8 w-8 animate-pulse" />
                    </div>
                    <h3 className="text-lg font-black text-jax-dark uppercase mb-2">Quote Broadcast in Progress</h3>
                    <p className="text-xs text-gray-500 max-w-sm">Verified suppliers have been notified of your requirement. Quotes usually arrive within 2-4 business hours.</p>
                  </Card>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <Card variant="dark" className="p-8 relative overflow-hidden group border-none">
              <FaShieldHalved className="h-32 w-32 absolute -bottom-8 -right-8 text-white/[0.03]" />
              <div className="relative z-10">
                 <h3 className="font-black text-lg uppercase tracking-tight mb-4 flex items-center gap-3">
                    <FaShieldHalved className="text-jax-accent" /> Security Protocol
                 </h3>
                 <p className="text-sm text-white/50 mb-8 leading-relaxed font-medium">
                    This transaction is protected by JaxMart Sourcing Escrow. Funds are released only upon verification of bill of lading and technical compliance.
                 </p>
                 <div className="space-y-4">
                   {[
                     { l: 'Milestone Tracking', s: 'Active' },
                     { l: 'QC Inspection', s: 'Available' },
                     { l: 'Dispute Console', s: 'Ready' }
                   ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between pb-3 border-b border-white/5">
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{item.l}</span>
                        <Badge status="ACTIVE" label={item.s} className="bg-white/10 text-white text-[8px] border-none" />
                     </div>
                   ))}
                 </div>
              </div>
            </Card>

            <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
               <h4 className="text-[10px] font-black text-jax-blue uppercase tracking-[0.25em] mb-6">Fulfillment Ops</h4>
               <p className="text-xs text-gray-500 font-medium leading-relaxed mb-8">
                  Once awarded, a dedicated purchase order will be generated and shared with both parties for logistics coordination.
               </p>
               
               {isSeller && !hasQuoted && rfq.status === 'OPEN' && (
                 <Button 
                   fullWidth 
                   onClick={() => router.push(`/rfq/${rfq.id}/quote`)}
                   className="mb-4 h-12 bg-jax-dark text-white rounded-xl shadow-lg"
                 >
                   Submit Commercial Quote
                 </Button>
               )}

               {rfq.status === 'AWARDED' && rfq.quotes?.find((q: any) => q.status === 'WON')?.order && (
                  <Button 
                     fullWidth 
                     onClick={() => router.push(`/orders/${rfq.quotes.find((q: any) => q.status === 'WON').order.id}`)}
                     className="mb-4 h-12 bg-emerald-600 text-white rounded-xl shadow-lg border-none"
                     icon={<FaAward />}
                  >
                     View Active Order
                  </Button>
               )}

               <Button 
                  fullWidth 
                  variant="outline" 
                  className="text-jax-dark font-black text-[9px] border-gray-200"
                  onClick={() => router.push('/orders')}
               >
                  Fulfillment Command
               </Button>
            </div>
          </div>
        </div>
      </Container>
    </AppLayout>
  );
}

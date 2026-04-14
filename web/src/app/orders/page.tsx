'use client';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
   FaBoxesStacked, FaClock, FaCircleCheck,
   FaFileInvoiceDollar, FaTruckFast, FaArrowRight,
   FaShieldHalved, FaHandshake, FaCartShopping
} from 'react-icons/fa6';
import { AppLayout } from '@/components/layout/AppLayout';
import { orderApi } from '@/lib/api';
import { Card, Badge, PageLoader, Button, EmptyState, Container } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { clsx } from 'clsx';

export default function OrdersPage() {
   const router = useRouter();
   const { user } = useAuthStore();

   // Default to seller view if the user is a seller, otherwise buyer
   const [role, setRole] = useState<'buyer' | 'seller'>(
      user?.userType === 'SELLER' ? 'seller' : 'buyer'
   );

   const { data: orderData, isLoading } = useQuery({
      queryKey: ['orders', role],
      queryFn: () => orderApi.getAll({ role }).then(r => r.data),
   });

   // Also fetch counts for both tabs to show in the UI
   const { data: counts } = useQuery({
      queryKey: ['order-counts'],
      queryFn: async () => {
         const [b, s] = await Promise.all([
            orderApi.getAll({ role: 'buyer', limit: 1 }),
            orderApi.getAll({ role: 'seller', limit: 1 })
         ]);
         return { buyer: b.data.total, seller: s.data.total };
      }
   });

   const orders = orderData?.orders || [];
   const totalValue = useMemo(() => orders.reduce((acc: number, o: any) => acc + (o.totalAmount || 0), 0), [orders]);

   if (isLoading) return <AppLayout><PageLoader /></AppLayout>;

   return (
      <AppLayout>
         <div className="bg-white border-b border-gray-100 mb-8">
            <Container size="xl" className="py-8">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                     <div className="flex items-center gap-2 mb-3">
                        <FaShieldHalved className="h-3 w-3 text-jax-accent" />
                        <span className="text-[10px] font-black text-jax-accent uppercase tracking-[0.22em]">Trade Compliance Registry</span>
                     </div>
                     <h1 className="text-3xl font-heading font-black text-jax-dark tracking-tighter leading-none mb-2">Fulfillment Command</h1>
                     <p className="text-sm text-gray-500 font-medium">Manage active supply chain contracts, milestones, and escrow disbursements.</p>
                     
                     <div className="flex bg-gray-100 p-1 rounded-xl w-fit mt-6 border border-gray-200 shadow-inner">
                        <button
                           onClick={() => setRole('buyer')}
                           className={clsx(
                              "flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                              role === 'buyer' ? "bg-white text-jax-dark shadow-sm" : "text-gray-400 hover:text-gray-500"
                           )}
                        >
                           <FaCartShopping className="h-3.5 w-3.5" /> 
                           Purchases
                           {counts?.buyer > 0 && <span className="ml-2 px-1.5 py-0.5 bg-jax-blue text-white rounded-md text-[8px]">{counts.buyer}</span>}
                        </button>
                        <button
                           onClick={() => setRole('seller')}
                           className={clsx(
                              "flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                              role === 'seller' ? "bg-white text-jax-dark shadow-sm" : "text-gray-400 hover:text-gray-500"
                           )}
                        >
                           <FaHandshake className="h-3.5 w-3.5" /> 
                           Sales
                           {counts?.seller > 0 && <span className="ml-2 px-1.5 py-0.5 bg-jax-blue text-white rounded-md text-[8px]">{counts.seller}</span>}
                        </button>
                     </div>
                  </div>

                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-8 px-8 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="text-left">
                           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                              {role === 'buyer' ? 'Committed Capital' : 'Contract Volume'}
                           </p>
                           <p className="text-xl font-black text-jax-dark leading-none">₹{totalValue.toLocaleString()}</p>
                        </div>
                        <div className="h-8 w-px bg-gray-200" />
                        <div className="text-left">
                           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                              {role === 'buyer' ? 'Active Batches' : 'Active Contracts'}
                           </p>
                           <p className="text-xl font-black text-jax-accent leading-none">{orders.length}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </Container>
         </div>

         <Container size="xl" className="pb-20">
            {!orders?.length ? (
               <EmptyState
                  icon={<FaBoxesStacked className="h-10 w-10 text-gray-300" />}
                  title="Empty Trade History"
                  description="Initiate orders by awarding RFQ quotes or selecting catalog inventory."
                  action={<Button className="bg-jax-accent text-white border-none px-10 h-12 shadow-xl shadow-jax-accent/20" onClick={() => router.push('/search')}>Enter Marketplace</Button>}
               />
            ) : (
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div className="lg:col-span-3 space-y-4">
                     <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xs font-black text-jax-dark uppercase tracking-widest">Global Order Ledger</h2>
                        <div className="flex gap-2">
                           <button className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-tight text-gray-400">Export PDF</button>
                           <button className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-tight text-gray-400">Sort: Newest</button>
                        </div>
                     </div>

                     {orders.map((order: any, i: number) => (
                        <motion.div
                           key={order.id}
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: i * 0.05 }}
                        >
                           <Card onClick={() => router.push(`/orders/${order.id}`)} className="group border-transparent hover:border-jax-accent/20 transition-all p-0 overflow-hidden shadow-sm hover:shadow-xl cursor-pointer">
                              <div className="flex flex-col md:flex-row">
                                 <div className="p-6 flex-1 flex items-start gap-6">
                                    <div className="h-14 w-14 bg-jax-blue/5 rounded-2xl flex flex-col items-center justify-center text-jax-blue border border-jax-blue/10 shrink-0">
                                       <FaFileInvoiceDollar className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                       <div className="flex items-center gap-3 mb-2">
                                          <Badge status={order.status} className="text-[9px]" />
                                          <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none">ORDER-ID: #{order.id.slice(0, 8)}</span>
                                       </div>
                                       <h3 className="font-heading font-black text-jax-dark text-base uppercase tracking-tight group-hover:text-jax-accent transition-colors truncate">
                                          Procurement for {order.rfqQuote?.rfq?.title || 'Catalog Goods'}
                                       </h3>
                                       <div className="flex items-center gap-6 mt-4">
                                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wide">
                                             <FaClock className="h-3 w-3" /> Updated {formatDistanceToNow(new Date(order.updatedAt), { addSuffix: true })}
                                          </div>
                                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold uppercase tracking-wide">
                                             <FaShieldHalved className="h-3 w-3" /> {order.escrowStatus}
                                          </div>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="bg-gray-50/50 md:w-56 p-6 border-l border-gray-100 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-1 shrink-0">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Contract Value</p>
                                    <p className="text-xl font-heading font-black text-jax-dark tracking-tighter">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                                    <div className="hidden md:flex items-center gap-1 text-[9px] font-black text-jax-blue uppercase mt-2">
                                       Trace Steps <FaArrowRight className="h-2 w-2" />
                                    </div>
                                 </div>
                              </div>
                           </Card>
                        </motion.div>
                     ))}
                  </div>

                  <div className="space-y-6">
                     <Card className="bg-emerald-600 text-white p-6 shadow-xl shadow-emerald-500/10 border-none">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="h-8 w-8 bg-white/20 rounded-xl flex items-center justify-center"><FaShieldHalved className="h-4 w-4" /></div>
                           <span className="text-[11px] font-black uppercase tracking-widest">Escrow Secure</span>
                        </div>
                        <p className="text-xs text-white/80 font-medium leading-relaxed mb-6">
                           Funds are held securely by JaxMart and only released when you confirm receipt of goods as per technical specs.
                        </p>
                        <button className="w-full py-2.5 bg-white text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-colors">Safety Protocols</button>
                     </Card>

                     <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
                        <h4 className="text-[10px] font-black text-jax-blue uppercase tracking-widest mb-6">Logistics Command</h4>
                        <div className="space-y-6">
                           {[
                              { icon: FaTruckFast, label: 'Tracking Integrations', val: 'Connected' },
                              { icon: FaBoxesStacked, label: 'Inventory Sync', val: 'Active' }
                           ].map((item, i) => (
                              <div key={i} className="flex items-center gap-4">
                                 <div className="h-9 w-9 rounded-xl bg-gray-50 flex items-center justify-center text-jax-blue">
                                    <item.icon className="h-4 w-4" />
                                 </div>
                                 <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                                    <p className="text-xs font-black text-jax-dark uppercase">{item.val}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </Container>
      </AppLayout>
   );
}

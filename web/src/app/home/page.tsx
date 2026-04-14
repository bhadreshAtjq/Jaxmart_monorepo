'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaMagnifyingGlass, FaPlus, FaStar, FaShieldHalved,
  FaBolt, FaBoxesStacked, FaArrowRight, FaIndustry, FaLaptop,
  FaWrench, FaCubes, FaArrowUpRightFromSquare, FaGlobe,
  FaHandshake, FaChartLine, FaTruckFast, FaFire
} from 'react-icons/fa6';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button, Card, Badge, Avatar, SectionHeader, Container, Skeleton, ListingCardSkeleton, TrustScore } from '@/components/ui';
import { useCategories, useFeaturedListings, useRfqInbox } from '@/lib/hooks';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_ICONS: Record<string, any> = {
  'industrial-supplies': FaIndustry,
  electronics: FaLaptop,
  construction: FaCubes,
  textiles: FaBoxesStacked,
  services: FaWrench,
};

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [searchTab, setSearchTab] = useState<'product' | 'rfq'>('product');

  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const { data: featured, isLoading: featuredLoading } = useFeaturedListings();
  const { data: globalRfqs, isLoading: rfqsLoading } = useRfqInbox({ matchOnly: false, limit: 5 });
  const liveRfqs = globalRfqs?.rfqs ?? [];

  return (
    <AppLayout>
      {/* 🚀 EYE-CATCHING HERO SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-jax-blue/5 skew-x-12 translate-x-1/2 pointer-events-none" />
        <Container size="xl" className="relative pt-16 pb-24">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="flex-1 space-y-10">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 bg-jax-accent/10 text-jax-accent rounded-full border border-jax-accent/20"
              >
                <FaFire className="h-4 w-4" />
                <span className="text-sm font-black uppercase tracking-tight">Trending in Global Markets</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl lg:text-8xl font-heading font-black text-jax-dark tracking-tighter leading-[0.8]"
              >
                DIRECT SOURCE <br />
                <span className="text-jax-blue">INDUSTRIAL POWER.</span>
              </motion.h1>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl"
              >
                <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit mb-6 border border-gray-200">
                   <button 
                     onClick={() => setSearchTab('product')}
                     className={clsx("px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", searchTab === 'product' ? "bg-white text-jax-dark shadow-xl" : "text-gray-500 hover:text-jax-blue")}
                   >
                     Find Products
                   </button>
                   <button 
                     onClick={() => setSearchTab('rfq')}
                     className={clsx("px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", searchTab === 'rfq' ? "bg-white text-jax-dark shadow-xl" : "text-gray-500 hover:text-jax-blue")}
                   >
                     Post RFQ
                   </button>
                </div>
                <div className="relative group">
                   <div className="absolute -inset-1 bg-gradient-to-r from-jax-blue/30 to-jax-accent/30 rounded-[2rem] blur-xl opacity-25 group-focus-within:opacity-100 transition duration-1000" />
                   <div className="relative flex bg-white border-2 border-gray-100 group-focus-within:border-jax-blue/20 rounded-[2rem] shadow-2xl overflow-hidden">
                      <div className="flex-1 relative">
                        <FaMagnifyingGlass className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input 
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          placeholder={searchTab === 'product' ? "Search 1M+ industrial categories..." : "Describe your sourcing requirement..."}
                          className="w-full h-20 pl-16 pr-8 text-lg font-heading font-bold outline-none placeholder:text-gray-300"
                        />
                      </div>
                      <button className="bg-jax-dark text-white px-10 font-heading font-black text-xs uppercase tracking-[0.2em] hover:bg-jax-blue transition-all">
                        Execute
                      </button>
                   </div>
                </div>
              </motion.div>
            </div>

            <div className="hidden lg:flex flex-col gap-6 w-80 pt-10">
               {[
                 { icon: FaHandshake, label: 'Verified Manufacturers', val: '12,400+' },
                 { icon: FaShieldHalved, label: 'Trade Compliance', val: 'Escrow Secured' },
                 { icon: FaChartLine, label: 'Active Sourcing Requests', val: '1,892 Live' }
               ].map((item, i) => (
                 <motion.div 
                   key={item.label}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.3 + (i * 0.1) }}
                   className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-black/[0.02] flex items-center gap-5 group hover:border-jax-blue/20 transition-all"
                 >
                    <div className="h-12 w-12 rounded-2xl bg-jax-blue/5 text-jax-blue flex items-center justify-center group-hover:bg-jax-blue group-hover:text-white transition-all shadow-sm">
                       <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                       <p className="text-base font-black text-jax-dark tracking-tight">{item.val}</p>
                    </div>
                 </motion.div>
               ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#F8FAFB] py-24">
        <Container size="xl">
          <SectionHeader 
            title="Sourcing Catalog Management" 
            subtitle="Explore high-velocity industrial SKUs ready for global fulfillment"
            action={<Link href="/search" className="flex items-center gap-2 text-sm font-black text-jax-blue hover:gap-3 transition-all uppercase tracking-widest">Explore Intelligence Network <FaArrowRight /></Link>}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {featuredLoading ? Array(4).fill(0).map((_, i) => <ListingCardSkeleton key={i} />) : (
              featured?.listings?.map((item: any, i: number) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/listings/${item.id}`} className="group block">
                    <Card padding={false} className="overflow-hidden border-none group-hover:shadow-3xl shadow-xl shadow-black/[0.03] transition-all duration-700 bg-white rounded-[2rem]">
                      <div className="h-64 relative bg-gray-50 overflow-hidden">
                        {item.media?.[0] ? (
                          <img src={item.media[0].url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200"><FaIndustry className="h-16 w-16 opacity-10" /></div>
                        )}
                        
                        <div className="absolute top-5 left-5 flex flex-col gap-2">
                           <Badge status={item.listingType} className="shadow-2xl backdrop-blur-xl bg-white/90 text-[10px] font-black tracking-widest border-none px-4 py-1.5" />
                           {item.isFeatured && <Badge status="ACTIVE" label="Verified Source" className="bg-jax-accent text-white shadow-2xl text-[10px] font-black tracking-widest border-none px-4 py-1.5" />}
                        </div>
                        
                        <div className="absolute inset-x-5 bottom-5 translate-y-20 group-hover:translate-y-0 transition-transform duration-700">
                           <Button fullWidth className="bg-jax-dark text-white border-none py-4 shadow-2xl font-black text-[10px] uppercase tracking-[0.2em]">Request Commercial Info</Button>
                        </div>
                      </div>

                      <div className="p-8">
                        <div className="flex items-center justify-between mb-4">
                           <span className="text-[10px] font-black text-jax-blue uppercase tracking-[0.2em]">{item.category?.name || 'Industrial'}</span>
                           <TrustScore score={item.seller?.trustScore || 85} />
                        </div>
                        <h3 className="text-lg font-black text-jax-dark group-hover:text-jax-blue transition-colors line-clamp-2 h-14 tracking-tight leading-tight mb-6">
                          {item.title}
                        </h3>
                        
                        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <Avatar name={item.seller?.fullName} size="sm" className="ring-4 ring-gray-50 shadow-sm" />
                              <div className="min-w-0">
                                 <p className="text-[11px] font-black text-jax-dark truncate uppercase tracking-tight">{item.seller?.fullName}</p>
                                 <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">Certified Hub</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-xl font-black text-jax-blue tracking-tighter leading-none">
                                ₹{item.productDetail?.pricePerUnit?.toLocaleString() || '---'}
                              </p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">EX-WORKS</p>
                           </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </Container>
      </section>

      <section className="py-24">
        <Container size="xl">
          <div className="mb-24">
            <SectionHeader title="Sourcing Taxonomy" subtitle="Procurement channels mapped by industrial classification" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
               {catsLoading ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-52 rounded-[2rem]" />) : categories.map((cat: any) => {
                  const Icon = CATEGORY_ICONS[cat.slug] || FaCubes;
                  return (
                    <Link key={cat.id} href={`/search?category=${cat.id}`}>
                      <Card className="h-52 flex flex-col items-center justify-center gap-6 text-center border-none shadow-xl shadow-black/[0.02] bg-white group hover:shadow-3xl transition-all duration-500 rounded-[2.5rem]">
                         <div className="h-20 w-20 rounded-[2rem] bg-gray-50 flex items-center justify-center group-hover:bg-jax-accent transition-all duration-700 group-hover:-rotate-12 shadow-inner">
                            <Icon className="h-8 w-8 text-jax-blue group-hover:text-white transition-colors" />
                         </div>
                         <div>
                            <span className="text-sm font-black text-jax-dark uppercase tracking-wide block">{cat.name}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Map Catalog</span>
                         </div>
                      </Card>
                    </Link>
                  )
               })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
             <div className="lg:col-span-2">
                <div className="flex items-end justify-between mb-12">
                   <div>
                      <h2 className="text-3xl font-black text-jax-dark tracking-tighter">LIVE PROCUREMENT FEED</h2>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-3">Active Sourcing Protocols from Verified Organizations</p>
                   </div>
                   <Link href="/rfq" className="hidden md:block">
                      <Button variant="outline" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest border-gray-200">Global Monitor</Button>
                   </Link>
                </div>
                <div className="space-y-6">
                   {rfqsLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-[2rem]" />) : liveRfqs.length === 0 ? (
                      <Card className="py-12 flex flex-col items-center border-dashed border-2">
                         <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No active sourcing requests found</p>
                      </Card>
                   ) : liveRfqs.map((rfq: any) => (
                      <Card key={rfq.id} onClick={() => router.push(`/rfq/${rfq.id}`)} className="group border-none shadow-xl shadow-black/[0.02] hover:shadow-3xl transition-all duration-500 p-8 rounded-[2rem] cursor-pointer">
                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="flex-1">
                               <div className="flex items-center gap-4 mb-4">
                                  <Badge status={rfq.status} className="bg-jax-blue text-white font-black tracking-widest border-none px-4 py-1.5" />
                                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">ID: #{rfq.id.slice(0, 8)}</span>
                               </div>
                               <h4 className="text-xl font-black text-jax-dark group-hover:text-jax-blue transition-colors tracking-tight leading-none uppercase">
                                  {rfq.title}
                               </h4>
                               <p className="text-[10px] font-bold text-jax-accent uppercase tracking-widest mt-3">{rfq.category?.name}</p>
                            </div>
                            <div className="flex items-center gap-10 border-t md:border-t-0 pt-6 md:pt-0 border-gray-50">
                               <div className="text-right">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Commercial Scope</p>
                                  <p className="text-base font-black text-jax-dark tracking-tighter">₹{rfq.budgetMax?.toLocaleString() || 'Open'}</p>
                               </div>
                               <Button className="h-12 px-8 bg-jax-accent text-white border-none shadow-xl shadow-jax-accent/20 font-black text-[10px] uppercase tracking-widest">Execute Quote</Button>
                            </div>
                         </div>
                      </Card>
                   ))}
                </div>
             </div>

             <div className="space-y-10 lg:sticky lg:top-24">
            <Card variant="dark" className="p-10 relative overflow-hidden group rounded-[2.5rem] shadow-3xl shadow-jax-dark/20 border-none">
                   <FaGlobe className="absolute -top-12 -right-12 h-48 w-48 text-white/[0.04] group-hover:scale-110 transition-transform duration-[2000ms] animate-pulse" />
                   <div className="relative z-10">
                      <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-8">
                         <FaBolt className="h-5 w-5 text-jax-accent" />
                      </div>
                      <h3 className="text-3xl font-black mb-4 tracking-tighter leading-none">RAPID SOURCING<br /><span className="text-jax-accent">PROTOCOL</span></h3>
                      <p className="text-sm text-white/50 mb-10 font-medium leading-relaxed">
                         Specific industrial equipment missing from the catalog? Describe your exact technical specs and trigger verified factory responses.
                      </p>
                      <Button fullWidth className="bg-jax-accent text-white border-none py-6 h-auto text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-jax-blue">
                         Broadcast Request
                      </Button>
                   </div>
                </Card>

                <div className="p-10 bg-jax-blue/5 rounded-[2.5rem] border border-jax-blue/10 shadow-inner">
                   <p className="text-[10px] font-black text-jax-blue uppercase tracking-[0.25em] mb-8">Supply Chain Partners</p>
                   <div className="space-y-6">
                      {['Oceanic Global Sourcing', 'Terminal Hub Logistics', 'Regional Parts Network'].map(p => (
                         <div key={p} className="flex items-center justify-between pb-6 border-b border-jax-blue/10 last:border-0 last:pb-0">
                            <span className="text-sm font-black text-jax-dark tracking-tight uppercase">{p}</span>
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
                               <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </Container>
      </section>
    </AppLayout>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaFileLines, FaPlus, FaClock, FaCircleCheck,
  FaChevronRight, FaMagnifyingGlass,
  FaBolt, FaChartLine, FaBoxOpen, FaShieldHalved
} from 'react-icons/fa6';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button, Card, Badge, PageLoader, Container } from '@/components/ui';
import { useMyRfqs } from '@/lib/hooks';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export default function RfqListPage() {
  const [tab, setTab] = useState<'OPEN' | 'AWARDED' | 'CLOSED'>('OPEN');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useMyRfqs(tab);

  const rfqs = (data?.rfqs ?? []).filter((r: any) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: (data?.rfqs ?? []).length,
    quotes: (data?.rfqs ?? []).reduce((acc: number, r: any) => acc + (r._count?.quotes || 0), 0),
  };

  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-gray-50/80 to-white border-b border-gray-200/60 relative overflow-hidden mb-8 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />
        <Container size="xl" className="py-10 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                 <span className="relative flex h-2.5 w-2.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jax-accent opacity-40"></span>
                   <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-jax-accent"></span>
                 </span>
                 <span className="text-[10px] font-black text-jax-accent uppercase tracking-[0.2em] bg-jax-accent/10 px-2 py-0.5 rounded-md">My Requests</span>
              </div>
              <h1 className="text-4xl font-heading font-black text-gray-900 tracking-tight leading-none mb-3">Sourcing Dashboard</h1>
              <p className="text-sm text-gray-500 font-medium">Manage your requests, compare quotes, and source products efficiently.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
               <div className="flex items-center gap-6 px-6 py-3.5 bg-white rounded-2xl border border-gray-200/60 shadow-sm w-full sm:w-auto justify-center sm:justify-start">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Your Requests</p>
                    <p className="text-2xl font-black text-gray-900 leading-none">{stats.total}</p>
                  </div>
                  <div className="h-10 w-px bg-gray-100" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Quotes Received</p>
                    <p className="text-2xl font-black text-jax-blue leading-none">{stats.quotes}</p>
                  </div>
               </div>
               <Link href="/rfq/create" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-jax-accent to-emerald-500 text-white border-none shadow-lg shadow-jax-accent/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300" icon={<FaPlus />}>
                     New Request
                  </Button>
               </Link>
            </div>
          </div>
        </Container>
      </div>

      <Container size="xl" className="pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              <div className="flex bg-gray-100/50 p-1 rounded-xl w-full md:w-fit border border-gray-200/50">
                {(['OPEN', 'AWARDED', 'CLOSED'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={clsx(
                      'flex-1 md:flex-none px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300',
                      tab === t ? 'bg-white text-jax-blue shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-900'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              
              <div className="relative w-full md:w-80 group">
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-jax-accent to-jax-blue rounded-xl blur opacity-0 group-focus-within:opacity-15 transition duration-500"></div>
                 <div className="relative">
                   <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5 group-focus-within:text-jax-accent transition-colors" />
                   <input 
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     placeholder="Search requests..."
                     className="w-full h-11 bg-white border border-gray-200/80 rounded-xl pl-11 pr-4 text-xs font-heading font-medium text-gray-800 focus:border-jax-accent focus:ring-4 focus:ring-jax-accent/10 outline-none shadow-sm transition-all"
                   />
                 </div>
              </div>
            </div>

            {isLoading ? <PageLoader /> : rfqs.length === 0 ? (
              <div className="py-24 flex flex-col items-center text-center bg-gradient-to-b from-gray-50/50 to-white border border-gray-100 rounded-3xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 border border-gray-50">
                   <FaBoxOpen className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">No Requests Found</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">You haven't posted any sourcing requests in this category yet. Start getting quotes from verified sellers today.</p>
                <Link href="/rfq/create">
                  <Button className="h-12 px-8 bg-white text-jax-dark border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md transition-all font-bold text-xs uppercase tracking-wider">
                     Post a Request
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {rfqs.map((rfq: any, i: number) => (
                  <motion.div
                    key={rfq.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={`/rfq/${rfq.id}`}>
                      <Card className="hover:border-jax-accent/40 transition-all duration-300 group p-0 overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-white rounded-2xl">
                        <div className="flex flex-col md:flex-row">
                           <div className="p-6 md:p-8 flex-1">
                              <div className="flex items-center gap-3 mb-4">
                                 <Badge status={rfq.rfqType} className="bg-gray-100 text-gray-600 border-none font-bold tracking-wider px-2.5 py-1 text-[9px] uppercase shadow-inner" />
                                 <div className="h-1 w-1 rounded-full bg-gray-300" />
                                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">REQ-{rfq.id.slice(0, 8)}</span>
                              </div>
                              <h3 className="text-xl font-black text-gray-900 group-hover:text-jax-accent transition-colors mb-3 tracking-tight leading-tight">
                                 {rfq.title}
                              </h3>
                              <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                                   <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50 px-2.5 py-1.5 rounded-md border border-gray-100">
                                      <FaClock className="h-3 w-3 text-gray-400" />
                                      Posted {formatDistanceToNow(new Date(rfq.createdAt), { addSuffix: true })}
                                   </div>
                                   <div className="flex items-center gap-2 text-[10px] font-bold text-jax-accent uppercase tracking-wider bg-jax-accent/5 px-2.5 py-1.5 rounded-md border border-jax-accent/10">
                                      <FaBolt className="h-3 w-3" />
                                      {rfq.category?.name || 'General Sourcing'}
                                   </div>
                                </div>

                                {rfq.leadsSentTo !== undefined && (
                                  <div className="pt-4 border-t border-gray-100/80">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Lead Sent To Suppliers:</p>
                                    {rfq.leadsSentTo.length > 0 ? (
                                      <div className="flex flex-wrap gap-2">
                                        {rfq.leadsSentTo.map((lead: any, idx: number) => (
                                          <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50/80 border border-gray-200/60 rounded-lg">
                                            <div className="h-1.5 w-1.5 rounded-full bg-jax-accent" />
                                            <span className="text-xs font-bold text-jax-dark">{lead.business}</span>
                                            <span className="text-[10px] font-medium text-gray-500 hidden sm:inline-block">({lead.name})</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-[10px] font-bold text-gray-400 bg-gray-50/50 px-3 py-2 rounded-lg inline-block">
                                        No suppliers found matching this request.
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                           </div>
                           
                           <div className="bg-gray-50/80 md:w-64 border-t md:border-t-0 md:border-l border-gray-100 p-6 md:p-8 flex flex-row md:flex-col justify-between md:justify-center gap-4 relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/[0.01] pointer-events-none" />
                              <div className="text-left md:text-right relative z-10">
                                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Quotes Received</p>
                                 <div className="flex items-center md:justify-end gap-2">
                                    <span className="text-3xl font-black text-gray-900 leading-none">{rfq._count?.quotes || 0}</span>
                                    {rfq._count?.quotes > 0 && <span className="text-[9px] font-black text-white bg-emerald-500 px-1.5 py-0.5 rounded shadow-sm">NEW</span>}
                                 </div>
                              </div>
                              <div className="md:mt-auto relative z-10">
                                 <Button variant="ghost" size="sm" className="w-full justify-between text-jax-blue hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all h-10 px-4 rounded-xl text-xs font-bold">
                                    View Details <FaChevronRight className="h-3 w-3 opacity-50" />
                                 </Button>
                              </div>
                           </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Tools */}
          <div className="lg:w-[320px] shrink-0 space-y-6">
             <div className="p-7 relative overflow-hidden group bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-3xl shadow-xl shadow-slate-900/10 border border-slate-700/50">
                <FaChartLine className="absolute -top-6 -right-6 h-32 w-32 text-white/[0.02] rotate-12 group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10">
                  <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Pro Tips
                  </h4>
                  <p className="text-[13px] text-slate-300 font-medium mb-6 leading-relaxed">
                     Detailed requests with specific quantities and target budgets receive up to <strong className="text-white">40% more quotes</strong>.
                  </p>
                  <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Live Network</p>
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-white">8,204 Suppliers</span>
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">Online</span>
                     </div>
                  </div>
                </div>
             </div>

             <div className="p-7 border border-gray-200/60 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <FaShieldHalved className="h-16 w-16 text-jax-blue" />
                </div>
                <h4 className="text-[10px] font-black text-jax-blue uppercase tracking-widest mb-5 flex items-center gap-2">
                   <FaCircleCheck className="text-emerald-500 h-3.5 w-3.5" /> Trust & Safety
                </h4>
                <div className="space-y-5 relative z-10">
                   <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-jax-blue/5 flex items-center justify-center shrink-0 border border-jax-blue/10">
                         <FaShieldHalved className="h-4 w-4 text-jax-blue" />
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed pt-0.5">
                        Quotes only come from verified suppliers with audited business profiles.
                      </p>
                   </div>
                   <button className="w-full py-3.5 bg-gray-50 rounded-xl text-[10px] font-black text-gray-700 uppercase tracking-[0.15em] hover:bg-gray-100 hover:text-jax-dark transition-colors border border-gray-200/60 shadow-sm">
                      How Escrow Works
                   </button>
                </div>
             </div>
          </div>
        </div>
      </Container>
    </AppLayout>
  );
}

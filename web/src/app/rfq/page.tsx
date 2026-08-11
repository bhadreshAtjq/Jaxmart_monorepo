'use client';
import { useState } from 'react';
import { 
  FaPlus, FaClock, FaCircleCheck, 
  FaChevronRight, FaMagnifyingGlass,
  FaBolt, FaShieldHalved, FaCubes
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
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100/80 mb-8">
        <Container size="xl" className="py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                 <span className="text-[10px] font-extrabold text-[#0D9488] uppercase tracking-[0.2em]">MY REQUESTS</span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-1">Sourcing Dashboard</h1>
              <p className="text-sm text-gray-500 font-medium">Manage your requests, compare quotes, and source products efficiently.</p>
            </div>
            
            <div className="flex items-center gap-4">
               {/* Stats Widget Box */}
               <div className="flex items-center gap-8 px-6 py-3 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
                  <div>
                    <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider mb-0.5">YOUR REQUESTS</p>
                    <p className="text-2xl font-black text-gray-900 leading-none">{stats.total}</p>
                  </div>
                  <div className="h-7 w-px bg-gray-200" />
                  <div>
                    <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider mb-0.5">QUOTES RECEIVED</p>
                    <p className="text-2xl font-black text-[#2563EB] leading-none">{stats.quotes}</p>
                  </div>
               </div>

               {/* New Request Button */}
               <Link href="/rfq/create">
                  <button className="h-12 px-6 bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer active:scale-95">
                     <FaPlus className="h-3.5 w-3.5" />
                     <span>New Request</span>
                  </button>
               </Link>
            </div>
          </div>
        </Container>
      </div>

      <Container size="xl" className="pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content Area */}
          <div className="flex-1">
            
            {/* Filter Tabs & Search Row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              {/* Status Tabs */}
              <div className="flex bg-gray-100/80 border border-gray-200/60 p-1 rounded-xl w-full md:w-fit">
                {(['OPEN', 'AWARDED', 'CLOSED'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={clsx(
                      'flex-1 md:flex-none px-6 py-2 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer',
                      tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              
              {/* Search Bar */}
              <div className="relative w-full md:w-72 group">
                 <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5 group-focus-within:text-[#10B981] transition-colors" />
                 <input 
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   placeholder="Search requests.."
                   className="w-full h-10 bg-white border border-gray-200 rounded-xl pl-11 pr-4 text-xs font-semibold focus:border-[#10B981]/50 outline-none shadow-sm placeholder:text-gray-400"
                 />
              </div>
            </div>

            {/* Results / Empty State */}
            {isLoading ? (
              <div className="bg-white rounded-3xl p-16 border border-gray-200/80">
                <PageLoader />
              </div>
            ) : rfqs.length === 0 ? (
              /* Empty State matching image exactly */
              <div className="bg-white rounded-3xl p-16 border border-gray-200/80 shadow-sm text-center">
                <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
                   <FaCubes className="h-7 w-7 text-gray-300" />
                </div>
                <h3 className="text-base font-extrabold text-gray-900 mb-2 uppercase tracking-tight">NO REQUESTS FOUND</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
                  You haven't posted any sourcing requests in this category yet. Start getting quotes from verified sellers today.
                </p>
                <Link href="/rfq/create">
                  <button className="bg-[#202958] hover:bg-[#161C3E] text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider">
                     POST A REQUEST
                  </button>
                </Link>
              </div>
            ) : (
              /* RFQ List Grid */
              <div className="grid grid-cols-1 gap-4">
                {rfqs.map((rfq: any, i: number) => (
                  <motion.div
                    key={rfq.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={`/rfq/${rfq.id}`}>
                      <div className="bg-white rounded-2xl border border-gray-200/80 hover:border-blue-300 transition-all p-0 overflow-hidden shadow-sm hover:shadow-md group">
                        <div className="flex flex-col md:flex-row">
                           <div className="p-6 flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                 <Badge status={rfq.rfqType} className="bg-blue-50 text-blue-600 border-blue-100 text-[9px] font-bold" />
                                 <div className="h-1 w-1 rounded-full bg-gray-300" />
                                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">#{rfq.id.slice(0, 8)}</span>
                              </div>
                              <h3 className="text-base font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 uppercase tracking-tight leading-snug">
                                 {rfq.title}
                              </h3>
                              <div className="flex items-center gap-6">
                                 <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
                                    <FaClock className="h-3 w-3 text-gray-400" />
                                    Posted {formatDistanceToNow(new Date(rfq.createdAt), { addSuffix: true })}
                                 </div>
                                 <div className="flex items-center gap-2 text-[11px] font-bold text-[#10B981]">
                                    <FaBolt className="h-3 w-3" />
                                    {rfq.category?.name}
                                 </div>
                              </div>
                           </div>
                           
                           <div className="bg-gray-50/50 md:w-64 border-t md:border-t-0 md:border-l border-gray-100 p-6 flex flex-row md:flex-col justify-between md:justify-center gap-4">
                              <div className="text-left md:text-right">
                                 <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Quotes Received</p>
                                 <div className="flex items-center md:justify-end gap-2">
                                    <span className="text-2xl font-black text-gray-900 leading-none">{rfq._count?.quotes || 0}</span>
                                    {rfq._count?.quotes > 0 && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">NEW</span>}
                                 </div>
                              </div>
                              <div className="md:mt-auto">
                                 <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700 flex items-center justify-end gap-1">
                                    View Details <FaChevronRight className="h-2.5 w-2.5" />
                                 </span>
                              </div>
                           </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar Tools */}
          <div className="lg:w-80 shrink-0 space-y-6">
             
             {/* Card 1: PRO TIPS Card (Dark Navy Blue) */}
             <div className="bg-[#0F172A] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                   <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                   <span className="text-[10px] font-extrabold text-[#10B981] uppercase tracking-[0.2em]">PRO TIPS</span>
                </div>
                <p className="text-xs text-slate-300 font-medium mb-6 leading-relaxed">
                   Detailed requests with specific quantities and target budgets receive up to <strong className="text-white font-bold">40% more quotes</strong>.
                </p>
                
                <div className="p-4 bg-[#1E293B] rounded-2xl border border-slate-700/60">
                   <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">LIVE NETWORK</p>
                   <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-white">8,204 Suppliers</span>
                      <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/15 px-2.5 py-0.5 rounded-full">Online</span>
                   </div>
                </div>
             </div>

             {/* Card 2: TRUST & SAFETY Card (White) */}
             <div className="p-6 border border-gray-200/80 rounded-3xl bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                   <FaCircleCheck className="h-4 w-4 text-[#10B981]" />
                   <span className="text-[11px] font-black text-gray-900 uppercase tracking-wider">TRUST & SAFETY</span>
                </div>
                
                <div className="flex items-start gap-3 mb-6">
                   <div className="p-2.5 bg-gray-100 rounded-xl shrink-0 text-gray-700">
                      <FaShieldHalved className="h-4 w-4" />
                   </div>
                   <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      Quotes only come from verified suppliers with audited business profiles.
                   </p>
                </div>

                <button className="w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-[10px] font-black text-gray-900 uppercase tracking-[0.15em] transition-colors border border-gray-200/60 cursor-pointer">
                   HOW ESCROW WORKS
                </button>
             </div>

          </div>

        </div>
      </Container>
    </AppLayout>
  );
}

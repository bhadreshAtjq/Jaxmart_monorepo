'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  FaFileLines, FaPlus, FaClock, FaCircleCheck, 
  FaChevronRight, FaMagnifyingGlass, FaFilter,
  FaBolt, FaChartLine, FaBoxOpen
} from 'react-icons/fa6';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button, Card, Badge, EmptyState, PageLoader, Container } from '@/components/ui';
import { rfqApi } from '@/lib/api';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export default function RfqListPage() {
  const [tab, setTab] = useState<'OPEN' | 'AWARDED' | 'CLOSED'>('OPEN');
  const [search, setSearch] = useState('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['rfqs', 'mine', tab],
    queryFn: () => rfqApi.getMine({ status: tab }).then(r => r.data),
  });

  const rfqs = data?.rfqs ?? [];
  const stats = {
    total: rfqs.length,
    quotes: rfqs.reduce((acc: number, r: any) => acc + (r._count?.quotes || 0), 0),
  };

  return (
    <AppLayout>
      <div className="bg-white border-b border-gray-100 mb-8">
        <Container size="xl" className="py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                 <span className="h-2 w-2 rounded-full bg-jax-accent animate-pulse" />
                 <span className="text-[10px] font-black text-jax-accent uppercase tracking-[0.2em]">Procurement Control Room</span>
              </div>
              <h1 className="text-3xl font-heading font-black text-jax-dark tracking-tighter leading-none mb-2">RFQ Master Console</h1>
              <p className="text-sm text-gray-500 font-medium">Coordinate your global sourcing requirements and quote pipelines.</p>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="hidden lg:flex items-center gap-8 px-8 py-3 bg-gray-50 rounded-2xl border border-gray-100 mr-4">
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active RFQs</p>
                    <p className="text-xl font-black text-jax-dark leading-none">{stats.total}</p>
                  </div>
                  <div className="h-8 w-px bg-gray-200" />
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Live Quotes</p>
                    <p className="text-xl font-black text-jax-blue leading-none">{stats.quotes}</p>
                  </div>
               </div>
               <Link href="/rfq/create">
                 <Button className="h-14 px-8 bg-jax-accent text-white border-none shadow-xl shadow-jax-accent/20" icon={<FaPlus />}>
                    New Requirement
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
              <div className="flex bg-white border border-gray-200/60 p-1 rounded-xl w-full md:w-fit shadow-sm">
                {(['OPEN', 'AWARDED', 'CLOSED'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={clsx(
                      'flex-1 md:flex-none px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-300',
                      tab === t ? 'bg-jax-dark text-white shadow-lg' : 'text-gray-400 hover:text-jax-dark'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              
              <div className="relative w-full md:w-72 group">
                 <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5 group-focus-within:text-jax-accent transition-colors" />
                 <input 
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   placeholder="Search RFQ ID, Title..."
                   className="w-full h-11 bg-white border border-gray-200 rounded-xl pl-11 pr-4 text-xs font-heading font-bold focus:border-jax-accent/30 outline-none shadow-sm"
                 />
              </div>
            </div>

            {isLoading ? <PageLoader /> : rfqs.length === 0 ? (
              <Card className="py-20 flex flex-col items-center text-center bg-gray-50/50 border-dashed border-2">
                <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-sm mb-6">
                   <FaBoxOpen className="h-8 w-8 text-gray-200" />
                </div>
                <h3 className="text-lg font-black text-jax-dark mb-2 uppercase tracking-tight">No Active Requirements</h3>
                <p className="text-xs text-gray-500 max-w-xs mb-8">Launch a new sourcing request to start receiving competitive quotes from verified manufacturers.</p>
                <Link href="/rfq/create">
                  <Button variant="outline" className="border-jax-accent text-jax-accent hover:bg-jax-accent hover:text-white">
                     Start Sourcing Session
                  </Button>
                </Link>
              </Card>
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
                      <Card className="hover:border-jax-accent/30 transition-all group p-0 overflow-hidden shadow-sm hover:shadow-xl">
                        <div className="flex flex-col md:flex-row">
                           <div className="p-6 flex-1">
                              <div className="flex items-center gap-3 mb-4">
                                 <Badge status={rfq.rfqType} className="bg-jax-blue/10 text-jax-blue border-jax-blue/10 text-[9px]" />
                                 <div className="h-1 w-1 rounded-full bg-gray-300" />
                                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">#{rfq.id.slice(0, 8)}</span>
                              </div>
                              <h3 className="text-lg font-black text-jax-dark group-hover:text-jax-accent transition-colors mb-2 uppercase tracking-tight leading-tight">
                                 {rfq.title}
                              </h3>
                              <div className="flex items-center gap-6">
                                 <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                                    <FaClock className="h-3 w-3" />
                                    Posted {formatDistanceToNow(new Date(rfq.createdAt), { addSuffix: true })}
                                 </div>
                                 <div className="flex items-center gap-2 text-[10px] font-bold text-jax-accent uppercase tracking-wide">
                                    <FaBolt className="h-3 w-3" />
                                    {rfq.category?.name}
                                 </div>
                              </div>
                           </div>
                           
                           <div className="bg-gray-50/50 md:w-64 border-l border-gray-100 p-6 flex flex-row md:flex-col justify-between md:justify-center gap-4">
                              <div className="text-left md:text-right">
                                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Quotes Received</p>
                                 <div className="flex items-center md:justify-end gap-2">
                                    <span className="text-2xl font-black text-jax-dark leading-none">{rfq._count?.quotes || 0}</span>
                                    {rfq._count?.quotes > 0 && <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">NEW</span>}
                                 </div>
                              </div>
                              <div className="md:mt-auto">
                                 <Button variant="ghost" size="sm" className="w-full justify-between text-jax-blue hover:bg-jax-blue/5">
                                    Manage Command <FaChevronRight className="h-2.5 w-2.5" />
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
          <div className="lg:w-80 shrink-0 space-y-6">
             <Card variant="dark" className="p-6 relative overflow-hidden group">
                <FaChartLine className="absolute -top-6 -right-6 h-24 w-24 text-white/[0.03] rotate-12" />
                <h4 className="text-[10px] font-black text-jax-accent uppercase tracking-[0.2em] mb-4">Trade Tips</h4>
                <p className="text-xs text-white/70 font-medium mb-6 leading-relaxed">
                   Detailed RFQs with specific quantity and budget constraints receive up to <strong>40% more</strong> competitive quotes.
                </p>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                   <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1">Active Hub Capacity</p>
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">8,204 Suppliers</span>
                      <span className="text-[10px] font-black text-emerald-400">Online</span>
                   </div>
                </div>
             </Card>

             <div className="p-6 border border-gray-100 rounded-3xl bg-white shadow-sm">
                <h4 className="text-[10px] font-black text-jax-blue uppercase tracking-widest mb-4 flex items-center gap-2">
                   <FaCircleCheck /> Quality Assurance
                </h4>
                <div className="space-y-4">
                   <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                         <FaBolt className="h-3.5 w-3.5 text-jax-accent" />
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Verified quotes arrive with full factory profiles and KYC status.</p>
                   </div>
                   <button className="w-full py-3 bg-gray-50 rounded-xl text-[9px] font-black text-jax-dark uppercase tracking-[0.2em] hover:bg-gray-100 transition-colors">
                      Learn About Escrow
                   </button>
                </div>
             </div>
          </div>
        </div>
      </Container>
    </AppLayout>
  );
}

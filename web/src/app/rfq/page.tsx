'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaFileLines,
  FaPlus,
  FaClock,
  FaCircleCheck,
  FaChevronRight,
  FaMagnifyingGlass,
  FaBolt,
  FaChartLine,
  FaBoxOpen,
  FaShieldHalved,
  FaArrowRight,
  FaLocationDot,
  FaTag,
  FaBuilding,
} from 'react-icons/fa6';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button, Card, Badge, PageLoader, Container } from '@/components/ui';
import { useMyRfqs } from '@/lib/hooks';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Sparkles, CheckCircle2, TrendingUp, Layers } from 'lucide-react';

const QUICK_TEMPLATES = [
  { title: "Men's Cotton T-Shirts", category: 'Textiles & Apparel', qty: '500 Pcs', icon: '👕' },
  { title: 'TMT Steel Rebar Fe 500D', category: 'Building & Construction', qty: '20 Metric Tons', icon: '🏗️' },
  { title: 'Corrugated Packaging Cartons 5-Ply', category: 'Packaging & Printing', qty: '2,000 Boxes', icon: '📦' },
  { title: 'Industrial Hex Bolts SS 304', category: 'Industrial Machinery', qty: '10,000 Pcs', icon: '🔩' },
];

export default function RfqListPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'OPEN' | 'AWARDED' | 'CLOSED'>('OPEN');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useMyRfqs(tab);

  const rfqs = (data?.rfqs ?? []).filter(
    (r: any) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: (data?.rfqs ?? []).length,
    quotes: (data?.rfqs ?? []).reduce((acc: number, r: any) => acc + (r._count?.quotes || 0), 0),
  };

  return (
    <AppLayout>
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-gray-50/80 to-white border-b border-gray-200/60 relative overflow-hidden mb-8 shadow-xs">
        <Container size="xl" className="py-10 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jungle-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-jungle-green-600"></span>
                </span>
                <span className="text-[10px] font-black text-jungle-green-700 uppercase tracking-widest bg-jungle-green-50 px-2.5 py-0.5 rounded-full border border-jungle-green-200">
                  Buyer Sourcing Center
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-black text-gray-900 tracking-tight leading-none mb-2">
                My Sourcing Requests & RFQs
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Track your posted requirements, compare competing factory quotes, and manage Assured Deals.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-6 px-6 py-3.5 bg-white rounded-2xl border border-gray-200 shadow-sm w-full sm:w-auto justify-center sm:justify-start">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Your RFQs
                  </p>
                  <p className="text-2xl font-black text-gray-900 leading-none">{stats.total}</p>
                </div>
                <div className="h-10 w-px bg-gray-100" />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Quotes Received
                  </p>
                  <p className="text-2xl font-black text-jungle-green-700 leading-none">{stats.quotes}</p>
                </div>
              </div>

              <Link href="/rfq/create" className="w-full sm:w-auto">
                <Button
                  className="w-full sm:w-auto h-14 px-8 bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-2xl shadow-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  <FaPlus className="h-3.5 w-3.5" /> Post New RFQ
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>

      <Container size="xl" className="pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-fit">
                {(['OPEN', 'AWARDED', 'CLOSED'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={clsx(
                      'flex-1 md:flex-none px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all',
                      tab === t
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    )}
                  >
                    {t === 'OPEN' ? 'Active RFQs' : t === 'AWARDED' ? 'Awarded Deals' : 'Closed'}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-80">
                <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search your requests..."
                  className="w-full h-11 bg-white border border-gray-200 rounded-xl pl-11 pr-4 text-xs font-medium text-gray-800 outline-none focus:border-jungle-green-600 shadow-xs"
                />
              </div>
            </div>

            {isLoading ? (
              <PageLoader />
            ) : rfqs.length === 0 ? (
              /* Rich Onboarding Empty State */
              <div className="bg-white border border-gray-200/80 rounded-3xl p-8 md:p-12 shadow-sm text-center space-y-8">
                <div className="max-w-md mx-auto space-y-3">
                  <div className="h-16 w-16 bg-jungle-green-50 text-jungle-green-600 rounded-3xl flex items-center justify-center mx-auto border border-jungle-green-100">
                    <FaFileLines className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-heading font-black text-gray-900 tracking-tight">
                    No Sourcing Requests Posted Yet
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    When you post a buy requirement, verified factories will submit commercial quotations with lead times and volume pricing directly to your dashboard.
                  </p>
                  <div className="pt-2">
                    <Link href="/rfq/create">
                      <Button className="bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-2xl px-8 py-3.5 text-xs font-bold uppercase tracking-wider shadow-md">
                        Post Your First RFQ Free →
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* 3-Step Sourcing Explainer */}
                <div className="pt-6 border-t border-gray-100">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-6">
                    How JaxMart Factory Sourcing Works
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100">
                      <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs mb-3">
                        1
                      </div>
                      <h5 className="font-bold text-xs text-gray-900 mb-1">Post Specifications</h5>
                      <p className="text-[11px] text-gray-500">
                        Type your product details; our AI matches your requirement with audited manufacturers.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100">
                      <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs mb-3">
                        2
                      </div>
                      <h5 className="font-bold text-xs text-gray-900 mb-1">Compare Live Quotes</h5>
                      <p className="text-[11px] text-gray-500">
                        Receive competing factory bids with milestone schedules and verified trust ratings.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100">
                      <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs mb-3">
                        3
                      </div>
                      <h5 className="font-bold text-xs text-gray-900 mb-1">100% Escrow Protection</h5>
                      <p className="text-[11px] text-gray-500">
                        Funds are held in secure escrow and released only after you verify goods on delivery.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick 1-Click Templates */}
                <div className="pt-6 border-t border-gray-100 text-left">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-4">
                    Or Try Sourcing With a Sample Template:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {QUICK_TEMPLATES.map((tmpl, idx) => (
                      <Link
                        key={idx}
                        href={`/rfq/create?title=${encodeURIComponent(tmpl.title)}`}
                        className="p-3.5 rounded-2xl border border-gray-200 hover:border-jungle-green-600 hover:bg-jungle-green-50/50 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{tmpl.icon}</span>
                          <div>
                            <p className="font-bold text-xs text-gray-900 group-hover:text-jungle-green-800">
                              {tmpl.title}
                            </p>
                            <p className="text-[10px] text-gray-400">{tmpl.category} • {tmpl.qty}</p>
                          </div>
                        </div>
                        <FaChevronRight className="h-3 w-3 text-gray-300 group-hover:text-jungle-green-700 group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Active RFQ Cards List */
              <div className="space-y-4">
                {rfqs.map((rfq: any) => (
                  <div
                    key={rfq.id}
                    onClick={() => router.push(`/rfq/${rfq.id}`)}
                    className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-jungle-green-300 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <Badge status={rfq.status} />
                        <span className="text-xs font-bold text-jungle-green-700 bg-jungle-green-50 px-2 py-0.5 rounded-md">
                          {rfq.category?.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          Posted {formatDistanceToNow(new Date(rfq.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      <h3 className="font-heading font-black text-gray-900 text-lg hover:text-jungle-green-700 transition-colors truncate">
                        {rfq.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span>Quantity: <strong>{rfq.quantity ? `${rfq.quantity} ${rfq.unitOfMeasure || 'units'}` : 'Open'}</strong></span>
                        <span>•</span>
                        <span>Location: <strong>{rfq.locationPreference || 'Pan India'}</strong></span>
                        <span>•</span>
                        <span>Budget: <strong>{rfq.budgetMax ? `₹${rfq.budgetMax.toLocaleString('en-IN')}` : 'Open to Bids'}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                          Quotes
                        </span>
                        <span className="text-2xl font-heading font-black text-jungle-green-700">
                          {rfq._count?.quotes || 0}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        className="bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-xl text-xs font-bold px-4 py-2"
                      >
                        Review Quotes →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar Info Card */}
          <div className="lg:col-span-4 lg:w-80 space-y-6 shrink-0">
            {/* Live Network Stats */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-jungle-green-300">
                  Verified Supplier Network
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <h4 className="text-2xl font-heading font-black text-white">8,200+ Verified Factories</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Audited Indian manufacturers across Gujarat, Maharashtra, Tamil Nadu, and North India standing by to quote on your RFQ.
              </p>
            </div>

            {/* Escrow Guarantee */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-jungle-green-600" />
                JaxMart Assured Escrow
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                When you accept a quote, funds remain in secure milestone escrow and are only released after verified proof of dispatch & quality inspection.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </AppLayout>
  );
}

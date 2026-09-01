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
  FaCubes,
  FaUserCheck,
  FaHandshake,
} from 'react-icons/fa6';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button, Card, Badge, PageLoader, Container, Skeleton } from '@/components/ui';
import { useMyRfqs, usePublicRfqs, useCategories } from '@/lib/hooks';
import { useAuthStore } from '@/lib/store';
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
  const { isLoggedIn, user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'board' | 'my'>('board');
  const [myStatus, setMyStatus] = useState<'OPEN' | 'AWARDED' | 'CLOSED'>('OPEN');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Public live board data
  const { data: publicData, isLoading: publicLoading } = usePublicRfqs({
    search: search.trim() || undefined,
    categoryId: selectedCategory || undefined,
  });

  // Buyer's personal RFQs
  const { data: myData, isLoading: myLoading } = useMyRfqs(myStatus);

  const { data: categories = [] } = useCategories();

  const liveRfqs = publicData?.rfqs ?? [];
  const myRfqs = (myData?.rfqs ?? []).filter(
    (r: any) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase())
  );

  const isLoading = activeTab === 'board' ? publicLoading : myLoading;
  const rfqs = activeTab === 'board' ? liveRfqs : myRfqs;

  const myStats = {
    total: (myData?.rfqs ?? []).length,
    quotes: (myData?.rfqs ?? []).reduce((acc: number, r: any) => acc + (r._count?.quotes || 0), 0),
  };

  return (
    <PublicLayout>
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
                  {activeTab === 'board' ? 'Live RFQ Sourcing Board' : 'Buyer Sourcing Center'}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-black text-gray-900 tracking-tight leading-none mb-2">
                {activeTab === 'board' ? 'Explore Live Buyer Requests & RFQs' : 'My Sourcing Requests & RFQs'}
              </h1>
              <p className="text-sm text-gray-500 font-medium max-w-2xl">
                {activeTab === 'board'
                  ? 'Real-time verified wholesale purchase requirements from companies across India. Post your requirement or submit manufacturer quotes.'
                  : 'Track your posted requirements, compare competing factory quotes, and manage Assured Deals.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              {activeTab === 'my' && isLoggedIn && (
                <div className="flex items-center gap-6 px-6 py-3.5 bg-white rounded-2xl border border-gray-200 shadow-sm w-full sm:w-auto justify-center sm:justify-start">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Your RFQs
                    </p>
                    <p className="text-2xl font-black text-gray-900 leading-none">{myStats.total}</p>
                  </div>
                  <div className="h-10 w-px bg-gray-100" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Quotes Received
                    </p>
                    <p className="text-2xl font-black text-jungle-green-700 leading-none">{myStats.quotes}</p>
                  </div>
                </div>
              )}

              <Link href="/rfq/create" className="w-full sm:w-auto">
                <Button
                  className="w-full sm:w-auto h-14 px-8 bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-2xl shadow-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <FaPlus className="h-3.5 w-3.5" /> Post New RFQ Free
                </Button>
              </Link>
            </div>
          </div>

          {/* Primary View Mode Switcher: Live RFQ Board vs My RFQs */}
          <div className="flex items-center gap-2 mt-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('board')}
              className={clsx(
                'px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2',
                activeTab === 'board'
                  ? 'border-jungle-green-600 text-jungle-green-700 bg-jungle-green-50/40 rounded-t-xl'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              )}
            >
              <FaBolt className="h-3.5 w-3.5 text-amber-500" />
              Live RFQ Board ({publicData?.total ?? liveRfqs.length})
            </button>

            <button
              onClick={() => {
                if (!isLoggedIn) {
                  router.push('/auth/login?redirect=/rfq');
                } else {
                  setActiveTab('my');
                }
              }}
              className={clsx(
                'px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2',
                activeTab === 'my'
                  ? 'border-jungle-green-600 text-jungle-green-700 bg-jungle-green-50/40 rounded-t-xl'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              )}
            >
              <FaFileLines className="h-3.5 w-3.5 text-gray-400" />
              My Posted Requirements {isLoggedIn && myStats.total > 0 && `(${myStats.total})`}
            </button>
          </div>
        </Container>
      </div>

      <Container size="xl" className="pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Sub-Filters & Search Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              {activeTab === 'my' ? (
                <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-fit">
                  {(['OPEN', 'AWARDED', 'CLOSED'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setMyStatus(t)}
                      className={clsx(
                        'flex-1 md:flex-none px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all',
                        myStatus === t
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-900'
                      )}
                    >
                      {t === 'OPEN' ? 'Active RFQs' : t === 'AWARDED' ? 'Awarded Deals' : 'Closed'}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={clsx(
                      'px-3.5 py-2 rounded-xl text-xs font-bold transition-all border',
                      selectedCategory === ''
                        ? 'bg-jungle-green-600 text-white border-jungle-green-600 shadow-xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    )}
                  >
                    All Categories
                  </button>
                  {categories.slice(0, 5).map((cat: any) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                      className={clsx(
                        'px-3.5 py-2 rounded-xl text-xs font-bold transition-all border',
                        selectedCategory === cat.id
                          ? 'bg-jungle-green-600 text-white border-jungle-green-600 shadow-xs'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="relative w-full md:w-80">
                <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={activeTab === 'board' ? 'Filter live requirements...' : 'Search your requests...'}
                  className="w-full h-11 bg-white border border-gray-200 rounded-xl pl-11 pr-4 text-xs font-medium text-gray-800 outline-none focus:border-jungle-green-600 shadow-xs"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 border border-gray-200 space-y-3 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                    <div className="h-6 bg-gray-100 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : rfqs.length === 0 ? (
              /* Rich Empty State */
              <div className="bg-white border border-gray-200/80 rounded-3xl p-8 md:p-12 shadow-sm text-center space-y-8">
                <div className="max-w-md mx-auto space-y-3">
                  <div className="h-16 w-16 bg-jungle-green-50 text-jungle-green-600 rounded-3xl flex items-center justify-center mx-auto border border-jungle-green-100">
                    <FaFileLines className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-heading font-black text-gray-900 tracking-tight">
                    {activeTab === 'board' ? 'No Active Requirements Matched' : 'No Sourcing Requests Posted Yet'}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    {activeTab === 'board'
                      ? 'No open RFQs match your current search or category filter. Try clearing filters or post your own buy requirement.'
                      : 'When you post a buy requirement, verified factories will submit commercial quotations with lead times and volume pricing directly to your dashboard.'}
                  </p>
                  <div className="pt-2">
                    <Link href="/rfq/create">
                      <Button className="bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-2xl px-8 py-3.5 text-xs font-bold uppercase tracking-wider shadow-md">
                        Post Your RFQ Free →
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
                    className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-jungle-green-300 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                  >
                    <div className="space-y-2.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Badge status={rfq.status} />
                        <span className="text-xs font-bold text-jungle-green-700 bg-jungle-green-50 px-2.5 py-0.5 rounded-md border border-jungle-green-100">
                          {rfq.category?.name || 'General Sourcing'}
                        </span>
                        <span className="text-xs text-gray-400">
                          Posted {formatDistanceToNow(new Date(rfq.createdAt), { addSuffix: true })}
                        </span>
                        {rfq.buyer?.trustScore > 0 && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            Buyer Trust: {rfq.buyer.trustScore}/100
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading font-black text-gray-900 text-lg group-hover:text-jungle-green-700 transition-colors truncate">
                        {rfq.title}
                      </h3>

                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {rfq.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                        <span>Quantity: <strong className="text-gray-900">{rfq.quantity ? `${rfq.quantity} ${rfq.unitOfMeasure || 'units'}` : 'Open'}</strong></span>
                        <span>•</span>
                        <span>Destination: <strong className="text-gray-900">{rfq.locationPreference || rfq.location?.city || 'Pan India'}</strong></span>
                        <span>•</span>
                        <span>Target Budget: <strong className="text-gray-900">{rfq.budgetMax ? `₹${rfq.budgetMax.toLocaleString('en-IN')}` : 'Open to Bids'}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                          Quotes
                        </span>
                        <span className="text-2xl font-heading font-black text-jungle-green-700">
                          {rfq._count?.quotes || rfq.quotesCount || 0}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeTab === 'board') {
                            router.push(`/rfq/${rfq.id}/quote`);
                          } else {
                            router.push(`/rfq/${rfq.id}`);
                          }
                        }}
                        className="bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-xl text-xs font-bold px-5 py-2.5 shadow-sm whitespace-nowrap"
                      >
                        {activeTab === 'board' ? 'Submit Quote →' : 'Review Quotes →'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar Info Card */}
          <div className="lg:col-span-4 lg:w-80 space-y-6 shrink-0">
            {/* Post RFQ Banner */}
            <div className="bg-gradient-to-br from-jungle-green-900 to-jungle-green-950 text-white rounded-3xl p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-jungle-green-300">
                  Instant Sourcing
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <h4 className="text-xl font-heading font-black text-white">Need Custom Manufacturing?</h4>
              <p className="text-xs text-jungle-green-100 leading-relaxed">
                Post your specifications and get competitive price bids from verified Indian factories within 24 hours.
              </p>
              <Link href="/rfq/create" className="block pt-2">
                <Button className="w-full bg-amber-400 hover:bg-amber-500 text-gray-950 rounded-xl text-xs font-black uppercase tracking-wider py-3 shadow">
                  + Post Free RFQ Now
                </Button>
              </Link>
            </div>

            {/* Live Network Stats */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Verified Supplier Network
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Active</span>
              </div>
              <h4 className="text-2xl font-heading font-black text-gray-900">8,200+ Verified Factories</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
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
    </PublicLayout>
  );
}

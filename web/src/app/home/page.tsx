'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaMagnifyingGlass, FaStar, FaShieldHalved, FaBolt, FaBoxesStacked,
  FaArrowRight, FaIndustry, FaLaptop, FaWrench, FaCubes,
  FaGlobe, FaHandshake, FaTruckFast, FaCircleCheck, FaFire,
  FaChevronRight, FaUserCheck, FaFileContract, FaBuildingShield,
  FaEnvelope, FaCalendarDays, FaLocationDot, FaChevronLeft, FaPaperclip,
  FaCamera, FaXmark, FaUpload, FaBuilding, FaFlask, FaBoxOpen, FaWheatAwn, FaBriefcase, FaCoins, FaLock
} from 'react-icons/fa6';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button, Card, Badge, Avatar, Container, Skeleton, TrustScore } from '@/components/ui';
import { useCategories, useFeaturedListings, useRfqInbox, useEvents, useNewProducts, useListingSearch } from '@/lib/hooks';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { clsx } from 'clsx';
import { Sparkles, ShieldCheck, TrendingUp, Zap, Users, Award, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_CATEGORIES, TRENDING_DEALS_FALLBACK } from '@/lib/taxonomy';

const CATEGORY_META: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  'industrial-supplies': { icon: FaIndustry, color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-300' },
  'construction': { icon: FaBuilding, color: 'text-amber-600', bg: 'bg-amber-50', border: 'hover:border-amber-300' },
  'electronics': { icon: FaBolt, color: 'text-purple-600', bg: 'bg-purple-50', border: 'hover:border-purple-300' },
  'textiles': { icon: FaBoxesStacked, color: 'text-rose-600', bg: 'bg-rose-50', border: 'hover:border-rose-300' },
  'chemicals': { icon: FaFlask, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-300' },
  'packaging': { icon: FaBoxOpen, color: 'text-orange-600', bg: 'bg-orange-50', border: 'hover:border-orange-300' },
  'agriculture': { icon: FaWheatAwn, color: 'text-green-600', bg: 'bg-green-50', border: 'hover:border-green-300' },
  'services': { icon: FaBriefcase, color: 'text-teal-600', bg: 'bg-teal-50', border: 'hover:border-teal-300' },
};

const LIVE_FEEDS = [
  "Buyer from Delhi placed bulk order of Monocrystalline Solar Panels",
  "RFQ posted: Need 10,000 meters Organic Combed Cotton Yarn - Chennai",
  "Supplier Swastik Industries Pvt Ltd got verified under GSTIN & PAN",
  "Order Shipped: 5 Metric Tons TMT Steel Rebar to Mumbai Construction site",
  "RFQ posted: Heavy Duty Centrifugal Water Pumps (25 units) - Hyderabad",
  "Buyer from Pune verified transaction via JaxMart Escrow Protection",
];

const TRUST_PILLARS = [
  {
    icon: FaShieldHalved,
    title: 'JaxMart Assured Deals',
    description: '100% milestone-protected escrow payments release only upon verified delivery.',
    color: 'text-jungle-green-600',
    bg: 'bg-jungle-green-50',
  },
  {
    icon: FaCircleCheck,
    title: 'Verified Indian Suppliers',
    description: 'Factory KYC & KYB audits verified on-ground by JaxMart Captains.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: FaBolt,
    title: 'Instant RFQ Matchmaking',
    description: 'Post sourcing needs once; get competing quotes from manufacturers in 24 hours.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: FaTruckFast,
    title: 'End-to-End Freight Logistics',
    description: 'Track multimodal shipments, e-way bills, and delivery proofs in real time.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
];

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();
  const { data: serverCategories } = useCategories();
  const { data: serverFeatured } = useFeaturedListings();
  const categories = (serverCategories && serverCategories.length > 0) ? serverCategories : DEFAULT_CATEGORIES;
  const featuredListings = (serverFeatured?.listings && serverFeatured.listings.length > 0)
    ? serverFeatured.listings
    : TRENDING_DEALS_FALLBACK;

  const { data: globalRfqs } = useRfqInbox({ matchOnly: false, limit: 6 });
  const liveRfqs = globalRfqs?.rfqs ?? [];

  const { data: newProductsRes } = useNewProducts();
  const newProducts = newProductsRes?.data || [];

  const [searchTab, setSearchTab] = useState<'products' | 'suppliers'>('products');
  const [heroSearch, setHeroSearch] = useState('');
  const [feedIndex, setFeedIndex] = useState(0);
  const [activeHoverCategory, setActiveHoverCategory] = useState<any>(null);

  // Quick RFQ form states
  const [rfqProduct, setRfqProduct] = useState('');
  const [rfqQuantity, setRfqQuantity] = useState('');
  const [rfqUnit, setRfqUnit] = useState('Pieces');

  // AI smart search state
  const [aiQuery, setAiQuery] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setFeedIndex((prev) => (prev + 1) % LIVE_FEEDS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleHeroSearch = () => {
    if (heroSearch.trim()) {
      if (searchTab === 'suppliers') {
        router.push(`/search?q=${encodeURIComponent(heroSearch.trim())}&type=supplier`);
      } else {
        router.push(`/search?q=${encodeURIComponent(heroSearch.trim())}`);
      }
    }
  };

  const handleQuickRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqProduct.trim()) return;
    router.push(`/rfq/create?title=${encodeURIComponent(rfqProduct)}&qty=${rfqQuantity}&unit=${rfqUnit}`);
  };

  const handleAiSubmit = () => {
    if (!aiQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(aiQuery.trim())}&ai=true`);
  };

  return (
    <PublicLayout>
      {/* Live Activity Marquee */}
      <div className="bg-gradient-to-r from-jungle-green-900 via-jungle-green-950 to-gray-950 text-white py-2.5 border-b border-jungle-green-800/50">
        <Container size="xl" className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <FaFire className="h-3.5 w-3.5 text-amber-400 animate-pulse shrink-0" />
            <span className="font-black uppercase tracking-wider text-[10px] bg-amber-400 text-gray-950 px-2 py-0.5 rounded-full shrink-0">
              LIVE TRADE FEED
            </span>
            <span className="font-medium text-jungle-green-100 truncate transition-all duration-500">
              {LIVE_FEEDS[feedIndex]}
            </span>
          </div>
          <Link
            href="/rfq"
            className="hidden md:flex items-center gap-1.5 font-bold text-amber-300 hover:text-amber-200 text-xs shrink-0"
          >
            Explore Live RFQ Board <FaArrowRight className="h-3 w-3" />
          </Link>
        </Container>
      </div>

      {/* Main Hero Section with Category Sidebar & Interactive Sourcing Hub */}
      <section className="bg-slate-50/70 py-8 border-b border-gray-200/70">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Top Root Categories Sidebar with Mega-Menu Flyout */}
            <div className="hidden lg:block lg:col-span-3 relative group/sidebar">
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col h-full min-h-[480px]">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-4 font-black text-xs uppercase tracking-widest flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <FaBoxesStacked className="h-4 w-4 text-jungle-green-400" />
                    <span>Top Industries</span>
                  </div>
                  <Link href="/categories" className="text-[10px] text-gray-400 hover:text-white font-bold underline">
                    All
                  </Link>
                </div>

                <div
                  className="flex-1 divide-y divide-gray-100 py-1.5"
                  onMouseLeave={() => setActiveHoverCategory(null)}
                >
                  {categories.slice(0, 8).map((cat: any) => {
                    const meta = CATEGORY_META[cat.slug] || {
                      icon: FaCubes,
                      color: 'text-jungle-green-600',
                      bg: 'bg-jungle-green-50',
                      border: 'hover:border-jungle-green-300',
                    };
                    const Icon = meta.icon;
                      const isHovered = activeHoverCategory?.id === cat.id;

                      return (
                        <div
                          key={cat.id}
                          onMouseEnter={() => setActiveHoverCategory(cat)}
                          className={clsx(
                            'relative group/item flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-all duration-150 cursor-pointer',
                            isHovered
                              ? 'bg-jungle-green-50/80 text-jungle-green-900'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-jungle-green-700'
                          )}
                          onClick={() => router.push(`/search?category=${cat.id}`)}
                        >
                          <span className="flex items-center gap-3 truncate">
                            <div
                              className={clsx(
                                'h-7 w-7 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                                meta.bg,
                                meta.color
                              )}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <span className="truncate">{cat.name}</span>
                          </span>
                          <FaChevronRight className="h-2.5 w-2.5 text-gray-400 group-hover/item:text-jungle-green-600 shrink-0 ml-1" />
                        </div>
                      );
                    })}
                </div>

                <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                  <Link
                    href="/categories"
                    className="text-xs font-bold text-jungle-green-700 hover:text-jungle-green-800 flex items-center justify-center gap-1"
                  >
                    View All 200+ Subcategories <FaArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Mega-Menu Flyout Popover */}
              {activeHoverCategory && activeHoverCategory.children?.length > 0 && (
                <div
                  onMouseEnter={() => setActiveHoverCategory(activeHoverCategory)}
                  onMouseLeave={() => setActiveHoverCategory(null)}
                  className="absolute top-0 left-full ml-2 w-[420px] bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 z-40 animate-in fade-in slide-in-from-left-2 duration-150"
                >
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                    <h4 className="font-heading font-black text-gray-900 text-sm">
                      {activeHoverCategory.name}
                    </h4>
                    <Link
                      href={`/search?category=${activeHoverCategory.id}`}
                      className="text-xs font-bold text-jungle-green-600 hover:underline"
                    >
                      Browse all →
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {activeHoverCategory.children.map((child: any) => (
                      <Link
                        key={child.id}
                        href={`/search?category=${child.id}`}
                        className="p-2.5 rounded-xl bg-gray-50 hover:bg-jungle-green-50 hover:text-jungle-green-800 text-gray-700 text-xs font-bold transition-all truncate flex items-center justify-between group"
                      >
                        <span className="truncate">{child.name}</span>
                        <FaArrowRight className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 text-jungle-green-600 shrink-0 ml-1 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Center & Right Column: B2B Search Hero & Quick RFQ Card */}
            <div className="lg:col-span-9 flex flex-col gap-6">
              {/* Hero Banner Box */}
              <div className="bg-gradient-to-br from-jungle-green-900 via-jungle-green-950 to-slate-950 text-white rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[340px]">
                {/* Decorative background glows */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-jungle-green-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-jungle-green-800/80 border border-jungle-green-700/80 text-jungle-green-200 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-4">
                    <ShieldCheck className="h-4 w-4 text-amber-400" />
                    India&apos;s Trusted B2B Wholesale Marketplace
                  </div>
                  <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tight leading-tight mb-4">
                    Direct Sourcing From Verified Manufacturers
                  </h1>
                  <p className="text-sm md:text-base text-jungle-green-100 leading-relaxed font-normal mb-8">
                    Discover 50,000+ verified factories, compare wholesale quotations, and secure your transactions with JaxMart Assured Deals escrow protection.
                  </p>
                </div>

                {/* Tabbed Search Bar */}
                <div className="relative z-10 bg-white p-2.5 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-2">
                  <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
                    <button
                      onClick={() => setSearchTab('products')}
                      className={clsx(
                        'px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all',
                        searchTab === 'products' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                      )}
                    >
                      Products
                    </button>
                    <button
                      onClick={() => setSearchTab('suppliers')}
                      className={clsx(
                        'px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all',
                        searchTab === 'suppliers' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                      )}
                    >
                      Suppliers
                    </button>
                  </div>

                  <div className="flex-1 flex items-center px-3 w-full">
                    <FaMagnifyingGlass className="h-4 w-4 text-gray-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={heroSearch}
                      onChange={(e) => setHeroSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleHeroSearch()}
                      placeholder={
                        searchTab === 'products'
                          ? 'What are you sourcing today? e.g. TMT Steel, Cotton Yarn, CNC Lathe...'
                          : 'Search verified factories, GSTIN, or company names...'
                      }
                      className="w-full h-11 text-xs md:text-sm font-medium text-gray-900 placeholder-gray-400 outline-none bg-transparent"
                    />
                  </div>

                  <Button
                    onClick={handleHeroSearch}
                    className="w-full md:w-auto bg-amber-400 hover:bg-amber-500 text-gray-950 font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shrink-0 shadow-md"
                  >
                    Search Market
                  </Button>
                </div>
              </div>

              {/* Fast RFQ Sourcing Strip */}
              <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <FaFileContract className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-gray-900 text-base">
                      Can&apos;t Find What You&apos;re Looking For?
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Post an Instant RFQ and receive tailored quotes from verified suppliers in 24 hours.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleQuickRFQ} className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 MT Cement Grade 53"
                    value={rfqProduct}
                    onChange={(e) => setRfqProduct(e.target.value)}
                    className="w-full sm:w-64 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-900 placeholder-gray-400 outline-none focus:border-jungle-green-600"
                  />
                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-xl font-bold text-xs px-6 py-2.5 whitespace-nowrap shadow"
                  >
                    Post Request Free <FaArrowRight className="h-3 w-3 ml-1.5" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="bg-white py-10 border-b border-gray-200/70">
        <Container size="xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className={clsx('h-11 w-11 rounded-2xl flex items-center justify-center shrink-0', pillar.bg, pillar.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-gray-900 text-sm">{pillar.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{pillar.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Primary Industries Showcase (Fixed Multi-Level Categories Display) */}
      <section className="bg-slate-50/70 py-16 border-b border-gray-200/70">
        <Container size="xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-jungle-green-700 font-bold text-xs uppercase tracking-wider mb-2">
                <FaBoxesStacked className="h-3.5 w-3.5" /> B2B Industry Directory
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-black text-gray-900 tracking-tight">
                Explore Markets & Industries
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Source directly across major manufacturing sectors and certified supplier hubs.
              </p>
            </div>

            <Link
              href="/categories"
              className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-jungle-green-600 text-gray-800 hover:text-jungle-green-700 font-bold text-xs px-5 py-2.5 rounded-full shadow-sm transition-all"
            >
              Browse All Categories <FaArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* 8 Primary Industry Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((cat: any) => {
              const meta = CATEGORY_META[cat.slug] || {
                icon: FaCubes,
                color: 'text-jungle-green-600',
                bg: 'bg-jungle-green-50',
                border: 'hover:border-jungle-green-300',
              };
              const Icon = meta.icon;
              const children = cat.children || [];

                return (
                  <div
                    key={cat.id}
                    onClick={() => router.push(`/search?category=${cat.id}`)}
                    className={clsx(
                      'bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between cursor-pointer relative overflow-hidden',
                      meta.border
                    )}
                  >
                    <div>
                      {/* Category Icon & Title */}
                      <div className="flex items-center gap-3.5 mb-4">
                        <div
                          className={clsx(
                            'h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm',
                            meta.bg,
                            meta.color
                          )}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-heading font-black text-gray-900 text-base leading-snug group-hover:text-jungle-green-700 transition-colors">
                          {cat.name}
                        </h3>
                      </div>

                      {/* Subcategories list */}
                      {children.length > 0 && (
                        <div className="space-y-1.5 mb-6 pt-2 border-t border-gray-100">
                          {children.slice(0, 4).map((sub: any) => (
                            <div
                              key={sub.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/search?category=${sub.id}`);
                              }}
                              className="text-xs text-gray-600 hover:text-jungle-green-700 hover:translate-x-1 font-medium transition-all flex items-center gap-1.5 truncate"
                            >
                              <span className="h-1 w-1 rounded-full bg-gray-300 shrink-0" />
                              <span className="truncate">{sub.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs font-bold text-jungle-green-700 group-hover:text-jungle-green-800">
                      <span>Source from Suppliers</span>
                      <FaArrowRight className="h-3 w-3 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
          </div>
        </Container>
      </section>

      {/* Featured & Trending Products Showcase */}
      <section className="bg-white py-16 border-b border-gray-200/70">
        <Container size="xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
                <FaFire className="h-3.5 w-3.5" /> High-Demand Products
              </div>
              <h2 className="text-3xl font-heading font-black text-gray-900 tracking-tight">
                Trending Wholesale Deals
              </h2>
            </div>
            <Link
              href="/search"
              className="text-xs font-bold text-jungle-green-700 hover:underline flex items-center gap-1"
            >
              See All Products <FaArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredListings.slice(0, 8).map((product: any) => (
              <div
                key={product.id}
                onClick={() => router.push(`/listings/${product.id}`)}
                className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm hover:shadow-xl hover:border-jungle-green-300 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3.5 border border-gray-100 flex items-center justify-center p-3">
                    {product.media?.[0]?.url ? (
                      <img
                        src={product.media[0].url}
                        alt={product.title}
                        className="object-contain h-full w-full group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <FaBoxesStacked className="h-10 w-10 text-gray-300" />
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-gray-900 group-hover:text-jungle-green-700 transition-colors line-clamp-2 mb-1.5">
                    {product.title}
                  </h4>

                  <p className="text-xs text-gray-500 truncate mb-3">
                    {product.seller?.businessProfile?.businessName || product.seller?.fullName || 'Verified Supplier'}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-end justify-between">
                  <div>
                    <p className="text-base font-heading font-black text-gray-900">
                      {product.productDetail?.pricePerUnit
                        ? `₹${product.productDetail.pricePerUnit.toLocaleString('en-IN')}`
                        : 'Get Quote'}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Min: {product.productDetail?.minOrderQty || 1} {product.productDetail?.unitOfMeasure || 'Units'}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    className="bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-xl text-xs font-bold px-3 py-1.5 shadow"
                  >
                    Inquire
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* AI Smart Sourcing Engine Bar */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 text-white py-16">
        <Container size="xl">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-jungle-green-300 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
              <Sparkles className="h-4 w-4 text-amber-400" />
              AI-Powered Matchmaking Engine
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tight mb-4">
              Describe Any Custom Sourcing Requirement
            </h2>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              Our intelligent procurement engine parses your specifications, tolerances, and HSN codes to match you with top-rated factories across India.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAiSubmit();
              }}
              className="relative flex items-center bg-white/10 border border-white/20 rounded-2xl p-2 focus-within:border-jungle-green-400 focus-within:ring-4 focus-within:ring-jungle-green-500/20 transition-all"
            >
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="e.g. Find manufacturers of SS 304 flange fittings with ISO 9001 in Gujarat..."
                className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-gray-400 outline-none"
              />
              <Button
                type="submit"
                className="bg-amber-400 hover:bg-amber-500 text-gray-950 font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl shrink-0 shadow-lg"
              >
                Match Suppliers
              </Button>
            </form>
          </div>
        </Container>
      </section>
    </PublicLayout>
  );
}

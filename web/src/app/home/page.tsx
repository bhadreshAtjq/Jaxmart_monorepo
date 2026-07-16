'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaMagnifyingGlass, FaStar, FaShieldHalved, FaBolt, FaBoxesStacked,
  FaArrowRight, FaIndustry, FaLaptop, FaWrench, FaCubes,
  FaGlobe, FaHandshake, FaTruckFast, FaCircleCheck, FaFire,
  FaChevronRight, FaUserCheck, FaFileContract, FaBuildingShield,
  FaEnvelope, FaCalendarDays, FaLocationDot, FaChevronLeft
} from 'react-icons/fa6';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button, Card, Badge, Avatar, Container, Skeleton, TrustScore } from '@/components/ui';
import { useCategories, useFeaturedListings, useRfqInbox, useEvents } from '@/lib/hooks';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { clsx } from 'clsx';

const CATEGORY_ICONS: Record<string, any> = {
  'industrial-supplies': FaIndustry,
  electronics: FaLaptop,
  construction: FaCubes,
  textiles: FaBoxesStacked,
  services: FaWrench,
};

const LIVE_FEEDS = [
  "Buyer from Delhi placed bulk order of Monocrystalline Solar Panels",
  "RFQ posted: Need 10,000 meters Organic Combed Cotton Yarn - Chennai",
  "Supplier Swastik Industries Pvt Ltd got verified under GSTIN & PAN",
  "Order Shipped: 5 Metric Tons TMT Steel Rebar to Mumbai Construction site",
  "RFQ posted: Heavy Duty Centrifugal Water Pumps (25 units) - Hyderabad",
  "Buyer from Pune verified transaction via JaxMart Escrow Protection",
];

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();
  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const { data: featured, isLoading: featuredLoading } = useFeaturedListings();
  const { data: globalRfqs, isLoading: rfqsLoading } = useRfqInbox({ matchOnly: false, limit: 6 });
  const liveRfqs = globalRfqs?.rfqs ?? [];

  const [searchTab, setSearchTab] = useState<'products' | 'suppliers'>('products');
  const [heroSearch, setHeroSearch] = useState('');
  const [feedIndex, setFeedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showAuth = mounted && isLoggedIn;

  // Quick RFQ form states
  const [rfqProduct, setRfqProduct] = useState('');
  const [rfqQuantity, setRfqQuantity] = useState('');
  const [rfqUnit, setRfqUnit] = useState('Pieces');

  // Global Events Carousel states
  const { data: eventsData, isLoading: eventsLoading } = useEvents();
  const events = eventsData?.events ?? [];
  const [eventIndex, setEventIndex] = useState(0);

  useEffect(() => {
    if (events.length <= 1) return;
    const timer = setInterval(() => {
      setEventIndex((prev) => (prev + 1) % events.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [events.length]);

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

  return (
    <PublicLayout>
      {/* Live Activity Marquee */}
      <div className="bg-jungle-green-50 border-b border-jungle-green-100/50 py-2">
        <Container size="xl" className="flex items-center justify-between text-xs text-jungle-green-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <FaFire className="h-3.5 w-3.5 text-jungle-green-500 animate-bounce shrink-0" />
            <span className="font-bold uppercase tracking-wider text-[10px] bg-jungle-green-200 text-jungle-green-800 px-2 py-0.5 rounded shrink-0">LIVE B2B FEED</span>
            <span className="font-medium truncate transition-all duration-500">{LIVE_FEEDS[feedIndex]}</span>
          </div>
          <Link href="/rfq" className="hidden md:flex items-center gap-1 font-bold text-jungle-green-600 hover:text-jungle-green-700 whitespace-nowrap">
            View Live RFQ Board <FaArrowRight className="h-3 w-3" />
          </Link>
        </Container>
      </div>

      {/* Main Alibaba/GlobalSources Style Banner Grid */}
      <section className="bg-gray-50 py-8 border-b border-gray-200/80">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* 1. Category Sidebar Menu (Alibaba-style) */}
            <div className="hidden lg:block lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden lg:h-[380px] flex flex-col">
              <div className="bg-gray-900 text-white px-4 py-3.5 font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 shrink-0">
                <FaBoxesStacked className="h-4 w-4 text-jungle-green-500" />
                All Markets & Industries
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {catsLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="p-4"><Skeleton className="h-4 w-3/4" /></div>
                  ))
                ) : (
                  categories.map((cat: any) => {
                    const Icon = CATEGORY_ICONS[cat.slug] || FaCubes;
                    return (
                      <Link
                        key={cat.id}
                        href={`/search?category=${cat.id}`}
                        className="group flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-jungle-green-50 hover:text-jungle-green-600 transition-colors font-semibold"
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-gray-400 group-hover:text-jungle-green-500 transition-colors" />
                          {cat.name}
                        </span>
                        <FaChevronRight className="h-3 w-3 text-gray-300 group-hover:text-jungle-green-500 transition-transform group-hover:translate-x-1" />
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            {/* 2. Central B2B Slider & Tabbed Search Panel */}
            <div className="lg:col-span-6 flex flex-col gap-4 lg:h-[380px]">

              {/* Tabbed B2B Search Container */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-[136px] shrink-0">
                <div className="flex gap-2 border-b border-gray-100 pb-1.5">
                  <button
                    onClick={() => setSearchTab('products')}
                    className={clsx(
                      "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300",
                      searchTab === 'products' ? "bg-gradient-to-r from-[#232F72] to-[#2F578A] text-white" : "text-gray-500 hover:text-gray-900"
                    )}
                  >
                    Products
                  </button>
                  <button
                    onClick={() => setSearchTab('suppliers')}
                    className={clsx(
                      "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300",
                      searchTab === 'suppliers' ? "bg-gradient-to-r from-[#232F72] to-[#2F578A] text-white" : "text-gray-500 hover:text-gray-900"
                    )}
                  >
                    Suppliers
                  </button>
                </div>

                <div className="flex border-2 border-jungle-green-500 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-jungle-green-500/20 mt-2 shrink-0">
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleHeroSearch()}
                    placeholder={
                      searchTab === 'products'
                        ? "Enter keywords, HSN codes, or brands..."
                        : "Search verified factories, suppliers by name or GSTIN..."
                    }
                    className="flex-1 h-9 px-3 text-xs text-gray-800 placeholder-gray-400 outline-none"
                  />
                  <button
                    onClick={handleHeroSearch}
                    className="bg-gradient-to-r from-[#232F72] to-[#2F578A] hover:from-[#1C265B] hover:to-[#244774] text-white font-bold text-xs px-4 flex items-center gap-1.5 transition-all duration-300 shrink-0"
                  >
                    <FaMagnifyingGlass className="h-3.5 w-3.5" />
                    <span>Search</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1.5 text-[10px] text-gray-400">
                  <span className="font-semibold text-gray-500">Hot Searches:</span>
                  <Link href="/search?q=Solar%20Panel" className="hover:text-jungle-green-600 hover:underline">Solar Panels</Link>
                  <span>•</span>
                  <Link href="/search?q=Steel" className="hover:text-jungle-green-600 hover:underline">TMT Steel</Link>
                  <span>•</span>
                  <Link href="/search?q=Yarn" className="hover:text-jungle-green-600 hover:underline">Cotton Yarn</Link>
                  <span>•</span>
                  <Link href="/search?q=Pump" className="hover:text-jungle-green-600 hover:underline">Hydraulic Pumps</Link>
                </div>
              </div>

              {/* Global Events Carousel */}
              <div className="flex-1 min-h-0 rounded-2xl border border-white/[0.06] shadow-2xl relative overflow-hidden flex flex-col justify-between group/carousel bg-[#090b11] transition-all duration-500 hover:border-purple-500/20 hover:shadow-purple-500/5">
                {eventsLoading ? (
                  <div className="absolute inset-0 flex flex-col justify-between p-5 bg-gradient-to-br from-gray-900 via-purple-950/20 to-gray-950">
                    <div>
                      <Skeleton className="h-5 w-32 bg-white/5" />
                      <Skeleton className="h-6 w-3/4 bg-white/5 mt-4" />
                      <Skeleton className="h-12 w-full bg-white/5 mt-2" />
                    </div>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-24 bg-white/5" />
                      <Skeleton className="h-8 w-24 bg-white/5" />
                    </div>
                  </div>
                ) : events.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-5 bg-gradient-to-br from-gray-900 via-[#232F72]/10 to-gray-950 text-center">
                    <FaCalendarDays className="h-8 w-8 text-gray-600 mb-2 animate-bounce" />
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">No Events Scheduled</p>
                    <p className="text-gray-500 text-[10px] mt-1 font-medium">Check back soon for upcoming global forums</p>
                  </div>
                ) : (
                  <>
                    {/* Background slide with image + gradient overlay */}
                    <div className="absolute inset-0 z-0 transition-all duration-700 ease-in-out">
                      <img
                        src={events[eventIndex].mediaUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800"}
                        alt={events[eventIndex].title}
                        className="w-full h-full object-cover opacity-75 group-hover/carousel:scale-[1.03] transition-transform duration-[6000ms]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090b11] via-[#090b11]/50 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#090b11]/40 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-5 flex flex-col justify-between h-full">
                      {/* Top Bar: Badge & Date */}
                      <div className="flex justify-between items-start">
                        <span className="bg-[#36ADA3]/10 border border-[#36ADA3]/30 text-[#36ADA3] font-extrabold uppercase text-[8px] px-2.5 py-1 rounded-lg tracking-widest shadow-sm animate-pulse">
                          ✨ Upcoming B2B Event
                        </span>

                        <span className="text-[9px] font-bold text-gray-300 bg-white/[0.04] border border-white/[0.06] backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-mono shadow-sm">
                          <FaCalendarDays className="h-3 w-3 text-[#36ADA3]" />
                          {new Date(events[eventIndex].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Info & Details Glass Plate */}
                      <div className="bg-white/[0.02] border border-white/[0.05] backdrop-blur-md p-4 rounded-xl flex flex-col gap-2 shadow-xl mt-auto">
                        <h2 className="text-xs md:text-sm font-black text-white leading-snug uppercase tracking-tight line-clamp-1 bg-clip-text bg-gradient-to-r from-white via-white to-gray-400">
                          {events[eventIndex].title}
                        </h2>

                        <p className="text-[10.5px] text-gray-400 leading-normal line-clamp-2 font-medium">
                          {events[eventIndex].description}
                        </p>

                        {/* Location and Info Row */}
                        <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400 font-semibold border-t border-white/[0.05] pt-2">
                          <span className="flex items-center gap-1 truncate max-w-[140px]">
                            <FaLocationDot className="text-[#36ADA3] h-3 w-3 shrink-0" />
                            {events[eventIndex].location || "Online"}
                          </span>

                          <button className="h-7 px-3 bg-gradient-to-r from-[#232F72] to-[#2F578A] text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition-all duration-300 hover:shadow-jax-blue/20 hover:shadow-lg flex items-center gap-1 hover:scale-[1.03] active:scale-95 border-none cursor-pointer">
                            Register Free <FaArrowRight className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>

                      {/* Footer Dot Indicators */}
                      <div className="flex items-center justify-start gap-1.5 mt-3 shrink-0">
                        {events.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setEventIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === eventIndex
                                ? 'w-4 bg-[#36ADA3] shadow-[0_0_8px_rgba(54,173,163,0.5)]'
                                : 'w-1 bg-white/20 hover:bg-white/40'
                              }`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Prev/Next Navigation Controls */}
                    <button
                      onClick={() => setEventIndex((prev) => (prev - 1 + events.length) % events.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-7 w-7 rounded-full bg-white/[0.02] border border-white/[0.08] backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 hover:bg-[#232F72] hover:border-transparent hover:text-white transition-all duration-200"
                      aria-label="Previous event"
                    >
                      <FaChevronLeft className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setEventIndex((prev) => (prev + 1) % events.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-7 w-7 rounded-full bg-white/[0.02] border border-white/[0.08] backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 hover:bg-[#232F72] hover:border-transparent hover:text-white transition-all duration-200"
                      aria-label="Next event"
                    >
                      <FaChevronRight className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>

            </div>

            {/* 3. Fast RFQ Form Block (Global Sources style) */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-between lg:h-[380px] overflow-hidden">
              <div className="flex flex-col flex-1 justify-between">
                <div className="flex items-center gap-2 mb-2.5 shrink-0">
                  <div className="h-7 w-7 rounded-lg bg-jungle-green-100 flex items-center justify-center text-jungle-green-600 shrink-0">
                    <FaFileContract className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider leading-none">Instant RFQ</h3>
                    <p className="text-[9px] text-gray-400 font-medium mt-0.5">Get multiple quotes in 24 hours</p>
                  </div>
                </div>

                <form onSubmit={handleQuickRFQ} className="flex-1 flex flex-col justify-between gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider">What product do you need?</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cotton Yarn 30s, CNC inserts"
                      value={rfqProduct}
                      onChange={(e) => setRfqProduct(e.target.value)}
                      className="w-full h-8 bg-gray-50 border border-gray-200 rounded-lg px-2.5 text-xs outline-none focus:border-jungle-green-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider">Quantity</label>
                      <input
                        type="number"
                        placeholder="100"
                        value={rfqQuantity}
                        onChange={(e) => setRfqQuantity(e.target.value)}
                        className="w-full h-8 bg-gray-50 border border-gray-200 rounded-lg px-2.5 text-xs outline-none focus:border-jungle-green-500 focus:bg-white transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider">Unit</label>
                      <select
                        value={rfqUnit}
                        onChange={(e) => setRfqUnit(e.target.value)}
                        className="w-full h-8 bg-gray-50 border border-gray-200 rounded-lg px-2 text-xs outline-none focus:border-jungle-green-500 focus:bg-white transition-colors cursor-pointer"
                      >
                        <option value="Pieces">Pieces</option>
                        <option value="Metric Tons">Metric Tons</option>
                        <option value="Kilograms">Kilograms</option>
                        <option value="Boxes">Boxes</option>
                        <option value="Rolls">Rolls</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-9 bg-gradient-to-r from-[#232F72] to-[#2F578A] hover:from-[#1C265B] hover:to-[#244774] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all duration-300 shadow-sm flex items-center justify-center gap-1 mt-1 shrink-0"
                  >
                    Post Request Free <FaArrowRight className="h-3 w-3" />
                  </button>
                </form>
              </div>

              <div className="border-t border-gray-100 pt-3 mt-3 bg-jungle-green-50/40 p-2.5 rounded-lg flex items-center gap-2.5 shrink-0">
                <FaBuildingShield className="h-7 w-7 text-jungle-green-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-jungle-green-950 uppercase tracking-wider">Secure Trade</p>
                  <p className="text-[8px] text-jungle-green-850 leading-tight">Escrow payments protected, 100% money back guarantee.</p>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* Main Home Content */}
      <Container size="xl" className="py-12 space-y-12">

        {/* 1. Hot Products Section (Alibaba Grid Layout) */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaFire className="text-jungle-green-500 h-5 w-5" />
                Premium Bulk Listings
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Top trending manufactured products ready for wholesale orders</p>
            </div>
            <Link href="/search" className="text-xs font-bold text-jungle-green-600 hover:underline flex items-center gap-1">
              Browse All Products <FaArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {featuredLoading ? (
              Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-80 rounded-lg" />)
            ) : (
              featured?.listings?.slice(0, 12).map((item: any) => (
                <Link key={item.id} href={`/listings/${item.id}`} className="group">
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-jungle-green-200 transition-all h-full flex flex-col">
                    <div className="aspect-square bg-gray-50 overflow-hidden relative border-b border-gray-100">
                      {item.media?.[0] ? (
                        <img
                          src={item.media[0].url}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={item.title}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                          <FaIndustry className="h-12 w-12" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                        {item.seller?.kycStatus === 'VERIFIED' && (
                          <span className="bg-jungle-green-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow flex items-center gap-1">
                            <FaCircleCheck className="h-2.5 w-2.5 shrink-0" />
                            Verified
                          </span>
                        )}
                        {item.isFeatured && (
                          <span className="bg-gray-900 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow flex items-center gap-1">
                            <FaFire className="h-2.5 w-2.5 text-amber-400 shrink-0" />
                            Hot
                          </span>
                        )}
                      </div>
                      {item.seller?.trustScore &&
                        !['industrial registration', 'electronics', 'industrial textiles'].includes(item.category?.name?.toLowerCase()) &&
                        !['industrial registration', 'electronics', 'industrial textiles'].includes(item.title?.toLowerCase()) && (
                        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-800 shadow">
                          Trust: {item.seller.trustScore}%
                        </div>
                      )}
                    </div>

                    <div className="p-3 flex-1 flex flex-col">
                      <span className="text-[10px] font-bold text-jungle-green-600 uppercase tracking-widest block mb-1">
                        {item.category?.name}
                      </span>
                      <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug mb-2 group-hover:text-jungle-green-600 transition-colors min-h-[2.5rem]">
                        {item.title}
                      </h3>

                      <div className="mt-auto">
                        <div className="text-base font-bold text-gray-900">
                          {item.productDetail?.pricePerUnit ? `₹${item.productDetail.pricePerUnit.toLocaleString('en-IN')}` : 'Get Price'}
                          {item.productDetail?.pricePerUnit && (
                            <span className="text-[10px] text-gray-400 font-normal"> /{item.productDetail?.unitOfMeasure || 'Pc'}</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Min. Order: <strong>{item.productDetail?.minOrderQty || 1} {item.productDetail?.unitOfMeasure || 'Pcs'}</strong>
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center gap-1.5">
                          <FaCircleCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="text-[10px] text-gray-500 truncate font-semibold">
                            {item.seller?.businessProfile?.businessName || item.seller?.fullName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* 2. Industry Showcase (Categories Display) */}
        <section className="bg-gray-50 rounded-2xl border border-gray-200/80 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Browse Markets & Industries</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {catsLoading ? (
              Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
            ) : (
              categories.map((cat: any) => {
                const Icon = CATEGORY_ICONS[cat.slug] || FaCubes;
                return (
                  <Link key={cat.id} href={`/search?category=${cat.id}`}>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-jungle-green-200 transition-all group flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-jungle-green-50 text-jungle-green-500 flex items-center justify-center group-hover:bg-jungle-green-500 group-hover:text-white transition-colors shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-gray-800 group-hover:text-jungle-green-600 transition-colors truncate">
                          {cat.name}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-0.5">
                          Source Now →
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {/* 3. Live Buyer Requests Board */}
        {showAuth && (
          <section>
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FaEnvelope className="text-jungle-green-500" />
                  Active RFQ Sourcing Requests
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Live requests posted by buyers waiting for suppliers to quote</p>
              </div>
              <Link href="/rfq" className="text-xs font-bold text-jungle-green-600 hover:underline flex items-center gap-1">
                View Sourcing Board <FaArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rfqsLoading ? (
                Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
              ) : liveRfqs.length === 0 ? (
                <div className="col-span-4 bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400">
                  No active requests right now. Be the first to post!
                </div>
              ) : (
                liveRfqs.slice(0, 4).map((rfq: any) => (
                  <Link key={rfq.id} href={`/rfq/${rfq.id}`}>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-jungle-green-200 transition-all group h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge status={rfq.rfqType} className="text-[9px] font-black" />
                          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                            {rfq.category?.name}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-gray-800 group-hover:text-jungle-green-600 transition-colors line-clamp-1">
                          {rfq.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                          {rfq.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-3">
                        <div>
                          <p className="text-xs font-black text-gray-900">
                            ₹{rfq.budgetMax?.toLocaleString('en-IN') || 'Open Budget'}
                          </p>
                          <p className="text-[9px] text-gray-400 font-medium">Estimated Budget</p>
                        </div>
                        <Button size="sm" className="text-[10px] px-3 py-1 font-bold h-8 rounded-lg shrink-0">
                          Send Quote
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        )}

        {/* 4. Trust and Safety Banner */}
        <section className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
            <FaShieldHalved className="text-emerald-500 h-5 w-5" /> JaxMart Escrow Protection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: '1. Secure Payments',
                desc: 'JaxMart holds your funds in escrow, protecting you from fraud.'
              },
              {
                title: '2. Verified Shipping',
                desc: 'We verify GSTIN, HSN, and carrier logistics before releasing funds.'
              },
              {
                title: '3. Inspection Guarantee',
                desc: 'Release payments to suppliers only after verifying cargo quality.'
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-emerald-100/50 p-5 shadow-sm flex items-start gap-4">
                <FaCircleCheck className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Featured Factories Showcase */}
        <section className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wider flex items-center gap-2">
            <FaHandshake className="text-jungle-green-500 h-5 w-5" />
            Featured Factories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Vardhman Textiles Ltd", city: "Ludhiana", category: "Textiles", year: 1998 },
              { name: "Apex Industries", city: "Mumbai", category: "Industrial", year: 2004 },
              { name: "Swastik Chemicals", city: "Ahmedabad", category: "Chemicals", year: 2011 }
            ].map((fac, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200/60 rounded-xl p-5 flex items-center gap-4 hover:shadow-md hover:border-jungle-green-200 transition-all">
                <div className="h-12 w-12 rounded-xl bg-jungle-green-50 flex items-center justify-center border border-jungle-green-150 font-black text-sm text-jungle-green-600 shrink-0">
                  {fac.name.substring(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-800 text-sm truncate">{fac.name}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    {fac.city} • Est. {fac.year}
                  </p>
                  <span className="inline-block mt-2 text-[9px] bg-jungle-green-100 text-jungle-green-700 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                    {fac.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Join as a Wholesale Supplier */}
        <section className="bg-gradient-to-r from-[#232F72] via-[#2F578A] to-[#1C265B] text-white rounded-2xl p-8 md:p-12 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <h3 className="font-extrabold text-xl md:text-2xl mb-2 text-white">Join as a Wholesale Supplier</h3>
            <p className="text-sm text-white/90 leading-relaxed">
              List your products, register your GSTIN, and quote on thousands of active RFQ requests. Reach buyers nationwide.
            </p>
          </div>
          <Link href={showAuth ? "/seller/dashboard" : "/auth/login"} className="w-full md:w-auto shrink-0">
            <button className="w-full md:w-auto h-12 px-8 bg-white text-[#232F72] font-black text-sm uppercase tracking-wider rounded-xl hover:bg-gray-50 transition-colors shadow-lg">
              Register Factory Center
            </button>
          </Link>
        </section>

      </Container>
    </PublicLayout>
  );
}

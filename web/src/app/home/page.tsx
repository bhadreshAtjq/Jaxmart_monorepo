'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaMagnifyingGlass, FaStar, FaShieldHalved, FaBolt, FaBoxesStacked,
  FaArrowRight, FaIndustry, FaLaptop, FaWrench, FaCubes,
  FaGlobe, FaHandshake, FaTruckFast, FaCircleCheck, FaFire,
  FaChevronRight, FaUserCheck, FaFileContract, FaBuildingShield,
  FaEnvelope, FaCalendarDays, FaLocationDot, FaChevronLeft, FaPaperclip, FaCamera, FaXmark, FaUpload
} from 'react-icons/fa6';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button, Card, Badge, Avatar, Container, Skeleton, TrustScore } from '@/components/ui';
import { useCategories, useFeaturedListings, useRfqInbox, useEvents, useNewProducts, useListingSearch } from '@/lib/hooks';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { clsx } from 'clsx';
import { MdVerified } from 'react-icons/md';
import { ShoppingBag, MessageCircleQuestion, MonitorSmartphone, ClipboardCheck, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedbackModal } from '@/components/common/FeedbackModal';

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

  const { data: newProductsRes, isLoading: newProductsLoading } = useNewProducts();
  const newProducts = newProductsRes?.data || [];

  const { data: analystChoiceData } = useListingSearch({ tag: 'analysts-choice', limit: 2 });
  const analystChoiceProducts = analystChoiceData?.listings || [];

  const { data: lowMoqData } = useListingSearch({ tag: 'low-moq', limit: 2 });
  const lowMoqProducts = lowMoqData?.listings || [];

  const { data: oemData } = useListingSearch({ tag: 'oem', limit: 2 });
  const oemProducts = oemData?.listings || [];

  const [searchTab, setSearchTab] = useState<'products' | 'suppliers'>('products');
  const [heroSearch, setHeroSearch] = useState('');
  const [feedIndex, setFeedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

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

  const [aiQuery, setAiQuery] = useState('');
  const [showImagePopover, setShowImagePopover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAiSubmit = () => {
    if (!aiQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(aiQuery.trim())}&ai=true`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      setAiQuery(prev => prev ? `${prev} [Image: ${fileName}]` : `[Image: ${fileName}] `);
      setShowImagePopover(false);
    }
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

            {/* Left Column: Categories + RFQ */}
            <div className="hidden lg:flex flex-col lg:col-span-3 gap-6">
              {/* 1. Category Sidebar Menu (Alibaba-style) */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col group flex-1 min-h-[400px]">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-4 font-black text-xs uppercase tracking-widest flex items-center gap-3 shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                  <FaBoxesStacked className="h-4 w-4 text-jungle-green-400" />
                  <span className="relative z-10">Markets & Industries</span>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-gray-50/50 py-2 custom-scrollbar">
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
                          className="group/item flex items-center justify-between px-5 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-jungle-green-50/50 hover:to-transparent hover:text-jungle-green-700 transition-all duration-300 font-bold"
                        >
                          <span className="flex items-center gap-3.5 transform group-hover/item:translate-x-1 transition-transform duration-300">
                            <div className="h-7 w-7 rounded-lg bg-gray-50 flex items-center justify-center group-hover/item:bg-jungle-green-100/50 group-hover/item:text-jungle-green-600 transition-colors border border-gray-100/50 group-hover/item:border-transparent">
                              <Icon className="h-3.5 w-3.5 opacity-60 group-hover/item:opacity-100" />
                            </div>
                            {cat.name}
                          </span>
                          <FaChevronRight className="h-3 w-3 text-gray-300 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300" />
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 3. Fast RFQ Form Block (Moved below Markets & Industries) */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-5 flex flex-col justify-between relative overflow-hidden shrink-0">
                {/* Decorative top gradient */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-jungle-green-400 to-[#36ADA3]" />

                <div className="flex flex-col flex-1 relative z-10">
                  <div className="flex items-center gap-3 mb-6 shrink-0">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-jungle-green-50 to-teal-50 border border-jungle-green-100/50 flex items-center justify-center text-jungle-green-600 shrink-0 shadow-sm">
                      <FaFileContract className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-gray-900 uppercase tracking-widest leading-none">Instant RFQ</h3>
                      <p className="text-[10px] text-gray-500 font-medium mt-1">Get multiple quotes in 24 hours</p>
                    </div>
                  </div>

                  <form onSubmit={handleQuickRFQ} className="flex flex-col gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">What product do you need?</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cotton Yarn 30s, CNC inserts"
                        value={rfqProduct}
                        onChange={(e) => setRfqProduct(e.target.value)}
                        className="w-full h-11 bg-gray-50/50 border border-gray-200 rounded-xl px-3.5 text-xs font-medium outline-none focus:border-jungle-green-500 focus:ring-4 focus:ring-jungle-green-500/10 focus:bg-white transition-all duration-300 placeholder:text-gray-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Quantity</label>
                        <input
                          type="number"
                          placeholder="100"
                          value={rfqQuantity}
                          onChange={(e) => setRfqQuantity(e.target.value)}
                          className="w-full h-11 bg-gray-50/50 border border-gray-200 rounded-xl px-3.5 text-xs font-medium outline-none focus:border-jungle-green-500 focus:ring-4 focus:ring-jungle-green-500/10 focus:bg-white transition-all duration-300 placeholder:text-gray-400"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Unit</label>
                        <select
                          value={rfqUnit}
                          onChange={(e) => setRfqUnit(e.target.value)}
                          className="w-full h-11 bg-gray-50/50 border border-gray-200 rounded-xl px-3 text-xs font-medium outline-none focus:border-jungle-green-500 focus:ring-4 focus:ring-jungle-green-500/10 focus:bg-white transition-all duration-300 cursor-pointer text-gray-700"
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
                      className="w-full h-12 bg-[#232F72] hover:bg-[#1C265B] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-lg shadow-[#232F72]/20 hover:shadow-xl hover:shadow-[#232F72]/30 active:scale-95 flex items-center justify-center gap-2 mt-2 shrink-0 group/btn border border-[#232F72]"
                    >
                      Post Request Free
                      <FaArrowRight className="h-3 w-3 transform group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </form>
                </div>

                <div className="mt-5 bg-jungle-green-50/50 border border-jungle-green-100/50 p-3.5 rounded-xl flex items-start gap-3.5 shrink-0">
                  <div className="h-7 w-7 rounded-full bg-jungle-green-100 flex items-center justify-center shrink-0 mt-0.5 border border-jungle-green-200/50">
                    <FaBuildingShield className="h-3.5 w-3.5 text-jungle-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-jungle-green-900 uppercase tracking-widest">Secure Trade</p>
                    <p className="text-[9px] text-jungle-green-700/80 leading-relaxed font-bold mt-0.5">Escrow payments protected, 100% money back guarantee.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Central B2B Slider & Tabbed Search Panel */}
            <div className="lg:col-span-9 flex flex-col gap-5 min-h-[500px]">

              {/* Tabbed B2B Search Container */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between shrink-0">
                <div className="flex gap-1 bg-gray-50/80 p-1 rounded-xl w-fit mb-4 border border-gray-100/50">
                  <button
                    onClick={() => setSearchTab('products')}
                    className={clsx(
                      "px-5 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all duration-300",
                      searchTab === 'products' ? "bg-white text-[#232F72] shadow-sm ring-1 ring-gray-900/5" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    Products
                  </button>
                  <button
                    onClick={() => setSearchTab('suppliers')}
                    className={clsx(
                      "px-5 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all duration-300",
                      searchTab === 'suppliers' ? "bg-white text-[#232F72] shadow-sm ring-1 ring-gray-900/5" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    Suppliers
                  </button>
                </div>

                <div className="flex items-center bg-white border-2 border-gray-100 rounded-xl overflow-hidden focus-within:border-jungle-green-500 focus-within:ring-4 focus-within:ring-jungle-green-500/10 transition-all duration-300 group/search">
                  <div className="pl-4 text-gray-400 group-focus-within/search:text-jungle-green-500 transition-colors">
                    <FaMagnifyingGlass className="h-4 w-4" />
                  </div>
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
                    className="flex-1 h-12 px-3 text-sm font-medium text-gray-800 placeholder-gray-400 outline-none bg-transparent"
                  />
                  <button
                    onClick={handleHeroSearch}
                    className="h-10 mx-1 px-6 rounded-lg bg-gradient-to-r from-[#232F72] to-[#2F578A] hover:from-[#1C265B] hover:to-[#244774] text-white font-bold text-sm tracking-wide transition-all duration-300 shadow-md shadow-[#232F72]/20 hover:shadow-lg hover:shadow-[#232F72]/30 active:scale-95 shrink-0"
                  >
                    Search
                  </button>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-4 text-[11px] text-gray-400 font-medium">
                  <span className="font-bold text-gray-500">Popular:</span>
                  <Link href="/search?q=Solar%20Panel" className="hover:text-jungle-green-600 hover:underline transition-colors">Solar Panels</Link>
                  <span className="opacity-30">•</span>
                  <Link href="/search?q=Steel" className="hover:text-jungle-green-600 hover:underline transition-colors">TMT Steel</Link>
                  <span className="opacity-30">•</span>
                  <Link href="/search?q=Yarn" className="hover:text-jungle-green-600 hover:underline transition-colors">Cotton Yarn</Link>
                  <span className="opacity-30">•</span>
                  <Link href="/search?q=Pump" className="hover:text-jungle-green-600 hover:underline transition-colors">Hydraulic Pumps</Link>
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
                    <div className="absolute inset-0 z-0 bg-[#090b11] overflow-hidden">
                      <AnimatePresence>
                        <motion.img
                          key={eventIndex}
                          initial={{ opacity: 0, scale: 1.05 }}
                          animate={{ opacity: 0.75, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, ease: "easeInOut" }}
                          src={events[eventIndex].mediaUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800"}
                          alt={events[eventIndex].title}
                          className="absolute inset-0 w-full h-full object-cover group-hover/carousel:scale-[1.03] transition-transform duration-[6000ms]"
                        />
                      </AnimatePresence>
                      {/* Gradient to ensure text readability on the left */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#090b11] via-[#090b11]/80 to-transparent w-full md:w-[70%] pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090b11]/60 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Content Container (Left Aligned) */}
                    <div className="relative z-10 flex h-full items-center px-12 md:px-20 w-full md:w-3/4 group/content">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={eventIndex}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 30 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="flex flex-col w-full text-left"
                        >
                          {/* Top Info (Logo/Name + Date) */}
                          <div className="flex items-center gap-5 mb-6">
                            <div className="flex flex-col items-end">
                              <span className="text-white font-bold text-sm md:text-base leading-tight tracking-wide flex items-center gap-1.5">
                                <FaIndustry className="h-4 w-4 opacity-80" /> Jaxmart
                              </span>
                              <span className="text-white font-semibold text-xs md:text-sm tracking-widest mt-0.5">Exhibitions</span>
                            </div>
                            <div className="w-[1.5px] h-10 bg-white/40" />
                            <div className="flex flex-col text-white font-semibold text-sm md:text-base">
                              <span>{new Date(events[eventIndex].date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                              <span className="flex items-center gap-1.5 text-white/90 text-xs md:text-sm mt-0.5">
                                <FaLocationDot className="h-3 w-3 text-red-400" /> {events[eventIndex].location || "Online"}
                              </span>
                            </div>
                          </div>

                          {/* Main Title */}
                          <h2 className="text-3xl md:text-[2.75rem] font-black text-white leading-tight uppercase tracking-tight mb-5 max-w-3xl drop-shadow-lg">
                            {events[eventIndex].title}
                          </h2>

                          {/* Description */}
                          <p className="text-sm md:text-lg text-white/90 leading-relaxed font-medium max-w-xl mb-8 drop-shadow-md">
                            {events[eventIndex].description}
                          </p>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center gap-4">
                            <button className="h-12 px-10 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-sm md:text-base rounded transition-all duration-300 shadow-[0_4px_14px_0_rgba(239,68,68,0.39)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.23)] hover:-translate-y-0.5">
                              Register Now
                            </button>
                            <button className="h-12 px-10 bg-white hover:bg-gray-100 text-gray-900 font-bold text-sm md:text-base rounded transition-all duration-300 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5">
                              Show Info
                            </button>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Coming Soon Badge (Top Right) */}
                    <div className="absolute top-0 right-10 z-20 bg-[#111111]/90 backdrop-blur-md px-6 py-2.5 rounded-b-xl shadow-2xl">
                      <span className="text-white/90 text-xs md:text-sm font-semibold tracking-wide">Show Coming Soon</span>
                    </div>

                    {/* Prev/Next Navigation Controls */}
                    <button
                      onClick={() => setEventIndex((prev) => (prev - 1 + events.length) % events.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/20 backdrop-blur-md text-white/70 flex items-center justify-center hover:bg-black/40 hover:text-white transition-all duration-300 hover:scale-110"
                      aria-label="Previous event"
                    >
                      <FaChevronLeft className="h-5 w-5 ml-0.5" />
                    </button>
                    <button
                      onClick={() => setEventIndex((prev) => (prev + 1) % events.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/20 backdrop-blur-md text-white/70 flex items-center justify-center hover:bg-black/40 hover:text-white transition-all duration-300 hover:scale-110"
                      aria-label="Next event"
                    >
                      <FaChevronRight className="h-5 w-5 mr-0.5" />
                    </button>

                    {/* Footer Dot Indicators */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                      {events.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setEventIndex(idx)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${idx === eventIndex
                            ? 'w-4 bg-[#36ADA3]'
                            : 'w-1.5 bg-[#2a3835] hover:bg-[#36ADA3]/50'
                            }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* Removed Fast RFQ Form Block from here (Moved to left column) */}

          </div>
        </Container>
      </section>

      {/* AI Smart Sourcing Banner */}
      <section className="bg-white py-16 border-b border-gray-100 relative z-20">
        {/* Abstract background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#36ADA3]/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-[#232F72]/5 rounded-full blur-3xl" />
        </div>

        <Container size="xl" className="relative z-10">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <h2 className="text-[28px] md:text-4xl font-black text-gray-900 mb-8 text-center tracking-tight leading-tight">
              All tasks in one ask, <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#36ADA3] to-[#232F72]">smart sourcing with AI</span>
            </h2>

            <form onSubmit={(e) => { e.preventDefault(); handleAiSubmit(); }} className="w-full relative group">
              {/* Outer border container with glowing effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#36ADA3] to-[#232F72] rounded-[28px] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white rounded-[24px] border border-gray-200/50 shadow-2xl flex flex-col w-full min-h-[160px] overflow-hidden focus-within:ring-4 focus-within:ring-[#36ADA3]/10 transition-all duration-300">

                {/* Subtle top inner shadow */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-50/50 to-transparent pointer-events-none" />

                <textarea
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.keyCode === 13) && !e.shiftKey) {
                      e.preventDefault();
                      handleAiSubmit();
                    }
                  }}
                  placeholder="Describe your sourcing needs in detail (e.g. 'Find verified suppliers of high-grade aluminum in Pune')..."
                  className="flex-1 w-full bg-transparent border-none outline-none text-lg text-gray-700 placeholder-gray-400 font-medium resize-none p-6 pb-20 leading-relaxed"
                />

                <div className="absolute bottom-5 left-6 flex items-center gap-2">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                  <button type="button" onClick={() => setShowImagePopover(!showImagePopover)} className="h-10 w-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#36ADA3] hover:border-[#36ADA3]/30 hover:bg-[#36ADA3]/5 transition-all duration-300 shadow-sm" title="Search by Image">
                    <FaCamera className="h-4 w-4" />
                  </button>
                </div>

                <div className="absolute bottom-5 right-6 flex items-center">
                  <button
                    type="submit"
                    className="h-12 w-12 rounded-full bg-gradient-to-r from-[#232F72] to-[#2F578A] flex items-center justify-center text-white hover:shadow-lg hover:shadow-[#232F72]/30 active:scale-95 transition-all duration-300 group/submit">
                    <FaArrowRight className="h-5 w-5 transform group-hover/submit:translate-x-0.5 transition-transform" />
                  </button>
                </div>

              </div>

              {/* Image Search Popover */}
              {showImagePopover && (
                <div className="absolute top-[calc(100%+16px)] left-0 right-0 bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-200 z-50 p-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[15px] font-black text-gray-800 tracking-tight">Find product inspiration with Image Search</h3>
                    <button type="button" onClick={() => setShowImagePopover(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                      <FaXmark className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 hover:border-[#36ADA3]/50 transition-colors group/upload cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <FaUpload className="h-8 w-8 text-gray-400 group-hover/upload:text-[#36ADA3] mb-4 transition-colors" />
                    <p className="text-[13px] text-gray-600 mb-2 font-medium text-center flex items-center gap-1.5">
                      Paste an image you copied with
                      <kbd className="px-1.5 py-0.5 border border-gray-300 bg-white rounded text-[11px] font-mono shadow-sm font-bold text-gray-600">Ctrl</kbd>
                      <kbd className="px-1.5 py-0.5 border border-gray-300 bg-white rounded text-[11px] font-mono shadow-sm font-bold text-gray-600">V</kbd>
                    </p>
                    <p className="text-[13px] text-gray-500 mb-6 font-medium text-center">Drag and drop an image here or upload a file</p>

                    <button type="button" className="bg-gradient-to-r from-[#232F72] to-[#2F578A] hover:from-[#1C265B] hover:to-[#244774] text-white font-bold px-8 py-2.5 rounded-full shadow-lg shadow-[#232F72]/20 hover:shadow-[#232F72]/30 transition-all active:scale-95">
                      Upload
                    </button>
                  </div>

                  <div className="mt-4 bg-gradient-to-r from-[#ff6a00]/5 to-transparent rounded-xl p-4 flex items-center justify-between border border-[#ff6a00]/10">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <FaCamera className="h-4 w-4 text-[#ff6a00]" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-900 mb-0.5">JaxMart Lens</p>
                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed">Screenshot an image to search for similar items with lower prices and flexible customization</p>
                      </div>
                    </div>
                    <button type="button" className="text-xs font-bold text-gray-800 underline hover:text-[#ff6a00] transition-colors shrink-0">
                      Add to Chrome
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </Container>
      </section>

      {/* Main Home Content */}
      <Container size="xl" className="py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-12 order-1">

            {/* 1. Hot Products Section */}
            <section>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <FaFire className="h-4 w-4" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                      Premium Bulk Listings
                    </h2>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Top trending manufactured products ready for wholesale orders</p>
                </div>
                <Link href="/search" className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 bg-gray-50 rounded-full hover:bg-gray-100 hover:text-gray-900 transition-all group">
                  Browse All
                  <span className="bg-white rounded-full p-1 shadow-sm group-hover:shadow flex items-center justify-center group-hover:bg-jungle-green-500 group-hover:text-white transition-colors">
                    <FaArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {featuredLoading ? (
                  Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)
                ) : (
                  featured?.listings?.slice(0, 12).map((item: any) => (
                    <Link key={item.id} href={`/listings/${item.id}`} className="group block h-full outline-none">
                      <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-jungle-green-200/60 transition-all duration-500 h-full flex flex-col group-focus-visible:ring-2 group-focus-visible:ring-jungle-green-500 relative">

                        {/* Image Container with smooth zoom */}
                        <div className="aspect-square bg-gray-50 overflow-hidden relative">
                          {item.media?.[0] ? (
                            <img
                              src={item.media[0].url}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                              alt={item.title}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100/50">
                              <FaIndustry className="h-12 w-12" />
                            </div>
                          )}

                          {/* Soft inner shadow overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                            <span className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-lg shadow-blue-500/30 flex items-center gap-1.5">
                              <MdVerified className="h-3 w-3 shrink-0" />
                              Verified
                            </span>
                            {item.isFeatured && (
                              <span className="bg-gradient-to-r from-gray-900 to-gray-800 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-lg shadow-black/20 flex items-center gap-1.5">
                                <FaFire className="h-3 w-3 text-amber-400 shrink-0" />
                                Hot
                              </span>
                            )}
                          </div>

                          {/* Trust Score Glassmorphism */}
                          {item.seller?.trustScore && (
                            <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-md border border-white/50 px-2 py-1 rounded-lg text-[10px] font-black text-gray-800 shadow-lg z-10">
                              Trust: <span className="text-jungle-green-600">{item.seller.trustScore}%</span>
                            </div>
                          )}
                        </div>

                        {/* Content Area */}
                        <div className="p-4 flex-1 flex flex-col relative bg-white">
                          <span className="text-[10px] font-extrabold text-jungle-green-600 uppercase tracking-widest block mb-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            {item.category?.name}
                          </span>
                          <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug mb-3 group-hover:text-jungle-green-600 transition-colors">
                            {item.title}
                          </h3>

                          <div className="mt-auto">
                            <div className="flex items-end gap-1">
                              <span className="text-lg font-black text-gray-900 tracking-tight">
                                {item.productDetail?.pricePerUnit ? `₹${item.productDetail.pricePerUnit.toLocaleString('en-IN')}` : 'Get Price'}
                              </span>
                              {item.productDetail?.pricePerUnit && (
                                <span className="text-[11px] text-gray-400 font-medium mb-1">/{item.productDetail?.unitOfMeasure || 'Pc'}</span>
                              )}
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
                              <p className="text-[11px] text-gray-500 font-medium">
                                Min: <strong className="text-gray-700">{item.productDetail?.minOrderQty || 1} {item.productDetail?.unitOfMeasure || 'Pcs'}</strong>
                              </p>
                              <div className="flex items-center gap-1 bg-blue-50/50 px-1.5 py-0.5 rounded text-[10px] text-blue-700 font-bold max-w-[50%] truncate">
                                <MdVerified className="h-3 w-3 shrink-0" />
                                <span className="truncate">{item.seller?.businessProfile?.businessName || item.seller?.fullName}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Full Width Content Area */}
          <div className="lg:col-span-12 space-y-12 order-3">

            {/* 1.5. Dual Showcase: Side-by-Side New Products & Most Popular */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              {/* New Products Showcase Card */}
              <section className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">New Products</h2>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">Explore the hottest releases in the past two weeks</p>
                  </div>
                  <Link href="/new-products" className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-gray-700 hover:text-jungle-green-600 bg-gray-100/80 hover:bg-jungle-green-50 rounded-full border border-gray-200/80 hover:border-jungle-green-200 transition-all duration-200 shrink-0 ml-2 shadow-sm group/seeall">
                    <span>See All</span>
                    <FaChevronRight className="w-2.5 h-2.5 text-gray-500 group-hover/seeall:text-jungle-green-600 group-hover/seeall:translate-x-0.5 transition-all duration-200" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {newProductsLoading ? (
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <Skeleton className="w-full aspect-square rounded-xl" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-2.5 w-3/4" />
                        <Skeleton className="h-2.5 w-full" />
                      </div>
                    ))
                  ) : (
                    newProducts.slice(0, 4).map((product: any) => (
                      <Link key={product.id} href={`/listings/${product.id}`} className="group flex flex-col">
                        <div className="w-full aspect-square bg-gray-50/80 rounded-xl border border-gray-100 overflow-hidden relative flex items-center justify-center p-2 mb-2 group-hover:border-gray-200 transition-colors">
                          {product.media?.[0]?.url ? (
                            <img
                              src={product.media[0].url}
                              alt={product.title}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <FaBoxesStacked className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="font-bold text-gray-900 text-xs sm:text-sm mb-0.5">
                          {product.productDetail?.pricePerUnit ? `₹${product.productDetail.pricePerUnit.toLocaleString('en-IN')}` : 'Get Price'}
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-1 font-medium truncate">
                          Min. Order: {product.productDetail?.minOrderQty || 1} {product.productDetail?.unitOfMeasure || 'Pieces'}
                        </div>
                        <h3 className="text-[10px] sm:text-xs text-gray-700 line-clamp-2 leading-tight group-hover:text-jungle-green-600 transition-colors">
                          {product.title}
                        </h3>
                      </Link>
                    ))
                  )}
                </div>
              </section>

              {/* Most Popular Showcase Card */}
              <section className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Most Popular</h2>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">Trending B2B wholesale products: bulk deals from suppliers</p>
                  </div>
                  <Link href="/most-popular" className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-gray-700 hover:text-jungle-green-600 bg-gray-100/80 hover:bg-jungle-green-50 rounded-full border border-gray-200/80 hover:border-jungle-green-200 transition-all duration-200 shrink-0 ml-2 shadow-sm group/seeall">
                    <span>See All</span>
                    <FaChevronRight className="w-2.5 h-2.5 text-gray-500 group-hover/seeall:text-jungle-green-600 group-hover/seeall:translate-x-0.5 transition-all duration-200" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {featuredLoading ? (
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <Skeleton className="w-full aspect-square rounded-xl" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-2.5 w-3/4" />
                      </div>
                    ))
                  ) : (
                    featured?.listings?.slice(0, 4).map((item: any, idx: number) => {
                      const ribbonBg =
                        idx === 0 ? "bg-red-500 text-white" :
                          idx === 1 ? "bg-amber-400 text-amber-950 font-black" :
                            idx === 2 ? "bg-slate-300 text-slate-800" :
                              "bg-sky-200 text-sky-900";

                      return (
                        <Link key={item.id} href={`/listings/${item.id}`} className="group flex flex-col">
                          <div className="w-full aspect-square bg-gray-50/80 rounded-xl border border-gray-100 overflow-hidden relative flex items-center justify-center p-2 mb-2 group-hover:border-gray-200 transition-colors">
                            {/* Vertical Notched Ribbon Badge */}
                            <div
                              className={`absolute top-0 left-2 w-5 sm:w-6 h-7 sm:h-8 flex items-center justify-center font-extrabold text-[10px] sm:text-xs shadow-sm z-10 pt-0.5 ${ribbonBg}`}
                              style={{
                                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)'
                              }}
                            >
                              {idx + 1}
                            </div>
                            {item.media?.[0]?.url ? (
                              <img
                                src={item.media[0].url}
                                alt={item.title}
                                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <FaFire className="h-8 w-8" />
                              </div>
                            )}
                          </div>

                          {/* Line 1: Title (2 lines clamp) */}
                          <h3 className="text-[10px] sm:text-xs text-gray-800 font-medium line-clamp-2 leading-tight group-hover:text-jungle-green-600 transition-colors mb-1 min-h-[28px]">
                            {item.title}
                          </h3>

                          {/* Line 2: Price (Bold) */}
                          <div className="font-bold text-gray-900 text-xs sm:text-sm mb-0.5">
                            {item.productDetail?.pricePerUnit ? `₹${item.productDetail.pricePerUnit.toLocaleString('en-IN')}` : 'Get Price'}
                          </div>

                          {/* Line 3: Min Order */}
                          <div className="text-[10px] sm:text-xs text-gray-500 font-medium truncate">
                            Min. Order: {item.productDetail?.minOrderQty || 1} {item.productDetail?.unitOfMeasure || 'Pieces'}
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </section>
            </div>

            {/* 1.6. Triple Showcase: Analyst's Choice, Low MOQ, OEM Products */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

              {/* Analyst's Choice */}
              <section className="bg-white rounded-2xl border border-gray-200/80 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 line-clamp-1">Analyst's Choice</h2>
                    <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">Discover products handpicked by experts</p>
                  </div>
                  <Link href="/analysts-choice" className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold text-gray-700 hover:text-jungle-green-600 bg-gray-100/80 hover:bg-jungle-green-50 rounded-full border border-gray-200/80 hover:border-jungle-green-200 transition-all duration-200 shrink-0 ml-2 shadow-sm group/seeall">
                    <span>See All</span>
                    <FaChevronRight className="w-2 h-2 text-gray-500 group-hover/seeall:text-jungle-green-600 group-hover/seeall:translate-x-0.5 transition-all duration-200" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  {analystChoiceProducts.map((item: any) => (
                    <Link key={`ac-${item.id}`} href={`/listings/${item.id}`} className="group block">
                      <div className="w-[132px] max-w-full h-[137px] bg-gray-50/80 rounded-xl overflow-hidden border border-gray-100 mb-1.5 relative flex items-center justify-center p-2 mx-auto">
                        {item.media?.[0]?.url ? (
                          <img src={item.media[0].url} alt={item.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <FaStar className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-gray-900 text-[10px] truncate text-center">
                        {item.productDetail?.pricePerUnit ? `₹${item.productDetail.pricePerUnit.toLocaleString('en-IN')}` : 'Get Price'}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Low MOQ */}
              <section className="bg-white rounded-2xl border border-gray-200/80 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 line-clamp-1">Low MOQ</h2>
                    <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">Small quantities for customization</p>
                  </div>
                  <Link href="/low-moq" className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold text-gray-700 hover:text-jungle-green-600 bg-gray-100/80 hover:bg-jungle-green-50 rounded-full border border-gray-200/80 hover:border-jungle-green-200 transition-all duration-200 shrink-0 ml-2 shadow-sm group/seeall">
                    <span>See All</span>
                    <FaChevronRight className="w-2 h-2 text-gray-500 group-hover/seeall:text-jungle-green-600 group-hover/seeall:translate-x-0.5 transition-all duration-200" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  {lowMoqProducts.map((item: any) => (
                    <Link key={`lm-${item.id}`} href={`/listings/${item.id}`} className="group block">
                      <div className="w-[132px] max-w-full h-[137px] bg-gray-50/80 rounded-xl overflow-hidden border border-gray-100 mb-1.5 relative flex items-center justify-center p-2 mx-auto">
                        {item.media?.[0]?.url ? (
                          <img src={item.media[0].url} alt={item.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <FaBoxesStacked className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-gray-900 text-[10px] truncate text-center">
                        {item.productDetail?.pricePerUnit ? `₹${item.productDetail.pricePerUnit.toLocaleString('en-IN')}` : 'Get Price'}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* OEM Products */}
              <section className="bg-white rounded-2xl border border-gray-200/80 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 line-clamp-1">OEM Products</h2>
                    <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">Cut production for cost savings.</p>
                  </div>
                  <Link href="/oem" className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold text-gray-700 hover:text-jungle-green-600 bg-gray-100/80 hover:bg-jungle-green-50 rounded-full border border-gray-200/80 hover:border-jungle-green-200 transition-all duration-200 shrink-0 ml-2 shadow-sm group/seeall">
                    <span>See All</span>
                    <FaChevronRight className="w-2 h-2 text-gray-500 group-hover/seeall:text-jungle-green-600 group-hover/seeall:translate-x-0.5 transition-all duration-200" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  {oemProducts.map((item: any) => (
                    <Link key={`oem-${item.id}`} href={`/listings/${item.id}`} className="group block">
                      <div className="w-[132px] max-w-full h-[137px] bg-gray-50/80 rounded-xl overflow-hidden border border-gray-100 mb-1.5 relative flex items-center justify-center p-2 mx-auto">
                        {item.media?.[0]?.url ? (
                          <img src={item.media[0].url} alt={item.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <FaIndustry className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-gray-900 text-[10px] truncate text-center">
                        {item.productDetail?.pricePerUnit ? `₹${item.productDetail.pricePerUnit.toLocaleString('en-IN')}` : 'Get Price'}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

            </div>

            {/* 2. Industry Showcase (Categories Display) */}
            <section className="relative bg-white rounded-3xl p-8 border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#232F72] via-jungle-green-400 to-[#232F72] opacity-20" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-jungle-green-100/50 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-end justify-between mb-8 relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                    Browse Markets & Industries
                    <div className="h-2 w-2 rounded-full bg-jungle-green-500 animate-pulse" />
                  </h2>
                  <p className="text-sm text-gray-500 mt-2 font-medium">Discover millions of products from trusted global suppliers</p>
                </div>
                <Link href="/categories" className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 bg-gray-50 rounded-full hover:bg-gray-100 hover:text-gray-900 transition-all group">
                  View All
                  <span className="bg-white rounded-full p-1 shadow-sm group-hover:shadow flex items-center justify-center group-hover:bg-jungle-green-500 group-hover:text-white transition-colors">
                    <FaArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 relative z-10">
                {catsLoading ? (
                  Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
                ) : (
                  categories.map((cat: any) => {
                    const Icon = CATEGORY_ICONS[cat.slug] || FaCubes;
                    return (
                      <Link key={cat.id} href={`/search?category=${cat.id}`} className="group block outline-none">
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-5 hover:border-jungle-green-200/60 hover:shadow-[0_12px_40px_-12px_rgba(54,173,163,0.2)] transition-all duration-400 ease-out relative overflow-hidden group-focus-visible:ring-2 group-focus-visible:ring-jungle-green-500">

                          {/* Soft hover gradient background */}
                          <div className="absolute inset-0 bg-gradient-to-r from-jungle-green-50/0 to-jungle-green-50/0 group-hover:from-jungle-green-50/40 group-hover:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />

                          <div className="relative h-14 w-14 rounded-2xl bg-gray-50/80 border border-gray-100/50 flex items-center justify-center text-gray-500 group-hover:bg-gradient-to-br group-hover:from-jungle-green-500 group-hover:to-jungle-green-600 group-hover:text-white group-hover:shadow-[0_8px_16px_-4px_rgba(54,173,163,0.4)] group-hover:border-transparent transition-all duration-400 ease-out transform group-hover:scale-[1.03] shrink-0">
                            <Icon className="h-6 w-6 transition-transform duration-400 group-hover:-rotate-3" />
                          </div>

                          <div className="min-w-0 flex-1 relative">
                            <p className="font-extrabold text-[15px] text-gray-800 group-hover:text-gray-900 transition-colors truncate mb-1">
                              {cat.name}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-jungle-green-600 transition-colors">
                              <span>Source Now</span>
                              <FaArrowRight className="h-2.5 w-2.5 transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-400 ease-out" />
                            </div>
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
                <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
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
                    <div className="col-span-full bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400">
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

          </div>

          {/* Right Sidebar Widgets */}
          <div className="lg:col-span-3 space-y-6 order-2">

            {/* Trust and Safety Banner */}
            <div className="bg-white rounded-3xl border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 relative overflow-hidden group/banner transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-blue-100">
              {/* Decorative Background Glows */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover/banner:bg-blue-500/20 transition-colors duration-700 pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 text-blue-600 flex items-center justify-center shadow-inner group-hover/banner:scale-110 transition-transform duration-500">
                  <FaBuildingShield className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                  JaxMart Escrow
                </h3>
              </div>

              <div className="space-y-6 relative z-10">
                {[
                  {
                    title: 'Secure Payments',
                    desc: 'Funds held in escrow, protecting you from fraud.',
                    icon: <FaShieldHalved className="h-3.5 w-3.5" />
                  },
                  {
                    title: 'Verified Shipping',
                    desc: 'GSTIN & carrier logistics verified before release.',
                    icon: <FaTruckFast className="h-3.5 w-3.5" />
                  },
                  {
                    title: 'Inspection Guarantee',
                    desc: 'Payments released only after cargo quality check.',
                    icon: <FaCircleCheck className="h-3.5 w-3.5" />
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="relative mt-0.5 shrink-0">
                      <div className="h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
                        {item.icon}
                      </div>
                      {i !== 2 && (
                        <div className="absolute top-7 left-1/2 -translate-x-1/2 w-px h-6 bg-gray-100 group-hover:bg-blue-100 transition-colors" />
                      )}
                    </div>
                    <div className="min-w-0 pb-1">
                      <p className="text-xs font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{item.title}</p>
                      <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Factories Showcase */}
            <div className="bg-white rounded-3xl border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-2xl bg-jungle-green-50 border border-jungle-green-100/50 text-jungle-green-600 flex items-center justify-center shadow-inner">
                  <FaHandshake className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                  Top Factories
                </h3>
              </div>

              <div className="space-y-5">
                {[
                  { name: "Vardhman Textiles Ltd", city: "Ludhiana", category: "Textiles", year: 1998, icon: FaBoxesStacked },
                  { name: "Apex Industries", city: "Mumbai", category: "Industrial", year: 2004, icon: FaIndustry },
                  { name: "Swastik Chemicals", city: "Ahmedabad", category: "Chemicals", year: 2011, icon: FaFire }
                ].map((fac, idx) => {
                  const Icon = fac.icon;
                  return (
                    <div key={idx} className="group flex items-center gap-4 cursor-pointer">
                      <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100/80 text-gray-400 group-hover:bg-jungle-green-500 group-hover:text-white group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-jungle-green-500/30 transition-all duration-300 shrink-0 transform group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1 border-b border-gray-50 pb-4 group-last:border-0 group-last:pb-0">
                        <p className="text-sm font-extrabold text-gray-800 group-hover:text-jungle-green-600 transition-colors truncate">{fac.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-block text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-black uppercase tracking-wider group-hover:bg-jungle-green-50 group-hover:text-jungle-green-600 transition-colors">
                            {fac.category}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium truncate">
                            {fac.city} • Est. {fac.year}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <button className="w-full mt-5 py-2.5 rounded-xl border-2 border-gray-100 text-xs font-bold text-gray-600 hover:border-jungle-green-500 hover:text-jungle-green-600 transition-colors flex items-center justify-center gap-2">
                View Factory Directory <FaArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Direct Manufacturer Link Button */}
            <div className="bg-gradient-to-br from-[#232F72] to-[#2F578A] text-white rounded-xl p-5 shadow-sm">
              <h4 className="font-bold text-sm mb-1 text-white">Join as a Wholesale Supplier</h4>
              <p className="text-[11px] text-white/90 leading-relaxed mb-4">
                List your products, register your GSTIN, and quote on thousands of active RFQ requests.
              </p>
              <Link href={showAuth ? "/seller/dashboard" : "/auth/login"}>
                <button className="w-full h-9 bg-white text-[#232F72] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                  Register Factory Center
                </button>
              </Link>
            </div>

          </div>

        </div>
      </Container>

      {/* Floating Side Menu */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.06)] rounded-l-lg py-5 px-3 flex flex-col gap-5 items-center border border-gray-100 border-r-0">

        <div className="relative group">
          <button onClick={() => window.open('/exhibit', '_blank')} className="text-gray-700 hover:text-[#E31837] transition-colors p-1" aria-label="Booth Application">
            <ShoppingBag className="w-[22px] h-[22px] stroke-[2]" />
          </button>
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 px-3.5 py-2 bg-white text-gray-700 text-[13px] rounded shadow-[0_2px_15px_rgba(0,0,0,0.08)] border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
            Booth Application
            <div className="absolute top-1/2 -translate-y-1/2 -right-[5px] w-2.5 h-2.5 bg-white border-t border-r border-gray-100 rotate-45"></div>
          </div>
        </div>

        <div className="relative group">
          <button onClick={() => setIsFeedbackOpen(true)} className="text-gray-700 hover:text-[#E31837] transition-colors p-1" aria-label="Help & Support">
            <MessageCircleQuestion className="w-[22px] h-[22px] stroke-[2]" />
          </button>
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 px-3.5 py-2 bg-white text-gray-700 text-[13px] rounded shadow-[0_2px_15px_rgba(0,0,0,0.08)] border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
            Leave us Feedback
            <div className="absolute top-1/2 -translate-y-1/2 -right-[5px] w-2.5 h-2.5 bg-white border-t border-r border-gray-100 rotate-45"></div>
          </div>
        </div>

        <div className="relative group">
          <button className="text-gray-700 hover:text-[#E31837] transition-colors p-1" aria-label="App">
            <MonitorSmartphone className="w-[22px] h-[22px] stroke-[2]" />
          </button>
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 px-3.5 py-2 bg-white text-gray-700 rounded shadow-[0_2px_15px_rgba(0,0,0,0.08)] border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none text-left flex flex-col gap-0.5">
            <span className="font-bold text-[14px] text-gray-800">Download App</span>
            <span className="text-[12px] text-gray-500 font-medium">Scan the QR code to download...</span>
            <div className="absolute top-1/2 -translate-y-1/2 -right-[5px] w-2.5 h-2.5 bg-white border-t border-r border-gray-100 rotate-45"></div>
          </div>
        </div>

        <div className="relative group">
          <button onClick={() => window.open('/survey', '_blank')} className="text-gray-700 hover:text-[#E31837] transition-colors p-1" aria-label="Requirements">
            <ClipboardCheck className="w-[22px] h-[22px] stroke-[2]" />
          </button>
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 px-3.5 py-2 bg-white text-gray-700 text-[13px] rounded shadow-[0_2px_15px_rgba(0,0,0,0.08)] border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
            Take Our Survey
            <div className="absolute top-1/2 -translate-y-1/2 -right-[5px] w-2.5 h-2.5 bg-white border-t border-r border-gray-100 rotate-45"></div>
          </div>
        </div>



      </div>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </PublicLayout>
  );
}

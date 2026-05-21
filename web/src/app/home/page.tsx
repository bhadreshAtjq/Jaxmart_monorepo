'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaMagnifyingGlass, FaStar, FaShieldHalved, FaBolt, FaBoxesStacked,
  FaArrowRight, FaIndustry, FaLaptop, FaWrench, FaCubes,
  FaGlobe, FaHandshake, FaTruckFast, FaCircleCheck, FaFire,
  FaChevronRight, FaUserCheck, FaFileContract, FaBuildingShield,
  FaEnvelope
} from 'react-icons/fa6';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button, Card, Badge, Avatar, Container, Skeleton, TrustScore } from '@/components/ui';
import { useCategories, useFeaturedListings, useRfqInbox } from '@/lib/hooks';
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

  // Quick RFQ form states
  const [rfqProduct, setRfqProduct] = useState('');
  const [rfqQuantity, setRfqQuantity] = useState('');
  const [rfqUnit, setRfqUnit] = useState('Pieces');

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
      <div className="bg-orange-50 border-b border-orange-100/50 py-2">
        <Container size="xl" className="flex items-center justify-between text-xs text-orange-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <FaFire className="h-3.5 w-3.5 text-orange-500 animate-bounce shrink-0" />
            <span className="font-bold uppercase tracking-wider text-[10px] bg-orange-200 text-orange-800 px-2 py-0.5 rounded shrink-0">LIVE B2B FEED</span>
            <span className="font-medium truncate transition-all duration-500">{LIVE_FEEDS[feedIndex]}</span>
          </div>
          <Link href="/rfq" className="hidden md:flex items-center gap-1 font-bold text-orange-600 hover:text-orange-700 whitespace-nowrap">
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
                <FaBoxesStacked className="h-4 w-4 text-orange-500" />
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
                        className="group flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-655 transition-colors font-semibold"
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                          {cat.name}
                        </span>
                        <FaChevronRight className="h-3 w-3 text-gray-300 group-hover:text-orange-500 transition-transform group-hover:translate-x-1" />
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
                      "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                      searchTab === 'products' ? "bg-orange-500 text-white" : "text-gray-500 hover:text-gray-900"
                    )}
                  >
                    Products
                  </button>
                  <button
                    onClick={() => setSearchTab('suppliers')}
                    className={clsx(
                      "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                      searchTab === 'suppliers' ? "bg-orange-500 text-white" : "text-gray-500 hover:text-gray-900"
                    )}
                  >
                    Suppliers
                  </button>
                </div>

                <div className="flex border-2 border-orange-500 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-orange-500/20 mt-2 shrink-0">
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
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <FaMagnifyingGlass className="h-3.5 w-3.5" />
                    <span>Search</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1.5 text-[10px] text-gray-400">
                  <span className="font-semibold text-gray-500">Hot Searches:</span>
                  <Link href="/search?q=Solar%20Panel" className="hover:text-orange-600 hover:underline">Solar Panels</Link>
                  <span>•</span>
                  <Link href="/search?q=Steel" className="hover:text-orange-600 hover:underline">TMT Steel</Link>
                  <span>•</span>
                  <Link href="/search?q=Yarn" className="hover:text-orange-600 hover:underline">Cotton Yarn</Link>
                  <span>•</span>
                  <Link href="/search?q=Pump" className="hover:text-orange-600 hover:underline">Hydraulic Pumps</Link>
                </div>
              </div>

              {/* Dynamic Promotional Banner */}
              <div className="flex-1 min-h-0 rounded-xl bg-gradient-to-br from-gray-900 via-orange-950 to-gray-900 border border-gray-800 shadow-sm relative overflow-hidden p-5 flex flex-col justify-between">
                {/* Abstract graphic */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-5" />
                <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  <Badge label="Verified Trade Only" className="bg-orange-500/20 text-orange-400 border-none font-bold text-[9px] mb-2" />
                  <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-tight mb-1.5">
                    Source From Indian <br />
                    <span className="text-orange-500">Verified Manufacturers</span>
                  </h1>
                  <p className="text-[11px] text-gray-300 font-normal leading-relaxed">
                    Connect directly with suppliers holding active GSTIN & PAN certifications. Pay securely via protected escrow services.
                  </p>
                </div>

                <div className="relative z-10 flex gap-4 pt-3 border-t border-white/10 mt-3 text-[10px] text-gray-400 font-medium">
                  <span className="flex items-center gap-1"><FaUserCheck className="text-orange-500 h-3 w-3" /> 100+ Manufacturers</span>
                  <span className="flex items-center gap-1"><FaShieldHalved className="text-orange-500 h-3 w-3" /> Escrow Protected</span>
                  <span className="flex items-center gap-1"><FaTruckFast className="text-orange-500 h-3 w-3" /> Pan-India Cargo</span>
                </div>
              </div>

            </div>

            {/* 3. Fast RFQ Form Block (Global Sources style) */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-between lg:h-[380px] overflow-hidden">
              <div className="flex flex-col flex-1 justify-between">
                <div className="flex items-center gap-2 mb-2.5 shrink-0">
                  <div className="h-7 w-7 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
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
                      className="w-full h-8 bg-gray-50 border border-gray-200 rounded-lg px-2.5 text-xs outline-none focus:border-orange-500 focus:bg-white transition-colors"
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
                        className="w-full h-8 bg-gray-50 border border-gray-200 rounded-lg px-2.5 text-xs outline-none focus:border-orange-500 focus:bg-white transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider">Unit</label>
                      <select
                        value={rfqUnit}
                        onChange={(e) => setRfqUnit(e.target.value)}
                        className="w-full h-8 bg-gray-50 border border-gray-200 rounded-lg px-2 text-xs outline-none focus:border-orange-500 focus:bg-white transition-colors cursor-pointer"
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
                    className="w-full h-9 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1 mt-1 shrink-0"
                  >
                    Post Request Free <FaArrowRight className="h-3 w-3" />
                  </button>
                </form>
              </div>

              <div className="border-t border-gray-100 pt-3 mt-3 bg-orange-50/40 p-2.5 rounded-lg flex items-center gap-2.5 shrink-0">
                <FaBuildingShield className="h-7 w-7 text-orange-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-orange-950 uppercase tracking-wider">Secure Trade</p>
                  <p className="text-[8px] text-orange-850 leading-tight">Escrow payments protected, 100% money back guarantee.</p>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* Main Home Content */}
      <Container size="xl" className="py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-12">
            
            {/* 1. Hot Products Section (Alibaba Grid Layout) */}
            <section>
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FaFire className="text-orange-500 h-5 w-5" />
                    Premium Bulk Listings
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Top trending manufactured products ready for wholesale orders</p>
                </div>
                <Link href="/search" className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1">
                  Browse All Products <FaArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {featuredLoading ? (
                  Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-80 rounded-lg" />)
                ) : (
                  featured?.listings?.slice(0, 12).map((item: any) => (
                    <Link key={item.id} href={`/listings/${item.id}`} className="group">
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all h-full flex flex-col">
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
                            <span className="bg-orange-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
                              Verified
                            </span>
                            {item.isFeatured && (
                              <span className="bg-gray-900 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
                                Hot
                              </span>
                            )}
                          </div>
                          {item.seller?.trustScore && (
                            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-800 shadow">
                              Trust: {item.seller.trustScore}%
                            </div>
                          )}
                        </div>

                        <div className="p-3 flex-1 flex flex-col">
                          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest block mb-1">
                            {item.category?.name}
                          </span>
                          <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug mb-2 group-hover:text-orange-600 transition-colors min-h-[2.5rem]">
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
            <section className="bg-gray-50 rounded-2xl border border-gray-200/80 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Browse Markets & Industries</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {catsLoading ? (
                  Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
                ) : (
                  categories.map((cat: any) => {
                    const Icon = CATEGORY_ICONS[cat.slug] || FaCubes;
                    return (
                      <Link key={cat.id} href={`/search?category=${cat.id}`}>
                        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-orange-200 transition-all group flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-gray-800 group-hover:text-orange-600 transition-colors truncate">
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
            {isLoggedIn && (
              <section>
                <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <FaEnvelope className="text-orange-500" />
                      Active RFQ Sourcing Requests
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">Live requests posted by buyers waiting for suppliers to quote</p>
                  </div>
                  <Link href="/rfq" className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1">
                    View Sourcing Board <FaArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rfqsLoading ? (
                    Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
                  ) : liveRfqs.length === 0 ? (
                    <div className="col-span-2 bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400">
                      No active requests right now. Be the first to post!
                    </div>
                  ) : (
                    liveRfqs.slice(0, 4).map((rfq: any) => (
                      <Link key={rfq.id} href={`/rfq/${rfq.id}`}>
                        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-orange-200 transition-all group h-full flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge status={rfq.rfqType} className="text-[9px] font-black" />
                              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                                {rfq.category?.name}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-1">
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
                            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 border-none text-white text-[10px] px-3 py-1 font-bold h-8 rounded-lg shrink-0">
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
          <div className="lg:col-span-3 space-y-6">
            
            {/* Trust and Safety Banner */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <FaShieldHalved className="text-emerald-500 h-4.5 w-4.5" /> JaxMart Escrow
              </h3>
              <div className="space-y-4">
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
                  <div key={i} className="flex items-start gap-2.5">
                    <FaCircleCheck className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-800">{item.title}</p>
                      <p className="text-[11px] text-gray-500 leading-normal mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Factories Showcase */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                <FaHandshake className="text-orange-500 h-4 w-4" />
                Featured Factories
              </h3>
              
              <div className="space-y-4">
                {[
                  { name: "Vardhman Textiles Ltd", city: "Ludhiana", category: "Textiles", year: 1998 },
                  { name: "Apex Industries", city: "Mumbai", category: "Industrial", year: 2004 },
                  { name: "Swastik Chemicals", city: "Ahmedabad", category: "Chemicals", year: 2011 }
                ].map((fac, idx) => (
                  <div key={idx} className="border-b border-gray-100 last:border-none pb-3 last:pb-0 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200 font-black text-xs text-orange-600">
                      {fac.name.substring(0,2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{fac.name}</p>
                      <p className="text-[10px] text-gray-500 font-medium">
                        {fac.city} • Est. {fac.year}
                      </p>
                      <span className="inline-block mt-1 text-[9px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-bold uppercase">
                        {fac.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Manufacturer Link Button */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-5 shadow-sm">
              <h4 className="font-bold text-sm mb-1 text-white">Join as a Wholesale Supplier</h4>
              <p className="text-[11px] text-white/90 leading-relaxed mb-4">
                List your products, register your GSTIN, and quote on thousands of active RFQ requests.
              </p>
              <Link href={isLoggedIn ? "/seller/dashboard" : "/auth/login"}>
                <button className="w-full h-9 bg-white text-orange-600 font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-orange-50 transition-colors shadow-sm">
                  Register Factory Center
                </button>
              </Link>
            </div>

          </div>

        </div>
      </Container>
    </PublicLayout>
  );
}

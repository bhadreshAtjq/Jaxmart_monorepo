'use client';
import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { 
  FaMagnifyingGlass, FaSliders, FaStar, FaLocationDot, 
  FaShieldHalved, FaCubes, FaXmark, FaBolt, FaBoxesStacked,
  FaIndustry, FaGlobe, FaChevronRight, FaList, FaTableCells,
  FaCheck, FaShip, FaClock, FaBoxOpen, FaCreditCard,
  FaChevronDown, FaChevronUp, FaLaptop, FaWrench
} from 'react-icons/fa6';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Badge, Avatar, Button, EmptyState, Card, Container, ListingCardSkeleton, TrustScore, Select } from '@/components/ui';
import { clsx } from 'clsx';
import { useListingSearch, useCategories } from '@/lib/hooks';
import Link from 'next/link';
import { motion } from 'framer-motion';

const CATEGORY_ICONS: Record<string, any> = {
  'industrial-supplies': FaIndustry,
  electronics: FaLaptop,
  construction: FaCubes,
  textiles: FaBoxesStacked,
  services: FaWrench,
};

type SortOption = 'relevance' | 'rating' | 'newest' | 'featured';

export default function SearchPage() {
  return (
    <Suspense fallback={<ListingCardSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search parameters
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [type, setType] = useState(searchParams.get('type') ?? '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category') ?? '');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [page, setPage] = useState(1);

  // Filters
  const [filters, setFilters] = useState({
    isVerified: searchParams.get('verified') === 'true',
    minTrust: searchParams.get('minTrust') ?? '',
    minRating: '',
    city: '',
  });

  // Advanced B2B parameters (handled client side or via API if supported)
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minQty, setMinQty] = useState('');
  const [selectedPort, setSelectedPort] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');

  // UI States
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Defaulting to grid as per image
  const [showThoughtProcess, setShowThoughtProcess] = useState(false);

  // Categories list
  const { data: categories = [], isLoading: catsLoading } = useCategories();

  // Synchronize category or query from URL if changed
  useEffect(() => {
    setQ(searchParams.get('q') ?? '');
    setType(searchParams.get('type') ?? '');
    setCategoryId(searchParams.get('category') ?? '');
    if (searchParams.get('verified') === 'true') {
      setFilters(f => ({ ...f, isVerified: true }));
    }
  }, [searchParams]);

  // Construct API params
  const apiParams = {
    q,
    limit: 12,
    page,
    ...(type && { type }),
    ...(categoryId && { categoryId }),
    ...(sortBy !== 'relevance' && { sortBy }),
    ...(filters.isVerified && { isVerified: 'true' }),
    ...(filters.minTrust && { minTrust: filters.minTrust }),
    ...(filters.minRating && { minRating: filters.minRating }),
    ...(filters.city && { city: filters.city }),
  };

  const { data, isLoading, isValidating: isFetching } = useListingSearch(apiParams);

  // Clean-up and helper computations
  const listingsRaw = data?.listings ?? [];
  const totalRaw = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.pages ?? 1;

  // Apply client-side advanced B2B filters (like price range, min order quantity, port, payment terms)
  const listings = listingsRaw.filter((l: any) => {
    const pd = l.productDetail;
    if (!pd) return true; // Keep service listings unfiltered by product specs

    // Price range filter
    if (minPrice && pd.pricePerUnit && pd.pricePerUnit < parseFloat(minPrice)) return false;
    if (maxPrice && pd.pricePerUnit && pd.pricePerUnit > parseFloat(maxPrice)) return false;

    // Minimum Order Quantity filter
    if (minQty && pd.minOrderQty && pd.minOrderQty > parseInt(minQty)) return false;

    // Port filter
    if (selectedPort && pd.fobPort && !pd.fobPort.toLowerCase().includes(selectedPort.toLowerCase())) return false;

    // Payment terms filter
    if (selectedPayment && pd.paymentTerms && !pd.paymentTerms.toLowerCase().includes(selectedPayment.toLowerCase())) return false;

    return true;
  });

  const total = listings.length === listingsRaw.length ? totalRaw : listings.length;
  const activeFilterCount = 
    (filters.isVerified ? 1 : 0) + 
    (filters.minTrust ? 1 : 0) + 
    (filters.minRating ? 1 : 0) + 
    (filters.city ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    (minQty ? 1 : 0) +
    (selectedPort ? 1 : 0) +
    (selectedPayment ? 1 : 0);

  const resetAllFilters = () => {
    setFilters({ isVerified: false, minTrust: '', minRating: '', city: '' });
    setMinPrice('');
    setMaxPrice('');
    setMinQty('');
    setSelectedPort('');
    setSelectedPayment('');
    setCategoryId('');
    setType('');
  };

  return (
    <PublicLayout>
      <div className="flex flex-col lg:flex-row w-full max-w-[1920px] mx-auto min-h-[calc(100vh-64px)] items-stretch">
        
        {/* 1. Left B2B Sidebar Filters (Full Height Connected) */}
        <aside className={clsx(
          'lg:w-[280px] shrink-0 border-r border-gray-200 bg-gray-50 lg:sticky lg:top-[64px] lg:h-[calc(100vh-64px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] z-40', 
          !showFilters && 'hidden lg:block'
        )}>
          <div className="p-5 space-y-6">
            
            {/* Markets & Industries Card (Matches Image 2) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-4 font-black text-xs uppercase tracking-widest flex items-center gap-3 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                <FaBoxesStacked className="h-4 w-4 text-jungle-green-400 relative z-10" />
                <span className="relative z-10">Markets & Industries</span>
              </div>
              <div className="divide-y divide-gray-50/50 py-2">
                <button
                  onClick={() => setCategoryId('')}
                  className={clsx(
                    "w-full flex items-center justify-between px-5 py-3 text-sm transition-all duration-300 font-bold group",
                    categoryId === '' ? "text-jungle-green-600 bg-jungle-green-50/50" : "text-gray-600 hover:bg-gradient-to-r hover:from-jungle-green-50/50 hover:to-transparent hover:text-jungle-green-700"
                  )}
                >
                  <span className="flex items-center gap-3.5 transform group-hover:translate-x-1 transition-transform duration-300">
                    <div className={clsx(
                      "h-7 w-7 rounded-lg flex items-center justify-center transition-colors border",
                      categoryId === '' ? "bg-jungle-green-100/50 text-jungle-green-600 border-transparent" : "bg-gray-50 border-gray-100/50 group-hover:bg-jungle-green-100/50 group-hover:text-jungle-green-600 group-hover:border-transparent"
                    )}>
                      <FaGlobe className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                    </div>
                    All Categories
                  </span>
                  <FaChevronRight className="h-3 w-3 text-gray-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </button>
                {categories.map((cat: any) => {
                  const Icon = CATEGORY_ICONS[cat.slug] || FaCubes;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
                      className={clsx(
                        "w-full flex items-center justify-between px-5 py-3 text-sm transition-all duration-300 font-bold group",
                        categoryId === cat.id ? "text-jungle-green-600 bg-jungle-green-50/50" : "text-gray-600 hover:bg-gradient-to-r hover:from-jungle-green-50/50 hover:to-transparent hover:text-jungle-green-700"
                      )}
                    >
                      <span className="flex items-center gap-3.5 transform group-hover:translate-x-1 transition-transform duration-300">
                        <div className={clsx(
                          "h-7 w-7 rounded-lg flex items-center justify-center transition-colors border",
                          categoryId === cat.id ? "bg-jungle-green-100/50 text-jungle-green-600 border-transparent" : "bg-gray-50 border-gray-100/50 group-hover:bg-jungle-green-100/50 group-hover:text-jungle-green-600 group-hover:border-transparent"
                        )}>
                          <Icon className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                        </div>
                        {cat.name}
                      </span>
                      <FaChevronRight className="h-3 w-3 text-gray-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Other Filters Header */}
            <div className="flex items-center justify-between pb-2">
              <h3 className="font-black text-xs text-gray-800 uppercase tracking-widest flex items-center gap-2">
                <FaSliders className="h-3.5 w-3.5 text-jungle-green-500" />
                Refine Search
              </h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="text-[10px] text-jungle-green-600 font-bold uppercase tracking-wider hover:underline"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Verification & Trust */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-jungle-green-200 transition-colors">
                <input
                  type="checkbox"
                  checked={filters.isVerified}
                  onChange={(e) => setFilters(f => ({ ...f, isVerified: e.target.checked }))}
                  className="accent-jungle-green-500 w-4 h-4 rounded"
                />
                <div>
                  <span className="block text-xs font-bold text-gray-800 group-hover:text-jungle-green-600 transition-colors">
                    Verified Supplier
                  </span>
                  <span className="block text-[10px] text-gray-400 font-medium mt-0.5">GSTIN & PAN Audited</span>
                </div>
              </label>

              <Select
                label="Min Trust Score"
                value={filters.minTrust || 'ALL'}
                onChange={(e) => setFilters(f => ({ ...f, minTrust: e.target.value === 'ALL' ? '' : e.target.value }))}
                options={[
                  { value: 'ALL', label: 'Any Trust Level', description: 'Show all suppliers' },
                  { value: '90', label: '90% + Trust (Top tier)', description: 'Premium verified suppliers with highest trust' },
                  { value: '80', label: '80% + Trust (Verified)', description: 'Standard verified suppliers' }
                ]}
              />
            </div>

            {/* B2B Price Range Filter */}
            <div className="pt-4 border-t border-gray-200/60">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">Price (INR)</p>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full h-10 bg-white border border-gray-200 text-gray-800 rounded-xl px-3 text-xs outline-none focus:border-jungle-green-400 text-center placeholder:text-gray-300 shadow-sm"
                />
                <span className="text-gray-400 text-xs font-bold">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full h-10 bg-white border border-gray-200 text-gray-800 rounded-xl px-3 text-xs outline-none focus:border-jungle-green-400 text-center placeholder:text-gray-300 shadow-sm"
                />
              </div>
            </div>

            {/* Min Order Qty */}
            <div className="pt-4 border-t border-gray-200/60">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Max Min. Order Qty</p>
              <input
                type="number"
                placeholder="e.g. 50"
                value={minQty}
                onChange={(e) => setMinQty(e.target.value)}
                className="w-full h-10 bg-white border border-gray-200 text-gray-800 rounded-xl px-3 text-xs outline-none focus:border-jungle-green-400 transition-colors placeholder:text-gray-300 shadow-sm"
              />
            </div>

            {/* Loading FOB Ports Selector */}
            <div className="pt-4 border-t border-gray-200/60">
              <Select
                label="FOB Loading Port"
                value={selectedPort || 'ALL'}
                onChange={(e) => setSelectedPort(e.target.value === 'ALL' ? '' : e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Ports', description: 'Any available loading port' },
                  { value: 'Mundra', label: 'Mundra Port', description: 'Gujarat' },
                  { value: 'Nhava Sheva', label: 'Nhava Sheva Port', description: 'JNPT, Maharashtra' }
                ]}
              />
            </div>

            {/* Location City */}
            <div className="pt-4 border-t border-gray-200/60 pb-6">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Supplier Location</p>
              <div className="relative">
                <FaLocationDot className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                <input
                  value={filters.city}
                  onChange={(e) => setFilters(f => ({ ...f, city: e.target.value }))}
                  placeholder="Search supplier city"
                  className="w-full h-10 bg-white border border-gray-200 text-gray-800 rounded-xl pl-9 pr-3 text-xs outline-none focus:border-jungle-green-400 transition-colors placeholder:text-gray-300 shadow-sm"
                />
              </div>
            </div>

          </div>
        </aside>

          {/* 2. Main Content Right Side */}
          <main className="flex-1 min-w-0 flex flex-col bg-gray-50/30">
            
            {/* Upper B2B Search Info Header */}
            <div className="bg-gradient-to-b from-gray-50/50 to-white border-b border-gray-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.01)] relative overflow-hidden z-10">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
              <div className="px-6 lg:px-10 py-8 relative z-10 w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-6xl mx-auto">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                      <Link href="/home" className="hover:text-jungle-green-500 transition-colors">Home</Link>
                      <span className="text-gray-300">/</span>
                      <span className="text-jungle-green-600">Search Results</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-baseline gap-3">
                      {q ? `Search results for "${q}"` : 'Wholesale Market Directory'}
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-widest px-2 py-1 bg-gray-100 rounded-lg">
                        {total} items
                      </span>
                    </h1>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white/60 p-1.5 rounded-xl border border-gray-200/60 shadow-sm backdrop-blur-sm">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-2">View Mode:</span>
                    <div className="inline-flex rounded-lg p-0.5 bg-gray-100/80 border border-gray-200/50 shadow-inner">
                      <button
                        onClick={() => setViewMode('list')}
                        className={clsx(
                          "p-1.5 rounded-md transition-all",
                          viewMode === 'list' ? "bg-white text-jungle-green-600 shadow-sm font-bold" : "text-gray-400 hover:text-gray-600"
                        )}
                        title="List View"
                      >
                        <FaList className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={clsx(
                          "p-1.5 rounded-md text-gray-500 transition-all",
                          viewMode === 'grid' ? "bg-white text-jungle-green-500 shadow-sm" : "hover:text-gray-850"
                        )}
                        title="Grid View"
                      >
                        <FaTableCells className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6 lg:p-10 flex-1 w-full max-w-6xl mx-auto">
            
            {/* Top Search bar inside grid */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-jungle-green-400 to-blue-500 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
                <div className="relative">
                  <FaMagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-jungle-green-500 transition-colors" />
                  <input 
                    value={q} 
                    onChange={e => setQ(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && setPage(1)} 
                    placeholder="Enter keywords to search wholesale products..." 
                    className="w-full h-14 bg-white border border-gray-200 rounded-2xl pl-12 pr-6 text-sm font-medium text-gray-800 focus:border-jungle-green-500 focus:ring-4 focus:ring-jungle-green-500/10 outline-none transition-all shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-3px_rgba(0,0,0,0.08)] hover:border-gray-300" 
                  />
                  {isFetching && !isLoading && (
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 border-2 border-jungle-green-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className={clsx(
                  'lg:hidden h-11 flex items-center justify-center gap-2 px-5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors', 
                  activeFilterCount > 0 ? 'bg-jungle-green-500 text-white' : 'bg-gray-900 text-white shadow'
                )}
              >
                <FaSliders className="h-4 w-4" />
                <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
              </button>
            </div>

            {/* Quick Filter Tags (Premium Style) */}
            <div className="flex flex-wrap gap-2.5 items-center mb-8 bg-white p-3 px-5 rounded-[1.25rem] border border-gray-100 shadow-[0_4px_24px_rgb(0,0,0,0.02)]">
              <span className="text-[11px] text-[#8fa1b4] font-bold uppercase tracking-[0.15em] mr-2">Quick Filters:</span>
              <button
                onClick={() => setFilters(f => ({ ...f, isVerified: !f.isVerified }))}
                className={clsx(
                  "px-3.5 py-1.5 rounded-xl border text-[13px] font-medium flex items-center gap-2 transition-all duration-300",
                  filters.isVerified
                    ? "bg-blue-50/80 border-blue-200 text-blue-700 shadow-sm"
                    : "bg-white border-gray-200 text-[#425b76] hover:border-gray-300 hover:shadow-sm hover:-translate-y-[1px]"
                )}
              >
                <FaShieldHalved className={filters.isVerified ? "text-blue-500" : "text-[#5c738f] h-3.5 w-3.5"} />
                Verified Supplier
              </button>

              <button
                onClick={() => setFilters(f => ({ ...f, minTrust: f.minTrust === '90' ? '' : '90' }))}
                className={clsx(
                  "px-3.5 py-1.5 rounded-xl border text-[13px] font-medium flex items-center gap-2 transition-all duration-300",
                  filters.minTrust === '90'
                    ? "bg-blue-50/80 border-blue-200 text-blue-700 shadow-sm"
                    : "bg-white border-gray-200 text-[#425b76] hover:border-gray-300 hover:shadow-sm hover:-translate-y-[1px]"
                )}
              >
                <FaStar className={filters.minTrust === '90' ? "text-blue-500" : "text-[#5c738f] h-3.5 w-3.5"} />
                90%+ Trust
              </button>

              <button
                onClick={() => setFilters(f => ({ ...f, minRating: f.minRating === '4.5' ? '' : '4.5' }))}
                className={clsx(
                  "px-3.5 py-1.5 rounded-xl border text-[13px] font-medium flex items-center gap-2 transition-all duration-300",
                  filters.minRating === '4.5'
                    ? "bg-blue-50/80 border-blue-200 text-blue-700 shadow-sm"
                    : "bg-white border-gray-200 text-[#425b76] hover:border-gray-300 hover:shadow-sm hover:-translate-y-[1px]"
                )}
              >
                Top Rated (4.5★+)
              </button>
            </div>

            {/* Sort Bar (Premium Style) */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-2.5 px-5 rounded-[1.25rem] border border-gray-100 shadow-[0_4px_24px_rgb(0,0,0,0.02)]">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#8fa1b4] font-bold uppercase tracking-[0.15em] mr-2">Sort By:</span>
                {(['relevance', 'newest', 'rating', 'featured'] as SortOption[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={clsx(
                      'px-4 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300',
                      sortBy === s 
                        ? 'bg-white border border-gray-200 text-teal-600 shadow-[0_2px_8px_rgb(0,0,0,0.04)]' 
                        : 'text-[#6b7b8f] hover:text-[#425b76] border border-transparent'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-[#8fa1b4] uppercase tracking-wider font-semibold">
                Showing {listings.length} of {total} items
              </span>
            </div>

            {/* AI Summary Block */}
            {q && (
              <div className="mb-8">
                <div className="flex justify-end mb-6">
                  <div className="bg-[#fff3eb] text-gray-800 px-5 py-2.5 rounded-2xl rounded-tr-sm text-[15px] shadow-sm border border-[#ffe4d1]">
                    {q}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setShowThoughtProcess(!showThoughtProcess)}
                    className="flex items-center gap-2 text-[15px] text-gray-500 hover:text-gray-800 transition-colors self-start"
                  >
                    <span className="text-[#ff5e00] font-black text-xl leading-none">✦</span>
                    <span>Show thought process</span>
                    {showThoughtProcess ? <FaChevronUp className="h-3 w-3" /> : <FaChevronDown className="h-3 w-3" />}
                  </button>

                  {showThoughtProcess && (
                    <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-2">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Analyzing search intent for "{q}"</li>
                        <li>Scanning B2B wholesale directories for exact and partial matches</li>
                        <li>Extracting and comparing pricing tiers and MOQ requirements</li>
                        <li>Compiling final supplier list and product specifications</li>
                      </ul>
                    </div>
                  )}

                  <div className="text-[15px] text-gray-800 leading-relaxed space-y-4">
                    <p>
                      I have found a variety of <strong>{q}</strong> items including related equipment and accessories. The search results include options for multiple use-cases, with prices starting from approximately <strong>₹1,500 per set</strong> for entry-level products to <strong>₹5,000+</strong> for premium adjustable variants.
                    </p>
                    <p>
                      The catalog below contains <strong>{total} {q}-related products</strong> with detailed specifications, pricing, and verified supplier information.
                    </p>
                  </div>
                </div>
                
                <h2 className="text-[22px] font-bold text-gray-900 mt-10 mb-4 capitalize">
                  {q}
                </h2>
              </div>
            )}

            {/* Grid vs List View Rendering */}
            {isLoading ? (
              <div className="space-y-4">
                <ListingCardSkeleton />
                <ListingCardSkeleton />
                <ListingCardSkeleton />
              </div>
            ) : listings.length === 0 ? (
              <Card className="py-20 border-dashed border-2 bg-gray-50 flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                  <FaCubes className="h-7 w-7 text-gray-300" />
                </div>
                <h2 className="text-base font-bold text-gray-800 uppercase tracking-wider mb-1">No products match filters</h2>
                <p className="text-xs text-gray-500 max-w-sm text-center mb-6 leading-relaxed">
                  We couldn't find items that match your search filters. Try widening your filters or post a request.
                </p>
                <Link href="/rfq/create">
                  <Button className="bg-jungle-green-500 hover:bg-jungle-green-600 text-white font-bold text-xs uppercase tracking-wider px-8 h-10 rounded-lg border-none shadow">
                    Post Sourcing Request
                  </Button>
                </Link>
              </Card>
            ) : viewMode === 'list' ? (
              <div className="space-y-4">
                {listings.map((l: any, i: number) => (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (i % 4) * 0.05 }}
                  >
                    <SearchListingRow listing={l} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((l: any, i: number) => (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (i % 3) * 0.05 }}
                  >
                    <SearchListingGridCard listing={l} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12 bg-white py-2 px-4 rounded-xl border border-gray-200 max-w-xs mx-auto shadow-sm text-xs">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  className="text-jungle-green-600 font-bold"
                >
                  PREV
                </Button>
                <span className="font-bold text-gray-700 uppercase tracking-widest text-[10px]">
                  PAGE {page} / {totalPages}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                  className="text-jungle-green-600 font-bold"
                >
                  NEXT
                </Button>
              </div>
            )}

            </div>
          </main>
      </div>
    </PublicLayout>
  );
}

// ── B2B LIST VIEW ROW (Alibaba / Global Sources style) ──────────────────────
function SearchListingRow({ listing }: { listing: any }) {
  const router = useRouter();
  const seller = listing.seller;
  const sellerName = seller?.businessProfile?.businessName ?? seller?.fullName ?? 'Verified Seller';
  const pd = listing.productDetail;

  return (
    <div 
      onClick={() => router.push(`/listings/${listing.id}`)}
      className="bg-white border border-gray-200 rounded-xl hover:border-jungle-green-300 hover:shadow-lg transition-all duration-300 cursor-pointer p-4 flex flex-col md:flex-row gap-5"
    >
      
      {/* Listing Image */}
      <div className="w-full md:w-48 h-48 bg-gray-50 rounded-lg overflow-hidden shrink-0 relative border border-gray-100 flex items-center justify-center">
        {listing.media?.[0] ? (
          <img 
            src={listing.media[0].url} 
            alt={listing.title} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <FaIndustry className="h-10 w-10 text-gray-200" />
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge status={listing.listingType} className="shadow bg-white/95 text-[9px] font-black uppercase" />
        </div>
      </div>

      {/* Product Information Core Column */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-black text-jungle-green-650 uppercase tracking-wider">
            {listing.category?.name}
          </span>
          <h3 className="font-bold text-sm text-gray-900 hover:text-jungle-green-650 transition-colors uppercase tracking-tight leading-tight mt-1 mb-2">
            {listing.title}
          </h3>

          {/* Key specs & logistics inline details */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-600 mt-2 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
            {pd?.fobPort && (
              <span className="flex items-center gap-1.5 truncate">
                <FaShip className="text-gray-400 shrink-0 h-3.5 w-3.5" />
                <span>FOB Port: <strong className="text-gray-800">{pd.fobPort}</strong></span>
              </span>
            )}
            {pd?.deliveryTime && (
              <span className="flex items-center gap-1.5 truncate">
                <FaClock className="text-gray-400 shrink-0 h-3.5 w-3.5" />
                <span>Delivery: <strong className="text-gray-800">{pd.deliveryTime.split('after')[0]}</strong></span>
              </span>
            )}
            {pd?.packagingDetails && (
              <span className="flex items-center gap-1.5 truncate col-span-2">
                <FaBoxOpen className="text-gray-400 shrink-0 h-3.5 w-3.5" />
                <span className="truncate">Packaging: <strong className="text-gray-800">{pd.packagingDetails}</strong></span>
              </span>
            )}
          </div>
        </div>

        {/* Pricing / MOQ specifications */}
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 mt-4">
          <div>
            <p className="text-lg font-black text-gray-900 tracking-tight leading-none">
              {pd?.priceOnRequest ? 'Ask Price' : `₹${pd?.pricePerUnit?.toLocaleString() || '---'}`}
              {!pd?.priceOnRequest && pd?.unitOfMeasure && (
                <span className="text-xs text-gray-400 font-normal"> /{pd.unitOfMeasure}</span>
              )}
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">FOB Reference Price</p>
          </div>

          <div className="border-l border-gray-200 pl-6">
            <p className="text-xs font-bold text-gray-800 leading-none">
              {pd?.minOrderQty || 10} {pd?.unitOfMeasure || 'Pieces'}
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">Min. Order Qty (MOQ)</p>
          </div>
        </div>
      </div>

      {/* Supplier & Trust Widget Column */}
      <div className="w-full md:w-56 border-t md:border-t-0 md:border-l border-gray-150 pt-4 md:pt-0 md:pl-5 flex flex-col justify-between shrink-0">
        
        {/* Verification Status */}
        <div className="space-y-3.5">
          <div className="flex items-start gap-2">
            <Avatar name={sellerName} size="sm" className="rounded-lg shadow-sm shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-black text-gray-900 uppercase tracking-wider truncate leading-tight">
                {sellerName}
              </p>
              {listing.location && (
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                  {listing.location.city}, {listing.location.state}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <TrustScore score={seller?.trustScore || 85} />
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold">
              <FaShieldHalved className="h-3.5 w-3.5" />
              <span>Verified B2B Manufacturer</span>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
          <Button 
            fullWidth 
            size="sm" 
            variant="outline" 
            className="text-[11px] h-9 rounded-lg"
            onClick={() => router.push(`/listings/${listing.id}`)}
          >
            Details
          </Button>
          <Button 
            fullWidth 
            size="sm" 
            className="bg-jungle-green-500 hover:bg-jungle-green-600 border-none text-white text-[11px] h-9 rounded-lg"
            onClick={() => router.push(`/inbox?recipientId=${listing.sellerId}`)}
          >
            Chat Now
          </Button>
        </div>

      </div>

    </div>
  );
}

// ── B2B GRID VIEW CARD (Alibaba / Global Sources style) ─────────────────────
function SearchListingGridCard({ listing }: { listing: any }) {
  const router = useRouter();
  const seller = listing.seller;
  const sellerName = seller?.businessProfile?.businessName ?? seller?.fullName ?? 'Seller';
  const pd = listing.productDetail;

  return (
    <Card 
      onClick={() => router.push(`/listings/${listing.id}`)} 
      padding={false} 
      className="group overflow-hidden border border-gray-100 hover:border-jungle-green-300/60 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 bg-white cursor-pointer h-full flex flex-col justify-between rounded-2xl"
    >
      <div className="aspect-square bg-gray-50 overflow-hidden relative border-b border-gray-100/80 flex items-center justify-center shrink-0">
        {listing.media?.[0] ? (
          <img 
            src={listing.media[0].url} 
            alt={listing.title} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out" 
          />
        ) : (
          <FaIndustry className="h-10 w-10 text-gray-200" />
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge status={listing.listingType} className="shadow bg-white/95 text-[9px] font-black uppercase" />
        </div>
        {seller?.kycStatus === 'VERIFIED' && (
          <div className="absolute top-2 right-2">
            <div className="h-6 w-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-md">
              <FaShieldHalved className="h-3.5 w-3.5" />
            </div>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between relative bg-white">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-jungle-green-600 uppercase tracking-widest bg-jungle-green-50 px-2 py-0.5 rounded-md">
              {listing.category?.name}
            </span>
            <span className="text-[10px] text-gray-500 font-bold bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
              Trust: <span className="text-jungle-green-600">{seller?.trustScore || 85}%</span>
            </span>
          </div>
          <h3 className="font-bold text-sm text-gray-900 group-hover:text-jungle-green-600 transition-colors line-clamp-2 min-h-[2.5rem] leading-snug mb-4">
            {listing.title}
          </h3>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100/80">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-black text-gray-900 tracking-tight">
              {pd?.priceOnRequest ? 'Ask Price' : `₹${pd?.pricePerUnit?.toLocaleString() || '---'}`}
              {!pd?.priceOnRequest && pd?.unitOfMeasure && (
                <span className="text-[10px] text-gray-400 font-normal">/{pd.unitOfMeasure}</span>
              )}
            </p>
            <p className="text-[10px] text-gray-500">
              MOQ: <strong>{pd?.minOrderQty || 10} {pd?.unitOfMeasure || 'Pcs'}</strong>
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-2 flex items-center gap-2 mt-2">
            <Avatar name={sellerName} size="sm" className="rounded-md shrink-0 h-6 w-6" />
            <span className="text-[10px] text-gray-600 truncate font-semibold">
              {sellerName}
            </span>
          </div>

          <div className="flex gap-2 pt-2.5 mt-1 border-t border-gray-50" onClick={(e) => e.stopPropagation()}>
            <Button 
              fullWidth 
              size="sm" 
              variant="outline" 
              className="text-[10px] h-8 rounded-lg"
              onClick={() => router.push(`/listings/${listing.id}`)}
            >
              Details
            </Button>
            <Button 
              fullWidth 
              size="sm" 
              className="bg-jungle-green-500 hover:bg-jungle-green-600 border-none text-white text-[10px] h-8 rounded-lg"
              onClick={() => router.push(`/inbox?recipientId=${listing.sellerId}`)}
            >
              Chat Now
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

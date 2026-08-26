'use client';
import { useState, Suspense, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import {
  FaMagnifyingGlass, FaSliders, FaStar, FaLocationDot,
  FaShieldHalved, FaCubes, FaXmark, FaBolt, FaBoxesStacked,
  FaIndustry, FaGlobe, FaChevronRight, FaChevronDown, FaList, FaTableCells,
  FaCheck, FaShip, FaClock, FaBoxOpen, FaCreditCard
} from 'react-icons/fa6';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Badge, Avatar, Button, EmptyState, Card, Container, ListingCardSkeleton, TrustScore, SearchAutocomplete } from '@/components/ui';
import { clsx } from 'clsx';
import { useListingSearch, useCategories } from '@/lib/hooks';
import Link from 'next/link';
import Image from 'next/image';
import mostPopularBannerImage from '@/components/assets/images/most popular.png';
import { motion, AnimatePresence } from 'framer-motion';

type SortOption = 'relevance' | 'rating' | 'newest' | 'featured' | 'popular';

function ThemeSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select..."
}: {
  label?: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full h-9 bg-gray-50/80 border rounded-lg px-2.5 text-xs font-semibold flex items-center justify-between transition-all duration-200 cursor-pointer shadow-2xs outline-none",
          isOpen
            ? "border-jungle-green-500 ring-2 ring-jungle-green-500/20 bg-white text-gray-900 shadow-sm"
            : value
              ? "border-jungle-green-200 text-jungle-green-700 bg-jungle-green-50/40"
              : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-white"
        )}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <FaChevronDown className={clsx("w-2.5 h-2.5 text-gray-400 transition-transform duration-200 shrink-0 ml-1.5", isOpen && "rotate-180 text-jungle-green-600")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200/90 rounded-xl shadow-xl z-50 overflow-hidden py-1"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    "w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors",
                    isSelected
                      ? "bg-jungle-green-500 text-white font-bold"
                      : "text-gray-700 hover:bg-jungle-green-50 hover:text-jungle-green-700"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <FaCheck className="w-3 h-3 text-white shrink-0 ml-2" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MostPopularPage() {
  return (
    <Suspense fallback={<ListingCardSkeleton />}>
      <MostPopularContent />
    </Suspense>
  );
}

function MostPopularContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search parameters
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [type, setType] = useState(searchParams.get('type') ?? '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category') ?? '');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Categories list
  const { data: categories = [], isLoading: catsLoading } = useCategories();

  // Ensure the page always starts from the top on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`scroll_pos_${window.location.pathname}`);
      window.scrollTo(0, 0);
      requestAnimationFrame(() => window.scrollTo(0, 0));
    }
  }, []);

  // Synchronize category or query from URL if changed
  useEffect(() => {
    setQ(searchParams.get('q') ?? '');
    setType(searchParams.get('type') ?? '');
    setCategoryId(searchParams.get('category') ?? '');
    if (searchParams.get('verified') === 'true') {
      setFilters(f => ({ ...f, isVerified: true }));
    }
  }, [searchParams]);

  // Construct API params (fetch the newest 100 products from backend)
  const apiParams = {
    q,
    limit: 100,
    page: 1,
    type: type || 'PRODUCT',
    tag: 'most-popular',
    ...(categoryId && { categoryId }),
    sortBy,
    ...(filters.isVerified && { isVerified: 'true' }),
    ...(filters.minTrust && { minTrust: filters.minTrust }),
    ...(filters.minRating && { minRating: filters.minRating }),
    ...(filters.city && { city: filters.city }),
  };

  const { data, isLoading, isValidating: isFetching } = useListingSearch(apiParams);

  // Clean-up and helper computations
  const listingsRaw = data?.listings ?? [];

  // Apply client-side advanced B2B filters (like price range, min order quantity, port, payment terms)
  let filteredListings = listingsRaw.filter((l: any) => {
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

  // Apply client-side sorting
  if (sortBy === 'rating') {
    filteredListings.sort((a: any, b: any) => (b.avgRating || 0) - (a.avgRating || 0));
  } else if (sortBy === 'featured') {
    filteredListings.sort((a: any, b: any) => (b.isFeatured === a.isFeatured ? 0 : b.isFeatured ? 1 : -1));
  } else if (sortBy === 'popular') {
    filteredListings.sort((a: any, b: any) => (b.reviewCount || 0) - (a.reviewCount || 0));
  } // 'newest' and 'relevance' just use the backend default (which is newest)

  // Client-side pagination
  const itemsPerPage = 12;
  const total = filteredListings.length;
  const totalPages = Math.ceil(total / itemsPerPage) || 1;
  const currentPage = Math.min(page, totalPages);

  const listings = filteredListings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
      {/* Custom Theme Surface Page Wrapper for Most Popular */}
      <div className="bg-[#4A1E20] min-h-screen pb-16">

        {/* Main Content Container */}
        <Container size="full" className="max-w-[1920px] mx-auto px-3 sm:px-5 lg:px-6 py-6">

          {/* Top Search & Filter Bar (Above New Product Banner) */}
          {/* Unified Sort & Quick Filter Bar */}
          <div className="mb-6 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-white p-2.5 px-4 lg:px-5 rounded-[1.25rem] border border-gray-100 shadow-[0_4px_24px_rgb(0,0,0,0.02)]">
            
            {/* Left Side: Sort and Filters */}
            <div className="flex flex-wrap xl:flex-nowrap items-center gap-4 lg:gap-6">
              
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={clsx(
                  'lg:hidden h-10 flex items-center justify-center gap-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs',
                  activeFilterCount > 0 ? 'bg-jungle-green-500 text-white' : 'bg-gray-100 text-gray-700'
                )}
              >
                <FaSliders className="h-3.5 w-3.5" />
                <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
              </button>

              {/* Sort By Section */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[#8fa1b4] font-bold uppercase tracking-[0.15em] mr-2">Sort By:</span>
                {(['relevance', 'newest', 'rating', 'featured', 'popular'] as SortOption[]).map(s => (
                  <button
                    key={s}
                    onClick={() => { setSortBy(s); setPage(1); }}
                    className={clsx(
                      'px-3.5 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300',
                      sortBy === s
                        ? 'bg-white border border-gray-200 text-teal-600 shadow-[0_2px_8px_rgb(0,0,0,0.04)]'
                        : 'text-[#6b7b8f] hover:text-[#425b76] border border-transparent'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="hidden xl:block w-px h-6 bg-gray-200" />

              {/* Quick Filters Section */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[11px] text-[#8fa1b4] font-bold uppercase tracking-[0.15em] mr-1 hidden sm:inline">Quick Filters:</span>
                <button
                  onClick={() => { setFilters(f => ({ ...f, isVerified: !f.isVerified })); setPage(1); }}
                  className={clsx(
                    "px-3.5 py-1.5 rounded-xl border text-[13px] font-medium flex items-center gap-2 transition-all duration-300",
                    filters.isVerified
                      ? "bg-blue-50/80 border-blue-200 text-blue-700 shadow-sm font-bold"
                      : "bg-white border-transparent text-[#425b76] hover:border-gray-200 hover:shadow-sm"
                  )}
                >
                  <FaShieldHalved className={filters.isVerified ? "text-blue-500" : "text-[#5c738f] h-3.5 w-3.5"} />
                  <span className="hidden sm:inline">Verified Supplier</span>
                  <span className="sm:hidden">Verified</span>
                </button>

                <button
                  onClick={() => { setFilters(f => ({ ...f, minTrust: f.minTrust === '90' ? '' : '90' })); setPage(1); }}
                  className={clsx(
                    "px-3.5 py-1.5 rounded-xl border text-[13px] font-medium flex items-center gap-2 transition-all duration-300",
                    filters.minTrust === '90'
                      ? "bg-blue-50/80 border-blue-200 text-blue-700 shadow-sm font-bold"
                      : "bg-white border-transparent text-[#425b76] hover:border-gray-200 hover:shadow-sm"
                  )}
                >
                  <FaStar className={filters.minTrust === '90' ? "text-blue-500" : "text-[#5c738f] h-3.5 w-3.5"} />
                  90%+ Trust
                </button>

                <button
                  onClick={() => { setFilters(f => ({ ...f, minRating: f.minRating === '4.5' ? '' : '4.5' })); setPage(1); }}
                  className={clsx(
                    "px-3.5 py-1.5 rounded-xl border text-[13px] font-medium flex items-center gap-2 transition-all duration-300",
                    filters.minRating === '4.5'
                      ? "bg-blue-50/80 border-blue-200 text-blue-700 shadow-sm font-bold"
                      : "bg-white border-transparent text-[#425b76] hover:border-gray-200 hover:shadow-sm"
                  )}
                >
                  Top Rated (4.5★+)
                </button>
              </div>
            </div>

            {/* Right Side: Total Items */}
            <span className="text-[11px] text-[#8fa1b4] uppercase tracking-wider font-semibold shrink-0 xl:text-right hidden md:block">
              Showing {listings.length} of {total} items
            </span>
          </div>

          <MostPopularHero />

          <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">

            {/* 1. Left B2B Sidebar Filters (Alibaba Style) */}
            <aside className={clsx('lg:w-60 xl:w-64 shrink-0 space-y-6', !showFilters && 'hidden lg:block')}>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-5 sticky top-24">

                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider">Filters</h3>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={resetAllFilters}
                      className="text-[10px] text-jungle-green-600 font-bold uppercase tracking-wider hover:underline"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Category Tree */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Category</p>
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <button
                      onClick={() => { setCategoryId(''); setPage(1); }}
                      className={clsx(
                        "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between",
                        categoryId === '' ? "bg-jungle-green-50 text-jungle-green-600 font-bold" : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <span>All Categories</span>
                    </button>
                    {categories.map((cat: any) => (
                      <button
                        key={cat.id}
                        onClick={() => { setCategoryId(cat.id); setPage(1); }}
                        className={clsx(
                          "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between",
                          categoryId === cat.id ? "bg-jungle-green-50 text-jungle-green-600 font-bold" : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        <span className="truncate">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Verification & Trust */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Supplier Verification</p>
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.isVerified}
                      onChange={(e) => setFilters(f => ({ ...f, isVerified: e.target.checked }))}
                      className="accent-jungle-green-500 w-4 h-4 rounded border-gray-300"
                    />
                    <div>
                      <span className="block text-xs font-bold text-gray-700 group-hover:text-jungle-green-600 transition-colors">
                        Verified Supplier
                      </span>
                      <span className="block text-[9px] text-gray-400 font-medium">GSTIN & PAN Audited</span>
                    </div>
                  </label>

                  <div className="pt-2">
                    <ThemeSelect
                      label="Min Trust Score"
                      value={filters.minTrust}
                      onChange={(val) => setFilters(f => ({ ...f, minTrust: val }))}
                      options={[
                        { label: "Any Trust Level", value: "" },
                        { label: "90% + Trust (Top tier)", value: "90" },
                        { label: "80% + Trust (Verified)", value: "80" },
                      ]}
                      placeholder="Any Trust Level"
                    />
                  </div>
                </div>

                {/* B2B Price Range Filter */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Price (INR)</p>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg px-2 text-xs outline-none focus:border-jungle-green-500 focus:bg-white text-center"
                    />
                    <span className="text-gray-300 text-xs">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg px-2 text-xs outline-none focus:border-jungle-green-500 focus:bg-white text-center"
                    />
                  </div>
                </div>

                {/* Min Order Qty */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Max Min. Order Qty</p>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={minQty}
                    onChange={(e) => setMinQty(e.target.value)}
                    className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg px-3 text-xs outline-none focus:border-jungle-green-500 focus:bg-white transition-colors"
                  />
                </div>

                {/* Loading FOB Ports Selector */}
                <div className="pt-4 border-t border-gray-100">
                  <ThemeSelect
                    label="FOB Loading Port"
                    value={selectedPort}
                    onChange={(val) => setSelectedPort(val)}
                    options={[
                      { label: "All Ports", value: "" },
                      { label: "Mundra Port (Gujarat)", value: "Mundra" },
                      { label: "Nhava Sheva Port (JNPT)", value: "Nhava Sheva" },
                    ]}
                    placeholder="All Ports"
                  />
                </div>

                {/* Location City */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Supplier Location</p>
                  <div className="relative">
                    <FaLocationDot className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                    <input
                      value={filters.city}
                      onChange={(e) => setFilters(f => ({ ...f, city: e.target.value }))}
                      placeholder="Search supplier city"
                      className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 text-xs outline-none focus:border-jungle-green-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

              </div>
            </aside>

            {/* 2. Search Results Grid & List View (Alibaba/Global Sources Layout) */}
            <div className="flex-1 min-w-0">

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

          </div>
        </Container>
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
      className="group overflow-hidden border border-gray-200 hover:border-jungle-green-300 hover:shadow-lg transition-all duration-300 bg-white cursor-pointer h-full flex flex-col justify-between"
    >
      <div className="aspect-square bg-gray-50 overflow-hidden relative border-b border-gray-150 flex items-center justify-center shrink-0">
        {listing.media?.[0] ? (
          <img
            src={listing.media[0].url}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-black text-jungle-green-655 uppercase tracking-widest">
              {listing.category?.name}
            </span>
            <span className="text-[10px] text-gray-500 font-semibold">
              Trust: {seller?.trustScore || 85}%
            </span>
          </div>
          <h3 className="font-bold text-xs text-gray-900 group-hover:text-jungle-green-655 transition-colors line-clamp-2 min-h-[2rem] leading-snug uppercase tracking-tight mb-3">
            {listing.title}
          </h3>
        </div>

        <div className="space-y-2 pt-3 border-t border-gray-100">
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



// ── CATEGORY TAB SYSTEM WITH DOWNWARD CARET INDICATOR ─────────────────────
function LaunchpadCategoryTabs({
  categories,
  selectedCategory,
  onSelectCategory
}: {
  categories: any[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  // Preset fallback categories matching reference image if categories list from API is empty/loading
  const defaultTabItems = [
    { id: '', name: 'Smart Living Electronics' },
    { id: 'auto', name: 'Auto Vehicle & Accessories' },
    { id: 'beauty', name: 'Beauty & Personal Care' },
    { id: 'electronics', name: 'Consumer Electronics' },
    { id: 'components', name: 'Electronic Components' },
    { id: 'fashion', name: 'Fashion Accessories & Footwear' },
  ];

  const displayCategories = categories.length > 0
    ? [{ id: '', name: 'Smart Living Electronics' }, ...categories]
    : defaultTabItems;

  return (
    <div className="relative mb-6 bg-white rounded-2xl shadow-md border border-amber-100/70 p-1 flex items-center overflow-hidden">
      {/* Scrollable Tabs Wrapper */}
      <div
        ref={scrollRef}
        className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 px-1 w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayCategories.map((cat, idx) => {
          const isActive = selectedCategory === cat.id || (selectedCategory === '' && idx === 0);
          return (
            <div key={cat.id || idx} className="relative shrink-0">
              <button
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={clsx(
                  "px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center justify-center text-center",
                  isActive
                    ? "bg-[#EA3323] text-white rounded-t-xl rounded-b-none shadow-sm"
                    : "bg-white text-gray-700 hover:text-[#EA3323] hover:bg-orange-50/50 rounded-xl border-r border-gray-100/80 last:border-r-0"
                )}
              >
                {cat.name}
              </button>

              {/* Active Downward Caret Arrow Indicator */}
              {isActive && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 -bottom-[6px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#EA3323] z-20"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Right Scroll Arrow Button */}
      <button
        type="button"
        onClick={scrollRight}
        className="shrink-0 bg-white border-l border-gray-100 shadow-sm p-3 text-gray-400 hover:text-[#EA3323] hover:bg-orange-50/50 transition-colors z-20 rounded-r-xl"
        title="Scroll categories"
      >
        <FaChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── MOST POPULAR HERO BANNER ──────────────────────────────────────────────
function MostPopularHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative w-full overflow-hidden shadow-lg mb-6 bg-[#350b0e]"
    >
      <div className="w-full relative flex items-center justify-start overflow-hidden min-h-[240px] md:min-h-[300px]">
        {/* Force object-contain on all screens so the image is NEVER cut vertically or horizontally */}
        <Image 
          src={mostPopularBannerImage} 
          alt="Most Popular Banner" 
          fill
          className="object-contain object-right brightness-75" 
          priority
        />
        
        {/* Decorative Background Elements (Left Side) */}
        <div 
          className="absolute inset-0 w-full z-10 pointer-events-none overflow-hidden"
          style={{ 
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)',
            maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)'
          }}
        >
          {/* Base gradient blending with the image on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#150406] via-[#2e090c]/95 to-transparent" />
          
          {/* Animated Glow Orbs for depth */}
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }} 
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1/2 -left-1/4 w-3/4 h-[150%] bg-[#EA3323] blur-[120px] rounded-full mix-blend-screen" 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} 
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-20%] left-[20%] w-1/2 h-[100%] bg-[#fce588] blur-[100px] rounded-full mix-blend-screen" 
          />

          {/* Subtle Dot Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.07]" 
            style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
          />
          
          {/* Diagonal Lines Texture */}
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 1px, transparent 8px)' }} 
          />
        </div>

        {/* Text Content Overlay */}
        <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-8 sm:px-12 lg:px-16 max-w-2xl z-20">
          <div className="flex items-center gap-3 md:gap-4 mb-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-white tracking-tight leading-none drop-shadow-md">
              <span className="text-[#EA3323]">M</span>OST POPULAR
            </h1>
            <div className="bg-[#fce588] rounded-[20px] px-3 py-0.5 flex items-center justify-center shadow-md">
              <span className="text-[#EA3323] font-black text-base sm:text-lg md:text-xl italic pr-0.5">M</span>
              <span className="text-gray-900 font-black text-base sm:text-lg md:text-xl italic">P</span>
            </div>
          </div>

          <p className="text-white text-sm sm:text-base md:text-lg font-medium mt-1 sm:mt-2 max-w-md leading-snug drop-shadow-md">
            Trending B2B wholesale products. High demand bulk deals from top suppliers.
          </p>
        </div>
      </div>
    </motion.div>
  );
}


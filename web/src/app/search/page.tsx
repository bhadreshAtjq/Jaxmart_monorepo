'use client';
import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { 
  FaMagnifyingGlass, FaSliders, FaStar, FaLocationDot, 
  FaShieldHalved, FaCubes, FaXmark, FaBolt, FaBoxesStacked,
  FaIndustry, FaGlobe, FaChevronRight, FaList, FaTableCells,
  FaCheck, FaShip, FaClock, FaBoxOpen, FaCreditCard
} from 'react-icons/fa6';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Badge, Avatar, Button, EmptyState, Card, Container, ListingCardSkeleton, TrustScore } from '@/components/ui';
import { clsx } from 'clsx';
import { useListingSearch, useCategories } from '@/lib/hooks';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

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
      {/* Upper B2B Search Info Header */}
      <div className="bg-white border-b border-gray-200">
        <Container size="xl" className="py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <Link href="/home" className="hover:text-orange-500">Home</Link>
                <span>›</span>
                <span className="text-gray-800 font-semibold">Search Results</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-baseline gap-2">
                {q ? `Search results for "${q}"` : 'Wholesale Market Directory'}
                <span className="text-xs text-gray-500 font-normal">({total} items found)</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-semibold">View Mode:</span>
              <div className="inline-flex rounded-lg border border-gray-300 p-0.5 bg-gray-50">
                <button
                  onClick={() => setViewMode('list')}
                  className={clsx(
                    "p-1.5 rounded-md text-gray-500 transition-all",
                    viewMode === 'list' ? "bg-white text-orange-500 shadow-sm" : "hover:text-gray-850"
                  )}
                  title="List View"
                >
                  <FaList className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={clsx(
                    "p-1.5 rounded-md text-gray-500 transition-all",
                    viewMode === 'grid' ? "bg-white text-orange-500 shadow-sm" : "hover:text-gray-850"
                  )}
                  title="Grid View"
                >
                  <FaTableCells className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Container */}
      <Container size="xl" className="py-8 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* 1. Left B2B Sidebar Filters (Alibaba Style) */}
          <aside className={clsx('lg:w-68 shrink-0 space-y-6', !showFilters && 'hidden lg:block')}>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-6 sticky top-24">
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetAllFilters}
                    className="text-[10px] text-orange-600 font-bold uppercase tracking-wider hover:underline"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Category Tree */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Category</p>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  <button
                    onClick={() => setCategoryId('')}
                    className={clsx(
                      "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between",
                      categoryId === '' ? "bg-orange-50 text-orange-600 font-bold" : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <span>All Categories</span>
                  </button>
                  {categories.map((cat: any) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
                      className={clsx(
                        "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between",
                        categoryId === cat.id ? "bg-orange-50 text-orange-600 font-bold" : "text-gray-600 hover:bg-gray-50"
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
                    className="accent-orange-500 w-4 h-4 rounded border-gray-300"
                  />
                  <div>
                    <span className="block text-xs font-bold text-gray-700 group-hover:text-orange-600 transition-colors">
                      Verified Supplier
                    </span>
                    <span className="block text-[9px] text-gray-400 font-medium">GSTIN & PAN Audited</span>
                  </div>
                </label>

                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Min Trust Score</label>
                  <select
                    value={filters.minTrust}
                    onChange={(e) => setFilters(f => ({ ...f, minTrust: e.target.value }))}
                    className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg px-2 text-xs outline-none focus:border-orange-500 transition-colors cursor-pointer"
                  >
                    <option value="">Any Trust Level</option>
                    <option value="90">90% + Trust (Top tier)</option>
                    <option value="80">80% + Trust (Verified)</option>
                  </select>
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
                    className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg px-2 text-xs outline-none focus:border-orange-500 focus:bg-white text-center"
                  />
                  <span className="text-gray-300 text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg px-2 text-xs outline-none focus:border-orange-500 focus:bg-white text-center"
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
                  className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg px-3 text-xs outline-none focus:border-orange-500 focus:bg-white transition-colors"
                />
              </div>

              {/* Loading FOB Ports Selector */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">FOB Loading Port</p>
                <select
                  value={selectedPort}
                  onChange={(e) => setSelectedPort(e.target.value)}
                  className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg px-2 text-xs outline-none focus:border-orange-500 transition-colors cursor-pointer"
                >
                  <option value="">All Ports</option>
                  <option value="Mundra">Mundra Port (Gujarat)</option>
                  <option value="Nhava Sheva">Nhava Sheva Port (JNPT)</option>
                </select>
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
                    className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 text-xs outline-none focus:border-orange-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

            </div>
          </aside>

          {/* 2. Search Results Grid & List View (Alibaba/Global Sources Layout) */}
          <div className="flex-1 min-w-0">
            
            {/* Top Search bar inside grid */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  value={q} 
                  onChange={e => setQ(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && setPage(1)} 
                  placeholder="Enter keywords to search wholesale products..." 
                  className="w-full h-11 bg-white border border-gray-300 rounded-lg pl-10 pr-6 text-sm text-gray-800 focus:border-orange-500 outline-none transition-colors shadow-sm" 
                />
                {isFetching && !isLoading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className={clsx(
                  'lg:hidden h-11 flex items-center justify-center gap-2 px-5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors', 
                  activeFilterCount > 0 ? 'bg-orange-500 text-white' : 'bg-gray-900 text-white shadow'
                )}
              >
                <FaSliders className="h-4 w-4" />
                <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
              </button>
            </div>

            {/* Quick Filter Tags (Alibaba Style) */}
            <div className="flex flex-wrap gap-2 items-center mb-6">
              <span className="text-xs text-gray-500 font-semibold">Quick Filters:</span>
              <button
                onClick={() => setFilters(f => ({ ...f, isVerified: !f.isVerified }))}
                className={clsx(
                  "px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors",
                  filters.isVerified
                    ? "bg-orange-50 border-orange-200 text-orange-600 font-bold"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                <FaShieldHalved className="h-3.5 w-3.5" />
                Verified Supplier
              </button>

              <button
                onClick={() => setFilters(f => ({ ...f, minTrust: f.minTrust === '90' ? '' : '90' }))}
                className={clsx(
                  "px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors",
                  filters.minTrust === '90'
                    ? "bg-orange-50 border-orange-200 text-orange-600 font-bold"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                <FaStar className="h-3.5 w-3.5" />
                90%+ Trust
              </button>

              <button
                onClick={() => setFilters(f => ({ ...f, minRating: f.minRating === '4.5' ? '' : '4.5' }))}
                className={clsx(
                  "px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors",
                  filters.minRating === '4.5'
                    ? "bg-orange-50 border-orange-200 text-orange-600 font-bold"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                Top Rated (4.5★+)
              </button>
            </div>

            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-6 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-semibold px-2">Sort By:</span>
                {(['relevance', 'newest', 'rating', 'featured'] as SortOption[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={clsx(
                      'px-3 py-1.5 rounded-md font-bold uppercase tracking-wider transition-colors',
                      sortBy === s ? 'bg-white border border-gray-200 text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold px-2">
                Showing {listings.length} of {total} items
              </span>
            </div>

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
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider px-8 h-10 rounded-lg border-none shadow">
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
                  className="text-orange-600 font-bold"
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
                  className="text-orange-600 font-bold"
                >
                  NEXT
                </Button>
              </div>
            )}

          </div>

        </div>
      </Container>
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
      className="bg-white border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-lg transition-all duration-300 cursor-pointer p-4 flex flex-col md:flex-row gap-5"
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
          <span className="text-[10px] font-black text-orange-650 uppercase tracking-wider">
            {listing.category?.name}
          </span>
          <h3 className="font-bold text-sm text-gray-900 hover:text-orange-650 transition-colors uppercase tracking-tight leading-tight mt-1 mb-2">
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
        <div className="flex gap-2 mt-4">
          <Button 
            fullWidth 
            size="sm" 
            variant="outline" 
            className="text-[11px] h-9 rounded-lg"
          >
            Details
          </Button>
          <Button 
            fullWidth 
            size="sm" 
            className="bg-orange-500 hover:bg-orange-600 border-none text-white text-[11px] h-9 rounded-lg"
          >
            Get Quote
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
      className="group overflow-hidden border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 bg-white cursor-pointer h-full flex flex-col justify-between"
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
            <span className="text-[9px] font-black text-orange-650 uppercase tracking-widest">
              {listing.category?.name}
            </span>
            <span className="text-[10px] text-gray-500 font-semibold">
              Trust: {seller?.trustScore || 85}%
            </span>
          </div>
          <h3 className="font-bold text-xs text-gray-900 group-hover:text-orange-650 transition-colors line-clamp-2 min-h-[2rem] leading-snug uppercase tracking-tight mb-3">
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
        </div>
      </div>
    </Card>
  );
}

'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { 
  FaMagnifyingGlass, FaSliders, FaStar, FaLocationDot, 
  FaShieldHalved, FaCubes, FaXmark, FaBolt, FaBoxesStacked,
  FaIndustry, FaGlobe
} from 'react-icons/fa6';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge, Avatar, Button, EmptyState, Card, Container, ListingCardSkeleton, TrustScore } from '@/components/ui';
import { clsx } from 'clsx';
import { useListingSearch } from '@/lib/hooks';
import Link from 'next/link';
import { motion } from 'framer-motion';

type SortOption = 'relevance' | 'rating' | 'newest' | 'featured';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [type, setType] = useState(searchParams.get('type') ?? '');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    isVerified: false, minTrust: '', minRating: '', city: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const params = {
    q, limit: 12, page,
    ...(type && { type }),
    ...(sortBy !== 'relevance' && { sortBy }),
    ...(filters.isVerified && { isVerified: 'true' }),
    ...(filters.minTrust && { minTrust: filters.minTrust }),
    ...(filters.minRating && { minRating: filters.minRating }),
    ...(filters.city && { city: filters.city }),
  };

  const { data, isLoading, isValidating: isFetching } = useListingSearch(params);

  const listings = data?.listings ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.pages ?? 1;
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <AppLayout>
      <div className="bg-white border-b border-gray-100">
        <Container size="xl" className="py-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                   <FaGlobe className="text-jax-accent h-3 w-3" />
                   <span className="text-[10px] font-black text-jax-accent uppercase tracking-[0.2em]">Global Sourcing Registry</span>
                </div>
                <h1 className="text-3xl font-heading font-black text-jax-dark tracking-tighter leading-none mb-2">Source Catalog Master</h1>
                <p className="text-sm text-gray-500 font-medium">Connect directly with verified industrial manufacturers and global wholesalers.</p>
              </div>
              
              <div className="flex items-center gap-4">
                 <div className="hidden md:flex items-center gap-6 px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                       <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-right">Available Inventory</p>
                       <p className="text-xl font-black text-jax-dark text-right leading-none">{total.toLocaleString()}</p>
                    </div>
                 </div>
              </div>
           </div>
        </Container>
      </div>

      <Container size="xl" className="py-12 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <aside className={clsx('lg:w-72 shrink-0 space-y-6', !showFilters && 'hidden lg:block')}>
            <div className="bg-white border border-gray-200/60 rounded-3xl p-6 sticky top-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-jax-dark uppercase tracking-widest">Sourcing Filters</h3>
                {activeFilterCount > 0 && (
                  <button onClick={() => setFilters({ isVerified: false, minTrust: '', minRating: '', city: '' })} className="text-[10px] text-jax-accent font-black uppercase tracking-wider hover:underline">
                    RESET
                  </button>
                )}
              </div>

              <div className="space-y-8">
                 <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Market Classification</p>
                   <div className="grid grid-cols-1 gap-1.5">
                     {[{ v: '', l: 'All Verticals' }, { v: 'PRODUCT', l: 'Industrial Goods' }, { v: 'SERVICE', l: 'Technical Services' }].map(({ v, l }) => (
                       <button 
                         key={v} 
                         onClick={() => setType(v)} 
                         className={clsx(
                           'flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all',
                           type === v ? 'bg-jax-dark text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                         )}
                       >
                         {l}
                         {type === v && <div className="h-1.5 w-1.5 rounded-full bg-jax-accent animate-pulse" />}
                       </button>
                     ))}
                   </div>
                 </div>

                 <div>
                   <label className="flex items-center gap-3 p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl cursor-pointer group hover:bg-emerald-50 transition-colors">
                     <input type="checkbox" checked={filters.isVerified} onChange={e => setFilters(f => ({ ...f, isVerified: e.target.checked }))} className="accent-emerald-500 w-4 h-4 rounded-lg" />
                     <div>
                        <span className="block text-[11px] font-black text-emerald-700 uppercase tracking-tighter">Verified Manufacturers</span>
                        <span className="block text-[9px] text-emerald-600/70 font-bold uppercase whitespace-nowrap">KYC & GST COMPLIANT</span>
                     </div>
                   </label>
                 </div>

                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Minimum Reputation</p>
                    <div className="flex gap-2">
                       {['4', '4.5'].map(r => (
                          <button 
                             key={r}
                             onClick={() => setFilters(f => ({ ...f, minRating: f.minRating === r ? '' : r }))}
                             className={clsx(
                                'flex-1 py-2 px-3 rounded-xl border-2 text-[11px] font-black transition-all',
                                filters.minRating === r ? 'border-jax-accent bg-jax-accent/5 text-jax-accent' : 'border-gray-100 text-gray-500'
                             )}
                          >
                             {r}★ +
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="pt-2 border-t border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Strategic Region</p>
                    <div className="relative">
                       <FaLocationDot className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                       <input value={filters.city} onChange={e => setFilters(f => ({ ...f, city: e.target.value }))} placeholder="City/Industrial Hub" className="w-full h-11 bg-gray-50 border-none rounded-xl pl-10 text-xs font-black placeholder:text-gray-300 outline-none focus:ring-1 focus:ring-jax-accent/20" />
                    </div>
                 </div>
              </div>
            </div>
          </aside>

          {/* Results Area */}
          <div className="flex-1 min-w-0">
            {/* Command Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-10">
              <div className="flex-1 relative group">
                <FaMagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-jax-accent transition-colors" />
                <input 
                  value={q} 
                  onChange={e => setQ(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && setPage(1)} 
                  placeholder="Execute global inventory search (e.g. Copper wire, Cotton...)" 
                  className="w-full h-16 bg-white border border-gray-200/60 rounded-2xl pl-12 pr-6 text-sm font-heading font-black text-jax-dark focus:border-jax-accent/30 outline-none transition-all shadow-xl shadow-black/[0.02]" 
                />
                {isFetching && !isLoading && <div className="absolute right-5 top-1/2 -translate-y-1/2"><div className="h-4 w-4 border-2 border-jax-accent border-t-transparent rounded-full animate-spin" /></div>}
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className={clsx(
                   'lg:hidden h-16 flex items-center justify-center gap-3 px-8 rounded-2xl border-none text-sm font-black uppercase tracking-widest transition-all', 
                   activeFilterCount > 0 ? 'bg-jax-accent text-white' : 'bg-jax-dark text-white shadow-xl'
                )}
              >
                <FaSliders className="h-4 w-4" />
                Filter Console {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            </div>

            {/* View Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 p-1 bg-gray-50 rounded-2xl border border-gray-100">
               <div className="flex bg-white rounded-xl shadow-sm px-4 py-2 border border-black/5">
                  {(['relevance', 'newest', 'rating'] as SortOption[]).map(s => (
                    <button key={s} onClick={() => setSortBy(s)} className={clsx('px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all', sortBy === s ? 'bg-jax-dark text-white' : 'text-gray-400 hover:text-jax-dark')}>
                      {s}
                    </button>
                  ))}
               </div>
               <div className="px-4 py-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Showing {listings.length} of {total} listings</span>
               </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <ListingCardSkeleton />
                <ListingCardSkeleton />
                <ListingCardSkeleton />
                <ListingCardSkeleton />
                <ListingCardSkeleton />
                <ListingCardSkeleton />
              </div>
            ) : listings.length === 0 ? (
              <Card className="py-24 border-dashed border-2 bg-gray-50/50 flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-sm mb-6">
                   <FaCubes className="h-8 w-8 text-gray-200" />
                </div>
                <h2 className="text-xl font-black text-jax-dark uppercase tracking-tight mb-2">Zero Inventory Match</h2>
                <p className="text-xs text-gray-500 max-w-sm text-center mb-10 leading-relaxed">No direct catalog items found for this query. We recommend broadcasting your requirement to our global manufacturer network via RFQ.</p>
                <Link href="/rfq/create">
                  <Button className="bg-jax-accent text-white border-none shadow-xl shadow-jax-accent/20 px-10 h-12">
                     Initiate Sourcing Request
                  </Button>
                </Link>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {listings.map((l: any, i: number) => (
                    <motion.div
                       key={l.id}
                       initial={{ opacity: 0, y: 15 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: (i % 3) * 0.1 }}
                    >
                       <SearchListingCard listing={l} />
                    </motion.div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-6 mt-16 bg-white p-2 rounded-2xl border border-gray-100 max-w-xs mx-auto shadow-sm">
                    <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="text-jax-blue">PREV</Button>
                    <span className="text-[9px] font-black text-jax-dark uppercase tracking-widest">PAGE {page} / {totalPages}</span>
                    <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-jax-blue">NEXT</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </AppLayout>
  );
}

function SearchListingCard({ listing }: { listing: any }) {
  const router = useRouter();
  const seller = listing.seller;
  const sellerName = seller?.businessProfile?.businessName ?? seller?.fullName ?? 'Seller';
  const pd = listing.productDetail;

  return (
    <Card onClick={() => router.push(`/listings/${listing.id}`)} padding={false} className="group overflow-hidden border-2 border-transparent hover:border-jax-accent/30 shadow-none hover:shadow-2xl transition-all duration-500 bg-white cursor-pointer h-full flex flex-col">
      <div className="h-56 bg-gray-50 overflow-hidden relative">
        {listing.media?.[0] ? (
          <img src={listing.media[0].url} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200"><FaIndustry className="h-10 w-10 opacity-10" /></div>
        )}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
           <Badge status={listing.listingType} className="shadow-lg backdrop-blur-md bg-white/90 text-[10px] uppercase font-black" />
           {listing.isFeatured && <Badge status="ACTIVE" label="Premium Ops" className="bg-jax-accent text-white shadow-xl text-[10px] border-none font-black" />}
        </div>
        {seller?.kycStatus === 'VERIFIED' && <div className="absolute top-4 right-4"><div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg"><FaShieldHalved className="h-4 w-4" /></div></div>}
        
        <div className="absolute inset-x-4 bottom-4 translate-y-14 group-hover:translate-y-0 transition-transform duration-500 flex gap-2">
           <Button fullWidth size="sm" variant="primary" className="shadow-2xl shadow-jax-blue/40 bg-jax-blue border-none">Specs</Button>
           <Button fullWidth size="sm" variant="primary" className="shadow-2xl shadow-jax-accent/40 bg-jax-accent border-none">Quote</Button>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
           <span className="text-[10px] font-black text-jax-accent uppercase tracking-widest">{listing.category?.name || 'Category'}</span>
           <TrustScore score={seller?.trustScore || 88} />
        </div>
        <h3 className="font-heading font-black text-jax-dark text-base group-hover:text-jax-accent transition-colors line-clamp-2 h-12 uppercase tracking-tight mb-4 leading-tight">
           {listing.title}
        </h3>
        
        <div className="flex items-center gap-3 mb-6 p-2.5 bg-gray-50/50 rounded-2xl border border-gray-100 group-hover:bg-white transition-colors">
          <Avatar name={sellerName} size="sm" className="rounded-xl shadow-sm ring-2 ring-white" />
          <div className="min-w-0">
            <p className="text-[10px] font-black text-jax-dark truncate uppercase tracking-wider">{sellerName}</p>
            {listing.location && <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{listing.location.city}, {listing.location.state}</p>}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
           <div className="flex flex-col">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Price Unit</p>
              <div className="flex items-baseline gap-1">
                 <FaStar className="h-2 w-2 text-amber-400" />
                 <span className="text-[10px] font-black text-jax-dark">{listing.avgRating?.toFixed(1) || '4.8'}</span>
              </div>
           </div>
           <p className="text-xl font-heading font-black text-jax-blue tracking-tighter">
             {pd?.priceOnRequest ? 'PO Req' : `₹${pd?.pricePerUnit?.toLocaleString() || '---'}`}
           </p>
        </div>
      </div>
    </Card>
  );
}


'use client';
import { 
  FaBoxesStacked, FaStore, FaInbox, FaStar, FaChartLine, 
  FaPlus, FaArrowRight, FaCubes, FaChevronRight 
} from 'react-icons/fa6';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge, PageLoader } from '@/components/ui';
import { useMyListings } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: listingsData, isLoading: listingsLoading } = useMyListings();

  const listings = listingsData?.listings ?? [];
  const activeCount = listings.filter((l: any) => l.status === 'ACTIVE').length;
  const totalCount = listingsData?.pagination?.total ?? listings.length;

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Seller';

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50/50 pb-20">
        
        {/* Dark Navy Hero Header */}
        <div className="bg-gradient-to-r from-[#1B2348] via-[#202958] to-[#2B3566] text-white pt-10 pb-24 px-4 sm:px-6 lg:px-8 shadow-inner">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="inline-block bg-white/10 text-white border border-white/20 px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase mb-3 shadow-sm">
                  SELLER PORTAL
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                  Welcome back, {firstName}
                </h1>
                <p className="text-sm text-blue-100/80 font-medium max-w-xl leading-relaxed">
                  Here's what's happening with your store today. Manage your listings and track your performance.
                </p>
              </div>

              <div>
                <button
                  onClick={() => router.push('/seller/listings/new')}
                  className="bg-white text-[#1B2348] hover:bg-gray-100 font-bold text-xs px-5 py-2.5 rounded-full shadow-lg transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 cursor-pointer"
                >
                  <FaPlus className="h-3 w-3" />
                  <span>New Product</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Stat Cards overlapping Hero (-mt-16) */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            
            {/* Active Products */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FaStore className="h-4 w-4" />
                </div>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">ACTIVE PRODUCTS</p>
              <p className="text-2xl font-black text-gray-900 tracking-tight">{activeCount}</p>
            </div>

            {/* Total Products */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FaBoxesStacked className="h-4 w-4" />
                </div>
                <span className="text-gray-400 text-[10px] font-semibold">Total</span>
              </div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">TOTAL PRODUCTS</p>
              <p className="text-2xl font-black text-gray-900 tracking-tight">{totalCount}</p>
            </div>

            {/* Buyer Requests */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <FaInbox className="h-4 w-4" />
                </div>
                <span className="bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  SOON
                </span>
              </div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">BUYER REQUESTS</p>
              <p className="text-2xl font-black text-gray-400 tracking-tight">-</p>
            </div>

            {/* Avg Rating */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center font-bold">
                  <FaStar className="h-4 w-4" />
                </div>
                <span className="text-gray-400 text-[10px] font-medium">No reviews</span>
              </div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">AVG RATING</p>
              <p className="text-2xl font-black text-gray-400 tracking-tight">-</p>
            </div>

          </div>

          {/* Quick Actions Section */}
          <div className="mb-12">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Quick Actions</h2>
            <p className="text-xs text-gray-500 mb-5">Shortcuts to manage your store</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Action 1: Manage Products */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm flex items-start gap-4 hover:border-blue-200 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FaStore className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-gray-900 mb-1">Manage Products</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    View, edit, or remove your current product listings.
                  </p>
                  <button
                    onClick={() => router.push('/seller/listings')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors group cursor-pointer"
                  >
                    <span>Go to Products</span>
                    <FaArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Action 2: Buyer Requests */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm flex items-start gap-4 hover:border-amber-200 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <FaInbox className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-gray-900 mb-1">Buyer Requests</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    Check new requirements from potential buyers.
                  </p>
                  <button
                    onClick={() => router.push('/seller/rfq-inbox')}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 transition-colors group cursor-pointer"
                  >
                    <span>View Inbox</span>
                    <FaArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Action 3: Analytics */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm flex items-start gap-4 relative overflow-hidden">
                <span className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  SOON
                </span>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FaChartLine className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-gray-900 mb-1">Analytics</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    Track your page views and conversion metrics.
                  </p>
                  <span className="text-xs font-bold text-gray-400 inline-block cursor-not-allowed">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Products Section */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Recent Products</h2>
              <Link
                href="/seller/listings"
                className="text-xs font-bold text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <FaChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {listingsLoading ? (
              <div className="bg-white rounded-2xl p-12 border border-gray-200/80">
                <PageLoader />
              </div>
            ) : listings.length === 0 ? (
              /* Empty State matching image exactly */
              <div className="bg-white rounded-2xl p-12 md:p-16 border border-gray-200/80 shadow-sm text-center">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <FaCubes className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">No products listed yet</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
                  Get started by creating your first product or service listing to start receiving enquiries from buyers.
                </p>
                <button
                  onClick={() => router.push('/seller/listings/new')}
                  className="bg-[#1F264E] hover:bg-[#161C3D] text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md inline-flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <FaPlus className="h-3.5 w-3.5" />
                  <span>Create Your First Listing</span>
                </button>
              </div>
            ) : (
              /* Products Grid when products exist */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {listings.slice(0, 6).map((l: any) => (
                  <div
                    key={l.id}
                    onClick={() => router.push(`/listings/${l.id}`)}
                    className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
                  >
                    <div className="h-44 bg-gray-100 overflow-hidden relative">
                      {l.media?.[0] ? (
                        <img
                          src={l.media[0].url}
                          alt={l.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <FaBoxesStacked className="h-8 w-8" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge status={l.status} />
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <h4 className="font-bold text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                        {l.title}
                      </h4>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                        <span className="text-gray-500">Price</span>
                        <span className="font-bold text-gray-900">
                          {l.productDetail?.priceOnRequest ? 'RFQ Mode' : `\u20B9${l.productDetail?.pricePerUnit?.toLocaleString() || '-'}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  );
}

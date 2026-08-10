'use client';
import { FaBoxesStacked, FaStore, FaInbox, FaStar, FaArrowRight, FaChartLine, FaRegStar, FaPlus } from 'react-icons/fa6';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge, Button, PageLoader, SectionHeader } from '@/components/ui';
import { useMyListings } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: listings, isLoading: listingsLoading } = useMyListings();

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50/50 pb-20">
        {/* Hero Section with Glassmorphism */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1C265B] via-[#232F72] to-[#2F578A] pt-10 pb-32 mb-10">
          <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/50 to-transparent bottom-0 h-1/2"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <Badge label="SELLER PORTAL" className="bg-white/10 text-white/90 border-white/20 backdrop-blur-md mb-4" />
                <h1 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tight leading-tight">
                  {user?.fullName ? `Welcome back, ${user.fullName.split(' ')[0]}` : 'Dashboard'}
                </h1>
                <p className="text-blue-100/80 mt-2 text-lg max-w-xl font-medium">
                  Here's what's happening with your store today. Manage your listings and track your performance.
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  className="!bg-none bg-white text-blue-900 hover:bg-blue-50 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 border-none rounded-2xl px-6 py-2 shadow-lg font-bold" 
                  onClick={() => router.push('/seller/listings/new')} 
                  icon={<FaPlus />}
                >
                  New Product
                </Button>
              </div>
            </div>

            {/* Stats Grid - Overlapping the hero */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12 mb-[-6rem]">
              <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-xl shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <FaStore className="h-5 w-5" />
                  </div>
                  <Badge label="Live" className="bg-emerald-100 text-emerald-700 border-none" />
                </div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Active Products</p>
                <h3 className="text-3xl font-black text-gray-900">{listings?.listings?.filter((l: any) => l.status === 'ACTIVE').length ?? 0}</h3>
              </div>
              
              <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-xl shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <FaBoxesStacked className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-400">Total</span>
                </div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Products</p>
                <h3 className="text-3xl font-black text-gray-900">{listings?.total ?? 0}</h3>
              </div>

              <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-xl shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                    <FaInbox className="h-5 w-5" />
                  </div>
                  <Badge label="Soon" className="bg-gray-100 text-gray-500 border-none" />
                </div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Buyer Requests</p>
                <h3 className="text-3xl font-black text-gray-400">-</h3>
              </div>

              <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-xl shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                    <FaStar className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-400">No reviews</span>
                </div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Avg Rating</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-gray-400">-</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-24">
          {/* Quick Actions */}
          <SectionHeader title="Quick Actions" subtitle="Shortcuts to manage your store" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div 
              onClick={() => router.push('/seller/listings')}
              className="group cursor-pointer bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 scale-150">
                <FaStore className="w-32 h-32" />
              </div>
              <div className="flex items-start gap-5 relative z-10">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <FaStore className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">Manage Products</h3>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">View, edit, or remove your current product listings.</p>
                  <span className="inline-flex items-center text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                    Go to Products <FaArrowRight className="ml-2 h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>

            <div 
              onClick={() => router.push('/seller/rfq-inbox')}
              className="group cursor-pointer bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 scale-150">
                <FaInbox className="w-32 h-32" />
              </div>
              <div className="flex items-start gap-5 relative z-10">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <FaInbox className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-gray-900 text-lg mb-1 group-hover:text-amber-600 transition-colors">Buyer Requests</h3>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">Check new requirements from potential buyers.</p>
                  <span className="inline-flex items-center text-sm font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                    View Inbox <FaArrowRight className="ml-2 h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>

            <div className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden opacity-80">
              <div className="absolute top-0 right-0 p-6 opacity-[0.02] scale-150">
                <FaChartLine className="w-32 h-32" />
              </div>
              <div className="flex items-start gap-5 relative z-10">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 shadow-inner">
                  <FaChartLine className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-heading font-bold text-gray-900 text-lg mb-1">Analytics</h3>
                    <Badge label="Soon" className="bg-gray-100 text-gray-500 border-none scale-75 origin-top-right" />
                  </div>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">Track your page views and conversion metrics.</p>
                  <span className="inline-flex items-center text-sm font-bold text-gray-400 cursor-not-allowed">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Listings */}
          <SectionHeader 
            title="Recent Products" 
            action={
              <Button variant="ghost" size="sm" onClick={() => router.push('/seller/listings')} className="text-blue-600 hover:bg-blue-50">
                View All <FaArrowRight className="ml-1 h-3 w-3" />
              </Button>
            } 
          />
          
          {listingsLoading ? <PageLoader /> : !(listings?.listings?.length) ? (
            <div className="bg-white rounded-3xl p-12 border border-dashed border-gray-200 text-center shadow-sm">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 text-blue-500 mb-6">
                <FaBoxesStacked className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">No products listed yet</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">Get started by creating your first product or service listing to start receiving enquiries from buyers.</p>
              <Button size="lg" onClick={() => router.push('/seller/listings/new')} icon={<FaPlus />}>
                Create Your First Listing
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(listings?.listings ?? []).slice(0, 4).map((l: any) => (
                <div key={l.id} onClick={() => router.push(`/listings/${l.id}`)} className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-500 hover:-translate-y-1 flex flex-col">
                  <div className="relative h-48 bg-gray-50 overflow-hidden">
                    {l.media?.[0] ? (
                      <>
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                        <img src={l.media[0].url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" alt="" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                        <FaBoxesStacked className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 z-20">
                      <Badge status={l.status} className="shadow-sm backdrop-blur-md bg-white/90" />
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h4 className="font-heading font-bold text-gray-900 text-base line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">{l.title}</h4>
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-medium">Price</span>
                      <span className="text-sm font-heading font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        {l.productDetail?.priceOnRequest ? 'RFQ' : `\u20B9${l.productDetail?.pricePerUnit?.toLocaleString() || '-'}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}


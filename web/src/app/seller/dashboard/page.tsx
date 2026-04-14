'use client';
import { useQuery } from '@tanstack/react-query';
import { FaBoxesStacked, FaStore, FaInbox, FaStar, FaArrowTrendUp, FaArrowRight } from 'react-icons/fa6';
import { AppLayout } from '@/components/layout/AppLayout';
import { listingApi, rfqApi, orderApi } from '@/lib/api';
import { Card, Badge, Button, PageLoader, StatCard, SectionHeader, EmptyState } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ['seller', 'listings-summary'],
    queryFn: () => listingApi.getMine().then(r => r.data),
  });

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto pb-20">
        <div className="mb-8">
          <h1 className="text-xl font-heading font-bold text-jax-dark">
            Seller Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {user?.fullName ? `Welcome back, ${user.fullName.split(' ')[0]}` : 'Manage your store and performance'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          <StatCard label="Active Listings" value={listings?.listings?.filter((l: any) => l.status === 'ACTIVE').length ?? 0} icon={<FaStore className="h-4 w-4" />} />
          <StatCard label="Total Listings" value={listings?.total ?? 0} icon={<FaBoxesStacked className="h-4 w-4" />} />
          <StatCard label="RFQ Matches" value={0} sub="Coming soon" icon={<FaInbox className="h-4 w-4" />} />
          <StatCard label="Avg Rating" value="4.8" sub="Based on 0 reviews" icon={<FaStar className="h-4 w-4" />} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <Card>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-jax-teal/10 text-jax-blue shrink-0">
                <FaStore className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-jax-dark text-sm mb-1">Add Product</h3>
                <p className="text-xs text-gray-400 mb-3">List your products or services on JaxMart</p>
                <Button size="sm" variant="outline" onClick={() => router.push('/seller/listings')}>
                  Manage Listings <FaArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-jax-teal/10 text-jax-blue shrink-0">
                <FaInbox className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-jax-dark text-sm mb-1">RFQ Inbox</h3>
                <p className="text-xs text-gray-400 mb-3">View and respond to buyer requirements</p>
                <Button size="sm" variant="outline" onClick={() => router.push('/seller/rfq-inbox')}>
                  View Inbox <FaArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-jax-teal/10 text-jax-blue shrink-0">
                <FaArrowTrendUp className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-jax-dark text-sm mb-1">Analytics</h3>
                <p className="text-xs text-gray-400 mb-3">View page visits, enquiries, and conversions</p>
                <Button size="sm" variant="outline" disabled>Coming Soon</Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Listings */}
        <SectionHeader title="Recent Listings" action={<Link href="/seller/listings" className="text-sm text-jax-blue font-heading font-semibold">View all</Link>} />
        {listingsLoading ? <PageLoader /> : !(listings?.listings?.length) ? (
          <EmptyState
            icon={<FaStore className="h-10 w-10 text-gray-300" />}
            title="No listings yet"
            description="Create your first product or service listing to start getting enquiries."
            action={<Button onClick={() => router.push('/seller/listings/new')}>Create Listing</Button>}
          />
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {(listings?.listings ?? []).slice(0, 6).map((l: any) => (
              <Card key={l.id} onClick={() => router.push(`/listings/${l.id}`)} className="group" padding={false}>
                <div className="h-32 bg-gray-100 overflow-hidden">
                  {l.media?.[0] ? <img src={l.media[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><FaBoxesStacked className="h-6 w-6" /></div>}
                </div>
                <div className="p-4">
                  <p className="font-heading font-semibold text-jax-dark text-sm truncate mb-1">{l.title}</p>
                  <div className="flex items-center justify-between">
                    <Badge status={l.status} />
                    <span className="text-xs font-heading font-bold text-jax-blue">{l.productDetail?.priceOnRequest ? 'RFQ' : `\u20B9${l.productDetail?.pricePerUnit?.toLocaleString() || '-'}`}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

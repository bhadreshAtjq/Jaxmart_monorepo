'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaCircleCheck, FaFileLines, FaLandmark, FaTruck, FaTriangleExclamation } from 'react-icons/fa6';
import { AppLayout } from '@/components/layout/AppLayout';
import { orderApi } from '@/lib/api';
import { Card, Badge, PageLoader, Avatar, Button, SectionHeader } from '@/components/ui';
import { clsx } from 'clsx';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.get(id as string).then(r => r.data),
  });

  if (isLoading) return <AppLayout><PageLoader /></AppLayout>;
  if (!order) return <AppLayout><div className="text-center py-20"><p className="text-gray-400">Order not found</p></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto pb-20">
        <button onClick={() => router.push('/orders')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-jax-dark mb-6 transition-colors font-heading font-medium">
          <FaArrowLeft className="h-3.5 w-3.5" /> Back to Orders
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge status={order.status} />
                    <span className="label mb-0">Order ID: {order.id}</span>
                  </div>
                  <h1 className="text-xl font-heading font-bold text-jax-dark">Contract Order</h1>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-heading font-extrabold text-jax-blue">{'\u20B9'}{order.totalAmount?.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-emerald-600 bg-emerald-50 inline-block px-2 py-0.5 rounded-lg font-heading font-bold mt-1 uppercase tracking-wider border border-emerald-100">
                    {order.escrowStatus}
                  </p>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="relative flex justify-between mb-12">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 -z-0" />
                {[
                  { label: 'Contract Signed', active: true },
                  { label: 'Payment Held', active: order.escrowStatus !== 'HELD' },
                  { label: 'Delivery', active: order.status === 'COMPLETED' },
                  { label: 'Released', active: order.status === 'COMPLETED' }
                ].map((step, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center">
                    <div className={clsx('h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-heading font-bold', step.active ? 'bg-jax-blue text-white shadow-lg shadow-jax-blue/20' : 'bg-white border-2 border-gray-200 text-gray-400')}>
                      {step.active ? <FaCircleCheck className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <span className={clsx('text-[10px] font-heading font-bold mt-2 uppercase tracking-tighter', step.active ? 'text-jax-blue' : 'text-gray-300')}>{step.label}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="font-heading font-bold text-jax-dark border-b border-gray-100 pb-3 text-sm">Milestones & Payments</h3>
                {order.milestones?.length > 0 ? order.milestones.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between p-4 bg-jax-light rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={clsx('h-8 w-8 rounded-xl flex items-center justify-center', m.status === 'RELEASED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-white text-gray-400 border border-gray-200')}>
                        <FaLandmark className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-sm font-heading font-bold text-jax-dark">{m.title}</p>
                        <p className="label mb-0">Amount: {'\u20B9'}{m.amount?.toLocaleString()}</p>
                      </div>
                    </div>
                    <Badge status={m.status} />
                  </div>
                )) : (
                  <div className="p-4 bg-jax-teal/5 rounded-xl border border-jax-teal/10">
                    <p className="text-sm text-jax-blue font-heading font-medium">Single payment order -- full amount in escrow.</p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-8">
              <SectionHeader title="Logistics & Tracking" />
              <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-jax-light">
                <FaTruck className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500 font-heading font-medium">Tracking details will appear once shipment is initiated</p>
                <Button size="sm" variant="ghost" className="mt-3">Update Address</Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <h3 className="font-heading font-bold text-jax-dark text-sm mb-4">Seller Detail</h3>
              <div className="flex items-center gap-3 mb-5">
                <Avatar name={order.seller?.fullName || 'Seller'} size="md" />
                <div>
                  <p className="font-heading font-bold text-jax-dark text-sm">{order.seller?.businessProfile?.businessName || order.seller?.fullName}</p>
                  <p className="label mb-0">Verified Seller</p>
                </div>
              </div>
              <Button fullWidth variant="outline" icon={<FaFileLines className="h-3.5 w-3.5" />}>Download Contract</Button>
            </Card>

            <Card className="bg-amber-50 border-amber-100 shadow-none">
              <h3 className="font-heading font-bold text-amber-800 flex items-center gap-2 text-sm mb-2">
                <FaTriangleExclamation className="h-3.5 w-3.5" /> Dispute Support
              </h3>
              <p className="text-xs text-amber-700 leading-relaxed mb-4">Issues with delivery? Raise a dispute within 48 hours to hold final payment release.</p>
              <Button fullWidth variant="danger" size="sm">Raise Issue</Button>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

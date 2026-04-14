'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FaArrowLeft, FaFileLines, FaBox, FaUser, 
  FaCircleCheck, FaLandmark, FaTruck, FaTriangleExclamation
} from 'react-icons/fa6';
import { AppLayout } from '@/components/layout/AppLayout';
import { useOrder, useSignContract, useSubmitMilestone, useApproveMilestone, revalidate } from '@/lib/hooks';
import { Card, Badge, Avatar, Button, SectionHeader, Container, OrderDetailSkeleton } from '@/components/ui';
import { useAuthStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { clsx } from 'clsx';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: order, isLoading, mutate } = useOrder(id as string);
  const { user } = useAuthStore();

  const { trigger: signContract, isMutating: signing } = useSignContract(id as string);
  const { trigger: submitMilestone } = useSubmitMilestone(id as string, '');
  const { trigger: approveMilestone } = useApproveMilestone(id as string, '');
  const [showInvoice, setShowInvoice] = useState(false);

  const isBuyer = user?.id === order?.buyerId;
  const isSeller = user?.id === order?.sellerId;

  const handleSign = async () => {
    try {
      await signContract();
      mutate();
      revalidate.orders();
      toast.success('Contract signed successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to sign contract');
    }
  };

  const handleApproveMilestone = async (mId: string) => {
    try {
      await api.post(`/orders/${id}/milestones/${mId}/approve`);
      mutate();
      revalidate.orders();
      toast.success('Milestone approved and payment released!');
    } catch (err: any) {
      toast.error('Failed to approve milestone');
    }
  };

  const handleShipMilestone = async (mId: string) => {
    try {
      await api.post(`/orders/${id}/milestones/${mId}/submit`, { submissionNote: 'Goods shipped' });
      mutate();
      revalidate.orders();
      toast.success('Shipment proof submitted!');
    } catch (err: any) {
      toast.error('Failed to submit milestone');
    }
  };

  if (isLoading) return <AppLayout><OrderDetailSkeleton /></AppLayout>;
  if (!order) return <AppLayout><div className="text-center py-20"><p className="text-gray-400">Order not found</p></div></AppLayout>;

  return (
    <AppLayout>
      {showInvoice && <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />}
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
                  { label: 'Contract Signed', active: !!order.contractSignedAt },
                  { label: 'Payment Held', active: order.escrowStatus !== 'UPCOMING' },
                  { label: 'Delivery', active: order.status === 'SHIPPED' || order.status === 'COMPLETED' },
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
                <h3 className="font-heading font-black text-jax-dark border-b border-gray-100 pb-3 text-[11px] uppercase tracking-widest flex items-center justify-between">
                   Milestones & Value Chain
                   <span className="text-emerald-500">{order.escrowStatus}</span>
                </h3>
                {order.milestones?.length > 0 ? order.milestones.map((m: any) => (
                  <div key={m.id} className="flex flex-col p-6 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:border-jax-blue/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                           <div className={clsx('h-10 w-10 rounded-xl flex items-center justify-center shadow-sm transition-all', m.status === 'RELEASED' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-400 border border-gray-200')}>
                              <FaLandmark className="h-4 w-4" />
                           </div>
                           <div>
                              <p className="text-sm font-black text-jax-dark uppercase tracking-tight">{m.title}</p>
                              <p className="text-xs font-bold text-jax-blue mt-0.5">₹{m.amount?.toLocaleString('en-IN')}</p>
                           </div>
                        </div>
                        <Badge status={m.status} className="h-6 text-[9px] font-black" />
                    </div>

                    {/* Action Bar per Milestone */}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-dashed border-gray-200">
                       {isSeller && m.status === 'PENDING' && (
                          <Button size="sm" className="h-9 px-6 bg-jax-dark text-white rounded-lg" onClick={() => handleShipMilestone(m.id)}>Initiate Shipment</Button>
                       )}
                       {isBuyer && m.status === 'SUBMITTED' && (
                          <Button size="sm" variant="success" className="h-9 px-6 shadow-lg shadow-emerald-500/10" onClick={() => handleApproveMilestone(m.id)}>Verify & Release Fund</Button>
                       )}
                       {m.status === 'SUBMITTED' && (
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic flex items-center gap-1.5 animation-pulse">
                             <FaTruck className="h-3 w-3" /> Awaiting Inspection
                          </span>
                       )}
                    </div>
                  </div>
                )) : (
                  <div className="p-10 bg-jax-blue/5 rounded-[2rem] border border-jax-blue/10 flex flex-col items-center text-center">
                    <FaFileLines className="h-8 w-8 text-jax-blue/20 mb-4" />
                    <p className="text-xs text-jax-blue font-black uppercase tracking-widest">Single payment order -- full amount in escrow.</p>
                    {isSeller && order.status === 'ACTIVE' && (
                       <Button className="mt-6 h-12 px-10 bg-jax-dark text-white rounded-xl font-black text-[10px] uppercase tracking-widest" onClick={() => handleShipMilestone('FULL')}>
                          Initiate Global Shipment
                       </Button>
                    )}
                    {isBuyer && order.status === 'SHIPPED' && (
                       <Button variant="success" className="mt-6 h-12 px-10 shadow-xl shadow-emerald-500/20 font-black text-[10px] uppercase tracking-widest" onClick={() => handleApproveMilestone('FULL')}>
                          Confirm Receipt & Release Fund
                       </Button>
                    )}
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
            <Card className="p-8">
              <h3 className="font-black text-jax-dark text-[11px] uppercase tracking-widest mb-6">Contract Counterparty</h3>
              <div className="flex items-center gap-4 mb-8">
                <Avatar name={order.seller?.businessProfile?.businessName || order.seller?.fullName || 'Seller'} size="lg" className="rounded-2xl shadow-md ring-4 ring-gray-50" />
                <div className="min-w-0">
                  <p className="font-black text-jax-dark text-sm uppercase tracking-tight truncate">{order.seller?.businessProfile?.businessName || order.seller?.fullName}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Verified Industrialist</p>
                </div>
              </div>
              
              {!order.contractSignedAt ? (
                 <Button fullWidth variant="primary" loading={signing} onClick={handleSign} className="h-12 bg-jax-accent text-white border-none shadow-xl shadow-jax-accent/20 font-black text-[10px] uppercase tracking-widest">
                    Sign & Execute Contract
                 </Button>
              ) : (
                 <Button fullWidth variant="outline" className="h-12 border-gray-200 text-gray-400 font-black text-[10px] uppercase tracking-widest cursor-default">
                    <FaCircleCheck className="mr-2 text-emerald-500" /> Contract Executed
                 </Button>
              )}
              
              <Button fullWidth variant="ghost" className="mt-3 text-[9px] font-bold text-jax-blue underline flex items-center gap-2" icon={<FaFileLines className="h-3 w-3" />} onClick={() => setShowInvoice(true)}>View & Print Trade Invoice</Button>
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

function InvoiceModal({ order, onClose }: { order: any, onClose: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:p-0">
      <div className="absolute inset-0 bg-jax-dark/80 backdrop-blur-sm print:hidden" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:rounded-none">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 print:hidden">
          <h2 className="text-xs font-black text-jax-dark uppercase tracking-widest flex items-center gap-2">
            <FaFileLines className="text-jax-accent" /> Commercial Trade Invoice
          </h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} icon={<FaLandmark className="h-3 w-3" />}>Print / Save PDF</Button>
            <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
               <FaArrowLeft className="h-4 w-4 rotate-90" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 print:p-0 print:overflow-visible bg-white" id="invoice-content">
          <div className="flex justify-between items-start mb-16">
            <div>
              <div className="flex items-center gap-2 mb-6">
                 <div className="h-10 w-10 bg-jax-dark text-white font-black flex items-center justify-center text-xl rounded-xl">J</div>
                 <span className="text-2xl font-black text-jax-dark tracking-tighter uppercase">JaxMart</span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Invoice To:</p>
              <h3 className="text-lg font-black text-jax-dark uppercase tracking-tight">{order.buyer?.fullName}</h3>
              <p className="text-xs text-gray-500 font-medium">Verified Trade Partner</p>
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-heading font-black text-jax-dark tracking-tighter uppercase leading-none mb-2">Invoice</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">NO: #INV-{order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">Date of Issue:</p>
              <p className="text-xs font-black text-jax-dark">{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-16 border-t border-b border-gray-100 py-10">
             <div>
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-3">Supplier Information</p>
                <h4 className="text-sm font-black text-jax-dark uppercase mb-1">{order.seller?.businessProfile?.businessName || order.seller?.fullName}</h4>
                <p className="text-xs text-gray-500">GSTIN: {order.seller?.businessProfile?.gstNumber || 'UNREGISTERED'}</p>
             </div>
             <div className="text-right">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-3">Order Context</p>
                <h4 className="text-sm font-black text-jax-dark uppercase mb-1">{order.rfqQuote?.rfq?.title || 'Catalog Procurement'}</h4>
                <p className="text-xs text-gray-500 text-jax-blue font-bold uppercase">Contract: {order.orderType}</p>
             </div>
          </div>

          <table className="w-full mb-16">
             <thead>
                <tr className="border-b-2 border-jax-dark">
                   <th className="py-4 text-left text-[10px] font-black text-jax-dark uppercase tracking-widest">Item Description</th>
                   <th className="py-4 text-center text-[10px] font-black text-jax-dark uppercase tracking-widest">Qty</th>
                   <th className="py-4 text-right text-[10px] font-black text-jax-dark uppercase tracking-widest">Unit Price</th>
                   <th className="py-4 text-right text-[10px] font-black text-jax-dark uppercase tracking-widest">Total</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
                <tr className="py-8">
                   <td className="py-8">
                      <p className="text-base font-black text-jax-dark uppercase tracking-tight">{order.rfqQuote?.rfq?.title || 'Goods Supply'}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-1">Batch ID: #{order.id.slice(0, 8)}</p>
                   </td>
                   <td className="py-8 text-center text-sm font-bold text-jax-dark">1</td>
                   <td className="py-8 text-right text-sm font-bold text-jax-dark">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                   <td className="py-8 text-right text-base font-black text-jax-dark tracking-tight">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                </tr>
             </tbody>
          </table>

          <div className="flex justify-end pt-8 border-t-4 border-gray-50">
             <div className="w-80 space-y-4">
                <div className="flex justify-between items-center text-gray-400">
                   <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                   <span className="font-bold">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                   <span className="text-[10px] font-black uppercase tracking-widest">Platform Fee</span>
                   <span className="font-bold">Managed</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                   <span className="text-sm font-black text-jax-dark uppercase tracking-widest">Grand Total</span>
                   <span className="text-2xl font-black text-jax-accent tracking-tighter">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
             </div>
          </div>

          <div className="mt-20 pt-10 border-t border-gray-50">
             <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest text-center">
                Computer Generated Invoice — No Signature Required. Secured via JaxMart Escrow Ledger.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

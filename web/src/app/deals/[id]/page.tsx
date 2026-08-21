'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FaArrowLeft,
  FaShieldHalved,
  FaBuilding,
  FaUser,
  FaClock,
  FaCoins,
  FaHandshake,
  FaTruckFast,
  FaCircleCheck,
  FaFileContract,
  FaCreditCard,
  FaComments,
} from 'react-icons/fa6';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useDeal, revalidate } from '@/lib/hooks';
import { Card, Badge, Avatar, Button, Container, OrderDetailSkeleton } from '@/components/ui';
import { useAuthStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import { paymentApi, messageApi } from '@/lib/api';
import { clsx } from 'clsx';

export default function DealDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: dealRes, isLoading } = useDeal(id as string);

  const [paying, setPaying] = useState(false);

  const deal = dealRes?.deal;
  const isBuyer = user?.id === deal?.buyerId;
  const isSeller = user?.id === deal?.sellerId;
  const order = deal?.order;

  const handlePayEscrow = async () => {
    if (!order) return;
    setPaying(true);
    try {
      const res = await paymentApi.createOrder(order.id);
      const { razorpayOrderId, amount, currency, keyId } = res.data;

      const options = {
        key: keyId || 'rzp_test_dummy',
        amount: Math.round(amount * 100),
        currency: currency || 'INR',
        name: 'JaxMart Assured Deal Escrow',
        description: `Escrow payment for Deal #${deal.dealNumber}`,
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          try {
            await paymentApi.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order.id,
            });
            toast.success('🎉 Funds deposited into JaxMart Escrow successfully!');
            revalidate.deals();
            revalidate.orders();
          } catch (err: any) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#0D7E83',
        },
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error('Payment gateway initializing, please try again');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to initiate escrow payment');
    } finally {
      setPaying(false);
    }
  };

  const handleStartChat = async () => {
    const recipientId = isBuyer ? deal.sellerId : deal.buyerId;
    try {
      const res = await messageApi.startConversation(
        recipientId,
        `Hello, I would like to discuss our Assured Deal #${deal.dealNumber}`,
        deal.rfqId,
        deal.orderId
      );
      router.push('/inbox');
    } catch (err) {
      router.push('/inbox');
    }
  };

  if (isLoading) return <AppLayout><OrderDetailSkeleton /></AppLayout>;
  if (!deal) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-gray-400">Deal not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto pb-24 pt-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 font-bold"
        >
          <FaArrowLeft className="h-3.5 w-3.5" /> Back
        </button>

        {/* Assured Deal Hero Card */}
        <div className="bg-gradient-to-r from-jungle-green-900 to-jungle-green-950 text-white rounded-3xl p-8 mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-jungle-green-800">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-amber-400 text-gray-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Assured Deal Protected
                </span>
                <span className="text-xs text-jungle-green-300">Deal ID: {deal.dealNumber}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-heading font-black">
                {deal.rfq?.title || 'B2B Purchase Agreement'}
              </h1>
            </div>

            <div className="text-left md:text-right">
              <p className="text-xs text-jungle-green-300 font-bold uppercase tracking-wider">Agreed Deal Value</p>
              <p className="text-3xl font-heading font-black text-amber-300">
                ₹{deal.agreedAmount?.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-jungle-green-300 mt-0.5">
                Escrow Fee: {deal.assuredDealFeePct}% (₹{deal.assuredDealFee?.toLocaleString('en-IN')})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
            <div>
              <p className="text-jungle-green-400 uppercase font-bold text-[10px]">Buyer</p>
              <p className="font-bold text-sm text-white mt-0.5">{deal.buyer?.fullName}</p>
            </div>
            <div>
              <p className="text-jungle-green-400 uppercase font-bold text-[10px]">Seller / Supplier</p>
              <p className="font-bold text-sm text-white mt-0.5">
                {deal.seller?.businessProfile?.businessName || deal.seller?.fullName}
              </p>
            </div>
            <div>
              <p className="text-jungle-green-400 uppercase font-bold text-[10px]">Escrow Status</p>
              <p className="font-bold text-sm text-amber-300 mt-0.5">
                {order?.escrowStatus || 'Awaiting Deposit'}
              </p>
            </div>
          </div>
        </div>

        {/* Milestone & Escrow Workflow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 rounded-3xl">
              <h3 className="text-lg font-heading font-black text-gray-900 mb-4 flex items-center gap-2">
                <FaShieldHalved className="h-4 w-4 text-jungle-green-600" />
                Milestone Escrow Schedule
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                Funds are protected in escrow. Payment is released to supplier only when milestone delivery proofs are approved.
              </p>

              <div className="space-y-4">
                {order?.milestones?.map((milestone: any, index: number) => (
                  <div
                    key={milestone.id}
                    className="border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-4 bg-gray-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-jungle-green-100 text-jungle-green-700 font-black text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{milestone.title}</h4>
                        <p className="text-[11px] text-gray-500">Status: {milestone.status}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-black text-sm text-gray-900">₹{milestone.amount?.toLocaleString('en-IN')}</p>
                      <span className="text-[10px] uppercase font-bold text-jungle-green-700 bg-jungle-green-100 px-2 py-0.5 rounded">
                        {milestone.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {isBuyer && order?.escrowStatus === 'HELD' && order?.paymentStatus !== 'PAID' && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Button
                    onClick={handlePayEscrow}
                    disabled={paying}
                    className="w-full bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-2xl py-3 font-bold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <FaCreditCard className="h-4 w-4" />
                    {paying ? 'Processing...' : `Deposit ₹${deal.agreedAmount?.toLocaleString('en-IN')} into Escrow`}
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Right Sidebar: Contact & Trust */}
          <div className="space-y-6">
            <Card className="p-6 rounded-3xl">
              <h3 className="text-sm font-heading font-black text-gray-900 uppercase tracking-wider mb-4">
                Counterparty Details
              </h3>

              <div className="flex items-center gap-3 mb-4">
                <Avatar
                  name={isBuyer ? deal.seller?.fullName : deal.buyer?.fullName}
                  size="lg"
                />
                <div>
                  <h4 className="font-bold text-sm text-gray-900">
                    {isBuyer
                      ? deal.seller?.businessProfile?.businessName || deal.seller?.fullName
                      : deal.buyer?.fullName}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {isBuyer ? 'Verified Supplier' : 'Corporate Buyer'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Phone:</span>
                  <span className="font-bold text-gray-900">{isBuyer ? deal.seller?.phone : deal.buyer?.phone}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Email:</span>
                  <span className="font-bold text-gray-900">{isBuyer ? deal.seller?.email : deal.buyer?.email}</span>
                </div>
              </div>

              <Button
                onClick={handleStartChat}
                variant="outline"
                className="w-full rounded-2xl font-bold text-xs py-2.5 flex items-center justify-center gap-1.5"
              >
                <FaComments className="h-4 w-4" /> Message Counterparty
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

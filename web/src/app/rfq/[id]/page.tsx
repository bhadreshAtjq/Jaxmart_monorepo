'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FaFileLines,
  FaClock,
  FaCubes,
  FaComment,
  FaCircleCheck,
  FaStar,
  FaArrowLeft,
  FaShieldHalved,
  FaBolt,
  FaAward,
  FaCalendarCheck,
  FaLocationDot,
  FaCoins,
  FaBuilding,
  FaHandshake,
  FaCheck,
  FaArrowRight,
  FaMessage,
} from 'react-icons/fa6';
import { ShieldCheck, Award, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { rfqApi, messageApi } from '@/lib/api';
import { useRfq, revalidate } from '@/lib/hooks';
import { Button, Card, Badge, Avatar, EmptyState, Container, TrustScore, RfqDetailSkeleton } from '@/components/ui';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function RfqDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: rfq, isLoading, mutate } = useRfq(id as string);
  const { user } = useAuthStore();
  const isBuyer = user?.id === rfq?.buyerId;
  const isSeller = user?.userType === 'SELLER' || user?.userType === 'BOTH';

  const [awardingQuoteId, setAwardingQuoteId] = useState<string | null>(null);

  const handleAward = async (quoteId: string) => {
    setAwardingQuoteId(quoteId);
    try {
      const res = await rfqApi.awardQuote(id as string, quoteId);
      mutate();
      revalidate.rfqs();
      revalidate.deals();
      toast.success('🎉 Quote accepted! JaxMart Assured Deal initiated with escrow protection.');
      router.push(`/deals/${res.data.dealId || res.data.deal?.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to award quote');
    } finally {
      setAwardingQuoteId(null);
    }
  };

  const handleStartChat = async (sellerId: string, quoteAmount: number) => {
    try {
      const msg = `Hello, I received your quotation of ₹${quoteAmount.toLocaleString('en-IN')} for "${rfq.title}". Let's discuss specifications and milestone schedule.`;
      const { data: conv } = await messageApi.startConversation(sellerId, msg, rfq.id);
      router.push(`/inbox?id=${conv.id}&recipientId=${sellerId}`);
    } catch {
      router.push('/inbox');
    }
  };

  if (isLoading) return <AppLayout><RfqDetailSkeleton /></AppLayout>;
  if (!rfq) {
    return (
      <AppLayout>
        <Container className="py-24 text-center">
          <EmptyState
            title="RFQ Not Found"
            description="This sourcing request might have expired or been removed."
          />
        </Container>
      </AppLayout>
    );
  }

  const quotes = rfq.quotes || [];

  return (
    <AppLayout>
      <div className="bg-slate-50 min-h-screen pb-24 pt-6">
        <Container size="xl">
          {/* Back button */}
          <button
            onClick={() => router.push(isBuyer ? '/rfq' : '/seller/rfq-inbox')}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors mb-6"
          >
            <FaArrowLeft className="h-3 w-3" /> Back to {isBuyer ? 'My Requests' : 'Lead Inbox'}
          </button>

          {/* Hero RFQ Card */}
          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 md:p-8 shadow-sm mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge status={rfq.status} />
                  <span className="text-xs text-gray-400 font-medium">RFQ #{rfq.id.substring(0, 8)}</span>
                  <div className="h-1 w-1 bg-gray-300 rounded-full" />
                  <span className="text-xs font-bold text-jungle-green-700 bg-jungle-green-50 px-2.5 py-0.5 rounded-lg border border-jungle-green-100">
                    {rfq.category?.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    Posted {formatDistanceToNow(new Date(rfq.createdAt), { addSuffix: true })}
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-heading font-black text-gray-900 tracking-tight">
                  {rfq.title}
                </h1>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 border border-gray-200/80 rounded-2xl p-4 shrink-0">
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Target Budget</p>
                  <p className="text-xl font-heading font-black text-gray-900">
                    {rfq.budgetMin || rfq.budgetMax
                      ? `₹${(rfq.budgetMin || 0).toLocaleString('en-IN')} - ${rfq.budgetMax ? `₹${rfq.budgetMax.toLocaleString('en-IN')}` : 'Open'}`
                      : 'Open to Bids'}
                  </p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Quotes</p>
                  <p className="text-xl font-heading font-black text-jungle-green-700">{quotes.length}</p>
                </div>
              </div>
            </div>

            {/* Requirement Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-gray-100 text-xs">
              <div>
                <span className="text-gray-400 font-bold block mb-0.5">Quantity Required</span>
                <span className="font-bold text-gray-900 text-sm">
                  {rfq.quantity ? `${rfq.quantity} ${rfq.unitOfMeasure || 'Units'}` : 'Not Specified'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-bold block mb-0.5">Delivery Destination</span>
                <span className="font-bold text-gray-900 text-sm flex items-center gap-1">
                  <FaLocationDot className="h-3 w-3 text-red-500" />
                  {rfq.locationPreference || 'Pan India'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-bold block mb-0.5">Supplier Preference</span>
                <span className="font-bold text-gray-900 text-sm">
                  {rfq.preferredProviderType || 'Any Verified Factory'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-bold block mb-0.5">Escrow Protection</span>
                <span className="font-bold text-emerald-700 text-sm flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Guaranteed
                </span>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="pt-6">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-2">Technical Description & Scope</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/60 p-5 rounded-2xl border border-gray-100">
                {rfq.description}
              </p>
            </div>
          </div>

          {/* Sourcing Quotations Matrix */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-heading font-black text-gray-900 tracking-tight">
                  Received Supplier Quotations ({quotes.length})
                </h2>
                <p className="text-xs text-gray-500">
                  Compare prices, milestone schedules, and supplier trust scores.
                </p>
              </div>

              {!isBuyer && !quotes.some((q: any) => q.sellerId === user?.id) && rfq.status === 'OPEN' && (
                <Button
                  onClick={() => router.push(`/rfq/${rfq.id}/quote`)}
                  className="bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-xl font-bold text-xs px-6 py-2.5 shadow"
                >
                  Submit Quote
                </Button>
              )}
            </div>

            {!quotes.length ? (
              <div className="bg-white border border-gray-200/80 rounded-3xl p-12 text-center text-gray-400">
                <FaFileLines className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h4 className="font-bold text-gray-700 text-sm">Waiting for Supplier Quotes</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                  Matched manufacturers have been notified. Incoming proposals will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quotes.map((quote: any) => {
                  const seller = quote.seller;
                  const isWon = quote.status === 'WON';

                  return (
                    <div
                      key={quote.id}
                      className={clsx(
                        'bg-white border rounded-3xl p-6 shadow-sm transition-all flex flex-col justify-between relative overflow-hidden',
                        isWon ? 'border-emerald-300 ring-2 ring-emerald-500/20' : 'border-gray-200 hover:shadow-md'
                      )}
                    >
                      {isWon && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-bl-xl shadow flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Quote Accepted & Awarded
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Supplier info */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <Avatar name={seller?.fullName || 'Supplier'} size="md" />
                            <div>
                              <h4 className="font-bold text-sm text-gray-900">
                                {seller?.businessProfile?.businessName || seller?.fullName}
                              </h4>
                              <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                                <FaCircleCheck className="h-3 w-3" /> Verified Factory
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Trust Score</span>
                            <span className="text-sm font-black text-jungle-green-700 bg-jungle-green-50 px-2 py-0.5 rounded">
                              {seller?.trustScore || 90}/100
                            </span>
                          </div>
                        </div>

                        {/* Quote Amount & Timeline */}
                        <div className="bg-slate-50 border border-gray-200/80 rounded-2xl p-4 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Quoted Price</span>
                            <span className="text-2xl font-heading font-black text-gray-900">
                              ₹{quote.quotedAmount?.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Lead Time</span>
                            <span className="text-sm font-bold text-gray-800 flex items-center gap-1 justify-end">
                              <FaClock className="h-3 w-3 text-jungle-green-600" /> {quote.timelineDays || 7} Days
                            </span>
                          </div>
                        </div>

                        {/* Proposal Cover Text */}
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Proposal Terms</span>
                          <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                            {quote.proposalText || 'Standard manufacturing terms proposed.'}
                          </p>
                        </div>
                      </div>

                      {/* Action CTA for Buyer */}
                      {isBuyer && rfq.status === 'OPEN' && (
                        <div className="flex items-center gap-3 pt-5 border-t border-gray-100 mt-4">
                          <Button
                            onClick={() => handleAward(quote.id)}
                            disabled={awardingQuoteId === quote.id}
                            className="flex-1 bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-xl font-bold text-xs py-3 shadow"
                          >
                            {awardingQuoteId === quote.id ? 'Processing...' : 'Accept Quote & Protect Deal'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleStartChat(quote.sellerId, quote.quotedAmount)}
                            className="px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-1.5"
                          >
                            <FaMessage className="h-3.5 w-3.5" /> Negotiate
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Container>
      </div>
    </AppLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import {
  FaInbox,
  FaClock,
  FaCubes,
  FaArrowRight,
  FaMagnifyingGlass,
  FaLock,
  FaLockOpen,
  FaCoins,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaLocationDot,
  FaShieldHalved,
  FaBolt,
} from 'react-icons/fa6';
import { ShieldCheck, UserCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { useRfqInbox, useEntitlements, revalidate } from '@/lib/hooks';
import { subscriptionApi } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageLoader, EmptyState, Card, Badge, Avatar, Button, Input } from '@/components/ui';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/lib/store';

export default function SellerRfqInboxPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [matchOnly, setMatchOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [unlockingId, setUnlockingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: inbox, isLoading } = useRfqInbox({ matchOnly, search: debouncedSearch });
  const { data: entitlements, mutate: mutateEntitlements } = useEntitlements();

  const handleUnlockLead = async (rfqId: string) => {
    setUnlockingId(rfqId);
    try {
      const res = await subscriptionApi.unlockLead(rfqId);
      toast.success('🎉 Buyer contact details unlocked!');
      revalidate.rfqs();
      mutateEntitlements();
    } catch (err: any) {
      if (err?.response?.data?.code === 'QUOTA_EXHAUSTED') {
        toast.error('Lead quota exhausted! Redirecting to buy credits...');
        router.push('/pricing');
      } else {
        toast.error(err?.response?.data?.error || 'Failed to unlock lead');
      }
    } finally {
      setUnlockingId(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto py-20 px-6 text-center space-y-4">
          <div className="h-16 w-16 bg-jungle-green-50 text-jungle-green-600 rounded-3xl flex items-center justify-center mx-auto">
            <FaInbox className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black font-heading text-gray-900">Sign In to View Leads</h2>
          <p className="text-xs text-gray-600">Please log in to your seller account to view buyer contact details, lead notifications, and RFQ quotes.</p>
          <Button onClick={() => router.push('/auth/login?redirect=/seller/rfq-inbox')} className="w-full bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-xl py-3 font-bold">
            Sign In to Seller Account
          </Button>
        </div>
      </AppLayout>
    );
  }

  const rfqs = (inbox as any)?.rfqs || [];
  const quota = entitlements?.usage;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto pb-20 pt-8">
        {/* Entitlement Quota & Lead Wallet Header */}
        <div className="bg-gradient-to-r from-jungle-green-900 to-jungle-green-950 text-white rounded-3xl p-6 md:p-8 mb-8 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-jungle-green-300 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="h-4 w-4 text-jungle-green-400" />
              Verified Buyer Leads Inbox
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-black tracking-tight">
              High-Intent RFQs & Requirement Board
            </h1>
            <p className="text-xs md:text-sm text-jungle-green-200 mt-1 max-w-xl">
              Respond quickly to high-value purchase requirements from verified procurement managers across India.
            </p>
          </div>

          {quota && (
            <div className="flex items-center gap-4 bg-jungle-green-800/80 border border-jungle-green-700/80 rounded-2xl p-4 shrink-0">
              <div className="text-right">
                <p className="text-[11px] font-bold uppercase tracking-wider text-jungle-green-300">
                  Available Unlocks
                </p>
                <p className="text-2xl font-black text-white">
                  {quota.totalAvailableLeads === 999999 ? 'Unlimited' : quota.totalAvailableLeads}{' '}
                  <span className="text-xs font-normal text-jungle-green-300">leads</span>
                </p>
                <p className="text-[10px] text-jungle-green-300">
                  {quota.remainingLeadQuota} plan quota • {quota.walletCredits} wallet credits
                </p>
              </div>

              <Button
                onClick={() => router.push('/pricing')}
                className="bg-amber-400 hover:bg-amber-500 text-gray-950 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow flex items-center gap-1.5"
              >
                <FaCoins className="h-3.5 w-3.5" /> Top Up
              </Button>
            </div>
          )}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="w-full md:w-96">
            <Input
              placeholder="Search products, materials, requirements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<FaMagnifyingGlass className="h-3.5 w-3.5" />}
              className="bg-white border-gray-200/80 rounded-2xl text-sm"
            />
          </div>

          <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm shrink-0">
            <button
              onClick={() => setMatchOnly(false)}
              className={clsx(
                'px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all',
                !matchOnly ? 'bg-jungle-green-700 text-white shadow' : 'text-gray-500 hover:bg-gray-50'
              )}
            >
              All Requirements ({rfqs.length})
            </button>
            <button
              onClick={() => setMatchOnly(true)}
              className={clsx(
                'px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all',
                matchOnly ? 'bg-jungle-green-700 text-white shadow' : 'text-gray-500 hover:bg-gray-50'
              )}
            >
              Category Matched
            </button>
          </div>
        </div>

        {/* RFQ List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-44 bg-white rounded-3xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : !rfqs.length ? (
          <EmptyState
            icon={<FaInbox className="h-12 w-12 text-gray-300" />}
            title={search ? 'No requirements found' : 'Your Lead Inbox is Ready'}
            description={
              search
                ? `No active RFQs matched your search "${search}". Try different keywords or browse all requests.`
                : 'New buyer inquiries matching your catalog categories will appear here in real-time.'
            }
          />
        ) : (
          <div className="space-y-5">
            {rfqs.map((rfq: any) => {
              const isUnlocked = rfq.isUnlocked;
              const buyer = rfq.buyer;

              return (
                <Card
                  key={rfq.id}
                  className={clsx(
                    'group transition-all duration-200 border rounded-3xl p-6 relative overflow-hidden',
                    isUnlocked
                      ? 'border-jungle-green-200/80 bg-white hover:shadow-md'
                      : 'border-gray-200 bg-gradient-to-b from-white to-gray-50/50'
                  )}
                >
                  <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
                    {/* Left Column: Requirements details */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Badge status={rfq.rfqType} />
                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                          <FaClock className="h-3 w-3" />{' '}
                          {formatDistanceToNow(new Date(rfq.createdAt), { addSuffix: true })}
                        </span>
                        <div className="h-1 w-1 bg-gray-300 rounded-full" />
                        <span className="text-xs text-jungle-green-700 font-bold bg-jungle-green-50 border border-jungle-green-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
                          <FaCubes className="h-3 w-3" /> {rfq.category?.name}
                        </span>
                        {isUnlocked && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                            <FaLockOpen className="h-2.5 w-2.5" /> Contact Unlocked
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg md:text-xl font-heading font-black text-gray-900 group-hover:text-jungle-green-700 transition-colors">
                          {rfq.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                          {rfq.description}
                        </p>
                      </div>

                      {/* Quantity & Location tags */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-2 border-t border-gray-100">
                        {rfq.quantity && (
                          <div>
                            <span className="text-gray-400 font-medium">Quantity Needed:</span>{' '}
                            <strong className="text-gray-900">{rfq.quantity} {rfq.unitOfMeasure || 'Units'}</strong>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-gray-600">
                          <FaLocationDot className="h-3 w-3 text-red-500" />
                          <span>{rfq.locationPreference || rfq.location?.city || 'India'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-medium">Quotes Submitted:</span>{' '}
                          <strong className="text-gray-900">{rfq._count?.quotes ?? 0} Quotes</strong>
                        </div>
                      </div>

                      {/* Buyer Contact Card (Masked vs Unmasked) */}
                      <div
                        className={clsx(
                          'rounded-2xl p-4 border text-xs transition-all',
                          isUnlocked
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        )}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={buyer?.fullName || 'Buyer'} size="md" />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-sm text-gray-900">
                                  {buyer?.fullName || 'Verified Buyer'}
                                </p>
                                {buyer?.trustScore > 0 && (
                                  <span className="text-[10px] font-bold bg-jungle-green-100 text-jungle-green-800 px-2 py-0.2 rounded">
                                    Trust: {buyer.trustScore}/100
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-0.5">
                                <FaBuilding className="h-3 w-3 text-gray-400" />
                                {buyer?.businessName || 'Corporate Buyer'}
                              </p>
                            </div>
                          </div>

                          {isUnlocked ? (
                            <div className="flex flex-wrap items-center gap-3 text-xs">
                              {buyer?.phone && (
                                <a
                                  href={`tel:${buyer.phone}`}
                                  className="flex items-center gap-1.5 bg-white border border-emerald-300 text-emerald-800 font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors"
                                >
                                  <FaPhone className="h-3 w-3 text-emerald-600" /> {buyer.phone}
                                </a>
                              )}
                              {buyer?.email && (
                                <a
                                  href={`mailto:${buyer.email}`}
                                  className="flex items-center gap-1.5 bg-white border border-emerald-300 text-emerald-800 font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors"
                                >
                                  <FaEnvelope className="h-3 w-3 text-emerald-600" /> {buyer.email}
                                </a>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                <FaLock className="h-3 w-3 text-amber-500" /> Phone & Email Masked
                              </span>
                              <Button
                                size="sm"
                                onClick={() => handleUnlockLead(rfq.id)}
                                disabled={unlockingId === rfq.id}
                                className="bg-jungle-green-600 hover:bg-jungle-green-700 text-white font-bold text-xs rounded-xl shadow"
                              >
                                {unlockingId === rfq.id ? 'Unlocking...' : 'Unlock Buyer Contact (1 Credit)'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Budget & Action */}
                    <div className="flex lg:flex-col justify-between items-end lg:items-end w-full lg:w-48 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                      <div className="text-left lg:text-right">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Target Budget</p>
                        <p className="text-xl font-heading font-black text-gray-900">
                          {rfq.budgetMin || rfq.budgetMax ? (
                            `₹${(rfq.budgetMin || 0).toLocaleString('en-IN')} - ${rfq.budgetMax ? `₹${rfq.budgetMax.toLocaleString('en-IN')}` : 'Open'}`
                          ) : (
                            <span className="text-jungle-green-700">Open for Quotes</span>
                          )}
                        </p>
                      </div>

                      <div className="space-y-2 mt-4 w-full sm:w-auto">
                        <Button
                          onClick={() => router.push(`/rfq/${rfq.id}/quote`)}
                          className="w-full bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-xl font-bold text-xs py-2.5 flex items-center justify-center gap-1.5 shadow"
                        >
                          Send Quotation <FaArrowRight className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/rfq/${rfq.id}`)}
                          className="w-full text-xs font-bold rounded-xl py-2"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

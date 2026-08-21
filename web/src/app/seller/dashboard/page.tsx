'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  FaStore,
  FaInbox,
  FaCoins,
  FaShieldHalved,
  FaArrowRight,
  FaPlus,
  FaCreditCard,
  FaFileLines,
  FaHandshake,
  FaUserCheck,
  FaCrown,
  FaChartLine,
} from 'react-icons/fa6';
import { ShieldCheck, Award, TrendingUp, Zap, Users, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge, Button, Card, PageLoader, StatCard, Avatar } from '@/components/ui';
import { useMyListings, useEntitlements, useRfqInbox, useDeals } from '@/lib/hooks';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: listingsData, isLoading: listingsLoading } = useMyListings();
  const { data: entitlements, isLoading: entitlementsLoading } = useEntitlements();
  const { data: rfqData } = useRfqInbox({ limit: 5 });
  const { data: dealsData } = useDeals('seller');

  const activeListings = listingsData?.listings?.filter((l: any) => l.status === 'ACTIVE') || [];
  const quota = entitlements?.usage;
  const plan = entitlements?.plan;
  const recentRfqs = rfqData?.rfqs || [];
  const recentDeals = dealsData?.deals || [];

  const isUnlimitedLeads = plan?.leadQuotaPerCycle === 'Unlimited';
  const usedLeads = quota?.usedLeadQuota || 0;
  const totalQuota = quota?.totalLeadQuota || 10;
  const quotaPercent = isUnlimitedLeads ? 100 : Math.min(100, Math.round((usedLeads / (totalQuota || 1)) * 100));

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50/50 pb-24 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Streamlined Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                  <Award className="h-3 w-3" />
                  {plan?.name || 'Free Tier'}
                </span>
                {user?.kycStatus === 'VERIFIED' ? (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Verified Supplier
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 font-bold uppercase">KYC Pending</span>
                )}
              </div>
              <h1 className="text-2xl font-heading font-black text-gray-900 tracking-tight">
                {user?.businessProfile?.businessName || user?.fullName || 'Seller Command Center'}
              </h1>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link href="/seller/rfq-inbox">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs font-bold border-gray-300 hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <FaInbox className="h-3.5 w-3.5 text-gray-500" /> Lead Inbox ({recentRfqs.length})
                </Button>
              </Link>
              <Link href="/seller/listings/new">
                <Button
                  size="sm"
                  className="bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <FaPlus className="h-3 w-3" /> Add Product
                </Button>
              </Link>
            </div>
          </div>

          {/* Consolidated 5-Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Monthly Lead Quota */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">Monthly Leads</span>
                <Link href="/pricing" className="text-[10px] text-jungle-green-700 font-bold hover:underline">
                  Upgrade
                </Link>
              </div>
              <div>
                <p className="text-xl font-heading font-black text-gray-900">
                  {quota?.remainingLeadQuota ?? 0} <span className="text-xs font-normal text-gray-400">/ {totalQuota} Left</span>
                </p>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-jungle-green-600 h-full rounded-full transition-all"
                    style={{ width: `${quotaPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Wallet Credits */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">Wallet Credits</span>
                <Link href="/pricing" className="text-[10px] text-amber-700 font-bold hover:underline">
                  + Top Up
                </Link>
              </div>
              <p className="text-xl font-heading font-black text-amber-900">
                {quota?.walletCredits ?? 0} <span className="text-xs font-normal text-gray-400">Credits</span>
              </p>
            </div>

            {/* 3. Active Products */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">Catalog SKUs</span>
                <Link href="/seller/listings" className="text-[10px] text-gray-400 hover:text-gray-900">
                  Manage
                </Link>
              </div>
              <p className="text-xl font-heading font-black text-gray-900">
                {activeListings.length}{' '}
                <span className="text-xs font-normal text-gray-400">
                  (Limit: {plan?.listingLimit === -1 ? '∞' : plan?.listingLimit})
                </span>
              </p>
            </div>

            {/* 4. Inquiries Received */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">Matched Leads</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-xl font-heading font-black text-gray-900">
                {recentRfqs.length} <span className="text-xs font-normal text-emerald-700 font-bold">Live</span>
              </p>
            </div>

            {/* 5. Trust Score */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">Trust Score</span>
                <ShieldCheck className="h-3.5 w-3.5 text-jungle-green-600" />
              </div>
              <p className="text-xl font-heading font-black text-jungle-green-800">
                {user?.trustScore || 85} <span className="text-xs font-normal text-gray-400">/ 100</span>
              </p>
            </div>
          </div>

          {/* Clean 2-Column Work Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Recent High-Intent Buyer RFQs */}
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-heading font-black text-gray-900 text-base">
                      Recent Buyer Requirements
                    </h3>
                    <p className="text-xs text-gray-500">Live RFQs matching your supply categories</p>
                  </div>
                  <Link
                    href="/seller/rfq-inbox"
                    className="text-xs font-bold text-jungle-green-700 hover:underline flex items-center gap-1"
                  >
                    View All Leads <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>

                {!recentRfqs.length ? (
                  <div className="text-center py-10 text-gray-400 text-xs">
                    No new inquiries matching your categories right now.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentRfqs.slice(0, 4).map((rfq: any) => (
                      <div
                        key={rfq.id}
                        onClick={() => router.push(`/rfq/${rfq.id}`)}
                        className="border border-gray-100 hover:border-jungle-green-300 rounded-2xl p-4 cursor-pointer hover:bg-slate-50/60 transition-all flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-gray-900 truncate">{rfq.title}</h4>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">
                            {rfq.locationPreference || 'Pan India'} • {rfq.category?.name}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-jungle-green-700 block">
                            {rfq.budgetMax ? `₹${rfq.budgetMax.toLocaleString('en-IN')}` : 'Open Quote'}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {rfq.isUnlocked ? 'Unlocked' : '1 Credit'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 text-center">
                <Link
                  href="/seller/rfq-inbox"
                  className="text-xs font-bold text-jungle-green-700 hover:underline"
                >
                  Go to Lead Inbox to Submit Quotes →
                </Link>
              </div>
            </div>

            {/* Right: Active Assured Deals & Escrow Orders */}
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-heading font-black text-gray-900 text-base">
                      JaxMart Assured Deals
                    </h3>
                    <p className="text-xs text-gray-500">Escrow milestone transactions in progress</p>
                  </div>
                  <Link
                    href="/deals"
                    className="text-xs font-bold text-jungle-green-700 hover:underline flex items-center gap-1"
                  >
                    View All Deals <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>

                {!recentDeals.length ? (
                  <div className="text-center py-10 text-gray-400 text-xs">
                    No active escrow deals. Convert accepted buyer RFQ quotes into Assured Deals.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentDeals.slice(0, 4).map((deal: any) => (
                      <div
                        key={deal.id}
                        onClick={() => router.push(`/deals/${deal.id}`)}
                        className="border border-gray-100 hover:border-jungle-green-300 rounded-2xl p-4 cursor-pointer hover:bg-slate-50/60 transition-all flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-gray-900 truncate">
                            {deal.title || `Deal #${deal.id.substring(0, 8)}`}
                          </h4>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">
                            Buyer: {deal.buyer?.fullName}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-gray-900 block">
                            ₹{deal.totalAmount?.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[9px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {deal.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 text-center">
                <Link
                  href="/deals"
                  className="text-xs font-bold text-jungle-green-700 hover:underline"
                >
                  Manage Escrow Milestones & Proofs →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

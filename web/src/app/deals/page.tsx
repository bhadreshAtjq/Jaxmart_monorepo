'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Container, Card, Badge, Button, Skeleton } from '@/components/ui';
import { useDeals } from '@/lib/hooks';
import { useAuthStore } from '@/lib/store';
import {
  FaShieldHalved,
  FaFileContract,
  FaArrowRight,
  FaClock,
  FaCircleCheck,
  FaHandshake,
  FaBuilding,
  FaTruckFast,
  FaBoxOpen,
  FaMoneyBillWave,
  FaLock,
  FaChevronRight,
} from 'react-icons/fa6';
import { ShieldCheck, Award, TrendingUp, CheckCircle2, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function DealsListPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: dealsData, isLoading } = useDeals();

  const [tab, setTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  // Handle object { success: true, deals: [] } or direct array
  const deals: any[] = dealsData?.deals || (Array.isArray(dealsData) ? dealsData : []);

  const filteredDeals = deals.filter((d: any) => {
    if (tab === 'ACTIVE') return !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(d.status);
    if (tab === 'COMPLETED') return ['COMPLETED', 'SETTLED'].includes(d.status);
    return true;
  });

  const totalEscrowVolume = deals
    .filter((d: any) => ['ESCROW_FUNDED', 'IN_PROGRESS', 'DISPATCHED'].includes(d.status))
    .reduce((sum: number, d: any) => sum + (d.agreedAmount || d.totalAmount || 0), 0);

  return (
    <AppLayout>
      <div className="bg-slate-50 min-h-screen pb-24 pt-6">
        <Container size="xl">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-jungle-green-950 via-slate-900 to-slate-950 text-white rounded-3xl p-8 md:p-10 mb-8 relative overflow-hidden shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-jungle-green-800/80 border border-jungle-green-700/80 text-jungle-green-200 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3">
                  <ShieldCheck className="h-4 w-4 text-amber-400" />
                  JaxMart Assured Escrow Deals
                </div>
                <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tight">
                  Transaction & Escrow Milestone Hub
                </h1>
                <p className="text-xs md:text-sm text-jungle-green-100 mt-1 max-w-xl">
                  Milestone-protected transactions where payments are held in escrow until proof of delivery and quality inspection.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 text-right shrink-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-jungle-green-300 block">
                  Active Escrow Protection
                </span>
                <span className="text-2xl md:text-3xl font-heading font-black text-white">
                  ₹{totalEscrowVolume.toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5">Across all live milestones</p>
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex bg-gray-200/80 p-1 rounded-xl">
              {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={clsx(
                    'px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all',
                    tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {t === 'ALL' ? 'All Contracts' : t === 'ACTIVE' ? 'Active Escrow' : 'Completed'}
                </button>
              ))}
            </div>

            <Link href="/rfq/create">
              <Button className="bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-xl text-xs font-bold px-5 py-2.5 shadow">
                + Create New Deal via RFQ
              </Button>
            </Link>
          </div>

          {/* Deals Grid / List */}
          {isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-3xl" />
              ))}
            </div>
          ) : filteredDeals.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-400 space-y-4">
              <div className="h-16 w-16 bg-jungle-green-50 text-jungle-green-600 rounded-3xl flex items-center justify-center mx-auto border border-jungle-green-100">
                <FaHandshake className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-heading font-black text-gray-900">
                No Assured Deals Found
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                When you negotiate a quote or order on JaxMart, convert it into an Assured Deal for 100% milestone payment escrow protection.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDeals.map((deal: any) => {
                const isBuyer = user?.id === deal.buyerId;
                const counterparty = isBuyer ? deal.seller : deal.buyer;
                const counterpartyName =
                  counterparty?.businessProfile?.businessName || counterparty?.fullName || 'Trade Partner';

                return (
                  <div
                    key={deal.id}
                    onClick={() => router.push(`/deals/${deal.id}`)}
                    className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-jungle-green-300 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <Badge status={deal.status} />
                        <span className="text-xs text-gray-400 font-medium">Deal #{deal.dealNumber || deal.id.substring(0, 8)}</span>
                        <div className="h-1 w-1 bg-gray-300 rounded-full" />
                        <span className="text-xs text-gray-500">
                          {isBuyer ? 'Supplier:' : 'Buyer:'} <strong>{counterpartyName}</strong>
                        </span>
                      </div>

                      <h3 className="font-heading font-black text-gray-900 text-lg hover:text-jungle-green-700 transition-colors truncate">
                        {deal.rfq?.title || `B2B Wholesale Procurement Deal`}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaShieldHalved className="h-3.5 w-3.5 text-jungle-green-600" />
                          Escrow Fee: <strong>{deal.assuredDealFeePct || 2}%</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Created {formatDistanceToNow(new Date(deal.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                          Contract Value
                        </span>
                        <span className="text-2xl font-heading font-black text-gray-900">
                          ₹{(deal.agreedAmount || deal.totalAmount || 0)?.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        className="bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-xl text-xs font-bold px-4 py-2 flex items-center gap-1.5"
                      >
                        Milestones Tracker <FaChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Container>
      </div>
    </AppLayout>
  );
}

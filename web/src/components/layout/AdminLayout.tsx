'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { PageLoader } from '@/components/ui';
import {
  FaShieldHalved, FaPowerOff, FaClock, FaBell, FaChartBar,
  FaFileInvoiceDollar, FaInbox, FaTriangleExclamation, FaUsers,
  FaCalendarDays, FaBuilding, FaRotateRight, FaMagnifyingGlass,
  FaBars, FaXmark, FaReceipt
} from 'react-icons/fa6';
import { useAdminStats, useAdminDepositReceipts, useAdminKycQueue, useAdminListingsQueue, useAdminRefunds, revalidate } from '@/lib/hooks';
import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

export const ADMIN_NAV_SECTIONS = [
  {
    group: 'CORE PLATFORM',
    items: [
      { id: 'overview', label: 'Platform Pulse', icon: FaChartBar, href: '/admin?tab=overview' },
      { id: 'captains', label: 'Captain Operations', icon: FaBuilding, href: '/admin?tab=captains', badgeKey: 'captains' },
      { id: 'subscriptions', label: 'Subscriptions & MRR', icon: FaFileInvoiceDollar, href: '/admin?tab=subscriptions', badgeKey: 'deposits' },
      { id: 'invoices', label: 'Invoices & Refunds', icon: FaReceipt, href: '/admin?tab=invoices', badgeKey: 'refunds' },
    ],
  },
  {
    group: 'GOVERNANCE & TRUST',
    items: [
      { id: 'kyc', label: 'KYC & Verification', icon: FaShieldHalved, href: '/admin?tab=kyc', badgeKey: 'kyc' },
      { id: 'listings', label: 'Inventory Review', icon: FaInbox, href: '/admin?tab=listings', badgeKey: 'listings' },
      { id: 'disputes', label: 'Dispute Center', icon: FaTriangleExclamation, href: '/admin?tab=disputes' },
    ],
  },
  {
    group: 'DIRECTORY & EVENTS',
    items: [
      { id: 'users', label: 'User Master Directory', icon: FaUsers, href: '/admin?tab=users' },
      { id: 'events', label: 'Global Trade Events', icon: FaCalendarDays, href: '/admin?tab=events' },
    ],
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function AdminLayout({ children, activeTab, onTabChange }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoggedIn, logout } = useAuthStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentTab = activeTab || searchParams.get('tab') || 'overview';

  // Live badge counts
  const { data: stats } = useAdminStats();
  const { data: depositsData } = useAdminDepositReceipts(true);
  const { data: kycData } = useAdminKycQueue(true);
  const { data: listingsData } = useAdminListingsQueue(true);
  const { data: refundsData } = useAdminRefunds(true);

  const pendingDepositsCount = depositsData?.receipts?.length || 0;
  const pendingKycCount = kycData?.queue?.length || stats?.kycPending || 0;
  const pendingListingsCount = listingsData?.listings?.length || stats?.listingsPending || 0;
  const pendingRefundsCount = refundsData?.refunds?.filter((r: any) => r.status === 'PENDING_REVIEW')?.length || 0;

  useEffect(() => {
    if (!isLoggedIn || !user?.isAdmin) {
      router.replace('/admin/login');
    }
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || !user?.isAdmin) {
    return <PageLoader />;
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    revalidate.admin();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Admin metrics refreshed');
    }, 600);
  };

  const handleNavClick = (tabId: string) => {
    setMobileSidebarOpen(false);
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      router.push(`/admin?tab=${tabId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex font-sans text-slate-900 antialiased">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={clsx(
          'w-72 bg-slate-950 text-white flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-slate-800/80 shadow-2xl',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/admin" className="flex flex-col gap-2 group">
            <div className="flex items-center gap-3">
              <div className="group-hover:scale-105 transition-transform">
                <Image src="/jaxmart-logo.svg" alt="JaxMart" width={140} height={60} className="h-10 w-auto object-contain" priority />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 ml-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Control Center
            </p>
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-2 text-slate-400 hover:text-white lg:hidden rounded-xl"
          >
            <FaXmark className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6 custom-scrollbar">
          {ADMIN_NAV_SECTIONS.map((section) => (
            <div key={section.group} className="space-y-1.5">
              <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">
                {section.group}
              </p>
              {section.items.map((item) => {
                const isActive = currentTab === item.id;
                const Icon = item.icon;

                // Determine badge
                let badgeVal: number | null = null;
                let badgeColor = 'bg-slate-800 text-slate-300';
                if (item.badgeKey === 'deposits' && pendingDepositsCount > 0) {
                  badgeVal = pendingDepositsCount;
                  badgeColor = 'bg-amber-500 text-slate-950 font-bold';
                } else if (item.badgeKey === 'kyc' && pendingKycCount > 0) {
                  badgeVal = pendingKycCount;
                  badgeColor = 'bg-amber-500 text-slate-950 font-bold';
                } else if (item.badgeKey === 'listings' && pendingListingsCount > 0) {
                  badgeVal = pendingListingsCount;
                  badgeColor = 'bg-indigo-500 text-white font-bold';
                } else if (item.badgeKey === 'refunds' && pendingRefundsCount > 0) {
                  badgeVal = pendingRefundsCount;
                  badgeColor = 'bg-amber-500 text-slate-950 font-bold';
                } else if (item.badgeKey === 'captains') {
                  badgeVal = null; // Can be active captains
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={clsx(
                      'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={clsx(
                          'h-4 w-4 transition-colors',
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                        )}
                      />
                      <span>{item.label}</span>
                    </div>

                    {badgeVal !== null && badgeVal > 0 && (
                      <span className={clsx('text-[10px] px-2 py-0.5 rounded-full', badgeColor)}>
                        {badgeVal}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User / Session Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-black text-sm shrink-0">
                {user.fullName?.[0] || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">System Superuser</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                router.push('/admin/login');
              }}
              title="Terminate Admin Session"
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            >
              <FaPowerOff className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Command Canvas */}
      <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
        {/* Top Sticky Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-6 sm:px-8 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 lg:hidden rounded-xl"
            >
              <FaBars className="h-5 w-5" />
            </button>

            {/* Breadcrumb Info */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-400">Admin</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-slate-800 capitalize">
                {currentTab.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all active:scale-95"
            >
              <FaRotateRight className={clsx('h-3 w-3 text-slate-500', isRefreshing && 'animate-spin text-indigo-600')} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            {/* Quick Status Pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-[11px] font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Production Live</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => toast('No critical system errors logged', { icon: '🛡️' })}
              className="h-9 w-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 relative transition-colors"
            >
              <FaBell className="h-3.5 w-3.5" />
              {(pendingDepositsCount > 0 || pendingKycCount > 0) && (
                <span className="absolute top-2 right-2 h-2 w-2 bg-amber-500 rounded-full ring-2 ring-white" />
              )}
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

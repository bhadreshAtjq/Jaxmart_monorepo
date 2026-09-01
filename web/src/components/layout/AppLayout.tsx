'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  FaHouse, FaMagnifyingGlass, FaFileLines, FaBoxesStacked,
  FaPlus, FaGaugeHigh, FaInbox, FaStore, FaUser,
  FaBell, FaRightFromBracket, FaShieldHalved, FaBolt,
  FaChevronRight, FaGlobe, FaXmark, FaBox, FaClock,
  FaCircleCheck, FaFileInvoiceDollar, FaTriangleExclamation, FaReceipt
} from 'react-icons/fa6';
import { useAuthStore } from '@/lib/store';
import { Avatar, Button, PageLoader } from '@/components/ui';
import { useState, useEffect } from 'react';
import api, { authApi, userApi } from '@/lib/api';
import { useNotifications, useOrderCounts } from '@/lib/hooks';
import { AppTour } from '@/components/common/AppTour';

import Image from 'next/image';

const buyerNav = [
  { href: '/home', icon: FaHouse, label: 'Home' },
  { href: '/search', icon: FaMagnifyingGlass, label: 'Products' },
  { href: '/categories', icon: FaBoxesStacked, label: 'Categories' },
  { href: '/rfq', icon: FaFileLines, label: 'My RFQs' },
  { href: '/deals', icon: FaShieldHalved, label: 'Deals' },
  { href: '/invoices', icon: FaReceipt, label: 'Invoices' },
  { href: '/inbox', icon: FaInbox, label: 'Messages' },
];

const sellerNav = [
  { href: '/seller/dashboard', icon: FaGaugeHigh, label: 'Dashboard' },
  { href: '/seller/rfq-inbox', icon: FaInbox, label: 'Lead Inbox' },
  { href: '/seller/listings', icon: FaStore, label: 'My Products' },
  { href: '/deals', icon: FaShieldHalved, label: 'Assured Deals' },
  { href: '/invoices', icon: FaReceipt, label: 'Invoices' },
  { href: '/pricing', icon: FaFileInvoiceDollar, label: 'Plans & Credits' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, logout, updateUser } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [syncing, setSyncing] = useState(isLoggedIn);

  useEffect(() => { 
    setMounted(true); 
    if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
      router.replace('/auth/login');
    }
  }, [router]);

  useEffect(() => {
    if (isLoggedIn) {
      userApi.getProfile()
        .then((res) => {
          if (res.data) {
            updateUser(res.data);
          }
        })
        .catch((err) => {
          console.error('Failed to sync profile in AppLayout:', err);
          if (err.response?.status === 401) {
            logout();
            router.push('/auth/login');
          }
        })
        .finally(() => {
          setSyncing(false);
        });
    } else {
      setSyncing(false);
    }
  }, [isLoggedIn, updateUser, logout, router]);

  useEffect(() => {
    if (mounted && !syncing && isLoggedIn && user) {
      const isSeller = ['SELLER', 'BOTH'].includes(user.userType);
      const isSellerView = pathname.startsWith('/seller');
      if (isSellerView && !isSeller) {
        router.replace('/home');
      }
    }
  }, [mounted, syncing, isLoggedIn, user, pathname, router]);
  
  const { data: notifications } = useNotifications();
  const { data: counts } = useOrderCounts();
  const unreadNotifications = notifications?.notifications?.filter((n: any) => !n.isRead) ?? [];
  const unreadCount = unreadNotifications.length;

  const [alertModalOpen, setAlertModalOpen] = useState(false);

  useEffect(() => {
    if (unreadCount > 0 && !sessionStorage.getItem('notified_dismissed')) {
      setAlertModalOpen(true);
    }
  }, [unreadCount]);

  const handleDismissAlertModal = () => {
    sessionStorage.setItem('notified_dismissed', 'true');
    setAlertModalOpen(false);
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (err) {}
  };

  const handleAlertNotifClick = async (notif: any) => {
    await handleMarkRead(notif.id);
    setAlertModalOpen(false);
    
    const d = notif.data || {};
    let link = '/notifications';
    if (d.conversationId) link = `/inbox?id=${d.conversationId}`;
    else if (d.orderId) link = `/deals/${d.orderId}`;
    else if (d.rfqId) link = `/rfq/${d.rfqId}`;
    
    router.push(link);
  };

  const isSeller = ['SELLER', 'BOTH'].includes(user?.userType ?? '');
  const isSellerView = pathname.startsWith('/seller');
  const nav = isSellerView ? sellerNav : buyerNav;

  const handleLogout = async () => {
    const rt = localStorage.getItem('refresh_token') ?? '';
    await authApi.logout(rt).catch(() => {});
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFB]">
      <AppTour />
      
      {/* Streamlined Top Navbar */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200/80 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Left section: Logo & Mode Switcher */}
          <div className="flex items-center gap-5">
            <Link id="tour-logo" href={isSellerView ? "/seller/dashboard" : "/home"} className="flex items-center shrink-0 group">
              <Image
                src="/JaxMart_bg.png"
                alt="JaxMart"
                width={130}
                height={40}
                priority
                className="h-9 w-auto object-contain group-hover:scale-[1.02] transition-all"
              />
            </Link>

            {isSeller && (
              <div id="tour-switcher" className="flex rounded-xl bg-gray-100 p-0.5 border border-gray-200">
                <button
                  onClick={() => router.push('/home')}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-wider transition-all',
                    !isSellerView 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  Buying
                </button>
                <button
                  onClick={() => router.push('/seller/dashboard')}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-wider transition-all',
                    isSellerView 
                      ? 'bg-jungle-green-600 text-white shadow-xs' 
                      : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  Selling
                </button>
              </div>
            )}
          </div>

          {/* Center section: Navigation */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1">
              {nav.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || (href !== '/home' && href !== '/seller/dashboard' && pathname.startsWith(href.split('?')[0]));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={clsx(
                      'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5',
                      active
                        ? 'bg-slate-100 text-slate-900 font-bold'
                        : 'text-gray-600 hover:text-slate-900 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 text-gray-400" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right section: Context-Aware Primary Action & Profile */}
          <div className="flex items-center gap-3">
            {isSellerView ? (
              <Link
                href="/seller/listings/new"
                className="hidden sm:flex items-center gap-1.5 px-4 h-9 rounded-xl text-[10px] font-black bg-jungle-green-600 hover:bg-jungle-green-700 text-white shadow-sm uppercase tracking-wider transition-all"
              >
                <FaPlus className="h-3 w-3" />
                Add Product
              </Link>
            ) : (
              <Link
                href="/rfq/create"
                className="hidden sm:flex items-center gap-1.5 px-4 h-9 rounded-xl text-[10px] font-black bg-slate-900 hover:bg-slate-800 text-white shadow-sm uppercase tracking-wider transition-all"
              >
                <FaBolt className="h-3 w-3 text-amber-400" />
                Post RFQ
              </Link>
            )}

            {/* Profile Dropdown */}
            <div id="tour-profile" className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group"
              >
                <Avatar name={user?.fullName ?? 'U'} src={user?.avatarUrl} size="sm" className="h-7 w-7 border border-gray-200" />
                <span className="hidden sm:inline text-xs font-bold text-gray-700 group-hover:text-slate-900 transition-colors max-w-[100px] truncate">
                  {user?.fullName?.split(' ')[0]}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="p-4 border-b border-gray-150 bg-gray-50/50">
                     <p className="text-xs font-bold text-gray-800 truncate">{user?.fullName}</p>
                     <p className="text-[10px] text-gray-500 truncate mt-0.5">{user?.email}</p>
                  </div>
                  
                  <div className="p-2 space-y-1 text-xs">
                     <Link href="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 p-2 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">
                        <FaUser className="h-3.5 w-3.5 text-gray-400" /> My Profile
                     </Link>
                     <Link href="/pricing" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 p-2 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">
                        <FaFileInvoiceDollar className="h-3.5 w-3.5 text-gray-400" /> Plans & Credits
                     </Link>
                     <div className="h-px bg-gray-100 my-1" />
                     <button onClick={handleLogout} className="w-full flex items-center gap-2.5 p-2 rounded-xl text-red-600 hover:bg-red-50 font-bold text-left">
                        <FaRightFromBracket className="h-3.5 w-3.5" /> Log Out
                     </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  FaHouse, FaMagnifyingGlass, FaFileLines, FaBoxesStacked,
  FaPlus, FaGaugeHigh, FaInbox, FaStore, FaUser,
  FaBell, FaRightFromBracket, FaShieldHalved, FaBolt,
  FaChevronRight, FaGlobe, FaXmark, FaBox, FaClock,
  FaCircleCheck, FaFileInvoiceDollar, FaTriangleExclamation
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
  { href: '/rfq', icon: FaFileLines, label: 'My Requests' },
  { href: '/orders', icon: FaBoxesStacked, label: 'My Orders' },
];

const sellerNav = [
  { href: '/seller/dashboard', icon: FaGaugeHigh, label: 'Seller Home' },
  { href: '/seller/rfq-inbox', icon: FaInbox, label: 'Buyer Requests' },
  { href: '/seller/listings', icon: FaStore, label: 'My Products' },
  { href: '/orders?role=seller', icon: FaBoxesStacked, label: 'Orders' },
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
    else if (d.orderId) link = `/orders/${d.orderId}`;
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

  if (!mounted) return null;

  if (syncing && isSellerView) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFB]">
      <AppTour />
      
      {/* Centered Top Navbar */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200/80 z-30 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Left section: Logo & Secure tag */}
          <div className="flex items-center gap-4">
            <Link id="tour-logo" href="/home" className="flex items-center shrink-0 group">
              <Image
                src="/JaxMart_bg.png"
                alt="JaxMart"
                width={100}
                height={38}
                priority
                className="h-8 w-auto object-contain group-hover:scale-[1.02] transition-all duration-300"
              />
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[8px] text-emerald-700 font-mono font-bold tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-[#36ADA3] animate-pulse" />
              SECURE
            </span>
          </div>

          {/* Center section: Navigation & Mode Switcher */}
          <div className="flex items-center gap-6">
            {isSeller && (
              <div id="tour-switcher" className="flex rounded-xl bg-gray-100 p-0.5 border border-gray-200">
                <button
                  onClick={() => router.push('/home')}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-[9px] uppercase font-black tracking-widest transition-all duration-300',
                    !isSellerView 
                      ? 'bg-gradient-to-r from-[#232F72] to-[#2F578A] text-white shadow-sm font-bold' 
                      : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  Buying
                </button>
                <button
                  onClick={() => router.push('/seller/dashboard')}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-[9px] uppercase font-black tracking-widest transition-all duration-300',
                    isSellerView 
                      ? 'bg-gradient-to-r from-[#36ADA3] to-[#2C9A91] text-white shadow-sm font-bold' 
                      : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  Selling
                </button>
              </div>
            )}

            <nav className="hidden md:flex items-center gap-1.5">
              {nav.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || pathname.startsWith(href.split('?')[0] + '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    className={clsx(
                      'px-3 py-1.5 rounded-xl text-xs font-heading font-semibold transition-all duration-300 flex items-center gap-1.5 border border-transparent',
                      active
                        ? 'bg-[#232F72]/[0.03] text-[#232F72] font-bold shadow-[inset_1px_1px_2px_rgba(35,47,114,0.01)]'
                        : 'text-[#2F578A]/80 hover:text-[#232F72] hover:bg-gray-50'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right section: Quick action & Profile */}
          <div className="flex items-center gap-4">
            <Link
              id="tour-rfq-button"
              href="/rfq/create"
              className="hidden md:flex items-center gap-1.5 px-4 h-9 rounded-xl text-[9px] font-heading font-black bg-gradient-to-r from-[#232F72] to-[#2F578A] hover:from-[#1C265B] hover:to-[#244774] text-white shadow-sm shadow-[#232F72]/10 uppercase tracking-widest transition-all duration-300 hover:scale-[1.02]"
            >
              <FaBolt className="h-3 w-3" />
              Post RFQ
            </Link>

            {/* Profile Dropdown */}
            <div id="tour-profile" className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all duration-300 group"
              >
                <div className="relative">
                  <Avatar name={user?.fullName ?? 'U'} src={user?.avatarUrl} size="sm" className="h-7 w-7 border border-gray-200" />
                </div>
                <span className="hidden sm:inline text-xs font-bold text-gray-700 group-hover:text-[#232F72] transition-colors max-w-[100px] truncate">
                  {user?.fullName?.split(' ')[0]}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300 z-50">
                  <div className="p-4 border-b border-gray-150 bg-gray-50/50">
                     <p className="text-[10px] font-black text-gray-800 uppercase tracking-wider truncate">{user?.fullName}</p>
                     <p className="text-[8px] font-bold text-gray-400 uppercase mt-0.5 tracking-wider">
                       {user?.kycStatus === 'VERIFIED' ? 'Verified Account' : 'Registry Pending'}
                     </p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-xs text-gray-600 hover:text-[#232F72] hover:bg-gray-50 transition-all"
                  >
                    <FaUser className="h-3.5 w-3.5 text-[#36ADA3]" /> My Profile
                  </Link>
                  <Link
                    href="/notifications"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center justify-between px-4 py-3.5 text-xs text-gray-600 hover:text-[#232F72] hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <FaBell className="h-3.5 w-3.5 text-[#2F578A]" /> Notifications
                    </div>
                    {unreadCount > 0 && <span className="bg-gradient-to-r from-[#232F72] to-[#2F578A] px-1.5 py-0.5 rounded-full text-[8px] text-white font-black">{unreadCount}</span>}
                  </Link>
                  <div className="p-2 bg-gray-50">
                     <button
                       onClick={handleLogout}
                       className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl text-[10px] font-black text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                     >
                       <FaRightFromBracket className="h-3 w-3" /> Log Out
                     </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen relative flex flex-col">
        {/* Top fade effect */}
        <div className="sticky top-16 h-4 bg-gradient-to-b from-[#F8FAFB] to-transparent z-20 pointer-events-none" />
        
        <div className="flex-1">
           {children}
        </div>
        
        {/* Footer */}
        <footer className="px-12 py-6 border-t border-gray-200/60 bg-white/50 backdrop-blur-sm">
           <div className="max-w-6xl mx-auto flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <span>© JaxMart 2026</span>
              <div className="flex gap-4">
                 <Link href="/terms" className="hover:text-jax-blue transition-colors">Terms</Link>
                 <Link href="/support" className="hover:text-jax-blue transition-colors">Support</Link>
              </div>
           </div>
        </footer>
      </main>

      {/* Real-time Notification Alert Modal */}
      {alertModalOpen && unreadCount > 0 && (
        <div className="fixed inset-0 bg-jax-dark/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl border border-gray-100 max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-jax-blue/5 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-jax-blue/10 flex items-center justify-center text-jax-blue animate-bounce">
                  <FaBell className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-jax-dark uppercase tracking-wider">New Business Activity</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{unreadCount} Action Required {unreadCount > 1 ? 'items' : 'item'}</p>
                </div>
              </div>
              <button 
                onClick={handleDismissAlertModal}
                className="h-7 w-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <FaXmark className="h-3 w-3" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto">
              {unreadNotifications.map((notif: any) => {
                const isRFQ = notif.type === 'RFQ_MATCH';
                const isQuote = notif.type === 'QUOTE_RECEIVED';
                const isOrder = notif.type === 'ORDER_CREATED';
                const isMilestone = notif.type === 'MILESTONE_SUBMITTED' || notif.type === 'MILESTONE_APPROVED';
                
                let Icon = FaBell;
                let colorClass = 'text-gray-500 bg-gray-50';
                if (isRFQ) { Icon = FaStore; colorClass = 'text-jax-blue bg-jax-blue/5 border border-jax-blue/10'; }
                else if (isQuote) { Icon = FaFileInvoiceDollar; colorClass = 'text-jax-teal bg-jax-teal/5 border border-jax-teal/10'; }
                else if (isOrder) { Icon = FaBox; colorClass = 'text-emerald-600 bg-emerald-50 border border-emerald-100'; }
                else if (isMilestone) { Icon = FaClock; colorClass = 'text-amber-600 bg-amber-50 border border-amber-100'; }

                return (
                  <div 
                    key={notif.id}
                    onClick={() => handleAlertNotifClick(notif)}
                    className="flex items-start gap-4 p-3.5 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-150 transition-all cursor-pointer group"
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-black text-jax-dark uppercase tracking-tight truncate group-hover:text-jax-blue transition-colors">
                        {notif.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.body}
                      </p>
                    </div>
                    <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaChevronRight className="h-3 w-3 text-jax-blue" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
              <button 
                onClick={handleDismissAlertModal}
                className="flex-1 h-9 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 text-[9px] font-black uppercase tracking-wider transition-colors"
              >
                Dismiss
              </button>
              <Link href="/notifications" className="flex-1" onClick={() => setAlertModalOpen(false)}>
                <button className="w-full h-9 rounded-xl bg-jax-dark hover:bg-jax-blue text-white text-[9px] font-black uppercase tracking-wider transition-all">
                  View All Alerts
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

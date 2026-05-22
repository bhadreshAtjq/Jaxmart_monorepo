'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  FaHouse, FaMagnifyingGlass, FaFileLines, FaBoxesStacked,
  FaPlus, FaGaugeHigh, FaInbox, FaStore, FaUser,
  FaBell, FaRightFromBracket, FaShieldHalved, FaBolt,
  FaChevronRight, FaGlobe
} from 'react-icons/fa6';
import { useAuthStore } from '@/lib/store';
import { Avatar } from '@/components/ui';
import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';
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
  const { user, isLoggedIn, logout } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    setMounted(true); 
    if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
      router.replace('/auth/login');
    }
  }, [router]);
  
  const { data: notifications } = useNotifications();
  const { data: counts } = useOrderCounts();
  const unreadCount = notifications?.notifications?.filter((n: any) => !n.isRead).length ?? 0;

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

  return (
    <div className="min-h-screen flex bg-[#F8FAFB]">
      <AppTour />
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-[280px] bg-white flex flex-col z-30 shadow-[4px_0_24px_rgba(0,0,0,0.03)] border-r border-gray-200/80 overflow-hidden">
        {/* Soft radial ambient glow */}
        <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-[radial-gradient(circle_at_top_left,rgba(54,173,163,0.05),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-[radial-gradient(circle_at_bottom_right,rgba(47,87,138,0.04),transparent_70%)] pointer-events-none" />

        {/* Brand Header */}
        <div id="tour-logo" className="h-20 flex items-center justify-between px-8 border-b border-gray-200/60 bg-gray-50/50 backdrop-blur-sm relative z-10">
          <Link href="/home" className="flex items-center shrink-0 group">
            <Image
              src="/JaxMart_bg.png"
              alt="JaxMart"
              width={108}
              height={42}
              priority
              className="h-9 w-auto object-contain group-hover:scale-[1.02] transition-all duration-300"
            />
          </Link>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[8px] text-emerald-700 font-mono font-bold tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-[#36ADA3] animate-pulse" />
            SECURE
          </span>
        </div>

        {/* Mode Switcher */}
        {isSeller && (
          <div id="tour-switcher" className="px-6 pt-6 relative z-10">
            <div className="flex rounded-2xl bg-gray-55/60 p-1 border border-gray-200/80 backdrop-blur-sm relative">
              <button
                onClick={() => router.push('/home')}
                className={clsx(
                  'flex-1 py-2.5 rounded-xl text-[9px] uppercase font-black tracking-widest transition-all duration-300 border text-center relative z-10 flex items-center justify-center gap-1.5',
                  !isSellerView 
                    ? 'bg-gradient-to-r from-[#232F72] to-[#2F578A] border-transparent text-white shadow-sm' 
                    : 'text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-100/50'
                )}
              >
                <span>Buying</span>
              </button>
              <button
                onClick={() => router.push('/seller/dashboard')}
                className={clsx(
                  'flex-1 py-2.5 rounded-xl text-[9px] uppercase font-black tracking-widest transition-all duration-300 border text-center relative z-10 flex items-center justify-center gap-1.5',
                  isSellerView 
                    ? 'bg-gradient-to-r from-[#36ADA3] to-[#2C9A91] border-transparent text-white shadow-sm' 
                    : 'text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-100/50'
                )}
              >
                <span>Selling</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav id="tour-nav" className="flex-1 overflow-y-auto px-4 py-8 space-y-1 custom-scrollbar relative z-10">
          <p className="px-4 mb-4 text-[9px] font-black text-[#36ADA3] uppercase tracking-[0.25em] flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#36ADA3]/40" />
            Menu
          </p>
          {nav.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href.split('?')[0] + '/');
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'group flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-heading font-semibold transition-all duration-300 relative overflow-hidden',
                  active
                    ? 'bg-[#232F72]/[0.03] text-[#232F72] border-l-3 border-[#36ADA3] shadow-[inset_1px_1px_2px_rgba(35,47,114,0.01)]'
                    : 'text-[#2F578A]/80 hover:text-[#232F72] hover:bg-gray-50 border-l-3 border-transparent'
                )}
              >
                <div className="flex items-center gap-3.5 relative z-10">
                   <div className={clsx(
                      'p-2 rounded-xl transition-all duration-500', 
                      active 
                        ? 'bg-gradient-to-br from-[#232F72] to-[#2F578A] text-white shadow-sm shadow-[#232F72]/10' 
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200/60 group-hover:text-gray-700 group-hover:scale-[1.05]'
                   )}>
                      <Icon className="h-3.5 w-3.5" />
                   </div>
                   <span className="tracking-tight">{label}</span>
                </div>
                <FaChevronRight className={clsx('h-2.5 w-2.5 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-1', active ? 'text-[#36ADA3]' : 'text-gray-400')} />
              </Link>
            );
          })}

          <div className="pt-8 mt-8 border-t border-gray-100">
            <p className="px-4 mb-4 text-[9px] font-black text-[#36ADA3] uppercase tracking-[0.25em] flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#36ADA3]/40" />
              Quick Actions
            </p>
            <Link
              id="tour-rfq-button"
              href="/rfq/create"
              className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-heading font-black bg-gradient-to-r from-[#232F72] via-[#2F578A] to-[#36ADA3] bg-[size:200%_auto] hover:bg-right text-white transition-all duration-500 shadow-md shadow-[#232F72]/15 uppercase tracking-widest hover:scale-[1.02] active:scale-95 group/btn"
            >
              <FaBolt className="h-3.5 w-3.5 text-white group-hover/btn:animate-bounce" />
              Post a Request
            </Link>
          </div>

          {/* Market Activity Widget */}
          <div className="mt-8 px-5 py-5 rounded-2xl bg-gray-50/50 border border-gray-200/80 overflow-hidden relative group/widget">
             <FaGlobe className="absolute -top-4 -right-4 h-20 w-20 text-gray-400/[0.04] group-hover/widget:scale-125 transition-transform duration-1000" />
             <div className="flex items-center justify-between mb-3.5">
               <p className="text-[8px] font-black text-[#36ADA3] uppercase tracking-widest">Market Activity</p>
               <span className="flex items-center gap-1 text-[8px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                 <span className="h-1 w-1 rounded-full bg-[#36ADA3] animate-pulse" />
                 LIVE
               </span>
             </div>
             <div className="space-y-3">
                <div className="flex justify-between items-end">
                   <span className="text-[10px] font-semibold text-gray-500">Trade Volume</span>
                   <span className="text-[10px] font-black text-emerald-600">+12.4%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200/80 rounded-full overflow-hidden p-[1px]">
                   <div className="h-full w-2/3 bg-gradient-to-r from-[#232F72] to-[#36ADA3] rounded-full" />
                </div>
             </div>
          </div>
        </nav>

        {/* Profile Section */}
        <div id="tour-profile" className="p-4 border-t border-gray-200/80 bg-gray-55/60 backdrop-blur-md relative z-20">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3.5 w-full p-3 rounded-2xl bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100/50 transition-all duration-300 group"
            >
              <div className="relative">
                <Avatar name={user?.fullName ?? 'U'} src={user?.avatarUrl} size="sm" className="border-2 border-[#36ADA3]/20 shadow-sm" />
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-[#232F72] to-[#2F578A] text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg">
                    {unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[11px] font-black text-gray-800 uppercase tracking-wider truncate leading-tight group-hover:text-[#232F72] transition-colors">{user?.fullName}</p>
                <div className="flex items-center gap-1.5 mt-1">
                   {user?.kycStatus === 'VERIFIED' ? (
                      <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 uppercase tracking-widest"><FaShieldHalved className="h-2 w-2" /> Verified</span>
                   ) : (
                      <span className="text-[8px] font-bold text-amber-600 uppercase tracking-widest">Setup Incomplete</span>
                   )}
                </div>
              </div>
            </button>
            
            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-3 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                   <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Account Hub</p>
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
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-[280px] min-h-screen relative flex flex-col">
        {/* Top fade effect */}
        <div className="sticky top-0 h-4 bg-gradient-to-b from-[#F8FAFB] to-transparent z-20 pointer-events-none" />
        
        <div className="flex-1">
           {children}
        </div>
        
        {/* Footer */}
        <footer className="px-12 py-6 border-t border-gray-200/60 bg-white/50 backdrop-blur-sm">
           <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <span>© JaxMart 2026</span>
              <div className="flex gap-4">
                 <Link href="/terms" className="hover:text-jax-blue transition-colors">Terms</Link>
                 <Link href="/support" className="hover:text-jax-blue transition-colors">Support</Link>
              </div>
           </div>
        </footer>
      </main>
    </div>
  );
}

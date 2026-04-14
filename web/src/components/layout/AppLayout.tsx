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

const buyerNav = [
  { href: '/home', icon: FaHouse, label: 'Marketplace Home' },
  { href: '/search', icon: FaMagnifyingGlass, label: 'Source Catalog' },
  { href: '/rfq', icon: FaFileLines, label: 'RFQ Command' },
  { href: '/orders', icon: FaBoxesStacked, label: 'Trade Tracking' },
];

const sellerNav = [
  { href: '/seller/dashboard', icon: FaGaugeHigh, label: 'Merchant Center' },
  { href: '/seller/rfq-inbox', icon: FaInbox, label: 'Sales Pipelines' },
  { href: '/seller/listings', icon: FaStore, label: 'Global Inventory' },
  { href: '/orders?role=seller', icon: FaBoxesStacked, label: 'Fulfillment' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-[280px] bg-jax-dark flex flex-col z-30 shadow-[4px_0_24px_rgba(0,0,0,0.05)] border-r border-white/5">
        {/* Brand Header */}
        <div className="h-20 flex items-center px-8 border-b border-white/[0.04] bg-black/10">
          <Link href="/home" className="flex items-center gap-3.5 group">
            <div className="h-9 w-9 bg-jax-blue border border-white/10 flex items-center justify-center group-hover:bg-jax-teal transition-all duration-500 shadow-xl shadow-black/40 rotate-45 rounded">
              <span className="text-white font-heading font-black text-lg -rotate-45">J</span>
            </div>
            <div>
               <span className="block font-heading font-black text-white text-base tracking-tighter leading-none">JAXMART <span className="text-jax-teal">PRO</span></span>
               <span className="block text-[8px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Industrial Marketplace</span>
            </div>
          </Link>
        </div>

        {/* Console Switcher */}
        {isSeller && (
          <div className="px-6 pt-6">
            <div className="flex rounded-2xl bg-white/[0.03] p-1.5 border border-white/[0.05]">
              <button
                onClick={() => router.push('/home')}
                className={clsx(
                  'flex-1 py-2.5 rounded-xl text-[9px] uppercase font-black tracking-widest transition-all duration-300 border text-center',
                  !isSellerView ? 'bg-jax-blue border-white/10 text-white shadow-xl' : 'text-white/40 border-transparent hover:text-white/60'
                )}
              >
                Procurement
              </button>
              <button
                onClick={() => router.push('/seller/dashboard')}
                className={clsx(
                  'flex-1 py-2.5 rounded-xl text-[9px] uppercase font-black tracking-widest transition-all duration-300 border text-center',
                  isSellerView ? 'bg-jax-teal border-white/10 text-white shadow-xl' : 'text-white/40 border-transparent hover:text-white/60'
                )}
              >
                Supply Chain
              </button>
            </div>
          </div>
        )}

        {/* Global Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-1.5 custom-scrollbar">
          <p className="px-4 mb-4 text-[9px] font-black text-white/50 uppercase tracking-[0.25em]">Navigation Hub</p>
          {nav.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href.split('?')[0] + '/');
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'group flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-heading font-bold transition-all duration-300 relative overflow-hidden',
                  active
                    ? 'bg-white/[0.06] text-white'
                    : 'text-white/60 hover:text-white/90 hover:bg-white/[0.02]'
                )}
              >
                <div className="flex items-center gap-4 relative z-10">
                   <div className={clsx(
                      'p-2 rounded-xl transition-all duration-500', 
                      active ? 'bg-jax-blue text-white' : 'bg-white/[0.06] text-white/50 group-hover:text-white/80'
                   )}>
                      <Icon className="h-3.5 w-3.5" />
                   </div>
                   {label}
                </div>
                {active && <div className="absolute right-0 top-0 bottom-0 w-1 bg-jax-teal rounded-l-full shadow-[0_0_12px_rgba(95,149,152,0.8)]" />}
                <FaChevronRight className={clsx('h-2.5 w-2.5 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-1', active ? 'text-jax-teal' : 'text-white/50')} />
              </Link>
            );
          })}

          <div className="pt-8 mt-8 border-t border-white/[0.04]">
            <p className="px-4 mb-4 text-[9px] font-black text-white/50 uppercase tracking-[0.25em]">Direct Action</p>
            <Link
              href="/rfq/create"
              className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-[10px] font-heading font-black bg-jax-accent text-white hover:bg-jax-blue transition-all duration-300 shadow-xl shadow-jax-accent/20 uppercase tracking-widest"
            >
              <FaBolt className="h-3.5 w-3.5" />
              Initiate Bulk RFQ
            </Link>
          </div>

          {/* Market Pulse Widget */}
          <div className="mt-10 px-4 py-6 rounded-3xl bg-white/[0.02] border border-white/[0.04] overflow-hidden relative group">
             <FaGlobe className="absolute -top-4 -right-4 h-20 w-20 text-white/[0.02] group-hover:scale-125 transition-transform duration-1000" />
             <p className="text-[8px] font-black text-jax-teal uppercase tracking-widest mb-3">Live Market Pulse</p>
             <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <span className="text-[10px] font-bold text-white/70">Verify Trade index</span>
                   <span className="text-xs font-black text-emerald-400">+12.4%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full w-2/3 bg-emerald-400 rounded-full" />
                </div>
             </div>
          </div>
        </nav>

        {/* Persistent Identity Console */}
        <div className="p-4 border-t border-white/[0.04] bg-black/20">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3.5 w-full p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:border-white/10 transition-all duration-300 group"
            >
              <div className="relative">
                <Avatar name={user?.fullName ?? 'U'} src={user?.avatarUrl} size="sm" className="border-2 border-jax-teal/20" />
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-jax-dark rounded-full shadow-sm" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[11px] font-black text-white uppercase tracking-wider truncate leading-tight">{user?.fullName}</p>
                <div className="flex items-center gap-1.5 mt-1">
                   {user?.kycStatus === 'VERIFIED' ? (
                      <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-400 uppercase tracking-widest"><FaShieldHalved className="h-2 w-2" /> Verified Partner</span>
                   ) : (
                      <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">Pending Verification</span>
                   )}
                </div>
              </div>
            </button>
            
            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-3 bg-[#0C1E26] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-4 border-b border-white/[0.04]">
                   <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Workspace Settings</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 text-xs text-white/70 hover:text-white hover:bg-white/[0.04] transition-all"
                >
                  <FaUser className="h-3.5 w-3.5 text-jax-teal" /> Profile & KYC
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 text-xs text-white/70 hover:text-white hover:bg-white/[0.04] transition-all"
                >
                  <FaShieldHalved className="h-3.5 w-3.5 text-amber-500" /> Admin Command
                </Link>
                <Link
                  href="/notifications"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 text-xs text-white/70 hover:text-white hover:bg-white/[0.04] transition-all"
                >
                  <FaBell className="h-3.5 w-3.5 text-jax-blue" /> Communications
                </Link>
                <div className="p-2 bg-black/20">
                   <button
                     onClick={handleLogout}
                     className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl text-[10px] font-black text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                   >
                     <FaRightFromBracket className="h-3 w-3" /> SESSION TERMINATE
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Modern Main Content Area */}
      <main className="flex-1 ml-[280px] min-h-screen relative flex flex-col">
        {/* Top Header Blur effect */}
        <div className="sticky top-0 h-4 bg-gradient-to-b from-[#F8FAFB] to-transparent z-20 pointer-events-none" />
        
        <div className="flex-1">
           {children}
        </div>
        
        {/* Footer info line */}
        <footer className="px-12 py-6 border-t border-gray-200/60 bg-white/50 backdrop-blur-sm">
           <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <span>JaxMart Pro Edition 2026.04.13</span>
              <div className="flex gap-4">
                 <Link href="/terms" className="hover:text-jax-blue transition-colors">Safety Console</Link>
                 <Link href="/support" className="hover:text-jax-blue transition-colors">Trade Ethics</Link>
              </div>
           </div>
        </footer>
      </main>
    </div>
  );
}

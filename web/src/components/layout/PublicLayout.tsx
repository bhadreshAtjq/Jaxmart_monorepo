'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import {
  FaMagnifyingGlass, FaBars, FaXmark, FaUser,
  FaShieldHalved, FaCircleCheck, FaArrowRight, FaChevronRight
} from 'react-icons/fa6';
import { useAuthStore } from '@/lib/store';
import { Avatar, PageLoader, SearchAutocomplete } from '@/components/ui';
import { userApi } from '@/lib/api';
import { useLocationCurrency } from '@/components/providers/LocationCurrencyProvider';

import Image from 'next/image';

const NAV_LINKS = [
  { href: '/home', label: 'Home' },
  { href: '/search', label: 'Products' },
  { href: '/categories', label: 'Categories' },
  { href: '/rfq', label: 'Buyer Requests' },
  { href: '/pricing', label: 'Pricing & Plans' },
];

const AUTH_LINKS = [
  { href: '/orders', label: 'My Orders' },
  { href: '/invoices', label: 'Invoices & Refunds' },
  { href: '/rfq/create', label: 'Post a Request' },
  { href: '/seller/dashboard', label: 'Dashboard' },
  { href: '/seller/rfq-inbox', label: 'Lead Inbox' },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, updateUser } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const [syncing, setSyncing] = useState(isLoggedIn);
  const { countryCode, currency, isLoading } = useLocationCurrency();

  useEffect(() => {
    setMounted(true);

    if (isLoggedIn) {
      userApi.getProfile()
        .then((res) => {
          if (res.data) {
            updateUser(res.data);
          }
        })
        .catch((err) => {
          console.error('Failed to sync profile:', err);
        })
        .finally(() => {
          setSyncing(false);
        });
    } else {
      setSyncing(false);
    }
  }, [isLoggedIn, updateUser]);

  useEffect(() => {
    if (mounted && !syncing && isLoggedIn && user) {
      const isIncomplete = !user.email || user.fullName === 'New User';
      const isAuthPage = pathname.startsWith('/auth');
      if (isIncomplete && !isAuthPage) {
        router.replace('/auth/setup');
      }
    }
  }, [mounted, syncing, isLoggedIn, user, pathname, router]);

  const showAuth = mounted && isLoggedIn;
  const isSeller = user ? ['SELLER', 'BOTH'].includes(user.userType) : false;

  const handleSearch = () => {
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const isCachedIncomplete = isLoggedIn && user && (!user.email || user.fullName === 'New User');
  if (syncing && isCachedIncomplete) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-8 text-[11px]">
          <div className="flex items-center gap-4 text-gray-400">
            <span className="hidden md:flex items-center gap-1"><FaCircleCheck className="h-3 w-3 text-emerald-400" /> Verified Suppliers</span>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:flex items-center gap-1"><FaShieldHalved className="h-3 w-3 text-blue-400" /> Secure Payments</span>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:flex items-center gap-1">
              {!isLoading && countryCode ? (
                <>Ship to: <strong className="text-white">{countryCode}</strong> ({currency.symbol} {currency.code})</>
              ) : (
                <span className="text-gray-500 animate-pulse">Location...</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {showAuth ? (
              <>
                <Link href="/orders" className="text-gray-400 hover:text-white transition-colors">My Orders</Link>
                <span className="text-gray-600">|</span>
                <Link href="/profile" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                  <FaUser className="h-3 w-3" /> {user?.fullName?.split(' ')[0]}
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">Sign In</Link>
                <span className="text-gray-600">|</span>
                <Link href="/auth/login" className="text-jungle-green-400 hover:text-jungle-green-300 transition-colors font-semibold">Join Free</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-6">
            {/* Logo */}
            <Link href="/home" className="flex items-center shrink-0">
              <Image
                src="/JaxMart_bg.png"
                alt="JaxMart"
                width={150}
                height={50}
                priority
                className="h-11 sm:h-12 w-auto object-contain"
              />
            </Link>

            {/* Search Bar with Autocomplete Suggestions */}
            <div className="flex-1 max-w-2xl">
              <SearchAutocomplete compact placeholder="Search products, suppliers, categories..." />
            </div>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href}
                  className={clsx('px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href || pathname.startsWith(link.href + '/') ? 'text-jungle-green-600 bg-jungle-green-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}>
                  {link.label}
                </Link>
              ))}
              {showAuth && (
                <>
                  <Link href="/inbox"
                    className={clsx('px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname.startsWith('/inbox') ? 'text-jungle-green-600 bg-jungle-green-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}>
                    Messages
                  </Link>
                  {isSeller && (
                    <Link href="/seller/dashboard"
                      className={clsx('px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        pathname.startsWith('/seller') ? 'text-jungle-green-600 bg-jungle-green-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      )}>
                      Dashboard
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/rfq/create">
                <button className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-[#232F72] to-[#2F578A] hover:from-[#1C265B] hover:to-[#244774] text-white text-sm font-semibold px-4 h-10 rounded-lg transition-all duration-300 shadow-sm">
                  Post Request
                </button>
              </Link>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-gray-600">
                {mobileOpen ? <FaXmark className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white py-3 px-4 space-y-1">
            {[
              ...NAV_LINKS, 
              ...(showAuth ? [{ href: '/inbox', label: 'Messages' }] : []),
              ...(showAuth ? AUTH_LINKS.filter(link => link.href !== '/seller/dashboard' || isSeller) : [])
            ].map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                {link.label}
              </Link>
            ))}
            {!showAuth && (
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-jungle-green-600 bg-jungle-green-50">
                Sign In / Register
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      {!pathname.startsWith('/inbox') && (
        <footer className="relative bg-[#090b11] text-gray-300 border-t border-gray-800/60 overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#232F72]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#36ADA3]/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
              
              {/* Brand Column */}
              <div className="lg:col-span-2">
                <Link href="/home" className="inline-block mb-6 group">
                  <Image
                    src="/JaxMart_bg.png"
                    alt="JaxMart"
                    width={150}
                    height={50}
                    className="h-11 w-auto object-contain"
                  />
                </Link>
                <p className="text-sm text-gray-400 leading-relaxed font-medium max-w-sm">
                  India's premier B2B marketplace engineered for verified wholesale trade, seamless sourcing, and uncompromising escrow protection.
                </p>
              </div>

              {/* For Buyers */}
              <div>
                <h4 className="text-white text-xs font-black uppercase tracking-widest mb-6">For Buyers</h4>
                <div className="space-y-4 text-sm text-gray-400 font-medium">
                  <Link href="/search" className="flex items-center gap-2 group hover:text-[#36ADA3] transition-colors w-fit">
                    <FaChevronRight className="h-2.5 w-2.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-[#36ADA3]" />
                    Find Products
                  </Link>
                  <Link href="/rfq/create" className="flex items-center gap-2 group hover:text-[#36ADA3] transition-colors w-fit">
                    <FaChevronRight className="h-2.5 w-2.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-[#36ADA3]" />
                    Post a Request
                  </Link>
                  <Link href="/orders" className="flex items-center gap-2 group hover:text-[#36ADA3] transition-colors w-fit">
                    <FaChevronRight className="h-2.5 w-2.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-[#36ADA3]" />
                    My Orders
                  </Link>
                </div>
              </div>

              {/* For Sellers */}
              <div>
                <h4 className="text-white text-xs font-black uppercase tracking-widest mb-6">For Sellers</h4>
                <div className="space-y-4 text-sm text-gray-400 font-medium">
                  <Link href="/seller/dashboard" className="flex items-center gap-2 group hover:text-[#36ADA3] transition-colors w-fit">
                    <FaChevronRight className="h-2.5 w-2.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-[#36ADA3]" />
                    Seller Center
                  </Link>
                  <Link href="/seller/listings/new" className="flex items-center gap-2 group hover:text-[#36ADA3] transition-colors w-fit">
                    <FaChevronRight className="h-2.5 w-2.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-[#36ADA3]" />
                    List Products
                  </Link>
                  <Link href="/seller/rfq-inbox" className="flex items-center gap-2 group hover:text-[#36ADA3] transition-colors w-fit">
                    <FaChevronRight className="h-2.5 w-2.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-[#36ADA3]" />
                    Buyer Requests
                  </Link>
                </div>
              </div>

              {/* Trust & Safety */}
              <div>
                <h4 className="text-white text-xs font-black uppercase tracking-widest mb-6">Trust & Safety</h4>
                <div className="space-y-4 text-sm text-gray-400 font-medium">
                  <span className="flex items-center gap-2 group cursor-default w-fit">
                    <FaShieldHalved className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-500 transition-colors" />
                    <span className="group-hover:text-gray-300 transition-colors">Escrow Protection</span>
                  </span>
                  <span className="flex items-center gap-2 group cursor-default w-fit">
                    <FaCircleCheck className="h-3.5 w-3.5 text-gray-500 group-hover:text-emerald-500 transition-colors" />
                    <span className="group-hover:text-gray-300 transition-colors">Verified Suppliers</span>
                  </span>
                  <span className="flex items-center gap-2 group cursor-default w-fit">
                    <FaCircleCheck className="h-3.5 w-3.5 text-gray-500 group-hover:text-emerald-500 transition-colors" />
                    <span className="group-hover:text-gray-300 transition-colors">Quality Guarantee</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/[0.05] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-2">
                © 2026 JaxMart. All rights reserved.
              </span>
              <div className="flex flex-wrap items-center justify-center gap-6">
                <Link href="/terms" className="hover:text-[#36ADA3] transition-colors">Terms of Use</Link>
                <Link href="/privacy" className="hover:text-[#36ADA3] transition-colors">Privacy Policy</Link>
                <Link href="/contact" className="hover:text-[#36ADA3] transition-colors">Contact Us</Link>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

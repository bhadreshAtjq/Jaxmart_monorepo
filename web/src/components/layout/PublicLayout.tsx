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
  { href: '/rfq', label: 'Buyer Requests' },
];

const AUTH_LINKS = [
  { href: '/orders', label: 'My Orders' },
  { href: '/rfq/create', label: 'Post a Request' },
  { href: '/seller/dashboard', label: 'Dashboard' },
];

export function PublicLayout({ children, hideHeader = false }: { children: React.ReactNode, hideHeader?: boolean }) {
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
      {!hideHeader && (
        <div className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-8 text-[11px]">
            <div className="flex items-center gap-4 text-gray-400">
              <span className="flex items-center gap-1"><FaCircleCheck className="h-3 w-3 text-emerald-400" /> Verified Suppliers</span>
              <span className="hidden md:inline">|</span>
              <span className="hidden md:flex items-center gap-1"><FaShieldHalved className="h-3 w-3 text-blue-400" /> Escrow Protection</span>
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
      )}

      {/* Main Navbar */}
      {!hideHeader && (
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
      )}

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      {!pathname.startsWith('/inbox') && (
        <footer className="relative bg-gradient-to-br from-[#03979B] via-[#0b6483] to-[#122e6e] text-white overflow-hidden font-sans">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pt-16 pb-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-12 mb-16">
              
              {/* About Us */}
              <div>
                <h4 className="text-white text-[15px] font-bold mb-6">About Us</h4>
                <div className="space-y-4 text-[13px] text-white/90">
                  <Link href="#" className="block hover:underline">Why choose Jaxmart.com</Link>
                  <Link href="#" className="block hover:underline">Co-Create Pitch</Link>
                  <Link href="#" className="block hover:underline">Corporate responsibility</Link>
                  <Link href="#" className="block hover:underline">Careers</Link>
                </div>
              </div>

              {/* Order protection */}
              <div>
                <h4 className="text-white text-[15px] font-bold mb-6">Order protection</h4>
                <div className="space-y-4 text-[13px] text-white/90">
                  <Link href="#" className="block hover:underline">Secure payments</Link>
                  <Link href="#" className="block hover:underline">Money-back guarantee</Link>
                  <Link href="#" className="block hover:underline">Guaranteed on-time delivery</Link>
                  <Link href="#" className="block hover:underline">After-sales protections</Link>
                  <Link href="#" className="block hover:underline">Production monitoring & inspection services</Link>
                  <Link href="#" className="block hover:underline">Policies and rules</Link>
                </div>
              </div>

              {/* Source on Jaxmart.com */}
              <div>
                <h4 className="text-white text-[15px] font-bold mb-6">Source on Jaxmart.com</h4>
                <div className="space-y-4 text-[13px] text-white/90">
                  <Link href="#" className="block hover:underline">Verified manufacturers</Link>
                  <Link href="#" className="block hover:underline">Request for Quotation</Link>
                </div>
              </div>

              {/* Help Center */}
              <div>
                <h4 className="text-white text-[15px] font-bold mb-6">Help Center</h4>
                <div className="space-y-4 text-[13px] text-white/90">
                  <Link href="#" className="block hover:underline">Buyer Help Center</Link>
                  <Link href="#" className="block hover:underline">Live chat</Link>
                  <Link href="#" className="block hover:underline">File a trade dispute</Link>
                  <Link href="#" className="block hover:underline">Refunds</Link>
                  <Link href="#" className="block hover:underline">Report IP infringement</Link>
                  <Link href="#" className="block hover:underline">Report a violation</Link>
                </div>
              </div>

              {/* Sell on Jaxmart.com */}
              <div>
                <h4 className="text-white text-[15px] font-bold mb-6">Sell on Jaxmart.com</h4>
                <div className="space-y-4 text-[13px] text-white/90">
                  <Link href="#" className="block hover:underline">Sell on Jaxmart.com</Link>
                  <Link href="#" className="block hover:underline">Start selling</Link>
                  <Link href="#" className="block hover:underline">Check order status</Link>
                  <Link href="#" className="block hover:underline">Become a Verified Supplier</Link>
                  <Link href="#" className="block hover:underline">Partnerships</Link>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <Link href="/home" className="shrink-0">
                <Image
                  src="/Jaxmart_logo.svg"
                  alt="JaxMart"
                  width={150}
                  height={50}
                  className="h-10 w-auto object-contain brightness-0 invert"
                />
              </Link>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-[12px] font-medium text-white">
                <Link href="#" className="hover:underline">Terms of Use</Link>
                <span className="mx-1">|</span>
                <Link href="#" className="hover:underline">Privacy Policy</Link>
                <span className="mx-1">|</span>
                <Link href="#" className="hover:underline">Security Measures</Link>
                <span className="ml-2 font-semibold">Copyright © 2026 Jaxmart. All rights reserved.</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

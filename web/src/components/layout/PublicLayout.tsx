'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import {
  FaMagnifyingGlass, FaBars, FaXmark, FaUser,
  FaShieldHalved, FaCircleCheck, FaArrowRight
} from 'react-icons/fa6';
import { useAuthStore } from '@/lib/store';
import { Avatar } from '@/components/ui';

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

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showAuth = mounted && isLoggedIn;

  const handleSearch = () => {
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-8 text-[11px]">
          <div className="flex items-center gap-4 text-gray-400">
            <span className="flex items-center gap-1"><FaCircleCheck className="h-3 w-3 text-emerald-400" /> Verified Suppliers</span>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:flex items-center gap-1"><FaShieldHalved className="h-3 w-3 text-blue-400" /> Escrow Protection</span>
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
                width={108}
                height={42}
                priority
                className="h-9 w-auto object-contain"
              />
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="flex border border-gray-300 rounded-lg overflow-hidden hover:border-jungle-green-400 focus-within:border-jungle-green-500 focus-within:ring-1 focus-within:ring-jungle-green-200 transition-all">
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Search products, suppliers, categories..."
                  className="flex-1 h-10 px-4 text-sm outline-none"
                />
                <button onClick={handleSearch} className="bg-gradient-to-r from-[#232F72] to-[#2F578A] hover:from-[#1C265B] hover:to-[#244774] text-white px-5 transition-all duration-300">
                  <FaMagnifyingGlass className="h-4 w-4" />
                </button>
              </div>
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
                  <Link href="/seller/dashboard"
                    className={clsx('px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname.startsWith('/seller') ? 'text-jungle-green-600 bg-jungle-green-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}>
                    Dashboard
                  </Link>
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
              ...(showAuth ? AUTH_LINKS : [])
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
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-sm mb-4">JaxMart</h4>
              <p className="text-xs text-gray-400 leading-relaxed">India's trusted B2B marketplace connecting verified suppliers with buyers.</p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4">For Buyers</h4>
              <div className="space-y-2 text-xs text-gray-400">
                <Link href="/search" className="block hover:text-white transition-colors">Find Products</Link>
                <Link href="/rfq/create" className="block hover:text-white transition-colors">Post a Request</Link>
                <Link href="/orders" className="block hover:text-white transition-colors">My Orders</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4">For Sellers</h4>
              <div className="space-y-2 text-xs text-gray-400">
                <Link href="/seller/dashboard" className="block hover:text-white transition-colors">Seller Center</Link>
                <Link href="/seller/listings/new" className="block hover:text-white transition-colors">List Products</Link>
                <Link href="/seller/rfq-inbox" className="block hover:text-white transition-colors">Buyer Requests</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4">Trust & Safety</h4>
              <div className="space-y-2 text-xs text-gray-400">
                <span className="block">Escrow Protection</span>
                <span className="block">Verified Suppliers</span>
                <span className="block">Quality Guarantee</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <span>© 2026 JaxMart. All rights reserved.</span>
            <div className="flex gap-4">
              <span className="hover:text-white cursor-pointer">Terms of Use</span>
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer">Contact Us</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaArrowRight, FaShieldHalved, FaGlobe, FaHandshake, FaBolt, FaUsers, FaChartLine, FaCircleCheck, FaStar, FaUser, FaCamera, FaMagnifyingGlass } from 'react-icons/fa6';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('Products');

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <PublicLayout hideHeader>
      <div className="min-h-screen bg-[#050505] text-white overflow-hidden font-sans">
        
        {/* SOLID HEADER SECTION */}
        <header className="bg-[#03979B] pt-4 px-6 pb-4 relative z-20 shadow-sm">
          {/* Header Row */}
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Image 
                src="/Jaxmart_logo.svg" 
                alt="Jaxmart" 
                width={120} 
                height={35} 
                className="brightness-0 invert object-contain cursor-pointer"
                priority
              />
            </div>

            {/* Search Bar */}
            <div className="hidden lg:flex items-center bg-white rounded-full h-10 w-full max-w-2xl px-2">
              <div className="flex items-center text-gray-500 text-xs font-semibold px-3 border-r border-gray-200 h-6 cursor-pointer">
                Product <span className="ml-2 text-[8px]">▼</span>
              </div>
              <input type="text" placeholder="Enter Product / Service to search" className="flex-1 px-4 text-sm outline-none text-gray-800" />
              <button className="h-7 w-7 rounded-full bg-[#1C3A7A] flex items-center justify-center text-white shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>

            {/* Right Nav */}
            <div className="flex items-center gap-4">
              <button className="bg-white text-[#1C3A7A] px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors">
                Become a Seller
              </button>
              
              <div className="flex items-center gap-1 bg-white text-[#1C3A7A] px-3 py-2 rounded-full text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors">
                Eng <span className="text-[10px] ml-1">▼</span>
              </div>

              <div className="w-9 h-9 rounded-full bg-[#1C3A7A] flex items-center justify-center relative cursor-pointer hover:bg-[#162f63] transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>

              <Link href="/auth/login" className="bg-[#1C3A7A] text-white px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-[#162f63] transition-colors">
                <FaUser className="w-3.5 h-3.5" />
                Login
              </Link>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="max-w-7xl mx-auto w-full flex justify-end gap-6 text-sm text-white/90 font-medium mt-3 px-2">
            <span className="cursor-pointer hover:text-white transition-colors">About Us</span>
            <span className="cursor-pointer hover:text-white transition-colors flex items-center gap-1">Buyer Services <span className="text-[8px]">▼</span></span>
            <span className="cursor-pointer hover:text-white transition-colors flex items-center gap-1">Seller Services <span className="text-[8px]">▼</span></span>
          </div>
        </header>

        {/* HERO SECTION matching the image */}
        <section className="relative z-30 pb-32 pt-8 flex flex-col px-6 overflow-visible bg-gradient-to-br from-[#03979B] to-[#0E367A]">
          {/* Faded arrows background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Left Arrow */}
            <svg className="absolute -left-[97px] -bottom-[129px] w-[550px] h-[550px] opacity-[0.06] text-white transform rotate-[45deg]" fill="currentColor" viewBox="-10 -10 120 120">
              <path strokeLinejoin="round" strokeWidth="8" stroke="currentColor" d="M 50 0 L 20 30 H 40 V 100 H 60 V 30 H 80 Z" />
            </svg>
            {/* Right Arrow */}
            <svg className="absolute -right-[97px] -bottom-[129px] w-[550px] h-[550px] opacity-[0.06] text-white transform -rotate-[45deg]" fill="currentColor" viewBox="-10 -10 120 120">
              <path strokeLinejoin="round" strokeWidth="8" stroke="currentColor" d="M 50 0 L 20 30 H 40 V 100 H 60 V 30 H 80 Z" />
            </svg>
          </div>

          {/* Main Content */}
          <div className="relative z-10 max-w-3xl mx-auto w-full flex flex-col items-center text-center">
            <div className="border border-white/30 rounded-full px-5 py-1.5 text-xs font-medium text-white mb-6">
              Indian's Trusted B2B Marketplace
            </div>
            <p className="text-white text-sm mb-12 font-medium opacity-90 max-w-2xl leading-relaxed">
              Find the right products, verified suppliers, and competitive prices—all in one AI-powered search.
            </p>

            <div className="flex items-center gap-10 mb-8">
              <div 
                onClick={() => setActiveTab('AI')}
                className={`group text-2xl font-bold cursor-pointer flex items-center transition-all ${activeTab === 'AI' ? 'text-[#4FD1C5] relative pb-1.5' : 'text-white opacity-80 hover:text-[#4FD1C5] hover:opacity-100 relative pb-1.5'}`}
              >
                AI Mode
                <div className="relative w-4 h-4 ml-1 -mt-3">
                  <svg viewBox="0 0 24 24" className={`w-3 h-3 absolute bottom-0 left-0 transition-colors ${activeTab === 'AI' ? 'text-[#4FD1C5]' : 'text-[#1EE9B6] group-hover:text-[#4FD1C5]'}`} fill="currentColor">
                    <path d="M12 0l2.2 9.8L24 12l-9.8 2.2L12 24l-2.2-9.8L0 12l9.8-2.2z" />
                  </svg>
                  <svg viewBox="0 0 24 24" className={`w-2 h-2 absolute top-0 right-0 transition-colors ${activeTab === 'AI' ? 'text-[#4FD1C5]' : 'text-[#1EE9B6] group-hover:text-[#4FD1C5]'}`} fill="currentColor">
                    <path d="M12 0l2.2 9.8L24 12l-9.8 2.2L12 24l-2.2-9.8L0 12l9.8-2.2z" />
                  </svg>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-[4px] bg-[#4FD1C5] rounded-full transition-all duration-300 ${activeTab === 'AI' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'}`} />
              </div>
              <div 
                onClick={() => setActiveTab('Products')}
                className={`group text-2xl font-bold cursor-pointer relative pb-1.5 transition-all ${activeTab === 'Products' ? 'text-[#4FD1C5]' : 'text-white opacity-80 hover:text-[#4FD1C5] hover:opacity-100'}`}
              >
                Products
                <div className={`absolute bottom-0 left-0 right-0 h-[4px] bg-[#4FD1C5] rounded-full transition-all duration-300 ${activeTab === 'Products' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'}`} />
              </div>
              <div 
                onClick={() => setActiveTab('Manufacturers')}
                className={`group text-2xl font-bold cursor-pointer relative pb-1.5 transition-all ${activeTab === 'Manufacturers' ? 'text-[#4FD1C5]' : 'text-white opacity-80 hover:text-[#4FD1C5] hover:opacity-100'}`}
              >
                Manufacturers
                <div className={`absolute bottom-0 left-0 right-0 h-[4px] bg-[#4FD1C5] rounded-full transition-all duration-300 ${activeTab === 'Manufacturers' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'}`} />
              </div>
            </div>
            
            {/* The Floating Search Card */}
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] p-5 flex flex-col h-[200px] absolute top-full left-1/2 -translate-x-1/2 -mt-4 z-20">
              <div className="text-left text-gray-800 text-[15px] font-bold flex-1 pt-2 px-2">
                Smart Watch
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                <button className="border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors rounded-lg px-4 py-2.5 flex items-center gap-2 text-gray-600 text-[13px] font-semibold">
                  <FaCamera className="w-4 h-4 text-gray-400" /> Image Search
                </button>
                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 rounded-full border border-gray-200 hover:border-[#02A499] hover:bg-teal-50 flex items-center justify-center text-[#02A499] transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <button className="bg-[#02A499] hover:bg-[#028b84] text-white rounded-lg text-sm font-bold px-8 py-2.5 flex items-center gap-2 transition-colors shadow-lg shadow-teal-500/20">
                    <FaMagnifyingGlass className="w-3.5 h-3.5" /> Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Spacer to prevent overlap with the floating card */}
        <div className="h-32 bg-white relative z-10"></div>

        {/* PROMO BANNER SECTION */}
        <div className="bg-white w-full pb-20 relative z-10">
          <section className="relative z-20 px-6 max-w-7xl mx-auto -mt-8">
            <div className="w-full bg-[#074C8D] rounded-2xl flex items-stretch overflow-hidden shadow-2xl relative min-h-[460px]">
            {/* Left Sidebar */}
            <div className="w-[300px] bg-black/20 p-4 flex flex-col gap-2.5 relative z-10 border-r-4 border-white/40 my-5 ml-5 rounded-2xl">

              <div className="bg-gradient-to-r from-[#00a2b0] to-[#00388b] text-white font-bold text-[13px] px-5 py-3.5 rounded-lg shadow-md text-center">All categories</div>
              {[
                "Construction",
                "Electronics",
                "Industrial suppliers",
                "Service",
                "Textile"
              ].map((cat, i) => (
                <div key={i} className="bg-white text-gray-700 font-bold text-[13px] px-5 py-3.5 rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer transition-colors text-center">
                  {cat}
                </div>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 px-16 py-12 flex items-center justify-between relative z-10">
              <div className="max-w-lg mt-8">
                <h4 className="text-white/90 text-[15px] font-semibold mb-4 tracking-wide">New Arrival</h4>
                <h2 className="text-white text-[52px] font-black mb-6 leading-[1.05] tracking-tight">
                  Smartwatch<br/>Everyday
                </h2>
                <div className="h-[4px] w-16 bg-white mb-4 rounded-full"></div>
                <p className="text-white text-[20px] font-medium tracking-wide">Track.Achieve.Inspire.</p>
              </div>

              {/* Blank area for image (Image Placeholder) */}
              <div className="w-[320px] h-[320px] mr-12 rounded-full border-4 border-dashed border-white/20 bg-black/5 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white/50 font-bold text-sm">Image Placeholder</span>
              </div>

              {/* Navigation Arrows */}
              <div className="absolute bottom-8 right-8 flex items-center gap-3">
                <button className="w-9 h-9 rounded-full border border-white text-white flex items-center justify-center hover:bg-white/20 transition-colors">
                  <svg className="w-4 h-4 ml-[-1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="w-9 h-9 rounded-full bg-white text-[#5c7c58] flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg">
                  <svg className="w-4 h-4 mr-[-1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
        </div>

        {/* NEW ARRIVAL CAROUSEL SECTION */}
        <section className="bg-white w-full py-16 relative z-10 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Header */}
            <div className="lg:w-40 flex flex-col justify-between shrink-0">
              <h2 className="text-[36px] font-black text-gray-900 leading-[1.1] tracking-tight mt-4">
                New<br />Arrival
              </h2>
              <div className="flex items-center gap-2 mt-8 lg:mt-0 pb-2">
                <button className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-400 ml-[-2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="w-9 h-9 rounded-full bg-[#074C8D] flex items-center justify-center shadow-md hover:bg-[#063a6b] transition-colors">
                  <svg className="w-4 h-4 text-white mr-[-2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right Cards Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1 */}
              <div className="border border-gray-200 rounded-[14px] overflow-hidden bg-white hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="aspect-square bg-gray-50 relative overflow-hidden border-b border-gray-100">
                  <img src="https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=400&q=80" alt="Massage Chair" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 text-gray-300 hover:text-red-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[13px] text-gray-900 leading-[1.3] line-clamp-2 min-h-[34px] mb-2.5">
                    Manufacturers Wholesale Massage Chair Home Fu...
                  </h3>
                  <div className="text-[#03979B] font-bold text-sm mb-1">₹ 22,844.18</div>
                  <div className="text-[11px] text-gray-500 font-medium">100 Pieces</div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="border border-gray-200 rounded-[14px] overflow-hidden bg-white hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="aspect-square bg-gray-50 relative overflow-hidden border-b border-gray-100">
                  <img src="https://images.unsplash.com/photo-1631679700024-046cb87889ff?auto=format&fit=crop&w=400&q=80" alt="Mattress" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 text-gray-300 hover:text-red-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[13px] text-gray-900 leading-[1.3] line-clamp-2 min-h-[34px] mb-2.5">
                    2inch 4inch Gel Memory Foam Mattress Topper Hot Sa...
                  </h3>
                  <div className="text-[#03979B] font-bold text-sm mb-1">₹ 1,489.84</div>
                  <div className="text-[11px] text-gray-500 font-medium">500-999 pieces</div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="border border-gray-200 rounded-[14px] overflow-hidden bg-white hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="aspect-square bg-gray-50 relative overflow-hidden border-b border-gray-100">
                  <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80" alt="Truck" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 text-gray-300 hover:text-red-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[13px] text-gray-900 leading-[1.3] line-clamp-2 min-h-[34px] mb-2.5">
                    3 Lines 6 Axles 150 Tons Heavy Duty Steel Front Load...
                  </h3>
                  <div className="text-[#03979B] font-bold text-sm mb-1">₹ 5,46,273.75</div>
                  <div className="text-[11px] text-gray-500 font-medium">5-9 units</div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="border border-gray-200 rounded-[14px] overflow-hidden bg-white hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="aspect-square bg-gray-50 relative overflow-hidden border-b border-gray-100">
                  <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=400&q=80" alt="Floor" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 text-gray-300 hover:text-red-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[13px] text-gray-900 leading-[1.3] line-clamp-2 min-h-[34px] mb-2.5">
                    Raised Access Floor with HPL/ PVC Anti Static / 1250I...
                  </h3>
                  <div className="text-[#03979B] font-bold text-sm mb-1">₹ 496.62</div>
                  <div className="text-[11px] text-gray-500 font-medium">1000 Pieces</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* HOT CATEGORIES PROMO SECTION */}
        <section className="bg-white w-full py-16 relative z-10 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="w-full flex flex-col md:flex-row rounded-[12px] overflow-hidden shadow-sm border border-gray-200">
              {/* Left Side (Red Banner) */}
              <div className="w-full md:w-[32%] bg-[#9A3B31] p-10 md:p-14 flex flex-col justify-center">
                <h2 className="text-white text-[32px] lg:text-[40px] font-bold leading-[1.2] mb-8 tracking-tight">
                  Find<br/>
                  Leading<br/>
                  Suppliers In<br/>
                  Hot<br/>
                  Categories
                </h2>
                <div className="w-12 h-[3px] bg-white"></div>
              </div>
              
              {/* Right Side (Image) */}
              <div className="w-full md:w-[68%] relative min-h-[350px] md:min-h-[450px] bg-[#F4E1CA]">
                <img 
                  src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80" 
                  alt="Hot Categories Handbags" 
                  className="absolute inset-0 w-full h-full object-cover" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS SECTION */}
        <section className="bg-white w-full py-16 relative z-10 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Header */}
            <div className="lg:w-40 flex flex-col justify-between shrink-0">
              <h2 className="text-[32px] md:text-[36px] font-black text-gray-900 leading-[1.1] tracking-tight mt-4">
                Featured<br />Products
              </h2>
              <div className="flex items-center gap-2 mt-8 lg:mt-0 pb-2">
                <button className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-400 ml-[-2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="w-9 h-9 rounded-full bg-[#074C8D] flex items-center justify-center shadow-md hover:bg-[#063a6b] transition-colors">
                  <svg className="w-4 h-4 text-white mr-[-2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right Cards Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1 */}
              <div className="border border-gray-200 rounded-[14px] overflow-hidden bg-white hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col">
                <div className="aspect-square bg-gray-50 relative overflow-hidden border-b border-gray-100 shrink-0">
                  <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80" alt="Eyeshadow" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-[13px] text-gray-900 leading-[1.3] line-clamp-2 min-h-[34px] mb-2">
                    Single Eyeshadow 5g Dry Powder Form Dark Fai...
                  </h3>
                  <a href="#" className="text-[10px] text-[#074C8D] hover:underline truncate mb-3 block">
                    EU Cosmetic Compliance
                  </a>
                  <div className="mt-auto">
                    <div className="flex items-end gap-1.5 mb-2.5">
                      <div className="text-[#03979B] font-bold text-[13px] leading-none">₹ 128.15</div>
                      <div className="text-[10px] text-gray-500 leading-none pb-[1px]">500-999 pieces</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-800">
                      <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.8 14.8L6 12.6l1.4-1.4 2.8 2.8 7.2-7.2 1.4 1.4-8.6 8.6z"/></svg>
                      <span className="text-[11px] font-bold">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="border border-gray-200 rounded-[14px] overflow-hidden bg-white hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col">
                <div className="aspect-square bg-gray-50 relative overflow-hidden border-b border-gray-100 shrink-0">
                  <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80" alt="Sneakers" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-[13px] text-gray-900 leading-[1.3] line-clamp-2 min-h-[34px] mb-2">
                    New Arrival Multifunctional Cordless Power Drill Com...
                  </h3>
                  <a href="#" className="text-[10px] text-[#074C8D] hover:underline truncate mb-3 block">
                    Guangzhou Airwoods Environ...
                  </a>
                  <div className="mt-auto">
                    <div className="flex items-end gap-1.5 mb-2.5">
                      <div className="text-[#03979B] font-bold text-[13px] leading-none">₹ 4,928.72</div>
                      <div className="text-[10px] text-gray-500 leading-none pb-[1px]">500-999 pieces</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-800">
                      <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.8 14.8L6 12.6l1.4-1.4 2.8 2.8 7.2-7.2 1.4 1.4-8.6 8.6z"/></svg>
                      <span className="text-[11px] font-bold">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="border border-gray-200 rounded-[14px] overflow-hidden bg-white hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col">
                <div className="aspect-square bg-gray-50 relative overflow-hidden border-b border-gray-100 shrink-0">
                  <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80" alt="Neck Relax" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-[13px] text-gray-900 leading-[1.3] line-clamp-2 min-h-[34px] mb-2">
                    2026 New Arrival Trending Products TENS and EMS ...
                  </h3>
                  <a href="#" className="text-[10px] text-[#074C8D] hover:underline truncate mb-3 block">
                    Shenzhen Jane Eyre Kang Tech...
                  </a>
                  <div className="mt-auto">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <div className="text-[#03979B] font-bold text-[13px] leading-none shrink-0">₹ 256.30</div>
                      <div className="text-[9px] text-gray-500 leading-[1.2]">Minimum order<br/>quantity: 2 pieces</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-800">
                      <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.8 14.8L6 12.6l1.4-1.4 2.8 2.8 7.2-7.2 1.4 1.4-8.6 8.6z"/></svg>
                      <span className="text-[11px] font-bold">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="border border-gray-200 rounded-[14px] overflow-hidden bg-white hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col">
                <div className="aspect-square bg-gray-50 relative overflow-hidden border-b border-gray-100 shrink-0">
                  <img src="https://images.unsplash.com/photo-1519634937225-b44e73b22384?auto=format&fit=crop&w=400&q=80" alt="Swan Boat" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-[13px] text-gray-900 leading-[1.3] line-clamp-2 min-h-[34px] mb-2">
                    Factory Sale Lovely Cartoon Tube Swan Bumper Bo...
                  </h3>
                  <a href="#" className="text-[10px] text-[#074C8D] hover:underline truncate mb-3 block">
                    Zhengzhou Joy2fun Amuseme...
                  </a>
                  <div className="mt-auto">
                    <div className="flex items-end gap-1.5 mb-2.5">
                      <div className="text-[#03979B] font-bold text-[13px] leading-none">₹ 27,502.22</div>
                      <div className="text-[10px] text-gray-500 leading-none pb-[1px]">30-99 pieces</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-800">
                      <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.8 14.8L6 12.6l1.4-1.4 2.8 2.8 7.2-7.2 1.4 1.4-8.6 8.6z"/></svg>
                      <span className="text-[11px] font-bold">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* PRODUCT CATEGORIES BENTO GRID SECTION */}
        <section className="bg-white w-full py-16 relative z-10 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-auto md:h-[500px]">
              
              {/* Top Left: Smart Power */}
              <div className="relative bg-[#E8F1FA] overflow-hidden group cursor-pointer h-[250px] md:h-auto md:col-start-1 md:row-start-1">
                <img src="https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&w=600&q=80" alt="Smart Power & Charging" className="absolute inset-0 w-full h-full object-cover object-right-bottom group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 p-6 md:p-8 bg-gradient-to-r from-white/80 to-transparent">
                  <h3 className="font-bold text-gray-900 text-lg md:text-xl leading-tight mb-3">Smart Power<br/>& Charging</h3>
                  <div className="w-8 h-[2px] bg-gray-900"></div>
                </div>
              </div>

              {/* Bottom Left: Skincare */}
              <div className="relative bg-[#F8EFE3] overflow-hidden group cursor-pointer h-[250px] md:h-auto md:col-start-1 md:row-start-2">
                <img src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80" alt="Skincare & Sun Protection" className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 p-6 md:p-8 bg-gradient-to-r from-white/70 to-transparent">
                  <h3 className="font-bold text-gray-900 text-lg md:text-xl leading-tight mb-3">Skincare & Sun<br/>Protection</h3>
                  <div className="w-8 h-[2px] bg-gray-900"></div>
                </div>
              </div>

              {/* Center Large: Product Categories */}
              <div className="relative bg-[#34244E] overflow-hidden group cursor-pointer h-[400px] md:h-auto md:col-start-2 md:row-start-1 md:row-span-2">
                <img src="https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80" alt="Product Categories" className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 p-8 md:p-10 bg-gradient-to-b from-black/60 via-transparent to-transparent">
                  <h2 className="font-bold text-white text-[32px] md:text-[40px] leading-[1.15] mb-5 tracking-tight">Product<br/>Categories</h2>
                  <div className="w-12 h-[3px] bg-white"></div>
                </div>
              </div>

              {/* Top Right: Clean Beauty */}
              <div className="relative bg-[#FFE1DE] overflow-hidden group cursor-pointer h-[250px] md:h-auto md:col-start-3 md:row-start-1">
                <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80" alt="Clean & Plant-Based Beauty" className="absolute inset-0 w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 p-6 md:p-8 bg-gradient-to-r from-white/70 to-transparent">
                  <h3 className="font-bold text-gray-900 text-lg md:text-xl leading-tight mb-3">Clean & Plant-<br/>Based Beauty</h3>
                  <div className="w-8 h-[2px] bg-gray-900"></div>
                </div>
              </div>

              {/* Bottom Right: Cooling Fans */}
              <div className="relative bg-[#E8F5E9] overflow-hidden group cursor-pointer h-[250px] md:h-auto md:col-start-3 md:row-start-2">
                <img src="https://images.unsplash.com/photo-1565151443833-29ecac6dc3d5?auto=format&fit=crop&w=600&q=80" alt="Mini Personal Cooling Fans" className="absolute inset-0 w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 p-6 md:p-8 bg-gradient-to-r from-white/80 to-transparent">
                  <h3 className="font-bold text-gray-900 text-lg md:text-xl leading-tight mb-3">Mini Personal<br/>Cooling Fans</h3>
                  <div className="w-8 h-[2px] bg-gray-900"></div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* RECENTLY VIEWED SECTION */}
        <section className="bg-white w-full py-16 relative z-10 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Header */}
            <div className="lg:w-40 flex flex-col justify-between shrink-0">
              <h2 className="text-[32px] md:text-[36px] font-black text-gray-900 leading-[1.1] tracking-tight mt-4">
                Recently<br />Viewed
              </h2>
              <div className="flex items-center gap-2 mt-8 lg:mt-0 pb-2">
                <button className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-400 ml-[-2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="w-9 h-9 rounded-full bg-[#03979B] flex items-center justify-center shadow-md hover:bg-[#027b7e] transition-colors">
                  <svg className="w-4 h-4 text-white mr-[-2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right Cards Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1 */}
              <div className="border border-gray-200 rounded-[14px] overflow-hidden bg-white hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col">
                <div className="aspect-square bg-gray-50 relative overflow-hidden border-b border-gray-100 shrink-0">
                  <img src="https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80" alt="Lipstick" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-[13px] text-gray-900 leading-[1.3] line-clamp-2 min-h-[34px] mb-2">
                    OEM/ODM Wholesale Hot Selling Lipstick Priva...
                  </h3>
                  <a href="#" className="text-[10px] text-[#074C8D] hover:underline truncate mb-3 block">
                    Guangzhou Chingo Cosmetics
                  </a>
                  <div className="mt-auto">
                    <div className="flex items-end gap-1.5 mb-2.5">
                      <div className="text-[#03979B] font-bold text-[13px] leading-none">₹ 98.09</div>
                      <div className="text-[10px] text-gray-500 leading-none pb-[1px]">50-11,999 pieces</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-800">
                      <svg className="w-3.5 h-3.5 text-[#3794FF]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.8 14.8L6 12.6l1.4-1.4 2.8 2.8 7.2-7.2 1.4 1.4-8.6 8.6z"/></svg>
                      <span className="text-[11px] font-bold">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="border border-gray-200 rounded-[14px] overflow-hidden bg-white hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col">
                <div className="aspect-square bg-gray-50 relative overflow-hidden border-b border-gray-100 shrink-0">
                  <img src="https://images.unsplash.com/photo-1588661642289-54316b24d77b?auto=format&fit=crop&w=400&q=80" alt="Eye Mask" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-[13px] text-gray-900 leading-[1.3] line-clamp-2 min-h-[34px] mb-2">
                    Factory Custom New Product Light Breathable Air Ba...
                  </h3>
                  <a href="#" className="text-[10px] text-[#074C8D] hover:underline truncate mb-3 block">
                    Jiale Health Technology Shenz...
                  </a>
                  <div className="mt-auto">
                    <div className="flex items-end gap-1.5 mb-2.5">
                      <div className="text-[#03979B] font-bold text-[13px] leading-none">₹2,010.69</div>
                      <div className="text-[10px] text-gray-500 leading-none pb-[1px]">2-499 pieces</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-800">
                      <svg className="w-3.5 h-3.5 text-[#3794FF]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.8 14.8L6 12.6l1.4-1.4 2.8 2.8 7.2-7.2 1.4 1.4-8.6 8.6z"/></svg>
                      <span className="text-[11px] font-bold">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="border border-gray-200 rounded-[14px] overflow-hidden bg-white hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col">
                <div className="aspect-square bg-gray-50 relative overflow-hidden border-b border-gray-100 shrink-0">
                  <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80" alt="Beauty Device" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-[13px] text-gray-900 leading-[1.3] line-clamp-2 min-h-[34px] mb-2">
                    Top Selling Item In Usa Home Beauty Device Eye Mass...
                  </h3>
                  <a href="#" className="text-[10px] text-[#074C8D] hover:underline truncate mb-3 block">
                    Shenzhen Xinteyou Electro...
                  </a>
                  <div className="mt-auto">
                    <div className="flex items-end gap-1.5 mb-2.5">
                      <div className="text-[#03979B] font-bold text-[13px] leading-none">₹1,329.02</div>
                      <div className="text-[10px] text-gray-500 leading-none pb-[1px]">2-99 pieces</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-800">
                      <svg className="w-3.5 h-3.5 text-[#3794FF]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.8 14.8L6 12.6l1.4-1.4 2.8 2.8 7.2-7.2 1.4 1.4-8.6 8.6z"/></svg>
                      <span className="text-[11px] font-bold">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="border border-gray-200 rounded-[14px] overflow-hidden bg-white hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col">
                <div className="aspect-square bg-gray-50 relative overflow-hidden border-b border-gray-100 shrink-0">
                  <img src="https://images.unsplash.com/photo-1631679700024-046cb87889ff?auto=format&fit=crop&w=400&q=80" alt="Mattress" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-[13px] text-gray-900 leading-[1.3] line-clamp-2 min-h-[34px] mb-2">
                    Mattress Topper Home Thickened Warmth Check...
                  </h3>
                  <a href="#" className="text-[10px] text-[#074C8D] hover:underline truncate mb-3 block">
                    Zhengzhou Sanrenxing Tradi...
                  </a>
                  <div className="mt-auto">
                    <div className="flex items-end gap-1.5 mb-2.5">
                      <div className="text-[#03979B] font-bold text-[13px] leading-none">₹928.84</div>
                      <div className="text-[10px] text-gray-500 leading-none pb-[1px]">10-99 pieces</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-800">
                      <svg className="w-3.5 h-3.5 text-[#3794FF]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.8 14.8L6 12.6l1.4-1.4 2.8 2.8 7.2-7.2 1.4 1.4-8.6 8.6z"/></svg>
                      <span className="text-[11px] font-bold">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* APP DOWNLOAD BANNER */}
        <section className="w-full bg-white py-20">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
            <div className="bg-white rounded-[32px] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between relative overflow-hidden border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
              {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[32px]">
              {/* Large soft pink/purple glow */}
              <div className="absolute top-1/2 right-0 lg:right-10 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-pink-200/40 via-purple-100/30 to-transparent rounded-full blur-[60px]" />
              
              {/* Concentric rings to create the ripple effect */}
              <div className="absolute top-1/2 right-0 lg:right-10 -translate-y-1/2 w-[500px] h-[500px] border-[40px] border-purple-100/50 rounded-full" />
              <div className="absolute top-1/2 right-0 lg:right-10 -translate-y-1/2 w-[700px] h-[700px] border-[30px] border-purple-50/60 rounded-full" />
              <div className="absolute top-1/2 right-0 lg:right-10 -translate-y-1/2 w-[900px] h-[900px] border-[20px] border-purple-50/30 rounded-full" />
            </div>

            {/* Left Content */}
            <div className="relative z-10 max-w-lg mb-12 md:mb-0">
              <h2 className="text-4xl md:text-[44px] font-black text-gray-900 mb-4 leading-tight">Get Jaxmart App</h2>
              <p className="text-gray-600 text-[15px] font-medium mb-8 max-w-xs leading-relaxed">
                Search for products/services and connect with verified sellers on the go!
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a href="#" className="hover:scale-105 transition-transform duration-300">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-[42px]" />
                </a>
                <a href="#" className="hover:scale-105 transition-transform duration-300">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="h-[42px]" />
                </a>
              </div>
            </div>

            {/* Right Content - Phone Mockup */}
            <div className="relative z-10 w-full max-w-xs md:max-w-sm lg:max-w-md flex justify-center lg:justify-end mr-0 lg:mr-10">
              {/* CSS Phone representation */}
              <div className="relative w-64 h-[500px] bg-white rounded-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border-[10px] border-gray-800 overflow-hidden transform rotate-12 hover:rotate-0 transition-transform duration-700 flex items-center justify-center group cursor-pointer ring-1 ring-black/5">
                {/* Notch */}
                <div className="absolute top-0 w-32 h-6 bg-gray-800 rounded-b-3xl left-1/2 -translate-x-1/2 z-20" />
                {/* Side Buttons */}
                <div className="absolute top-24 -left-[14px] w-1.5 h-12 bg-gray-700 rounded-l-md" />
                <div className="absolute top-40 -left-[14px] w-1.5 h-12 bg-gray-700 rounded-l-md" />
                <div className="absolute top-32 -right-[14px] w-1.5 h-16 bg-gray-700 rounded-r-md" />
                
                {/* App Screen Content */}
                <div className="w-32 h-32 relative transform group-hover:scale-110 transition-transform duration-500">
                  <img src="/Jaxmart_logo.svg" alt="Jaxmart Logo" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </PublicLayout>
  );
}


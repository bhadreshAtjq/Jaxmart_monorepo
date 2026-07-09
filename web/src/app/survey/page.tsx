'use client';
import React, { useState } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Container } from '@/components/ui';
import { FaPaperPlane, FaBuilding, FaMoneyBillWave, FaBoxesStacked, FaEnvelope } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const BUSINESS_TYPES = [
  'Retailer',
  'Wholesaler / Distributor',
  'Manufacturer',
  'Trading Company',
  'Buying Office',
  'Online Seller (Amazon, eBay, etc.)',
  'Other'
];

const SOURCING_AMOUNTS = [
  'Less than $10,000',
  '$10,000 - $50,000',
  '$50,001 - $100,000',
  '$100,001 - $500,000',
  'More than $500,000'
];

const PRODUCT_CATEGORIES = [
  'Electronics & Gadgets',
  'Apparel & Textiles',
  'Home & Garden',
  'Industrial & Machinery',
  'Beauty & Personal Care',
  'Toys & Hobbies',
  'Automotive Parts',
  'Health & Medical',
  'Sports & Entertainment'
];

export default function SurveyPage() {
  const [email, setEmail] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [sourcingAmount, setSourcingAmount] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleProduct = (product: string) => {
    setSelectedProducts(prev => 
      prev.includes(product) 
        ? prev.filter(p => p !== product)
        : [...prev, product]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !businessType || !sourcingAmount || selectedProducts.length === 0) {
      toast.error('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success('Survey submitted successfully!');
    }, 1500);
  };

  return (
    <PublicLayout>
      {/* Top Brand Banner */}
      <div className="bg-white border-b border-gray-100 py-4 shadow-sm relative z-20">
        <Container>
          <div className="flex items-center gap-2">
            <span className="text-[#e31837] font-black text-lg tracking-tight uppercase">JaxMart Community Panel</span>
          </div>
        </Container>
      </div>

      <div className="min-h-screen bg-gray-50/50 py-12 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#232F72]/5 to-transparent pointer-events-none" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#36ADA3]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-10 w-72 h-72 bg-[#e31837]/5 rounded-full blur-3xl pointer-events-none" />

        <Container className="relative z-10 max-w-4xl">
          {isSubmitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-12 text-center border border-gray-100"
            >
              <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaPaperPlane className="w-10 h-10 -ml-1" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">Thank You for Your Feedback!</h2>
              <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
                Your insights are incredibly valuable to us and will directly help shape the future of JaxMart.
              </p>
              <button 
                onClick={() => window.location.href = '/'}
                className="px-8 py-3 bg-gradient-to-r from-[#232F72] to-[#2F578A] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Return to Homepage
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden"
            >
              {/* Header */}
              <div className="p-8 md:p-12 text-center bg-white border-b border-gray-50 relative">
                <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                  JaxMart Buyer Survey: <br className="hidden md:block" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#232F72] to-[#36ADA3]">Shape Our Future with Your Feedback</span>
                </h1>
                <p className="text-gray-500 font-medium text-sm md:text-base max-w-2xl mx-auto">
                  Help us improve your sourcing experience. Share your feedback in our quick 3-minute survey. Thank you!
                </p>
              </div>

              {/* Form Body */}
              <div className="p-8 md:p-12 bg-gray-50/30">
                <form onSubmit={handleSubmit} className="space-y-10 max-w-3xl mx-auto">
                  
                  {/* Email Section */}
                  <div className="space-y-3">
                    <label className="flex items-center text-base font-bold text-gray-900 gap-2">
                      <FaEnvelope className="text-gray-400" />
                      Email address: <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#36ADA3] to-[#232F72] rounded-xl opacity-0 group-focus-within:opacity-20 transition duration-500 blur" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="relative w-full max-w-md h-14 px-5 border-2 border-pink-100 bg-pink-50/50 rounded-xl focus:border-[#36ADA3] focus:bg-white outline-none text-[15px] font-medium text-gray-800 transition-colors duration-300"
                      />
                    </div>
                  </div>

                  {/* Business Type */}
                  <div className="space-y-3">
                    <label className="flex items-center text-base font-bold text-gray-900 gap-2">
                      <FaBuilding className="text-gray-400" />
                      What is your company's business type? <span className="text-red-500">*</span>
                    </label>
                    <div className="relative w-full max-w-md group">
                      <select 
                        required
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full h-14 px-5 border-2 border-gray-200 rounded-xl focus:border-[#36ADA3] outline-none text-[15px] font-medium text-gray-800 bg-white shadow-sm transition-colors duration-300 appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Choose an option...</option>
                        {BUSINESS_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  {/* Sourcing Amount */}
                  <div className="space-y-3">
                    <label className="flex items-center text-base font-bold text-gray-900 gap-2">
                      <FaMoneyBillWave className="text-gray-400" />
                      What is the annual sourcing amount of your company? (USD) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative w-full max-w-md group">
                      <select 
                        required
                        value={sourcingAmount}
                        onChange={(e) => setSourcingAmount(e.target.value)}
                        className="w-full h-14 px-5 border-2 border-gray-200 rounded-xl focus:border-[#36ADA3] outline-none text-[15px] font-medium text-gray-800 bg-white shadow-sm transition-colors duration-300 appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Choose an option...</option>
                        {SOURCING_AMOUNTS.map(amount => (
                          <option key={amount} value={amount}>{amount}</option>
                        ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="space-y-4">
                    <label className="flex items-center text-base font-bold text-gray-900 gap-2">
                      <FaBoxesStacked className="text-gray-400" />
                      What types of products do you currently source? <span className="text-gray-500 text-sm font-semibold">(Select all that apply)</span> <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {PRODUCT_CATEGORIES.map(product => {
                        const isSelected = selectedProducts.includes(product);
                        return (
                          <button
                            type="button"
                            key={product}
                            onClick={() => toggleProduct(product)}
                            className={clsx(
                              "flex items-start text-left p-4 rounded-xl border-2 transition-all duration-300",
                              isSelected 
                                ? "border-[#36ADA3] bg-[#36ADA3]/5 shadow-sm" 
                                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                            )}
                          >
                            <div className={clsx(
                              "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 mr-3 transition-colors",
                              isSelected ? "border-[#36ADA3] bg-[#36ADA3]" : "border-gray-300 bg-white"
                            )}>
                              {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                            </div>
                            <span className={clsx(
                              "text-sm font-bold transition-colors",
                              isSelected ? "text-gray-900" : "text-gray-600"
                            )}>
                              {product}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-gray-100 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={clsx(
                        "h-14 px-12 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-300 flex items-center gap-3",
                        isSubmitting 
                          ? "bg-gray-400 cursor-not-allowed" 
                          : "bg-gradient-to-r from-[#e31837] to-[#c51530] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Survey
                          <FaPaperPlane className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            </motion.div>
          )}
        </Container>
      </div>
    </PublicLayout>
  );
}

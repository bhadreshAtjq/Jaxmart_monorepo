'use client';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui';
import { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

export default function ExhibitPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
          <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center">
            <div className="flex justify-center mb-6">
              <FaCheckCircle className="text-emerald-500 h-16 w-16" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
            <p className="text-gray-600 mb-8">
              Thank you for your interest in exhibiting at JaxMart. Our team will review your application and contact you shortly.
            </p>
            <Button className="w-full" onClick={() => window.location.href = '/'}>
              Return to Home
            </Button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-[#f8f9fa] px-8 py-6 border-b border-gray-200">
            <h1 className="text-lg font-bold text-gray-800 text-center leading-relaxed">
              Thank you for your interest to exhibit at JaxMart, please complete the form and we will contact you soon.
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500 mr-1">*</span>Company Name
              </label>
              <input
                required
                type="text"
                placeholder="please enter"
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Company Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500 mr-1">*</span>Company Location
              </label>
              <div className="relative">
                <select
                  required
                  className="w-full appearance-none border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-all bg-white"
                >
                  <option value="" disabled selected>please select</option>
                  <option value="IN">India</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CN">China</option>
                  <option value="OTHER">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500 mr-1">*</span>Industry
              </label>
              <div className="relative">
                <select
                  required
                  className="w-full appearance-none border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-all bg-white text-gray-600"
                  defaultValue=""
                >
                  <option value="" disabled>please select</option>
                  <option value="tech">Technology & Electronics</option>
                  <option value="fashion">Fashion & Apparel</option>
                  <option value="home">Home & Living</option>
                  <option value="industrial">Industrial Machinery</option>
                  <option value="other">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>
            </div>

            {/* Which show(s) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500 mr-1">*</span>Which show(s) would you like to inquire for?
              </label>
              <div className="relative">
                <select
                  required
                  className="w-full appearance-none border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-all bg-white text-gray-600"
                  defaultValue=""
                >
                  <option value="" disabled>please select</option>
                  <option value="summer">Summer Trade Fair 2026</option>
                  <option value="tech">Global Tech Expo</option>
                  <option value="fashion">JaxMart Fashion Week</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500 mr-1">*</span>First/Given Name
              </label>
              <input
                required
                type="text"
                placeholder="please enter"
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500 mr-1">*</span>Last/Family Name
              </label>
              <input
                required
                type="text"
                placeholder="please enter"
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Business Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500 mr-1">*</span>Business Email
              </label>
              <input
                required
                type="email"
                placeholder="please enter"
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Submit */}
            <div className="pt-4">
              <Button type="submit" className="w-full sm:w-auto px-10 py-3 text-sm font-bold bg-[#E31837] hover:bg-[#C9132E] text-white rounded-md transition-colors">
                Submit Application
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
}

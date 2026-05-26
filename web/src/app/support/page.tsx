'use client';

import { useState } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { FaChevronDown, FaChevronUp, FaEnvelope, FaHeadphones, FaShieldHalved } from 'react-icons/fa6';

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How does the JaxMart Escrow system work?",
      a: "Our escrow system holds payment securely when a buyer awards a quote and creates an order. The funds are disbursed to the seller in pre-agreed milestone percentages only after the buyer reviews and approves the delivered goods or services."
    },
    {
      q: "How do I verify my seller account?",
      a: "Go to your Seller Profile, upload your business registration documents (GSTIN/PAN/incorporation certificate), and submit them for review. Our compliance team verifies details within 24 to 48 hours to grant your profile the Verified badge."
    },
    {
      q: "What should I do if a shipment is delayed?",
      a: "Communicate directly with the seller via our messaging inbox. Sellers can update the milestone status and provide tracking information. If you cannot reach a resolution, you can click 'Open Dispute' on the Order details page before the milestone is approved."
    },
    {
      q: "Can I cancel a request for quotation (RFQ)?",
      a: "Yes. Buyers can withdraw or close an active RFQ at any time from their 'My Requests' dashboard, which stops new quotes from being submitted."
    }
  ];

  return (
    <PublicLayout>
      <div className="bg-gradient-to-b from-[#0A2533]/5 to-transparent min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-[#0A2533] uppercase tracking-tight mb-4">
              Support Center
            </h1>
            <p className="text-sm text-gray-500 font-medium max-w-xl mx-auto leading-relaxed">
              Have questions about using JaxMart? Browse our FAQs or get in touch with our helpdesk.
            </p>
          </div>

          {/* Cards section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md text-center">
              <div className="h-10 w-10 rounded-2xl bg-jax-blue/5 flex items-center justify-center mx-auto mb-4 text-[#2F578A]">
                <FaHeadphones className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#0A2533] mb-1">
                24/7 Support
              </h3>
              <p className="text-[11px] text-gray-400">
                Help with orders and disputes
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md text-center">
              <div className="h-10 w-10 rounded-2xl bg-jax-teal/5 flex items-center justify-center mx-auto mb-4 text-jax-teal">
                <FaShieldHalved className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#0A2533] mb-1">
                Safe Escrow
              </h3>
              <p className="text-[11px] text-gray-400">
                Escrow protection guidelines
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md text-center">
              <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4 text-amber-500">
                <FaEnvelope className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#0A2533] mb-1">
                Email Helpdesk
              </h3>
              <p className="text-[11px] text-gray-400">
                support@jaxmart.com
              </p>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 p-8 sm:p-10 mb-8">
            <h2 className="font-heading font-black text-lg text-[#0A2533] uppercase tracking-wider mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between text-left focus:outline-none py-2"
                    >
                      <span className="font-heading font-bold text-sm text-[#0A2533]">
                        {faq.q}
                      </span>
                      {isOpen ? (
                        <FaChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <FaChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    {isOpen && (
                      <p className="text-xs text-gray-600 mt-2 leading-relaxed font-normal">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Contact Form */}
          <div className="bg-[#0A2533] text-white rounded-3xl p-8 sm:p-10 shadow-xl">
            <h2 className="font-heading font-black text-lg uppercase tracking-wider mb-2">
              Still need help?
            </h2>
            <p className="text-xs text-gray-300 mb-6 leading-relaxed">
              Fill out this quick form and our support coordinators will get back to you within 12 hours.
            </p>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully!'); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Business Name"
                  required
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-white/50"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-white/50"
                />
              </div>
              <textarea
                placeholder="Describe your issue or question in detail..."
                rows={4}
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-white/50 resize-none"
              ></textarea>
              <button
                type="submit"
                className="bg-white text-[#0A2533] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Send Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

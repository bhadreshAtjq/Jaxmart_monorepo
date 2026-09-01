'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Container, Button } from '@/components/ui';
import {
  FaChevronDown,
  FaChevronUp,
  FaEnvelope,
  FaHeadphones,
  FaShieldHalved,
  FaPhone,
  FaArrowRight,
  FaPaperPlane,
  FaFileContract,
  FaBoxesStacked,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitting, setSubmitting] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    businessName: '',
    email: '',
    message: '',
  });

  const faqs = [
    {
      q: "How does the JaxMart Assured Escrow system work?",
      a: "Our escrow system holds payment securely when a buyer awards a quote and creates an order. The funds are disbursed to the seller in pre-agreed milestone percentages only after the buyer reviews and approves the delivered goods or services."
    },
    {
      q: "How do I verify my seller account & get the Verified badge?",
      a: "Go to your Seller Profile, upload your business registration documents (GSTIN/PAN/incorporation certificate), and submit them for review. Our compliance team verifies details within 24 to 48 hours to grant your profile the Verified badge."
    },
    {
      q: "What should I do if a shipment is delayed or damaged?",
      a: "Communicate directly with the seller via our messaging inbox. Sellers can update the milestone status and provide tracking information. If you cannot reach a resolution, click 'Open Dispute' on the Order details page before the milestone is approved."
    },
    {
      q: "Can I cancel a request for quotation (RFQ)?",
      a: "Yes. Buyers can withdraw or close an active RFQ at any time from their RFQ dashboard, which stops new quotes from being submitted."
    }
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.businessName || !ticketForm.email || !ticketForm.message) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success('🎉 Support ticket created! Our team will reply to ' + ticketForm.email + ' shortly.');
      setTicketForm({ businessName: '', email: '', message: '' });
    }, 700);
  };

  return (
    <PublicLayout>
      <div className="bg-slate-50 min-h-screen py-12 border-b border-gray-200">
        <Container size="xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-jungle-green-700 bg-jungle-green-50 px-3 py-1 rounded-md mb-3 inline-block">
              Helpdesk & Knowledge Base
            </span>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-gray-900 tracking-tight mb-4">
              JaxMart Support Center
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              Have questions about RFQ posting, wholesale escrow settlements, or factory verification? Browse our FAQs or connect with our support desk.
            </p>
          </div>

          {/* 3 Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <Link
              href="/contact"
              className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all text-center group"
            >
              <div className="h-12 w-12 rounded-2xl bg-jungle-green-50 text-jungle-green-700 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FaHeadphones className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-black text-sm text-gray-900 mb-1">
                Direct Contact Desk
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Call +91 (0124) 456-7890 or email department teams
              </p>
              <span className="text-xs font-bold text-jungle-green-700 group-hover:underline">
                View Contact Info →
              </span>
            </Link>

            <Link
              href="/terms"
              className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all text-center group"
            >
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FaShieldHalved className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-black text-sm text-gray-900 mb-1">
                Escrow & Terms
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Milestone payments, freight terms & arbitration
              </p>
              <span className="text-xs font-bold text-blue-700 group-hover:underline">
                Read Terms of Use →
              </span>
            </Link>

            <Link
              href="/privacy"
              className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all text-center group"
            >
              <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FaFileContract className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-black text-sm text-gray-900 mb-1">
                Privacy Policy
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                DPDPA 2023 compliance & contact masking
              </p>
              <span className="text-xs font-bold text-purple-700 group-hover:underline">
                Read Privacy Policy →
              </span>
            </Link>
          </div>

          {/* FAQs Accordion */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 sm:p-10 mb-12 max-w-4xl mx-auto">
            <h2 className="font-heading font-black text-xl text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className="border border-gray-100 rounded-2xl p-4 transition-all">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between text-left focus:outline-none"
                    >
                      <span className="font-heading font-black text-xs text-gray-900">
                        {faq.q}
                      </span>
                      {isOpen ? (
                        <FaChevronUp className="h-3.5 w-3.5 text-gray-400 shrink-0 ml-2" />
                      ) : (
                        <FaChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0 ml-2" />
                      )}
                    </button>
                    {isOpen && (
                      <p className="text-xs text-gray-600 mt-2.5 pt-2.5 border-t border-gray-50 leading-relaxed font-normal">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Ticket Form */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl max-w-4xl mx-auto">
            <div className="max-w-xl mb-6">
              <span className="text-xs font-black uppercase tracking-wider text-jungle-green-400 bg-white/10 px-3 py-1 rounded-md">
                Direct Helpdesk Ticket
              </span>
              <h2 className="font-heading font-black text-2xl tracking-tight mt-2">
                Still need assistance?
              </h2>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                Submit your inquiry and a JaxMart coordinator will get back to you within 2 to 4 business hours.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleTicketSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Business / Full Name"
                  required
                  value={ticketForm.businessName}
                  onChange={(e) => setTicketForm({ ...ticketForm, businessName: e.target.value })}
                  className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-jungle-green-400 font-bold"
                />
                <input
                  type="email"
                  placeholder="Official Work Email"
                  required
                  value={ticketForm.email}
                  onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                  className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-jungle-green-400 font-bold"
                />
              </div>
              <textarea
                placeholder="Describe your question, order ID, or requirement in detail..."
                rows={4}
                required
                value={ticketForm.message}
                onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-jungle-green-400 resize-none font-medium"
              ></textarea>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-jungle-green-600 hover:bg-jungle-green-700 text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-2xl transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <FaPaperPlane className="h-3 w-3" />
                {submitting ? 'Creating Ticket...' : 'Send Support Request'}
              </Button>
            </form>
          </div>
        </Container>
      </div>
    </PublicLayout>
  );
}

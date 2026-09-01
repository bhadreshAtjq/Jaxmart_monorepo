'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Container, Button, Card, Badge } from '@/components/ui';
import {
  FaPhone,
  FaEnvelope,
  FaLocationDot,
  FaClock,
  FaBuilding,
  FaShieldHalved,
  FaHeadset,
  FaBoxesStacked,
  FaFileContract,
  FaPaperPlane,
  FaCircleCheck,
  FaArrowRight,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa6';
import { ShieldCheck, Award, MessageSquare, Clock, MapPin, Mail, PhoneCall } from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const CONTACT_DEPARTMENTS = [
  {
    title: 'Enterprise Procurement & RFQ Desk',
    email: 'procurement@jaxmart.com',
    phone: '+91 (0124) 456-7890',
    desc: 'Assistance with custom RFQs, factory matchmaking, raw material sourcing, and price negotiations.',
    icon: FaBoxesStacked,
    color: 'text-jungle-green-600',
    bg: 'bg-jungle-green-50',
  },
  {
    title: 'Supplier Verification & KYC',
    email: 'suppliers@jaxmart.com',
    phone: '+91 (0124) 456-7891',
    desc: 'GSTIN verification, physical plant audits by JaxMart Captains, and catalog listing support.',
    icon: ShieldCheck,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    title: 'JaxMart Assured Escrow & Payouts',
    email: 'escrow-support@jaxmart.com',
    phone: '+91 (0124) 456-7892',
    desc: 'Escrow payment locking, milestone releases, bank transfer RTGS/NEFT receipts, and invoices.',
    icon: FaShieldHalved,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    title: 'Legal, Compliance & Grievances',
    email: 'grievance@jaxmart.com',
    phone: '+91 (0124) 456-7893',
    desc: 'Statutory compliance, master vendor contracts, and formal grievance resolutions under DPDPA 2023.',
    icon: FaFileContract,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
];

const OFFICE_LOCATIONS = [
  {
    city: 'Ahmedabad (Corporate Headquarters)',
    state: 'Gujarat',
    address: 'JaxMart Technologies Pvt. Ltd., Time Square Arcade, Sindhu Bhavan Road, Thaltej, Ahmedabad, Gujarat - 380059',
    type: 'Headquarters & Operations Hub',
  },
  {
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Platina Tower, Bandra Kurla Complex (BKC), Mumbai, Maharashtra - 400051',
    type: 'Escrow & Trade Finance Hub',
  },
  {
    city: 'Surat',
    state: 'Gujarat',
    address: 'Textile Market Complex, Ring Road, Surat, Gujarat - 395002',
    type: 'Manufacturing & Textiles Desk',
  },
  {
    city: 'Delhi NCR',
    state: 'National Capital Region',
    address: 'Cyber Park, Sector 62, Gurugram, Haryana - 122002',
    type: 'Northern Sourcing Center',
  },
  {
    city: 'Bengaluru',
    state: 'Karnataka',
    address: 'Industrial Sourcing Center, Koramangala 4th Block, Bengaluru, Karnataka - 560034',
    type: 'Logistics & 3PL Hub',
  },
];

const CONTACT_FAQS = [
  {
    q: 'How fast will I receive quotes after submitting an RFQ?',
    a: 'Once posted, your RFQ is broadcast in real time to verified manufacturers. Typically, buyers receive 3 to 5 competing quotations within 12 to 24 business hours.',
  },
  {
    q: 'How does JaxMart protect advance payments for bulk machinery or raw materials?',
    a: '100% of order payments are deposited into a protected Nodal Escrow Account. Funds are released to the manufacturer only in pre-agreed milestone tranches upon verified physical delivery and quality inspection sign-off.',
  },
  {
    q: 'How can our manufacturing unit get the "Verified Supplier" badge?',
    a: 'Submit your GSTIN, PAN, and factory registration via your Seller Dashboard. A JaxMart Captain in your industrial cluster will perform an on-ground audit within 24 to 48 business hours.',
  },
  {
    q: 'What payment modes are supported for corporate orders and subscriptions?',
    a: 'We support instant online checkout via Razorpay (UPI, Netbanking, Corporate Credit/Debit Cards) as well as direct corporate NEFT/RTGS bank transfers with automated GST tax invoices.',
  },
];

export default function ContactUsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    department: 'procurement',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success('🎉 Thank you! Your message has been routed to our team. Ticket #JM-' + Math.floor(100000 + Math.random() * 900000));
      setForm({
        fullName: '',
        businessName: '',
        email: '',
        phone: '',
        department: 'procurement',
        message: '',
      });
    }, 800);
  };

  return (
    <PublicLayout>
      <div className="bg-slate-50 min-h-screen py-12 border-b border-gray-200">
        <Container size="xl">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-jungle-green-950 text-white rounded-3xl p-8 md:p-12 mb-12 shadow-xl relative overflow-hidden">
            <div className="max-w-3xl relative z-10">
              <div className="inline-flex items-center gap-2 bg-jungle-green-900/80 text-jungle-green-300 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-4 border border-jungle-green-700/50">
                <FaHeadset className="h-3.5 w-3.5" /> 24/7 Enterprise Support
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tight mb-4 leading-tight">
                Get in Touch with JaxMart
              </h1>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed font-normal mb-6">
                Have questions about posting high-volume RFQs, supplier verification, or JaxMart Assured Escrow settlements? Our nationwide team is here to assist you.
              </p>
              <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-gray-300">
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-jungle-green-400" />
                  <span>National Helpline: <strong>+91 (0124) 456-7890</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-jungle-green-400" />
                  <span>Primary Desk: <strong>support@jaxmart.com</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-jungle-green-400" />
                  <span>Operating Hours: <strong>Mon - Sat, 9:00 AM - 7:00 PM IST</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Department Cards Grid */}
          <div className="mb-16">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-black uppercase tracking-wider text-jungle-green-700 bg-jungle-green-50 px-3 py-1 rounded-md">
                Direct Department Contacts
              </span>
              <h2 className="text-2xl md:text-3xl font-heading font-black text-gray-900 mt-2">
                Connect with the Right Specialist Desk
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CONTACT_DEPARTMENTS.map((dept, i) => {
                const Icon = dept.icon;
                return (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div
                        className={clsx(
                          'h-12 w-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm',
                          dept.bg,
                          dept.color
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-heading font-black text-gray-900 text-sm mb-2">
                        {dept.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed mb-4">
                        {dept.desc}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 space-y-1.5 text-xs font-bold">
                      <div className="text-gray-800 flex items-center gap-2">
                        <FaPhone className="h-3 w-3 text-gray-400" /> {dept.phone}
                      </div>
                      <div className="text-jungle-green-700 flex items-center gap-2 truncate">
                        <FaEnvelope className="h-3 w-3 text-jungle-green-600" /> {dept.email}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Grid: Interactive Form & Locations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-16">
            {/* Left Form (7 Cols) */}
            <div className="lg:col-span-7 bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-sm">
              <div className="mb-8">
                <span className="text-xs font-black uppercase tracking-wider text-jungle-green-700 bg-jungle-green-50 px-3 py-1 rounded-md">
                  Send a Message
                </span>
                <h2 className="text-2xl font-heading font-black text-gray-900 mt-2">
                  Submit a Support or Business Request
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Fill in your requirements below and our coordinators will respond within 2 to 4 business hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Kumar"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-jungle-green-600 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">
                      Business / Organization Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Industries Pvt Ltd"
                      value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                      className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-jungle-green-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">
                      Official Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-jungle-green-600 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">
                      Mobile Number (with WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-jungle-green-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    Select Relevant Department *
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-jungle-green-600 focus:bg-white transition-all"
                  >
                    <option value="procurement">Enterprise Procurement & RFQs</option>
                    <option value="seller-kyc">Supplier Onboarding & Verified Badge</option>
                    <option value="escrow">JaxMart Assured Escrow & Payouts</option>
                    <option value="technical">Technical Support & Platform Feedback</option>
                    <option value="legal">Legal, Compliance & Enterprise Contracts</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    How can we assist your business? *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your inquiry, order details, required materials, or verification questions..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-2xl p-4 text-xs font-medium outline-none focus:border-jungle-green-600 focus:bg-white transition-all resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-2xl py-3.5 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                >
                  <FaPaperPlane className="h-3 w-3" />
                  {submitting ? 'Transmitting Message...' : 'Submit Request to JaxMart Desk'}
                </Button>
              </form>
            </div>

            {/* Right Column: Office Locations (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                <h3 className="font-heading font-black text-lg text-gray-900 mb-6 flex items-center gap-2">
                  <FaBuilding className="h-5 w-5 text-jungle-green-600" />
                  Regional Offices & Hubs
                </h3>

                <div className="space-y-4">
                  {OFFICE_LOCATIONS.map((loc, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-heading font-black text-xs text-gray-900">{loc.city}</p>
                        <span className="text-[10px] font-bold text-jungle-green-700 bg-jungle-green-50 px-2 py-0.5 rounded-md">
                          {loc.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">{loc.address}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Links Card */}
              <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-4 shadow-sm">
                <h4 className="font-heading font-black text-base">Explore Legal & Governance</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Review our complete master service agreements, milestone escrow rules, and data protection standards:
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/terms"
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center justify-between transition-colors"
                  >
                    <span>Terms of Use (Master Service Agreement)</span>
                    <FaArrowRight className="h-3 w-3 text-jungle-green-400" />
                  </Link>
                  <Link
                    href="/privacy"
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center justify-between transition-colors"
                  >
                    <span>Privacy Policy (DPDPA 2023 Compliant)</span>
                    <FaArrowRight className="h-3 w-3 text-jungle-green-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 shadow-sm max-w-4xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-8">
              <h3 className="font-heading font-black text-2xl text-gray-900">
                Frequently Asked Inquiries
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Quick answers regarding JaxMart operations, procurement, and escrow protection.
              </p>
            </div>

            <div className="space-y-3">
              {CONTACT_FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-2xl p-4 transition-all"
                  >
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
                      <p className="text-xs text-gray-600 mt-2.5 pt-2.5 border-t border-gray-50 leading-relaxed">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </div>
    </PublicLayout>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Container } from '@/components/ui';
import {
  FaShieldHalved,
  FaUserShield,
  FaDatabase,
  FaLock,
  FaEyeSlash,
  FaFileShield,
  FaBuildingUser,
  FaScaleBalanced,
  FaEnvelope,
  FaPhone,
  FaLocationDot,
  FaArrowRight,
  FaCircleCheck,
} from 'react-icons/fa6';
import { clsx } from 'clsx';

const PRIVACY_SECTIONS = [
  { id: 'fiduciary-scope', title: '1. Data Fiduciary & Legal Scope' },
  { id: 'data-collected', title: '2. Information We Collect' },
  { id: 'purpose-processing', title: '3. Purpose & Legal Basis of Processing' },
  { id: 'contact-masking', title: '4. Buyer-Seller Contact Masking Policy' },
  { id: 'security-residency', title: '5. Data Security & Indian Residency' },
  { id: 'third-parties', title: '6. Authorized Third-Party Disclosures' },
  { id: 'user-rights', title: '7. Your Rights under DPDPA 2023' },
  { id: 'retention-policy', title: '8. Data Retention & Archival' },
  { id: 'cookies-analytics', title: '9. Cookies & Telemetry' },
  { id: 'grievance-officer', title: '10. Statutory Grievance Redressal' },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('fiduciary-scope');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <PublicLayout>
      <div className="bg-slate-50 min-h-screen py-12 border-b border-gray-200">
        <Container size="xl">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 text-white rounded-3xl p-8 md:p-12 mb-10 shadow-xl relative overflow-hidden">
            <div className="max-w-3xl relative z-10">
              <div className="inline-flex items-center gap-2 bg-blue-900/80 text-blue-300 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-4 border border-blue-700/50">
                <FaUserShield className="h-3.5 w-3.5" /> DPDPA 2023 Compliant Policy
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tight mb-4 leading-tight">
                Privacy Policy & Data Protection Charter
              </h1>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed font-normal mb-6">
                How JaxMart collects, verifies, stores, encrypts, and processes corporate and personal information in accordance with Indian data protection laws.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-400">
                <span className="bg-white/10 px-3 py-1 rounded-lg">Last Updated: May 2026</span>
                <span className="bg-white/10 px-3 py-1 rounded-lg">Compliance: DPDPA (India) & IT Act 2000</span>
                <span className="bg-white/10 px-3 py-1 rounded-lg">Data Residency: AWS Asia Pacific (Mumbai)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Sticky Table of Contents */}
            <div className="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <h3 className="font-heading font-black text-gray-900 text-sm uppercase tracking-wider mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
                  <FaShieldHalved className="h-4 w-4 text-blue-600" /> Privacy Table of Contents
                </h3>
                <nav className="space-y-1">
                  {PRIVACY_SECTIONS.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className={clsx(
                        'w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between',
                        activeSection === sec.id
                          ? 'bg-blue-50 text-blue-900 border-l-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <span className="truncate">{sec.title}</span>
                      <FaArrowRight className={clsx('h-2.5 w-2.5 shrink-0', activeSection === sec.id ? 'opacity-100' : 'opacity-0')} />
                    </button>
                  ))}
                </nav>
              </div>

              {/* Data Protection Officer Card */}
              <div className="bg-gradient-to-br from-blue-900 to-slate-950 text-white p-6 rounded-3xl shadow-md space-y-3">
                <h4 className="font-heading font-black text-sm text-white">Grievance & Privacy Desk</h4>
                <p className="text-xs text-blue-200 leading-relaxed">
                  Have questions regarding your business data, KYC files, or consent withdrawal? Contact our dedicated Data Protection Officer.
                </p>
                <div className="text-xs text-blue-300 font-semibold pt-1">
                  Email: <span className="text-white underline">grievance@jaxmart.com</span>
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Privacy Clauses */}
            <div className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-12">
              {/* Section 1 */}
              <section id="fiduciary-scope" className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">01</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    1. Data Fiduciary & Legal Scope
                  </h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  JaxMart Technologies Private Limited (&quot;JaxMart&quot;, &quot;we&quot;, &quot;our&quot;) operates as a <strong>Data Fiduciary</strong> in respect of personal and commercial data collected through our web platform, mobile applications, and connected procurement APIs.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  This policy is formulated in strict compliance with the <strong>Digital Personal Data Protection Act (DPDPA), 2023</strong>, the <strong>Information Technology Act, 2000</strong>, and the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>.
                </p>
              </section>

              {/* Section 2 */}
              <section id="data-collected" className="space-y-4 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">02</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    2. Categories of Information We Collect
                  </h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  To verify corporate identity and maintain safe escrow transactions, we collect the following data points:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-700">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                    <p className="font-bold text-gray-900">Corporate & Tax Identifiers</p>
                    <p className="text-gray-500 leading-relaxed">GSTIN Certificate, Permanent Account Number (PAN), MSME Udyam Number, IEC Code, Factory License & CIN.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                    <p className="font-bold text-gray-900">Authorized Contact Information</p>
                    <p className="text-gray-500 leading-relaxed">Name of Authorized Signatory, Director/Partner details, Mobile Phone Numbers (OTP verified), and Official Business Email.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                    <p className="font-bold text-gray-900">Financial & Settlement Data</p>
                    <p className="text-gray-500 leading-relaxed">Bank Account Number, IFSC Code, Cancelled Cheque copies for escrow payouts, and GST Invoicing details.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                    <p className="font-bold text-gray-900">Technical & Sourcing Metadata</p>
                    <p className="text-gray-500 leading-relaxed">RFQ specifications, CAD blueprints, batch quality reports, chat transcripts, IP addresses, and device telemetry.</p>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section id="purpose-processing" className="space-y-4 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">03</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    3. Purpose & Legal Basis of Data Processing
                  </h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We process business and personal information under lawful grounds including contractual necessity, explicit consent, and compliance with statutory Indian fiscal mandates:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5 leading-relaxed">
                  <li><strong>Account Onboarding & Authentication:</strong> Delivering OTP-based two-factor authentication and role-based permissions (Buyer, Seller, Procurement Agent).</li>
                  <li><strong>On-Ground Verification:</strong> Facilitating factory physical audits and verifying GSTIN filings via the official GSTN portal.</li>
                  <li><strong>Smart RFQ Matchmaking:</strong> Parsing requirement specifications to broadcast purchase leads to matching verified manufacturers.</li>
                  <li><strong>Escrow Settlement & Payouts:</strong> Locking, milestone tracking, and disbursing funds to supplier bank accounts per approved Lorry Receipts.</li>
                  <li><strong>Fraud Prevention & Trust Scoring:</strong> Calculating supplier credibility scores and preventing circular trading schemes.</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section id="contact-masking" className="space-y-4 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">04</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    4. Buyer-Seller Contact Masking Policy
                  </h2>
                </div>
                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs text-blue-950 leading-relaxed space-y-2">
                  <p className="font-bold flex items-center gap-2 text-blue-900">
                    <FaEyeSlash className="h-4 w-4" /> Strict Lead Privacy Protection:
                  </p>
                  <p>
                    To protect buyers from unsolicited cold calls and market spam, buyer phone numbers, email addresses, and specific organization names remain <strong>permanently masked</strong> on the public Live RFQ Board.
                  </p>
                  <p>
                    Direct contact credentials are only revealed to a verified supplier after the supplier performs an authenticated <strong>Lead Unlock</strong> using subscription credits, or when a formal quotation is officially submitted and approved by the buyer.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section id="security-residency" className="space-y-4 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">05</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    5. Data Security & Indian Data Residency
                  </h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  JaxMart enforces defense-in-depth security standards to protect your commercial data:
                </p>
                <div className="space-y-3 text-xs text-gray-700">
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <FaLock className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-900">256-Bit TLS & At-Rest Encryption</p>
                      <p className="text-gray-500">All data in transit is encrypted using modern TLS 1.3 cryptographic suites. Database volumes are encrypted using AES-256 keys.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <FaDatabase className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-900">100% Indian Data Residency</p>
                      <p className="text-gray-500">All primary databases, file attachments, and audit logs are hosted in the <strong>AWS Asia Pacific (Mumbai / ap-south-1)</strong> sovereign region, ensuring no cross-border data transfer without compliance.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 6 */}
              <section id="third-parties" className="space-y-4 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">06</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    6. Authorized Third-Party Disclosures
                  </h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  JaxMart does not sell, rent, or trade your corporate information to third-party telemarketers. Disclosures occur only with regulated partners:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5 leading-relaxed">
                  <li><strong>Payment Gateways & Nodal Banks:</strong> Razorpay and RBI-licensed scheduled commercial banks for handling Escrow payments, UPI intents, and NEFT settlements.</li>
                  <li><strong>Govt Compliance Portals:</strong> GSTN and E-Way Bill portals for verifying tax invoice authenticity and GSTIN active status.</li>
                  <li><strong>Logistics & Freight Carriers:</strong> Providing delivery addresses and consignment values to authorized freight partners for generating Lorry Receipts.</li>
                </ul>
              </section>

              {/* Section 7 */}
              <section id="user-rights" className="space-y-4 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">07</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    7. Your Rights under DPDPA 2023
                  </h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  As a registered business user, you possess fundamental statutory rights regarding your personal and operational information:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700">
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="font-bold text-gray-900">Right of Access & Summary</p>
                    <p className="text-gray-500">Download a digital copy of all personal and commercial data stored on your JaxMart account.</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="font-bold text-gray-900">Right to Correction & Updating</p>
                    <p className="text-gray-500">Rectify outdated GST filings, phone numbers, or authorized signatory details from your profile.</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="font-bold text-gray-900">Right to Erasure & Deletion</p>
                    <p className="text-gray-500">Request complete account deletion and data anonymization, subject to statutory tax retention rules.</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="font-bold text-gray-900">Right to Grievance Redressal</p>
                    <p className="text-gray-500">Escalate privacy or consent concerns directly to our designated Grievance Officer.</p>
                  </div>
                </div>
              </section>

              {/* Section 8 */}
              <section id="retention-policy" className="space-y-4 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">08</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    8. Data Retention & Statutory Archival
                  </h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We retain user transaction histories, digital purchase orders, GST tax invoices, and escrow payout records for a minimum duration of <strong>7 (seven) fiscal years</strong> as mandated under the Central Goods and Services Tax Act, 2017, and the Companies Act, 2013.
                </p>
              </section>

              {/* Section 9 */}
              <section id="cookies-analytics" className="space-y-4 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">09</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    9. Cookies, Local Storage & Telemetry
                  </h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  JaxMart uses session storage and secure HTTP cookies solely for maintaining active login states, storing draft RFQ forms across navigation steps, and monitoring platform uptime. We do not engage in invasive third-party cross-site advertising networks.
                </p>
              </section>

              {/* Section 10 */}
              <section id="grievance-officer" className="space-y-4 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">10</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    10. Statutory Grievance Redressal Officer
                  </h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  In accordance with the Information Technology Act, 2000, and rules made thereunder, as well as the DPDPA 2023, the contact details of the Grievance Officer are published below:
                </p>
                <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg font-black">
                      JM
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-base">Test</h4>
                      <p className="text-xs text-blue-300">Chief Compliance & Data Protection Officer</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Email Address</p>
                      <p className="text-white font-semibold">grievance@jaxmart.com</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Helpline</p>
                      <p className="text-white font-semibold">+91 (0124) 456-7892</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Resolution SLA</p>
                      <p className="text-white font-semibold">Within 48 Business Hours</p>
                    </div>
                  </div>
                  <div className="pt-2 text-xs text-gray-400 border-t border-white/10 flex items-center gap-2">
                    <FaLocationDot className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>JaxMart Technologies Pvt. Ltd., Time Square Arcade, Sindhu Bhavan Road, Thaltej, Ahmedabad, Gujarat - 380059, India</span>
                  </div>
                </div>
              </section>

              {/* Footer Stamp */}
              <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
                <span>Document ID: JM-PRIV-2026-V2</span>
                <div className="flex items-center gap-4">
                  <Link href="/terms" className="text-blue-700 font-bold hover:underline">Terms of Use →</Link>
                  <Link href="/contact" className="text-blue-700 font-bold hover:underline">Contact Helpdesk →</Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </PublicLayout>
  );
}

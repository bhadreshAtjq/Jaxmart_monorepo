'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Container, Card, Badge, Button } from '@/components/ui';
import {
  FaScaleBalanced,
  FaShieldHalved,
  FaFileContract,
  FaBuilding,
  FaHandshake,
  FaCoins,
  FaTruckFast,
  FaGavel,
  FaCircleCheck,
  FaCircleExclamation,
  FaEnvelope,
  FaPrint,
  FaArrowRight,
} from 'react-icons/fa6';
import { clsx } from 'clsx';

const SECTIONS = [
  { id: 'introduction', title: '1. Preamble & Intermediary Status' },
  { id: 'eligibility', title: '2. User Eligibility & KYC Verification' },
  { id: 'cataloging', title: '3. Listings, Cataloging & Prohibited Items' },
  { id: 'rfq-quotations', title: '4. RFQ Process & Quotation Commitments' },
  { id: 'commercial-orders', title: '5. Purchase Orders & GST Invoicing' },
  { id: 'escrow-payments', title: '6. JaxMart Assured Escrow Facility' },
  { id: 'shipping-logistics', title: '7. Freight Logistics & Transit Risk' },
  { id: 'disputes-inspection', title: '8. Inspection Period & Dispute Arbitration' },
  { id: 'subscriptions', title: '9. Subscriptions, Lead Credits & Refunds' },
  { id: 'intellectual-property', title: '10. Intellectual Property & Confidentiality' },
  { id: 'liability-governance', title: '11. Limitation of Liability & Governing Law' },
];

export default function TermsOfUsePage() {
  const [activeSection, setActiveSection] = useState('introduction');

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
          <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-jungle-green-950 text-white rounded-3xl p-8 md:p-12 mb-10 shadow-xl relative overflow-hidden">
            <div className="max-w-3xl relative z-10">
              <div className="inline-flex items-center gap-2 bg-jungle-green-900/80 text-jungle-green-300 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-4 border border-jungle-green-700/50">
                <FaScaleBalanced className="h-3.5 w-3.5" /> Legal Agreement & Policy
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tight mb-4 leading-tight">
                Terms of Use & Master Service Agreement
              </h1>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed font-normal mb-6">
                Governing your commercial access, wholesale sourcing, RFQ operations, escrow settlements, and verified business matchmaking on JaxMart.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-400">
                <span className="bg-white/10 px-3 py-1 rounded-lg">Effective Date: May 1, 2026</span>
                <span className="bg-white/10 px-3 py-1 rounded-lg">Applicable Jurisdiction: India</span>
                <span className="bg-white/10 px-3 py-1 rounded-lg">Version: 2.4.0 (GST & Escrow Aligned)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Sticky Table of Contents */}
            <div className="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <h3 className="font-heading font-black text-gray-900 text-sm uppercase tracking-wider mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
                  <FaFileContract className="h-4 w-4 text-jungle-green-600" /> Table of Contents
                </h3>
                <nav className="space-y-1">
                  {SECTIONS.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className={clsx(
                        'w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between',
                        activeSection === sec.id
                          ? 'bg-jungle-green-50 text-jungle-green-800 border-l-4 border-jungle-green-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <span className="truncate">{sec.title}</span>
                      <FaArrowRight className={clsx('h-2.5 w-2.5 shrink-0', activeSection === sec.id ? 'opacity-100' : 'opacity-0')} />
                    </button>
                  ))}
                </nav>
              </div>

              {/* Quick Legal Contact Card */}
              <div className="bg-gradient-to-br from-jungle-green-900 to-jungle-green-950 text-white p-6 rounded-3xl shadow-md space-y-3">
                <h4 className="font-heading font-black text-sm text-white">Need Legal Clarifications?</h4>
                <p className="text-xs text-jungle-green-200 leading-relaxed">
                  Our legal compliance and governance team responds to enterprise contract and supplier inquiries within 24 hours.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-amber-200 hover:underline pt-1"
                >
                  <FaEnvelope className="h-3.5 w-3.5" /> Contact Legal Compliance Desk →
                </Link>
              </div>
            </div>

            {/* Right Column: Exhaustive Legal Clauses */}
            <div className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-12">
              {/* Section 1 */}
              <section id="introduction" className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-jungle-green-100 text-jungle-green-800 flex items-center justify-center font-black text-xs">01</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    1. Preamble & Intermediary Status
                  </h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Welcome to <strong>JaxMart</strong> (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), an online B2B marketplace operated by JaxMart Technologies Private Limited, incorporated under the laws of India.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  By accessing, browsing, registering on, or utilizing our services (including posting RFQs, publishing wholesale product listings, submitting quotes, or participating in JaxMart Assured Escrow transactions), you agree to be legally bound by these Terms of Use, our <Link href="/privacy" className="text-jungle-green-700 font-bold underline">Privacy Policy</Link>, and all referenced marketplace rules.
                </p>
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed font-medium">
                  <strong>Intermediary Disclaimer:</strong> Under Section 79 of the Information Technology Act, 2000, and the Consumer Protection (E-Commerce) Rules, 2020, JaxMart acts solely as an electronic marketplace intermediary. JaxMart facilitates commercial introductions, automated matchmaking, escrow safekeeping, and digital transaction workflows between independent business entities. We are not a direct party to the underlying contract of sale unless specifically stated under JaxMart Direct Sourcing programs.
                </div>
              </section>

              {/* Section 2 */}
              <section id="eligibility" className="space-y-4 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-jungle-green-100 text-jungle-green-800 flex items-center justify-center font-black text-xs">02</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    2. User Eligibility & Mandatory Business KYC
                  </h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  The Platform is strictly intended for lawful commercial, manufacturing, trading, and institutional procurement entities. Individuals registering on behalf of a sole proprietorship, partnership firm, LLP, or private/public limited company warrant that they hold the requisite corporate authorization (Power of Attorney or Board Resolution) to bind such entity.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5 leading-relaxed">
                  <li><strong>Verified Supplier Onboarding:</strong> Suppliers listing machinery, raw materials, industrial goods, or wholesale inventory must submit valid <strong>GSTIN</strong>, <strong>Permanent Account Number (PAN)</strong>, active bank account details, and factory/warehouse registration proofs for physical verification by JaxMart On-Ground Captains.</li>
                  <li><strong>Buyer Verification:</strong> High-value RFQs exceeding ₹1,00,000 may require organizational verification prior to supplier dispatch.</li>
                  <li><strong>Account Security:</strong> You are responsible for safeguarding your OTP credentials, authorized signers, and sub-user permissions. JaxMart shall not be liable for unauthorized transactions executed via verified business accounts.</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section id="cataloging" className="space-y-4 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-jungle-green-100 text-jungle-green-800 flex items-center justify-center font-black text-xs">03</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    3. Listings, Cataloging & Prohibited Items
                  </h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Sellers must maintain accurate, truthful, and non-misleading product listings with genuine technical specifications, valid HSN codes, minimum order quantities (MOQ), and realistic factory lead times.
                </p>
                <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4 text-xs text-red-900 leading-relaxed space-y-2">
                  <div className="font-bold flex items-center gap-2 text-red-800">
                    <FaCircleExclamation className="h-4 w-4" /> Strictly Prohibited Goods on JaxMart:
                  </div>
                  <p>
                    Any illegal substances, unlicensed pharmaceuticals, counterfeit items, toxic waste, hazardous chemicals not compliant with PESO/MSDS standards, arms, and unauthorized brand duplicates are permanently banned. Violations result in immediate account termination, forfeiture of subscription credits, and reporting to competent law enforcement agencies.
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section id="rfq-quotations" className="space-y-4 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-jungle-green-100 text-jungle-green-800 flex items-center justify-center font-black text-xs">04</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    4. RFQ Submission & Quotation Commitments
                  </h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  When a buyer posts a Request for Quotation (RFQ), the request is broadcast to matching verified suppliers in our industrial directory.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5 leading-relaxed">
                  <li><strong>Quotation Validity:</strong> When a supplier submits a quotation via the Platform, the unit price, minimum dispatch timeline, and payment terms constitute a firm commercial offer valid for the duration specified in the quote (default: 15 calendar days).</li>
                  <li><strong>Lead Privacy:</strong> Unverified visitors receive masked buyer details. Only authenticated suppliers unlocking leads through authorized subscription quotas receive direct communication access.</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section id="commercial-orders" className="space-y-4 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-jungle-green-100 text-jungle-green-800 flex items-center justify-center font-black text-xs">05</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    5. Purchase Orders, Invoicing & GST Compliance
                  </h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  All transactions initiated through the JaxMart order pipeline generate a binding Digital Purchase Order (PO).
                </p>
                <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5 leading-relaxed">
                  <li><strong>Tax Invoicing:</strong> Suppliers are legally obligated to issue formal GST tax invoices compliant with Rule 46 of the CGST Rules, 2017, explicitly detailing the HSN/SAC code, GST breakdown (CGST/SGST/IGST), and buyer GSTIN.</li>
                  <li><strong>E-Way Bills:</strong> Suppliers must generate and upload valid E-Way Bills for consignments where the consignment value exceeds ₹50,000 as mandated by Indian GST authorities.</li>
                </ul>
              </section>

              {/* Section 6 */}
              <section id="escrow-payments" className="space-y-4 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-jungle-green-100 text-jungle-green-800 flex items-center justify-center font-black text-xs">06</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    6. JaxMart Assured Escrow & Milestone Payments
                  </h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  To eliminate wholesale default and advance payment fraud, JaxMart provides a milestone-based Escrow Safekeeping service.
                </p>
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 leading-relaxed space-y-2">
                  <p className="font-bold">How Milestone Escrow Protects Both Parties:</p>
                  <p>
                    1. The buyer deposits the agreed order amount via instant Razorpay (UPI / Netbanking / Corporate Cards) or Corporate NEFT/RTGS into a designated Nodal/Escrow Account.<br />
                    2. Funds are locked securely; the supplier receives verified notification to initiate manufacturing or dispatch.<br />
                    3. Payouts are disbursed to the supplier in scheduled milestone tranches (e.g. 30% advance for raw materials, 70% upon proof of delivery and quality inspection sign-off).
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section id="shipping-logistics" className="space-y-4 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-jungle-green-100 text-jungle-green-800 flex items-center justify-center font-black text-xs">07</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    7. Freight Logistics, Delivery Proof & Transit Risk
                  </h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Unless explicitly contracted under JaxMart Managed Logistics, freight dispatch terms (Ex-Works, FOR, FOB, CIF) must be mutually agreed between buyer and seller in the order contract.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5 leading-relaxed">
                  <li><strong>Proof of Delivery (POD):</strong> Milestone release requires an authenticated Consignment Note (Lorry Receipt / Bilti) signed and stamped by the receiving warehouse manager.</li>
                  <li><strong>Transit Insurance:</strong> The responsible party (per Incoterms agreed in the quotation) must secure adequate commercial transit insurance against theft, water damage, or road accidents.</li>
                </ul>
              </section>

              {/* Section 8 */}
              <section id="disputes-inspection" className="space-y-4 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-jungle-green-100 text-jungle-green-800 flex items-center justify-center font-black text-xs">08</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    8. Inspection Period & Dispute Arbitration
                  </h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Upon physical receipt of goods at the designated delivery terminal, the buyer has a standard <strong>48 to 72 business hour Inspection Window</strong> to verify quantity, dimensions, test batch reports, and compliance with agreed technical specifications.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5 leading-relaxed">
                  <li><strong>Raising a Dispute:</strong> If goods fail specifications or arrive damaged, the buyer must click &quot;Open Dispute&quot; on the order portal before approving the milestone. Escrow disbursement is immediately frozen.</li>
                  <li><strong>Mediation & Arbitration:</strong> JaxMart Dispute Officers will review test reports and photos. If mutual conciliation fails within 14 days, the dispute shall be referred to sole arbitration under the Arbitration and Conciliation Act, 1996, with proceedings conducted in Ahmedabad, Gujarat.</li>
                </ul>
              </section>

              {/* Section 9 */}
              <section id="subscriptions" className="space-y-4 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-jungle-green-100 text-jungle-green-800 flex items-center justify-center font-black text-xs">09</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    9. Subscriptions, Lead Credits & Refund Policy
                  </h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  JaxMart offers paid membership tiers (Gold Supplier, Platinum Enterprise) providing verified badges, prioritized catalog placement, and monthly lead unlock credits.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5 leading-relaxed">
                  <li><strong>Billing:</strong> Subscriptions are billed on an annual or monthly cycle in INR plus applicable GST (18%). Payments are processed securely via Razorpay or direct bank transfer.</li>
                  <li><strong>Refund Policy:</strong> Subscription fees and consumed lead credits are non-refundable once activated. Duplicate payments or erroneous platform billing will be refunded to the original payment source within 5 to 7 business days.</li>
                </ul>
              </section>

              {/* Section 10 */}
              <section id="intellectual-property" className="space-y-4 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-jungle-green-100 text-jungle-green-800 flex items-center justify-center font-black text-xs">10</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    10. Intellectual Property & Confidentiality
                  </h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  All trademarks, UI designs, codebases, algorithms, logos, and proprietary algorithms on JaxMart are the exclusive intellectual property of JaxMart Technologies Pvt. Ltd.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  CAD drawings, custom formulations, and confidential requirement specs shared between buyers and sellers under RFQs remain proprietary to the disclosing party and must not be repurposed or shared with unauthorized third parties.
                </p>
              </section>

              {/* Section 11 */}
              <section id="liability-governance" className="space-y-4 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl bg-jungle-green-100 text-jungle-green-800 flex items-center justify-center font-black text-xs">11</span>
                  <h2 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    11. Limitation of Liability & Governing Law
                  </h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  To the maximum extent permitted by Indian law, JaxMart shall not be liable for any indirect, incidental, punitive, or consequential commercial losses (including loss of business profits, plant downtime, or market fluctuations) arising out of the use of our services.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  These Terms of Use shall be governed by and construed in accordance with the substantive laws of the Republic of India. The courts of <strong>Ahmedabad, Gujarat, India</strong> shall have exclusive jurisdiction over all claims and proceedings.
                </p>
              </section>

              {/* Footer Stamp */}
              <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
                <span>Official Document ID: JM-TOS-2026-V2</span>
                <div className="flex items-center gap-4">
                  <Link href="/privacy" className="text-jungle-green-700 font-bold hover:underline">Privacy Policy →</Link>
                  <Link href="/contact" className="text-jungle-green-700 font-bold hover:underline">Contact Support →</Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </PublicLayout>
  );
}

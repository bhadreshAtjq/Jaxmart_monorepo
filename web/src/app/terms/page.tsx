'use client';

import { PublicLayout } from '@/components/layout/PublicLayout';

export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="bg-gradient-to-b from-[#0A2533]/5 to-transparent min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-[#0A2533] uppercase tracking-tight mb-4">
              Terms of Service
            </h1>
            <p className="text-sm text-gray-500 font-medium max-w-xl mx-auto leading-relaxed">
              Please read these terms carefully before using India's trusted B2B procurement and wholesale marketplace.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 p-8 sm:p-10 space-y-8">
            <section className="space-y-3">
              <h2 className="font-heading font-extrabold text-lg text-[#0A2533] uppercase tracking-wider">
                1. Acceptance of Terms
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed font-normal">
                By accessing or using JaxMart (the "Platform"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not access or use the Platform. These terms apply to all buyers, sellers, and visitors.
              </p>
            </section>

            <section className="space-y-3 border-t border-gray-50 pt-8">
              <h2 className="font-heading font-extrabold text-lg text-[#0A2533] uppercase tracking-wider">
                2. User Accounts and Verification
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed font-normal">
                To access certain features of the Platform (such as posting RFQs or listing products), you must register and verify your account. You agree to provide accurate, current, and complete business information during the registration process and to keep this data updated.
              </p>
            </section>

            <section className="space-y-3 border-t border-gray-50 pt-8">
              <h2 className="font-heading font-extrabold text-lg text-[#0A2533] uppercase tracking-wider">
                3. B2B Marketplace Guidelines
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed font-normal">
                JaxMart is a business-to-business marketplace. All transactions, quotations, and communications must remain professional and compliant with local commerce guidelines. Sellers are responsible for the accuracy of their listings, and buyers are responsible for their purchase commitments.
              </p>
            </section>

            <section className="space-y-3 border-t border-gray-50 pt-8">
              <h2 className="font-heading font-extrabold text-lg text-[#0A2533] uppercase tracking-wider">
                4. Safe Escrow Payments
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed font-normal">
                To protect both buyers and sellers, JaxMart offers secure milestone-based escrow payments. Funds are released to the seller only upon the buyer confirming the satisfactory receipt of goods or completion of service milestones as agreed in the digital order contract.
              </p>
            </section>

            <section className="space-y-3 border-t border-gray-50 pt-8">
              <h2 className="font-heading font-extrabold text-lg text-[#0A2533] uppercase tracking-wider">
                5. Limitation of Liability
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed font-normal">
                JaxMart facilitates connections between business entities but is not a party to individual contracts. We do not guarantee the quality, safety, or legality of products listed by third-party suppliers, nor do we accept liability for standard shipping delays or transit disputes.
              </p>
            </section>

            <section className="space-y-3 border-t border-gray-50 pt-8">
              <h2 className="font-heading font-extrabold text-lg text-[#0A2533] uppercase tracking-wider">
                6. Contact Information
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed font-normal">
                If you have questions about these Terms of Service or need assistance, please visit our Support page or contact our legal compliance team at <span className="font-bold text-[#2F578A]">legal@jaxmart.com</span>.
              </p>
            </section>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8 font-medium">
            Last Updated: May 2026 • © JaxMart Marketplace
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}

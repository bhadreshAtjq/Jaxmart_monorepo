'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button, Card, Badge, Container } from '@/components/ui';
import { useSubscriptionPlans, useMySubscription, useEntitlements, revalidate } from '@/lib/hooks';
import { subscriptionApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import {
  FaCheck,
  FaXmark,
  FaBolt,
  FaShieldHalved,
  FaCrown,
  FaBuildingColumns,
  FaCoins,
  FaHeadset,
  FaArrowRight,
  FaCircleQuestion,
  FaStar,
} from 'react-icons/fa6';
import { Sparkles, ShieldCheck, TrendingUp, Zap, Users, Award } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();
  const { data: plansData, isLoading: plansLoading } = useSubscriptionPlans();
  const { data: mySub } = useMySubscription();
  const { data: entitlements } = useEntitlements();

  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Bank Transfer modal states
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankPlan, setBankPlan] = useState<any>(null);
  const [bankForm, setBankForm] = useState({
    amount: '',
    transactionReference: '',
    receiptUrl: '',
    notes: '',
  });

  // Credit pack modal
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [selectedCreditPack, setSelectedCreditPack] = useState<any>(null);

  const plans = plansData?.plans || [
    {
      id: 'free',
      name: 'Free',
      slug: 'free',
      description: 'Essential starter plan for new suppliers. Includes 5 listings and 10 lead notifications.',
      monthlyPrice: 0,
      yearlyPrice: 0,
      listingLimit: 5,
      leadQuotaPerCycle: 10,
      searchRankWeight: 0,
      hasVerifiedBadge: false,
      hasFeaturedPlacement: false,
      hasAnalytics: false,
      assuredDealFeeDiscountPct: 0,
      teamSeats: 1,
      supportLevel: 'EMAIL_ONLY',
    },
    {
      id: 'silver',
      name: 'Silver',
      slug: 'silver',
      description: 'For growing suppliers seeking verified business trust, 25 listings, and 50 lead unlocks.',
      monthlyPrice: 1499,
      yearlyPrice: 14990,
      listingLimit: 25,
      leadQuotaPerCycle: 50,
      searchRankWeight: 2,
      hasVerifiedBadge: true,
      hasFeaturedPlacement: false,
      hasAnalytics: false,
      assuredDealFeeDiscountPct: 10,
      teamSeats: 1,
      supportLevel: 'EMAIL_CHAT',
    },
    {
      id: 'gold',
      name: 'Gold',
      slug: 'gold',
      description: 'Recommended for active manufacturers. 100 listings, 200 leads, and 25% Assured Deal fee discount.',
      monthlyPrice: 4999,
      yearlyPrice: 49990,
      listingLimit: 100,
      leadQuotaPerCycle: 200,
      searchRankWeight: 5,
      hasVerifiedBadge: true,
      hasFeaturedPlacement: true,
      hasAnalytics: true,
      assuredDealFeeDiscountPct: 25,
      teamSeats: 3,
      supportLevel: 'PRIORITY',
    },
    {
      id: 'platinum',
      name: 'Platinum',
      slug: 'platinum',
      description: 'Enterprise tier with unlimited listings, leads, top search placement, and 40% Assured Deal discount.',
      monthlyPrice: 9999,
      yearlyPrice: 99990,
      listingLimit: -1,
      leadQuotaPerCycle: -1,
      searchRankWeight: 10,
      hasVerifiedBadge: true,
      hasFeaturedPlacement: true,
      hasAnalytics: true,
      assuredDealFeeDiscountPct: 40,
      teamSeats: 10,
      supportLevel: 'DEDICATED',
    },
  ];

  const creditPacks = plansData?.creditPacks || [
    { id: 'pack_10', credits: 10, price: 499, pricePerLead: 49.9, discount: '0%' },
    { id: 'pack_50', credits: 50, price: 1999, pricePerLead: 39.9, discount: '20% OFF' },
    { id: 'pack_100', credits: 100, price: 3499, pricePerLead: 34.9, discount: '30% OFF' },
    { id: 'pack_250', credits: 250, price: 6999, pricePerLead: 27.9, discount: '44% OFF' },
  ];

  const handleSubscribe = async (plan: any) => {
    if (!isLoggedIn) {
      toast.error('Please log in or create a seller account to subscribe');
      router.push('/auth/login?redirect=/pricing');
      return;
    }

    setLoadingAction(plan.id);
    try {
      const price = billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;

      if (price === 0) {
        await subscriptionApi.subscribe({ planId: plan.id, billingCycle });
        toast.success('Successfully subscribed to Free Plan!');
        revalidate.subscriptions();
        setLoadingAction(null);
        return;
      }

      // Initiate Razorpay checkout
      const res = await subscriptionApi.subscribe({
        planId: plan.id,
        billingCycle,
        paymentMethod: 'RAZORPAY',
      });

      const { razorpayOrderId, amount, currency, keyId } = res.data;

      const options = {
        key: keyId || 'rzp_test_placeholder',
        amount: Math.round(amount * 100),
        currency: currency || 'INR',
        name: 'JaxMart B2B Marketplace',
        description: `Subscription: ${plan.name} (${billingCycle})`,
        image: '/favicon.png',
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          try {
            await subscriptionApi.verifyRazorpay({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              planId: plan.id,
              billingCycle,
            });
            toast.success(`🎉 Congratulations! You are now on the ${plan.name} plan.`);
            revalidate.subscriptions();
          } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Payment verification failed');
          }
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#0D7E83',
        },
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          toast.error(`Payment failed: ${response.error.description}`);
        });
        rzp.open();
      } else {
        toast.error('Razorpay SDK is loading, please try again in a few seconds');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to initiate subscription');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleBuyCredits = async (pack: any) => {
    if (!isLoggedIn) {
      toast.error('Please log in to purchase lead credits');
      router.push('/auth/login?redirect=/pricing');
      return;
    }

    setLoadingAction(pack.id);
    try {
      const res = await subscriptionApi.createCreditOrder(pack.id);
      const { razorpayOrderId, amount, currency, keyId } = res.data;

      const options = {
        key: keyId || 'rzp_test_placeholder',
        amount: Math.round(amount * 100),
        currency: currency || 'INR',
        name: 'JaxMart Lead Credits',
        description: `Lead Unlock Pack: ${pack.credits} Credits`,
        image: '/favicon.png',
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          try {
            await subscriptionApi.verifyCreditPurchase({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              packId: pack.id,
            });
            toast.success(`🎉 ${pack.credits} Lead Credits added to your wallet!`);
            setShowCreditModal(false);
            revalidate.subscriptions();
          } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Credit verification failed');
          }
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#0D7E83',
        },
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error('Payment gateway initializing, please try again');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to order lead credits');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleManualDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.transactionReference || !bankForm.receiptUrl || !bankForm.amount) {
      toast.error('Please fill in all required payment details');
      return;
    }

    try {
      await subscriptionApi.submitDeposit({
        planId: bankPlan?.id,
        amount: parseFloat(bankForm.amount),
        transactionReference: bankForm.transactionReference,
        receiptUrl: bankForm.receiptUrl,
        notes: bankForm.notes,
      });
      toast.success('Deposit receipt submitted! Our finance team will verify within 2-4 hours.');
      setShowBankModal(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to submit deposit receipt');
    }
  };

  const currentPlanSlug = entitlements?.plan?.slug || mySub?.subscription?.plan?.slug || 'free';

  return (
    <PublicLayout>
      <div className="bg-gradient-to-b from-gray-50 via-white to-gray-50 pt-12 pb-24 border-b border-gray-200">
        <Container size="xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-jungle-green-100/70 border border-jungle-green-200 text-jungle-green-800 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-4">
              <Sparkles className="h-3.5 w-3.5 text-jungle-green-600" />
              Grow Your B2B Revenue With High-Intent Leads
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-gray-900 tracking-tight leading-tight mb-4">
              Flexible Supplier Plans For Every Stage of Growth
            </h1>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed font-normal">
              Connect directly with verified corporate buyers, unlock targeted RFQs, rank higher in search, and enjoy discounted rates on JaxMart Assured Deals.
            </p>

            {/* Monthly / Annual Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={clsx('text-sm font-bold', billingCycle === 'MONTHLY' ? 'text-gray-900' : 'text-gray-400')}>
                Monthly Billing
              </span>
              <button
                type="button"
                onClick={() => setBillingCycle((prev) => (prev === 'MONTHLY' ? 'YEARLY' : 'MONTHLY'))}
                className={clsx(
                  'relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none shadow-inner',
                  billingCycle === 'YEARLY' ? 'bg-jungle-green-600' : 'bg-gray-300'
                )}
              >
                <span
                  className={clsx(
                    'inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md',
                    billingCycle === 'YEARLY' ? 'translate-x-8' : 'translate-x-1'
                  )}
                />
              </button>
              <div className="flex items-center gap-1.5">
                <span className={clsx('text-sm font-bold', billingCycle === 'YEARLY' ? 'text-gray-900' : 'text-gray-400')}>
                  Annual Billing
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-200">
                  Save 20%
                </span>
              </div>
            </div>
          </div>

          {/* Current Entitlements Banner (for logged-in sellers) */}
          {isLoggedIn && entitlements && (
            <div className="bg-white border border-jungle-green-200 rounded-2xl p-6 mb-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-jungle-green-100 text-jungle-green-700 flex items-center justify-center shrink-0">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Current Plan</span>
                    <span className="text-sm font-black bg-jungle-green-600 text-white px-2.5 py-0.5 rounded-md uppercase">
                      {entitlements.plan.name} Tier
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 font-medium">
                    Available Leads: <span className="font-black text-jungle-green-700">{entitlements.usage.totalAvailableLeads}</span> ({entitlements.usage.remainingLeadQuota} plan quota + {entitlements.usage.walletCredits} wallet credits)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setShowCreditModal(true)}
                  className="rounded-xl font-bold flex items-center gap-1.5"
                >
                  <FaCoins className="h-4 w-4 text-amber-500" /> Top Up Lead Credits
                </Button>
                <Button
                  onClick={() => router.push('/seller/rfq-inbox')}
                  className="bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  View Buyer Leads <FaArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-16">
            {plans.map((plan: any) => {
              const isCurrent = currentPlanSlug.toLowerCase() === plan.slug.toLowerCase();
              const isGold = plan.slug === 'gold';
              const price = billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;
              const displayPrice = price === 0 ? '₹0' : `₹${price.toLocaleString('en-IN')}`;
              const periodText = price === 0 ? 'forever' : billingCycle === 'YEARLY' ? '/year' : '/month';

              return (
                <div
                  key={plan.id || plan.slug}
                  className={clsx(
                    'relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-200',
                    isGold
                      ? 'bg-gradient-to-b from-jungle-green-900 to-jungle-green-950 text-white shadow-xl ring-2 ring-jungle-green-500 scale-[1.02]'
                      : 'bg-white border border-gray-200/80 text-gray-900 shadow-sm hover:shadow-md'
                  )}
                >
                  {isGold && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-gray-950 text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <FaCrown className="h-3 w-3" /> Most Recommended
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className={clsx('text-xl font-black font-heading tracking-tight', isGold ? 'text-white' : 'text-gray-900')}>
                        {plan.name}
                      </h3>
                      {isCurrent && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Active Plan
                        </span>
                      )}
                    </div>
                    <p className={clsx('text-xs leading-relaxed mb-6 font-medium min-h-[36px]', isGold ? 'text-jungle-green-200' : 'text-gray-500')}>
                      {plan.description}
                    </p>

                    {/* Price Tag */}
                    <div className="mb-6 pb-6 border-b border-gray-200/20">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3.5xl md:text-4xl font-black font-heading tracking-tight">
                          {displayPrice}
                        </span>
                        <span className={clsx('text-xs font-semibold', isGold ? 'text-jungle-green-300' : 'text-gray-500')}>
                          {periodText}
                        </span>
                      </div>
                      {billingCycle === 'YEARLY' && price > 0 && (
                        <p className={clsx('text-[11px] mt-1', isGold ? 'text-amber-300' : 'text-emerald-600 font-bold')}>
                          Equivalent to ₹{Math.round(price / 12).toLocaleString('en-IN')}/mo billed annually
                        </p>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 mb-8 text-xs font-medium">
                      <div className="flex items-center gap-2.5">
                        <div className={clsx('h-4 w-4 rounded-full flex items-center justify-center shrink-0', isGold ? 'bg-jungle-green-500 text-white' : 'bg-jungle-green-100 text-jungle-green-700')}>
                          <FaCheck className="h-2.5 w-2.5" />
                        </div>
                        <span>
                          <strong>{plan.listingLimit === -1 ? 'Unlimited' : plan.listingLimit}</strong> Product Listings
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className={clsx('h-4 w-4 rounded-full flex items-center justify-center shrink-0', isGold ? 'bg-jungle-green-500 text-white' : 'bg-jungle-green-100 text-jungle-green-700')}>
                          <FaCheck className="h-2.5 w-2.5" />
                        </div>
                        <span>
                          <strong>{plan.leadQuotaPerCycle === -1 ? 'Unlimited' : `${plan.leadQuotaPerCycle} Leads`}</strong> / billing cycle
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className={clsx('h-4 w-4 rounded-full flex items-center justify-center shrink-0', isGold ? 'bg-jungle-green-500 text-white' : 'bg-jungle-green-100 text-jungle-green-700')}>
                          <FaCheck className="h-2.5 w-2.5" />
                        </div>
                        <span>
                          Search Boost: <strong>{plan.searchRankWeight > 0 ? `${plan.searchRankWeight}x Weight` : 'Standard'}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className={clsx('h-4 w-4 rounded-full flex items-center justify-center shrink-0', plan.hasVerifiedBadge ? (isGold ? 'bg-jungle-green-500 text-white' : 'bg-jungle-green-100 text-jungle-green-700') : 'bg-gray-100 text-gray-400')}>
                          {plan.hasVerifiedBadge ? <FaCheck className="h-2.5 w-2.5" /> : <FaXmark className="h-2.5 w-2.5" />}
                        </div>
                        <span className={!plan.hasVerifiedBadge ? (isGold ? 'text-jungle-green-300/50 line-through' : 'text-gray-400 line-through') : ''}>
                          Verified Trust Badge & GSTIN Seal
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className={clsx('h-4 w-4 rounded-full flex items-center justify-center shrink-0', plan.assuredDealFeeDiscountPct > 0 ? (isGold ? 'bg-amber-400 text-gray-950' : 'bg-emerald-100 text-emerald-700') : 'bg-gray-100 text-gray-400')}>
                          <FaBolt className="h-2.5 w-2.5" />
                        </div>
                        <span className="font-bold">
                          {plan.assuredDealFeeDiscountPct > 0 ? `${plan.assuredDealFeeDiscountPct}% Off Assured Deal Fee` : 'Standard Escrow Fee'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className={clsx('h-4 w-4 rounded-full flex items-center justify-center shrink-0', plan.hasAnalytics ? (isGold ? 'bg-jungle-green-500 text-white' : 'bg-jungle-green-100 text-jungle-green-700') : 'bg-gray-100 text-gray-400')}>
                          {plan.hasAnalytics ? <FaCheck className="h-2.5 w-2.5" /> : <FaXmark className="h-2.5 w-2.5" />}
                        </div>
                        <span className={!plan.hasAnalytics ? (isGold ? 'text-jungle-green-300/50 line-through' : 'text-gray-400 line-through') : ''}>
                          Buyer-Intent Analytics & Reports
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className={clsx('h-4 w-4 rounded-full flex items-center justify-center shrink-0', isGold ? 'bg-jungle-green-500 text-white' : 'bg-jungle-green-100 text-jungle-green-700')}>
                          <FaCheck className="h-2.5 w-2.5" />
                        </div>
                        <span>
                          {plan.teamSeats} Team Seat{plan.teamSeats > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => handleSubscribe(plan)}
                      disabled={loadingAction === plan.id || isCurrent}
                      className={clsx(
                        'w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all',
                        isGold
                          ? 'bg-amber-400 hover:bg-amber-500 text-gray-950 shadow-lg'
                          : isCurrent
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-jungle-green-600 hover:bg-jungle-green-700 text-white'
                      )}
                    >
                      {loadingAction === plan.id
                        ? 'Processing...'
                        : isCurrent
                        ? 'Current Plan'
                        : plan.monthlyPrice === 0
                        ? 'Get Started Free'
                        : `Upgrade to ${plan.name}`}
                    </Button>

                    {price > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setBankPlan(plan);
                          setBankForm((f) => ({ ...f, amount: String(price) }));
                          setShowBankModal(true);
                        }}
                        className={clsx(
                          'w-full text-center text-[11px] font-semibold py-1 hover:underline',
                          isGold ? 'text-jungle-green-300' : 'text-gray-500'
                        )}
                      >
                        Pay via NEFT / RTGS Bank Transfer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lead Credit Wallet Top-Up Strip */}
          <div className="bg-white border border-gray-200/80 rounded-3xl p-8 mb-16 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <FaCoins className="h-4 w-4" /> Pay-As-You-Go Lead Packs
                </div>
                <h2 className="text-2xl font-black font-heading text-gray-900 tracking-tight">
                  Need Extra Buyer Leads Beyond Your Monthly Quota?
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Lead credits never expire. Use them anytime to instantly unlock verified buyer phone numbers and emails.
                </p>
              </div>

              {isLoggedIn && entitlements && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-amber-900 shrink-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Wallet Balance</p>
                  <p className="text-xl font-black">{entitlements.usage.walletCredits} Credits Available</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {creditPacks.map((pack: any) => (
                <div
                  key={pack.id}
                  className="border border-gray-200 rounded-2xl p-5 flex flex-col justify-between hover:border-jungle-green-500 hover:shadow-md transition-all group bg-gray-50/50"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-black text-gray-900 font-heading">{pack.credits} Leads</span>
                      {pack.discount !== '0%' && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          {pack.discount}
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-black text-jungle-green-700 font-heading mb-1">
                      ₹{pack.price.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-gray-500 mb-4">₹{pack.pricePerLead} per unlocked buyer contact</p>
                  </div>

                  <Button
                    onClick={() => handleBuyCredits(pack)}
                    disabled={loadingAction === pack.id}
                    className="w-full bg-white group-hover:bg-jungle-green-600 group-hover:text-white text-gray-800 border border-gray-200 rounded-xl font-bold text-xs py-2.5 transition-all"
                  >
                    {loadingAction === pack.id ? 'Processing...' : 'Buy Lead Pack'}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Assured Deal Repositioning Explainer */}
          <div className="bg-gradient-to-r from-jungle-green-900 to-jungle-green-950 text-white rounded-3xl p-8 md:p-12 mb-16 shadow-xl relative overflow-hidden">
            <div className="max-w-3xl relative z-10">
              <div className="inline-flex items-center gap-2 bg-jungle-green-800 text-jungle-green-200 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 border border-jungle-green-700">
                <ShieldCheck className="h-4 w-4 text-jungle-green-400" />
                JaxMart Assured Deal Protection
              </div>
              <h2 className="text-3xl md:text-4xl font-black font-heading tracking-tight mb-4">
                Close Leads Safely With Milestone Escrow & Freight Protection
              </h2>
              <p className="text-sm md:text-base text-jungle-green-100 leading-relaxed mb-6 font-normal">
                When you agree terms with a buyer on JaxMart, convert your chat into an <strong>Assured Deal</strong>. Buyer funds are held in secure escrow, freight is tracked end-to-end, and payments release automatically upon delivery.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-jungle-green-800">
                <div>
                  <h4 className="font-bold text-amber-300 text-sm mb-1">0% Upfront Cost</h4>
                  <p className="text-xs text-jungle-green-200">Only pay transaction fees when a deal successfully converts.</p>
                </div>
                <div>
                  <h4 className="font-bold text-amber-300 text-sm mb-1">Up to 40% Tier Discount</h4>
                  <p className="text-xs text-jungle-green-200">Gold and Platinum members get major transaction fee waivers.</p>
                </div>
                <div>
                  <h4 className="font-bold text-amber-300 text-sm mb-1">Boosts Your Trust Score</h4>
                  <p className="text-xs text-jungle-green-200">Every completed Assured Deal gives your profile higher search rank.</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section (AEO / GEO optimized) */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-black font-heading text-gray-900 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-gray-600 mt-1">Everything you need to know about seller plans and lead generation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="bg-white border border-gray-200/80 rounded-2xl p-6">
                <h4 className="font-bold text-gray-900 text-sm mb-2">How do lead quotas work?</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Each subscription plan includes a set number of buyer lead unlocks per billing cycle. Unlocking a lead reveals the buyer&apos;s direct phone number, email address, and business location.
                </p>
              </div>

              <div className="bg-white border border-gray-200/80 rounded-2xl p-6">
                <h4 className="font-bold text-gray-900 text-sm mb-2">What happens if I exhaust my plan quota?</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  You can top up your wallet anytime using on-demand Lead Credit packs (starting at ₹499 for 10 leads) or upgrade to Gold/Platinum for higher quotas.
                </p>
              </div>

              <div className="bg-white border border-gray-200/80 rounded-2xl p-6">
                <h4 className="font-bold text-gray-900 text-sm mb-2">What is JaxMart Assured Deal?</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  It is a post-lead transaction protection layer. When buyer and seller agree terms, buyer funds are held in escrow and released per agreed milestone proofs.
                </p>
              </div>

              <div className="bg-white border border-gray-200/80 rounded-2xl p-6">
                <h4 className="font-bold text-gray-900 text-sm mb-2">Can I pay via NEFT / RTGS Bank Transfer?</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Yes! We support instant online Razorpay (UPI, Netbanking, Cards) as well as direct corporate NEFT/RTGS bank transfers with invoice receipts.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Manual Bank Transfer Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setShowBankModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700"
            >
              <FaXmark className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-heading font-black text-gray-900 mb-2">
              NEFT / RTGS Bank Transfer
            </h3>
            <p className="text-xs text-gray-600 mb-6">
              Transfer the subscription amount to JaxMart&apos;s corporate account and submit transaction details below for verification.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 text-xs space-y-1.5">
              <div className="flex justify-between"><span className="text-gray-500">Account Name:</span><span className="font-bold text-gray-900">JaxMart Global B2B Pvt Ltd</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Bank Name:</span><span className="font-bold text-gray-900">HDFC Bank Ltd</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Account Number:</span><span className="font-bold text-gray-900">50200088997766</span></div>
              <div className="flex justify-between"><span className="text-gray-500">IFSC Code:</span><span className="font-bold text-gray-900">HDFC0001234</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Plan Amount:</span><span className="font-bold text-jungle-green-700">₹{bankForm.amount}</span></div>
            </div>

            <form onSubmit={handleManualDepositSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Transaction UTR / Reference No. *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CMS123456789"
                  value={bankForm.transactionReference}
                  onChange={(e) => setBankForm({ ...bankForm, transactionReference: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Payment Receipt / Screenshot URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={bankForm.receiptUrl}
                  onChange={(e) => setBankForm({ ...bankForm, receiptUrl: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-xl py-3 font-bold">
                  Submit Deposit Receipt
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credit Packs Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setShowCreditModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700"
            >
              <FaXmark className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
              <FaCoins className="h-4 w-4" /> Top Up Wallet
            </div>
            <h3 className="text-2xl font-heading font-black text-gray-900 mb-2">
              Select a Lead Credit Pack
            </h3>
            <p className="text-xs text-gray-600 mb-6">
              Instant activation via Razorpay. Credits never expire and work on all category RFQs.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {creditPacks.map((pack: any) => (
                <div
                  key={pack.id}
                  className="border border-gray-200 rounded-2xl p-5 flex flex-col justify-between hover:border-jungle-green-500 hover:shadow-md transition-all bg-gray-50"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-black text-gray-900 font-heading">{pack.credits} Leads</span>
                      {pack.discount !== '0%' && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          {pack.discount}
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-black text-jungle-green-700 font-heading mb-1">
                      ₹{pack.price.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-gray-500 mb-4">₹{pack.pricePerLead} / lead unlock</p>
                  </div>

                  <Button
                    onClick={() => handleBuyCredits(pack)}
                    disabled={loadingAction === pack.id}
                    className="w-full bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-xl font-bold text-xs py-2.5"
                  >
                    {loadingAction === pack.id ? 'Processing...' : 'Pay with Razorpay'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}

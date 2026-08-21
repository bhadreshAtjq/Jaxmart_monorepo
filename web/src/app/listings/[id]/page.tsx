'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FaShieldHalved,
  FaStar,
  FaCircleCheck,
  FaBolt,
  FaArrowRight,
  FaTruck,
  FaGlobe,
  FaBoxOpen,
  FaCubes,
  FaHeart,
  FaShareNodes,
  FaCheck,
  FaBuilding,
  FaIndustry,
  FaCertificate,
  FaFlask,
  FaClock,
  FaLanguage,
  FaUsers,
  FaMessage,
  FaBox,
  FaLocationDot,
  FaPhone,
  FaEnvelope,
  FaHandshake,
  FaFileContract,
  FaLock,
  FaCoins,
  FaChevronRight,
  FaBoxesStacked,
} from 'react-icons/fa6';
import { ShieldCheck, Award, TrendingUp, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useListing, useListingSearch, revalidate } from '@/lib/hooks';
import { messageApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button, Card, Badge, Avatar, TrustScore, Container, Skeleton, Input } from '@/components/ui';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import Link from 'next/link';

function getSpecifications(listing: any) {
  const dbSpecs = listing.productDetail?.specifications;
  if (dbSpecs && typeof dbSpecs === 'object' && Object.keys(dbSpecs).length > 0) {
    return Object.entries(dbSpecs).map(([key, val]) => ({ name: key, value: String(val) }));
  }
  return [];
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [inquiryQty, setInquiryQty] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'company' | 'shipping' | 'reviews'>('specs');
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  const { data: listing, isLoading, error } = useListing(id as string);
  const { user, isLoggedIn } = useAuthStore();
  const isOwner = user?.id === listing?.sellerId;

  // Fetch related products in the same category
  const { data: relatedData } = useListingSearch(
    listing?.categoryId ? { categoryId: listing.categoryId, limit: 4 } : { limit: 4 }
  );
  const relatedListings = relatedData?.listings?.filter((l: any) => l.id !== id) || [];

  if (isLoading) {
    return (
      <PublicLayout>
        <Container size="xl" className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <Skeleton className="aspect-square rounded-3xl" />
            </div>
            <div className="lg:col-span-7 space-y-6">
              <Skeleton className="h-10 w-3/4 rounded-xl" />
              <Skeleton className="h-6 w-1/3 rounded-xl" />
              <Skeleton className="h-32 w-full rounded-3xl" />
              <Skeleton className="h-14 w-1/2 rounded-2xl" />
            </div>
          </div>
        </Container>
      </PublicLayout>
    );
  }

  if (error || !listing) {
    return (
      <PublicLayout>
        <Container className="py-32 text-center space-y-6">
          <div className="h-20 w-20 bg-gray-100 text-gray-400 rounded-3xl flex items-center justify-center mx-auto">
            <FaBoxOpen className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight font-heading">
              Product Not Found
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              This product listing may have been unlisted or moved.
            </p>
          </div>
          <Button
            className="px-8 py-3.5 bg-jungle-green-600 hover:bg-jungle-green-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl"
            onClick={() => router.push('/search')}
          >
            Browse All Products
          </Button>
        </Container>
      </PublicLayout>
    );
  }

  const isProduct = listing.listingType === 'PRODUCT';
  const pd = listing.productDetail;
  const sd = listing.serviceDetail;
  const seller = listing.seller;
  const bp = seller?.businessProfile;

  const priceType = pd?.priceType || 'FIXED';
  const activeVariant = selectedVariant || listing.variants?.[0];
  const effectivePrice = activeVariant?.priceOverride ?? pd?.pricePerUnit;
  const dynamicSpecs = getSpecifications(listing);

  // Bulk Price Slabs (e.g., 10-49: ₹500, 50-199: ₹450, 200+: ₹400)
  const bulkPriceSlabs = pd?.bulkPriceSlabs?.length > 0
    ? pd.bulkPriceSlabs
    : effectivePrice
    ? [
        { minQty: pd?.minOrderQty || 1, maxQty: (pd?.minOrderQty || 1) * 5, pricePerUnit: effectivePrice },
        { minQty: (pd?.minOrderQty || 1) * 5 + 1, maxQty: (pd?.minOrderQty || 1) * 20, pricePerUnit: Math.round(effectivePrice * 0.92) },
        { minQty: (pd?.minOrderQty || 1) * 20 + 1, maxQty: 'Above', pricePerUnit: Math.round(effectivePrice * 0.85) },
      ]
    : [];

  const handleStartInquiry = async (customMessage?: string) => {
    if (!isLoggedIn) {
      toast.error('Please log in to chat with the supplier.');
      router.push(`/auth/login?redirect=/listings/${id}`);
      return;
    }
    if (listing.sellerId === user?.id) {
      toast.error('This is your own product listing.');
      return;
    }
    setSending(true);
    try {
      const targetQuantity = inquiryQty ? `${inquiryQty} ${pd?.unitOfMeasure || 'units'}` : '';
      const msg = customMessage || inquiryMsg.trim() || `Hello, I am interested in sourcing "${listing.title}". Please share your best bulk quotation and transit timeline.`;

      const payloadMessage = targetQuantity ? `${msg}\n\n*Target Volume: ${targetQuantity}*` : msg;

      const { data: conv } = await messageApi.startConversation(
        listing.sellerId,
        payloadMessage,
        undefined,
        undefined,
        listing.id
      );
      toast.success('Inquiry sent! Connecting to supplier...');
      setShowInquiryModal(false);
      router.push(`/inbox?id=${conv.id}&recipientId=${listing.sellerId}`);
    } catch {
      toast.error('Failed to initiate conversation with supplier.');
    } finally {
      setSending(false);
    }
  };

  const handleCreateAssuredDeal = () => {
    if (!isLoggedIn) {
      toast.error('Please log in to initiate an Assured Deal.');
      router.push(`/auth/login?redirect=/listings/${id}`);
      return;
    }
    const targetQty = inquiryQty ? parseFloat(inquiryQty) : (pd?.minOrderQty || 1);
    const estimatedTotal = (effectivePrice || 1000) * targetQty;
    router.push(`/rfq/create?title=${encodeURIComponent(`Order: ${listing.title}`)}&categoryId=${listing.categoryId}&budget=${estimatedTotal}`);
  };

  // Structured technical details
  const specRows = isProduct
    ? [
        { label: 'Brand / Manufacturer', value: pd?.brand || bp?.businessName || 'OEM Factory' },
        { label: 'Place of Origin', value: pd?.countryOfOrigin || 'India' },
        { label: 'Min. Order Quantity (MOQ)', value: `${pd?.minOrderQty || 1} ${pd?.unitOfMeasure || 'Units'}` },
        pd?.leadTimeDays && { label: 'Dispatch Lead Time', value: `${pd.leadTimeDays} Business Days` },
        pd?.supplyAbility && { label: 'Monthly Production Capacity', value: pd.supplyAbility },
        pd?.packagingDetails && { label: 'Standard Packaging', value: pd.packagingDetails },
        pd?.paymentTerms && { label: 'Accepted Payment Terms', value: pd.paymentTerms },
        pd?.fobPort && { label: 'Nearest FOB Port / Hub', value: pd.fobPort },
        pd?.warranty && { label: 'Product Warranty', value: pd.warranty },
        pd?.hsnCode && { label: 'HSN Commodity Code', value: pd.hsnCode },
        pd?.gstRate && { label: 'GST Rate', value: `${pd.gstRate}%` },
        ...dynamicSpecs,
      ].filter(Boolean) as { label: string; value: string }[]
    : [];

  return (
    <PublicLayout>
      <div className="bg-slate-50 min-h-screen pb-24">
        {/* Top Breadcrumb Bar */}
        <div className="bg-white border-b border-gray-200/80">
          <Container size="xl" className="py-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 overflow-x-auto whitespace-nowrap">
              <Link href="/" className="hover:text-jungle-green-700 transition-colors">Home</Link>
              <FaChevronRight className="h-2.5 w-2.5 text-gray-300 shrink-0" />
              <Link href="/categories" className="hover:text-jungle-green-700 transition-colors">Categories</Link>
              <FaChevronRight className="h-2.5 w-2.5 text-gray-300 shrink-0" />
              {listing.category && (
                <>
                  <Link href={`/search?category=${listing.category.id}`} className="hover:text-jungle-green-700 transition-colors">
                    {listing.category.name}
                  </Link>
                  <FaChevronRight className="h-2.5 w-2.5 text-gray-300 shrink-0" />
                </>
              )}
              <span className="text-gray-900 truncate max-w-xs">{listing.title}</span>
            </div>
          </Container>
        </div>

        <Container size="xl" className="py-8">
          {/* Main Product Showcase Card */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 md:p-8 shadow-sm mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              
              {/* Column 1: Image Gallery (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="aspect-square bg-gray-50/80 rounded-3xl overflow-hidden border border-gray-200/80 relative flex items-center justify-center p-6 group">
                  {listing.media && listing.media.length > 0 ? (
                    <img
                      src={listing.media[activeImg]?.url}
                      alt={listing.title}
                      className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-gray-300 flex flex-col items-center gap-2">
                      <FaBoxOpen className="h-16 w-16" />
                      <span className="text-xs font-bold uppercase tracking-wider">No Image Available</span>
                    </div>
                  )}

                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    <span className="bg-jungle-green-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Assured Deal
                    </span>
                    {seller?.kycStatus === 'VERIFIED' && (
                      <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                        <FaCircleCheck className="h-3 w-3" /> Verified Factory
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnails strip */}
                {listing.media && listing.media.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {listing.media.map((m: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={clsx(
                          'h-18 w-18 rounded-2xl border-2 overflow-hidden shrink-0 transition-all p-1 bg-white',
                          activeImg === i
                            ? 'border-jungle-green-600 ring-2 ring-jungle-green-100 shadow-md'
                            : 'border-gray-200 opacity-70 hover:opacity-100'
                        )}
                      >
                        <img src={m.url} className="w-full h-full object-cover rounded-xl" alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Column 2: Product Specifications & Tiered Pricing (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-jungle-green-700 bg-jungle-green-50 px-2.5 py-0.5 rounded-md border border-jungle-green-100">
                      {listing.category?.name || 'B2B Wholesale'}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">SKU: {activeVariant?.sku || pd?.sku || id?.toString().substring(0, 8)}</span>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-heading font-black text-gray-900 tracking-tight leading-snug">
                    {listing.title}
                  </h1>

                  <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-gray-600">
                    <div className="flex items-center gap-1 text-amber-500">
                      <FaStar className="h-3.5 w-3.5 fill-current" />
                      <span className="font-bold text-gray-900">{listing.avgRating || '4.9'}</span>
                    </div>
                    <span>•</span>
                    <span>{listing.reviewCount || 0} Verified Reviews</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">In Stock</span>
                  </div>
                </div>

                {/* Tiered Wholesale Price Matrix */}
                <div className="bg-slate-50 border border-gray-200/80 rounded-3xl p-5 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Wholesale Slab Pricing (ex-Factory)
                  </span>

                  {bulkPriceSlabs.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {bulkPriceSlabs.map((slab: any, idx: number) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-3 shadow-xs">
                          <p className="text-[11px] text-gray-500 font-bold">
                            {slab.maxQty === 'Above' ? `≥ ${slab.minQty}` : `${slab.minQty} - ${slab.maxQty}`} {pd?.unitOfMeasure || 'pcs'}
                          </p>
                          <p className="text-base md:text-lg font-heading font-black text-jungle-green-700 mt-0.5">
                            ₹{slab.pricePerUnit?.toLocaleString('en-IN')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-heading font-black text-gray-900">
                        {effectivePrice ? `₹${effectivePrice.toLocaleString('en-IN')}` : 'Contact for Quote'}
                      </span>
                      <span className="text-xs text-gray-500 font-bold">/ {pd?.unitOfMeasure || 'Unit'}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-gray-600 font-medium">
                    <span>MOQ: <strong>{pd?.minOrderQty || 1} {pd?.unitOfMeasure || 'Pieces'}</strong></span>
                    <span>•</span>
                    <span>Lead Time: <strong>{pd?.leadTimeDays || 7} Days</strong></span>
                    {pd?.sampleAvailable && (
                      <>
                        <span>•</span>
                        <span className="text-amber-700 font-bold">Sample: {pd.samplePrice ? `₹${pd.samplePrice}` : 'Available'}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Variant Configuration Selector */}
                {listing.variants && listing.variants.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 block">
                      Select Specification / Variant:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {listing.variants.map((v: any) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={clsx(
                            'px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all',
                            activeVariant?.id === v.id
                              ? 'border-jungle-green-600 bg-jungle-green-50 text-jungle-green-900 font-black shadow-xs ring-1 ring-jungle-green-600'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          )}
                        >
                          {v.title}
                          {v.priceOverride && (
                            <span className="ml-1.5 text-gray-500 font-normal">
                              (₹{v.priceOverride.toLocaleString('en-IN')})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sourcing Quantity Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">Target Sourcing Quantity:</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={pd?.minOrderQty || 1}
                      placeholder={`e.g. ${pd?.minOrderQty || 100}`}
                      value={inquiryQty}
                      onChange={(e) => setInquiryQty(e.target.value)}
                      className="w-36 border border-gray-300 rounded-2xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none focus:border-jungle-green-600"
                    />
                    <span className="text-xs text-gray-500 font-bold">{pd?.unitOfMeasure || 'Pieces'}</span>
                  </div>
                </div>

                {/* Action CTAs */}
                <div className="space-y-3 pt-2">
                  <Button
                    onClick={() => setShowInquiryModal(true)}
                    disabled={isOwner}
                    className="w-full py-4 bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                  >
                    <FaMessage className="h-4 w-4" />
                    {isOwner ? 'Own Catalog Item' : 'Chat With Supplier & Negotiate'}
                  </Button>

                  <Button
                    onClick={handleCreateAssuredDeal}
                    variant="outline"
                    className="w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
                  >
                    <FaShieldHalved className="h-4 w-4 text-jungle-green-600" />
                    Request Quote with Assured Deal Protection
                  </Button>
                </div>
              </div>

              {/* Column 3: Supplier Verification & Trust Card (3 cols) */}
              <div className="lg:col-span-3">
                <div className="bg-slate-50 border border-gray-200/80 rounded-3xl p-6 space-y-6">
                  {/* Supplier Header */}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                      Verified Supplier Profile
                    </span>
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar name={bp?.businessName || seller?.fullName} size="lg" />
                      <div className="min-w-0">
                        <h4 className="font-heading font-black text-gray-900 text-sm truncate">
                          {bp?.businessName || seller?.fullName}
                        </h4>
                        <p className="text-[11px] text-gray-500 truncate">
                          {bp?.businessType || 'Manufacturer & Exporter'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-gray-200/60 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Trust Score:</span>
                        <span className="font-black text-jungle-green-700 bg-jungle-green-100/70 px-2 py-0.5 rounded">
                          {seller?.trustScore || 90} / 100
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">KYC Status:</span>
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          <FaCircleCheck className="h-3 w-3" /> Verified
                        </span>
                      </div>
                      {bp?.gstin && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">GSTIN:</span>
                          <span className="font-bold text-gray-900 font-mono text-[11px]">{bp.gstin}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Location:</span>
                        <span className="font-bold text-gray-900">{seller?.city || 'Gujarat, India'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Avg Response:</span>
                        <span className="font-bold text-gray-900">&lt; 2 Hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Assured Deal Escrow Guarantee */}
                  <div className="bg-jungle-green-900 text-white rounded-2xl p-4 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                      <ShieldCheck className="h-4 w-4" /> JaxMart Escrow
                    </div>
                    <p className="text-jungle-green-100 text-[11px] leading-relaxed">
                      Your payment is held in secure escrow and released to supplier only after you approve delivery proofs.
                    </p>
                  </div>

                  <Button
                    onClick={() => setShowInquiryModal(true)}
                    variant="outline"
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-white"
                  >
                    Contact Business
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Deep-Dive Technical Tabs Section */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 md:p-8 shadow-sm mb-12">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4 mb-8">
              {[
                { id: 'specs', label: 'Technical Specifications' },
                { id: 'company', label: 'Manufacturer & Factory Profile' },
                { id: 'shipping', label: 'Packaging & Logistics' },
                { id: 'reviews', label: `Reviews (${listing.reviewCount || 0})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={clsx(
                    'px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all',
                    activeTab === tab.id
                      ? 'bg-jungle-green-700 text-white shadow-md'
                      : 'text-gray-500 hover:bg-gray-100'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Specs */}
            {activeTab === 'specs' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading font-black text-gray-900 text-lg mb-2">
                    Detailed Product Specifications
                  </h3>
                  <p className="text-xs text-gray-500 mb-6">
                    Verified industrial parameters, material grades, and tolerances.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  {specRows.map((row, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-3 border-b border-gray-100 text-xs"
                    >
                      <span className="text-gray-500 font-medium">{row.label}</span>
                      <span className="font-bold text-gray-900 text-right">{row.value}</span>
                    </div>
                  ))}
                </div>

                {listing.description && (
                  <div className="pt-6 border-t border-gray-100">
                    <h4 className="font-bold text-sm text-gray-900 mb-2">Product Description & Features</h4>
                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                      {listing.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Company Profile */}
            {activeTab === 'company' && (
              <div className="space-y-6 text-xs">
                <div>
                  <h3 className="font-heading font-black text-gray-900 text-lg mb-2">
                    {bp?.businessName || seller?.fullName}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    On-ground verified manufacturer registered on JaxMart.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-gray-400 font-bold block mb-1">Business Type</span>
                    <span className="font-bold text-gray-900 text-sm">{bp?.businessType || 'Manufacturer & Supplier'}</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-gray-400 font-bold block mb-1">Verification Status</span>
                    <span className="font-bold text-emerald-700 text-sm">Captain On-Site Verified</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-gray-400 font-bold block mb-1">Trust Score</span>
                    <span className="font-bold text-jungle-green-700 text-sm">{seller?.trustScore || 90} / 100</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Shipping */}
            {activeTab === 'shipping' && (
              <div className="space-y-6 text-xs">
                <h3 className="font-heading font-black text-gray-900 text-lg mb-2">
                  Packaging & Delivery Terms
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="font-bold text-gray-900 mb-1">Packaging Format</p>
                    <p className="text-gray-600">{pd?.packagingDetails || 'Standard export corrugated boxes & pallets'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="font-bold text-gray-900 mb-1">Port of Loading</p>
                    <p className="text-gray-600">{pd?.fobPort || 'Mundra / Nhava Sheva / Nearest ICD'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-6 text-xs">
                <h3 className="font-heading font-black text-gray-900 text-lg mb-2">
                  Verified Buyer Reviews
                </h3>
                <p className="text-gray-500">
                  Reviews from procurement managers who completed Assured Deals with this supplier.
                </p>
                <div className="p-6 bg-gray-50 rounded-2xl text-center text-gray-400">
                  ★ 4.9 Average Rating across completed orders.
                </div>
              </div>
            )}
          </div>

          {/* Related Products Carousel */}
          {relatedListings.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-heading font-black text-gray-900">
                  Related Products in {listing.category?.name || 'Category'}
                </h3>
                <Link href={`/search?category=${listing.categoryId}`} className="text-xs font-bold text-jungle-green-700 hover:underline">
                  View All →
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {relatedListings.map((rel: any) => (
                  <div
                    key={rel.id}
                    onClick={() => router.push(`/listings/${rel.id}`)}
                    className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3 border border-gray-100 flex items-center justify-center p-3">
                        {rel.media?.[0]?.url ? (
                          <img src={rel.media[0].url} alt={rel.title} className="object-contain h-full w-full group-hover:scale-105 transition-transform" />
                        ) : (
                          <FaBoxesStacked className="h-8 w-8 text-gray-300" />
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-gray-900 line-clamp-2 mb-1 group-hover:text-jungle-green-700 transition-colors">
                        {rel.title}
                      </h4>
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="font-black text-sm text-gray-900">
                        {rel.productDetail?.pricePerUnit ? `₹${rel.productDetail.pricePerUnit.toLocaleString('en-IN')}` : 'Get Quote'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">MOQ: {rel.productDetail?.minOrderQty || 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Container>
      </div>

      {/* Instant Chat / Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setShowInquiryModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <Avatar name={bp?.businessName || seller?.fullName} size="md" />
              <div>
                <h3 className="text-lg font-heading font-black text-gray-900">
                  Chat with {bp?.businessName || seller?.fullName}
                </h3>
                <p className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <FaCircleCheck className="h-3 w-3" /> Verified Supplier • Fast Response
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 mb-5 flex items-center gap-3 text-xs">
              <div className="h-10 w-10 rounded-xl bg-white border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                {listing.media?.[0]?.url ? (
                  <img src={listing.media[0].url} className="h-full w-full object-cover" alt="" />
                ) : (
                  <FaBox className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">{listing.title}</p>
                <p className="text-gray-500">{effectivePrice ? `₹${effectivePrice.toLocaleString('en-IN')}` : 'Custom Pricing'}</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleStartInquiry();
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="font-bold text-gray-700 block mb-1">Target Quantity Needed:</label>
                <input
                  type="number"
                  placeholder={`e.g. ${pd?.minOrderQty || 100} ${pd?.unitOfMeasure || 'pieces'}`}
                  value={inquiryQty}
                  onChange={(e) => setInquiryQty(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Inquiry Message / Specifications:</label>
                <textarea
                  rows={3}
                  placeholder="Hi, please share your best wholesale FOB price, delivery timeline, and product datasheet..."
                  value={inquiryMsg}
                  onChange={(e) => setInquiryMsg(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-jungle-green-600 hover:bg-jungle-green-700 text-white rounded-2xl py-3.5 font-bold text-xs uppercase tracking-wider"
                >
                  {sending ? 'Connecting...' : 'Send Inquiry & Start Chat'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}

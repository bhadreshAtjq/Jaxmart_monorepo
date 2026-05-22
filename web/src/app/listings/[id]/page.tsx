'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaShieldHalved, FaStar, FaCircleCheck, FaBolt, FaArrowRight, FaTruck, FaGlobe, FaBoxOpen, FaCubes, FaHeart, FaShareNodes, FaComment, FaCheck, FaPhone, FaBuilding, FaIndustry } from 'react-icons/fa6';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useListing } from '@/lib/hooks';
import { rfqApi, messageApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button, Card, Badge, Avatar, TrustScore, Container, Skeleton } from '@/components/ui';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

function getSpecifications(listing: any) {
  const dbSpecs = listing.productDetail?.specifications;
  if (dbSpecs && typeof dbSpecs === 'object' && Object.keys(dbSpecs).length > 0) {
    return Object.entries(dbSpecs).map(([key, val]) => ({ name: key, value: String(val) }));
  }
  const cat = listing.category?.name?.toLowerCase() || '';
  if (cat.includes('electronics')) return [
    { name: 'Material', value: 'Aluminum alloy + ABS' }, { name: 'Features', value: 'Extendable, portable, durable' },
    { name: 'Logo', value: 'Customized Logo Accepted' }, { name: 'Certification', value: 'CE, RoHS, FCC' }
  ];
  if (cat.includes('textil')) return [
    { name: 'Material', value: '100% Organic Cotton / Polyester blend' }, { name: 'Weight', value: '180-240 GSM' },
    { name: 'Customization', value: 'Custom dyeing, printing & labeling' }, { name: 'Packaging', value: 'Standard roll packing' }
  ];
  if (cat.includes('industrial')) return [
    { name: 'Material Grade', value: 'SS304 / SS316 / Carbon Steel' }, { name: 'Standard', value: 'ASTM / DIN / ANSI' },
    { name: 'Surface Treatment', value: 'Polished / Galvanized' }, { name: 'Applications', value: 'Oil & Gas, Chemical, Water treatment' }
  ];
  return [
    { name: 'Material', value: 'High grade industrial components' }, { name: 'Certification', value: 'ISO 9001, CE' },
    { name: 'Customization', value: 'OEM/ODM available' }, { name: 'QC', value: '100% factory inspection' }
  ];
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);
  const [inquiryQty, setInquiryQty] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [sending, setSending] = useState(false);
  const { data: listing, isLoading, error } = useListing(id as string);
  const { user, isLoggedIn } = useAuthStore();
  const isOwner = user?.id === listing?.sellerId;

  if (isLoading) return <PublicLayout><Container size="xl" className="py-20"><div className="grid grid-cols-1 lg:grid-cols-5 gap-8"><div className="lg:col-span-2"><Skeleton className="aspect-square rounded-xl" /></div><div className="lg:col-span-3 space-y-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-6 w-1/2" /><Skeleton className="h-40" /></div></div></Container></PublicLayout>;
  if (error || !listing) return <PublicLayout><Container className="py-40 text-center"><h1 className="text-2xl font-bold text-gray-800">Product Not Found</h1><p className="text-gray-500 mt-2">This listing may have been removed.</p><Button className="mt-6" onClick={() => router.push('/search')}>Browse Products</Button></Container></PublicLayout>;

  const pd = listing.productDetail;
  const price = pd?.pricePerUnit;
  const specs = getSpecifications(listing);
  const seller = listing.seller;
  const bp = seller?.businessProfile;

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error('Please log in to send inquiries to suppliers.');
      router.push('/auth/login');
      return;
    }
    if (listing.sellerId === user?.id) {
      toast.error('You cannot start a conversation with yourself.');
      return;
    }
    setSending(true);
    try {
      const msg = inquiryMsg.trim() || `Hi, I am interested in sourcing your product: "${listing.title}". Please send catalog and FOB price.`;
      const { data: conv } = await messageApi.startConversation(listing.sellerId, msg);
      toast.success('Inquiry initiated!');
      router.push(`/inbox?id=${conv.id}`);
    } catch {
      toast.error('Failed to send inquiry.');
    } finally {
      setSending(false);
    }
  };

  // Product info rows for the main specs table
  const productInfoRows = [
    { label: 'Brand Name', value: pd?.brand || 'OEM/ODM' },
    { label: 'Model Number', value: pd?.sku || `JM-${(id as string)?.slice(0, 6)?.toUpperCase()}` },
    { label: 'Place of Origin', value: pd?.countryOfOrigin || 'India' },
    { label: 'Min. Order Quantity', value: `${pd?.minOrderQty || 10} ${pd?.unitOfMeasure || 'UNIT'}` },
    { label: 'Supply Ability', value: pd?.supplyAbility || `50,000 ${pd?.unitOfMeasure || 'UNIT'} per Month` },
    { label: 'Delivery Time', value: pd?.deliveryTime || `${pd?.leadTimeDays || 15} days after payment confirmed` },
    { label: 'Packaging Details', value: pd?.packagingDetails || 'Standard export carton / Custom packaging available' },
    { label: 'Payment Terms', value: pd?.paymentTerms || 'T/T, L/C, Escrow via JaxMart' },
    { label: 'FOB Port', value: pd?.fobPort || 'Mundra / Nhava Sheva, India' },
    { label: 'Small Orders', value: pd?.smallOrders || 'Accepted' },
  ];

  return (
    <PublicLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <Container size="xl" className="py-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="hover:text-jax-blue cursor-pointer" onClick={() => router.push('/')}>Home</span>
              <span>›</span>
              <span className="hover:text-jax-blue cursor-pointer" onClick={() => router.push(`/search?category=${listing.category?.id}`)}>{listing.category?.name}</span>
              <span>›</span>
              <span className="text-gray-800 font-medium truncate max-w-[300px]">{listing.title}</span>
            </div>
          </Container>
        </div>

        <Container size="xl" className="py-6">
          {/* === TOP SECTION: Images + Key Trade Info === */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Product Images */}
              <div className="lg:col-span-5">
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100 mb-3">
                  <img src={listing.media?.[activeImg]?.url || listing.media?.[0]?.url} alt={listing.title} className="w-full h-full object-contain" />
                </div>
                {listing.media?.length > 1 && (
                  <div className="flex gap-2">
                    {listing.media.map((m: any, i: number) => (
                      <button key={i} onClick={() => setActiveImg(i)} className={clsx('h-16 w-16 rounded border overflow-hidden', activeImg === i ? 'border-jax-blue border-2' : 'border-gray-200 opacity-70 hover:opacity-100')}>
                        <img src={m.url} className="w-full h-full object-cover" alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Key Product Info */}
              <div className="lg:col-span-4">
                <h1 className="text-xl font-bold text-gray-900 leading-snug mb-3">{listing.title}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <FaStar className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-sm font-semibold text-gray-700">{listing.avgRating || '4.8'}</span>
                    <span className="text-xs text-gray-400">({listing.reviewCount || 0} reviews)</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-red-500"><FaHeart className="h-4 w-4" /></button>
                    <button className="text-gray-400 hover:text-jax-blue"><FaShareNodes className="h-4 w-4" /></button>
                  </div>
                </div>

                {/* Price Block */}
                <div className="bg-jungle-green-50 border border-jungle-green-100 rounded-lg p-4 mb-5">
                  {typeof price === 'number' ? (
                    <div>
                      <span className="text-xs text-gray-500">FOB Price:</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-jungle-green-600">₹{price.toLocaleString('en-IN')}</span>
                        <span className="text-sm text-gray-500">/ {pd?.unitOfMeasure || 'Piece'}</span>
                      </div>
                      <span className="text-xs text-gray-400">Get Latest Price</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs text-gray-500">Price:</span>
                      <p className="text-lg font-bold text-jungle-green-600">Negotiable / Contact Supplier</p>
                    </div>
                  )}
                </div>

                {/* Key Details Table */}
                <table className="w-full text-sm mb-5">
                  <tbody>
                    {[
                      { l: 'Min. Order', v: `${pd?.minOrderQty || 100} ${pd?.unitOfMeasure || 'Pieces'}` },
                      { l: 'Lead Time', v: `${pd?.leadTimeDays || 15} Days` },
                      { l: 'Port', v: 'Mundra / Nhava Sheva' },
                      { l: 'Origin', v: pd?.countryOfOrigin || 'India' },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-2 pr-4 text-gray-500 font-medium w-28">{row.l}:</td>
                        <td className="py-2 text-gray-800 font-semibold">{row.v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button fullWidth disabled={isOwner} className="h-11 bg-jungle-green-500 hover:bg-jungle-green-600 border-none text-white font-bold text-sm rounded-lg" onClick={() => document.getElementById('inquiry-section')?.scrollIntoView({ behavior: 'smooth' })}>
                    {isOwner ? 'Your Own Listing' : 'Contact Supplier'}
                  </Button>
                  <Button fullWidth variant="outline" className="h-11 border-jungle-green-500 text-jungle-green-500 hover:bg-jungle-green-50 font-bold text-sm rounded-lg" onClick={() => document.getElementById('inquiry-section')?.scrollIntoView({ behavior: 'smooth' })}>
                    Start Order
                  </Button>
                </div>
              </div>

              {/* Supplier Card (right sidebar) */}
              <div className="lg:col-span-3">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-jax-dark text-white p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar name={bp?.businessName || seller?.fullName} size="md" className="border-2 border-white/20" />
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm truncate">{bp?.businessName || seller?.fullName}</h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <FaCircleCheck className="h-3 w-3 text-emerald-400" />
                          <span className="text-[10px] text-emerald-300 font-medium">Verified Supplier</span>
                        </div>
                      </div>
                    </div>
                    <TrustScore score={seller?.trustScore || 88} />
                  </div>

                  <div className="p-4 space-y-3 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">Business Type:</span><span className="font-semibold text-gray-800">Manufacturer / Trader</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Established:</span><span className="font-semibold text-gray-800">{bp?.establishedYear || '2015'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Employees:</span><span className="font-semibold text-gray-800">{bp?.employeeRange || '11-50'}</span></div>
                    {bp?.gstin && <div className="flex justify-between"><span className="text-gray-500">GSTIN:</span><span className="font-semibold text-gray-800 text-[11px]">{bp.gstin}</span></div>}
                  </div>

                  <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
                      <FaShieldHalved className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-[11px] font-bold text-emerald-800">JaxMart Trade Assurance</p>
                        <p className="text-[10px] text-emerald-600">Payment protection & quality guarantee</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* === PRODUCT DETAILS SECTION === */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-9 space-y-6">
              {/* Product Information Table */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-bold text-gray-900">Product Information</h2>
                </div>
                <div className="overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {productInfoRows.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className="px-6 py-3 text-gray-500 font-medium w-1/3 border-r border-gray-100">{row.label}</td>
                          <td className="px-6 py-3 text-gray-800 font-semibold">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Key Specifications */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-bold text-gray-900">Key Specifications / Special Features</h2>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {specs.map((spec, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <FaCheck className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <div><strong className="text-gray-800">{spec.name}:</strong> <span className="text-gray-600">{spec.value}</span></div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Product Description */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-bold text-gray-900">Product Description</h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
                </div>
              </div>

              {/* Shipping & Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-base font-bold text-gray-900">Shipping Information</h2>
                  </div>
                  <div className="p-6 space-y-3 text-sm">
                    {[{ l: 'FOB Port', v: 'Mundra / Nhava Sheva' }, { l: 'Lead Time', v: `${pd?.leadTimeDays || 15} days` }, { l: 'Express', v: 'Air freight available' }, { l: 'Packaging', v: 'Export carton + custom branding' }].map((r, i) => (
                      <div key={i} className="flex justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                        <span className="text-gray-500">{r.l}:</span><span className="font-semibold text-gray-800 text-right">{r.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-base font-bold text-gray-900">Main Export Markets</h2>
                  </div>
                  <div className="p-6 space-y-2 text-sm">
                    {[{ area: 'South & East Asia', pct: '65%' }, { area: 'Middle East & Africa', pct: '15%' }, { area: 'Western Europe', pct: '10%' }, { area: 'North America', pct: '7%' }, { area: 'Others', pct: '3%' }].map((m, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-gray-600">{m.area}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-jax-blue rounded-full" style={{ width: m.pct }} /></div>
                          <span className="text-xs font-semibold text-gray-700 w-8 text-right">{m.pct}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Inquiry Form */}
              <div id="inquiry-section" className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-bold text-gray-900">Send Inquiry to This Supplier</h2>
                </div>
                <div className="p-6">
                  <form onSubmit={handleInquiry} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Quantity *</label>
                        <input type="number" min="1" required value={inquiryQty} onChange={e => setInquiryQty(e.target.value)} placeholder={`Min ${pd?.minOrderQty || 100}`} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-jax-blue outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Unit</label>
                        <input type="text" disabled value={pd?.unitOfMeasure || 'Pieces'} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Your Message *</label>
                      <textarea rows={4} required value={inquiryMsg} onChange={e => setInquiryMsg(e.target.value)} placeholder={`I'm interested in "${listing.title}". Please send me price details and shipping options.`} className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-jax-blue outline-none leading-relaxed" />
                    </div>
                    <Button type="submit" loading={sending} className="h-11 px-10 bg-jungle-green-500 hover:bg-jungle-green-600 border-none text-white font-bold text-sm rounded-lg">Send Inquiry Now</Button>
                  </form>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-3 space-y-6">
              {/* Company Profile Summary */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-bold text-gray-900">Company Profile</h3>
                </div>
                <div className="p-4 space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <FaBuilding className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div><p className="font-semibold text-gray-800">{bp?.businessName || seller?.fullName}</p><p className="text-gray-500 mt-0.5">Verified Supplier since {bp?.establishedYear || '2015'}</p></div>
                  </div>
                  <p className="text-gray-500 leading-relaxed">{bp?.description?.slice(0, 150) || 'Professional supplier specializing in quality products for B2B buyers. ISO certified with strict quality control.'}{bp?.description && bp.description.length > 150 ? '...' : ''}</p>
                  {bp?.website && <a href={bp.website} target="_blank" rel="noreferrer" className="text-jax-blue font-medium hover:underline flex items-center gap-1"><FaGlobe className="h-3 w-3" /> Visit Website</a>}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-bold text-gray-900">Accepted Payment</h3>
                </div>
                <div className="p-4 space-y-2 text-xs">
                  {['JaxMart Escrow (Recommended)', 'Telegraphic Transfer (T/T)', 'Letter of Credit (L/C)', 'Net Banking / UPI'].map((p, i) => (
                    <div key={i} className="flex items-center gap-2"><FaCheck className="h-3 w-3 text-emerald-500" /><span className="text-gray-700 font-medium">{p}</span></div>
                  ))}
                </div>
              </div>

              {/* Trade Assurance */}
              <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaShieldHalved className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-emerald-800">Trade Assurance</h3>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">Your payment is protected by JaxMart. Funds are released to supplier only after you confirm delivery.</p>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </PublicLayout>
  );
}

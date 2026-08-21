'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { userApi } from '@/lib/api';
import { useProfile as useProfileHook } from '@/lib/hooks';
import { Button, Card, Badge, PageLoader, Input, Avatar, SectionHeader } from '@/components/ui';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser,
  FaShieldHalved,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaPenToSquare,
  FaCircleCheck,
  FaTriangleExclamation,
  FaClock,
  FaUpload,
  FaLocationDot,
  FaGlobe,
  FaLinkedin,
  FaFileInvoiceDollar,
  FaCoins,
  FaCrown,
  FaPlus,
  FaTrash,
  FaCertificate,
  FaTruckFast,
  FaUsers,
  FaCalendarDays,
  FaIndustry,
  FaReceipt,
  FaXmark,
  FaCheck,
  FaEye,
  FaArrowUpRightFromSquare,
} from 'react-icons/fa6';
import {
  ShieldCheck,
  Award,
  TrendingUp,
  FileCheck,
  Building2,
  MapPin,
  Sparkles,
  CreditCard,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function ProfilePage() {
  const { data: user, isLoading, mutate: refetch } = useProfileHook();
  const [activeTab, setActiveTab] = useState<'overview' | 'business' | 'facilities' | 'compliance' | 'membership'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: 'Corporate Office',
    addressType: 'PRIMARY',
    contactName: '',
    contactPhone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isPrimary: true,
  });
  const [addressLoading, setAddressLoading] = useState(false);

  // KYC modal state
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycForm, setKycForm] = useState({
    documentType: 'GST_CERTIFICATE',
    documentNumber: '',
    documentUrl: '',
  });
  const [kycLoading, setKycLoading] = useState(false);

  if (isLoading || !user) {
    return (
      <AppLayout>
        <PageLoader />
      </AppLayout>
    );
  }

  const business = user.businessProfile || {};
  const addresses = user.addresses || [];
  const kycDocs = user.kycDocuments || [];
  const subscription = user.subscription;
  const counts = user._count || {};

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      toast.error('Please fill all required address fields.');
      return;
    }
    setAddressLoading(true);
    try {
      await userApi.addAddress(addressForm);
      toast.success('Facility address added successfully.');
      setShowAddressModal(false);
      setAddressForm({
        label: 'Warehouse / Depot',
        addressType: 'WAREHOUSE',
        contactName: '',
        contactPhone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        isPrimary: false,
      });
      refetch();
    } catch {
      toast.error('Failed to add address.');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to remove this registered facility?')) return;
    try {
      await userApi.deleteAddress(addressId);
      toast.success('Facility removed.');
      refetch();
    } catch {
      toast.error('Failed to remove facility.');
    }
  };

  const handleUploadKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycForm.documentUrl) {
      toast.error('Please provide a valid document URL or upload link.');
      return;
    }
    setKycLoading(true);
    try {
      await userApi.uploadKyc(kycForm);
      toast.success('Document submitted to Admin Compliance Board for review.');
      setShowKycModal(false);
      setKycForm({
        documentType: 'GST_CERTIFICATE',
        documentNumber: '',
        documentUrl: '',
      });
      refetch();
    } catch {
      toast.error('Failed to upload document.');
    } finally {
      setKycLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto pb-24 space-y-8">
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Identity & Corporate Governance Center
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {business.businessName || user.fullName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/invoices"
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2"
            >
              <FaReceipt className="h-3.5 w-3.5 text-indigo-600" />
              <span>Invoices & Ledger</span>
            </Link>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? 'ghost' : 'primary'}
              size="sm"
              className="rounded-xl px-5 h-10 text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
            >
              <FaPenToSquare className="h-3.5 w-3.5" />
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
          </div>
        </div>

        {/* Executive Banner Card */}
        <div className="relative rounded-3xl bg-slate-900 text-white overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-slate-950 pointer-events-none" />
          <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 z-10">
            {/* Left: Avatar & Identity Details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                <Avatar
                  name={user.fullName}
                  src={user.avatarUrl}
                  size="xl"
                  className="ring-4 ring-white/10 shadow-2xl h-20 w-20 text-xl font-black bg-indigo-600 text-white"
                />
                {user.kycStatus === 'VERIFIED' && (
                  <div
                    className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center text-white ring-2 ring-slate-900 shadow-md"
                    title="Verified Global Merchant"
                  >
                    <FaCheck className="h-3 w-3" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {user.fullName}
                  </h2>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10 uppercase tracking-wider">
                    {user.userType}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                    {user.accountType}
                  </span>
                </div>

                <p className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <FaEnvelope className="h-3 w-3 text-slate-500" /> {user.email || 'No email registered'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaPhone className="h-3 w-3 text-slate-500" /> {user.phone}
                  </span>
                  {business.gstin && (
                    <span className="flex items-center gap-1.5 font-mono text-emerald-400">
                      <FaBuilding className="h-3 w-3" /> GSTIN: {business.gstin}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Right: Trust Score & Subscription Tier */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md self-stretch sm:self-auto justify-around">
              <div className="text-center px-3 border-r border-white/10">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Trust Score</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-xl font-black text-white">{user.trustScore || 85}</span>
                  <span className="text-[10px] text-slate-400 font-bold">/100</span>
                </div>
              </div>

              <div className="text-center px-3">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Membership</span>
                <div className="flex items-center justify-center gap-1 mt-1 text-amber-400 font-black text-sm uppercase">
                  <FaCrown className="h-3.5 w-3.5" />
                  <span>{subscription?.plan?.name || 'Gold Tier'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="relative border-t border-white/10 bg-black/20 px-6 sm:px-8 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-medium uppercase">Catalog SKUs:</span>{' '}
              <strong className="text-white">{counts.listings || 0} Listed</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium uppercase">Total Orders:</span>{' '}
              <strong className="text-white">{(counts.buyerOrders || 0) + (counts.sellerOrders || 0)} Deals</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium uppercase">RFQs & Quotes:</span>{' '}
              <strong className="text-white">{(counts.rfqRequests || 0) + (counts.rfqQuotes || 0)} Active</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium uppercase">Member Since:</span>{' '}
              <strong className="text-white">{new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</strong>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-200/70 p-1.5 rounded-2xl w-full sm:w-fit overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Identity', icon: FaUser },
            { id: 'business', label: 'Business & Compliance', icon: FaBuilding },
            { id: 'facilities', label: `Facilities & Warehouses (${addresses.length})`, icon: FaLocationDot },
            { id: 'compliance', label: `KYC Vault (${kycDocs.length})`, icon: FaShieldHalved },
            { id: 'membership', label: 'Subscription & Credits', icon: FaCrown },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={clsx(
                  'px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap',
                  isActive ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Icon className={clsx('h-3.5 w-3.5', isActive ? 'text-indigo-600' : 'text-slate-400')} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview & Identity */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {isEditing ? (
              <ProfileEditForm user={user} onComplete={() => { setIsEditing(false); refetch(); }} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Core Account Details Card */}
                <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-black text-slate-900">Core Identity Registry</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Primary credentials registered with JaxMart Global B2B Network</p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ● Active Account
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Full Legal Name</span>
                      <p className="text-sm font-bold text-slate-900">{user.fullName}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Verified Email Address</span>
                      <p className="text-sm font-bold text-slate-900">{user.email || 'Registry Pending'}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Registered Phone Number</span>
                      <p className="text-sm font-mono font-bold text-slate-900">{user.phone}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Account Classification</span>
                      <p className="text-sm font-bold text-slate-900">{user.userType} ({user.accountType})</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Operating Currency & Language</span>
                      <p className="text-sm font-bold text-slate-900">{user.currency || 'INR (₹)'} • {user.language?.toUpperCase() || 'EN'}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Standard Timezone</span>
                      <p className="text-sm font-bold text-slate-900">{user.timezone || 'Asia/Kolkata (IST)'}</p>
                    </div>
                  </div>

                  {business.description && (
                    <div className="pt-4 border-t border-slate-100">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">Company Overview & Capability Statement</span>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {business.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Side Stats & Security */}
                <div className="space-y-6">
                  {/* Security & Verification Card */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <FaShieldHalved className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Security & KYC Status</span>
                    </h3>

                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <FaCircleCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-emerald-900 uppercase tracking-tight">{user.kycStatus} Partner</p>
                        <p className="text-[10px] text-emerald-700 mt-0.5">High-limit wholesale trade unlocked</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 text-xs">
                      <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600">
                        <span>GSTIN Verification:</span>
                        <strong className="text-emerald-700">{business.gstin ? 'Verified' : 'Pending'}</strong>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600">
                        <span>Corporate PAN:</span>
                        <strong className="text-emerald-700">{business.pan || 'Provided'}</strong>
                      </div>
                      <div className="flex justify-between py-2 text-slate-600">
                        <span>Escrow Protected:</span>
                        <strong className="text-indigo-600">Active</strong>
                      </div>
                    </div>
                  </div>

                  {/* Primary Address Quick View */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <FaLocationDot className="h-3.5 w-3.5 text-amber-600" />
                        <span>Registered Headquarters</span>
                      </h3>
                      <button
                        onClick={() => setActiveTab('facilities')}
                        className="text-[10px] font-bold text-indigo-600 hover:underline"
                      >
                        Manage All
                      </button>
                    </div>

                    {addresses.length > 0 ? (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                        <p className="font-bold text-slate-900">{addresses[0].label || 'Main Facility'}</p>
                        <p>{addresses[0].line1}</p>
                        {addresses[0].line2 && <p>{addresses[0].line2}</p>}
                        <p className="text-slate-500 font-medium">
                          {addresses[0].city}, {addresses[0].state} - {addresses[0].pincode}
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-400">
                        No facilities registered yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Business & Compliance */}
        {activeTab === 'business' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">Corporate & Trade Registration Intelligence</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Government registration credentials, tax identifiers, and manufacturing capacity</p>
                </div>
                <Button
                  onClick={() => setIsEditing(true)}
                  size="sm"
                  className="rounded-xl text-xs font-bold bg-slate-900 text-white"
                >
                  <FaPenToSquare className="h-3.5 w-3.5 mr-1.5" /> Edit Business Data
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Legal Entity Name</span>
                  <p className="text-sm font-bold text-slate-900">{business.businessName || 'Not Set'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Business Classification</span>
                  <p className="text-sm font-bold text-slate-900">{business.businessType || 'Manufacturer & Wholesaler'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Goods & Services Tax (GSTIN)</span>
                  <p className="text-sm font-mono font-bold text-emerald-800">{business.gstin || '24AAACJ9988H1Z1'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Permanent Account Number (PAN)</span>
                  <p className="text-sm font-mono font-bold text-slate-900">{business.pan || 'AAACJ9988H'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">MSME Udyam Number</span>
                  <p className="text-sm font-mono font-bold text-slate-900">{business.udyamNumber || 'UDYAM-GJ-01-0012345'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Import Export Code (IEC)</span>
                  <p className="text-sm font-mono font-bold text-slate-900">{business.iecCode || 'IEC-0309124567'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Year of Establishment</span>
                  <p className="text-sm font-bold text-slate-900">{business.establishedYear || '2016'} (8+ Years Operating)</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Workforce / Team Size</span>
                  <p className="text-sm font-bold text-slate-900">{business.employeeRange || '50 - 250 Employees'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Annual Trade Turnover</span>
                  <p className="text-sm font-bold text-slate-900">{business.annualTurnover || '₹10 Cr - ₹50 Cr'}</p>
                </div>
              </div>

              {/* Digital & Web Presence */}
              <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <FaGlobe className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Official Corporate Portal</span>
                      <a
                        href={business.website ? (business.website.startsWith('http') ? business.website : `https://${business.website}`) : '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        {business.website || 'https://www.globalexports.com'}
                      </a>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FaLinkedin className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">LinkedIn Verified Page</span>
                      <a
                        href={business.linkedinUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        {business.linkedinUrl || 'linkedin.com/company/global-exports'}
                      </a>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Facilities & Warehouses */}
        {activeTab === 'facilities' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">Registered Facilities & Logistics Hubs</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Locations used for cargo pickup, inspection, delivery milestones, and tax billing</p>
                </div>
                <Button
                  onClick={() => setShowAddressModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  <FaPlus className="h-3 w-3 mr-1.5" /> Add Facility
                </Button>
              </div>

              {!addresses.length ? (
                <div className="p-16 text-center text-slate-400 text-xs font-medium">
                  <FaLocationDot className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  No facility addresses registered yet. Add your factory or warehouse for logistics routing.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr: any) => (
                    <div
                      key={addr.id}
                      className={clsx(
                        'p-5 rounded-2xl border transition-all relative flex flex-col justify-between',
                        addr.isPrimary ? 'bg-indigo-50/40 border-indigo-200 shadow-xs' : 'bg-slate-50 border-slate-200/80'
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                            <FaLocationDot className={addr.isPrimary ? 'text-indigo-600' : 'text-slate-400'} />
                            {addr.label || 'Facility Address'}
                          </span>
                          {addr.isPrimary && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                              Primary Billing
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-700 space-y-0.5 mt-2">
                          <p className="font-semibold text-slate-900">{addr.line1}</p>
                          {addr.line2 && <p>{addr.line2}</p>}
                          <p>{addr.city}, {addr.state} - <span className="font-mono font-bold">{addr.pincode}</span></p>
                          <p className="text-slate-500">{addr.country}</p>
                          {addr.contactPhone && (
                            <p className="text-[11px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-200/60">
                              Contact: {addr.contactName || 'Site Officer'} ({addr.contactPhone})
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-200/60">
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-[11px] font-bold text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <FaTrash className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: KYC & Compliance Vault */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">Compliance & Regulatory Document Vault</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Government-approved corporate credentials and authenticated trade licenses</p>
                </div>
                <Button
                  onClick={() => setShowKycModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  <FaUpload className="h-3 w-3 mr-1.5" /> Submit Document
                </Button>
              </div>

              {!kycDocs.length ? (
                <div className="p-16 text-center text-slate-400 text-xs font-medium">
                  <FaShieldHalved className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  No compliance documents submitted yet. Attach your GST Certificate, MSME Udyam, or Corporate PAN.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kycDocs.map((doc: any) => (
                    <div key={doc.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="h-11 w-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
                          <FileCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{doc.documentType.replace('_', ' ')}</p>
                          {doc.documentNumber && <p className="text-[11px] font-mono text-slate-500 mt-0.5">Ref: {doc.documentNumber}</p>}
                          <p className="text-[10px] text-slate-400 mt-1">Submitted on {new Date(doc.createdAt).toLocaleDateString('en-IN')}</p>
                          <a
                            href={doc.documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-bold text-indigo-600 hover:underline inline-flex items-center gap-1 mt-2"
                          >
                            <FaEye className="h-3 w-3" /> View Uploaded File
                          </a>
                        </div>
                      </div>

                      <span className={clsx(
                        'text-[10px] font-bold uppercase px-2.5 py-1 rounded-full',
                        doc.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : doc.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'
                      )}>
                        ● {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Subscription & Financials */}
        {activeTab === 'membership' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Plan Membership Card */}
              <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Current SaaS Plan & Entitlements</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Tier benefits, lead quotas, and priority directory ranking</p>
                  </div>
                  <Link
                    href="/pricing"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    Upgrade Plan
                  </Link>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">Active Plan Tier</span>
                    <h4 className="text-2xl font-black text-white mt-1">
                      {subscription?.plan?.name || 'Gold Growth Plan'}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Billing Cycle: <strong className="text-white">{subscription?.billingCycle || 'MONTHLY'}</strong> • Renews on{' '}
                      {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN') : '20 Sep 2026'}
                    </p>
                  </div>

                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm text-center">
                    <span className="text-[9px] font-bold text-slate-300 uppercase block">Monthly Quota</span>
                    <p className="text-xl font-black text-white mt-0.5">
                      {subscription?.plan?.leadQuotaPerCycle || '25'} Leads / Mo
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Verified Supplier Seal</span>
                    <p className="text-xs font-bold text-emerald-800 mt-1">✓ Included Active</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Search Ranking Boost</span>
                    <p className="text-xs font-bold text-indigo-900 mt-1">3x Enhanced Visibility</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Dedicated Account Officer</span>
                    <p className="text-xs font-bold text-slate-900 mt-1">Assigned</p>
                  </div>
                </div>
              </div>

              {/* Lead Credit Wallet */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <FaCoins className="h-3.5 w-3.5 text-amber-500" />
                      <span>Lead Credit Wallet</span>
                    </h3>
                  </div>

                  <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200/80 text-center my-4">
                    <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">Available Balance</span>
                    <p className="text-3xl font-black text-amber-950 mt-1">
                      {user.wallet?.balance || 360} <span className="text-sm font-bold text-amber-700">Credits</span>
                    </p>
                    <p className="text-[11px] text-amber-800 mt-1 font-medium">Use credits to unlock high-intent buyer RFQs instantly</p>
                  </div>
                </div>

                <Link
                  href="/pricing"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold text-center transition-colors block shadow-xs"
                >
                  + Recharge Lead Credits
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ────────────────── ADD FACILITY MODAL ────────────────── */}
        <AnimatePresence>
          {showAddressModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddressModal(false)}
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Register New Facility</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Add warehouse, factory, or corporate address</p>
                  </div>
                  <button onClick={() => setShowAddressModal(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl">
                    <FaXmark className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleAddAddress} className="space-y-4">
                  <Input
                    label="Facility Label (e.g. Surat Main Factory, Delhi Depot)"
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Contact Person"
                      value={addressForm.contactName}
                      onChange={(e) => setAddressForm({ ...addressForm, contactName: e.target.value })}
                      placeholder="Manager Name"
                    />
                    <Input
                      label="Contact Phone"
                      value={addressForm.contactPhone}
                      onChange={(e) => setAddressForm({ ...addressForm, contactPhone: e.target.value })}
                      placeholder="9876543210"
                    />
                  </div>

                  <Input
                    label="Address Line 1 (Building, Plot, Street)"
                    value={addressForm.line1}
                    onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                    required
                  />
                  <Input
                    label="Address Line 2 (Industrial Area, Landmark)"
                    value={addressForm.line2}
                    onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="City"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      required
                    />
                    <Input
                      label="State"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      required
                    />
                    <Input
                      label="Pincode"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isPrimary"
                      checked={addressForm.isPrimary}
                      onChange={(e) => setAddressForm({ ...addressForm, isPrimary: e.target.checked })}
                      className="h-4 w-4 rounded text-indigo-600"
                    />
                    <label htmlFor="isPrimary" className="text-xs font-bold text-slate-700">
                      Set as Primary Corporate Billing & Dispatch Facility
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button type="button" variant="ghost" onClick={() => setShowAddressModal(false)} className="text-xs font-bold">
                      Cancel
                    </Button>
                    <Button type="submit" loading={addressLoading} className="bg-indigo-600 text-white text-xs font-bold">
                      Save Facility
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ────────────────── KYC DOCUMENT MODAL ────────────────── */}
        <AnimatePresence>
          {showKycModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowKycModal(false)}
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 z-10"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Submit Compliance Document</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Upload certified verification credentials</p>
                  </div>
                  <button onClick={() => setShowKycModal(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl">
                    <FaXmark className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleUploadKyc} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                      Document Classification
                    </label>
                    <select
                      value={kycForm.documentType}
                      onChange={(e) => setKycForm({ ...kycForm, documentType: e.target.value })}
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-900 outline-none"
                    >
                      <option value="GST_CERTIFICATE">GST Registration Certificate (Form REG-06)</option>
                      <option value="PAN">Corporate / Proprietor PAN Card</option>
                      <option value="UDYAM_MSME">MSME Udyam Registration Certificate</option>
                      <option value="IEC_CERTIFICATE">Import Export Code (IEC) Document</option>
                      <option value="TRADE_LICENSE">Municipal Trade / Factory License</option>
                      <option value="BOARD_RESOLUTION">Board Resolution / Authorisation Letter</option>
                    </select>
                  </div>

                  <Input
                    label="Document Reference ID / Number"
                    value={kycForm.documentNumber}
                    onChange={(e) => setKycForm({ ...kycForm, documentNumber: e.target.value })}
                    placeholder="e.g. 24AAACJ9988H1Z1"
                  />

                  <Input
                    label="Document Secure URL / PDF Link"
                    value={kycForm.documentUrl}
                    onChange={(e) => setKycForm({ ...kycForm, documentUrl: e.target.value })}
                    placeholder="https://s3.ap-south-1.amazonaws.com/..."
                    required
                  />

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-[11px] text-amber-900 font-medium">
                    Documents are encrypted and audited by the JaxMart Compliance Desk within 2–4 business hours.
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button type="button" variant="ghost" onClick={() => setShowKycModal(false)} className="text-xs font-bold">
                      Cancel
                    </Button>
                    <Button type="submit" loading={kycLoading} className="bg-indigo-600 text-white text-xs font-bold">
                      Submit for Audit
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}

function ProfileEditForm({ user, onComplete }: { user: any; onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const business = user.businessProfile || {};

  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    accountType: user.accountType || 'BUSINESS',
    userType: user.userType || 'SELLER',
    language: user.language || 'en',
    timezone: user.timezone || 'Asia/Kolkata',
    currency: user.currency || 'INR',
    // Business Profile Fields
    businessName: business.businessName || '',
    gstin: business.gstin || '',
    pan: business.pan || '',
    udyamNumber: business.udyamNumber || '',
    iecCode: business.iecCode || '',
    mcaCin: business.mcaCin || '',
    establishedYear: business.establishedYear || '',
    employeeRange: business.employeeRange || '50_TO_250',
    annualTurnover: business.annualTurnover || '₹10 Cr - ₹50 Cr',
    website: business.website || '',
    linkedinUrl: business.linkedinUrl || '',
    description: business.description || '',
    businessType: business.businessType || 'Manufacturer & Wholesaler',
    exportCapable: business.exportCapable !== undefined ? business.exportCapable : true,
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userApi.update(formData);
      toast.success('Corporate Identity & Profile Synchronized');
      onComplete();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={save} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-black text-slate-900">Modify Corporate Registry</h3>
          <p className="text-xs text-slate-500 mt-0.5">Update contact schema, legal identification, and manufacturing profile</p>
        </div>
      </div>

      {/* Identity Block */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase text-indigo-600 tracking-wider">1. Core User Identity</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Full Name / Officer In-Charge"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          <Input
            label="Official Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Business Details */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h4 className="text-xs font-black uppercase text-indigo-600 tracking-wider">2. Business Organization & Identifiers</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Corporate Entity / Business Name"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            required
          />
          <Input
            label="GSTIN (15 Digits)"
            value={formData.gstin}
            onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
            placeholder="24AAACJ9988H1Z1"
          />
          <Input
            label="Permanent Account Number (PAN)"
            value={formData.pan}
            onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
            placeholder="AAACJ9988H"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="MSME Udyam Registration"
            value={formData.udyamNumber}
            onChange={(e) => setFormData({ ...formData, udyamNumber: e.target.value })}
            placeholder="UDYAM-GJ-01-0012345"
          />
          <Input
            label="Import Export Code (IEC)"
            value={formData.iecCode}
            onChange={(e) => setFormData({ ...formData, iecCode: e.target.value })}
            placeholder="IEC-0309124567"
          />
          <Input
            label="Established Year"
            type="number"
            value={formData.establishedYear}
            onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
            placeholder="2016"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Business Classification"
            value={formData.businessType}
            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
            placeholder="Manufacturer / Exporter"
          />
          <Input
            label="Annual Turnover Range"
            value={formData.annualTurnover}
            onChange={(e) => setFormData({ ...formData, annualTurnover: e.target.value })}
            placeholder="₹10 Cr - ₹50 Cr"
          />
          <Input
            label="Corporate Website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">
            Company Capability Statement & Bio
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 outline-none focus:ring-2 ring-indigo-500/20"
            placeholder="Describe your manufacturing facilities, export capacity, core product lines..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="ghost" onClick={onComplete} className="text-xs font-bold">
          Discard Changes
        </Button>
        <Button type="submit" loading={loading} className="bg-indigo-600 text-white text-xs font-bold px-8 shadow-xs">
          Save Profile
        </Button>
      </div>
    </form>
  );
}

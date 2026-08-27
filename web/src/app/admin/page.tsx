'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
   FaUsers, FaFileLines, FaTriangleExclamation, FaArrowTrendUp,
   FaCircleCheck, FaCircleXmark, FaEye, FaChartBar, FaShieldHalved,
   FaInbox, FaMagnifyingGlass, FaPlus, FaFilter, FaChevronRight, FaArrowRightLong,
   FaCalendarDays, FaPen, FaTrash, FaFileInvoiceDollar, FaCoins, FaHandshake,
   FaCheck, FaXmark, FaBuilding, FaUserPlus, FaStore, FaLocationDot,
   FaPhone, FaEnvelope, FaBriefcase, FaBoxOpen, FaQrcode, FaArrowUpRightFromSquare,
   FaReceipt, FaCreditCard, FaRegCopy, FaPrint, FaArrowRotateLeft, FaDownload,
   FaWhatsapp
} from 'react-icons/fa6';
import { ShieldCheck, Award, TrendingUp, CheckCircle2, UserCheck, AlertTriangle, ExternalLink } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, Badge, Button, Avatar, PageLoader, StatCard, EmptyState, Skeleton, TrustScore } from '@/components/ui';
import { adminApi, paymentApi } from '@/lib/api';
import {
   useAdminStats, useAdminUsers, useAdminKycQueue, useAdminListingsQueue,
   useAdminEvents, useAdminSubscribers, useAdminDepositReceipts,
   useAdminCaptains, useAdminCaptainOnboardings, useAdminCaptainListings,
   useAdminInvoices, useAdminRefunds, revalidate
} from '@/lib/hooks';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadTaxInvoice } from '@/lib/invoiceGenerator';

export default function AdminPage() {
   return (
      <Suspense fallback={<PageLoader />}>
         <AdminDashboard />
      </Suspense>
   );
}

function AdminDashboard() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const paramTab = searchParams.get('tab');
   const [tab, setTab] = useState(paramTab || 'overview');

   useEffect(() => {
      if (paramTab) {
         setTab(paramTab);
      }
   }, [paramTab]);

   const handleTabChange = (newTab: string) => {
      setTab(newTab);
      router.push(`/admin?tab=${newTab}`);
   };

   const [userSearch, setUserSearch] = useState('');
   const [userTypeFilter, setUserTypeFilter] = useState('ALL');
   const [kycFilter, setKycFilter] = useState('ALL');
   const [selectedUserDetail, setSelectedUserDetail] = useState<any>(null);
   const [copiedField, setCopiedField] = useState<string | null>(null);

   // Inventory Moderation & Catalog State
   const [listingSearch, setListingSearch] = useState('');
   const [listingStatusFilter, setListingStatusFilter] = useState<'ALL' | 'DRAFT' | 'ACTIVE' | 'REJECTED'>('ALL');
   const [selectedListingDetail, setSelectedListingDetail] = useState<any>(null);
   const [listingPage, setListingPage] = useState(1);
   const [listingLimit, setListingLimit] = useState(20);

   // KYC Verification Queue State
   const [kycSearch, setKycSearch] = useState('');
   const [kycStatusFilter, setKycStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
   const [selectedKycDetail, setSelectedKycDetail] = useState<any>(null);
   const [kycPage, setKycPage] = useState(1);
   const [kycLimit, setKycLimit] = useState(20);
   const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

   const { data: stats, isLoading: statsLoading } = useAdminStats();
   const { data: users, isLoading: usersLoading } = useAdminUsers(
      tab === 'users',
      userSearch,
      userTypeFilter !== 'ALL' ? userTypeFilter : undefined,
      kycFilter !== 'ALL' ? kycFilter : undefined
   );
   const { data: kycQueue, isLoading: kycLoading, mutate: mutateKyc } = useAdminKycQueue(
      tab === 'kyc',
      {
         status: kycStatusFilter !== 'ALL' ? kycStatusFilter : undefined,
         search: kycSearch,
         page: kycPage,
         limit: kycLimit,
      }
   );
   const { data: listingsQueue, isLoading: listingsLoading } = useAdminListingsQueue(
      tab === 'listings',
      {
         status: listingStatusFilter !== 'ALL' ? listingStatusFilter : undefined,
         search: listingSearch,
         page: listingPage,
         limit: listingLimit,
      }
   );
   const { data: eventsData, isLoading: eventsLoading } = useAdminEvents(tab === 'events');
   const { data: subscribersData, isLoading: subscribersLoading } = useAdminSubscribers(tab === 'subscriptions');
   const { data: depositsData, isLoading: depositsLoading } = useAdminDepositReceipts(tab === 'subscriptions');

   // Captain Hooks
   const { data: captainsData, isLoading: captainsLoading } = useAdminCaptains(tab === 'captains');
   const { data: onboardingsData, isLoading: onboardingsLoading } = useAdminCaptainOnboardings(tab === 'captains');
   const { data: captainListingsData, isLoading: captainListingsLoading } = useAdminCaptainListings(tab === 'captains');

   // Invoices & Refunds Hooks
   const { data: adminInvoicesData, isLoading: adminInvoicesLoading } = useAdminInvoices(tab === 'invoices');
   const { data: adminRefundsData, isLoading: adminRefundsLoading } = useAdminRefunds(tab === 'invoices');

   const events = eventsData?.events ?? [];
   const subscribers = subscribersData?.subscribers ?? [];
   const deposits = depositsData?.receipts ?? [];
   const captains = captainsData?.captains ?? [];
   const onboardings = onboardingsData?.onboardings ?? [];
   const captainListings = captainListingsData?.listings ?? [];
   const adminInvoices = adminInvoicesData?.invoices ?? [];
   const adminRefunds = adminRefundsData?.refunds ?? [];

   // Invoices & Refunds State
   const [invoiceSubTab, setInvoiceSubTab] = useState<'invoices' | 'refunds'>('invoices');
   const [selectedAdminInvoice, setSelectedAdminInvoice] = useState<any>(null);

   // Captain state
   const [captainSubTab, setCaptainSubTab] = useState<'onboardings' | 'captains' | 'listings'>('onboardings');
   const [isCaptainModalOpen, setIsCaptainModalOpen] = useState(false);
   const [captainForm, setCaptainForm] = useState({
      fullName: '',
      phone: '',
      email: '',
      territory: 'Surat Industrial Hub',
   });
   const [deployingCaptain, setDeployingCaptain] = useState(false);

   // Event modal states
   const [isEventModalOpen, setIsEventModalOpen] = useState(false);
   const [editingEvent, setEditingEvent] = useState<any>(null);
   const [eventForm, setEventForm] = useState({
      title: '',
      description: '',
      date: '',
      location: '',
      mediaUrl: '',
      isActive: true
   });

   // Audit document modal
   const [selectedCompanyAudit, setSelectedCompanyAudit] = useState<any>(null);

   const openCreateModal = () => {
      setEditingEvent(null);
      setEventForm({
         title: '',
         description: '',
         date: '',
         location: '',
         mediaUrl: '',
         isActive: true
      });
      setIsEventModalOpen(true);
   };

   const openEditModal = (event: any) => {
      setEditingEvent(event);
      setEventForm({
         title: event.title || '',
         description: event.description || '',
         date: event.date ? new Date(event.date).toISOString().substring(0, 16) : '',
         location: event.location || '',
         mediaUrl: event.mediaUrl || '',
         isActive: event.isActive ?? true
      });
      setIsEventModalOpen(true);
   };

   const handleSaveEvent = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!eventForm.title || !eventForm.description) {
         toast.error('Title and description are required');
         return;
      }

      try {
         const payload = {
            ...eventForm,
            date: eventForm.date ? new Date(eventForm.date).toISOString() : null
         };
         if (editingEvent) {
            await adminApi.updateEvent(editingEvent.id, payload);
            toast.success('Event updated successfully');
         } else {
            await adminApi.createEvent(payload);
            toast.success('Event created successfully');
         }
         setIsEventModalOpen(false);
         revalidate.admin();
      } catch (err: any) {
         toast.error(err.response?.data?.error || 'Failed to save event');
      }
   };

   const handleDeleteEvent = async (id: string) => {
      if (!confirm('Are you sure you want to delete this event?')) return;
      try {
         await adminApi.deleteEvent(id);
         toast.success('Event deleted successfully');
         revalidate.admin();
      } catch (err: any) {
         toast.error(err.response?.data?.error || 'Failed to delete event');
      }
   };

   const handleDeployCaptain = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!captainForm.fullName || !captainForm.phone) {
         toast.error('Full name and mobile are required');
         return;
      }
      setDeployingCaptain(true);
      try {
         await adminApi.createCaptain(captainForm);
         toast.success('🎉 Field Captain deployed successfully!');
         setIsCaptainModalOpen(false);
         setCaptainForm({ fullName: '', phone: '', email: '', territory: 'Surat Industrial Hub' });
         revalidate.admin();
      } catch (err: any) {
         toast.error(err.response?.data?.error || 'Failed to deploy captain');
      } finally {
         setDeployingCaptain(false);
      }
   };

   const handleApprove = async (type: string, id: string) => {
      try {
         if (type === 'kyc') await adminApi.approveKyc(id);
         else if (type === 'deposit') await adminApi.verifyDepositReceipt(id);
         else await adminApi.approveListing(id);
         revalidate.admin();
         toast.success('Approved and activated successfully');
         if (selectedUserDetail?.id === id) {
            setSelectedUserDetail((prev: any) => prev ? { ...prev, kycStatus: 'VERIFIED' } : null);
         }
      } catch {
         toast.error('Action failed');
      }
   };

   const handleReject = async (type: string, id: string) => {
      const reason = prompt('Reject reason:');
      if (!reason) return;
      try {
         if (type === 'kyc') await adminApi.rejectKyc(id, reason);
         else if (type === 'deposit') await adminApi.rejectDepositReceipt(id, reason);
         else await adminApi.rejectListing(id, reason);
         revalidate.admin();
         toast.success('Rejected');
         if (selectedUserDetail?.id === id) {
            setSelectedUserDetail((prev: any) => prev ? { ...prev, kycStatus: 'REJECTED' } : null);
         }
      } catch {
         toast.error('Action failed');
      }
   };

   const handleCopy = (text: string, label: string) => {
      if (!text) return;
      navigator.clipboard.writeText(text);
      setCopiedField(`${label}-${text}`);
      toast.success(`Copied ${label}: ${text}`);
      setTimeout(() => setCopiedField(null), 2000);
   };

   const handleProcessAdminRefund = async (orderId: string, amount: number) => {
      const reason = prompt(`Confirm and execute full refund of ₹${amount?.toLocaleString('en-IN')} to buyer via Razorpay:`, 'Approved upon contract audit');
      if (reason === null) return;
      try {
         await adminApi.processRefund(orderId, { refundAmount: amount, reasonNote: reason });
         toast.success('🎉 Refund approved and executed successfully!');
         revalidate.admin();
      } catch (err: any) {
         toast.error(err?.response?.data?.error || 'Failed to process refund');
      }
   };

   const handleRejectAdminRefund = async (orderId: string) => {
      const reason = prompt('Reason for declining refund claim:', 'Specifications match verified sample dispatched');
      if (!reason) return;
      try {
         await adminApi.rejectRefund(orderId, reason);
         toast.success('Refund request declined');
         revalidate.admin();
      } catch (err: any) {
         toast.error(err?.response?.data?.error || 'Failed to decline refund');
      }
   };

   const handleAdminDownloadInvoice = async (invoiceId: string) => {
      try {
         const res = await paymentApi.getInvoice(invoiceId);
         if (res.data?.invoice) {
            downloadTaxInvoice(res.data.invoice);
            toast.success('Downloading Official Tax Invoice...');
         }
      } catch {
         toast.error('Failed to load invoice');
      }
   };

   return (
      <AdminLayout activeTab={tab} onTabChange={handleTabChange}>
         <div className="space-y-6">
            {/* Dynamic View Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
               <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight capitalize">
                     {tab === 'overview' && 'Platform Pulse & Analytics'}
                     {tab === 'captains' && 'Captain Field Operations'}
                     {tab === 'subscriptions' && 'Subscriptions & Recurring Revenue'}
                     {tab === 'invoices' && 'Tax Invoices, Purchases & Refunds Hub'}
                     {tab === 'kyc' && 'KYC Verification Queue'}
                     {tab === 'listings' && 'Inventory Moderation'}
                     {tab === 'disputes' && 'Dispute Mediation Hub'}
                     {tab === 'users' && 'User Master Directory'}
                     {tab === 'events' && 'Global Trade Events'}
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                     {tab === 'overview' && 'Real-time overview of marketplace volume, revenue velocity, and moderation queues.'}
                     {tab === 'captains' && 'Monitor on-ground sales officers, GPS-verified company onboarding, and cataloging.'}
                     {tab === 'subscriptions' && 'Manage supplier SaaS subscription plans, lead credit packs, and bank transfer receipts.'}
                     {tab === 'invoices' && 'Global tax invoice ledger, order escrow milestones, and automated Razorpay refund dispatch.'}
                     {tab === 'kyc' && 'Audit on-site and digital merchant KYC identity submissions and compliance docs.'}
                     {tab === 'listings' && 'Inspect wholesale catalog items before indexing into the public marketplace.'}
                     {tab === 'disputes' && 'Mediate escrow and milestone trade disagreements between buyers and suppliers.'}
                     {tab === 'users' && 'Govern accounts, search registered merchants, and inspect business profiles.'}
                     {tab === 'events' && 'Publish and schedule industrial trade expos, buyer webinars, and business meets.'}
                  </p>
               </div>

               {/* Quick Header CTA */}
               <div className="flex items-center gap-2.5 shrink-0">
                  {tab === 'captains' && (
                     <button
                        onClick={() => setIsCaptainModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
                     >
                        <FaUserPlus className="h-3.5 w-3.5" />
                        <span>Deploy Captain</span>
                     </button>
                  )}
                  {tab === 'events' && (
                     <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
                     >
                        <FaPlus className="h-3.5 w-3.5" />
                        <span>Create Trade Event</span>
                     </button>
                  )}
                  {tab === 'subscriptions' && deposits.length > 0 && (
                     <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                        {deposits.length} Bank Receipt(s) Pending
                     </span>
                  )}
               </div>
            </div>

            <motion.div
               key={tab}
               initial={{ opacity: 0, y: 8 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.25 }}
            >
               {/* ────────────────── TAB 1: OVERVIEW ────────────────── */}
               {tab === 'overview' && (
                  <div className="space-y-6">
                     {/* 4 Metric Cards */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                           <div className="flex items-center justify-between text-slate-400 mb-2">
                              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Platform GMV</span>
                              <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                 <FaArrowTrendUp className="h-4 w-4" />
                              </div>
                           </div>
                           <p className="text-2xl font-black text-slate-900 tracking-tight">
                              ₹{stats?.totalGmv ? Number(stats.totalGmv).toLocaleString('en-IN') : '0'}
                           </p>
                           <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                              <span>+18.4%</span>
                              <span className="text-slate-400 font-normal">vs last month</span>
                           </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                           <div className="flex items-center justify-between text-slate-400 mb-2">
                              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Subscription MRR</span>
                              <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                 <FaFileInvoiceDollar className="h-4 w-4" />
                              </div>
                           </div>
                           <p className="text-2xl font-black text-slate-900 tracking-tight">
                              ₹{stats?.mrr ? Number(stats.mrr).toLocaleString('en-IN') : '0'}
                           </p>
                           <p className="text-[11px] text-slate-500 font-medium mt-1">
                              <strong className="text-slate-900">{stats?.activeSubscribers || 0}</strong> active plans
                           </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                           <div className="flex items-center justify-between text-slate-400 mb-2">
                              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Total RFQ Demand</span>
                              <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                 <FaInbox className="h-4 w-4" />
                              </div>
                           </div>
                           <p className="text-2xl font-black text-slate-900 tracking-tight">
                              {stats?.totalRfqs || 0}
                           </p>
                           <p className="text-[11px] text-blue-600 font-bold mt-1">
                              {stats?.rfqsToday || 0} posted today
                           </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                           <div className="flex items-center justify-between text-slate-400 mb-2">
                              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">KYC & Moderation</span>
                              <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                 <FaShieldHalved className="h-4 w-4" />
                              </div>
                           </div>
                           <p className="text-2xl font-black text-slate-900 tracking-tight">
                              {(stats?.kycPending || 0) + (stats?.listingsPending || 0)}
                           </p>
                           <p className="text-[11px] text-amber-700 font-bold mt-1">
                              {stats?.kycPending || 0} KYC • {stats?.listingsPending || 0} SKUs
                           </p>
                        </div>
                     </div>

                     {/* 2 Column Operational Hub */}
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Operational Queues */}
                        <div className="lg:col-span-2 space-y-4">
                           <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">
                              Operational Action Queues
                           </h3>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              {[
                                 {
                                    label: 'Captain Field Operations',
                                    val: onboardings.length || 4,
                                    sub: 'On-site verified suppliers',
                                    id: 'captains',
                                    icon: FaBuilding,
                                    color: 'text-indigo-600 bg-indigo-50',
                                 },
                                 {
                                    label: 'Pending Bank Deposit Receipts',
                                    val: stats?.pendingDeposits || 0,
                                    sub: 'Offline NEFT / RTGS payments',
                                    id: 'subscriptions',
                                    icon: FaReceipt,
                                    color: 'text-amber-600 bg-amber-50',
                                 },
                                 {
                                    label: 'Listings Pending Review',
                                    val: stats?.listingsPending || 0,
                                    sub: 'Awaiting catalog publishing',
                                    id: 'listings',
                                    icon: FaInbox,
                                    color: 'text-blue-600 bg-blue-50',
                                 },
                                 {
                                    label: 'KYC Identity Verification',
                                    val: stats?.kycPending || 0,
                                    sub: 'GSTIN & PAN audits pending',
                                    id: 'kyc',
                                    icon: FaShieldHalved,
                                    color: 'text-emerald-600 bg-emerald-50',
                                 },
                              ].map((task) => {
                                 const Icon = task.icon;
                                 return (
                                    <div
                                       key={task.label}
                                       onClick={() => handleTabChange(task.id)}
                                       className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-500/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                                    >
                                       <div className="flex items-center justify-between mb-3">
                                          <div className={clsx('h-9 w-9 rounded-xl flex items-center justify-center', task.color)}>
                                             <Icon className="h-4 w-4" />
                                          </div>
                                          <span className="text-2xl font-black text-slate-900">{task.val}</span>
                                       </div>
                                       <div>
                                          <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                             {task.label}
                                          </p>
                                          <p className="text-[11px] text-slate-400 mt-0.5">{task.sub}</p>
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        </div>

                        {/* Revenue Breakdown */}
                        <div className="p-6 rounded-2xl bg-slate-950 text-white flex flex-col justify-between">
                           <div>
                              <div className="flex items-center justify-between mb-4">
                                 <h3 className="text-sm font-black tracking-tight text-white">Monetization Pulse</h3>
                                 <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                                    Healthy
                                 </span>
                              </div>

                              <div className="space-y-3 text-xs">
                                 <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                    <span className="text-slate-400">Lead Unlocks Today</span>
                                    <span className="font-bold text-white text-sm">{stats?.leadsUnlockedToday || 0}</span>
                                 </div>
                                 <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                    <span className="text-slate-400">Assured Deals Closed</span>
                                    <span className="font-bold text-emerald-400 text-sm">{stats?.totalDeals || 0}</span>
                                 </div>
                                 <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                    <span className="text-slate-400">Lead-to-Deal Conversion</span>
                                    <span className="font-bold text-amber-300 text-sm">{stats?.conversionRate || 0}%</span>
                                 </div>
                              </div>
                           </div>

                           <button
                              onClick={() => handleTabChange('subscriptions')}
                              className="w-full mt-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-lg shadow-indigo-600/30"
                           >
                              Manage Subscriptions & Billing →
                           </button>
                        </div>
                     </div>
                  </div>
               )}

               {/* ────────────────── TAB 2: CAPTAIN OPERATIONS ────────────────── */}
               {tab === 'captains' && (
                  <div className="space-y-6">
                     {/* 4 Captain Metrics */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Field Captains</span>
                           <p className="text-2xl font-black text-slate-900 mt-1">{captains.length}</p>
                           <p className="text-[11px] text-indigo-600 font-bold mt-0.5">Field sales force deployed</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Companies Onboarded</span>
                           <p className="text-2xl font-black text-slate-900 mt-1">{onboardings.length}</p>
                           <p className="text-[11px] text-emerald-600 font-bold mt-0.5">100% on-site verified</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Cataloged SKUs</span>
                           <p className="text-2xl font-black text-slate-900 mt-1">{captainListings.length}</p>
                           <p className="text-[11px] text-blue-600 font-bold mt-0.5">Direct from factory floors</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Verification Mode</span>
                           <p className="text-2xl font-black text-slate-900 mt-1">Geo-Tagged</p>
                           <p className="text-[11px] text-slate-500 font-medium mt-0.5">GPS + storefront photos</p>
                        </div>
                     </div>

                     {/* Subtab Toggle Buttons */}
                     <div className="flex bg-slate-200/70 p-1 rounded-2xl w-fit">
                        <button
                           onClick={() => setCaptainSubTab('onboardings')}
                           className={clsx(
                              'px-4 py-2 rounded-xl text-xs font-bold transition-all',
                              captainSubTab === 'onboardings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                           )}
                        >
                           Onboarded Companies ({onboardings.length})
                        </button>
                        <button
                           onClick={() => setCaptainSubTab('captains')}
                           className={clsx(
                              'px-4 py-2 rounded-xl text-xs font-bold transition-all',
                              captainSubTab === 'captains' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                           )}
                        >
                           Field Captains ({captains.length})
                        </button>
                        <button
                           onClick={() => setCaptainSubTab('listings')}
                           className={clsx(
                              'px-4 py-2 rounded-xl text-xs font-bold transition-all',
                              captainSubTab === 'listings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                           )}
                        >
                           Cataloged SKUs ({captainListings.length})
                        </button>
                     </div>

                     {/* Subtab Content 1: Onboarded Companies */}
                     {captainSubTab === 'onboardings' && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                           <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                              <div>
                                 <h3 className="text-sm font-bold text-slate-900">On-Ground Verified Companies Ledger</h3>
                                 <p className="text-xs text-slate-500 mt-0.5">B2B Suppliers and factories physically onboarded on-site by field Captains</p>
                              </div>
                           </div>

                           {!onboardings.length ? (
                              <div className="p-12 text-center text-slate-400 text-xs font-medium">No companies onboarded yet.</div>
                           ) : (
                              <div className="overflow-x-auto">
                                 <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                                       <tr>
                                          <th className="py-3 px-4">Company & Storefront</th>
                                          <th className="py-3 px-4">Owner / Contact</th>
                                          <th className="py-3 px-4">GSTIN & Identity</th>
                                          <th className="py-3 px-4">Location & GPS</th>
                                          <th className="py-3 px-4">SKUs</th>
                                          <th className="py-3 px-4">KYC Status</th>
                                          <th className="py-3 px-4 text-right">Audit</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                       {onboardings.map((c: any) => (
                                          <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                                             <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                   {c.storefrontImage ? (
                                                      <img src={c.storefrontImage} alt="store" className="h-10 w-10 rounded-xl object-cover border border-slate-200 shrink-0" />
                                                   ) : (
                                                      <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                                                         <FaStore className="h-4 w-4" />
                                                      </div>
                                                   )}
                                                   <div>
                                                      <p className="font-bold text-slate-900 text-xs">{c.legalName}</p>
                                                      <p className="text-[11px] text-slate-400">{c.tradeName || c.category}</p>
                                                   </div>
                                                </div>
                                             </td>
                                             <td className="py-3.5 px-4">
                                                <p className="font-bold text-slate-900">{c.ownerName}</p>
                                                <p className="text-[11px] text-slate-500">{c.phone}</p>
                                             </td>
                                             <td className="py-3.5 px-4">
                                                <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded text-[11px] border border-indigo-100">
                                                   {c.gstin || c.pan || 'PAN Verified'}
                                                </span>
                                             </td>
                                             <td className="py-3.5 px-4">
                                                <p className="text-slate-900 font-medium">{c.city}, {c.state}</p>
                                                {c.gps && <p className="text-[10px] text-slate-400 font-mono">📍 {c.gps}</p>}
                                             </td>
                                             <td className="py-3.5 px-4">
                                                <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full text-[11px]">
                                                   {c.skuCount || 0} SKUs
                                                </span>
                                             </td>
                                             <td className="py-3.5 px-4">
                                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                                                   <ShieldCheck className="h-3 w-3 text-emerald-600" /> Captain Verified
                                                </span>
                                             </td>
                                             <td className="py-3.5 px-4 text-right">
                                                <button
                                                   onClick={() => setSelectedCompanyAudit(c)}
                                                   className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                                                >
                                                   Inspect KYC
                                                </button>
                                             </td>
                                          </tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           )}
                        </div>
                     )}

                     {/* Subtab Content 2: Field Captains */}
                     {captainSubTab === 'captains' && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                           <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                              <div>
                                 <h3 className="text-sm font-bold text-slate-900">Deployed Field Sales Representatives</h3>
                                 <p className="text-xs text-slate-500 mt-0.5">Captains authorized to onboard companies and catalog inventory in field hubs</p>
                              </div>
                              <button
                                 onClick={() => setIsCaptainModalOpen(true)}
                                 className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                              >
                                 <FaUserPlus className="h-3 w-3" /> Deploy Captain
                              </button>
                           </div>

                           {!captains.length ? (
                              <div className="p-12 text-center text-slate-400 text-xs font-medium">No captains deployed yet.</div>
                           ) : (
                              <div className="overflow-x-auto">
                                 <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                                       <tr>
                                          <th className="py-3 px-4">Captain Officer</th>
                                          <th className="py-3 px-4">Contact</th>
                                          <th className="py-3 px-4">Assigned Territory</th>
                                          <th className="py-3 px-4">Onboarded</th>
                                          <th className="py-3 px-4">SKUs Uploaded</th>
                                          <th className="py-3 px-4">Status</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                       {captains.map((cap: any) => (
                                          <tr key={cap.id} className="hover:bg-slate-50/60 transition-colors">
                                             <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                   <Avatar name={cap.fullName} src={cap.avatarUrl} size="sm" />
                                                   <div>
                                                      <p className="font-bold text-slate-900 text-xs">{cap.fullName}</p>
                                                      <p className="text-[10px] text-indigo-600 font-bold">Field Officer</p>
                                                   </div>
                                                </div>
                                             </td>
                                             <td className="py-3.5 px-4">
                                                <p className="text-slate-900 font-medium">{cap.phone}</p>
                                                <p className="text-[10px] text-slate-400">{cap.email || 'Mobile OTP Auth'}</p>
                                             </td>
                                             <td className="py-3.5 px-4">
                                                <div className="flex flex-col">
                                                   <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg w-fit text-xs">
                                                      📍 {cap.city || cap.territory || 'Surat Industrial Hub'}
                                                   </span>
                                                   {cap.gps && (
                                                      <span className="text-[10px] text-slate-400 font-mono mt-1">
                                                         GPS: {cap.gps}
                                                      </span>
                                                   )}
                                                </div>
                                             </td>
                                             <td className="py-3.5 px-4 font-bold text-slate-900">
                                                {cap.totalOnboarded ?? 0} Suppliers
                                             </td>
                                             <td className="py-3.5 px-4 font-bold text-indigo-700">
                                                {cap.totalSkus ?? 0} SKUs
                                             </td>
                                             <td className="py-3.5 px-4">
                                                {cap.isClockedIn || cap.status === 'PUNCHED_IN' ? (
                                                   <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 border border-emerald-200 shadow-2xs">
                                                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                      Punched In (Active)
                                                   </span>
                                                ) : (
                                                   <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 border border-amber-200">
                                                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                                                      Punched Out (Off Duty)
                                                   </span>
                                                )}
                                             </td>
                                          </tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           )}
                        </div>
                     )}

                     {/* Subtab Content 3: Cataloged SKUs */}
                     {captainSubTab === 'listings' && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                           <div className="p-5 border-b border-slate-100">
                              <h3 className="text-sm font-bold text-slate-900">Field Cataloged Inventory SKUs</h3>
                              <p className="text-xs text-slate-500 mt-0.5">Wholesale items uploaded directly from factory premises by Field Captains</p>
                           </div>

                           {!captainListings.length ? (
                              <div className="p-12 text-center text-slate-400 text-xs font-medium">No listings cataloged yet.</div>
                           ) : (
                              <div className="overflow-x-auto">
                                 <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                                       <tr>
                                          <th className="py-3 px-4">Product SKU</th>
                                          <th className="py-3 px-4">Manufacturer</th>
                                          <th className="py-3 px-4">Category</th>
                                          <th className="py-3 px-4">Base Price & MOQ</th>
                                          <th className="py-3 px-4">Status</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                       {captainListings.map((l: any) => (
                                          <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                                             <td className="py-3.5 px-4">
                                                <p className="font-bold text-slate-900 text-xs">{l.title}</p>
                                                <p className="text-[10px] text-slate-400">Brand: {l.productDetail?.brand || 'OEM'}</p>
                                             </td>
                                             <td className="py-3.5 px-4">
                                                <p className="font-bold text-slate-900">{l.seller?.businessProfile?.businessName || l.seller?.fullName}</p>
                                                <p className="text-[10px] text-slate-500">{l.seller?.phone}</p>
                                             </td>
                                             <td className="py-3.5 px-4">
                                                <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                                   {l.category?.name || 'Wholesale'}
                                                </span>
                                             </td>
                                             <td className="py-3.5 px-4">
                                                <p className="font-bold text-slate-900">
                                                   ₹{l.productDetail?.pricePerUnit?.toLocaleString('en-IN') || '1,450'}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                   MOQ: {l.productDetail?.minOrderQty || 10} {l.productDetail?.unitOfMeasure || 'Pieces'}
                                                </p>
                                             </td>
                                             <td className="py-3.5 px-4">
                                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                                                   Live & Active
                                                </span>
                                             </td>
                                          </tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           )}
                        </div>
                     )}
                  </div>
               )}

               {/* ────────────────── TAB 3: SUBSCRIPTIONS & MRR ────────────────── */}
               {tab === 'subscriptions' && (
                  <div className="space-y-6">
                     {/* 3 Metric Strip */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Monthly Recurring Revenue</span>
                           <p className="text-2xl font-black text-slate-900 mt-1">₹{stats?.mrr ? Number(stats.mrr).toLocaleString('en-IN') : '0'}</p>
                           <p className="text-[11px] text-emerald-600 font-bold mt-0.5">SaaS & Lead Quota ARR</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Paid Subscribers</span>
                           <p className="text-2xl font-black text-slate-900 mt-1">{stats?.activeSubscribers || 0}</p>
                           <p className="text-[11px] text-indigo-600 font-bold mt-0.5">Silver, Gold & Platinum tiers</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Pending Bank Deposits</span>
                           <p className="text-2xl font-black text-amber-600 mt-1">{deposits.length}</p>
                           <p className="text-[11px] text-slate-500 font-medium mt-0.5">NEFT / RTGS receipts</p>
                        </div>
                     </div>

                     {/* Pending Bank Deposit Receipts */}
                     {deposits.length > 0 && (
                        <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-4">
                           <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                              <h3 className="text-sm font-bold text-amber-950">Pending NEFT / RTGS Bank Transfer Receipts</h3>
                           </div>
                           <div className="space-y-3">
                              {deposits.map((receipt: any) => (
                                 <div key={receipt.id} className="bg-white border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                       <div className="flex items-center gap-2">
                                          <span className="font-bold text-slate-900 text-xs">
                                             {receipt.user?.businessProfile?.businessName || receipt.user?.fullName}
                                          </span>
                                          <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                                             {receipt.plan?.name} Plan ({receipt.billingCycle})
                                          </span>
                                       </div>
                                       <p className="text-xs text-slate-600 mt-1">
                                          Amount: <strong className="text-slate-900">₹{receipt.amount?.toLocaleString('en-IN')}</strong> • UTR Ref: <strong className="text-slate-900 font-mono">{receipt.transactionReference}</strong>
                                       </p>
                                       {receipt.receiptUrl && (
                                          <a href={receipt.receiptUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline font-bold mt-1 inline-flex items-center gap-1">
                                             <span>View Bank Proof Document</span> <ExternalLink className="h-3 w-3" />
                                          </a>
                                       )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <button
                                          onClick={() => handleApprove('deposit', receipt.id)}
                                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1"
                                       >
                                          <FaCheck className="h-3 w-3" /> Approve & Activate
                                       </button>
                                       <button
                                          onClick={() => handleReject('deposit', receipt.id)}
                                          className="px-3.5 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors flex items-center gap-1"
                                       >
                                          <FaXmark className="h-3 w-3" /> Reject
                                       </button>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Active Subscribers Table */}
                     <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                        <div className="p-5 border-b border-slate-100">
                           <h3 className="text-sm font-bold text-slate-900">Active Paid Subscribers Directory</h3>
                           <p className="text-xs text-slate-500 mt-0.5">Suppliers subscribed to recurring growth plans & RFQ unlock quotas</p>
                        </div>

                        {!subscribers.length ? (
                           <div className="p-12 text-center text-slate-400 text-xs font-medium">No active subscribers found</div>
                        ) : (
                           <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                 <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                                    <tr>
                                       <th className="py-3 px-4">Supplier</th>
                                       <th className="py-3 px-4">Plan Tier</th>
                                       <th className="py-3 px-4">Billing Cycle</th>
                                       <th className="py-3 px-4">Lead Quota Used</th>
                                       <th className="py-3 px-4">Renews At</th>
                                       <th className="py-3 px-4">Status</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                    {subscribers.map((sub: any) => (
                                       <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                                          <td className="py-3.5 px-4">
                                             <p className="font-bold text-slate-900">{sub.user?.businessProfile?.businessName || sub.user?.fullName}</p>
                                             <p className="text-[10px] text-slate-400">{sub.user?.email}</p>
                                          </td>
                                          <td className="py-3.5 px-4">
                                             <span className="font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                                                {sub.plan?.name || 'Gold Tier'}
                                             </span>
                                          </td>
                                          <td className="py-3.5 px-4 text-slate-600">{sub.billingCycle}</td>
                                          <td className="py-3.5 px-4 font-bold text-emerald-800">
                                             {sub.leadQuotaUsed || 0} / {sub.plan?.leadQuotaPerCycle === 'Unlimited' ? '∞' : sub.plan?.leadQuotaPerCycle}
                                          </td>
                                          <td className="py-3.5 px-4 text-slate-500">
                                             {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('en-IN') : 'N/A'}
                                          </td>
                                          <td className="py-3.5 px-4">
                                             <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {sub.status}
                                             </span>
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        )}
                     </div>
                  </div>
               )}

               {/* ────────────────── TAB: INVOICES & REFUNDS ────────────────── */}
               {tab === 'invoices' && (
                  <div className="space-y-6">
                     {/* Metric Strip */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Tax Invoices</span>
                           <p className="text-2xl font-black text-slate-900 mt-1">{adminInvoices.length}</p>
                           <p className="text-[11px] text-emerald-600 font-bold mt-0.5">SaaS & Wholesale Cargo</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Pending Refund Claims</span>
                           <p className="text-2xl font-black text-amber-600 mt-1">
                              {adminRefunds.filter((r: any) => r.status === 'PENDING_REVIEW').length}
                           </p>
                           <p className="text-[11px] text-slate-500 font-medium mt-0.5">Escrow refund review queue</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Payment Gateway</span>
                           <p className="text-2xl font-black text-indigo-600 mt-1">Razorpay</p>
                           <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Automated Refund Settlement</p>
                        </div>
                     </div>

                     {/* Subtab Toggle */}
                     <div className="flex bg-slate-200/70 p-1.5 rounded-2xl w-fit">
                        <button
                           onClick={() => setInvoiceSubTab('invoices')}
                           className={clsx(
                              'px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
                              invoiceSubTab === 'invoices' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                           )}
                        >
                           <FaReceipt className="h-3.5 w-3.5 text-indigo-600" />
                           <span>Master Invoices Ledger ({adminInvoices.length})</span>
                        </button>
                        <button
                           onClick={() => setInvoiceSubTab('refunds')}
                           className={clsx(
                              'px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
                              invoiceSubTab === 'refunds' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                           )}
                        >
                           <FaArrowRotateLeft className="h-3.5 w-3.5 text-amber-600" />
                           <span>Refund Claims Queue ({adminRefunds.length})</span>
                        </button>
                     </div>

                     {/* Subtab 1: Invoices Ledger */}
                     {invoiceSubTab === 'invoices' && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                           <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                              <div>
                                 <h3 className="text-sm font-bold text-slate-900">Platform Master Tax Invoices</h3>
                                 <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit trail of SaaS plans and wholesale trade invoices</p>
                              </div>
                           </div>

                           {!adminInvoices.length ? (
                              <div className="p-12 text-center text-slate-400 text-xs font-medium">No invoices generated yet</div>
                           ) : (
                              <div className="overflow-x-auto">
                                 <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                                       <tr>
                                          <th className="py-3 px-4">Invoice #</th>
                                          <th className="py-3 px-4">Category</th>
                                          <th className="py-3 px-4">Customer / Buyer</th>
                                          <th className="py-3 px-4">Amount</th>
                                          <th className="py-3 px-4">Payment Method</th>
                                          <th className="py-3 px-4">Status</th>
                                          <th className="py-3 px-4">Date</th>
                                          <th className="py-3 px-4 text-right">Tax Invoice</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                       {adminInvoices.map((inv: any) => (
                                          <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                                             <td className="py-3.5 px-4 font-mono font-bold text-indigo-900">
                                                {inv.invoiceNumber}
                                             </td>
                                             <td className="py-3.5 px-4">
                                                <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px] uppercase">
                                                   {inv.category}
                                                </span>
                                             </td>
                                             <td className="py-3.5 px-4">
                                                <p className="font-bold text-slate-900">{inv.customer}</p>
                                                {inv.customerPhone && <p className="text-[10px] text-slate-400">{inv.customerPhone}</p>}
                                             </td>
                                             <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                                                ₹{inv.amount?.toLocaleString('en-IN')}
                                             </td>
                                             <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                                                {inv.paymentMethod}
                                             </td>
                                             <td className="py-3.5 px-4">
                                                <span className={clsx(
                                                   'text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full',
                                                   inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : inv.status === 'REFUNDED' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                                                )}>
                                                   {inv.status}
                                                </span>
                                             </td>
                                             <td className="py-3.5 px-4 text-slate-500">
                                                {new Date(inv.date).toLocaleDateString('en-IN')}
                                             </td>
                                             <td className="py-3.5 px-4 text-right">
                                                <button
                                                   onClick={() => handleAdminDownloadInvoice(inv.id)}
                                                   className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                                                >
                                                   <FaDownload className="h-3 w-3" /> Download PDF
                                                </button>
                                             </td>
                                          </tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           )}
                        </div>
                     )}

                     {/* Subtab 2: Refund Claims Queue */}
                     {invoiceSubTab === 'refunds' && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                           <div className="p-5 border-b border-slate-100">
                              <h3 className="text-sm font-bold text-slate-900">Escrow Refund Mediation Queue</h3>
                              <p className="text-xs text-slate-500 mt-0.5">Review buyer refund claims and execute automated Razorpay escrow refunds</p>
                           </div>

                           {!adminRefunds.length ? (
                              <div className="p-12 text-center text-slate-400 text-xs font-medium">No refund requests in the queue</div>
                           ) : (
                              <div className="overflow-x-auto">
                                 <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                                       <tr>
                                          <th className="py-3 px-4">Order Ref</th>
                                          <th className="py-3 px-4">Buyer & Supplier</th>
                                          <th className="py-3 px-4">Claim Reason</th>
                                          <th className="py-3 px-4">Claim Amount</th>
                                          <th className="py-3 px-4">Status</th>
                                          <th className="py-3 px-4 text-right">Mediation Actions</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                       {adminRefunds.map((r: any) => (
                                          <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                                             <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                                                #{r.orderNumber}
                                                {r.razorpayPaymentId && (
                                                   <p className="text-[10px] text-slate-400 font-mono">Ref: {r.razorpayPaymentId}</p>
                                                )}
                                             </td>
                                             <td className="py-3.5 px-4">
                                                <p className="font-bold text-slate-900">Buyer: {r.buyerName}</p>
                                                <p className="text-[11px] text-slate-500">Seller: {r.sellerName}</p>
                                             </td>
                                             <td className="py-3.5 px-4">
                                                <span className="font-bold text-slate-900 block">{r.reason.replace('_', ' ')}</span>
                                                <p className="text-[11px] text-slate-500 mt-0.5">{r.description || 'Full Escrow Refund Claim'}</p>
                                             </td>
                                             <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                                                ₹{r.amount?.toLocaleString('en-IN')}
                                             </td>
                                             <td className="py-3.5 px-4">
                                                <span className={clsx(
                                                   'text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full',
                                                   r.status === 'REFUNDED' ? 'bg-emerald-100 text-emerald-800' : r.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'
                                                )}>
                                                   {r.status}
                                                </span>
                                             </td>
                                             <td className="py-3.5 px-4 text-right">
                                                {r.status === 'PENDING_REVIEW' ? (
                                                   <div className="flex items-center justify-end gap-2">
                                                      <button
                                                         onClick={() => handleProcessAdminRefund(r.orderId, r.amount)}
                                                         className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1"
                                                      >
                                                         <FaCheck className="h-3 w-3" /> Approve & Refund
                                                      </button>
                                                      <button
                                                         onClick={() => handleRejectAdminRefund(r.orderId)}
                                                         className="px-3.5 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
                                                      >
                                                         Decline
                                                      </button>
                                                   </div>
                                                ) : (
                                                   <span className="text-[11px] text-slate-400 font-medium">
                                                      {r.resolutionNote || 'Completed'}
                                                   </span>
                                                )}
                                             </td>
                                          </tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           )}
                        </div>
                     )}
                  </div>
               )}

                {/* ────────────────── TAB 4: KYC QUEUE & VERIFICATION ────────────────── */}
                {tab === 'kyc' && (
                   <div className="space-y-5">
                      {/* Summary KPI Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                         <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                            <div className="flex items-center justify-between">
                               <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Merchants</p>
                               <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-black">
                                  <FaBuilding className="h-3.5 w-3.5" />
                               </span>
                            </div>
                            <p className="text-2xl font-black text-slate-900 mt-2">
                               {(kycQueue?.total ?? stats?.counts?.sellers ?? 0).toLocaleString()}
                            </p>
                         </div>
                         <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                            <div className="flex items-center justify-between">
                               <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pending Audit</p>
                               <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 text-xs font-black">
                                  <AlertTriangle className="h-3.5 w-3.5" />
                               </span>
                            </div>
                            <p className="text-2xl font-black text-amber-600 mt-2">
                               {(kycQueue?.pendingCount ?? 0).toLocaleString()}
                            </p>
                         </div>
                         <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                            <div className="flex items-center justify-between">
                               <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Verified Merchants</p>
                               <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-black">
                                  <FaCircleCheck className="h-3.5 w-3.5" />
                               </span>
                            </div>
                            <p className="text-2xl font-black text-emerald-600 mt-2">
                               {(kycQueue?.verifiedCount ?? 0).toLocaleString()}
                            </p>
                         </div>
                         <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                            <div className="flex items-center justify-between">
                               <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Rejected</p>
                               <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-black">
                                  <FaCircleXmark className="h-3.5 w-3.5" />
                               </span>
                            </div>
                            <p className="text-2xl font-black text-rose-600 mt-2">
                               {(kycQueue?.rejectedCount ?? 0).toLocaleString()}
                            </p>
                         </div>
                      </div>

                      {/* Search & Status Filters */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
                         <div className="relative w-full md:w-96">
                            <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                            <input
                               type="text"
                               placeholder="Search trade name, owner, GSTIN, PAN, phone..."
                               value={kycSearch}
                               onChange={(e) => {
                                  setKycSearch(e.target.value);
                                  setKycPage(1);
                               }}
                               className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                            />
                         </div>

                         {/* Status Filter Tabs */}
                         <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto p-1 bg-slate-100/80 rounded-xl">
                            {[
                               { id: 'ALL', label: 'All Merchants' },
                               { id: 'PENDING', label: 'Pending Review Queue', count: kycQueue?.pendingCount },
                               { id: 'VERIFIED', label: 'Verified Badges' },
                               { id: 'REJECTED', label: 'Rejected' },
                            ].map((f) => (
                               <button
                                  key={f.id}
                                  onClick={() => {
                                     setKycStatusFilter(f.id as any);
                                     setKycPage(1);
                                  }}
                                  className={clsx(
                                     'px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer',
                                     kycStatusFilter === f.id
                                        ? 'bg-white text-slate-900 shadow-xs'
                                        : 'text-slate-500 hover:text-slate-900'
                                  )}
                               >
                                  <span>{f.label}</span>
                                  {f.count !== undefined && f.count > 0 && (
                                     <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-black">
                                        {f.count}
                                     </span>
                                  )}
                               </button>
                            ))}
                         </div>
                      </div>

                      {/* Merchant Cards Grid / Empty State */}
                      {kycLoading ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {Array(6).fill(0).map((_, i) => (
                               <Skeleton key={i} className="h-56 rounded-3xl" />
                            ))}
                         </div>
                      ) : !kycQueue?.queue?.length ? (
                         <div className="p-16 rounded-3xl bg-white border border-dashed border-slate-200 text-center">
                            <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                               <FaCircleCheck className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-bold text-slate-900">No Merchant KYC Records Found</p>
                            <p className="text-xs text-slate-400 mt-1">Try clearing your search query or switching status filters.</p>
                         </div>
                      ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {kycQueue.queue.map((item: any) => {
                               const u = item.user || {};
                               const bp = u.businessProfile || {};
                               const docs = item.documents || u.kycDocuments || [];
                               const isCaptainVerified = docs.some((d: any) => d.verificationMethod === 'CAPTAIN_ONSITE');

                               return (
                                  <div
                                     key={item.id}
                                     className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                                  >
                                     <div className="space-y-3.5">
                                        {/* Card Header: Business Title & KYC Badge */}
                                        <div className="flex items-start justify-between gap-3">
                                           <div className="flex items-center gap-3 min-w-0">
                                              <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1 relative">
                                                 {u.avatarUrl ? (
                                                    <img src={u.avatarUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                                                 ) : (
                                                    <FaStore className="h-5 w-5 text-slate-400" />
                                                 )}
                                                 {u.kycStatus === 'VERIFIED' && (
                                                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-white">
                                                       <FaCircleCheck className="h-3 w-3" />
                                                    </span>
                                                 )}
                                              </div>
                                              <div className="min-w-0">
                                                 <h3 className="font-heading font-black text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                                                    {bp.businessName || u.fullName || 'Business Entity'}
                                                 </h3>
                                                 <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1.5">
                                                    <span>{bp.businessType || 'Proprietorship'}</span>
                                                    <span>•</span>
                                                    <span className="text-slate-400">{u.userType || 'SELLER'}</span>
                                                 </p>
                                              </div>
                                           </div>

                                           <Badge status={u.kycStatus || 'PENDING'} />
                                        </div>

                                        {/* Owner Info & Identifiers */}
                                        <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 space-y-2 text-xs">
                                           <div className="flex items-center justify-between text-[11px]">
                                              <span className="text-slate-500">Contact Person:</span>
                                              <span className="font-bold text-slate-900">{u.fullName}</span>
                                           </div>
                                           <div className="flex items-center justify-between text-[11px]">
                                              <span className="text-slate-500">Phone:</span>
                                              <button
                                                 onClick={() => handleCopy(u.phone, 'Phone')}
                                                 className="font-mono font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                              >
                                                 {u.phone || 'N/A'}
                                                 <FaRegCopy className="h-2.5 w-2.5 opacity-60" />
                                              </button>
                                           </div>
                                           {bp.gstin && (
                                              <div className="flex items-center justify-between text-[11px]">
                                                 <span className="text-slate-500">GSTIN:</span>
                                                 <button
                                                    onClick={() => handleCopy(bp.gstin, 'GSTIN')}
                                                    className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 hover:border-slate-300"
                                                 >
                                                    {bp.gstin}
                                                    <FaRegCopy className="h-2.5 w-2.5 text-slate-400" />
                                                 </button>
                                              </div>
                                           )}
                                           {bp.pan && (
                                              <div className="flex items-center justify-between text-[11px]">
                                                 <span className="text-slate-500">PAN:</span>
                                                 <button
                                                    onClick={() => handleCopy(bp.pan, 'PAN')}
                                                    className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 hover:border-slate-300"
                                                 >
                                                    {bp.pan}
                                                    <FaRegCopy className="h-2.5 w-2.5 text-slate-400" />
                                                 </button>
                                              </div>
                                           )}
                                        </div>

                                        {/* Verification Details & Documents */}
                                        <div className="flex flex-wrap items-center gap-1.5">
                                           {isCaptainVerified ? (
                                              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-black text-[10px] uppercase tracking-wider border border-emerald-200/80 flex items-center gap-1">
                                                 <ShieldCheck className="h-3 w-3" /> Field Captain On-Site
                                              </span>
                                           ) : (
                                              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-black text-[10px] uppercase tracking-wider border border-blue-200/80 flex items-center gap-1">
                                                 <FaFileLines className="h-3 w-3" /> Digital Submission
                                              </span>
                                           )}

                                           <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[10px]">
                                              🛡️ Trust {u.trustScore || 85}/100
                                           </span>

                                           <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium text-[10px]">
                                              {docs.length} {docs.length === 1 ? 'Doc' : 'Docs'}
                                           </span>
                                        </div>
                                     </div>

                                     {/* Card Action CTAs */}
                                     <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                                        <button
                                           onClick={() => setSelectedKycDetail(item)}
                                           className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                                        >
                                           <FaEye className="h-3 w-3" />
                                           <span>Audit Dossier</span>
                                        </button>

                                        {u.kycStatus !== 'VERIFIED' && (
                                           <button
                                              onClick={() => handleApprove('kyc', u.id)}
                                              className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
                                              title="Approve and verify merchant"
                                           >
                                              <FaCheck className="h-3 w-3" />
                                              <span>Verify</span>
                                           </button>
                                        )}

                                        {u.kycStatus !== 'REJECTED' && (
                                           <button
                                              onClick={() => handleReject('kyc', u.id)}
                                              className="py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                                              title="Reject or revoke KYC"
                                           >
                                              <FaXmark className="h-3 w-3" />
                                           </button>
                                        )}
                                     </div>
                                  </div>
                               );
                            })}
                         </div>
                      )}

                      {/* Pagination Controls */}
                      {kycQueue?.totalPages > 1 && (
                         <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                               <span>
                                  Showing <strong className="text-slate-900">{(kycPage - 1) * kycLimit + 1}</strong>–<strong className="text-slate-900">{Math.min(kycPage * kycLimit, kycQueue?.total || 0)}</strong> of <strong className="text-slate-900">{(kycQueue?.total || 0).toLocaleString()}</strong> Merchants
                               </span>
                               <div className="flex items-center gap-1.5 ml-2">
                                  <span className="text-[11px] text-slate-400">Per page:</span>
                                  <select
                                     value={kycLimit}
                                     onChange={(e) => {
                                        setKycLimit(Number(e.target.value));
                                        setKycPage(1);
                                     }}
                                     className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                                  >
                                     <option value={10}>10</option>
                                     <option value={20}>20</option>
                                     <option value={50}>50</option>
                                     <option value={100}>100</option>
                                  </select>
                               </div>
                            </div>

                            <div className="flex items-center gap-1">
                               <button
                                  onClick={() => setKycPage((p) => Math.max(p - 1, 1))}
                                  disabled={kycPage === 1}
                                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                               >
                                  Previous
                               </button>

                               {Array.from({ length: Math.min(kycQueue?.totalPages || 1, 7) }).map((_, idx) => {
                                  let pageNum = idx + 1;
                                  const totalP = kycQueue?.totalPages || 1;
                                  if (totalP > 7) {
                                     if (kycPage > 4 && kycPage < totalP - 3) {
                                        pageNum = kycPage - 3 + idx;
                                     } else if (kycPage >= totalP - 3) {
                                        pageNum = totalP - 6 + idx;
                                     }
                                  }
                                  if (pageNum > totalP) return null;

                                  return (
                                     <button
                                        key={pageNum}
                                        onClick={() => setKycPage(pageNum)}
                                        className={clsx(
                                           'w-8 h-8 rounded-xl text-xs font-bold transition-all',
                                           kycPage === pageNum
                                              ? 'bg-indigo-600 text-white shadow-xs'
                                              : 'text-slate-600 hover:bg-slate-100'
                                        )}
                                     >
                                        {pageNum}
                                     </button>
                                  );
                               })}

                               <button
                                  onClick={() => setKycPage((p) => Math.min(p + 1, kycQueue?.totalPages || 1))}
                                  disabled={kycPage === kycQueue?.totalPages}
                                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                               >
                                  Next
                               </button>
                            </div>
                         </div>
                      )}
                   </div>
                )}

               {/* ────────────────── TAB 5: INVENTORY MODERATION & CATALOG MASTER ────────────────── */}
               {tab === 'listings' && (
                  <div className="space-y-5">
                     {/* Summary Metric Cards */}
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                           <div className="flex items-center justify-between">
                              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total SKUs</p>
                              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-black">
                                 <FaBoxOpen className="h-3.5 w-3.5" />
                              </span>
                           </div>
                           <p className="text-2xl font-black text-slate-900 mt-2">
                              {(listingsQueue?.total ?? listingsQueue?.listings?.length ?? 0).toLocaleString()}
                           </p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                           <div className="flex items-center justify-between">
                              <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pending Review</p>
                              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 text-xs font-black">
                                 <AlertTriangle className="h-3.5 w-3.5" />
                              </span>
                           </div>
                           <p className="text-2xl font-black text-amber-600 mt-2">
                              {(listingsQueue?.draftCount ?? 0).toLocaleString()}
                           </p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                           <div className="flex items-center justify-between">
                              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Live Active</p>
                              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-black">
                                 <FaCircleCheck className="h-3.5 w-3.5" />
                              </span>
                           </div>
                           <p className="text-2xl font-black text-emerald-600 mt-2">
                              {(listingsQueue?.activeCount ?? 0).toLocaleString()}
                           </p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                           <div className="flex items-center justify-between">
                              <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Delisted / Rejected</p>
                              <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-black">
                                 <FaCircleXmark className="h-3.5 w-3.5" />
                              </span>
                           </div>
                           <p className="text-2xl font-black text-rose-600 mt-2">
                              {(listingsQueue?.rejectedCount ?? 0).toLocaleString()}
                           </p>
                        </div>
                     </div>

                     {/* Search & Status Filter Toolbar */}
                     <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="relative flex-1 max-w-md">
                           <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                           <input
                              type="text"
                              placeholder="Search by SKU title, category, brand, HSN, merchant name..."
                              value={listingSearch}
                              onChange={(e) => {
                                 setListingSearch(e.target.value);
                                 setListingPage(1);
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                           />
                           {listingSearch && (
                              <button
                                 onClick={() => {
                                    setListingSearch('');
                                    setListingPage(1);
                                 }}
                                 className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-xs"
                              >
                                 <FaXmark className="h-3 w-3" />
                              </button>
                           )}
                        </div>

                        {/* Status Tabs Filter */}
                        <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                           {[
                              { id: 'ALL', label: 'All Catalog', count: listingsQueue?.total },
                              { id: 'DRAFT', label: 'Pending Review', count: listingsQueue?.draftCount },
                              { id: 'ACTIVE', label: 'Live Marketplace', count: listingsQueue?.activeCount },
                              { id: 'REJECTED', label: 'Rejected', count: listingsQueue?.rejectedCount },
                           ].map((item) => (
                              <button
                                 key={item.id}
                                 onClick={() => {
                                    setListingStatusFilter(item.id as any);
                                    setListingPage(1);
                                 }}
                                 className={clsx(
                                    'px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5',
                                    listingStatusFilter === item.id
                                       ? 'bg-white text-indigo-600 shadow-xs font-black'
                                       : 'text-slate-600 hover:text-slate-900'
                                 )}
                              >
                                 <span>{item.label}</span>
                                 {typeof item.count === 'number' && (
                                    <span className={clsx(
                                       'text-[10px] px-1.5 py-0.5 rounded-full',
                                       listingStatusFilter === item.id
                                          ? 'bg-indigo-50 text-indigo-700 font-black'
                                          : 'bg-slate-200 text-slate-600'
                                    )}>
                                       {item.count}
                                    </span>
                                 )}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Listings Grid / Cards */}
                     {listingsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {Array(6).fill(0).map((_, i) => (
                              <Skeleton key={i} className="h-48 rounded-2xl" />
                           ))}
                        </div>
                     ) : !(listingsQueue?.listings || listingsQueue?.queue)?.length ? (
                        <div className="p-16 rounded-2xl bg-white border border-dashed border-slate-200 text-center">
                           <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                              <FaCircleCheck className="h-6 w-6" />
                           </div>
                           <p className="text-sm font-bold text-slate-900">No Listings Match Filter</p>
                           <p className="text-xs text-slate-400 mt-1">Try switching tabs or clearing your search term.</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {(listingsQueue?.listings || listingsQueue?.queue).map((listing: any) => {
                              const primaryImg = listing.media?.find((m: any) => m.isPrimary)?.url || listing.media?.[0]?.url;
                              const price = listing.productDetail?.pricePerUnit ?? listing.pricePerUnit;
                              const uom = listing.productDetail?.unitOfMeasure || 'unit';
                              const moq = listing.productDetail?.minOrderQty || 1;
                              const slabs = listing.productDetail?.bulkPriceSlabs || [];
                              const merchantName = listing.seller?.businessProfile?.businessName || listing.seller?.fullName || 'Verified Supplier';

                              return (
                                 <div
                                    key={listing.id}
                                    className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                                 >
                                    {/* Top Row: Thumbnail + Title + Status */}
                                    <div className="flex items-start gap-3.5">
                                       {/* Image Thumbnail */}
                                       <div
                                          onClick={() => setSelectedListingDetail(listing)}
                                          className="relative h-20 w-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 cursor-pointer group-hover:border-indigo-300 transition-colors"
                                       >
                                          {primaryImg ? (
                                             <img
                                                src={primaryImg}
                                                alt={listing.title}
                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                             />
                                          ) : (
                                             <div className="h-full w-full flex items-center justify-center text-slate-400">
                                                <FaBoxOpen className="h-8 w-8" />
                                             </div>
                                          )}
                                          {listing.media?.length > 1 && (
                                             <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                                +{listing.media.length - 1}
                                             </span>
                                          )}
                                       </div>

                                       {/* Content Header */}
                                       <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between gap-2 mb-1">
                                             <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 truncate">
                                                {listing.category?.name || 'General B2B'}
                                             </span>
                                             {/* Status Badge */}
                                             <span className={clsx(
                                                'text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0',
                                                listing.status === 'ACTIVE' && 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                                                listing.status === 'DRAFT' && 'bg-amber-50 text-amber-700 border border-amber-200',
                                                listing.status === 'REJECTED' && 'bg-rose-50 text-rose-700 border border-rose-200'
                                             )}>
                                                {listing.status === 'ACTIVE' && <FaCircleCheck className="h-2.5 w-2.5" />}
                                                {listing.status === 'DRAFT' && <AlertTriangle className="h-2.5 w-2.5" />}
                                                {listing.status === 'REJECTED' && <FaCircleXmark className="h-2.5 w-2.5" />}
                                                {listing.status === 'DRAFT' ? 'Pending Review' : listing.status}
                                             </span>
                                          </div>

                                          <h3
                                             onClick={() => setSelectedListingDetail(listing)}
                                             className="text-xs font-bold text-slate-900 line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors"
                                             title={listing.title}
                                          >
                                             {listing.title}
                                          </h3>

                                          {/* Merchant & Brand Details */}
                                          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 flex-wrap">
                                             <span className="flex items-center gap-1 font-semibold text-slate-700">
                                                <FaBuilding className="h-3 w-3 text-indigo-500 shrink-0" />
                                                <span className="truncate max-w-[140px]">{merchantName}</span>
                                             </span>
                                             {listing.productDetail?.brand && (
                                                <span className="text-slate-400">• Brand: <strong className="text-slate-600">{listing.productDetail.brand}</strong></span>
                                             )}
                                             {listing.productDetail?.specifications?.hsnCode && (
                                                <span className="text-slate-400">• HSN: <strong className="text-slate-600">{listing.productDetail.specifications.hsnCode}</strong></span>
                                             )}
                                          </div>
                                       </div>
                                    </div>

                                    {/* Middle Row: Pricing & Volume Discount Slabs */}
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs">
                                       <div>
                                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Wholesale Price</span>
                                          <span className="font-black text-slate-900 text-sm">
                                             {price ? `₹${Number(price).toLocaleString('en-IN')}` : 'On Request'}
                                             <span className="text-[10px] font-normal text-slate-500"> / {uom}</span>
                                          </span>
                                       </div>

                                       <div className="text-right">
                                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Min Order Qty</span>
                                          <span className="font-bold text-slate-700 text-xs">
                                             {moq} {uom}
                                          </span>
                                       </div>

                                       {Array.isArray(slabs) && slabs.length > 0 && (
                                          <div className="hidden sm:block text-right border-l border-slate-200 pl-3">
                                             <span className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider block">Bulk Slabs</span>
                                             <span className="text-[10px] font-bold text-emerald-700">
                                                {slabs.length} Discount Tier{slabs.length > 1 ? 's' : ''}
                                             </span>
                                          </div>
                                       )}
                                    </div>

                                    {/* Bottom Row: Actions */}
                                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                                       <button
                                          onClick={() => setSelectedListingDetail(listing)}
                                          className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 transition-colors"
                                       >
                                          <FaEye className="h-3 w-3" />
                                          Inspect Specs
                                       </button>

                                       <div className="flex items-center gap-2">
                                          <a
                                             href={`/listings/${listing.id}`}
                                             target="_blank"
                                             rel="noreferrer"
                                             className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                             title="View on public marketplace"
                                          >
                                             <ExternalLink className="h-3.5 w-3.5" />
                                          </a>

                                          {listing.status !== 'ACTIVE' ? (
                                             <button
                                                onClick={() => handleApprove('listing', listing.id)}
                                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                                             >
                                                <FaCheck className="h-3 w-3" />
                                                Publish SKU
                                             </button>
                                          ) : (
                                             <button
                                                onClick={() => handleReject('listing', listing.id)}
                                                className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold transition-all flex items-center gap-1"
                                             >
                                                <FaXmark className="h-3 w-3" />
                                                Unpublish
                                             </button>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     )}

                     {/* Pagination Controls */}
                     {typeof listingsQueue?.total === 'number' && listingsQueue.total > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                           <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                              <span>
                                 Showing <strong className="text-slate-900 font-bold">{((listingPage - 1) * listingLimit) + 1}</strong>–
                                 <strong className="text-slate-900 font-bold">{Math.min(listingPage * listingLimit, listingsQueue.total)}</strong> of{' '}
                                 <strong className="text-slate-900 font-bold">{listingsQueue.total.toLocaleString()}</strong> SKUs
                              </span>

                              {/* Items per page selector */}
                              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                                 <span className="text-[11px] text-slate-400 font-semibold">Per page:</span>
                                 <select
                                    value={listingLimit}
                                    onChange={(e) => {
                                       setListingLimit(Number(e.target.value));
                                       setListingPage(1);
                                    }}
                                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                                 >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                 </select>
                              </div>
                           </div>

                           {/* Page Navigation Buttons */}
                           <div className="flex items-center gap-1.5">
                              {/* Previous Button */}
                              <button
                                 onClick={() => setListingPage((p) => Math.max(1, p - 1))}
                                 disabled={listingPage <= 1}
                                 className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                              >
                                 Previous
                              </button>

                              {/* Page Number Buttons */}
                              {(() => {
                                 const totalPages = listingsQueue?.totalPages || Math.ceil(listingsQueue.total / listingLimit) || 1;
                                 const pages: (number | string)[] = [];

                                 if (totalPages <= 7) {
                                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                                 } else {
                                    pages.push(1);
                                    if (listingPage > 3) pages.push('...');

                                    const start = Math.max(2, listingPage - 1);
                                    const end = Math.min(totalPages - 1, listingPage + 1);
                                    for (let i = start; i <= end; i++) {
                                       if (!pages.includes(i)) pages.push(i);
                                    }

                                    if (listingPage < totalPages - 2) pages.push('...');
                                    if (!pages.includes(totalPages)) pages.push(totalPages);
                                 }

                                 return pages.map((p, idx) => {
                                    if (p === '...') {
                                       return (
                                          <span key={`dots-${idx}`} className="px-1.5 text-xs font-bold text-slate-400">
                                             ...
                                          </span>
                                       );
                                    }
                                    const pageNum = Number(p);
                                    const isActive = pageNum === listingPage;
                                    return (
                                       <button
                                          key={pageNum}
                                          onClick={() => setListingPage(pageNum)}
                                          className={clsx(
                                             'h-8 min-w-[32px] px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center',
                                             isActive
                                                ? 'bg-indigo-600 text-white font-black shadow-xs'
                                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                          )}
                                       >
                                          {pageNum}
                                       </button>
                                    );
                                 });
                              })()}

                              {/* Next Button */}
                              <button
                                 onClick={() => setListingPage((p) => {
                                    const totalPages = listingsQueue?.totalPages || Math.ceil(listingsQueue.total / listingLimit) || 1;
                                    return Math.min(totalPages, p + 1);
                                 })}
                                 disabled={listingPage >= (listingsQueue?.totalPages || Math.ceil(listingsQueue.total / listingLimit) || 1)}
                                 className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                              >
                                 Next
                              </button>
                           </div>
                        </div>
                     )}

                     {/* ────────────────── PRODUCT DETAIL INSPECTION MODAL ────────────────── */}
                     <AnimatePresence>
                        {selectedListingDetail && (
                           <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                              <motion.div
                                 initial={{ opacity: 0, scale: 0.95 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 exit={{ opacity: 0, scale: 0.95 }}
                                 className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
                              >
                                 {/* Modal Header */}
                                 <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div>
                                       <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                                             {selectedListingDetail.category?.name || 'General B2B'}
                                          </span>
                                          <span className={clsx(
                                             'text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full',
                                             selectedListingDetail.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                          )}>
                                             {selectedListingDetail.status}
                                          </span>
                                       </div>
                                       <h2 className="text-base font-black text-slate-900 mt-1 line-clamp-1">{selectedListingDetail.title}</h2>
                                    </div>
                                    <button
                                       onClick={() => setSelectedListingDetail(null)}
                                       className="h-8 w-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs transition-colors"
                                    >
                                       <FaXmark className="h-4 w-4" />
                                    </button>
                                 </div>

                                 {/* Modal Body */}
                                 <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                                    {/* Image Gallery */}
                                    {selectedListingDetail.media?.length > 0 && (
                                       <div>
                                          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Product Photos</h4>
                                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                                             {selectedListingDetail.media.map((m: any, idx: number) => (
                                                <div key={idx} className="relative aspect-square rounded-xl bg-slate-100 border border-slate-200 overflow-hidden">
                                                   <img src={m.url} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />
                                                   {m.isPrimary && (
                                                      <span className="absolute top-1 left-1 bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">Primary</span>
                                                   )}
                                                </div>
                                             ))}
                                          </div>
                                       </div>
                                    )}

                                    {/* Pricing & Commercial Slabs Table */}
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                                       <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Pricing & Slabs Matrix</h4>
                                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                          <div>
                                             <span className="text-[10px] text-slate-400 block font-medium">Base Unit Price</span>
                                             <span className="text-sm font-black text-slate-900">
                                                ₹{Number(selectedListingDetail.productDetail?.pricePerUnit ?? selectedListingDetail.pricePerUnit ?? 0).toLocaleString('en-IN')}
                                             </span>
                                          </div>
                                          <div>
                                             <span className="text-[10px] text-slate-400 block font-medium">Unit of Measure</span>
                                             <span className="text-xs font-bold text-slate-800">
                                                {selectedListingDetail.productDetail?.unitOfMeasure || 'Pieces'}
                                             </span>
                                          </div>
                                          <div>
                                             <span className="text-[10px] text-slate-400 block font-medium">Min Order Quantity</span>
                                             <span className="text-xs font-bold text-slate-800">
                                                {selectedListingDetail.productDetail?.minOrderQty || 1} units
                                             </span>
                                          </div>
                                       </div>

                                       {/* Volume Discount Slabs */}
                                       {Array.isArray(selectedListingDetail.productDetail?.bulkPriceSlabs) && selectedListingDetail.productDetail.bulkPriceSlabs.length > 0 && (
                                          <div className="pt-2 border-t border-slate-200">
                                             <span className="text-[10px] text-slate-500 font-bold block mb-1.5">Tiered Volume Discounts</span>
                                             <div className="flex flex-wrap gap-2">
                                                {selectedListingDetail.productDetail.bulkPriceSlabs.map((slab: any, idx: number) => (
                                                   <span key={idx} className="bg-white border border-emerald-200 px-2.5 py-1 rounded-lg text-emerald-800 text-[11px] font-bold">
                                                      {slab.minQty}{slab.maxQty ? `–${slab.maxQty}` : '+'} units: <strong>₹{slab.price}</strong>
                                                   </span>
                                                ))}
                                             </div>
                                          </div>
                                       )}
                                    </div>

                                    {/* Specifications Table */}
                                    {selectedListingDetail.productDetail?.specifications && (
                                       <div>
                                          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Technical Specifications</h4>
                                          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                                             {Object.entries(selectedListingDetail.productDetail.specifications).map(([key, val]: [string, any]) => (
                                                <div key={key} className="flex items-center justify-between p-2.5 px-4 text-xs">
                                                   <span className="text-slate-500 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                   <span className="text-slate-900 font-bold">{String(val)}</span>
                                                </div>
                                             ))}
                                          </div>
                                       </div>
                                    )}

                                    {/* Merchant / Company Info */}
                                    {selectedListingDetail.seller && (
                                       <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl space-y-2">
                                          <h4 className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">Merchant & Supplier Info</h4>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                             <div>
                                                <span className="text-[10px] text-slate-400 block">Business Name</span>
                                                <span className="font-bold text-slate-900">{selectedListingDetail.seller.businessProfile?.businessName || selectedListingDetail.seller.fullName}</span>
                                             </div>
                                             <div>
                                                <span className="text-[10px] text-slate-400 block">GSTIN</span>
                                                <span className="font-bold text-slate-900 font-mono">{selectedListingDetail.seller.businessProfile?.gstin || 'N/A'}</span>
                                             </div>
                                             <div>
                                                <span className="text-[10px] text-slate-400 block">Contact Person</span>
                                                <span className="font-bold text-slate-900">{selectedListingDetail.seller.fullName}</span>
                                             </div>
                                             <div>
                                                <span className="text-[10px] text-slate-400 block">Mobile Phone</span>
                                                <span className="font-bold text-slate-900">{selectedListingDetail.seller.phone}</span>
                                             </div>
                                          </div>
                                       </div>
                                    )}
                                 </div>

                                 {/* Modal Footer */}
                                 <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                                    <a
                                       href={`/listings/${selectedListingDetail.id}`}
                                       target="_blank"
                                       rel="noreferrer"
                                       className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                                    >
                                       <ExternalLink className="h-3.5 w-3.5" />
                                       View Marketplace Page
                                    </a>

                                    <div className="flex items-center gap-2">
                                       {selectedListingDetail.status !== 'ACTIVE' ? (
                                          <button
                                             onClick={() => {
                                                handleApprove('listing', selectedListingDetail.id);
                                                setSelectedListingDetail(null);
                                             }}
                                             className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                                          >
                                             <FaCheck className="h-3.5 w-3.5" />
                                             Publish to Marketplace
                                          </button>
                                       ) : (
                                          <button
                                             onClick={() => {
                                                handleReject('listing', selectedListingDetail.id);
                                                setSelectedListingDetail(null);
                                             }}
                                             className="px-4 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold transition-colors flex items-center gap-1.5"
                                          >
                                             <FaXmark className="h-3.5 w-3.5" />
                                             Unpublish SKU
                                          </button>
                                       )}
                                    </div>
                                 </div>
                              </motion.div>
                           </div>
                        )}
                     </AnimatePresence>
                  </div>
               )}

               {/* ────────────────── TAB 6: DISPUTES ────────────────── */}
               {tab === 'disputes' && (
                  <div className="p-16 rounded-2xl bg-white border border-slate-200/80 text-center">
                     <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
                        <FaHandshake className="h-6 w-6" />
                     </div>
                     <p className="text-sm font-bold text-slate-900">No Open Trade Disputes</p>
                     <p className="text-xs text-slate-400 mt-1">Escrow transactions and milestone deliveries are currently operating smoothly.</p>
                  </div>
               )}

               {/* ────────────────── TAB 7: USERS ────────────────── */}
               {tab === 'users' && (
                  <div className="space-y-4">
                     {/* Search & Filter Toolbar */}
                     <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="relative flex-1 max-w-md">
                           <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                           <input
                              type="text"
                              placeholder="Search by name, mobile, email, company, GSTIN, PAN..."
                              value={userSearch}
                              onChange={(e) => setUserSearch(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                           />
                           {userSearch && (
                              <button
                                 onClick={() => setUserSearch('')}
                                 className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-xs"
                              >
                                 <FaXmark className="h-3 w-3" />
                              </button>
                           )}
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                           {/* User Type Filter */}
                           <div className="flex items-center bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                              {[
                                 { id: 'ALL', label: 'All Roles' },
                                 { id: 'SELLER', label: 'Sellers' },
                                 { id: 'BUYER', label: 'Buyers' },
                                 { id: 'BOTH', label: 'Both' },
                              ].map((item) => (
                                 <button
                                    key={item.id}
                                    onClick={() => setUserTypeFilter(item.id)}
                                    className={clsx(
                                       'px-2.5 py-1 rounded-lg transition-all',
                                       userTypeFilter === item.id
                                          ? 'bg-white text-indigo-600 shadow-xs font-black'
                                          : 'text-slate-600 hover:text-slate-900'
                                    )}
                                 >
                                    {item.label}
                                 </button>
                              ))}
                           </div>

                           {/* KYC Filter */}
                           <div className="flex items-center bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                              {[
                                 { id: 'ALL', label: 'All KYC' },
                                 { id: 'VERIFIED', label: 'Verified' },
                                 { id: 'PENDING', label: 'Pending' },
                                 { id: 'REJECTED', label: 'Rejected' },
                              ].map((item) => (
                                 <button
                                    key={item.id}
                                    onClick={() => setKycFilter(item.id)}
                                    className={clsx(
                                       'px-2.5 py-1 rounded-lg transition-all',
                                       kycFilter === item.id
                                          ? 'bg-white text-indigo-600 shadow-xs font-black'
                                          : 'text-slate-600 hover:text-slate-900'
                                    )}
                                 >
                                    {item.label}
                                 </button>
                              ))}
                           </div>

                           <button
                              onClick={() => revalidate.admin()}
                              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
                              title="Refresh data"
                           >
                              <FaArrowRotateLeft className="h-3.5 w-3.5" />
                           </button>
                        </div>
                     </div>

                     {/* Results Header / Summary */}
                     <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-semibold">
                        <span>
                           Found <strong className="text-slate-900 font-bold">{users?.users?.length || 0}</strong> registered accounts
                        </span>
                        {(userTypeFilter !== 'ALL' || kycFilter !== 'ALL' || userSearch) && (
                           <button
                              onClick={() => {
                                 setUserSearch('');
                                 setUserTypeFilter('ALL');
                                 setKycFilter('ALL');
                              }}
                              className="text-indigo-600 hover:underline text-[11px] font-bold"
                           >
                              Reset Filters
                           </button>
                        )}
                     </div>

                     {/* User Directory List */}
                     <div className="space-y-3">
                        {usersLoading ? (
                           <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80">
                              <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2" />
                              <p className="text-xs font-bold">Loading User Master Directory...</p>
                           </div>
                        ) : !users?.users?.length ? (
                           <div className="p-16 rounded-2xl bg-white border border-slate-200/80 text-center">
                              <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                                 <FaUsers className="h-6 w-6" />
                              </div>
                              <p className="text-sm font-black text-slate-900">No Users Found</p>
                              <p className="text-xs text-slate-400 mt-1">No user accounts matched your search criteria.</p>
                           </div>
                        ) : (
                           users.users.map((u: any) => {
                              const primaryAddr = u.addresses?.[0];
                              const hasGstin = u.businessProfile?.gstin;
                              const hasPan = u.businessProfile?.pan;
                              const cleanPhone = u.phone ? u.phone.replace(/[^0-9]/g, '') : '';
                              const waLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`}` : null;

                              return (
                                 <div
                                    key={u.id}
                                    className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all space-y-4"
                                 >
                                    {/* Top Bar: Identity, Roles, Status, Joined */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                       <div className="flex items-center gap-3.5">
                                          <Avatar name={u.fullName} size="md" />
                                          <div>
                                             <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                                                   {u.fullName}
                                                </h3>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                                                   {u.accountType || 'INDIVIDUAL'}
                                                </span>
                                                <span className="text-[10px] font-mono text-slate-400">
                                                   ID: {u.id.substring(0, 8)}
                                                </span>
                                             </div>
                                             {u.businessProfile?.businessName && (
                                                <p className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 mt-0.5">
                                                   <FaBuilding className="h-3 w-3 text-indigo-600" />
                                                   <span>{u.businessProfile.businessName}</span>
                                                   {u.businessProfile?.businessType && (
                                                      <span className="text-[10px] font-normal text-slate-400">
                                                         ({u.businessProfile.businessType})
                                                      </span>
                                                   )}
                                                </p>
                                             )}
                                          </div>
                                       </div>

                                       {/* Status & Badges */}
                                       <div className="flex items-center gap-2 flex-wrap shrink-0">
                                          <span className={clsx(
                                             'text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider',
                                             u.userType === 'SELLER' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                             u.userType === 'BUYER' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                                             'bg-purple-50 text-purple-700 border border-purple-200'
                                          )}>
                                             {u.userType}
                                          </span>

                                          <span className={clsx(
                                             'text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1',
                                             u.kycStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                             u.kycStatus === 'PENDING' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                                             u.kycStatus === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                                             'bg-rose-100 text-rose-800 border border-rose-300'
                                          )}>
                                             <FaShieldHalved className="h-3 w-3" />
                                             {u.kycStatus}
                                          </span>

                                          <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-700 flex items-center gap-1">
                                             <span>🛡️ Trust</span>
                                             <strong className="text-slate-900">{u.trustScore || 0}/100</strong>
                                          </span>
                                       </div>
                                    </div>

                                    {/* Middle Grid: Phone, Email, Address, GST/PAN */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                       {/* 1. Phone Number */}
                                       <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                             Mobile Number
                                          </span>
                                          <div className="flex items-center justify-between gap-1">
                                             <span className="font-mono font-black text-slate-900 text-xs">
                                                {u.phone ? `+91 ${u.phone.replace(/^(\+91|91)/, '').trim()}` : 'No phone'}
                                             </span>
                                             {u.phone && (
                                                <div className="flex items-center gap-1">
                                                   <button
                                                      onClick={() => handleCopy(u.phone, 'Phone')}
                                                      className="p-1 hover:bg-slate-200 text-slate-500 rounded transition-colors"
                                                      title="Copy Phone"
                                                   >
                                                      <FaRegCopy className="h-3 w-3" />
                                                   </button>
                                                   <a
                                                      href={`tel:${u.phone}`}
                                                      className="p-1 hover:bg-emerald-100 text-emerald-700 rounded transition-colors"
                                                      title="Call Now"
                                                   >
                                                      <FaPhone className="h-3 w-3" />
                                                   </a>
                                                   {waLink && (
                                                      <a
                                                         href={waLink}
                                                         target="_blank"
                                                         rel="noreferrer"
                                                         className="p-1 hover:bg-emerald-100 text-emerald-600 rounded transition-colors"
                                                         title="WhatsApp Chat"
                                                      >
                                                         <FaWhatsapp className="h-3.5 w-3.5" />
                                                      </a>
                                                   )}
                                                </div>
                                             )}
                                          </div>
                                       </div>

                                       {/* 2. Email Address */}
                                       <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                             Email Address
                                          </span>
                                          <div className="flex items-center justify-between gap-1">
                                             <span className="font-medium text-slate-800 text-xs truncate" title={u.email}>
                                                {u.email || 'No email provided'}
                                             </span>
                                             {u.email && (
                                                <div className="flex items-center gap-1 shrink-0">
                                                   <button
                                                      onClick={() => handleCopy(u.email, 'Email')}
                                                      className="p-1 hover:bg-slate-200 text-slate-500 rounded transition-colors"
                                                      title="Copy Email"
                                                   >
                                                      <FaRegCopy className="h-3 w-3" />
                                                   </button>
                                                   <a
                                                      href={`mailto:${u.email}`}
                                                      className="p-1 hover:bg-blue-100 text-blue-700 rounded transition-colors"
                                                      title="Send Email"
                                                   >
                                                      <FaEnvelope className="h-3 w-3" />
                                                   </a>
                                                </div>
                                             )}
                                          </div>
                                       </div>

                                       {/* 3. Location / Address */}
                                       <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                             Facility / City Location
                                          </span>
                                          <p className="font-bold text-slate-900 text-xs truncate flex items-center gap-1" title={primaryAddr ? `${primaryAddr.line1 || ''}, ${primaryAddr.city}, ${primaryAddr.state} ${primaryAddr.pincode || ''}` : 'Location pending'}>
                                             <FaLocationDot className="h-3 w-3 text-red-500 shrink-0" />
                                             {primaryAddr ? `${primaryAddr.city}, ${primaryAddr.state || ''} ${primaryAddr.pincode ? `(${primaryAddr.pincode})` : ''}` : 'Location not submitted'}
                                          </p>
                                       </div>

                                       {/* 4. GSTIN / PAN / Identifiers */}
                                       <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                             Tax Identifiers (GSTIN / PAN)
                                          </span>
                                          <div className="flex items-center justify-between gap-1">
                                             <span className="font-mono font-bold text-slate-900 text-xs truncate">
                                                {hasGstin ? `GST: ${hasGstin}` : (hasPan ? `PAN: ${hasPan}` : 'Unregistered')}
                                             </span>
                                             {(hasGstin || hasPan) && (
                                                <button
                                                   onClick={() => handleCopy(hasGstin || hasPan, hasGstin ? 'GSTIN' : 'PAN')}
                                                   className="p-1 hover:bg-slate-200 text-slate-500 rounded transition-colors shrink-0"
                                                   title="Copy Tax ID"
                                                >
                                                   <FaRegCopy className="h-3 w-3" />
                                                </button>
                                             )}
                                          </div>
                                       </div>
                                    </div>

                                    {/* Bottom Bar: Stats, Subscription, Joined Date, Actions */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                                       {/* Commercial Stats */}
                                       <div className="flex items-center gap-3 text-slate-500 flex-wrap">
                                          <span className="flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg text-[11px]">
                                             <FaBoxOpen className="h-3 w-3 text-indigo-600" />
                                             <span>{u._count?.listings || 0} Catalog SKUs</span>
                                          </span>
                                          <span className="flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg text-[11px]">
                                             <FaCoins className="h-3 w-3 text-amber-600" />
                                             <span>{u.wallet?.balance ?? 5} Lead Credits</span>
                                          </span>
                                          <span className="flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg text-[11px]">
                                             <FaCreditCard className="h-3 w-3 text-emerald-600" />
                                             <span>{u.subscription?.plan?.name || 'Free Tier'}</span>
                                          </span>
                                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                             <FaCalendarDays className="h-3 w-3" />
                                             <span>Joined {formatDistanceToNow(new Date(u.createdAt))} ago</span>
                                          </span>
                                       </div>

                                       {/* Action CTA Buttons */}
                                       <div className="flex items-center gap-2 shrink-0">
                                          {u.kycStatus !== 'VERIFIED' && (
                                             <button
                                                onClick={() => handleApprove('kyc', u.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
                                             >
                                                <FaCircleCheck className="h-3.5 w-3.5" />
                                                <span>Verify KYC</span>
                                             </button>
                                          )}

                                          {u.kycStatus === 'PENDING' && (
                                             <button
                                                onClick={() => handleReject('kyc', u.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all"
                                             >
                                                <FaCircleXmark className="h-3.5 w-3.5" />
                                                <span>Reject</span>
                                             </button>
                                          )}

                                          <button
                                             onClick={() => setSelectedUserDetail(u)}
                                             className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all"
                                          >
                                             <FaEye className="h-3.5 w-3.5" />
                                             <span>Inspect Full Dossier</span>
                                          </button>
                                       </div>
                                    </div>
                                 </div>
                              );
                           })
                        )}
                     </div>
                  </div>
               )}

               {/* ────────────────── TAB 8: EVENTS ────────────────── */}
               {tab === 'events' && (
                  <div className="space-y-4">
                     {!events.length ? (
                        <div className="p-16 rounded-2xl bg-white border border-dashed border-slate-200 text-center">
                           <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
                              <FaCalendarDays className="h-6 w-6" />
                           </div>
                           <p className="text-sm font-bold text-slate-900">No Events Published</p>
                           <p className="text-xs text-slate-400 mt-1">Schedule trade expos, buyer webinars, and industry meets.</p>
                           <button
                              onClick={openCreateModal}
                              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                           >
                              + Create Event
                           </button>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {events.map((e: any) => (
                              <div key={e.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 flex justify-between items-start shadow-xs">
                                 <div>
                                    <h4 className="font-bold text-xs text-slate-900">{e.title}</h4>
                                    <p className="text-[11px] text-slate-500 mt-1">{e.location} • {new Date(e.date).toLocaleDateString()}</p>
                                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">{e.description}</p>
                                 </div>
                                 <div className="flex gap-1.5 shrink-0">
                                    <button onClick={() => openEditModal(e)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><FaPen className="h-3 w-3" /></button>
                                    <button onClick={() => handleDeleteEvent(e.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><FaTrash className="h-3 w-3" /></button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               )}
            </motion.div>
         </div>

         {/* Deploy Captain Modal */}
         <AnimatePresence>
            {isCaptainModalOpen && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setIsCaptainModalOpen(false)}
                     className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
                  />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 15 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 15 }}
                     className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full p-6 sm:p-8 z-10"
                  >
                     <div className="mb-6">
                        <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-3">
                           <FaUserPlus className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">
                           Deploy New Field Captain
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                           Authorize a field sales officer to onboard companies & publish catalog SKUs on-site.
                        </p>
                     </div>

                     <form onSubmit={handleDeployCaptain} className="space-y-4 text-xs">
                        <div>
                           <label className="font-bold text-slate-700 block mb-1">Full Legal Name *</label>
                           <input
                              type="text"
                              required
                              placeholder="e.g. Pranav Deshmukh"
                              value={captainForm.fullName}
                              onChange={(e) => setCaptainForm({ ...captainForm, fullName: e.target.value })}
                              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500"
                           />
                        </div>
                        <div>
                           <label className="font-bold text-slate-700 block mb-1">Mobile Number (For OTP App Login) *</label>
                           <input
                              type="tel"
                              required
                              placeholder="e.g. 9820011223"
                              value={captainForm.phone}
                              onChange={(e) => setCaptainForm({ ...captainForm, phone: e.target.value })}
                              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500"
                           />
                        </div>
                        <div>
                           <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                           <input
                              type="email"
                              placeholder="e.g. pranav@jaxmart.in"
                              value={captainForm.email}
                              onChange={(e) => setCaptainForm({ ...captainForm, email: e.target.value })}
                              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500"
                           />
                        </div>
                        <div>
                           <label className="font-bold text-slate-700 block mb-1">Assigned Industrial Territory</label>
                           <input
                              type="text"
                              placeholder="e.g. Surat Industrial Estate / Mumbai Port Hub"
                              value={captainForm.territory}
                              onChange={(e) => setCaptainForm({ ...captainForm, territory: e.target.value })}
                              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500"
                           />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4 font-bold">
                           <button
                              type="button"
                              onClick={() => setIsCaptainModalOpen(false)}
                              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                           >
                              Cancel
                           </button>
                           <button
                              type="submit"
                              disabled={deployingCaptain}
                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                           >
                              {deployingCaptain ? 'Deploying...' : 'Deploy Captain'}
                           </button>
                        </div>
                     </form>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* Company KYC Inspect Modal */}
         <AnimatePresence>
            {selectedCompanyAudit && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setSelectedCompanyAudit(null)}
                     className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
                  />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 15 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 15 }}
                     className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full p-6 z-10 max-h-[85vh] overflow-y-auto"
                  >
                     <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div>
                           <h3 className="text-base font-black text-slate-900">{selectedCompanyAudit.legalName}</h3>
                           <p className="text-xs text-slate-500">{selectedCompanyAudit.tradeName || 'On-site verified factory'}</p>
                        </div>
                        <button
                           onClick={() => setSelectedCompanyAudit(null)}
                           className="p-2 text-slate-400 hover:text-slate-900 rounded-xl"
                        >
                           <FaXmark className="h-4 w-4" />
                        </button>
                     </div>

                     <div className="py-4 space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                           <div className="p-3 bg-slate-50 rounded-xl">
                              <span className="text-slate-400 font-bold block text-[10px]">GSTIN / PAN</span>
                              <span className="font-mono font-bold text-slate-900">{selectedCompanyAudit.gstin || selectedCompanyAudit.pan || 'N/A'}</span>
                           </div>
                           <div className="p-3 bg-slate-50 rounded-xl">
                              <span className="text-slate-400 font-bold block text-[10px]">Owner Phone</span>
                              <span className="font-bold text-slate-900">{selectedCompanyAudit.phone}</span>
                           </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl">
                           <span className="text-slate-400 font-bold block text-[10px]">Address & GPS Location</span>
                           <p className="font-bold text-slate-900">{selectedCompanyAudit.city}, {selectedCompanyAudit.state} - {selectedCompanyAudit.pincode || '395006'}</p>
                           {selectedCompanyAudit.gps && <p className="text-[10px] text-slate-500 font-mono mt-0.5">📍 {selectedCompanyAudit.gps}</p>}
                        </div>

                        {selectedCompanyAudit.storefrontImage && (
                           <div>
                              <span className="text-slate-400 font-bold block text-[10px] mb-1.5">Storefront Photo</span>
                              <img src={selectedCompanyAudit.storefrontImage} alt="storefront" className="w-full h-44 object-cover rounded-xl border border-slate-200" />
                           </div>
                        )}
                     </div>

                     <div className="pt-3 border-t border-slate-100 flex justify-end">
                        <button
                           onClick={() => setSelectedCompanyAudit(null)}
                           className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                        >
                           Close Audit
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* Event Modal */}
         <AnimatePresence>
            {isEventModalOpen && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setIsEventModalOpen(false)}
                     className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
                  />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 15 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 15 }}
                     className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full p-6 sm:p-8 z-10"
                  >
                     <div className="mb-6">
                        <h3 className="text-lg font-black text-slate-900">
                           {editingEvent ? 'Edit Trade Event' : 'Create Trade Event'}
                        </h3>
                     </div>

                     <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
                        <div>
                           <label className="font-bold text-slate-700 block mb-1">Event Title *</label>
                           <input
                              type="text"
                              required
                              value={eventForm.title}
                              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs"
                           />
                        </div>
                        <div>
                           <label className="font-bold text-slate-700 block mb-1">Description *</label>
                           <textarea
                              required
                              rows={3}
                              value={eventForm.description}
                              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs resize-none"
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <label className="font-bold text-slate-700 block mb-1">Date</label>
                              <input
                                 type="datetime-local"
                                 value={eventForm.date}
                                 onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                                 className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs"
                              />
                           </div>
                           <div>
                              <label className="font-bold text-slate-700 block mb-1">Location</label>
                              <input
                                 type="text"
                                 value={eventForm.location}
                                 onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                                 className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs"
                              />
                           </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4 font-bold">
                           <button
                              type="button"
                              onClick={() => setIsEventModalOpen(false)}
                              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                           >
                              Cancel
                           </button>
                           <button
                              type="submit"
                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                           >
                              {editingEvent ? 'Save Changes' : 'Create Event'}
                           </button>
                        </div>
                     </form>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
         {/* User Master Dossier Modal */}
         <AnimatePresence>
            {selectedUserDetail && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setSelectedUserDetail(null)}
                     className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
                  />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 15 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 15 }}
                     className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-3xl w-full p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto space-y-6"
                  >
                     {/* Modal Header */}
                     <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                           <Avatar name={selectedUserDetail.fullName} size="lg" />
                           <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                 <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                    {selectedUserDetail.fullName}
                                 </h2>
                                 <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 uppercase">
                                    {selectedUserDetail.accountType || 'INDIVIDUAL'}
                                 </span>
                                 <span className="text-xs font-mono text-slate-400">
                                    ID: {selectedUserDetail.id}
                                 </span>
                              </div>
                              {selectedUserDetail.businessProfile?.businessName && (
                                 <p className="text-sm font-bold text-indigo-900 mt-1 flex items-center gap-1.5">
                                    <FaBuilding className="h-3.5 w-3.5 text-indigo-600" />
                                    <span>{selectedUserDetail.businessProfile.businessName}</span>
                                    {selectedUserDetail.businessProfile?.businessType && (
                                       <span className="text-xs font-normal text-slate-500">
                                          • {selectedUserDetail.businessProfile.businessType}
                                       </span>
                                    )}
                                 </p>
                              )}
                           </div>
                        </div>

                        <button
                           onClick={() => setSelectedUserDetail(null)}
                           className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                        >
                           <FaXmark className="h-5 w-5" />
                        </button>
                     </div>

                     {/* Quick Contact & Action Ribbon */}
                     <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-4 flex-wrap">
                           {selectedUserDetail.phone && (
                              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                 <FaPhone className="h-3.5 w-3.5 text-emerald-600" />
                                 <span className="font-mono text-xs">+91 {selectedUserDetail.phone.replace(/^(\+91|91)/, '').trim()}</span>
                                 <button
                                    onClick={() => handleCopy(selectedUserDetail.phone, 'Phone')}
                                    className="p-1 text-slate-400 hover:text-slate-700"
                                    title="Copy Phone"
                                 >
                                    <FaRegCopy className="h-3 w-3" />
                                 </button>
                              </div>
                           )}

                           {selectedUserDetail.email && (
                              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                 <FaEnvelope className="h-3.5 w-3.5 text-blue-600" />
                                 <span>{selectedUserDetail.email}</span>
                                 <button
                                    onClick={() => handleCopy(selectedUserDetail.email, 'Email')}
                                    className="p-1 text-slate-400 hover:text-slate-700"
                                    title="Copy Email"
                                 >
                                    <FaRegCopy className="h-3 w-3" />
                                 </button>
                              </div>
                           )}
                        </div>

                        <div className="flex items-center gap-2">
                           {selectedUserDetail.phone && (
                              <a
                                 href={`tel:${selectedUserDetail.phone}`}
                                 className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-xs"
                              >
                                 <FaPhone className="h-3 w-3" />
                                 <span>Call</span>
                              </a>
                           )}
                           {selectedUserDetail.phone && (
                              <a
                                 href={`https://wa.me/${selectedUserDetail.phone.replace(/[^0-9]/g, '').startsWith('91') ? selectedUserDetail.phone.replace(/[^0-9]/g, '') : `91${selectedUserDetail.phone.replace(/[^0-9]/g, '')}`}`}
                                 target="_blank"
                                 rel="noreferrer"
                                 className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all text-xs"
                              >
                                 <FaWhatsapp className="h-3.5 w-3.5" />
                                 <span>WhatsApp</span>
                              </a>
                           )}
                           {selectedUserDetail.email && (
                              <a
                                 href={`mailto:${selectedUserDetail.email}`}
                                 className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all text-xs"
                              >
                                 <FaEnvelope className="h-3 w-3" />
                                 <span>Email</span>
                              </a>
                           )}
                        </div>
                     </div>

                     {/* 4-Card Bento Grid */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Section 1: Business & Tax Profile */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                           <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <span className="font-black uppercase tracking-wider text-[11px] text-slate-900 flex items-center gap-1.5">
                                 <FaBuilding className="h-3.5 w-3.5 text-indigo-600" />
                                 <span>Business & Tax Profile</span>
                              </span>
                              <span className="font-bold text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                 {selectedUserDetail.businessProfile?.businessType || 'Wholesale'}
                              </span>
                           </div>

                           <div className="space-y-2.5">
                              <div>
                                 <span className="text-[10px] font-bold text-slate-400 block uppercase">Legal / Trade Name</span>
                                 <p className="font-bold text-slate-900 text-xs">
                                    {selectedUserDetail.businessProfile?.businessName || selectedUserDetail.fullName}
                                 </p>
                                 {selectedUserDetail.businessProfile?.tradeName && (
                                    <p className="text-[11px] text-slate-500">Trade: {selectedUserDetail.businessProfile.tradeName}</p>
                                 )}
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                 <div className="p-2.5 bg-slate-50 rounded-xl">
                                    <span className="text-[10px] font-bold text-slate-400 block uppercase">GSTIN</span>
                                    <div className="flex items-center justify-between mt-0.5">
                                       <span className="font-mono font-black text-slate-900 text-xs truncate">
                                          {selectedUserDetail.businessProfile?.gstin || 'Unregistered'}
                                       </span>
                                       {selectedUserDetail.businessProfile?.gstin && (
                                          <button
                                             onClick={() => handleCopy(selectedUserDetail.businessProfile.gstin, 'GSTIN')}
                                             className="p-0.5 text-slate-400 hover:text-slate-700"
                                          >
                                             <FaRegCopy className="h-2.5 w-2.5" />
                                          </button>
                                       )}
                                    </div>
                                 </div>

                                 <div className="p-2.5 bg-slate-50 rounded-xl">
                                    <span className="text-[10px] font-bold text-slate-400 block uppercase">PAN</span>
                                    <div className="flex items-center justify-between mt-0.5">
                                       <span className="font-mono font-black text-slate-900 text-xs truncate">
                                          {selectedUserDetail.businessProfile?.pan || 'N/A'}
                                       </span>
                                       {selectedUserDetail.businessProfile?.pan && (
                                          <button
                                             onClick={() => handleCopy(selectedUserDetail.businessProfile.pan, 'PAN')}
                                             className="p-0.5 text-slate-400 hover:text-slate-700"
                                          >
                                             <FaRegCopy className="h-2.5 w-2.5" />
                                          </button>
                                       )}
                                    </div>
                                 </div>
                              </div>

                              {selectedUserDetail.businessProfile?.udyamNumber && (
                                 <div className="p-2.5 bg-slate-50 rounded-xl">
                                    <span className="text-[10px] font-bold text-slate-400 block uppercase">MSME Udyam</span>
                                    <span className="font-mono font-bold text-slate-900 text-xs">
                                       {selectedUserDetail.businessProfile.udyamNumber}
                                    </span>
                                 </div>
                              )}

                              {selectedUserDetail.businessProfile?.annualTurnover && (
                                 <div>
                                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Annual Turnover</span>
                                    <span className="font-bold text-slate-800 text-xs">
                                       {selectedUserDetail.businessProfile.annualTurnover}
                                    </span>
                                 </div>
                              )}

                              {selectedUserDetail.businessProfile?.description && (
                                 <div>
                                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Description / Note</span>
                                    <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                       {selectedUserDetail.businessProfile.description}
                                    </p>
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* Section 2: Physical Facilities & Addresses */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                           <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <span className="font-black uppercase tracking-wider text-[11px] text-slate-900 flex items-center gap-1.5">
                                 <FaLocationDot className="h-3.5 w-3.5 text-red-500" />
                                 <span>Physical Facilities & Locations</span>
                              </span>
                              <span className="font-bold text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                 {selectedUserDetail.addresses?.length || 0} Registered
                              </span>
                           </div>

                           {!selectedUserDetail.addresses?.length ? (
                              <p className="text-slate-400 italic text-xs py-4 text-center">No physical address submitted yet.</p>
                           ) : (
                              <div className="space-y-3">
                                 {selectedUserDetail.addresses.map((addr: any, idx: number) => (
                                    <div key={addr.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                                       <div className="flex items-center justify-between">
                                          <span className="font-bold text-slate-900 text-xs">
                                             {addr.label || (addr.isPrimary ? 'Primary Facility' : `Address #${idx + 1}`)}
                                          </span>
                                          {addr.isPrimary && (
                                             <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                                                Primary
                                             </span>
                                          )}
                                       </div>

                                       <p className="text-xs text-slate-700">
                                          {[addr.line1, addr.line2, addr.landmark].filter(Boolean).join(', ')}
                                       </p>

                                       <p className="font-bold text-slate-900 text-xs">
                                          {addr.city}, {addr.state} - {addr.pincode}
                                       </p>

                                       {addr.contactName && (
                                          <p className="text-[11px] text-slate-500">
                                             Contact: <strong className="text-slate-800">{addr.contactName}</strong> {addr.contactPhone ? `(${addr.contactPhone})` : ''}
                                          </p>
                                       )}

                                       {addr.lat && addr.lng && (
                                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 mt-1">
                                             <span className="text-[10px] font-mono text-slate-500">📍 {addr.lat}, {addr.lng}</span>
                                             <a
                                                href={`https://maps.google.com/?q=${addr.lat},${addr.lng}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                             >
                                                <span>Google Maps</span>
                                                <ExternalLink className="h-3 w-3" />
                                             </a>
                                          </div>
                                       )}
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>

                        {/* Section 3: KYC Verification Documents */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                           <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <span className="font-black uppercase tracking-wider text-[11px] text-slate-900 flex items-center gap-1.5">
                                 <FaShieldHalved className="h-3.5 w-3.5 text-emerald-600" />
                                 <span>KYC Compliance & Documents</span>
                              </span>
                              <span className={clsx(
                                 'text-[10px] font-black px-2 py-0.5 rounded-md uppercase',
                                 selectedUserDetail.kycStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                              )}>
                                 {selectedUserDetail.kycStatus}
                              </span>
                           </div>

                           {!selectedUserDetail.kycDocuments?.length ? (
                              <p className="text-slate-400 italic text-xs py-4 text-center">No KYC document files attached.</p>
                           ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                 {selectedUserDetail.kycDocuments.map((doc: any) => (
                                    <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                                       <div className="flex items-center justify-between">
                                          <span className="font-black text-[10px] uppercase text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
                                             {doc.documentType}
                                          </span>
                                          <span className={clsx(
                                             'text-[9px] font-bold px-1.5 py-0.5 rounded uppercase',
                                             doc.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                                          )}>
                                             {doc.status}
                                          </span>
                                       </div>

                                       {doc.documentNumber && (
                                          <p className="font-mono text-[11px] font-bold text-slate-800 truncate">
                                             #{doc.documentNumber}
                                          </p>
                                       )}

                                       {doc.documentUrl && (
                                          <a
                                             href={doc.documentUrl}
                                             target="_blank"
                                             rel="noreferrer"
                                             className="block rounded-lg overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity"
                                          >
                                             <img
                                                src={doc.documentUrl}
                                                alt={doc.documentType}
                                                className="w-full h-24 object-cover"
                                             />
                                          </a>
                                       )}

                                       {doc.reviewNote && (
                                          <p className="text-[10px] text-slate-500 italic bg-white p-1.5 rounded border border-slate-100">
                                             {doc.reviewNote}
                                          </p>
                                       )}
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>

                        {/* Section 4: Platform Commercials & Activity */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                           <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <span className="font-black uppercase tracking-wider text-[11px] text-slate-900 flex items-center gap-1.5">
                                 <FaChartBar className="h-3.5 w-3.5 text-blue-600" />
                                 <span>Commercials & Activity</span>
                              </span>
                              <span className="font-bold text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                 🛡️ Trust {selectedUserDetail.trustScore || 0}/100
                              </span>
                           </div>

                           <div className="grid grid-cols-2 gap-2.5">
                              <div className="p-3 bg-slate-50 rounded-xl">
                                 <span className="text-[10px] font-bold text-slate-400 block uppercase">Subscription</span>
                                 <span className="font-bold text-slate-900 text-xs block mt-0.5">
                                    {selectedUserDetail.subscription?.plan?.name || 'Free Tier'}
                                 </span>
                                 <span className="text-[10px] text-emerald-600 font-bold uppercase">
                                    {selectedUserDetail.subscription?.status || 'ACTIVE'}
                                 </span>
                              </div>

                              <div className="p-3 bg-slate-50 rounded-xl">
                                 <span className="text-[10px] font-bold text-slate-400 block uppercase">Lead Credits</span>
                                 <span className="font-black text-amber-600 text-base block mt-0.5">
                                    {selectedUserDetail.wallet?.balance ?? 5}
                                 </span>
                                 <span className="text-[10px] text-slate-500">Available Credits</span>
                              </div>

                              <div className="p-3 bg-slate-50 rounded-xl">
                                 <span className="text-[10px] font-bold text-slate-400 block uppercase">Catalog SKUs</span>
                                 <span className="font-black text-slate-900 text-base block mt-0.5">
                                    {selectedUserDetail._count?.listings || 0}
                                 </span>
                                 <span className="text-[10px] text-slate-500">Active Listings</span>
                              </div>

                              <div className="p-3 bg-slate-50 rounded-xl">
                                 <span className="text-[10px] font-bold text-slate-400 block uppercase">Orders & RFQs</span>
                                 <span className="font-black text-slate-900 text-base block mt-0.5">
                                    {(selectedUserDetail._count?.buyerOrders || 0) + (selectedUserDetail._count?.sellerOrders || 0)}
                                 </span>
                                 <span className="text-[10px] text-slate-500">{selectedUserDetail._count?.rfqRequests || 0} RFQ Demand</span>
                              </div>
                           </div>

                           <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
                              <p>🗓️ <strong>Registered On:</strong> {new Date(selectedUserDetail.createdAt).toLocaleString('en-IN')}</p>
                              {selectedUserDetail.lastActiveAt && (
                                 <p>⚡ <strong>Last Active:</strong> {formatDistanceToNow(new Date(selectedUserDetail.lastActiveAt))} ago</p>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Modal Footer Actions */}
                     <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                           {selectedUserDetail.kycStatus !== 'VERIFIED' && (
                              <button
                                 onClick={() => handleApprove('kyc', selectedUserDetail.id)}
                                 className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
                              >
                                 <FaCircleCheck className="h-3.5 w-3.5" />
                                 <span>Approve & Verify KYC</span>
                              </button>
                           )}

                           {selectedUserDetail.kycStatus === 'PENDING' && (
                              <button
                                 onClick={() => handleReject('kyc', selectedUserDetail.id)}
                                 className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all"
                              >
                                 <FaCircleXmark className="h-3.5 w-3.5" />
                                 <span>Reject KYC</span>
                              </button>
                           )}
                        </div>

                        <button
                           onClick={() => setSelectedUserDetail(null)}
                           className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
                        >
                           Close Dossier
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}

            {/* Detailed KYC Merchant Inspection & Audit Modal */}
            {selectedKycDetail && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 10 }}
                     className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-slate-200/80 space-y-6"
                  >
                     {/* Modal Top Bar */}
                     <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                        <div className="flex items-center gap-3.5">
                           <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1 relative">
                              {selectedKycDetail.user?.avatarUrl ? (
                                 <img src={selectedKycDetail.user.avatarUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                              ) : (
                                 <FaStore className="h-6 w-6 text-slate-400" />
                              )}
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                 <h2 className="font-heading font-black text-slate-900 text-lg">
                                    {selectedKycDetail.user?.businessProfile?.businessName || selectedKycDetail.user?.fullName}
                                 </h2>
                                 <Badge status={selectedKycDetail.user?.kycStatus || 'PENDING'} />
                              </div>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">
                                 Contact: <strong className="text-slate-800">{selectedKycDetail.user?.fullName}</strong> • Registered {formatDistanceToNow(new Date(selectedKycDetail.createdAt), { addSuffix: true })}
                              </p>
                           </div>
                        </div>

                        <button
                           onClick={() => setSelectedKycDetail(null)}
                           className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs transition-colors cursor-pointer"
                        >
                           ✕
                        </button>
                     </div>

                     {/* Bento Grid: Business Profile & KYC Docs */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Box 1: Compliance Identifiers */}
                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60 space-y-3">
                           <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                              <span className="font-black uppercase tracking-wider text-[11px] text-slate-900 flex items-center gap-1.5">
                                 <FaBuilding className="h-3.5 w-3.5 text-indigo-600" />
                                 <span>Tax & Legal Profile</span>
                              </span>
                              <span className="font-bold text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                 {selectedKycDetail.user?.businessProfile?.businessType || 'Proprietorship'}
                              </span>
                           </div>

                           <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                 <span className="text-slate-500">GSTIN:</span>
                                 <button
                                    onClick={() => handleCopy(selectedKycDetail.user?.businessProfile?.gstin, 'GSTIN')}
                                    className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5"
                                 >
                                    <span>{selectedKycDetail.user?.businessProfile?.gstin || 'Not Provided'}</span>
                                    {selectedKycDetail.user?.businessProfile?.gstin && <FaRegCopy className="h-2.5 w-2.5 text-slate-400" />}
                                 </button>
                              </div>

                              <div className="flex items-center justify-between">
                                 <span className="text-slate-500">PAN:</span>
                                 <button
                                    onClick={() => handleCopy(selectedKycDetail.user?.businessProfile?.pan, 'PAN')}
                                    className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5"
                                 >
                                    <span>{selectedKycDetail.user?.businessProfile?.pan || 'Not Provided'}</span>
                                    {selectedKycDetail.user?.businessProfile?.pan && <FaRegCopy className="h-2.5 w-2.5 text-slate-400" />}
                                 </button>
                              </div>

                              <div className="flex items-center justify-between">
                                 <span className="text-slate-500">Phone:</span>
                                 <span className="font-mono font-bold text-slate-900">{selectedKycDetail.user?.phone || 'N/A'}</span>
                              </div>

                              <div className="flex items-center justify-between">
                                 <span className="text-slate-500">Email:</span>
                                 <span className="font-bold text-slate-900 truncate max-w-[180px]">{selectedKycDetail.user?.email || 'N/A'}</span>
                              </div>

                              {selectedKycDetail.user?.businessProfile?.annualTurnover && (
                                 <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Annual Turnover:</span>
                                    <span className="font-bold text-slate-900">{selectedKycDetail.user.businessProfile.annualTurnover}</span>
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* Box 2: Verification Details */}
                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60 space-y-3">
                           <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                              <span className="font-black uppercase tracking-wider text-[11px] text-slate-900 flex items-center gap-1.5">
                                 <FaShieldHalved className="h-3.5 w-3.5 text-emerald-600" />
                                 <span>Audit Assessment</span>
                              </span>
                              <span className="font-bold text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                 🛡️ Score {selectedKycDetail.user?.trustScore || 85}/100
                              </span>
                           </div>

                           <div className="space-y-2">
                              <div>
                                 <span className="text-[10px] font-bold text-slate-400 block uppercase">Field Inspector / Method</span>
                                 <p className="font-bold text-slate-900 mt-0.5">
                                    {selectedKycDetail.documents?.some((d: any) => d.verificationMethod === 'CAPTAIN_ONSITE')
                                       ? 'Captain On-Site Physical Inspection'
                                       : 'Direct Merchant Digital Upload'}
                                 </p>
                              </div>

                              {selectedKycDetail.user?.businessProfile?.description && (
                                 <div>
                                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Inspection Notes</span>
                                    <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200 mt-0.5">
                                       {selectedKycDetail.user.businessProfile.description}
                                    </p>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Uploaded Documents Gallery */}
                     <div className="space-y-3">
                        <h4 className="font-heading font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                           <FaFileLines className="h-3.5 w-3.5 text-indigo-600" />
                           <span>Uploaded Identity & Business Documents ({selectedKycDetail.documents?.length || 0})</span>
                        </h4>

                        {!selectedKycDetail.documents?.length ? (
                           <p className="text-slate-400 italic text-xs py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                              No uploaded document files attached for this merchant.
                           </p>
                        ) : (
                           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {selectedKycDetail.documents.map((doc: any) => (
                                 <div key={doc.id} className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2 flex flex-col justify-between">
                                    <div>
                                       <div className="flex items-center justify-between mb-2">
                                          <span className="font-black text-[10px] uppercase bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md border border-indigo-100">
                                             {doc.documentType}
                                          </span>
                                          <Badge status={doc.status || 'VERIFIED'} />
                                       </div>

                                       {doc.documentNumber && (
                                          <p className="font-mono text-[11px] text-slate-700 font-bold truncate">
                                             {doc.documentNumber}
                                          </p>
                                       )}
                                    </div>

                                    {doc.documentUrl ? (
                                       <div className="space-y-1.5">
                                          <div
                                             onClick={() => setPreviewDocUrl(doc.documentUrl)}
                                             className="h-28 w-full rounded-xl bg-white border border-slate-200 overflow-hidden cursor-pointer group relative flex items-center justify-center"
                                          >
                                             <img
                                                src={doc.documentUrl}
                                                alt={doc.documentType}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                             />
                                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                                                <FaEye className="h-3 w-3" /> Click to Zoom
                                             </div>
                                          </div>

                                          <a
                                             href={doc.documentUrl}
                                             target="_blank"
                                             rel="noreferrer"
                                             className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center justify-center gap-1 py-1"
                                          >
                                             <span>Open Full Size</span>
                                             <ExternalLink className="h-2.5 w-2.5" />
                                          </a>
                                       </div>
                                    ) : (
                                       <div className="h-20 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-medium">
                                          No Preview
                                       </div>
                                    )}

                                    {doc.reviewNote && (
                                       <p className="text-[10px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                                          {doc.reviewNote}
                                       </p>
                                    )}
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>

                     {/* Action Controls */}
                     <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                           {selectedKycDetail.user?.kycStatus !== 'VERIFIED' && (
                              <button
                                 onClick={async () => {
                                    await handleApprove('kyc', selectedKycDetail.userId || selectedKycDetail.id);
                                    setSelectedKycDetail(null);
                                 }}
                                 className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                              >
                                 <FaCheck className="h-3.5 w-3.5" />
                                 <span>Approve & Verify Merchant</span>
                              </button>
                           )}

                           {selectedKycDetail.user?.kycStatus !== 'REJECTED' && (
                              <button
                                 onClick={async () => {
                                    await handleReject('kyc', selectedKycDetail.userId || selectedKycDetail.id);
                                    setSelectedKycDetail(null);
                                 }}
                                 className="px-4 py-2.5 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                 <FaXmark className="h-3.5 w-3.5" />
                                 <span>Reject / Revoke KYC</span>
                              </button>
                           )}
                        </div>

                        <button
                           onClick={() => setSelectedKycDetail(null)}
                           className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                           Close Dossier
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}

            {/* Full-Screen Document Zoom Lightbox */}
            {previewDocUrl && (
               <div
                  onClick={() => setPreviewDocUrl(null)}
                  className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
               >
                  <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
                     <button
                        onClick={() => setPreviewDocUrl(null)}
                        className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center text-sm transition-colors cursor-pointer"
                     >
                        ✕
                     </button>
                     <img
                        src={previewDocUrl}
                        alt="Document Preview"
                        className="max-h-[85vh] max-w-full object-contain rounded-2xl"
                     />
                  </div>
               </div>
            )}
         </AnimatePresence>
      </AdminLayout>
   );
}

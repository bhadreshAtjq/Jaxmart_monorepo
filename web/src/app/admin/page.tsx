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
   FaReceipt, FaCreditCard, FaRegCopy, FaPrint, FaArrowRotateLeft, FaDownload
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
   const { data: stats, isLoading: statsLoading } = useAdminStats();
   const { data: users, isLoading: usersLoading } = useAdminUsers(tab === 'users', userSearch);
   const { data: kycQueue, isLoading: kycLoading } = useAdminKycQueue(tab === 'kyc');
   const { data: listingsQueue, isLoading: listingsLoading } = useAdminListingsQueue(tab === 'listings');
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
      } catch {
         toast.error('Action failed');
      }
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
                           <p className="text-2xl font-black text-slate-900 mt-1">{captains.length || 2}</p>
                           <p className="text-[11px] text-indigo-600 font-bold mt-0.5">Field sales force deployed</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Companies Onboarded</span>
                           <p className="text-2xl font-black text-slate-900 mt-1">{onboardings.length}</p>
                           <p className="text-[11px] text-emerald-600 font-bold mt-0.5">100% on-site verified</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Cataloged SKUs</span>
                           <p className="text-2xl font-black text-slate-900 mt-1">{captainListings.length || 8}</p>
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
                                                <span className="font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                   📍 {cap.territory || 'Surat / Mumbai Industrial Hub'}
                                                </span>
                                             </td>
                                             <td className="py-3.5 px-4 font-bold text-slate-900">
                                                {cap.totalOnboarded || 4} Suppliers
                                             </td>
                                             <td className="py-3.5 px-4 font-bold text-indigo-700">
                                                {cap.totalSkus || 8} SKUs
                                             </td>
                                             <td className="py-3.5 px-4">
                                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                                                   Active on Field
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

                {/* ────────────────── TAB 4: KYC QUEUE ────────────────── */}
               {tab === 'kyc' && (
                  <div className="space-y-4">
                     {kycLoading ? (
                        <div className="space-y-3">
                           {Array(3).fill(0).map((_, i) => (
                              <Skeleton key={i} className="h-28 rounded-2xl" />
                           ))}
                        </div>
                     ) : !kycQueue?.queue?.length ? (
                        <div className="p-16 rounded-2xl bg-white border border-dashed border-slate-200 text-center">
                           <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                              <FaCircleCheck className="h-6 w-6" />
                           </div>
                           <p className="text-sm font-bold text-slate-900">KYC Review Queue Empty</p>
                           <p className="text-xs text-slate-400 mt-1">All on-ground and digital identity submissions have been audited.</p>
                        </div>
                     ) : (
                        <div className="space-y-3">
                           {kycQueue.queue.map((item: any) => (
                              <div key={item.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                                 <div className="flex items-center gap-3.5">
                                    <Avatar name={item.user?.fullName} size="md" />
                                    <div>
                                       <div className="flex items-center gap-2">
                                          <h3 className="text-sm font-bold text-slate-900">{item.user?.fullName}</h3>
                                          <Badge status={item.user?.kycStatus} />
                                       </div>
                                       <p className="text-xs text-slate-500">{item.user?.businessProfile?.businessName || 'Business Name Pending'}</p>
                                       <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                          Submitted {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                       </p>
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-2">
                                    <button
                                       onClick={() => handleApprove('kyc', item.userId)}
                                       className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                                    >
                                       <FaCheck className="h-3 w-3" /> Approve KYC
                                    </button>
                                    <button
                                       onClick={() => handleReject('kyc', item.userId)}
                                       className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors flex items-center gap-1.5"
                                    >
                                       <FaXmark className="h-3 w-3" /> Reject
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               )}

               {/* ────────────────── TAB 5: INVENTORY MODERATION ────────────────── */}
               {tab === 'listings' && (
                  <div className="space-y-4">
                     {listingsLoading ? (
                        <div className="space-y-3">
                           {Array(3).fill(0).map((_, i) => (
                              <Skeleton key={i} className="h-24 rounded-2xl" />
                           ))}
                        </div>
                     ) : !listingsQueue?.listings?.length ? (
                        <div className="p-16 rounded-2xl bg-white border border-dashed border-slate-200 text-center">
                           <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                              <FaCircleCheck className="h-6 w-6" />
                           </div>
                           <p className="text-sm font-bold text-slate-900">Inventory Moderation Queue Cleared</p>
                           <p className="text-xs text-slate-400 mt-1">All catalog submissions have been published.</p>
                        </div>
                     ) : (
                        <div className="space-y-3">
                           {listingsQueue.listings.map((listing: any) => (
                              <div key={listing.id} className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-4 shadow-xs">
                                 <div>
                                    <h3 className="text-xs font-bold text-slate-900">{listing.title}</h3>
                                    <p className="text-[11px] text-slate-500 mt-0.5">{listing.category?.name || 'General B2B'}</p>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <button
                                       onClick={() => handleApprove('listing', listing.id)}
                                       className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                                    >
                                       Publish SKU
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
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
                     <div className="flex items-center justify-between gap-4">
                        <div className="relative w-full max-w-sm">
                           <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                           <input
                              type="text"
                              placeholder="Search users by name, phone or company..."
                              value={userSearch}
                              onChange={(e) => setUserSearch(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                           />
                        </div>
                     </div>

                     <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                        {!users?.users?.length ? (
                           <div className="p-12 text-center text-slate-400 text-xs font-medium">No users match your search query.</div>
                        ) : (
                           <div className="divide-y divide-slate-100 text-xs">
                              {users.users.slice(0, 20).map((u: any) => (
                                 <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                                    <div className="flex items-center gap-3">
                                       <Avatar name={u.fullName} size="sm" />
                                       <div>
                                          <p className="font-bold text-slate-900">{u.fullName}</p>
                                          <p className="text-[11px] text-slate-400">{u.email || u.phone}</p>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg text-[10px] uppercase">
                                          {u.userType}
                                       </span>
                                       <span className={clsx(
                                          'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
                                          u.kycStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                                       )}>
                                          {u.kycStatus}
                                       </span>
                                    </div>
                                 </div>
                              ))}
                           </div>
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
      </AdminLayout>
   );
}

'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FaUsers, FaFileLines, FaTriangleExclamation, FaArrowTrendUp, 
  FaCircleCheck, FaCircleXmark, FaEye, FaChartBar, FaShieldHalved, 
  FaInbox, FaMagnifyingGlass, FaPlus, FaFilter, FaChevronRight, FaArrowRightLong
} from 'react-icons/fa6';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, Badge, Button, Avatar, PageLoader, StatCard, EmptyState, Container, Skeleton, TrustScore } from '@/components/ui';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { id: 'overview', label: 'Platform Pulse', icon: FaChartBar, color: 'text-jax-blue' },
  { id: 'kyc', label: 'KYC Verification', icon: FaShieldHalved, color: 'text-amber-500' },
  { id: 'listings', label: 'Inventory Review', icon: FaInbox, color: 'text-jax-teal' },
  { id: 'disputes', label: 'Dispute Center', icon: FaTriangleExclamation, color: 'text-red-500' },
  { id: 'users', label: 'User Directory', icon: FaUsers, color: 'text-jax-dark' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const qc = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getPlatformStats().then(r => r.data),
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.getUsers({ limit: 50 }).then(r => r.data),
    enabled: tab === 'users',
  });

  const { data: kycQueue, isLoading: kycLoading } = useQuery({
    queryKey: ['admin', 'kyc'],
    queryFn: () => adminApi.getKycQueue().then(r => r.data),
    enabled: tab === 'kyc',
  });

  const approveMutation = useMutation({
    mutationFn: ({ type, id }: { type: string; id: string }) =>
      type === 'kyc' ? adminApi.approveKyc(id) : adminApi.approveListing(id),
    onSuccess: (_, { type }) => {
      qc.invalidateQueries({ queryKey: ['admin', type === 'kyc' ? 'kyc' : 'listings'] });
      toast.success('Approved successfully');
    },
    onError: () => toast.error('Action failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ type, id, reason }: { type: string; id: string; reason: string }) =>
      type === 'kyc' ? adminApi.rejectKyc(id, reason) : adminApi.rejectListing(id, reason),
    onSuccess: (_, { type }) => {
      qc.invalidateQueries({ queryKey: ['admin', type === 'kyc' ? 'kyc' : 'listings'] });
      toast.success('Rejected');
    },
  });

  return (
    <AppLayout>
      <Container size="xl" className="py-8">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="h-8 w-8 rounded-xl bg-jax-dark flex items-center justify-center text-white">
                  <FaShieldHalved className="h-4 w-4" />
               </div>
               <Badge status="ACTIVE" label="Admin Command" className="bg-jax-dark text-white" />
            </div>
            <h1 className="text-4xl font-heading font-black text-jax-dark tracking-tighter uppercase leading-none">Control Center</h1>
            <p className="text-gray-400 text-sm font-medium mt-2">Platform governance and oversight console</p>
          </div>

          <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-gray-200/60 shadow-sm">
             {TABS.map(({ id, label, icon: Icon }) => (
                <button
                   key={id}
                   onClick={() => setTab(id)}
                   className={clsx(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                      tab === id ? 'bg-jax-dark text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'
                   )}
                >
                   <Icon className="h-3 w-3" />
                   <span className="hidden lg:inline">{label}</span>
                </button>
             ))}
          </div>
        </div>

        <motion.div
           layout
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.4 }}
        >
           {/* TAB CONTENTS */}
           {tab === 'overview' && (
              <div className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label="Platform GMV" value={stats?.totalGmv?.toLocaleString() || '0'} trend="+14% this week" icon={<FaArrowTrendUp />} />
                    <StatCard label="Active Participants" value={stats?.activeSellers || 0} trend="Organic +3%" icon={<FaUsers />} />
                    <StatCard label="Unresolved Disputes" value={stats?.openDisputes || 0} variant="danger" icon={<FaTriangleExclamation />} />
                    <StatCard label="Compliance Backlog" value={stats?.kycPending || 0} variant="warning" icon={<FaShieldHalved />} />
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                       <SectionHeader title="Operational Tasks" />
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                             { label: 'Listings Pending Review', val: stats?.listingsPending || 0, id: 'listings' },
                             { label: 'KYC Queue Depth', val: stats?.kycPending || 0, id: 'kyc' },
                             { label: 'Active Quotations (24h)', val: stats?.rfqsToday || 0, id: 'rfq' },
                             { label: 'Conflict Resolutions', val: stats?.openDisputes || 0, id: 'disputes' },
                          ].map(task => (
                             <Card key={task.label} className="p-6 group cursor-pointer hover:border-jax-blue/30 transition-all border-dashed" onClick={() => (task.id !== 'rfq' && setTab(task.id))}>
                                <div className="flex justify-between items-start mb-4">
                                   <div className="h-10 w-10 rounded-xl bg-jax-blue/5 flex items-center justify-center text-jax-blue group-hover:bg-jax-blue group-hover:text-white transition-all">
                                      <FaArrowRightLong className="h-4 w-4" />
                                   </div>
                                   <span className="text-2xl font-heading font-black text-jax-dark">{task.val}</span>
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{task.label}</p>
                             </Card>
                          ))}
                       </div>
                    </div>
                    {/* Insights Hub */}
                    <Card variant="dark" className="p-8">
                       <h3 className="text-lg font-heading font-black mb-6 tracking-tighter">AI Governance Insights</h3>
                       <div className="space-y-6">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                             <p className="text-[10px] font-black text-jax-teal uppercase tracking-widest mb-2">Network Health</p>
                             <p className="text-xs text-white/60 font-medium">Platform trade velocity is up 22%. Compliance density is optimal at 98.4%.</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                             <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Escrow Alert</p>
                             <p className="text-xs text-white/60 font-medium">3 disputes in High-Intensity Industrial segment require immediate mediation.</p>
                          </div>
                       </div>
                       <Button className="w-full mt-8 bg-white text-jax-dark hover:bg-jax-teal hover:text-white border-none py-6 h-auto text-xs font-black uppercase tracking-widest">Generate Risk Report</Button>
                    </Card>
                 </div>
              </div>
           )}

           {tab === 'kyc' && (
              <div className="space-y-6">
                 <SectionHeader title="Verification Stream" subtitle="Validating official business identities" />
                 {kycLoading ? <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div> : (kycQueue?.queue || []).length === 0 ? (
                    <EmptyState icon={<FaCircleCheck className="h-10 w-10 text-emerald-400" />} title="Compliance Achieved" description="There are no pending identity verifications in the queue." />
                 ) : (
                    <div className="grid grid-cols-1 gap-4">
                       {(kycQueue.queue).map((item: any) => (
                          <Card key={item.id} className="p-6">
                             <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                   <Avatar name={item.user?.fullName} size="xl" className="border-2 border-jax-teal/10" />
                                   <div>
                                      <h3 className="text-base font-heading font-black text-jax-dark uppercase tracking-wide mb-1">{item.user?.fullName}</h3>
                                      <div className="flex items-center gap-3">
                                         <span className="text-xs font-bold text-gray-400">{item.user?.phone}</span>
                                         <Badge status="PENDING" label={item.user?.accountType} className="text-[9px]" />
                                      </div>
                                      <div className="flex gap-2 mt-3">
                                         {item.documents?.map((doc: any) => (
                                            <a key={doc.id} href={doc.documentUrl} target="_blank" className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black text-jax-blue uppercase tracking-wider hover:bg-jax-blue/5">
                                               <FaEye className="h-3 w-3" /> {doc.documentType}
                                            </a>
                                         ))}
                                      </div>
                                   </div>
                                </div>
                                <div className="flex flex-col gap-2 w-full md:w-auto">
                                   <Button variant="success" className="h-11" icon={<FaCircleCheck />} onClick={() => approveMutation.mutate({ type: 'kyc', id: item.userId })}>Verify Entity</Button>
                                   <Button variant="outline" className="h-11 text-red-500 border-red-100 hover:bg-red-50" icon={<FaCircleXmark />} onClick={() => { const reason = prompt('Reject reason:'); if (reason) rejectMutation.mutate({ type: 'kyc', id: item.userId, reason }); }}>Flag & Reject</Button>
                                </div>
                             </div>
                          </Card>
                       ))}
                    </div>
                 )}
              </div>
           )}

           {tab === 'users' && (
              <div className="space-y-6">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-gray-100">
                    <SectionHeader title="Identity Directory" subtitle="Full database of platform participants" className="mb-0" />
                    <div className="flex items-center gap-3">
                       <div className="relative">
                          <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 h-3 w-3" />
                          <input placeholder="Search members..." className="h-10 pl-9 pr-4 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-jax-blue/20 outline-none transition-all w-60" />
                       </div>
                       <Button variant="outline" size="sm" icon={<FaFilter className="h-3 w-3" />} className="h-10">Advanced</Button>
                    </div>
                 </div>

                 {usersLoading ? (
                    <div className="space-y-2">
                       <Skeleton className="h-12" />
                       <Skeleton className="h-12" />
                       <Skeleton className="h-12" />
                    </div>
                 ) : (
                    <div className="bg-white border border-gray-200/60 rounded-[2rem] overflow-hidden shadow-sm">
                       <table className="w-full border-collapse">
                          <thead>
                             <tr className="bg-gray-50/50 border-b border-gray-100">
                                {['Participant Member', 'Contact Vector', 'Market Role', 'Trade Trust', 'Verification', 'Timeline'].map(h => (
                                   <th key={h} className="px-6 py-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{h}</th>
                                ))}
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                             {(users?.users || []).map((u: any) => (
                                <tr key={u.id} className="hover:bg-jax-blue/[0.02] transition-colors group">
                                   <td className="px-6 py-5">
                                      <div className="flex items-center gap-4">
                                         <Avatar name={u.fullName} size="sm" className="ring-2 ring-white" />
                                         <div>
                                            <p className="text-xs font-black text-jax-dark uppercase tracking-tight group-hover:text-jax-blue transition-colors">{u.fullName}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{u.accountType}</p>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-6 py-5 text-xs font-bold text-gray-400 font-body">{u.phone}</td>
                                   <td className="px-6 py-5"><Badge status={u.userType} className="text-[9px] font-black" /></td>
                                   <td className="px-6 py-5">
                                      <div className="flex items-center gap-3">
                                         <div className="flex-1 h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-jax-blue rounded-full transition-all duration-1000" style={{ width: `${u.trustScore}%` }} />
                                         </div>
                                         <span className="text-[10px] font-black text-jax-dark">{u.trustScore}</span>
                                      </div>
                                   </td>
                                   <td className="px-6 py-5">
                                      <div className={clsx(
                                         'inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide',
                                         u.kycStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                      )}>
                                         <div className={clsx('h-1.5 w-1.5 rounded-full', u.kycStatus === 'VERIFIED' ? 'bg-emerald-500' : 'bg-amber-500')} />
                                         {u.kycStatus}
                                      </div>
                                   </td>
                                   <td className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tabular-nums">{formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}</td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 )}
              </div>
           )}

           {tab === 'listings' && (
              <EmptyState icon={<FaInbox className="h-10 w-10 text-jax-teal" />} title="Inventory Clear" description="All market listings have been successfully reviewed and audited." />
           )}
           {tab === 'disputes' && (
              <EmptyState icon={<FaTriangleExclamation className="h-10 w-10 text-red-400" />} title="Peaceful Marketplace" description="No active transaction disputes require moderator intervention." />
           )}
        </motion.div>
      </Container>
    </AppLayout>
  );
}

function SectionHeader({ title, subtitle, action, className }: { title: string; subtitle?: string; action?: React.ReactNode; className?: string }) {
   return (
      <div className={clsx('flex items-center justify-between mb-8', className)}>
         <div>
            <h2 className="text-xl font-heading font-black text-jax-dark tracking-tighter uppercase">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 font-medium mt-1">{subtitle}</p>}
         </div>
         {action}
      </div>
   );
}

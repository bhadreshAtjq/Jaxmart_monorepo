'use client';
import { useState } from 'react';
import { 
  FaUsers, FaFileLines, FaTriangleExclamation, FaArrowTrendUp, 
  FaCircleCheck, FaCircleXmark, FaEye, FaChartBar, FaShieldHalved, 
  FaInbox, FaMagnifyingGlass, FaPlus, FaFilter, FaChevronRight, FaArrowRightLong,
  FaCalendarDays, FaPen, FaTrash
} from 'react-icons/fa6';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, Badge, Button, Avatar, PageLoader, StatCard, EmptyState, Container, Skeleton, TrustScore } from '@/components/ui';
import { adminApi } from '@/lib/api';
import { useAdminStats, useAdminUsers, useAdminKycQueue, useAdminEvents, revalidate } from '@/lib/hooks';
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
  { id: 'events', label: 'Global Events', icon: FaCalendarDays, color: 'text-[#36ADA3]' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');

  const [userSearch, setUserSearch] = useState('');
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: users, isLoading: usersLoading } = useAdminUsers(tab === 'users', userSearch);
  const { data: kycQueue, isLoading: kycLoading } = useAdminKycQueue(tab === 'kyc');
  const { data: eventsData, isLoading: eventsLoading } = useAdminEvents(tab === 'events');
  const events = eventsData?.events ?? [];

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

  const handleApprove = async (type: string, id: string) => {
    try {
      if (type === 'kyc') await adminApi.approveKyc(id);
      else await adminApi.approveListing(id);
      revalidate.admin();
      toast.success('Approved successfully');
    } catch {
      toast.error('Action failed');
    }
  };

  const handleReject = async (type: string, id: string) => {
    const reason = prompt('Reject reason:');
    if (!reason) return;
    try {
      if (type === 'kyc') await adminApi.rejectKyc(id, reason);
      else await adminApi.rejectListing(id, reason);
      revalidate.admin();
      toast.success('Rejected');
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <AdminLayout>
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
                                   <Button variant="success" className="h-11" icon={<FaCircleCheck />} onClick={() => handleApprove('kyc', item.userId)}>Verify Entity</Button>
                                   <Button variant="outline" className="h-11 text-red-500 border-red-100 hover:bg-red-50" icon={<FaCircleXmark />} onClick={() => handleReject('kyc', item.userId)}>Flag & Reject</Button>
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
                          <input 
                            placeholder="Search members..." 
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="h-10 pl-9 pr-4 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-jax-blue/20 outline-none transition-all w-60" 
                          />
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

           {tab === 'events' && (
              <div className="space-y-6">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-b border-gray-100">
                    <SectionHeader title="Global B2B Events" subtitle="Manage upcoming exhibitions, summits, and sourcing fairs" className="mb-0" />
                    <Button variant="outline" className="border-jax-teal/20 text-[#36ADA3] hover:bg-jax-teal/10 font-bold uppercase tracking-widest text-[10px] h-10 px-4 flex items-center gap-1.5" onClick={openCreateModal}>
                       <FaPlus className="h-3 w-3" /> Add New Event
                    </Button>
                 </div>

                 {eventsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Skeleton className="h-48" />
                       <Skeleton className="h-48" />
                    </div>
                 ) : events.length === 0 ? (
                    <EmptyState 
                       icon={<FaCalendarDays className="h-10 w-10 text-[#36ADA3]" />} 
                       title="No scheduled events" 
                       description="Start creating events to display in the homepage global events carousel."
                       action={<Button variant="outline" icon={<FaPlus />} onClick={openCreateModal}>Create First Event</Button>}
                    />
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                       {events.map((event: any) => (
                          <Card key={event.id} className="overflow-hidden flex flex-col justify-between border border-gray-200/60 shadow-sm rounded-2xl group hover:border-jax-teal/30 hover:shadow-md transition-all duration-300">
                             <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                                <img 
                                   src={event.mediaUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800"} 
                                   alt={event.title}
                                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 right-3">
                                   <Badge status={event.isActive ? "ACTIVE" : "DRAFT"} label={event.isActive ? "Active" : "Inactive"} className={event.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-600 border border-gray-200"} />
                                </div>
                             </div>
                             <div className="p-5 flex-1 flex flex-col justify-between">
                                <div className="space-y-2">
                                   <span className="text-[9px] font-black text-[#36ADA3] uppercase tracking-widest block font-mono">
                                      {event.date ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'No Date Set'}
                                   </span>
                                   <h3 className="text-base font-heading font-black text-jax-dark tracking-tight leading-snug line-clamp-1">{event.title}</h3>
                                   <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{event.description}</p>
                                </div>
                                
                                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold text-gray-400">
                                   <span className="truncate max-w-[150px]">📍 {event.location || 'Online'}</span>
                                   <div className="flex items-center gap-2">
                                      <button 
                                         onClick={() => openEditModal(event)}
                                         className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-jax-teal/10 hover:text-[#36ADA3] hover:border-jax-teal/30 transition-colors"
                                         title="Edit Event"
                                      >
                                         <FaPen className="h-3.5 w-3.5" />
                                      </button>
                                      <button 
                                         onClick={() => handleDeleteEvent(event.id)}
                                         className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                                         title="Delete Event"
                                      >
                                         <FaTrash className="h-3.5 w-3.5" />
                                      </button>
                                   </div>
                                </div>
                             </div>
                          </Card>
                       ))}
                    </div>
                 )}
              </div>
           )}
        </motion.div>
      </Container>

      {/* EVENT EDIT/CREATE MODAL */}
      <AnimatePresence>
        {isEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEventModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-[2rem] border border-gray-100 shadow-2xl max-w-lg w-full p-8 overflow-hidden z-10"
            >
              <div className="mb-6">
                <span className="text-[10px] font-black text-[#36ADA3] uppercase tracking-widest block mb-1">
                  Event Control Panel
                </span>
                <h3 className="text-2xl font-heading font-black text-jax-dark tracking-tighter uppercase">
                  {editingEvent ? 'Edit Global Event' : 'Create Global Event'}
                </h3>
              </div>

              <form onSubmit={handleSaveEvent} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Event Title *</label>
                  <input 
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="e.g. India Machinery Trade Show 2026"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-jax-teal/30 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Description *</label>
                  <textarea 
                    required
                    rows={3}
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder="Detail the event objectives, suppliers list, and other registration details..."
                    className="w-full p-4 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-jax-teal/30 outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Date & Time</label>
                    <input 
                      type="datetime-local"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-jax-teal/30 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Location</label>
                    <input 
                      type="text"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      placeholder="e.g. Pragati Maidan, Delhi"
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-jax-teal/30 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Banner Image URL</label>
                  <input 
                    type="url"
                    value={eventForm.mediaUrl}
                    onChange={(e) => setEventForm({ ...eventForm, mediaUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-jax-teal/30 outline-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input 
                    type="checkbox"
                    id="isActive"
                    checked={eventForm.isActive}
                    onChange={(e) => setEventForm({ ...eventForm, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-[#36ADA3] focus:ring-[#36ADA3]"
                  />
                  <label htmlFor="isActive" className="text-xs font-semibold text-gray-600 cursor-pointer">
                    Publish active (Visible on Homepage Carousel)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6 font-bold uppercase tracking-widest text-[10px]">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEventModalOpen(false)}
                    className="h-10 px-4"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="h-10 px-4 bg-gradient-to-r from-[#232F72] to-[#2F578A] hover:from-[#1C265B] hover:to-[#244774] text-white border-none font-bold"
                  >
                    {editingEvent ? 'Save Changes' : 'Create Event'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
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

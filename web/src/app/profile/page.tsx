'use client';
import { useState } from 'react';

import { FaUser, FaShieldHalved, FaEnvelope, FaPhone, FaBuilding, FaPenToSquare, FaCircleCheck, FaTriangleExclamation, FaClock, FaUpload } from 'react-icons/fa6';
import { AppLayout } from '@/components/layout/AppLayout';
import { userApi } from '@/lib/api';
import { useProfile as useProfileHook } from '@/lib/hooks';
import { Button, Card, Badge, PageLoader, Input, Avatar, SectionHeader } from '@/components/ui';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const { data: user, isLoading, mutate: refetch } = useProfileHook();

  if (isLoading) return <AppLayout><PageLoader /></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
                 <FaShieldHalved className="h-3 w-3 text-jax-accent" />
                 <span className="text-[10px] font-black text-jax-accent uppercase tracking-widest">Compliance Command Console</span>
            </div>
            <h1 className="text-3xl font-heading font-black text-jax-dark tracking-tighter uppercase leading-none">Identity & Trust</h1>
          </div>
          <Button 
            id="tour-edit"
            onClick={() => setIsEditing(!isEditing)} 
            variant={isEditing ? 'ghost' : 'outline'} 
            size="sm" 
            className="transition-all"
            icon={<FaPenToSquare className="h-3.5 w-3.5" />}
          >
            {isEditing ? 'Cancel Edit' : 'Modify Registry'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <Card className="text-center overflow-hidden border-none shadow-xl shadow-black/[0.02]">
              <div className="h-20 bg-jax-dark relative mb-12">
                 <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                    <Avatar name={user.fullName} src={user.avatarUrl} size="xl" className="ring-4 ring-white shadow-xl" />
                 </div>
              </div>
              <div className="p-6 pt-0">
                <h2 className="text-lg font-black text-jax-dark uppercase tracking-tight">{user.fullName}</h2>
                <p className="text-xs text-gray-400 font-medium mb-4">{user.email}</p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <Badge status={user.userType} className="bg-jax-blue/5 text-jax-blue border-jax-blue/10" />
                  <Badge status={user.accountType} className="bg-jax-accent/5 text-jax-accent border-jax-accent/10" />
                </div>
                <div className="pt-6 border-t border-gray-50 flex items-center justify-around">
                   <div className="text-center">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Trust Score</p>
                      <p className="text-xl font-black text-jax-dark mt-1">{user.trustScore}</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Order Rate</p>
                      <p className="text-xl font-black text-jax-blue mt-1">100%</p>
                   </div>
                </div>
              </div>
            </Card>

            <Card className="border-jax-accent/10 bg-jax-accent/5">
              <h3 className="text-[10px] font-black text-jax-dark uppercase tracking-widest mb-4 flex items-center gap-2">
                <FaShieldHalved className="h-3.5 w-3.5 text-jax-accent" /> Security Badge
              </h3>
              <div id="tour-kyc" className="p-4 rounded-2xl bg-white border border-jax-accent/10 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  {user.kycStatus === 'VERIFIED' ? (
                    <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center"><FaCircleCheck className="h-4 w-4 text-emerald-500" /></div>
                  ) : user.kycStatus === 'REJECTED' ? (
                    <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center"><FaTriangleExclamation className="h-4 w-4 text-red-500" /></div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center"><FaClock className="h-4 w-4 text-amber-500" /></div>
                  )}
                  <span className="font-black text-sm text-jax-dark uppercase tracking-tight">{user.kycStatus}</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                  {user.kycStatus === 'VERIFIED'
                    ? 'Authenticated Global Partner. Your credentials are fully validated for high-limit B2B trade.'
                    : 'Initialize KYC verification to unlock wholesale quoting and bulk fulfillment capabilities.'}
                </p>
                {user.kycStatus === 'PENDING' && (
                  <Button fullWidth size="sm" className="mt-5 bg-jax-accent text-white border-none text-[10px] font-black uppercase tracking-widest">Transmit Documents</Button>
                )}
              </div>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-8">
            <Card id="tour-profile-id" className="p-8 border-none shadow-xl shadow-black/[0.02]">
              <SectionHeader title="Core Identity Schema" />
              {isEditing ? (
                <ProfileEditForm user={user} onComplete={() => { setIsEditing(false); refetch(); }} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                  {[
                    { label: 'Full Fullname', value: user.fullName },
                    { label: 'Verified Email', value: user.email || 'Registry Pending' },
                    { label: 'Account Architecture', value: user.accountType },
                    { label: 'Market Permissions', value: user.userType },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{label}</label>
                      <p className="text-sm font-black text-jax-dark uppercase tracking-tight">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {(user.accountType === 'BUSINESS' || isEditing) && (
              <Card id="tour-business" className="p-8 border-l-4 border-l-jax-accent shadow-xl shadow-black/[0.02]">
                <SectionHeader title="Business Intelligence Profile" />
                <div className="flex items-start gap-5 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="h-12 w-12 rounded-2xl bg-jax-accent/10 flex items-center justify-center shrink-0">
                    <FaBuilding className="h-6 w-6 text-jax-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-jax-dark text-lg uppercase tracking-tight truncate leading-tight">
                        {user.businessProfile?.businessName || 'Organization Not Classified'}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                       <span className="text-[10px] font-bold text-jax-accent uppercase tracking-[0.2em]">GSTIN: {user.businessProfile?.gstin || 'REDACTED'}</span>
                       <span className="h-1 w-1 rounded-full bg-gray-300" />
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.businessProfile?.gstin ? 'Verified Supply Chain' : 'Setup Required'}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <Card id="tour-docs" className="p-8 border-none shadow-xl shadow-black/[0.02]">
              <SectionHeader title="Compliance Document Vault" action={<button className="text-[10px] font-black text-jax-blue uppercase tracking-widest hover:text-jax-accent transition-colors">+ Append Registry</button>} />
              {user.kycDocuments?.length ? (
                <div className="grid grid-cols-1 gap-3">
                   {user.kycDocuments.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-jax-accent/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 bg-white rounded-xl flex items-center justify-center border border-gray-200 shadow-sm group-hover:bg-jax-accent group-hover:text-white transition-all">
                          <FaUpload className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-jax-dark uppercase tracking-tight">{doc.documentType}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Validated on {new Date(doc.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge status={doc.status} className="text-[8px]" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                  <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                     <FaUpload className="h-6 w-6 text-gray-200" />
                  </div>
                  <p className="text-xs font-black text-jax-dark uppercase tracking-tight">Vault Registry Empty</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Attach Corporate PAN or Trade License</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function ProfileEditForm({ user, onComplete }: { user: any; onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email || '',
    accountType: user.accountType || 'INDIVIDUAL',
    userType: user.userType || 'BUYER',
    businessName: user.businessProfile?.businessName || '',
    gstNumber: user.businessProfile?.gstin || '',
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userApi.update(formData);
      toast.success('Core Identity Schema Synchronized');
      onComplete();
    } catch {
      toast.error('Identity Protocol Failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Registry Name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
        <Input label="Contact Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
      </div>

      <div>
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Account Architecture</label>
        <select 
          value={formData.accountType} 
          onChange={e => setFormData({ ...formData, accountType: e.target.value })}
          className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-black uppercase tracking-tight outline-none focus:ring-2 ring-jax-accent/10"
        >
          <option value="INDIVIDUAL">Individual Professional</option>
          <option value="BUSINESS">Corporate Entity</option>
        </select>
      </div>

      <div>
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Market Permissions</label>
        <select 
          value={formData.userType} 
          onChange={e => setFormData({ ...formData, userType: e.target.value })}
          className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-black uppercase tracking-tight outline-none focus:ring-2 ring-jax-accent/10"
        >
          <option value="BUYER">Procurement (Buyer)</option>
          <option value="SELLER">Full Supply (Seller)</option>
          <option value="BOTH">Universal (Both)</option>
        </select>
      </div>

      {formData.accountType === 'BUSINESS' && (
        <>
          <div className="md:col-span-2 pt-4 border-t border-gray-100 mt-2">
             <p className="text-[10px] font-black text-jax-accent uppercase tracking-widest mb-6">Business Identification Schema</p>
          </div>
          <Input label="Corporate Entity Name" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} required />
          <Input label="Tax ID / GSTIN" value={formData.gstNumber} onChange={e => setFormData({ ...formData, gstNumber: e.target.value })} required />
        </>
      )}

      <div className="md:col-span-2 flex gap-4 pt-8">
        <Button type="submit" loading={loading} className="bg-jax-accent border-none px-10 h-12 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-jax-accent/20">Commit Changes</Button>
        <Button type="button" variant="ghost" onClick={onComplete} className="text-gray-400 font-bold uppercase text-[10px]">Discard</Button>
      </div>
    </form>
  );
}


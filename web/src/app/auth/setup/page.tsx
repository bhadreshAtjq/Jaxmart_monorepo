'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaEnvelope, FaBuilding, FaArrowRight, FaShieldHalved, FaUserTie, FaCartShopping } from 'react-icons/fa6';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button, Input, Card } from '@/components/ui';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

export default function SetupPage() {
  const router = useRouter();
  const { user, updateUser, isLoggedIn } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    accountType: 'INDIVIDUAL' as 'INDIVIDUAL' | 'BUSINESS',
    userType: 'BUYER' as 'BUYER' | 'SELLER' | 'BOTH',
    businessName: '',
    gstNumber: '',
  });

  useEffect(() => {
    if (!isLoggedIn) router.replace('/auth/login');
  }, [isLoggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      toast.error('Name and Email are required');
      return;
    }
    setLoading(true);
    try {
      const { data } = await userApi.update(formData);
      updateUser(data.user);
      toast.success('Profile setup complete');
      router.push('/home');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-jax-light flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-jax-blue mb-5">
            <FaShieldHalved className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-jax-dark">Complete your profile</h1>
          <p className="text-gray-400 mt-2 text-sm">A few more details to get you started on JaxMart</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                icon={<FaUser className="h-3.5 w-3.5" />}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                icon={<FaEnvelope className="h-3.5 w-3.5" />}
                required
              />
            </div>

            <div className="mt-8">
              <label className="label">Account Type</label>
              <div className="grid grid-cols-2 gap-4 mt-1">
                {[
                  { id: 'INDIVIDUAL', label: 'Individual', icon: FaUser, desc: 'For personal sourcing or services' },
                  { id: 'BUSINESS', label: 'Business', icon: FaBuilding, desc: 'For registered companies & GST firms' },
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: type.id as any })}
                    className={clsx(
                      'flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-150 text-left',
                      formData.accountType === type.id
                        ? 'border-jax-blue bg-jax-teal/5'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    )}
                  >
                    <type.icon className={clsx('h-5 w-5 mb-3', formData.accountType === type.id ? 'text-jax-blue' : 'text-gray-300')} />
                    <span className={clsx('font-heading font-bold text-sm', formData.accountType === type.id ? 'text-jax-dark' : 'text-gray-700')}>{type.label}</span>
                    <span className="text-[11px] text-gray-400 mt-1">{type.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {formData.accountType === 'BUSINESS' && (
              <div className="mt-8 p-6 bg-jax-teal/5 rounded-xl border border-jax-teal/10">
                <h3 className="text-xs font-heading font-bold text-jax-dark uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FaBuilding className="h-3.5 w-3.5 text-jax-blue" /> Business Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Business Legal Name"
                    placeholder="Acme Corp Pvt Ltd"
                    value={formData.businessName}
                    onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                  />
                  <Input
                    label="GST Number (Optional)"
                    placeholder="29AAAAA0000A1Z5"
                    value={formData.gstNumber}
                    onChange={e => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>
            )}

            <div className="mt-8">
              <label className="label">Primary Role</label>
              <div className="grid grid-cols-3 gap-4 mt-1">
                {[
                  { id: 'BUYER', label: 'Buyer', icon: FaCartShopping },
                  { id: 'SELLER', label: 'Seller', icon: FaBuilding },
                  { id: 'BOTH', label: 'Both', icon: FaUserTie },
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: type.id as any })}
                    className={clsx(
                      'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-150 text-center',
                      formData.userType === type.id
                        ? 'border-jax-blue bg-jax-teal/5'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    )}
                  >
                    <type.icon className={clsx('h-4 w-4 mb-2', formData.userType === type.id ? 'text-jax-blue' : 'text-gray-300')} />
                    <span className={clsx('font-heading font-bold text-sm', formData.userType === type.id ? 'text-jax-dark' : 'text-gray-700')}>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Button type="submit" loading={loading} fullWidth size="lg" className="h-14 text-base">
            Get started <FaArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </form>
      </div>
    </div>
  );
}

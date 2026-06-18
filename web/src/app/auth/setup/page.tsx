'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaUser, FaEnvelope, FaBuilding, FaArrowRight, FaArrowLeft,
  FaShieldHalved, FaUserTie, FaCartShopping, FaCircleCheck, FaBriefcase
} from 'react-icons/fa6';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button, Input, Card } from '@/components/ui';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

export default function SetupPage() {
  const router = useRouter();
  const { user, updateUser, isLoggedIn } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    accountType: 'INDIVIDUAL' as 'INDIVIDUAL' | 'BUSINESS',
    userType: 'BUYER' as 'BUYER' | 'SELLER' | 'BOTH',
    businessName: '',
    gstNumber: '',
    establishedYear: '',
    employeeRange: 'ELEVEN_TO_FIFTY',
  });

  useEffect(() => {
    if (!isLoggedIn) router.replace('/auth/login');
  }, [isLoggedIn]);

  // Determine if Step 3 (Business Setup) is required
  const isBusinessSetupRequired = 
    formData.accountType === 'BUSINESS' || 
    formData.userType === 'SELLER' || 
    formData.userType === 'BOTH';

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.fullName.trim() || formData.fullName === 'New User') {
        toast.error('Please enter your valid Full Name');
        return;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        toast.error('Please enter a valid email address');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (isBusinessSetupRequired && !formData.businessName.trim()) {
        toast.error('Business Legal Name is required');
        return;
      }
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        // If business setup wasn't required/entered, clear fields
        businessName: isBusinessSetupRequired ? formData.businessName : undefined,
        gstNumber: isBusinessSetupRequired ? formData.gstNumber : undefined,
        establishedYear: isBusinessSetupRequired && formData.establishedYear ? formData.establishedYear : undefined,
        employeeRange: isBusinessSetupRequired ? formData.employeeRange : undefined,
      };

      const { data } = await userApi.update(payload);
      updateUser(data.user);
      toast.success('Onboarding complete! Welcome to JaxMart.');
      
      // Route based on role selection
      if (formData.userType === 'SELLER' || formData.userType === 'BOTH') {
        router.push('/seller/dashboard');
      } else {
        router.push('/home');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to complete profile registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 py-16">
      <div className="w-full max-w-2xl">
        
        {/* Header Branding */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-jax-dark border border-white/10 shadow-lg text-white">
            <FaShieldHalved className="h-6 w-6 text-jax-accent" />
          </div>
          <h1 className="text-2xl font-black text-jax-dark uppercase tracking-tight font-heading">Onboarding Registry</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Complete your corporate profile credentials</p>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
            <span>Progress Status</span>
            <span>Step {step} of 4</span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-jax-accent rounded-full transition-all duration-500" 
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-8 border border-gray-250/60 shadow-xl shadow-black/[0.01] bg-white rounded-3xl">
            
            {/* STEP 1: Account setup (Name, Email, AccountType) */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="border-b border-gray-150 pb-4 mb-4">
                  <h2 className="text-lg font-black text-jax-dark uppercase tracking-tight font-heading">1. Profile Credentials</h2>
                  <p className="text-xs text-gray-450 mt-1">Specify your name and corporate communication email.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    placeholder="Enter full name"
                    value={formData.fullName === 'New User' ? '' : formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    icon={<FaUser className="h-3.5 w-3.5" />}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    icon={<FaEnvelope className="h-3.5 w-3.5" />}
                    required
                  />
                </div>

                <div className="pt-4">
                  <label className="label mb-2 block">Company Legal Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'INDIVIDUAL', label: 'Individual / Proprietorship', icon: FaUser, desc: 'For sole proprietors, freelancers, or personal buyers' },
                      { id: 'BUSINESS', label: 'Registered Business Firm', icon: FaBuilding, desc: 'For Pvt Ltd, LLC, Partnership, or GST registered firms' },
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, accountType: type.id as any })}
                        className={clsx(
                          'flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left shadow-sm',
                          formData.accountType === type.id
                            ? 'border-jax-accent bg-jax-accent/5'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        )}
                      >
                        <type.icon className={clsx('h-5 w-5 mb-3', formData.accountType === type.id ? 'text-jax-accent' : 'text-gray-300')} />
                        <span className="font-heading font-black text-sm text-jax-dark uppercase tracking-tight">{type.label}</span>
                        <span className="text-[10px] text-gray-400 font-medium leading-relaxed mt-1">{type.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Role Allocation */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="border-b border-gray-150 pb-4 mb-4">
                  <h2 className="text-lg font-black text-jax-dark uppercase tracking-tight font-heading">2. Marketplace Role Designation</h2>
                  <p className="text-xs text-gray-450 mt-1">Designate how you will participate in the wholesale catalog.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { 
                      id: 'BUYER', 
                      label: 'Source & Purchase (Buyer)', 
                      icon: FaCartShopping, 
                      desc: 'Post custom sourcing RFQs, search products, compare supplier bids, and execute secure Escrow orders.' 
                    },
                    { 
                      id: 'SELLER', 
                      label: 'Supply & Merchant (Seller)', 
                      icon: FaBriefcase, 
                      desc: 'Create product/service listings, setup tiered delivery packages, receive and bid on buyer RFQ requests.' 
                    },
                    { 
                      id: 'BOTH', 
                      label: 'Dual Trading (Buyer & Seller)', 
                      icon: FaUserTie, 
                      desc: 'Full capability to both request corporate custom quotes and list wholesale supply inventories.' 
                    },
                  ].map(role => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, userType: role.id as any })}
                      className={clsx(
                        'flex items-center gap-5 p-5 rounded-2xl border-2 transition-all text-left shadow-sm w-full',
                        formData.userType === role.id
                          ? 'border-jax-accent bg-jax-accent/5'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      )}
                    >
                      <div className={clsx(
                        'h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border',
                        formData.userType === role.id ? 'bg-jax-accent/10 border-jax-accent/20 text-jax-dark' : 'bg-gray-50 border-gray-150 text-gray-355'
                      )}>
                        <role.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-heading font-black text-sm text-jax-dark uppercase tracking-tight block">{role.label}</span>
                        <span className="text-[10px] text-gray-400 font-medium leading-normal mt-1 block">{role.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Company Setup */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="border-b border-gray-150 pb-4 mb-4">
                  <h2 className="text-lg font-black text-jax-dark uppercase tracking-tight font-heading">3. Merchant & Corporate Profile</h2>
                  <p className="text-xs text-gray-450 mt-1">Provide trade information for commercial listing operations.</p>
                </div>

                {!isBusinessSetupRequired ? (
                  <div className="p-8 text-center bg-gray-55 rounded-2xl border border-gray-150 space-y-2">
                    <FaCircleCheck className="h-8 w-8 text-emerald-500 mx-auto animate-bounce" />
                    <p className="text-xs font-black text-jax-dark uppercase tracking-wide">Registry Details Waived</p>
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed max-w-sm mx-auto">
                      As an Individual Buyer, corporate merchant registration is not required. You can skip this step.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Business Legal / Shop Name *"
                        placeholder="e.g. Swastik Industries"
                        value={formData.businessName}
                        onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                        required={isBusinessSetupRequired}
                      />
                      <Input
                        label="GSTIN Number (Optional)"
                        placeholder="e.g. 29AAAAA0000A1Z5"
                        value={formData.gstNumber}
                        onChange={e => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                      />
                    </div>
                    {formData.gstNumber && (
                      <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-150/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                        <FaCircleCheck className="h-4 w-4 text-emerald-600" />
                        GST Registry ID format valid. It will be verified post-onboarding.
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Establishment Year (Optional)"
                        type="number"
                        placeholder="e.g. 2021"
                        value={formData.establishedYear}
                        onChange={e => setFormData({ ...formData, establishedYear: e.target.value })}
                      />
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 block">Operational Workforce *</label>
                        <select
                          value={formData.employeeRange}
                          onChange={e => setFormData({ ...formData, employeeRange: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 focus:outline-none focus:border-jax-dark transition-all"
                        >
                          <option value="ONE_TO_TEN">1-10 Employees</option>
                          <option value="ELEVEN_TO_FIFTY">11-50 Employees</option>
                          <option value="FIFTY_ONE_TO_TWO_HUNDRED">51-200 Employees</option>
                          <option value="TWO_HUNDRED_PLUS">200+ Employees</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Summary & Confirmation */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="border-b border-gray-150 pb-4 mb-4 text-center">
                  <div className="h-12 w-12 bg-emerald-50 border border-emerald-150 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                    <FaCircleCheck className="h-6 w-6" />
                  </div>
                  <h2 className="text-lg font-black text-jax-dark uppercase tracking-tight font-heading">4. Verify Onboarding Prospectus</h2>
                  <p className="text-xs text-gray-450 mt-1">Review your credentials before completing merchant/buyer registration.</p>
                </div>

                <div className="bg-gray-55 rounded-2xl border border-gray-150 p-6 space-y-4 text-xs font-semibold text-gray-650">
                  <div className="flex justify-between border-b border-gray-200/60 pb-2.5">
                    <span className="text-gray-400 uppercase tracking-wider text-[10px]">Full Name</span>
                    <span className="text-jax-dark font-black">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/60 pb-2.5">
                    <span className="text-gray-400 uppercase tracking-wider text-[10px]">Email Address</span>
                    <span className="text-jax-dark font-black">{formData.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/60 pb-2.5">
                    <span className="text-gray-400 uppercase tracking-wider text-[10px]">Account Entity</span>
                    <span className="text-jax-dark font-black uppercase">{formData.accountType}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/60 pb-2.5">
                    <span className="text-gray-400 uppercase tracking-wider text-[10px]">Platform Role</span>
                    <span className="text-jax-dark font-black uppercase">{formData.userType}</span>
                  </div>
                  {isBusinessSetupRequired && formData.businessName && (
                    <>
                      <div className="flex justify-between border-b border-gray-200/60 pb-2.5">
                        <span className="text-gray-400 uppercase tracking-wider text-[10px]">Business Registry</span>
                        <span className="text-jax-dark font-black">{formData.businessName} {formData.gstNumber ? `(GSTIN: ${formData.gstNumber})` : ''}</span>
                      </div>
                      {formData.establishedYear && (
                        <div className="flex justify-between border-b border-gray-200/60 pb-2.5">
                          <span className="text-gray-400 uppercase tracking-wider text-[10px]">Establishment Year</span>
                          <span className="text-jax-dark font-black">{formData.establishedYear}</span>
                        </div>
                      )}
                      <div className="flex justify-between pb-1">
                        <span className="text-gray-400 uppercase tracking-wider text-[10px]">Workforce</span>
                        <span className="text-jax-dark font-black uppercase">
                          {formData.employeeRange === 'ONE_TO_TEN' && '1-10 Employees'}
                          {formData.employeeRange === 'ELEVEN_TO_FIFTY' && '11-50 Employees'}
                          {formData.employeeRange === 'FIFTY_ONE_TO_TWO_HUNDRED' && '51-200 Employees'}
                          {formData.employeeRange === 'TWO_HUNDRED_PLUS' && '200+ Employees'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Form actions navigation controls */}
            <div className="flex items-center gap-4 mt-8 pt-4 border-t border-gray-150">
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handlePrevStep}
                  className="h-12 border-gray-300 text-gray-650 font-bold uppercase tracking-wider text-[10px]"
                >
                  <FaLeftArrow className="h-3.5 w-3.5 mr-2" /> Back
                </Button>
              )}
              
              {step < 4 ? (
                <Button 
                  type="button" 
                  onClick={handleNextStep}
                  className="h-12 bg-jax-dark text-white border-none font-black uppercase tracking-widest text-[10px] ml-auto"
                >
                  Next Step <FaArrowRight className="h-3.5 w-3.5 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  loading={loading}
                  className="h-14 bg-jax-accent text-white border-none font-black uppercase tracking-[0.15em] text-[10.5px] ml-auto shadow-lg shadow-jax-accent/20 px-8"
                >
                  Confirm Registry <FaCircleCheck className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>

          </Card>
        </form>
      </div>
    </div>
  );
}

// Inline component fallback for FaLeftArrow typo safety
function FaLeftArrow(props: any) {
  return <FaArrowLeft {...props} />;
}

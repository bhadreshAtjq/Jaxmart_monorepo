
'use client';
import React from 'react';
import { useAuthStore } from '@/lib/store';
import { Card, Button, Container } from '@/components/ui';
import { FaShieldHalved, FaArrowRight, FaUserGear, FaCircleCheck } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';

interface RequirementGateProps {
  children: React.ReactNode;
  allowedStatuses?: string[];
  message?: string;
  actionRequired?: 'PROFILE' | 'KYC' | 'BOTH';
}

export function RequirementGate({ 
  children, 
  allowedStatuses = ['VERIFIED'],
  message = "Access restricted to verified industrial partners.",
  actionRequired = 'BOTH'
}: RequirementGateProps) {
  const { user, isLoggedIn } = useAuthStore();
  const router = useRouter();

  if (!isLoggedIn) {
    return null; // Layout should handle login redirect
  }

  const isKycVerified = allowedStatuses.includes(user?.kycStatus || 'PENDING');
  // Simple check for profile completion - normally we'd check more fields
  const isProfileComplete = user?.fullName && user?.phone;

  const showGate = !isKycVerified;

  if (showGate) {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none select-none">
          {children}
        </div>
        
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-white/40 backdrop-blur-[2px]">
          <Card className="max-w-xl w-full p-12 border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[40px] text-center relative overflow-hidden animate-in fade-in zoom-in duration-500">
             {/* Background Decoration */}
             <div className="absolute -top-24 -right-24 h-48 w-48 bg-jax-blue/5 rounded-full blur-3xl" />
             <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-jax-accent/5 rounded-full blur-3xl" />

             <div className="relative z-10">
                <div className="h-20 w-20 bg-jax-dark rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl relative group">
                   <div className="absolute inset-0 bg-jax-blue/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                   <FaShieldHalved className="h-8 w-8 text-jax-accent relative z-10" />
                </div>

                <h2 className="text-3xl font-heading font-black text-jax-dark tracking-tighter uppercase leading-tight mb-4">
                  Verification Required
                </h2>
                <p className="text-gray-500 font-medium mb-10 max-w-sm mx-auto">
                  To ensure marketplace integrity and secure high-value trade, all {user?.userType === 'SELLER' ? 'sellers' : 'buyers'} must complete identity verification.
                </p>

                <div className="space-y-4 mb-10">
                   <StepItem 
                     icon={<FaUserGear />} 
                     title="Business Profile" 
                     desc="Configure your organization's legal identity."
                     met={true} // For now assume basic profile is done since they are logged in
                   />
                   <StepItem 
                     icon={<FaShieldHalved />} 
                     title="KYC Verification" 
                     desc="Submit official documents for audit."
                     met={user?.kycStatus === 'VERIFIED'}
                     status={user?.kycStatus}
                   />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                   <Button 
                     variant="dark" 
                     fullWidth 
                     className="h-14 rounded-2xl text-[10px] uppercase font-black tracking-widest"
                     onClick={() => router.push('/profile')}
                     icon={<FaArrowRight />}
                   >
                     Complete Onboarding
                   </Button>
                </div>
                
                <p className="mt-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Audit typically completed within 24-48 business hours.
                </p>
             </div>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function StepItem({ icon, title, desc, met, status }: { icon: React.ReactNode; title: string; desc: string; met: boolean; status?: string }) {
  return (
    <div className={clsx(
      "flex items-center gap-5 p-5 rounded-3xl border transition-all text-left",
      met ? "bg-emerald-50/50 border-emerald-100" : "bg-gray-50 border-gray-100"
    )}>
       <div className={clsx(
         "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
         met ? "bg-emerald-500 text-white" : "bg-white text-gray-400 shadow-sm"
       )}>
         {met ? <FaCircleCheck className="h-5 w-5" /> : icon}
       </div>
       <div className="flex-1">
          <div className="flex items-center justify-between">
             <p className={clsx("text-xs font-black uppercase tracking-tight", met ? "text-emerald-900" : "text-jax-dark")}>{title}</p>
             {status && !met && (
               <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md">
                 {status}
               </span>
             )}
          </div>
          <p className="text-[10px] text-gray-400 font-medium leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}

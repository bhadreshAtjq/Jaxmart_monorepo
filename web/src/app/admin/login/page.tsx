'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaShieldHalved, FaLock, FaBolt, FaSpinner, FaArrowRight } from 'react-icons/fa6';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth, isLoggedIn, user } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'ID' | 'GATE'>('ID');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user?.isAdmin) {
      router.replace('/admin');
    }
  }, [isLoggedIn, user, router]);

  const handleAccessRequest = async () => {
    if (!phone) {
      toast.error('PROTOCOL ERROR: Identifier Required');
      return;
    }
    setLoading(true);
    try {
      await authApi.sendOtp(phone);
      setStep('GATE');
      toast.success('Access Tokens Transmitted to Secure Device');
    } catch {
      toast.error('Identity Authorization Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGateVerify = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp(phone, otp);
      if (!data.user.isAdmin) {
        toast.error('Unauthorized Access: Administrative Credentials Not Detected');
        return;
      }
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('Administrative Clearance Granted');
      router.push('/admin');
    } catch {
      toast.error('Authentication Sequence Mismatch');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D10] flex items-center justify-center p-6 font-heading">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-jax-blue rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-jax-accent rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Elite Security Badge */}
        <div className="flex flex-col items-center mb-10">
          <div className="h-20 w-20 bg-jax-dark rounded-[2rem] border-2 border-white/10 flex items-center justify-center shadow-2xl relative group">
            <div className="absolute inset-0 bg-jax-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <FaShieldHalved className="h-8 w-8 text-jax-accent relative z-10" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-[0.25em] mt-6">Admin Console</h1>
          <p className="text-[10px] font-bold text-jax-blue uppercase tracking-widest mt-2">Authorized Personnel Only</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-jax-accent to-transparent" />

          {step === 'ID' ? (
            <div className="space-y-8">
              <div className="text-center">
                <p className="text-xs text-white/50 font-medium">Initiate Identity Handshake</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Master Identifier</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl h-14 px-12 text-white font-black tracking-widest focus:ring-2 ring-jax-accent/20 outline-none transition-all"
                      placeholder="9876543210"
                    />
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 h-4 w-4" />
                  </div>
                </div>

                <button
                  onClick={handleAccessRequest}
                  disabled={loading}
                  className="w-full h-14 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-jax-accent transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {loading ? <FaSpinner className="h-4 w-4 animate-spin" /> : <>Access Request <FaArrowRight className="h-3 w-3" /></>}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <p className="text-xs text-white/50 font-medium">Verify Authorization Token</p>
                <p className="text-[10px] text-jax-accent font-black uppercase tracking-widest mt-1">Transmitted to +91 {phone}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">One-Time Gateway Key</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        setOtp(val);
                        if (val.length === 6) handleGateVerify();
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl h-16 text-center text-3xl text-jax-accent font-black tracking-[0.5em] focus:ring-2 ring-jax-accent/20 outline-none transition-all placeholder:text-white/5"
                      placeholder="000000"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button onClick={() => setStep('ID')} className="text-[10px] font-black text-white/30 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                    <FaBolt className="h-3 w-3" /> Reset Sequence
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] leading-relaxed">
            Security Protocol: All entry attempts are logged.<br />
            Unauthorized access subject to trade termination.
          </p>
        </div>
      </div>
    </div>
  );
}

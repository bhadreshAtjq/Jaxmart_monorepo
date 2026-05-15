'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowRight, FaSpinner } from 'react-icons/fa6';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isLoggedIn } = useAuthStore();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { if (isLoggedIn) router.replace('/home'); }, [isLoggedIn]);

  useEffect(() => {
    // Detect country based on IP
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.country_code) setCountry(data.country_code.toLowerCase());
      })
      .catch(() => {});
  }, []);

  const [country, setCountry] = useState('in');

  useEffect(() => {
    if (countdown > 0) { const t = setTimeout(() => setCountdown(c => c - 1), 1000); return () => clearTimeout(t); }
  }, [countdown]);

  const handleSendOtp = async () => {
    if (phone.length < 7) { toast.error('Enter a valid mobile number'); return; }
    setLoading(true);
    try {
      await authApi.sendOtp(phone);
      setStep('otp');
      setCountdown(30);
      toast.success('OTP sent to your number');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch { toast.error('Failed to send OTP. Try again.'); }
    finally { setLoading(false); }
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
    if (next.every(d => d) && next.join('').length === 6) verifyOtp(next.join(''));
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const verifyOtp = async (code: string) => {
    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp(phone, code);
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(data.isNew ? 'Welcome to JaxMart!' : 'Welcome back!');
      router.push(data.isNew ? '/auth/setup' : '/home');
    } catch { toast.error('Invalid OTP. Please try again.'); setOtp(['', '', '', '', '', '']); inputRefs.current[0]?.focus(); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-jax-dark flex">
      {/* Left: Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-jax-dark via-jax-blue/30 to-jax-dark" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-10 w-10 rounded-xl bg-jax-teal flex items-center justify-center">
              <span className="text-white font-heading font-extrabold text-lg">J</span>
            </div>
            <span className="font-heading font-bold text-white text-xl tracking-tight">JaxMart</span>
          </div>
          <h1 className="text-4xl font-heading font-bold text-white leading-tight mb-4">
            India&apos;s trusted<br />B2B marketplace
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-sm">
            Source products, hire verified suppliers, and transact safely with escrow protection.
          </p>
        </div>
        <div className="relative z-10 space-y-5">
          {[
            { title: 'GST Verified Sellers', desc: 'Every supplier on JaxMart is identity-verified.' },
            { title: 'Escrow Protection', desc: 'Payments released only after delivery confirmation.' },
            { title: 'AI-Powered Matching', desc: 'Get the best quotes from relevant suppliers instantly.' },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="h-2 w-2 rounded-full bg-jax-teal mt-2 shrink-0" />
              <div>
                <p className="text-sm font-heading font-semibold text-white/80">{item.title}</p>
                <p className="text-xs text-white/30 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Form Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-jax-light">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-jax-teal flex items-center justify-center">
                <span className="text-white font-heading font-extrabold text-lg">J</span>
              </div>
              <span className="font-heading font-bold text-jax-dark text-xl tracking-tight">JaxMart</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/60 p-8 shadow-card">
            {step === 'phone' ? (
              <>
                <h2 className="text-xl font-heading font-bold text-jax-dark mb-1">Sign in or create account</h2>
                <p className="text-sm text-gray-400 mb-8">Enter your mobile number to continue</p>
                <div className="mb-8 phone-input-container">
                  <label className="label mb-3 block">Mobile number</label>
                  <PhoneInput
                    country={country}
                    value={phone}
                    onChange={val => setPhone(val)}
                    containerClass="!w-full"
                    inputClass="!w-full !h-14 !bg-jax-light !border-gray-200 !rounded-xl !text-sm !font-heading !font-semibold !text-jax-dark !pl-16 focus:!ring-2 focus:!ring-jax-blue/20"
                    buttonClass="!bg-jax-light !border-gray-200 !rounded-l-xl !w-12 !flex !justify-center"
                    dropdownClass="!rounded-xl !shadow-2xl !border-gray-100 !mt-2"
                    enableSearch={true}
                    searchPlaceholder="Search country..."
                  />
                </div>
                <style jsx global>{`
                  .phone-input-container .react-tel-input .flag-dropdown:hover,
                  .phone-input-container .react-tel-input .flag-dropdown.open {
                    background-color: #f8fafc !important;
                  }
                  .phone-input-container .react-tel-input .selected-flag {
                    width: 48px !important;
                    padding: 0 0 0 12px !important;
                  }
                `}</style>
                <button
                  onClick={handleSendOtp}
                  disabled={loading || phone.length < 7}
                  className="w-full flex items-center justify-center gap-2.5 bg-jax-blue text-white font-heading font-semibold rounded-xl py-3.5 hover:bg-jax-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-btn"
                >
                  {loading ? <FaSpinner className="h-4 w-4 animate-spin" /> : <><span>Get OTP</span><FaArrowRight className="h-3.5 w-3.5" /></>}
                </button>
                <p className="text-[11px] text-gray-400 text-center mt-6">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </>
            ) : (
              <>
                <button onClick={() => setStep('phone')} className="text-sm text-jax-blue mb-6 flex items-center gap-1.5 hover:underline font-medium">
                  Change number
                </button>
                <h2 className="text-xl font-heading font-bold text-jax-dark mb-1">Enter verification code</h2>
                <p className="text-sm text-gray-400 mb-8">Sent to +91 {phone}</p>
                <div className="flex gap-2.5 justify-center mb-8">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { inputRefs.current[i] = el; }}
                      type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-xl font-heading font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-jax-blue/20 focus:border-jax-blue bg-white transition-all duration-150"
                    />
                  ))}
                </div>
                {loading && <div className="flex justify-center mb-6"><FaSpinner className="h-5 w-5 animate-spin text-jax-blue" /></div>}
                <div className="text-center text-sm text-gray-400">
                  {countdown > 0 ? `Resend in ${countdown}s` : (
                    <button onClick={() => { authApi.sendOtp(phone); setCountdown(30); toast.success('OTP resent'); }} className="text-jax-blue font-heading font-semibold hover:underline">
                      Resend OTP
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-8 mt-8 text-[11px] text-gray-400 font-medium">
            <span className="flex items-center gap-1.5">Secure login</span>
            <span className="flex items-center gap-1.5">GST verified</span>
            <span className="flex items-center gap-1.5">Escrow protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}

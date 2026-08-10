'use client';
import React, { useState } from 'react';
import { useRazorpay } from '@/lib/useRazorpay';
import { useAuthStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import { FaShieldHalved, FaCreditCard, FaLock, FaCircleCheck, FaXmark } from 'react-icons/fa6';

interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  amount: number;
  currency?: string;
  title?: string;
  description?: string;
  onSuccess?: (paymentId: string) => void;
}

export const RazorpayCheckoutModal: React.FC<RazorpayCheckoutModalProps> = ({
  isOpen,
  onClose,
  orderId,
  amount,
  currency = 'INR',
  title = 'JaxMart Payment',
  description = 'Secure B2B Escrow Payment via Razorpay Test Mode',
  onSuccess,
}) => {
  const { user } = useAuthStore();
  const { openCheckout, loading, error } = useRazorpay();
  const [successPaymentId, setSuccessPaymentId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePayNow = () => {
    openCheckout({
      orderId,
      amount,
      currency,
      name: 'JaxMart Global B2B',
      description: title || description,
      prefill: {
        name: user?.fullName || 'Test Customer',
        email: user?.email || 'customer@example.com',
        contact: user?.phone || '9999999999',
      },
      onSuccess: (data) => {
        setSuccessPaymentId(data.paymentId);
        toast.success('Payment verified & completed successfully!');
        if (onSuccess) onSuccess(data.paymentId);
      },
      onError: (err) => {
        const msg = typeof err === 'string' ? err : err?.message || 'Payment failed or cancelled';
        toast.error(msg);
      },
      onDismiss: () => {
        toast('Checkout closed', { icon: 'ℹ️' });
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
          >
            <FaXmark className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              <FaShieldHalved className="h-3 w-3" /> Razorpay Test Mode
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight">{title}</h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{description}</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {successPaymentId ? (
            <div className="text-center py-6 space-y-3">
              <div className="mx-auto h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <FaCircleCheck className="h-9 w-9" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Payment Verified!</h3>
              <p className="text-xs text-slate-500">
                Razorpay Payment ID: <span className="font-mono font-bold text-slate-800">{successPaymentId}</span>
              </p>
              <button
                onClick={onClose}
                className="mt-4 w-full py-3 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-all shadow-md"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Payment Summary Box */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">₹{amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Escrow & Processing Fee</span>
                  <span className="font-bold text-emerald-600">FREE (Test Mode)</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900">Total Payable</span>
                  <span className="text-2xl font-black text-blue-600">
                    ₹{amount.toLocaleString('en-IN')} <span className="text-xs font-semibold text-slate-400">{currency}</span>
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3.5 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-100 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Security Banner */}
              <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl text-xs text-blue-900 border border-blue-100">
                <FaLock className="h-4 w-4 text-blue-600 shrink-0" />
                <span>HMAC-SHA256 Server Verified • 256-bit SSL Test Mode</span>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayNow}
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-blue-600/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Initializing Razorpay...
                  </>
                ) : (
                  <>
                    <FaCreditCard className="h-4 w-4" />
                    Pay ₹{amount.toLocaleString('en-IN')} via Razorpay
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Powered by Razorpay Payment Gateway (Test Environment)
          </p>
        </div>
      </div>
    </div>
  );
};

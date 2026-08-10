'use client';
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { RazorpayCheckoutModal } from '@/components/payments/RazorpayCheckoutModal';
import { paymentApi } from '@/lib/api';
import { Card, Button, Container } from '@/components/ui';
import { 
  FaShieldHalved, FaCreditCard, FaCircleCheck, 
  FaClockRotateLeft, FaLock, FaCircleExclamation, FaFlask
} from 'react-icons/fa6';
import { toast } from 'react-hot-toast';

export default function PaymentTestPage() {
  const [amount, setAmount] = useState<number>(1000);
  const [description, setDescription] = useState<string>('Test B2B Procurement');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [lastPayment, setLastPayment] = useState<any>(null);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await paymentApi.getHistory();
      if (res.data?.success) {
        setPaymentHistory(res.data.payments || []);
      }
    } catch (err) {
      console.log('Payment history fetch notice (requires login):', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handlePaymentSuccess = (paymentId: string) => {
    setLastPayment({
      paymentId,
      amount,
      currency: 'INR',
      timestamp: new Date().toISOString(),
    });
    fetchHistory();
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto pb-24 space-y-8">
        
        {/* Banner Header */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 md:p-12 shadow-2xl border border-slate-800">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <FaFlask className="h-80 w-80 text-blue-400" />
          </div>
          
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              <FaShieldHalved className="h-3.5 w-3.5" /> Razorpay Test Environment
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-heading">
              Razorpay Payment Gateway Test Lab
            </h1>
            
            <p className="text-sm text-slate-300 leading-relaxed font-body">
              Test end-to-end payment creation, Razorpay modal checkout, and server-side HMAC-SHA256 signature verification directly from your browser.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Interactive Payment Form */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-8 space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FaCreditCard className="text-blue-600 h-5 w-5" /> Test Payment Request
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Customize amount and initiate Razorpay Checkout</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  Test Credentials Loaded
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-2">
                    Amount (INR ₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="1000"
                    />
                  </div>
                </div>

                {/* Preset Amount Pills */}
                <div className="flex gap-2">
                  {[100, 500, 1000, 5000, 10000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        amount === preset
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      ₹{preset.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-2">
                    Payment Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="E.g. Catalog Bulk Order Payment"
                  />
                </div>
              </div>

              {/* Trigger Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
              >
                <FaCreditCard className="h-4 w-4" />
                Launch Razorpay Checkout (₹{amount.toLocaleString('en-IN')})
              </button>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <FaLock className="text-slate-400" /> Security Flow Executed:
                </p>
                <ol className="text-[11px] text-slate-600 space-y-1 pl-5 list-decimal font-medium">
                  <li>Backend API generates Razorpay Order ID (<code className="text-blue-600">POST /api/payments/razorpay/order</code>)</li>
                  <li>Razorpay Modal opens using Key ID: <code className="text-blue-600">rzp_test_TAD6o4dQhjpACS</code></li>
                  <li>After checkout, server verifies HMAC-SHA256 signature (<code className="text-blue-600">POST /api/payments/razorpay/verify</code>)</li>
                </ol>
              </div>
            </Card>

            {/* Last Successful Payment Result Card */}
            {lastPayment && (
              <Card className="p-6 bg-emerald-50/50 border-emerald-200 space-y-3">
                <div className="flex items-center gap-3 text-emerald-800">
                  <FaCircleCheck className="h-6 w-6 text-emerald-500 shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm">Last Payment Verified Successfully!</h3>
                    <p className="text-xs text-emerald-700">Server verified Razorpay signature via HMAC-SHA256</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-100 text-xs font-mono space-y-1 text-slate-800">
                  <div><span className="text-slate-400">Payment ID:</span> {lastPayment.paymentId}</div>
                  <div><span className="text-slate-400">Amount Paid:</span> ₹{lastPayment.amount} {lastPayment.currency}</div>
                  <div><span className="text-slate-400">Timestamp:</span> {new Date(lastPayment.timestamp).toLocaleString()}</div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Helper Card & Payment History */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Razorpay Test Credentials Helper Box */}
            <Card className="p-6 bg-amber-50/60 border-amber-200/80 space-y-4">
              <h3 className="text-sm font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                <FaFlask className="text-amber-600" /> Razorpay Test Card Info
              </h3>
              <div className="text-xs text-amber-800 space-y-2 font-medium">
                <p>Use these details in the Razorpay Modal checkout:</p>
                <div className="p-3 bg-white/80 rounded-xl border border-amber-200 font-mono text-[11px] space-y-1 text-slate-900">
                  <div><strong>Card Number:</strong> 4111 1111 1111 1111</div>
                  <div><strong>Expiry:</strong> 12 / 30</div>
                  <div><strong>CVV:</strong> 123</div>
                  <div><strong>UPI ID:</strong> success@razorpay</div>
                </div>
                <p className="text-[10px] text-amber-700">When prompted by the Razorpay popup, click <strong>"Success"</strong> to complete verification.</p>
              </div>
            </Card>

            {/* Recent Payment History */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FaClockRotateLeft className="text-slate-400" /> Payment Audit History
                </h3>
                <button
                  onClick={fetchHistory}
                  className="text-[10px] font-bold text-blue-600 hover:underline uppercase"
                >
                  Refresh
                </button>
              </div>

              {loadingHistory ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading payment history...</div>
              ) : paymentHistory.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {paymentHistory.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">₹{p.amount?.toLocaleString('en-IN')} {p.currency}</p>
                        <p className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">{p.razorpayOrderId || p.id}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          p.status === 'SUCCESS' || p.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : p.status === 'FAILED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {p.status}
                        </span>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                  No payment records found yet.
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Razorpay Test Modal Component */}
      <RazorpayCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amount={amount}
        currency="INR"
        title={description || 'JaxMart Test Payment'}
        description="Razorpay Test Mode Checkout"
        onSuccess={handlePaymentSuccess}
      />
    </AppLayout>
  );
}

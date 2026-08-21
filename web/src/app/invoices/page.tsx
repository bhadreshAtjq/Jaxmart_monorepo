'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button, Card, Badge, Container } from '@/components/ui';
import { useUserInvoices, useUserPurchases, useUserRefunds, revalidate } from '@/lib/hooks';
import { paymentApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import {
  FaReceipt,
  FaFileInvoiceDollar,
  FaArrowRotateLeft,
  FaDownload,
  FaPrint,
  FaEye,
  FaShieldHalved,
  FaBuildingColumns,
  FaClock,
  FaCheck,
  FaXmark,
  FaBoxOpen,
  FaArrowUpRightFromSquare,
  FaMagnifyingGlass,
  FaPlus,
} from 'react-icons/fa6';
import { ShieldCheck, TrendingUp, AlertTriangle, CheckCircle2, FileText, ArrowRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadTaxInvoice, printTaxInvoice } from '@/lib/invoiceGenerator';

export default function InvoicesAndPurchasesPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();
  const [tab, setTab] = useState<'invoices' | 'purchases' | 'refunds'>('invoices');

  const { data: invoicesData, isLoading: invoicesLoading } = useUserInvoices();
  const { data: purchasesData, isLoading: purchasesLoading } = useUserPurchases();
  const { data: refundsData, isLoading: refundsLoading } = useUserRefunds();

  const invoices = invoicesData?.invoices || [];
  const purchases = purchasesData?.purchases || [];
  const refunds = refundsData?.refunds || [];

  // Tax Invoice Viewer Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // Request Refund Modal State
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundForm, setRefundForm] = useState({
    orderId: '',
    reason: 'SPECIFICATION_MISMATCH',
    description: '',
    evidenceUrls: '',
  });
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const handleViewInvoice = async (invoiceId: string) => {
    setInvoiceLoading(true);
    try {
      const res = await paymentApi.getInvoice(invoiceId);
      setSelectedInvoice(res.data.invoice);
    } catch (err: any) {
      toast.error('Failed to load invoice details');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleDirectDownload = async (invoiceId: string) => {
    try {
      const res = await paymentApi.getInvoice(invoiceId);
      if (res.data?.invoice) {
        downloadTaxInvoice(res.data.invoice);
        toast.success('Downloading Official Tax Invoice...');
      }
    } catch {
      toast.error('Failed to download invoice');
    }
  };

  const handleRequestRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundForm.orderId) {
      toast.error('Please select an order to refund');
      return;
    }
    setSubmittingRefund(true);
    try {
      await paymentApi.requestRefund(refundForm.orderId, {
        reason: refundForm.reason,
        description: refundForm.description,
        evidenceUrls: refundForm.evidenceUrls ? refundForm.evidenceUrls.split(',').map((s) => s.trim()) : [],
      });
      toast.success('🎉 Refund request submitted to Admin Escrow mediation queue!');
      setShowRefundModal(false);
      setRefundForm({ orderId: '', reason: 'SPECIFICATION_MISMATCH', description: '', evidenceUrls: '' });
      revalidate.orders();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to submit refund request');
    } finally {
      setSubmittingRefund(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <PublicLayout>
        <Container size="md" className="py-24 text-center">
          <div className="h-16 w-16 bg-slate-100 text-slate-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <FaReceipt className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to Access Invoices & Purchases</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 mb-6">
            View GST-compliant tax invoices, track escrow fund deposits, and manage purchases and refund claims.
          </p>
          <Button onClick={() => router.push('/auth/login?redirect=/invoices')} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl">
            Sign In with Mobile OTP
          </Button>
        </Container>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-slate-50 min-h-screen py-10">
        <Container size="xl">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                  Financial Ledger
                </span>
                <span className="text-xs text-slate-400 font-bold">•</span>
                <span className="text-xs text-slate-500 font-medium">{user?.businessProfile?.businessName || user?.fullName}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Invoices, Purchases & Refunds</h1>
              <p className="text-xs text-slate-500 mt-1">
                Official GST tax invoices, wholesale purchase escrow tracking, and dispute refund management.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowRefundModal(true)}
                variant="outline"
                className="rounded-2xl text-xs font-bold border-slate-300 text-slate-700 flex items-center gap-2"
              >
                <FaArrowRotateLeft className="h-3.5 w-3.5 text-slate-500" />
                <span>Request a Refund</span>
              </Button>
              <Button
                onClick={() => router.push('/pricing')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2"
              >
                <span>Upgrade Plan</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex bg-slate-200/70 p-1.5 rounded-2xl w-fit my-6">
            <button
              onClick={() => setTab('invoices')}
              className={clsx(
                'px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
                tab === 'invoices' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <FaReceipt className="h-3.5 w-3.5 text-indigo-600" />
              <span>Tax Invoices ({invoices.length})</span>
            </button>
            <button
              onClick={() => setTab('purchases')}
              className={clsx(
                'px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
                tab === 'purchases' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <FaBoxOpen className="h-3.5 w-3.5 text-emerald-600" />
              <span>All Purchases & Escrow ({purchases.length})</span>
            </button>
            <button
              onClick={() => setTab('refunds')}
              className={clsx(
                'px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
                tab === 'refunds' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <FaArrowRotateLeft className="h-3.5 w-3.5 text-amber-600" />
              <span>Refund Claims ({refunds.length})</span>
            </button>
          </div>

          {/* Tab 1: Tax Invoices */}
          {tab === 'invoices' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Official GST-Compliant Tax Invoices</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Download or print digital tax invoices with HSN/SAC codes and 18% GST calculation</p>
                </div>
              </div>

              {!invoices.length ? (
                <div className="p-16 text-center text-slate-400 text-xs font-medium">
                  <FileText className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  No tax invoices generated yet. Invoices are automatically issued upon plan purchase or order payment.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                      <tr>
                        <th className="py-3.5 px-6">Invoice #</th>
                        <th className="py-3.5 px-6">Description / Plan</th>
                        <th className="py-3.5 px-6">Party / Issuer</th>
                        <th className="py-3.5 px-6">Taxable + GST</th>
                        <th className="py-3.5 px-6">Total Amount</th>
                        <th className="py-3.5 px-6">Status</th>
                        <th className="py-3.5 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {invoices.map((inv: any) => (
                        <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-6 font-mono font-bold text-indigo-900">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-bold text-slate-900">{inv.title}</p>
                            <p className="text-[10px] text-slate-400">{new Date(inv.issuedAt).toLocaleDateString('en-IN')}</p>
                          </td>
                          <td className="py-4 px-6 text-slate-600">
                            {inv.party}
                          </td>
                          <td className="py-4 px-6 text-slate-500 text-[11px]">
                            ₹{inv.taxableAmount} + ₹{inv.gstAmount} (18%)
                          </td>
                          <td className="py-4 px-6 font-black text-slate-900 text-sm">
                            ₹{inv.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-6">
                            <span className={clsx(
                              'text-[10px] font-bold uppercase px-2.5 py-1 rounded-full',
                              inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : inv.status === 'REFUNDED' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                            )}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewInvoice(inv.id)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                              >
                                <FaEye className="h-3 w-3" /> View
                              </button>
                              <button
                                onClick={() => handleDirectDownload(inv.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
                              >
                                <FaDownload className="h-3 w-3" /> Download
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Purchases & Escrow History */}
          {tab === 'purchases' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Purchase Ledger & Escrow Settlement Timeline</h3>
                <p className="text-xs text-slate-500 mt-0.5">Track your orders, memberships, and lead credit purchases with milestone protection</p>
              </div>

              {!purchases.length ? (
                <div className="p-16 text-center text-slate-400 text-xs font-medium">
                  <FaBoxOpen className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  No purchases recorded yet. Browse listings or RFQs to begin trading.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                      <tr>
                        <th className="py-3.5 px-6">Purchase Item</th>
                        <th className="py-3.5 px-6">Type</th>
                        <th className="py-3.5 px-6">Merchant / Supplier</th>
                        <th className="py-3.5 px-6">Amount</th>
                        <th className="py-3.5 px-6">Escrow Status</th>
                        <th className="py-3.5 px-6">Date</th>
                        <th className="py-3.5 px-6 text-right">Tax Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {purchases.map((p: any) => (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-6">
                            <p className="font-bold text-slate-900 text-xs">{p.title}</p>
                            <p className="text-[10px] text-slate-400 font-mono">Ref: {p.orderNumber}</p>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px] uppercase">
                              {p.purchaseType.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-medium text-slate-800">
                            {p.seller}
                          </td>
                          <td className="py-4 px-6 font-black text-slate-900 text-sm">
                            ₹{p.totalAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-6">
                            <span className={clsx(
                              'text-[10px] font-bold uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1',
                              p.escrowStatus === 'HELD' ? 'bg-amber-100 text-amber-900' : p.escrowStatus === 'RELEASED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-900'
                            )}>
                              <ShieldCheck className="h-3 w-3" /> {p.escrowStatus}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-500">
                            {new Date(p.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewInvoice(p.id)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                              >
                                <FaEye className="h-3 w-3" /> View
                              </button>
                              <button
                                onClick={() => handleDirectDownload(p.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
                              >
                                <FaDownload className="h-3 w-3" /> Download
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Refund Claims */}
          {tab === 'refunds' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Escrow Refund & Mediation Claims</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Refund requests audited by JaxMart neutral mediation officers</p>
                </div>
                <Button
                  onClick={() => setShowRefundModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  + New Refund Request
                </Button>
              </div>

              {!refunds.length ? (
                <div className="p-16 text-center text-slate-400 text-xs font-medium">
                  <FaCheck className="h-10 w-10 mx-auto text-emerald-400 mb-2" />
                  No refund requests on file. All your wholesale transactions are currently healthy.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                      <tr>
                        <th className="py-3.5 px-6">Order Ref</th>
                        <th className="py-3.5 px-6">Reason Claimed</th>
                        <th className="py-3.5 px-6">Supplier</th>
                        <th className="py-3.5 px-6">Claim Amount</th>
                        <th className="py-3.5 px-6">Claim Status</th>
                        <th className="py-3.5 px-6">Resolution Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {refunds.map((r: any) => (
                        <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-6 font-mono font-bold text-slate-900">
                            #{r.orderNumber}
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-bold text-slate-900">{r.reason.replace('_', ' ')}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{r.description || 'Full Escrow Refund Claim'}</p>
                          </td>
                          <td className="py-4 px-6 text-slate-700">{r.sellerName}</td>
                          <td className="py-4 px-6 font-black text-slate-900 text-sm">
                            ₹{r.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-6">
                            <span className={clsx(
                              'text-[10px] font-bold uppercase px-2.5 py-1 rounded-full',
                              r.status === 'REFUNDED' ? 'bg-emerald-100 text-emerald-800' : r.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'
                            )}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-[11px] text-slate-600">
                            {r.resolutionNote || 'Under investigation by Admin Mediation Board'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </Container>
      </div>

      {/* ────────────────── OFFICIAL TAX INVOICE MODAL ────────────────── */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInvoice(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-8 z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Invoice Action Bar */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-200 not-printable">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                    {selectedInvoice.type}
                  </span>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">
                    ● {selectedInvoice.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadTaxInvoice(selectedInvoice)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <FaDownload className="h-3.5 w-3.5" /> Download Single-Page PDF
                  </button>
                  <button
                    onClick={() => printTaxInvoice(selectedInvoice)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <FaPrint className="h-3.5 w-3.5" /> Print
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="p-2 text-slate-400 hover:text-slate-900 rounded-xl"
                  >
                    <FaXmark className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Invoice Printable Body */}
              <div className="py-6 space-y-6 text-slate-800 printable-area">
                {/* Header Letterhead */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">TAX INVOICE</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Original for Recipient</p>
                    <p className="text-xs font-mono font-bold text-indigo-900 mt-2">Invoice #: {selectedInvoice.invoiceNumber}</p>
                    <p className="text-xs text-slate-500">Date of Issue: {new Date(selectedInvoice.date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <h3 className="text-base font-black text-slate-900">{selectedInvoice.seller?.name}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{selectedInvoice.seller?.address}</p>
                    <p className="text-xs text-slate-600">{selectedInvoice.seller?.city}, {selectedInvoice.seller?.state} - {selectedInvoice.seller?.pincode}</p>
                    <p className="text-xs font-mono font-bold text-slate-900 mt-1">GSTIN: {selectedInvoice.seller?.gstin}</p>
                    <p className="text-xs font-mono text-slate-500">PAN: {selectedInvoice.seller?.pan}</p>
                  </div>
                </div>

                {/* Billed To */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Billed To (Customer / Buyer):</span>
                  <p className="text-sm font-bold text-slate-900">{selectedInvoice.buyer?.name}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{selectedInvoice.buyer?.address}, {selectedInvoice.buyer?.city}, {selectedInvoice.buyer?.state} - {selectedInvoice.buyer?.pincode}</p>
                  <div className="flex flex-wrap gap-4 text-xs font-mono mt-2 pt-2 border-t border-slate-200">
                    <span>GSTIN: <strong>{selectedInvoice.buyer?.gstin}</strong></span>
                    <span>PAN: <strong>{selectedInvoice.buyer?.pan}</strong></span>
                    <span>Phone: <strong>{selectedInvoice.buyer?.phone || 'N/A'}</strong></span>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Item / Service Description</th>
                        <th className="p-3">HSN/SAC</th>
                        <th className="p-3">Qty</th>
                        <th className="p-3">Rate</th>
                        <th className="p-3">Taxable Value</th>
                        <th className="p-3">CGST (9%)</th>
                        <th className="p-3">SGST (9%)</th>
                        <th className="p-3 text-right">Total (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {selectedInvoice.items?.map((it: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-3 font-bold text-slate-900">{it.description}</td>
                          <td className="p-3 font-mono">{it.hsnSac}</td>
                          <td className="p-3">{it.qty}</td>
                          <td className="p-3">₹{it.rate?.toLocaleString('en-IN')}</td>
                          <td className="p-3 font-bold">₹{it.taxableValue?.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-slate-500">₹{it.cgstAmount?.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-slate-500">₹{it.sgstAmount?.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-right font-black text-slate-900">₹{it.total?.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tax Breakdown Summary */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
                  <div className="text-xs space-y-1 text-slate-500 max-w-sm">
                    <p className="font-bold text-slate-900">Payment Information:</p>
                    <p>Gateway: <strong className="text-slate-800">{selectedInvoice.payment?.method}</strong></p>
                    <p className="font-mono text-[11px]">Ref ID: <strong className="text-slate-800">{selectedInvoice.payment?.referenceId || 'ESCROW-AUTO'}</strong></p>
                    <p className="text-[10px] text-slate-400 mt-2">
                      This is a computer-generated tax invoice verified under the GST Electronic Commerce Operator Rules.
                    </p>
                  </div>

                  <div className="w-full sm:w-64 space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="flex justify-between text-slate-600">
                      <span>Taxable Subtotal:</span>
                      <span className="font-bold text-slate-900">₹{selectedInvoice.taxBreakdown?.taxableValue?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>CGST (9.0%):</span>
                      <span className="font-medium text-slate-900">₹{selectedInvoice.taxBreakdown?.cgst?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>SGST (9.0%):</span>
                      <span className="font-medium text-slate-900">₹{selectedInvoice.taxBreakdown?.sgst?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                      <span>Grand Total (INR):</span>
                      <span className="text-indigo-900">₹{selectedInvoice.taxBreakdown?.grandTotal?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ────────────────── REQUEST REFUND MODAL ────────────────── */}
      <AnimatePresence>
        {showRefundModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRefundModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full p-6 sm:p-8 z-10"
            >
              <div className="mb-6">
                <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-3">
                  <FaArrowRotateLeft className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Request Escrow Refund
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Submit a refund claim for orders currently held in Escrow before release.
                </p>
              </div>

              <form onSubmit={handleRequestRefundSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select Wholesale Order *</label>
                  <select
                    required
                    value={refundForm.orderId}
                    onChange={(e) => setRefundForm({ ...refundForm, orderId: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose an active order --</option>
                    {purchases
                      .filter((p: any) => p.purchaseType === 'DIRECT_ORDER' && p.escrowStatus !== 'RELEASED')
                      .map((p: any) => (
                        <option key={p.id} value={p.id}>
                          #{p.orderNumber} - {p.title} (₹{p.totalAmount.toLocaleString('en-IN')})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reason for Claim *</label>
                  <select
                    value={refundForm.reason}
                    onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="SPECIFICATION_MISMATCH">Product Specification Mismatch / Wrong Quality</option>
                    <option value="DAMAGED_GOODS">Goods Received Damaged in Transit</option>
                    <option value="NOT_DELIVERED">Non-Delivery Past Promised SLA Date</option>
                    <option value="MUTUAL_CANCELLATION">Mutual Agreement with Supplier to Cancel</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Detailed Explanation</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about the issue for JaxMart mediation officers..."
                    value={refundForm.description}
                    onChange={(e) => setRefundForm({ ...refundForm, description: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Evidence Photo / Document URLs (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..., https://..."
                    value={refundForm.evidenceUrls}
                    onChange={(e) => setRefundForm({ ...refundForm, evidenceUrls: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4 font-bold">
                  <button
                    type="button"
                    onClick={() => setShowRefundModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRefund}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs"
                  >
                    {submittingRefund ? 'Submitting...' : 'Submit Refund Claim'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PublicLayout>
  );
}

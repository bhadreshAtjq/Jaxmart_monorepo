'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FaBolt, FaArrowLeft, FaClock, FaTag, 
  FaFileLines, FaShieldHalved, FaCircleInfo 
} from 'react-icons/fa6';
import toast from 'react-hot-toast';

import { rfqApi } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  Button, Card, Input, Textarea, 
  PageLoader, Badge, SectionHeader, Container 
} from '@/components/ui';
import { useRfq, revalidate } from '@/lib/hooks';

export default function SubmitQuotePage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [form, setForm] = useState({
    quotedAmount: '',
    proposalText: '',
    timelineDays: '',
  });

  const { data: rfq, isLoading } = useRfq(id as string);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.quotedAmount || !form.proposalText || !form.timelineDays) {
      return toast.error('Please complete all protocol fields');
    }
    setSubmitting(true);
    try {
      await rfqApi.submitQuote(id as string, {
        ...form,
        quotedAmount: parseFloat(form.quotedAmount),
        timelineDays: parseInt(form.timelineDays),
      });
      revalidate.rfqs();
      toast.success('Your quote has been transmitted successfully.');
      router.push('/seller/rfq-inbox');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to submit quote');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <AppLayout><PageLoader /></AppLayout>;
  if (!rfq) return <AppLayout><div className="p-20 text-center">Requirement Registry Not Found</div></AppLayout>;

  return (
    <AppLayout>
      <Container size="lg" className="py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black text-jax-blue uppercase tracking-widest hover:gap-3 transition-all mb-6">
              <FaArrowLeft className="h-3 w-3" /> Abort Proposal
            </button>
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-3xl font-heading font-black text-jax-dark tracking-tighter uppercase leading-none mb-3">Submit Commercial Quote</h1>
                <p className="text-sm text-gray-400 font-medium italic">Requirement: &quot;{rfq.title}&quot;</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Buyer Budget</p>
                <p className="text-lg font-heading font-extrabold text-jax-dark">₹{rfq.budgetMin?.toLocaleString() || '0'} - {rfq.budgetMax?.toLocaleString() || 'Open'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-8 border-gray-100 shadow-xl shadow-gray-100/20 rounded-3xl">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input 
                        label="Your Quote Amount (INR)" 
                        type="number" 
                        placeholder="e.g. 45000"
                        value={form.quotedAmount}
                        onChange={e => setForm({ ...form, quotedAmount: e.target.value })}
                        icon={<FaTag className="h-3.5 w-3.5" />}
                        required
                      />
                      <Input 
                        label="Production/Lead Time (Days)" 
                        type="number" 
                        placeholder="e.g. 7"
                        value={form.timelineDays}
                        onChange={e => setForm({ ...form, timelineDays: e.target.value })}
                        icon={<FaClock className="h-3.5 w-3.5" />}
                        required
                      />
                    </div>

                    <Textarea 
                      label="Executive Proposal" 
                      placeholder="Describe your manufacturing capability, quality standards, and terms of fulfillment..."
                      value={form.proposalText}
                      onChange={e => setForm({ ...form, proposalText: e.target.value })}
                      className="min-h-[200px]"
                      required
                    />
                  </div>
                </Card>

                <div className="flex items-center gap-4">
                  <Button 
                    type="submit" 
                    loading={submitting} 
                    className="flex-1 h-14 bg-jax-dark text-white rounded-2xl shadow-xl shadow-jax-dark/20 font-black uppercase tracking-widest text-[11px]"
                  >
                    Transmit Proposal
                  </Button>
                </div>
              </form>
            </div>

            <aside className="space-y-6">
              <Card className="p-6 border-gray-100 bg-jax-light/30 border-dashed">
                <h4 className="text-[10px] font-black text-jax-blue uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <FaShieldHalved className="h-3.5 w-3.5" /> Integrity Protocol
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="h-4 w-4 rounded bg-jax-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-jax-blue" />
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Quotes are final once submitted. Ensure your commercial terms are precise.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-4 w-4 rounded bg-jax-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-jax-blue" />
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed">A 5% platform protocol fee applies to the total contract value.</p>
                  </div>
                </div>
              </Card>

              <div className="p-6 bg-white border border-gray-100 rounded-3xl">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Technical Recap</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Category</span>
                    <span className="text-[10px] font-black text-jax-dark uppercase">{rfq.category?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Type</span>
                    <Badge status={rfq.rfqType} label={rfq.rfqType} />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </Container>
    </AppLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import { 
  FaInbox, 
  FaClock, 
  FaCubes, 
  FaArrowRight,
  FaMagnifyingGlass
} from 'react-icons/fa6';

import { useRfqInbox } from '@/lib/hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  PageLoader, 
  EmptyState, 
  Card, 
  Badge, 
  Avatar, 
  Button,
  Input
} from '@/components/ui';

export default function SellerRfqInboxPage() {
  const router = useRouter();
  const [matchOnly, setMatchOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: inbox, isLoading } = useRfqInbox({ matchOnly, search: debouncedSearch });

  if (isLoading) return <AppLayout><PageLoader /></AppLayout>;

  // Assuming inbox returns { rfqs: [...] } based on the user snippet's use of inbox?.rfqs
  const rfqs = (inbox as any)?.rfqs || [];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto pb-20 pt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-heading font-black text-jax-dark tracking-tighter uppercase leading-none mb-2">Sourcing Command</h1>
            <p className="text-sm text-gray-500 font-medium italic">Active industrial requirements awaiting factory responses.</p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-full md:w-80">
              <Input
                placeholder="Search keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<FaMagnifyingGlass className="h-3.5 w-3.5" />}
                className="bg-white border-gray-200/60 rounded-2xl"
              />
            </div>
            <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm shrink-0">
              <button
                onClick={() => setMatchOnly(false)}
                className={clsx(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  !matchOnly ? "bg-jax-dark text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"
                )}
              >
                Global Board
              </button>
              <button
                onClick={() => setMatchOnly(true)}
                className={clsx(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  matchOnly ? "bg-jax-dark text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"
                )}
              >
                My Matches
              </button>
            </div>
          </div>
        </div>

        {!rfqs.length ? (
          <EmptyState
            icon={<FaInbox className="h-10 w-10 text-gray-300" />}
            title={search ? "No results found" : "Inbox is empty"}
            description={search 
              ? `We couldn't find any requirements matching "${search}".`
              : "Requirements matching your categories will appear here."
            }
          />
        ) : (
          <div className="space-y-4">
            {rfqs.map((rfq: any) => (
              <Card key={rfq.id} className="group">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge status={rfq.rfqType} />
                      <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                        <FaClock className="h-2.5 w-2.5" /> {formatDistanceToNow(new Date(rfq.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <h3 className="text-base font-heading font-bold text-jax-dark mb-2 truncate group-hover:text-jax-blue transition-colors">{rfq.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed italic">&quot;{rfq.description}&quot;</p>
                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Avatar name={rfq.buyer?.fullName || 'Buyer'} size="sm" />
                        <span className="text-xs font-heading font-bold text-gray-600">{rfq.buyer?.fullName}</span>
                      </div>
                      <div className="h-1 w-1 bg-gray-200 rounded-full" />
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <FaCubes className="h-3 w-3 text-jax-blue" />
                        {rfq.category?.name}
                      </div>
                      <div className="h-1 w-1 bg-gray-200 rounded-full" />
                      <span className="label mb-0">{rfq.quotesCount} QUOTES RECEIVED</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end shrink-0">
                    <div className="text-right">
                      <p className="label mb-0">Budget Range</p>
                      <p className="text-lg font-heading font-extrabold text-jax-dark">
                        {'\u20B9'}{rfq.budgetMin?.toLocaleString() || '0'} - {rfq.budgetMax?.toLocaleString() || 'Open'}
                      </p>
                    </div>
                    <Button onClick={() => router.push(`/rfq/${rfq.id}/quote`)} className="mt-4">
                      Submit Quote <FaArrowRight className="h-3.5 w-3.5 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

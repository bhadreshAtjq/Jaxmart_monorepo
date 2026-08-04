/**
 * Domain Hooks — SWR Best Practices
 * 
 * Each hook encapsulates:
 * 1. The API endpoint URL
 * 2. SWR configuration for that domain (revalidation strategy, dedupe interval)
 * 3. TypeScript return types
 * 4. Conditional fetching (e.g., only fetch when a tab is active)
 * 
 * This keeps pages clean — they just call `const { data } = useMyRfqs('OPEN')`
 * instead of managing URLs, keys, and options inline.
 */
import useSWR, { mutate as globalMutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import api from './api';
import { fetcher, fetcherWithParams } from './fetcher';
import { useAuthStore } from './store';

// ─── Mutation Helper ──────────────────────────────────────────────────────────
// SWR doesn't have useMutation built-in like TanStack Query.
// We use useSWRMutation for optimistic, trigger-based mutations.

async function postMutation(url: string, { arg }: { arg: any }) {
  const res = await api.post(url, arg);
  return res.data;
}

async function patchMutation(url: string, { arg }: { arg: any }) {
  const res = await api.patch(url, arg);
  return res.data;
}

async function putMutation(url: string, { arg }: { arg: any }) {
  const res = await api.put(url, arg);
  return res.data;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useCategories(parentId?: string) {
  const key = parentId ? `/categories?parentId=${parentId}` : '/categories';
  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000, // Cache for 5 minutes — categories rarely change
  });
}

export function useCategoryAttributes(categoryId?: string) {
  return useSWR(categoryId ? `/categories/${categoryId}/attributes` : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000,
  });
}

// ─── Listings ─────────────────────────────────────────────────────────────────

export function useFeaturedListings() {
  return useSWR(
    ['/listings/search', { sortBy: 'featured', limit: 8 }],
    fetcherWithParams,
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );
}

export function useNewProducts() {
  return useSWR(
    '/listings/new-products',
    fetcher,
    { refreshInterval: 5000, revalidateOnFocus: true }
  );
}

export function useListingSearch(params: Record<string, any>) {
  return useSWR(
    ['/listings/search', params],
    fetcherWithParams,
    { keepPreviousData: true }
  );
}

export function useSearchSuggestions(query: string) {
  const trimmed = query.trim();
  return useSWR(
    ['/listings/suggestions', { q: trimmed }],
    fetcherWithParams,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      keepPreviousData: true
    }
  );
}

export function useListing(id: string | undefined) {
  return useSWR(id ? `/listings/${id}` : null, fetcher);
}

export function useMyListings(params?: Record<string, any>) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  return useSWR(
    isLoggedIn ? ['/listings/seller/me', params || {}] : null,
    fetcherWithParams
  );
}

// ─── RFQ ──────────────────────────────────────────────────────────────────────

export function useMyRfqs(status: string) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  return useSWR(
    isLoggedIn ? ['/rfq/my', { status }] : null,
    fetcherWithParams,
    {
      refreshInterval: 15_000,  // Poll every 15s for new quotes
      revalidateOnFocus: true,
    }
  );
}

export function useRfq(id: string | undefined) {
  return useSWR(
    id ? `/rfq/${id}` : null,
    fetcher,
    {
      refreshInterval: 10_000,  // Live quote updates
      revalidateOnFocus: true,
    }
  );
}

export function useRfqInbox(params?: Record<string, any>) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  return useSWR(
    isLoggedIn ? ['/rfq/seller/inbox', params || {}] : null,
    fetcherWithParams,
    {
      refreshInterval: 20_000,  // Poll for new RFQ matches
      revalidateOnFocus: true,
    }
  );
}

export function useSubmitQuote(rfqId: string) {
  return useSWRMutation(`/rfq/${rfqId}/quotes`, postMutation);
}

export function useAwardQuote(rfqId: string, quoteId: string) {
  return useSWRMutation(`/rfq/${rfqId}/award/${quoteId}`, async (url) => {
    const res = await api.patch(url);
    return res.data;
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function useOrders(role: 'buyer' | 'seller') {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  return useSWR(
    isLoggedIn ? ['/orders', { role }] : null,
    fetcherWithParams,
    {
      refreshInterval: 30_000,  // Moderate polling for order updates
      revalidateOnFocus: true,
    }
  );
}

export function useOrderCounts() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  return useSWR(isLoggedIn ? 'order-counts' : null, async () => {
    const [b, s] = await Promise.all([
      api.get('/orders', { params: { role: 'buyer', limit: 1 } }),
      api.get('/orders', { params: { role: 'seller', limit: 1 } }),
    ]);
    return { buyer: b.data.total, seller: s.data.total };
  }, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });
}

export function useOrder(id: string | undefined) {
  return useSWR(
    id ? `/orders/${id}` : null,
    fetcher,
    { refreshInterval: 15_000 }
  );
}

export function useSignContract(orderId: string) {
  return useSWRMutation(`/orders/${orderId}/contract-sign`, postMutation);
}

export function useSubmitMilestone(orderId: string, milestoneId: string) {
  return useSWRMutation(`/orders/${orderId}/milestones/${milestoneId}/submit`, postMutation);
}

export function useApproveMilestone(orderId: string, milestoneId: string) {
  return useSWRMutation(`/orders/${orderId}/milestones/${milestoneId}/approve`, postMutation);
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function useProfile() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  return useSWR(isLoggedIn ? '/users/me' : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useAdminStats() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  return useSWR(isLoggedIn ? '/admin/analytics' : null, fetcher, {
    refreshInterval: 60_000,
  });
}

export function useAdminUsers(enabled: boolean, search?: string) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  return useSWR(
    isLoggedIn && enabled ? ['/admin/users', { limit: 200, search }] : null,
    fetcherWithParams
  );
}

export function useAdminKycQueue(enabled: boolean) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  return useSWR(
    isLoggedIn && enabled ? '/admin/kyc/queue' : null,
    fetcher
  );
}

// ─── Events ───────────────────────────────────────────────────────────────────

export function useEvents() {
  return useSWR('/events', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });
}

export function useAdminEvents(enabled: boolean) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  return useSWR(
    isLoggedIn && enabled ? '/admin/events' : null,
    fetcher
  );
}

export function useCreateEvent() {
  return useSWRMutation('/admin/events', postMutation);
}

export function useUpdateEvent(id: string) {
  return useSWRMutation(`/admin/events/${id}`, putMutation);
}

export function useDeleteEvent(id: string) {
  return useSWRMutation(`/admin/events/${id}`, async (url) => {
    const res = await api.delete(url);
    return res.data;
  });
}


// ─── Notifications ────────────────────────────────────────────────────────────

export function useNotifications() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  
  return useSWR(isLoggedIn ? '/notifications' : null, fetcher, {
    refreshInterval: 10_000, 
    revalidateOnFocus: true,
  });
}

// ─── Messaging ────────────────────────────────────────────────────────────────

export function useConversations() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  return useSWR(isLoggedIn ? '/messages/conversations' : null, fetcher, {
    refreshInterval: 10_000,
    revalidateOnFocus: true,
  });
}

export function useMessages(conversationId: string | null) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  return useSWR(
    isLoggedIn && conversationId ? `/messages/conversations/${conversationId}/messages` : null,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
    }
  );
}

// ─── Global Revalidation Helpers ──────────────────────────────────────────────
// Call these after mutations to instantly refresh cached data

export const revalidate = {
  rfqs: () => globalMutate((key: any) => 
    typeof key === 'string' ? key.startsWith('/rfq') : Array.isArray(key) && key[0]?.startsWith('/rfq'),
    undefined, { revalidate: true }
  ),
  orders: () => globalMutate((key: any) => 
    typeof key === 'string' ? key.startsWith('/orders') : Array.isArray(key) && key[0]?.startsWith('/orders'),
    undefined, { revalidate: true }
  ),
  listings: () => globalMutate((key: any) => 
    typeof key === 'string' ? key.startsWith('/listings') : Array.isArray(key) && key[0]?.startsWith('/listings'),
    undefined, { revalidate: true }
  ),
  messages: () => globalMutate((key: any) => 
    typeof key === 'string' ? key.startsWith('/messages') : Array.isArray(key) && key[0]?.startsWith('/messages'),
    undefined, { revalidate: true }
  ),
  admin: () => globalMutate((key: any) => 
    typeof key === 'string' ? key.startsWith('/admin') : Array.isArray(key) && key[0]?.startsWith('/admin'),
    undefined, { revalidate: true }
  ),
};


'use client';
import { SWRConfig } from 'swr';
import { fetcher } from '@/lib/fetcher';
import { SocketProvider } from './providers/SocketProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 5000,
        errorRetryCount: 2,
        errorRetryInterval: 3000,
        shouldRetryOnError: true,
        keepPreviousData: true,
      }}
    >
      <SocketProvider>
        {children}
      </SocketProvider>
    </SWRConfig>
  );
}

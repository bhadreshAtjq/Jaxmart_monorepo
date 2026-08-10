'use client';
import { SWRConfig } from 'swr';
import { fetcher } from '@/lib/fetcher';
import { SocketProvider } from './providers/SocketProvider';
import { LocationCurrencyProvider } from './providers/LocationCurrencyProvider';
import { useEffect } from 'react';

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
      <LocationCurrencyProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </LocationCurrencyProvider>
    </SWRConfig>
  );
}

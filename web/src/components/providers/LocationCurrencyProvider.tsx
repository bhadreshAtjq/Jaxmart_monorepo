'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CurrencyInfo, getCurrencyForCountry, DEFAULT_CURRENCY } from '@/lib/currency-map';

interface LocationCurrencyContextState {
  latitude: number | null;
  longitude: number | null;
  countryCode: string | null;
  currency: CurrencyInfo;
  isLoading: boolean;
  error: string | null;
}

const initialState: LocationCurrencyContextState = {
  latitude: null,
  longitude: null,
  countryCode: null,
  currency: DEFAULT_CURRENCY,
  isLoading: true,
  error: null,
};

const LocationCurrencyContext = createContext<LocationCurrencyContextState>(initialState);

export const useLocationCurrency = () => useContext(LocationCurrencyContext);

interface LocationCurrencyProviderProps {
  children: ReactNode;
}

const CACHE_KEY = 'jaxmart_location_currency_v4';

export const LocationCurrencyProvider: React.FC<LocationCurrencyProviderProps> = ({ children }) => {
  const [state, setState] = useState<LocationCurrencyContextState>(initialState);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const detectLocation = async () => {
      try {
        // Use ipwho.is IP-based geolocation so it respects VPNs
        const response = await fetch('https://ipwho.is/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error('Failed to parse country from IP');
        }

        const countryCode = data.country_code; // ipwho.is returns ISO 3166-1 alpha-2 as country_code
        const lat = parseFloat(data.latitude);
        const lon = parseFloat(data.longitude);

        // 4. Map Country to Currency
        const currencyInfo = getCurrencyForCountry(countryCode);

        setState((prev) => {
          // Avoid unnecessary re-renders if country is the same
          if (prev.countryCode === countryCode) return prev;
          
          return {
            latitude: lat,
            longitude: lon,
            countryCode,
            currency: currencyInfo,
            isLoading: false,
            error: null,
          };
        });

      } catch (err: any) {
        console.warn('Location/Currency detection failed:', err.message);
        // Fallback to default state but not loading
        setState((prev) => {
          if (prev.error === err.message) return prev;
          return {
            ...prev,
            isLoading: false,
            error: err.message || 'Unknown error',
          };
        });
      }
    };

    // Initial detection
    detectLocation();

    // Re-detect on tab visibility change (e.g. user toggles VPN and switches back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        detectLocation();
      }
    };
    
    // Re-detect when network comes back online (typical when VPN connects)
    const handleOnline = () => {
      detectLocation();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    // Poll every 30 seconds to catch silent VPN changes
    intervalId = setInterval(detectLocation, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <LocationCurrencyContext.Provider value={state}>
      {children}
    </LocationCurrencyContext.Provider>
  );
};

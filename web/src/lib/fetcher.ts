/**
 * SWR Fetcher — Best Practices for Real-Time Data
 * 
 * This centralized fetcher wraps our authenticated axios instance,
 * ensuring all SWR hooks automatically include the Bearer token
 * and handle token refresh via the axios interceptor.
 * 
 * Why this approach?
 * 1. Single source of truth for all HTTP fetching
 * 2. Automatic auth header injection
 * 3. Error normalization for SWR's error boundary
 * 4. Response unwrapping (axios returns { data }, SWR expects raw data)
 */
import api from './api';

// Default fetcher — Used by SWRConfig globally
// Accepts a URL string and returns the unwrapped response data
export const fetcher = async (url: string) => {
  console.log(`[SWR] Fetching: ${url}`);
  const res = await api.get(url);
  return res.data;
};

// Parameterized fetcher — For endpoints that need query params
// Usage: useSWR(['/rfq/my', { status: 'OPEN' }], fetcherWithParams)
export const fetcherWithParams = async ([url, params]: [string, Record<string, any>]) => {
  console.log(`[SWR] Fetching with params: ${url}`, params);
  const res = await api.get(url, { params });
  return res.data;
};

// POST fetcher — For mutation-like fetches (rare with SWR, but useful)
export const postFetcher = async ([url, body]: [string, any]) => {
  const res = await api.post(url, body);
  return res.data;
};

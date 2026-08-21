// src/api/client.ts
import axios, { AxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { secureStorage, SECURE_KEYS } from '../utils/storage';

// Default base URL resolver
export const getDefaultBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return 'http://3.111.57.216/api';
};

export const getApiBaseUrl = async (): Promise<string> => {
  const customUrl = await secureStorage.getItem(SECURE_KEYS.API_BASE_URL);
  if (customUrl && customUrl.trim().length > 0) {
    return customUrl.trim();
  }
  return getDefaultBaseUrl();
};

export const setCustomApiBaseUrl = async (url: string): Promise<void> => {
  await secureStorage.setItem(SECURE_KEYS.API_BASE_URL, url);
};

const api = axios.create({
  baseURL: getDefaultBaseUrl(),
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token & Dynamic Base URL
api.interceptors.request.use(
  async (config) => {
    const activeBaseUrl = await getApiBaseUrl();
    if (activeBaseUrl) {
      config.baseURL = activeBaseUrl;
    }
    const token = await secureStorage.getItem(SECURE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Silent 401 Token Refresh Queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await secureStorage.getItem(SECURE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const baseUrl = await getApiBaseUrl();
        const { data } = await axios.post(`${baseUrl}/auth/refresh`, {
          refreshToken,
        });

        if (data.accessToken) {
          await secureStorage.setItem(SECURE_KEYS.ACCESS_TOKEN, data.accessToken);
          if (data.refreshToken) {
            await secureStorage.setItem(SECURE_KEYS.REFRESH_TOKEN, data.refreshToken);
          }

          processQueue(null, data.accessToken);
          isRefreshing = false;

          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } else {
          throw new Error('Invalid refresh response');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;

        // Clear stored tokens on refresh failure
        await secureStorage.removeItem(SECURE_KEYS.ACCESS_TOKEN);
        await secureStorage.removeItem(SECURE_KEYS.REFRESH_TOKEN);

        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

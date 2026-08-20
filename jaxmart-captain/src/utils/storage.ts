// src/utils/storage.ts
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const SECURE_KEYS = {
  ACCESS_TOKEN: 'jaxmart_captain_access_token',
  REFRESH_TOKEN: 'jaxmart_captain_refresh_token',
  USER_DATA: 'jaxmart_captain_user_data',
  API_BASE_URL: 'jaxmart_captain_api_base_url',
};

export const ASYNC_KEYS = {
  ACTIVE_SHIFT: '@jaxmart_shift_active',
  SHIFT_HISTORY: '@jaxmart_shift_history',
  SELLER_DRAFTS: '@jaxmart_seller_drafts',
  SKU_DRAFTS: '@jaxmart_sku_drafts',
  OFFLINE_SYNC_QUEUE: '@jaxmart_offline_queue',
  SAVED_COMPANIES: '@jaxmart_saved_companies',
};

// Secure Store Wrapper (with Web Fallback)
export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn('localStorage setItem failed:', e);
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.warn('localStorage getItem failed:', e);
        return null;
      }
    }
    return await SecureStore.getItemAsync(key);
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn('localStorage removeItem failed:', e);
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// AsyncStorage JSON Helper
export const asyncStorage = {
  async getJSON<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.warn(`Error reading ${key} from AsyncStorage:`, e);
      return defaultValue;
    }
  },

  async setJSON<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error writing ${key} to AsyncStorage:`, e);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn(`Error removing ${key} from AsyncStorage:`, e);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.warn('AsyncStorage clear failed:', e);
    }
  },
};

export const clearAllAppData = async (): Promise<void> => {
  await AsyncStorage.clear();
  await secureStorage.removeItem(SECURE_KEYS.ACCESS_TOKEN);
  await secureStorage.removeItem(SECURE_KEYS.REFRESH_TOKEN);
  await secureStorage.removeItem(SECURE_KEYS.USER_DATA);
};

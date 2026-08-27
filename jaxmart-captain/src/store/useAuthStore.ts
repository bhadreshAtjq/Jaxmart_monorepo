// src/store/useAuthStore.ts
import { create } from 'zustand';
import { secureStorage, SECURE_KEYS } from '../utils/storage';
import { authApi, AuthResponse } from '../api/authApi';

export interface CaptainUser {
  id: string;
  phone: string;
  email?: string;
  fullName?: string;
  userType: string;
  role?: string;
  employeeId?: string;
  territory?: string;
  kycStatus?: string;
}

interface AuthState {
  user: CaptainUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeAuth: () => Promise<void>;
  checkSession: () => Promise<void>;
  sendOtp: (phone: string) => Promise<boolean>;
  verifyOtp: (phone: string, otp: string, fullName?: string) => Promise<boolean>;
  loginWithOtp: (phone: string, otp: string, fullName?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: CaptainUser) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkSession: async () => {
    return get().initializeAuth();
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      const accessToken = await secureStorage.getItem(SECURE_KEYS.ACCESS_TOKEN);
      const refreshToken = await secureStorage.getItem(SECURE_KEYS.REFRESH_TOKEN);
      const userDataStr = await secureStorage.getItem(SECURE_KEYS.USER_DATA);

      if (accessToken && userDataStr) {
        const user = JSON.parse(userDataStr);
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (e) {
      set({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  sendOtp: async (phone: string) => {
    const allowedCaptains = ['9820198201', '9820198202', '9999999999', '9106999252', '9876543210', '9111111111', '919998882221'];
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);

    try {
      set({ isLoading: true, error: null });
      await authApi.sendOtp(phone, true);
      set({ isLoading: false });
      return true;
    } catch (e: any) {
      const serverErr = e.response?.data?.error;
      if (serverErr) {
        set({ isLoading: false, error: serverErr });
        throw new Error(serverErr);
      }

      // If backend is unreachable over network/tunnel during local dev, allow registered captains to proceed offline
      if (allowedCaptains.includes(cleanPhone)) {
        console.warn('Backend server connection offline, using offline mode for registered Captain:', phone);
        set({ isLoading: false, error: null });
        return true;
      }

      const notRegMsg = 'Mobile number is not registered as an authorized Field Captain. Please contact Admin to get deployed.';
      set({ isLoading: false, error: notRegMsg });
      throw new Error(notRegMsg);
    }
  },

  verifyOtp: async (phone: string, otp: string, fullName?: string) => {
    return get().loginWithOtp(phone, otp, fullName);
  },

  loginWithOtp: async (phone: string, otp: string, fullName?: string) => {
    try {
      set({ isLoading: true, error: null });
      const res = await authApi.verifyOtp({
        phone,
        otp,
        fullName: fullName || 'Captain Field Officer',
        userType: 'BOTH',
        isCaptain: true,
      });

      if (res.accessToken) {
        const user: CaptainUser = {
          id: res.user.id,
          phone: res.user.phone,
          email: res.user.email,
          fullName: res.user.fullName || 'Captain Field Officer',
          userType: res.user.userType,
          role: res.user.role || 'CAPTAIN',
          employeeId: `CAPT-${res.user.id.slice(-6).toUpperCase()}`,
          territory: 'Mumbai Central / Western Zone',
          kycStatus: res.user.kycStatus,
        };

        await secureStorage.setItem(SECURE_KEYS.ACCESS_TOKEN, res.accessToken);
        if (res.refreshToken) {
          await secureStorage.setItem(SECURE_KEYS.REFRESH_TOKEN, res.refreshToken);
        }
        await secureStorage.setItem(SECURE_KEYS.USER_DATA, JSON.stringify(user));

        set({
          user,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }
      set({ isLoading: false, error: 'Authentication failed' });
      return false;
    } catch (err: any) {
      const serverErr = err.response?.data?.error;
      if (serverErr) {
        set({ isLoading: false, error: serverErr });
        throw new Error(serverErr);
      }

      // Offline fallback only for valid pre-seeded demo captain numbers if network is unavailable
      const allowedDemoNumbers = ['9820198201', '9820198202', '9999999999', '9106999252', '9876543210', '9111111111', '919998882221'];
      const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
      if (allowedDemoNumbers.includes(cleanPhone)) {
        const demoUser: CaptainUser = {
          id: 'capt_demo_' + Date.now().toString().slice(-4),
          phone,
          fullName: fullName || 'Captain Field Officer',
          userType: 'ADMIN',
          role: 'CAPTAIN',
          employeeId: 'CAPT-849201',
          territory: 'Industrial Hub',
          kycStatus: 'VERIFIED',
        };
        const mockToken = 'demo_jwt_token_' + Date.now();

        await secureStorage.setItem(SECURE_KEYS.ACCESS_TOKEN, mockToken);
        await secureStorage.setItem(SECURE_KEYS.REFRESH_TOKEN, mockToken + '_refresh');
        await secureStorage.setItem(SECURE_KEYS.USER_DATA, JSON.stringify(demoUser));

        set({
          user: demoUser,
          accessToken: mockToken,
          refreshToken: mockToken + '_refresh',
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }

      const defaultMsg = 'Mobile number is not registered as an authorized Field Captain. Please contact Admin.';
      set({ isLoading: false, error: defaultMsg });
      throw new Error(defaultMsg);
    }
  },

  logout: async () => {
    try {
      const refreshToken = get().refreshToken;
      if (refreshToken) {
        await authApi.logout(refreshToken).catch(() => {});
      }
    } finally {
      await secureStorage.removeItem(SECURE_KEYS.ACCESS_TOKEN);
      await secureStorage.removeItem(SECURE_KEYS.REFRESH_TOKEN);
      await secureStorage.removeItem(SECURE_KEYS.USER_DATA);

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setUser: (user: CaptainUser) => set({ user }),
  clearError: () => set({ error: null }),
}));

// src/lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  userType: 'BUYER' | 'SELLER' | 'BOTH';
  accountType: 'INDIVIDUAL' | 'BUSINESS';
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'UNDER_REVIEW';
  trustScore: number;
  avatarUrl?: string;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoggedIn: false,
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        set({ user, accessToken, refreshToken, isLoggedIn: true });
      },
      updateUser: (updates) => set((s) => ({ user: s.user ? { ...s.user, ...updates } : null })),
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, accessToken: null, refreshToken: null, isLoggedIn: false });
      },
    }),
    { name: 'b2b-auth', partialize: (s) => ({ user: s.user, isLoggedIn: s.isLoggedIn }) }
  )
);

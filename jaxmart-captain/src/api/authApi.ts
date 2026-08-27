// src/api/authApi.ts
import api from './client';

export interface SendOtpPayload {
  phone: string;
  isCaptain?: boolean;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
  fullName?: string;
  userType?: string;
  isCaptain?: boolean;
}

export interface AuthResponse {
  user: {
    id: string;
    phone: string;
    email?: string;
    fullName?: string;
    userType: string;
    role?: string;
    kycStatus: string;
    trustScore?: number;
    businessProfile?: any;
  };
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  sendOtp: async (phone: string, isCaptain: boolean = true): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.post('/auth/send-otp', { phone, isCaptain });
    return data;
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/verify-otp', { ...payload, isCaptain: payload.isCaptain ?? true });
    return data;
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> => {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    return data;
  },

  logout: async (refreshToken: string): Promise<{ success: boolean }> => {
    const { data } = await api.post('/auth/logout', { refreshToken });
    return data;
  },

  getMe: async (): Promise<any> => {
    const { data } = await api.get('/users/me');
    return data;
  },
};

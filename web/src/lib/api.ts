// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && error.config && !error.config._retry) {
      error.config._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken: refresh });
        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(error.config);
      } catch {
        localStorage.clear();
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  sendOtp: (phone: string) => api.post('/auth/send-otp', { phone }),
  verifyOtp: (phone: string, otp: string, fullName?: string, userType?: string) =>
    api.post('/auth/verify-otp', { phone, otp, fullName, userType }),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
};

// ── Categories ────────────────────────────────────────────────────────────────
export const categoryApi = {
  getAll: (parentId?: string) => api.get('/categories', { params: { parentId } }),
};

// ── Listings ──────────────────────────────────────────────────────────────────
export const listingApi = {
  search: (params: Record<string, any>) => api.get('/listings/search', { params }),
  get: (id: string) => api.get(`/listings/${id}`),
  create: (data: any) => api.post('/listings', data),
  update: (id: string, data: any) => api.put(`/listings/${id}`, data),
  publish: (id: string) => api.patch(`/listings/${id}/publish`),
  getMine: (params?: any) => api.get('/listings/seller/me', { params }),
  uploadMedia: (id: string, file: File, isPrimary?: boolean) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('listingId', id);
    if (isPrimary) fd.append('isPrimary', 'true');
    return api.post('/upload', fd);
  },
};

// ── RFQ ───────────────────────────────────────────────────────────────────────
export const rfqApi = {
  create: (data: any) => api.post('/rfq', data),
  getMine: (params?: any) => api.get('/rfq/my', { params }),
  get: (id: string) => api.get(`/rfq/${id}`),
  getInbox: (params?: any) => api.get('/rfq/seller/inbox', { params }),
  submitQuote: (rfqId: string, data: any) => api.post(`/rfq/${rfqId}/quotes`, data),
  awardQuote: (rfqId: string, quoteId: string) => api.patch(`/rfq/${rfqId}/award/${quoteId}`),
  shortlist: (quoteId: string) => api.patch(`/rfq/quotes/${quoteId}/shortlist`),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderApi = {
  getAll: (params?: any) => api.get('/orders', { params }),
  get: (id: string) => api.get(`/orders/${id}`),
  sign: (id: string) => api.post(`/orders/${id}/contract-sign`),
  submitMilestone: (orderId: string, milestoneId: string, data: any) =>
    api.post(`/orders/${orderId}/milestones/${milestoneId}/submit`, data),
  approveMilestone: (orderId: string, milestoneId: string) =>
    api.post(`/orders/${orderId}/milestones/${milestoneId}/approve`),
  raiseDispute: (orderId: string, data: any) => api.post(`/orders/${orderId}/disputes`, data),
  getDashboard: () => api.get('/orders/dashboard'),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentApi = {
  createOrder: (orderId: string) => api.post('/payments/create-order', { orderId }),
  verify: (data: any) => api.post('/payments/verify', data),
  getBalance: () => api.get('/payments/seller/balance'),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const userApi = {
  getProfile: () => api.get('/users/me'),
  update: (data: any) => api.put('/users/profile', data),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getKycQueue: () => api.get('/admin/kyc/queue'),
  approveKyc: (userId: string) => api.patch(`/admin/kyc/${userId}/approve`),
  rejectKyc: (userId: string, reason: string) => api.patch(`/admin/kyc/${userId}/reject`, { reason }),
  getListingQueue: () => api.get('/admin/listings/queue'),
  approveListing: (id: string) => api.patch(`/admin/listings/${id}/approve`),
  rejectListing: (id: string, reason: string) => api.patch(`/admin/listings/${id}/reject`, { reason }),
  getDisputes: () => api.get('/admin/disputes'),
  resolveDispute: (id: string, data: any) => api.patch(`/admin/disputes/${id}/resolve`, data),
  getPlatformStats: () => api.get('/admin/analytics'),
};

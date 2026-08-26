// src/api/companyApi.ts
import api from './client';

export interface CompanySummary {
  id: string;
  legalName: string;
  tradeName?: string;
  gstin?: string;
  pan?: string;
  ownerName?: string;
  phone: string;
  email?: string;
  city?: string;
  state?: string;
  pincode?: string;
  category?: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'UNDER_REVIEW';
  storefrontImage?: string;
  skuCount?: number;
  createdAt: string;
}

export interface OnboardCompanyPayload {
  step1: any;
  step2: any;
  step3: any;
  step4: any;
  step5: any;
  step6: any;
  uploadedPhotos?: Record<string, string>;
}

export const companyApi = {
  getCompanies: async (params?: { search?: string; kycStatus?: string; page?: number; limit?: number }): Promise<{ companies: CompanySummary[]; total: number; totalSkus: number }> => {
    try {
      const { data } = await api.get('/captain/companies', {
        params,
      });
      return {
        companies: data?.companies || [],
        total: data?.total || 0,
        totalSkus: data?.totalSkus || 0,
      };
    } catch (e) {
      // Fallback to /admin/users or local list
      try {
        const { data } = await api.get('/admin/users', {
          params: { ...params, userType: 'SELLER' },
        });
        const users = data?.users || data || [];
        const companies: CompanySummary[] = (Array.isArray(users) ? users : []).map((u: any) => ({
          id: u.id,
          legalName: u.businessProfile?.legalName || u.businessProfile?.businessName || u.fullName || 'Unnamed Seller',
          tradeName: u.businessProfile?.tradeName || u.businessProfile?.businessName,
          gstin: u.businessProfile?.gstin,
          pan: u.businessProfile?.pan,
          ownerName: u.fullName,
          phone: u.phone,
          email: u.email,
          city: u.businessProfile?.city || u.city,
          state: u.businessProfile?.state || u.state,
          pincode: u.businessProfile?.pincode || u.pincode,
          category: u.businessProfile?.category?.name || u.businessProfile?.industryType,
          kycStatus: u.kycStatus || 'PENDING',
          storefrontImage: u.businessProfile?.logoUrl || u.avatarUrl,
          skuCount: u._count?.listings || 0,
          createdAt: u.createdAt,
        }));
        const totalSkus = companies.reduce((sum, c) => sum + (c.skuCount || 0), 0);
        return { companies, total: data?.total || companies.length, totalSkus };
      } catch (fallbackErr) {
        return { companies: [], total: 0, totalSkus: 0 };
      }
    }
  },

  getCompanyDetails: async (id: string): Promise<any> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  onboardCompany: async (payload: OnboardCompanyPayload): Promise<any> => {
    const { data } = await api.post('/captain/onboard-seller', payload);
    return data;
  },

  getCompanySkus: async (companyId: string): Promise<any[]> => {
    try {
      const { data } = await api.get('/listings/search', {
        params: { sellerId: companyId, limit: 100 },
      });
      return data?.listings || (Array.isArray(data) ? data : []);
    } catch (e) {
      return [];
    }
  },
};

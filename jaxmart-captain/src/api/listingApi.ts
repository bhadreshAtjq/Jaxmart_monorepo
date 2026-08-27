// src/api/listingApi.ts
import api from './client';
import { authApi } from './authApi';
import { secureStorage, SECURE_KEYS } from '../utils/storage';

export interface CreateListingPayload {
  sellerId: string;
  listingType: 'PRODUCT' | 'SERVICE';
  title: string;
  description: string;
  categoryId: string;
  tags?: string[];
  status?: 'DRAFT' | 'ACTIVE';
  
  // Product specific
  brand?: string;
  sku?: string;
  model?: string;
  unitOfMeasure?: string;
  minOrderQty?: number;
  pricePerUnit?: number;
  priceType?: 'FIXED' | 'RANGE' | 'TIERED';
  priceRangeMin?: number;
  priceRangeMax?: number;
  bulkPriceSlabs?: Array<{ minQty: number; maxQty?: number; price: number }>;
  stockAvailable?: boolean;
  leadTimeDays?: number;
  hsnCode?: string;
  gstRate?: number;
  specifications?: Record<string, any>;
  warranty?: string;
  returnPolicy?: string;
  certifications?: string[];
  countryOfOrigin?: string;
  
  // Variants
  variants?: Array<{
    title: string;
    sku?: string;
    priceOverride?: number;
    stockQty?: number;
    attributeValues?: Array<{ attributeId: string; value: string }>;
  }>;
  
  // Packaging & Dimensions
  packagingDetails?: string;
  weightNetKg?: number;
  weightGrossKg?: number;
  dimLengthCm?: number;
  dimWidthCm?: number;
  dimHeightCm?: number;
  volumetricWeightKg?: number;
  
  // Images
  images?: Array<{ url: string; isPrimary?: boolean; caption?: string; sortOrder?: number }>;
}



export const listingApi = {
  createListing: async (payload: CreateListingPayload): Promise<any> => {
    try {
      const { data } = await api.post('/captain/listings', payload);
      return data;
    } catch (err: any) {
      try {
        const { data } = await api.post('/listings', payload);
        return data;
      } catch (fallbackErr: any) {
        throw fallbackErr;
      }
    }
  },

  updateListing: async (id: string, payload: Partial<CreateListingPayload>): Promise<any> => {
    const { data } = await api.put(`/listings/${id}`, payload);
    return data;
  },

  getListing: async (id: string): Promise<any> => {
    const { data } = await api.get(`/listings/${id}`);
    return data;
  },

  searchListings: async (params: Record<string, any>): Promise<any> => {
    const { data } = await api.get('/listings/search', { params });
    return data;
  },

  getMyListings: async (params?: Record<string, any>): Promise<any> => {
    const { data } = await api.get('/listings/seller/me', { params });
    return data;
  },

  publishListing: async (id: string): Promise<any> => {
    const { data } = await api.patch(`/listings/${id}/publish`);
    return data;
  },

  getCaptainListings: async (params?: { page?: number; limit?: number; search?: string }): Promise<any> => {
    try {
      const { data } = await api.get('/captain/listings', { params });
      return data;
    } catch (err) {
      // Fallback
      return { success: false, listings: [], total: 0 };
    }
  },
};

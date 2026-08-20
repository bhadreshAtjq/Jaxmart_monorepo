// src/api/listingApi.ts
import api from './client';

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
    const { data } = await api.post('/listings', payload);
    return data;
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
};

// src/api/categoryApi.ts
import api from './client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null;
  children?: Category[];
}

export const categoryApi = {
  getCategories: async (parentId?: string): Promise<Category[]> => {
    try {
      const { data } = await api.get('/categories', {
        params: { parentId },
      });
      return Array.isArray(data) ? data : data?.categories || [];
    } catch (e) {
      console.warn('Failed to fetch categories:', e);
      return [];
    }
  },

  getCategoryAttributes: async (id: string): Promise<any[]> => {
    try {
      const { data } = await api.get(`/categories/${id}/attributes`);
      return Array.isArray(data) ? data : data?.attributes || [];
    } catch (e) {
      return [];
    }
  },
};

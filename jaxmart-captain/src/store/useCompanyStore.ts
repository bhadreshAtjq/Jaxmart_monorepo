// src/store/useCompanyStore.ts
import { create } from 'zustand';
import { CompanySummary, companyApi } from '../api/companyApi';
import { asyncStorage, ASYNC_KEYS } from '../utils/storage';

interface CompanyState {
  companies: CompanySummary[];
  savedCompanies: CompanySummary[];
  activeCompany: CompanySummary | null;
  isLoading: boolean;
  searchQuery: string;
  totalCompanies: number;
  totalSkus: number;

  // Actions
  fetchCompanies: (search?: string) => Promise<void>;
  setActiveCompany: (company: CompanySummary | null) => void;
  selectCompanyById: (id: string) => void;
  addLocalCompany: (company: CompanySummary) => Promise<void>;
  incrementSkuCount: (companyId: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],
  savedCompanies: [],
  activeCompany: null,
  isLoading: false,
  searchQuery: '',
  totalCompanies: 0,
  totalSkus: 0,

  fetchCompanies: async (search?: string) => {
    try {
      set({ isLoading: true, searchQuery: search || '' });
      const localSaved = await asyncStorage.getJSON<CompanySummary[]>(ASYNC_KEYS.SAVED_COMPANIES, []);
      
      const apiResult = await companyApi.getCompanies({ search }).catch(() => ({ companies: [], totalSkus: 0 }));
      const combined = [...(apiResult.companies || []), ...localSaved];
      
      // Deduplicate by id, phone, or legalName, prioritizing VERIFIED status over PENDING
      const uniqueMap = new Map<string, CompanySummary>();
      combined.forEach((c) => {
        if (!c) return;
        const key = (c.phone || c.gstin || c.legalName || c.id || '').trim().toLowerCase();
        const existing = uniqueMap.get(key);
        if (!existing) {
          uniqueMap.set(key, { ...c, kycStatus: c.kycStatus === 'PENDING' ? 'VERIFIED' : (c.kycStatus || 'VERIFIED') });
        } else if (existing.kycStatus !== 'VERIFIED' && (c.kycStatus === 'VERIFIED' || c.kycStatus !== 'PENDING')) {
          uniqueMap.set(key, { ...c, kycStatus: 'VERIFIED' });
        }
      });

      const list = Array.from(uniqueMap.values());
      const filtered = search
        ? list.filter(
            (c) =>
              (c.legalName && c.legalName.toLowerCase().includes(search.toLowerCase())) ||
              (c.tradeName && c.tradeName.toLowerCase().includes(search.toLowerCase())) ||
              (c.gstin && c.gstin.toLowerCase().includes(search.toLowerCase())) ||
              (c.phone && c.phone.includes(search))
          )
        : list;

      set({
        companies: filtered,
        savedCompanies: filtered,
        activeCompany: filtered.length > 0 ? (get().activeCompany || filtered[0]) : null,
        totalCompanies: filtered.length,
        totalSkus: apiResult.totalSkus || filtered.reduce((acc, c) => acc + (c.skuCount || 0), 0),
        isLoading: false,
      });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  setActiveCompany: (company: CompanySummary | null) => {
    set({ activeCompany: company });
  },

  selectCompanyById: (id: string) => {
    const found = get().companies.find((c) => c.id === id);
    if (found) {
      set({ activeCompany: found });
    }
  },

  addLocalCompany: async (company: CompanySummary) => {
    try {
      const localSaved = await asyncStorage.getJSON<CompanySummary[]>(ASYNC_KEYS.SAVED_COMPANIES, []);
      const updated = [company, ...localSaved.filter((c) => c.id !== company.id)];
      await asyncStorage.setJSON(ASYNC_KEYS.SAVED_COMPANIES, updated);

      const all = [company, ...get().companies.filter((c) => c.id !== company.id)];
      set({
        companies: all,
        savedCompanies: all,
        activeCompany: company,
        totalCompanies: all.length,
      });
    } catch (e) {
      console.error('Failed to save company locally:', e);
    }
  },

  incrementSkuCount: (companyId: string) => {
    const updated = get().companies.map((c) =>
      c.id === companyId ? { ...c, skuCount: (c.skuCount || 0) + 1 } : c
    );
    set({
      companies: updated,
      savedCompanies: updated,
      activeCompany:
        get().activeCompany?.id === companyId
          ? { ...get().activeCompany!, skuCount: (get().activeCompany!.skuCount || 0) + 1 }
          : get().activeCompany,
    });
    asyncStorage.setJSON(ASYNC_KEYS.SAVED_COMPANIES, updated);
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
}));

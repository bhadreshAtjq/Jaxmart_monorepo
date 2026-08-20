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

  // Actions
  fetchCompanies: (search?: string) => Promise<void>;
  setActiveCompany: (company: CompanySummary | null) => void;
  selectCompanyById: (id: string) => void;
  addLocalCompany: (company: CompanySummary) => Promise<void>;
  incrementSkuCount: (companyId: string) => void;
  setSearchQuery: (query: string) => void;
}

// Initial mock companies for immediate rich demo capability on field
const INITIAL_DEMO_COMPANIES: CompanySummary[] = [
  {
    id: 'comp_1',
    legalName: 'Apex Industrial Fasteners Pvt Ltd',
    tradeName: 'Apex Tools & Fasteners',
    gstin: '27AABCA1234F1Z9',
    pan: 'AABCA1234F',
    ownerName: 'Rajesh Sharma',
    phone: '9820198201',
    email: 'contact@apexfasteners.com',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400072',
    category: 'Industrial Tools & Fasteners',
    kycStatus: 'VERIFIED',
    skuCount: 14,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'comp_2',
    legalName: 'Shree Radhe Textiles & Garments LLP',
    tradeName: 'Radhe Fabric Mills',
    gstin: '24AAECS9988H1ZV',
    pan: 'AAECS9988H',
    ownerName: 'Mukesh Patel',
    phone: '9825098250',
    email: 'sales@radhetextiles.in',
    city: 'Surat',
    state: 'Gujarat',
    pincode: '395002',
    category: 'Textiles & Apparel',
    kycStatus: 'VERIFIED',
    skuCount: 28,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'comp_3',
    legalName: 'Bharat Solar Energy Solutions',
    tradeName: 'Bharat Green Power',
    gstin: '07AAECB5544K1ZR',
    pan: 'AAECB5544K',
    ownerName: 'Vikas Gupta',
    phone: '9811098110',
    email: 'info@bharatsolar.com',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110020',
    category: 'Renewable Energy & Solar',
    kycStatus: 'UNDER_REVIEW',
    skuCount: 6,
    createdAt: new Date().toISOString(),
  },
];

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: INITIAL_DEMO_COMPANIES,
  savedCompanies: INITIAL_DEMO_COMPANIES,
  activeCompany: INITIAL_DEMO_COMPANIES[0],
  isLoading: false,
  searchQuery: '',
  totalCompanies: INITIAL_DEMO_COMPANIES.length,

  fetchCompanies: async (search?: string) => {
    try {
      set({ isLoading: true, searchQuery: search || '' });
      const localSaved = await asyncStorage.getJSON<CompanySummary[]>(ASYNC_KEYS.SAVED_COMPANIES, []);
      
      const apiResult = await companyApi.getCompanies({ search });
      const combined = [...localSaved, ...apiResult.companies];
      
      // Deduplicate by id
      const uniqueMap = new Map<string, CompanySummary>();
      [...INITIAL_DEMO_COMPANIES, ...combined].forEach((c) => {
        if (!uniqueMap.has(c.id)) {
          uniqueMap.set(c.id, c);
        }
      });

      const list = Array.from(uniqueMap.values());
      const filtered = search
        ? list.filter(
            (c) =>
              c.legalName.toLowerCase().includes(search.toLowerCase()) ||
              (c.tradeName && c.tradeName.toLowerCase().includes(search.toLowerCase())) ||
              (c.gstin && c.gstin.toLowerCase().includes(search.toLowerCase())) ||
              c.phone.includes(search)
          )
        : list;

      set({
        companies: filtered,
        savedCompanies: filtered,
        totalCompanies: filtered.length,
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

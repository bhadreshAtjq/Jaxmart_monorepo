// src/store/useSkuWizardStore.ts
import { create } from 'zustand';
import {
  SkuStep1FormValues,
  SkuStep2FormValues,
  SkuStep3FormValues,
  SkuStep4FormValues,
  SkuStep5FormValues,
  SkuStep6FormValues,
  SkuStep7FormValues,
  SkuStep8FormValues,
  BulkPriceSlab,
  VariantItem,
} from '../schemas/skuCatalogingSchema';
import { asyncStorage, ASYNC_KEYS } from '../utils/storage';
import { calculateVolumetricWeight } from '../utils/volumetric';

export interface SkuDraft {
  id: string;
  companyId: string;
  companyName: string;
  updatedAt: string;
  createdAt?: string;
  step?: number;
  currentStep: number;
  step1: Partial<SkuStep1FormValues>;
  step2: Partial<SkuStep2FormValues>;
  step3: Partial<SkuStep3FormValues>;
  step4: Partial<SkuStep4FormValues>;
  step5: Partial<SkuStep5FormValues>;
  step6: Partial<SkuStep6FormValues>;
  step7: Partial<SkuStep7FormValues>;
  step8: Partial<SkuStep8FormValues>;
}

const generateAutoSku = (): string => {
  const prefix = 'JAX';
  const randNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${randNum}`;
};

const INITIAL_SKU_STEP1: SkuStep1FormValues = {
  companyId: '',
  companyName: '',
  title: '',
  brand: '',
  categoryId: '',
  categoryName: '',
  subCategoryId: '',
  subCategoryName: '',
  hsnCode: '',
  shortDescription: '',
  detailedDescription: '',
};

const INITIAL_SKU_STEP2: SkuStep2FormValues = {
  barcode: '',
  barcodeFormat: 'EAN_13',
  manufacturerSku: '',
  jaxmartAutoSku: generateAutoSku(),
};

const INITIAL_SKU_STEP3: SkuStep3FormValues = {
  mrp: 0,
  b2bPrice: 0,
  gstRate: 18,
  minOrderQty: 10,
  unitOfMeasure: 'Pieces (pcs)',
  bulkPriceSlabs: [
    { id: 'slab_1', minQty: 50, maxQty: 199, price: 0 },
    { id: 'slab_2', minQty: 200, maxQty: 499, price: 0 },
  ],
};

const INITIAL_SKU_STEP4: SkuStep4FormValues = {
  hasVariants: false,
  variantOptions: [],
  variantMatrix: [],
  customAttributes: {},
};

const INITIAL_SKU_STEP5: SkuStep5FormValues = {
  stockQuantity: 500,
  warehouseShelfLocation: 'Rack A-01, Bin 4',
  hasExpiryDate: false,
  expiryDate: '',
  batchNumber: '',
  returnPolicy: '7 Days Returnable (Defective Only)',
};

const INITIAL_SKU_STEP6: SkuStep6FormValues = {
  netWeightKg: 1.0,
  grossWeightKg: 1.2,
  packagingLengthCm: 20,
  packagingWidthCm: 15,
  packagingHeightCm: 10,
  volumetricWeightKg: 0.6,
  isFragile: false,
  isHazardous: false,
  isLiquid: false,
};

const INITIAL_SKU_STEP7: SkuStep7FormValues = {
  photos: {},
};

const INITIAL_SKU_STEP8: SkuStep8FormValues = {
  countryOfOrigin: 'India (Domestic Manufacture)',
  certifications: 'ISO 9001, BIS',
  warrantyDetails: '1 Year Standard Manufacturer Replacement Warranty',
};

interface SkuWizardState {
  currentStep: number;
  draftId: string;
  step1: SkuStep1FormValues;
  step2: SkuStep2FormValues;
  step3: SkuStep3FormValues;
  step4: SkuStep4FormValues;
  step5: SkuStep5FormValues;
  step6: SkuStep6FormValues;
  step7: SkuStep7FormValues;
  step8: SkuStep8FormValues;
  isSubmitting: boolean;
  draftsList: SkuDraft[];
  drafts: SkuDraft[];

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setCompanyContext: (companyId: string, companyName: string) => void;
  updateStep1: (data: Partial<SkuStep1FormValues>) => void;
  updateStep2: (data: Partial<SkuStep2FormValues>) => void;
  updateStep3: (data: Partial<SkuStep3FormValues>) => void;
  updateStep4: (data: Partial<SkuStep4FormValues>) => void;
  updateStep5: (data: Partial<SkuStep5FormValues>) => void;
  updateStep6: (data: Partial<SkuStep6FormValues>) => void;
  updateStep7: (data: Partial<SkuStep7FormValues>) => void;
  updateStep8: (data: Partial<SkuStep8FormValues>) => void;

  // Helpers for nested matrix
  addBulkPriceSlab: () => void;
  removeBulkPriceSlab: (id: string) => void;
  updateBulkPriceSlab: (id: string, field: 'minQty' | 'maxQty' | 'price', value: number) => void;

  addCustomAttribute: (key: string, value: string) => void;
  removeCustomAttribute: (key: string) => void;

  generateVariantMatrix: (options: Array<{ name: string; values: string[] }>, title: string, baseSku: string, basePrice: number) => void;
  updateVariantItem: (sku: string, updates: Partial<VariantItem>) => void;

  saveDraft: () => Promise<void>;
  loadDraft: (draftOrId: SkuDraft | string) => Promise<void>;
  fetchDrafts: () => Promise<void>;
  deleteDraft: (id: string) => Promise<void>;
  startNewWizard: () => void;
  resetWizard: (companyId?: string, companyName?: string) => void;
}

export const useSkuWizardStore = create<SkuWizardState>((set, get) => ({
  currentStep: 1,
  draftId: 'sku_draft_' + Date.now(),
  step1: INITIAL_SKU_STEP1,
  step2: INITIAL_SKU_STEP2,
  step3: INITIAL_SKU_STEP3,
  step4: INITIAL_SKU_STEP4,
  step5: INITIAL_SKU_STEP5,
  step6: INITIAL_SKU_STEP6,
  step7: INITIAL_SKU_STEP7,
  step8: INITIAL_SKU_STEP8,
  isSubmitting: false,
  draftsList: [],
  drafts: [],

  setStep: (step: number) => set({ currentStep: Math.min(Math.max(1, step), 8) }),
  nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 8) })),
  prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),

  setCompanyContext: (companyId: string, companyName: string) => {
    set((s) => ({
      step1: { ...s.step1, companyId, companyName },
    }));
  },

  updateStep1: (data) => set((s) => ({ step1: { ...s.step1, ...data } })),
  updateStep2: (data) => set((s) => ({ step2: { ...s.step2, ...data } })),
  updateStep3: (data) => set((s) => ({ step3: { ...s.step3, ...data } })),
  updateStep4: (data) => set((s) => ({ step4: { ...s.step4, ...data } })),
  updateStep5: (data) => set((s) => ({ step5: { ...s.step5, ...data } })),
  
  updateStep6: (data) => {
    set((s) => {
      const updated = { ...s.step6, ...data };
      const volWeight = calculateVolumetricWeight(
        updated.packagingLengthCm || 0,
        updated.packagingWidthCm || 0,
        updated.packagingHeightCm || 0
      );
      return {
        step6: {
          ...updated,
          volumetricWeightKg: volWeight,
        },
      };
    });
  },

  updateStep7: (data) => set((s) => ({ step7: { ...s.step7, ...data } })),
  updateStep8: (data) => set((s) => ({ step8: { ...s.step8, ...data } })),

  addBulkPriceSlab: () => {
    set((s) => {
      const slabs = s.step3.bulkPriceSlabs || [];
      const lastSlab = slabs[slabs.length - 1];
      const nextMin = lastSlab ? (lastSlab.maxQty ? lastSlab.maxQty + 1 : lastSlab.minQty + 100) : 50;
      const newSlab: BulkPriceSlab = {
        id: 'slab_' + Date.now(),
        minQty: nextMin,
        maxQty: nextMin + 150,
        price: s.step3.b2bPrice ? Math.round(s.step3.b2bPrice * 0.95) : 0,
      };
      return {
        step3: {
          ...s.step3,
          bulkPriceSlabs: [...slabs, newSlab],
        },
      };
    });
  },

  removeBulkPriceSlab: (id: string) => {
    set((s) => ({
      step3: {
        ...s.step3,
        bulkPriceSlabs: (s.step3.bulkPriceSlabs || []).filter((slab) => slab.id !== id),
      },
    }));
  },

  updateBulkPriceSlab: (id: string, field: 'minQty' | 'maxQty' | 'price', value: number) => {
    set((s) => ({
      step3: {
        ...s.step3,
        bulkPriceSlabs: (s.step3.bulkPriceSlabs || []).map((slab) =>
          slab.id === id ? { ...slab, [field]: value } : slab
        ),
      },
    }));
  },

  addCustomAttribute: (key: string, value: string) => {
    set((s) => ({
      step4: {
        ...s.step4,
        customAttributes: {
          ...(s.step4.customAttributes || {}),
          [key]: value,
        },
      },
    }));
  },

  removeCustomAttribute: (key: string) => {
    set((s) => {
      const updated = { ...(s.step4.customAttributes || {}) };
      delete updated[key];
      return {
        step4: {
          ...s.step4,
          customAttributes: updated,
        },
      };
    });
  },

  generateVariantMatrix: (options, title, baseSku, basePrice) => {
    if (!options || options.length === 0) {
      set((s) => ({ step4: { ...s.step4, variantMatrix: [] } }));
      return;
    }

    const combinations: Array<Record<string, string>> = [];
    const helper = (depth: number, current: Record<string, string>) => {
      if (depth === options.length) {
        combinations.push({ ...current });
        return;
      }
      const opt = options[depth];
      for (const val of opt.values) {
        current[opt.name] = val;
        helper(depth + 1, current);
      }
    };
    helper(0, {});

    const matrix: VariantItem[] = combinations.map((combo, idx) => {
      const label = Object.values(combo).join(' / ');
      const suffix = Object.values(combo)
        .map((v) => v.slice(0, 3).toUpperCase())
        .join('-');
      return {
        id: `var_${Date.now()}_${idx}`,
        title: `${title} - ${label}`,
        sku: `${baseSku}-${suffix}`,
        priceOverride: basePrice,
        stockQty: 100,
        attributes: combo,
      };
    });

    set((s) => ({
      step4: {
        ...s.step4,
        variantOptions: options,
        variantMatrix: matrix,
      },
    }));
  },

  updateVariantItem: (sku: string, updates: Partial<VariantItem>) => {
    set((s) => ({
      step4: {
        ...s.step4,
        variantMatrix: (s.step4.variantMatrix || []).map((v) =>
          v.sku === sku ? { ...v, ...updates } : v
        ),
      },
    }));
  },

  saveDraft: async () => {
    try {
      const state = get();
      const draft: SkuDraft = {
        id: state.draftId,
        companyId: state.step1.companyId,
        companyName: state.step1.companyName,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        step: state.currentStep,
        currentStep: state.currentStep,
        step1: state.step1,
        step2: state.step2,
        step3: state.step3,
        step4: state.step4,
        step5: state.step5,
        step6: state.step6,
        step7: state.step7,
        step8: state.step8,
      };

      const drafts = await asyncStorage.getJSON<SkuDraft[]>(ASYNC_KEYS.SKU_DRAFTS, []);
      const updated = [draft, ...drafts.filter((d) => d.id !== draft.id)];
      await asyncStorage.setJSON(ASYNC_KEYS.SKU_DRAFTS, updated);
      set({ draftsList: updated, drafts: updated });
    } catch (e) {
      console.error('Failed to save SKU draft:', e);
    }
  },

  loadDraft: async (draftOrId: SkuDraft | string) => {
    let draft: SkuDraft | undefined;
    if (typeof draftOrId === 'string') {
      const drafts = await asyncStorage.getJSON<SkuDraft[]>(ASYNC_KEYS.SKU_DRAFTS, []);
      draft = drafts.find((d) => d.id === draftOrId) || get().drafts.find((d) => d.id === draftOrId);
    } else {
      draft = draftOrId;
    }

    if (draft) {
      set({
        draftId: draft.id,
        currentStep: draft.currentStep || draft.step || 1,
        step1: { ...INITIAL_SKU_STEP1, ...draft.step1 },
        step2: { ...INITIAL_SKU_STEP2, ...draft.step2 },
        step3: { ...INITIAL_SKU_STEP3, ...draft.step3 },
        step4: { ...INITIAL_SKU_STEP4, ...draft.step4 },
        step5: { ...INITIAL_SKU_STEP5, ...draft.step5 },
        step6: { ...INITIAL_SKU_STEP6, ...draft.step6 },
        step7: { ...INITIAL_SKU_STEP7, ...draft.step7 },
        step8: { ...INITIAL_SKU_STEP8, ...draft.step8 },
      });
    }
  },

  fetchDrafts: async () => {
    try {
      const drafts = await asyncStorage.getJSON<SkuDraft[]>(ASYNC_KEYS.SKU_DRAFTS, []);
      set({ draftsList: drafts, drafts });
    } catch (e) {
      console.error('Failed to fetch SKU drafts:', e);
    }
  },

  deleteDraft: async (id: string) => {
    try {
      const drafts = await asyncStorage.getJSON<SkuDraft[]>(ASYNC_KEYS.SKU_DRAFTS, []);
      const filtered = drafts.filter((d) => d.id !== id);
      await asyncStorage.setJSON(ASYNC_KEYS.SKU_DRAFTS, filtered);
      set({ draftsList: filtered, drafts: filtered });
    } catch (e) {
      console.error('Failed to delete SKU draft:', e);
    }
  },

  startNewWizard: () => {
    get().resetWizard();
  },

  resetWizard: (companyId?: string, companyName?: string) => {
    const autoSku = generateAutoSku();
    set({
      currentStep: 1,
      draftId: 'sku_draft_' + Date.now(),
      step1: {
        ...INITIAL_SKU_STEP1,
        companyId: companyId || '',
        companyName: companyName || '',
      },
      step2: {
        ...INITIAL_SKU_STEP2,
        jaxmartAutoSku: autoSku,
      },
      step3: INITIAL_SKU_STEP3,
      step4: INITIAL_SKU_STEP4,
      step5: INITIAL_SKU_STEP5,
      step6: INITIAL_SKU_STEP6,
      step7: INITIAL_SKU_STEP7,
      step8: INITIAL_SKU_STEP8,
      isSubmitting: false,
    });
  },
}));

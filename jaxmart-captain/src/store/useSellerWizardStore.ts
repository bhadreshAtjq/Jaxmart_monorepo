// src/store/useSellerWizardStore.ts
import { create } from 'zustand';
import {
  Step1FormValues,
  Step2FormValues,
  Step3FormValues,
  Step4FormValues,
  Step5FormValues,
  Step6FormValues,
} from '../schemas/sellerOnboardingSchema';
import { asyncStorage, ASYNC_KEYS } from '../utils/storage';

export interface SellerDraft {
  id: string;
  updatedAt: string;
  createdAt?: string;
  step?: number;
  currentStep: number;
  step1: Partial<Step1FormValues>;
  step2: Partial<Step2FormValues>;
  step3: Partial<Step3FormValues>;
  step4: Partial<Step4FormValues>;
  step5: Partial<Step5FormValues>;
  step6: Partial<Step6FormValues>;
}

const INITIAL_STEP1: Step1FormValues = {
  legalBusinessName: '',
  tradeName: '',
  entityType: 'Sole Proprietorship',
  primaryOwnerName: '',
  primaryMobile: '',
  secondaryPhone: '',
  email: '',
  preferredLanguage: 'English',
};

const INITIAL_STEP2: Step2FormValues = {
  latitude: 19.076,
  longitude: 72.8777,
  locationAccuracy: 5,
  buildingNoFloor: '',
  streetArea: '',
  landmark: '',
  city: '',
  district: '',
  state: 'Maharashtra',
  pincode: '',
  storefrontPhoto: '',
  storeInteriorPhoto: '',
};

const INITIAL_STEP3: Step3FormValues = {
  isGstRegistered: true,
  gstin: '',
  gstCertPhoto: '',
  panNumber: '',
  panName: '',
  panCardPhoto: '',
  udyamNumber: '',
  fssaiNumber: '',
  fssaiCertPhoto: '',
  isGstinVerified: false,
  isPanVerified: false,
};

const INITIAL_STEP4: Step4FormValues = {
  accountHolderName: '',
  bankName: '',
  accountType: 'Current Account',
  accountNumber: '',
  confirmAccountNumber: '',
  ifscCode: '',
  bankBranch: '',
  chequePhoto: '',
  isPennyDropVerified: false,
};

const INITIAL_STEP5: Step5FormValues = {
  primaryCategoryId: '',
  primaryCategoryName: '',
  subCategories: [],
  monthlyTurnover: '₹1L - 5L',
  operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  openingTime: '09:00 AM',
  closingTime: '08:00 PM',
  deliveryCapabilities: ['Jaxmart Logistics Preferred'],
};

const INITIAL_STEP6: Step6FormValues = {
  agreedToTerms: true,
  sellerSignatureUri: '',
  captainDeclaration: true,
};

interface SellerWizardState {
  currentStep: number;
  draftId: string;
  step1: Step1FormValues;
  step2: Step2FormValues;
  step3: Step3FormValues;
  step4: Step4FormValues;
  step5: Step5FormValues;
  step6: Step6FormValues;
  isSubmitting: boolean;
  draftsList: SellerDraft[];
  drafts: SellerDraft[];

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateStep1: (data: Partial<Step1FormValues>) => void;
  updateStep2: (data: Partial<Step2FormValues>) => void;
  updateStep3: (data: Partial<Step3FormValues>) => void;
  updateStep4: (data: Partial<Step4FormValues>) => void;
  updateStep5: (data: Partial<Step5FormValues>) => void;
  updateStep6: (data: Partial<Step6FormValues>) => void;
  saveDraft: () => Promise<void>;
  loadDraft: (draftOrId: SellerDraft | string) => Promise<void>;
  fetchDrafts: () => Promise<void>;
  deleteDraft: (id: string) => Promise<void>;
  startNewWizard: () => void;
  resetWizard: () => void;
}

export const useSellerWizardStore = create<SellerWizardState>((set, get) => ({
  currentStep: 1,
  draftId: 'seller_draft_' + Date.now(),
  step1: INITIAL_STEP1,
  step2: INITIAL_STEP2,
  step3: INITIAL_STEP3,
  step4: INITIAL_STEP4,
  step5: INITIAL_STEP5,
  step6: INITIAL_STEP6,
  isSubmitting: false,
  draftsList: [],
  drafts: [],

  setStep: (step: number) => set({ currentStep: Math.min(Math.max(1, step), 7) }),
  nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 7) })),
  prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),

  updateStep1: (data) => set((s) => ({ step1: { ...s.step1, ...data } })),
  updateStep2: (data) => set((s) => ({ step2: { ...s.step2, ...data } })),
  updateStep3: (data) => set((s) => ({ step3: { ...s.step3, ...data } })),
  updateStep4: (data) => set((s) => ({ step4: { ...s.step4, ...data } })),
  updateStep5: (data) => set((s) => ({ step5: { ...s.step5, ...data } })),
  updateStep6: (data) => set((s) => ({ step6: { ...s.step6, ...data } })),

  saveDraft: async () => {
    try {
      const state = get();
      const draft: SellerDraft = {
        id: state.draftId,
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
      };

      const drafts = await asyncStorage.getJSON<SellerDraft[]>(ASYNC_KEYS.SELLER_DRAFTS, []);
      const updated = [draft, ...drafts.filter((d) => d.id !== draft.id)];
      await asyncStorage.setJSON(ASYNC_KEYS.SELLER_DRAFTS, updated);
      set({ draftsList: updated, drafts: updated });
    } catch (e) {
      console.error('Failed to save seller draft:', e);
    }
  },

  loadDraft: async (draftOrId: SellerDraft | string) => {
    let draft: SellerDraft | undefined;
    if (typeof draftOrId === 'string') {
      const drafts = await asyncStorage.getJSON<SellerDraft[]>(ASYNC_KEYS.SELLER_DRAFTS, []);
      draft = drafts.find((d) => d.id === draftOrId) || get().drafts.find((d) => d.id === draftOrId);
    } else {
      draft = draftOrId;
    }

    if (draft) {
      set({
        draftId: draft.id,
        currentStep: draft.currentStep || draft.step || 1,
        step1: { ...INITIAL_STEP1, ...draft.step1 },
        step2: { ...INITIAL_STEP2, ...draft.step2 },
        step3: { ...INITIAL_STEP3, ...draft.step3 },
        step4: { ...INITIAL_STEP4, ...draft.step4 },
        step5: { ...INITIAL_STEP5, ...draft.step5 },
        step6: { ...INITIAL_STEP6, ...draft.step6 },
      });
    }
  },

  fetchDrafts: async () => {
    try {
      const drafts = await asyncStorage.getJSON<SellerDraft[]>(ASYNC_KEYS.SELLER_DRAFTS, []);
      set({ draftsList: drafts, drafts });
    } catch (e) {
      console.error('Failed to fetch seller drafts:', e);
    }
  },

  deleteDraft: async (id: string) => {
    try {
      const drafts = await asyncStorage.getJSON<SellerDraft[]>(ASYNC_KEYS.SELLER_DRAFTS, []);
      const filtered = drafts.filter((d) => d.id !== id);
      await asyncStorage.setJSON(ASYNC_KEYS.SELLER_DRAFTS, filtered);
      set({ draftsList: filtered, drafts: filtered });
    } catch (e) {
      console.error('Failed to delete draft:', e);
    }
  },

  startNewWizard: () => {
    get().resetWizard();
  },

  resetWizard: () => {
    set({
      currentStep: 1,
      draftId: 'seller_draft_' + Date.now(),
      step1: INITIAL_STEP1,
      step2: INITIAL_STEP2,
      step3: INITIAL_STEP3,
      step4: INITIAL_STEP4,
      step5: INITIAL_STEP5,
      step6: INITIAL_STEP6,
      isSubmitting: false,
    });
  },
}));

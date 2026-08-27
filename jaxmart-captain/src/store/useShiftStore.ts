// src/store/useShiftStore.ts
import { create } from 'zustand';
import { asyncStorage, ASYNC_KEYS } from '../utils/storage';
import api from '../api/client';

export interface ShiftLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  city?: string;
  pincode?: string;
}

export interface ShiftRecord {
  id: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  startLocation: ShiftLocation;
  endLocation?: ShiftLocation;
  selfieUri?: string;
  sellersOnboarded: number;
  skusCataloged: number;
  sellersOnboardedCount?: number;
  skusCatalogedCount?: number;
  status: 'ACTIVE' | 'COMPLETED';
}

interface ShiftState {
  isActive: boolean;
  activeShift: ShiftRecord | null;
  elapsedSeconds: number;
  history: ShiftRecord[];
  isLoading: boolean;

  // Actions
  initializeShift: () => Promise<void>;
  clockIn: (location: ShiftLocation, selfieUri?: string) => Promise<boolean>;
  clockOut: (location?: ShiftLocation) => Promise<ShiftRecord | null>;
  startShift: (location: ShiftLocation, selfieUri?: string) => Promise<boolean>;
  endShift: (location?: ShiftLocation) => Promise<ShiftRecord | null>;
  incrementSellersCount: () => void;
  incrementSkusCount: () => void;
  tickElapsed: () => void;
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  isActive: false,
  activeShift: null,
  elapsedSeconds: 0,
  history: [],
  isLoading: true,

  initializeShift: async () => {
    try {
      set({ isLoading: true });
      const activeShift = await asyncStorage.getJSON<ShiftRecord | null>(ASYNC_KEYS.ACTIVE_SHIFT, null);
      const history = await asyncStorage.getJSON<ShiftRecord[]>(ASYNC_KEYS.SHIFT_HISTORY, []);

      if (activeShift && activeShift.status === 'ACTIVE') {
        const startMs = new Date(activeShift.startTime).getTime();
        const nowMs = Date.now();
        const diffSeconds = Math.max(0, Math.floor((nowMs - startMs) / 1000));

        set({
          isActive: true,
          activeShift: {
            ...activeShift,
            sellersOnboardedCount: activeShift.sellersOnboarded,
            skusCatalogedCount: activeShift.skusCataloged,
          },
          elapsedSeconds: diffSeconds,
          history,
          isLoading: false,
        });
      } else {
        set({
          isActive: false,
          activeShift: null,
          elapsedSeconds: 0,
          history,
          isLoading: false,
        });
      }
    } catch (e) {
      set({ isLoading: false });
    }
  },

  clockIn: async (location: ShiftLocation, selfieUri?: string) => {
    try {
      const newShift: ShiftRecord = {
        id: 'shift_' + Date.now(),
        startTime: new Date().toISOString(),
        durationSeconds: 0,
        startLocation: location,
        selfieUri,
        sellersOnboarded: 0,
        skusCataloged: 0,
        sellersOnboardedCount: 0,
        skusCatalogedCount: 0,
        status: 'ACTIVE',
      };

      await asyncStorage.setJSON(ASYNC_KEYS.ACTIVE_SHIFT, newShift);
      await api.post('/captain/shift/clock-in', { location }).catch(() => {});

      set({
        isActive: true,
        activeShift: newShift,
        elapsedSeconds: 0,
      });
      return true;
    } catch (e) {
      console.error('Clock-in error:', e);
      return false;
    }
  },

  clockOut: async (location?: ShiftLocation) => {
    try {
      const active = get().activeShift;
      if (!active) return null;

      const completedShift: ShiftRecord = {
        ...active,
        endTime: new Date().toISOString(),
        durationSeconds: get().elapsedSeconds,
        endLocation: location || active.startLocation,
        sellersOnboardedCount: active.sellersOnboarded,
        skusCatalogedCount: active.skusCataloged,
        status: 'COMPLETED',
      };

      const existingHistory = get().history;
      const updatedHistory = [completedShift, ...existingHistory];

      await asyncStorage.setJSON(ASYNC_KEYS.SHIFT_HISTORY, updatedHistory);
      await asyncStorage.removeItem(ASYNC_KEYS.ACTIVE_SHIFT);
      await api.post('/captain/shift/clock-out', { location }).catch(() => {});

      set({
        isActive: false,
        activeShift: null,
        elapsedSeconds: 0,
        history: updatedHistory,
      });

      return completedShift;
    } catch (e) {
      console.error('Clock-out error:', e);
      return null;
    }
  },

  startShift: async (location: ShiftLocation, selfieUri?: string) => {
    return get().clockIn(location, selfieUri);
  },

  endShift: async (location?: ShiftLocation) => {
    return get().clockOut(location);
  },

  incrementSellersCount: () => {
    const active = get().activeShift;
    if (active) {
      const count = (active.sellersOnboarded || 0) + 1;
      const updated = {
        ...active,
        sellersOnboarded: count,
        sellersOnboardedCount: count,
      };
      asyncStorage.setJSON(ASYNC_KEYS.ACTIVE_SHIFT, updated);
      set({ activeShift: updated });
    }
  },

  incrementSkusCount: () => {
    const active = get().activeShift;
    if (active) {
      const count = (active.skusCataloged || 0) + 1;
      const updated = {
        ...active,
        skusCataloged: count,
        skusCatalogedCount: count,
      };
      asyncStorage.setJSON(ASYNC_KEYS.ACTIVE_SHIFT, updated);
      set({ activeShift: updated });
    }
  },

  tickElapsed: () => {
    if (get().isActive) {
      set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 }));
    }
  },
}));

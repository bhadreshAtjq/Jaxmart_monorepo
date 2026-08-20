// src/store/useAlertStore.ts
import { create } from 'zustand';
import * as Haptics from 'expo-haptics';

export type AlertType = 'info' | 'warning' | 'error' | 'success';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertConfig {
  title: string;
  message: string;
  type?: AlertType;
  buttons?: AlertButton[];
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertStoreState {
  isOpen: boolean;
  config: AlertConfig | null;
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
}

export const useAlertStore = create<AlertStoreState>((set) => ({
  isOpen: false,
  config: null,
  showAlert: (config: AlertConfig) => {
    try {
      if (config.type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (config.type === 'warning') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else if (config.type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (e) {}

    set({ isOpen: true, config });
  },
  hideAlert: () => {
    set({ isOpen: false, config: null });
  },
}));

/**
 * Global helper to trigger Material 3 Alerts anywhere
 */
export const showM3Alert = (
  title: string,
  message: string,
  buttons?: AlertButton[] | (() => void),
  type: AlertType = 'info'
) => {
  if (typeof buttons === 'function') {
    useAlertStore.getState().showAlert({
      title,
      message,
      type,
      confirmText: 'OK',
      onConfirm: buttons,
    });
  } else if (Array.isArray(buttons) && buttons.length > 0) {
    useAlertStore.getState().showAlert({
      title,
      message,
      type,
      buttons,
    });
  } else {
    useAlertStore.getState().showAlert({
      title,
      message,
      type,
      confirmText: 'OK',
    });
  }
};

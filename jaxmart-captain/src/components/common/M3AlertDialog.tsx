// src/components/common/M3AlertDialog.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, elevation } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useAlertStore, AlertButton } from '../../store/useAlertStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const M3AlertDialog: React.FC = () => {
  const isOpen = useAlertStore((s) => s.isOpen);
  const config = useAlertStore((s) => s.config);
  const hideAlert = useAlertStore((s) => s.hideAlert);

  if (!isOpen || !config) return null;

  const {
    title,
    message,
    type = 'info',
    buttons,
    confirmText = 'OK',
    cancelText,
    onConfirm,
    onCancel,
  } = config;

  const getIconConfig = () => {
    switch (type) {
      case 'error':
        return {
          icon: 'alert-circle' as const,
          bg: colors.errorContainer,
          color: colors.onErrorContainer,
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          bg: colors.warningContainer,
          color: colors.onWarningContainer,
        };
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          bg: colors.secondaryContainer,
          color: colors.onSecondaryContainer,
        };
      case 'info':
      default:
        return {
          icon: 'information-circle' as const,
          bg: colors.primaryContainer,
          color: colors.onPrimaryContainer,
        };
    }
  };

  const iconInfo = getIconConfig();

  const handleButtonPress = (btn: AlertButton) => {
    hideAlert();
    if (btn.onPress) {
      btn.onPress();
    }
  };

  const handleConfirmPress = () => {
    hideAlert();
    if (onConfirm) onConfirm();
  };

  const handleCancelPress = () => {
    hideAlert();
    if (onCancel) onCancel();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={handleCancelPress}
    >
      <TouchableWithoutFeedback onPress={handleCancelPress}>
        <View style={styles.scrimOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialogCard}>
              {/* Semantic Icon Bubble */}
              <View style={[styles.iconBubble, { backgroundColor: iconInfo.bg }]}>
                <Ionicons name={iconInfo.icon} size={28} color={iconInfo.color} />
              </View>

              {/* Title & Message */}
              <Text style={styles.titleText}>{title}</Text>
              <Text style={styles.messageText}>{message}</Text>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                {buttons && buttons.length > 0 ? (
                  buttons.map((btn, index) => {
                    const isDestructive = btn.style === 'destructive';
                    const isCancel = btn.style === 'cancel';
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.actionBtn,
                          !isCancel && !isDestructive && styles.primaryActionBtn,
                          isDestructive && styles.destructiveActionBtn,
                          isCancel && styles.cancelActionBtn,
                        ]}
                        onPress={() => handleButtonPress(btn)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.actionBtnText,
                            !isCancel && !isDestructive && styles.primaryActionText,
                            isDestructive && styles.destructiveActionText,
                            isCancel && styles.cancelActionText,
                          ]}
                        >
                          {btn.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <>
                    {Boolean(cancelText) && (
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.cancelActionBtn]}
                        onPress={handleCancelPress}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.actionBtnText, styles.cancelActionText]}>
                          {cancelText}
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        type === 'error' ? styles.destructiveActionBtn : styles.primaryActionBtn,
                      ]}
                      onPress={handleConfirmPress}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.actionBtnText,
                          type === 'error' ? styles.destructiveActionText : styles.primaryActionText,
                        ]}
                      >
                        {confirmText}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrimOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)', // Material 3 Scrim overlay
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  dialogCard: {
    width: Math.min(SCREEN_WIDTH - 48, 360),
    backgroundColor: colors.surface,
    borderRadius: borderRadius.extraLarge, // 28dp M3 standard for dialogs
    padding: spacing.lg,
    alignItems: 'center',
    ...elevation.level3,
  },
  iconBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  titleText: {
    ...typography.titleLarge,
    color: colors.onSurface,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  messageText: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    gap: spacing.xs,
  },
  actionBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  actionBtnText: {
    ...typography.labelLarge,
    fontSize: 13,
    textAlign: 'center',
  },
  primaryActionBtn: {
    backgroundColor: colors.primary,
  },
  primaryActionText: {
    ...typography.labelLarge,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  destructiveActionBtn: {
    backgroundColor: colors.error,
  },
  destructiveActionText: {
    ...typography.labelLarge,
    color: colors.onError,
    fontWeight: '700',
  },
  cancelActionBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  cancelActionText: {
    ...typography.labelLarge,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
});

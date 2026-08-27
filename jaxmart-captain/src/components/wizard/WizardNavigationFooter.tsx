// src/components/wizard/WizardNavigationFooter.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, elevation } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';

interface WizardNavigationFooterProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft?: () => void;
  isSubmitting?: boolean;
  nextLabel?: string;
  disableNext?: boolean;
}

export const WizardNavigationFooter: React.FC<WizardNavigationFooterProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSaveDraft,
  isSubmitting = false,
  nextLabel,
  disableNext = false,
}) => {
  const insets = useSafeAreaInsets();
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  const defaultNextLabel = isLastStep
    ? 'Submit'
    : 'Next Step';

  const handleNextPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    onNext();
  };

  const handleBackPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    onBack();
  };

  const handleDraftPress = () => {
    if (onSaveDraft) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
      onSaveDraft();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {/* Back Button (M3 Outlined Button) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleBackPress}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={18} color={colors.primary} />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Save Draft Button (M3 Filled Tonal Button) */}
      {onSaveDraft && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDraftPress}
          style={styles.draftButton}
        >
          <Ionicons name="save-outline" size={18} color={colors.onSecondaryContainer} />
          <Text style={styles.draftButtonText}>Draft</Text>
        </TouchableOpacity>
      )}

      {/* Next / Submit Button (M3 Filled Button) */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleNextPress}
        disabled={disableNext || isSubmitting}
        style={[
          styles.nextButton,
          isLastStep && styles.submitButton,
          (disableNext || isSubmitting) && styles.nextButtonDisabled,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={colors.onPrimary} />
        ) : (
          <>
            <Text style={styles.nextButtonText}>
              {nextLabel || defaultNextLabel}
            </Text>
            <Ionicons
              name={isLastStep ? 'checkmark-done' : 'arrow-forward'}
              size={18}
              color={colors.onPrimary}
              style={{ marginLeft: 6 }}
            />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    ...elevation.level2,
    zIndex: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.outline,
    paddingVertical: spacing.xs + 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    minHeight: 40,
  },
  backButtonText: {
    ...typography.labelMedium,
    color: colors.primary,
    fontWeight: '700',
    marginLeft: 4,
  },
  draftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryContainer,
    paddingVertical: spacing.xs + 4,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginHorizontal: spacing.xs,
    minHeight: 40,
  },
  draftButtonText: {
    ...typography.labelMedium,
    color: colors.onSecondaryContainer,
    fontWeight: '700',
    marginLeft: 4,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs + 4,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginLeft: spacing.xs,
    minHeight: 40,
    ...elevation.level1,
  },
  submitButton: {
    backgroundColor: colors.secondary,
  },
  nextButtonDisabled: {
    backgroundColor: colors.surfaceContainerHigh,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    ...typography.labelLarge,
    color: colors.onPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
});

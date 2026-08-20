// src/components/wizard/WizardStepHeader.tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, elevation } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';

interface WizardStepHeaderProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  stepSubtitle?: string;
  stepNames?: string[];
  onStepPress?: (step: number) => void;
  onBack?: () => void;
}

export const WizardStepHeader: React.FC<WizardStepHeaderProps> = ({
  currentStep,
  totalSteps,
  stepTitle,
  stepSubtitle,
  stepNames = [],
  onStepPress,
  onBack,
}) => {
  const progressPercent = Math.round((currentStep / totalSteps) * 100);
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll the step chips to keep active step in view
  useEffect(() => {
    if (scrollRef.current && currentStep > 2) {
      scrollRef.current.scrollTo({
        x: (currentStep - 2) * 110,
        animated: true,
      });
    }
  }, [currentStep]);

  const handleStepClick = (stepNum: number) => {
    if (stepNum <= currentStep && onStepPress) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
      onStepPress(stepNum);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Meta Bar */}
      <View style={styles.topRow}>
        <View style={styles.leftMetaRow}>
          {onBack && (
            <TouchableOpacity
              onPress={onBack}
              style={styles.backTouchBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
            </TouchableOpacity>
          )}
          <View style={styles.stepBadge}>
            <View style={styles.pulsingDot} />
            <Text style={styles.stepBadgeText}>
              STEP {currentStep} OF {totalSteps}
            </Text>
          </View>
        </View>

        <View style={styles.percentBadge}>
          <Text style={styles.percentText}>{progressPercent}% Done</Text>
        </View>
      </View>

      {/* Main Title & Subtitle */}
      <View style={styles.titlesContainer}>
        <Text style={styles.title} numberOfLines={1}>{stepTitle}</Text>
        {Boolean(stepSubtitle) && (
          <Text style={styles.subtitle} numberOfLines={2}>{stepSubtitle}</Text>
        )}
      </View>

      {/* Material 3 Linear Progress Indicator */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
      </View>

      {/* Interactive M3 Filter & Assist Step Chips */}
      {stepNames.length > 0 && (
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {stepNames.map((name, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            const isTappable = stepNum <= currentStep && Boolean(onStepPress);

            return (
              <TouchableOpacity
                key={name}
                activeOpacity={isTappable ? 0.7 : 1}
                onPress={() => handleStepClick(stepNum)}
                disabled={!isTappable}
                style={[
                  styles.stepChip,
                  isCurrent && styles.stepChipCurrent,
                  isCompleted && styles.stepChipCompleted,
                ]}
              >
                {/* Step Number or Checkmark */}
                <View
                  style={[
                    styles.chipCircle,
                    isCurrent && styles.chipCircleCurrent,
                    isCompleted && styles.chipCircleCompleted,
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={12} color={colors.onSecondaryContainer} />
                  ) : (
                    <Text
                      style={[
                        styles.chipCircleText,
                        isCurrent && styles.chipCircleTextCurrent,
                      ]}
                    >
                      {stepNum}
                    </Text>
                  )}
                </View>

                {/* Step Label */}
                <Text
                  style={[
                    styles.chipText,
                    isCurrent && styles.chipTextCurrent,
                    isCompleted && styles.chipTextCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.xs : spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    ...elevation.level1,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  leftMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backTouchBtn: {
    marginRight: spacing.sm,
    padding: 4,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.full,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 6,
  },
  stepBadgeText: {
    ...typography.labelSmall,
    color: colors.onPrimaryContainer,
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  percentBadge: {
    backgroundColor: colors.surfaceContainerLow,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  percentText: {
    ...typography.labelSmall,
    color: colors.secondary,
    fontWeight: '700',
    fontSize: 10,
  },
  titlesContainer: {
    marginVertical: 2,
  },
  title: {
    ...typography.titleLarge,
    color: colors.onSurface,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    lineHeight: 16,
    marginTop: 2,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  chipsScroll: {
    paddingVertical: spacing.sm,
    paddingRight: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: borderRadius.small,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm + 2,
    marginRight: spacing.xs + 2,
  },
  stepChipCurrent: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  stepChipCompleted: {
    backgroundColor: colors.secondaryContainer,
    borderColor: colors.secondary,
  },
  chipCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  chipCircleCurrent: {
    backgroundColor: colors.primary,
  },
  chipCircleCompleted: {
    backgroundColor: colors.secondaryContainer,
  },
  chipCircleText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
  },
  chipCircleTextCurrent: {
    color: colors.onPrimary,
  },
  chipText: {
    ...typography.labelSmall,
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },
  chipTextCurrent: {
    color: colors.onPrimaryContainer,
    fontWeight: '700',
  },
  chipTextCompleted: {
    color: colors.onSecondaryContainer,
    fontWeight: '600',
  },
});

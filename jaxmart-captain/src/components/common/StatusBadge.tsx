// src/components/common/StatusBadge.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export type StatusType =
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'UNDER_REVIEW'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'DRAFT'
  | 'SUBMITTED';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'sm',
  style,
}) => {
  const getBadgeConfig = () => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED':
      case 'ACTIVE':
      case 'COMPLETED':
        return {
          bg: colors.secondaryContainer,
          text: colors.onSecondaryContainer,
          defaultLabel: status === 'VERIFIED' ? 'Verified' : status === 'ACTIVE' ? 'Active' : 'Completed',
        };
      case 'REJECTED':
        return {
          bg: colors.errorContainer,
          text: colors.onErrorContainer,
          defaultLabel: 'Rejected',
        };
      case 'UNDER_REVIEW':
      case 'SUBMITTED':
        return {
          bg: colors.tertiaryContainer,
          text: colors.onTertiaryContainer,
          defaultLabel: status === 'SUBMITTED' ? 'Submitted' : 'Under Review',
        };
      case 'PENDING':
      case 'DRAFT':
      default:
        return {
          bg: colors.surfaceContainerHigh,
          text: colors.onSurfaceVariant,
          defaultLabel: status === 'DRAFT' ? 'Draft' : 'Pending',
        };
    }
  };

  const config = getBadgeConfig();
  const displayLabel = label || config.defaultLabel;

  return (
    <View
      style={[
        styles.badgeBase,
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        { backgroundColor: config.bg },
        style,
      ]}
    >
      <Text
        style={[
          styles.textBase,
          size === 'sm' ? typography.labelSmall : typography.labelMedium,
          { color: config.text },
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeBase: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  badgeMd: {
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
  },
  textBase: {
    fontWeight: '700',
    textAlign: 'center',
  },
});

// src/components/common/AppCard.tsx
import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, elevation } from '../../theme/spacing';

export type CardVariant = 'elevated' | 'filled' | 'outlined';

interface AppCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
  onPress?: () => void;
  activeOpacity?: number;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  variant = 'outlined',
  style,
  onPress,
  activeOpacity = 0.85,
}) => {
  const getCardStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surfaceContainerLow,
          ...elevation.level1,
        };
      case 'filled':
        return {
          backgroundColor: colors.surfaceContainerHighest,
          borderWidth: 0,
        };
      case 'outlined':
      default:
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.outlineVariant,
        };
    }
  };

  const containerStyle = [styles.cardBase, getCardStyle(), style];

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        activeOpacity={activeOpacity}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: borderRadius.medium, // 12dp M3 Card standard
    padding: spacing.md,
    overflow: 'hidden',
  },
});

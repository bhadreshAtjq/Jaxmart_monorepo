// src/components/common/AppButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, elevation } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';

export type ButtonVariant =
  | 'filled'
  | 'filledTonal'
  | 'elevated'
  | 'outlined'
  | 'text'
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success';

export type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  enableHaptics?: boolean;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'filled',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
  enableHaptics = true,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    if (enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  // Resolve M3 style configurations
  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.full,
      width: fullWidth ? '100%' : 'auto',
      minHeight: size === 'sm' ? 36 : size === 'lg' ? 56 : 48,
      paddingHorizontal: size === 'sm' ? spacing.md : size === 'lg' ? spacing.xl : spacing.lg,
    };

    switch (variant) {
      case 'filled':
      case 'primary':
        return {
          ...base,
          backgroundColor: colors.primary,
        };
      case 'filledTonal':
      case 'secondary':
        return {
          ...base,
          backgroundColor: colors.secondaryContainer,
        };
      case 'elevated':
        return {
          ...base,
          backgroundColor: colors.surfaceContainerLow,
          ...elevation.level1,
        };
      case 'outlined':
      case 'outline':
        return {
          ...base,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.outline,
        };
      case 'text':
      case 'ghost':
        return {
          ...base,
          backgroundColor: 'transparent',
          paddingHorizontal: spacing.sm,
        };
      case 'danger':
        return {
          ...base,
          backgroundColor: colors.error,
        };
      case 'success':
        return {
          ...base,
          backgroundColor: colors.secondary,
        };
      default:
        return {
          ...base,
          backgroundColor: colors.primary,
        };
    }
  };

  const getLabelColor = (): string => {
    if (disabled) return colors.outline;
    switch (variant) {
      case 'filled':
      case 'primary':
      case 'danger':
      case 'success':
        return colors.onPrimary;
      case 'filledTonal':
      case 'secondary':
        return colors.onSecondaryContainer;
      case 'elevated':
      case 'outlined':
      case 'outline':
      case 'text':
      case 'ghost':
        return colors.primary;
      default:
        return colors.onPrimary;
    }
  };

  const labelColor = getLabelColor();
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        getContainerStyle(),
        disabled && styles.disabledContainer,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={labelColor} />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={labelColor}
              style={{ marginRight: spacing.xs + 2 }}
            />
          )}
          <Text
            style={[
              styles.labelBase,
              size === 'sm' && typography.labelMedium,
              size === 'md' && typography.labelLarge,
              size === 'lg' && typography.titleMedium,
              { color: labelColor },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={labelColor}
              style={{ marginLeft: spacing.xs + 2 }}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelBase: {
    fontWeight: '700',
    textAlign: 'center',
  },
  disabledContainer: {
    backgroundColor: colors.surfaceContainerHigh,
    borderColor: colors.outlineVariant,
    opacity: 0.6,
  },
});

// src/theme/spacing.ts
import { ViewStyle } from 'react-native';

/**
 * Material Design 3 (Material You) Spacing, Shape & Elevation System
 * 8dp baseline grid with standard corner radii and tonal elevation shadows
 */

export const spacing = {
  none: 0,
  xs: 4, // 0.5x
  sm: 8, // 1x
  md: 16, // 2x
  lg: 24, // 3x
  xl: 32, // 4x
  xxl: 48, // 6x
  huge: 64, // 8x
} as const;

export const borderRadius = {
  none: 0,
  extraSmall: 4, // Snackbars
  small: 8, // Text fields, menus, chips
  medium: 12, // Cards
  large: 16, // FAB, Navigation drawers
  largeIncreased: 20,
  extraLarge: 28, // Dialogs, Bottom sheets
  full: 9999, // Buttons, Pills, Badges

  // Legacy mappings
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

/**
 * Material Design 3 Elevation System (Levels 0 through 5)
 */
export const elevation: Record<string, ViewStyle> = {
  level0: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  level1: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 1,
  },
  level2: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  level3: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  level4: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  level5: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 5,
  },
};

export const shadows = {
  card: elevation.level1,
  elevated: elevation.level2,
  modal: elevation.level3,
  fab: elevation.level3,
  header: elevation.level1,
};

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;

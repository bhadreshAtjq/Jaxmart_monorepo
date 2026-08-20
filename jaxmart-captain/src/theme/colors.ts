// src/theme/colors.ts
/**
 * Material Design 3 (Material You) Design System
 * Sleek, Lightweight, Airy Tonal Palette
 */

export const colors = {
  // Primary Accent & Container
  primary: '#1E293B', // Sleek Navy/Slate Primary
  onPrimary: '#FFFFFF',
  primaryContainer: '#E2E8F0',
  onPrimaryContainer: '#0F172A',
  primaryDark: '#0F172A',

  // Secondary Accent & Container (Jaxmart Precision Teal)
  secondary: '#0D9488', // Modern Teal
  onSecondary: '#FFFFFF',
  secondaryContainer: '#CCFBF1',
  onSecondaryContainer: '#115E59',

  // Tertiary Accent & Container (Steel Blue)
  tertiary: '#3B82F6',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#DBEAFE',
  onTertiaryContainer: '#1E40AF',

  // Error Colors
  error: '#DC2626',
  onError: '#FFFFFF',
  errorContainer: '#FEE2E2',
  onErrorContainer: '#991B1B',

  // Surface & Neutral Hierarchy (Light & Airy)
  surface: '#FFFFFF',
  onSurface: '#0F172A',
  onSurfaceVariant: '#64748B',
  surfaceDim: '#F1F5F9',
  surfaceBright: '#FFFFFF',

  // 5 Levels of M3 Surface Containers
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F8FAFC',
  surfaceContainer: '#F1F5F9',
  surfaceContainerHigh: '#E2E8F0',
  surfaceContainerHighest: '#CBD5E1',

  // Outlines & Dividers (Subtle Hairlines)
  outline: '#94A3B8', // 3:1 Contrast for interactive text field borders
  outlineVariant: '#E2E8F0', // Crisp, subtle hairline borders (no heavy dark outlines)

  // Inverse Colors (e.g. Snackbars, Tooltips)
  inverseSurface: '#1E293B',
  inverseOnSurface: '#F8FAFC',
  inversePrimary: '#93C5FD',

  // Fixed Accents
  primaryFixed: '#E2E8F0',
  primaryFixedDim: '#CBD5E1',
  onPrimaryFixed: '#0F172A',
  onPrimaryFixedVariant: '#334155',

  // Semantic Status Tonal Pairings
  successContainer: '#DCFCE7',
  onSuccessContainer: '#166534',
  warningContainer: '#FEF3C7',
  onWarningContainer: '#92400E',
  infoContainer: '#E0F2FE',
  onInfoContainer: '#075985',

  // Backwards compatibility mappings
  background: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textPlaceholder: '#94A3B8',
  textMuted: '#94A3B8',
  divider: '#E2E8F0',
  warning: '#F59E0B',
  success: '#10B981',
  info: '#3B82F6',
} as const;

export type Colors = typeof colors;
export type ColorToken = keyof typeof colors;

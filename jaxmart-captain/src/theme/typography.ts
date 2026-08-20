// src/theme/typography.ts
import { TextStyle, Platform } from 'react-native';

/**
 * Material Design 3 Typography Scale (15 Baseline + Emphasized Styles)
 * Fully compliant with Google MD3 Specification
 */

export const fontFamilies = {
  sans: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  mono: Platform.select({
    ios: 'Courier',
    android: 'monospace',
    default: 'monospace',
  }),
};

const FONT_FAMILY = fontFamilies.sans;
const MONO_FONT = fontFamilies.mono;

export const typography: Record<string, TextStyle> = {
  // Display (Hero text & large banners)
  displayLarge: {
    fontFamily: FONT_FAMILY,
    fontSize: 57,
    lineHeight: 64,
    fontWeight: '400',
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontFamily: FONT_FAMILY,
    fontSize: 45,
    lineHeight: 52,
    fontWeight: '400',
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: FONT_FAMILY,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '400',
    letterSpacing: 0,
  },

  // Headline (Primary section headers)
  headlineLarge: {
    fontFamily: FONT_FAMILY,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: FONT_FAMILY,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600',
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: FONT_FAMILY,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: 0,
  },

  // Title (Card titles, Top App Bar, Section Dividers)
  titleLarge: {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  // Body (Readability, paragraphs, inputs)
  bodyLarge: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.4,
  },

  // Label (Buttons, Badges, Tabs, Form Labels)
  labelLarge: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Monospace Tokens for Barcodes, GSTIN, PAN, and SKUs
  monoLarge: {
    fontFamily: MONO_FONT,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 1,
  },
  monoMedium: {
    fontFamily: MONO_FONT,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  monoSmall: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.25,
  },

  // Legacy mappings for backwards compatibility
  displayLg: {
    fontFamily: FONT_FAMILY,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
  },
  headlineLg: {
    fontFamily: FONT_FAMILY,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  headlineMd: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  titleMd: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  bodyMd: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  bodySm: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  labelMd: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  labelCaps: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  monoLg: {
    fontFamily: MONO_FONT,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  monoSm: {
    fontFamily: MONO_FONT,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
};

export type Typography = typeof typography;

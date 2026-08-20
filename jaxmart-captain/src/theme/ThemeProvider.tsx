// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { colors, Colors } from './colors';
import { typography, Typography, fontFamilies } from './typography';
import { spacing, Spacing, borderRadius, BorderRadius, shadows, Shadows } from './spacing';

export interface Theme {
  colors: Colors;
  typography: Typography;
  fontFamilies: typeof fontFamilies;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
}

export const theme: Theme = {
  colors,
  typography,
  fontFamilies,
  spacing,
  borderRadius,
  shadows,
};

const ThemeContext = createContext<Theme>(theme);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

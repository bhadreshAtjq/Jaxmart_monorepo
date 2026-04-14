// lib/utils/constants.dart
import 'package:flutter/material.dart';

class AppColors {
  // Primary brand
  static const primary = Color(0xFF1A56DB);
  static const primaryLight = Color(0xFF3B82F6);
  static const primaryDark = Color(0xFF1E40AF);
  static const primarySurface = Color(0xFFEFF6FF);

  // Secondary / accent
  static const secondary = Color(0xFF059669);
  static const secondaryLight = Color(0xFF10B981);
  static const secondarySurface = Color(0xFFECFDF5);

  // Semantic
  static const success = Color(0xFF059669);
  static const successSurface = Color(0xFFECFDF5);
  static const warning = Color(0xFFD97706);
  static const warningSurface = Color(0xFFFFFBEB);
  static const error = Color(0xFFDC2626);
  static const errorSurface = Color(0xFFFEF2F2);
  static const info = Color(0xFF0284C7);
  static const infoSurface = Color(0xFFE0F2FE);

  // Neutrals
  static const gray50 = Color(0xFFF9FAFB);
  static const gray100 = Color(0xFFF3F4F6);
  static const gray200 = Color(0xFFE5E7EB);
  static const gray300 = Color(0xFFD1D5DB);
  static const gray400 = Color(0xFF9CA3AF);
  static const gray500 = Color(0xFF6B7280);
  static const gray600 = Color(0xFF4B5563);
  static const gray700 = Color(0xFF374151);
  static const gray800 = Color(0xFF1F2937);
  static const gray900 = Color(0xFF111827);

  // Background
  static const background = Color(0xFFF9FAFB);
  static const surface = Colors.white;
  static const surfaceVariant = Color(0xFFF3F4F6);

  // Text
  static const textPrimary = Color(0xFF111827);
  static const textSecondary = Color(0xFF6B7280);
  static const textTertiary = Color(0xFF9CA3AF);
  static const textOnPrimary = Colors.white;
}

class AppTextStyles {
  static const _fontFamily = 'Inter';

  static const h1 = TextStyle(fontFamily: _fontFamily, fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.textPrimary, height: 1.3);
  static const h2 = TextStyle(fontFamily: _fontFamily, fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.textPrimary, height: 1.3);
  static const h3 = TextStyle(fontFamily: _fontFamily, fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textPrimary, height: 1.4);
  static const h4 = TextStyle(fontFamily: _fontFamily, fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary, height: 1.4);
  static const h5 = TextStyle(fontFamily: _fontFamily, fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary, height: 1.5);

  static const bodyLarge = TextStyle(fontFamily: _fontFamily, fontSize: 16, fontWeight: FontWeight.w400, color: AppColors.textPrimary, height: 1.6);
  static const bodyMedium = TextStyle(fontFamily: _fontFamily, fontSize: 14, fontWeight: FontWeight.w400, color: AppColors.textPrimary, height: 1.5);
  static const bodySmall = TextStyle(fontFamily: _fontFamily, fontSize: 13, fontWeight: FontWeight.w400, color: AppColors.textSecondary, height: 1.5);

  static const caption = TextStyle(fontFamily: _fontFamily, fontSize: 12, fontWeight: FontWeight.w400, color: AppColors.textTertiary, height: 1.4);
  static const labelLarge = TextStyle(fontFamily: _fontFamily, fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textPrimary);
  static const labelMedium = TextStyle(fontFamily: _fontFamily, fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.textPrimary);
  static const labelSmall = TextStyle(fontFamily: _fontFamily, fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textPrimary);
}

class AppTheme {
  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    fontFamily: 'Inter',
    colorScheme: const ColorScheme.light(
      primary: AppColors.primary,
      secondary: AppColors.secondary,
      surface: AppColors.surface,
      error: AppColors.error,
      onPrimary: Colors.white,
      onSurface: AppColors.textPrimary,
    ),
    scaffoldBackgroundColor: AppColors.background,
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.white,
      foregroundColor: AppColors.textPrimary,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(fontFamily: 'Inter', fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
      surfaceTintColor: Colors.white,
    ),
    cardTheme: CardTheme(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppColors.gray200, width: 1),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        textStyle: const TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: FontWeight.w600),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primary,
        side: const BorderSide(color: AppColors.primary),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        textStyle: const TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: FontWeight.w600),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.gray50,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.gray300)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.gray200)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.primary, width: 2)),
      errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.error)),
      labelStyle: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
      hintStyle: AppTextStyles.bodyMedium.copyWith(color: AppColors.textTertiary),
    ),
    dividerTheme: const DividerThemeData(color: AppColors.gray200, thickness: 1, space: 0),
    chipTheme: ChipThemeData(
      backgroundColor: AppColors.gray100,
      selectedColor: AppColors.primarySurface,
      labelStyle: AppTextStyles.labelSmall,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: Colors.white,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: AppColors.gray400,
      elevation: 0,
      type: BottomNavigationBarType.fixed,
      selectedLabelStyle: TextStyle(fontFamily: 'Inter', fontSize: 11, fontWeight: FontWeight.w500),
      unselectedLabelStyle: TextStyle(fontFamily: 'Inter', fontSize: 11),
    ),
  );
}

class AppSpacing {
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 16.0;
  static const lg = 24.0;
  static const xl = 32.0;
  static const xxl = 48.0;
}

class AppRadius {
  static const sm = 6.0;
  static const md = 10.0;
  static const lg = 12.0;
  static const xl = 16.0;
  static const full = 100.0;
}

class AppConstants {
  static const baseUrl = 'http://localhost:4000/api';
  static const socketUrl = 'http://localhost:4000';
  static const appName = 'B2B Platform';
  static const supportPhone = '+919999999999';
}

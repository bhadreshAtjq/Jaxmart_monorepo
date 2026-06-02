import 'package:flutter/material.dart';

class JaxColors {
  static const surface = Color(0xFFF6F8FB);
  static const surfaceLow = Color(0xFFF1F4F8);
  static const surfaceContainer = Color(0xFFEBF0F6);
  static const surfaceHigh = Color(0xFFE1E8F1);
  static const onSurface = Color(0xFF121358);
  static const onSurfaceVariant = Color(0xFF4E5D78);
  static const outline = Color(0xFF7B8C9F);
  static const outlineVariant = Color(0xFFD0D9E4);
  static const primary = Color(0xFF232F72);
  static const primaryContainer = Color(0xFF121358);
  static const secondary = Color(0xFF36ADA3);
  static const secondaryDark = Color(0xFF165A54);
  static const tertiary = Color(0xFF2F578A);
  static const error = Color(0xFFBA1A1A);
  static const warning = Color(0xFFD97706);
  static const success = Color(0xFF059669);
  static const white = Colors.white;
}

class JaxSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
  static const double xxl = 48;
}

class JaxRadius {
  static const double sm = 8;
  static const double md = 10;
  static const double lg = 12;
  static const double xl = 16;
  static const double xxl = 24;
}

class JaxText {
  static const heading = 'Raleway';
  static const body = 'SourceSans3';

  static const h1 = TextStyle(
    fontFamily: heading,
    fontSize: 28,
    fontWeight: FontWeight.w800,
    color: JaxColors.onSurface,
    height: 1.15,
  );
  static const h2 = TextStyle(
    fontFamily: heading,
    fontSize: 22,
    fontWeight: FontWeight.w800,
    color: JaxColors.onSurface,
    height: 1.2,
  );
  static const h3 = TextStyle(
    fontFamily: heading,
    fontSize: 18,
    fontWeight: FontWeight.w700,
    color: JaxColors.onSurface,
    height: 1.25,
  );
  static const title = TextStyle(
    fontFamily: heading,
    fontSize: 14,
    fontWeight: FontWeight.w800,
    color: JaxColors.onSurface,
    height: 1.25,
  );
  static const bodyLarge = TextStyle(
    fontFamily: body,
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: JaxColors.onSurface,
    height: 1.45,
  );
  static const bodyMedium = TextStyle(
    fontFamily: body,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: JaxColors.onSurface,
    height: 1.45,
  );
  static const bodySmall = TextStyle(
    fontFamily: body,
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: JaxColors.onSurfaceVariant,
    height: 1.35,
  );
  static const label = TextStyle(
    fontFamily: heading,
    fontSize: 10,
    fontWeight: FontWeight.w800,
    color: JaxColors.onSurfaceVariant,
    letterSpacing: 1,
  );
}

class JaxTheme {
  static ThemeData get light {
    final scheme = ColorScheme.fromSeed(
      seedColor: JaxColors.primary,
      primary: JaxColors.primary,
      secondary: JaxColors.secondary,
      surface: JaxColors.white,
      error: JaxColors.error,
      brightness: Brightness.light,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      fontFamily: JaxText.body,
      scaffoldBackgroundColor: JaxColors.surface,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: JaxColors.onSurface,
        elevation: 0,
        centerTitle: false,
        surfaceTintColor: Colors.white,
        titleTextStyle: TextStyle(
          fontFamily: JaxText.heading,
          color: JaxColors.onSurface,
          fontSize: 16,
          fontWeight: FontWeight.w800,
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: Colors.white,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(JaxRadius.xl),
          side: const BorderSide(color: Color(0x99E5E7EB)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
        hintStyle: JaxText.bodyMedium.copyWith(color: Colors.grey.shade400),
        labelStyle: JaxText.label,
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(JaxRadius.lg),
          borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(JaxRadius.lg),
          borderSide: const BorderSide(color: JaxColors.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(JaxRadius.lg),
          borderSide: const BorderSide(color: JaxColors.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(JaxRadius.lg),
          borderSide: const BorderSide(color: JaxColors.error, width: 1.5),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        selectedItemColor: JaxColors.primary,
        unselectedItemColor: JaxColors.outline,
        selectedLabelStyle: TextStyle(
          fontFamily: JaxText.heading,
          fontSize: 10,
          fontWeight: FontWeight.w800,
        ),
        unselectedLabelStyle: TextStyle(
          fontFamily: JaxText.heading,
          fontSize: 10,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class JaxGradients {
  static const primary = LinearGradient(
    colors: [JaxColors.primary, JaxColors.tertiary],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );
  static const seller = LinearGradient(
    colors: [JaxColors.secondary, Color(0xFF2C9A91)],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );
}

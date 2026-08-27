// src/components/navigation/CustomFloatingTabBar.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Theme: primary=#1E293B (Navy), secondary=#0D9488 (Teal)
const ACTIVE_COLOR = '#1E293B';   // primary navy for active icon+label
const INACTIVE_COLOR = '#94A3B8'; // muted slate for inactive
const ACCENT_LINE = '#0D9488';    // teal accent line on top

const TABS: Record<string, {
  label: string;
  filled: keyof typeof Ionicons.glyphMap;
  outlined: keyof typeof Ionicons.glyphMap;
}> = {
  DashboardTab: { label: 'Home',      filled: 'home',       outlined: 'home-outline'       },
  CompaniesTab: { label: 'Merchants', filled: 'storefront', outlined: 'storefront-outline' },
  SkuWizardTab: { label: 'Catalog',   filled: 'cube',       outlined: 'cube-outline'       },
  ProfileTab:   { label: 'Me',        filled: 'person',     outlined: 'person-outline'     },
};

export const CustomFloatingTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const focusedRoute = state.routes[state.index];
  const nestedRouteName = getFocusedRouteNameFromRoute(focusedRoute) ?? focusedRoute.name;

  // Hide tab bar when inside the SkuWizard (except for the list and select screens)
  if (focusedRoute.name === 'SkuWizardTab' && nestedRouteName !== 'SkuDraftsList' && nestedRouteName !== 'CompanySelect' && nestedRouteName !== 'SkuWizardTab') {
    return null;
  }

  // Hide tab bar when inside the SellerWizard (except for the directory screen)
  if (focusedRoute.name === 'CompaniesTab' && nestedRouteName !== 'CompanyDirectory' && nestedRouteName !== 'CompaniesTab') {
    return null;
  }

  return (
    <View style={styles.safeWrap}>
      <View style={styles.bar}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const cfg = TABS[route.name] || { label: route.name, filled: 'ellipse' as any, outlined: 'ellipse-outline' as any };
        const { options } = descriptors[route.key];

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            activeOpacity={0.7}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                navigation.navigate(route.name);
              }
            }}
            onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            style={styles.tab}
          >
            {/* Teal accent line at top for active tab */}
            {isFocused && <View style={styles.activeLine} />}

            {/* Icon — no background box, just the icon */}
            <Ionicons
              name={isFocused ? cfg.filled : cfg.outlined}
              size={22}
              color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />

            {/* Label */}
            <Text style={[
              styles.label,
              { color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR },
              isFocused && { fontWeight: '700' },
            ]}>
              {cfg.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
  );
};

const styles = StyleSheet.create({
  safeWrap: {
    backgroundColor: '#FFFFFF',
    paddingBottom: Platform.OS === 'ios' ? 20 : 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  bar: {
    flexDirection: 'row',
    height: 56,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    position: 'relative',
    paddingTop: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.15,
  },
  activeLine: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#0D9488',
  },
});

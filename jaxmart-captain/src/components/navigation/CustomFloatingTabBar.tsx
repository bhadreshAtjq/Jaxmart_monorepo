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
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, elevation } from '../../theme/spacing';

export const CustomFloatingTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const getTabConfig = (routeName: string, isFocused: boolean) => {
    switch (routeName) {
      case 'DashboardTab':
        return {
          label: 'Dashboard',
          icon: (isFocused ? 'speedometer' : 'speedometer-outline') as keyof typeof Ionicons.glyphMap,
        };
      case 'CompaniesTab':
        return {
          label: 'Merchants',
          icon: (isFocused ? 'business' : 'business-outline') as keyof typeof Ionicons.glyphMap,
        };
      case 'SkuWizardTab':
        return {
          label: 'Catalog',
          icon: (isFocused ? 'barcode' : 'barcode-outline') as keyof typeof Ionicons.glyphMap,
        };
      case 'ProfileTab':
        return {
          label: 'Profile',
          icon: (isFocused ? 'person' : 'person-outline') as keyof typeof Ionicons.glyphMap,
        };
      default:
        return {
          label: routeName,
          icon: 'grid-outline' as keyof typeof Ionicons.glyphMap,
        };
    }
  };

  return (
    <View style={styles.floatingContainer}>
      <View style={styles.capsuleBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config = getTabConfig(route.name, isFocused);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (e) {}
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tabItem,
                isFocused && styles.tabItemActive,
              ]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconWrap,
                  isFocused && styles.iconWrapActive,
                ]}
              >
                <Ionicons
                  name={config.icon}
                  size={20}
                  color={isFocused ? colors.onPrimaryContainer : colors.onSurfaceVariant}
                />
              </View>
              <Text
                style={[
                  styles.label,
                  isFocused ? styles.labelActive : styles.labelInactive,
                ]}
                numberOfLines={1}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 14,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  capsuleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.extraLarge, // 28dp capsule radius
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...elevation.level2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: borderRadius.large,
  },
  tabItemActive: {
    backgroundColor: 'transparent',
  },
  iconWrap: {
    width: 44,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconWrapActive: {
    backgroundColor: colors.primaryContainer, // Material 3 Active Pill
  },
  label: {
    ...typography.labelSmall,
    fontSize: 10.5,
  },
  labelActive: {
    color: colors.onSurface,
    fontWeight: '700',
  },
  labelInactive: {
    color: colors.onSurfaceVariant,
    fontWeight: '500',
  },
});

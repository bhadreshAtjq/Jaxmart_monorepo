// src/navigation/RootNavigator.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { SellerWizardNavigator } from './SellerWizardNavigator';
import { ShiftHistoryScreen } from '../screens/dashboard/ShiftHistoryScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { OfflineDraftsScreen } from '../screens/drafts/OfflineDraftsScreen';
import { SyncManagerScreen } from '../screens/drafts/SyncManagerScreen';
import { M3AlertDialog } from '../components/common/M3AlertDialog';
import { useAuthStore } from '../store/useAuthStore';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, checkSession } = useAuthStore();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    checkSession().finally(() => setInitialLoading(false));
  }, [checkSession]);

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="SellerWizard"
              component={SellerWizardNavigator}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="SellerWizardTab"
              component={SellerWizardNavigator}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="OnboardSellerTab"
              component={SellerWizardNavigator}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="ShiftHistory"
              component={ShiftHistoryScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="SettingsScreen"
              component={SettingsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="OfflineDrafts"
              component={OfflineDraftsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="SyncManager"
              component={SyncManagerScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </Stack.Navigator>

      {/* Global Material 3 Alert Dialog Mount */}
      <M3AlertDialog />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

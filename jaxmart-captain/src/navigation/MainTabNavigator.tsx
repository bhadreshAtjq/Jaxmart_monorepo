// src/navigation/MainTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { MainTabParamList } from './types';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { CompaniesNavigator } from './CompaniesNavigator';
import { SkuWizardNavigator } from './SkuWizardNavigator';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { CustomFloatingTabBar } from '../components/navigation/CustomFloatingTabBar';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="DashboardTab"
      tabBar={(props) => <CustomFloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
      />
      <Tab.Screen
        name="CompaniesTab"
        component={CompaniesNavigator}
      />
      <Tab.Screen
        name="SkuWizardTab"
        component={SkuWizardNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'SkuDraftsList';
          // Hide tab bar for wizard steps (anything other than list or company select)
          if (routeName !== 'SkuDraftsList' && routeName !== 'CompanySelect') {
            return { tabBarStyle: { display: 'none' } };
          }
          return { tabBarStyle: { display: 'flex' } };
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
};

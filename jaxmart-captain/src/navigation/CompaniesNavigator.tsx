// src/navigation/CompaniesNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CompaniesStackParamList } from './types';
import { CompanyDirectoryScreen } from '../screens/companies/CompanyDirectoryScreen';
import { CompanyDetailScreen } from '../screens/companies/CompanyDetailScreen';

const Stack = createNativeStackNavigator<CompaniesStackParamList>();

export const CompaniesNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="CompanyDirectory"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="CompanyDirectory" component={CompanyDirectoryScreen} />
      <Stack.Screen name="CompanyDetail" component={CompanyDetailScreen} />
    </Stack.Navigator>
  );
};

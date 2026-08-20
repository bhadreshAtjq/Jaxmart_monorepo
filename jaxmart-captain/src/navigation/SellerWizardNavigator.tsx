// src/navigation/SellerWizardNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SellerWizardParamList } from './types';
import { SellerDraftsListScreen } from '../screens/onboarding/SellerDraftsListScreen';
import { Step1BasicProfileScreen } from '../screens/onboarding/Step1BasicProfileScreen';
import { Step2StoreLocationScreen } from '../screens/onboarding/Step2StoreLocationScreen';
import { Step3IdentityKycScreen } from '../screens/onboarding/Step3IdentityKycScreen';
import { Step4BankSettlementScreen } from '../screens/onboarding/Step4BankSettlementScreen';
import { Step5OperationsCategoryScreen } from '../screens/onboarding/Step5OperationsCategoryScreen';
import { Step6LegalSignatureScreen } from '../screens/onboarding/Step6LegalSignatureScreen';
import { Step7ReviewSubmitScreen } from '../screens/onboarding/Step7ReviewSubmitScreen';

const Stack = createNativeStackNavigator<SellerWizardParamList>();

export const SellerWizardNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="SellerDraftsList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="SellerDraftsList" component={SellerDraftsListScreen} />
      <Stack.Screen name="Step1BasicProfile" component={Step1BasicProfileScreen} />
      <Stack.Screen name="Step2StoreLocation" component={Step2StoreLocationScreen} />
      <Stack.Screen name="Step3IdentityKyc" component={Step3IdentityKycScreen} />
      <Stack.Screen name="Step4BankSettlement" component={Step4BankSettlementScreen} />
      <Stack.Screen name="Step5OperationsCategory" component={Step5OperationsCategoryScreen} />
      <Stack.Screen name="Step6LegalSignature" component={Step6LegalSignatureScreen} />
      <Stack.Screen name="Step7ReviewSubmit" component={Step7ReviewSubmitScreen} />
    </Stack.Navigator>
  );
};

// src/navigation/SkuWizardNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SkuWizardParamList } from './types';
import { SkuDraftsListScreen } from '../screens/cataloging/SkuDraftsListScreen';
import { CompanySelectScreen } from '../screens/cataloging/CompanySelectScreen';
import { Step1BasicProductScreen } from '../screens/cataloging/Step1BasicProductScreen';
import { Step2BarcodeScannerScreen } from '../screens/cataloging/Step2BarcodeScannerScreen';
import { Step3PricingTaxesSlabsScreen } from '../screens/cataloging/Step3PricingTaxesSlabsScreen';
import { Step4VariantsAttributesScreen } from '../screens/cataloging/Step4VariantsAttributesScreen';
import { Step5InventoryWarehouseScreen } from '../screens/cataloging/Step5InventoryWarehouseScreen';
import { Step6PackagingDimensionsScreen } from '../screens/cataloging/Step6PackagingDimensionsScreen';
import { Step7MediaUploadScreen } from '../screens/cataloging/Step7MediaUploadScreen';
import { Step8ComplianceReviewSubmitScreen } from '../screens/cataloging/Step8ComplianceReviewSubmitScreen';
import { SkuSuccessScreen } from '../screens/cataloging/SkuSuccessScreen';

const Stack = createNativeStackNavigator<SkuWizardParamList>();

export const SkuWizardNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="SkuDraftsList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="SkuDraftsList" component={SkuDraftsListScreen} />
      <Stack.Screen name="CompanySelect" component={CompanySelectScreen} />
      <Stack.Screen name="Step1BasicProduct" component={Step1BasicProductScreen} />
      <Stack.Screen name="Step2BarcodeScanner" component={Step2BarcodeScannerScreen} />
      <Stack.Screen name="Step3PricingTaxesSlabs" component={Step3PricingTaxesSlabsScreen} />
      <Stack.Screen name="Step4VariantsAttributes" component={Step4VariantsAttributesScreen} />
      <Stack.Screen name="Step5InventoryWarehouse" component={Step5InventoryWarehouseScreen} />
      <Stack.Screen name="Step6PackagingDimensions" component={Step6PackagingDimensionsScreen} />
      <Stack.Screen name="Step7MediaUpload" component={Step7MediaUploadScreen} />
      <Stack.Screen name="Step8ComplianceReviewSubmit" component={Step8ComplianceReviewSubmitScreen} />
      <Stack.Screen name="SkuSuccess" component={SkuSuccessScreen} />
    </Stack.Navigator>
  );
};

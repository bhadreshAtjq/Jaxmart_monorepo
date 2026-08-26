// src/screens/cataloging/Step1BasicProductScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { skuStep1Schema, SkuStep1FormValues } from '../../schemas/skuCatalogingSchema';
import { useSkuWizardStore } from '../../store/useSkuWizardStore';
import { useCompanyStore } from '../../store/useCompanyStore';
import { categoryApi, Category } from '../../api/categoryApi';
import { WizardStepHeader } from '../../components/wizard/WizardStepHeader';
import { WizardNavigationFooter } from '../../components/wizard/WizardNavigationFooter';
import { CompanyContextCard } from '../../components/common/CompanyContextCard';
import { AppInput } from '../../components/common/AppInput';
import { AppDropdown } from '../../components/common/AppDropdown';

const SKU_STEP_NAMES = [
  'Product Info',
  'Barcode / SKU',
  'Tier Pricing',
  'Variants',
  'Inventory',
  'Packaging',
  'Media Capture',
  'Compliance',
];

const SKU_STEP_ROUTE_MAP: Record<number, string> = {
  1: 'Step1BasicProduct',
  2: 'Step2BarcodeScanner',
  3: 'Step3PricingTaxesSlabs',
  4: 'Step4VariantsAttributes',
  5: 'Step5InventoryWarehouse',
  6: 'Step6PackagingDimensions',
  7: 'Step7MediaUpload',
  8: 'Step8ComplianceReviewSubmit',
};

interface Step1BasicProductScreenProps {
  route: any;
  navigation: any;
}

export const Step1BasicProductScreen: React.FC<Step1BasicProductScreenProps> = ({ route, navigation }) => {
  const { step1, updateStep1, nextStep, saveDraft, setCompanyContext, setStep } = useSkuWizardStore();
  const { activeCompany } = useCompanyStore();

  const [categoriesList, setCategoriesList] = useState<Category[]>([]);

  const companyId = route.params?.companyId || activeCompany?.id || step1.companyId;
  const companyName = route.params?.companyName || activeCompany?.legalName || step1.companyName;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SkuStep1FormValues>({
    resolver: zodResolver(skuStep1Schema),
    defaultValues: {
      ...step1,
      companyId: companyId || '',
      companyName: companyName || '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (companyId && companyName) {
      setValue('companyId', companyId);
      setValue('companyName', companyName);
      setCompanyContext(companyId, companyName);
    }
  }, [companyId, companyName, setValue, setCompanyContext]);

  useEffect(() => {
    categoryApi.getCategories().then((cats) => {
      if (cats && cats.length > 0) {
        setCategoriesList(cats);
      } else {
        setCategoriesList([
          { id: '7314cf57-3d90-4b10-afd6-cfa1fba585cc', name: 'Industrial Supplies', slug: 'industrial-supplies' },
          { id: 'b185c6b5-4fe3-4798-b4b2-77950e8058a1', name: 'Construction', slug: 'construction' },
          { id: '0610bbdb-d157-4ba7-99ac-feacca755d16', name: 'Textiles', slug: 'textiles' },
          { id: '46726386-4741-467c-a47b-b25d132ddef8', name: 'Electronics', slug: 'electronics' },
          { id: '0a436ac8-b0a8-460c-8171-8fe0ce84554e', name: 'Services', slug: 'services' },
        ]);
      }
    });
  }, []);

  const onSubmit = (data: SkuStep1FormValues) => {
    updateStep1(data);
    nextStep();
    navigation.navigate('Step2BarcodeScanner');
  };

  const handleSaveDraft = handleSubmit((data) => {
    updateStep1(data);
    saveDraft();
  });

  const handleStepJump = (targetStep: number) => {
    const route = SKU_STEP_ROUTE_MAP[targetStep];
    if (route) {
      setStep(targetStep);
      navigation.navigate(route);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <WizardStepHeader
        currentStep={1}
        totalSteps={8}
        stepTitle="Basic Product Information"
        stepSubtitle="Product title, brand, categorization, and commercial description"
        stepNames={SKU_STEP_NAMES}
        onStepPress={handleStepJump}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Pinned Target Company Context Card */}
          <CompanyContextCard
            company={activeCompany}
            onChangeCompany={() => navigation.navigate('CompanySelect')}
          />

          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value, ref } }) => (
              <AppInput
                ref={ref}
                label="Product Title / Name (Max 150 chars)"
                placeholder="e.g. High Tensile Hex Bolt Grade 8.8 (M12 x 50mm)"
                value={value}
                onChangeText={onChange}
                error={errors.title?.message}
                maxLength={150}
                showCharCount
                required
              />
            )}
          />

          <Controller
            control={control}
            name="brand"
            render={({ field: { onChange, value, ref } }) => (
              <AppInput
                ref={ref}
                label="Brand Name / Manufacturer"
                placeholder="e.g. Apex Industrial / Unbranded OEM"
                value={value}
                onChangeText={onChange}
                error={errors.brand?.message}
                icon="pricetag-outline"
                required
              />
            )}
          />

          {/* Primary Category Selector */}
          <Controller
            control={control}
            name="categoryId"
            render={({ field: { onChange, value } }) => (
              <AppDropdown
                label="Product Category"
                options={categoriesList.map((c) => ({ label: c.name, value: c.id }))}
                selectedValue={value}
                onSelect={(val, option) => {
                  onChange(val);
                  if (option) setValue('categoryName', option.label);
                }}
                error={errors.categoryId?.message}
                searchable
                required
              />
            )}
          />

          <Controller
            control={control}
            name="hsnCode"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="HSN / SAC Code (For GST Invoicing)"
                placeholder="e.g. 73181500"
                value={value}
                onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
                error={errors.hsnCode?.message}
                keyboardType="number-pad"
                maxLength={8}
                isMonospace
                required
              />
            )}
          />

          <Controller
            control={control}
            name="shortDescription"
            render={({ field: { onChange, value, ref } }) => (
              <AppInput
                ref={ref}
                label="Short Description (Summary for Search Index)"
                placeholder="e.g. Grade 8.8 zinc plated heavy-duty hex bolt with standard ISO pitch"
                value={value}
                onChangeText={onChange}
                error={errors.shortDescription?.message}
                maxLength={300}
                showCharCount
                multiline
                numberOfLines={2}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="detailedDescription"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Detailed Technical Description & Applications"
                placeholder="Provide detailed material grade, surface finish, tensile strength, recommended torque, and compatibility specifications..."
                value={value}
                onChangeText={onChange}
                error={errors.detailedDescription?.message}
                multiline
                numberOfLines={4}
                required
              />
            )}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <WizardNavigationFooter
        currentStep={1}
        totalSteps={8}
        onNext={handleSubmit(onSubmit)}
        onBack={() => navigation.goBack()}
        onSaveDraft={handleSaveDraft}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 180,
  },
});

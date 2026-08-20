// src/screens/cataloging/Step5InventoryWarehouseScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { skuStep5Schema, SkuStep5FormValues } from '../../schemas/skuCatalogingSchema';
import { useSkuWizardStore } from '../../store/useSkuWizardStore';
import { useCompanyStore } from '../../store/useCompanyStore';
import { WizardStepHeader } from '../../components/wizard/WizardStepHeader';
import { WizardNavigationFooter } from '../../components/wizard/WizardNavigationFooter';
import { CompanyContextCard } from '../../components/common/CompanyContextCard';
import { AppInput } from '../../components/common/AppInput';
import { AppDropdown } from '../../components/common/AppDropdown';

const RETURN_POLICY_OPTIONS = [
  '7 Days Returnable (Defective Only)',
  '15 Days Returnable (Unopened)',
  'Non-Returnable (Standard Industrial)',
  'Replacement Only (Dead on Arrival)',
];

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

interface Step5InventoryWarehouseScreenProps {
  navigation: any;
}

export const Step5InventoryWarehouseScreen: React.FC<Step5InventoryWarehouseScreenProps> = ({ navigation }) => {
  const { step5, updateStep5, nextStep, prevStep, saveDraft, setStep } = useSkuWizardStore();
  const { activeCompany } = useCompanyStore();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SkuStep5FormValues>({
    resolver: zodResolver(skuStep5Schema),
    defaultValues: step5,
    mode: 'onBlur',
  });

  const hasExpiryDate = watch('hasExpiryDate');

  const onSubmit = (data: SkuStep5FormValues) => {
    updateStep5(data);
    nextStep();
    navigation.navigate('Step6PackagingDimensions');
  };

  const handleSaveDraft = handleSubmit((data) => {
    updateStep5(data);
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
        currentStep={5}
        totalSteps={8}
        stepTitle="Inventory & Warehouse Specs"
        stepSubtitle="Available stock, bin/shelf location, expiry tracking & return policies"
        stepNames={SKU_STEP_NAMES}
        onStepPress={handleStepJump}
        onBack={() => {
          prevStep();
          navigation.goBack();
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <CompanyContextCard company={activeCompany} readOnly />

          {/* Stock Quantity & Location */}
          <View style={styles.twoColRow}>
            <Controller
              control={control}
              name="stockQuantity"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Ready Stock Available"
                  placeholder="e.g. 500"
                  value={value ? String(value) : ''}
                  onChangeText={(t) => onChange(parseInt(t, 10) || 0)}
                  error={errors.stockQuantity?.message}
                  keyboardType="number-pad"
                  containerStyle={{ flex: 1, marginRight: spacing.sm }}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="warehouseShelfLocation"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Shelf / Bin ID (Optional)"
                  placeholder="e.g. Rack B4-Row 2"
                  value={value || ''}
                  onChangeText={onChange}
                  error={errors.warehouseShelfLocation?.message}
                  containerStyle={{ flex: 1 }}
                />
              )}
            />
          </View>

          {/* Expiry Tracking Toggle */}
          <View style={styles.toggleCard}>
            <View style={{ flex: 1, marginRight: spacing.md }}>
              <Text style={styles.toggleTitle}>Does this product expire / have shelf life?</Text>
              <Text style={styles.toggleSubtitle}>
                Enable for adhesives, chemicals, lubricants, rubber gaskets, or sealed fluids
              </Text>
            </View>
            <Controller
              control={control}
              name="hasExpiryDate"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: colors.outlineVariant, true: colors.primary }}
                  thumbColor={value ? colors.secondary : '#FFFFFF'}
                />
              )}
            />
          </View>

          {/* Expiry Date input if enabled */}
          {hasExpiryDate && (
            <View style={styles.twoColRow}>
              <Controller
                control={control}
                name="expiryDate"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="Expiry Date (YYYY-MM-DD)"
                    placeholder="e.g. 2027-12-31"
                    value={value || ''}
                    onChangeText={onChange}
                    error={errors.expiryDate?.message}
                    icon="calendar-outline"
                    containerStyle={{ flex: 1, marginRight: spacing.sm }}
                    required
                  />
                )}
              />

              <Controller
                control={control}
                name="batchNumber"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="Batch / Lot Number"
                    placeholder="e.g. LOT-2026-08A"
                    value={value || ''}
                    onChangeText={onChange}
                    error={errors.batchNumber?.message}
                    isMonospace
                    containerStyle={{ flex: 1 }}
                  />
                )}
              />
            </View>
          )}

          {/* Return Policy Dropdown */}
          <Controller
            control={control}
            name="returnPolicy"
            render={({ field: { onChange, value } }) => (
              <AppDropdown
                label="Commercial Return & Replacement Policy"
                options={RETURN_POLICY_OPTIONS}
                selectedValue={value}
                onSelect={(val) => onChange(val)}
                error={errors.returnPolicy?.message}
                required
              />
            )}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <WizardNavigationFooter
        currentStep={5}
        totalSteps={8}
        onNext={handleSubmit(onSubmit)}
        onBack={() => {
          prevStep();
          navigation.goBack();
        }}
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
    paddingBottom: spacing.xl,
  },
  twoColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  toggleTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  toggleSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

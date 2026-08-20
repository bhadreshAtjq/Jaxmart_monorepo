// src/screens/cataloging/Step3PricingTaxesSlabsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { skuStep3Schema, SkuStep3FormValues } from '../../schemas/skuCatalogingSchema';
import { useSkuWizardStore } from '../../store/useSkuWizardStore';
import { useCompanyStore } from '../../store/useCompanyStore';
import { WizardStepHeader } from '../../components/wizard/WizardStepHeader';
import { WizardNavigationFooter } from '../../components/wizard/WizardNavigationFooter';
import { CompanyContextCard } from '../../components/common/CompanyContextCard';
import { AppInput } from '../../components/common/AppInput';
import { AppDropdown } from '../../components/common/AppDropdown';

const GST_RATES = [
  { label: '0% (Exempted / Zero Tax)', value: '0' },
  { label: '5% (Essential Goods)', value: '5' },
  { label: '12% (Standard Lower)', value: '12' },
  { label: '18% (Standard Industrial)', value: '18' },
  { label: '28% (Luxury / Heavy Equipment)', value: '28' },
];

const UOM_OPTIONS = [
  'Pieces (pcs)',
  'Kilograms (kg)',
  'Meters (m)',
  'Boxes (box)',
  'Cartons (ctn)',
  'Packs (pk)',
  'Pairs (pr)',
  'Sets (set)',
  'Liters (L)',
  'Tons (MT)',
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

interface Step3PricingTaxesSlabsScreenProps {
  navigation: any;
}

export const Step3PricingTaxesSlabsScreen: React.FC<Step3PricingTaxesSlabsScreenProps> = ({ navigation }) => {
  const {
    step3,
    updateStep3,
    nextStep,
    prevStep,
    saveDraft,
    setStep,
    addBulkPriceSlab,
    removeBulkPriceSlab,
    updateBulkPriceSlab,
  } = useSkuWizardStore();
  const { activeCompany } = useCompanyStore();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SkuStep3FormValues>({
    resolver: zodResolver(skuStep3Schema),
    defaultValues: step3,
    mode: 'onBlur',
  });

  const slabs = watch('bulkPriceSlabs') || [];

  const onSubmit = (data: SkuStep3FormValues) => {
    updateStep3(data);
    nextStep();
    navigation.navigate('Step4VariantsAttributes');
  };

  const handleSaveDraft = handleSubmit((data) => {
    updateStep3(data);
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
        currentStep={3}
        totalSteps={8}
        stepTitle="Commercial Pricing & Taxes"
        stepSubtitle="MRP, base wholesale B2B price, GST rates & bulk tier slabs"
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

          {/* Pricing Row */}
          <View style={styles.twoColRow}>
            <Controller
              control={control}
              name="mrp"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="MRP (Max Retail Price)"
                  placeholder="0.00"
                  value={value ? String(value) : ''}
                  onChangeText={(t) => onChange(parseFloat(t) || 0)}
                  error={errors.mrp?.message}
                  prefix="₹ "
                  keyboardType="decimal-pad"
                  containerStyle={{ flex: 1, marginRight: spacing.sm }}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="b2bPrice"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Base B2B Price"
                  placeholder="0.00"
                  value={value ? String(value) : ''}
                  onChangeText={(t) => onChange(parseFloat(t) || 0)}
                  error={errors.b2bPrice?.message}
                  prefix="₹ "
                  keyboardType="decimal-pad"
                  containerStyle={{ flex: 1 }}
                  required
                />
              )}
            />
          </View>

          {/* GST Tax Dropdown */}
          <Controller
            control={control}
            name="gstRate"
            render={({ field: { onChange, value } }) => (
              <AppDropdown
                label="Applicable GST Rate (%)"
                options={GST_RATES}
                selectedValue={String(value)}
                onSelect={(val) => onChange(parseInt(val, 10))}
                error={errors.gstRate?.message}
                required
              />
            )}
          />

          {/* MOQ & UOM */}
          <View style={styles.twoColRow}>
            <Controller
              control={control}
              name="minOrderQty"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Minimum Order Qty (MOQ)"
                  placeholder="10"
                  value={value ? String(value) : ''}
                  onChangeText={(t) => onChange(parseInt(t, 10) || 1)}
                  error={errors.minOrderQty?.message}
                  keyboardType="number-pad"
                  containerStyle={{ flex: 1, marginRight: spacing.sm }}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="unitOfMeasure"
              render={({ field: { onChange, value } }) => (
                <AppDropdown
                  label="Unit of Measure (UOM)"
                  options={UOM_OPTIONS}
                  selectedValue={value}
                  onSelect={(val) => onChange(val)}
                  error={errors.unitOfMeasure?.message}
                  containerStyle={{ flex: 1.2 }}
                  required
                />
              )}
            />
          </View>

          {/* Bulk Price Slabs Matrix */}
          <View style={styles.slabSectionCard}>
            <View style={styles.slabHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.slabSectionTitle}>B2B Bulk Volume Tier Slabs</Text>
                <Text style={styles.slabSectionSubtitle}>
                  Wholesale volume discounts automatically offered to buyers
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addSlabBtn}
                onPress={() => {
                  addBulkPriceSlab();
                  setValue('bulkPriceSlabs', useSkuWizardStore.getState().step3.bulkPriceSlabs);
                }}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.addSlabBtnText}>Add Tier</Text>
              </TouchableOpacity>
            </View>

            {slabs.map((slab, index) => (
              <View key={slab.id} style={styles.slabItemCard}>
                <View style={styles.slabNumberBadge}>
                  <Text style={styles.slabNumberText}>TIER {index + 1}</Text>
                </View>

                <View style={styles.slabInputsRow}>
                  <View style={{ flex: 1, marginRight: spacing.xs }}>
                    <Text style={styles.slabInputLabel}>Min Qty</Text>
                    <AppInput
                      value={String(slab.minQty)}
                      onChangeText={(t) => {
                        const val = parseInt(t, 10) || 0;
                        updateBulkPriceSlab(slab.id, 'minQty', val);
                        setValue('bulkPriceSlabs', useSkuWizardStore.getState().step3.bulkPriceSlabs);
                      }}
                      keyboardType="number-pad"
                      containerStyle={{ marginBottom: 0 }}
                    />
                  </View>

                  <View style={{ flex: 1, marginRight: spacing.xs }}>
                    <Text style={styles.slabInputLabel}>Max Qty</Text>
                    <AppInput
                      value={slab.maxQty ? String(slab.maxQty) : ''}
                      placeholder="+"
                      onChangeText={(t) => {
                        const val = parseInt(t, 10) || 0;
                        updateBulkPriceSlab(slab.id, 'maxQty', val);
                        setValue('bulkPriceSlabs', useSkuWizardStore.getState().step3.bulkPriceSlabs);
                      }}
                      keyboardType="number-pad"
                      containerStyle={{ marginBottom: 0 }}
                    />
                  </View>

                  <View style={{ flex: 1.2 }}>
                    <Text style={styles.slabInputLabel}>Tier Price (₹)</Text>
                    <AppInput
                      value={slab.price ? String(slab.price) : ''}
                      placeholder="0.00"
                      onChangeText={(t) => {
                        const val = parseFloat(t) || 0;
                        updateBulkPriceSlab(slab.id, 'price', val);
                        setValue('bulkPriceSlabs', useSkuWizardStore.getState().step3.bulkPriceSlabs);
                      }}
                      prefix="₹ "
                      keyboardType="decimal-pad"
                      containerStyle={{ marginBottom: 0 }}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.deleteSlabBtn}
                    onPress={() => {
                      removeBulkPriceSlab(slab.id);
                      setValue('bulkPriceSlabs', useSkuWizardStore.getState().step3.bulkPriceSlabs);
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {slabs.length === 0 && (
              <View style={styles.noSlabsBox}>
                <Text style={styles.noSlabsText}>No volume slabs added yet. Flat B2B rate applies.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <WizardNavigationFooter
        currentStep={3}
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
  slabSectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  slabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  slabSectionTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  slabSectionSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  addSlabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  addSlabBtnText: {
    ...typography.labelCaps,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 2,
  },
  slabItemCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  slabNumberBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryFixed,
    paddingVertical: 1,
    paddingHorizontal: spacing.xs + 2,
    borderRadius: borderRadius.xs,
    marginBottom: 4,
  },
  slabNumberText: {
    ...typography.labelCaps,
    color: colors.primaryDark,
    fontSize: 9,
    fontWeight: '700',
  },
  slabInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slabInputLabel: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 10,
    marginBottom: 2,
  },
  deleteSlabBtn: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
    marginTop: 14,
  },
  noSlabsBox: {
    padding: spacing.md,
    alignItems: 'center',
  },
  noSlabsText: {
    ...typography.bodySm,
    color: colors.textPlaceholder,
    fontStyle: 'italic',
  },
});

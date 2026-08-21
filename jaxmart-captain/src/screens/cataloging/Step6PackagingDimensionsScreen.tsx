// src/screens/cataloging/Step6PackagingDimensionsScreen.tsx
import React, { useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { skuStep6Schema, SkuStep6FormValues } from '../../schemas/skuCatalogingSchema';
import { useSkuWizardStore } from '../../store/useSkuWizardStore';
import { useCompanyStore } from '../../store/useCompanyStore';
import { calculateVolumetricWeight } from '../../utils/volumetric';
import { WizardStepHeader } from '../../components/wizard/WizardStepHeader';
import { WizardNavigationFooter } from '../../components/wizard/WizardNavigationFooter';
import { CompanyContextCard } from '../../components/common/CompanyContextCard';
import { AppInput } from '../../components/common/AppInput';

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

interface Step6PackagingDimensionsScreenProps {
  navigation: any;
}

export const Step6PackagingDimensionsScreen: React.FC<Step6PackagingDimensionsScreenProps> = ({ navigation }) => {
  const { step6, updateStep6, nextStep, prevStep, saveDraft, setStep } = useSkuWizardStore();
  const { activeCompany } = useCompanyStore();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SkuStep6FormValues>({
    resolver: zodResolver(skuStep6Schema),
    defaultValues: step6,
    mode: 'onBlur',
  });

  const length = watch('packagingLengthCm') || 0;
  const width = watch('packagingWidthCm') || 0;
  const height = watch('packagingHeightCm') || 0;
  const grossWeight = watch('grossWeightKg') || 0;

  // Auto-calculate Volumetric Weight (L*W*H / 5000)
  const volumetricWeight = calculateVolumetricWeight(length, width, height);
  const chargeableWeight = Math.max(grossWeight, volumetricWeight);

  useEffect(() => {
    setValue('volumetricWeightKg', volumetricWeight);
  }, [volumetricWeight, setValue]);

  const onSubmit = (data: SkuStep6FormValues) => {
    updateStep6({ ...data, volumetricWeightKg: volumetricWeight });
    nextStep();
    navigation.navigate('Step7MediaUpload');
  };

  const handleSaveDraft = handleSubmit((data) => {
    updateStep6({ ...data, volumetricWeightKg: volumetricWeight });
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
        currentStep={6}
        totalSteps={8}
        stepTitle="Packaging & Logistics Dimensions"
        stepSubtitle="Weights, box dimensions & automatic courier volumetric calculation"
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

          {/* Weights Row */}
          <View style={styles.twoColRow}>
            <Controller
              control={control}
              name="netWeightKg"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Net Item Weight (kg)"
                  placeholder="e.g. 0.50"
                  value={value ? String(value) : ''}
                  onChangeText={(t) => onChange(parseFloat(t) || 0)}
                  error={errors.netWeightKg?.message}
                  keyboardType="decimal-pad"
                  containerStyle={{ flex: 1, marginRight: spacing.sm }}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="grossWeightKg"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Gross Box Weight (kg)"
                  placeholder="e.g. 0.65"
                  value={value ? String(value) : ''}
                  onChangeText={(t) => onChange(parseFloat(t) || 0)}
                  error={errors.grossWeightKg?.message}
                  keyboardType="decimal-pad"
                  containerStyle={{ flex: 1 }}
                  required
                />
              )}
            />
          </View>

          {/* Box Dimensions (L, W, H cm) */}
          <Text style={styles.sectionTitle}>
            Outer Packaging Box Dimensions (cm) <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <View style={styles.threeColRow}>
            <Controller
              control={control}
              name="packagingLengthCm"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Length (L)"
                  placeholder="20"
                  value={value ? String(value) : ''}
                  onChangeText={(t) => onChange(parseFloat(t) || 0)}
                  error={errors.packagingLengthCm?.message}
                  keyboardType="decimal-pad"
                  containerStyle={{ flex: 1, marginRight: spacing.xs }}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="packagingWidthCm"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Width (W)"
                  placeholder="15"
                  value={value ? String(value) : ''}
                  onChangeText={(t) => onChange(parseFloat(t) || 0)}
                  error={errors.packagingWidthCm?.message}
                  keyboardType="decimal-pad"
                  containerStyle={{ flex: 1, marginRight: spacing.xs }}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="packagingHeightCm"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Height (H)"
                  placeholder="10"
                  value={value ? String(value) : ''}
                  onChangeText={(t) => onChange(parseFloat(t) || 0)}
                  error={errors.packagingHeightCm?.message}
                  keyboardType="decimal-pad"
                  containerStyle={{ flex: 1 }}
                  required
                />
              )}
            />
          </View>

          {/* Volumetric Weight Calculation Banner */}
          <View style={styles.volumetricCard}>
            <View style={styles.volumetricHeader}>
              <Ionicons name="cube" size={22} color={colors.primary} style={{ marginRight: spacing.sm }} />
              <Text style={styles.volumetricTitle}>Automated Volumetric Freight Calculation</Text>
            </View>

            <View style={styles.volumetricMetricsRow}>
              <View style={styles.volumetricMetricBox}>
                <Text style={styles.metricLabel}>VOLUMETRIC WEIGHT</Text>
                <Text style={styles.metricVal}>{volumetricWeight.toFixed(2)} kg</Text>
                <Text style={styles.metricFormula}>(L × W × H) / 5000</Text>
              </View>

              <View style={[styles.volumetricMetricBox, styles.chargeableBox]}>
                <Text style={styles.metricLabel}>CHARGEABLE WEIGHT</Text>
                <Text style={[styles.metricVal, { color: colors.secondary }]}>
                  {chargeableWeight.toFixed(2)} kg
                </Text>
                <Text style={styles.metricFormula}>Higher of Gross vs Volumetric</Text>
              </View>
            </View>
          </View>

          {/* Special Handling Flags */}
          <View style={styles.handlingSection}>
            <Text style={styles.sectionTitle}>Logistics Handling Flags</Text>

            <View style={styles.handlingToggleRow}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Text style={styles.handlingLabel}>Fragile / Handle With Care</Text>
                <Text style={styles.handlingSubtitle}>Glass, precision optics, or ceramic items</Text>
              </View>
              <Controller
                control={control}
                name="isFragile"
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

            <View style={styles.handlingToggleRow}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Text style={styles.handlingLabel}>Hazardous Material (HAZMAT)</Text>
                <Text style={styles.handlingSubtitle}>Flammable chemicals, lithium batteries, aerosols</Text>
              </View>
              <Controller
                control={control}
                name="isHazardous"
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

            <View style={styles.handlingToggleRow}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Text style={styles.handlingLabel}>Liquid / Fluid Packaging</Text>
                <Text style={styles.handlingSubtitle}>Requires sealed spill-proof secondary bagging</Text>
              </View>
              <Controller
                control={control}
                name="isLiquid"
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <WizardNavigationFooter
        currentStep={6}
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
    paddingBottom: 180,
  },
  twoColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  threeColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  volumetricCard: {
    backgroundColor: colors.primaryFixed,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  volumetricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  volumetricTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
  volumetricMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  volumetricMetricBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginRight: spacing.xs,
    alignItems: 'center',
  },
  chargeableBox: {
    marginRight: 0,
    marginLeft: spacing.xs,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  metricLabel: {
    ...typography.labelCaps,
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
  },
  metricVal: {
    ...typography.monoLg,
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 16,
    marginVertical: 2,
  },
  metricFormula: {
    ...typography.bodySm,
    color: colors.textPlaceholder,
    fontSize: 9,
  },
  handlingSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  handlingToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  handlingLabel: {
    ...typography.titleMd,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  handlingSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
});

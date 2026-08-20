// src/screens/cataloging/Step4VariantsAttributesScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { skuStep4Schema, SkuStep4FormValues } from '../../schemas/skuCatalogingSchema';
import { useSkuWizardStore } from '../../store/useSkuWizardStore';
import { useCompanyStore } from '../../store/useCompanyStore';
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

interface Step4VariantsAttributesScreenProps {
  navigation: any;
}

export const Step4VariantsAttributesScreen: React.FC<Step4VariantsAttributesScreenProps> = ({ navigation }) => {
  const {
    step4,
    updateStep4,
    nextStep,
    prevStep,
    saveDraft,
    setStep,
    step1,
    step2,
    step3,
    generateVariantMatrix,
    updateVariantItem,
    addCustomAttribute,
    removeCustomAttribute,
  } = useSkuWizardStore();
  const { activeCompany } = useCompanyStore();

  const [attrNameInput, setAttrNameInput] = useState('');
  const [attrValuesInput, setAttrValuesInput] = useState('');
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [customValInput, setCustomValInput] = useState('');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SkuStep4FormValues>({
    resolver: zodResolver(skuStep4Schema),
    defaultValues: step4,
    mode: 'onBlur',
  });

  const hasVariants = watch('hasVariants');
  const variantMatrix = watch('variantMatrix') || [];
  const customSpecs = watch('customAttributes') || {};

  const handleAddVariantDimension = () => {
    if (!attrNameInput.trim() || !attrValuesInput.trim()) return;

    const values = attrValuesInput.split(',').map((v) => v.trim()).filter(Boolean);
    if (values.length === 0) return;

    const currentOptions = useSkuWizardStore.getState().step4.variantOptions || [];
    const updatedOptions = [...currentOptions, { name: attrNameInput.trim(), values }];

    setValue('variantOptions', updatedOptions);

    // Generate cartesian matrix
    generateVariantMatrix(
      updatedOptions,
      step1.title || 'Product',
      step2.jaxmartAutoSku || 'JAX-SKU',
      step3.b2bPrice || 100
    );

    setValue('variantMatrix', useSkuWizardStore.getState().step4.variantMatrix);

    setAttrNameInput('');
    setAttrValuesInput('');
  };

  const handleAddCustomSpec = () => {
    if (!customKeyInput.trim() || !customValInput.trim()) return;
    addCustomAttribute(customKeyInput.trim(), customValInput.trim());
    setValue('customAttributes', useSkuWizardStore.getState().step4.customAttributes);
    setCustomKeyInput('');
    setCustomValInput('');
  };

  const onSubmit = (data: SkuStep4FormValues) => {
    updateStep4(data);
    nextStep();
    navigation.navigate('Step5InventoryWarehouse');
  };

  const handleSaveDraft = handleSubmit((data) => {
    updateStep4(data);
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
        currentStep={4}
        totalSteps={8}
        stepTitle="Variants & Specifications"
        stepSubtitle="Sizes, grades, colors, matrix pricing & custom technical attributes"
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

          {/* Toggle Variants */}
          <View style={styles.toggleCard}>
            <View style={{ flex: 1, marginRight: spacing.md }}>
              <Text style={styles.toggleTitle}>Does this product have Multiple Variants?</Text>
              <Text style={styles.toggleSubtitle}>
                Enable for multiple sizes (M10, M12), colors, material grades, or pack sizes
              </Text>
            </View>
            <Controller
              control={control}
              name="hasVariants"
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

          {/* Variants Generator Section */}
          {hasVariants && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Add Variant Dimension</Text>
              <Text style={styles.sectionSubtitle}>
                e.g. Dimension: "Size", Values: "M10, M12, M16" (comma separated)
              </Text>

              <View style={styles.dimensionInputsRow}>
                <AppInput
                  placeholder="Dimension (e.g. Size, Grade)"
                  value={attrNameInput}
                  onChangeText={setAttrNameInput}
                  containerStyle={{ flex: 1, marginRight: spacing.xs, marginBottom: 0 }}
                />
                <AppInput
                  placeholder="Comma-separated values"
                  value={attrValuesInput}
                  onChangeText={setAttrValuesInput}
                  containerStyle={{ flex: 1.5, marginRight: spacing.xs, marginBottom: 0 }}
                />
                <TouchableOpacity style={styles.generateBtn} onPress={handleAddVariantDimension}>
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Generated Variant Matrix Table */}
              {variantMatrix.length > 0 && (
                <View style={styles.matrixContainer}>
                  <Text style={styles.matrixHeaderTitle}>
                    Generated Matrix ({variantMatrix.length} Variants)
                  </Text>
                  {variantMatrix.map((item, idx) => (
                    <View key={item.sku} style={styles.variantRowCard}>
                      <View style={styles.variantTopRow}>
                        <Text style={styles.variantTitleText}>{item.title}</Text>
                        <Text style={styles.variantSkuText}>{item.sku}</Text>
                      </View>

                      <View style={styles.variantInputsRow}>
                        <View style={{ flex: 1, marginRight: spacing.xs }}>
                          <Text style={styles.variantFieldLabel}>Price (₹)</Text>
                          <AppInput
                            value={String(item.priceOverride)}
                            onChangeText={(t) => {
                              updateVariantItem(item.sku, { priceOverride: parseFloat(t) || 0 });
                              setValue('variantMatrix', useSkuWizardStore.getState().step4.variantMatrix);
                            }}
                            keyboardType="decimal-pad"
                            prefix="₹ "
                            containerStyle={{ marginBottom: 0 }}
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={styles.variantFieldLabel}>Stock Qty</Text>
                          <AppInput
                            value={String(item.stockQty)}
                            onChangeText={(t) => {
                              updateVariantItem(item.sku, { stockQty: parseInt(t, 10) || 0 });
                              setValue('variantMatrix', useSkuWizardStore.getState().step4.variantMatrix);
                            }}
                            keyboardType="number-pad"
                            containerStyle={{ marginBottom: 0 }}
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Custom Specifications Key-Value Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Custom Technical Specifications</Text>
            <Text style={styles.sectionSubtitle}>
              Key-value pairs displayed on buyer catalog (e.g. Tensile Strength: 800 MPa, Finish: Zinc Yellow)
            </Text>

            <View style={styles.customSpecInputRow}>
              <AppInput
                placeholder="Spec Name (e.g. Material Grade)"
                value={customKeyInput}
                onChangeText={setCustomKeyInput}
                containerStyle={{ flex: 1, marginRight: spacing.xs, marginBottom: 0 }}
              />
              <AppInput
                placeholder="Value (e.g. SS 304 / Grade 8.8)"
                value={customValInput}
                onChangeText={setCustomValInput}
                containerStyle={{ flex: 1.2, marginRight: spacing.xs, marginBottom: 0 }}
              />
              <TouchableOpacity style={styles.addSpecBtn} onPress={handleAddCustomSpec}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* List of Custom Specs */}
            {Object.keys(customSpecs).length > 0 ? (
              <View style={styles.specsListContainer}>
                {Object.entries(customSpecs).map(([k, v]) => (
                  <View key={k} style={styles.specChipRow}>
                    <Text style={styles.specKeyText}>{k}:</Text>
                    <Text style={styles.specValText}>{v}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        removeCustomAttribute(k);
                        setValue('customAttributes', useSkuWizardStore.getState().step4.customAttributes);
                      }}
                      style={styles.removeSpecTouch}
                    >
                      <Ionicons name="close-circle" size={18} color={colors.textPlaceholder} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noSpecsText}>No custom specifications added yet.</Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <WizardNavigationFooter
        currentStep={4}
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
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  sectionTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  sectionSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  dimensionInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  generateBtn: {
    backgroundColor: colors.primary,
    height: 46,
    width: 46,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matrixContainer: {
    marginTop: spacing.sm,
  },
  matrixHeaderTitle: {
    ...typography.labelCaps,
    color: colors.tertiary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  variantRowCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  variantTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  variantTitleText: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 12,
  },
  variantSkuText: {
    ...typography.monoSm,
    color: colors.textSecondary,
    fontSize: 10,
  },
  variantInputsRow: {
    flexDirection: 'row',
  },
  variantFieldLabel: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 10,
    marginBottom: 2,
  },
  customSpecInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addSpecBtn: {
    backgroundColor: colors.secondary,
    height: 46,
    width: 46,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specsListContainer: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  specChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  specKeyText: {
    ...typography.labelMd,
    color: colors.primaryDark,
    fontWeight: '700',
    marginRight: spacing.xs,
  },
  specValText: {
    ...typography.bodySm,
    color: colors.textPrimary,
    flex: 1,
  },
  removeSpecTouch: {
    padding: 2,
  },
  noSpecsText: {
    ...typography.bodySm,
    color: colors.textPlaceholder,
    fontStyle: 'italic',
    marginTop: 4,
  },
});

// src/screens/onboarding/Step5OperationsCategoryScreen.tsx
import React, { useState, useEffect } from 'react';
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
import { step5Schema, Step5FormValues } from '../../schemas/sellerOnboardingSchema';
import { useSellerWizardStore } from '../../store/useSellerWizardStore';
import { categoryApi, Category } from '../../api/categoryApi';
import { WizardStepHeader } from '../../components/wizard/WizardStepHeader';
import { WizardNavigationFooter } from '../../components/wizard/WizardNavigationFooter';
import { AppDropdown } from '../../components/common/AppDropdown';
import { AppInput } from '../../components/common/AppInput';

const TURNOVER_OPTIONS = ['< ₹1L', '₹1L - 5L', '₹5L - 20L', '> ₹20L'];
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_DAYS_MAP: Record<string, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

const LOGISTICS_OPTIONS: Array<'Self Delivery' | 'Pickup Only' | 'Jaxmart Logistics Preferred'> = [
  'Jaxmart Logistics Preferred',
  'Self Delivery',
  'Pickup Only',
];

const STEP_NAMES = ['Profile', 'Storefront', 'KYC & GST', 'Settlement', 'Operations', 'Signatures', 'Review'];

const STEP_ROUTE_MAP: Record<number, string> = {
  1: 'Step1BasicProfile',
  2: 'Step2StoreLocation',
  3: 'Step3IdentityKyc',
  4: 'Step4BankSettlement',
  5: 'Step5OperationsCategory',
  6: 'Step6LegalSignature',
  7: 'Step7ReviewSubmit',
};

interface Step5OperationsCategoryScreenProps {
  navigation: any;
}

export const Step5OperationsCategoryScreen: React.FC<Step5OperationsCategoryScreenProps> = ({ navigation }) => {
  const { step5, updateStep5, nextStep, prevStep, saveDraft, setStep } = useSellerWizardStore();

  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [availableSubcategories] = useState<string[]>([
    'Fasteners & Screws',
    'Hand Tools & Power Tools',
    'Structural Steel & Pipes',
    'Safety & PPE Equipment',
    'Electrical Switchgear',
    'Hydraulic Pumps & Valves',
    'Bearings & Transmission',
  ]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step5FormValues>({
    resolver: zodResolver(step5Schema),
    defaultValues: step5,
    mode: 'onBlur',
  });

  const selectedSubcategories = watch('subCategories') || [];
  const selectedDays = watch('operatingDays') || [];
  const selectedDelivery = watch('deliveryCapabilities') || [];

  useEffect(() => {
    categoryApi.getCategories().then((res) => {
      if (res && res.length > 0) {
        setCategoriesList(res);
      } else {
        setCategoriesList([
          { id: 'cat_ind', name: 'Industrial Tools & Equipment', slug: 'industrial-tools' },
          { id: 'cat_mat', name: 'Building & Construction Materials', slug: 'construction-materials' },
          { id: 'cat_ele', name: 'Electrical & Automation Components', slug: 'electrical-automation' },
          { id: 'cat_tex', name: 'Textiles, Fabrics & Apparel', slug: 'textiles-fabrics' },
          { id: 'cat_che', name: 'Chemicals & Raw Polymers', slug: 'chemicals-polymers' },
          { id: 'cat_agr', name: 'Agricultural Supplies & Equipment', slug: 'agriculture-supplies' },
        ]);
      }
    });
  }, []);

  const toggleSubcategory = (sub: string) => {
    if (selectedSubcategories.includes(sub)) {
      setValue('subCategories', selectedSubcategories.filter((s) => s !== sub), { shouldValidate: true });
    } else {
      setValue('subCategories', [...selectedSubcategories, sub], { shouldValidate: true });
    }
  };

  const toggleDay = (dayAbbr: string) => {
    const fullDay = FULL_DAYS_MAP[dayAbbr];
    if (selectedDays.includes(fullDay)) {
      setValue('operatingDays', selectedDays.filter((d) => d !== fullDay), { shouldValidate: true });
    } else {
      setValue('operatingDays', [...selectedDays, fullDay], { shouldValidate: true });
    }
  };

  const toggleDelivery = (option: 'Self Delivery' | 'Pickup Only' | 'Jaxmart Logistics Preferred') => {
    if (selectedDelivery.includes(option)) {
      if (selectedDelivery.length > 1) {
        setValue('deliveryCapabilities', selectedDelivery.filter((d) => d !== option), { shouldValidate: true });
      }
    } else {
      setValue('deliveryCapabilities', [...selectedDelivery, option], { shouldValidate: true });
    }
  };

  const onSubmit = (data: Step5FormValues) => {
    updateStep5(data);
    nextStep();
    navigation.navigate('Step6LegalSignature');
  };

  const handleSaveDraft = handleSubmit((data) => {
    updateStep5(data);
    saveDraft();
  });

  const handleStepJump = (targetStep: number) => {
    const route = STEP_ROUTE_MAP[targetStep];
    if (route) {
      setStep(targetStep);
      navigation.navigate(route);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <WizardStepHeader
        currentStep={5}
        totalSteps={7}
        stepTitle="Operations & Categories"
        stepSubtitle="Primary industry taxonomy, operating hours & logistics"
        stepNames={STEP_NAMES}
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
          {/* Primary Category Dropdown */}
          <Controller
            control={control}
            name="primaryCategoryId"
            render={({ field: { onChange, value } }) => (
              <AppDropdown
                label="Primary Business Category"
                options={categoriesList.map((c) => ({ label: c.name, value: c.id }))}
                selectedValue={value}
                onSelect={(val, option) => {
                  onChange(val);
                  if (option) setValue('primaryCategoryName', option.label);
                }}
                error={errors.primaryCategoryId?.message}
                searchable
                required
              />
            )}
          />

          {/* Subcategories Multi-Select Chips */}
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>
              Sub-Categories Multi-Select <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <Text style={styles.sectionSubtitle}>Select all product lines manufactured or traded</Text>

            <View style={styles.chipsWrapRow}>
              {availableSubcategories.map((sub) => {
                const isSelected = selectedSubcategories.includes(sub);
                return (
                  <TouchableOpacity
                    key={sub}
                    style={[styles.subChip, isSelected && styles.subChipSelected]}
                    onPress={() => toggleSubcategory(sub)}
                  >
                    {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />}
                    <Text style={[styles.subChipText, isSelected && styles.subChipTextSelected]}>
                      {sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.subCategories && (
              <Text style={styles.errorText}>{errors.subCategories.message}</Text>
            )}
          </View>

          {/* Turnover Dropdown */}
          <Controller
            control={control}
            name="monthlyTurnover"
            render={({ field: { onChange, value } }) => (
              <AppDropdown
                label="Estimated Monthly B2B Turnover / Stock Value"
                options={TURNOVER_OPTIONS}
                selectedValue={value}
                onSelect={(val) => onChange(val as any)}
                error={errors.monthlyTurnover?.message}
                required
              />
            )}
          />

          {/* Operational Days Selector */}
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>
              Store Operating Days <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <Text style={styles.sectionSubtitle}>Days the merchant warehouse/shop is open for dispatch</Text>

            <View style={styles.daysRow}>
              {DAYS_OF_WEEK.map((dayAbbr) => {
                const fullDay = FULL_DAYS_MAP[dayAbbr];
                const isSelected = selectedDays.includes(fullDay);
                return (
                  <TouchableOpacity
                    key={dayAbbr}
                    style={[styles.dayCircle, isSelected && styles.dayCircleSelected]}
                    onPress={() => toggleDay(dayAbbr)}
                  >
                    <Text style={[styles.dayCircleText, isSelected && styles.dayCircleTextSelected]}>
                      {dayAbbr}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.operatingDays && (
              <Text style={styles.errorText}>{errors.operatingDays.message}</Text>
            )}
          </View>

          {/* Store Hours */}
          <View style={styles.twoColRow}>
            <Controller
              control={control}
              name="openingTime"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Opening Time"
                  placeholder="e.g. 09:00 AM"
                  value={value}
                  onChangeText={onChange}
                  icon="time-outline"
                  error={errors.openingTime?.message}
                  containerStyle={{ flex: 1, marginRight: spacing.sm }}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="closingTime"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Closing Time"
                  placeholder="e.g. 08:00 PM"
                  value={value}
                  onChangeText={onChange}
                  icon="time-outline"
                  error={errors.closingTime?.message}
                  containerStyle={{ flex: 1 }}
                  required
                />
              )}
            />
          </View>

          {/* Delivery & Logistics Preferences */}
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>
              Delivery & Fulfilment Modes <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <Text style={styles.sectionSubtitle}>Supported logistics capabilities for order dispatches</Text>

            {LOGISTICS_OPTIONS.map((opt) => {
              const isChecked = selectedDelivery.includes(opt);
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.checkboxRow, isChecked && styles.checkboxRowChecked]}
                  onPress={() => toggleDelivery(opt)}
                >
                  <Ionicons
                    name={isChecked ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isChecked ? colors.primary : colors.outline}
                    style={{ marginRight: spacing.md }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.checkboxLabel, isChecked && styles.checkboxLabelChecked]}>
                      {opt}
                    </Text>
                    <Text style={styles.checkboxDesc}>
                      {opt === 'Jaxmart Logistics Preferred'
                        ? 'Automated courier pickup & transit insurance covered'
                        : opt === 'Self Delivery'
                        ? 'Seller dispatches via own fleet or local transport'
                        : 'Buyer arranges own transport from seller warehouse'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            {errors.deliveryCapabilities && (
              <Text style={styles.errorText}>{errors.deliveryCapabilities.message}</Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <WizardNavigationFooter
        currentStep={5}
        totalSteps={7}
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
  sectionBox: {
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
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  chipsWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs + 2,
    marginBottom: spacing.xs + 2,
  },
  subChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  subChipText: {
    ...typography.labelMd,
    color: colors.textSecondary,
    fontSize: 12,
  },
  subChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  dayCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  dayCircleText: {
    ...typography.labelCaps,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 11,
  },
  dayCircleTextSelected: {
    color: '#FFFFFF',
  },
  twoColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.xs + 2,
  },
  checkboxRowChecked: {
    backgroundColor: colors.primaryFixed,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    ...typography.titleMd,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  checkboxLabelChecked: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  checkboxDesc: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  errorText: {
    ...typography.bodySm,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

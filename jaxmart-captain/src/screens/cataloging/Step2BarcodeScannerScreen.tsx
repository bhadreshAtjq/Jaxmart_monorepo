// src/screens/cataloging/Step2BarcodeScannerScreen.tsx
import React, { useState } from 'react';
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
import { skuStep2Schema, SkuStep2FormValues } from '../../schemas/skuCatalogingSchema';
import { useSkuWizardStore } from '../../store/useSkuWizardStore';
import { useCompanyStore } from '../../store/useCompanyStore';
import { WizardStepHeader } from '../../components/wizard/WizardStepHeader';
import { WizardNavigationFooter } from '../../components/wizard/WizardNavigationFooter';
import { CompanyContextCard } from '../../components/common/CompanyContextCard';
import { AppInput } from '../../components/common/AppInput';
import { BarcodeScannerModal } from '../../components/scanner/BarcodeScannerModal';

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

interface Step2BarcodeScannerScreenProps {
  navigation: any;
}

export const Step2BarcodeScannerScreen: React.FC<Step2BarcodeScannerScreenProps> = ({ navigation }) => {
  const { step2, updateStep2, nextStep, prevStep, saveDraft, setStep } = useSkuWizardStore();
  const { activeCompany } = useCompanyStore();

  const [scannerVisible, setScannerVisible] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SkuStep2FormValues>({
    resolver: zodResolver(skuStep2Schema),
    defaultValues: step2,
    mode: 'onBlur',
  });

  const barcode = watch('barcode');
  const jaxmartAutoSku = watch('jaxmartAutoSku');

  const handleBarcodeScanned = (scannedCode: string, format: string) => {
    setValue('barcode', scannedCode, { shouldValidate: true });
    setValue('barcodeFormat', format);
    setScannerVisible(false);
  };

  const onSubmit = (data: SkuStep2FormValues) => {
    updateStep2(data);
    nextStep();
    navigation.navigate('Step3PricingTaxesSlabs');
  };

  const handleSaveDraft = handleSubmit((data) => {
    updateStep2(data);
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
        currentStep={2}
        totalSteps={8}
        stepTitle="Barcode & Identification"
        stepSubtitle="Scan physical product EAN / UPC or enter manufacturer part number"
        stepNames={SKU_STEP_NAMES}
        onStepPress={handleStepJump}
        onBack={() => {
          prevStep();
          navigation.goBack();
        }}
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
          <CompanyContextCard company={activeCompany} readOnly />

          {/* Barcode Scanner Card Action */}
          <View style={styles.scannerHeroCard}>
            <View style={styles.scannerIconCircle}>
              <Ionicons name="barcode" size={32} color={colors.primary} />
            </View>
            <Text style={styles.scannerHeroTitle}>Hardware Barcode Scanner</Text>
            <Text style={styles.scannerHeroSubtitle}>
              Scan EAN-13, UPC-A, Code-128, or QR codes directly off the packaging box
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setScannerVisible(true)}
              style={styles.openScannerButton}
            >
              <Ionicons name="scan" size={20} color="#FFFFFF" style={{ marginRight: spacing.sm }} />
              <Text style={styles.openScannerButtonText}>
                {barcode ? 'Re-Scan Packaging Barcode' : 'Launch Camera Scanner'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Barcode Input */}
          <Controller
            control={control}
            name="barcode"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Scanned Barcode / EAN Number"
                placeholder="Scan or type barcode (e.g. 8901030829148)"
                value={value}
                onChangeText={onChange}
                error={errors.barcode?.message}
                icon="barcode-outline"
                isMonospace
                required
              />
            )}
          />

          {/* Manufacturer Part Number */}
          <Controller
            control={control}
            name="manufacturerSku"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Manufacturer SKU / Part Number (Optional)"
                placeholder="e.g. APX-HEX-M1250-Z"
                value={value || ''}
                onChangeText={(t) => onChange(t.toUpperCase())}
                error={errors.manufacturerSku?.message}
                autoCapitalize="characters"
                isMonospace
              />
            )}
          />

          {/* Jaxmart Auto SKU Display */}
          <View style={styles.autoSkuCard}>
            <View style={styles.autoSkuHeader}>
              <Ionicons name="finger-print" size={18} color={colors.secondary} style={{ marginRight: 6 }} />
              <Text style={styles.autoSkuTitle}>Jaxmart System Unique SKU Identifier</Text>
            </View>
            <Text style={styles.autoSkuValue}>{jaxmartAutoSku}</Text>
            <Text style={styles.autoSkuDesc}>
              Auto-generated global identifier assigned for platform search & order tracking
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <WizardNavigationFooter
        currentStep={2}
        totalSteps={8}
        onNext={handleSubmit(onSubmit)}
        onBack={() => {
          prevStep();
          navigation.goBack();
        }}
        onSaveDraft={handleSaveDraft}
      />

      {/* Barcode Scanner Modal */}
      {scannerVisible && (
        <BarcodeScannerModal
          visible={scannerVisible}
          onClose={() => setScannerVisible(false)}
          onBarcodeScanned={handleBarcodeScanned}
        />
      )}
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
  scannerHeroCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  scannerIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  scannerHeroTitle: {
    ...typography.headlineMd,
    color: colors.primaryDark,
    fontWeight: '700',
    textAlign: 'center',
  },
  scannerHeroSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  openScannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    width: '100%',
  },
  openScannerButtonText: {
    ...typography.titleMd,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  autoSkuCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginTop: spacing.sm,
  },
  autoSkuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  autoSkuTitle: {
    ...typography.labelCaps,
    color: colors.tertiary,
    fontWeight: '700',
    fontSize: 10,
  },
  autoSkuValue: {
    ...typography.monoLg,
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 18,
    marginVertical: 2,
  },
  autoSkuDesc: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 11,
  },
});

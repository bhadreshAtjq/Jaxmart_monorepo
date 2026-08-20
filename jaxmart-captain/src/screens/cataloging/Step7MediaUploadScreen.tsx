// src/screens/cataloging/Step7MediaUploadScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { skuStep7Schema, SkuStep7FormValues } from '../../schemas/skuCatalogingSchema';
import { useSkuWizardStore } from '../../store/useSkuWizardStore';
import { useCompanyStore } from '../../store/useCompanyStore';
import { WizardStepHeader } from '../../components/wizard/WizardStepHeader';
import { WizardNavigationFooter } from '../../components/wizard/WizardNavigationFooter';
import { CompanyContextCard } from '../../components/common/CompanyContextCard';
import { MultiImageCaptureGrid, PhotoSlot } from '../../components/camera/MultiImageCaptureGrid';

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

const SKU_PHOTO_SLOTS: PhotoSlot[] = [
  {
    key: 'frontView',
    label: 'Front View (Primary Thumbnail)',
    description: 'Crisp frontal angle on white or clean shop counter',
    required: true,
  },
  {
    key: 'backView',
    label: 'Back / Barcode View',
    description: 'Showing product rear and packaging barcode',
    required: true,
  },
  {
    key: 'specLabel',
    label: 'Technical Spec Label',
    description: 'Close-up of manufacturer spec plate, grade markings, or rating sticker',
  },
  {
    key: 'unboxedView',
    label: 'Unboxed / Actual Product',
    description: 'Product removed from outer packaging box',
  },
  {
    key: 'boxView',
    label: 'Outer Master Carton / Pack',
    description: 'Bulk packaging box showing batch markings',
  },
];

interface Step7MediaUploadScreenProps {
  navigation: any;
}

export const Step7MediaUploadScreen: React.FC<Step7MediaUploadScreenProps> = ({ navigation }) => {
  const { step7, updateStep7, nextStep, prevStep, saveDraft, setStep } = useSkuWizardStore();
  const { activeCompany } = useCompanyStore();

  const [photos, setPhotos] = useState<Record<string, string>>(step7.photos || {});

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SkuStep7FormValues>({
    resolver: zodResolver(skuStep7Schema),
    defaultValues: step7,
  });

  const handlePhotoCapture = (key: string, uri: string) => {
    const updated = { ...photos, [key]: uri };
    setPhotos(updated);
    setValue('photos', updated, { shouldValidate: true });
    updateStep7({ photos: updated });
  };

  const handlePhotoRemove = (key: string) => {
    const updated = { ...photos };
    delete updated[key];
    setPhotos(updated);
    setValue('photos', updated, { shouldValidate: true });
    updateStep7({ photos: updated });
  };

  const onSubmit = (data: SkuStep7FormValues) => {
    updateStep7({ photos });
    nextStep();
    navigation.navigate('Step8ComplianceReviewSubmit');
  };

  const handleSaveDraft = () => {
    updateStep7({ photos });
    saveDraft();
  };

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
        currentStep={7}
        totalSteps={8}
        stepTitle="Multi-Angle Photo Capture"
        stepSubtitle="High-resolution photos captured live on-ground with camera"
        stepNames={SKU_STEP_NAMES}
        onStepPress={handleStepJump}
        onBack={() => {
          prevStep();
          navigation.goBack();
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CompanyContextCard company={activeCompany} readOnly />

        <View style={styles.guidelinesBox}>
          <Text style={styles.guidelinesTitle}>Photography Standard Guidelines</Text>
          <Text style={styles.guidelinesText}>
            • Ensure bright, even lighting without excessive glare{'\n'}
            • Keep product centered in frame{'\n'}
            • Minimum 2 photos required (Front View and Back/Barcode)
          </Text>
        </View>

        <MultiImageCaptureGrid
          slots={SKU_PHOTO_SLOTS}
          photos={photos}
          onCapture={handlePhotoCapture}
          onRemove={handlePhotoRemove}
        />

        {errors.photos?.message && (
          <Text style={styles.errorText}>{String(errors.photos.message)}</Text>
        )}
      </ScrollView>

      <WizardNavigationFooter
        currentStep={7}
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
  guidelinesBox: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  guidelinesTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4,
  },
  guidelinesText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  errorText: {
    ...typography.bodySm,
    color: colors.error,
    marginTop: spacing.sm,
  },
});

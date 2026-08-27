// src/screens/cataloging/Step8ComplianceReviewSubmitScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { skuStep8Schema, SkuStep8FormValues } from '../../schemas/skuCatalogingSchema';
import { useSkuWizardStore } from '../../store/useSkuWizardStore';
import { useCompanyStore } from '../../store/useCompanyStore';
import { useShiftStore } from '../../store/useShiftStore';
import { useOfflineSyncStore } from '../../store/useOfflineSyncStore';
import { useCatalogStore } from '../../store/useCatalogStore';
import { WizardStepHeader } from '../../components/wizard/WizardStepHeader';
import { WizardNavigationFooter } from '../../components/wizard/WizardNavigationFooter';
import { CompanyContextCard } from '../../components/common/CompanyContextCard';
import { AppInput } from '../../components/common/AppInput';
import { AppDropdown } from '../../components/common/AppDropdown';
import { AppCard } from '../../components/common/AppCard';

const ORIGIN_COUNTRIES = [
  'India (Domestic Manufacture)',
  'Germany',
  'Japan',
  'United States',
  'China',
  'Taiwan',
  'South Korea',
  'United Kingdom',
  'Italy',
  'Other',
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

interface Step8ComplianceReviewSubmitScreenProps {
  navigation: any;
}

export const Step8ComplianceReviewSubmitScreen: React.FC<Step8ComplianceReviewSubmitScreenProps> = ({ navigation }) => {
  const {
    step1,
    step2,
    step3,
    step4,
    step5,
    step6,
    step7,
    step8,
    updateStep8,
    saveDraft,
    deleteDraft,
    draftId,
    setStep,
    prevStep,
  } = useSkuWizardStore();
  const { activeCompany, incrementSkuCount } = useCompanyStore();
  const { incrementSkusCount } = useShiftStore();
  const { addToQueue } = useOfflineSyncStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SkuStep8FormValues>({
    resolver: zodResolver(skuStep8Schema),
    defaultValues: step8,
    mode: 'onBlur',
  });

  const handleJumpToStep = (stepNumber: number, screenName?: string) => {
    const route = screenName || SKU_STEP_ROUTE_MAP[stepNumber];
    if (route) {
      setStep(stepNumber);
      navigation.navigate(route);
    }
  };

  const onSubmit = async (data: SkuStep8FormValues) => {
    try {
      setIsSubmitting(true);
      updateStep8(data);

      const targetCompanyId = step1.companyId || activeCompany?.id || 'COMP_DEFAULT';
      const targetCompanyName = step1.companyName || activeCompany?.legalName || 'Target Company';
      const finalSku = step2.jaxmartAutoSku;

      // 1. Prepare photos
      const photosArray = Object.entries(step7.photos || {}).map(([k, uri]) => ({
        key: k,
        uri,
        isPrimary: k === 'frontView',
      }));

      // 2. Add to sync queue
      await addToQueue({
        type: 'SKU_SUBMISSION',
        title: `SKU: ${step1.title || 'New Product'}`,
        subtitle: `Company: ${targetCompanyName} · SKU: ${finalSku}`,
        payload: {
          sellerId: targetCompanyId,
          listingType: 'PRODUCT',
          title: step1.title || 'Cataloged Product',
          description: step1.detailedDescription || step1.shortDescription || step1.title || 'B2B Product SKU',
          brand: step1.brand || 'Generic',
          categoryId: step1.categoryId && step1.categoryId.length > 20
            ? step1.categoryId
            : '7314cf57-3d90-4b10-afd6-cfa1fba585cc', // Live Industrial Supplies Category UUID
          hsnCode: step1.hsnCode || '73181500',
          sku: finalSku,
          barcode: step2.barcode,
          manufacturerSku: step2.manufacturerSku,
          mrp: step3.mrp || 0,
          pricePerUnit: step3.b2bPrice || step3.mrp || 0,
          gstRate: step3.gstRate || 18,
          minOrderQty: step3.minOrderQty || 1,
          unitOfMeasure: step3.unitOfMeasure || 'pcs',
          bulkPriceSlabs: step3.bulkPriceSlabs || [],
          hasVariants: step4.hasVariants,
          variantMatrix: step4.variantMatrix,
          customAttributes: step4.customAttributes,
          stockAvailable: (step5.stockQuantity || 0) > 0,
          shelfLocation: step5.warehouseShelfLocation,
          expiryDate: step5.hasExpiryDate ? step5.expiryDate : null,
          returnPolicy: step5.returnPolicy,
          packagingDetails: `Length: ${step6.packagingLengthCm}cm, Width: ${step6.packagingWidthCm}cm, Height: ${step6.packagingHeightCm}cm`,
          volumetricWeight: step6.volumetricWeightKg,
          countryOfOrigin: data.countryOfOrigin,
          certifications: data.certifications ? [data.certifications] : [],
          warranty: data.warrantyDetails,
          status: 'ACTIVE',
        },
        photosToUpload: photosArray,
      });

      // 3. Save to local catalog store
      await useCatalogStore.getState().addCatalogItem({
        sku: finalSku,
        companyId: targetCompanyId,
        companyName: targetCompanyName,
        title: step1.title || 'Cataloged Product',
        brand: step1.brand || 'Generic',
        categoryId: step1.categoryId || '7314cf57-3d90-4b10-afd6-cfa1fba585cc',
        categoryName: step1.categoryName || 'Industrial Supplies',
        hsnCode: step1.hsnCode || '73181500',
        mrp: step3.mrp || 0,
        b2bPrice: step3.b2bPrice || 0,
        minOrderQty: step3.minOrderQty || 1,
        unitOfMeasure: step3.unitOfMeasure || 'Pieces (pcs)',
        stockQuantity: step5.stockQuantity || 100,
        bulkPriceSlabs: step3.bulkPriceSlabs,
        status: 'ACTIVE',
        images: photosArray.map((p) => p.uri),
      });

      // 4. Increment counters
      incrementSkusCount();
      if (targetCompanyId) {
        incrementSkuCount(targetCompanyId);
      }

      // 5. Delete saved draft
      await deleteDraft(draftId);

      setIsSubmitting(false);

      // 5. Navigate to SkuSuccessScreen
      navigation.navigate('SkuSuccess', {
        sku: finalSku,
        title: step1.title,
        companyName: targetCompanyName,
        companyId: targetCompanyId,
      });
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert('Submission Error', err.message || 'Failed to submit SKU');
    }
  };

  const handleSaveDraft = handleSubmit((data) => {
    updateStep8(data);
    saveDraft();
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <WizardStepHeader
        currentStep={8}
        totalSteps={8}
        stepTitle="Compliance & Final Submission"
        stepSubtitle="Country of origin, warranty, full review & submittal to Admin Approval Queue"
        stepNames={SKU_STEP_NAMES}
        onStepPress={(s) => handleJumpToStep(s)}
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

          {/* Compliance Inputs */}
          <Controller
            control={control}
            name="countryOfOrigin"
            render={({ field: { onChange, value } }) => (
              <AppDropdown
                label="Country of Origin"
                options={ORIGIN_COUNTRIES}
                selectedValue={value}
                onSelect={(val) => onChange(val)}
                error={errors.countryOfOrigin?.message}
                searchable
                required
              />
            )}
          />

          <Controller
            control={control}
            name="certifications"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Standard Certifications (Optional)"
                placeholder="e.g. BIS, ISO 9001, CE Certified, RoHS"
                value={value || ''}
                onChangeText={onChange}
                error={errors.certifications?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="warrantyDetails"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Manufacturer Warranty (Optional)"
                placeholder="e.g. 1 Year Standard Manufacturer Replacement Warranty"
                value={value || ''}
                onChangeText={onChange}
                error={errors.warrantyDetails?.message}
              />
            )}
          />

          {/* Review Summary Section */}
          <Text style={styles.reviewSectionTitle}>SKU Review & Audit Summary</Text>

          {/* Step 1 Review */}
          <AppCard style={styles.reviewCard}>
            <View style={styles.reviewCardHeader}>
              <Text style={styles.reviewStepTitle}>1. Product Information</Text>
              <TouchableOpacity onPress={() => handleJumpToStep(1, 'Step1BasicProduct')}>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.reviewLabel}>Title: <Text style={styles.reviewVal}>{step1.title}</Text></Text>
            <Text style={styles.reviewLabel}>Brand: <Text style={styles.reviewVal}>{step1.brand}</Text></Text>
            <Text style={styles.reviewLabel}>Category: <Text style={styles.reviewVal}>{step1.categoryName}</Text></Text>
            <Text style={styles.reviewLabel}>HSN Code: <Text style={styles.reviewValMono}>{step1.hsnCode}</Text></Text>
          </AppCard>

          {/* Step 2 Review */}
          <AppCard style={styles.reviewCard}>
            <View style={styles.reviewCardHeader}>
              <Text style={styles.reviewStepTitle}>2. Barcode & Identification</Text>
              <TouchableOpacity onPress={() => handleJumpToStep(2, 'Step2BarcodeScanner')}>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.reviewLabel}>Barcode: <Text style={styles.reviewValMono}>{step2.barcode}</Text></Text>
            <Text style={styles.reviewLabel}>Assigned SKU: <Text style={styles.reviewValMono}>{step2.jaxmartAutoSku}</Text></Text>
          </AppCard>

          {/* Step 3 Review */}
          <AppCard style={styles.reviewCard}>
            <View style={styles.reviewCardHeader}>
              <Text style={styles.reviewStepTitle}>3. Pricing & Slabs</Text>
              <TouchableOpacity onPress={() => handleJumpToStep(3, 'Step3PricingTaxesSlabs')}>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.reviewLabel}>MRP: <Text style={styles.reviewVal}>₹{step3.mrp}</Text></Text>
            <Text style={styles.reviewLabel}>B2B Price: <Text style={styles.reviewVal}>₹{step3.b2bPrice} (+{step3.gstRate}% GST)</Text></Text>
            <Text style={styles.reviewLabel}>MOQ: <Text style={styles.reviewVal}>{step3.minOrderQty} {step3.unitOfMeasure}</Text></Text>
            <Text style={styles.reviewLabel}>Volume Slabs: <Text style={styles.reviewVal}>{step3.bulkPriceSlabs?.length || 0} Tier(s)</Text></Text>
          </AppCard>

          {/* Step 6 Review */}
          <AppCard style={styles.reviewCard}>
            <View style={styles.reviewCardHeader}>
              <Text style={styles.reviewStepTitle}>6. Packaging & Freight Math</Text>
              <TouchableOpacity onPress={() => handleJumpToStep(6, 'Step6PackagingDimensions')}>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.reviewLabel}>Box Dimensions: <Text style={styles.reviewVal}>{step6.packagingLengthCm} × {step6.packagingWidthCm} × {step6.packagingHeightCm} cm</Text></Text>
            <Text style={styles.reviewLabel}>Gross Weight: <Text style={styles.reviewVal}>{step6.grossWeightKg} kg</Text></Text>
            <Text style={styles.reviewLabel}>Volumetric Weight: <Text style={styles.reviewValMono}>{step6.volumetricWeightKg?.toFixed(2)} kg</Text></Text>
          </AppCard>

          {/* Step 7 Review */}
          <AppCard style={styles.reviewCard}>
            <View style={styles.reviewCardHeader}>
              <Text style={styles.reviewStepTitle}>7. Photo Media Grid</Text>
              <TouchableOpacity onPress={() => handleJumpToStep(7, 'Step7MediaUpload')}>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.photoThumbsRow}>
              {Object.entries(step7.photos || {}).map(([k, uri]) => (
                <Image key={k} source={{ uri: uri as string }} style={styles.photoThumbMini} />
              ))}
            </View>
          </AppCard>
        </ScrollView>
      </KeyboardAvoidingView>

      <WizardNavigationFooter
        currentStep={8}
        totalSteps={8}
        nextLabel="Submit SKU to Admin Queue"
        onNext={handleSubmit(onSubmit)}
        onBack={() => {
          prevStep();
          navigation.goBack();
        }}
        isSubmitting={isSubmitting}
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
  reviewSectionTitle: {
    ...typography.headlineMd,
    color: colors.primaryDark,
    fontWeight: '700',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  reviewCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reviewStepTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
  editLink: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '700',
  },
  reviewLabel: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  reviewVal: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  reviewValMono: {
    fontFamily: 'monospace',
    color: colors.primaryDark,
    fontWeight: '700',
  },
  photoThumbsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  photoThumbMini: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
});

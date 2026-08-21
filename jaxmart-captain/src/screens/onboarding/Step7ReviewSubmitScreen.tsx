// src/screens/onboarding/Step7ReviewSubmitScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useSellerWizardStore } from '../../store/useSellerWizardStore';
import { useCompanyStore } from '../../store/useCompanyStore';
import { useShiftStore } from '../../store/useShiftStore';
import { useOfflineSyncStore } from '../../store/useOfflineSyncStore';
import { WizardStepHeader } from '../../components/wizard/WizardStepHeader';
import { WizardNavigationFooter } from '../../components/wizard/WizardNavigationFooter';
import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CompanySummary } from '../../api/companyApi';

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

interface Step7ReviewSubmitScreenProps {
  navigation: any;
}

export const Step7ReviewSubmitScreen: React.FC<Step7ReviewSubmitScreenProps> = ({ navigation }) => {
  const { step1, step2, step3, step4, step5, step6, setStep, resetWizard, deleteDraft, draftId, prevStep } = useSellerWizardStore();
  const { addLocalCompany, setActiveCompany } = useCompanyStore();
  const { incrementSellersCount } = useShiftStore();
  const { addToQueue } = useOfflineSyncStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [generatedSellerId, setGeneratedSellerId] = useState('');
  const [createdCompany, setCreatedCompany] = useState<CompanySummary | null>(null);

  const handleJumpToStep = (stepNumber: number, screenName?: string) => {
    const route = screenName || STEP_ROUTE_MAP[stepNumber];
    if (route) {
      setStep(stepNumber);
      navigation.navigate(route);
    }
  };

  const handleSubmitOnboarding = async () => {
    try {
      setIsSubmitting(true);

      const sellerId = `JAX-SEL-${Date.now().toString().slice(-6)}`;
      setGeneratedSellerId(sellerId);

      const company: CompanySummary = {
        id: sellerId,
        legalName: step1.legalBusinessName,
        tradeName: step1.tradeName,
        gstin: step3.gstin,
        pan: step3.panNumber,
        ownerName: step1.primaryOwnerName,
        phone: step1.primaryMobile,
        email: step1.email,
        city: step2.city,
        state: step2.state,
        pincode: step2.pincode,
        category: step5.primaryCategoryName,
        kycStatus: 'PENDING',
        storefrontImage: step2.storefrontPhoto,
        skuCount: 0,
        createdAt: new Date().toISOString(),
      };

      setCreatedCompany(company);

      // 1. Add to local directory
      await addLocalCompany(company);

      // 2. Add to offline sync queue
      await addToQueue({
        type: 'SELLER_ONBOARDING',
        title: `Merchant Onboarding: ${step1.legalBusinessName}`,
        subtitle: `GSTIN: ${step3.gstin || 'Unregistered'} · ${step2.city}`,
        payload: {
          sellerId,
          step1,
          step2,
          step3,
          step4,
          step5,
          step6,
        },
        photosToUpload: [
          { key: 'storefrontPhoto', uri: step2.storefrontPhoto },
          { key: 'storeInteriorPhoto', uri: step2.storeInteriorPhoto },
          ...(step3.panCardPhoto ? [{ key: 'panCardPhoto', uri: step3.panCardPhoto }] : []),
          ...(step3.gstCertPhoto ? [{ key: 'gstCertPhoto', uri: step3.gstCertPhoto }] : []),
          ...(step4.chequePhoto ? [{ key: 'chequePhoto', uri: step4.chequePhoto }] : []),
          ...(step6.sellerSignatureUri ? [{ key: 'sellerSignatureUri', uri: step6.sellerSignatureUri }] : []),
        ],
      });

      // 3. Increment Shift metrics
      incrementSellersCount();

      // 4. Clear Draft
      await deleteDraft(draftId);

      setIsSubmitting(false);
      setSuccessModalVisible(true);
    } catch (e: any) {
      setIsSubmitting(false);
      Alert.alert('Submission Error', e.message || 'Failed to submit onboarding');
    }
  };

  const handleGoToCatalogSKUs = () => {
    setSuccessModalVisible(false);
    resetWizard();
    if (createdCompany) {
      setActiveCompany(createdCompany);
      navigation.navigate('Main', {
        screen: 'SkuWizardTab',
        params: {
          screen: 'Step1BasicProduct',
          params: { companyId: createdCompany.id, companyName: createdCompany.legalName },
        },
      });
    } else {
      navigation.navigate('Main', { screen: 'DashboardTab' });
    }
  };

  const handleReturnToDashboard = () => {
    setSuccessModalVisible(false);
    resetWizard();
    navigation.navigate('Main', { screen: 'DashboardTab' });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <WizardStepHeader
        currentStep={7}
        totalSteps={7}
        stepTitle="Review & Admin Submission"
        stepSubtitle="Final verification before queuing for Admin KYC Approval"
        stepNames={STEP_NAMES}
        onStepPress={(s) => handleJumpToStep(s)}
        onBack={() => {
          prevStep();
          navigation.goBack();
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step 1 Review */}
        <AppCard style={styles.reviewCard}>
          <View style={styles.reviewCardHeader}>
            <View style={styles.reviewHeaderLeft}>
              <Ionicons name="business" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.reviewCardTitle}>1. Business Profile</Text>
            </View>
            <TouchableOpacity onPress={() => handleJumpToStep(1, 'Step1BasicProfile')}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.reviewGrid}>
            <Text style={styles.reviewLabel}>Legal Name: <Text style={styles.reviewVal}>{step1.legalBusinessName}</Text></Text>
            <Text style={styles.reviewLabel}>Trade Name: <Text style={styles.reviewVal}>{step1.tradeName}</Text></Text>
            <Text style={styles.reviewLabel}>Entity: <Text style={styles.reviewVal}>{step1.entityType}</Text></Text>
            <Text style={styles.reviewLabel}>Owner: <Text style={styles.reviewVal}>{step1.primaryOwnerName} (+91 {step1.primaryMobile})</Text></Text>
            <Text style={styles.reviewLabel}>Email: <Text style={styles.reviewVal}>{step1.email}</Text></Text>
          </View>
        </AppCard>

        {/* Step 2 Review */}
        <AppCard style={styles.reviewCard}>
          <View style={styles.reviewCardHeader}>
            <View style={styles.reviewHeaderLeft}>
              <Ionicons name="location" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.reviewCardTitle}>2. Geolocation & Store Address</Text>
            </View>
            <TouchableOpacity onPress={() => handleJumpToStep(2, 'Step2StoreLocation')}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.reviewGrid}>
            <Text style={styles.reviewLabel}>Address: <Text style={styles.reviewVal}>{step2.buildingNoFloor}, {step2.streetArea}</Text></Text>
            <Text style={styles.reviewLabel}>Landmark & City: <Text style={styles.reviewVal}>{step2.landmark}, {step2.city} ({step2.pincode})</Text></Text>
            <Text style={styles.reviewLabel}>GPS Lock: <Text style={styles.reviewVal}>{step2.latitude?.toFixed(4)}, {step2.longitude?.toFixed(4)}</Text></Text>
            <View style={styles.photoThumbsRow}>
              {step2.storefrontPhoto ? (
                <Image source={{ uri: step2.storefrontPhoto }} style={styles.photoThumbMini} />
              ) : null}
              {step2.storeInteriorPhoto ? (
                <Image source={{ uri: step2.storeInteriorPhoto }} style={styles.photoThumbMini} />
              ) : null}
            </View>
          </View>
        </AppCard>

        {/* Step 3 Review */}
        <AppCard style={styles.reviewCard}>
          <View style={styles.reviewCardHeader}>
            <View style={styles.reviewHeaderLeft}>
              <Ionicons name="shield-checkmark" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.reviewCardTitle}>3. KYC & Government Identity</Text>
            </View>
            <TouchableOpacity onPress={() => handleJumpToStep(3, 'Step3IdentityKyc')}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.reviewGrid}>
            <Text style={styles.reviewLabel}>GSTIN: <Text style={styles.reviewValMono}>{step3.gstin || 'Not Registered'}</Text></Text>
            <Text style={styles.reviewLabel}>PAN: <Text style={styles.reviewValMono}>{step3.panNumber} ({step3.panName})</Text></Text>
            {step3.udyamNumber && <Text style={styles.reviewLabel}>MSME / Udyam: <Text style={styles.reviewVal}>{step3.udyamNumber}</Text></Text>}
          </View>
        </AppCard>

        {/* Step 4 Review */}
        <AppCard style={styles.reviewCard}>
          <View style={styles.reviewCardHeader}>
            <View style={styles.reviewHeaderLeft}>
              <Ionicons name="card" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.reviewCardTitle}>4. Settlement Bank Account</Text>
            </View>
            <TouchableOpacity onPress={() => handleJumpToStep(4, 'Step4BankSettlement')}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.reviewGrid}>
            <Text style={styles.reviewLabel}>Bank: <Text style={styles.reviewVal}>{step4.bankName} ({step4.accountType})</Text></Text>
            <Text style={styles.reviewLabel}>Account No: <Text style={styles.reviewValMono}>••••••••{step4.accountNumber?.slice(-4)}</Text></Text>
            <Text style={styles.reviewLabel}>IFSC Code: <Text style={styles.reviewValMono}>{step4.ifscCode}</Text></Text>
          </View>
        </AppCard>

        {/* Step 5 Review */}
        <AppCard style={styles.reviewCard}>
          <View style={styles.reviewCardHeader}>
            <View style={styles.reviewHeaderLeft}>
              <Ionicons name="pricetag" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.reviewCardTitle}>5. Operations & Fulfilment</Text>
            </View>
            <TouchableOpacity onPress={() => handleJumpToStep(5, 'Step5OperationsCategory')}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.reviewGrid}>
            <Text style={styles.reviewLabel}>Category: <Text style={styles.reviewVal}>{step5.primaryCategoryName}</Text></Text>
            <Text style={styles.reviewLabel}>Sub-categories: <Text style={styles.reviewVal}>{step5.subCategories?.join(', ')}</Text></Text>
            <Text style={styles.reviewLabel}>Turnover: <Text style={styles.reviewVal}>{step5.monthlyTurnover}</Text></Text>
            <Text style={styles.reviewLabel}>Hours: <Text style={styles.reviewVal}>{step5.openingTime} - {step5.closingTime}</Text></Text>
          </View>
        </AppCard>

        {/* Step 6 Review */}
        <AppCard style={styles.reviewCard}>
          <View style={styles.reviewCardHeader}>
            <View style={styles.reviewHeaderLeft}>
              <Ionicons name="create" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.reviewCardTitle}>6. Sign-off & Attestation</Text>
            </View>
            <TouchableOpacity onPress={() => handleJumpToStep(6, 'Step6LegalSignature')}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.reviewGrid}>
            <Text style={styles.reviewLabel}>Terms Accepted: <Text style={styles.reviewVal}>YES</Text></Text>
            <Text style={styles.reviewLabel}>Captain Field Attested: <Text style={styles.reviewVal}>YES</Text></Text>
            {step6.sellerSignatureUri ? (
              <Image source={{ uri: step6.sellerSignatureUri }} style={styles.signatureThumbMini} resizeMode="contain" />
            ) : null}
          </View>
        </AppCard>
      </ScrollView>

      {/* Sticky Bottom Footer Navigation */}
      <WizardNavigationFooter
        currentStep={7}
        totalSteps={7}
        nextLabel="Submit Seller Onboarding"
        onNext={handleSubmitOnboarding}
        onBack={() => {
          prevStep();
          navigation.goBack();
        }}
        isSubmitting={isSubmitting}
        onSaveDraft={() => {
          useSellerWizardStore.getState().saveDraft();
          Alert.alert('Draft Saved', 'Onboarding draft saved to local device cache.');
          navigation.navigate('SellerDraftsList');
        }}
      />

      {/* Post-Submission Success Modal */}
      <Modal visible={successModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-done" size={48} color="#FFFFFF" />
            </View>

            <Text style={styles.successModalTitle}>Seller Successfully Onboarded!</Text>
            <Text style={styles.successModalSubtitle}>
              Application and verified documents have been synced into the Jaxmart Admin KYC Review Queue.
            </Text>

            <View style={styles.sellerIdBadgeCard}>
              <Text style={styles.sellerIdLabel}>GENERATED SELLER ID</Text>
              <Text style={styles.sellerIdValue}>{generatedSellerId}</Text>
              <View style={styles.statusChipRow}>
                <StatusBadge status="PENDING" label="Pending Admin Approval" size="md" />
              </View>
            </View>

            {/* Direct CTA to Add SKUs for this new company */}
            <AppButton
              title={`+ Catalog SKUs for ${step1.tradeName || 'this Company'}`}
              variant="secondary"
              icon="scan"
              onPress={handleGoToCatalogSKUs}
              fullWidth
              style={{ marginBottom: spacing.sm }}
            />

            <AppButton
              title="Return to Dashboard"
              variant="primary"
              onPress={handleReturnToDashboard}
              fullWidth
            />
          </View>
        </View>
      </Modal>
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
  reviewCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
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
  reviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCardTitle: {
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
  reviewGrid: {
    marginTop: spacing.xs,
  },
  reviewLabel: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginBottom: 4,
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
    marginTop: spacing.xs,
  },
  photoThumbMini: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  signatureThumbMini: {
    width: 120,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 19, 88, 0.65)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.modal,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  successModalTitle: {
    ...typography.headlineMd,
    color: colors.primaryDark,
    fontWeight: '700',
    textAlign: 'center',
  },
  successModalSubtitle: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  sellerIdBadgeCard: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  sellerIdLabel: {
    ...typography.labelCaps,
    color: colors.textPlaceholder,
    fontSize: 10,
  },
  sellerIdValue: {
    ...typography.monoLg,
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 18,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  statusChipRow: {
    marginTop: 2,
  },
});

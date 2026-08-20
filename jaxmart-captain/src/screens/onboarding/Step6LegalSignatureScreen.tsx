// src/screens/onboarding/Step6LegalSignatureScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { step6Schema, Step6FormValues } from '../../schemas/sellerOnboardingSchema';
import { useSellerWizardStore } from '../../store/useSellerWizardStore';
import { useAuthStore } from '../../store/useAuthStore';
import { WizardStepHeader } from '../../components/wizard/WizardStepHeader';
import { WizardNavigationFooter } from '../../components/wizard/WizardNavigationFooter';
import { SignatureCanvasModal } from '../../components/signature/SignatureCanvasModal';

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

interface Step6LegalSignatureScreenProps {
  navigation: any;
}

export const Step6LegalSignatureScreen: React.FC<Step6LegalSignatureScreenProps> = ({ navigation }) => {
  const { step6, updateStep6, nextStep, prevStep, saveDraft, setStep, step1 } = useSellerWizardStore();
  const captain = useAuthStore((s) => s.user);

  const [signatureModalVisible, setSignatureModalVisible] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step6FormValues>({
    resolver: zodResolver(step6Schema),
    defaultValues: step6,
  });

  const agreedToTerms = watch('agreedToTerms');
  const captainDeclaration = watch('captainDeclaration');
  const sellerSignatureUri = watch('sellerSignatureUri');

  const onSubmit = (data: Step6FormValues) => {
    updateStep6(data);
    nextStep();
    navigation.navigate('Step7ReviewSubmit');
  };

  const handleSaveDraft = handleSubmit((data) => {
    updateStep6(data);
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
        currentStep={6}
        totalSteps={7}
        stepTitle="Legal Agreement & Sign-Off"
        stepSubtitle="Digital contract execution & Captain verification declaration"
        stepNames={STEP_NAMES}
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
        {/* Terms & Conditions Viewer Box */}
        <View style={styles.contractCard}>
          <View style={styles.contractHeader}>
            <Ionicons name="document-text" size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
            <Text style={styles.contractHeaderTitle}>Jaxmart Merchant Marketplace Agreement</Text>
          </View>

          <ScrollView style={styles.termsScrollBox} nestedScrollEnabled>
            <Text style={styles.termsParagraph}>
              1. <Text style={{ fontWeight: '700' }}>Platform Onboarding & KYC</Text>: The Merchant ({step1.legalBusinessName || 'Seller'}) hereby authorizes Jaxmart B2B Network to verify GSTIN, PAN, Bank settlement details, and physical storefront credentials.
            </Text>
            <Text style={styles.termsParagraph}>
              2. <Text style={{ fontWeight: '700' }}>Pricing & B2B Invoicing</Text>: All prices cataloged by Captain on-site shall adhere to maximum retail price limits and agreed trade slabs. Valid GST tax invoices must accompany all shipments.
            </Text>
            <Text style={styles.termsParagraph}>
              3. <Text style={{ fontWeight: '700' }}>Payment Escrow & Settlement</Text>: Payments collected via Jaxmart gateway are settled into the verified bank account upon buyer delivery confirmation or milestone approval.
            </Text>
            <Text style={styles.termsParagraph}>
              4. <Text style={{ fontWeight: '700' }}>Warranties & Authenticity</Text>: Merchant guarantees that all products cataloged are 100% genuine, authentic, and compliant with Indian BIS/FSSAI licensing regulations.
            </Text>
          </ScrollView>

          {/* Seller Terms Agreement Checkbox */}
          <Controller
            control={control}
            name="agreedToTerms"
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                style={[styles.agreementRow, Boolean(value) && styles.agreementRowChecked]}
                onPress={() => onChange(!value)}
              >
                <Ionicons
                  name={value ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={value ? colors.primary : colors.outline}
                  style={{ marginRight: spacing.sm }}
                />
                <Text style={styles.agreementText}>
                  I, <Text style={{ fontWeight: '700' }}>{step1.primaryOwnerName || 'Seller'}</Text>, have read, understood, and accept the Jaxmart Merchant Terms & Conditions.
                </Text>
              </TouchableOpacity>
            )}
          />
          {errors.agreedToTerms && (
            <Text style={styles.errorText}>{errors.agreedToTerms.message}</Text>
          )}
        </View>

        {/* Digital Signature Canvas Box */}
        <View style={styles.signatureCard}>
          <Text style={styles.signatureTitle}>
            Authorized Signatory Digital Signature <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <Text style={styles.signatureSubtitle}>
            Merchant / Authorized Representative signature drawn on device screen
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSignatureModalVisible(true)}
            style={[
              styles.signaturePadBox,
              Boolean(sellerSignatureUri) && styles.signaturePadBoxFilled,
              Boolean(errors.sellerSignatureUri) && styles.signaturePadBoxError,
            ]}
          >
            {sellerSignatureUri ? (
              <>
                <Image source={{ uri: sellerSignatureUri }} style={styles.signatureImage} resizeMode="contain" />
                <View style={styles.signatureRetakeOverlay}>
                  <Ionicons name="pencil" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.signatureRetakeText}>Tap to Re-Sign</Text>
                </View>
              </>
            ) : (
              <View style={styles.signaturePlaceholder}>
                <Ionicons name="create-outline" size={36} color={colors.primary} />
                <Text style={styles.signaturePlaceholderText}>Tap to Open Digital Signature Pad</Text>
              </View>
            )}
          </TouchableOpacity>
          {errors.sellerSignatureUri && (
            <Text style={styles.errorText}>{errors.sellerSignatureUri.message}</Text>
          )}
        </View>

        {/* Captain Physical Visit Declaration */}
        <View style={styles.captainDeclarationCard}>
          <View style={styles.captainHeader}>
            <Ionicons name="shield-checkmark" size={20} color={colors.secondary} style={{ marginRight: spacing.sm }} />
            <Text style={styles.captainHeaderTitle}>Captain On-Ground Attestation</Text>
          </View>

          <Controller
            control={control}
            name="captainDeclaration"
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                style={[styles.agreementRow, Boolean(value) && styles.agreementRowChecked]}
                onPress={() => onChange(!value)}
              >
                <Ionicons
                  name={value ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={value ? colors.secondary : colors.outline}
                  style={{ marginRight: spacing.sm }}
                />
                <Text style={styles.captainDeclarationText}>
                  I, <Text style={{ fontWeight: '700' }}>{captain?.fullName || 'Captain Arjun Sharma'}</Text> ({captain?.employeeId || 'CAPT-849201'}), hereby certify that I have physically visited this store premise, validated government KYC documents, and captured authentic photos.
                </Text>
              </TouchableOpacity>
            )}
          />
          {errors.captainDeclaration && (
            <Text style={styles.errorText}>{errors.captainDeclaration.message}</Text>
          )}
        </View>
      </ScrollView>

      <WizardNavigationFooter
        currentStep={6}
        totalSteps={7}
        onNext={handleSubmit(onSubmit)}
        onBack={() => {
          prevStep();
          navigation.goBack();
        }}
        onSaveDraft={handleSaveDraft}
      />

      {/* Signature Modal */}
      {signatureModalVisible && (
        <SignatureCanvasModal
          visible={signatureModalVisible}
          onClose={() => setSignatureModalVisible(false)}
          onSaveSignature={(dataUri) => {
            setValue('sellerSignatureUri', dataUri, { shouldValidate: true });
            setSignatureModalVisible(false);
          }}
          signerName={step1.primaryOwnerName || step1.legalBusinessName}
          agreementTitle="Jaxmart B2B Merchant Master Agreement"
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
    paddingBottom: spacing.xl,
  },
  contractCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  contractHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  contractHeaderTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 14,
  },
  termsScrollBox: {
    height: 130,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  termsParagraph: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.md,
    padding: spacing.xs,
  },
  agreementRowChecked: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
  },
  agreementText: {
    ...typography.bodySm,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  signatureCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  signatureTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  signatureSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  signaturePadBox: {
    width: '100%',
    height: 150,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  signaturePadBoxFilled: {
    borderStyle: 'solid',
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
  },
  signaturePadBoxError: {
    borderColor: colors.error,
  },
  signatureImage: {
    width: '90%',
    height: '90%',
  },
  signaturePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  signaturePlaceholderText: {
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  signatureRetakeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(18, 19, 88, 0.75)',
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureRetakeText: {
    ...typography.labelCaps,
    color: '#FFFFFF',
    fontSize: 10,
  },
  captainDeclarationCard: {
    backgroundColor: colors.secondaryContainer,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.secondary,
    marginBottom: spacing.md,
  },
  captainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  captainHeaderTitle: {
    ...typography.titleMd,
    color: colors.onSecondaryContainer,
    fontWeight: '700',
  },
  captainDeclarationText: {
    ...typography.bodySm,
    color: colors.onSecondaryContainer,
    flex: 1,
    lineHeight: 18,
  },
  errorText: {
    ...typography.bodySm,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

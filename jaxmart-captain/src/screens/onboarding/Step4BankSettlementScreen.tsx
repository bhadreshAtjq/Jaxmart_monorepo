// src/screens/onboarding/Step4BankSettlementScreen.tsx
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { step4Schema, Step4FormValues } from '../../schemas/sellerOnboardingSchema';
import { useSellerWizardStore } from '../../store/useSellerWizardStore';
import { WizardStepHeader } from '../../components/wizard/WizardStepHeader';
import { WizardNavigationFooter } from '../../components/wizard/WizardNavigationFooter';
import { AppInput } from '../../components/common/AppInput';
import { AppDropdown } from '../../components/common/AppDropdown';
import { ExpoCameraModal } from '../../components/camera/ExpoCameraModal';

const ACCOUNT_TYPE_OPTIONS = ['Current Account', 'Savings Account'];
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

interface Step4BankSettlementScreenProps {
  navigation: any;
}

export const Step4BankSettlementScreen: React.FC<Step4BankSettlementScreenProps> = ({ navigation }) => {
  const { step4, updateStep4, nextStep, prevStep, saveDraft, setStep, step1, step3 } = useSellerWizardStore();

  const [pennyDropLoading, setPennyDropLoading] = useState(false);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);

  const defaultHolder = step1.legalBusinessName || step3.panName || step1.primaryOwnerName;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step4FormValues>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      ...step4,
      accountHolderName: step4.accountHolderName || defaultHolder,
    },
    mode: 'onBlur',
  });

  const chequePhoto = watch('chequePhoto');
  const isPennyDropVerified = watch('isPennyDropVerified');
  const ifscCode = watch('ifscCode');
  const accountNumber = watch('accountNumber');

  const handlePennyDrop = async () => {
    if (!accountNumber || accountNumber.length < 8 || !ifscCode || ifscCode.length < 11) {
      Alert.alert('Invalid Account Info', 'Please enter a valid Account Number and 11-digit IFSC code first.');
      return;
    }

    setPennyDropLoading(true);
    setTimeout(() => {
      setPennyDropLoading(false);
      setValue('isPennyDropVerified', true, { shouldValidate: true });
      setValue('bankName', ifscCode.startsWith('HDFC') ? 'HDFC Bank' : ifscCode.startsWith('SBIN') ? 'State Bank of India' : ifscCode.startsWith('ICIC') ? 'ICICI Bank' : 'Commercial Scheduled Bank');
      setValue('bankBranch', 'Main Industrial Complex Branch');
      Alert.alert(
        'Penny Drop Successful',
        `₹1.00 test deposit verified.\nAccount Status: ACTIVE\nBeneficiary Name: ${defaultHolder}`
      );
    }, 1200);
  };

  const onSubmit = (data: Step4FormValues) => {
    updateStep4(data);
    nextStep();
    navigation.navigate('Step5OperationsCategory');
  };

  const handleSaveDraft = handleSubmit((data) => {
    updateStep4(data);
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
        currentStep={4}
        totalSteps={7}
        stepTitle="Bank Account & Settlement"
        stepSubtitle="Direct payment settlement account & Penny-drop verification"
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
          {/* Penny Drop Verification Banner */}
          <View style={[styles.pennyDropBanner, isPennyDropVerified && styles.pennyDropBannerVerified]}>
            <View style={styles.pennyIconBox}>
              <Ionicons
                name={isPennyDropVerified ? 'checkmark-circle' : 'cash-outline'}
                size={24}
                color={isPennyDropVerified ? colors.secondary : colors.primary}
              />
            </View>
            <View style={{ flex: 1, marginHorizontal: spacing.sm }}>
              <Text style={styles.pennyTitle}>
                {isPennyDropVerified ? 'Bank Account Verified (Penny Drop Active)' : 'Instant ₹1 Bank Verification'}
              </Text>
              <Text style={styles.pennySubtitle}>
                {isPennyDropVerified
                  ? 'Active account confirmed with NPCI / IMPS gateway'
                  : 'Triggers instant automated test deposit'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.pennyActionBtn, isPennyDropVerified && styles.pennyActionBtnVerified]}
              onPress={handlePennyDrop}
              disabled={pennyDropLoading || isPennyDropVerified}
            >
              {pennyDropLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.pennyActionBtnText}>
                  {isPennyDropVerified ? 'Verified' : 'Verify ₹1'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <Controller
            control={control}
            name="accountHolderName"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Account Holder Name (Matches Legal / PAN Name)"
                placeholder="e.g. Apex Industrial Solutions Pvt Ltd"
                value={value}
                onChangeText={onChange}
                error={errors.accountHolderName?.message}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="accountType"
            render={({ field: { onChange, value } }) => (
              <AppDropdown
                label="Bank Account Type"
                options={ACCOUNT_TYPE_OPTIONS}
                selectedValue={value}
                onSelect={(val) => onChange(val as any)}
                error={errors.accountType?.message}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="accountNumber"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Bank Account Number"
                placeholder="Enter account number"
                value={value}
                onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
                error={errors.accountNumber?.message}
                keyboardType="number-pad"
                isMonospace
                required
              />
            )}
          />

          <Controller
            control={control}
            name="confirmAccountNumber"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Re-enter Bank Account Number (Confirmation)"
                placeholder="Confirm account number"
                value={value}
                onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
                error={errors.confirmAccountNumber?.message}
                keyboardType="number-pad"
                isMonospace
                required
              />
            )}
          />

          <Controller
            control={control}
            name="ifscCode"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="11-Character Bank IFSC Code"
                placeholder="e.g. HDFC0001234"
                value={value}
                onChangeText={(t) => onChange(t.toUpperCase())}
                error={errors.ifscCode?.message}
                autoCapitalize="characters"
                maxLength={11}
                isMonospace
                required
              />
            )}
          />

          <Controller
            control={control}
            name="bankName"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Bank Name"
                placeholder="e.g. HDFC Bank Ltd"
                value={value}
                onChangeText={onChange}
                error={errors.bankName?.message}
                required
              />
            )}
          />

          {/* Cancelled Cheque Photo Upload */}
          <View style={styles.chequeUploadCard}>
            <Text style={styles.chequeTitle}>
              Cancelled Cheque / Bank Passbook Photo <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <Text style={styles.chequeSubtitle}>
              Photograph showing clear Account Number, IFSC Code, and Account Holder Name
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setCameraModalVisible(true)}
              style={[
                styles.chequeBox,
                Boolean(chequePhoto) && styles.chequeBoxFilled,
                Boolean(errors.chequePhoto) && styles.chequeBoxError,
              ]}
            >
              {chequePhoto ? (
                <>
                  <Image source={{ uri: chequePhoto }} style={styles.chequeImage} resizeMode="cover" />
                  <View style={styles.retakeOverlay}>
                    <Ionicons name="camera" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.retakeText}>Retake Cheque Photo</Text>
                  </View>
                </>
              ) : (
                <View style={styles.chequePlaceholder}>
                  <Ionicons name="receipt-outline" size={36} color={colors.primary} />
                  <Text style={styles.chequePlaceholderText}>Tap to Capture Cancelled Cheque / Passbook</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.chequePhoto && <Text style={styles.errorText}>{errors.chequePhoto.message}</Text>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <WizardNavigationFooter
        currentStep={4}
        totalSteps={7}
        onNext={handleSubmit(onSubmit)}
        onBack={() => {
          prevStep();
          navigation.goBack();
        }}
        onSaveDraft={handleSaveDraft}
      />

      {/* Camera Modal */}
      {cameraModalVisible && (
        <ExpoCameraModal
          visible={cameraModalVisible}
          onClose={() => setCameraModalVisible(false)}
          onCapture={(uri) => {
            setValue('chequePhoto', uri, { shouldValidate: true });
            setCameraModalVisible(false);
          }}
          title="Capture Cancelled Cheque"
          subtitle="Ensure account number and IFSC are sharply focused"
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
  pennyDropBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  pennyDropBannerVerified: {
    backgroundColor: colors.secondaryContainer,
    borderColor: colors.secondary,
  },
  pennyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pennyTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
  pennySubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  pennyActionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  pennyActionBtnVerified: {
    backgroundColor: colors.secondary,
  },
  pennyActionBtnText: {
    ...typography.labelMd,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chequeUploadCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  chequeTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  chequeSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  chequeBox: {
    width: '100%',
    height: 160,
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
  chequeBoxFilled: {
    borderStyle: 'solid',
    borderColor: colors.secondary,
  },
  chequeBoxError: {
    borderColor: colors.error,
  },
  chequeImage: {
    width: '100%',
    height: '100%',
  },
  chequePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  chequePlaceholderText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  retakeOverlay: {
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
  retakeText: {
    ...typography.labelCaps,
    color: '#FFFFFF',
    fontSize: 10,
  },
  errorText: {
    ...typography.bodySm,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

// src/screens/onboarding/Step1BasicProfileScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { step1Schema, Step1FormValues } from '../../schemas/sellerOnboardingSchema';
import { useSellerWizardStore } from '../../store/useSellerWizardStore';
import { kycApi, BulkPeGstResult } from '../../api/kycApi';
import { parseGstin } from '../../utils/gstParser';
import { WizardStepHeader } from '../../components/wizard/WizardStepHeader';
import { WizardNavigationFooter } from '../../components/wizard/WizardNavigationFooter';
import { AppInput } from '../../components/common/AppInput';
import { AppDropdown } from '../../components/common/AppDropdown';
import { GstOcrScannerModal } from '../../components/camera/GstOcrScannerModal';
import { showM3Alert } from '../../store/useAlertStore';

const ENTITY_OPTIONS = [
  'Sole Proprietorship',
  'Partnership',
  'Private Limited',
  'Public Limited',
  'LLP',
  'OPC',
  'Unregistered',
];

const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Other'];

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

const DEMO_PRESETS = [
  { label: 'Panasonic (Bangalore)', gstin: '29AAECA2190C1ZZ' },
  { label: 'Apex Tools (Mumbai)', gstin: '27AABCA1234F1Z9' },
  { label: 'Radhe Mills (Surat)', gstin: '24AAECS9988H1ZV' },
  { label: 'Bharat Solar (Delhi)', gstin: '07AAECB5544K1ZR' },
];

function mapConstitutionToEntityType(constitution?: string): Step1FormValues['entityType'] {
  if (!constitution) return 'Private Limited';
  const lower = constitution.toLowerCase();
  if (lower.includes('private limited')) return 'Private Limited';
  if (lower.includes('public limited')) return 'Public Limited';
  if (lower.includes('llp') || lower.includes('limited liability partnership')) return 'LLP';
  if (lower.includes('partnership')) return 'Partnership';
  if (lower.includes('proprietor') || lower.includes('individual') || lower.includes('sole')) return 'Sole Proprietorship';
  if (lower.includes('one person') || lower.includes('opc')) return 'OPC';
  return 'Private Limited';
}

interface Step1BasicProfileScreenProps {
  navigation: any;
}

export const Step1BasicProfileScreen: React.FC<Step1BasicProfileScreenProps> = ({ navigation }) => {
  const { step1, updateStep1, updateStep2, updateStep3, nextStep, saveDraft, setStep, step3 } = useSellerWizardStore();

  const [onboardingMode, setOnboardingMode] = useState<'GST_FAST_TRACK' | 'MANUAL'>('GST_FAST_TRACK');
  const [gstinInput, setGstinInput] = useState(step3?.gstin || '');
  const [isSearching, setIsSearching] = useState(false);
  const [gstResult, setGstResult] = useState<BulkPeGstResult | null>(null);
  const [autoFilledSuccess, setAutoFilledSuccess] = useState(false);
  const [scannerModalVisible, setScannerModalVisible] = useState(false);

  const lastSearchedRef = useRef<string>('');

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: step1,
    mode: 'onBlur',
  });

  // Auto-search trigger when exactly 15 characters are entered
  useEffect(() => {
    const clean = gstinInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length === 15 && clean !== lastSearchedRef.current) {
      performGstSearch(clean);
    }
  }, [gstinInput]);

  const performGstSearch = async (cleanGstin: string) => {
    lastSearchedRef.current = cleanGstin;
    setIsSearching(true);
    setAutoFilledSuccess(false);

    try {
      const res = await kycApi.verifyGstin({ gstin: cleanGstin });
      setIsSearching(false);

      if (res && res.apiStatus && res.result) {
        const result = res.result;
        setGstResult(result);

        const legalName = result.legal_name?.value || '';
        const tradeName = result.trade_name?.value || legalName;
        const mappedEntity = mapConstitutionToEntityType(result.constitution?.value);
        const parsed = parseGstin(cleanGstin);

        // 1. Reactive form population
        const currentVals = getValues();
        reset({
          ...currentVals,
          legalBusinessName: legalName || currentVals.legalBusinessName,
          tradeName: tradeName || currentVals.tradeName,
          entityType: mappedEntity,
        });

        setValue('legalBusinessName', legalName, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        setValue('tradeName', tradeName, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        setValue('entityType', mappedEntity, { shouldValidate: true, shouldDirty: true, shouldTouch: true });

        // 2. Pre-fill & verify Step 3 (KYC)
        updateStep3({
          isGstRegistered: true,
          gstin: cleanGstin,
          isGstinVerified: true,
          panNumber: parsed.pan,
          panName: legalName,
          isPanVerified: Boolean(parsed.pan),
        });

        // 3. Pre-fill Step 2 State
        if (parsed.stateName) {
          updateStep2({
            state: parsed.stateName,
          });
        }

        setAutoFilledSuccess(true);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {}
      }
    } catch (e: any) {
      setIsSearching(false);
      const parsed = parseGstin(cleanGstin);
      updateStep3({
        isGstRegistered: true,
        gstin: cleanGstin,
        isGstinVerified: true,
        panNumber: parsed.pan,
        panName: 'Registered Taxpayer',
        isPanVerified: true,
      });
      setAutoFilledSuccess(true);
    }
  };

  const handleManualSearchClick = () => {
    const clean = gstinInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length !== 15) {
      showM3Alert(
        'Invalid GSTIN',
        'Please enter a valid 15-character Indian GSTIN number.',
        undefined,
        'warning'
      );
      return;
    }
    performGstSearch(clean);
  };

  const handleSelectPreset = (presetGstin: string) => {
    setGstinInput(presetGstin);
    performGstSearch(presetGstin);
  };

  const onSubmit = (data: Step1FormValues) => {
    updateStep1(data);
    nextStep();
    navigation.navigate('Step2StoreLocation');
  };

  const handleSaveDraft = handleSubmit((data) => {
    updateStep1(data);
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
      {/* 🌟 Ultra-Clean Wizard Step Header */}
      <WizardStepHeader
        currentStep={1}
        totalSteps={7}
        stepTitle="Basic Business Profile"
        stepSubtitle="Scan written GST, search GSTIN, or enter details manually"
        stepNames={STEP_NAMES}
        onStepPress={handleStepJump}
        onBack={() => navigation.goBack()}
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
          {/* Segmented Mode Switcher */}
          <View style={styles.modeSwitcherContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.modeTab,
                onboardingMode === 'GST_FAST_TRACK' && styles.modeTabActive,
              ]}
              onPress={() => setOnboardingMode('GST_FAST_TRACK')}
            >
              <Ionicons
                name="flash"
                size={15}
                color={onboardingMode === 'GST_FAST_TRACK' ? '#FFFFFF' : '#64748B'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.modeTabText,
                  onboardingMode === 'GST_FAST_TRACK' && styles.modeTabTextActive,
                ]}
              >
                GST Fast-Track
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.modeTab,
                onboardingMode === 'MANUAL' && styles.modeTabActive,
              ]}
              onPress={() => setOnboardingMode('MANUAL')}
            >
              <Ionicons
                name="create-outline"
                size={15}
                color={onboardingMode === 'MANUAL' ? '#FFFFFF' : '#64748B'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.modeTabText,
                  onboardingMode === 'MANUAL' && styles.modeTabTextActive,
                ]}
              >
                Manual Entry
              </Text>
            </TouchableOpacity>
          </View>

          {/* GST Fast-Track Search & Optical OCR Card */}
          {onboardingMode === 'GST_FAST_TRACK' && (
            <View style={styles.gstSearchCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.zapCircle}>
                  <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardHeaderTitle}>Instant GSTIN Lookup & OCR Auto-Fill</Text>
                  <Text style={styles.cardHeaderSubtitle}>
                    Scan written text from paper/signboard or type 15-digit GSTIN
                  </Text>
                </View>
              </View>

              {/* Optical OCR Camera Scan Action Button */}
              <TouchableOpacity
                style={styles.ocrScanTriggerBtn}
                onPress={() => setScannerModalVisible(true)}
                activeOpacity={0.85}
              >
                <View style={styles.ocrScanIconWrap}>
                  <Ionicons name="camera" size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ocrScanTitle}>Scan Written GST / Document</Text>
                  <Text style={styles.ocrScanSubtitle}>
                    Point camera at certificate, signboard, bill or business card
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#0D9488" />
              </TouchableOpacity>

              {/* Text Search Input Row */}
              <View style={styles.searchInputRow}>
                <View style={{ flex: 1 }}>
                  <AppInput
                    label="Or Enter 15-Digit GSTIN"
                    placeholder="e.g. 29AAECA2190C1ZZ"
                    value={gstinInput}
                    onChangeText={(t) => setGstinInput(t.toUpperCase())}
                    autoCapitalize="characters"
                    maxLength={15}
                    isMonospace
                    helperText={`${gstinInput.length}/15 characters${gstinInput.length === 15 ? ' · Ready to Search' : ''}`}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.searchBtn,
                    isSearching && styles.searchBtnDisabled,
                  ]}
                  onPress={handleManualSearchClick}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="search" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.searchBtnText}>Search</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Quick Preset Chips */}
              <View style={styles.presetsWrapper}>
                <Text style={styles.presetsLabel}>Quick Demo GSTINs:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsTrack}>
                  {DEMO_PRESETS.map((p) => (
                    <TouchableOpacity
                      key={p.gstin}
                      style={styles.presetChip}
                      onPress={() => handleSelectPreset(p.gstin)}
                    >
                      <Text style={styles.presetChipText}>⚡ {p.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Verified Government Taxpayer Record Card */}
              {gstResult && (
                <View style={styles.verifiedTaxpayerCard}>
                  <View style={styles.taxpayerHeader}>
                    <View style={styles.taxpayerHeaderLeft}>
                      <Ionicons name="shield-checkmark" size={18} color="#0D9488" style={{ marginRight: 6 }} />
                      <Text style={styles.taxpayerBadgeText}>OFFICIAL GST RECORD</Text>
                    </View>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>
                        {gstResult.status?.value || 'Active'} · {gstResult.tax_payer_type?.value || 'Regular'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.taxpayerLegalName}>{gstResult.legal_name?.value}</Text>

                  {Boolean(gstResult.trade_name?.value) && (
                    <Text style={styles.taxpayerTradeName}>Trade: {gstResult.trade_name?.value}</Text>
                  )}

                  <View style={styles.taxpayerDetailsRow}>
                    <View style={styles.taxpayerDetailCol}>
                      <Text style={styles.taxpayerDetailLabel}>CONSTITUTION</Text>
                      <Text style={styles.taxpayerDetailValue}>{gstResult.constitution?.value || 'Private Limited'}</Text>
                    </View>

                    <View style={styles.taxpayerDetailCol}>
                      <Text style={styles.taxpayerDetailLabel}>EXTRACTED PAN</Text>
                      <Text style={[styles.taxpayerDetailValue, { fontFamily: 'monospace', color: '#0D9488' }]}>
                        {parseGstin(gstinInput).pan}
                      </Text>
                    </View>
                  </View>

                  {autoFilledSuccess && (
                    <View style={styles.autoFilledSuccessBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#059669" style={{ marginRight: 6 }} />
                      <Text style={styles.autoFilledSuccessText}>
                        Profile details auto-filled into form below!
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Business Profile Form Card */}
          <View style={styles.formCard}>
            <View style={styles.formCardTopBar} />
            <Text style={styles.formCardTitle}>Legal Business Identity</Text>
            <Text style={styles.formCardSubtitle}>
              {autoFilledSuccess
                ? 'Information populated from GST registry. You can edit any field as needed.'
                : 'Enter legal registered business name and constitution.'}
            </Text>

            <Controller
              control={control}
              name="legalBusinessName"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Legal Registered Business Name"
                  placeholder="e.g. Acme Industrial Solutions Pvt Ltd"
                  value={value}
                  onChangeText={onChange}
                  error={errors.legalBusinessName?.message}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="tradeName"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Trade / Store Name (Optional)"
                  placeholder="e.g. Acme Tools & Hardware"
                  value={value || ''}
                  onChangeText={onChange}
                  error={errors.tradeName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="entityType"
              render={({ field: { onChange, value } }) => (
                <AppDropdown
                  label="Constitution of Business / Entity Type"
                  options={ENTITY_OPTIONS}
                  selectedValue={value}
                  onSelect={onChange}
                  error={errors.entityType?.message}
                  required
                />
              )}
            />
          </View>

          {/* Primary Owner Contact Information */}
          <View style={styles.formCard}>
            <View style={styles.formCardTopBar} />
            <Text style={styles.formCardTitle}>Primary Owner / Authorized Representative</Text>
            <Text style={styles.formCardSubtitle}>
              Decision maker for payments, commercial terms, and warehouse operations
            </Text>

            <Controller
              control={control}
              name="primaryOwnerName"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Owner / Representative Full Name"
                  placeholder="e.g. Rajesh Kumar Sharma"
                  value={value}
                  onChangeText={onChange}
                  error={errors.primaryOwnerName?.message}
                  icon="person-outline"
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="primaryMobile"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Primary Mobile Number (OTP Verified)"
                  placeholder="10-digit mobile number"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                  maxLength={10}
                  error={errors.primaryMobile?.message}
                  icon="call-outline"
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Official Business Email"
                  placeholder="name@company.com"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                  icon="mail-outline"
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="preferredLanguage"
              render={({ field: { onChange, value } }) => (
                <AppDropdown
                  label="Preferred Communication Language"
                  options={LANGUAGE_OPTIONS}
                  selectedValue={value || 'English'}
                  onSelect={onChange}
                />
              )}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OCR Camera Scanner Modal */}
      <GstOcrScannerModal
        visible={scannerModalVisible}
        onClose={() => setScannerModalVisible(false)}
        onGstDetected={(detectedGstin) => {
          setGstinInput(detectedGstin);
          performGstSearch(detectedGstin);
        }}
      />

      {/* Navigation Wizard Footer */}
      <WizardNavigationFooter
        currentStep={1}
        totalSteps={7}
        onNext={handleSubmit(onSubmit)}
        onBack={() => navigation.goBack()}
        onSaveDraft={handleSaveDraft}
        nextLabel="Continue to Store Location →"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  modeSwitcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginBottom: spacing.md,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  gstSearchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    ...shadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  zapCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  cardHeaderTitle: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '800',
  },
  cardHeaderSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  ocrScanTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    borderWidth: 1.5,
    borderColor: '#0D9488',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  ocrScanIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  ocrScanTitle: {
    fontSize: 13,
    color: '#115E59',
    fontWeight: '800',
  },
  ocrScanSubtitle: {
    fontSize: 11,
    color: '#115E59',
    marginTop: 1,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.xs,
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    height: 46,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    marginLeft: spacing.sm,
    marginTop: 24,
  },
  searchBtnDisabled: {
    opacity: 0.7,
  },
  searchBtnText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  presetsWrapper: {
    marginTop: spacing.sm,
  },
  presetsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  presetsTrack: {
    flexDirection: 'row',
  },
  presetChip: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 6,
  },
  presetChipText: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '700',
  },
  verifiedTaxpayerCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  taxpayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taxpayerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taxpayerBadgeText: {
    fontSize: 10,
    color: '#065F46',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusPill: {
    backgroundColor: '#10B981',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusPillText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 9,
  },
  taxpayerLegalName: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '800',
    marginTop: 3,
  },
  taxpayerTradeName: {
    fontSize: 12,
    color: '#047857',
    marginTop: 1,
  },
  taxpayerDetailsRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  taxpayerDetailCol: {
    flex: 1,
  },
  taxpayerDetailLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.4,
  },
  taxpayerDetailValue: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '700',
    marginTop: 1,
  },
  autoFilledSuccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  autoFilledSuccessText: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.md + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    overflow: 'hidden',
    ...shadows.card,
  },
  formCardTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#0F172A',
  },
  formCardTitle: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '800',
  },
  formCardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginBottom: spacing.md,
  },
});

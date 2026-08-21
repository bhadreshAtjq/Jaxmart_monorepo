// src/screens/onboarding/Step2StoreLocationScreen.tsx
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { step2Schema, Step2FormValues } from '../../schemas/sellerOnboardingSchema';
import { useSellerWizardStore } from '../../store/useSellerWizardStore';
import { useLocation } from '../../hooks/useLocation';
import { WizardStepHeader } from '../../components/wizard/WizardStepHeader';
import { WizardNavigationFooter } from '../../components/wizard/WizardNavigationFooter';
import { AppInput } from '../../components/common/AppInput';
import { ExpoCameraModal } from '../../components/camera/ExpoCameraModal';

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

interface Step2StoreLocationScreenProps {
  navigation: any;
}

export const Step2StoreLocationScreen: React.FC<Step2StoreLocationScreenProps> = ({ navigation }) => {
  const { step2, updateStep2, nextStep, prevStep, saveDraft, setStep } = useSellerWizardStore();
  const { getCurrentLocation, loading: locLoading } = useLocation();

  const [activeCameraSlot, setActiveCameraSlot] = useState<'storefront' | 'interior' | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: step2,
    mode: 'onBlur',
  });

  const storefrontPhoto = watch('storefrontPhoto');
  const storeInteriorPhoto = watch('storeInteriorPhoto');
  const latitude = watch('latitude');
  const longitude = watch('longitude');

  const handleFetchGps = async () => {
    const loc = await getCurrentLocation();
    if (loc) {
      setValue('latitude', loc.latitude, { shouldValidate: true });
      setValue('longitude', loc.longitude, { shouldValidate: true });
      setValue('locationAccuracy', loc.accuracy || 5);
      if (loc.street) setValue('streetArea', loc.street, { shouldValidate: true });
      if (loc.city) setValue('city', loc.city, { shouldValidate: true });
      if (loc.district) setValue('district', loc.district, { shouldValidate: true });
      if (loc.state) setValue('state', loc.state, { shouldValidate: true });
      if (loc.pincode) setValue('pincode', loc.pincode, { shouldValidate: true });
    }
  };

  const onSubmit = (data: Step2FormValues) => {
    updateStep2(data);
    nextStep();
    navigation.navigate('Step3IdentityKyc');
  };

  const handleSaveDraft = handleSubmit((data) => {
    updateStep2(data);
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
        currentStep={2}
        totalSteps={7}
        stepTitle="Store Geolocation & Address"
        stepSubtitle="High-accuracy GPS location lock & storefront photos"
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
          {/* GPS Auto-Fetch Box */}
          <View style={styles.gpsBannerCard}>
            <View style={styles.gpsIconCircle}>
              <Ionicons name="navigate" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginHorizontal: spacing.sm }}>
              <Text style={styles.gpsTitle}>Real-time GPS Coordinate Lock</Text>
              <Text style={styles.gpsCoordinates}>
                {latitude && longitude
                  ? `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`
                  : 'Coordinates pending lock'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.gpsFetchBtn}
              onPress={handleFetchGps}
              disabled={locLoading}
            >
              <Ionicons name="locate" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.gpsFetchBtnText}>{locLoading ? 'Locking...' : 'Auto-Fetch'}</Text>
            </TouchableOpacity>
          </View>

          <Controller
            control={control}
            name="buildingNoFloor"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Shop / Building Number, Unit & Floor"
                placeholder="e.g. Unit 4B, Ground Floor, Shanti Industrial Estate"
                value={value}
                onChangeText={onChange}
                error={errors.buildingNoFloor?.message}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="streetArea"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Street Name & Industrial Area"
                placeholder="e.g. Saki Naka Kurla Road"
                value={value}
                onChangeText={onChange}
                error={errors.streetArea?.message}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="landmark"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Prominent Landmark"
                placeholder="e.g. Opposite Metro Pillar 14"
                value={value}
                onChangeText={onChange}
                error={errors.landmark?.message}
                required
              />
            )}
          />

          <View style={styles.twoColumnRow}>
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="City / Town"
                  placeholder="e.g. Mumbai"
                  value={value}
                  onChangeText={onChange}
                  error={errors.city?.message}
                  containerStyle={{ flex: 1, marginRight: spacing.sm }}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="pincode"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Pincode (6-digit)"
                  placeholder="e.g. 400072"
                  value={value}
                  onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
                  error={errors.pincode?.message}
                  keyboardType="number-pad"
                  maxLength={6}
                  containerStyle={{ flex: 1 }}
                  required
                />
              )}
            />
          </View>

          <View style={styles.twoColumnRow}>
            <Controller
              control={control}
              name="district"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="District"
                  placeholder="e.g. Mumbai Suburban"
                  value={value}
                  onChangeText={onChange}
                  error={errors.district?.message}
                  containerStyle={{ flex: 1, marginRight: spacing.sm }}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="state"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="State"
                  placeholder="e.g. Maharashtra"
                  value={value}
                  onChangeText={onChange}
                  error={errors.state?.message}
                  containerStyle={{ flex: 1 }}
                  required
                />
              )}
            />
          </View>

          {/* Mandatory Photo Capture Cards */}
          <Text style={styles.photosSectionTitle}>Physical Store Verification Photos *</Text>
          <Text style={styles.photosSectionSubtitle}>Take live photographs outside and inside the merchant premise</Text>

          <View style={styles.photosRow}>
            {/* Storefront photo */}
            <View style={styles.photoBoxContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveCameraSlot('storefront')}
                style={[
                  styles.photoUploadBox,
                  Boolean(storefrontPhoto) && styles.photoUploadBoxFilled,
                  Boolean(errors.storefrontPhoto) && styles.photoUploadBoxError,
                ]}
              >
                {storefrontPhoto ? (
                  <Image source={{ uri: storefrontPhoto }} style={styles.uploadedPhoto} resizeMode="cover" />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="camera" size={28} color={colors.primary} />
                    <Text style={styles.photoPlaceholderText}>Capture Storefront (Board & Entrance)</Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.photoLabel}>
                Storefront Exterior <Text style={{ color: colors.error }}>*</Text>
              </Text>
              {errors.storefrontPhoto && (
                <Text style={styles.photoErrorText}>{errors.storefrontPhoto.message}</Text>
              )}
            </View>

            {/* Store interior photo */}
            <View style={styles.photoBoxContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveCameraSlot('interior')}
                style={[
                  styles.photoUploadBox,
                  Boolean(storeInteriorPhoto) && styles.photoUploadBoxFilled,
                  Boolean(errors.storeInteriorPhoto) && styles.photoUploadBoxError,
                ]}
              >
                {storeInteriorPhoto ? (
                  <Image source={{ uri: storeInteriorPhoto }} style={styles.uploadedPhoto} resizeMode="cover" />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="images" size={28} color={colors.primary} />
                    <Text style={styles.photoPlaceholderText}>Capture Store Interior / Stock Shelves</Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.photoLabel}>
                Store Interior / Stock <Text style={{ color: colors.error }}>*</Text>
              </Text>
              {errors.storeInteriorPhoto && (
                <Text style={styles.photoErrorText}>{errors.storeInteriorPhoto.message}</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <WizardNavigationFooter
        currentStep={2}
        totalSteps={7}
        onNext={handleSubmit(onSubmit)}
        onBack={() => {
          prevStep();
          navigation.goBack();
        }}
        onSaveDraft={handleSaveDraft}
      />

      {/* Camera Modal */}
      {activeCameraSlot && (
        <ExpoCameraModal
          visible={Boolean(activeCameraSlot)}
          onClose={() => setActiveCameraSlot(null)}
          onCapture={(uri) => {
            if (activeCameraSlot === 'storefront') {
              setValue('storefrontPhoto', uri, { shouldValidate: true });
            } else {
              setValue('storeInteriorPhoto', uri, { shouldValidate: true });
            }
            setActiveCameraSlot(null);
          }}
          title={activeCameraSlot === 'storefront' ? 'Storefront Photo' : 'Store Interior Photo'}
          subtitle={
            activeCameraSlot === 'storefront'
              ? 'Include shop name signboard & entrance'
              : 'Include shelves, warehouse racks, or retail floor'
          }
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
  gpsBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryFixed,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  gpsIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
  gpsCoordinates: {
    ...typography.monoSm,
    color: colors.primaryDark,
    fontSize: 11,
    marginTop: 2,
  },
  gpsFetchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  gpsFetchBtnText: {
    ...typography.labelCaps,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  twoColumnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photosSectionTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  photosSectionSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  photosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  photoBoxContainer: {
    width: '48.5%',
  },
  photoUploadBox: {
    width: '100%',
    height: 140,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoUploadBoxFilled: {
    borderStyle: 'solid',
    borderColor: colors.secondary,
  },
  photoUploadBoxError: {
    borderColor: colors.error,
  },
  uploadedPhoto: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  photoPlaceholderText: {
    ...typography.labelCaps,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontSize: 10,
  },
  photoLabel: {
    ...typography.labelMd,
    color: colors.primaryDark,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  photoErrorText: {
    ...typography.bodySm,
    color: colors.error,
    fontSize: 11,
    marginTop: 2,
  },
});

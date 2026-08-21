// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { phoneSchema, PhoneFormValues } from '../../schemas/authSchema';
import { useAuthStore } from '../../store/useAuthStore';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { showM3Alert } from '../../store/useAlertStore';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { sendOtp } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
    mode: 'onBlur',
  });

  const onSubmit = async (data: PhoneFormValues) => {
    try {
      setLoading(true);
      await sendOtp(data.phone);
      setLoading(false);
      navigation.navigate('OtpVerification', { phone: data.phone });
    } catch (e: any) {
      setLoading(false);
      showM3Alert('Login Error', e.message || 'Failed to send verification code', undefined, 'error');
    }
  };

  const handleQuickDemo = (demoPhone: string) => {
    setValue('phone', demoPhone);
    onSubmit({ phone: demoPhone });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Brand Hero */}
          <View style={styles.heroSection}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View style={styles.captainPill}>
              <Text style={styles.captainPillText}>CAPTAINS FIELD OPERATIONS</Text>
            </View>
            <Text style={styles.heroSubtitle}>
              On-ground seller onboarding, live KYC verification, and warehouse SKU cataloging platform
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Captain Sign In</Text>
            <Text style={styles.formSubtitle}>
              Enter your registered mobile number to receive a 6-digit verification code
            </Text>

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Registered Mobile Number"
                  placeholder="10-digit mobile"
                  value={value}
                  onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
                  error={errors.phone?.message}
                  prefix="+91 "
                  icon="call-outline"
                  keyboardType="phone-pad"
                  maxLength={10}
                  required
                />
              )}
            />

            <AppButton
              title={loading ? 'Sending OTP...' : 'Send Verification Code'}
              variant="primary"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
              style={{ marginTop: spacing.sm }}
            />

            {/* Quick Demo Login Preset */}
            <View style={styles.demoSection}>
              <Text style={styles.demoLabel}>Demo Field Accounts (Quick Fill):</Text>
              <View style={styles.demoChipsRow}>
                <TouchableOpacity
                  style={styles.demoChip}
                  onPress={() => handleQuickDemo('9820198201')}
                >
                  <Text style={styles.demoChipText}>Arjun Sharma (Lead Captain)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.demoChip}
                  onPress={() => handleQuickDemo('9820198202')}
                >
                  <Text style={styles.demoChipText}>Pooja Patel (BA)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Security Footer Notice */}
          <View style={styles.securityFooter}>
            <Ionicons name="lock-closed" size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={styles.securityText}>
              256-Bit Encrypted Corporate Gateway · Authorized Personnel Only
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  logoImage: {
    width: 200,
    height: 55,
    marginBottom: spacing.sm,
  },
  captainPill: {
    backgroundColor: colors.secondary,
    paddingVertical: 3,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  captainPillText: {
    ...typography.labelCaps,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 1,
    fontSize: 10,
  },
  heroSubtitle: {
    ...typography.bodySm,
    color: colors.primaryFixedDim,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.modal,
  },
  formTitle: {
    ...typography.headlineMd,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  formSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  demoSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  demoLabel: {
    ...typography.labelCaps,
    color: colors.textSecondary,
    fontSize: 10,
    marginBottom: spacing.xs,
  },
  demoChipsRow: {
    flexDirection: 'column',
  },
  demoChip: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  demoChipText: {
    ...typography.bodySm,
    color: colors.primaryDark,
    fontWeight: '600',
    fontSize: 12,
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  securityText: {
    ...typography.bodySm,
    color: colors.primaryFixedDim,
    fontSize: 11,
  },
});

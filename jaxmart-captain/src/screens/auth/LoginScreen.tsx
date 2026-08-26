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
          {/* Top Brand Header */}
          <View style={styles.heroSection}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            
            <View style={styles.captainPill}>
              <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" style={{ marginRight: 5 }} />
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
              title={loading ? 'Sending Code...' : 'Send Verification Code'}
              variant="primary"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
              icon="arrow-forward-outline"
              iconPosition="right"
              style={{ marginTop: spacing.xs }}
            />
          </View>

          {/* Security Footer Notice */}
          <View style={styles.securityFooter}>
            <Ionicons name="lock-closed" size={14} color={colors.primaryFixedDim} style={{ marginRight: 6 }} />
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  logoImage: {
    width: 190,
    height: 50,
    marginBottom: spacing.xs,
  },
  captainPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  captainPillText: {
    ...typography.labelCaps,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.8,
    fontSize: 10,
  },
  heroSubtitle: {
    ...typography.bodySm,
    color: colors.primaryFixedDim,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 310,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.modal,
  },
  formTitle: {
    ...typography.headlineMd,
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 22,
  },
  formSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  securityText: {
    ...typography.bodySm,
    color: colors.primaryFixedDim,
    fontSize: 11,
    textAlign: 'center',
  },
});

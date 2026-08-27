// src/screens/auth/OtpVerificationScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { AppButton } from '../../components/common/AppButton';
import { showM3Alert } from '../../store/useAlertStore';

interface OtpVerificationScreenProps {
  route: any;
  navigation: any;
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({ route, navigation }) => {
  const phone = route.params?.phone || '9820198201';
  const { verifyOtp, sendOtp } = useAuthStore();

  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    let interval: any = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    const newOtp = [...otpValues];

    if (cleaned.length > 1) {
      // Pasted full OTP
      const digits = cleaned.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || '';
      }
      setOtpValues(newOtp);
      inputRefs.current[Math.min(digits.length, 5)]?.focus();
      return;
    }

    newOtp[index] = cleaned;
    setOtpValues(newOtp);

    // Auto move to next box
    if (cleaned.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullOtp = otpValues.join('');
    if (fullOtp.length < 6) {
      showM3Alert('Incomplete OTP', 'Please enter all 6 digits of your verification code.', undefined, 'warning');
      return;
    }

    try {
      setLoading(true);
      await verifyOtp(phone, fullOtp);
      setLoading(false);
    } catch (e: any) {
      setLoading(false);
      showM3Alert('Verification Failed', e.message || 'Invalid verification code.', undefined, 'error');
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await sendOtp(phone);
      setTimer(30);
      showM3Alert('Code Resent', `A new 6-digit OTP has been dispatched to +91 ${phone}`, undefined, 'success');
    } catch (e: any) {
      showM3Alert('Resend Error', e.message || 'Failed to resend OTP', undefined, 'error');
    }
  };

  const handleAutoFillDemo = () => {
    setOtpValues(['1', '2', '3', '4', '5', '6']);
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
          {/* Header */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.heroSection}>
            <View style={styles.iconCircle}>
              <Ionicons name="keypad-outline" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Enter 6-Digit OTP</Text>
            <Text style={styles.subtitle}>
              Verification code sent via SMS to <Text style={styles.phoneHighlight}>+91 {phone}</Text>
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* 6 OTP Input Boxes */}
            <View style={styles.otpInputsRow}>
              {otpValues.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpBox,
                    Boolean(digit) && styles.otpBoxFilled,
                    focusedIndex === index && styles.otpBoxFocused,
                  ]}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(-1)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  textAlign="center"
                />
              ))}
            </View>

            <AppButton
              title={loading ? 'Verifying...' : 'Verify & Clock In'}
              variant="secondary"
              onPress={handleVerify}
              loading={loading}
              fullWidth
              style={{ marginTop: spacing.md }}
            />

            {/* Resend Timer */}
            <View style={styles.resendRow}>
              <Text style={styles.resendLabel}>Didn't receive code? </Text>
              <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
                <Text style={[styles.resendLink, timer > 0 && styles.resendLinkDisabled]}>
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Demo Quick Fill */}
            <TouchableOpacity style={styles.demoFillBtn} onPress={handleAutoFillDemo}>
              <Ionicons name="flash" size={16} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.demoFillBtnText}>Auto-Fill Demo Code (123456)</Text>
            </TouchableOpacity>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headlineLg,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.primaryFixedDim,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  phoneHighlight: {
    fontWeight: '700',
    color: colors.secondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.modal,
  },
  otpInputsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.lg,
    width: '100%',
  },
  otpBox: {
    flex: 1,
    maxWidth: 44,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    fontSize: 20,
    fontWeight: '800',
    color: colors.primaryDark,
    textAlign: 'center',
    padding: 0,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  otpBoxFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.surface,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  resendLabel: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  resendLink: {
    ...typography.bodySm,
    color: colors.primary,
    fontWeight: '700',
  },
  resendLinkDisabled: {
    color: colors.textPlaceholder,
  },
  demoFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryFixed,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  demoFillBtnText: {
    ...typography.labelMd,
    color: colors.primaryDark,
    fontWeight: '700',
  },
});

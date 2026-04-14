// lib/screens/auth/otp_screen.dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pinput/pinput.dart';
import '../../providers/auth_provider.dart';
import '../../utils/constants.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_snackbar.dart';

class OtpScreen extends ConsumerStatefulWidget {
  final String phone;
  const OtpScreen({super.key, required this.phone});

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final _otpController = TextEditingController();
  int _resendSeconds = 30;
  Timer? _timer;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _sendOtp();
    _startTimer();
  }

  void _startTimer() {
    setState(() => _resendSeconds = 30);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_resendSeconds == 0) { t.cancel(); return; }
      setState(() => _resendSeconds--);
    });
  }

  Future<void> _sendOtp() async {
    await ref.read(authStateProvider.notifier).sendOtp(widget.phone);
  }

  Future<void> _verify() async {
    if (_otpController.text.length != 6) {
      AppSnackbar.show(context, 'Enter the 6-digit OTP', isError: true);
      return;
    }
    setState(() => _isLoading = true);
    try {
      final isNew = await ref.read(authStateProvider.notifier).verifyOtp(
        phone: widget.phone,
        otp: _otpController.text,
      );
      if (!mounted) return;
      if (isNew) {
        context.go('/auth/profile-setup');
      } else {
        context.go('/home');
      }
    } catch (e) {
      if (mounted) AppSnackbar.show(context, 'Invalid OTP. Please try again.', isError: true);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() { _timer?.cancel(); _otpController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final defaultPinTheme = PinTheme(
      width: 52, height: 56,
      textStyle: AppTextStyles.h3.copyWith(color: AppColors.primary),
      decoration: BoxDecoration(
        color: AppColors.gray50,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.gray200),
      ),
    );

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: const Text('Verify OTP')),
      body: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: AppSpacing.lg),
            const Text('Enter OTP', style: AppTextStyles.h2),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'We\'ve sent a 6-digit code to +91 ${widget.phone}',
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: AppSpacing.xl),
            Pinput(
              controller: _otpController,
              length: 6,
              defaultPinTheme: defaultPinTheme,
              focusedPinTheme: defaultPinTheme.copyDecorationWith(
                border: Border.all(color: AppColors.primary, width: 2),
                color: AppColors.primarySurface,
              ),
              onCompleted: (_) => _verify(),
            ),
            const SizedBox(height: AppSpacing.lg),
            Row(
              children: [
                Text(
                  _resendSeconds > 0 ? 'Resend OTP in ${_resendSeconds}s' : 'Didn\'t receive it?',
                  style: AppTextStyles.bodySmall,
                ),
                if (_resendSeconds == 0) ...[
                  const SizedBox(width: AppSpacing.sm),
                  GestureDetector(
                    onTap: () { _sendOtp(); _startTimer(); },
                    child: const Text('Resend', style: TextStyle(fontFamily: 'Inter', color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: 14)),
                  ),
                ],
              ],
            ),
            const Spacer(),
            AppButton(label: 'Verify & Continue', onPressed: _verify, isLoading: _isLoading),
            const SizedBox(height: AppSpacing.lg),
          ],
        ),
      ),
    );
  }
}

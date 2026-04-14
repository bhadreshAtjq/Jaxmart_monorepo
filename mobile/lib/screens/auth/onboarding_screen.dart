// lib/screens/auth/onboarding_screen.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../utils/constants.dart';
import '../../widgets/app_button.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});
  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _phoneController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() { _phoneController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Spacer(),
              Container(
                width: 56, height: 56,
                decoration: BoxDecoration(color: AppColors.primarySurface, borderRadius: BorderRadius.circular(14)),
                child: const Icon(Icons.store_rounded, color: AppColors.primary, size: 30),
              ),
              const SizedBox(height: AppSpacing.lg),
              const Text('India\'s trusted\nB2B marketplace', style: AppTextStyles.h1),
              const SizedBox(height: AppSpacing.sm),
              const Text('Discover products, hire services,\nand transact safely with escrow protection.', style: AppTextStyles.bodyLarge),
              const Spacer(),
              Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Mobile number', style: AppTextStyles.h5),
                    const SizedBox(height: AppSpacing.sm),
                    TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      maxLength: 10,
                      decoration: const InputDecoration(
                        hintText: '9876543210',
                        prefixText: '+91  ',
                        counterText: '',
                      ),
                      validator: (v) {
                        if (v == null || v.length != 10) return 'Enter a valid 10-digit number';
                        if (!RegExp(r'^[6-9]\d{9}$').hasMatch(v)) return 'Invalid mobile number';
                        return null;
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppButton(
                      label: 'Get OTP',
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {
                          context.push('/auth/otp?phone=${_phoneController.text}');
                        }
                      },
                      icon: Icons.arrow_forward_rounded,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Center(
                      child: Text(
                        'By continuing, you agree to our Terms & Privacy Policy',
                        style: AppTextStyles.caption,
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
    );
  }
}

import 'dart:async';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl_phone_field/intl_phone_field.dart';
import 'package:pinput/pinput.dart';

import '../core/api_client.dart';
import '../core/auth_cubit.dart';
import '../core/resource_cubit.dart';
import '../data/json_tools.dart';
import '../design/design_system.dart';
import '../ui/widgets.dart';

JaxApiClient apiOf(BuildContext context) => context.read<JaxApiClient>();

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthCubit, AuthState>(
      listener: (context, state) {
        if (state.status == AuthStatus.authenticated) context.go('/home');
        if (state.status == AuthStatus.guest) context.go('/auth/login');
      },
      child: Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const AppLogo(height: 58, style: AppLogoStyle.color),
              const SizedBox(height: 24),
              const CircularProgressIndicator(color: JaxColors.primary),
            ],
          ),
        ),
      ),
    );
  }
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  String _countryCode = '91';

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  void _sendOtp() {
    final phoneVal = _phoneController.text.trim();
    if (phoneVal.isEmpty || phoneVal.length < 7) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid mobile number')),
      );
      return;
    }
    final fullNumber = '+$_countryCode$phoneVal';
    context.read<AuthCubit>().sendOtp(fullNumber);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF090B11),
      body: Stack(
        children: [
          // Background Gradient Mesh for premium look
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: JaxColors.primary.withValues(alpha: 0.15),
              ),
            ),
          ),
          Positioned(
            bottom: -50,
            left: -50,
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: JaxColors.secondary.withValues(alpha: 0.1),
              ),
            ),
          ),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 24),
                  // Centered Header Brand Logo
                  const Center(
                    child: AppLogo(
                      height: 44,
                      style: AppLogoStyle.white,
                    ),
                  ),
                  const SizedBox(height: 36),

                  // B2B Market Showcase
                  const Text(
                    "India's trusted\nB2B marketplace",
                    style: TextStyle(
                      fontFamily: JaxText.heading,
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    "Source products, hire verified suppliers, and transact safely with escrow protection.",
                    style: TextStyle(
                      fontFamily: JaxText.body,
                      fontSize: 14,
                      color: Colors.white70,
                      height: 1.45,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Showcase Features List
                  ...[
                    {
                      'title': 'GST Verified Sellers',
                      'desc': 'Every supplier on JaxMart is identity-verified.'
                    },
                    {
                      'title': 'Escrow Protection',
                      'desc':
                          'Payments released only after delivery confirmation.'
                    },
                    {
                      'title': 'AI-Powered Matching',
                      'desc':
                          'Get the best quotes from relevant suppliers instantly.'
                    },
                  ].map((item) => Padding(
                        padding: const EdgeInsets.only(bottom: 14),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              margin: const EdgeInsets.only(top: 5),
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                color: JaxColors.secondary,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item['title']!,
                                    style: const TextStyle(
                                      fontFamily: JaxText.heading,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                      color: const Color(0xFFEEEEEE),
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    item['desc']!,
                                    style: const TextStyle(
                                      fontFamily: JaxText.body,
                                      fontSize: 11,
                                      color: Colors.white54,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      )),

                  const SizedBox(height: 32),

                  // Login White Card
                  BlocConsumer<AuthCubit, AuthState>(
                    listener: (context, state) {
                      if (state.message == 'OTP sent' && state.phone != null) {
                        final currentUri = GoRouterState.of(context).uri;
                        final redirect = currentUri.queryParameters['redirect'];
                        final type = currentUri.queryParameters['type'];

                        final queryParams = <String, String>{
                          'phone': state.phone!,
                          if (redirect != null) 'redirect': redirect,
                          if (type != null) 'type': type,
                        };
                        final uri = Uri(
                            path: '/auth/otp', queryParameters: queryParams);
                        context.push(uri.toString());
                      }
                      if (state.status == AuthStatus.failure &&
                          state.message != null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(state.message!)),
                        );
                      }
                    },
                    builder: (context, state) {
                      return Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: const [
                            BoxShadow(
                              color: Colors.black26,
                              blurRadius: 20,
                              offset: Offset(0, 8),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              "Sign in or create account",
                              style: TextStyle(
                                fontFamily: JaxText.heading,
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: JaxColors.onSurface,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              "Enter your mobile number to continue",
                              style: JaxText.bodySmall
                                  .copyWith(color: Colors.grey.shade500),
                            ),
                            const SizedBox(height: 24),

                            // Phone Number Field
                            const FieldLabel('Mobile number'),
                            IntlPhoneField(
                              controller: _phoneController,
                              decoration: InputDecoration(
                                hintText: 'Phone number',
                                fillColor: const Color(0xFFF6F8FB),
                                filled: true,
                                contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 16),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: const BorderSide(
                                      color: Color(0xFFE5E7EB)),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: const BorderSide(
                                      color: JaxColors.primary, width: 1.5),
                                ),
                              ),
                              initialCountryCode: 'IN',
                              style: JaxText.bodyMedium.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: JaxColors.onSurface),
                              dropdownTextStyle: JaxText.bodyMedium.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: JaxColors.onSurface),
                              onCountryChanged: (country) {
                                _countryCode = country.dialCode;
                              },
                              onSubmitted: (_) => _sendOtp(),
                            ),
                            const SizedBox(height: 12),

                            // Submit Button
                            InkWell(
                              onTap: state.status == AuthStatus.loading
                                  ? null
                                  : _sendOtp,
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                width: double.infinity,
                                padding:
                                    const EdgeInsets.symmetric(vertical: 14),
                                decoration: BoxDecoration(
                                  gradient: JaxGradients.primary,
                                  borderRadius: BorderRadius.circular(12),
                                  boxShadow: [
                                    BoxShadow(
                                      color: JaxColors.primary
                                          .withValues(alpha: .3),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                alignment: Alignment.center,
                                child: state.status == AuthStatus.loading
                                    ? const SizedBox(
                                        height: 20,
                                        width: 20,
                                        child: CircularProgressIndicator(
                                          color: Colors.white,
                                          strokeWidth: 2,
                                        ),
                                      )
                                    : const Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Text(
                                            'GET OTP',
                                            style: TextStyle(
                                              fontFamily: JaxText.heading,
                                              fontSize: 13,
                                              fontWeight: FontWeight.w700,
                                              color: Colors.white,
                                              letterSpacing: 1,
                                            ),
                                          ),
                                          SizedBox(width: 8),
                                          Icon(
                                            Icons.arrow_forward_rounded,
                                            color: Colors.white,
                                            size: 16,
                                          ),
                                        ],
                                      ),
                              ),
                            ),
                            const SizedBox(height: 16),
                            Center(
                              child: Text(
                                "By continuing, you agree to our Terms of Service and Privacy Policy",
                                textAlign: TextAlign.center,
                                style: JaxText.bodySmall.copyWith(
                                    color: Colors.grey.shade400, fontSize: 10),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),

                  const SizedBox(height: 28),

                  // Footer badges
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.lock_outline_rounded,
                          color: Colors.white38, size: 12),
                      const SizedBox(width: 4),
                      Text("Secure login",
                          style: JaxText.bodySmall
                              .copyWith(color: Colors.white38, fontSize: 11)),
                      const SizedBox(width: 16),
                      const Icon(Icons.verified_outlined,
                          color: Colors.white38, size: 12),
                      const SizedBox(width: 4),
                      Text("GST verified",
                          style: JaxText.bodySmall
                              .copyWith(color: Colors.white38, fontSize: 11)),
                      const SizedBox(width: 16),
                      const Icon(Icons.shield_outlined,
                          color: Colors.white38, size: 12),
                      const SizedBox(width: 4),
                      Text("Escrow protected",
                          style: JaxText.bodySmall
                              .copyWith(color: Colors.white38, fontSize: 11)),
                    ],
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class OtpScreen extends StatefulWidget {
  const OtpScreen(
      {required this.phone, this.fullName, this.userType, super.key});
  final String phone;
  final String? fullName;
  final String? userType;

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _pinController = TextEditingController();
  int _countdown = 30;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _countdown = 30;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_countdown == 0) {
        timer.cancel();
      } else {
        setState(() {
          _countdown--;
        });
      }
    });
  }

  @override
  void dispose() {
    _pinController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _verify(String pin) {
    context.read<AuthCubit>().verifyOtp(
          phone: widget.phone,
          otp: pin,
          fullName: widget.fullName,
          userType: widget.userType,
        );
  }

  @override
  Widget build(BuildContext context) {
    final defaultPinTheme = PinTheme(
      width: 46,
      height: 52,
      textStyle: JaxText.h2.copyWith(
          color: JaxColors.onSurface,
          fontSize: 20,
          fontWeight: FontWeight.bold),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
    );

    final focusedPinTheme = defaultPinTheme.copyWith(
      decoration: defaultPinTheme.decoration!.copyWith(
        border: Border.all(color: JaxColors.primary, width: 1.5),
      ),
    );

    return Scaffold(
      backgroundColor: JaxColors.surface,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: BlocConsumer<AuthCubit, AuthState>(
            listener: (context, state) {
              if (state.isLoggedIn) {
                final currentUri = GoRouterState.of(context).uri;
                final redirect = currentUri.queryParameters['redirect'];
                context.go(redirect != null && redirect.isNotEmpty
                    ? redirect
                    : '/home');
              }
              if (state.status == AuthStatus.failure && state.message != null) {
                ScaffoldMessenger.of(context)
                    .showSnackBar(SnackBar(content: Text(state.message!)));
                _pinController.clear();
              }
            },
            builder: (context, state) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 16),

                  // Link back to change number
                  TextButton.icon(
                    onPressed: () => context.pop(),
                    icon: const Icon(Icons.arrow_back_rounded,
                        size: 16, color: JaxColors.primary),
                    label: const Text(
                      'Change number',
                      style: TextStyle(
                        fontFamily: JaxText.heading,
                        color: JaxColors.primary,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    style: TextButton.styleFrom(
                      padding: EdgeInsets.zero,
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                  ),
                  const SizedBox(height: 36),

                  const Text(
                    "Enter verification code",
                    style: TextStyle(
                      fontFamily: JaxText.heading,
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: JaxColors.onSurface,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    "Sent to +${widget.phone}",
                    style: JaxText.bodyMedium
                        .copyWith(color: Colors.grey.shade500),
                  ),
                  const SizedBox(height: 32),

                  // Styled Pinput OTP view
                  Center(
                    child: Pinput(
                      length: 6,
                      controller: _pinController,
                      autofocus: true,
                      defaultPinTheme: defaultPinTheme,
                      focusedPinTheme: focusedPinTheme,
                      onCompleted: _verify,
                    ),
                  ),
                  const SizedBox(height: 32),

                  if (state.status == AuthStatus.loading)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.only(bottom: 24),
                        child:
                            CircularProgressIndicator(color: JaxColors.primary),
                      ),
                    ),

                  // Resend countdown
                  Center(
                    child: _countdown > 0
                        ? Text(
                            'Resend in ${_countdown}s',
                            style: JaxText.bodyMedium.copyWith(
                                color: Colors.grey.shade400,
                                fontWeight: FontWeight.bold),
                          )
                        : TextButton(
                            onPressed: () {
                              context.read<AuthCubit>().sendOtp(widget.phone);
                              _startTimer();
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                    content: Text('OTP resent successfully')),
                              );
                            },
                            child: const Text(
                              'Resend OTP',
                              style: TextStyle(
                                fontFamily: JaxText.heading,
                                color: JaxColors.primary,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                          ),
                  ),
                  const SizedBox(height: 24),

                  // Verification button fallback
                  JaxButton(
                    label: 'Verify and continue',
                    fullWidth: true,
                    loading: state.status == AuthStatus.loading,
                    icon: Icons.verified_rounded,
                    onPressed: () => _verify(_pinController.text),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class SetupScreen extends StatefulWidget {
  const SetupScreen({super.key});

  @override
  State<SetupScreen> createState() => _SetupScreenState();
}

class _SetupScreenState extends State<SetupScreen> {
  int _step = 1;
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _businessNameController = TextEditingController();
  final _gstController = TextEditingController();
  final _establishedYearController = TextEditingController();
  String _accountType = 'INDIVIDUAL'; // INDIVIDUAL | BUSINESS
  String _userType = 'BUYER'; // BUYER | SELLER | BOTH
  String _employeeRange =
      'ELEVEN_TO_FIFTY'; // ONE_TO_TEN | ELEVEN_TO_FIFTY | FIFTY_ONE_TO_TWO_HUNDRED | TWO_HUNDRED_PLUS

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _businessNameController.dispose();
    _gstController.dispose();
    _establishedYearController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_step == 1) {
      final name = _fullNameController.text.trim();
      final email = _emailController.text.trim();
      if (name.isEmpty || name == 'New User') {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enter your valid Full Name')),
        );
        return;
      }
      if (email.isEmpty || !email.contains('@')) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enter a valid email address')),
        );
        return;
      }
      setState(() => _step = 2);
    } else if (_step == 2) {
      setState(() => _step = 3);
    } else if (_step == 3) {
      final isBusinessSetupRequired = _accountType == 'BUSINESS' ||
          _userType == 'SELLER' ||
          _userType == 'BOTH';
      if (isBusinessSetupRequired &&
          _businessNameController.text.trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Business Legal Name is required')),
        );
        return;
      }
      setState(() => _step = 4);
    }
  }

  void _prevStep() {
    if (_step > 1) {
      setState(() => _step--);
    }
  }

  bool get _isBusinessSetupRequired =>
      _accountType == 'BUSINESS' ||
      _userType == 'SELLER' ||
      _userType == 'BOTH';

  String _formatWorkforceSummary(String range) {
    switch (range) {
      case 'ONE_TO_TEN':
        return '1-10 Employees';
      case 'ELEVEN_TO_FIFTY':
        return '11-50 Employees';
      case 'FIFTY_ONE_TO_TWO_HUNDRED':
        return '51-200 Employees';
      case 'TWO_HUNDRED_PLUS':
        return '200+ Employees';
      default:
        return range.replaceAll('_', ' ');
    }
  }

  void _submit() async {
    final payload = {
      'fullName': _fullNameController.text.trim(),
      'email': _emailController.text.trim(),
      'accountType': _accountType,
      'userType': _userType,
      if (_isBusinessSetupRequired) ...{
        'businessName': _businessNameController.text.trim(),
        if (_gstController.text.trim().isNotEmpty)
          'gstNumber': _gstController.text.trim().toUpperCase(),
        if (_establishedYearController.text.trim().isNotEmpty)
          'establishedYear': _establishedYearController.text.trim(),
        'employeeRange': _employeeRange,
      }
    };

    try {
      await context.read<AuthCubit>().updateProfile(payload);
    } catch (_) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Failed to complete profile registration')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body: SafeArea(
        child: BlocConsumer<AuthCubit, AuthState>(
          listener: (context, state) {
            if (state.status == AuthStatus.failure && state.message != null) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.message!)),
              );
            }
          },
          builder: (context, state) {
            final loading = state.status == AuthStatus.loading;

            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 12),
                  // Header branding
                  Center(
                    child: Column(
                      children: [
                        Container(
                          height: 56,
                          width: 56,
                          decoration: BoxDecoration(
                            color: JaxColors.primaryContainer,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: const [
                              BoxShadow(
                                  color: Colors.black12,
                                  blurRadius: 10,
                                  offset: Offset(0, 4)),
                            ],
                          ),
                          alignment: Alignment.center,
                          child: const Icon(Icons.shield_rounded,
                              color: JaxColors.secondary, size: 28),
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'ONBOARDING REGISTRY',
                          style: TextStyle(
                            fontFamily: JaxText.heading,
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: JaxColors.onSurface,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'COMPLETE YOUR CORPORATE PROFILE CREDENTIALS',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontFamily: JaxText.heading,
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
                            color: Colors.grey,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Step indicator progress bar
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'PROGRESS STATUS',
                        style: TextStyle(
                            fontFamily: JaxText.heading,
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
                            color: Colors.grey,
                            letterSpacing: 1.5),
                      ),
                      Text(
                        'STEP $_step OF 4',
                        style: TextStyle(
                            fontFamily: JaxText.heading,
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
                            color: Colors.grey.shade700,
                            letterSpacing: 1.5),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Container(
                    height: 6,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade200,
                      borderRadius: BorderRadius.circular(3),
                    ),
                    alignment: Alignment.centerLeft,
                    child: FractionallySizedBox(
                      widthFactor: _step / 4.0,
                      child: Container(
                        decoration: BoxDecoration(
                          color: JaxColors.secondary,
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Form Container Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.grey.shade200),
                      boxShadow: [
                        BoxShadow(
                            color: Colors.black.withValues(alpha: .015),
                            blurRadius: 15,
                            offset: const Offset(0, 5)),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (_step == 1) _buildStep1(),
                        if (_step == 2) _buildStep2(),
                        if (_step == 3) _buildStep3(),
                        if (_step == 4) _buildStep4(),

                        const SizedBox(height: 24),
                        const Divider(height: 1, color: Color(0xFFEEEEEE)),
                        const SizedBox(height: 20),

                        // Form Actions navigation
                        Row(
                          children: [
                            if (_step > 1)
                              OutlinedButton.icon(
                                onPressed: loading ? null : _prevStep,
                                icon: const Icon(Icons.arrow_back_rounded,
                                    size: 16),
                                label: const Text('BACK',
                                    style: TextStyle(
                                        fontFamily: JaxText.heading,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        letterSpacing: 1)),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.grey.shade700,
                                  side: BorderSide(color: Colors.grey.shade300),
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10)),
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 16, vertical: 12),
                                ),
                              ),
                            const Spacer(),
                            if (_step < 4)
                              ElevatedButton.icon(
                                onPressed: _nextStep,
                                icon: const Icon(Icons.arrow_forward_rounded,
                                    size: 16),
                                label: const Text('NEXT STEP',
                                    style: TextStyle(
                                        fontFamily: JaxText.heading,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        letterSpacing: 1)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: JaxColors.primaryContainer,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10)),
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 20, vertical: 12),
                                ),
                              )
                            else
                              ElevatedButton.icon(
                                onPressed: loading ? null : _submit,
                                icon: loading
                                    ? const SizedBox(
                                        height: 16,
                                        width: 16,
                                        child: CircularProgressIndicator(
                                            color: Colors.white,
                                            strokeWidth: 2),
                                      )
                                    : const Icon(Icons.check_circle_rounded,
                                        size: 16),
                                label: const Text('CONFIRM REGISTRY',
                                    style: TextStyle(
                                        fontFamily: JaxText.heading,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        letterSpacing: 1)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: JaxColors.secondary,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10)),
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 20, vertical: 14),
                                  elevation: 0,
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '1. Profile Credentials',
          style: TextStyle(
              fontFamily: JaxText.heading,
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: JaxColors.onSurface),
        ),
        const SizedBox(height: 2),
        Text(
          'Specify your name and corporate communication email.',
          style: JaxText.bodySmall.copyWith(color: Colors.grey.shade500),
        ),
        const SizedBox(height: 20),
        const FieldLabel('Full Name'),
        TextField(
          controller: _fullNameController,
          decoration: const InputDecoration(
            hintText: 'Enter full name',
            prefixIcon: Icon(Icons.person_outline_rounded, size: 20),
          ),
          textCapitalization: TextCapitalization.words,
        ),
        const SizedBox(height: 16),
        const FieldLabel('Email Address'),
        TextField(
          controller: _emailController,
          decoration: const InputDecoration(
            hintText: 'name@company.com',
            prefixIcon: Icon(Icons.email_outlined, size: 20),
          ),
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 24),
        const FieldLabel('Company Legal Type'),
        const SizedBox(height: 4),
        Row(
          children: [
            Expanded(
                child: _buildAccountTypeCard(
                    'INDIVIDUAL',
                    'Individual / Proprietorship',
                    Icons.person_rounded,
                    'For sole proprietors, freelancers, or personal buyers')),
            const SizedBox(width: 12),
            Expanded(
                child: _buildAccountTypeCard(
                    'BUSINESS',
                    'Registered Firm',
                    Icons.business_rounded,
                    'For Pvt Ltd, LLC, or GST registered firms')),
          ],
        ),
      ],
    );
  }

  Widget _buildAccountTypeCard(
      String type, String title, IconData icon, String desc) {
    final isSelected = _accountType == type;
    return InkWell(
      onTap: () => setState(() => _accountType = type),
      borderRadius: BorderRadius.circular(14),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
        decoration: BoxDecoration(
          color: isSelected
              ? JaxColors.secondary.withValues(alpha: .03)
              : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? JaxColors.secondary : Colors.grey.shade200,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon,
                color: isSelected ? JaxColors.secondary : Colors.grey.shade300,
                size: 22),
            const SizedBox(height: 10),
            Text(
              title,
              style: TextStyle(
                  fontFamily: JaxText.heading,
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  color:
                      isSelected ? JaxColors.onSurface : Colors.grey.shade700),
            ),
            const SizedBox(height: 4),
            Text(
              desc,
              style: TextStyle(
                  fontFamily: JaxText.body,
                  fontSize: 9,
                  color: Colors.grey.shade500,
                  height: 1.35),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep2() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '2. Marketplace Role Designation',
          style: TextStyle(
              fontFamily: JaxText.heading,
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: JaxColors.onSurface),
        ),
        const SizedBox(height: 2),
        Text(
          'Designate how you will participate in the wholesale catalog.',
          style: JaxText.bodySmall.copyWith(color: Colors.grey.shade500),
        ),
        const SizedBox(height: 20),
        _buildRoleCard(
            'BUYER',
            'Source & Purchase (Buyer)',
            Icons.shopping_bag_rounded,
            'Post custom sourcing RFQs, search products, compare supplier bids, and execute secure Escrow orders.'),
        const SizedBox(height: 12),
        _buildRoleCard(
            'SELLER',
            'Supply & Merchant (Seller)',
            Icons.storefront_rounded,
            'Create product/service listings, setup tiered delivery packages, receive and bid on buyer RFQ requests.'),
        const SizedBox(height: 12),
        _buildRoleCard(
            'BOTH',
            'Dual Trading (Buyer & Seller)',
            Icons.swap_horiz_rounded,
            'Full capability to both request corporate custom quotes and list wholesale supply inventories.'),
      ],
    );
  }

  Widget _buildRoleCard(String type, String title, IconData icon, String desc) {
    final isSelected = _userType == type;
    return InkWell(
      onTap: () => setState(() => _userType = type),
      borderRadius: BorderRadius.circular(14),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected
              ? JaxColors.secondary.withValues(alpha: .03)
              : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? JaxColors.secondary : Colors.grey.shade200,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 42,
              width: 42,
              decoration: BoxDecoration(
                color: isSelected
                    ? JaxColors.secondary.withValues(alpha: .12)
                    : Colors.grey.shade50,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                    color: isSelected
                        ? JaxColors.secondary.withValues(alpha: .2)
                        : Colors.grey.shade200),
              ),
              alignment: Alignment.center,
              child: Icon(icon,
                  color: isSelected
                      ? JaxColors.secondaryDark
                      : Colors.grey.shade500,
                  size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                        fontFamily: JaxText.heading,
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                        color: isSelected
                            ? JaxColors.onSurface
                            : Colors.grey.shade700),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    desc,
                    style: TextStyle(
                        fontFamily: JaxText.body,
                        fontSize: 10,
                        color: Colors.grey.shade500,
                        height: 1.35),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep3() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '3. Merchant & Corporate Profile',
          style: TextStyle(
              fontFamily: JaxText.heading,
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: JaxColors.onSurface),
        ),
        const SizedBox(height: 2),
        Text(
          'Provide trade information for commercial listing operations.',
          style: JaxText.bodySmall.copyWith(color: Colors.grey.shade500),
        ),
        const SizedBox(height: 20),
        if (!_isBusinessSetupRequired)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Column(
              children: [
                const Icon(Icons.check_circle_rounded,
                    color: Colors.green, size: 36),
                const SizedBox(height: 10),
                const Text(
                  'REGISTRY DETAILS WAIVED',
                  style: TextStyle(
                      fontFamily: JaxText.heading,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      color: JaxColors.onSurface),
                ),
                const SizedBox(height: 6),
                Text(
                  'As an Individual Buyer, corporate merchant registration is not required. You can skip this step.',
                  textAlign: TextAlign.center,
                  style: JaxText.bodySmall
                      .copyWith(color: Colors.grey.shade500, height: 1.4),
                ),
              ],
            ),
          )
        else ...[
          const FieldLabel('Business Legal / Shop Name *'),
          TextField(
            controller: _businessNameController,
            decoration: const InputDecoration(
              hintText: 'e.g. Swastik Industries',
              prefixIcon: Icon(Icons.storefront_rounded, size: 20),
            ),
            textCapitalization: TextCapitalization.words,
          ),
          const SizedBox(height: 16),
          const FieldLabel('GSTIN Number (Optional)'),
          TextField(
            controller: _gstController,
            decoration: const InputDecoration(
              hintText: 'e.g. 29AAAAA0000A1Z5',
              prefixIcon: Icon(Icons.badge_outlined, size: 20),
            ),
            textCapitalization: TextCapitalization.characters,
          ),
          if (_gstController.text.trim().isNotEmpty) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.green.shade100),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle_rounded,
                      color: Colors.green, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'GST REGISTRY ID FORMAT VALID. VERIFIED POST-ONBOARDING.',
                      style: TextStyle(
                          fontFamily: JaxText.heading,
                          fontSize: 8,
                          fontWeight: FontWeight.w900,
                          color: Colors.green.shade800,
                          letterSpacing: 0.5),
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 16),
          const FieldLabel('Establishment Year (Optional)'),
          TextField(
            controller: _establishedYearController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              hintText: 'e.g. 2021',
              prefixIcon: Icon(Icons.calendar_today_rounded, size: 20),
            ),
          ),
          const SizedBox(height: 16),
          const FieldLabel('Operational Workforce *'),
          DropdownButtonFormField<String>(
            value: _employeeRange,
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.people_rounded, size: 20),
              contentPadding:
                  EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
            items: const [
              DropdownMenuItem(
                  value: 'ONE_TO_TEN', child: Text('1-10 Employees')),
              DropdownMenuItem(
                  value: 'ELEVEN_TO_FIFTY', child: Text('11-50 Employees')),
              DropdownMenuItem(
                  value: 'FIFTY_ONE_TO_TWO_HUNDRED',
                  child: Text('51-200 Employees')),
              DropdownMenuItem(
                  value: 'TWO_HUNDRED_PLUS', child: Text('200+ Employees')),
            ],
            onChanged: (val) {
              if (val != null) {
                setState(() => _employeeRange = val);
              }
            },
          ),
        ],
      ],
    );
  }

  Widget _buildStep4() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Center(
          child: Column(
            children: [
              Container(
                height: 48,
                width: 48,
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.green.shade100),
                ),
                alignment: Alignment.center,
                child: const Icon(Icons.check_circle_rounded,
                    color: Colors.green, size: 24),
              ),
              const SizedBox(height: 10),
              const Text(
                '4. Verify Onboarding Prospectus',
                style: TextStyle(
                    fontFamily: JaxText.heading,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: JaxColors.onSurface),
              ),
              const SizedBox(height: 2),
              Text(
                'Review your credentials before completing registration.',
                style: JaxText.bodySmall.copyWith(color: Colors.grey.shade500),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            children: [
              _buildSummaryRow('Full Name', _fullNameController.text.trim()),
              const Divider(height: 20, thickness: 0.5),
              _buildSummaryRow('Email Address', _emailController.text.trim()),
              const Divider(height: 20, thickness: 0.5),
              _buildSummaryRow('Account Entity', _accountType),
              const Divider(height: 20, thickness: 0.5),
              _buildSummaryRow('Platform Role', _userType),
              if (_isBusinessSetupRequired &&
                  _businessNameController.text.trim().isNotEmpty) ...[
                const Divider(height: 20, thickness: 0.5),
                _buildSummaryRow(
                  'Business Registry',
                  _businessNameController.text.trim() +
                      (_gstController.text.trim().isNotEmpty
                          ? ' (GSTIN: ${_gstController.text.trim().toUpperCase()})'
                          : ''),
                ),
                if (_establishedYearController.text.trim().isNotEmpty) ...[
                  const Divider(height: 20, thickness: 0.5),
                  _buildSummaryRow('Establishment Year',
                      _establishedYearController.text.trim()),
                ],
                const Divider(height: 20, thickness: 0.5),
                _buildSummaryRow(
                    'Workforce', _formatWorkforceSummary(_employeeRange)),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(
              fontFamily: JaxText.heading,
              fontSize: 9,
              fontWeight: FontWeight.w900,
              color: Colors.grey,
              letterSpacing: 1),
        ),
        Text(
          value,
          style: const TextStyle(
              fontFamily: JaxText.heading,
              fontSize: 12,
              fontWeight: FontWeight.w900,
              color: JaxColors.onSurface),
        ),
      ],
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ResourceCubit()
        ..load(() async {
          final api = apiOf(context);
          final auth = context.read<AuthCubit>().state;
          final result = <String, dynamic>{};
          result['categories'] = await api.categories();
          result['featured'] = asMap(await api.searchListings(
                  {'limit': 12, 'sortBy': 'featured'}))['listings'] ??
              [];
          result['events'] = asMap(await api.events())['events'] ?? [];
          if (auth.isLoggedIn) {
            result['rfqs'] = asMap(await api.sellerRfqInbox(
                    {'matchOnly': 'false', 'limit': 6}))['rfqs'] ??
                [];
          }
          return result;
        }),
      child: JaxPage(
        title: '',
        subtitle: null,
        child: BlocBuilder<ResourceCubit, ResourceState>(
          builder: (context, state) => AsyncContent(
            state: state,
            emptyTitle: 'Marketplace content unavailable',
            onRetry: () => context
                .read<ResourceCubit>()
                .load(() => apiOf(context).searchListings({'limit': 12})),
            builder: (_) {
              final featuredListings = asList(state.data['featured']);
              final categoriesList = asList(state.data['categories']);
              final eventsList = asList(state.data['events']);
              final rfqsList = asList(state.data['rfqs']);

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Category Filter Bar (Markets & Industries)
                  CategoryFilterBar(categories: categoriesList),
                  const SizedBox(height: 14),

                  // 3. Hero Tabbed Search Card with Logo
                  const HeroSearchCard(),
                  const SizedBox(height: 18),

                  // 4. Global Events Carousel
                  EventCarousel(events: eventsList),
                  const SizedBox(height: 18),

                  // 5. Instant RFQ Card
                  const InstantRfqCard(),
                  const SizedBox(height: 22),

                  // 6. AI Sourcing Banner ("All tasks in one ask, smart sourcing with AI")
                  const AiSmartSourcingCard(),
                  const SizedBox(height: 24),

                  // 7. Premium Bulk Listings Grid
                  SectionTitle(
                      title: '🔥 Premium Bulk Listings',
                      actionText: 'Browse All',
                      action: () => context.push('/search')),
                  const SizedBox(height: 12),
                  ...featuredListings.take(6).map((item) {
                    final catName = categoryName(item).toLowerCase();
                    final title = textOf(item['title']).toLowerCase();
                    final hideTrust = const [
                          'industrial registration',
                          'electronics',
                          'industrial textiles',
                        ].contains(catName) ||
                        const [
                          'industrial registration',
                          'electronics',
                          'industrial textiles',
                        ].contains(title);
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: ListingTile(
                        item: item,
                        hideTrustScore: hideTrust,
                      ),
                    );
                  }),
                  const SizedBox(height: 18),

                  // 8. Account Records & Top Factories Card
                  AccountRecordsAndFactoriesCard(listings: featuredListings),
                  const SizedBox(height: 22),

                  // 9. Product Collections (New Products, Most Popular, Amazon's Choice, Low MOQ, OEM)
                  ProductCollectionsCard(listings: featuredListings),
                  const SizedBox(height: 22),

                  // 10. Browse Markets & Industries Grid
                  const SectionTitle(title: 'Browse Markets & Industries'),
                  const SizedBox(height: 12),
                  CategoryGrid(categories: categoriesList),

                  // 11. Active RFQ Requests
                  if (rfqsList.isNotEmpty) ...[
                    const SizedBox(height: 24),
                    SectionTitle(
                        title: 'Active RFQ Requests',
                        actionText: 'View All',
                        action: () => context.push('/rfq')),
                    const SizedBox(height: 12),
                    ...rfqsList.take(4).map((item) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: RfqTile(
                            item: item,
                            sellerMode: true,
                            showMaxBudgetOnly: true))),
                  ],
                  const SizedBox(height: 24),

                  // 12. Escrow Info & Trade Safety
                  const EscrowInfoCard(),
                  const SizedBox(height: 24),
                  const SupplierJoinCard(),
                  const SizedBox(height: 24),
                  const TradeSafetyFooter(),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class LiveB2bFeedBanner extends StatefulWidget {
  const LiveB2bFeedBanner({super.key});

  @override
  State<LiveB2bFeedBanner> createState() => _LiveB2bFeedBannerState();
}

class _LiveB2bFeedBannerState extends State<LiveB2bFeedBanner> {
  static const _feeds = [
    "Buyer from Delhi placed bulk order of Monocrystalline Solar Panels",
    "RFQ posted: Need 10,000 meters Organic Combed Cotton Yarn - Chennai",
    "Supplier Swastik Industries Pvt Ltd got verified under GSTIN & PAN",
    "Order Shipped: 5 Metric Tons TMT Steel Rebar to Mumbai Construction site",
    "RFQ posted: Heavy Duty Centrifugal Water Pumps (25 units) - Hyderabad",
    "Buyer from Pune verified transaction via JaxMart Escrow Protection",
  ];

  int _feedIndex = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (mounted) {
        setState(() => _feedIndex = (_feedIndex + 1) % _feeds.length);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFDCFCE7)),
      ),
      child: Row(
        children: [
          const Text('🔥', style: TextStyle(fontSize: 14)),
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: const Color(0xFFBBF7D0),
              borderRadius: BorderRadius.circular(4),
            ),
            child: const Text(
              'LIVE B2B FEED',
              style: TextStyle(
                fontFamily: JaxText.heading,
                fontSize: 9,
                fontWeight: FontWeight.w900,
                color: Color(0xFF166534),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 500),
              child: Text(
                _feeds[_feedIndex],
                key: ValueKey<int>(_feedIndex),
                style: const TextStyle(
                  fontFamily: JaxText.body,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF14532D),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ),
          GestureDetector(
            onTap: () => context.push('/rfq'),
            child: const Icon(
              Icons.arrow_forward_rounded,
              size: 14,
              color: Color(0xFF166534),
            ),
          ),
        ],
      ),
    );
  }
}

class CategoryFilterBar extends StatelessWidget {
  const CategoryFilterBar({required this.categories, super.key});
  final List<JsonMap> categories;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.apps_rounded, size: 16, color: JaxColors.primary),
            const SizedBox(width: 6),
            Text(
              'MARKETS & INDUSTRIES',
              style: JaxText.label.copyWith(
                fontSize: 11,
                fontWeight: FontWeight.w900,
                color: JaxColors.primaryContainer,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: categories.map((cat) {
              final name = textOf(cat['name']);
              final id = textOf(cat['id']);
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  label: Text(name),
                  labelStyle: const TextStyle(
                    fontFamily: JaxText.body,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: JaxColors.primaryContainer,
                  ),
                  backgroundColor: const Color(0xFFF8FAFC),
                  side: const BorderSide(color: Color(0xFFE2E8F0)),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  onSelected: (_) {
                    context.push('/search?category=$id');
                  },
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class AiSmartSourcingCard extends StatefulWidget {
  const AiSmartSourcingCard({super.key});

  @override
  State<AiSmartSourcingCard> createState() => _AiSmartSourcingCardState();
}

class _AiSmartSourcingCardState extends State<AiSmartSourcingCard> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFF0FDFA), Color(0xFFEFF6FF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFCCFBF1)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0D9488).withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF0D9488),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 18),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: RichText(
                  text: const TextSpan(
                    style: TextStyle(
                      fontFamily: JaxText.heading,
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F172A),
                    ),
                    children: [
                      TextSpan(text: 'All tasks in one ask, '),
                      TextSpan(
                        text: 'smart sourcing with AI',
                        style: TextStyle(color: Color(0xFF0D9488)),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF99F6E4), width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    style: const TextStyle(fontSize: 12),
                    decoration: const InputDecoration(
                      hintText: "Describe your sourcing needs e.g. 'I need 500 meters stainless steel pipe...'",
                      hintStyle: TextStyle(color: Colors.grey, fontSize: 11),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: () {
                    final txt = _controller.text.trim();
                    if (txt.isNotEmpty) {
                      context.push('/rfq/create?title=${Uri.encodeComponent(txt)}');
                    }
                  },
                  child: Container(
                    margin: const EdgeInsets.all(4),
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.send_rounded, color: Colors.white, size: 16),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class AccountRecordsAndFactoriesCard extends StatelessWidget {
  const AccountRecordsAndFactoriesCard({required this.listings, super.key});
  final List<JsonMap> listings;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFFEFF6FF),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFDBEAFE)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'ACCOUNT RECORDS',
                style: TextStyle(
                  fontFamily: JaxText.heading,
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF1E40AF),
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _recordItem(Icons.verified_user_rounded, 'Verified', '100% Audit'),
                  _recordItem(Icons.local_shipping_rounded, 'Fast Delivery', 'Global Ship'),
                  _recordItem(Icons.security_rounded, 'Escrow Safe', 'Protected'),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        FeaturedFactoriesCard(listings: listings),
      ],
    );
  }

  Widget _recordItem(IconData icon, String title, String subtitle) {
    return Row(
      children: [
        Icon(icon, size: 18, color: const Color(0xFF2563EB)),
        const SizedBox(width: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontFamily: JaxText.heading,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1E293B),
              ),
            ),
            Text(
              subtitle,
              style: const TextStyle(
                fontFamily: JaxText.body,
                fontSize: 9,
                color: Color(0xFF64748B),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class ProductCollectionsCard extends StatefulWidget {
  const ProductCollectionsCard({required this.listings, super.key});
  final List<JsonMap> listings;

  @override
  State<ProductCollectionsCard> createState() => _ProductCollectionsCardState();
}

class _ProductCollectionsCardState extends State<ProductCollectionsCard> {
  String _activeTab = 'New Products';
  static const _tabs = [
    'New Products',
    'Most Popular',
    'Amazon\'s Choice',
    'Low MOQ',
    'OEM Products',
  ];

  @override
  Widget build(BuildContext context) {
    if (widget.listings.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: _tabs.map((tab) {
              final isSel = tab == _activeTab;
              return GestureDetector(
                onTap: () => setState(() => _activeTab = tab),
                child: Container(
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: isSel ? JaxColors.primaryContainer : Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    tab,
                    style: TextStyle(
                      fontFamily: JaxText.heading,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isSel ? Colors.white : Colors.grey.shade700,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 180,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: widget.listings.length,
            itemBuilder: (context, idx) {
              final item = widget.listings[idx];
              final img = textOf(item['images'] != null && asList(item['images']).isNotEmpty
                  ? asList(item['images'])[0]
                  : null);
              return GestureDetector(
                onTap: () => context.push('/listings/${item['id']}'),
                child: Container(
                  width: 140,
                  margin: const EdgeInsets.only(right: 12),
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          height: 90,
                          width: double.infinity,
                          color: Colors.grey.shade100,
                          child: img.isNotEmpty
                              ? Image.network(img, fit: BoxFit.cover)
                              : const Icon(Icons.image_rounded, color: Colors.grey),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        textOf(item['title']),
                        style: const TextStyle(
                          fontFamily: JaxText.heading,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: JaxColors.onSurface,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const Spacer(),
                      Text(
                        '₹${item['price'] ?? 'POA'}',
                        style: const TextStyle(
                          fontFamily: JaxText.heading,
                          fontSize: 12,
                          fontWeight: FontWeight.w900,
                          color: JaxColors.secondary,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class TradeSafetyFooter extends StatelessWidget {
  const TradeSafetyFooter({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
      decoration: BoxDecoration(
        color: const Color(0xFF090B11), // Web Dark Theme Footer
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isTablet = constraints.maxWidth > 580;

          Widget brandSection = Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const AppLogo(
                height: 28,
                style: AppLogoStyle.color,
                alignment: Alignment.centerLeft,
              ),
              const SizedBox(height: 12),
              Text(
                "India's premier B2B marketplace engineered for verified wholesale trade, seamless sourcing, and uncompromising escrow protection.",
                style: TextStyle(
                  fontFamily: JaxText.body,
                  fontSize: 12,
                  color: Colors.grey.shade400,
                  height: 1.45,
                ),
              ),
            ],
          );

          Widget buyersColumn = Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'FOR BUYERS',
                style: TextStyle(
                  fontFamily: JaxText.heading,
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.8,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 12),
              _FooterLink(
                label: 'Find Products',
                onTap: () => context.push('/search'),
              ),
              const SizedBox(height: 8),
              _FooterLink(
                label: 'Post a Request',
                onTap: () => context.push('/rfq/create'),
              ),
              const SizedBox(height: 8),
              _FooterLink(
                label: 'My Orders',
                onTap: () => context.push('/orders'),
              ),
            ],
          );

          Widget sellersColumn = Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'FOR SELLERS',
                style: TextStyle(
                  fontFamily: JaxText.heading,
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.8,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 12),
              _FooterLink(
                label: 'Seller Center',
                onTap: () => context.push('/seller/dashboard'),
              ),
              const SizedBox(height: 8),
              _FooterLink(
                label: 'List Products',
                onTap: () => context.push('/seller/listings/create'),
              ),
              const SizedBox(height: 8),
              _FooterLink(
                label: 'Buyer Requests',
                onTap: () => context.push('/seller/rfq-inbox'),
              ),
            ],
          );

          Widget trustColumn = Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'TRUST & SAFETY',
                style: TextStyle(
                  fontFamily: JaxText.heading,
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.8,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 12),
              const _TrustItem(
                icon: Icons.shield_outlined,
                label: 'Escrow Protection',
              ),
              const SizedBox(height: 8),
              const _TrustItem(
                icon: Icons.verified_outlined,
                label: 'Verified Suppliers',
              ),
              const SizedBox(height: 8),
              const _TrustItem(
                icon: Icons.check_circle_outline_rounded,
                label: 'Quality Guarantee',
              ),
            ],
          );

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (isTablet) ...[
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(flex: 3, child: brandSection),
                    const SizedBox(width: 24),
                    Expanded(flex: 2, child: buyersColumn),
                    const SizedBox(width: 16),
                    Expanded(flex: 2, child: sellersColumn),
                    const SizedBox(width: 16),
                    Expanded(flex: 2, child: trustColumn),
                  ],
                ),
              ] else ...[
                brandSection,
                const SizedBox(height: 24),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(child: buyersColumn),
                    const SizedBox(width: 12),
                    Expanded(child: sellersColumn),
                  ],
                ),
                const SizedBox(height: 20),
                trustColumn,
              ],

              const SizedBox(height: 24),
              const Divider(color: Colors.white12, height: 1, thickness: 1),
              const SizedBox(height: 16),

              Wrap(
                alignment: WrapAlignment.spaceBetween,
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: 12,
                runSpacing: 10,
                children: [
                  Text(
                    '© ${DateTime.now().year} JaxMart. All rights reserved.',
                    style: TextStyle(
                      fontFamily: JaxText.body,
                      fontSize: 11,
                      color: Colors.grey.shade500,
                    ),
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Terms of Use',
                        style: TextStyle(
                          fontFamily: JaxText.body,
                          fontSize: 11,
                          color: Colors.grey.shade500,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Text(
                        'Privacy Policy',
                        style: TextStyle(
                          fontFamily: JaxText.body,
                          fontSize: 11,
                          color: Colors.grey.shade500,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Text(
                        'Contact Us',
                        style: TextStyle(
                          fontFamily: JaxText.body,
                          fontSize: 11,
                          color: Colors.grey.shade500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );
  }
}

class _FooterLink extends StatefulWidget {
  final String label;
  final VoidCallback onTap;
  final double fontSize;

  const _FooterLink({
    required this.label,
    required this.onTap,
    this.fontSize = 12,
  });

  @override
  State<_FooterLink> createState() => _FooterLinkState();
}

class _FooterLinkState extends State<_FooterLink> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      onTapDown: (_) => setState(() => _isHovered = true),
      onTapUp: (_) => setState(() => _isHovered = false),
      onTapCancel: () => setState(() => _isHovered = false),
      child: Text(
        widget.label,
        style: TextStyle(
          fontFamily: JaxText.body,
          fontSize: widget.fontSize,
          color: _isHovered ? Colors.white : Colors.grey.shade400,
          fontWeight: _isHovered ? FontWeight.w600 : FontWeight.w400,
        ),
      ),
    );
  }
}

class _TrustItem extends StatelessWidget {
  final IconData icon;
  final String label;

  const _TrustItem({
    required this.icon,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: Colors.grey.shade400),
        const SizedBox(width: 6),
        Text(
          label,
          style: TextStyle(
            fontFamily: JaxText.body,
            fontSize: 12,
            color: Colors.grey.shade400,
          ),
        ),
      ],
    );
  }
}

class SupplierJoinCard extends StatelessWidget {
  const SupplierJoinCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      decoration: BoxDecoration(
        color: JaxColors.primaryContainer,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: JaxColors.primaryContainer.withValues(alpha: .2),
              blurRadius: 12,
              offset: const Offset(0, 6)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Join as a Wholesale Supplier',
            style: JaxText.h2.copyWith(color: Colors.white, fontSize: 20),
          ),
          const SizedBox(height: 10),
          Text(
            'List your products, register your GSTIN, and quote on thousands of active RFQ requests.',
            style: JaxText.bodyMedium.copyWith(
                color: Colors.white.withValues(alpha: .9), height: 1.5),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () async {
                final auth = context.read<AuthCubit>().state;
                if (!auth.isLoggedIn) {
                  context.push(
                      '/auth/login?redirect=${Uri.encodeComponent('/seller/dashboard')}&type=SELLER');
                  return;
                }
                if (auth.isSeller) {
                  context.go('/seller/dashboard');
                } else {
                  await context
                      .read<AuthCubit>()
                      .updateProfile({'userType': 'SELLER'});
                  if (context.mounted) context.go('/seller/dashboard');
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: JaxColors.primaryContainer,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
                elevation: 0,
              ),
              child: Text(
                'REGISTER FACTORY CENTER',
                style: JaxText.label.copyWith(
                    color: JaxColors.primaryContainer,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class HeroSearchCard extends StatefulWidget {
  const HeroSearchCard({super.key});

  @override
  State<HeroSearchCard> createState() => _HeroSearchCardState();
}

class _HeroSearchCardState extends State<HeroSearchCard> {
  final _query = TextEditingController();
  String _tab = 'products';

  @override
  void dispose() {
    _query.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return JaxCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _tab = 'products'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      gradient: _tab == 'products' ? JaxGradients.primary : null,
                      color: _tab == 'products' ? null : Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      'PRODUCTS',
                      style: TextStyle(
                        fontFamily: JaxText.heading,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: _tab == 'products' ? Colors.white : Colors.grey.shade700,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _tab = 'suppliers'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      gradient: _tab == 'suppliers' ? JaxGradients.primary : null,
                      color: _tab == 'suppliers' ? null : Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      'SUPPLIERS',
                      style: TextStyle(
                        fontFamily: JaxText.heading,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: _tab == 'suppliers' ? Colors.white : Colors.grey.shade700,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: JaxColors.secondary, width: 1.5),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _query,
                    style: const TextStyle(fontSize: 13),
                    decoration: InputDecoration(
                      hintText: _tab == 'products'
                          ? 'Enter keywords, HSN codes, or brands...'
                          : 'Search verified factories, GSTIN...',
                      hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 12),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      isDense: true,
                    ),
                    onSubmitted: (_) => _go(),
                  ),
                ),
                GestureDetector(
                  onTap: _go,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: const BoxDecoration(
                      gradient: JaxGradients.primary,
                      borderRadius: BorderRadius.only(
                        topRight: Radius.circular(6),
                        bottomRight: Radius.circular(6),
                      ),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.search_rounded, color: Colors.white, size: 16),
                        SizedBox(width: 4),
                        Text(
                          'SEARCH',
                          style: TextStyle(
                            fontFamily: JaxText.heading,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 6,
            runSpacing: 4,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Text(
                'Hot Searches:',
                style: TextStyle(
                  fontFamily: JaxText.body,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey.shade600,
                ),
              ),
              ...['Solar Panels', 'TMT Steel', 'Cotton Yarn', 'Hydraulic Pumps'].map(
                (term) => GestureDetector(
                  onTap: () => context.push('/search?q=${Uri.encodeComponent(term)}'),
                  child: Text(
                    term,
                    style: const TextStyle(
                      fontFamily: JaxText.body,
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: JaxColors.secondary,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _go() {
    final q = _query.text.trim();
    if (q.isEmpty) return;
    context.push(
        '/search?q=${Uri.encodeComponent(q)}${_tab == 'suppliers' ? '&type=supplier' : ''}');
  }
}

class InstantRfqCard extends StatefulWidget {
  const InstantRfqCard({super.key});

  @override
  State<InstantRfqCard> createState() => _InstantRfqCardState();
}

class _InstantRfqCardState extends State<InstantRfqCard> {
  final _rfqProduct = TextEditingController();
  final _rfqQty = TextEditingController();
  String _unit = 'Pieces';

  static const _units = [
    'Pieces',
    'Metric Tons',
    'Kilograms',
    'Boxes',
    'Rolls'
  ];

  @override
  void dispose() {
    _rfqProduct.dispose();
    _rfqQty.dispose();
    super.dispose();
  }

  InputDecoration _inputDecoration({required String hintText}) {
    return InputDecoration(
      filled: true,
      fillColor: const Color(0xFFF9FAFB),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      hintText: hintText,
      hintStyle: TextStyle(
        fontFamily: JaxText.body,
        fontSize: 13,
        color: Colors.grey.shade400,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Color(0xFFE5E7EB), width: 1.0),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: JaxColors.secondary, width: 1.2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return JaxCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                height: 36,
                width: 36,
                decoration: BoxDecoration(
                  color: const Color(0xFFD2EFEA),
                  borderRadius: BorderRadius.circular(8),
                ),
                alignment: Alignment.center,
                child: const Icon(
                  Icons.description_rounded,
                  color: Color(0xFF2C9A91),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'INSTANT RFQ',
                    style: JaxText.title.copyWith(
                      fontSize: 13,
                      color: JaxColors.primaryContainer,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                  Text(
                    'Get multiple quotes in 24 hours',
                    style: JaxText.bodySmall.copyWith(
                      color: Colors.grey.shade400,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Product label + field
          Text(
            'WHAT PRODUCT DO YOU NEED?',
            style: JaxText.label
                .copyWith(fontSize: 9, color: JaxColors.onSurfaceVariant),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _rfqProduct,
            style: const TextStyle(
              fontFamily: JaxText.body,
              fontSize: 13,
              color: JaxColors.primaryContainer,
            ),
            decoration:
                _inputDecoration(hintText: 'e.g. Cotton Yarn 30s, CNC inserts'),
          ),
          const SizedBox(height: 14),
          // Quantity row (full width)
          Text(
            'QUANTITY',
            style: JaxText.label
                .copyWith(fontSize: 9, color: JaxColors.onSurfaceVariant),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _rfqQty,
            keyboardType: TextInputType.number,
            style: const TextStyle(
              fontFamily: JaxText.body,
              fontSize: 13,
              color: JaxColors.primaryContainer,
            ),
            decoration: InputDecoration(
              filled: true,
              fillColor: const Color(0xFFF9FAFB),
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              hintText: '100',
              hintStyle: TextStyle(
                fontFamily: JaxText.body,
                fontSize: 13,
                color: Colors.grey.shade400,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide:
                    const BorderSide(color: Color(0xFFE5E7EB), width: 1.0),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide:
                    const BorderSide(color: JaxColors.secondary, width: 1.2),
              ),
            ),
          ),
          const SizedBox(height: 14),
          // Unit row (full width)
          Text(
            'UNIT',
            style: JaxText.label
                .copyWith(fontSize: 9, color: JaxColors.onSurfaceVariant),
          ),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _unit,
            style: const TextStyle(
              fontFamily: JaxText.body,
              fontSize: 13,
              color: JaxColors.primaryContainer,
            ),
            decoration: InputDecoration(
              filled: true,
              fillColor: const Color(0xFFF9FAFB),
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide:
                    const BorderSide(color: Color(0xFFE5E7EB), width: 1.0),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide:
                    const BorderSide(color: JaxColors.secondary, width: 1.2),
              ),
            ),
            icon: const Icon(
              Icons.keyboard_arrow_down_rounded,
              color: JaxColors.primaryContainer,
              size: 20,
            ),
            items: _units
                .map((u) => DropdownMenuItem(value: u, child: Text(u)))
                .toList(),
            onChanged: (v) => setState(() => _unit = v ?? 'Pieces'),
          ),
          const SizedBox(height: 18),
          // POST REQUEST FREE button
          Container(
            width: double.infinity,
            height: 44,
            decoration: BoxDecoration(
              gradient: JaxGradients.primary,
              borderRadius: BorderRadius.circular(JaxRadius.lg),
              boxShadow: [
                BoxShadow(
                  color: JaxColors.primary.withValues(alpha: 0.15),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: _postRfq,
                borderRadius: BorderRadius.circular(JaxRadius.lg),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'POST REQUEST FREE',
                      style: TextStyle(
                        fontFamily: JaxText.heading,
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: 1,
                      ),
                    ),
                    SizedBox(width: 8),
                    Icon(
                      Icons.arrow_forward_rounded,
                      color: Colors.white,
                      size: 16,
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 14),
          // Secure Trade footer
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FAF9),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFE6F4F2)),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.security_rounded,
                  color: JaxColors.secondary,
                  size: 24,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'SECURE TRADE',
                        style: JaxText.label.copyWith(
                          color: const Color(0xFF0C3733),
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Escrow payments protected, 100% money back guarantee.',
                        style: JaxText.bodySmall.copyWith(
                          color: const Color(0xFF165A54),
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _postRfq() {
    final product = _rfqProduct.text.trim();
    if (product.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please specify what product you need')),
      );
      return;
    }
    final qtyVal = _rfqQty.text.trim();
    final qty = qtyVal.isEmpty ? '100' : qtyVal;
    context.push(
        '/rfq/create?title=${Uri.encodeComponent(product)}&qty=${Uri.encodeComponent(qty)}&unit=${Uri.encodeComponent(_unit)}');
  }
}

class EscrowInfoCard extends StatelessWidget {
  const EscrowInfoCard({super.key});

  @override
  Widget build(BuildContext context) {
    return JaxCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.shield_rounded,
                  color: JaxColors.secondary, size: 20),
              const SizedBox(width: 10),
              Text('JAXMART ESCROW',
                  style: JaxText.title.copyWith(
                      fontSize: 14, color: JaxColors.primaryContainer)),
            ],
          ),
          const SizedBox(height: 18),
          _buildItem('1. Secure Payments',
              'JaxMart holds your funds in escrow, protecting you from fraud.'),
          const SizedBox(height: 16),
          _buildItem('2. Verified Shipping',
              'We verify GSTIN, HSN, and carrier logistics before releasing funds.'),
          const SizedBox(height: 16),
          _buildItem('3. Inspection Guarantee',
              'Release payments to suppliers only after verifying cargo quality.'),
        ],
      ),
    );
  }

  Widget _buildItem(String title, String subtitle) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(Icons.check_circle_rounded,
            color: JaxColors.secondary, size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title,
                  style: JaxText.label.copyWith(
                      fontSize: 13, color: JaxColors.primaryContainer)),
              const SizedBox(height: 4),
              Text(subtitle,
                  style: JaxText.bodyMedium.copyWith(
                      color: JaxColors.onSurfaceVariant,
                      fontSize: 13,
                      height: 1.4)),
            ],
          ),
        ),
      ],
    );
  }
}

class FeaturedFactoriesCard extends StatelessWidget {
  const FeaturedFactoriesCard({required this.listings, super.key});
  final List<JsonMap> listings;

  static const List<JsonMap> _featuredFactories = [
    {
      'id': 'mock-vardhman',
      'fullName': 'Vardhman Representative',
      'kycStatus': 'VERIFIED',
      'trustScore': 95,
      'avatarUrl': null,
      'businessProfile': {
        'businessName': 'Vardhman Textiles Ltd',
        'businessType': 'TEXTILES',
        'establishedYear': 1998,
        'employeeRange': 'TWO_HUNDRED_PLUS',
        'gstin': '03AAAAV1998T1Z1',
      },
      'addresses': [
        {
          'city': 'Ludhiana',
          'state': 'Punjab',
          'isPrimary': true,
        }
      ],
    },
    {
      'id': 'mock-apex',
      'fullName': 'Apex Representative',
      'kycStatus': 'VERIFIED',
      'trustScore': 90,
      'avatarUrl': null,
      'businessProfile': {
        'businessName': 'Apex Industries',
        'businessType': 'INDUSTRIAL',
        'establishedYear': 2004,
        'employeeRange': 'FIFTY_ONE_TO_TWO_HUNDRED',
        'gstin': '27AAAAA2004I1Z2',
      },
      'addresses': [
        {
          'city': 'Mumbai',
          'state': 'Maharashtra',
          'isPrimary': true,
        }
      ],
    },
    {
      'id': 'mock-swastik',
      'fullName': 'Swastik Representative',
      'kycStatus': 'VERIFIED',
      'trustScore': 88,
      'avatarUrl': null,
      'businessProfile': {
        'businessName': 'Swastik Chemicals',
        'businessType': 'CHEMICALS',
        'establishedYear': 2011,
        'employeeRange': 'ELEVEN_TO_FIFTY',
        'gstin': '24AAAAA2011C1Z3',
      },
      'addresses': [
        {
          'city': 'Ahmedabad',
          'state': 'Gujarat',
          'isPrimary': true,
        }
      ],
    },
  ];

  @override
  Widget build(BuildContext context) {
    return JaxCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.handshake_rounded,
                  color: JaxColors.secondary, size: 20),
              const SizedBox(width: 10),
              Text('FEATURED FACTORIES',
                  style: JaxText.title.copyWith(
                      fontSize: 14, color: JaxColors.primaryContainer)),
            ],
          ),
          const SizedBox(height: 18),
          ..._featuredFactories.map((seller) {
            final business = asMap(seller['businessProfile']);
            final name = textOf(business['businessName'],
                textOf(seller['fullName'], 'Supplier'));

            final addresses = asList(seller['addresses']);
            final primaryAddress =
                addresses.isNotEmpty ? addresses.first : null;
            final location = primaryAddress != null
                ? textOf(primaryAddress['city'], 'India')
                : 'India';

            final rawEstYear = business['establishedYear'];
            final est = rawEstYear != null ? rawEstYear.toString() : '2015';

            final category = textOf(business['businessType'], 'Industrial');
            final initials = name.length >= 2
                ? name.substring(0, 1).toUpperCase() +
                    name.substring(1, 2).toLowerCase()
                : name.toUpperCase();
            final isLast = seller == _featuredFactories.last;

            return Column(
              children: [
                GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => showDialog(
                    context: context,
                    builder: (_) => SupplierProfileDialog(seller: seller),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 52,
                        height: 52,
                        decoration: BoxDecoration(
                          color: JaxColors.surface,
                          border: Border.all(
                              color: JaxColors.outlineVariant, width: 1.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          initials,
                          style: JaxText.title.copyWith(
                              color: JaxColors.secondary, fontSize: 16),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(name,
                                style: JaxText.title.copyWith(
                                    fontSize: 14,
                                    color: JaxColors.primaryContainer)),
                            const SizedBox(height: 4),
                            Text('$location • Est. $est',
                                style: JaxText.bodySmall.copyWith(
                                    fontSize: 11,
                                    color: JaxColors.onSurfaceVariant)),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color:
                                    JaxColors.secondary.withValues(alpha: .12),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(category.toUpperCase(),
                                  style: JaxText.label.copyWith(
                                      color: JaxColors.secondaryDark,
                                      fontSize: 9,
                                      letterSpacing: 0.5)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                if (!isLast) const Divider(height: 32, thickness: 0.5),
              ],
            );
          }),
        ],
      ),
    );
  }
}

class EventCarousel extends StatefulWidget {
  const EventCarousel({required this.events, super.key});
  final List<JsonMap> events;

  @override
  State<EventCarousel> createState() => _EventCarouselState();
}

class _EventCarouselState extends State<EventCarousel> {
  int _index = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 6), (_) {
      if (mounted && widget.events.length > 1)
        setState(() => _index = (_index + 1) % widget.events.length);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.events.isEmpty) return const SizedBox.shrink();
    final event = widget.events[_index.clamp(0, widget.events.length - 1)];
    final media = textOf(event['mediaUrl']);
    return Container(
      height: 210,
      decoration: BoxDecoration(
          color: const Color(0xFF090B11),
          borderRadius: BorderRadius.circular(JaxRadius.xl)),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        fit: StackFit.expand,
        children: [
          if (media.isNotEmpty)
            Image.network(media,
                fit: BoxFit.cover, opacity: const AlwaysStoppedAnimation(.72)),
          const DecoratedBox(
              decoration: BoxDecoration(
                  gradient: LinearGradient(
                      colors: [Colors.transparent, Colors.black87],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter))),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const StatusPill(
                    label: 'Upcoming B2B Event', color: JaxColors.secondary),
                const SizedBox(height: 10),
                Text(textOf(event['title']),
                    style: JaxText.h3.copyWith(color: Colors.white),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                const SizedBox(height: 6),
                Text(textOf(event['description']),
                    style: JaxText.bodySmall.copyWith(color: Colors.white70),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis),
                const SizedBox(height: 10),
                Row(
                  children: [
                    const Icon(Icons.location_on_rounded,
                        color: JaxColors.secondary, size: 16),
                    Expanded(
                        child: Text(textOf(event['location'], 'Online'),
                            style: JaxText.bodySmall
                                .copyWith(color: Colors.white70),
                            maxLines: 1)),
                    Text(shortDate(event['date']),
                        style: JaxText.label.copyWith(color: Colors.white)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class CategoryGrid extends StatelessWidget {
  const CategoryGrid({required this.categories, super.key});
  final List<JsonMap> categories;

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty)
      return const EmptyState(title: 'No categories available');
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: categories.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 2.4,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10),
      itemBuilder: (context, index) {
        final cat = categories[index];
        return JaxCard(
          padding: const EdgeInsets.all(12),
          onTap: () => context.push('/search?category=${cat['id']}'),
          child: Row(
            children: [
              Container(
                  height: 38,
                  width: 38,
                  decoration: BoxDecoration(
                      color: JaxColors.secondary.withValues(alpha: .10),
                      borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.category_rounded,
                      color: JaxColors.secondaryDark)),
              const SizedBox(width: 10),
              Expanded(
                  child: Text(textOf(cat['name']),
                      style: JaxText.title.copyWith(fontSize: 12),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis)),
            ],
          ),
        );
      },
    );
  }
}

class SectionTitle extends StatelessWidget {
  const SectionTitle(
      {required this.title,
      this.action,
      this.actionText = 'View all',
      super.key});
  final String title;
  final VoidCallback? action;
  final String actionText;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Text(title, style: JaxText.h3)),
        if (action != null)
          TextButton(onPressed: action, child: Text(actionText)),
      ],
    );
  }
}

class SearchScreen extends StatefulWidget {
  const SearchScreen({this.query, this.category, this.type, super.key});
  final String? query;
  final String? category;
  final String? type;

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  late final _q = TextEditingController(text: widget.query ?? '');
  final _minPriceController = TextEditingController();
  final _maxPriceController = TextEditingController();
  final _moqController = TextEditingController();
  final _cityController = TextEditingController();

  String _category = '';
  String _sort = 'relevance';
  bool _verified = false;
  bool _trust = false;
  bool _topRated = false;
  bool _grid = false;
  int _page = 1;
  String _fobPort = '';
  String _minTrustScore = '';

  @override
  void initState() {
    super.initState();
    _category = widget.category ?? '';
  }

  @override
  void dispose() {
    _minPriceController.dispose();
    _maxPriceController.dispose();
    _moqController.dispose();
    _cityController.dispose();
    super.dispose();
  }

  Map<String, dynamic> get _params => {
        'q': _q.text.trim(),
        'limit': 12,
        'page': _page,
        if (widget.type != null && widget.type!.isNotEmpty) 'type': widget.type,
        if (_category.isNotEmpty) 'categoryId': _category,
        if (_sort != 'relevance') 'sortBy': _sort,
        if (_verified) 'isVerified': 'true',
        if (_trust || _minTrustScore == '90') 'minTrust': '90',
        if (_minTrustScore == '80') 'minTrust': '80',
        if (_topRated) 'minRating': '4.5',
        if (_cityController.text.trim().isNotEmpty) 'city': _cityController.text.trim(),
      };

  int get _activeFilterCount =>
      (_verified ? 1 : 0) +
      (_trust || _minTrustScore.isNotEmpty ? 1 : 0) +
      (_topRated ? 1 : 0) +
      (_category.isNotEmpty ? 1 : 0) +
      (_minPriceController.text.isNotEmpty || _maxPriceController.text.isNotEmpty ? 1 : 0) +
      (_moqController.text.isNotEmpty ? 1 : 0) +
      (_fobPort.isNotEmpty ? 1 : 0) +
      (_cityController.text.isNotEmpty ? 1 : 0);

  void _resetFilters(BuildContext context) {
    setState(() {
      _verified = false;
      _trust = false;
      _topRated = false;
      _category = '';
      _minTrustScore = '';
      _fobPort = '';
      _minPriceController.clear();
      _maxPriceController.clear();
      _moqController.clear();
      _cityController.clear();
      _page = 1;
    });
    _reload(context);
  }

  void _showFilterBottomSheet(BuildContext outerContext) {
    showModalBottomSheet(
      context: outerContext,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: 16,
                bottom: MediaQuery.of(context).viewInsets.bottom + 16,
              ),
              child: SizedBox(
                height: MediaQuery.of(context).size.height * 0.75,
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'B2B SEARCH FILTERS',
                          style: TextStyle(
                            fontFamily: JaxText.heading,
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            color: JaxColors.primaryContainer,
                          ),
                        ),
                        if (_activeFilterCount > 0)
                          TextButton(
                            onPressed: () {
                              _resetFilters(outerContext);
                              Navigator.pop(ctx);
                            },
                            child: const Text('Reset All', style: TextStyle(color: Colors.red, fontSize: 12)),
                          ),
                      ],
                    ),
                    const Divider(),
                    Expanded(
                      child: ListView(
                        children: [
                          // Supplier Verification Checkbox
                          CheckboxListTile(
                            contentPadding: EdgeInsets.zero,
                            title: const Text('Verified Supplier', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                            subtitle: const Text('GSTIN & PAN Audited Manufacturers', style: TextStyle(fontSize: 11, color: Colors.grey)),
                            value: _verified,
                            activeColor: JaxColors.secondary,
                            onChanged: (v) {
                              setModalState(() => _verified = v ?? false);
                              setState(() => _verified = v ?? false);
                            },
                          ),
                          const SizedBox(height: 10),

                          // Min Trust Score
                          const Text('MIN TRUST SCORE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                          const SizedBox(height: 6),
                          DropdownButtonFormField<String>(
                            value: _minTrustScore,
                            decoration: const InputDecoration(
                              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              border: OutlineInputBorder(),
                            ),
                            items: const [
                              DropdownMenuItem(value: '', child: Text('Any Trust Level')),
                              DropdownMenuItem(value: '90', child: Text('90%+ Trust (Top tier)')),
                              DropdownMenuItem(value: '80', child: Text('80%+ Trust (Verified)')),
                            ],
                            onChanged: (v) {
                              setModalState(() => _minTrustScore = v ?? '');
                              setState(() => _minTrustScore = v ?? '');
                            },
                          ),
                          const SizedBox(height: 14),

                          // Price Range (INR)
                          const Text('PRICE RANGE (INR)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: _minPriceController,
                                  keyboardType: TextInputType.number,
                                  decoration: const InputDecoration(hintText: 'Min', contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8), border: OutlineInputBorder()),
                                ),
                              ),
                              const Padding(padding: EdgeInsets.symmetric(horizontal: 8), child: Text('-')),
                              Expanded(
                                child: TextField(
                                  controller: _maxPriceController,
                                  keyboardType: TextInputType.number,
                                  decoration: const InputDecoration(hintText: 'Max', contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8), border: OutlineInputBorder()),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),

                          // Max MOQ
                          const Text('MAX MIN. ORDER QTY (MOQ)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _moqController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(hintText: 'e.g. 50', contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8), border: OutlineInputBorder()),
                          ),
                          const SizedBox(height: 14),

                          // FOB Port
                          const Text('FOB LOADING PORT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                          const SizedBox(height: 6),
                          DropdownButtonFormField<String>(
                            value: _fobPort,
                            decoration: const InputDecoration(
                              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              border: OutlineInputBorder(),
                            ),
                            items: const [
                              DropdownMenuItem(value: '', child: Text('All Ports')),
                              DropdownMenuItem(value: 'Mundra', child: Text('Mundra Port (Gujarat)')),
                              DropdownMenuItem(value: 'Nhava Sheva', child: Text('Nhava Sheva Port (JNPT)')),
                            ],
                            onChanged: (v) {
                              setModalState(() => _fobPort = v ?? '');
                              setState(() => _fobPort = v ?? '');
                            },
                          ),
                          const SizedBox(height: 14),

                          // City
                          const Text('SUPPLIER CITY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _cityController,
                            decoration: const InputDecoration(
                              prefixIcon: Icon(Icons.location_on_rounded, size: 16),
                              hintText: 'Search city e.g. Mumbai, Delhi',
                              contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              border: OutlineInputBorder(),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      height: 44,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: JaxColors.primaryContainer,
                          foregroundColor: Colors.white,
                        ),
                        onPressed: () {
                          Navigator.pop(ctx);
                          _reload(outerContext);
                        },
                        child: const Text('APPLY FILTERS', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
            create: (_) => ResourceCubit()
              ..load(() => apiOf(context).searchListings(_params),
                  listKeys: const ['listings'])),
        BlocProvider(
            create: (_) => CategoriesCubit()
              ..load(() => apiOf(context).categories(),
                  listKeys: const ['categories'])),
      ],
      child: Builder(
        builder: (context) {
          return BlocBuilder<ResourceCubit, ResourceState>(
            builder: (context, state) {
              final pagination = asMap(state.data['pagination']);
              final total = (numOf(pagination['total']) ?? 0).toInt();
              final titleText =
                  _q.text.isEmpty ? 'Wholesale Market Directory' : 'Search Results';

              final titleWidget = Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () => context.go('/home'),
                        child: const Text('Home', style: TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
                      ),
                      const Text(' › ', style: TextStyle(fontSize: 10, color: Colors.grey)),
                      const Text('Wholesale Directory', style: TextStyle(fontSize: 10, color: JaxColors.secondary, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Expanded(
                        child: Text.rich(
                          TextSpan(
                            children: [
                              TextSpan(text: titleText, style: JaxText.h3.copyWith(fontSize: 16)),
                              if (state.status == ResourceStatus.success) ...[
                                const TextSpan(text: ' '),
                                TextSpan(
                                  text: '($total items found)',
                                  style: JaxText.bodySmall.copyWith(
                                    color: Colors.grey.shade600,
                                    fontWeight: FontWeight.w500,
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                      IconButton(
                        icon: Icon(_grid ? Icons.list_rounded : Icons.grid_view_rounded, color: JaxColors.primaryContainer),
                        onPressed: () => setState(() => _grid = !_grid),
                        tooltip: _grid ? 'List View' : 'Grid View',
                      ),
                    ],
                  ),
                ],
              );

              return JaxPage(
                title: titleText,
                titleWidget: titleWidget,
                subtitle: null,
                child: Column(
                  children: [
                    Builder(
                      builder: (context) => Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Search Bar + Filter Button
                          Row(
                            children: [
                              Expanded(
                                child: Container(
                                  height: 42,
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: const Color(0xFFCBD5E1)),
                                  ),
                                  child: Row(
                                    children: [
                                      Expanded(
                                        child: TextField(
                                          controller: _q,
                                          style: const TextStyle(fontSize: 13),
                                          decoration: const InputDecoration(
                                            border: InputBorder.none,
                                            prefixIcon: Icon(Icons.search_rounded, size: 18, color: Colors.grey),
                                            hintText: 'Enter keywords to search wholesale products...',
                                            hintStyle: TextStyle(color: Colors.grey, fontSize: 12),
                                            contentPadding: EdgeInsets.symmetric(vertical: 10),
                                            isDense: true,
                                          ),
                                          onSubmitted: (_) => _reload(context),
                                        ),
                                      ),
                                      GestureDetector(
                                        onTap: () => _reload(context),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 12),
                                          height: double.infinity,
                                          decoration: const BoxDecoration(
                                            gradient: JaxGradients.primary,
                                            borderRadius: BorderRadius.only(
                                              topRight: Radius.circular(7),
                                              bottomRight: Radius.circular(7),
                                            ),
                                          ),
                                          child: const Icon(Icons.search_rounded, color: Colors.white, size: 16),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              GestureDetector(
                                onTap: () => _showFilterBottomSheet(context),
                                child: Container(
                                  height: 42,
                                  padding: const EdgeInsets.symmetric(horizontal: 12),
                                  decoration: BoxDecoration(
                                    color: _activeFilterCount > 0 ? JaxColors.secondary : const Color(0xFF0F172A),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.tune_rounded, color: Colors.white, size: 16),
                                      if (_activeFilterCount > 0) ...[
                                        const SizedBox(width: 4),
                                        Text(
                                          '($_activeFilterCount)',
                                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),

                          // Quick Filter Chips
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: [
                                _FilterChip(
                                  label: 'Verified Supplier',
                                  icon: Icons.verified_user_rounded,
                                  selected: _verified,
                                  onTap: () {
                                    setState(() => _verified = !_verified);
                                    _reload(context);
                                  },
                                ),
                                const SizedBox(width: 6),
                                _FilterChip(
                                  label: '90%+ Trust',
                                  icon: Icons.star_rounded,
                                  selected: _trust,
                                  onTap: () {
                                    setState(() => _trust = !_trust);
                                    _reload(context);
                                  },
                                ),
                                const SizedBox(width: 6),
                                _FilterChip(
                                  label: 'Top Rated (4.5★+)',
                                  icon: null,
                                  selected: _topRated,
                                  onTap: () {
                                    setState(() => _topRated = !_topRated);
                                    _reload(context);
                                  },
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),

                          // Sort Bar
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Row(
                              children: [
                                const Text('Sort By: ', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                                Expanded(
                                  child: SingleChildScrollView(
                                    scrollDirection: Axis.horizontal,
                                    child: Row(
                                      children: [
                                        _SortTab(
                                            label: 'RELEVANCE',
                                            value: 'relevance',
                                            selected: _sort,
                                            onTap: (v) {
                                              setState(() => _sort = v);
                                              _reload(context);
                                            }),
                                        _SortTab(
                                            label: 'NEWEST',
                                            value: 'newest',
                                            selected: _sort,
                                            onTap: (v) {
                                              setState(() => _sort = v);
                                              _reload(context);
                                            }),
                                        _SortTab(
                                            label: 'RATING',
                                            value: 'rating',
                                            selected: _sort,
                                            onTap: (v) {
                                              setState(() => _sort = v);
                                              _reload(context);
                                            }),
                                        _SortTab(
                                            label: 'FEATURED',
                                            value: 'featured',
                                            selected: _sort,
                                            onTap: (v) {
                                              setState(() => _sort = v);
                                              _reload(context);
                                            }),
                                        _SortTab(
                                            label: 'POPULAR',
                                            value: 'popular',
                                            selected: _sort,
                                            onTap: (v) {
                                              setState(() => _sort = v);
                                              _reload(context);
                                            }),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),

                          // Categories Horizontal Scroll Bar
                          BlocBuilder<CategoriesCubit, ResourceState>(
                            builder: (context, cats) => SizedBox(
                              height: 36,
                              child: ListView(
                                scrollDirection: Axis.horizontal,
                                children: [
                                  ChoiceChip(
                                    label: const Text('All Categories'),
                                    labelStyle: TextStyle(
                                      fontSize: 11,
                                      fontWeight: _category.isEmpty ? FontWeight.bold : FontWeight.normal,
                                      color: _category.isEmpty ? Colors.white : Colors.grey.shade700,
                                    ),
                                    selected: _category.isEmpty,
                                    selectedColor: JaxColors.primaryContainer,
                                    backgroundColor: Colors.grey.shade100,
                                    onSelected: (_) => _setCategory(context, ''),
                                  ),
                                  const SizedBox(width: 6),
                                  ...cats.items.map((cat) => Padding(
                                        padding: const EdgeInsets.only(right: 6),
                                        child: ChoiceChip(
                                          label: Text(textOf(cat['name'])),
                                          labelStyle: TextStyle(
                                            fontSize: 11,
                                            fontWeight: _category == cat['id'] ? FontWeight.bold : FontWeight.normal,
                                            color: _category == cat['id'] ? Colors.white : Colors.grey.shade700,
                                          ),
                                          selected: _category == cat['id'],
                                          selectedColor: JaxColors.primaryContainer,
                                          backgroundColor: Colors.grey.shade100,
                                          onSelected: (_) => _setCategory(context, textOf(cat['id'])),
                                        ),
                                      )),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Products Listings (Grid / List View)
                    BlocBuilder<ResourceCubit, ResourceState>(
                      builder: (context, state) => AsyncContent(
                        state: state,
                        emptyTitle: 'No products match these filters',
                        onRetry: () => _reload(context),
                        builder: (_) {
                          final items = state.items;
                          if (items.isEmpty) {
                            return const EmptyState(title: 'No wholesale listings found');
                          }

                          return Column(
                            children: [
                              if (_grid)
                                GridView.builder(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                    crossAxisCount: 2,
                                    childAspectRatio: 0.38,
                                    crossAxisSpacing: 10,
                                    mainAxisSpacing: 10,
                                  ),
                                  itemCount: items.length,
                                  itemBuilder: (context, idx) {
                                    return ListingTile(
                                      item: items[idx],
                                      grid: true,
                                      showChat: true,
                                    );
                                  },
                                )
                              else
                                Column(
                                  children: items.map((item) => Padding(
                                    padding: const EdgeInsets.only(bottom: 12),
                                    child: ListingTile(
                                      item: item,
                                      grid: false,
                                      showChat: true,
                                    ),
                                  )).toList(),
                                ),

                              if (state.totalPages > 1) ...[
                                const SizedBox(height: 16),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: const Color(0xFFE2E8F0)),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      TextButton(
                                        onPressed: _page > 1 ? () => _pageTo(context, _page - 1) : null,
                                        child: const Text('PREV', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: JaxColors.secondary)),
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 12),
                                        child: Text(
                                          'PAGE ${state.page} / ${state.totalPages}',
                                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: JaxColors.primaryContainer),
                                        ),
                                      ),
                                      TextButton(
                                        onPressed: _page < state.totalPages ? () => _pageTo(context, _page + 1) : null,
                                        child: const Text('NEXT', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: JaxColors.secondary)),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ],
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 24),
                    const TradeSafetyFooter(),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }

  void _setCategory(BuildContext context, String category) {
    setState(() {
      _category = category;
      _page = 1;
    });
    _reload(context);
  }

  void _pageTo(BuildContext context, int page) {
    setState(() => _page = page);
    _reload(context);
  }

  void _reload(BuildContext context) {
    context.read<ResourceCubit>().load(
        () => apiOf(context).searchListings(_params),
        listKeys: const ['listings'],
        refresh: true);
  }
}

// ─── Quick-filter pill chip ────────────────────────────────────────────────
class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onTap,
    this.icon,
  });
  final String label;
  final IconData? icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = selected ? JaxColors.secondary : JaxColors.onSurfaceVariant;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: selected
              ? JaxColors.secondary.withValues(alpha: .12)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? JaxColors.secondary : JaxColors.outlineVariant,
            width: 1.2,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 14, color: color),
              const SizedBox(width: 5),
            ],
            Text(
              label,
              style: JaxText.label.copyWith(
                fontSize: 12,
                color: color,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Sort-by inline tab ────────────────────────────────────────────────────
class _SortTab extends StatelessWidget {
  const _SortTab({
    required this.label,
    required this.value,
    required this.selected,
    required this.onTap,
  });
  final String label;
  final String value;
  final String selected;
  final ValueChanged<String> onTap;

  @override
  Widget build(BuildContext context) {
    final isSelected = value == selected;
    return GestureDetector(
      onTap: () => onTap(value),
      child: Padding(
        padding: const EdgeInsets.only(right: 20),
        child: Text(
          label,
          style: JaxText.label.copyWith(
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color:
                isSelected ? JaxColors.secondary : JaxColors.onSurfaceVariant,
            letterSpacing: 0.4,
          ),
        ),
      ),
    );
  }
}

class ListingDetailScreen extends StatefulWidget {
  const ListingDetailScreen({required this.id, super.key});
  final String id;

  @override
  State<ListingDetailScreen> createState() => _ListingDetailScreenState();
}

class _ListingDetailScreenState extends State<ListingDetailScreen> {
  final _dispatchKey = GlobalKey();
  String get id => widget.id;

  void _scrollToDispatch() {
    final ctx = _dispatchKey.currentContext;
    if (ctx != null) {
      Scrollable.ensureVisible(
        ctx,
        duration: const Duration(milliseconds: 600),
        curve: Curves.easeInOut,
        alignment: 0.05,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          ResourceCubit()..load(() => apiOf(context).listing(widget.id)),
      child: BlocBuilder<ResourceCubit, ResourceState>(
        builder: (context, state) => JaxPage(
          title: state.data.isEmpty ? 'Listing' : textOf(state.data['title']),
          subtitle: categoryName(state.data),
          child: AsyncContent(
            state: state,
            onRetry: () => context
                .read<ResourceCubit>()
                .load(() => apiOf(context).listing(widget.id)),
            builder: (_) {
              final item = state.data;
              final product = asMap(item['productDetail']);
              final service = asMap(item['serviceDetail']);
              final seller = asMap(item['seller']);
              final media = asList(item['media']);
              final currentUser = context.watch<AuthCubit>().state.user;
              final isOwner = currentUser != null &&
                  textOf(currentUser['id']) == textOf(seller['id']);
              final basePriceNum = numOf(product['pricePerUnit']);
              final bulkSlabs = asList(product['bulkPriceSlabs']);
              final productCerts = asStringList(product['certifications']);
              final businessProfile = asMap(seller['businessProfile']);
              final businessCerts = asList(businessProfile['certifications']);
              final hasCerts =
                  productCerts.isNotEmpty || businessCerts.isNotEmpty;
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  AspectRatio(
                    aspectRatio: 1,
                    child: JaxCard(
                      padding: EdgeInsets.zero,
                      child: media.isEmpty
                          ? const Center(
                              child: Icon(Icons.factory_rounded,
                                  size: 56, color: JaxColors.outlineVariant))
                          : Image.network(textOf(media.first['url']),
                              fit: BoxFit.cover),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(children: [
                    StatusPill(label: statusOf(item, 'PRODUCT')),
                    const SizedBox(width: 8),
                    StatusPill(label: textOf(seller['kycStatus'], 'VERIFIED'))
                  ]),
                  const SizedBox(height: 14),
                  Text(textOf(item['title']), style: JaxText.h1),
                  const SizedBox(height: 10),
                  RatingReviewBar(
                    rating: (item['rating'] as num?)?.toDouble() ?? 0.0,
                    reviewCount: (item['reviewCount'] as num?)?.toInt() ?? 0,
                  ),
                  const SizedBox(height: 18),
                  JaxCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          product.isNotEmpty
                              ? (product['priceType'] == 'ON_REQUEST'
                                  ? 'Ask Price'
                                  : product['priceType'] == 'RANGE' &&
                                          product['priceRangeMin'] != null
                                      ? 'Rs ${numOf(product['priceRangeMin'])?.toStringAsFixed(0)} - Rs ${numOf(product['priceRangeMax'])?.toStringAsFixed(0)}'
                                      : product['priceType'] == 'NEGOTIABLE'
                                          ? '${money(product['pricePerUnit'])} (Negotiable)'
                                          : money(product['pricePerUnit']))
                              : money(service['basePrice']),
                          style: JaxText.h2,
                        ),
                        const SizedBox(height: 6),
                        Text(
                            product.isNotEmpty
                                ? 'MOQ ${textOf(product['minOrderQty'], '1')} ${textOf(product['unitOfMeasure'], 'Pcs')}'
                                : '${textOf(service['serviceMode'], 'Service')} • ${textOf(service['typicalDuration'], 'Flexible timeline')}',
                            style: JaxText.bodySmall),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  SelectedConfigurationCard(
                    configurations: asList(item['configurations']),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: JaxColors.primaryContainer,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(JaxRadius.lg),
                        ),
                      ),
                      onPressed: _scrollToDispatch,
                      icon: const Icon(Icons.send_rounded, size: 18),
                      label: Text(
                        'INITIATE INQUIRY DISPATCH',
                        style: JaxText.label.copyWith(
                            color: Colors.white,
                            fontSize: 13,
                            letterSpacing: 0.8),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: JaxColors.primaryContainer,
                        side: const BorderSide(
                            color: JaxColors.primaryContainer, width: 1.4),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(JaxRadius.lg),
                        ),
                      ),
                      onPressed: () => showDialog(
                        context: context,
                        builder: (_) => SupplierProfileDialog(seller: seller),
                      ),
                      icon: const Icon(Icons.business_rounded, size: 17),
                      label: Text(
                        'VIEW SUPPLIER PROFILE',
                        style: JaxText.label.copyWith(
                            color: JaxColors.primaryContainer,
                            fontSize: 12,
                            letterSpacing: 0.7),
                      ),
                    ),
                  ),
                  if (product.isNotEmpty) ...[
                    const SizedBox(height: 18),
                    SpecsGrid(data: product),
                  ],
                  const SizedBox(height: 18),
                  JaxCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('MERCHANT PROFILE', style: JaxText.h3),
                        const SizedBox(height: 12),
                        Row(children: [
                          JaxAvatar(
                              name: sellerName(item),
                              url: textOf(seller['avatarUrl'])),
                          const SizedBox(width: 12),
                          Expanded(
                              child:
                                  Text(sellerName(item), style: JaxText.title)),
                          if (!isOwner)
                            TrustScore(
                                score: (numOf(seller['trustScore']) ?? 0) > 0
                                    ? numOf(seller['trustScore'])!
                                    : 90)
                        ]),
                      ],
                    ),
                  ),
                  if (product.isNotEmpty && bulkSlabs.isNotEmpty) ...[
                    const SizedBox(height: 18),
                    JaxCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'TIERED BULK SLABS PRICING MATRIX (IN ${textOf(product['unitOfMeasure'], 'Units').toUpperCase()})',
                            style: JaxText.h3,
                          ),
                          const SizedBox(height: 16),
                          Table(
                            columnWidths: const {
                              0: FlexColumnWidth(1),
                              1: FlexColumnWidth(1),
                              2: FlexColumnWidth(1),
                            },
                            children: [
                              // Header row
                              TableRow(
                                decoration: BoxDecoration(
                                  color: Colors.grey.shade50,
                                ),
                                children: [
                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 8, horizontal: 4),
                                    child: Text('MIN QTY VOLUME',
                                        style: JaxText.label.copyWith(
                                            color: JaxColors.outline,
                                            fontSize: 9)),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 8, horizontal: 4),
                                    child: Text('MAX QTY VOLUME',
                                        style: JaxText.label.copyWith(
                                            color: JaxColors.outline,
                                            fontSize: 9)),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 8, horizontal: 4),
                                    child: Text('UNIT RATE PRICE',
                                        style: JaxText.label.copyWith(
                                            color: JaxColors.outline,
                                            fontSize: 9)),
                                  ),
                                ],
                              ),
                              // Divider/spacing
                              const TableRow(
                                children: [
                                  Divider(height: 12, thickness: 0.5),
                                  Divider(height: 12, thickness: 0.5),
                                  Divider(height: 12, thickness: 0.5),
                                ],
                              ),
                              ...bulkSlabs.asMap().entries.expand((entry) {
                                final index = entry.key;
                                final slab = asMap(entry.value);
                                final minQty =
                                    slab['minQty']?.toString() ?? '1';
                                final maxQty = slab['maxQty'] != null
                                    ? slab['maxQty'].toString()
                                    : '∞';
                                final priceVal = numOf(slab['price']) ?? 0;
                                final priceText =
                                    money(priceVal).replaceAll('Rs ', '₹');

                                return [
                                  TableRow(
                                    children: [
                                      Padding(
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 10, horizontal: 4),
                                        child: Text(minQty,
                                            style: JaxText.title.copyWith(
                                                fontSize: 12,
                                                color: JaxColors
                                                    .primaryContainer)),
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 10, horizontal: 4),
                                        child: Text(maxQty,
                                            style: JaxText.bodySmall
                                                .copyWith(fontSize: 12)),
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 10, horizontal: 4),
                                        child: Text(
                                          priceText,
                                          style: JaxText.title.copyWith(
                                              fontSize: 12,
                                              color: JaxColors.secondaryDark),
                                        ),
                                      ),
                                    ],
                                  ),
                                  if (index < bulkSlabs.length - 1)
                                    const TableRow(
                                      children: [
                                        Divider(height: 1, thickness: 0.5),
                                        Divider(height: 1, thickness: 0.5),
                                        Divider(height: 1, thickness: 0.5),
                                      ],
                                    ),
                                ];
                              }),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                  if (hasCerts) ...[
                    const SizedBox(height: 18),
                    JaxCard(
                      padding: EdgeInsets.zero,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 14),
                            child: const Text(
                              'REGULATORY STANDARDS & COMPLIANCE CERTIFICATES',
                              style: JaxText.h3,
                            ),
                          ),
                          const Divider(
                              height: 1, color: JaxColors.outlineVariant),
                          Padding(
                            padding: const EdgeInsets.all(16),
                            child: Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: [
                                for (var cert in productCerts)
                                  CertificationChip(
                                    label: cert.toString(),
                                    isVerified: false,
                                    color: JaxColors.primary,
                                  ),
                                for (var certObj in businessCerts)
                                  (() {
                                    final certMap = asMap(certObj);
                                    final name = textOf(certMap['certName']);
                                    final isVerified =
                                        certMap['isVerified'] == true;
                                    return CertificationChip(
                                      label: name,
                                      isVerified: isVerified,
                                      color: isVerified
                                          ? JaxColors.success
                                          : JaxColors.outline,
                                    );
                                  })(),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: 18),
                  JaxCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('ACCEPTED SETTLEMENT CHANNELS',
                            style: JaxText.h3),
                        const SizedBox(height: 12),
                        const Text(
                            '• JAXMART ESCROW CLEARING\n• TELEGRAPHIC TRANSFER (T/T)\n• IRREVOCABLE LETTER OF CREDIT (L/C)\n• NET BANKING / NEFT SETTLEMENT',
                            style: JaxText.bodySmall),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  JaxCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('TECHNICAL PROSPECTUS & SCOPE DESCRIPTION',
                            style: JaxText.h3),
                        const SizedBox(height: 12),
                        Text(textOf(item['description']),
                            style: JaxText.bodyMedium),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  DispatchInquiryCard(
                      key: _dispatchKey,
                      id: widget.id,
                      item: item,
                      product: product),
                  const SizedBox(height: 24),
                  const TradeSafetyFooter(),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class SupplierProfileDialog extends StatelessWidget {
  const SupplierProfileDialog({required this.seller, super.key});
  final JsonMap seller;

  String _formatWorkforce(String? range) {
    if (range == null || range.isEmpty) return '11-50 Employees';
    switch (range.toUpperCase()) {
      case 'ONE_TO_TEN':
        return '1-10 Employees';
      case 'ELEVEN_TO_FIFTY':
        return '11-50 Employees';
      case 'FIFTY_ONE_TO_TWO_HUNDRED':
        return '51-200 Employees';
      case 'TWO_HUNDRED_PLUS':
        return '200+ Employees';
      default:
        return range.replaceAll('_', ' ');
    }
  }

  @override
  Widget build(BuildContext context) {
    final business = asMap(seller['businessProfile']);
    final name = textOf(
        business['businessName'], textOf(seller['fullName'], 'Supplier'));
    final kycStatus = textOf(seller['kycStatus'], 'VERIFIED');
    final rawTrust = numOf(seller['trustScore']);
    final trust = (rawTrust != null && rawTrust > 0) ? rawTrust.toInt() : 90;
    final trustValue = (trust.clamp(0, 100) / 100.0);
    final registryProfile =
        textOf(business['businessType'], 'MANUFACTURER / SUPPLIER');
    final rawEstYear = business['establishedYear'];
    final establishmentYear =
        rawEstYear != null ? rawEstYear.toString() : '2015';
    final workforce = _formatWorkforce(textOf(business['employeeRange']));
    final gstin = textOf(business['gstin']);
    final hasGst = gstin.isNotEmpty && gstin != 'N/A';

    final addresses = asList(seller['addresses']);
    final primaryAddress = addresses.isNotEmpty ? addresses.first : null;
    final location = primaryAddress != null
        ? '${textOf(primaryAddress['city'])}, ${textOf(primaryAddress['state'])}'
        : 'India';

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // ── Dark header ──
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration:
                  const BoxDecoration(color: JaxColors.primaryContainer),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      JaxAvatar(
                          name: name,
                          url: textOf(seller['avatarUrl']),
                          size: 46),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              name.toUpperCase(),
                              style: JaxText.title
                                  .copyWith(color: Colors.white, fontSize: 13),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(Icons.verified_rounded,
                                    color: JaxColors.secondary, size: 14),
                                const SizedBox(width: 4),
                                Text(
                                  kycStatus.replaceAll('_', ' ') + ' SUPPLIER',
                                  style: JaxText.label.copyWith(
                                      color: JaxColors.secondary, fontSize: 10),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(Icons.location_on_rounded,
                                    color: Colors.white54, size: 13),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    location,
                                    style: JaxText.bodySmall.copyWith(
                                        color: Colors.white70, fontSize: 10),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: const Icon(Icons.close_rounded,
                            color: Colors.white54, size: 20),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(99),
                          child: LinearProgressIndicator(
                            value: trustValue,
                            minHeight: 7,
                            backgroundColor: Colors.white24,
                            color: JaxColors.secondary,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        '$trust% TRUST',
                        style: JaxText.label.copyWith(
                            color: JaxColors.secondary,
                            fontSize: 11,
                            fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // ── Detail rows ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Column(
                children: [
                  _ProfileRow(
                      label: 'Registry Profile', value: registryProfile),
                  _ProfileRow(
                      label: 'Establishment Year', value: establishmentYear),
                  _ProfileRow(label: 'Operational Workforce', value: workforce),
                  if (hasGst)
                    _ProfileRow(label: 'GST Registry ID', value: gstin),
                ],
              ),
            ),
            // ── About the Merchant ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Divider(height: 10, thickness: 0.5),
                  const SizedBox(height: 8),
                  Text(
                    'ABOUT THE MERCHANT',
                    style: JaxText.label.copyWith(
                        color: JaxColors.primary,
                        fontSize: 10,
                        letterSpacing: 1),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    textOf(
                      business['description'],
                      '$name is an established $registryProfile based in $location, specializing in high-quality ${textOf(seller['primaryCategory'], 'Industrial Goods').toLowerCase()} and premium B2B solutions.',
                    ),
                    style: JaxText.bodySmall.copyWith(
                        color: JaxColors.onSurfaceVariant,
                        fontSize: 11.5,
                        height: 1.35),
                  ),
                ],
              ),
            ),
            // ── Trade Assurance ──
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: JaxColors.secondary.withValues(alpha: .07),
                  border: Border.all(
                      color: JaxColors.secondary.withValues(alpha: .18)),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      height: 34,
                      width: 34,
                      decoration: BoxDecoration(
                        color: JaxColors.secondary.withValues(alpha: .12),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.shield_rounded,
                          color: JaxColors.secondary, size: 18),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('TRADE ASSURANCE INDEX',
                              style: JaxText.label.copyWith(
                                  color: JaxColors.secondaryDark,
                                  fontSize: 11)),
                          const SizedBox(height: 4),
                          Text(
                            'Contracts registered under Trade Assurance include escrow protection and transit compliance guarantees.',
                            style: JaxText.bodySmall.copyWith(
                                color: JaxColors.secondary, fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileRow extends StatelessWidget {
  const _ProfileRow({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 11),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 120,
                child: Text(label,
                    style: JaxText.bodySmall
                        .copyWith(color: JaxColors.onSurfaceVariant)),
              ),
              Expanded(
                child: Text(
                  value,
                  style:
                      JaxText.bodySmall.copyWith(fontWeight: FontWeight.w700),
                  textAlign: TextAlign.end,
                ),
              ),
            ],
          ),
        ),
        const Divider(height: 1, thickness: 0.6),
      ],
    );
  }
}

class SelectedConfigurationCard extends StatefulWidget {
  const SelectedConfigurationCard({required this.configurations, super.key});
  final List<JsonMap> configurations;

  @override
  State<SelectedConfigurationCard> createState() =>
      _SelectedConfigurationCardState();
}

class _SelectedConfigurationCardState extends State<SelectedConfigurationCard> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    if (widget.configurations.isEmpty) return const SizedBox.shrink();
    final selected = widget.configurations[_selectedIndex];
    final stock = (selected['stock'] as num?)?.toInt() ?? 0;
    final stockText = stock >= 999
        ? 'Available on demand'
        : '$stock units available for immediate dispatch';

    return JaxCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('SELECTED CONFIGURATION', style: JaxText.h3),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: List.generate(widget.configurations.length, (i) {
              final cfg = widget.configurations[i];
              final isSelected = i == _selectedIndex;
              final cfgPrice = (cfg['price'] as num?)?.toDouble() ?? 0;
              return GestureDetector(
                onTap: () => setState(() => _selectedIndex = i),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? JaxColors.primary.withValues(alpha: .12)
                        : Colors.transparent,
                    border: Border.all(
                      color: isSelected
                          ? JaxColors.primary
                          : JaxColors.outlineVariant,
                      width: isSelected ? 1.8 : 1.0,
                    ),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        textOf(cfg['name']),
                        style: JaxText.bodySmall.copyWith(
                          fontWeight:
                              isSelected ? FontWeight.w700 : FontWeight.w500,
                          color: isSelected ? JaxColors.primary : null,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        money(cfgPrice),
                        style: JaxText.label.copyWith(
                          color: isSelected
                              ? JaxColors.primary
                              : JaxColors.outlineVariant,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(
                stock >= 999
                    ? Icons.inventory_2_rounded
                    : Icons.local_shipping_rounded,
                size: 15,
                color: JaxColors.secondary,
              ),
              const SizedBox(width: 6),
              Text(
                stockText,
                style: JaxText.bodySmall.copyWith(
                    color: JaxColors.secondary, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class RatingReviewBar extends StatelessWidget {
  const RatingReviewBar(
      {required this.rating, required this.reviewCount, super.key});
  final double rating;
  final int reviewCount;

  @override
  Widget build(BuildContext context) {
    // If rating is 0.0 or less, fall back to 4.9 to match web behavior
    final displayRating = rating > 0.0 ? rating : 4.9;

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const Icon(
          Icons.star_rounded,
          color: Color(0xFFFFB300),
          size: 18,
        ),
        const SizedBox(width: 4),
        Text(
          displayRating.toStringAsFixed(1),
          style: JaxText.bodyMedium.copyWith(
            fontWeight: FontWeight.bold,
            color: JaxColors.onSurface,
          ),
        ),
        const SizedBox(width: 6),
        Text(
          '•',
          style: JaxText.bodySmall.copyWith(
            color: JaxColors.onSurfaceVariant.withValues(alpha: 0.5),
          ),
        ),
        const SizedBox(width: 6),
        Text(
          '$reviewCount ${reviewCount == 1 ? 'review' : 'reviews'}',
          style: JaxText.bodySmall.copyWith(
            color: JaxColors.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}

class SpecsGrid extends StatelessWidget {
  const SpecsGrid({required this.data, super.key});
  final JsonMap data;

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) return const SizedBox.shrink();

    final brand = textOf(data['brand'], 'OEM/ODM');
    final sku = textOf(data['sku']);
    final country = textOf(data['countryOfOrigin'], 'India');
    final minOrderQty = numOf(data['minOrderQty']) ?? 1;
    final unitOfMeasure = textOf(data['unitOfMeasure'], 'Pieces');
    final leadTimeDays = numOf(data['leadTimeDays']);
    final supplyAbility = textOf(data['supplyAbility']);
    final deliveryTime = textOf(data['deliveryTime']);
    final packagingDetails = textOf(data['packagingDetails']);
    final paymentTerms = textOf(data['paymentTerms']);
    final fobPort = textOf(data['fobPort']);
    final warranty = textOf(data['warranty']);
    final returnPolicy = textOf(data['returnPolicy']);
    final hsnCode = textOf(data['hsnCode']);
    final gstRate = numOf(data['gstRate']);

    final rows = <MapEntry<String, String>>[
      MapEntry('Brand / Manufacturer', brand),
      if (sku.isNotEmpty) MapEntry('Model SKU', sku),
      MapEntry('Place of Origin', country),
      MapEntry('Min. Order Quantity', '$minOrderQty $unitOfMeasure'),
      if (leadTimeDays != null)
        MapEntry('Global Lead Time', '$leadTimeDays Days'),
      if (supplyAbility.isNotEmpty) MapEntry('Supply Capacity', supplyAbility),
      if (deliveryTime.isNotEmpty) MapEntry('Transit Terms', deliveryTime),
      if (packagingDetails.isNotEmpty)
        MapEntry('Packaging Format', packagingDetails),
      if (paymentTerms.isNotEmpty) MapEntry('Payment Terms', paymentTerms),
      if (fobPort.isNotEmpty) MapEntry('FOB Port', fobPort),
      if (warranty.isNotEmpty) MapEntry('Warranty Duration', warranty),
      if (returnPolicy.isNotEmpty)
        MapEntry('Industrial Return Policy', returnPolicy),
      if (hsnCode.isNotEmpty) MapEntry('HSN Code', hsnCode),
      if (gstRate != null) MapEntry('GST Rate', '$gstRate%'),
    ];

    if (rows.isEmpty) return const SizedBox.shrink();

    return JaxCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('PRODUCT SPECIFICATIONS REGISTRY', style: JaxText.h3),
          const SizedBox(height: 12),
          ...rows.map((e) => Padding(
                padding: const EdgeInsets.only(bottom: 9),
                child: Row(
                  children: [
                    Expanded(
                      flex: 4,
                      child: Text(
                        e.key.toUpperCase(),
                        style: JaxText.bodySmall
                            .copyWith(color: Colors.grey.shade500),
                      ),
                    ),
                    Expanded(
                      flex: 6,
                      child: Text(
                        e.value,
                        style: JaxText.bodySmall
                            .copyWith(fontWeight: FontWeight.w700),
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}

class DispatchInquiryCard extends StatefulWidget {
  const DispatchInquiryCard(
      {required this.id, required this.item, required this.product, super.key});
  final String id;
  final JsonMap item;
  final JsonMap product;

  @override
  State<DispatchInquiryCard> createState() => _DispatchInquiryCardState();
}

class _DispatchInquiryCardState extends State<DispatchInquiryCard> {
  final _formKey = GlobalKey<FormState>();
  final _volume = TextEditingController();
  final _unit = TextEditingController();
  final _message = TextEditingController();
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _unit.text = textOf(widget.product['unitOfMeasure'], 'Piece');
  }

  @override
  Widget build(BuildContext context) {
    return JaxCard(
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('DISPATCH SUPPLIER INQUIRY', style: JaxText.h3),
            const SizedBox(height: 16),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const FieldLabel('TARGET VOLUME (PIECE)'),
                      TextFormField(
                        controller: _volume,
                        validator: (v) =>
                            v == null || v.trim().isEmpty ? 'Required' : null,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                            hintText:
                                'Min: ${textOf(widget.product['minOrderQty'], '100')}'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const FieldLabel('LOGISTICS UNIT TYPE'),
                      TextFormField(
                        controller: _unit,
                        validator: (v) =>
                            v == null || v.trim().isEmpty ? 'Required' : null,
                        decoration: const InputDecoration(),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const FieldLabel('INQUIRY SPECIFICATIONS MESSAGE'),
            TextFormField(
              controller: _message,
              validator: (v) =>
                  v == null || v.trim().isEmpty ? 'Required' : null,
              maxLines: 4,
              decoration: InputDecoration(
                  hintText: 'Provide clear scope descriptions...'),
            ),
            const SizedBox(height: 16),
            JaxButton(
              label: 'DISPATCH RFQ MESSAGE',
              loading: _loading,
              onPressed: _loading
                  ? null
                  : () async {
                      if (_formKey.currentState!.validate()) {
                        final messenger = ScaffoldMessenger.of(context);
                        final router = GoRouter.of(context);
                        final api = apiOf(context);

                        setState(() => _loading = true);
                        try {
                          final seller = asMap(widget.item['seller']);
                          final sellerId = textOf(seller['id']);
                          if (sellerId.isEmpty) {
                            throw Exception('Seller information is missing.');
                          }
                          final volume = _volume.text.trim();
                          final unit = _unit.text.trim();
                          final specifications = _message.text.trim();
                          final targetQuantity =
                              volume.isNotEmpty ? '$volume $unit' : '';
                          final payloadMessage = targetQuantity.isNotEmpty
                              ? '$specifications\n\n*Target Volume: $targetQuantity*'
                              : specifications;

                          final conv = await api.startConversation({
                            'recipientId': sellerId,
                            'listingId': widget.id,
                            'initialMessage': payloadMessage,
                          });

                          messenger.showSnackBar(
                            const SnackBar(
                                content:
                                    Text('Inquiry dispatched successfully!')),
                          );
                          router.push('/messages/${conv['id']}');
                        } catch (err) {
                          messenger.showSnackBar(
                            SnackBar(
                                content: Text(err
                                    .toString()
                                    .replaceAll('Exception: ', ''))),
                          );
                        } finally {
                          if (mounted) {
                            setState(() => _loading = false);
                          }
                        }
                      }
                    },
            ),
          ],
        ),
      ),
    );
  }
}

class RfqListScreen extends StatefulWidget {
  const RfqListScreen({this.sellerMode = false, super.key});
  final bool sellerMode;

  @override
  State<RfqListScreen> createState() => _RfqListScreenState();
}

class _RfqListScreenState extends State<RfqListScreen> {
  late String _tab;
  String _search = '';
  final _searchCtrl = TextEditingController();

  bool get sellerMode => widget.sellerMode;

  List<String> get _currentTabs => sellerMode
      ? const ['ALL REQUESTS', 'MATCHED REQUESTS']
      : const ['OPEN', 'AWARDED', 'CLOSED'];

  @override
  void initState() {
    super.initState();
    _tab = widget.sellerMode ? 'ALL REQUESTS' : 'OPEN';
  }

  List<JsonMap> _filtered(List<JsonMap> items) {
    return items.where((item) {
      if (sellerMode) {
        final matchSearch = _search.isEmpty ||
            textOf(item['title'])
                .toLowerCase()
                .contains(_search.toLowerCase()) ||
            textOf(item['description'])
                .toLowerCase()
                .contains(_search.toLowerCase());
        return matchSearch;
      }
      final status = textOf(item['status']).toUpperCase();
      final matchTab = _tab == 'OPEN'
          ? (status == 'OPEN' || status.isEmpty)
          : _tab == 'AWARDED'
              ? status == 'AWARDED'
              : (status == 'CLOSED' ||
                  status == 'CANCELLED' ||
                  status == 'COMPLETED');
      final matchSearch = _search.isEmpty ||
          textOf(item['title']).toLowerCase().contains(_search.toLowerCase()) ||
          textOf(item['description'])
              .toLowerCase()
              .contains(_search.toLowerCase());
      return matchTab && matchSearch;
    }).toList();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ResourceCubit()
        ..load(
          () => sellerMode
              ? apiOf(context)
                  .sellerRfqInbox({'matchOnly': 'false', 'limit': 20})
              : apiOf(context).myRfqs({'limit': 20}),
          listKeys: const ['rfqs'],
        ),
      child: JaxPage(
        title: sellerMode ? 'BUYER REQUESTS' : 'Sourcing Dashboard',
        topWidget: sellerMode
            ? null
            : Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                          color: Color(0xFF10B981),
                          shape: BoxShape.circle)),
                  const SizedBox(width: 6),
                  const Text('MY REQUESTS',
                      style: TextStyle(
                          color: Color(0xFF0D9488),
                          fontWeight: FontWeight.w900,
                          fontSize: 10,
                          letterSpacing: 1.2)),
                ],
              ),
        subtitle: sellerMode
            ? 'Active buyer requests awaiting quotes.'
            : 'Manage your requests, compare quotes, and source products efficiently.',
        child: BlocBuilder<ResourceCubit, ResourceState>(
          builder: (context, state) {
            final allItems = state.items;
            final filtered = _filtered(allItems);
            final quotesCount = allItems.fold<int>(0, (sum, item) {
              final q = item['quotesCount'];
              return sum + (q is int ? q : 0);
            });

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Stats + New Request button ────────────────────────────
                if (!sellerMode) ...[
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.02),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('YOUR REQUESTS',
                                        style: TextStyle(
                                            fontFamily: JaxText.heading,
                                            fontSize: 9,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.grey,
                                            letterSpacing: 0.5)),
                                    const SizedBox(height: 3),
                                    Text('${allItems.length}',
                                        style: const TextStyle(
                                            fontFamily: JaxText.heading,
                                            fontSize: 20,
                                            fontWeight: FontWeight.w900,
                                            color: Color(0xFF0F172A))),
                                  ],
                                ),
                              ),
                              Container(
                                  width: 1,
                                  height: 30,
                                  color: const Color(0xFFE2E8F0)),
                              Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.only(left: 14),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Text('QUOTES RECEIVED',
                                          style: TextStyle(
                                              fontFamily: JaxText.heading,
                                              fontSize: 9,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.grey,
                                              letterSpacing: 0.5)),
                                      const SizedBox(height: 3),
                                      Text('$quotesCount',
                                          style: const TextStyle(
                                              fontFamily: JaxText.heading,
                                              fontSize: 20,
                                              fontWeight: FontWeight.w900,
                                              color: Color(0xFF2563EB))),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          foregroundColor: Colors.white,
                          elevation: 1,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 14),
                        ),
                        icon: const Icon(Icons.add_rounded, size: 18),
                        label: const Text(
                          'New Request',
                          style: TextStyle(
                              fontFamily: JaxText.heading,
                              fontSize: 12,
                              fontWeight: FontWeight.bold),
                        ),
                        onPressed: () => context.push('/rfq/create'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                ],

                // ── Tabs + Search ─────────────────────────────────────────
                if (sellerMode)
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final isWide = constraints.maxWidth > 580;
                      return Flex(
                        direction: isWide ? Axis.horizontal : Axis.vertical,
                        crossAxisAlignment: isWide
                            ? CrossAxisAlignment.center
                            : CrossAxisAlignment.stretch,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          // Search Input
                          SizedBox(
                            width: isWide ? 280 : double.infinity,
                            height: 44,
                            child: TextField(
                              controller: _searchCtrl,
                              onChanged: (v) => setState(() => _search = v),
                              style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A)),
                              decoration: InputDecoration(
                                hintText: 'Search keywords...',
                                hintStyle: TextStyle(
                                  color: Colors.grey.shade400,
                                  fontSize: 13,
                                ),
                                prefixIcon: const Icon(
                                  Icons.search_rounded,
                                  size: 18,
                                  color: Color(0xFF94A3B8),
                                ),
                                contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
                                filled: true,
                                fillColor: Colors.white,
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(14),
                                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(14),
                                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(14),
                                  borderSide: const BorderSide(color: Color(0xFF1D4ED8), width: 1.5),
                                ),
                              ),
                            ),
                          ),
                          if (!isWide) const SizedBox(height: 12),
                          // Tabs Switcher
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFFF1F5F9)),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.03),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Row(
                              mainAxisSize: isWide ? MainAxisSize.min : MainAxisSize.max,
                              children: _currentTabs.map((tab) {
                                final selected = _tab == tab;
                                return Expanded(
                                  flex: isWide ? 0 : 1,
                                  child: GestureDetector(
                                    onTap: () {
                                      if (_tab != tab) {
                                        setState(() => _tab = tab);
                                        final cubit = context.read<ResourceCubit>();
                                        cubit.clear();
                                        cubit.load(
                                          () => apiOf(context).sellerRfqInbox({
                                            'matchOnly': tab == 'MATCHED REQUESTS'
                                                ? 'true'
                                                : 'false',
                                            'search': _search,
                                            'limit': 20,
                                          }),
                                          listKeys: const ['rfqs'],
                                        );
                                      }
                                    },
                                    child: AnimatedContainer(
                                      duration: const Duration(milliseconds: 180),
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 16, vertical: 9),
                                      alignment: Alignment.center,
                                      decoration: BoxDecoration(
                                        color: selected
                                            ? const Color(0xFF0F172A)
                                            : Colors.transparent,
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        tab,
                                        style: TextStyle(
                                          fontSize: 10,
                                          letterSpacing: 0.5,
                                          color: selected
                                              ? Colors.white
                                              : Colors.grey.shade500,
                                          fontWeight: selected
                                              ? FontWeight.w900
                                              : FontWeight.w700,
                                        ),
                                      ),
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                        ],
                      );
                    },
                  )
                else
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        children: [
                          // Status Tabs
                          Container(
                            padding: const EdgeInsets.all(3),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: _currentTabs.map((tab) {
                                final selected = _tab == tab;
                                return GestureDetector(
                                  onTap: () => setState(() => _tab = tab),
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 180),
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 16, vertical: 8),
                                    decoration: BoxDecoration(
                                      color: selected
                                          ? Colors.white
                                          : Colors.transparent,
                                      borderRadius: BorderRadius.circular(9),
                                      boxShadow: selected
                                          ? [
                                              BoxShadow(
                                                color: Colors.black
                                                    .withValues(alpha: 0.04),
                                                blurRadius: 4,
                                                offset: const Offset(0, 1),
                                              ),
                                            ]
                                          : null,
                                    ),
                                    child: Text(
                                      tab,
                                      style: TextStyle(
                                        fontFamily: JaxText.heading,
                                        fontSize: 11,
                                        color: selected
                                            ? const Color(0xFF0F172A)
                                            : Colors.grey.shade500,
                                        fontWeight: selected
                                            ? FontWeight.w900
                                            : FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      // Search Bar
                      SizedBox(
                        height: 42,
                        child: TextField(
                          controller: _searchCtrl,
                          onChanged: (v) => setState(() => _search = v),
                          style: const TextStyle(fontSize: 13),
                          decoration: InputDecoration(
                            hintText: 'Search requests..',
                            hintStyle: const TextStyle(
                                color: Colors.grey, fontSize: 12),
                            prefixIcon: const Icon(Icons.search_rounded,
                                size: 18, color: Colors.grey),
                            contentPadding:
                                const EdgeInsets.symmetric(vertical: 8),
                            filled: true,
                            fillColor: Colors.white,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide:
                                  const BorderSide(color: Color(0xFFCBD5E1)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide:
                                  const BorderSide(color: Color(0xFFCBD5E1)),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                const SizedBox(height: 18),

                // ── Results / Empty state ─────────────────────────────────
                if (state.status == ResourceStatus.loading && !state.hasData)
                  const PageLoader()
                else if (filtered.isEmpty)
                  sellerMode
                      ? JaxCard(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                                vertical: 60, horizontal: 16),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.inbox_rounded,
                                    size: 48, color: Colors.grey.shade400),
                                const SizedBox(height: 16),
                                Text('Inbox is empty',
                                    style: JaxText.h3.copyWith(
                                        color: const Color(0xFF16104A))),
                                const SizedBox(height: 8),
                                Text(
                                  'Requests matching your categories will appear here.',
                                  textAlign: TextAlign.center,
                                  style: JaxText.bodySmall.copyWith(
                                      color: JaxColors.onSurfaceVariant,
                                      height: 1.5),
                                ),
                              ],
                            ),
                          ),
                        )
                      : _EmptyRequests(
                          onPost: () => context.push('/rfq/create'))
                else
                  Column(
                    children: filtered
                        .map((item) => Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child:
                                  RfqTile(item: item, sellerMode: sellerMode),
                            ))
                        .toList(),
                  ),

                const SizedBox(height: 24),

                // ── Pro Tips & Trust Safety Cards ─────────────────────────
                if (!sellerMode) ...[
                  // Pro Tips Dark Navy Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF0F172A).withValues(alpha: 0.15),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: Color(0xFF10B981),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Text(
                              'PRO TIPS',
                              style: TextStyle(
                                fontFamily: JaxText.heading,
                                fontSize: 10,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF10B981),
                                letterSpacing: 1.2,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        RichText(
                          text: const TextSpan(
                            style: TextStyle(
                              fontFamily: JaxText.body,
                              fontSize: 12,
                              color: Color(0xFFCBD5E1),
                              height: 1.5,
                            ),
                            children: [
                              TextSpan(
                                  text:
                                      'Detailed requests with specific quantities and target budgets receive up to '),
                              TextSpan(
                                text: '40% more quotes',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              TextSpan(text: '.'),
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFF334155)),
                          ),
                          child: Row(
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: const [
                                  Text(
                                    'LIVE NETWORK',
                                    style: TextStyle(
                                      fontFamily: JaxText.heading,
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF94A3B8),
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  SizedBox(height: 3),
                                  Text(
                                    '8,204 Suppliers',
                                    style: TextStyle(
                                      fontFamily: JaxText.heading,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w900,
                                      color: Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF10B981)
                                      .withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 6,
                                      height: 6,
                                      decoration: const BoxDecoration(
                                        color: Color(0xFF10B981),
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    const Text(
                                      'Online',
                                      style: TextStyle(
                                        fontFamily: JaxText.heading,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF10B981),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Trust & Safety White Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: const [
                            Icon(Icons.check_circle_rounded,
                                color: Color(0xFF10B981), size: 16),
                            SizedBox(width: 6),
                            Text(
                              'TRUST & SAFETY',
                              style: TextStyle(
                                fontFamily: JaxText.heading,
                                fontSize: 11,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF0F172A),
                                letterSpacing: 0.8,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.shield_outlined,
                                  color: Color(0xFF0F172A), size: 20),
                            ),
                            const SizedBox(width: 10),
                            const Expanded(
                              child: Text(
                                'Quotes only come from verified suppliers with audited business profiles.',
                                style: TextStyle(
                                  fontFamily: JaxText.body,
                                  fontSize: 11.5,
                                  color: Color(0xFF64748B),
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        SizedBox(
                          width: double.infinity,
                          height: 42,
                          child: OutlinedButton(
                            onPressed: () {},
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFF0F172A),
                              backgroundColor: const Color(0xFFF8FAFC),
                              side: const BorderSide(
                                  color: Color(0xFFE2E8F0), width: 1),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text(
                              'HOW ESCROW WORKS',
                              style: TextStyle(
                                fontFamily: JaxText.heading,
                                fontSize: 10.5,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.8,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            );
          },
        ),
      ),
    );
  }
}

// ── Empty state for Buyer Requests ────────────────────────────────────────────
class _EmptyRequests extends StatelessWidget {
  const _EmptyRequests({required this.onPost});
  final VoidCallback onPost;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            height: 64,
            width: 64,
            decoration: const BoxDecoration(
              color: Color(0xFFF8FAFC),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.widgets_outlined,
                size: 30, color: Color(0xFFCBD5E1)),
          ),
          const SizedBox(height: 16),
          const Text(
            'NO REQUESTS FOUND',
            style: TextStyle(
              fontFamily: JaxText.heading,
              fontSize: 15,
              fontWeight: FontWeight.w900,
              color: Color(0xFF0F172A),
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'You haven\'t posted any sourcing requests in this category yet. Start getting quotes from verified sellers today.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: JaxText.body,
                fontSize: 11.5,
                color: Color(0xFF64748B),
                height: 1.5,
              ),
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: onPost,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF202958),
              foregroundColor: Colors.white,
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            child: const Text(
              'POST A REQUEST',
              style: TextStyle(
                fontFamily: JaxText.heading,
                fontSize: 11,
                fontWeight: FontWeight.w900,
                color: Colors.white,
                letterSpacing: 0.8,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class RfqCreateScreen extends StatefulWidget {
  const RfqCreateScreen({this.title, this.listingId, super.key});
  final String? title;
  final String? listingId;

  @override
  State<RfqCreateScreen> createState() => _RfqCreateScreenState();
}

class _RfqCreateScreenState extends State<RfqCreateScreen> {
  final _title = TextEditingController();
  final _desc = TextEditingController();
  final _locationPreference = TextEditingController();
  final _budgetMin = TextEditingController();
  final _budgetMax = TextEditingController();
  String _type = 'PRODUCT';
  String _category = '';
  DateTime? _deadline;
  String _preferredProviderType = '';
  bool _hasBudget = false;

  int _step = 0;
  bool _showChecklist = false;

  static const _categoryKeywords = {
    'c1': [
      'concrete',
      'steel',
      'brick',
      'rebar',
      'cement',
      'tile',
      'roofing',
      'construction'
    ],
    'c2': [
      'solar',
      'panel',
      'battery',
      'wiring',
      'chip',
      'sensor',
      'led',
      'camera',
      'monitor',
      'electronics'
    ],
    'c3': [
      'drill',
      'machinery',
      'pump',
      'valve',
      'bearing',
      'seal',
      'motor',
      'compressor',
      'industrial',
      'tool'
    ],
    'c4': [
      'consulting',
      'logistics',
      'shipping',
      'maintenance',
      'installation',
      'cleaning',
      'services'
    ],
    'c5': [
      'cotton',
      'fabric',
      'yarn',
      'silk',
      'polyester',
      'denim',
      'wool',
      'textiles'
    ],
  };

  @override
  void initState() {
    super.initState();
    _title.text = widget.title ?? '';
  }

  @override
  void dispose() {
    _title.dispose();
    _desc.dispose();
    _locationPreference.dispose();
    _budgetMin.dispose();
    _budgetMax.dispose();
    super.dispose();
  }

  Map<String, dynamic> _calculateScore() {
    final checks = [
      {
        'label': 'Product Name',
        'score': 5,
        'met': _title.text.trim().length >= 3
      },
      {'label': 'Category', 'score': 5, 'met': _category.isNotEmpty},
      {
        'label': 'Product Details',
        'score': 43,
        'met': _desc.text.trim().length > 50
      },
      {'label': 'Sourcing Type', 'score': 3, 'met': _type.isNotEmpty},
      {
        'label': 'Delivery Location',
        'score': 3,
        'met': _locationPreference.text.trim().isNotEmpty
      },
      {
        'label': 'Target Price',
        'score': 3,
        'met': _hasBudget && _budgetMax.text.trim().isNotEmpty
      },
      {'label': 'Valid Until', 'score': 1, 'met': _deadline != null},
    ];

    final currentScore = checks
        .where((c) => c['met'] == true)
        .fold<int>(0, (sum, c) => sum + (c['score'] as int));
    final totalPotential =
        checks.fold<int>(0, (sum, c) => sum + (c['score'] as int));
    final percentage = ((currentScore / totalPotential) * 100).round();

    return {
      'checks': checks,
      'percentage': percentage,
    };
  }

  List<JsonMap> _getSuggestedCategories(List<JsonMap> categories) {
    final titleLower = _title.text.toLowerCase().trim();
    if (titleLower.length < 3) return [];
    final keywords = titleLower.split(' ').where((k) => k.length > 2).toList();
    if (keywords.isEmpty) return [];

    return categories
        .where((c) {
          final name = textOf(c['name']).toLowerCase();
          final id = textOf(c['id']).toLowerCase();

          final matchKeyword = keywords.any((k) => name.contains(k));
          final extraKeywords = _categoryKeywords[id] ?? [];
          final matchExtra = extraKeywords.any((kw) => titleLower.contains(kw));

          return matchKeyword || matchExtra;
        })
        .take(5)
        .toList();
  }

  bool _canNext() {
    if (_step == 0)
      return _title.text.trim().length >= 3 && _category.isNotEmpty;
    if (_step == 1) return _desc.text.trim().length >= 20;
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => FormSubmitCubit()),
        BlocProvider(
            create: (_) => CategoriesCubit()
              ..load(() => apiOf(context).categories(),
                  listKeys: const ['categories'])),
      ],
      child: JaxPage(
        title: '',
        child: Builder(
          builder: (context) => BlocConsumer<FormSubmitCubit, ResourceState>(
            listener: (context, state) {
              showResultSnack(context, state);
              if (state.message == 'Saved successfully') context.go('/rfq');
            },
            builder: (context, submitState) {
              return BlocBuilder<CategoriesCubit, ResourceState>(
                builder: (context, catsState) {
                  final categories = catsState.items;
                  final scoreData = _calculateScore();
                  final suggested = _getSuggestedCategories(categories);

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header
                      _buildHeader(),
                      const SizedBox(height: 20),

                      // Stepper
                      _buildStepper(),
                      const SizedBox(height: 20),

                      // Quality Score Indicator
                      _buildQualityScore(scoreData),
                      const SizedBox(height: 24),

                      // Main Step Form Content
                      AnimatedSwitcher(
                        duration: const Duration(milliseconds: 300),
                        child:
                            _buildStepContent(context, categories, suggested),
                      ),
                      const SizedBox(height: 28),

                      // Safety Guarantee Banner
                      _buildSafetyGuarantee(),
                      const SizedBox(height: 28),

                      // Navigation Buttons
                      _buildNavigation(context, submitState),
                    ],
                  );
                },
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'POST A REQUEST',
          style: JaxText.h1.copyWith(
            fontSize: 26,
            fontWeight: FontWeight.w900,
            color: JaxColors.primaryContainer,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Post your request and get quotes from verified sellers.',
          style: JaxText.bodySmall.copyWith(
            color: JaxColors.onSurfaceVariant,
            fontStyle: FontStyle.italic,
          ),
        ),
      ],
    );
  }

  Widget _buildStepper() {
    final steps = ['Category & Type', 'Details', 'Shipping & Budget'];
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: JaxColors.outlineVariant),
      ),
      child: Row(
        children: List.generate(steps.length, (i) {
          final isActive = i == _step;
          return Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
              decoration: BoxDecoration(
                color:
                    isActive ? JaxColors.primaryContainer : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 18,
                    height: 18,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isActive
                            ? Colors.white24
                            : JaxColors.outlineVariant,
                        width: 2,
                      ),
                      color: isActive ? Colors.white10 : Colors.transparent,
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      '${i + 1}',
                      style: TextStyle(
                        color: isActive
                            ? Colors.white
                            : JaxColors.onSurfaceVariant,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Flexible(
                    child: Text(
                      steps[i].toUpperCase(),
                      maxLines: 2,
                      style: JaxText.label.copyWith(
                        color: isActive
                            ? Colors.white
                            : JaxColors.onSurfaceVariant,
                        fontSize: 8.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildQualityScore(Map<String, dynamic> scoreData) {
    final percentage = scoreData['percentage'] as int;
    final checks = scoreData['checks'] as List<dynamic>;

    Color progressColor = JaxColors.primary;
    if (percentage > 70) {
      progressColor = JaxColors.success;
    } else if (percentage > 40) {
      progressColor = JaxColors.warning;
    }

    return JaxCard(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(
        children: [
          GestureDetector(
            onTap: () => setState(() => _showChecklist = !_showChecklist),
            behavior: HitTestBehavior.opaque,
            child: Row(
              children: [
                // Progress circle
                SizedBox(
                  width: 50,
                  height: 50,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      CircularProgressIndicator(
                        value: percentage / 100,
                        strokeWidth: 6,
                        backgroundColor: JaxColors.surfaceLow,
                        color: progressColor,
                      ),
                      Text(
                        '$percentage%',
                        style: JaxText.title.copyWith(
                            fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'REQUEST QUALITY SCORE',
                        style: JaxText.label.copyWith(fontSize: 9),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Completeness score based on requirements',
                        style: JaxText.bodySmall.copyWith(fontSize: 11),
                      ),
                    ],
                  ),
                ),
                Icon(
                  _showChecklist
                      ? Icons.expand_less_rounded
                      : Icons.expand_more_rounded,
                  color: JaxColors.outline,
                ),
              ],
            ),
          ),
          if (_showChecklist) ...[
            const Divider(height: 20, thickness: 0.5),
            ...checks.map((c) {
              final isMet = c['met'] as bool;
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    Icon(
                      isMet
                          ? Icons.check_circle_rounded
                          : Icons.radio_button_unchecked_rounded,
                      color:
                          isMet ? JaxColors.success : JaxColors.outlineVariant,
                      size: 16,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        c['label'] as String,
                        style: JaxText.bodyMedium.copyWith(
                          color:
                              isMet ? JaxColors.onSurface : JaxColors.outline,
                          fontSize: 13,
                          fontWeight:
                              isMet ? FontWeight.w600 : FontWeight.normal,
                        ),
                      ),
                    ),
                    Text(
                      '${c['score']}',
                      style: JaxText.title.copyWith(
                        color: isMet
                            ? JaxColors.primary
                            : JaxColors.outlineVariant,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ],
      ),
    );
  }

  Widget _buildStepContent(
      BuildContext context, List<JsonMap> categories, List<JsonMap> suggested) {
    if (_step == 0) {
      return FormCard(
        key: const ValueKey(0),
        children: [
          const FieldLabel('1. WHAT ARE YOU LOOKING FOR?'),
          TextField(
            controller: _title,
            onChanged: (_) => setState(() {}),
            decoration: const InputDecoration(
              hintText: 'e.g. Stainless steel bolts, cotton yarns...',
            ),
            style: JaxText.bodyLarge.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          const FieldLabel('2. SELECT CATEGORY'),
          DropdownButtonFormField<String>(
            value: _category.isEmpty ? null : _category,
            isExpanded: true,
            decoration: const InputDecoration(
              hintText: 'Choose the closest matching category',
            ),
            items: categories.map((cat) {
              return DropdownMenuItem(
                value: textOf(cat['id']),
                child: Text(
                  textOf(cat['name']),
                  overflow: TextOverflow.ellipsis,
                ),
              );
            }).toList(),
            onChanged: (v) => setState(() => _category = v ?? ''),
          ),
          _buildSuggestedCategories(suggested),
          const SizedBox(height: 12),
          const FieldLabel('3. WHAT DO YOU NEED?'),
          _buildTypeSelection(),
        ],
      );
    } else if (_step == 1) {
      return FormCard(
        key: const ValueKey(1),
        children: [
          const FieldLabel('PRODUCT DETAILS'),
          TextField(
            controller: _desc,
            onChanged: (_) => setState(() {}),
            minLines: 6,
            maxLines: 12,
            decoration: InputDecoration(
              hintText:
                  'Enter detailed requirements including quantity, material specs, quality certifications required, and delivery terms...',
              hintStyle: JaxText.bodyMedium.copyWith(
                  color: Colors.grey.shade400, fontStyle: FontStyle.italic),
            ),
          ),
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              '${_desc.text.length} chars -- Aim for at least 100 for high quality responses',
              style: JaxText.bodySmall
                  .copyWith(fontSize: 11, fontStyle: FontStyle.italic),
            ),
          ),
        ],
      );
    } else {
      return FormCard(
        key: const ValueKey(2),
        children: [
          const FieldLabel('DELIVERY LOCATION'),
          TextField(
            controller: _locationPreference,
            onChanged: (_) => setState(() {}),
            decoration: const InputDecoration(
              hintText: 'e.g. Mumbai Hub, India',
            ),
          ),
          const SizedBox(height: 12),
          const FieldLabel('DESIRED DELIVERY DATE'),
          OutlinedButton.icon(
            onPressed: () async {
              final picked = await showDatePicker(
                context: context,
                initialDate:
                    _deadline ?? DateTime.now().add(const Duration(days: 7)),
                firstDate: DateTime.now(),
                lastDate: DateTime.now().add(const Duration(days: 365)),
              );
              if (picked != null) setState(() => _deadline = picked);
            },
            icon: const Icon(Icons.calendar_month_rounded,
                color: JaxColors.primary, size: 20),
            label: Text(
              _deadline == null
                  ? 'Set Desired Delivery Date'
                  : shortDate(_deadline!.toIso8601String()),
              style: JaxText.bodyMedium.copyWith(fontWeight: FontWeight.bold),
            ),
            style: OutlinedButton.styleFrom(
              alignment: Alignment.centerLeft,
              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(JaxRadius.lg)),
              side: const BorderSide(color: JaxColors.outlineVariant),
            ),
          ),
          const SizedBox(height: 12),
          const FieldLabel('PARTNER VERIFICATION TIER'),
          DropdownButtonFormField<String>(
            value: _preferredProviderType,
            isExpanded: true,
            decoration: const InputDecoration(),
            items: const [
              DropdownMenuItem(
                  value: '',
                  child: Text('Global Standard (Open)',
                      overflow: TextOverflow.ellipsis)),
              DropdownMenuItem(
                  value: 'INDIVIDUAL',
                  child: Text('Verified Individual Expert',
                      overflow: TextOverflow.ellipsis)),
              DropdownMenuItem(
                  value: 'BUSINESS',
                  child: Text('Certified Corporate Entity',
                      overflow: TextOverflow.ellipsis)),
            ],
            onChanged: (v) => setState(() => _preferredProviderType = v ?? ''),
          ),
          const SizedBox(height: 12),
          _buildBudgetSection(),
        ],
      );
    }
  }

  Widget _buildSuggestedCategories(List<JsonMap> suggested) {
    if (suggested.isEmpty || _category.isNotEmpty)
      return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.only(top: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: JaxColors.surfaceLow,
        borderRadius: BorderRadius.circular(16),
        border:
            Border.all(color: JaxColors.outlineVariant.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.lightbulb_outline_rounded,
                  color: Colors.amber, size: 16),
              const SizedBox(width: 6),
              Text(
                'SUGGESTED CATEGORIES BASED ON TITLE:',
                style: JaxText.label
                    .copyWith(fontSize: 9, color: JaxColors.primaryContainer),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: suggested.map((cat) {
              final catId = textOf(cat['id']);
              final name = textOf(cat['name']);
              return InkWell(
                onTap: () => setState(() => _category = catId),
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: JaxColors.outlineVariant),
                  ),
                  child: Text(
                    name,
                    style: JaxText.bodySmall.copyWith(
                      fontWeight: FontWeight.bold,
                      color: JaxColors.primaryContainer,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildTypeSelection() {
    final options = [
      {
        'value': 'PRODUCT',
        'title': 'Products',
        'subtitle': 'Materials, machinery, parts',
        'icon': Icons.inventory_2_rounded,
      },
      {
        'value': 'SERVICE',
        'title': 'Services',
        'subtitle': 'Installation, logistics, support',
        'icon': Icons.construction_rounded,
      },
    ];

    return Row(
      children: options.map((opt) {
        final isSelected = _type == opt['value'];
        return Expanded(
          child: GestureDetector(
            onTap: () => setState(() => _type = opt['value'] as String),
            child: Container(
              margin: EdgeInsets.only(
                right: opt['value'] == 'PRODUCT' ? 6.0 : 0.0,
                left: opt['value'] == 'SERVICE' ? 6.0 : 0.0,
              ),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isSelected
                    ? JaxColors.surfaceLow.withValues(alpha: 0.3)
                    : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color:
                      isSelected ? JaxColors.primary : JaxColors.outlineVariant,
                  width: isSelected ? 2 : 1,
                ),
              ),
              child: Stack(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: isSelected
                              ? JaxColors.primary
                              : JaxColors.surfaceLow,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          opt['icon'] as IconData,
                          color: isSelected ? Colors.white : JaxColors.outline,
                          size: 18,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        opt['title'] as String,
                        style: JaxText.title.copyWith(
                            fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        opt['subtitle'] as String,
                        style: JaxText.bodySmall
                            .copyWith(fontSize: 10, height: 1.2),
                      ),
                    ],
                  ),
                  if (isSelected)
                    const Positioned(
                      top: 0,
                      right: 0,
                      child: Icon(
                        Icons.check_circle_rounded,
                        color: JaxColors.primary,
                        size: 18,
                      ),
                    ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildBudgetSection() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: JaxColors.surfaceLow,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: JaxColors.outlineVariant),
      ),
      child: Column(
        children: [
          GestureDetector(
            onTap: () => setState(() => _hasBudget = !_hasBudget),
            behavior: HitTestBehavior.opaque,
            child: Row(
              children: [
                Checkbox(
                  value: _hasBudget,
                  onChanged: (v) => setState(() => _hasBudget = v ?? false),
                  activeColor: JaxColors.primary,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'ENABLE BUDGET CONTROLS',
                    style: JaxText.label
                        .copyWith(fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
          if (_hasBudget) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _budgetMin,
                    onChanged: (_) => setState(() {}),
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'TARGET MIN (INR)',
                      hintText: '0',
                      fillColor: Colors.white,
                      filled: true,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _budgetMax,
                    onChanged: (_) => setState(() {}),
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'CEILING MAX (INR)',
                      hintText: '1,00,000',
                      fillColor: Colors.white,
                      filled: true,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSafetyGuarantee() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: JaxColors.primaryContainer,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.shield_rounded,
              color: JaxColors.secondary, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'SAFETY GUARANTEE',
                  style: JaxText.label.copyWith(
                      color: Colors.white, fontSize: 10, letterSpacing: 1),
                ),
                const SizedBox(height: 4),
                Text(
                  'Your contact details are protected. Only selected sellers can access your profile during negotiation.',
                  style: JaxText.bodySmall.copyWith(
                      color: Colors.white70, fontSize: 11, height: 1.3),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavigation(BuildContext context, ResourceState submitState) {
    return Row(
      children: [
        if (_step > 0) ...[
          Expanded(
            child: OutlinedButton(
              onPressed: () => setState(() => _step--),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
                side: const BorderSide(color: JaxColors.outlineVariant),
              ),
              child: Text(
                'Back',
                style: JaxText.title.copyWith(color: JaxColors.onSurface),
              ),
            ),
          ),
          const SizedBox(width: 12),
        ],
        Expanded(
          child: ElevatedButton(
            onPressed: !_canNext() ||
                    submitState.status == ResourceStatus.submitting
                ? null
                : () {
                    if (_step < 2) {
                      setState(() => _step++);
                    } else {
                      context
                          .read<FormSubmitCubit>()
                          .submit(() => apiOf(context).createRfq({
                                'rfqType': _type,
                                'title': _title.text.trim(),
                                'description': _desc.text.trim(),
                                if (_category.isNotEmpty)
                                  'categoryId': _category,
                                if (_locationPreference.text.isNotEmpty)
                                  'locationPreference':
                                      _locationPreference.text.trim(),
                                if (_deadline != null)
                                  'deadline': _deadline!.toIso8601String(),
                                if (_preferredProviderType.isNotEmpty)
                                  'preferredProviderType':
                                      _preferredProviderType,
                                if (_hasBudget) ...{
                                  'budgetMin':
                                      double.tryParse(_budgetMin.text) ?? 0.0,
                                  'budgetMax':
                                      double.tryParse(_budgetMax.text) ?? 0.0,
                                },
                                'isPublic': true,
                                if (widget.listingId != null)
                                  'listingId': widget.listingId,
                              }));
                    }
                  },
            style: ElevatedButton.styleFrom(
              backgroundColor:
                  _step == 2 ? JaxColors.primary : JaxColors.primaryContainer,
              foregroundColor: Colors.white,
              disabledBackgroundColor: JaxColors.outlineVariant,
              disabledForegroundColor: Colors.white70,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14)),
              elevation: 0,
            ),
            child: submitState.status == ResourceStatus.submitting
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                        color: Colors.white, strokeWidth: 2),
                  )
                : Text(
                    _step == 2 ? 'Post Request' : 'Next',
                    style: JaxText.title.copyWith(color: Colors.white),
                  ),
          ),
        ),
      ],
    );
  }
}

class RfqDetailScreen extends StatelessWidget {
  const RfqDetailScreen({required this.id, super.key});
  final String id;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ResourceCubit()..load(() => apiOf(context).rfq(id)),
      child: BlocBuilder<ResourceCubit, ResourceState>(
        builder: (context, state) => JaxPage(
          title:
              state.data.isEmpty ? 'RFQ Detail' : textOf(state.data['title']),
          subtitle: categoryName(state.data),
          child: AsyncContent(
            state: state,
            onRetry: () => context
                .read<ResourceCubit>()
                .load(() => apiOf(context).rfq(id)),
            builder: (_) {
              final quotes = asList(state.data['quotes']);
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  RfqTile(item: state.data),
                  const SizedBox(height: 16),
                  const Text('Quotes', style: JaxText.h3),
                  const SizedBox(height: 10),
                  if (quotes.isEmpty)
                    const EmptyState(title: 'No quotes yet')
                  else
                    ...quotes.map((quote) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: JaxCard(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(children: [
                                  Expanded(
                                      child: Text(sellerName(quote),
                                          style: JaxText.title)),
                                  StatusPill(
                                      label: statusOf(quote, 'SUBMITTED'))
                                ]),
                                const SizedBox(height: 8),
                                Text(money(quote['quotedAmount']),
                                    style: JaxText.h2),
                                const SizedBox(height: 6),
                                Text(textOf(quote['proposalText']),
                                    style: JaxText.bodySmall),
                                const SizedBox(height: 12),
                                Row(children: [
                                  Expanded(
                                      child: JaxButton(
                                          label: 'Shortlist',
                                          variant: JaxButtonVariant.outline,
                                          onPressed: () => apiOf(context)
                                              .shortlistQuote(
                                                  textOf(quote['id'])))),
                                  const SizedBox(width: 10),
                                  Expanded(
                                      child: JaxButton(
                                          label: 'Award',
                                          icon: Icons.emoji_events_rounded,
                                          onPressed: () => apiOf(context)
                                              .awardQuote(
                                                  id, textOf(quote['id'])))),
                                ]),
                              ],
                            ),
                          ),
                        )),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class SubmitQuoteScreen extends StatefulWidget {
  const SubmitQuoteScreen({required this.rfqId, super.key});
  final String rfqId;

  @override
  State<SubmitQuoteScreen> createState() => _SubmitQuoteScreenState();
}

class _SubmitQuoteScreenState extends State<SubmitQuoteScreen> {
  final _amount = TextEditingController();
  final _timeline = TextEditingController();
  final _proposal = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ResourceCubit(),
      child: JaxPage(
        title: 'Submit Quote',
        subtitle: 'Send a commercial proposal to the buyer',
        child: BlocConsumer<ResourceCubit, ResourceState>(
          listener: (context, state) {
            showResultSnack(context, state);
            if (state.message == 'Saved successfully')
              context.go('/seller/rfq-inbox');
          },
          builder: (context, state) => FormCard(
            children: [
              TextField(
                  controller: _amount,
                  keyboardType: TextInputType.number,
                  decoration:
                      const InputDecoration(labelText: 'QUOTED AMOUNT')),
              TextField(
                  controller: _timeline,
                  keyboardType: TextInputType.number,
                  decoration:
                      const InputDecoration(labelText: 'TIMELINE DAYS')),
              TextField(
                  controller: _proposal,
                  minLines: 5,
                  maxLines: 8,
                  decoration:
                      const InputDecoration(labelText: 'PROPOSAL TEXT')),
              JaxButton(
                label: 'Submit quote',
                fullWidth: true,
                loading: state.status == ResourceStatus.submitting,
                icon: Icons.request_quote_rounded,
                onPressed: () => context
                    .read<ResourceCubit>()
                    .submit(() => apiOf(context).submitQuote(widget.rfqId, {
                          'quotedAmount': _amount.text,
                          'timelineDays': _timeline.text,
                          'proposalText': _proposal.text,
                        })),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class SellerDashboardScreen extends StatelessWidget {
  const SellerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthCubit>().state.user;
    final fullName = textOf(user['fullName']);
    final firstName = fullName.isNotEmpty ? fullName.split(' ').first : 'Seller';

    return BlocProvider(
      create: (_) => ResourceCubit()
        ..load(() => apiOf(context).myListings({}),
            listKeys: const ['listings']),
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        body: SafeArea(
          child: BlocBuilder<ResourceCubit, ResourceState>(
            builder: (context, state) => AsyncContent(
              state: state,
              onRetry: () => context.read<ResourceCubit>().load(
                  () => apiOf(context).myListings({}),
                  listKeys: const ['listings']),
              builder: (_) {
                final listings = state.items;
                final activeCount =
                    listings.where((l) => l['status'] == 'ACTIVE').length;
                final totalCount = numOf(state.data['total']) ?? listings.length;

                return SingleChildScrollView(
                  padding: const EdgeInsets.only(bottom: 40),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // ── Dark Navy Hero Header ──
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [Color(0xFF1B2348), Color(0xFF2B3566)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(
                                        color: Colors.white.withValues(alpha: 0.2)),
                                  ),
                                  child: const Text(
                                    'SELLER PORTAL',
                                    style: TextStyle(
                                      fontFamily: JaxText.heading,
                                      fontSize: 9,
                                      fontWeight: FontWeight.w900,
                                      color: Colors.white,
                                      letterSpacing: 1.2,
                                    ),
                                  ),
                                ),
                                ElevatedButton.icon(
                                  onPressed: () =>
                                      context.push('/seller/listings/new'),
                                  icon: const Icon(Icons.add_rounded,
                                      size: 14, color: Color(0xFF1B2348)),
                                  label: const Text(
                                    'New Product',
                                    style: TextStyle(
                                      fontFamily: JaxText.heading,
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF1B2348),
                                    ),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.white,
                                    elevation: 2,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 12, vertical: 8),
                                    minimumSize: Size.zero,
                                    tapTargetSize:
                                        MaterialTapTargetSize.shrinkWrap,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Welcome back, $firstName',
                              style: const TextStyle(
                                fontFamily: JaxText.heading,
                                fontSize: 24,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                                letterSpacing: -0.5,
                              ),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              "Here's what's happening with your store today. Manage your listings and track your performance.",
                              style: TextStyle(
                                fontFamily: JaxText.body,
                                fontSize: 12,
                                color: Color(0xFFDBEAFE),
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      ),

                      // ── 4 Stat Cards Grid ──
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            GridView.count(
                              crossAxisCount: 2,
                              childAspectRatio: 1.3,
                              crossAxisSpacing: 10,
                              mainAxisSpacing: 10,
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              children: [
                                _SellerStatCard(
                                  label: 'ACTIVE PRODUCTS',
                                  value: activeCount.toString(),
                                  badgeText: 'LIVE',
                                  badgeColor: const Color(0xFFECFDF5),
                                  badgeTextColor: const Color(0xFF059669),
                                  icon: Icons.storefront_rounded,
                                  iconBgColor: const Color(0xFFEFF6FF),
                                  iconColor: const Color(0xFF2563EB),
                                ),
                                _SellerStatCard(
                                  label: 'TOTAL PRODUCTS',
                                  value: totalCount.toString(),
                                  badgeText: 'Total',
                                  badgeColor: Colors.transparent,
                                  badgeTextColor: Colors.grey.shade400,
                                  icon: Icons.inventory_2_rounded,
                                  iconBgColor: const Color(0xFFEFF6FF),
                                  iconColor: const Color(0xFF2563EB),
                                ),
                                _SellerStatCard(
                                  label: 'BUYER REQUESTS',
                                  value: '-',
                                  badgeText: 'SOON',
                                  badgeColor: const Color(0xFFF3F4F6),
                                  badgeTextColor: const Color(0xFF6B7280),
                                  icon: Icons.inbox_rounded,
                                  iconBgColor: const Color(0xFFFFFBEB),
                                  iconColor: const Color(0xFFD97706),
                                ),
                                _SellerStatCard(
                                  label: 'AVG RATING',
                                  value: '-',
                                  badgeText: 'No reviews',
                                  badgeColor: Colors.transparent,
                                  badgeTextColor: Colors.grey.shade400,
                                  icon: Icons.star_rounded,
                                  iconBgColor: const Color(0xFFFFE4E6),
                                  iconColor: const Color(0xFFF43F5E),
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),

                            // ── Quick Actions Section ──
                            const Text(
                              'Quick Actions',
                              style: TextStyle(
                                fontFamily: JaxText.heading,
                                fontSize: 16,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Shortcuts to manage your store',
                              style: TextStyle(
                                fontFamily: JaxText.body,
                                fontSize: 12,
                                color: Colors.grey.shade500,
                              ),
                            ),
                            const SizedBox(height: 14),

                            _QuickActionCard(
                              title: 'Manage Products',
                              subtitle:
                                  'View, edit, or remove your current product listings.',
                              buttonText: 'Go to Products',
                              icon: Icons.storefront_rounded,
                              iconBgColor: const Color(0xFFEFF6FF),
                              iconColor: const Color(0xFF2563EB),
                              onTap: () => context.push('/seller/listings'),
                            ),
                            const SizedBox(height: 12),

                            _QuickActionCard(
                              title: 'Buyer Requests',
                              subtitle:
                                  'Check new requirements from potential buyers.',
                              buttonText: 'View Inbox',
                              icon: Icons.inbox_rounded,
                              iconBgColor: const Color(0xFFFFFBEB),
                              iconColor: const Color(0xFFD97706),
                              onTap: () => context.push('/seller/rfq-inbox'),
                            ),
                            const SizedBox(height: 12),

                            const _QuickActionCard(
                              title: 'Analytics',
                              subtitle:
                                  'Track your page views and conversion metrics.',
                              buttonText: 'Coming Soon',
                              icon: Icons.trending_up_rounded,
                              iconBgColor: Color(0xFFECFDF5),
                              iconColor: Color(0xFF059669),
                              disabled: true,
                              badgeText: 'SOON',
                            ),
                            const SizedBox(height: 28),

                            // ── Recent Products Section ──
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Recent Products',
                                  style: TextStyle(
                                    fontFamily: JaxText.heading,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFF0F172A),
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () =>
                                      context.push('/seller/listings'),
                                  child: Row(
                                    children: [
                                      Text(
                                        'View All',
                                        style: TextStyle(
                                          fontFamily: JaxText.heading,
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.grey.shade600,
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      Icon(Icons.chevron_right_rounded,
                                          size: 16, color: Colors.grey.shade600),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 14),

                            if (listings.isEmpty)
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(
                                    vertical: 40, horizontal: 20),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                      color: const Color(0xFFE2E8F0)),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.02),
                                      blurRadius: 6,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Container(
                                      width: 56,
                                      height: 56,
                                      decoration: const BoxDecoration(
                                        color: Color(0xFFEFF6FF),
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(
                                        Icons.widgets_rounded,
                                        color: Color(0xFF2563EB),
                                        size: 26,
                                      ),
                                    ),
                                    const SizedBox(height: 16),
                                    const Text(
                                      'No products listed yet',
                                      style: TextStyle(
                                        fontFamily: JaxText.heading,
                                        fontSize: 15,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF0F172A),
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 16),
                                      child: Text(
                                        'Get started by creating your first product or service listing to start receiving enquiries from buyers.',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          fontFamily: JaxText.body,
                                          fontSize: 12,
                                          color: Colors.grey.shade500,
                                          height: 1.4,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 20),
                                    ElevatedButton.icon(
                                      onPressed: () => context
                                          .push('/seller/listings/new'),
                                      icon: const Icon(Icons.add_rounded,
                                          size: 16, color: Colors.white),
                                      label: const Text(
                                        'Create Your First Listing',
                                        style: TextStyle(
                                          fontFamily: JaxText.heading,
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                      ),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor:
                                            const Color(0xFF1F264E),
                                        foregroundColor: Colors.white,
                                        elevation: 2,
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(12),
                                        ),
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 20, vertical: 12),
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            else
                              Column(
                                children: listings.take(6).map((l) {
                                  return Padding(
                                    padding: const EdgeInsets.only(bottom: 12),
                                    child: ListingTile(
                                      item: l,
                                      isSellerMode: true,
                                      showActions: false,
                                    ),
                                  );
                                }).toList(),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}

class _SellerStatCard extends StatelessWidget {
  const _SellerStatCard({
    required this.label,
    required this.value,
    required this.badgeText,
    required this.badgeColor,
    required this.badgeTextColor,
    required this.icon,
    required this.iconBgColor,
    required this.iconColor,
  });

  final String label;
  final String value;
  final String badgeText;
  final Color badgeColor;
  final Color badgeTextColor;
  final IconData icon;
  final Color iconBgColor;
  final Color iconColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: iconBgColor,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 18, color: iconColor),
              ),
              if (badgeText.isNotEmpty)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: badgeColor,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    badgeText,
                    style: TextStyle(
                      fontFamily: JaxText.heading,
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                      color: badgeTextColor,
                    ),
                  ),
                ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontFamily: JaxText.heading,
                  fontSize: 9.5,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey.shade400,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: TextStyle(
                  fontFamily: JaxText.heading,
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                  color: value == '-'
                      ? Colors.grey.shade400
                      : const Color(0xFF0F172A),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  const _QuickActionCard({
    required this.title,
    required this.subtitle,
    required this.buttonText,
    required this.icon,
    required this.iconBgColor,
    required this.iconColor,
    this.onTap,
    this.disabled = false,
    this.badgeText,
  });

  final String title;
  final String subtitle;
  final String buttonText;
  final IconData icon;
  final Color iconBgColor;
  final Color iconColor;
  final VoidCallback? onTap;
  final bool disabled;
  final String? badgeText;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Stack(
        children: [
          if (badgeText != null)
            Positioned(
              top: 0,
              right: 0,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFF3F4F6),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  badgeText!,
                  style: const TextStyle(
                    fontFamily: JaxText.heading,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF6B7280),
                  ),
                ),
              ),
            ),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: iconBgColor,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: iconColor, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontFamily: JaxText.heading,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontFamily: JaxText.body,
                        fontSize: 11.5,
                        color: Colors.grey.shade500,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 12),
                    if (disabled)
                      Text(
                        buttonText,
                        style: TextStyle(
                          fontFamily: JaxText.heading,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey.shade400,
                        ),
                      )
                    else
                      GestureDetector(
                        onTap: onTap,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              buttonText,
                              style: TextStyle(
                                fontFamily: JaxText.heading,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: iconColor,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Icon(
                              Icons.arrow_forward_rounded,
                              size: 14,
                              color: iconColor,
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class SellerListingsScreen extends StatelessWidget {
  const SellerListingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ResourceCubit()
        ..load(() => apiOf(context).myListings({'limit': 30}),
            listKeys: const ['listings']),
      child: BlocBuilder<ResourceCubit, ResourceState>(
        builder: (context, state) {
          final activeSkus = state.items.length;

          return JaxPage(
            scroll: false,
            topWidget: Row(
              children: [
                const Icon(Icons.factory_rounded,
                    color: JaxColors.secondary, size: 14),
                const SizedBox(width: 8),
                Text('SUPPLIER INVENTORY MANAGEMENT',
                    style: JaxText.label.copyWith(
                        color: JaxColors.secondary,
                        fontSize: 10,
                        letterSpacing: 2.0)),
              ],
            ),
            title: 'MY SOURCING CATALOG',
            subtitle:
                'Control your active factory output and global distribution listings.',
            child: Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                          color: JaxColors.surfaceLow,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: JaxColors.outlineVariant),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text('ACTIVE SKUS',
                                style: JaxText.label.copyWith(
                                    fontSize: 9,
                                    color: JaxColors.outline,
                                    letterSpacing: 1.0)),
                            const SizedBox(height: 2),
                            Text(activeSkus.toString(),
                                style: JaxText.title.copyWith(fontSize: 16)),
                          ],
                        ),
                      ),
                      JaxButton(
                        label: 'BULK IMPORT',
                        icon: Icons.upload_file_rounded,
                        variant: JaxButtonVariant.outline,
                        onPressed: () => showDialog(
                          context: context,
                          builder: (context) => const _BulkImportDialog(),
                        ),
                      ),
                      JaxButton(
                        label: 'ADD NEW PRODUCT',
                        icon: Icons.add_rounded,
                        onPressed: () => context.push('/seller/listings/new'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Expanded(
                    child: AsyncContent(
                      state: state,
                      emptyTitle: 'Registry Empty',
                      emptyDescription:
                          'Your supplier catalog currently has no indexed products. Start broadcasting your capabilities to the marketplace.',
                      emptyIcon: Icons.inventory_2_rounded,
                      onRetry: () => context.read<ResourceCubit>().load(
                          () => apiOf(context).myListings({'limit': 30}),
                          listKeys: const ['listings']),
                      builder: (_) {
                        if (state.items.isEmpty) {
                          return ListView(
                            padding: EdgeInsets.zero,
                            children: [
                              EmptyState(
                                title: 'Registry Empty',
                                description:
                                    'Your supplier catalog currently has no indexed products. Start broadcasting your capabilities to the marketplace.',
                                icon: Icons.inventory_2_rounded,
                                action: JaxButton(
                                    label: 'Initial SKU Upload',
                                    onPressed: () =>
                                        context.push('/seller/listings/new')),
                              ),
                            ],
                          );
                        }
                        return ListView.builder(
                          padding: EdgeInsets.zero,
                          itemCount: state.items.length,
                          itemBuilder: (context, index) {
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: ListingTile(
                                  item: state.items[index], isSellerMode: true),
                            );
                          },
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class ListingMediaItem {
  final String? url;
  final PlatformFile? file;
  ListingMediaItem({this.url, this.file});

  bool get isLocal => file != null;
  String get name =>
      file != null ? file!.name : (url?.split('/').last ?? 'image');
}

class ListingFormScreen extends StatefulWidget {
  const ListingFormScreen({this.listingId, super.key});
  final String? listingId;

  @override
  State<ListingFormScreen> createState() => _ListingFormScreenState();
}

class _ListingFormScreenState extends State<ListingFormScreen> {
  bool _isLoadingListing = false;
  JsonMap? _editingListing;
  int _step = 1;
  final _title = TextEditingController();
  final _description = TextEditingController();
  final _price = TextEditingController();
  final _moq = TextEditingController(text: '1');
  final _unit = TextEditingController(text: 'Pieces');
  final _tags = TextEditingController();
  String _type = 'PRODUCT';
  String _category = '';

  // Step 2 Form Controllers
  final _brand = TextEditingController();
  final _sku = TextEditingController();
  final _leadTime = TextEditingController(text: '7');
  final _country = TextEditingController(text: 'India');
  final _hsn = TextEditingController();
  final _gst = TextEditingController(text: '18');
  final _fobPort = TextEditingController();

  final List<Map<String, TextEditingController>> _customSpecs = [];
  bool _hasVariants = false;
  final List<Map<String, TextEditingController>> _variants = [];

  // Step 4 Form Controllers
  final List<ListingMediaItem> _mediaItems = [];

  // Step 3 Form Controllers
  String _pricingModel = 'FIXED UNIT PRICE';
  final List<Map<String, TextEditingController>> _pricingSlabs = [];
  final _supplyAbility = TextEditingController();
  final _deliveryTime = TextEditingController();
  final _packaging = TextEditingController();
  final _paymentTerms = TextEditingController();
  final _warranty = TextEditingController();
  final _returnPolicy = TextEditingController();
  bool _sampleAvailable = false;
  final _sampleCost = TextEditingController();
  final List<String> _certifications = [];
  final _customCert = TextEditingController();
  final List<String> _presetCerts = [
    'ISO 9001',
    'CE Certified',
    'RoHS Compliant',
    'ISI Mark',
    'BIS Standard',
    'FSSAI Certified'
  ];

  @override
  void initState() {
    super.initState();
    if (widget.listingId != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _loadListingForEditing();
      });
    }
  }

  Future<void> _loadListingForEditing() async {
    setState(() => _isLoadingListing = true);
    try {
      final api = apiOf(context);
      final data = await api.listing(widget.listingId!);
      setState(() {
        _editingListing = data;
        _isLoadingListing = false;
        _populateFields(data);
      });
    } catch (e) {
      setState(() => _isLoadingListing = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load listing for editing: $e')),
        );
      }
    }
  }

  void _populateFields(JsonMap data) {
    final product = asMap(data['productDetail']);
    _type = textOf(data['listingType'], 'PRODUCT');
    _category = textOf(data['categoryId']);
    _tags.text = asList(data['tags']).join(', ');
    _title.text = textOf(data['title']);
    _description.text = textOf(data['description']);
    final pdPrice = product['pricePerUnit'] ?? product['priceRangeMin'];
    _price.text =
        (_type == 'PRODUCT' ? pdPrice : data['basePrice'])?.toString() ?? '';
    _moq.text = product['minOrderQty']?.toString() ?? '1';
    _unit.text =
        (_type == 'PRODUCT' ? product['unitOfMeasure'] : data['priceUnit'])
                ?.toString() ??
            'Pieces';

    // Step 2 details
    _brand.text = textOf(product['brand']);
    _sku.text = textOf(product['sku']);
    _leadTime.text = product['leadTimeDays']?.toString() ?? '7';
    _country.text = textOf(product['countryOfOrigin'], 'India');
    _hsn.text = textOf(product['hsnCode']);
    _gst.text = product['gstRate']?.toString() ?? '18';
    _fobPort.text = textOf(product['fobPort']);

    // custom specs
    final specs = asList(product['customSpecs']);
    _customSpecs.clear();
    for (var spec in specs) {
      final specMap = asMap(spec);
      _customSpecs.add({
        'key': TextEditingController(text: textOf(specMap['key'])),
        'value': TextEditingController(text: textOf(specMap['value'])),
      });
    }

    // step 3 commercial terms
    final priceType = textOf(product['priceType'], 'FIXED');
    if (priceType == 'RANGE') {
      _pricingModel = 'VARIABLE PRICE RANGE';
    } else if (priceType == 'NEGOTIABLE') {
      _pricingModel = 'NEGOTIABLE';
    } else if (priceType == 'ON_REQUEST') {
      _pricingModel = 'RFQ MODE';
    } else {
      _pricingModel = 'FIXED UNIT PRICE';
    }

    final slabs = asList(product['bulkPriceSlabs']);
    _pricingSlabs.clear();
    for (var slab in slabs) {
      final slabMap = asMap(slab);
      _pricingSlabs.add({
        'minQty':
            TextEditingController(text: slabMap['minQty']?.toString() ?? ''),
        'maxQty': slabMap['maxQty'] == null
            ? TextEditingController(text: '')
            : TextEditingController(text: slabMap['maxQty'].toString()),
        'unitPrice':
            TextEditingController(text: slabMap['price']?.toString() ?? ''),
      });
    }

    // variants
    final variants = asList(product['variants']);
    _hasVariants = variants.isNotEmpty;
    _variants.clear();
    for (var v in variants) {
      final vMap = asMap(v);
      _variants.add({
        'name': TextEditingController(text: textOf(vMap['name'])),
        'sku': TextEditingController(text: textOf(vMap['sku'])),
        'price': TextEditingController(text: vMap['price']?.toString() ?? ''),
        'stock':
            TextEditingController(text: vMap['stock']?.toString() ?? '100'),
      });
    }

    _supplyAbility.text = textOf(product['supplyAbility']);
    _deliveryTime.text = textOf(product['deliveryTime']);
    _packaging.text = textOf(product['packaging']);
    _paymentTerms.text = textOf(product['paymentTerms']);
    _warranty.text = textOf(product['warranty']);
    _returnPolicy.text = textOf(product['returnPolicy']);
    _sampleAvailable = product['sampleAvailable'] == true;
    _sampleCost.text = product['sampleCost']?.toString() ?? '';

    final certs = asStringList(product['certifications']);
    _certifications.clear();
    for (var cert in certs) {
      _certifications.add(cert);
    }

    // media
    final media = asList(data['media']);
    _mediaItems.clear();
    for (var m in media) {
      final mMap = asMap(m);
      final url = textOf(mMap['url']);
      if (url.isNotEmpty) {
        _mediaItems.add(ListingMediaItem(url: url));
      }
    }
  }

  Widget _buildLabeledField(String label, TextEditingController controller,
      {String? hint,
      int maxLines = 1,
      TextInputType? keyboardType,
      Widget? suffixIcon}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: JaxText.label
                .copyWith(fontSize: 10, color: JaxColors.onSurfaceVariant)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          maxLines: maxLines,
          keyboardType: keyboardType,
          style: JaxText.bodyMedium.copyWith(fontSize: 13),
          decoration: InputDecoration(
            hintText: hint,
            hintMaxLines: 3,
            hintStyle: JaxText.bodyMedium
                .copyWith(color: JaxColors.outline, fontSize: 12),
            suffixIcon: suffixIcon,
            border: const OutlineInputBorder(),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => FormSubmitCubit()),
        BlocProvider(
            create: (_) => CategoriesCubit()
              ..load(() => apiOf(context).categories(),
                  listKeys: const ['categories'])),
      ],
      child: JaxPage(
        topWidget: GestureDetector(
          onTap: () => context.pop(),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.arrow_back_rounded,
                  size: 12, color: JaxColors.primary),
              const SizedBox(width: 8),
              Text('BACK TO LEDGER',
                  style: JaxText.label.copyWith(
                      fontSize: 10,
                      color: JaxColors.primary,
                      letterSpacing: 1.5)),
            ],
          ),
        ),
        title: widget.listingId != null
            ? 'EDIT STOREFRONT SKU'
            : 'INITIALIZE STOREFRONT SKU',
        subtitle: widget.listingId != null
            ? 'Modify existing technical specifications, commercial terms, and inventory data.'
            : 'Provision a new industrial product or technical service into the global search index.',
        child: Builder(
          builder: (context) => BlocConsumer<FormSubmitCubit, ResourceState>(
            listener: (context, state) {
              showResultSnack(context, state);
              if (state.message == 'Saved successfully')
                context.go('/seller/listings');
            },
            builder: (context, state) {
              if (_isLoadingListing) {
                return const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 64),
                    child: PageLoader(),
                  ),
                );
              }
              return Column(
                children: [
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _StepNavPill(
                            title: 'CLASSIFICATION',
                            icon: Icons.category_rounded,
                            active: _step == 1,
                            completed: _step > 1),
                        const SizedBox(width: 8),
                        _StepNavPill(
                            title: 'TECHNICAL SPECS',
                            icon: Icons.description_rounded,
                            active: _step == 2,
                            completed: _step > 2),
                        const SizedBox(width: 8),
                        _StepNavPill(
                            title: 'COMMERCIAL TERMS',
                            icon: Icons.currency_rupee_rounded,
                            active: _step == 3,
                            completed: _step > 3),
                        const SizedBox(width: 8),
                        _StepNavPill(
                            title: 'MEDIA INDEX',
                            icon: Icons.cloud_upload_rounded,
                            active: _step == 4,
                            completed: _step > 4),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  JaxCard(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        if (_step == 1) ...[
                          Text('STEP 01 / REGISTRY TYPE',
                              style: JaxText.label.copyWith(
                                  color: JaxColors.secondary,
                                  letterSpacing: 1.5)),
                          const SizedBox(height: 16),
                          Text('HOW IS THIS ASSET CLASSIFIED?',
                              style: JaxText.h2, textAlign: TextAlign.center),
                          const SizedBox(height: 32),
                          Row(
                            children: [
                              Expanded(
                                child: _AssetTypeCard(
                                  title: 'INDUSTRIAL GOOD',
                                  subtitle:
                                      'MOVABLE ASSETS, MACHINERY, SPARE PARTS OR RAW MATERIALS',
                                  icon: Icons.inventory_2_rounded,
                                  selected: _type == 'PRODUCT',
                                  onTap: () =>
                                      setState(() => _type = 'PRODUCT'),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: _AssetTypeCard(
                                  title: 'TECHNICAL SERVICE',
                                  subtitle:
                                      'CONSULTING, INSTALLATION, MAINTENANCE OR SPECIALIZED LABOR',
                                  icon: Icons.bolt_rounded,
                                  selected: _type == 'SERVICE',
                                  onTap: () =>
                                      setState(() => _type = 'SERVICE'),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 32),
                          LayoutBuilder(
                            builder: (context, constraints) {
                              final isMobile = constraints.maxWidth < 600;
                              final children = [
                                Expanded(
                                  flex: isMobile ? 0 : 1,
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text('TECHNICAL INDUSTRY VERTICAL',
                                          style: JaxText.label.copyWith(
                                              color: JaxColors.outline)),
                                      const SizedBox(height: 8),
                                      BlocBuilder<CategoriesCubit,
                                          ResourceState>(
                                        builder: (context, cats) =>
                                            DropdownButtonFormField<String>(
                                          value: _category.isEmpty
                                              ? null
                                              : _category,
                                          hint: const Text(
                                              'SELECT VERTICAL REGISTRY...'),
                                          decoration: const InputDecoration(
                                              border: OutlineInputBorder(),
                                              contentPadding:
                                                  EdgeInsets.symmetric(
                                                      horizontal: 16,
                                                      vertical: 12)),
                                          items: cats.items
                                              .map((cat) => DropdownMenuItem(
                                                  value: textOf(cat['id']),
                                                  child: Text(
                                                      textOf(cat['name']))))
                                              .toList(),
                                          onChanged: (v) => setState(
                                              () => _category = v ?? ''),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                if (isMobile)
                                  const SizedBox(height: 24)
                                else
                                  const SizedBox(width: 24),
                                Expanded(
                                  flex: isMobile ? 0 : 1,
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text('SEARCH TAGS (COMMA SEPARATED)',
                                          style: JaxText.label.copyWith(
                                              color: JaxColors.outline)),
                                      const SizedBox(height: 8),
                                      TextField(
                                        controller: _tags,
                                        decoration: const InputDecoration(
                                          hintText:
                                              'e.g. steel, high-tensile, construction',
                                          border: OutlineInputBorder(),
                                          contentPadding: EdgeInsets.symmetric(
                                              horizontal: 16, vertical: 12),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ];
                              return isMobile
                                  ? Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.stretch,
                                      children: children)
                                  : Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: children);
                            },
                          ),
                        ] else if (_step == 2) ...[
                          Text('STEP 02 / SPEC SHEET',
                              style: JaxText.label.copyWith(
                                  color: JaxColors.secondary,
                                  letterSpacing: 1.5)),
                          const SizedBox(height: 16),
                          Text('CORE MARKETPLACE IDENTIFICATION',
                              style: JaxText.h2, textAlign: TextAlign.center),
                          const SizedBox(height: 32),
                          _buildLabeledField('REGISTRY TITLE', _title,
                              hint:
                                  'e.g. Industrial Grade High-Torque AC Motor 5HP'),
                          const SizedBox(height: 24),
                          Row(children: [
                            Expanded(
                                child: _buildLabeledField(
                                    'BRAND / MANUFACTURER', _brand,
                                    hint: 'Organization name')),
                            const SizedBox(width: 16),
                            Expanded(
                                child: _buildLabeledField(
                                    'PART NUMBER / SKU', _sku,
                                    hint: 'Internal registry ID')),
                          ]),
                          const SizedBox(height: 24),
                          Row(children: [
                            Expanded(
                                child: _buildLabeledField(
                                    'SOURCING UNIT', _unit,
                                    hint: 'Pieces')),
                            const SizedBox(width: 16),
                            Expanded(
                                child: _buildLabeledField(
                                    'GLOBAL LEAD TIME (DAYS)', _leadTime,
                                    hint: '7',
                                    keyboardType: TextInputType.number,
                                    suffixIcon: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        InkWell(
                                          onTap: () {
                                            int val =
                                                int.tryParse(_leadTime.text) ??
                                                    0;
                                            _leadTime.text =
                                                (val + 1).toString();
                                          },
                                          child: const Icon(
                                              Icons.arrow_drop_up_rounded,
                                              size: 20,
                                              color: JaxColors.outline),
                                        ),
                                        InkWell(
                                          onTap: () {
                                            int val =
                                                int.tryParse(_leadTime.text) ??
                                                    0;
                                            if (val > 0)
                                              _leadTime.text =
                                                  (val - 1).toString();
                                          },
                                          child: const Icon(
                                              Icons.arrow_drop_down_rounded,
                                              size: 20,
                                              color: JaxColors.outline),
                                        ),
                                      ],
                                    ))),
                          ]),
                          const SizedBox(height: 24),
                          Row(children: [
                            Expanded(
                                child: _buildLabeledField(
                                    'COUNTRY OF ORIGIN', _country,
                                    hint: 'India')),
                            const SizedBox(width: 16),
                            Expanded(
                                child: _buildLabeledField('HSN CODE', _hsn,
                                    hint: 'Harmonized System Nomenclature')),
                          ]),
                          const SizedBox(height: 24),
                          Row(children: [
                            Expanded(
                                child: _buildLabeledField('GST RATE (%)', _gst,
                                    hint: '18',
                                    keyboardType: TextInputType.number,
                                    suffixIcon: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        InkWell(
                                          onTap: () {
                                            int val =
                                                int.tryParse(_gst.text) ?? 0;
                                            _gst.text = (val + 1).toString();
                                          },
                                          child: const Icon(
                                              Icons.arrow_drop_up_rounded,
                                              size: 20,
                                              color: JaxColors.outline),
                                        ),
                                        InkWell(
                                          onTap: () {
                                            int val =
                                                int.tryParse(_gst.text) ?? 0;
                                            if (val > 0)
                                              _gst.text = (val - 1).toString();
                                          },
                                          child: const Icon(
                                              Icons.arrow_drop_down_rounded,
                                              size: 20,
                                              color: JaxColors.outline),
                                        ),
                                      ],
                                    ))),
                            const SizedBox(width: 16),
                            Expanded(
                                child: _buildLabeledField('FOB PORT', _fobPort,
                                    hint: 'e.g. Port of Mumbai')),
                          ]),
                          const SizedBox(height: 32),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                  child: Text(
                                      'KEY PRODUCT SPECIFICATIONS (CUSTOM ATTRIBUTES)',
                                      style: JaxText.label.copyWith(
                                          fontSize: 10,
                                          color: JaxColors.onSurfaceVariant))),
                              TextButton.icon(
                                onPressed: () {
                                  setState(() {
                                    _customSpecs.add({
                                      'key': TextEditingController(),
                                      'value': TextEditingController()
                                    });
                                  });
                                },
                                icon: const Icon(Icons.add_rounded, size: 14),
                                label: const Text('ADD CUSTOM SPEC'),
                                style: TextButton.styleFrom(
                                    textStyle: JaxText.label.copyWith(
                                        fontSize: 10, letterSpacing: 1),
                                    foregroundColor: JaxColors.primary),
                              )
                            ],
                          ),
                          const SizedBox(height: 8),
                          if (_customSpecs.isNotEmpty) ...[
                            ..._customSpecs.asMap().entries.map((e) {
                              final i = e.key;
                              final item = e.value;
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: TextField(
                                        controller: item['key'],
                                        style: JaxText.bodyMedium
                                            .copyWith(fontSize: 13),
                                        decoration: InputDecoration(
                                          hintText: 'Spec (e.g. Material)',
                                          hintStyle: JaxText.bodyMedium
                                              .copyWith(
                                                  color: JaxColors.outline,
                                                  fontSize: 12),
                                          border: const OutlineInputBorder(),
                                          contentPadding:
                                              const EdgeInsets.symmetric(
                                                  horizontal: 12, vertical: 12),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: TextField(
                                        controller: item['value'],
                                        style: JaxText.bodyMedium
                                            .copyWith(fontSize: 13),
                                        decoration: InputDecoration(
                                          hintText: 'Value (e.g. Steel)',
                                          hintStyle: JaxText.bodyMedium
                                              .copyWith(
                                                  color: JaxColors.outline,
                                                  fontSize: 12),
                                          border: const OutlineInputBorder(),
                                          contentPadding:
                                              const EdgeInsets.symmetric(
                                                  horizontal: 12, vertical: 12),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    IconButton(
                                      icon: const Icon(Icons.close_rounded,
                                          color: JaxColors.error, size: 20),
                                      padding: EdgeInsets.zero,
                                      constraints: const BoxConstraints(),
                                      onPressed: () => setState(
                                          () => _customSpecs.removeAt(i)),
                                    )
                                  ],
                                ),
                              );
                            }),
                            const SizedBox(height: 16),
                          ],
                          const Divider(height: 32),
                          Row(
                            children: [
                              SizedBox(
                                width: 24,
                                height: 24,
                                child: Checkbox(
                                  value: _hasVariants,
                                  onChanged: (v) {
                                    setState(() {
                                      _hasVariants = v ?? false;
                                      if (_hasVariants && _variants.isEmpty) {
                                        _variants.add({
                                          'name': TextEditingController(),
                                          'sku': TextEditingController(),
                                          'price': TextEditingController(),
                                          'stock': TextEditingController(
                                              text: '100'),
                                        });
                                      }
                                    });
                                  },
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                  child: Text(
                                      'THIS PRODUCT HAS VARIANTS (E.G. SIZE, COLOR, CONFIGURATION OVERRIDES)',
                                      style: JaxText.label.copyWith(
                                          fontSize: 11,
                                          color: JaxColors.primaryContainer))),
                            ],
                          ),
                          if (_hasVariants) ...[
                            const SizedBox(height: 24),
                            ..._variants.asMap().entries.map((e) {
                              final i = e.key;
                              final variant = e.value;
                              return Container(
                                margin: const EdgeInsets.only(bottom: 16),
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                    color: JaxColors.surfaceLow,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                        color: JaxColors.outlineVariant)),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text('VARIANT ${i + 1}',
                                            style: JaxText.label.copyWith(
                                                fontSize: 10,
                                                color: JaxColors.secondary)),
                                        if (_variants.length > 1)
                                          IconButton(
                                            icon: const Icon(
                                                Icons.delete_outline_rounded,
                                                size: 16,
                                                color: JaxColors.error),
                                            padding: EdgeInsets.zero,
                                            constraints: const BoxConstraints(),
                                            onPressed: () => setState(
                                                () => _variants.removeAt(i)),
                                          )
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    Row(
                                      children: [
                                        Expanded(
                                            child: _buildLabeledField(
                                                'VARIANT NAME',
                                                variant['name']!,
                                                hint: 'e.g. Red, XL')),
                                        const SizedBox(width: 12),
                                        Expanded(
                                            child: _buildLabeledField(
                                                'SKU OVERRIDE', variant['sku']!,
                                                hint: 'Unique ID')),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    Row(
                                      children: [
                                        Expanded(
                                            child: _buildLabeledField(
                                                'PRICE OVERRIDE',
                                                variant['price']!,
                                                hint: 'Leave blank to use base',
                                                keyboardType:
                                                    TextInputType.number)),
                                        const SizedBox(width: 12),
                                        Expanded(
                                            child: _buildLabeledField(
                                                'STOCK', variant['stock']!,
                                                hint: 'Quantity',
                                                keyboardType:
                                                    TextInputType.number)),
                                      ],
                                    ),
                                  ],
                                ),
                              );
                            }),
                            JaxButton(
                              label: 'ADD ANOTHER VARIANT',
                              icon: Icons.add_rounded,
                              variant: JaxButtonVariant.outline,
                              fullWidth: true,
                              onPressed: () {
                                setState(() {
                                  _variants.add({
                                    'name': TextEditingController(),
                                    'sku': TextEditingController(),
                                    'price': TextEditingController(),
                                    'stock': TextEditingController(text: '100'),
                                  });
                                });
                              },
                            ),
                          ],
                          const SizedBox(height: 32),
                          _buildLabeledField(
                              'MARKET PROSPECTUS (DESCRIPTION)', _description,
                              hint:
                                  'Provide detailed technical specifications, certifications, and capabilities...',
                              maxLines: 6),
                        ] else if (_step == 3) ...[
                          Center(
                              child: Text('STEP 03 / COMMERCIAL OPS',
                                  style: JaxText.label.copyWith(
                                      color: JaxColors.secondary,
                                      letterSpacing: 1.5,
                                      fontSize: 9))),
                          const SizedBox(height: 8),
                          Center(
                              child: Text('SUPPLY CHAIN TERMS & PRICING',
                                  style: JaxText.h2)),
                          const SizedBox(height: 32),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                flex: 2,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('PRICING OPERATIONAL MODEL',
                                        style: JaxText.label.copyWith(
                                            fontSize: 10,
                                            color: JaxColors.onSurfaceVariant)),
                                    const SizedBox(height: 8),
                                    DropdownButtonFormField<String>(
                                      value: _pricingModel,
                                      isExpanded: true,
                                      decoration: const InputDecoration(
                                        border: OutlineInputBorder(),
                                        contentPadding: EdgeInsets.symmetric(
                                            horizontal: 12, vertical: 12),
                                      ),
                                      items: [
                                        'FIXED UNIT PRICE',
                                        'VARIABLE PRICE RANGE',
                                        'NEGOTIABLE',
                                        'RFQ MODE'
                                      ]
                                          .map((m) => DropdownMenuItem(
                                              value: m,
                                              child: Text(m,
                                                  style: JaxText.bodyMedium
                                                      .copyWith(
                                                          fontSize: 13,
                                                          fontWeight: FontWeight
                                                              .w600))))
                                          .toList(),
                                      onChanged: (v) => setState(() =>
                                          _pricingModel =
                                              v ?? 'FIXED UNIT PRICE'),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _buildLabeledField(
                                    'UNIT PRICE (INR)', _price,
                                    hint: '0',
                                    keyboardType: TextInputType.number),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _buildLabeledField(
                                    'MINIMUM ORDER QTY', _moq,
                                    hint: '1',
                                    keyboardType: TextInputType.number),
                              ),
                            ],
                          ),
                          const SizedBox(height: 32),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('TIERED WHOLESALE/BULK PRICING SLABS',
                                        style: JaxText.label.copyWith(
                                            fontSize: 10,
                                            color: JaxColors.primaryContainer)),
                                    const SizedBox(height: 4),
                                    Text(
                                        'SPECIFY CUSTOM UNIT PRICE BASED ON LARGER VOLUME SIZES.',
                                        style: JaxText.label.copyWith(
                                            fontSize: 8,
                                            color: JaxColors.onSurfaceVariant)),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              TextButton.icon(
                                onPressed: () {
                                  setState(() {
                                    _pricingSlabs.add({
                                      'minQty': TextEditingController(),
                                      'maxQty': TextEditingController(),
                                      'unitPrice': TextEditingController()
                                    });
                                  });
                                },
                                icon: const Icon(Icons.add_rounded, size: 14),
                                label: const Text('ADD PRICING SLAB'),
                                style: TextButton.styleFrom(
                                  foregroundColor: JaxColors.primaryContainer,
                                  textStyle: JaxText.label.copyWith(
                                      letterSpacing: 1.0, fontSize: 10),
                                ),
                              ),
                            ],
                          ),
                          if (_pricingSlabs.isNotEmpty)
                            const SizedBox(height: 16),
                          ...List.generate(_pricingSlabs.length, (i) {
                            final slab = _pricingSlabs[i];
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Expanded(
                                      child: _buildLabeledField(
                                          'MIN ORDER VOLUME', slab['minQty']!,
                                          hint: '1',
                                          keyboardType: TextInputType.number)),
                                  const SizedBox(width: 12),
                                  Expanded(
                                      child: _buildLabeledField(
                                          'MAX ORDER VOLUME', slab['maxQty']!,
                                          hint: '10',
                                          keyboardType: TextInputType.number)),
                                  const SizedBox(width: 12),
                                  Expanded(
                                      child: _buildLabeledField(
                                          'SLAB UNIT PRICE (INR)',
                                          slab['unitPrice']!,
                                          hint: '0',
                                          keyboardType: TextInputType.number)),
                                  const SizedBox(width: 12),
                                  Container(
                                    decoration: BoxDecoration(
                                      color: JaxColors.error
                                          .withValues(alpha: .08),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    height: 48,
                                    width: 48,
                                    child: IconButton(
                                      icon: const Icon(Icons.close_rounded,
                                          size: 20, color: JaxColors.error),
                                      onPressed: () => setState(
                                          () => _pricingSlabs.removeAt(i)),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }),
                          const SizedBox(height: 24),
                          Row(
                            children: [
                              Expanded(
                                  child: _buildLabeledField(
                                      'SUPPLY ABILITY', _supplyAbility,
                                      hint: 'e.g. 5000 Metric Tons/Month')),
                              const SizedBox(width: 16),
                              Expanded(
                                  child: _buildLabeledField(
                                      'LOGISTICS DELIVERY TIME', _deliveryTime,
                                      hint:
                                          'e.g. 10-15 Days after confirmation')),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                  child: _buildLabeledField(
                                      'PACKAGING & CARTON SPECIFICATIONS',
                                      _packaging,
                                      hint:
                                          'e.g. Industrial Palletized, Shrink-wrapped')),
                              const SizedBox(width: 16),
                              Expanded(
                                  child: _buildLabeledField(
                                      'STANDARD PAYMENT TERMS', _paymentTerms,
                                      hint:
                                          'e.g. 30% Advance, 70% Letter of Credit')),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                  child: _buildLabeledField(
                                      'WARRANTY DURATION', _warranty,
                                      hint:
                                          'e.g. 1 Year Manufacturer Warranty')),
                              const SizedBox(width: 16),
                              Expanded(
                                  child: _buildLabeledField(
                                      'INDUSTRIAL RETURN POLICY', _returnPolicy,
                                      hint:
                                          'e.g. 15-day return on defective goods')),
                            ],
                          ),
                          const SizedBox(height: 32),
                          Row(
                            children: [
                              Expanded(
                                child: Row(
                                  children: [
                                    SizedBox(
                                      width: 24,
                                      height: 24,
                                      child: Checkbox(
                                        value: _sampleAvailable,
                                        onChanged: (v) => setState(() =>
                                            _sampleAvailable = v ?? false),
                                        shape: RoundedRectangleBorder(
                                            borderRadius:
                                                BorderRadius.circular(4)),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                        child: Text(
                                            'EVALUATION SAMPLE AVAILABLE',
                                            style: JaxText.label.copyWith(
                                                fontSize: 10,
                                                color: JaxColors
                                                    .primaryContainer))),
                                  ],
                                ),
                              ),
                              if (_sampleAvailable) ...[
                                const SizedBox(width: 16),
                                Expanded(
                                    child: _buildLabeledField(
                                        'EVALUATION SAMPLE COST (INR)',
                                        _sampleCost,
                                        hint: 'e.g. 500',
                                        keyboardType: TextInputType.number)),
                              ] else
                                const Expanded(child: SizedBox()),
                            ],
                          ),
                          const SizedBox(height: 32),
                          Text('REGULATORY COMPLIANCE & CERTIFICATIONS',
                              style: JaxText.label.copyWith(
                                  fontSize: 10,
                                  color: JaxColors.onSurfaceVariant)),
                          const SizedBox(height: 16),
                          Wrap(
                            spacing: 8,
                            runSpacing: 12,
                            children: [
                              ..._presetCerts.map((cert) {
                                final isSelected =
                                    _certifications.contains(cert);
                                return ChoiceChip(
                                  label: Text(cert,
                                      style: JaxText.label.copyWith(
                                          fontSize: 10,
                                          color: isSelected
                                              ? Colors.white
                                              : JaxColors.primaryContainer)),
                                  selected: isSelected,
                                  selectedColor: JaxColors.primaryContainer,
                                  backgroundColor: Colors.transparent,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(20),
                                    side: BorderSide(
                                        color: isSelected
                                            ? JaxColors.primaryContainer
                                            : JaxColors.outlineVariant),
                                  ),
                                  onSelected: (v) {
                                    setState(() {
                                      if (v)
                                        _certifications.add(cert);
                                      else
                                        _certifications.remove(cert);
                                    });
                                  },
                                );
                              }),
                              ..._certifications
                                  .where((c) => !_presetCerts.contains(c))
                                  .map((cert) {
                                return Chip(
                                  label: Text(cert,
                                      style: JaxText.label.copyWith(
                                          fontSize: 10, color: Colors.white)),
                                  backgroundColor: JaxColors.primaryContainer,
                                  deleteIconColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(20),
                                      side: const BorderSide(
                                          color: JaxColors.primaryContainer)),
                                  onDeleted: () => setState(
                                      () => _certifications.remove(cert)),
                                );
                              }),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: _customCert,
                                  style:
                                      JaxText.bodyMedium.copyWith(fontSize: 13),
                                  decoration: InputDecoration(
                                    hintText: 'Add Custom Certification...',
                                    hintStyle: JaxText.bodyMedium.copyWith(
                                        color: JaxColors.outline, fontSize: 12),
                                    filled: true,
                                    fillColor: JaxColors.surfaceContainer,
                                    border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(20),
                                        borderSide: BorderSide.none),
                                    contentPadding: const EdgeInsets.symmetric(
                                        horizontal: 16, vertical: 12),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              ElevatedButton(
                                onPressed: () {
                                  if (_customCert.text.trim().isNotEmpty) {
                                    setState(() {
                                      _certifications
                                          .add(_customCert.text.trim());
                                      _customCert.clear();
                                    });
                                  }
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: JaxColors.primaryContainer,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 24, vertical: 16),
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(20)),
                                ),
                                child: Text('ADD',
                                    style: JaxText.label.copyWith(
                                        fontSize: 11, color: Colors.white)),
                              ),
                            ],
                          ),
                        ] else ...[
                          Center(
                              child: Text('STEP 04 / CORE MEDIA',
                                  style: JaxText.label.copyWith(
                                      color: JaxColors.secondary,
                                      letterSpacing: 1.5,
                                      fontSize: 9))),
                          const SizedBox(height: 8),
                          Center(
                              child: Text('VISUAL ASSET REGISTRY',
                                  style: JaxText.h2)),
                          const SizedBox(height: 48),
                          Center(
                            child: GestureDetector(
                              onTap: () async {
                                FilePickerResult? result =
                                    await FilePicker.pickFiles(
                                  allowMultiple: true,
                                  type: FileType.custom,
                                  allowedExtensions: [
                                    'jpg',
                                    'png',
                                    'jpeg',
                                    'mp4',
                                    'pdf'
                                  ],
                                );
                                if (result != null) {
                                  setState(() {
                                    for (var f in result.files) {
                                      _mediaItems
                                          .add(ListingMediaItem(file: f));
                                    }
                                  });
                                }
                              },
                              child: CustomPaint(
                                painter: DashedRectPainter(
                                    color: JaxColors.outlineVariant,
                                    strokeWidth: 1.5,
                                    gap: 6.0,
                                    borderRadius: 24),
                                child: Container(
                                  width: 160,
                                  height: 160,
                                  decoration: BoxDecoration(
                                    color: JaxColors.surface,
                                    borderRadius: BorderRadius.circular(24),
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(12),
                                        decoration: BoxDecoration(
                                          color: JaxColors.outlineVariant
                                              .withValues(alpha: .2),
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(
                                            Icons.cloud_upload_rounded,
                                            color: JaxColors.outline,
                                            size: 24),
                                      ),
                                      const SizedBox(height: 16),
                                      Text('ADD VISUAL ASSET',
                                          style: JaxText.label.copyWith(
                                              fontSize: 9,
                                              color:
                                                  JaxColors.primaryContainer)),
                                      const SizedBox(height: 6),
                                      Text('MAX 5MB PER FILE',
                                          style: JaxText.label.copyWith(
                                              fontSize: 8,
                                              color:
                                                  JaxColors.onSurfaceVariant)),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                          if (_mediaItems.isNotEmpty) ...[
                            const SizedBox(height: 24),
                            GridView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              gridDelegate:
                                  const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 3,
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 12,
                                childAspectRatio: 1,
                              ),
                              itemCount: _mediaItems.length,
                              itemBuilder: (context, index) {
                                final item = _mediaItems[index];
                                Widget imageWidget;
                                if (item.isLocal) {
                                  final path = item.file!.path;
                                  if (path != null &&
                                      (path.toLowerCase().endsWith('.jpg') ||
                                          path
                                              .toLowerCase()
                                              .endsWith('.jpeg') ||
                                          path
                                              .toLowerCase()
                                              .endsWith('.png'))) {
                                    imageWidget = Image.file(
                                      File(path),
                                      fit: BoxFit.cover,
                                    );
                                  } else {
                                    imageWidget = Container(
                                      color: JaxColors.surfaceContainer,
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          const Icon(
                                              Icons.insert_drive_file_rounded,
                                              size: 32,
                                              color: JaxColors.outline),
                                          const SizedBox(height: 4),
                                          Padding(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 4),
                                            child: Text(
                                              item.name,
                                              style: JaxText.bodySmall
                                                  .copyWith(fontSize: 8),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  }
                                } else {
                                  imageWidget = CachedNetworkImage(
                                    imageUrl: item.url!,
                                    fit: BoxFit.cover,
                                    placeholder: (context, url) => const Center(
                                      child: SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: CircularProgressIndicator(
                                            strokeWidth: 2),
                                      ),
                                    ),
                                    errorWidget: (context, url, error) =>
                                        const Center(
                                      child: Icon(Icons.error_outline_rounded,
                                          color: JaxColors.error),
                                    ),
                                  );
                                }

                                return Stack(
                                  children: [
                                    Positioned.fill(
                                      child: ClipRRect(
                                        borderRadius: BorderRadius.circular(12),
                                        child: imageWidget,
                                      ),
                                    ),
                                    if (index == 0)
                                      Positioned(
                                        top: 6,
                                        left: 6,
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 6, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: JaxColors.secondary,
                                            borderRadius:
                                                BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            'PRIMARY',
                                            style: JaxText.label.copyWith(
                                                fontSize: 8,
                                                color: Colors.white),
                                          ),
                                        ),
                                      ),
                                    Positioned(
                                      top: 4,
                                      right: 4,
                                      child: GestureDetector(
                                        onTap: () {
                                          setState(() {
                                            _mediaItems.removeAt(index);
                                          });
                                        },
                                        child: Container(
                                          padding: const EdgeInsets.all(4),
                                          decoration: const BoxDecoration(
                                            color: Colors.black54,
                                            shape: BoxShape.circle,
                                          ),
                                          child: const Icon(
                                            Icons.close_rounded,
                                            size: 14,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                );
                              },
                            ),
                          ],
                          const SizedBox(height: 48),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 24, vertical: 20),
                            decoration: BoxDecoration(
                              color: JaxColors.success.withValues(alpha: .12),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: const BoxDecoration(
                                      color: Colors.white,
                                      shape: BoxShape.circle),
                                  child: const Icon(Icons.check_rounded,
                                      color: JaxColors.success, size: 16),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text('READY FOR MARKET INJECTION',
                                          style: JaxText.label.copyWith(
                                              fontSize: 10,
                                              color: JaxColors.success)),
                                      const SizedBox(height: 4),
                                      Text(
                                          'REGISTRY DATA IS COHERENT AND READY FOR SYNCHRONIZATION.',
                                          style: JaxText.label.copyWith(
                                              fontSize: 8,
                                              color: JaxColors.success
                                                  .withValues(alpha: .8))),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                        const SizedBox(height: 48),
                        FittedBox(
                          fit: BoxFit.scaleDown,
                          alignment: Alignment.center,
                          child: Row(
                            children: [
                              TextButton.icon(
                                onPressed: _step > 1
                                    ? () => setState(() => _step--)
                                    : null,
                                icon: const Icon(Icons.arrow_back_rounded,
                                    size: 16),
                                label: const Text('PREVIOUS PROTOCOL'),
                                style: TextButton.styleFrom(
                                  foregroundColor: JaxColors.outline,
                                  textStyle: JaxText.label.copyWith(
                                      letterSpacing: 1.0, fontSize: 11),
                                ),
                              ),
                              const SizedBox(width: 48),
                              if (_step < 4)
                                JaxButton(
                                  label: _step == 1
                                      ? 'PROCEED TO TECHNICAL SPECS'
                                      : _step == 2
                                          ? 'PROCEED TO COMMERCIAL TERMS'
                                          : 'PROCEED TO MEDIA INDEX',
                                  icon: Icons.arrow_forward_rounded,
                                  onPressed: () => setState(() => _step++),
                                )
                              else
                                JaxButton(
                                  label: widget.listingId != null
                                      ? 'SAVE CHANGES'
                                      : 'INJECT INTO MARKETPLACE',
                                  icon: Icons.check_rounded,
                                  loading:
                                      state.status == ResourceStatus.submitting,
                                  onPressed: () => context
                                      .read<FormSubmitCubit>()
                                      .submit(() async {
                                    final tagsList = _tags.text
                                        .split(',')
                                        .map((t) => t.trim())
                                        .where((t) => t.isNotEmpty)
                                        .toList();
                                    final api = apiOf(context);

                                    // 1. Upload any local files first
                                    final localItems = _mediaItems
                                        .where((i) => i.isLocal)
                                        .toList();
                                    final List<String> uploadedUrls = [];
                                    if (localItems.isNotEmpty) {
                                      final paths = localItems
                                          .map((i) => i.file!.path)
                                          .whereType<String>()
                                          .toList();
                                      final urls =
                                          await api.uploadImages(paths);
                                      uploadedUrls.addAll(urls);
                                    }

                                    // 2. Build final images array
                                    final List<Map<String, dynamic>>
                                        imagesPayload = [];
                                    int uploadedIdx = 0;
                                    for (final item in _mediaItems) {
                                      if (item.isLocal) {
                                        if (uploadedIdx < uploadedUrls.length) {
                                          imagesPayload.add({
                                            'url': uploadedUrls[uploadedIdx],
                                            'isPrimary': imagesPayload.isEmpty,
                                          });
                                          uploadedIdx++;
                                        }
                                      } else {
                                        imagesPayload.add({
                                          'url': item.url!,
                                          'isPrimary': imagesPayload.isEmpty,
                                        });
                                      }
                                    }

                                    if (widget.listingId != null) {
                                      final updatePayload = {
                                        'title': _title.text,
                                        'description': _description.text,
                                        'tags': tagsList,
                                        'images': imagesPayload,
                                        if (_type == 'PRODUCT') ...{
                                          'productDetail': {
                                            'brand': _brand.text,
                                            'sku': _sku.text,
                                            'unitOfMeasure': _unit.text,
                                            'minOrderQty':
                                                num.tryParse(_moq.text) ?? 1,
                                            'pricePerUnit':
                                                num.tryParse(_price.text),
                                            'priceType': _pricingModel ==
                                                    'VARIABLE PRICE RANGE'
                                                ? 'RANGE'
                                                : _pricingModel == 'NEGOTIABLE'
                                                    ? 'NEGOTIABLE'
                                                    : _pricingModel ==
                                                            'RFQ MODE'
                                                        ? 'ON_REQUEST'
                                                        : 'FIXED',
                                            'priceRangeMin': _pricingModel ==
                                                    'VARIABLE PRICE RANGE'
                                                ? (num.tryParse(_price.text) ??
                                                    0)
                                                : null,
                                            'priceRangeMax': _pricingModel ==
                                                    'VARIABLE PRICE RANGE'
                                                ? (num.tryParse(_price.text) ??
                                                    0)
                                                : null,
                                            'bulkPriceSlabs': _pricingSlabs
                                                .map((slab) => {
                                                      'minQty': num.tryParse(
                                                              slab['minQty']!
                                                                  .text) ??
                                                          1,
                                                      'maxQty': slab['maxQty']!
                                                              .text
                                                              .isEmpty
                                                          ? null
                                                          : num.tryParse(
                                                              slab['maxQty']!
                                                                  .text),
                                                      'price': num.tryParse(
                                                              slab['unitPrice']!
                                                                  .text) ??
                                                          0,
                                                    })
                                                .toList(),
                                            'leadTimeDays':
                                                int.tryParse(_leadTime.text) ??
                                                    7,
                                            'hsnCode': _hsn.text,
                                            'gstRate':
                                                int.tryParse(_gst.text) ?? 18,
                                            'countryOfOrigin': _country.text,
                                            'fobPort': _fobPort.text,
                                            'supplyAbility':
                                                _supplyAbility.text,
                                            'deliveryTime': _deliveryTime.text,
                                            'packagingDetails': _packaging.text,
                                            'paymentTerms': _paymentTerms.text,
                                            'sampleAvailable': _sampleAvailable,
                                            'samplePrice':
                                                num.tryParse(_sampleCost.text),
                                            'warranty': _warranty.text,
                                            'returnPolicy': _returnPolicy.text,
                                            'certifications': _certifications,
                                            'specifications': _customSpecs
                                                .fold<Map<String, String>>({},
                                                    (map, spec) {
                                              if (spec['key']!
                                                  .text
                                                  .isNotEmpty) {
                                                map[spec['key']!.text] =
                                                    spec['value']!.text;
                                              }
                                              return map;
                                            }),
                                          }
                                        }
                                      };
                                      return api.updateListing(
                                          widget.listingId!, updatePayload);
                                    } else {
                                      final createPayload = {
                                        'listingType': _type,
                                        'title': _title.text,
                                        'description': _description.text,
                                        'tags': tagsList,
                                        'images': imagesPayload,
                                        if (_category.isNotEmpty)
                                          'categoryId': _category,
                                        if (_type == 'PRODUCT') ...{
                                          'brand': _brand.text,
                                          'sku': _sku.text,
                                          'unitOfMeasure': _unit.text,
                                          'minOrderQty':
                                              num.tryParse(_moq.text) ?? 1,
                                          'pricePerUnit':
                                              num.tryParse(_price.text),
                                          'priceType': _pricingModel ==
                                                  'VARIABLE PRICE RANGE'
                                              ? 'RANGE'
                                              : _pricingModel == 'NEGOTIABLE'
                                                  ? 'NEGOTIABLE'
                                                  : _pricingModel == 'RFQ MODE'
                                                      ? 'ON_REQUEST'
                                                      : 'FIXED',
                                          'priceRangeMin': _pricingModel ==
                                                  'VARIABLE PRICE RANGE'
                                              ? (num.tryParse(_price.text) ?? 0)
                                              : null,
                                          'priceRangeMax': _pricingModel ==
                                                  'VARIABLE PRICE RANGE'
                                              ? (num.tryParse(_price.text) ?? 0)
                                              : null,
                                          'bulkPriceSlabs': _pricingSlabs
                                              .map((slab) => {
                                                    'minQty': num.tryParse(
                                                            slab['minQty']!
                                                                .text) ??
                                                        1,
                                                    'maxQty': slab['maxQty']!
                                                            .text
                                                            .isEmpty
                                                        ? null
                                                        : num.tryParse(
                                                            slab['maxQty']!
                                                                .text),
                                                    'price': num.tryParse(
                                                            slab['unitPrice']!
                                                                .text) ??
                                                        0,
                                                  })
                                              .toList(),
                                          'leadTimeDays':
                                              int.tryParse(_leadTime.text) ?? 7,
                                          'hsnCode': _hsn.text,
                                          'gstRate':
                                              int.tryParse(_gst.text) ?? 18,
                                          'countryOfOrigin': _country.text,
                                          'fobPort': _fobPort.text,
                                          'supplyAbility': _supplyAbility.text,
                                          'deliveryTime': _deliveryTime.text,
                                          'packagingDetails': _packaging.text,
                                          'paymentTerms': _paymentTerms.text,
                                          'sampleAvailable': _sampleAvailable,
                                          'samplePrice':
                                              num.tryParse(_sampleCost.text),
                                          'warranty': _warranty.text,
                                          'returnPolicy': _returnPolicy.text,
                                          'certifications': _certifications,
                                          'specifications': _customSpecs
                                              .fold<Map<String, String>>({},
                                                  (map, spec) {
                                            if (spec['key']!.text.isNotEmpty) {
                                              map[spec['key']!.text] =
                                                  spec['value']!.text;
                                            }
                                            return map;
                                          }),
                                        } else ...{
                                          'basePrice':
                                              num.tryParse(_price.text),
                                          'priceUnit': _unit.text,
                                        }
                                      };
                                      return api.createListing(createPayload);
                                    }
                                  }),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _StepNavPill extends StatelessWidget {
  const _StepNavPill(
      {required this.title,
      required this.icon,
      required this.active,
      required this.completed});
  final String title;
  final IconData icon;
  final bool active;
  final bool completed;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: active ? JaxColors.primary : Colors.transparent,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon,
              size: 14, color: active ? Colors.white : JaxColors.outline),
          const SizedBox(width: 8),
          Text(title,
              style: JaxText.label.copyWith(
                  fontSize: 10,
                  color: active ? Colors.white : JaxColors.outline,
                  letterSpacing: 1.0)),
          if (completed) ...[
            const SizedBox(width: 6),
            const Icon(Icons.check_circle_rounded,
                size: 13, color: JaxColors.success),
          ],
        ],
      ),
    );
  }
}

class _AssetTypeCard extends StatelessWidget {
  const _AssetTypeCard(
      {required this.title,
      required this.subtitle,
      required this.icon,
      required this.selected,
      required this.onTap});
  final String title;
  final String subtitle;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(
              color:
                  selected ? JaxColors.secondaryDark : JaxColors.outlineVariant,
              width: selected ? 2 : 1),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color:
                    selected ? JaxColors.secondaryDark : JaxColors.surfaceLow,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(icon,
                  color: selected ? Colors.white : JaxColors.outline, size: 32),
            ),
            const SizedBox(height: 24),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(title,
                  style: JaxText.h3.copyWith(
                      color:
                          selected ? JaxColors.primary : JaxColors.onSurface)),
            ),
            const SizedBox(height: 12),
            Text(subtitle,
                textAlign: TextAlign.center,
                style: JaxText.label.copyWith(
                    fontSize: 9,
                    color: JaxColors.outline,
                    letterSpacing: 1.0,
                    height: 1.5)),
          ],
        ),
      ),
    );
  }
}

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({this.role = 'buyer', super.key});
  final String role;

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  late String _role;

  @override
  void initState() {
    super.initState();
    _role = widget.role;
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      key: ValueKey(_role),
      create: (_) => ResourceCubit()
        ..load(() => apiOf(context).orders({'role': _role, 'limit': 30}),
            listKeys: const ['orders']),
      child: JaxPage(
        title: 'My Orders',
        topWidget: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
                width: 6,
                height: 6,
                decoration: const BoxDecoration(
                    color: JaxColors.secondary, shape: BoxShape.circle)),
            const SizedBox(width: 6),
            Text('MY ORDERS',
                style: JaxText.label.copyWith(
                    color: JaxColors.secondary,
                    fontWeight: FontWeight.bold,
                    fontSize: 10,
                    letterSpacing: 1)),
          ],
        ),
        subtitle: 'Manage your orders, progress, and secure payments.',
        child: BlocBuilder<ResourceCubit, ResourceState>(
          builder: (context, state) {
            final allItems = state.items;

            // Calculate stats
            final activeCount = allItems.where((i) {
              final s = textOf(i['status']).toUpperCase();
              return s == 'OPEN' || s == 'IN_PROGRESS' || s == 'SHIPPED';
            }).length;

            final totalValue = allItems.fold<double>(0, (sum, i) {
              final amt = i['totalAmount'];
              return sum + (amt is num ? amt.toDouble() : 0.0);
            });

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Tabs + Stats ─────────────────────────────────────────
                if (MediaQuery.of(context).size.width > 600)
                  // Desktop/Tablet layout
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildRoleTabs(),
                      _buildStats(totalValue, activeCount),
                    ],
                  )
                else
                  // Mobile layout
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _buildRoleTabs(),
                      const SizedBox(height: 16),
                      _buildStats(totalValue, activeCount),
                    ],
                  ),

                const SizedBox(height: 24),

                // ── Results / Empty state ─────────────────────────────────
                if (state.status == ResourceStatus.loading && !state.hasData)
                  const PageLoader()
                else if (allItems.isEmpty)
                  _EmptyOrders(onBrowse: () => context.go('/search'))
                else
                  Column(
                    children: allItems
                        .map((item) => Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: OrderTile(item: item),
                            ))
                        .toList(),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildRoleTabs() {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: JaxColors.surfaceLow,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: JaxColors.outlineVariant),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildRoleTab('buyer', 'PURCHASES', Icons.shopping_cart_rounded),
          _buildRoleTab('seller', 'SALES', Icons.handshake_rounded),
        ],
      ),
    );
  }

  Widget _buildRoleTab(String roleValue, String label, IconData icon) {
    final selected = _role == roleValue;
    return GestureDetector(
      onTap: () => setState(() => _role = roleValue),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          boxShadow: selected
              ? [
                  BoxShadow(
                      color: Colors.black.withValues(alpha: .05),
                      blurRadius: 4,
                      offset: const Offset(0, 2))
                ]
              : [],
        ),
        child: Row(
          children: [
            Icon(icon,
                size: 14,
                color: selected
                    ? JaxColors.primaryContainer
                    : JaxColors.onSurfaceVariant),
            const SizedBox(width: 6),
            Text(
              label,
              style: JaxText.label.copyWith(
                fontSize: 12,
                color: selected
                    ? JaxColors.primaryContainer
                    : JaxColors.onSurfaceVariant,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStats(double totalValue, int activeCount) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: JaxColors.surfaceLow,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('TOTAL VALUE',
                  style: JaxText.label.copyWith(
                      fontSize: 10, color: JaxColors.onSurfaceVariant)),
              const SizedBox(height: 2),
              Text('₹${totalValue.toStringAsFixed(0)}',
                  style: JaxText.h2.copyWith(fontSize: 18)),
            ],
          ),
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 20),
            width: 1,
            height: 30,
            color: JaxColors.outlineVariant,
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('ACTIVE ORDERS',
                  style: JaxText.label.copyWith(
                      fontSize: 10, color: JaxColors.onSurfaceVariant)),
              const SizedBox(height: 2),
              Text('$activeCount',
                  style: JaxText.h2
                      .copyWith(fontSize: 18, color: JaxColors.success)),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Empty state for My Orders ────────────────────────────────────────────
class _EmptyOrders extends StatelessWidget {
  const _EmptyOrders({required this.onBrowse});
  final VoidCallback onBrowse;

  @override
  Widget build(BuildContext context) {
    return JaxCard(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 64, horizontal: 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.inventory_2_rounded,
                size: 64, color: Colors.grey.shade300),
            const SizedBox(height: 16),
            Text('No orders yet',
                style: JaxText.h3.copyWith(letterSpacing: 0.5, fontSize: 18)),
            const SizedBox(height: 8),
            Text(
              'Start by browsing products or posting a request.',
              textAlign: TextAlign.center,
              style: JaxText.bodySmall
                  .copyWith(color: JaxColors.onSurfaceVariant, height: 1.5),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: onBrowse,
              style: ElevatedButton.styleFrom(
                backgroundColor: JaxColors.primaryContainer,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
                padding:
                    const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                elevation: 0,
              ),
              child: Text('Browse Products',
                  style: JaxText.label.copyWith(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w600)),
            ),
          ],
        ),
      ),
    );
  }
}

class OrderDetailScreen extends StatelessWidget {
  const OrderDetailScreen({required this.id, super.key});
  final String id;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ResourceCubit()..load(() => apiOf(context).order(id)),
      child: BlocBuilder<ResourceCubit, ResourceState>(
        builder: (context, state) => JaxPage(
          title: 'Order ${id.substring(0, id.length.clamp(0, 8))}',
          subtitle: statusOf(state.data, 'ORDER'),
          child: AsyncContent(
            state: state,
            onRetry: () => context
                .read<ResourceCubit>()
                .load(() => apiOf(context).order(id)),
            builder: (_) {
              final milestones = asList(state.data['milestones']);
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  OrderTile(item: state.data),
                  const SizedBox(height: 16),
                  Row(children: [
                    Expanded(
                        child: JaxButton(
                            label: 'Sign',
                            icon: Icons.draw_rounded,
                            onPressed: () => apiOf(context).signOrder(id))),
                    const SizedBox(width: 10),
                    Expanded(
                        child: JaxButton(
                            label: 'Reject',
                            variant: JaxButtonVariant.danger,
                            icon: Icons.close_rounded,
                            onPressed: () => apiOf(context).rejectOrder(id))),
                  ]),
                  const SizedBox(height: 20),
                  const Text('Milestones', style: JaxText.h3),
                  const SizedBox(height: 10),
                  if (milestones.isEmpty)
                    const EmptyState(title: 'No milestones')
                  else
                    ...milestones.map((m) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: JaxCard(
                            child: Row(
                              children: [
                                Expanded(
                                    child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                      Text(textOf(m['title'], 'Milestone'),
                                          style: JaxText.title),
                                      Text(money(m['amount']),
                                          style: JaxText.bodySmall)
                                    ])),
                                StatusPill(label: statusOf(m, 'PENDING')),
                              ],
                            ),
                          ),
                        )),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});
  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  final _searchCtrl = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  String _timeLabel(String? sentAt) {
    if (sentAt == null || sentAt.isEmpty) return '';
    try {
      final dt = DateTime.parse(sentAt).toLocal();
      final now = DateTime.now();
      if (dt.day == now.day && dt.month == now.month) {
        return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
      }
      return '${dt.day}/${dt.month}';
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ResourceCubit()
        ..load(() => apiOf(context).conversations(),
            listKeys: const ['conversations']),
      child: Scaffold(
        backgroundColor: JaxColors.surface,
        body: SafeArea(
          child: Column(
            children: [
              // ── Gradient Header ────────────────────────────────────────
              Container(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
                decoration: const BoxDecoration(gradient: JaxGradients.primary),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('NEGOTIATION CENTER',
                                  style: TextStyle(
                                      color: Colors.white70,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700,
                                      letterSpacing: 1.5)),
                              SizedBox(height: 2),
                              Text('Messages',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 22,
                                      fontWeight: FontWeight.w800)),
                            ],
                          ),
                        ),
                        BlocBuilder<ResourceCubit, ResourceState>(
                          builder: (ctx, state) {
                            final active = state.items.length;
                            return Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: .18),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: Colors.white30),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                      width: 7,
                                      height: 7,
                                      decoration: const BoxDecoration(
                                          color: Color(0xFFFFB800),
                                          shape: BoxShape.circle)),
                                  const SizedBox(width: 5),
                                  Text('$active Active',
                                      style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700)),
                                ],
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Container(
                      height: 40,
                      decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10)),
                      child: TextField(
                        controller: _searchCtrl,
                        onChanged: (v) => setState(() => _query = v),
                        style: const TextStyle(fontSize: 13),
                        decoration: const InputDecoration(
                          hintText: 'Search partner or company...',
                          hintStyle:
                              TextStyle(fontSize: 13, color: Color(0xFF9CA3AF)),
                          prefixIcon: Icon(Icons.search_rounded,
                              size: 18, color: Color(0xFF9CA3AF)),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(vertical: 10),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // ── Conversation List ──────────────────────────────────────
              Expanded(
                child: BlocBuilder<ResourceCubit, ResourceState>(
                  builder: (context, state) {
                    if (state.status == ResourceStatus.loading &&
                        !state.hasData) return const PageLoader();
                    final items = _query.isEmpty
                        ? state.items
                        : state.items.where((c) {
                            final r = asMap(c['recipient']);
                            final n =
                                '${textOf(r['fullName'])} ${textOf(r['businessName'])}'
                                    .toLowerCase();
                            return n.contains(_query.toLowerCase());
                          }).toList();
                    if (items.isEmpty) {
                      if (state.items.isEmpty) {
                        return Center(
                          child: SingleChildScrollView(
                            padding: const EdgeInsets.all(32),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  width: 80,
                                  height: 80,
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                        color: const Color(0xFFF3F4F6)),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black
                                            .withValues(alpha: 0.06),
                                        blurRadius: 20,
                                        offset: const Offset(0, 8),
                                      ),
                                    ],
                                  ),
                                  child: const Center(
                                    child: Icon(
                                      Icons.forum_rounded,
                                      size: 34,
                                      color: JaxColors.primary,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 24),
                                Text(
                                  'JAXMART MESSAGE CENTER',
                                  textAlign: TextAlign.center,
                                  style: JaxText.title.copyWith(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 0.8,
                                  ),
                                ),
                                const SizedBox(height: 10),
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 24),
                                  child: Text(
                                    'Select a supplier or buyer conversation to start negotiating prices, sharing files, and finalising transaction contracts under secure escrow.',
                                    textAlign: TextAlign.center,
                                    style: JaxText.bodySmall.copyWith(
                                      fontStyle: FontStyle.italic,
                                      color: JaxColors.onSurfaceVariant,
                                      height: 1.45,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      } else {
                        return Center(
                          child: SingleChildScrollView(
                            padding: const EdgeInsets.all(32),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.forum_rounded,
                                  size: 54,
                                  color: Colors.grey.shade300,
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'NO MESSAGES FOUND',
                                  textAlign: TextAlign.center,
                                  style: JaxText.title.copyWith(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 0.8,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'Active chats will appear here.',
                                  textAlign: TextAlign.center,
                                  style: JaxText.bodySmall.copyWith(
                                    fontStyle: FontStyle.italic,
                                    color: JaxColors.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }
                    }
                    return ListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      itemCount: items.length,
                      itemBuilder: (context, index) {
                        final conv = items[index];
                        final r = asMap(conv['recipient']);
                        final latest = asMap(conv['latestMessage']);
                        final name = textOf(r['fullName'], 'Contact');
                        final company = textOf(r['businessName']);
                        final lastMsg =
                            textOf(latest['content'], 'No messages yet');
                        final isOnline = r['isOnline'] == true;
                        final isVerified = r['isVerified'] == true;
                        final unread = (conv['unreadCount'] is num)
                            ? (conv['unreadCount'] as num).toInt()
                            : 0;
                        final timeStr = _timeLabel(textOf(latest['sentAt']));
                        return InkWell(
                          onTap: () =>
                              context.push('/messages/${textOf(conv['id'])}'),
                          child: Container(
                            margin: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 4),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border(
                                left: BorderSide(
                                    color: unread > 0
                                        ? JaxColors.primary
                                        : Colors.transparent,
                                    width: 3),
                              ),
                              boxShadow: [
                                BoxShadow(
                                    color: Colors.black.withValues(alpha: .04),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2))
                              ],
                            ),
                            child: Row(
                              children: [
                                Stack(
                                  children: [
                                    JaxAvatar(
                                        name: name,
                                        url: textOf(r['avatarUrl']),
                                        size: 44),
                                    if (isOnline)
                                      Positioned(
                                        right: 0,
                                        bottom: 0,
                                        child: Container(
                                          width: 12,
                                          height: 12,
                                          decoration: BoxDecoration(
                                              color: JaxColors.success,
                                              shape: BoxShape.circle,
                                              border: Border.all(
                                                  color: Colors.white,
                                                  width: 2)),
                                        ),
                                      ),
                                  ],
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Row(
                                              children: [
                                                Flexible(
                                                    child: Text(
                                                        name.toUpperCase(),
                                                        style: JaxText.title
                                                            .copyWith(
                                                                fontSize: 12,
                                                                letterSpacing:
                                                                    0.3),
                                                        maxLines: 1,
                                                        overflow: TextOverflow
                                                            .ellipsis)),
                                                if (isVerified) ...[
                                                  const SizedBox(width: 4),
                                                  const Icon(
                                                      Icons.verified_rounded,
                                                      size: 13,
                                                      color: JaxColors.success),
                                                ],
                                              ],
                                            ),
                                          ),
                                          if (timeStr.isNotEmpty)
                                            Text(timeStr,
                                                style: JaxText.label.copyWith(
                                                    fontSize: 10,
                                                    color: JaxColors
                                                        .onSurfaceVariant)),
                                        ],
                                      ),
                                      if (company.isNotEmpty) ...[
                                        const SizedBox(height: 2),
                                        Row(
                                          children: [
                                            const Icon(Icons.business_rounded,
                                                size: 11,
                                                color:
                                                    JaxColors.onSurfaceVariant),
                                            const SizedBox(width: 3),
                                            Expanded(
                                                child: Text(company,
                                                    style: JaxText.label.copyWith(
                                                        fontSize: 10,
                                                        color: JaxColors
                                                            .onSurfaceVariant),
                                                    maxLines: 1,
                                                    overflow:
                                                        TextOverflow.ellipsis)),
                                          ],
                                        ),
                                      ],
                                      const SizedBox(height: 5),
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Text(
                                              lastMsg,
                                              style: JaxText.bodySmall.copyWith(
                                                color: unread > 0
                                                    ? JaxColors.primaryContainer
                                                    : JaxColors
                                                        .onSurfaceVariant,
                                                fontWeight: unread > 0
                                                    ? FontWeight.w600
                                                    : FontWeight.normal,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          if (unread > 0)
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      horizontal: 6,
                                                      vertical: 2),
                                              decoration: BoxDecoration(
                                                  color: JaxColors.primary,
                                                  borderRadius:
                                                      BorderRadius.circular(
                                                          10)),
                                              child: Text('$unread',
                                                  style: const TextStyle(
                                                      color: Colors.white,
                                                      fontSize: 10,
                                                      fontWeight:
                                                          FontWeight.w700)),
                                            ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ConversationScreen extends StatefulWidget {
  const ConversationScreen({required this.id, this.listingId, super.key});
  final String id;
  final String? listingId;
  @override
  State<ConversationScreen> createState() => _ConversationScreenState();
}

class _ConversationScreenState extends State<ConversationScreen> {
  final _msgCtrl = TextEditingController();
  bool _showQuickReplies = true;
  JsonMap? _conversation;
  JsonMap? _listing;
  bool _isLoadingInfo = true;
  late final ResourceCubit _resourceCubit;

  static const _quickReplies = [
    'Interested in your listing. Can you share more details?',
    'What is the minimum order quantity for bulk purchase?',
    'Could you please share details on shipping and delivery?',
    'Are product samples available for verification?',
    'What is the lead time for this order?',
    'Can you provide a formal quotation?',
  ];

  @override
  void initState() {
    super.initState();
    _resourceCubit = ResourceCubit();
    _loadInfo();
  }

  Future<void> _loadInfo() async {
    try {
      final api = apiOf(context);
      final convs = await api.conversations();
      
      // 1. Try to find conversation by conversation ID
      var conv = convs.firstWhere((c) => textOf(c['id']) == widget.id,
          orElse: () => <String, dynamic>{});
          
      // 2. If not found, check if widget.id is a seller/recipient ID
      if (conv.isEmpty) {
        conv = convs.firstWhere((c) {
          final isRecipient = textOf(asMap(c['recipient'])['id']) == widget.id;
          if (widget.listingId != null) {
            return isRecipient && textOf(c['listingId']) == widget.listingId;
          }
          return isRecipient;
        }, orElse: () => <String, dynamic>{});
      }
      
      // 3. If still not found, start a new conversation
      if (conv.isEmpty) {
        try {
          final newConv = await api.startConversation({
            'recipientId': widget.id,
            if (widget.listingId != null) 'listingId': widget.listingId,
          });
          conv = newConv;
        } catch (_) {}
      }

      JsonMap? listing;
      final convId = textOf(conv['id']);
      if (conv.isNotEmpty && textOf(conv['listingId']).isNotEmpty) {
        listing = await api.conversationListing(convId);
      }
      
      if (convId.isNotEmpty) {
        _resourceCubit.load(() => api.messages(convId), listKeys: const ['messages']);
      }
      
      if (mounted) {
        setState(() {
          _conversation = conv;
          _listing = listing;
          _isLoadingInfo = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoadingInfo = false);
      }
    }
  }

  Future<void> _sendMessage(BuildContext scaffoldContext) async {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty || _conversation == null) return;

    _msgCtrl.clear();

    final messenger = ScaffoldMessenger.of(scaffoldContext);
    final api = apiOf(scaffoldContext);

    try {
      final recipientId = textOf(asMap(_conversation!['recipient'])['id']);
      if (recipientId.isEmpty) return;

      final convId = textOf(_conversation!['id']);
      await api.startConversation({
        'recipientId': recipientId,
        'initialMessage': text,
        if (textOf(_conversation!['listingId']).isNotEmpty)
          'listingId': _conversation!['listingId'],
      });

      if (convId.isNotEmpty) {
        _resourceCubit.load(() => api.messages(convId), listKeys: const ['messages']);
      }
    } catch (e) {
      messenger.showSnackBar(
        SnackBar(
            content: Text(
                'Failed to send message: ${e.toString().replaceAll('Exception: ', '')}')),
      );
    }
  }

  void _showPartnerProfileSheet(BuildContext context) {
    final recipientName = _conversation != null
        ? textOf(asMap(_conversation!['recipient'])['fullName'], 'DRS MANUFACTURING REPRESENTATIVE')
        : 'DRS MANUFACTURING REPRESENTATIVE';
    final businessName = _conversation != null
        ? textOf(asMap(_conversation!['recipient'])['businessName'], 'DRS MANUFACTURING')
        : 'DRS MANUFACTURING';
    final avatarUrl = _conversation != null
        ? textOf(asMap(_conversation!['recipient'])['avatarUrl'])
        : '';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFCBD5E1),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 18),

              // Partner Avatar & Info
              JaxAvatar(name: recipientName, url: avatarUrl, size: 64),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Flexible(
                    child: Text(
                      recipientName.toUpperCase(),
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF0F172A),
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(Icons.verified_rounded, size: 16, color: Color(0xFF10B981)),
                ],
              ),
              const SizedBox(height: 2),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.business_rounded, size: 12, color: Color(0xFF64748B)),
                  const SizedBox(width: 4),
                  Text(
                    businessName,
                    style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Icon(Icons.shield_rounded, size: 12, color: Color(0xFF10B981)),
                    SizedBox(width: 4),
                    Text(
                      'KYC VERIFIED',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF10B981),
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // DEAL STATUS Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'DEAL STATUS',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF94A3B8),
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 6),
                    RichText(
                      text: const TextSpan(
                        style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                        children: [
                          TextSpan(text: 'No active deal. Use the '),
                          TextSpan(
                            text: 'Make a Deal',
                            style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
                          ),
                          TextSpan(text: ' button below.'),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // INTEGRITY AUDIT Box
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        Text(
                          'INTEGRITY AUDIT',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF94A3B8),
                            letterSpacing: 0.8,
                          ),
                        ),
                        Text(
                          'TRUST INDEX: 95/100',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: const LinearProgressIndicator(
                              value: 0.95,
                              minHeight: 8,
                              backgroundColor: Color(0xFFE2E8F0),
                              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF10B981)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        const Text(
                          '95% TRUST',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF10B981),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Top-Tier verified partner with zero active disputes.',
                      style: TextStyle(fontSize: 10, color: Color(0xFF64748B), fontStyle: FontStyle.italic),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // BUSINESS STATISTICS Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'BUSINESS STATISTICS',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF94A3B8),
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _statRow('RESPONSE RATE', '100%', isGreen: true),
                    const Divider(height: 16, color: Color(0xFFF1F5F9)),
                    _statRow('AVG. RESPONSE TIME', '< 15 mins'),
                    const Divider(height: 16, color: Color(0xFFF1F5F9)),
                    _statRow('FULFILLED ORDERS', '48 Transactions'),
                    const Divider(height: 16, color: Color(0xFFF1F5F9)),
                    _statRow('KYC REFERENCE ID', '#KYC-9428-A'),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // SECURED ESCROW Footer
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.security_rounded, color: Color(0xFF10B981), size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            'SECURED ESCROW',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                              letterSpacing: 0.8,
                            ),
                          ),
                          SizedBox(height: 3),
                          Text(
                            'Keep conversations on JaxMart to benefit from platform escrow guarantees and arbitration.',
                            style: TextStyle(
                              fontSize: 10,
                              color: Color(0xFF94A3B8),
                              height: 1.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _statRow(String label, String val, {bool isGreen = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
        ),
        Text(
          val,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w900,
            color: isGreen ? const Color(0xFF10B981) : const Color(0xFF0F172A),
          ),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _msgCtrl.dispose();
    _resourceCubit.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoadingInfo) {
      return const Scaffold(
        backgroundColor: JaxColors.surface,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final recipientName = _conversation != null
        ? textOf(asMap(_conversation!['recipient'])['fullName'], 'DRS MANUFACTURING REPRESENTATIVE')
        : 'DRS MANUFACTURING REPRESENTATIVE';
    final avatarUrl = _conversation != null
        ? textOf(asMap(_conversation!['recipient'])['avatarUrl'])
        : '';
    final businessName = _conversation != null
        ? textOf(asMap(_conversation!['recipient'])['businessName'], 'DRS MANUFACTURING')
        : 'DRS MANUFACTURING';

    return BlocProvider.value(
      value: _resourceCubit,
      child: Scaffold(
        backgroundColor: JaxColors.surface,
        appBar: AppBar(
          titleSpacing: 0,
          title: Row(
            children: [
              Stack(
                children: [
                  JaxAvatar(
                      name: recipientName.isNotEmpty ? recipientName : 'Contact',
                      size: 36,
                      url: avatarUrl),
                  Positioned(
                    right: 0,
                    bottom: 0,
                    child: Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 1.5),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            recipientName.isNotEmpty
                                ? recipientName.toUpperCase()
                                : 'DRS MANUFACTURING REPRESENTATIVE',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                                fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(Icons.verified_rounded, size: 14, color: Color(0xFF10B981)),
                      ],
                    ),
                    Text(
                      businessName.isNotEmpty
                          ? businessName
                          : 'DRS MANUFACTURING',
                      style: const TextStyle(
                          fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: 10),
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFF0F172A),
                  side: const BorderSide(color: Color(0xFFCBD5E1), width: 1),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8)),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                onPressed: () => _showPartnerProfileSheet(context),
                icon: const Icon(Icons.badge_outlined, size: 14, color: Color(0xFF0F172A)),
                label: const Text('HIDE PROFILE',
                    style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900)),
              ),
            ),
          ],
        ),
        body: Builder(
          builder: (scaffoldContext) {
            return Column(
              children: [
                // Product Attachment Context Banner
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    border:
                        Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
                  ),
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        if (_listing != null && asList(_listing!['media']).isNotEmpty)
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.network(
                              textOf(asList(_listing!['media']).first['url']),
                              width: 44,
                              height: 44,
                              fit: BoxFit.cover,
                            ),
                          )
                        else
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: const Color(0xFFDCFCE7),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.smartphone_rounded,
                                size: 24, color: Color(0xFF10B981)),
                          ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _listing != null
                                    ? textOf(_listing!['title']).toUpperCase()
                                    : 'BLACK TECNO MOBILE PHONES',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFF0F172A)),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Text(
                                    _listing != null
                                        ? (() {
                                            final pd = asMap(_listing!['productDetail']);
                                            final priceVal = numOf(pd['pricePerUnit']) ?? numOf(_listing!['pricePerUnit']) ?? 6000;
                                            final unit = textOf(pd['unitOfMeasure'], 'Piece');
                                            return '₹${priceVal.toStringAsFixed(0)}/$unit';
                                          })()
                                        : '₹6,000/Piece',
                                    style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w900,
                                        color: Color(0xFF10B981)),
                                  ),
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFE2E8F0),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      _listing != null
                                          ? 'MOQ: ${textOf(asMap(_listing!['productDetail'])['minOrderQty'], '10')}'
                                          : 'MOQ: 10',
                                      style: const TextStyle(
                                          fontSize: 9,
                                          color: Color(0xFF475569),
                                          fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF0F172A),
                            side: const BorderSide(color: Color(0xFFCBD5E1), width: 1),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20)),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          onPressed: () {
                            if (_listing != null) {
                              context.push('/listings/${_listing!['id']}');
                            }
                          },
                          child: const Text('VIEW PRODUCT',
                              style: TextStyle(
                                  fontSize: 9, fontWeight: FontWeight.w900)),
                        ),
                      ],
                    ),
                  ),
                ),
                Expanded(
                  child: BlocBuilder<ResourceCubit, ResourceState>(
                    builder: (context, state) {
                      if (state.status == ResourceStatus.loading &&
                          !state.hasData) return const PageLoader();
                      if (!state.hasData || state.items.isEmpty) {
                        return Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                height: 60,
                                width: 60,
                                decoration: const BoxDecoration(
                                  color: Color(0xFFF1F5F9),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.forum_outlined,
                                    size: 30, color: Color(0xFF1E1B4B)),
                              ),
                              const SizedBox(height: 16),
                              const Text('NO MESSAGES YET',
                                  style: TextStyle(
                                      fontFamily: JaxText.heading,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w900,
                                      color: Color(0xFF0F172A),
                                      letterSpacing: 0.5)),
                              const SizedBox(height: 6),
                              const Text(
                                'Initiate conversation below using quick\ntemplates or custom text.',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                    fontSize: 11,
                                    color: Color(0xFF64748B),
                                    height: 1.4),
                              ),
                            ],
                          ),
                        );
                      }
                      return ListView.builder(
                        padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                        itemCount: state.items.length,
                        itemBuilder: (context, index) {
                          final msg = state.items[index];
                          final mine = textOf(msg['senderId']) ==
                              textOf(
                                  context.read<AuthCubit>().state.user['id']);
                          return Align(
                            alignment: mine
                                ? Alignment.centerRight
                                : Alignment.centerLeft,
                            child: Container(
                              constraints: const BoxConstraints(maxWidth: 280),
                              margin: const EdgeInsets.only(bottom: 10),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: mine ? const Color(0xFF1E1B4B) : Colors.white,
                                borderRadius: BorderRadius.circular(14),
                                border: mine
                                    ? null
                                    : Border.all(color: const Color(0xFFE2E8F0)),
                                boxShadow: [
                                  BoxShadow(
                                      color:
                                          Colors.black.withValues(alpha: .04),
                                      blurRadius: 6,
                                      offset: const Offset(0, 2))
                                ],
                              ),
                              child: Text(textOf(msg['content']),
                                  style: TextStyle(
                                      fontSize: 13,
                                      color: mine
                                          ? Colors.white
                                          : const Color(0xFF0F172A))),
                            ),
                          );
                        },
                      );
                    },
                  ),
                ),
                // ── B2B Quick Replies ────────────────────────────────────────
                if (_showQuickReplies)
                  Container(
                    padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      border: Border(top: BorderSide(color: Color(0xFFF1F5F9))),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                                width: 6,
                                height: 6,
                                decoration: const BoxDecoration(
                                    color: Color(0xFF10B981),
                                    shape: BoxShape.circle)),
                            const SizedBox(width: 6),
                            const Text('B2B QUICK REPLIES',
                                style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFF64748B),
                                    letterSpacing: 1)),
                            const Spacer(),
                            GestureDetector(
                              onTap: () =>
                                  setState(() => _showQuickReplies = false),
                              child: const Text('Dismiss',
                                  style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF2563EB))),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        SizedBox(
                          height: 32,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: _quickReplies.length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(width: 8),
                            itemBuilder: (context, i) {
                              final label = _quickReplies[i];
                              final short = label.length > 36
                                  ? '${label.substring(0, 36)}...'
                                  : label;
                              return GestureDetector(
                                onTap: () {
                                  _msgCtrl.text = label;
                                  _sendMessage(scaffoldContext);
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                        color: const Color(0xFFE2E8F0)),
                                  ),
                                  child: Text(short,
                                      style: const TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          color: Color(0xFF0F172A))),
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                // ── Input Bar ───────────────────────────────────────────────
                SafeArea(
                  top: false,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
                    ),
                    child: Row(
                      children: [
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF10B981),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10)),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 10),
                            elevation: 0,
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          onPressed: () {
                            if (_listing != null) {
                              context.push('/rfq/create?listingId=${_listing!['id']}');
                            } else {
                              context.push('/rfq/create');
                            }
                          },
                          icon: const Icon(Icons.handshake_rounded, size: 15),
                          label: const Text('MAKE A DEAL',
                              style: TextStyle(
                                  fontSize: 10, fontWeight: FontWeight.w900)),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: _msgCtrl,
                            onSubmitted: (_) => _sendMessage(scaffoldContext),
                            style: const TextStyle(fontSize: 13),
                            decoration: InputDecoration(
                              hintText: 'Type your message...',
                              hintStyle: const TextStyle(
                                  fontSize: 12, color: Color(0xFF94A3B8)),
                              contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 10),
                              border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: const BorderSide(
                                      color: Color(0xFFCBD5E1))),
                              enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: const BorderSide(
                                      color: Color(0xFFCBD5E1))),
                              focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: const BorderSide(
                                      color: Color(0xFF10B981))),
                              filled: true,
                              fillColor: const Color(0xFFF8FAFC),
                              isDense: true,
                            ),
                          ),
                        ),
                        const SizedBox(width: 4),
                        IconButton(
                          onPressed: () {},
                          icon: const Icon(Icons.attach_file_rounded,
                              color: Color(0xFF64748B)),
                          iconSize: 20,
                          visualDensity: VisualDensity.compact,
                        ),
                        IconButton(
                          onPressed: () => _sendMessage(scaffoldContext),
                          icon: const Icon(Icons.send_rounded,
                              color: Color(0xFF10B981)),
                          iconSize: 20,
                          visualDensity: VisualDensity.compact,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ResourceCubit()
        ..load(() => apiOf(context).notifications(),
            listKeys: const ['notifications']),
      child: JaxPage(
        topWidget: Row(
          children: [
            const Icon(Icons.notifications_rounded,
                color: JaxColors.secondary, size: 14),
            const SizedBox(width: 8),
            Text('NOTIFICATIONS',
                style: JaxText.label.copyWith(
                    color: JaxColors.secondary,
                    fontSize: 10,
                    letterSpacing: 2.0)),
          ],
        ),
        title: 'Notifications',
        subtitle: 'Real-time notifications for RFQs, orders, and updates.',
        actions: [
          Builder(
            builder: (ctx) => JaxButton(
              label: 'CLEAR ALL NEW',
              icon: Icons.done_all_rounded,
              variant: JaxButtonVariant.outline,
              onPressed: () async {
                await apiOf(ctx).markAllNotificationsRead();
                if (ctx.mounted) {
                  ctx.read<ResourceCubit>().load(
                      () => apiOf(ctx).notifications(),
                      listKeys: const ['notifications']);
                }
              },
            ),
          ),
        ],
        child: BlocBuilder<ResourceCubit, ResourceState>(
          builder: (context, state) => AsyncContent(
            state: state,
            emptyTitle: 'No notifications yet',
            emptyDescription:
                'You have no active alerts. New notifications from partners will appear here.',
            emptyIcon: Icons.notifications_none_rounded,
            onRetry: () => context.read<ResourceCubit>().load(
                () => apiOf(context).notifications(),
                listKeys: const ['notifications']),
            builder: (_) => Column(
              children: state.items.map((item) {
                final read = item['isRead'] == true;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: JaxCard(
                    padding: const EdgeInsets.all(20),
                    onTap: () async {
                      if (!read) {
                        await apiOf(context)
                            .markNotificationRead(textOf(item['id']));
                        if (context.mounted) {
                          context.read<ResourceCubit>().load(
                              () => apiOf(context).notifications(),
                              listKeys: const ['notifications']);
                        }
                      }
                      if (context.mounted) {
                        final data = asMap(item['data']);
                        if (data['conversationId'] != null) {
                          context.push('/messages/${data['conversationId']}');
                        } else if (data['orderId'] != null) {
                          context.push('/orders/${data['orderId']}');
                        } else if (data['rfqId'] != null) {
                          context.push('/rfq/${data['rfqId']}');
                        }
                      }
                    },
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          height: 48,
                          width: 48,
                          decoration: BoxDecoration(
                            color: read
                                ? JaxColors.surfaceLow
                                : JaxColors.primary.withValues(alpha: .1),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          alignment: Alignment.center,
                          child: Icon(Icons.notifications_active_rounded,
                              color:
                                  read ? JaxColors.outline : JaxColors.primary,
                              size: 20),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: Text(
                                      textOf(item['title']).toUpperCase(),
                                      style: JaxText.title.copyWith(
                                        fontSize: 13,
                                        color: read
                                            ? JaxColors.onSurfaceVariant
                                            : JaxColors.primaryContainer,
                                        fontWeight: FontWeight.w900,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    shortDate(item['createdAt']),
                                    style: JaxText.label.copyWith(
                                        color: JaxColors.outline, fontSize: 10),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                textOf(item['body']),
                                style: JaxText.bodySmall.copyWith(
                                  color: read
                                      ? JaxColors.onSurfaceVariant
                                      : JaxColors.onSurface,
                                  fontWeight:
                                      read ? FontWeight.w400 : FontWeight.w500,
                                  height: 1.5,
                                ),
                              ),
                              if (!read) ...[
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    Container(
                                        height: 6,
                                        width: 6,
                                        decoration: const BoxDecoration(
                                            color: JaxColors.secondary,
                                            shape: BoxShape.circle)),
                                    const SizedBox(width: 6),
                                    Text('NEW',
                                        style: JaxText.label.copyWith(
                                            color: JaxColors.secondary,
                                            fontSize: 9,
                                            letterSpacing: 1.5,
                                            fontWeight: FontWeight.w900)),
                                  ],
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ),
    );
  }
}

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isEditing = false;
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  String _accountType = 'INDIVIDUAL';
  String _userType = 'BUYER';
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _emailController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  void _commitChanges() async {
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Registry name cannot be empty')),
      );
      return;
    }
    if (email.isEmpty || !email.contains('@')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid contact email')),
      );
      return;
    }

    setState(() => _submitting = true);

    try {
      await context.read<AuthCubit>().updateProfile({
        'fullName': name,
        'email': email,
        'accountType': _accountType,
        'userType': _userType,
      });
      if (!mounted) return;
      final newState = context.read<AuthCubit>().state;
      if (newState.status == AuthStatus.authenticated) {
        setState(() {
          _isEditing = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Registry updated successfully')),
        );
      }
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to update registry details')),
      );
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthCubit, AuthState>(
      builder: (context, state) {
        return SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 110),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  const Icon(Icons.shield_rounded,
                      color: JaxColors.secondaryDark, size: 14),
                  const SizedBox(width: 8),
                  Text('COMPLIANCE COMMAND CONSOLE',
                      style: JaxText.label
                          .copyWith(color: JaxColors.secondaryDark)),
                ],
              ),
              const SizedBox(height: 8),
              LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth > 600;
                  return Flex(
                    direction: isWide ? Axis.horizontal : Axis.vertical,
                    crossAxisAlignment: isWide
                        ? CrossAxisAlignment.end
                        : CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        flex: isWide ? 1 : 0,
                        child: Text('IDENTITY & TRUST',
                            style: JaxText.h1
                                .copyWith(color: JaxColors.primaryContainer)),
                      ),
                      if (!isWide) const SizedBox(height: 16),
                      OutlinedButton.icon(
                        onPressed: () {
                          if (_isEditing) {
                            setState(() => _isEditing = false);
                          } else {
                            setState(() {
                              _nameController.text = state.name;
                              _emailController.text =
                                  textOf(state.user['email']);
                              _accountType = textOf(
                                  state.user['accountType'], 'INDIVIDUAL');
                              _userType =
                                  textOf(state.user['userType'], 'BUYER');
                              _isEditing = true;
                            });
                          }
                        },
                        icon: Icon(
                            _isEditing
                                ? Icons.close_rounded
                                : Icons.edit_note_rounded,
                            size: 16),
                        label: Text(
                            _isEditing ? 'Cancel Edit' : 'Modify Registry',
                            style: JaxText.label
                                .copyWith(color: JaxColors.primaryContainer)),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: JaxColors.primaryContainer,
                          side:
                              const BorderSide(color: JaxColors.outlineVariant),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8)),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 12),
                        ),
                      ),
                    ],
                  );
                },
              ),
              const SizedBox(height: 32),
              LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth > 700;
                  if (isWide) {
                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          flex: 4,
                          child: Column(
                            children: [
                              _ProfileCard(state: state),
                              const SizedBox(height: 24),
                              _SecurityBadgeCard(state: state),
                            ],
                          ),
                        ),
                        const SizedBox(width: 24),
                        Expanded(
                          flex: 6,
                          child: Column(
                            children: [
                              _CoreIdentitySchemaCard(
                                state: state,
                                isEditing: _isEditing,
                                nameController: _nameController,
                                emailController: _emailController,
                                accountType: _accountType,
                                userType: _userType,
                                onAccountTypeChanged: (val) => setState(
                                    () => _accountType = val ?? 'INDIVIDUAL'),
                                onUserTypeChanged: (val) =>
                                    setState(() => _userType = val ?? 'BUYER'),
                                onCommit: _commitChanges,
                                onDiscard: () =>
                                    setState(() => _isEditing = false),
                                submitting: _submitting,
                              ),
                              const SizedBox(height: 24),
                              _BusinessIntelligenceCard(),
                              const SizedBox(height: 24),
                              _ComplianceVaultCard(),
                            ],
                          ),
                        ),
                      ],
                    );
                  } else {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _ProfileCard(state: state),
                        const SizedBox(height: 24),
                        _CoreIdentitySchemaCard(
                          state: state,
                          isEditing: _isEditing,
                          nameController: _nameController,
                          emailController: _emailController,
                          accountType: _accountType,
                          userType: _userType,
                          onAccountTypeChanged: (val) => setState(
                              () => _accountType = val ?? 'INDIVIDUAL'),
                          onUserTypeChanged: (val) =>
                              setState(() => _userType = val ?? 'BUYER'),
                          onCommit: _commitChanges,
                          onDiscard: () => setState(() => _isEditing = false),
                          submitting: _submitting,
                        ),
                        const SizedBox(height: 24),
                        _BusinessIntelligenceCard(),
                        const SizedBox(height: 24),
                        _ComplianceVaultCard(),
                        const SizedBox(height: 24),
                        _SecurityBadgeCard(state: state),
                      ],
                    );
                  }
                },
              ),
            ],
          ),
        );
      },
    );
  }
}

class _ProfileCard extends StatelessWidget {
  const _ProfileCard({required this.state});
  final AuthState state;

  @override
  Widget build(BuildContext context) {
    final initials = state.name.isNotEmpty
        ? (state.name.length > 1
            ? state.name.substring(0, 2).toUpperCase()
            : state.name.substring(0, 1).toUpperCase())
        : 'US';
    final trustScore = textOf(state.user['trustScore'], '0');
    final orderRate = textOf(state.user['orderRate'], '100%');
    final accountType =
        textOf(state.user['accountType'], 'INDIVIDUAL').toUpperCase();

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(JaxRadius.xl),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: .03),
              blurRadius: 10,
              offset: const Offset(0, 4)),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          Container(
            height: 100,
            width: double.infinity,
            color: JaxColors.primaryContainer,
          ),
          Transform.translate(
            offset: const Offset(0, -40),
            child: Column(
              children: [
                Container(
                  height: 80,
                  width: 80,
                  decoration: BoxDecoration(
                    color: JaxColors.primary,
                    shape: BoxShape.rectangle,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white, width: 4),
                  ),
                  alignment: Alignment.center,
                  child: Text(initials,
                      style: JaxText.h2.copyWith(color: Colors.white)),
                ),
                const SizedBox(height: 12),
                Text(state.name.toUpperCase(),
                    style:
                        JaxText.h3.copyWith(color: JaxColors.primaryContainer)),
                Text(
                    textOf(state.user['email'], 'email@domain.com')
                        .toLowerCase(),
                    style: JaxText.bodySmall),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: JaxColors.surfaceContainer,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                            color:
                                JaxColors.outlineVariant.withValues(alpha: .3)),
                      ),
                      child: Text(state.userType.toUpperCase(),
                          style: JaxText.label.copyWith(
                              color: JaxColors.primaryContainer, fontSize: 9)),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: JaxColors.secondary.withValues(alpha: .1),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                            color: JaxColors.secondary.withValues(alpha: .2)),
                      ),
                      child: Text(accountType,
                          style: JaxText.label.copyWith(
                              color: JaxColors.secondaryDark, fontSize: 9)),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Container(
            color: JaxColors.surfaceLow,
            height: 1,
            width: double.infinity,
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Column(
                  children: [
                    Text('TRUST SCORE', style: JaxText.label),
                    const SizedBox(height: 4),
                    Text(trustScore,
                        style: JaxText.h2
                            .copyWith(color: JaxColors.primaryContainer)),
                  ],
                ),
                Column(
                  children: [
                    Text('ORDER RATE', style: JaxText.label),
                    const SizedBox(height: 4),
                    Text(orderRate,
                        style: JaxText.h2
                            .copyWith(color: JaxColors.primaryContainer)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SecurityBadgeCard extends StatelessWidget {
  const _SecurityBadgeCard({required this.state});
  final AuthState state;

  @override
  Widget build(BuildContext context) {
    final isVerified = textOf(state.user['kycStatus']) == 'VERIFIED';

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(JaxRadius.xl),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: .03),
              blurRadius: 10,
              offset: const Offset(0, 4)),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.shield_rounded,
                  color: JaxColors.secondaryDark, size: 16),
              const SizedBox(width: 8),
              Text('SECURITY BADGE',
                  style: JaxText.label
                      .copyWith(color: JaxColors.primaryContainer)),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(
                  color: JaxColors.outlineVariant.withValues(alpha: .5)),
              borderRadius: BorderRadius.circular(JaxRadius.lg),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                        isVerified
                            ? Icons.check_circle_rounded
                            : Icons.pending_rounded,
                        color: isVerified
                            ? JaxColors.secondary
                            : JaxColors.warning,
                        size: 20),
                    const SizedBox(width: 8),
                    Text(isVerified ? 'VERIFIED' : 'PENDING',
                        style: JaxText.title
                            .copyWith(color: JaxColors.primaryContainer)),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  isVerified
                      ? 'Authenticated Global Partner. Your credentials are fully validated for high-limit B2B trade.'
                      : 'Your account is under review. Complete KYC to unlock high-limit B2B trade.',
                  style: JaxText.bodySmall.copyWith(height: 1.5),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CoreIdentitySchemaCard extends StatelessWidget {
  const _CoreIdentitySchemaCard({
    required this.state,
    required this.isEditing,
    required this.nameController,
    required this.emailController,
    required this.accountType,
    required this.userType,
    required this.onAccountTypeChanged,
    required this.onUserTypeChanged,
    required this.onCommit,
    required this.onDiscard,
    required this.submitting,
  });

  final AuthState state;
  final bool isEditing;
  final TextEditingController nameController;
  final TextEditingController emailController;
  final String accountType;
  final String userType;
  final ValueChanged<String?> onAccountTypeChanged;
  final ValueChanged<String?> onUserTypeChanged;
  final VoidCallback onCommit;
  final VoidCallback onDiscard;
  final bool submitting;

  String getAccountTypeLabel(String val) {
    switch (val.toUpperCase()) {
      case 'INDIVIDUAL':
        return 'INDIVIDUAL PROFESSIONAL';
      case 'BUSINESS':
        return 'BUSINESS ORGANIZATIONAL';
      default:
        return val.toUpperCase();
    }
  }

  String getUserTypeLabel(String val) {
    switch (val.toUpperCase()) {
      case 'BUYER':
        return 'PROCUREMENT (BUYER)';
      case 'SELLER':
        return 'FULL SUPPLY (SELLER)';
      case 'BOTH':
        return 'OMNICHANNEL (BOTH)';
      default:
        return val.toUpperCase();
    }
  }

  InputDecoration _fieldDecoration(String label) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(
        color: Colors.grey,
        fontSize: 10,
        fontWeight: FontWeight.w800,
        letterSpacing: 1.0,
      ),
      floatingLabelBehavior: FloatingLabelBehavior.always,
      fillColor: const Color(0xFFF8FAFC),
      filled: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: JaxColors.primary, width: 1.5),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(JaxRadius.xl),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: .03),
              blurRadius: 10,
              offset: const Offset(0, 4)),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Core Identity Schema',
              style: JaxText.h2
                  .copyWith(color: JaxColors.primaryContainer, fontSize: 20)),
          const SizedBox(height: 24),
          if (isEditing) ...[
            TextField(
              controller: nameController,
              decoration: _fieldDecoration('REGISTRY NAME'),
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: emailController,
              decoration: _fieldDecoration('CONTACT EMAIL'),
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: accountType,
              decoration: _fieldDecoration('ACCOUNT ARCHITECTURE'),
              style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: JaxColors.primaryContainer),
              items: const [
                DropdownMenuItem(
                    value: 'INDIVIDUAL',
                    child: Text('INDIVIDUAL PROFESSIONAL')),
                DropdownMenuItem(
                    value: 'BUSINESS', child: Text('BUSINESS ORGANIZATIONAL')),
              ],
              onChanged: onAccountTypeChanged,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: userType,
              decoration: _fieldDecoration('MARKET PERMISSIONS'),
              style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: JaxColors.primaryContainer),
              items: const [
                DropdownMenuItem(
                    value: 'BUYER', child: Text('PROCUREMENT (BUYER)')),
                DropdownMenuItem(
                    value: 'SELLER', child: Text('FULL SUPPLY (SELLER)')),
                DropdownMenuItem(
                    value: 'BOTH', child: Text('OMNICHANNEL (BOTH)')),
              ],
              onChanged: onUserTypeChanged,
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                ElevatedButton(
                  onPressed: submitting ? null : onCommit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1E1B4B),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 14),
                    elevation: 0,
                  ),
                  child: submitting
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2),
                        )
                      : const Text(
                          'COMMIT CHANGES',
                          style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 0.8),
                        ),
                ),
                const SizedBox(width: 12),
                TextButton(
                  onPressed: onDiscard,
                  child: const Text(
                    'DISCARD',
                    style: TextStyle(
                      color: Color(0xFF64748B),
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.8,
                    ),
                  ),
                ),
              ],
            ),
          ] else ...[
            Row(
              children: [
                Expanded(
                  child: _SchemaField(
                    label: 'REGISTRY NAME',
                    value: state.name.toUpperCase(),
                  ),
                ),
                Expanded(
                  child: _SchemaField(
                    label: 'CONTACT EMAIL',
                    value: textOf(state.user['email'], 'no-email@provided.com')
                        .toUpperCase(),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: _SchemaField(
                    label: 'ACCOUNT ARCHITECTURE',
                    value: getAccountTypeLabel(
                        textOf(state.user['accountType'], 'INDIVIDUAL')),
                  ),
                ),
                Expanded(
                  child: _SchemaField(
                    label: 'MARKET PERMISSIONS',
                    value: getUserTypeLabel(state.userType),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _BusinessIntelligenceCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(JaxRadius.xl),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: .03),
              blurRadius: 10,
              offset: const Offset(0, 4)),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Business Intelligence Profile',
              style: JaxText.h2
                  .copyWith(color: JaxColors.primaryContainer, fontSize: 20)),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.business_rounded,
                      color: Color(0xFF0F766E), size: 20),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'ORGANIZATION NOT CLASSIFIED',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF1E1B4B),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Text(
                            'GSTIN: REDACTED',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF0F766E),
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                              width: 4,
                              height: 4,
                              decoration: const BoxDecoration(
                                  color: Colors.grey, shape: BoxShape.circle)),
                          const SizedBox(width: 6),
                          Text(
                            'SETUP REQUIRED',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Colors.grey,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SchemaField extends StatelessWidget {
  const _SchemaField({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: JaxText.label),
        const SizedBox(height: 8),
        Text(value,
            style: JaxText.title
                .copyWith(color: JaxColors.primaryContainer, fontSize: 13)),
      ],
    );
  }
}

class _ComplianceVaultCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(JaxRadius.xl),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: .03),
              blurRadius: 10,
              offset: const Offset(0, 4)),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                  child: Text('Compliance Document Vault',
                      style: JaxText.h2.copyWith(
                          color: JaxColors.primaryContainer, fontSize: 20))),
              TextButton(
                onPressed: () {},
                child: Text('+ APPEND REGISTRY',
                    style: JaxText.label.copyWith(
                        color: JaxColors.primaryContainer,
                        letterSpacing: 1,
                        fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
            decoration: BoxDecoration(
              color: JaxColors.surfaceLow,
              borderRadius: BorderRadius.circular(JaxRadius.xl),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: const BoxDecoration(
                      color: Colors.white, shape: BoxShape.circle),
                  child: const Icon(Icons.upload_rounded,
                      color: JaxColors.outlineVariant, size: 24),
                ),
                const SizedBox(height: 16),
                Text('VAULT REGISTRY EMPTY',
                    style: JaxText.title.copyWith(
                        color: JaxColors.primaryContainer, fontSize: 12)),
                const SizedBox(height: 4),
                Text('ATTACH CORPORATE PAN OR TRADE LICENSE',
                    style: JaxText.label.copyWith(color: JaxColors.outline)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class StatCard extends StatelessWidget {
  const StatCard({required this.label, required this.value, super.key});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return JaxCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label.toUpperCase(), style: JaxText.label),
          const SizedBox(height: 10),
          Text(value, style: JaxText.h2),
        ],
      ),
    );
  }
}

class AdminScreen extends StatelessWidget {
  const AdminScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ResourceCubit()..load(() => apiOf(context).adminStats()),
      child: JaxPage(
        title: 'Admin',
        subtitle: 'Platform overview and moderation queues',
        child: BlocBuilder<ResourceCubit, ResourceState>(
          builder: (context, state) => AsyncContent(
            state: state,
            onRetry: () => context
                .read<ResourceCubit>()
                .load(() => apiOf(context).adminStats()),
            builder: (_) => Column(
              children: state.data.entries
                  .map((e) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: StatCard(label: e.key, value: textOf(e.value)),
                      ))
                  .toList(),
            ),
          ),
        ),
      ),
    );
  }
}

class DashedRectPainter extends CustomPainter {
  final Color color;
  final double strokeWidth;
  final double gap;
  final double borderRadius;

  DashedRectPainter(
      {required this.color,
      required this.strokeWidth,
      required this.gap,
      required this.borderRadius});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke;

    final path = Path()
      ..addRRect(RRect.fromRectAndRadius(
          Rect.fromLTWH(0, 0, size.width, size.height),
          Radius.circular(borderRadius)));

    final dashPath = Path();
    double distance = 0.0;
    for (PathMetric pathMetric in path.computeMetrics()) {
      while (distance < pathMetric.length) {
        dashPath.addPath(
            pathMetric.extractPath(distance, distance + gap), Offset.zero);
        distance += gap * 2;
      }
    }
    canvas.drawPath(dashPath, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _BulkImportDialog extends StatefulWidget {
  const _BulkImportDialog({Key? key}) : super(key: key);
  @override
  State<_BulkImportDialog> createState() => _BulkImportDialogState();
}

class _BulkImportDialogState extends State<_BulkImportDialog> {
  PlatformFile? _selectedCsv;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      backgroundColor: JaxColors.surface,
      child: Container(
        width: 600,
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.description_rounded,
                    color: JaxColors.success, size: 28),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('BULK INVENTORY SYNCHRONIZATION',
                          style: JaxText.h3.copyWith(fontSize: 16)),
                      const SizedBox(height: 4),
                      Wrap(
                        crossAxisAlignment: WrapCrossAlignment.center,
                        spacing: 8,
                        children: [
                          Text(
                              'FORMAT: TITLE, DESCRIPTION, CATEGORYID, PRICE, SKU',
                              style: JaxText.label.copyWith(
                                  fontSize: 8, color: JaxColors.outline)),
                          Text('DOWNLOAD SAMPLE TEMPLATE',
                              style: JaxText.label.copyWith(
                                  fontSize: 8,
                                  color: JaxColors.primaryContainer,
                                  decoration: TextDecoration.underline)),
                        ],
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded,
                      size: 20, color: JaxColors.outline),
                  onPressed: () => Navigator.of(context).pop(),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
            const SizedBox(height: 24),
            const Divider(color: JaxColors.outlineVariant, height: 1),
            const SizedBox(height: 24),
            CustomPaint(
              painter: DashedRectPainter(
                  color: JaxColors.outlineVariant,
                  strokeWidth: 1.5,
                  gap: 6.0,
                  borderRadius: 16),
              child: Container(
                width: double.infinity,
                padding:
                    const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
                decoration: BoxDecoration(
                  color: JaxColors.surface,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: JaxColors.outlineVariant.withValues(alpha: .2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.cloud_upload_rounded,
                          color: JaxColors.outline, size: 32),
                    ),
                    const SizedBox(height: 24),
                    Text('INITIALIZE DATA STREAM',
                        style: JaxText.h3.copyWith(fontSize: 14)),
                    const SizedBox(height: 8),
                    Text(
                        'Drag your product CSV here or click to browse. Ensure Category\nIDs match the global registry.',
                        textAlign: TextAlign.center,
                        style: JaxText.bodyMedium
                            .copyWith(color: JaxColors.outline, fontSize: 12)),
                    const SizedBox(height: 24),
                    if (_selectedCsv == null)
                      OutlinedButton(
                        onPressed: () async {
                          FilePickerResult? result = await FilePicker.pickFiles(
                            type: FileType.custom,
                            allowedExtensions: ['csv'],
                          );
                          if (result != null && result.files.isNotEmpty) {
                            setState(() => _selectedCsv = result.files.first);
                          }
                        },
                        style: OutlinedButton.styleFrom(
                          foregroundColor: JaxColors.primaryContainer,
                          side:
                              const BorderSide(color: JaxColors.outlineVariant),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 24, vertical: 16),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8)),
                          textStyle: JaxText.label
                              .copyWith(fontSize: 12, letterSpacing: 0),
                        ),
                        child: const Text('Select CSV File'),
                      )
                    else
                      Chip(
                        label: Text(_selectedCsv!.name,
                            style: JaxText.bodySmall.copyWith(fontSize: 12)),
                        onDeleted: () => setState(() => _selectedCsv = null),
                        deleteIcon: const Icon(Icons.close_rounded, size: 16),
                        backgroundColor: JaxColors.surfaceContainer,
                        side: BorderSide.none,
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class CertificationChip extends StatelessWidget {
  final String label;
  final bool isVerified;
  final Color color;

  const CertificationChip({
    required this.label,
    required this.isVerified,
    required this.color,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: .06),
        border: Border.all(color: color.withValues(alpha: .2)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.verified_outlined,
            size: 14,
            color: color,
          ),
          const SizedBox(width: 6),
          Text(
            label.toUpperCase(),
            style: JaxText.label.copyWith(
              color: color,
              fontSize: 10,
              fontWeight: FontWeight.w800,
            ),
          ),
          if (isVerified) ...[
            const SizedBox(width: 6),
            Icon(
              Icons.check_circle_rounded,
              size: 12,
              color: color,
            ),
          ],
        ],
      ),
    );
  }
}

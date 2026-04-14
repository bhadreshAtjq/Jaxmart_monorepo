// lib/screens/buyer/rfq_post_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../utils/constants.dart';
import '../../widgets/app_button.dart';
import '../../widgets/step_indicator.dart';
import '../../services/api_service.dart';
import '../../widgets/app_snackbar.dart';

class RfqPostScreen extends ConsumerStatefulWidget {
  final String? listingId;
  const RfqPostScreen({super.key, this.listingId});

  @override
  ConsumerState<RfqPostScreen> createState() => _RfqPostScreenState();
}

class _RfqPostScreenState extends ConsumerState<RfqPostScreen> {
  int _step = 0;
  bool _isLoading = false;

  // Step 1 data
  String _rfqType = 'SERVICE';
  String? _categoryId;
  String _categoryName = '';

  // Step 2 data
  final _titleController = TextEditingController();
  final _descController = TextEditingController();

  // Step 3 data
  final _locationController = TextEditingController();
  DateTime? _deadline;
  String? _providerType;
  double _budgetMin = 0;
  double _budgetMax = 100000;
  bool _hasBudget = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _isLoading = true);
    try {
      final rfq = await ApiService.instance.createRfq({
        'rfqType': _rfqType,
        'title': _titleController.text,
        'description': _descController.text,
        'categoryId': _categoryId,
        'locationPreference': _locationController.text,
        if (_deadline != null) 'deadline': _deadline!.toIso8601String(),
        if (_providerType != null) 'preferredProviderType': _providerType,
        if (_hasBudget) 'budgetMin': _budgetMin,
        if (_hasBudget) 'budgetMax': _budgetMax,
      });
      if (!mounted) return;
      AppSnackbar.show(context, 'RFQ posted! Providers are being notified.', isSuccess: true);
      context.go('/rfq/${rfq['id']}');
    } catch (e) {
      if (mounted) AppSnackbar.show(context, 'Failed to post RFQ. Please try again.', isError: true);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Post Requirement'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: StepIndicator(totalSteps: 3, currentStep: _step),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(child: _buildStep()),
            _buildNavigation(),
          ],
        ),
      ),
    );
  }

  Widget _buildStep() {
    switch (_step) {
      case 0: return _buildStep1();
      case 1: return _buildStep2();
      case 2: return _buildStep3();
      default: return const SizedBox();
    }
  }

  Widget _buildStep1() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('What do you need?', style: AppTextStyles.h2),
          const SizedBox(height: AppSpacing.sm),
          const Text('Select the type of requirement', style: AppTextStyles.bodyMedium),
          const SizedBox(height: AppSpacing.lg),
          _TypeCard(
            title: 'Product sourcing',
            subtitle: 'Find suppliers for physical goods',
            icon: Icons.inventory_2_rounded,
            selected: _rfqType == 'PRODUCT',
            onTap: () => setState(() => _rfqType = 'PRODUCT'),
          ),
          const SizedBox(height: AppSpacing.sm),
          _TypeCard(
            title: 'Service hiring',
            subtitle: 'Hire professionals or agencies',
            icon: Icons.handshake_rounded,
            selected: _rfqType == 'SERVICE',
            onTap: () => setState(() => _rfqType = 'SERVICE'),
          ),
          const SizedBox(height: AppSpacing.xl),
          const Text('Category', style: AppTextStyles.h5),
          const SizedBox(height: AppSpacing.sm),
          GestureDetector(
            onTap: _pickCategory,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: AppColors.gray50, borderRadius: BorderRadius.circular(AppRadius.md),
                border: Border.all(color: _categoryId != null ? AppColors.primary : AppColors.gray200),
              ),
              child: Row(
                children: [
                  Expanded(child: Text(_categoryId != null ? _categoryName : 'Select category', style: AppTextStyles.bodyMedium.copyWith(color: _categoryId != null ? AppColors.textPrimary : AppColors.textTertiary))),
                  const Icon(Icons.chevron_right_rounded, color: AppColors.gray400),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep2() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Describe your need', style: AppTextStyles.h2),
          const SizedBox(height: AppSpacing.sm),
          const Text('Be specific to get better quotes', style: AppTextStyles.bodyMedium),
          const SizedBox(height: AppSpacing.lg),
          const Text('Title *', style: AppTextStyles.h5),
          const SizedBox(height: AppSpacing.sm),
          TextFormField(
            controller: _titleController,
            decoration: const InputDecoration(hintText: 'e.g. Need 500 units of industrial rubber seals'),
            maxLength: 100,
          ),
          const SizedBox(height: AppSpacing.md),
          const Text('Description *', style: AppTextStyles.h5),
          const SizedBox(height: AppSpacing.sm),
          TextFormField(
            controller: _descController,
            decoration: const InputDecoration(hintText: 'Describe your requirements, specifications, delivery expectations...', alignLabelWithHint: true),
            maxLines: 6,
            maxLength: 1000,
          ),
        ],
      ),
    );
  }

  Widget _buildStep3() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Preferences', style: AppTextStyles.h2),
          const SizedBox(height: AppSpacing.sm),
          const Text('Help us find the best matches', style: AppTextStyles.bodyMedium),
          const SizedBox(height: AppSpacing.lg),
          const Text('Location preference', style: AppTextStyles.h5),
          const SizedBox(height: AppSpacing.sm),
          TextField(controller: _locationController, decoration: const InputDecoration(hintText: 'e.g. Mumbai, Maharashtra')),
          const SizedBox(height: AppSpacing.md),
          const Text('Provider type', style: AppTextStyles.h5),
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: [
              _SelectChip(label: 'Any', selected: _providerType == null, onTap: () => setState(() => _providerType = null)),
              const SizedBox(width: AppSpacing.sm),
              _SelectChip(label: 'Individual', selected: _providerType == 'INDIVIDUAL', onTap: () => setState(() => _providerType = 'INDIVIDUAL')),
              const SizedBox(width: AppSpacing.sm),
              _SelectChip(label: 'Business', selected: _providerType == 'BUSINESS', onTap: () => setState(() => _providerType = 'BUSINESS')),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Budget range (optional)', style: AppTextStyles.h5),
              Switch.adaptive(value: _hasBudget, onChanged: (v) => setState(() => _hasBudget = v), activeColor: AppColors.primary),
            ],
          ),
          if (_hasBudget) ...[
            const SizedBox(height: AppSpacing.sm),
            RangeSlider(
              values: RangeValues(_budgetMin, _budgetMax),
              min: 0, max: 1000000,
              divisions: 100,
              labels: RangeLabels('₹${_budgetMin.toInt()}', '₹${_budgetMax.toInt()}'),
              activeColor: AppColors.primary,
              onChanged: (v) => setState(() { _budgetMin = v.start; _budgetMax = v.end; }),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('₹${_budgetMin.toInt()}', style: AppTextStyles.labelMedium),
                Text('₹${_budgetMax.toInt()}', style: AppTextStyles.labelMedium),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildNavigation() {
    final isLastStep = _step == 2;
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: AppColors.gray200))),
      child: Row(
        children: [
          if (_step > 0)
            Expanded(
              child: OutlinedButton(
                onPressed: () => setState(() => _step--),
                child: const Text('Back'),
              ),
            ),
          if (_step > 0) const SizedBox(width: AppSpacing.md),
          Expanded(
            flex: 2,
            child: AppButton(
              label: isLastStep ? 'Post RFQ' : 'Continue',
              onPressed: _canProceed() ? (isLastStep ? _submit : () => setState(() => _step++)) : null,
              isLoading: _isLoading,
              icon: isLastStep ? Icons.check_rounded : Icons.arrow_forward_rounded,
            ),
          ),
        ],
      ),
    );
  }

  bool _canProceed() {
    switch (_step) {
      case 0: return _categoryId != null;
      case 1: return _titleController.text.length >= 10 && _descController.text.length >= 20;
      case 2: return true;
      default: return false;
    }
  }

  Future<void> _pickCategory() async {
    // TODO: Show category picker bottom sheet
  }
}

class _TypeCard extends StatelessWidget {
  final String title, subtitle;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  const _TypeCard({required this.title, required this.subtitle, required this.icon, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: selected ? AppColors.primarySurface : Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: selected ? AppColors.primary : AppColors.gray200, width: selected ? 2 : 1),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: selected ? AppColors.primary : AppColors.gray100, borderRadius: BorderRadius.circular(AppRadius.md)),
              child: Icon(icon, color: selected ? Colors.white : AppColors.gray500, size: 22),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTextStyles.h5.copyWith(color: selected ? AppColors.primary : AppColors.textPrimary)),
                  Text(subtitle, style: AppTextStyles.bodySmall),
                ],
              ),
            ),
            if (selected) const Icon(Icons.check_circle_rounded, color: AppColors.primary),
          ],
        ),
      ),
    );
  }
}

class _SelectChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _SelectChip({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? AppColors.primarySurface : AppColors.gray100,
          borderRadius: BorderRadius.circular(AppRadius.full),
          border: Border.all(color: selected ? AppColors.primary : Colors.transparent),
        ),
        child: Text(label, style: AppTextStyles.labelSmall.copyWith(color: selected ? AppColors.primary : AppColors.textSecondary)),
      ),
    );
  }
}

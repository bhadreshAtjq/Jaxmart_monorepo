// lib/screens/common/order_detail_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../utils/constants.dart';
import '../../widgets/app_button.dart';
import '../../widgets/milestone_card.dart';
import '../../widgets/user_avatar.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/app_snackbar.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';

final orderProvider = FutureProvider.family<Map<String, dynamic>, String>(
  (ref, id) => ApiService.instance.getOrder(id),
);

class OrderDetailScreen extends ConsumerStatefulWidget {
  final String id;
  const OrderDetailScreen({super.key, required this.id});

  @override
  ConsumerState<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends ConsumerState<OrderDetailScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() { _tabController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final orderAsync = ref.watch(orderProvider(widget.id));
    final currentUser = ref.watch(currentUserProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Order Details'),
        actions: [
          IconButton(icon: const Icon(Icons.message_outlined), onPressed: () => context.push('/messages')),
        ],
      ),
      body: orderAsync.when(
        data: (order) {
          final isBuyer = order['buyerId'] == currentUser?.id;
          final status = order['status'] as String;
          final milestones = (order['milestones'] as List<dynamic>? ?? []);
          final totalAmount = (order['totalAmount'] as num).toDouble();
          final escrowStatus = order['escrowStatus'] as String;

          return Column(
            children: [
              _buildHeader(order, status, totalAmount, escrowStatus),
              TabBar(
                controller: _tabController,
                tabs: const [Tab(text: 'Milestones'), Tab(text: 'Details'), Tab(text: 'Files')],
                indicatorColor: AppColors.primary,
                labelColor: AppColors.primary,
                unselectedLabelColor: AppColors.textSecondary,
              ),
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildMilestonesTab(milestones, order, isBuyer),
                    _buildDetailsTab(order, isBuyer),
                    _buildFilesTab(milestones),
                  ],
                ),
              ),
              if (status == 'CREATED' && order['contractSignedAt'] == null)
                _buildSignContractBar(order['id'] as String),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error loading order: $e')),
      ),
    );
  }

  Widget _buildHeader(Map<String, dynamic> order, String status, double total, String escrow) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(order['rfqQuote']?['rfq']?['title'] ?? 'Order', style: AppTextStyles.h4, maxLines: 2, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 4),
                    StatusBadge(status: status),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('₹${total.toStringAsFixed(0)}', style: AppTextStyles.h3.copyWith(color: AppColors.primary)),
                  Text('Total value', style: AppTextStyles.caption),
                ],
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Container(
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(color: AppColors.primarySurface, borderRadius: BorderRadius.circular(AppRadius.md)),
            child: Row(
              children: [
                const Icon(Icons.lock_rounded, size: 16, color: AppColors.primary),
                const SizedBox(width: 8),
                Text('Escrow: ${_escrowLabel(escrow)}', style: AppTextStyles.labelSmall.copyWith(color: AppColors.primary)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMilestonesTab(List<dynamic> milestones, Map<String, dynamic> order, bool isBuyer) {
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: milestones.length,
      itemBuilder: (_, i) {
        final milestone = milestones[i] as Map<String, dynamic>;
        return MilestoneCard(
          milestone: milestone,
          index: i + 1,
          isBuyer: isBuyer,
          onSubmit: isBuyer ? null : () => context.push('/orders/${widget.id}/milestone/${milestone['id']}/submit'),
          onApprove: isBuyer && milestone['status'] == 'SUBMITTED'
              ? () => _approveMilestone(order['id'] as String, milestone['id'] as String)
              : null,
          onDispute: isBuyer && milestone['status'] == 'SUBMITTED'
              ? () => _showDisputeSheet(order['id'] as String, milestone['id'] as String)
              : null,
        );
      },
    );
  }

  Widget _buildDetailsTab(Map<String, dynamic> order, bool isBuyer) {
    final counterparty = isBuyer ? order['seller'] : order['buyer'];
    final name = counterparty?['businessProfile']?['businessName'] ?? counterparty?['fullName'] ?? 'Unknown';

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.md),
      children: [
        const Text('Counterparty', style: AppTextStyles.h5),
        const SizedBox(height: AppSpacing.sm),
        Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.lg), border: Border.all(color: AppColors.gray200)),
          child: Row(
            children: [
              UserAvatar(name: name, size: 44),
              const SizedBox(width: AppSpacing.md),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: AppTextStyles.h5),
                  Text(isBuyer ? 'Seller' : 'Buyer', style: AppTextStyles.bodySmall),
                ],
              ),
              const Spacer(),
              IconButton(icon: const Icon(Icons.message_outlined, color: AppColors.primary), onPressed: () {}),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        const Text('Payment breakdown', style: AppTextStyles.h5),
        const SizedBox(height: AppSpacing.sm),
        _PaymentRow(label: 'Total value', value: '₹${(order['totalAmount'] as num).toStringAsFixed(0)}'),
        if (!isBuyer) _PaymentRow(label: 'Platform fee (5%)', value: '- ₹${(order['platformFee'] as num).toStringAsFixed(0)}', isDeduction: true),
        if (!isBuyer) _PaymentRow(label: 'Your payout', value: '₹${(order['sellerPayout'] as num).toStringAsFixed(0)}', isHighlighted: true),
      ],
    );
  }

  Widget _buildFilesTab(List<dynamic> milestones) {
    final allFiles = milestones.expand((m) => (m['submissionFiles'] as List<dynamic>? ?? [])).toList();
    if (allFiles.isEmpty) {
      return const Center(child: Text('No files shared yet', style: AppTextStyles.bodyMedium));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: allFiles.length,
      itemBuilder: (_, i) => ListTile(
        leading: const Icon(Icons.attach_file_rounded, color: AppColors.primary),
        title: Text('File ${i + 1}', style: AppTextStyles.labelMedium),
        trailing: const Icon(Icons.download_rounded, color: AppColors.textSecondary),
      ),
    );
  }

  Widget _buildSignContractBar(String orderId) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Contract pending signature', style: AppTextStyles.h5),
          const SizedBox(height: AppSpacing.sm),
          AppButton(
            label: 'Review & Sign Contract',
            onPressed: () => _signContract(orderId),
            icon: Icons.draw_rounded,
          ),
        ],
      ),
    );
  }

  String _escrowLabel(String status) {
    const labels = {
      'HELD': 'Funds secured',
      'PARTIAL_RELEASED': 'Partial released',
      'FULLY_RELEASED': 'Fully released',
      'FROZEN': 'Frozen (Dispute)',
    };
    return labels[status] ?? status;
  }

  Future<void> _approveMilestone(String orderId, String milestoneId) async {
    try {
      final result = await ApiService.instance.approveMilestone(orderId, milestoneId);
      ref.invalidate(orderProvider(widget.id));
      if (mounted) {
        AppSnackbar.show(context, 'Milestone approved! Payment released.', isSuccess: true);
        if (result['orderCompleted'] == true) {
          AppSnackbar.show(context, 'Order completed! Please leave a review.', isSuccess: true);
        }
      }
    } catch (e) {
      if (mounted) AppSnackbar.show(context, 'Failed to approve milestone', isError: true);
    }
  }

  Future<void> _signContract(String orderId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Sign Contract', style: AppTextStyles.h4),
        content: const Text('By signing, you agree to the scope of work and payment schedule.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          ElevatedButton(onPressed: () => Navigator.pop(context, true), child: const Text('Sign & Confirm')),
        ],
      ),
    );
    if (confirmed == true) {
      await ApiService.instance.signContract(orderId);
      ref.invalidate(orderProvider(widget.id));
      if (mounted) AppSnackbar.show(context, 'Contract signed! Order is now active.', isSuccess: true);
    }
  }

  Future<void> _showDisputeSheet(String orderId, String milestoneId) async {
    final reasonController = TextEditingController();
    await showModalBottomSheet(
      context: context, isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: EdgeInsets.only(left: 24, right: 24, top: 24, bottom: MediaQuery.of(context).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Raise Dispute', style: AppTextStyles.h3),
            const SizedBox(height: AppSpacing.md),
            TextField(controller: reasonController, decoration: const InputDecoration(hintText: 'Describe the issue...'), maxLines: 4),
            const SizedBox(height: AppSpacing.md),
            AppButton(
              label: 'Submit Dispute',
              onPressed: () async {
                await ApiService.instance.raiseDispute(orderId, {'milestoneId': milestoneId, 'reason': 'quality_issue', 'description': reasonController.text});
                if (mounted) { Navigator.pop(context); ref.invalidate(orderProvider(widget.id)); }
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _PaymentRow extends StatelessWidget {
  final String label, value;
  final bool isDeduction, isHighlighted;

  const _PaymentRow({required this.label, required this.value, this.isDeduction = false, this.isHighlighted = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: isHighlighted ? AppTextStyles.labelMedium : AppTextStyles.bodySmall),
          Text(value, style: (isHighlighted ? AppTextStyles.h5 : AppTextStyles.labelMedium).copyWith(color: isDeduction ? AppColors.error : isHighlighted ? AppColors.primary : AppColors.textPrimary)),
        ],
      ),
    );
  }
}

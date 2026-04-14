// lib/screens/seller/seller_dashboard_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../utils/constants.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/section_header.dart';
import '../../widgets/order_list_tile.dart';
import '../../services/api_service.dart';

final dashboardProvider = FutureProvider<Map<String, dynamic>>(
  (_) => ApiService.instance.getSellerDashboard(),
);

final balanceProvider = FutureProvider<Map<String, dynamic>>(
  (_) => ApiService.instance.getSellerBalance(),
);

class SellerDashboardScreen extends ConsumerWidget {
  const SellerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(dashboardProvider);
    final balance = ref.watch(balanceProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(child: _buildHeader(context)),
            SliverToBoxAdapter(
              child: dashboard.when(
                data: (data) => _buildStats(data, balance),
                loading: () => const SizedBox(height: 200, child: Center(child: CircularProgressIndicator())),
                error: (e, _) => Center(child: Text('Error: $e')),
              ),
            ),
            SliverToBoxAdapter(child: _buildQuickActions(context)),
            SliverToBoxAdapter(
              child: dashboard.when(
                data: (data) => _buildRecentOrders(context, data),
                loading: () => const SizedBox(),
                error: (_, __) => const SizedBox(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Row(
        children: [
          const Expanded(child: Text('Seller Dashboard', style: AppTextStyles.h2)),
          IconButton(
            icon: const Icon(Icons.notifications_none_rounded),
            onPressed: () => context.push('/notifications'),
          ),
        ],
      ),
    );
  }

  Widget _buildStats(Map<String, dynamic> data, AsyncValue<Map<String, dynamic>> balance) {
    final stats = data['stats'] as Map<String, dynamic>? ?? {};
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      child: Column(
        children: [
          // Earnings card
          balance.when(
            data: (b) => Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.md),
              margin: const EdgeInsets.only(bottom: AppSpacing.md),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [AppColors.primary, AppColors.primaryDark], begin: Alignment.topLeft, end: Alignment.bottomRight),
                borderRadius: BorderRadius.circular(AppRadius.lg),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('This month\'s earnings', style: TextStyle(fontFamily: 'Inter', color: Colors.white70, fontSize: 13)),
                  const SizedBox(height: 4),
                  Text(
                    '₹${((b['releasedThisMonth'] as num?) ?? 0).toStringAsFixed(0)}',
                    style: const TextStyle(fontFamily: 'Inter', color: Colors.white, fontSize: 28, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Row(
                    children: [
                      const Icon(Icons.lock_rounded, size: 14, color: Colors.white70),
                      const SizedBox(width: 4),
                      Text('₹${((b['pendingEscrow'] as num?) ?? 0).toStringAsFixed(0)} in escrow', style: const TextStyle(fontFamily: 'Inter', color: Colors.white70, fontSize: 12)),
                    ],
                  ),
                ],
              ),
            ),
            loading: () => const SizedBox(),
            error: (_, __) => const SizedBox(),
          ),
          Row(
            children: [
              Expanded(child: StatCard(label: 'Active orders', value: '${stats['activeOrders'] ?? 0}', icon: Icons.assignment_rounded, color: AppColors.primary)),
              const SizedBox(width: AppSpacing.sm),
              Expanded(child: StatCard(label: 'Pending quotes', value: '${stats['pendingQuotes'] ?? 0}', icon: Icons.pending_actions_rounded, color: AppColors.warning)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    final actions = [
      (Icons.add_box_rounded, 'Add Listing', () => context.push('/seller/listings/add')),
      (Icons.inventory_2_rounded, 'My Listings', () => context.push('/seller/listings')),
      (Icons.inbox_rounded, 'RFQ Inbox', () => context.push('/seller/rfq-inbox')),
      (Icons.account_balance_wallet_rounded, 'Payouts', () {}),
    ];

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.lg, AppSpacing.md, AppSpacing.sm),
          child: Row(children: [const Text('Quick actions', style: AppTextStyles.h4), const Spacer()]),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          child: GridView.count(
            crossAxisCount: 4,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: actions.map((a) => _QuickActionButton(icon: a.$1, label: a.$2, onTap: a.$3)).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildRecentOrders(BuildContext context, Map<String, dynamic> data) {
    final orders = (data['recentOrders'] as List<dynamic>? ?? []);
    if (orders.isEmpty) return const SizedBox();
    return Column(
      children: [
        SectionHeader(title: 'Recent orders', onSeeAll: () => context.push('/orders?role=seller')),
        ...orders.map((o) => Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
          child: OrderListTile(order: o as Map<String, dynamic>, role: 'seller'),
        )),
        const SizedBox(height: AppSpacing.lg),
      ],
    );
  }
}

class _QuickActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _QuickActionButton({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 52, height: 52,
            decoration: BoxDecoration(color: AppColors.primarySurface, borderRadius: BorderRadius.circular(14)),
            child: Icon(icon, color: AppColors.primary, size: 24),
          ),
          const SizedBox(height: 6),
          Text(label, style: AppTextStyles.caption, textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

// lib/widgets/listing_card.dart
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../utils/constants.dart';
import 'status_badge.dart';

class ListingCard extends StatelessWidget {
  final Map<String, dynamic> listing;
  final VoidCallback? onTap;

  const ListingCard({super.key, required this.listing, this.onTap});

  @override
  Widget build(BuildContext context) {
    final media = (listing['media'] as List<dynamic>? ?? []);
    final imageUrl = media.isNotEmpty ? media[0]['url'] as String? : null;
    final seller = listing['seller'] as Map<String, dynamic>? ?? {};
    final productDetail = listing['productDetail'] as Map<String, dynamic>?;
    final serviceDetail = listing['serviceDetail'] as Map<String, dynamic>?;
    final category = listing['category'] as Map<String, dynamic>? ?? {};
    final location = listing['location'] as Map<String, dynamic>?;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: AppColors.gray200),
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.only(topLeft: Radius.circular(AppRadius.lg), bottomLeft: Radius.circular(AppRadius.lg)),
              child: imageUrl != null
                  ? CachedNetworkImage(imageUrl: imageUrl, width: 96, height: 96, fit: BoxFit.cover)
                  : Container(width: 96, height: 96, color: AppColors.gray100, child: const Icon(Icons.image_rounded, color: AppColors.gray400, size: 32)),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.sm),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: AppColors.primarySurface, borderRadius: BorderRadius.circular(4)),
                          child: Text(category['name'] as String? ?? '', style: const TextStyle(fontFamily: 'Inter', fontSize: 10, color: AppColors.primary, fontWeight: FontWeight.w500)),
                        ),
                        const Spacer(),
                        if (listing['isFeatured'] == true) Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: AppColors.warningSurface, borderRadius: BorderRadius.circular(4)),
                          child: const Text('Featured', style: TextStyle(fontFamily: 'Inter', fontSize: 10, color: AppColors.warning, fontWeight: FontWeight.w500)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(listing['title'] as String? ?? '', style: AppTextStyles.labelMedium, maxLines: 2, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 4),
                    if (productDetail != null) ...[
                      Text(
                        productDetail['priceOnRequest'] == true ? 'Price on request' : '₹${productDetail['pricePerUnit'] ?? 'N/A'}',
                        style: AppTextStyles.labelMedium.copyWith(color: AppColors.primary),
                      ),
                    ],
                    if (serviceDetail != null) ...[
                      Text(
                        (serviceDetail['skillsTags'] as List<dynamic>? ?? []).take(2).join(', '),
                        style: AppTextStyles.bodySmall, maxLines: 1, overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.star_rounded, size: 12, color: AppColors.warning),
                        const SizedBox(width: 2),
                        Text('${((listing['avgRating'] as num?) ?? 0).toStringAsFixed(1)}', style: AppTextStyles.caption),
                        const SizedBox(width: 8),
                        if (location != null) ...[
                          const Icon(Icons.location_on_rounded, size: 12, color: AppColors.gray400),
                          Expanded(child: Text('${location['city']}', style: AppTextStyles.caption, overflow: TextOverflow.ellipsis)),
                        ],
                      ],
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

// lib/widgets/status_badge.dart
class StatusBadge extends StatelessWidget {
  final String status;
  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final config = _getConfig(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: config.$2, borderRadius: BorderRadius.circular(AppRadius.full)),
      child: Text(config.$1, style: TextStyle(fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w500, color: config.$3)),
    );
  }

  (String, Color, Color) _getConfig(String s) {
    switch (s.toUpperCase()) {
      case 'ACTIVE': return ('Active', AppColors.successSurface, AppColors.success);
      case 'COMPLETED': return ('Completed', AppColors.secondarySurface, AppColors.secondary);
      case 'CREATED': return ('Awaiting payment', AppColors.warningSurface, AppColors.warning);
      case 'DISPUTED': return ('In dispute', AppColors.errorSurface, AppColors.error);
      case 'PENDING': return ('Pending', AppColors.gray100, AppColors.gray500);
      case 'SUBMITTED': return ('Submitted', AppColors.infoSurface, AppColors.info);
      case 'RELEASED': return ('Released', AppColors.successSurface, AppColors.success);
      case 'OPEN': return ('Open', AppColors.successSurface, AppColors.success);
      case 'AWARDED': return ('Awarded', AppColors.primarySurface, AppColors.primary);
      case 'WON': return ('Won', AppColors.successSurface, AppColors.success);
      case 'LOST': return ('Lost', AppColors.gray100, AppColors.gray500);
      case 'SHORTLISTED': return ('Shortlisted', AppColors.infoSurface, AppColors.info);
      default: return (s, AppColors.gray100, AppColors.gray500);
    }
  }
}

// lib/widgets/stat_card.dart
class StatCard extends StatelessWidget {
  final String label, value;
  final IconData icon;
  final Color color;
  const StatCard({super.key, required this.label, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.lg), border: Border.all(color: AppColors.gray200)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: AppSpacing.sm),
          Text(value, style: AppTextStyles.h2.copyWith(color: color)),
          Text(label, style: AppTextStyles.caption),
        ],
      ),
    );
  }
}

// lib/widgets/milestone_card.dart
class MilestoneCard extends StatelessWidget {
  final Map<String, dynamic> milestone;
  final int index;
  final bool isBuyer;
  final VoidCallback? onSubmit, onApprove, onDispute;

  const MilestoneCard({super.key, required this.milestone, required this.index, required this.isBuyer, this.onSubmit, this.onApprove, this.onDispute});

  @override
  Widget build(BuildContext context) {
    final status = milestone['status'] as String;
    final amount = (milestone['amount'] as num).toDouble();

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.lg), border: Border.all(color: AppColors.gray200)),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              children: [
                Container(
                  width: 32, height: 32,
                  decoration: BoxDecoration(color: _statusColor(status).withOpacity(0.1), shape: BoxShape.circle),
                  child: Center(child: Text('$index', style: TextStyle(fontFamily: 'Inter', color: _statusColor(status), fontWeight: FontWeight.w600, fontSize: 14))),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(milestone['title'] as String, style: AppTextStyles.labelMedium),
                      StatusBadge(status: status),
                    ],
                  ),
                ),
                Text('₹${amount.toStringAsFixed(0)}', style: AppTextStyles.h5.copyWith(color: AppColors.primary)),
              ],
            ),
          ),
          if (onSubmit != null || onApprove != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
              decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.gray100))),
              child: Row(
                children: [
                  if (onDispute != null) Expanded(child: OutlinedButton(onPressed: onDispute, style: OutlinedButton.styleFrom(foregroundColor: AppColors.error, side: const BorderSide(color: AppColors.error)), child: const Text('Dispute'))),
                  if (onDispute != null && onApprove != null) const SizedBox(width: AppSpacing.sm),
                  if (onApprove != null) Expanded(child: ElevatedButton(onPressed: onApprove, child: const Text('Approve & Release'))),
                  if (onSubmit != null) Expanded(child: ElevatedButton(onPressed: onSubmit, child: const Text('Submit Milestone'))),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'RELEASED': return AppColors.success;
      case 'SUBMITTED': return AppColors.info;
      case 'DISPUTED': return AppColors.error;
      case 'APPROVED': return AppColors.success;
      default: return AppColors.gray400;
    }
  }
}

// lib/widgets/section_header.dart
class SectionHeader extends StatelessWidget {
  final String title;
  final VoidCallback? onSeeAll;
  const SectionHeader({super.key, required this.title, this.onSeeAll});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
      child: Row(
        children: [
          Text(title, style: AppTextStyles.h4),
          const Spacer(),
          if (onSeeAll != null) GestureDetector(
            onTap: onSeeAll,
            child: const Text('See all', style: TextStyle(fontFamily: 'Inter', color: AppColors.primary, fontSize: 13, fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }
}

// lib/widgets/user_avatar.dart
class UserAvatar extends StatelessWidget {
  final String name;
  final String? imageUrl;
  final double size;
  const UserAvatar({super.key, required this.name, this.imageUrl, this.size = 40});

  @override
  Widget build(BuildContext context) {
    final initials = name.split(' ').take(2).map((w) => w.isEmpty ? '' : w[0].toUpperCase()).join();
    if (imageUrl != null) {
      return ClipOval(child: CachedNetworkImage(imageUrl: imageUrl!, width: size, height: size, fit: BoxFit.cover));
    }
    return Container(
      width: size, height: size,
      decoration: BoxDecoration(color: AppColors.primarySurface, shape: BoxShape.circle),
      child: Center(child: Text(initials, style: TextStyle(fontFamily: 'Inter', color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: size * 0.35))),
    );
  }
}

// lib/widgets/category_chip.dart
class CategoryChip extends StatelessWidget {
  final String name;
  final IconData icon;
  final VoidCallback onTap;
  const CategoryChip({super.key, required this.name, required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 56, height: 56,
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.gray200)),
            child: Icon(icon, color: AppColors.primary, size: 26),
          ),
          const SizedBox(height: 4),
          SizedBox(width: 64, child: Text(name, style: AppTextStyles.caption, textAlign: TextAlign.center, maxLines: 2, overflow: TextOverflow.ellipsis)),
        ],
      ),
    );
  }
}

// lib/widgets/order_list_tile.dart
class OrderListTile extends StatelessWidget {
  final Map<String, dynamic> order;
  final String role;
  const OrderListTile({super.key, required this.order, required this.role});

  @override
  Widget build(BuildContext context) {
    final counterparty = role == 'buyer' ? order['seller'] : order['buyer'];
    final name = counterparty?['businessProfile']?['businessName'] ?? counterparty?['fullName'] ?? 'Unknown';
    final amount = (order['totalAmount'] as num).toDouble();
    final status = order['status'] as String;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.lg), border: Border.all(color: AppColors.gray200)),
      child: Row(
        children: [
          UserAvatar(name: name, size: 40),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: AppTextStyles.labelMedium),
                StatusBadge(status: status),
              ],
            ),
          ),
          Text('₹${amount.toStringAsFixed(0)}', style: AppTextStyles.labelMedium.copyWith(color: AppColors.primary)),
        ],
      ),
    );
  }
}

// lib/widgets/step_indicator.dart
class StepIndicator extends StatelessWidget {
  final int totalSteps, currentStep;
  const StepIndicator({super.key, required this.totalSteps, required this.currentStep});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(totalSteps, (i) => Expanded(
        child: Container(
          height: 3,
          margin: EdgeInsets.only(left: i > 0 ? 2 : 0),
          color: i <= currentStep ? AppColors.primary : AppColors.gray200,
        ),
      )),
    );
  }
}

// lib/widgets/app_snackbar.dart
class AppSnackbar {
  static void show(BuildContext context, String message, {bool isError = false, bool isSuccess = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(message, style: const TextStyle(fontFamily: 'Inter', color: Colors.white)),
      backgroundColor: isError ? AppColors.error : isSuccess ? AppColors.success : AppColors.gray800,
      behavior: SnackBarBehavior.floating,
      margin: const EdgeInsets.all(AppSpacing.md),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
      duration: const Duration(seconds: 3),
    ));
  }
}

// lib/widgets/filter_bottom_sheet.dart
class FilterBottomSheet extends StatefulWidget {
  final Map<String, dynamic> current;
  final Function(Map<String, dynamic>) onApply;
  const FilterBottomSheet({super.key, required this.current, required this.onApply});

  @override
  State<FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends State<FilterBottomSheet> {
  late Map<String, dynamic> _filters;

  @override
  void initState() {
    super.initState();
    _filters = Map.from(widget.current);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(left: 24, right: 24, top: 24, bottom: MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('Filters', style: AppTextStyles.h3),
              const Spacer(),
              TextButton(onPressed: () { setState(() => _filters = {}); }, child: const Text('Clear all')),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          const Text('Verified sellers only', style: AppTextStyles.labelMedium),
          Switch.adaptive(
            value: _filters['isVerified'] == 'true',
            onChanged: (v) => setState(() => _filters['isVerified'] = v ? 'true' : 'false'),
            activeColor: AppColors.primary,
          ),
          const SizedBox(height: AppSpacing.md),
          ElevatedButton(
            onPressed: () { widget.onApply(_filters); Navigator.pop(context); },
            child: const Text('Apply filters'),
          ),
        ],
      ),
    );
  }
}

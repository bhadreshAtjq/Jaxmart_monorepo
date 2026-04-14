// lib/screens/buyer/home_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../utils/constants.dart';
import '../../widgets/listing_card.dart';
import '../../widgets/category_chip.dart';
import '../../widgets/section_header.dart';
import '../../services/api_service.dart';

final categoriesProvider = FutureProvider<List<dynamic>>((ref) async {
  return ApiService.instance.getCategories();
});

final featuredListingsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ApiService.instance.searchListings({'sortBy': 'featured', 'limit': '6'});
});

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});
  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _searchController = TextEditingController();

  @override
  void dispose() { _searchController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final categories = ref.watch(categoriesProvider);
    final featured = ref.watch(featuredListingsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(child: _buildHeader(user)),
            SliverToBoxAdapter(child: _buildSearch()),
            SliverToBoxAdapter(
              child: categories.when(
                data: (cats) => _buildCategories(cats),
                loading: () => const SizedBox(height: 80, child: Center(child: CircularProgressIndicator())),
                error: (_, __) => const SizedBox(),
              ),
            ),
            SliverToBoxAdapter(
              child: SectionHeader(title: 'Featured listings', onSeeAll: () => context.push('/search?sortBy=featured')),
            ),
            featured.when(
              data: (data) {
                final listings = (data['listings'] as List<dynamic>? ?? []);
                return SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (_, i) => Padding(
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
                      child: ListingCard(listing: listings[i] as Map<String, dynamic>),
                    ),
                    childCount: listings.length,
                  ),
                );
              },
              loading: () => const SliverToBoxAdapter(child: Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))),
              error: (_, __) => const SliverToBoxAdapter(child: SizedBox()),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 24)),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(user) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.md, AppSpacing.md, 0),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Hello, ${user?.fullName?.split(' ').first ?? 'there'} 👋',
                    style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
                const Text('What are you sourcing today?', style: AppTextStyles.h3),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => context.push('/notifications'),
            child: Stack(
              children: [
                Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.gray200)),
                  child: const Icon(Icons.notifications_none_rounded, color: AppColors.textSecondary, size: 22),
                ),
                Positioned(
                  top: 6, right: 6,
                  child: Container(width: 8, height: 8, decoration: const BoxDecoration(color: AppColors.error, shape: BoxShape.circle)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearch() {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () => context.push('/search'),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
                decoration: BoxDecoration(
                  color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(color: AppColors.gray200),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.search_rounded, color: AppColors.gray400, size: 20),
                    const SizedBox(width: 10),
                    Text('Search products, services...', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textTertiary)),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          GestureDetector(
            onTap: () => context.push('/rfq/post'),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(AppRadius.md)),
              child: const Icon(Icons.add_rounded, color: Colors.white, size: 24),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategories(List<dynamic> categories) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(AppSpacing.md, 0, AppSpacing.md, AppSpacing.sm),
          child: Text('Browse by category', style: AppTextStyles.h5),
        ),
        SizedBox(
          height: 90,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            itemCount: categories.length,
            itemBuilder: (_, i) {
              final cat = categories[i] as Map<String, dynamic>;
              return Padding(
                padding: const EdgeInsets.only(right: AppSpacing.sm),
                child: CategoryChip(
                  name: cat['name'] as String,
                  icon: _categoryIcon(cat['slug'] as String? ?? ''),
                  onTap: () => context.push('/search?categoryId=${cat['id']}'),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: AppSpacing.md),
      ],
    );
  }

  IconData _categoryIcon(String slug) {
    const icons = {
      'industrial': Icons.factory_rounded,
      'digital-services': Icons.computer_rounded,
      'professional': Icons.business_center_rounded,
      'logistics': Icons.local_shipping_rounded,
      'local-services': Icons.home_repair_service_rounded,
    };
    for (final key in icons.keys) {
      if (slug.contains(key)) return icons[key]!;
    }
    return Icons.category_rounded;
  }
}

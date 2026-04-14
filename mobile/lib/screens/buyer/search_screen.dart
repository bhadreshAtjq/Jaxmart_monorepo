// lib/screens/buyer/search_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../utils/constants.dart';
import '../../widgets/listing_card.dart';
import '../../widgets/filter_bottom_sheet.dart';
import '../../services/api_service.dart';

final searchProvider = FutureProvider.family<Map<String, dynamic>, Map<String, dynamic>>(
  (ref, params) => ApiService.instance.searchListings(params),
);

class SearchScreen extends ConsumerStatefulWidget {
  final String? query;
  const SearchScreen({super.key, this.query});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchController = TextEditingController();
  Map<String, dynamic> _filters = {};
  String _sortBy = 'relevance';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    if (widget.query != null) _searchController.text = widget.query!;
    _filters = {'q': widget.query ?? '', 'limit': '20', 'page': '1'};
  }

  @override
  void dispose() { _tabController.dispose(); _searchController.dispose(); super.dispose(); }

  void _applyFilters(Map<String, dynamic> newFilters) {
    setState(() {
      _filters = {..._filters, ...newFilters, 'page': '1'};
    });
  }

  void _search(String q) {
    setState(() { _filters = {..._filters, 'q': q, 'page': '1'}; });
  }

  @override
  Widget build(BuildContext context) {
    final currentFilters = {
      ..._filters,
      'sortBy': _sortBy,
      if (_tabController.index == 1) 'type': 'PRODUCT',
      if (_tabController.index == 2) 'type': 'SERVICE',
    };
    final results = ref.watch(searchProvider(currentFilters));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        titleSpacing: 0,
        title: TextField(
          controller: _searchController,
          autofocus: widget.query == null,
          decoration: InputDecoration(
            hintText: 'Search products, services...',
            border: InputBorder.none,
            enabledBorder: InputBorder.none,
            focusedBorder: InputBorder.none,
            filled: false,
            suffixIcon: _searchController.text.isNotEmpty
                ? IconButton(icon: const Icon(Icons.clear_rounded, size: 20), onPressed: () { _searchController.clear(); _search(''); })
                : null,
          ),
          onSubmitted: _search,
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune_rounded),
            onPressed: () => showModalBottomSheet(
              context: context, isScrollControlled: true,
              shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
              builder: (_) => FilterBottomSheet(current: _filters, onApply: _applyFilters),
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          onTap: (_) => setState(() {}),
          tabs: const [Tab(text: 'All'), Tab(text: 'Products'), Tab(text: 'Services')],
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          labelStyle: const TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w600, fontSize: 14),
        ),
      ),
      body: Column(
        children: [
          _buildSortBar(results),
          Expanded(
            child: results.when(
              data: (data) {
                final listings = (data['listings'] as List<dynamic>? ?? []);
                final total = data['pagination']?['total'] ?? 0;
                if (listings.isEmpty) return _buildEmpty();
                return ListView.builder(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  itemCount: listings.length + 1,
                  itemBuilder: (_, i) {
                    if (i == 0) return Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                      child: Text('$total results', style: AppTextStyles.bodySmall),
                    );
                    return Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                      child: ListingCard(
                        listing: listings[i - 1] as Map<String, dynamic>,
                        onTap: () => context.push('/listings/${listings[i - 1]['id']}'),
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSortBar(AsyncValue results) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
      child: Row(
        children: [
          const Text('Sort: ', style: AppTextStyles.labelSmall),
          ...[('relevance', 'Relevant'), ('rating', 'Top rated'), ('newest', 'Newest')].map(
            (item) => Padding(
              padding: const EdgeInsets.only(right: AppSpacing.sm),
              child: GestureDetector(
                onTap: () => setState(() => _sortBy = item.$1),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: _sortBy == item.$1 ? AppColors.primarySurface : AppColors.gray100,
                    borderRadius: BorderRadius.circular(AppRadius.full),
                  ),
                  child: Text(item.$2, style: AppTextStyles.labelSmall.copyWith(color: _sortBy == item.$1 ? AppColors.primary : AppColors.textSecondary)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.search_off_rounded, size: 56, color: AppColors.gray300),
          const SizedBox(height: AppSpacing.md),
          const Text('No results found', style: AppTextStyles.h4),
          const SizedBox(height: AppSpacing.sm),
          Text('Try different keywords or post an RFQ\nand let sellers come to you', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary), textAlign: TextAlign.center),
          const SizedBox(height: AppSpacing.lg),
          ElevatedButton.icon(
            onPressed: () => context.push('/rfq/post'),
            icon: const Icon(Icons.add_rounded),
            label: const Text('Post RFQ'),
          ),
        ],
      ),
    );
  }
}

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

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
              Image.asset('assets/images/JaxMart_bg.png', height: 58),
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
  final _phone = TextEditingController();
  final _name = TextEditingController();
  String _type = 'BUYER';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 28),
              Image.asset('assets/images/JaxMart_bg.png', height: 42),
              const SizedBox(height: 32),
              const Text('Trade securely with verified B2B partners', style: JaxText.h1),
              const SizedBox(height: 8),
              Text('Log in with OTP to access RFQs, orders, listings, chat, notifications, and seller tools.', style: JaxText.bodyMedium.copyWith(color: JaxColors.onSurfaceVariant)),
              const SizedBox(height: 28),
              BlocConsumer<AuthCubit, AuthState>(
                listener: (context, state) {
                  if (state.message == 'OTP sent' && state.phone != null) {
                    context.push('/auth/otp?phone=${state.phone}&name=${Uri.encodeComponent(_name.text)}&type=$_type');
                  }
                  if (state.status == AuthStatus.failure && state.message != null) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.message!)));
                  }
                },
                builder: (context, state) {
                  return FormCard(
                    children: [
                      const FieldLabel('Mobile number'),
                      TextField(controller: _phone, keyboardType: TextInputType.phone, decoration: const InputDecoration(hintText: '10 digit phone number')),
                      const FieldLabel('Full name'),
                      TextField(controller: _name, textCapitalization: TextCapitalization.words, decoration: const InputDecoration(hintText: 'Required for new accounts')),
                      const FieldLabel('Account mode'),
                      SegmentedButton<String>(
                        segments: const [
                          ButtonSegment(value: 'BUYER', label: Text('Buyer'), icon: Icon(Icons.shopping_bag_rounded)),
                          ButtonSegment(value: 'SELLER', label: Text('Seller'), icon: Icon(Icons.storefront_rounded)),
                          ButtonSegment(value: 'BOTH', label: Text('Both'), icon: Icon(Icons.swap_horiz_rounded)),
                        ],
                        selected: {_type},
                        onSelectionChanged: (value) => setState(() => _type = value.first),
                      ),
                      JaxButton(
                        label: 'Log In (Mock Data)',
                        fullWidth: true,
                        loading: state.status == AuthStatus.loading,
                        icon: Icons.login_rounded,
                        onPressed: () => context.read<AuthCubit>().mockLogin(
                          phone: _phone.text,
                          fullName: _name.text,
                          userType: _type,
                        ),
                      ),
                    ],
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class OtpScreen extends StatefulWidget {
  const OtpScreen({required this.phone, this.fullName, this.userType, super.key});
  final String phone;
  final String? fullName;
  final String? userType;

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _otp = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verify OTP')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: BlocConsumer<AuthCubit, AuthState>(
            listener: (context, state) {
              if (state.isLoggedIn) context.go('/home');
              if (state.status == AuthStatus.failure && state.message != null) {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.message!)));
              }
            },
            builder: (context, state) {
              return FormCard(
                children: [
                  Text('Enter the code sent to ${widget.phone}', style: JaxText.bodyMedium),
                  TextField(
                    controller: _otp,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    decoration: const InputDecoration(labelText: 'OTP', counterText: ''),
                  ),
                  JaxButton(
                    label: 'Verify and continue',
                    fullWidth: true,
                    loading: state.status == AuthStatus.loading,
                    icon: Icons.verified_rounded,
                    onPressed: () => context.read<AuthCubit>().verifyOtp(
                          phone: widget.phone,
                          otp: _otp.text,
                          fullName: widget.fullName,
                          userType: widget.userType,
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
          result['featured'] = asMap(await api.searchListings({'limit': 12, 'sortBy': 'featured'}))['listings'] ?? [];
          result['events'] = asMap(await api.events())['events'] ?? [];
          if (auth.isLoggedIn) {
            result['rfqs'] = asMap(await api.sellerRfqInbox({'matchOnly': 'false', 'limit': 6}))['rfqs'] ?? [];
          }
          return result;
        }),
      child: JaxPage(
        title: 'Wholesale Market',
        subtitle: 'Verified suppliers, live RFQs, escrow-backed transactions',
        actions: [
          IconButton(onPressed: () => context.push('/rfq/create'), icon: const Icon(Icons.bolt_rounded), tooltip: 'Post RFQ'),
        ],
        child: BlocBuilder<ResourceCubit, ResourceState>(
          builder: (context, state) => AsyncContent(
            state: state,
            emptyTitle: 'Marketplace content unavailable',
            onRetry: () => context.read<ResourceCubit>().load(() => apiOf(context).searchListings({'limit': 12})),
            builder: (_) => Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const HeroSearchCard(),
                const SizedBox(height: 18),
                EventCarousel(events: asList(state.data['events'])),
                const SizedBox(height: 22),
                SectionTitle(title: 'Premium Bulk Listings', action: () => context.push('/search')),
                const SizedBox(height: 12),
                ...asList(state.data['featured']).take(6).map((item) => Padding(padding: const EdgeInsets.only(bottom: 12), child: ListingTile(item: item))),
                const SizedBox(height: 10),
                const SectionTitle(title: 'Browse Markets & Industries'),
                const SizedBox(height: 12),
                CategoryGrid(categories: asList(state.data['categories'])),
                if (asList(state.data['rfqs']).isNotEmpty) ...[
                  const SizedBox(height: 24),
                  SectionTitle(title: 'Active RFQ Requests', action: () => context.push('/seller/rfq-inbox')),
                  const SizedBox(height: 12),
                  ...asList(state.data['rfqs']).take(4).map((item) => Padding(padding: const EdgeInsets.only(bottom: 12), child: RfqTile(item: item, sellerMode: true))),
                ],
              ],
            ),
          ),
        ),
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
  Widget build(BuildContext context) {
    return JaxCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SegmentedButton<String>(
            segments: const [
              ButtonSegment(value: 'products', label: Text('Products'), icon: Icon(Icons.category_rounded)),
              ButtonSegment(value: 'suppliers', label: Text('Suppliers'), icon: Icon(Icons.factory_rounded)),
            ],
            selected: {_tab},
            onSelectionChanged: (value) => setState(() => _tab = value.first),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _query,
            decoration: InputDecoration(
              hintText: _tab == 'products' ? 'Search products, HSN codes, brands...' : 'Search factories, suppliers, GSTIN...',
              prefixIcon: const Icon(Icons.search_rounded),
              suffixIcon: IconButton(icon: const Icon(Icons.arrow_forward_rounded), onPressed: _go),
            ),
            onSubmitted: (_) => _go(),
          ),
          const SizedBox(height: 12),
          JaxButton(label: 'Post Request Free', fullWidth: true, icon: Icons.request_quote_rounded, onPressed: () => context.push('/rfq/create?title=${Uri.encodeComponent(_query.text)}')),
        ],
      ),
    );
  }

  void _go() {
    final q = _query.text.trim();
    if (q.isEmpty) return;
    context.push('/search?q=${Uri.encodeComponent(q)}${_tab == 'suppliers' ? '&type=supplier' : ''}');
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
      if (mounted && widget.events.length > 1) setState(() => _index = (_index + 1) % widget.events.length);
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
      decoration: BoxDecoration(color: const Color(0xFF090B11), borderRadius: BorderRadius.circular(JaxRadius.xl)),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        fit: StackFit.expand,
        children: [
          if (media.isNotEmpty) Image.network(media, fit: BoxFit.cover, opacity: const AlwaysStoppedAnimation(.72)),
          const DecoratedBox(decoration: BoxDecoration(gradient: LinearGradient(colors: [Colors.transparent, Colors.black87], begin: Alignment.topCenter, end: Alignment.bottomCenter))),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const StatusPill(label: 'Upcoming B2B Event', color: JaxColors.secondary),
                const SizedBox(height: 10),
                Text(textOf(event['title']), style: JaxText.h3.copyWith(color: Colors.white), maxLines: 1, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 6),
                Text(textOf(event['description']), style: JaxText.bodySmall.copyWith(color: Colors.white70), maxLines: 2, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 10),
                Row(
                  children: [
                    const Icon(Icons.location_on_rounded, color: JaxColors.secondary, size: 16),
                    Expanded(child: Text(textOf(event['location'], 'Online'), style: JaxText.bodySmall.copyWith(color: Colors.white70), maxLines: 1)),
                    Text(shortDate(event['date']), style: JaxText.label.copyWith(color: Colors.white)),
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
    if (categories.isEmpty) return const EmptyState(title: 'No categories available');
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: categories.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 2.4, crossAxisSpacing: 10, mainAxisSpacing: 10),
      itemBuilder: (context, index) {
        final cat = categories[index];
        return JaxCard(
          padding: const EdgeInsets.all(12),
          onTap: () => context.push('/search?category=${cat['id']}'),
          child: Row(
            children: [
              Container(height: 38, width: 38, decoration: BoxDecoration(color: JaxColors.secondary.withValues(alpha: .10), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.category_rounded, color: JaxColors.secondaryDark)),
              const SizedBox(width: 10),
              Expanded(child: Text(textOf(cat['name']), style: JaxText.title.copyWith(fontSize: 12), maxLines: 2, overflow: TextOverflow.ellipsis)),
            ],
          ),
        );
      },
    );
  }
}

class SectionTitle extends StatelessWidget {
  const SectionTitle({required this.title, this.action, super.key});
  final String title;
  final VoidCallback? action;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Text(title, style: JaxText.h3)),
        if (action != null) TextButton(onPressed: action, child: const Text('View all')),
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
  String _category = '';
  String _sort = 'relevance';
  bool _verified = false;
  bool _grid = false;
  int _page = 1;

  @override
  void initState() {
    super.initState();
    _category = widget.category ?? '';
  }

  Map<String, dynamic> get _params => {
        'q': _q.text.trim(),
        'limit': 12,
        'page': _page,
        if (widget.type != null && widget.type!.isNotEmpty) 'type': widget.type,
        if (_category.isNotEmpty) 'categoryId': _category,
        if (_sort != 'relevance') 'sortBy': _sort,
        if (_verified) 'isVerified': 'true',
      };

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => ResourceCubit()..load(() => apiOf(context).searchListings(_params), listKeys: const ['listings'])),
        BlocProvider(create: (_) => CategoriesCubit()..load(() => apiOf(context).categories(), listKeys: const ['categories'])),
      ],
      child: JaxPage(
        title: _q.text.isEmpty ? 'Wholesale Directory' : 'Search Results',
        subtitle: _q.text.isEmpty ? 'Find verified products and suppliers' : _q.text,
        child: Column(
          children: [
            Builder(
              builder: (context) => Column(
                children: [
                  TextField(
                    controller: _q,
                    decoration: InputDecoration(prefixIcon: const Icon(Icons.search_rounded), hintText: 'Enter keywords to search...', suffixIcon: IconButton(icon: const Icon(Icons.tune_rounded), onPressed: () => setState(() => _verified = !_verified))),
                    onSubmitted: (_) => _reload(context),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          initialValue: _sort,
                          decoration: const InputDecoration(labelText: 'SORT BY'),
                          items: const [
                            DropdownMenuItem(value: 'relevance', child: Text('Relevance')),
                            DropdownMenuItem(value: 'newest', child: Text('Newest')),
                            DropdownMenuItem(value: 'rating', child: Text('Rating')),
                            DropdownMenuItem(value: 'featured', child: Text('Featured')),
                          ],
                          onChanged: (v) {
                            setState(() => _sort = v ?? 'relevance');
                            _reload(context);
                          },
                        ),
                      ),
                      const SizedBox(width: 10),
                      IconButton.filledTonal(onPressed: () => setState(() => _grid = !_grid), icon: Icon(_grid ? Icons.list_rounded : Icons.grid_view_rounded)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  BlocBuilder<CategoriesCubit, ResourceState>(
                    builder: (context, cats) => SizedBox(
                      height: 42,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: [
                          ChoiceChip(label: const Text('All'), selected: _category.isEmpty, onSelected: (_) => _setCategory(context, '')),
                          const SizedBox(width: 8),
                          ...cats.items.map((cat) => Padding(
                                padding: const EdgeInsets.only(right: 8),
                                child: ChoiceChip(label: Text(textOf(cat['name'])), selected: _category == cat['id'], onSelected: (_) => _setCategory(context, textOf(cat['id']))),
                              )),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            BlocBuilder<ResourceCubit, ResourceState>(
              builder: (context, state) => AsyncContent(
                state: state,
                emptyTitle: 'No products match these filters',
                onRetry: () => _reload(context),
                builder: (_) => Column(
                  children: [
                    ...state.items.map((item) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: ListingTile(item: item, grid: _grid),
                        )),
                    if (state.totalPages > 1)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          TextButton(onPressed: _page > 1 ? () => _pageTo(context, _page - 1) : null, child: const Text('PREV')),
                          Text('PAGE ${state.page} / ${state.totalPages}', style: JaxText.label),
                          TextButton(onPressed: _page < state.totalPages ? () => _pageTo(context, _page + 1) : null, child: const Text('NEXT')),
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
    context.read<ResourceCubit>().load(() => apiOf(context).searchListings(_params), listKeys: const ['listings'], refresh: true);
  }
}

class ListingDetailScreen extends StatelessWidget {
  const ListingDetailScreen({required this.id, super.key});
  final String id;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ResourceCubit()..load(() => apiOf(context).listing(id)),
      child: BlocBuilder<ResourceCubit, ResourceState>(
        builder: (context, state) => JaxPage(
          title: state.data.isEmpty ? 'Listing' : textOf(state.data['title']),
          subtitle: categoryName(state.data),
          child: AsyncContent(
            state: state,
            onRetry: () => context.read<ResourceCubit>().load(() => apiOf(context).listing(id)),
            builder: (_) {
              final item = state.data;
              final product = asMap(item['productDetail']);
              final service = asMap(item['serviceDetail']);
              final seller = asMap(item['seller']);
              final media = asList(item['media']);
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  AspectRatio(
                    aspectRatio: 1,
                    child: JaxCard(
                      padding: EdgeInsets.zero,
                      child: media.isEmpty ? const Center(child: Icon(Icons.factory_rounded, size: 56, color: JaxColors.outlineVariant)) : Image.network(textOf(media.first['url']), fit: BoxFit.cover),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(children: [StatusPill(label: statusOf(item, 'PRODUCT')), const SizedBox(width: 8), StatusPill(label: textOf(seller['kycStatus'], 'VERIFIED'))]),
                  const SizedBox(height: 14),
                  Text(textOf(item['title']), style: JaxText.h1),
                  const SizedBox(height: 18),
                  JaxCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(product.isNotEmpty ? money(product['pricePerUnit']) : money(service['basePrice']), style: JaxText.h2),
                        const SizedBox(height: 6),
                        Text(product.isNotEmpty ? 'MOQ ${textOf(product['minOrderQty'], '1')} ${textOf(product['unitOfMeasure'], 'Pcs')}' : '${textOf(service['serviceMode'], 'Service')} • ${textOf(service['typicalDuration'], 'Flexible timeline')}', style: JaxText.bodySmall),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  SpecsGrid(data: product.isNotEmpty ? product : service),
                  const SizedBox(height: 18),
                  JaxCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('MERCHANT PROFILE', style: JaxText.h3),
                        const SizedBox(height: 12),
                        Row(children: [JaxAvatar(name: sellerName(item), url: textOf(seller['avatarUrl'])), const SizedBox(width: 12), Expanded(child: Text(sellerName(item), style: JaxText.title)), TrustScore(score: numOf(seller['trustScore']) ?? 85)]),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  JaxCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('REGULATORY STANDARDS & COMPLIANCE CERTIFICATES', style: JaxText.h3),
                        const SizedBox(height: 12),
                        Row(children: const [
                          StatusPill(label: 'CE CERTIFIED', color: JaxColors.primary),
                          SizedBox(width: 8),
                          StatusPill(label: 'BIS REGISTRATION', color: JaxColors.secondary),
                        ]),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  JaxCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('ACCEPTED SETTLEMENT CHANNELS', style: JaxText.h3),
                        const SizedBox(height: 12),
                        const Text('• JAXMART ESCROW CLEARING\n• TELEGRAPHIC TRANSFER (T/T)\n• IRREVOCABLE LETTER OF CREDIT (L/C)\n• NET BANKING / NEFT SETTLEMENT', style: JaxText.bodySmall),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  JaxCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('TECHNICAL PROSPECTUS & SCOPE DESCRIPTION', style: JaxText.h3),
                        const SizedBox(height: 12),
                        Text(textOf(item['description']), style: JaxText.bodyMedium),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  DispatchInquiryCard(id: id, item: item, product: product),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  Future<void> _startChat(BuildContext context, JsonMap seller, String listingId) async {
    final recipientId = textOf(seller['id']);
    if (recipientId.isEmpty) return;
    final conv = await apiOf(context).startConversation({'recipientId': recipientId, 'listingId': listingId});
    if (context.mounted) context.push('/messages/${conv['id']}');
  }
}

class SpecsGrid extends StatelessWidget {
  const SpecsGrid({required this.data, super.key});
  final JsonMap data;

  @override
  Widget build(BuildContext context) {
    final entries = data.entries.where((e) => e.value != null && e.value is! Map && e.value is! List).take(10).toList();
    if (entries.isEmpty) return const SizedBox.shrink();
    return JaxCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('PRODUCT SPECIFICATIONS REGISTRY', style: JaxText.h3),
          const SizedBox(height: 12),
          ...entries.map((e) => Padding(
                padding: const EdgeInsets.only(bottom: 9),
                child: Row(children: [Expanded(child: Text(e.key, style: JaxText.bodySmall)), Expanded(child: Text(textOf(e.value), style: JaxText.bodySmall.copyWith(fontWeight: FontWeight.w700)))]),
              )),
        ],
      ),
    );
  }
}

class DispatchInquiryCard extends StatefulWidget {
  const DispatchInquiryCard({required this.id, required this.item, required this.product, super.key});
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
                        validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(hintText: 'Min: ${textOf(widget.product['minOrderQty'], '100')}'),
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
                        validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
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
              validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
              maxLines: 4,
              decoration: InputDecoration(hintText: 'Provide clear scope descriptions...'),
            ),
            const SizedBox(height: 16),
            JaxButton(
              label: 'DISPATCH RFQ MESSAGE',
              onPressed: () {
                if (_formKey.currentState!.validate()) {
                  context.push('/rfq/create?listingId=${widget.id}&title=${Uri.encodeComponent(textOf(widget.item['title']))}');
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}

class RfqListScreen extends StatelessWidget {
  const RfqListScreen({this.sellerMode = false, super.key});
  final bool sellerMode;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ResourceCubit()
        ..load(
          () => sellerMode ? apiOf(context).sellerRfqInbox({'matchOnly': 'false', 'limit': 20}) : apiOf(context).myRfqs({'limit': 20}),
          listKeys: const ['rfqs'],
        ),
      child: JaxPage(
        title: sellerMode ? 'Buyer Requests' : 'My Requests',
        subtitle: sellerMode ? 'Quote on matching RFQs' : 'Track RFQs and supplier quotes',
        floatingActionButton: sellerMode ? null : FloatingActionButton.extended(onPressed: () => context.push('/rfq/create'), icon: const Icon(Icons.add_rounded), label: const Text('RFQ')),
        child: BlocBuilder<ResourceCubit, ResourceState>(
          builder: (context, state) => AsyncContent(
            state: state,
            emptyTitle: sellerMode ? 'No buyer requests available' : 'No RFQs posted yet',
            onRetry: () => context.read<ResourceCubit>().load(() => sellerMode ? apiOf(context).sellerRfqInbox({'matchOnly': 'false'}) : apiOf(context).myRfqs({}), listKeys: const ['rfqs']),
            builder: (_) => Column(children: state.items.map((item) => Padding(padding: const EdgeInsets.only(bottom: 12), child: RfqTile(item: item, sellerMode: sellerMode))).toList()),
          ),
        ),
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
  final _budgetMin = TextEditingController();
  final _budgetMax = TextEditingController();
  String _type = 'PRODUCT';
  String _category = '';
  DateTime? _deadline;

  @override
  void initState() {
    super.initState();
    _title.text = widget.title ?? '';
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => FormSubmitCubit()),
        BlocProvider(create: (_) => CategoriesCubit()..load(() => apiOf(context).categories(), listKeys: const ['categories'])),
      ],
      child: JaxPage(
        title: 'Post RFQ',
        subtitle: 'Get competitive supplier quotes',
        child: Builder(
          builder: (context) => BlocConsumer<FormSubmitCubit, ResourceState>(
            listener: (context, state) {
              showResultSnack(context, state);
              if (state.message == 'Saved successfully') context.go('/rfq');
            },
            builder: (context, submitState) => FormCard(
              children: [
                const FieldLabel('Request type'),
                SegmentedButton<String>(
                  segments: const [ButtonSegment(value: 'PRODUCT', label: Text('Product')), ButtonSegment(value: 'SERVICE', label: Text('Service'))],
                  selected: {_type},
                  onSelectionChanged: (v) => setState(() => _type = v.first),
                ),
                const FieldLabel('Title'),
                TextField(controller: _title, decoration: const InputDecoration(hintText: 'What do you need?')),
                const FieldLabel('Description'),
                TextField(controller: _desc, minLines: 4, maxLines: 8, decoration: const InputDecoration(hintText: 'Specs, delivery, quality, and payment requirements')),
                BlocBuilder<CategoriesCubit, ResourceState>(
                  builder: (context, cats) => DropdownButtonFormField<String>(
                    initialValue: _category.isEmpty ? null : _category,
                    decoration: const InputDecoration(labelText: 'CATEGORY'),
                    items: cats.items.map((cat) => DropdownMenuItem(value: textOf(cat['id']), child: Text(textOf(cat['name'])))).toList(),
                    onChanged: (v) => setState(() => _category = v ?? ''),
                  ),
                ),
                Row(children: [
                  Expanded(child: TextField(controller: _budgetMin, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'MIN BUDGET'))),
                  const SizedBox(width: 10),
                  Expanded(child: TextField(controller: _budgetMax, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'MAX BUDGET'))),
                ]),
                OutlinedButton.icon(
                  onPressed: () async {
                    final picked = await showDatePicker(context: context, firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)), initialDate: DateTime.now().add(const Duration(days: 7)));
                    if (picked != null) setState(() => _deadline = picked);
                  },
                  icon: const Icon(Icons.calendar_month_rounded),
                  label: Text(_deadline == null ? 'Set deadline' : shortDate(_deadline!.toIso8601String())),
                ),
                JaxButton(
                  label: 'Submit RFQ',
                  fullWidth: true,
                  loading: submitState.status == ResourceStatus.submitting,
                  icon: Icons.send_rounded,
                  onPressed: () => context.read<FormSubmitCubit>().submit(() => apiOf(context).createRfq({
                        'rfqType': _type,
                        'title': _title.text,
                        'description': _desc.text,
                        if (_category.isNotEmpty) 'categoryId': _category,
                        if (_budgetMin.text.isNotEmpty) 'budgetMin': _budgetMin.text,
                        if (_budgetMax.text.isNotEmpty) 'budgetMax': _budgetMax.text,
                        if (_deadline != null) 'deadline': _deadline!.toIso8601String(),
                        'isPublic': true,
                        if (widget.listingId != null) 'listingId': widget.listingId,
                      })),
                ),
              ],
            ),
          ),
        ),
      ),
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
          title: state.data.isEmpty ? 'RFQ Detail' : textOf(state.data['title']),
          subtitle: categoryName(state.data),
          child: AsyncContent(
            state: state,
            onRetry: () => context.read<ResourceCubit>().load(() => apiOf(context).rfq(id)),
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
                                Row(children: [Expanded(child: Text(sellerName(quote), style: JaxText.title)), StatusPill(label: statusOf(quote, 'SUBMITTED'))]),
                                const SizedBox(height: 8),
                                Text(money(quote['quotedAmount']), style: JaxText.h2),
                                const SizedBox(height: 6),
                                Text(textOf(quote['proposalText']), style: JaxText.bodySmall),
                                const SizedBox(height: 12),
                                Row(children: [
                                  Expanded(child: JaxButton(label: 'Shortlist', variant: JaxButtonVariant.outline, onPressed: () => apiOf(context).shortlistQuote(textOf(quote['id'])))),
                                  const SizedBox(width: 10),
                                  Expanded(child: JaxButton(label: 'Award', icon: Icons.emoji_events_rounded, onPressed: () => apiOf(context).awardQuote(id, textOf(quote['id'])))),
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
            if (state.message == 'Saved successfully') context.go('/seller/rfq-inbox');
          },
          builder: (context, state) => FormCard(
            children: [
              TextField(controller: _amount, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'QUOTED AMOUNT')),
              TextField(controller: _timeline, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'TIMELINE DAYS')),
              TextField(controller: _proposal, minLines: 5, maxLines: 8, decoration: const InputDecoration(labelText: 'PROPOSAL TEXT')),
              JaxButton(
                label: 'Submit quote',
                fullWidth: true,
                loading: state.status == ResourceStatus.submitting,
                icon: Icons.request_quote_rounded,
                onPressed: () => context.read<ResourceCubit>().submit(() => apiOf(context).submitQuote(widget.rfqId, {
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
    return BlocProvider(
      create: (_) => ResourceCubit()..load(() => apiOf(context).sellerDashboard()),
      child: JaxPage(
        title: 'Seller Home',
        subtitle: 'Revenue, orders, quotes, and operations',
        actions: [IconButton(onPressed: () => context.push('/seller/listings/new'), icon: const Icon(Icons.add_box_rounded))],
        child: BlocBuilder<ResourceCubit, ResourceState>(
          builder: (context, state) => AsyncContent(
            state: state,
            onRetry: () => context.read<ResourceCubit>().load(() => apiOf(context).sellerDashboard()),
            builder: (_) {
              final stats = asMap(state.data['stats']);
              final orders = asList(state.data['recentOrders']);
              return Column(
                children: [
                  GridView.count(
                    crossAxisCount: 2,
                    childAspectRatio: 1.35,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    children: [
                      StatCard(label: 'Active Orders', value: textOf(stats['activeOrders'], '0')),
                      StatCard(label: 'Pending Quotes', value: textOf(stats['pendingQuotes'], '0')),
                      StatCard(label: 'Monthly Revenue', value: money(stats['monthlyRevenue'])),
                      StatCard(label: 'Total Revenue', value: money(stats['totalRevenue'])),
                    ],
                  ),
                  const SizedBox(height: 18),
                  SectionTitle(title: 'Recent Orders', action: () => context.push('/orders?role=seller')),
                  const SizedBox(height: 10),
                  if (orders.isEmpty) const EmptyState(title: 'No orders yet') else ...orders.map((o) => Padding(padding: const EdgeInsets.only(bottom: 12), child: OrderTile(item: o))),
                ],
              );
            },
          ),
        ),
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

class SellerListingsScreen extends StatelessWidget {
  const SellerListingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ResourceCubit()..load(() => apiOf(context).myListings({'limit': 30}), listKeys: const ['listings']),
      child: JaxPage(
        title: 'My Products',
        subtitle: 'Manage listings and publication status',
        floatingActionButton: FloatingActionButton.extended(onPressed: () => context.push('/seller/listings/new'), icon: const Icon(Icons.add_rounded), label: const Text('Listing')),
        child: BlocBuilder<ResourceCubit, ResourceState>(
          builder: (context, state) => AsyncContent(
            state: state,
            emptyTitle: 'No listings created yet',
            onRetry: () => context.read<ResourceCubit>().load(() => apiOf(context).myListings({'limit': 30}), listKeys: const ['listings']),
            builder: (_) => Column(children: state.items.map((item) => Padding(padding: const EdgeInsets.only(bottom: 12), child: ListingTile(item: item))).toList()),
          ),
        ),
      ),
    );
  }
}

class ListingFormScreen extends StatefulWidget {
  const ListingFormScreen({super.key});

  @override
  State<ListingFormScreen> createState() => _ListingFormScreenState();
}

class _ListingFormScreenState extends State<ListingFormScreen> {
  final _title = TextEditingController();
  final _description = TextEditingController();
  final _price = TextEditingController();
  final _moq = TextEditingController(text: '1');
  final _unit = TextEditingController(text: 'Pieces');
  String _type = 'PRODUCT';
  String _category = '';

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => FormSubmitCubit()),
        BlocProvider(create: (_) => CategoriesCubit()..load(() => apiOf(context).categories(), listKeys: const ['categories'])),
      ],
      child: JaxPage(
        title: 'New Listing',
        subtitle: 'Create product or service catalog item',
        child: Builder(
          builder: (context) => BlocConsumer<FormSubmitCubit, ResourceState>(
            listener: (context, state) {
              showResultSnack(context, state);
              if (state.message == 'Saved successfully') context.go('/seller/listings');
            },
            builder: (context, state) => FormCard(
              children: [
                SegmentedButton<String>(
                  segments: const [ButtonSegment(value: 'PRODUCT', label: Text('Product')), ButtonSegment(value: 'SERVICE', label: Text('Service'))],
                  selected: {_type},
                  onSelectionChanged: (v) => setState(() => _type = v.first),
                ),
                TextField(controller: _title, decoration: const InputDecoration(labelText: 'TITLE')),
                TextField(controller: _description, minLines: 4, maxLines: 8, decoration: const InputDecoration(labelText: 'DESCRIPTION')),
                BlocBuilder<CategoriesCubit, ResourceState>(
                  builder: (context, cats) => DropdownButtonFormField<String>(
                    initialValue: _category.isEmpty ? null : _category,
                    decoration: const InputDecoration(labelText: 'CATEGORY'),
                    items: cats.items.map((cat) => DropdownMenuItem(value: textOf(cat['id']), child: Text(textOf(cat['name'])))).toList(),
                    onChanged: (v) => setState(() => _category = v ?? ''),
                  ),
                ),
                TextField(controller: _price, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'PRICE / BASE PRICE')),
                Row(children: [
                  Expanded(child: TextField(controller: _moq, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'MOQ'))),
                  const SizedBox(width: 10),
                  Expanded(child: TextField(controller: _unit, decoration: const InputDecoration(labelText: 'UNIT'))),
                ]),
                JaxButton(
                  label: 'Create listing',
                  fullWidth: true,
                  loading: state.status == ResourceStatus.submitting,
                  icon: Icons.save_rounded,
                  onPressed: () => context.read<FormSubmitCubit>().submit(() => apiOf(context).createListing({
                        'listingType': _type,
                        'title': _title.text,
                        'description': _description.text,
                        if (_category.isNotEmpty) 'categoryId': _category,
                        if (_type == 'PRODUCT') ...{
                          'pricePerUnit': num.tryParse(_price.text),
                          'minOrderQty': num.tryParse(_moq.text) ?? 1,
                          'unitOfMeasure': _unit.text,
                        } else ...{
                          'basePrice': num.tryParse(_price.text),
                          'priceUnit': _unit.text,
                        },
                      })),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class OrdersScreen extends StatelessWidget {
  const OrdersScreen({this.role = 'buyer', super.key});
  final String role;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ResourceCubit()..load(() => apiOf(context).orders({'role': role, 'limit': 30}), listKeys: const ['orders']),
      child: JaxPage(
        title: role == 'seller' ? 'Seller Orders' : 'My Orders',
        subtitle: 'Contracts, escrow, milestones, and disputes',
        child: BlocBuilder<ResourceCubit, ResourceState>(
          builder: (context, state) => AsyncContent(
            state: state,
            emptyTitle: 'No orders found',
            onRetry: () => context.read<ResourceCubit>().load(() => apiOf(context).orders({'role': role}), listKeys: const ['orders']),
            builder: (_) => Column(children: state.items.map((item) => Padding(padding: const EdgeInsets.only(bottom: 12), child: OrderTile(item: item))).toList()),
          ),
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
            onRetry: () => context.read<ResourceCubit>().load(() => apiOf(context).order(id)),
            builder: (_) {
              final milestones = asList(state.data['milestones']);
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  OrderTile(item: state.data),
                  const SizedBox(height: 16),
                  Row(children: [
                    Expanded(child: JaxButton(label: 'Sign', icon: Icons.draw_rounded, onPressed: () => apiOf(context).signOrder(id))),
                    const SizedBox(width: 10),
                    Expanded(child: JaxButton(label: 'Reject', variant: JaxButtonVariant.danger, icon: Icons.close_rounded, onPressed: () => apiOf(context).rejectOrder(id))),
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
                                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(textOf(m['title'], 'Milestone'), style: JaxText.title), Text(money(m['amount']), style: JaxText.bodySmall)])),
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

class MessagesScreen extends StatelessWidget {
  const MessagesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ResourceCubit()..load(() => apiOf(context).conversations(), listKeys: const ['conversations']),
      child: JaxPage(
        title: 'Inbox',
        subtitle: 'Buyer and supplier conversations',
        child: BlocBuilder<ResourceCubit, ResourceState>(
          builder: (context, state) => AsyncContent(
            state: state,
            emptyTitle: 'No conversations yet',
            onRetry: () => context.read<ResourceCubit>().load(() => apiOf(context).conversations(), listKeys: const ['conversations']),
            builder: (_) => Column(
              children: state.items.map((conv) {
                final recipient = asMap(conv['recipient']);
                final latest = asMap(conv['latestMessage']);
                final name = textOf(recipient['businessName'], textOf(recipient['fullName'], 'Conversation'));
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: JaxCard(
                    onTap: () => context.push('/messages/${conv['id']}'),
                    child: Row(
                      children: [
                        JaxAvatar(name: name, url: textOf(recipient['avatarUrl'])),
                        const SizedBox(width: 12),
                        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(name, style: JaxText.title), Text(textOf(latest['content'], 'No messages yet'), style: JaxText.bodySmall, maxLines: 1, overflow: TextOverflow.ellipsis)])),
                        const Icon(Icons.chevron_right_rounded),
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

class ConversationScreen extends StatelessWidget {
  const ConversationScreen({required this.id, super.key});
  final String id;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ResourceCubit()..load(() => apiOf(context).messages(id), listKeys: const ['messages']),
      child: Scaffold(
        appBar: AppBar(title: const Text('Conversation')),
        body: SafeArea(
          child: BlocBuilder<ResourceCubit, ResourceState>(
            builder: (context, state) => AsyncContent(
              state: state,
              emptyTitle: 'No messages yet',
              onRetry: () => context.read<ResourceCubit>().load(() => apiOf(context).messages(id), listKeys: const ['messages']),
              builder: (_) => ListView.builder(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 86),
                itemCount: state.items.length,
                itemBuilder: (context, index) {
                  final msg = state.items[index];
                  final mine = textOf(msg['senderId']) == textOf(context.read<AuthCubit>().state.user['id']);
                  return Align(
                    alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      constraints: const BoxConstraints(maxWidth: 280),
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: mine ? JaxColors.primary : Colors.white, borderRadius: BorderRadius.circular(14)),
                      child: Text(textOf(msg['content']), style: JaxText.bodyMedium.copyWith(color: mine ? Colors.white : JaxColors.onSurface)),
                    ),
                  );
                },
              ),
            ),
          ),
        ),
        bottomNavigationBar: const SafeArea(
          child: Padding(
            padding: EdgeInsets.all(12),
            child: TextField(
              enabled: false,
              decoration: InputDecoration(
                hintText: 'Live message sending uses Socket.IO in the web app',
                suffixIcon: IconButton(onPressed: null, icon: Icon(Icons.send_rounded)),
              ),
            ),
          ),
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
      create: (_) => ResourceCubit()..load(() => apiOf(context).notifications(), listKeys: const ['notifications']),
      child: JaxPage(
        title: 'Notifications',
        subtitle: 'Business activity and action items',
        actions: [IconButton(onPressed: () => apiOf(context).markAllNotificationsRead(), icon: const Icon(Icons.done_all_rounded))],
        child: BlocBuilder<ResourceCubit, ResourceState>(
          builder: (context, state) => AsyncContent(
            state: state,
            emptyTitle: 'No notifications',
            onRetry: () => context.read<ResourceCubit>().load(() => apiOf(context).notifications(), listKeys: const ['notifications']),
            builder: (_) => Column(
              children: state.items.map((item) {
                final read = item['isRead'] == true;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: JaxCard(
                    onTap: () => apiOf(context).markNotificationRead(textOf(item['id'])),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(read ? Icons.notifications_none_rounded : Icons.notifications_active_rounded, color: read ? JaxColors.outline : JaxColors.primary),
                        const SizedBox(width: 12),
                        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(textOf(item['title']), style: JaxText.title), const SizedBox(height: 4), Text(textOf(item['body']), style: JaxText.bodySmall)])),
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
  late final _name = TextEditingController(text: context.read<AuthCubit>().state.name);
  late final _email = TextEditingController(text: textOf(context.read<AuthCubit>().state.user['email']));
  late String _type = context.read<AuthCubit>().state.userType;
  String _accountType = 'INDIVIDUAL';

  @override
  void initState() {
    super.initState();
    _accountType = textOf(context.read<AuthCubit>().state.user['accountType'], 'INDIVIDUAL');
  }

  @override
  Widget build(BuildContext context) {
    return JaxPage(
      title: 'My Profile',
      subtitle: 'Account, KYC, and role preferences',
      child: BlocConsumer<AuthCubit, AuthState>(
        listener: (context, state) {
          if (state.message != null) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.message!)));
        },
        builder: (context, state) => FormCard(
          children: [
            Row(children: [JaxAvatar(name: state.name, url: textOf(state.user['avatarUrl']), size: 58), const SizedBox(width: 14), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(state.name, style: JaxText.h3), StatusPill(label: textOf(state.user['kycStatus'], 'PENDING'))]))]),
            TextField(controller: _name, decoration: const InputDecoration(labelText: 'FULL NAME')),
            TextField(controller: _email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'EMAIL')),
            SegmentedButton<String>(
              segments: const [ButtonSegment(value: 'BUYER', label: Text('Buyer')), ButtonSegment(value: 'SELLER', label: Text('Seller')), ButtonSegment(value: 'BOTH', label: Text('Both'))],
              selected: {_type},
              onSelectionChanged: (v) => setState(() => _type = v.first),
            ),
            SegmentedButton<String>(
              segments: const [ButtonSegment(value: 'INDIVIDUAL', label: Text('Individual')), ButtonSegment(value: 'BUSINESS', label: Text('Business'))],
              selected: {_accountType},
              onSelectionChanged: (v) => setState(() => _accountType = v.first),
            ),
            JaxButton(label: 'Save profile', fullWidth: true, icon: Icons.save_rounded, loading: state.status == AuthStatus.loading, onPressed: () => context.read<AuthCubit>().updateProfile({'fullName': _name.text, 'email': _email.text, 'userType': _type, 'accountType': _accountType})),
            JaxButton(label: 'Log out', fullWidth: true, variant: JaxButtonVariant.danger, icon: Icons.logout_rounded, onPressed: () => context.read<AuthCubit>().logout()),
          ],
        ),
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
            onRetry: () => context.read<ResourceCubit>().load(() => apiOf(context).adminStats()),
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

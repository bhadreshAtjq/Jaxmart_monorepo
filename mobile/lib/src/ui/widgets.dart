import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../core/auth_cubit.dart';
import '../core/resource_cubit.dart';
import '../core/api_client.dart';
import '../data/json_tools.dart';
import '../design/design_system.dart';

class JaxPage extends StatelessWidget {
  const JaxPage({
    required this.title,
    required this.child,
    this.titleWidget,
    this.subtitle,
    this.actions,
    this.floatingActionButton,
    this.scroll = true,
    this.topWidget,
    super.key,
  });

  final String title;
  final Widget? titleWidget;
  final String? subtitle;
  final Widget child;
  final List<Widget>? actions;
  final Widget? floatingActionButton;
  final bool scroll;
  final Widget? topWidget;

  @override
  Widget build(BuildContext context) {
    final hasHeader = title.isNotEmpty || titleWidget != null || subtitle != null || actions != null;
    final content = Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 96),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (topWidget != null) ...[
            topWidget!,
            const SizedBox(height: 12),
          ],
          if (hasHeader) ...[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (title.isNotEmpty || titleWidget != null)
                        titleWidget ?? Text(title, style: JaxText.h2),
                      if (subtitle != null) ...[
                        const SizedBox(height: 4),
                        Text(subtitle!, style: JaxText.bodySmall),
                      ],
                    ],
                  ),
                ),
                if (actions != null) ...actions!,
              ],
            ),
            const SizedBox(height: 18),
          ],
          child,
        ],
      ),
    );
    return Scaffold(
      body: SafeArea(
        child: scroll ? RefreshConfiguration(child: SingleChildScrollView(child: content)) : content,
      ),
      floatingActionButton: floatingActionButton,
    );
  }
}

class RefreshConfiguration extends StatelessWidget {
  const RefreshConfiguration({required this.child, super.key});
  final Widget child;
  @override
  Widget build(BuildContext context) => child;
}

class AppShell extends StatefulWidget {
  const AppShell({required this.child, super.key});

  final Widget child;

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  final _searchController = TextEditingController();

  bool _isProfileDropdownOpen = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _handleSearch() {
    final query = _searchController.text.trim();
    if (query.isNotEmpty) {
      context.push('/search?q=${Uri.encodeComponent(query)}');
    }
  }

  void _handleNavigation(String path) {
    setState(() {
      _isProfileDropdownOpen = false;
    });
    context.go(path);
  }

  Widget _buildProfileAvatarButton(BuildContext context, AuthState auth) {
    final initials = auth.name.isNotEmpty
        ? (auth.name.length > 1
            ? auth.name.substring(0, 2).toUpperCase()
            : auth.name.substring(0, 1).toUpperCase())
        : 'US';
    return GestureDetector(
      onTap: () {
        setState(() {
          _isProfileDropdownOpen = !_isProfileDropdownOpen;
        });
      },
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: JaxColors.primary,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.grey.shade200, width: 1.5),
        ),
        alignment: Alignment.center,
        child: Text(
          initials,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 13,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }



  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    final auth = context.watch<AuthCubit>().state;
    final isSellerView = location.startsWith('/seller');
    final isSeller = auth.isSeller;

    final showTopBar = location.startsWith('/home') ||
                       location.startsWith('/search') ||
                       location == '/messages';

    return Scaffold(
      backgroundColor: JaxColors.surface,
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(
          (showTopBar ? 32.0 : 0.0) + 56.0 + MediaQuery.of(context).padding.top,
        ),
        child: Container(
          color: showTopBar ? const Color(0xFF0F172A) : Colors.white,
          child: SafeArea(
            bottom: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (showTopBar)
                  Container(
                    height: 32,
                    color: const Color(0xFF0F172A),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Left: Verified Suppliers
                        Row(
                          children: [
                            const Icon(
                              Icons.check_circle,
                              color: Color(0xFF10B981),
                              size: 13,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Verified Suppliers',
                              style: TextStyle(
                                fontFamily: 'SourceSans3',
                                color: Colors.grey.shade400,
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        // Right: My Orders | profile icon & name
                        Row(
                          children: [
                            GestureDetector(
                              onTap: () => context.push('/orders'),
                              child: Text(
                                'My Orders',
                                style: TextStyle(
                                  fontFamily: 'SourceSans3',
                                  color: Colors.grey.shade400,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 6),
                              child: Text(
                                '|',
                                style: TextStyle(
                                  color: Colors.grey.shade700,
                                  fontSize: 10,
                                ),
                              ),
                            ),
                            GestureDetector(
                              onTap: () => context.push('/profile'),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.person,
                                    color: Colors.grey.shade400,
                                    size: 13,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    auth.isLoggedIn ? auth.name.split(' ')[0] : 'Guest',
                                    style: const TextStyle(
                                      fontFamily: 'SourceSans3',
                                      color: Colors.white,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                Container(
                  color: Colors.white,
                  child: AppBar(
                    primary: false,
                    systemOverlayStyle: showTopBar
                        ? SystemUiOverlayStyle.light
                        : SystemUiOverlayStyle.dark,
                    automaticallyImplyLeading: false,
                    backgroundColor: Colors.white,
                    elevation: 0,
                    titleSpacing: 12,
                    title: Row(
                      children: [
                        if (isSellerView) ...[
                          const SizedBox(width: 36),
                          Expanded(
                            child: Center(
                              child: ModeSwitcher(isSellerView: isSellerView),
                            ),
                          ),
                          _buildProfileAvatarButton(context, auth),
                        ]
                        else
                          Expanded(
                            child: Container(
                              height: 40,
                              decoration: BoxDecoration(
                                color: Colors.grey.shade50,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.grey.shade200),
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Padding(
                                      padding: const EdgeInsets.only(left: 12),
                                      child: TextField(
                                        controller: _searchController,
                                        decoration: const InputDecoration(
                                          border: InputBorder.none,
                                          hintText: 'Search products, suppliers...',
                                          hintStyle: TextStyle(color: Colors.grey, fontSize: 13),
                                          isDense: true,
                                          contentPadding: EdgeInsets.symmetric(vertical: 8),
                                        ),
                                        style: const TextStyle(fontSize: 13),
                                        onSubmitted: (_) => _handleSearch(),
                                      ),
                                    ),
                                  ),
                                  GestureDetector(
                                    onTap: _handleSearch,
                                    child: Container(
                                      width: 44,
                                      height: 40,
                                      decoration: const BoxDecoration(
                                        color: JaxColors.primaryContainer,
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
                        if (isSeller && !isSellerView && MediaQuery.of(context).size.width > 600) ...[
                          const SizedBox(width: 8),
                          ModeSwitcher(isSellerView: isSellerView),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      body: Stack(
        children: [
          widget.child,
          if (_isProfileDropdownOpen) ...[
            Positioned.fill(
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () {
                  setState(() {
                    _isProfileDropdownOpen = false;
                  });
                },
                child: Container(
                  color: Colors.black.withValues(alpha: 0.15),
                ),
              ),
            ),
            Positioned(
              top: 8,
              right: 12,
              child: ProfileDropdownCard(
                auth: auth,
                onNavigate: _handleNavigation,
                onClose: () {
                  setState(() {
                    _isProfileDropdownOpen = false;
                  });
                },
              ),
            ),
          ],
          FloatingActionMenu(
            isSellerView: isSellerView,
            onNavigate: _handleNavigation,
          ),
        ],
      ),
    );
  }
}

class ModeSwitcher extends StatelessWidget {
  const ModeSwitcher({required this.isSellerView, super.key});
  final bool isSellerView;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _ModeButton(
            label: 'Buying',
            active: !isSellerView,
            onTap: () => context.go('/home'),
            gradient: JaxGradients.primary,
          ),
          const SizedBox(width: 2),
          _ModeButton(
            label: 'Selling',
            active: isSellerView,
            onTap: () => context.go('/seller/dashboard'),
            gradient: JaxGradients.seller,
          ),
        ],
      ),
    );
  }
}

class _ModeButton extends StatelessWidget {
  const _ModeButton({required this.label, required this.active, required this.onTap, required this.gradient});
  final String label;
  final bool active;
  final VoidCallback onTap;
  final Gradient gradient;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          gradient: active ? gradient : null,
          borderRadius: BorderRadius.circular(10),
          boxShadow: active
              ? [
                  BoxShadow(
                    color: gradient.colors.first.withValues(alpha: 0.2),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          label.toUpperCase(),
          style: TextStyle(
            fontFamily: 'SourceSans3',
            color: active ? Colors.white : Colors.grey.shade600,
            fontSize: 11,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.1,
          ),
        ),
      ),
    );
  }
}

class JaxCard extends StatelessWidget {
  const JaxCard({required this.child, this.onTap, this.padding = const EdgeInsets.all(16), this.dark = false, super.key});

  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry padding;
  final bool dark;

  @override
  Widget build(BuildContext context) {
    final card = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: dark ? JaxColors.primaryContainer : Colors.white,
        borderRadius: BorderRadius.circular(JaxRadius.xl),
        border: Border.all(color: dark ? Colors.white10 : const Color(0x99E5E7EB)),
        boxShadow: const [
          BoxShadow(color: Color(0x08000000), blurRadius: 18, offset: Offset(0, 8)),
        ],
      ),
      child: child,
    );
    if (onTap == null) return card;
    return InkWell(onTap: onTap, borderRadius: BorderRadius.circular(JaxRadius.xl), child: card);
  }
}

class JaxButton extends StatelessWidget {
  const JaxButton({
    required this.label,
    this.onPressed,
    this.icon,
    this.variant = JaxButtonVariant.primary,
    this.fullWidth = false,
    this.loading = false,
    super.key,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final JaxButtonVariant variant;
  final bool fullWidth;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    final isPrimary = variant == JaxButtonVariant.primary || variant == JaxButtonVariant.success;
    final bg = variant == JaxButtonVariant.success ? JaxColors.secondary : JaxColors.primary;
    final button = SizedBox(
      width: fullWidth ? double.infinity : null,
      height: 44,
      child: isPrimary
          ? ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: bg,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(JaxRadius.lg)),
              ),
              onPressed: loading ? null : onPressed,
              icon: loading ? const SizedBox.square(dimension: 16, child: CircularProgressIndicator(strokeWidth: 2)) : Icon(icon ?? Icons.arrow_forward_rounded, size: 17),
              label: Text(label, style: JaxText.label.copyWith(color: Colors.white)),
            )
          : OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: variant == JaxButtonVariant.danger ? JaxColors.error : JaxColors.primary,
                side: BorderSide(color: variant == JaxButtonVariant.danger ? JaxColors.error : JaxColors.outlineVariant),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(JaxRadius.lg)),
              ),
              onPressed: loading ? null : onPressed,
              icon: Icon(icon ?? Icons.arrow_forward_rounded, size: 17),
              label: Text(label, style: JaxText.label),
            ),
    );
    return button;
  }
}

enum JaxButtonVariant { primary, outline, success, danger }

class StatusPill extends StatelessWidget {
  const StatusPill({required this.label, this.color, this.dense = false, super.key});
  final String label;
  final Color? color;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    final c = color ?? _statusColor(label);
    return Container(
      padding: EdgeInsets.symmetric(horizontal: dense ? 7 : 10, vertical: dense ? 3 : 5),
      decoration: BoxDecoration(
        color: c.withValues(alpha: .10),
        border: Border.all(color: c.withValues(alpha: .22)),
        borderRadius: BorderRadius.circular(9),
      ),
      child: Text(
        label.replaceAll('_', ' ').toUpperCase(),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: JaxText.label.copyWith(color: c, fontSize: dense ? 8 : 10),
      ),
    );
  }

  Color _statusColor(String status) {
    final s = status.toUpperCase();
    if (['ACTIVE', 'OPEN', 'COMPLETED', 'WON', 'VERIFIED', 'RELEASED'].contains(s)) return JaxColors.success;
    if (['AWARDED', 'SUBMITTED', 'SHORTLISTED', 'PRODUCT', 'BUYER'].contains(s)) return JaxColors.secondaryDark;
    if (['CREATED', 'PENDING', 'UNDER_REVIEW', 'FEATURED'].contains(s)) return JaxColors.warning;
    if (['REJECTED', 'DISPUTED', 'LOST', 'CANCELLED'].contains(s)) return JaxColors.error;
    return JaxColors.onSurfaceVariant;
  }
}

class TrustScore extends StatelessWidget {
  const TrustScore({required this.score, super.key});
  final num score;

  @override
  Widget build(BuildContext context) {
    final value = (score.clamp(0, 100) / 100).toDouble();
    final color = score >= 80 ? JaxColors.success : score >= 60 ? JaxColors.warning : JaxColors.error;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: 54,
          child: LinearProgressIndicator(
            value: value,
            minHeight: 6,
            borderRadius: BorderRadius.circular(99),
            backgroundColor: Colors.grey.shade100,
            color: color,
          ),
        ),
        const SizedBox(width: 7),
        Text('${score.round()}% Trust', style: JaxText.label.copyWith(color: color, fontSize: 9)),
      ],
    );
  }
}

class JaxAvatar extends StatelessWidget {
  const JaxAvatar({required this.name, this.url, this.size = 40, super.key});
  final String name;
  final String? url;
  final double size;

  @override
  Widget build(BuildContext context) {
    final src = textOf(url);
    if (src.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(size * .30),
        child: CachedNetworkImage(imageUrl: src, height: size, width: size, fit: BoxFit.cover),
      );
    }
    final initials = name
        .split(RegExp(r'\s+'))
        .where((part) => part.isNotEmpty)
        .take(2)
        .map((part) => part[0].toUpperCase())
        .join();
    return Container(
      height: size,
      width: size,
      decoration: BoxDecoration(
        gradient: JaxGradients.primary,
        borderRadius: BorderRadius.circular(size * .30),
      ),
      alignment: Alignment.center,
      child: Text(initials.isEmpty ? 'J' : initials, style: JaxText.title.copyWith(color: Colors.white)),
    );
  }
}

class AsyncContent extends StatelessWidget {
  const AsyncContent({
    required this.state,
    required this.onRetry,
    required this.builder,
    this.emptyTitle = 'Nothing here yet',
    this.emptyDescription,
    this.emptyIcon,
    super.key,
  });

  final ResourceState state;
  final VoidCallback onRetry;
  final Widget Function(ResourceState state) builder;
  final String emptyTitle;
  final String? emptyDescription;
  final IconData? emptyIcon;

  @override
  Widget build(BuildContext context) {
    if (state.status == ResourceStatus.loading && !state.hasData) return const PageLoader();
    if (state.status == ResourceStatus.failure && !state.hasData) {
      return EmptyState(
        icon: Icons.error_outline_rounded,
        title: state.message ?? 'Something went wrong',
        action: JaxButton(label: 'Retry', icon: Icons.refresh_rounded, onPressed: onRetry),
      );
    }
    if (!state.hasData) return EmptyState(icon: emptyIcon ?? Icons.inbox_rounded, title: emptyTitle, description: emptyDescription);
    return builder(state);
  }
}

class PageLoader extends StatelessWidget {
  const PageLoader({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 420,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 48,
              width: 48,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: JaxColors.primary.withValues(alpha: .12), width: 4),
              ),
              child: const Padding(
                padding: EdgeInsets.all(10),
                child: CircularProgressIndicator(strokeWidth: 2.5, color: JaxColors.primary),
              ),
            ),
            const SizedBox(height: 14),
            Text('LOADING...', style: JaxText.label.copyWith(color: JaxColors.primary)),
          ],
        ),
      ),
    );
  }
}

class EmptyState extends StatelessWidget {
  const EmptyState({required this.title, this.description, this.icon, this.action, super.key});
  final String title;
  final String? description;
  final IconData? icon;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return JaxCard(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 8),
        child: Column(
          children: [
            Icon(icon ?? Icons.inbox_rounded, size: 42, color: Colors.grey.shade300),
            const SizedBox(height: 14),
            Text(title, textAlign: TextAlign.center, style: JaxText.h3),
            if (description != null) ...[
              const SizedBox(height: 7),
              Text(description!, textAlign: TextAlign.center, style: JaxText.bodySmall),
            ],
            if (action != null) ...[
              const SizedBox(height: 22),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}

class ListingTile extends StatelessWidget {
  const ListingTile({
    required this.item,
    this.grid = false,
    this.showChat = false,
    this.isSellerMode = false,
    this.showActions = true,
    this.hideTrustScore = false,
    super.key,
  });
  final JsonMap item;
  final bool grid;
  final bool showChat;
  final bool isSellerMode;
  final bool showActions;
  final bool hideTrustScore;

  @override
  Widget build(BuildContext context) {
    final product = asMap(item['productDetail']);
    final seller = asMap(item['seller']);
    final image = firstImage(item);
    final sellerDisplay = sellerName(item);
    final price = product['priceOnRequest'] == true ? 'Ask Price' : money(product['pricePerUnit']);
    final content = grid
        ? Column(crossAxisAlignment: CrossAxisAlignment.start, children: _listingBody(context, image, product, seller, sellerDisplay, price, true))
        : Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            _ListingImage(image: image, size: 112),
            const SizedBox(width: 14),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: _listingBody(context, image, product, seller, sellerDisplay, price, false))),
          ]);
    return JaxCard(
      padding: const EdgeInsets.all(12),
      onTap: () => context.push('/listings/${item['id']}'),
      child: content,
    );
  }

  List<Widget> _listingBody(BuildContext context, String image, JsonMap product, JsonMap seller, String sellerDisplay, String price, bool fullImage) {
    return [
      if (fullImage) ...[
        _ListingImage(image: image, size: double.infinity, aspectRatio: 1),
        const SizedBox(height: 12),
      ],
      Row(
        children: [
          Expanded(child: Text(categoryName(item).toUpperCase(), style: JaxText.label.copyWith(color: JaxColors.secondaryDark, fontSize: 9), maxLines: 1, overflow: TextOverflow.ellipsis)),
          StatusPill(label: statusOf(item, 'PRODUCT'), dense: true),
        ],
      ),
      const SizedBox(height: 7),
      Text(textOf(item['title'], 'Untitled listing'), maxLines: 2, overflow: TextOverflow.ellipsis, style: JaxText.title),
      const SizedBox(height: 10),
      Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(price, style: JaxText.h3.copyWith(fontSize: 17)),
                Text('MOQ: ${textOf(product['minOrderQty'], '1')} ${textOf(product['unitOfMeasure'], 'Pcs')}', style: JaxText.bodySmall),
              ],
            ),
          ),
          if (!isSellerMode && !hideTrustScore) TrustScore(score: numOf(seller['trustScore']) ?? 85),
        ],
      ),
      if (!isSellerMode) ...[
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(9),
          decoration: BoxDecoration(color: JaxColors.surfaceLow, borderRadius: BorderRadius.circular(10)),
          child: Row(
            children: [
              JaxAvatar(name: sellerDisplay, url: textOf(seller['avatarUrl']), size: 26),
              const SizedBox(width: 8),
              Expanded(child: Text(sellerDisplay, style: JaxText.bodySmall.copyWith(fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis)),
              if (textOf(seller['kycStatus']) == 'VERIFIED')
                const Icon(Icons.verified_user_rounded, size: 15, color: JaxColors.success),
            ],
          ),
        ),
      ],
      if (showChat) ...[
        const SizedBox(height: 10),
        SizedBox(
          width: double.infinity,
          height: 38,
          child: OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: JaxColors.secondary,
              side: const BorderSide(color: JaxColors.secondary, width: 1.2),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              padding: const EdgeInsets.symmetric(horizontal: 12),
            ),
            icon: const Icon(Icons.chat_rounded, size: 16),
            label: Text('Chat Now', style: JaxText.label.copyWith(color: JaxColors.secondary, fontSize: 12)),
            onPressed: () {
              final sellerId = textOf(seller['id']);
              final listingId = textOf(item['id']);
              if (sellerId.isNotEmpty) {
                if (listingId.isNotEmpty) {
                  context.push('/messages/$sellerId?listingId=$listingId');
                } else {
                  context.push('/messages/$sellerId');
                }
              }
            },
          ),
        ),
      ],
      if (isSellerMode && showActions) ...[
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            _buildManagementButton(
              context: context,
              icon: Icons.open_in_new_rounded,
              color: JaxColors.primary,
              onTap: () => context.push('/listings/${item['id']}'),
            ),
            const SizedBox(width: 8),
            _buildManagementButton(
              context: context,
              icon: Icons.edit_rounded,
              color: JaxColors.secondary,
              onTap: () => context.push('/seller/listings/${item['id']}/edit'),
            ),
            const SizedBox(width: 8),
            _buildManagementButton(
              context: context,
              icon: Icons.delete_outline_rounded,
              color: JaxColors.error,
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Shielded: Cannot delete active inventory'),
                    duration: Duration(seconds: 3),
                  ),
                );
              },
            ),
          ],
        ),
      ],
    ];
  }

  Widget _buildManagementButton({
    required BuildContext context,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.06),
            border: Border.all(color: color.withValues(alpha: 0.15)),
            borderRadius: BorderRadius.circular(10),
          ),
          alignment: Alignment.center,
          child: Icon(icon, color: color, size: 18),
        ),
      ),
    );
  }
}

class _ListingImage extends StatelessWidget {
  const _ListingImage({required this.image, required this.size, this.aspectRatio});
  final String image;
  final double size;
  final double? aspectRatio;

  @override
  Widget build(BuildContext context) {
    final box = Container(
      width: size == double.infinity ? double.infinity : size,
      height: aspectRatio == null ? size : null,
      decoration: BoxDecoration(color: JaxColors.surfaceLow, borderRadius: BorderRadius.circular(12)),
      clipBehavior: Clip.antiAlias,
      child: image.isEmpty
          ? const Center(child: Icon(Icons.factory_rounded, size: 34, color: JaxColors.outlineVariant))
          : CachedNetworkImage(imageUrl: image, fit: BoxFit.cover),
    );
    return aspectRatio == null ? box : AspectRatio(aspectRatio: aspectRatio!, child: box);
  }
}

class RfqTile extends StatelessWidget {
  const RfqTile({required this.item, this.sellerMode = false, this.showMaxBudgetOnly = false, super.key});
  final JsonMap item;
  final bool sellerMode;
  final bool showMaxBudgetOnly;

  @override
  Widget build(BuildContext context) {
    final rfqId = textOf(item['id']);
    final shortId = rfqId.length >= 8 ? rfqId.substring(0, 8).toUpperCase() : rfqId.toUpperCase();
    final title = textOf(item['title'], 'RFQ Request');
    final category = categoryName(item);
    
    // Quotes count
    final quotesCount = (item['quotesCount'] is num) ? (item['quotesCount'] as num).toInt() : 0;
    
    // Relative posting time formatting
    final createdAtStr = textOf(item['createdAt']);
    String relativeTime = 'POSTED RECENTLY';
    if (createdAtStr.isNotEmpty) {
      try {
        final createdAt = DateTime.parse(createdAtStr);
        final difference = DateTime.now().difference(createdAt);
        if (difference.inDays >= 365) {
          final yrs = (difference.inDays / 365).floor();
          relativeTime = 'POSTED $yrs ${yrs == 1 ? 'YEAR' : 'YEARS'} AGO';
        } else if (difference.inDays >= 30) {
          final mos = (difference.inDays / 30).floor();
          relativeTime = 'POSTED $mos ${mos == 1 ? 'MONTH' : 'MONTHS'} AGO';
        } else if (difference.inDays >= 1) {
          relativeTime = 'POSTED ${difference.inDays} ${difference.inDays == 1 ? 'DAY' : 'DAYS'} AGO';
        } else if (difference.inHours >= 1) {
          relativeTime = 'POSTED ${difference.inHours} ${difference.inHours == 1 ? 'HOUR' : 'HOURS'} AGO';
        } else {
          relativeTime = 'POSTED JUST NOW';
        }
      } catch (_) {}
    }

    final buyer = asMap(item['buyer']);

    return JaxCard(
      onTap: () => context.push(sellerMode ? '/seller/rfq/${item['id']}/quote' : '/rfq/${item['id']}'),
      padding: sellerMode ? const EdgeInsets.all(16) : EdgeInsets.zero,
      child: sellerMode
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Row: Badge, Time, and Budget on the right
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Badge & Time
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFE0E7FF), // Light indigo/blue
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  textOf(item['rfqType'], 'PRODUCT').toUpperCase(),
                                  style: const TextStyle(
                                    color: Color(0xFF4338CA), // Indigo text
                                    fontSize: 9,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Icon(Icons.access_time_rounded, size: 12, color: Colors.grey.shade400),
                              const SizedBox(width: 4),
                              Text(
                                relativeTime,
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.grey.shade500,
                                  letterSpacing: 0.2,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    // Budget (right-aligned)
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Text(
                          'BUDGET',
                          style: TextStyle(
                            color: Color(0xFF9CA3AF), // Gray 400
                            fontSize: 8,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          formatRfqBudget(item),
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF1E1B4B), // Indigo-950
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Title
                Text(
                  title,
                  style: const TextStyle(
                    fontFamily: JaxText.heading,
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF1E1B4B),
                    height: 1.25,
                  ),
                ),
                const SizedBox(height: 8),
                // Description
                if (textOf(item['description']).isNotEmpty) ...[
                  Text(
                    '"${textOf(item['description'])}"',
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontFamily: JaxText.body,
                      fontStyle: FontStyle.italic,
                      fontSize: 12,
                      color: Colors.grey.shade600,
                      height: 1.45,
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
                const Divider(height: 1, color: Color(0xFFE5E7EB)),
                const SizedBox(height: 12),
                // Buyer info + Category
                Row(
                  children: [
                    JaxAvatar(
                      name: textOf(buyer['fullName'], 'Buyer'),
                      url: textOf(buyer['avatarUrl']),
                      size: 24,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            textOf(buyer['fullName'], 'Buyer'),
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF374151), // Gray 700
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            category.toUpperCase(),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              color: JaxColors.secondaryDark,
                              letterSpacing: 0.2,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Bottom Action Area: Quotes Count & Button
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '$quotesCount ${quotesCount == 1 ? 'QUOTE' : 'QUOTES'} RECEIVED',
                          style: const TextStyle(
                            color: Color(0xFF6B7280), // Gray 500
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    ElevatedButton(
                      onPressed: () => context.push('/seller/rfq/${item['id']}/quote'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1E1B4B), // Primary dark indigo
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        elevation: 0,
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Send Quote',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800),
                          ),
                          SizedBox(width: 6),
                          Icon(Icons.arrow_forward_rounded, size: 12),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            )
          : ClipRRect(
              borderRadius: BorderRadius.circular(JaxRadius.xl),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Top Content Panel (RFQ Info)
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Type Badge & Short ID
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFFE0E7FF), // Light indigo/blue
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                textOf(item['rfqType'], 'PRODUCT').toUpperCase(),
                                style: const TextStyle(
                                  color: Color(0xFF4338CA), // Indigo text
                                  fontSize: 9,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              width: 3,
                              height: 3,
                              decoration: const BoxDecoration(
                                color: Color(0xFFD1D5DB),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              '#$shortId',
                              style: const TextStyle(
                                color: Color(0xFF9CA3AF), // Gray 400
                                fontSize: 10,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        // Title in uppercase
                        Text(
                          title.toUpperCase(),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontFamily: JaxText.heading,
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF121358), // primaryContainer
                            height: 1.25,
                          ),
                        ),
                        const SizedBox(height: 12),
                        // Meta: Posted Time & Category with icons
                        Row(
                          children: [
                            Icon(Icons.access_time_rounded, size: 12, color: Colors.grey.shade500),
                            const SizedBox(width: 4),
                            Text(
                              relativeTime,
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                                color: Colors.grey.shade500,
                                letterSpacing: 0.2,
                              ),
                            ),
                            const SizedBox(width: 16),
                            const Icon(Icons.flash_on_rounded, size: 12, color: JaxColors.secondary),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                category.toUpperCase(),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                  color: JaxColors.secondaryDark,
                                  letterSpacing: 0.2,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  
                  // Thin separator line
                  Container(height: 1, color: const Color(0xFFF3F4F6)),
                  
                  // Bottom Panel (Stats and Action link)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    color: const Color(0xFFF9FAFB), // Very light gray background
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'QUOTES RECEIVED',
                              style: TextStyle(
                                color: Color(0xFF9CA3AF), // Gray 400
                                fontSize: 9,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Text(
                                  '$quotesCount',
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFF121358), // primaryContainer (jax-dark)
                                  ),
                                ),
                                if (quotesCount > 0) ...[
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFECFDF5), // Emerald light
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: const Text(
                                      'NEW',
                                      style: TextStyle(
                                        color: Color(0xFF047857), // Emerald text
                                        fontSize: 8,
                                        fontWeight: FontWeight.w900,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
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
  }
}

class OrderTile extends StatelessWidget {
  const OrderTile({required this.item, super.key});
  final JsonMap item;

  @override
  Widget build(BuildContext context) {
    final rfq = asMap(asMap(item['rfqQuote'])['rfq']);
    final seller = asMap(item['seller']);
    final buyer = asMap(item['buyer']);
    final party = seller.isNotEmpty ? sellerName({'seller': seller}) : textOf(buyer['fullName'], 'Buyer');
    return JaxCard(
      onTap: () => context.push('/orders/${item['id']}'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(textOf(rfq['title'], textOf(item['orderType'], 'Order')), style: JaxText.title, maxLines: 1, overflow: TextOverflow.ellipsis)),
              StatusPill(label: statusOf(item, 'CREATED')),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              JaxAvatar(name: party, size: 32),
              const SizedBox(width: 10),
              Expanded(child: Text(party, style: JaxText.bodySmall.copyWith(fontWeight: FontWeight.w700))),
              Text(money(item['totalAmount']), style: JaxText.h3.copyWith(fontSize: 18)),
            ],
          ),
        ],
      ),
    );
  }
}

class FieldLabel extends StatelessWidget {
  const FieldLabel(this.label, {super.key});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(label.toUpperCase(), style: JaxText.label),
    );
  }
}

class FormCard extends StatelessWidget {
  const FormCard({required this.children, super.key});
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return JaxCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: children.expand((child) => [child, const SizedBox(height: 14)]).toList()..removeLast(),
      ),
    );
  }
}

void showResultSnack(BuildContext context, ResourceState state) {
  if (state.message == null) return;
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.message!)));
}

class FloatingActionMenu extends StatefulWidget {
  final bool isSellerView;
  final ValueChanged<String> onNavigate;

  const FloatingActionMenu({
    required this.isSellerView,
    required this.onNavigate,
    super.key,
  });

  @override
  State<FloatingActionMenu> createState() => _FloatingActionMenuState();
}

class _FloatingActionMenuState extends State<FloatingActionMenu> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _expandAnimation;
  late Animation<double> _fadeAnimation;
  late Animation<double> _rotateAnimation;
  bool _isOpen = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 250),
      vsync: this,
    );
    _expandAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.fastOutSlowIn,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.0, 0.8, curve: Curves.easeOut),
    ));
    _rotateAnimation = Tween<double>(begin: 0.0, end: 0.5).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _toggleMenu() {
    setState(() {
      _isOpen = !_isOpen;
      if (_isOpen) {
        _controller.forward();
      } else {
        _controller.reverse();
      }
    });
  }

  void _closeMenu() {
    if (_isOpen) {
      setState(() {
        _isOpen = false;
        _controller.reverse();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthCubit>().state;
    final isSeller = auth.isSeller;

    final List<Map<String, dynamic>> items = widget.isSellerView
        ? [
            {'label': 'Seller Homes', 'path': '/seller/dashboard', 'icon': Icons.dashboard_rounded},
            {'label': 'Buyer Requests', 'path': '/seller/rfq-inbox', 'icon': Icons.inbox_rounded},
            {'label': 'My Products', 'path': '/seller/listings', 'icon': Icons.storefront_rounded},
            {'label': 'My Orders', 'path': '/orders?role=seller', 'icon': Icons.shopping_bag_rounded},
            {'label': 'POST RFQ', 'path': '/rfq/create', 'icon': Icons.add_rounded, 'isAction': true},
            {'label': 'Home (Buying)', 'path': '/home', 'icon': Icons.home_rounded},
          ]
        : [
            {'label': 'Home', 'path': '/home', 'icon': Icons.home_rounded},
            {'label': 'Products', 'path': '/search', 'icon': Icons.search_rounded},
            {'label': 'Buyer Requests', 'path': '/rfq', 'icon': Icons.description_rounded},
            {'label': 'Messages', 'path': '/messages', 'icon': Icons.chat_bubble_rounded},
            {'label': 'My Orders', 'path': '/orders', 'icon': Icons.shopping_bag_rounded},
            {'label': 'POST RFQ', 'path': '/rfq/create', 'icon': Icons.add_rounded, 'isAction': true},
            if (isSeller)
              {'label': 'Dashboard', 'path': '/seller/dashboard', 'icon': Icons.dashboard_rounded},
          ];

    return Stack(
      children: [
        if (_isOpen)
          Positioned.fill(
            child: GestureDetector(
              onTap: _closeMenu,
              child: AnimatedBuilder(
                animation: _fadeAnimation,
                builder: (context, child) {
                  return Container(
                    color: Colors.black.withValues(alpha: 0.4 * _fadeAnimation.value),
                  );
                },
              ),
            ),
          ),
        Positioned(
          bottom: 24,
          right: 20,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              if (_isOpen)
                SizeTransition(
                  sizeFactor: _expandAnimation,
                  axis: Axis.vertical,
                  axisAlignment: 1.0,
                  child: FadeTransition(
                    opacity: _fadeAnimation,
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: IntrinsicWidth(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: items.map((item) {
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 10),
                              child: _buildMenuItem(item),
                            );
                          }).toList(),
                        ),
                      ),
                    ),
                  ),
                ),
              GestureDetector(
                onTap: _toggleMenu,
                child: RotationTransition(
                  turns: _rotateAnimation,
                  child: Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: JaxColors.primary,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: JaxColors.primary.withValues(alpha: 0.3),
                          blurRadius: 12,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Icon(
                      _isOpen ? Icons.close_rounded : Icons.add_rounded,
                      color: Colors.white,
                      size: 28,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMenuItem(Map<String, dynamic> item) {
    final isAction = item['isAction'] == true;
    if (isAction) {
      return GestureDetector(
        onTap: () {
          _closeMenu();
          widget.onNavigate(item['path']);
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: JaxColors.primary,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: JaxColors.primary.withValues(alpha: 0.25),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                item['label'],
                style: JaxText.bodyMedium.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(width: 10),
              Icon(
                item['icon'],
                color: Colors.white,
                size: 18,
              ),
            ],
          ),
        ),
      );
    }

    return GestureDetector(
      onTap: () {
        _closeMenu();
        widget.onNavigate(item['path']);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 6,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              item['label'],
              style: JaxText.bodyMedium.copyWith(
                color: JaxColors.primaryContainer,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(width: 10),
            Icon(
              item['icon'],
              color: JaxColors.primaryContainer,
              size: 18,
            ),
          ],
        ),
      ),
    );
  }
}

class ProfileDropdownCard extends StatefulWidget {
  const ProfileDropdownCard({
    required this.auth,
    required this.onNavigate,
    required this.onClose,
    super.key,
  });

  final AuthState auth;
  final ValueChanged<String> onNavigate;
  final VoidCallback onClose;

  @override
  State<ProfileDropdownCard> createState() => _ProfileDropdownCardState();
}

class _ProfileDropdownCardState extends State<ProfileDropdownCard> {
  int _unreadCount = 0;

  @override
  void initState() {
    super.initState();
    _fetchUnreadCount();
  }

  Future<void> _fetchUnreadCount() async {
    if (!widget.auth.isLoggedIn) return;
    try {
      final res = await context.read<JaxApiClient>().notifications();
      final list = asList(res['notifications']);
      final unread = list.where((n) => n['isRead'] != true).length;
      if (mounted) {
        setState(() {
          _unreadCount = unread;
        });
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final initials = widget.auth.name.isNotEmpty
        ? (widget.auth.name.length > 1
            ? widget.auth.name.substring(0, 2).toUpperCase()
            : widget.auth.name.substring(0, 1).toUpperCase())
        : 'US';

    final isVerified = widget.auth.user['kycStatus'] == 'VERIFIED';

    return Container(
      width: 260,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header: Avatar + Details
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: const BoxDecoration(
                    color: JaxColors.primary,
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    initials,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.auth.name,
                        style: const TextStyle(
                          color: JaxColors.primaryContainer,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'Seller Account',
                        style: TextStyle(
                          color: Colors.grey,
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 4),
                      if (isVerified)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFDCFCE7),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.check_circle_rounded, color: Color(0xFF16A34A), size: 10),
                              SizedBox(width: 2),
                              Text(
                                'Verified Seller',
                                style: TextStyle(color: Color(0xFF15803D), fontSize: 8, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        )
                      else
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF3C7),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.pending_rounded, color: Color(0xFFD97706), size: 10),
                              SizedBox(width: 2),
                              Text(
                                'Registry Pending',
                                style: TextStyle(color: Color(0xFFB45309), fontSize: 8, fontWeight: FontWeight.bold),
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
          const Divider(height: 1, color: Color(0xFFE5E7EB)),
          const SizedBox(height: 4),
          _buildDropdownItem(
            icon: Icons.person_outline_rounded,
            label: 'My Profile',
            onTap: () {
              widget.onClose();
              widget.onNavigate('/profile');
            },
          ),
          _buildDropdownItem(
            icon: Icons.notifications_none_rounded,
            label: 'Notifications',
            badgeCount: _unreadCount,
            onTap: () {
              widget.onClose();
              widget.onNavigate('/notifications');
            },
          ),
          const SizedBox(height: 4),
          const Divider(height: 1, color: Color(0xFFE5E7EB)),
          const SizedBox(height: 4),
          _buildDropdownItem(
            icon: Icons.logout_rounded,
            label: 'Logout',
            iconColor: Colors.red,
            textColor: Colors.red,
            onTap: () async {
              widget.onClose();
              await context.read<AuthCubit>().logout();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildDropdownItem({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    int badgeCount = 0,
    Color? iconColor,
    Color? textColor,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            children: [
              Icon(
                icon,
                size: 18,
                color: iconColor ?? JaxColors.primaryContainer.withValues(alpha: 0.7),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    color: textColor ?? JaxColors.primaryContainer,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              if (badgeCount > 0)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: JaxColors.primary,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '$badgeCount',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}



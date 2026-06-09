import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../core/auth_cubit.dart';
import '../core/resource_cubit.dart';
import '../data/json_tools.dart';
import '../design/design_system.dart';

class JaxPage extends StatelessWidget {
  const JaxPage({
    required this.title,
    required this.child,
    this.subtitle,
    this.actions,
    this.floatingActionButton,
    this.scroll = true,
    this.topWidget,
    super.key,
  });

  final String title;
  final String? subtitle;
  final Widget child;
  final List<Widget>? actions;
  final Widget? floatingActionButton;
  final bool scroll;
  final Widget? topWidget;

  @override
  Widget build(BuildContext context) {
    final content = Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 96),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (topWidget != null) ...[
            topWidget!,
            const SizedBox(height: 12),
          ],
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: JaxText.h2),
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

class AppShell extends StatelessWidget {
  const AppShell({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    final auth = context.watch<AuthCubit>().state;
    final isSellerView = location.startsWith('/seller');
    final isSeller = auth.isSeller;
    final items = isSellerView
        ? const [
            _NavItem('/seller/dashboard', Icons.dashboard_rounded, 'Seller'),
            _NavItem('/seller/rfq-inbox', Icons.inbox_rounded, 'RFQs'),
            _NavItem('/seller/listings', Icons.storefront_rounded, 'Products'),
            _NavItem('/messages', Icons.chat_bubble_rounded, 'Messages'),
            _NavItem('/profile', Icons.person_rounded, 'Profile'),
          ]
        : const [
            _NavItem('/home', Icons.home_rounded, 'Home'),
            _NavItem('/search', Icons.search_rounded, 'Products'),
            _NavItem('/rfq', Icons.description_rounded, 'Buyer Requests'),
            _NavItem('/messages', Icons.chat_bubble_rounded, 'Messages'),
            _NavItem('/profile', Icons.person_rounded, 'Profile'),
          ];

    return Scaffold(
      backgroundColor: JaxColors.surface,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        titleSpacing: 16,
        title: Row(
          children: [
            Image.asset('assets/images/JaxMart_bg.png', height: 30),
            const SizedBox(width: 10),
            const StatusPill(label: 'SECURE', color: JaxColors.success, dense: true),
          ],
        ),
        actions: [
          if (isSeller)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: ModeSwitcher(isSellerView: isSellerView),
            ),
          IconButton(
            onPressed: () => context.push('/notifications'),
            icon: const Icon(Icons.notifications_rounded),
            tooltip: 'Notifications',
          ),
        ],
      ),
      body: child,
      bottomNavigationBar: DecoratedBox(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Color(0xFFE5E7EB))),
        ),
        child: SafeArea(
          top: false,
          child: BottomNavigationBar(
            currentIndex: _activeIndex(location, items),
            onTap: (index) => context.go(items[index].path),
            items: items
                .map((item) => BottomNavigationBarItem(icon: Icon(item.icon), label: item.label))
                .toList(),
          ),
        ),
      ),
    );
  }

  int _activeIndex(String location, List<_NavItem> items) {
    final index = items.indexWhere((item) {
      final path = item.path.split('?').first;
      return location == path || location.startsWith('$path/');
    });
    return index < 0 ? 0 : index;
  }
}

class _NavItem {
  const _NavItem(this.path, this.icon, this.label);
  final String path;
  final IconData icon;
  final String label;
}

class ModeSwitcher extends StatelessWidget {
  const ModeSwitcher({required this.isSellerView, super.key});
  final bool isSellerView;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        border: Border.all(color: Colors.grey.shade200),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          _ModeButton(
            label: 'Buying',
            active: !isSellerView,
            onTap: () => context.go('/home'),
            gradient: JaxGradients.primary,
          ),
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
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 7),
        decoration: BoxDecoration(
          gradient: active ? gradient : null,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          label.toUpperCase(),
          style: JaxText.label.copyWith(color: active ? Colors.white : Colors.grey.shade600, fontSize: 8),
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
    super.key,
  });

  final ResourceState state;
  final VoidCallback onRetry;
  final Widget Function(ResourceState state) builder;
  final String emptyTitle;

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
    if (!state.hasData) return EmptyState(icon: Icons.inbox_rounded, title: emptyTitle);
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
  const ListingTile({required this.item, this.grid = false, this.showChat = false, super.key});
  final JsonMap item;
  final bool grid;
  final bool showChat;

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
          TrustScore(score: numOf(seller['trustScore']) ?? 85),
        ],
      ),
      const SizedBox(height: 12),
      Container(
        padding: const EdgeInsets.all(9),
        decoration: BoxDecoration(color: JaxColors.surfaceLow, borderRadius: BorderRadius.circular(10)),
        child: Row(
          children: [
            JaxAvatar(name: sellerDisplay, url: textOf(seller['avatarUrl']), size: 26),
            const SizedBox(width: 8),
            Expanded(child: Text(sellerDisplay, style: JaxText.bodySmall.copyWith(fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis)),
            const Icon(Icons.verified_user_rounded, size: 15, color: JaxColors.success),
          ],
        ),
      ),
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
              if (sellerId.isNotEmpty) {
                context.push('/messages/$sellerId');
              }
            },
          ),
        ),
      ],
    ];
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
  const RfqTile({required this.item, this.sellerMode = false, super.key});
  final JsonMap item;
  final bool sellerMode;

  @override
  Widget build(BuildContext context) {
    final budget = item['budgetMax'] ?? item['quotedAmount'];
    return JaxCard(
      onTap: () => context.push('/rfq/${item['id']}'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              StatusPill(label: textOf(item['rfqType'], 'RFQ')),
              const SizedBox(width: 8),
              Expanded(child: Text(categoryName(item), style: JaxText.bodySmall, maxLines: 1, overflow: TextOverflow.ellipsis)),
            ],
          ),
          const SizedBox(height: 10),
          Text(textOf(item['title'], 'RFQ request'), style: JaxText.title, maxLines: 2, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 6),
          Text(textOf(item['description'], 'No description provided'), style: JaxText.bodySmall, maxLines: 2, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: Text(
                  budget == null ? 'Open budget' : money(budget),
                  style: JaxText.h3.copyWith(fontSize: 17),
                ),
              ),
              if (sellerMode)
                JaxButton(
                  label: 'Quote',
                  icon: Icons.request_quote_rounded,
                  onPressed: () => context.push('/seller/rfq/${item['id']}/quote'),
                )
              else
                StatusPill(label: statusOf(item)),
            ],
          ),
        ],
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


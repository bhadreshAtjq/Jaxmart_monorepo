// lib/screens/common/main_shell.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../utils/constants.dart';

class MainShell extends ConsumerWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final isSeller = ['SELLER', 'BOTH'].contains(user?.userType);
    final location = GoRouterState.of(context).matchedLocation;

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppColors.gray200, width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _getIndex(location, isSeller),
          onTap: (i) => _navigate(context, i, isSeller),
          elevation: 0,
          backgroundColor: Colors.transparent,
          items: [
            const BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home_rounded), label: 'Home'),
            const BottomNavigationBarItem(icon: Icon(Icons.search_outlined), activeIcon: Icon(Icons.search_rounded), label: 'Search'),
            const BottomNavigationBarItem(icon: Icon(Icons.receipt_long_outlined), activeIcon: Icon(Icons.receipt_long_rounded), label: 'RFQs'),
            const BottomNavigationBarItem(icon: Icon(Icons.assignment_outlined), activeIcon: Icon(Icons.assignment_rounded), label: 'Orders'),
            if (isSeller) const BottomNavigationBarItem(icon: Icon(Icons.storefront_outlined), activeIcon: Icon(Icons.storefront_rounded), label: 'Sell'),
            const BottomNavigationBarItem(icon: Icon(Icons.person_outline_rounded), activeIcon: Icon(Icons.person_rounded), label: 'Profile'),
          ],
        ),
      ),
    );
  }

  int _getIndex(String location, bool isSeller) {
    if (location.startsWith('/home')) return 0;
    if (location.startsWith('/search')) return 1;
    if (location.startsWith('/rfq')) return 2;
    if (location.startsWith('/orders')) return 3;
    if (isSeller && location.startsWith('/seller')) return 4;
    return isSeller ? 5 : 4;
  }

  void _navigate(BuildContext context, int index, bool isSeller) {
    final routes = ['/home', '/search', '/rfq/list', '/orders'];
    if (isSeller) routes.addAll(['/seller/dashboard', '/profile']);
    else routes.add('/profile');
    if (index < routes.length) context.go(routes[index]);
  }
}

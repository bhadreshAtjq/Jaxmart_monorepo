import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../screens/auth/splash_screen.dart';
import '../screens/auth/onboarding_screen.dart';
import '../screens/auth/otp_screen.dart';
import '../screens/auth/profile_setup_screen.dart';
import '../screens/auth/kyc_screen.dart';
import '../screens/common/main_shell.dart';
import '../screens/buyer/home_screen.dart';
import '../screens/buyer/search_screen.dart';
import '../screens/buyer/listing_detail_screen.dart';
import '../screens/buyer/rfq_post_screen.dart';
import '../screens/buyer/rfq_detail_screen.dart';
import '../screens/buyer/rfq_list_screen.dart';
import '../screens/buyer/quote_compare_screen.dart';
import '../screens/common/order_detail_screen.dart';
import '../screens/common/order_list_screen.dart';
import '../screens/common/messages_screen.dart';
import '../screens/common/conversation_screen.dart';
import '../screens/common/notifications_screen.dart';
import '../screens/seller/seller_dashboard_screen.dart';
import '../screens/seller/add_listing_screen.dart';
import '../screens/seller/my_listings_screen.dart';
import '../screens/seller/rfq_inbox_screen.dart';
import '../screens/seller/submit_quote_screen.dart';
import '../screens/seller/milestone_submit_screen.dart';
import '../screens/common/profile_screen.dart';
import '../providers/auth_provider.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final isLoggedIn = authState.value?.isLoggedIn ?? false;
      final isAuthRoute = state.matchedLocation.startsWith('/auth') ||
          state.matchedLocation == '/splash';

      if (!isLoggedIn && !isAuthRoute) return '/auth/onboarding';
      if (isLoggedIn && state.matchedLocation == '/auth/onboarding') return '/home';
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),

      // Auth routes
      GoRoute(path: '/auth/onboarding', builder: (_, __) => const OnboardingScreen()),
      GoRoute(path: '/auth/otp', builder: (_, s) => OtpScreen(phone: s.uri.queryParameters['phone'] ?? '')),
      GoRoute(path: '/auth/profile-setup', builder: (_, __) => const ProfileSetupScreen()),
      GoRoute(path: '/auth/kyc', builder: (_, s) => KycScreen(type: s.uri.queryParameters['type'] ?? 'individual')),

      // Main shell with bottom nav
      ShellRoute(
        builder: (_, __, child) => MainShell(child: child),
        routes: [
          GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
          GoRoute(path: '/search', builder: (_, s) => SearchScreen(query: s.uri.queryParameters['q'])),
          GoRoute(path: '/listings/:id', builder: (_, s) => ListingDetailScreen(id: s.pathParameters['id']!)),
          GoRoute(path: '/rfq/post', builder: (_, s) => RfqPostScreen(listingId: s.uri.queryParameters['listingId'])),
          GoRoute(path: '/rfq/list', builder: (_, __) => const RfqListScreen()),
          GoRoute(path: '/rfq/:id', builder: (_, s) => RfqDetailScreen(id: s.pathParameters['id']!)),
          GoRoute(path: '/rfq/:id/compare', builder: (_, s) => QuoteCompareScreen(rfqId: s.pathParameters['id']!)),
          GoRoute(path: '/orders', builder: (_, s) => OrderListScreen(role: s.uri.queryParameters['role'] ?? 'buyer')),
          GoRoute(path: '/orders/:id', builder: (_, s) => OrderDetailScreen(id: s.pathParameters['id']!)),
          GoRoute(path: '/orders/:id/milestone/:mid/submit', builder: (_, s) => MilestoneSubmitScreen(orderId: s.pathParameters['id']!, milestoneId: s.pathParameters['mid']!)),
          GoRoute(path: '/messages', builder: (_, __) => const MessagesScreen()),
          GoRoute(path: '/messages/:id', builder: (_, s) => ConversationScreen(conversationId: s.pathParameters['id']!)),
          GoRoute(path: '/notifications', builder: (_, __) => const NotificationsScreen()),
          GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),

          // Seller routes
          GoRoute(path: '/seller/dashboard', builder: (_, __) => const SellerDashboardScreen()),
          GoRoute(path: '/seller/listings', builder: (_, __) => const MyListingsScreen()),
          GoRoute(path: '/seller/listings/add', builder: (_, s) => AddListingScreen(type: s.uri.queryParameters['type'] ?? 'product')),
          GoRoute(path: '/seller/rfq-inbox', builder: (_, __) => const RfqInboxScreen()),
          GoRoute(path: '/seller/rfq/:id/quote', builder: (_, s) => SubmitQuoteScreen(rfqId: s.pathParameters['id']!)),
        ],
      ),
    ],
    errorBuilder: (_, state) => Scaffold(
      body: Center(child: Text('Page not found: ${state.error}')),
    ),
  );
});

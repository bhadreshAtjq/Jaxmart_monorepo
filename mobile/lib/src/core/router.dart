import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:go_router/go_router.dart';

import '../data/json_tools.dart';
import '../features/screens.dart';
import '../ui/widgets.dart';
import 'api_client.dart';
import 'auth_cubit.dart';

class AppRouter {
  AppRouter(AuthCubit authCubit, JaxApiClient api)
      : router = GoRouter(
          initialLocation: '/home',
          refreshListenable: GoRouterRefreshStream(authCubit.stream),
          redirect: (context, state) {
            final auth = authCubit.state;
            final location = state.uri.path;
            final isSplash = location == '/splash' || location == '/';
            final authRoute = location.startsWith('/auth');
            final isSetup = location == '/auth/setup';

            if (auth.status == AuthStatus.unknown || auth.status == AuthStatus.loading) {
              return null;
            }

            final hasIncompleteProfile = auth.isLoggedIn &&
                (textOf(auth.user['fullName']) == 'New User' ||
                    textOf(auth.user['fullName']).trim().isEmpty);

            if (isSplash) {
              if (auth.isLoggedIn) {
                return hasIncompleteProfile ? '/auth/setup' : '/home';
              }
              return '/auth/login';
            }

            if (!auth.isLoggedIn && !authRoute) {
              return '/auth/login?redirect=${Uri.encodeComponent(state.uri.toString())}';
            }

            if (auth.isLoggedIn) {
              if (hasIncompleteProfile) {
                return isSetup ? null : '/auth/setup';
              } else {
                if (authRoute) {
                  final target = state.uri.queryParameters['redirect'];
                  return (target != null && target.isNotEmpty) ? target : '/home';
                }
              }
            }

            if (location.startsWith('/seller') && !auth.isSeller) return '/home';
            if (location.startsWith('/admin') && !auth.isAdmin) return '/home';
            return null;
          },
          routes: [
            GoRoute(path: '/auth/login', builder: (_, __) => const LoginScreen()),
            GoRoute(
              path: '/auth/otp',
              builder: (_, state) => OtpScreen(
                phone: state.uri.queryParameters['phone'] ?? '',
                fullName: state.uri.queryParameters['name'],
                userType: state.uri.queryParameters['type'],
              ),
            ),
            GoRoute(path: '/auth/setup', builder: (_, __) => const SetupScreen()),
            ShellRoute(
              builder: (_, __, child) => AppShell(child: child),
              routes: [
                GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
                GoRoute(
                  path: '/search',
                  builder: (_, state) => SearchScreen(
                    query: state.uri.queryParameters['q'],
                    category: state.uri.queryParameters['category'],
                    type: state.uri.queryParameters['type'],
                  ),
                ),
                GoRoute(path: '/listings/:id', builder: (_, state) => ListingDetailScreen(id: state.pathParameters['id']!)),
                GoRoute(path: '/rfq', builder: (_, __) => const RfqListScreen()),
                GoRoute(
                  path: '/rfq/create',
                  builder: (_, state) => RfqCreateScreen(
                    title: state.uri.queryParameters['title'],
                    listingId: state.uri.queryParameters['listingId'],
                  ),
                ),
                GoRoute(path: '/rfq/:id', builder: (_, state) => RfqDetailScreen(id: state.pathParameters['id']!)),
                GoRoute(
                  path: '/orders',
                  builder: (_, state) => OrdersScreen(role: state.uri.queryParameters['role'] ?? 'buyer'),
                ),
                GoRoute(path: '/orders/:id', builder: (_, state) => OrderDetailScreen(id: state.pathParameters['id']!)),
                GoRoute(path: '/messages', builder: (_, __) => const MessagesScreen()),
                GoRoute(
                  path: '/messages/:id',
                  builder: (_, state) => ConversationScreen(
                    id: state.pathParameters['id']!,
                    listingId: state.uri.queryParameters['listingId'],
                  ),
                ),
                GoRoute(path: '/notifications', builder: (_, __) => const NotificationsScreen()),
                GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
                GoRoute(path: '/seller/dashboard', builder: (_, __) => const SellerDashboardScreen()),
                GoRoute(path: '/seller/rfq-inbox', builder: (_, __) => const RfqListScreen(sellerMode: true)),
                GoRoute(path: '/seller/rfq/:id/quote', builder: (_, state) => SubmitQuoteScreen(rfqId: state.pathParameters['id']!)),
                GoRoute(path: '/seller/listings', builder: (_, __) => const SellerListingsScreen()),
                GoRoute(path: '/seller/listings/new', builder: (_, __) => const ListingFormScreen()),
                GoRoute(path: '/seller/listings/create', builder: (_, __) => const ListingFormScreen()),
                GoRoute(
                  path: '/seller/listings/:id/edit',
                  builder: (_, state) => ListingFormScreen(listingId: state.pathParameters['id']),
                ),
                GoRoute(path: '/admin', builder: (_, __) => const AdminScreen()),
              ],
            ),
          ],
        );

  final GoRouter router;
}

class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    _subscription = stream.asBroadcastStream().listen((_) => notifyListeners());
  }

  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}

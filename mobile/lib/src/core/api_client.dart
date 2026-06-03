import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../data/json_tools.dart';

class JaxApiClient {
  JaxApiClient({String? baseUrl})
      : _baseUrl = baseUrl ?? const String.fromEnvironment(
          'JAXMART_API_URL',
          defaultValue: 'http://localhost:4000/api',
        ) {
    _dio = Dio(
      BaseOptions(
        baseUrl: _baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 30),
        headers: {'Content-Type': 'application/json'},
      ),
    );
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await accessToken;
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          final request = error.requestOptions;
          final alreadyRetried = request.extra['retried'] == true;
          if (error.response?.statusCode == 401 && !alreadyRetried) {
            final refreshed = await refreshTokens();
            if (refreshed) {
              request.extra['retried'] = true;
              return handler.resolve(await _retry(request));
            }
          }
          handler.next(error);
        },
      ),
    );
  }

  static const _accessKey = 'jaxmart_access_token';
  static const _refreshKey = 'jaxmart_refresh_token';
  static const _userKey = 'jaxmart_user';

  final String _baseUrl;
  final _storage = const FlutterSecureStorage();
  late final Dio _dio;
  Future<bool>? _refreshing;

  String get baseUrl => _baseUrl;
  Future<String?> get accessToken => _storage.read(key: _accessKey);
  Future<String?> get refreshToken => _storage.read(key: _refreshKey);
  Future<String?> get cachedUser => _storage.read(key: _userKey);

  Future<void> saveSession({
    required String accessToken,
    required String refreshToken,
    required JsonMap user,
  }) async {
    await Future.wait([
      _storage.write(key: _accessKey, value: accessToken),
      _storage.write(key: _refreshKey, value: refreshToken),
      _storage.write(key: _userKey, value: user.toString()),
    ]);
  }

  Future<void> saveTokens(String accessToken, String refreshToken) async {
    await Future.wait([
      _storage.write(key: _accessKey, value: accessToken),
      _storage.write(key: _refreshKey, value: refreshToken),
    ]);
  }

  Future<void> clearSession() async {
    await Future.wait([
      _storage.delete(key: _accessKey),
      _storage.delete(key: _refreshKey),
      _storage.delete(key: _userKey),
    ]);
  }

  Future<Response<dynamic>> _retry(RequestOptions request) {
    return _dio.request<dynamic>(
      request.path,
      data: request.data,
      queryParameters: request.queryParameters,
      options: Options(
        method: request.method,
        headers: request.headers,
        contentType: request.contentType,
        responseType: request.responseType,
        extra: request.extra,
      ),
    );
  }

  Future<bool> refreshTokens() {
    _refreshing ??= _refreshTokensInner().whenComplete(() => _refreshing = null);
    return _refreshing!;
  }

  Future<bool> _refreshTokensInner() async {
    final refresh = await refreshToken;
    if (refresh == null || refresh.isEmpty) return false;
    try {
      final response = await Dio(BaseOptions(baseUrl: _baseUrl)).post<dynamic>(
        '/auth/refresh',
        data: {'refreshToken': refresh},
      );
      final data = asMap(response.data);
      final access = textOf(data['accessToken']);
      final nextRefresh = textOf(data['refreshToken']);
      if (access.isEmpty || nextRefresh.isEmpty) return false;
      await saveTokens(access, nextRefresh);
      return true;
    } catch (_) {
      await clearSession();
      return false;
    }
  }

  Future<JsonMap> getMap(String path, {Map<String, dynamic>? query}) async {
    await Future.delayed(const Duration(milliseconds: 200));
    return _getMockMap(path);
  }

  Future<List<JsonMap>> getList(String path, {Map<String, dynamic>? query}) async {
    await Future.delayed(const Duration(milliseconds: 200));
    return _getMockList(path);
  }

  JsonMap _getMockMap(String path) {
    if (path.startsWith('/listings/search')) {
      return {
        'listings': [
          {
            'id': 'l1',
            'title': 'High-Grade Industrial Steel Coils',
            'productDetail': {'pricePerUnit': 1200, 'minOrderQty': 50, 'unitOfMeasure': 'Tons'},
            'media': [{'url': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=300&auto=format&fit=crop'}],
            'seller': {'companyName': 'MetalWorks Inc.', 'kycStatus': 'VERIFIED', 'trustScore': 98}
          },
          {
            'id': 'l2',
            'title': 'Wholesale Organic Cotton T-Shirts',
            'productDetail': {'pricePerUnit': 4.5, 'minOrderQty': 1000, 'unitOfMeasure': 'Pcs'},
            'media': [{'url': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=300&auto=format&fit=crop'}],
            'seller': {'companyName': 'EcoTextiles', 'kycStatus': 'VERIFIED', 'trustScore': 95}
          },
          {
            'id': 'l3',
            'title': 'Bulk Packaging Boxes - 10x10',
            'productDetail': {'pricePerUnit': 0.50, 'minOrderQty': 5000, 'unitOfMeasure': 'Pcs'},
            'media': [{'url': 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?q=80&w=300&auto=format&fit=crop'}],
            'seller': {'companyName': 'PackRite', 'kycStatus': 'VERIFIED', 'trustScore': 89}
          }
        ],
        'total': 3,
        'page': 1,
        'totalPages': 1,
      };
    } else if (path.startsWith('/events')) {
      return {
        'events': [
          {
            'id': 'e1',
            'title': 'Global Sourcing Expo 2026',
            'description': 'Connect with top-tier international suppliers and manufacturers.',
            'location': 'Mumbai Exhibition Center',
            'date': '2026-08-15T10:00:00Z',
            'mediaUrl': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop'
          },
          {
            'id': 'e2',
            'title': 'Tech Innovators Summit',
            'description': 'Discover the latest in B2B technology and automation.',
            'location': 'Virtual',
            'date': '2026-09-10T10:00:00Z',
            'mediaUrl': 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?q=80&w=600&auto=format&fit=crop'
          }
        ]
      };
    } else if (path.startsWith('/rfq/seller/inbox') || path.startsWith('/rfq/my')) {
      return {
        'rfqs': [
          {
            'id': 'r1',
            'title': 'Need 5000 units of wireless earbuds',
            'description': 'Looking for high quality noise cancelling earbuds with fast delivery.',
            'budgetMax': 15000,
            'deadline': '2026-06-30T23:59:59Z',
            'status': 'OPEN',
            'buyer': {'companyName': 'TechRetail Pro', 'trustScore': 92},
            'quotesCount': 3
          },
          {
            'id': 'r2',
            'title': 'Custom Printed Corrugated Boxes',
            'description': 'We need 10,000 custom printed boxes for our new product line.',
            'budgetMax': 5000,
            'deadline': '2026-07-15T23:59:59Z',
            'status': 'OPEN',
            'buyer': {'companyName': 'EcoGoods', 'trustScore': 88},
            'quotesCount': 1
          }
        ]
      };
    } else if (path.startsWith('/users/me')) {
       return {
         'id': 'mock-user-123',
         'fullName': 'Mock User',
         'phone': '1234567890',
         'userType': 'BOTH',
         'kycStatus': 'VERIFIED'
       };
    }
    return {};
  }

  List<JsonMap> _getMockList(String path) {
    if (path.startsWith('/categories')) {
      return [
        {'id': 'c1', 'name': 'Construction'},
        {'id': 'c2', 'name': 'Electronics'},
        {'id': 'c3', 'name': 'Industrial Supplies'},
        {'id': 'c4', 'name': 'Services'},
      ];
    }
    return [];
  }

  Future<JsonMap> post(String path, Map<String, dynamic> data) async {
    final response = await _dio.post<dynamic>(path, data: data);
    return asMap(response.data);
  }

  Future<JsonMap> put(String path, Map<String, dynamic> data) async {
    final response = await _dio.put<dynamic>(path, data: data);
    return asMap(response.data);
  }

  Future<JsonMap> patch(String path, [Map<String, dynamic>? data]) async {
    final response = await _dio.patch<dynamic>(path, data: data);
    return asMap(response.data);
  }

  Future<void> delete(String path) => _dio.delete<dynamic>(path);

  Future<JsonMap> sendOtp(String phone) => post('/auth/send-otp', {'phone': phone});

  Future<JsonMap> verifyOtp({
    required String phone,
    required String otp,
    String? fullName,
    String? userType,
  }) {
    return post('/auth/verify-otp', {
      'phone': phone,
      'otp': otp,
      if (fullName != null && fullName.trim().isNotEmpty) 'fullName': fullName.trim(),
      if (userType != null) 'userType': userType,
    });
  }

  Future<void> logout() async {
    final refresh = await refreshToken;
    if (refresh != null) {
      await post('/auth/logout', {'refreshToken': refresh}).catchError((_) => <String, dynamic>{});
    }
    await clearSession();
  }

  Future<JsonMap> profile() => getMap('/users/me');
  Future<JsonMap> updateProfile(JsonMap data) => put('/users/profile', data);

  Future<List<JsonMap>> categories({String? parentId}) =>
      getList('/categories', query: {if (parentId != null) 'parentId': parentId});

  Future<JsonMap> searchListings(Map<String, dynamic> params) => getMap('/listings/search', query: params);
  Future<JsonMap> listing(String id) => getMap('/listings/$id');
  Future<JsonMap> myListings(Map<String, dynamic> params) => getMap('/listings/seller/me', query: params);
  Future<JsonMap> createListing(JsonMap data) => post('/listings', data);
  Future<JsonMap> updateListing(String id, JsonMap data) => put('/listings/$id', data);
  Future<JsonMap> publishListing(String id) => patch('/listings/$id/publish');

  Future<JsonMap> createRfq(JsonMap data) => post('/rfq', data);
  Future<JsonMap> myRfqs(Map<String, dynamic> params) => getMap('/rfq/my', query: params);
  Future<JsonMap> rfq(String id) => getMap('/rfq/$id');
  Future<JsonMap> sellerRfqInbox(Map<String, dynamic> params) => getMap('/rfq/seller/inbox', query: params);
  Future<JsonMap> submitQuote(String rfqId, JsonMap data) => post('/rfq/$rfqId/quotes', data);
  Future<JsonMap> awardQuote(String rfqId, String quoteId) => patch('/rfq/$rfqId/award/$quoteId');
  Future<JsonMap> shortlistQuote(String quoteId) => patch('/rfq/quotes/$quoteId/shortlist');

  Future<JsonMap> orders(Map<String, dynamic> params) => getMap('/orders', query: params);
  Future<JsonMap> order(String id) => getMap('/orders/$id');
  Future<JsonMap> proposeOrder(JsonMap data) => post('/orders', data);
  Future<JsonMap> signOrder(String id) => post('/orders/$id/contract-sign', const {});
  Future<JsonMap> rejectOrder(String id) => post('/orders/$id/contract-reject', const {});
  Future<JsonMap> submitMilestone(String orderId, String milestoneId, JsonMap data) =>
      post('/orders/$orderId/milestones/$milestoneId/submit', data);
  Future<JsonMap> approveMilestone(String orderId, String milestoneId) =>
      post('/orders/$orderId/milestones/$milestoneId/approve', const {});
  Future<JsonMap> raiseDispute(String orderId, JsonMap data) => post('/orders/$orderId/disputes', data);
  Future<JsonMap> sellerDashboard() => getMap('/orders/dashboard');

  Future<JsonMap> notifications() => getMap('/notifications');
  Future<JsonMap> markNotificationRead(String id) => patch('/notifications/$id/read');
  Future<JsonMap> markAllNotificationsRead() => patch('/notifications/read-all');

  Future<List<JsonMap>> conversations() => getList('/messages/conversations');
  Future<List<JsonMap>> messages(String id) => getList('/messages/conversations/$id/messages');
  Future<JsonMap> conversationListing(String id) => getMap('/messages/conversations/$id/listing');
  Future<JsonMap> startConversation(JsonMap data) => post('/messages/conversations', data);

  Future<JsonMap> events() => getMap('/events');
  Future<JsonMap> adminStats() => getMap('/admin/stats');
  Future<JsonMap> adminUsers(Map<String, dynamic> params) => getMap('/admin/users', query: params);
  Future<JsonMap> adminKycQueue() => getMap('/admin/kyc/queue');
  Future<JsonMap> adminListingsQueue() => getMap('/admin/listings/queue');
  Future<JsonMap> adminDisputes() => getMap('/admin/disputes');
}


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
    return _getMockMap(path, query);
  }

  Future<List<JsonMap>> getList(String path, {Map<String, dynamic>? query}) async {
    await Future.delayed(const Duration(milliseconds: 200));
    return _getMockList(path);
  }

  List<JsonMap> get _allMockListings => [
    {
      'id': 'c_1',
      'categoryId': 'c1',
      'title': 'Heavy Duty Cement Mixer',
      'description': 'Premium industrial-grade cement mixer with high capacity drum. Manufactured under strict ISO guidelines. Perfect for large scale construction projects.',
      'productDetail': {
        'pricePerUnit': 500,
        'minOrderQty': 1,
        'unitOfMeasure': 'Unit',
        'Brand / Manufacturer': 'BuildPro',
        'Model SKU': 'BP-CMX-900',
        'Place of Origin': 'India',
        'Warranty Duration': '2 Years Warranty',
        'Industrial Return Policy': '15 Days Returnable',
        'Regulatory Standards': 'ISO 9001, CE Certified'
      },
      'media': [{'url': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=300&auto=format&fit=crop'}],
      'seller': {'id': 's1', 'companyName': 'BuildPro', 'kycStatus': 'VERIFIED', 'trustScore': 95}
    },
    {
      'id': 'c_2',
      'categoryId': 'c1',
      'title': 'Reinforced Steel Bars (TMT)',
      'description': 'High strength reinforced steel bars (TMT) suitable for heavy construction. Resistant to corrosion and extreme weather.',
      'productDetail': {
        'pricePerUnit': 800,
        'minOrderQty': 100,
        'unitOfMeasure': 'Tons',
        'Brand / Manufacturer': 'SteelWorks',
        'Model SKU': 'SW-TMT-500D',
        'Place of Origin': 'India',
        'Warranty Duration': '5 Years Warranty',
        'Industrial Return Policy': 'Non-returnable',
        'Regulatory Standards': 'BIS Registration, ISO 14001'
      },
      'media': [{'url': 'https://images.unsplash.com/photo-1541888087856-eb526a090b8f?q=80&w=300&auto=format&fit=crop'}],
      'seller': {'id': 's2', 'companyName': 'SteelWorks', 'kycStatus': 'VERIFIED', 'trustScore': 98}
    },
    {
      'id': 'e_1',
      'categoryId': 'c2',
      'title': 'Bulk Industrial Microcontrollers',
      'description': 'High-performance microcontrollers for industrial automation and IoT devices. Bulk packaging available with fast shipping.',
      'productDetail': {
        'pricePerUnit': 5,
        'minOrderQty': 1000,
        'unitOfMeasure': 'Pcs',
        'Brand / Manufacturer': 'ElectroTech',
        'Model SKU': 'ET-MCU-32BIT',
        'Place of Origin': 'Taiwan',
        'Warranty Duration': '1 Year Warranty',
        'Industrial Return Policy': '7 Days Returnable',
        'Regulatory Standards': 'RoHS Compliant, CE Certified'
      },
      'media': [{'url': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=300&auto=format&fit=crop'}],
      'seller': {'id': 's3', 'companyName': 'ElectroTech', 'kycStatus': 'VERIFIED', 'trustScore': 92}
    },
    {
      'id': 'e_2',
      'categoryId': 'c2',
      'title': 'High-Power Transformers',
      'description': 'Industrial high-power transformers designed for power distribution grids and heavy machinery operation.',
      'productDetail': {
        'pricePerUnit': 1500,
        'minOrderQty': 5,
        'unitOfMeasure': 'Unit',
        'Brand / Manufacturer': 'PowerGrid',
        'Model SKU': 'PG-TRF-10KVA',
        'Place of Origin': 'India',
        'Warranty Duration': '3 Years Warranty',
        'Industrial Return Policy': '14 Days Returnable',
        'Regulatory Standards': 'BIS Registration, IEEE Certified'
      },
      'media': [{'url': 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80&w=300&auto=format&fit=crop'}],
      'seller': {'id': 's4', 'companyName': 'PowerGrid', 'kycStatus': 'VERIFIED', 'trustScore': 94}
    },
    {
      'id': 'i_1',
      'categoryId': 'c3',
      'title': 'High-Grade Industrial Steel Coils',
      'description': 'Premium grade industrial steel coils suitable for automotive and manufacturing industries. Flexible negotiable terms.',
      'productDetail': {
        'pricePerUnit': 1200,
        'minOrderQty': 50,
        'unitOfMeasure': 'Tons',
        'Brand / Manufacturer': 'MetalWorks Inc.',
        'Model SKU': 'MW-CR-COIL',
        'Place of Origin': 'India',
        'Warranty Duration': 'None',
        'Industrial Return Policy': 'Non-returnable',
        'Regulatory Standards': 'ISO 9001'
      },
      'media': [{'url': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=300&auto=format&fit=crop'}],
      'seller': {'id': 's5', 'companyName': 'MetalWorks Inc.', 'kycStatus': 'VERIFIED', 'trustScore': 98}
    },
    {
      'id': 'i_2',
      'categoryId': 'c3',
      'title': 'Industrial Conveyor Belts',
      'description': 'Durable conveyor belts made from high-tensile rubber, designed for continuous operation in harsh industrial environments.',
      'productDetail': {
        'pricePerUnit': 150,
        'minOrderQty': 20,
        'unitOfMeasure': 'Meters',
        'Brand / Manufacturer': 'BeltMasters',
        'Model SKU': 'BM-CB-RUBBER',
        'Place of Origin': 'Vietnam',
        'Warranty Duration': '1 Year Warranty',
        'Industrial Return Policy': '30 Days Returnable',
        'Regulatory Standards': 'CE Certified'
      },
      'media': [{'url': 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=300&auto=format&fit=crop'}],
      'seller': {'id': 's6', 'companyName': 'BeltMasters', 'kycStatus': 'VERIFIED', 'trustScore': 90}
    },
    {
      'id': 's_1',
      'categoryId': 'c4',
      'title': 'Warehouse Logistics Service',
      'description': 'Comprehensive warehouse logistics and supply chain management services. Modern facility with secure storage.',
      'serviceDetail': {
        'basePrice': 200,
        'serviceMode': 'Logistics',
        'typicalDuration': 'Monthly',
        'Service Provider': 'FastLogistics',
        'Coverage Area': 'Pan India',
        'Insurance Included': 'Up to ₹10 Lakhs',
        'Tracking System': 'Real-time GPS tracking',
        'Certifications': 'ISO 28000 (Supply Chain Security)'
      },
      'media': [{'url': 'https://images.unsplash.com/photo-1586528116311-ad8ed7c508b0?q=80&w=300&auto=format&fit=crop'}],
      'seller': {'id': 's7', 'companyName': 'FastLogistics', 'kycStatus': 'VERIFIED', 'trustScore': 97}
    },
    {
      'id': 's_2',
      'categoryId': 'c4',
      'title': 'Industrial Equipment Maintenance',
      'description': 'Expert maintenance and repair services for heavy industrial equipment and production lines. 24/7 support available.',
      'serviceDetail': {
        'basePrice': 1000,
        'serviceMode': 'Maintenance',
        'typicalDuration': 'Annual Contract',
        'Service Provider': 'TechFix Services',
        'Coverage Area': 'Tier 1 Cities',
        'SLA Response Time': 'Under 4 Hours',
        'Spare Parts Included': 'No (Billed separately)',
        'Certifications': 'ISO 9001 (Quality Management)'
      },
      'media': [{'url': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=300&auto=format&fit=crop'}],
      'seller': {'id': 's8', 'companyName': 'TechFix Services', 'kycStatus': 'VERIFIED', 'trustScore': 96}
    }
  ];

  JsonMap _getMockMap(String path, [Map<String, dynamic>? query]) {
    if (path.startsWith('/listings/search')) {
      var filtered = _allMockListings;
      if (query != null && query['categoryId'] != null) {
        filtered = _allMockListings.where((e) => e['categoryId'] == query['categoryId']).toList();
      }

      return {
        'listings': filtered,
        'total': filtered.length,
        'page': 1,
        'totalPages': 1,
      };
    } else if (path.startsWith('/listings/') && path.split('/').length > 2) {
      final id = path.split('/').last;
      final item = _allMockListings.firstWhere(
        (element) => element['id'] == id,
        orElse: () => _allMockListings.first,
      );
      return item;
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


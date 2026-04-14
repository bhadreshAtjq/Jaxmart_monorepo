import 'package:dio/dio.dart';
import '../utils/constants.dart';

class ApiService {
  static final ApiService instance = ApiService._();
  ApiService._();

  late final Dio _dio;

  void init() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json'},
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          final refreshed = await _refreshToken();
          if (refreshed) {
            return handler.resolve(await _retry(error.requestOptions));
          }
        }
        return handler.next(error);
      },
    ));
  }

  void setToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  void clearToken() {
    _dio.options.headers.remove('Authorization');
  }

  Future<bool> _refreshToken() async {
    // Implement token refresh
    return false;
  }

  Future<Response<dynamic>> _retry(RequestOptions requestOptions) {
    return _dio.request(
      requestOptions.path,
      options: Options(method: requestOptions.method, headers: requestOptions.headers),
      data: requestOptions.data,
      queryParameters: requestOptions.queryParameters,
    );
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  Future<void> sendOtp(String phone) async {
    await _dio.post('/auth/send-otp', data: {'phone': phone});
  }

  Future<Map<String, dynamic>> verifyOtp({
    required String phone,
    required String otp,
    String? fullName,
    String? userType,
  }) async {
    final res = await _dio.post('/auth/verify-otp', data: {
      'phone': phone, 'otp': otp,
      if (fullName != null) 'fullName': fullName,
      if (userType != null) 'userType': userType,
    });
    return res.data as Map<String, dynamic>;
  }

  Future<void> logout(String refreshToken) async {
    await _dio.post('/auth/logout', data: {'refreshToken': refreshToken});
  }

  Future<void> updateFcmToken(String token) async {
    await _dio.post('/auth/fcm-token', data: {'fcmToken': token});
  }

  // ── Categories ────────────────────────────────────────────────────────────
  Future<List<dynamic>> getCategories({String? parentId}) async {
    final res = await _dio.get('/categories', queryParameters: {if (parentId != null) 'parentId': parentId});
    return res.data as List<dynamic>;
  }

  // ── Listings ──────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> searchListings(Map<String, dynamic> params) async {
    final res = await _dio.get('/listings/search', queryParameters: params);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getListing(String id) async {
    final res = await _dio.get('/listings/$id');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createListing(Map<String, dynamic> data) async {
    final res = await _dio.post('/listings', data: data);
    return res.data as Map<String, dynamic>;
  }

  Future<void> updateListing(String id, Map<String, dynamic> data) async {
    await _dio.put('/listings/$id', data: data);
  }

  Future<void> publishListing(String id) async {
    await _dio.patch('/listings/$id/publish');
  }

  Future<Map<String, dynamic>> getMyListings(Map<String, dynamic> params) async {
    final res = await _dio.get('/listings/seller/me', queryParameters: params);
    return res.data as Map<String, dynamic>;
  }

  // ── RFQ ───────────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> createRfq(Map<String, dynamic> data) async {
    final res = await _dio.post('/rfq', data: data);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getMyRfqs(Map<String, dynamic> params) async {
    final res = await _dio.get('/rfq/my', queryParameters: params);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getRfq(String id) async {
    final res = await _dio.get('/rfq/$id');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getSellerRfqInbox(Map<String, dynamic> params) async {
    final res = await _dio.get('/rfq/seller/inbox', queryParameters: params);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> submitQuote(String rfqId, Map<String, dynamic> data) async {
    final res = await _dio.post('/rfq/$rfqId/quotes', data: data);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> awardQuote(String rfqId, String quoteId) async {
    final res = await _dio.patch('/rfq/$rfqId/award/$quoteId');
    return res.data as Map<String, dynamic>;
  }

  Future<void> shortlistQuote(String quoteId) async {
    await _dio.patch('/rfq/quotes/$quoteId/shortlist');
  }

  // ── Orders ────────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> getOrders(Map<String, dynamic> params) async {
    final res = await _dio.get('/orders', queryParameters: params);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getOrder(String id) async {
    final res = await _dio.get('/orders/$id');
    return res.data as Map<String, dynamic>;
  }

  Future<void> signContract(String orderId) async {
    await _dio.post('/orders/$orderId/contract-sign');
  }

  Future<void> submitMilestone(String orderId, String milestoneId, Map<String, dynamic> data) async {
    await _dio.post('/orders/$orderId/milestones/$milestoneId/submit', data: data);
  }

  Future<Map<String, dynamic>> approveMilestone(String orderId, String milestoneId) async {
    final res = await _dio.post('/orders/$orderId/milestones/$milestoneId/approve');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> raiseDispute(String orderId, Map<String, dynamic> data) async {
    final res = await _dio.post('/orders/$orderId/disputes', data: data);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getSellerDashboard() async {
    final res = await _dio.get('/orders/dashboard');
    return res.data as Map<String, dynamic>;
  }

  // ── Payments ──────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> createPaymentOrder(String orderId) async {
    final res = await _dio.post('/payments/create-order', data: {'orderId': orderId});
    return res.data as Map<String, dynamic>;
  }

  Future<void> verifyPayment(Map<String, dynamic> data) async {
    await _dio.post('/payments/verify', data: data);
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  Future<List<dynamic>> getNotifications() async {
    final res = await _dio.get('/notifications');
    return res.data as List<dynamic>;
  }

  Future<void> markNotificationRead(String id) async {
    await _dio.patch('/notifications/$id/read');
  }

  // ── Upload ────────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> uploadFile(String filePath, String type) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath),
      'type': type,
    });
    final res = await _dio.post('/upload', data: formData);
    return res.data as Map<String, dynamic>;
  }
}

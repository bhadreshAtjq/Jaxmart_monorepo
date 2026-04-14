import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class AuthState {
  final bool isLoggedIn;
  final UserModel? user;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.isLoggedIn = false,
    this.user,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({bool? isLoggedIn, UserModel? user, bool? isLoading, String? error}) {
    return AuthState(
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class AuthNotifier extends AsyncNotifier<AuthState> {
  static const _storage = FlutterSecureStorage();

  @override
  Future<AuthState> build() async {
    return _loadFromStorage();
  }

  Future<AuthState> _loadFromStorage() async {
    final token = await _storage.read(key: 'access_token');
    final userData = await _storage.read(key: 'user_data');
    if (token == null || userData == null) return const AuthState();
    try {
      final user = UserModel.fromJsonString(userData);
      ApiService.instance.setToken(token);
      return AuthState(isLoggedIn: true, user: user);
    } catch (_) {
      return const AuthState();
    }
  }

  Future<void> sendOtp(String phone) async {
    state = const AsyncLoading();
    try {
      await ApiService.instance.sendOtp(phone);
      state = const AsyncData(AuthState());
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  Future<bool> verifyOtp({required String phone, required String otp, String? fullName, String? userType}) async {
    state = const AsyncLoading();
    try {
      final result = await ApiService.instance.verifyOtp(
        phone: phone, otp: otp, fullName: fullName, userType: userType,
      );
      await _storage.write(key: 'access_token', value: result['accessToken']);
      await _storage.write(key: 'refresh_token', value: result['refreshToken']);
      final user = UserModel.fromJson(result['user']);
      await _storage.write(key: 'user_data', value: user.toJsonString());
      ApiService.instance.setToken(result['accessToken']);
      state = AsyncData(AuthState(isLoggedIn: true, user: user));
      return result['isNew'] as bool;
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
      return false;
    }
  }

  Future<void> updateUser(UserModel user) async {
    await _storage.write(key: 'user_data', value: user.toJsonString());
    state = AsyncData(AuthState(isLoggedIn: true, user: user));
  }

  Future<void> logout() async {
    try {
      final refreshToken = await _storage.read(key: 'refresh_token');
      await ApiService.instance.logout(refreshToken ?? '');
    } finally {
      await _storage.deleteAll();
      ApiService.instance.clearToken();
      state = const AsyncData(AuthState());
    }
  }
}

final authStateProvider = AsyncNotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);
final currentUserProvider = Provider((ref) => ref.watch(authStateProvider).value?.user);

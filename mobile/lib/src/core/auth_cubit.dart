import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../data/json_tools.dart';
import 'api_client.dart';

enum AuthStatus { unknown, guest, loading, authenticated, failure }

class AuthState extends Equatable {
  const AuthState({
    this.status = AuthStatus.unknown,
    this.user = const {},
    this.message,
    this.phone,
  });

  final AuthStatus status;
  final JsonMap user;
  final String? message;
  final String? phone;

  bool get isLoggedIn => status == AuthStatus.authenticated;
  bool get isSeller => ['SELLER', 'BOTH'].contains(textOf(user['userType']).toUpperCase());
  bool get isAdmin => user['isAdmin'] == true;
  String get name => textOf(user['fullName'], 'User');
  String get userType => textOf(user['userType'], 'BUYER').toUpperCase();

  AuthState copyWith({
    AuthStatus? status,
    JsonMap? user,
    String? message,
    String? phone,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      message: message,
      phone: phone ?? this.phone,
    );
  }

  @override
  List<Object?> get props => [status, user, message, phone];
}

class AuthCubit extends Cubit<AuthState> {
  AuthCubit(this._api) : super(const AuthState());

  final JaxApiClient _api;

  Future<void> restoreSession() async {
    emit(state.copyWith(status: AuthStatus.loading));
    try {
      final token = await _api.accessToken.timeout(const Duration(seconds: 3));
      if (token == null || token.isEmpty) {
        emit(const AuthState(status: AuthStatus.guest));
        return;
      }
      final user = await _api.profile().timeout(const Duration(seconds: 8));
      emit(AuthState(status: AuthStatus.authenticated, user: user));
    } catch (_) {
      await _api.clearSession();
      emit(const AuthState(status: AuthStatus.guest));
    }
  }

  Future<void> sendOtp(String phone) async {
    final normalized = phone.replaceAll(RegExp(r'\D'), '');
    if (normalized.length < 7) {
      emit(state.copyWith(status: AuthStatus.failure, message: 'Enter a valid phone number'));
      return;
    }
    emit(state.copyWith(status: AuthStatus.loading, phone: normalized));
    try {
      await _api.sendOtp(normalized);
      emit(AuthState(status: AuthStatus.guest, phone: normalized, message: 'OTP sent'));
    } on DioException catch (error) {
      emit(state.copyWith(status: AuthStatus.failure, message: _message(error)));
    } catch (error) {
      emit(state.copyWith(status: AuthStatus.failure, message: 'An unexpected error occurred'));
    }
  }



  Future<void> verifyOtp({
    required String phone,
    required String otp,
    String? fullName,
    String? userType,
  }) async {
    if (otp.trim().length < 4) {
      emit(state.copyWith(status: AuthStatus.failure, message: 'Enter the OTP'));
      return;
    }
    emit(state.copyWith(status: AuthStatus.loading));
    try {
      final result = await _api.verifyOtp(
        phone: phone,
        otp: otp.trim(),
        fullName: fullName,
        userType: userType,
      );
      final user = asMap(result['user']);
      await _api.saveSession(
        accessToken: textOf(result['accessToken']),
        refreshToken: textOf(result['refreshToken']),
        user: user,
      );
      emit(AuthState(status: AuthStatus.authenticated, user: user));
    } on DioException catch (error) {
      emit(state.copyWith(status: AuthStatus.failure, message: _message(error)));
    } catch (error) {
      emit(state.copyWith(status: AuthStatus.failure, message: 'An unexpected error occurred'));
    }
  }

  Future<void> updateProfile(JsonMap data) async {
    emit(state.copyWith(status: AuthStatus.loading));
    try {
      final result = await _api.updateProfile(data);
      final user = asMap(result['user']).isNotEmpty ? asMap(result['user']) : await _api.profile();
      emit(AuthState(status: AuthStatus.authenticated, user: user, message: 'Profile updated'));
    } on DioException catch (error) {
      emit(state.copyWith(status: AuthStatus.failure, message: _message(error)));
    } catch (error) {
      emit(state.copyWith(status: AuthStatus.failure, message: 'An unexpected error occurred'));
    }
  }

  Future<void> logout() async {
    emit(state.copyWith(status: AuthStatus.loading));
    await _api.logout();
    emit(const AuthState(status: AuthStatus.guest));
  }

  String _message(DioException error) {
    final data = asMap(error.response?.data);
    return textOf(data['error'], textOf(data['message'], 'Something went wrong'));
  }
}

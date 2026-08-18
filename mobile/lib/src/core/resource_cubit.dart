import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../data/json_tools.dart';

enum ResourceStatus { idle, loading, refreshing, success, submitting, failure }

class ResourceState extends Equatable {
  const ResourceState({
    this.status = ResourceStatus.idle,
    this.data = const {},
    this.items = const [],
    this.page = 1,
    this.totalPages = 1,
    this.message,
  });

  final ResourceStatus status;
  final JsonMap data;
  final List<JsonMap> items;
  final int page;
  final int totalPages;
  final String? message;

  bool get isBusy => status == ResourceStatus.loading || status == ResourceStatus.submitting;
  bool get hasData => data.isNotEmpty || items.isNotEmpty;

  ResourceState copyWith({
    ResourceStatus? status,
    JsonMap? data,
    List<JsonMap>? items,
    int? page,
    int? totalPages,
    String? message,
  }) {
    return ResourceState(
      status: status ?? this.status,
      data: data ?? this.data,
      items: items ?? this.items,
      page: page ?? this.page,
      totalPages: totalPages ?? this.totalPages,
      message: message,
    );
  }

  @override
  List<Object?> get props => [status, data, items, page, totalPages, message];
}

class ResourceCubit extends Cubit<ResourceState> {
  ResourceCubit() : super(const ResourceState());

  void clear() {
    emit(const ResourceState());
  }

  Future<void> load(
    Future<dynamic> Function() loader, {
    List<String> listKeys = const [],
    bool refresh = false,
  }) async {
    emit(state.copyWith(status: refresh && state.hasData ? ResourceStatus.refreshing : ResourceStatus.loading));
    try {
      final payload = await loader();
      final data = asMap(payload);
      final items = listKeys.isEmpty ? asList(payload) : pickList(payload, listKeys);
      final pagination = asMap(data['pagination']);
      if (isClosed) return;
      emit(
        ResourceState(
          status: ResourceStatus.success,
          data: data,
          items: items,
          page: (numOf(pagination['page']) ?? numOf(data['page']) ?? 1).toInt(),
          totalPages: (numOf(pagination['pages']) ?? 1).toInt(),
        ),
      );
    } on DioException catch (error) {
      if (isClosed) return;
      emit(state.copyWith(status: ResourceStatus.failure, message: _message(error)));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(status: ResourceStatus.failure, message: '$error'));
    }
  }

  Future<bool> submit(Future<dynamic> Function() action) async {
    if (isClosed) return false;
    emit(state.copyWith(status: ResourceStatus.submitting));
    try {
      final payload = await action();
      if (isClosed) return true;
      emit(state.copyWith(status: ResourceStatus.success, data: asMap(payload), message: 'Saved successfully'));
      return true;
    } on DioException catch (error) {
      if (isClosed) return false;
      emit(state.copyWith(status: ResourceStatus.failure, message: _message(error)));
      return false;
    } catch (error) {
      if (isClosed) return false;
      emit(state.copyWith(status: ResourceStatus.failure, message: '$error'));
      return false;
    }
  }

  String _message(DioException error) {
    final data = asMap(error.response?.data);
    return textOf(data['error'], textOf(data['message'], 'Something went wrong'));
  }
}

class CategoriesCubit extends ResourceCubit {}

class FormSubmitCubit extends ResourceCubit {}

class SecondaryResourceCubit extends ResourceCubit {}

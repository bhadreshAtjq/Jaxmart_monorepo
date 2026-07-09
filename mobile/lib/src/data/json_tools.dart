import 'package:intl/intl.dart';

typedef JsonMap = Map<String, dynamic>;

JsonMap asMap(dynamic value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) return value.map((key, val) => MapEntry('$key', val));
  return <String, dynamic>{};
}

List<JsonMap> asList(dynamic value) {
  if (value is List) return value.map(asMap).where((e) => e.isNotEmpty).toList();
  return const <JsonMap>[];
}

List<String> asStringList(dynamic value) {
  if (value is List) return value.map((e) => '$e').where((e) => e.isNotEmpty).toList();
  return const <String>[];
}

List<JsonMap> pickList(dynamic payload, List<String> keys) {
  final map = asMap(payload);
  if (payload is List) return asList(payload);
  for (final key in keys) {
    final item = map[key];
    if (item is List) return asList(item);
  }
  return const <JsonMap>[];
}

String textOf(dynamic value, [String fallback = '']) {
  if (value == null) return fallback;
  final text = '$value'.trim();
  return text.isEmpty ? fallback : text;
}

num? numOf(dynamic value) {
  if (value is num) return value;
  return num.tryParse(textOf(value));
}

String money(dynamic value) {
  final parsed = numOf(value);
  if (parsed == null) return 'Ask Price';
  final format = NumberFormat.currency(locale: 'en_IN', symbol: 'Rs ', decimalDigits: 0);
  return format.format(parsed);
}

String shortDate(dynamic value) {
  if (value == null) return '';
  final date = DateTime.tryParse('$value');
  if (date == null) return textOf(value);
  return DateFormat('MMM d, yyyy').format(date.toLocal());
}

String firstImage(JsonMap item) {
  final media = asList(item['media']);
  if (media.isNotEmpty) return textOf(media.first['url']);
  return textOf(item['imageUrl']);
}

String sellerName(JsonMap item) {
  final seller = asMap(item['seller']);
  final business = asMap(seller['businessProfile']);
  return textOf(business['businessName'], textOf(seller['fullName'], 'Verified Seller'));
}

String categoryName(JsonMap item) => textOf(asMap(item['category'])['name']);

String statusOf(JsonMap item, [String fallback = 'OPEN']) {
  return textOf(item['status'], textOf(item['listingType'], fallback)).toUpperCase();
}

String formatRfqBudget(JsonMap item) {
  final minVal = numOf(item['budgetMin']);
  final maxVal = numOf(item['budgetMax']);

  if (minVal == null && maxVal == null) {
    final fallbackBudget = item['budgetMax'] ?? item['quotedAmount'];
    if (fallbackBudget != null) {
      final val = numOf(fallbackBudget);
      if (val != null) {
        final format = NumberFormat.decimalPattern('en_US');
        return '₹${format.format(val)}';
      }
    }
    return 'Open budget';
  }

  final format = NumberFormat.decimalPattern('en_US');

  if (minVal != null && maxVal != null) {
    if (minVal == 0 && maxVal == 0) {
      return 'Open budget';
    }
    return '₹${format.format(minVal)} - ${format.format(maxVal)}';
  } else if (minVal != null) {
    return '₹${format.format(minVal)} - Open';
  } else if (maxVal != null) {
    return '₹0 - ${format.format(maxVal)}';
  }
  return 'Open budget';
}



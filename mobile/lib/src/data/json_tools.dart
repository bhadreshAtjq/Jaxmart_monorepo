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

const List<String> _productFallbackImages = [
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop',
];

String getFallbackProductImage([String? seedTitle]) {
  if (seedTitle != null && seedTitle.isNotEmpty) {
    final lower = seedTitle.toLowerCase();
    if (lower.contains('phone') || lower.contains('mobile') || lower.contains('tecno') || lower.contains('electronics')) {
      return _productFallbackImages[1];
    }
    if (lower.contains('solar') || lower.contains('energy') || lower.contains('panel')) {
      return _productFallbackImages[2];
    }
    if (lower.contains('roller') || lower.contains('machinery') || lower.contains('cnc') || lower.contains('earth') || lower.contains('moving')) {
      return _productFallbackImages[0];
    }
    if (lower.contains('bolt') || lower.contains('steel') || lower.contains('metal') || lower.contains('fastener')) {
      return _productFallbackImages[3];
    }
    if (lower.contains('fabric') || lower.contains('cotton') || lower.contains('textile')) {
      return _productFallbackImages[4];
    }
  }
  return _productFallbackImages[5];
}

String resolveImageUrl(String? rawUrl, [String? seedTitle]) {
  final url = textOf(rawUrl).trim();
  if (url.isEmpty) return getFallbackProductImage(seedTitle);
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) {
    return 'https://jaxmart-monorepo.onrender.com$url';
  }
  return 'https://jaxmart-monorepo.onrender.com/$url';
}

String firstImage(JsonMap item) {
  final title = textOf(item['title']);
  final media = asList(item['media']);
  if (media.isNotEmpty) {
    final mediaUrl = textOf(media.first['url']);
    if (mediaUrl.isNotEmpty) return resolveImageUrl(mediaUrl, title);
  }
  final imgUrl = textOf(item['imageUrl']);
  if (imgUrl.isNotEmpty) return resolveImageUrl(imgUrl, title);
  return getFallbackProductImage(title);
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

String formatMaxRfqBudget(JsonMap item) {
  final maxVal = numOf(item['budgetMax']);
  final minVal = numOf(item['budgetMin']);

  if (maxVal != null && maxVal != 0) {
    final format = NumberFormat.decimalPattern('en_US');
    return '₹${format.format(maxVal)}';
  } else if (minVal != null && minVal != 0) {
    final format = NumberFormat.decimalPattern('en_US');
    return '₹${format.format(minVal)}';
  }

  final fallbackBudget = item['quotedAmount'];
  if (fallbackBudget != null) {
    final val = numOf(fallbackBudget);
    if (val != null) {
      final format = NumberFormat.decimalPattern('en_US');
      return '₹${format.format(val)}';
    }
  }

  return 'Open budget';
}




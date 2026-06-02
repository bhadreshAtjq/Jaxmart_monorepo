import 'package:b2b_platform/src/design/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('renders the JaXmart mobile theme shell', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: JaxTheme.light,
        home: const Scaffold(body: Text('JaxMart')),
      ),
    );

    expect(find.text('JaxMart'), findsOneWidget);
  });
}

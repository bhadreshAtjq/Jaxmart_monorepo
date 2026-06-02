import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'src/core/api_client.dart';
import 'src/core/auth_cubit.dart';
import 'src/core/router.dart';
import 'src/design/design_system.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();

  final api = JaxApiClient();
  final authCubit = AuthCubit(api)..restoreSession();

  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(JaxMartMobile(api: api, authCubit: authCubit));
}

class JaxMartMobile extends StatefulWidget {
  const JaxMartMobile({
    required this.api,
    required this.authCubit,
    super.key,
  });

  final JaxApiClient api;
  final AuthCubit authCubit;

  @override
  State<JaxMartMobile> createState() => _JaxMartMobileState();
}

class _JaxMartMobileState extends State<JaxMartMobile> {
  late final AppRouter _router;

  @override
  void initState() {
    super.initState();
    _router = AppRouter(widget.authCubit, widget.api);
  }

  @override
  Widget build(BuildContext context) {
    return RepositoryProvider.value(
      value: widget.api,
      child: BlocProvider.value(
        value: widget.authCubit,
        child: MaterialApp.router(
          title: 'JaxMart',
          debugShowCheckedModeBanner: false,
          theme: JaxTheme.light,
          routerConfig: _router.router,
        ),
      ),
    );
  }
}

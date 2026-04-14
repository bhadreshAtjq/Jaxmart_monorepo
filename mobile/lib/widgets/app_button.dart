// lib/widgets/app_button.dart
import 'package:flutter/material.dart';
import '../utils/constants.dart';

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData? icon;
  final bool isOutlined;
  final Color? color;

  const AppButton({super.key, required this.label, this.onPressed, this.isLoading = false, this.icon, this.isOutlined = false, this.color});

  @override
  Widget build(BuildContext context) {
    final content = isLoading
        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
        : Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(label),
              if (icon != null) ...[const SizedBox(width: 8), Icon(icon, size: 18)],
            ],
          );

    if (isOutlined) {
      return SizedBox(
        width: double.infinity,
        child: OutlinedButton(onPressed: isLoading ? null : onPressed, child: content),
      );
    }
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(backgroundColor: color ?? AppColors.primary),
        child: content,
      ),
    );
  }
}

// src/components/common/AppInput.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  required?: boolean;
  prefix?: string;
  suffix?: string;
  isMonospace?: boolean;
  showCharCount?: boolean;
}

export const AppInput = React.forwardRef<TextInput, AppInputProps>(({
  label,
  error,
  helperText,
  icon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  required = false,
  prefix,
  suffix,
  isMonospace = false,
  showCharCount = false,
  onFocus,
  onBlur,
  secureTextEntry,
  value,
  ...rest
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const hasError = Boolean(error);
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            isFocused && styles.labelFocused,
            hasError && styles.labelError,
          ]}
        >
          {label} {required && <Text style={{ color: colors.error }}>*</Text>}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={hasError ? colors.error : isFocused ? colors.primary : colors.outline}
            style={styles.leadingIcon}
          />
        )}

        {prefix && (
          <Text style={[styles.affixText, isMonospace && typography.monoMedium]}>
            {prefix}
          </Text>
        )}

        <TextInput
          ref={ref}
          style={[
            styles.input,
            isMonospace && typography.monoMedium,
            inputStyle,
          ]}
          value={value ?? ''}
          placeholderTextColor={colors.textPlaceholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isSecure}
          {...rest}
        />

        {suffix && (
          <Text style={[styles.affixText, isMonospace && typography.monoMedium]}>
            {suffix}
          </Text>
        )}

        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.trailingIconTouch}
            onPress={() => setIsSecure(!isSecure)}
          >
            <Ionicons
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.outline}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            style={styles.trailingIconTouch}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={hasError ? colors.error : colors.outline}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.bottomMetaRow}>
        <View style={{ flex: 1 }}>
          {error ? (
            <View style={styles.supportRow}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.error} style={{ marginRight: 4 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : helperText ? (
            <Text style={styles.helperText}>{helperText}</Text>
          ) : null}
        </View>

        {showCharCount && Boolean(rest.maxLength) && (
          <Text style={styles.charCountText}>
            {currentLength}/{rest.maxLength}
          </Text>
        )}
      </View>
    </View>
  );
});
AppInput.displayName = 'AppInput';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  labelFocused: {
    color: colors.primary,
  },
  labelError: {
    color: colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
  },
  inputContainerError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  leadingIcon: {
    marginRight: spacing.sm,
  },
  trailingIconTouch: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  input: {
    flex: 1,
    ...typography.bodyLarge,
    color: colors.onSurface,
    paddingVertical: spacing.sm,
  },
  affixText: {
    ...typography.bodyLarge,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: 2,
  },
  errorText: {
    ...typography.labelSmall,
    color: colors.error,
  },
  helperText: {
    ...typography.labelSmall,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
    paddingHorizontal: 2,
  },
  bottomMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingHorizontal: 2,
  },
  charCountText: {
    ...typography.labelSmall,
    color: colors.onSurfaceVariant,
    marginLeft: spacing.sm,
  },
});

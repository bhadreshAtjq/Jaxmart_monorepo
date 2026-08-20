// src/components/common/AppDropdown.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, elevation } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';

export interface DropdownOption {
  label: string;
  value: string;
  sublabel?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface AppDropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[] | string[];
  selectedValue?: string;
  onSelect: (value: string, option?: DropdownOption) => void;
  error?: string;
  helperText?: string;
  searchable?: boolean;
  required?: boolean;
  containerStyle?: ViewStyle;
}

export const AppDropdown: React.FC<AppDropdownProps> = ({
  label,
  placeholder = 'Select option...',
  options = [],
  selectedValue,
  onSelect,
  error,
  helperText,
  searchable = false,
  required = false,
  containerStyle,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize options
  const normalizedOptions: DropdownOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { label: opt, value: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === selectedValue);

  const filteredOptions = searchable && searchQuery
    ? normalizedOptions.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (opt.sublabel && opt.sublabel.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : normalizedOptions;

  const handleSelect = (option: DropdownOption) => {
    onSelect(option.value, option);
    setModalVisible(false);
    setSearchQuery('');
  };

  const hasError = Boolean(error);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, hasError && styles.labelError]}>
          {label} {required && <Text style={{ color: colors.error }}>*</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.selectBox,
          hasError && styles.selectBoxError,
          modalVisible && styles.selectBoxActive,
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <View style={styles.selectedContent}>
          {selectedOption?.icon && (
            <Ionicons
              name={selectedOption.icon}
              size={18}
              color={colors.primary}
              style={{ marginRight: spacing.sm }}
            />
          )}
          <Text
            style={[
              styles.selectedText,
              !selectedOption && styles.placeholderText,
            ]}
            numberOfLines={1}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </View>

        <Ionicons
          name={modalVisible ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.outline}
        />
      </TouchableOpacity>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}

      {/* M3 Modal Select Menu */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
          setSearchQuery('');
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setModalVisible(false);
            setSearchQuery('');
          }}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select an Option'}</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setSearchQuery('');
                }}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {searchable && (
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={colors.outline} style={{ marginRight: spacing.xs }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search options..."
                  placeholderTextColor={colors.textPlaceholder}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                />
              </View>
            )}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              style={styles.optionsList}
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionItemSelected,
                    ]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionTextCol}>
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {item.sublabel && (
                        <Text style={styles.optionSublabel}>{item.sublabel}</Text>
                      )}
                    </View>

                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No matching options found</Text>
                </View>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  labelError: {
    color: colors.error,
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: borderRadius.small,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  selectBoxActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  selectBoxError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  selectedContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  selectedText: {
    ...typography.bodyLarge,
    color: colors.onSurface,
  },
  placeholderText: {
    color: colors.textPlaceholder,
  },
  supportRow: {
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.labelSmall,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.labelSmall,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxHeight: '75%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.extraLarge, // 28dp M3 standard for modal dialogs
    padding: spacing.lg,
    ...elevation.level3,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  modalTitle: {
    ...typography.titleMedium,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    height: 44,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.onSurface,
    paddingVertical: 0,
  },
  optionsList: {
    marginTop: spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.small,
  },
  optionItemSelected: {
    backgroundColor: colors.primaryContainer,
  },
  optionTextCol: {
    flex: 1,
  },
  optionLabel: {
    ...typography.bodyLarge,
    color: colors.onSurface,
  },
  optionLabelSelected: {
    color: colors.onPrimaryContainer,
    fontWeight: '700',
  },
  optionSublabel: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.textPlaceholder,
  },
});

// src/components/common/CompanyContextCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { CompanySummary } from '../../api/companyApi';

interface CompanyContextCardProps {
  company?: CompanySummary | { legalName: string; tradeName?: string; gstin?: string; city?: string } | null;
  onChangeCompany?: () => void;
  readOnly?: boolean;
}

export const CompanyContextCard: React.FC<CompanyContextCardProps> = ({
  company,
  onChangeCompany,
  readOnly = false,
}) => {
  if (!company || !company.legalName) {
    return (
      <View style={[styles.card, styles.emptyCard]}>
        <View style={styles.leftRow}>
          <Ionicons name="business-outline" size={20} color={colors.warning} style={{ marginRight: spacing.sm }} />
          <Text style={styles.emptyText}>No company selected for SKU cataloging</Text>
        </View>
        {onChangeCompany && (
          <TouchableOpacity onPress={onChangeCompany} style={styles.changeBtn}>
            <Text style={styles.changeBtnText}>Select</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name="business" size={20} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.badgeLabel}>Target Company</Text>
          {company.city && <Text style={styles.cityTag}>📍 {company.city}</Text>}
        </View>
        <Text style={styles.companyName} numberOfLines={1}>
          {company.legalName}
        </Text>
        {Boolean(company.tradeName) && company.tradeName !== company.legalName && (
          <Text style={styles.tradeName} numberOfLines={1}>
            DBA: {company.tradeName}
          </Text>
        )}
        {Boolean(company.gstin) && (
          <Text style={styles.gstinText}>
            GSTIN: <Text style={styles.gstinMono}>{company.gstin}</Text>
          </Text>
        )}
      </View>

      {!readOnly && onChangeCompany && (
        <TouchableOpacity onPress={onChangeCompany} style={styles.switchButton}>
          <Ionicons name="swap-horizontal" size={16} color={colors.primary} style={{ marginRight: 2 }} />
          <Text style={styles.switchButtonText}>Change</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F4F8',
    borderColor: colors.outlineVariant,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  emptyCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  badgeLabel: {
    ...typography.labelCaps,
    color: colors.tertiary,
    marginRight: spacing.xs,
  },
  cityTag: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 11,
  },
  companyName: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  tradeName: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 12,
  },
  gstinText: {
    ...typography.bodySm,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  gstinMono: {
    ...typography.monoSm,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  switchButtonText: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '600',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.onWarningContainer,
    fontWeight: '600',
  },
  changeBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  changeBtnText: {
    ...typography.labelMd,
    color: '#FFFFFF',
  },
});

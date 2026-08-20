// src/screens/cataloging/CompanySelectScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useCompanyStore } from '../../store/useCompanyStore';
import { useSkuWizardStore } from '../../store/useSkuWizardStore';
import { AppInput } from '../../components/common/AppInput';
import { AppCard } from '../../components/common/AppCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CompanySummary } from '../../api/companyApi';

interface CompanySelectScreenProps {
  navigation: any;
}

export const CompanySelectScreen: React.FC<CompanySelectScreenProps> = ({ navigation }) => {
  const { savedCompanies, setActiveCompany } = useCompanyStore();
  const { setCompanyContext, resetWizard } = useSkuWizardStore();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = savedCompanies.filter(
    (c) =>
      c.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tradeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.gstin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.city || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCompany = (company: CompanySummary) => {
    resetWizard();
    setActiveCompany(company);
    setCompanyContext(company.id, company.legalName);
    navigation.navigate('Step1BasicProduct', {
      companyId: company.id,
      companyName: company.legalName,
    });
  };

  const renderCompanyItem = ({ item }: { item: CompanySummary }) => (
    <AppCard
      style={styles.companyCard}
      onPress={() => handleSelectCompany(item)}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.companyName} numberOfLines={1}>{item.legalName}</Text>
          {item.tradeName && <Text style={styles.tradeName}>{item.tradeName}</Text>}
        </View>
        <StatusBadge status={item.kycStatus} size="sm" />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>GSTIN</Text>
          <Text style={styles.metaValMono}>{item.gstin || 'Unregistered'}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>City</Text>
          <Text style={styles.metaVal}>{item.city}, {item.state}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>SKUs</Text>
          <Text style={styles.metaValBold}>{item.skuCount}</Text>
        </View>
      </View>

      <View style={styles.selectCtaRow}>
        <Text style={styles.selectCtaText}>Select & Begin SKU Cataloging</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Select Target Company</Text>
          <Text style={styles.headerSubtitle}>Choose merchant to scope SKU cataloging</Text>
        </View>
      </View>

      <View style={styles.content}>
        <AppInput
          placeholder="Search by Company Name, GSTIN, or City..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon="search-outline"
          containerStyle={{ marginBottom: spacing.md }}
        />

        <FlatList
          data={filteredCompanies}
          keyExtractor={(item) => item.id}
          renderItem={renderCompanyItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={48} color={colors.textPlaceholder} />
              <Text style={styles.emptyTitle}>No Merchants Found</Text>
              <Text style={styles.emptySubtitle}>
                Onboard a new merchant first to begin cataloging SKUs for them.
              </Text>
              <TouchableOpacity
                style={styles.onboardNowBtn}
                onPress={() => navigation.navigate('SellerWizardTab', { screen: 'Step1BasicProfile' })}
              >
                <Ionicons name="add-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.onboardNowBtnText}>+ Onboard New Merchant</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    marginRight: spacing.md,
    padding: 4,
  },
  headerTitle: {
    ...typography.headlineMd,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  companyCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  companyName: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 15,
  },
  tradeName: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginVertical: spacing.xs,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    ...typography.labelCaps,
    color: colors.textSecondary,
    fontSize: 9,
  },
  metaVal: {
    ...typography.bodySm,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 11,
  },
  metaValMono: {
    ...typography.monoSm,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 11,
  },
  metaValBold: {
    ...typography.titleMd,
    color: colors.primary,
    fontWeight: '700',
  },
  selectCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  selectCtaText: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '700',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  emptySubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  onboardNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  onboardNowBtnText: {
    ...typography.labelMd,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

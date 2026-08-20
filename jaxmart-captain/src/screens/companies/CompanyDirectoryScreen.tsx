// src/screens/companies/CompanyDirectoryScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
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

interface CompanyDirectoryScreenProps {
  navigation: any;
}

export const CompanyDirectoryScreen: React.FC<CompanyDirectoryScreenProps> = ({ navigation }) => {
  const { savedCompanies, setActiveCompany } = useCompanyStore();
  const { setCompanyContext, resetWizard } = useSkuWizardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const filteredCompanies = savedCompanies.filter((c) => {
    const matchesSearch =
      c.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tradeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.gstin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.city || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === 'VERIFIED') return c.kycStatus === 'VERIFIED';
    if (selectedFilter === 'PENDING') return c.kycStatus === 'PENDING';
    return true;
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleAddSkuForCompany = (company: CompanySummary) => {
    resetWizard();
    setActiveCompany(company);
    setCompanyContext(company.id, company.legalName);
    navigation.navigate('SkuWizardTab', {
      screen: 'Step1BasicProduct',
      params: { companyId: company.id, companyName: company.legalName },
    });
  };

  const renderCompanyItem = ({ item }: { item: CompanySummary }) => (
    <AppCard
      style={styles.companyCard}
      onPress={() => {
        setActiveCompany(item);
        navigation.navigate('CompanyDetail', { companyId: item.id });
      }}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.companyTitle} numberOfLines={1}>{item.legalName}</Text>
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
          <Text style={styles.metaLabel}>Location</Text>
          <Text style={styles.metaVal}>{item.city}, {item.state}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Cataloged</Text>
          <Text style={styles.metaValBold}>{item.skuCount} SKUs</Text>
        </View>
      </View>

      <View style={styles.cardActionRow}>
        <TouchableOpacity
          style={styles.addSkuShortcutBtn}
          onPress={() => handleAddSkuForCompany(item)}
        >
          <Ionicons name="add" size={16} color={colors.primary} />
          <Text style={styles.addSkuShortcutBtnText}>Add SKU</Text>
        </TouchableOpacity>

        <View style={styles.viewProfileRow}>
          <Text style={styles.viewProfileText}>View Profile & Catalog</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
        </View>
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Merchant Directory</Text>
          <Text style={styles.headerSubtitle}>
            {savedCompanies.length} registered merchant{savedCompanies.length === 1 ? '' : 's'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.onboardHeaderBtn}
          onPress={() => navigation.navigate('SellerWizardTab', { screen: 'Step1BasicProfile' })}
        >
          <Ionicons name="person-add" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.onboardHeaderBtnText}>+ Onboard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Search Input */}
        <AppInput
          placeholder="Search by Legal Name, Trade Name, GSTIN..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon="search-outline"
          containerStyle={{ marginBottom: spacing.sm }}
        />

        {/* Filter Chips */}
        <View style={styles.filtersRow}>
          {(['ALL', 'VERIFIED', 'PENDING'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === filter && styles.filterChipTextActive,
                ]}
              >
                {filter === 'ALL' ? 'All Merchants' : filter === 'VERIFIED' ? 'Verified KYC' : 'Pending Review'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        <FlatList
          data={filteredCompanies}
          keyExtractor={(item) => item.id}
          renderItem={renderCompanyItem}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={48} color={colors.textPlaceholder} />
              <Text style={styles.emptyTitle}>No Merchants Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search criteria' : 'Onboard your first B2B seller to get started'}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />

        {/* Material 3 Extended FAB */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.extendedFab}
          onPress={() => navigation.navigate('OnboardSellerTab', { screen: 'Step1BasicProfile' })}
        >
          <Ionicons name="add" size={22} color={colors.onPrimaryContainer} style={{ marginRight: 6 }} />
          <Text style={styles.extendedFabText}>Onboard Merchant</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  onboardHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  onboardHeaderBtnText: {
    ...typography.labelMd,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  filtersRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  filterChipText: {
    ...typography.labelCaps,
    color: colors.textSecondary,
    fontSize: 10,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
  companyTitle: {
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
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addSkuShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryFixed,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.sm,
  },
  addSkuShortcutBtnText: {
    ...typography.labelCaps,
    color: colors.primaryDark,
    fontWeight: '700',
    marginLeft: 2,
  },
  viewProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewProfileText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 11,
    marginRight: 2,
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
    marginTop: spacing.xs,
  },
  extendedFab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.large, // 16dp M3 FAB standard
    ...shadows.fab,
  },
  extendedFabText: {
    ...typography.labelLarge,
    color: colors.onPrimaryContainer,
    fontWeight: '700',
  },
});

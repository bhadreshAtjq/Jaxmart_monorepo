// src/screens/companies/CompanyDirectoryScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
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
import { CompanySummary } from '../../api/companyApi';

interface CompanyDirectoryScreenProps {
  navigation: any;
}

const ITEMS_PER_PAGE = 5;

export const CompanyDirectoryScreen: React.FC<CompanyDirectoryScreenProps> = ({ navigation }) => {
  const { savedCompanies, setActiveCompany, fetchCompanies } = useCompanyStore();
  const { setCompanyContext, resetWizard } = useSkuWizardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Filter companies
  const filteredCompanies = savedCompanies.filter((c) => {
    const matchesSearch =
      (c.legalName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.tradeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.gstin || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.city || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === 'VERIFIED') return c.kycStatus === 'VERIFIED';
    if (selectedFilter === 'PENDING') return c.kycStatus === 'PENDING';
    return true;
  });

  // Reset to page 1 whenever filter or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilter]);

  // Calculate Pagination
  const totalItems = filteredCompanies.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCompanies().finally(() => setRefreshing(false));
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

  const getInitials = (name?: string) => {
    if (!name) return 'CO';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const renderCompanyItem = ({ item }: { item: CompanySummary }) => (
    <AppCard
      style={styles.companyCard}
      onPress={() => {
        setActiveCompany(item);
        navigation.navigate('CompanyDetail', { companyId: item.id });
      }}
    >
      {/* Top Profile & Status Row */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{getInitials(item.legalName)}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10, marginRight: 8 }}>
          <Text style={styles.companyTitle} numberOfLines={1}>
            {item.legalName}
          </Text>
          <Text style={styles.tradeName} numberOfLines={1}>
            {item.tradeName || item.legalName}
          </Text>
        </View>

        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={13} color="#166534" style={{ marginRight: 3 }} />
          <Text style={styles.verifiedBadgeText}>Verified</Text>
        </View>
      </View>

      {/* Meta Specs Grid Box */}
      <View style={styles.metaRow}>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>GSTIN</Text>
          <Text style={styles.metaValMono} numberOfLines={1}>
            {item.gstin || 'Unregistered'}
          </Text>
        </View>
        <View style={[styles.metaCol, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 8 }]}>
          <Text style={styles.metaLabel}>LOCATION</Text>
          <Text style={styles.metaVal} numberOfLines={1}>
            📍 {item.city || 'Surat'}, {item.state || 'Gujarat'}
          </Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>CATALOGED</Text>
          <Text style={styles.metaValBold}>{item.skuCount || 0} SKUs</Text>
        </View>
      </View>

      {/* Action Bar Footer */}
      <View style={styles.cardActionRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.addSkuShortcutBtn}
          onPress={() => handleAddSkuForCompany(item)}
        >
          <Ionicons name="add-circle" size={16} color="#0D9488" />
          <Text style={styles.addSkuShortcutBtnText}>Add SKU</Text>
        </TouchableOpacity>

        <View style={styles.viewProfileRow}>
          <Text style={styles.viewProfileText}>View Profile & Catalog</Text>
          <Ionicons name="chevron-forward" size={14} color="#64748B" />
        </View>
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 🌟 Top Modern Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Merchant Directory</Text>
          <View style={styles.subtitleRow}>
            <View style={styles.activeDot} />
            <Text style={styles.headerSubtitle}>
              {savedCompanies.length} Onboarded B2B Merchants
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.onboardHeaderBtn}
          onPress={() => navigation.navigate('OnboardSellerTab', { screen: 'Step1BasicProfile' })}
        >
          <Ionicons name="person-add" size={15} color="#FFFFFF" style={{ marginRight: 5 }} />
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
          containerStyle={{ marginBottom: spacing.xs + 2 }}
        />

        {/* Filter Chips */}
        <View style={styles.filtersRow}>
          {(['ALL', 'VERIFIED'] as const).map((filter) => (
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
                {filter === 'ALL'
                  ? `All Merchants (${savedCompanies.length})`
                  : `Verified KYC (${savedCompanies.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Paginated Merchant List */}
        <FlatList
          data={paginatedCompanies}
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
          ListFooterComponent={
            totalItems > 0 ? (
              <View style={styles.paginationContainer}>
                <Text style={styles.paginationRangeText}>
                  Showing {startIndex + 1}-{endIndex} of {totalItems} merchants
                </Text>

                <View style={styles.paginationControls}>
                  {/* Previous Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={currentPage === 1}
                    style={[
                      styles.pageBtn,
                      currentPage === 1 && styles.pageBtnDisabled,
                    ]}
                    onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={16}
                      color={currentPage === 1 ? '#94A3B8' : '#0F172A'}
                    />
                    <Text
                      style={[
                        styles.pageBtnText,
                        currentPage === 1 && styles.pageBtnTextDisabled,
                      ]}
                    >
                      Prev
                    </Text>
                  </TouchableOpacity>

                  {/* Page Indicator Pill */}
                  <View style={styles.pageIndicatorPill}>
                    <Text style={styles.pageIndicatorText}>
                      Page {currentPage} of {totalPages}
                    </Text>
                  </View>

                  {/* Next Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={currentPage === totalPages}
                    style={[
                      styles.pageBtn,
                      currentPage === totalPages && styles.pageBtnDisabled,
                    ]}
                    onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <Text
                      style={[
                        styles.pageBtnText,
                        currentPage === totalPages && styles.pageBtnTextDisabled,
                      ]}
                    >
                      Next
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={currentPage === totalPages ? '#94A3B8' : '#0F172A'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 90 }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md - 2,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  onboardHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 10,
  },
  onboardHeaderBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  filtersRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs + 4,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  companyCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  companyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  tradeName: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  metaRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  metaCol: {
    flex: 1,
    alignItems: 'flex-start',
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,

  },
  metaVal: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '600',
    marginTop: 2,
  },
  metaValMono: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  metaValBold: {
    fontSize: 13,
    color: '#0D9488',
    fontWeight: '800',
    marginTop: 1,
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  addSkuShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 8,
  },
  addSkuShortcutBtnText: {
    fontSize: 11,
    color: '#0D9488',
    fontWeight: '700',
    marginLeft: 4,
  },
  viewProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewProfileText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginRight: 2,
  },
  paginationContainer: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  paginationRangeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 10,
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  pageBtnDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  pageBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  pageBtnTextDisabled: {
    color: '#94A3B8',
  },
  pageIndicatorPill: {
    backgroundColor: '#0F172A',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  pageIndicatorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
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
});

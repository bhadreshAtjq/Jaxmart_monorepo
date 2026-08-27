// src/screens/cataloging/CompanySelectScreen.tsx
import React, { useState, useEffect } from 'react';
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
import { spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useCompanyStore } from '../../store/useCompanyStore';
import { useSkuWizardStore } from '../../store/useSkuWizardStore';
import { AppInput } from '../../components/common/AppInput';
import { CompanySummary } from '../../api/companyApi';

interface CompanySelectScreenProps {
  navigation: any;
}

export const CompanySelectScreen: React.FC<CompanySelectScreenProps> = ({ navigation }) => {
  const { savedCompanies, setActiveCompany } = useCompanyStore();
  const { setCompanyContext, resetWizard } = useSkuWizardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const filteredCompanies = savedCompanies.filter(
    (c) =>
      c.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tradeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.gstin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.city || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset to first page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredCompanies.length / limit) || 1;
  const paginatedCompanies = filteredCompanies.slice((page - 1) * limit, page * limit);

  const goToNextPage = () => { if (page < totalPages) setPage(page + 1); };
  const goToPrevPage = () => { if (page > 1) setPage(page - 1); };

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
    <TouchableOpacity
      style={styles.companyCard}
      onPress={() => handleSelectCompany(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{item.legalName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={styles.companyName} numberOfLines={1}>{item.legalName}</Text>
          <Text style={styles.tradeName} numberOfLines={1}>{item.tradeName || 'Registered Business'}</Text>
        </View>
        {item.kycStatus === 'VERIFIED' && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#059669" />
            <Text style={styles.verifiedText}>VERIFIED</Text>
          </View>
        )}
      </View>

      <View style={styles.metaContainer}>
        <View style={styles.metaBox}>
          <Text style={styles.metaLabel}>GSTIN</Text>
          <Text style={styles.metaValMono}>{item.gstin || 'Unregistered'}</Text>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.metaBox}>
          <Text style={styles.metaLabel}>CITY</Text>
          <Text style={styles.metaVal} numberOfLines={1}>{item.city ? `${item.city}, ${item.state}` : 'N/A'}</Text>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.metaBoxRight}>
          <Text style={styles.metaLabel}>SKUs</Text>
          <Text style={styles.metaValBold}>{item.skuCount}</Text>
        </View>
      </View>

      <View style={styles.ctaRow}>
        <Text style={styles.ctaText}>Select Merchant</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Select Target Merchant</Text>
          <View style={styles.subtitleRow}>
            <View style={styles.activeDot} />
            <Text style={styles.headerSubtitle}>Choose a merchant to add SKUs to</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <AppInput
          placeholder="Search by Merchant Name, GSTIN, or City..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon="search-outline"
          containerStyle={{ marginBottom: spacing.lg }}
        />

        <FlatList
          data={paginatedCompanies}
          keyExtractor={(item) => item.id}
          renderItem={renderCompanyItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.md }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="business-outline" size={40} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Merchants Found</Text>
              <Text style={styles.emptySubtitle}>
                Onboard a new merchant first to begin cataloging SKUs for them.
              </Text>
              <TouchableOpacity
                style={styles.onboardNowBtn}
                onPress={() => navigation.navigate('SellerWizardTab', { screen: 'Step1BasicProfile' })}
              >
                <Ionicons name="add-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.onboardNowBtnText}>Onboard New Merchant</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={
            filteredCompanies.length > 0 ? (
              <View style={styles.paginationContainer}>
                <Text style={styles.paginationRangeText}>
                  Showing {(page - 1) * limit + 1}-{Math.min(page * limit, filteredCompanies.length)} of {filteredCompanies.length} merchants
                </Text>

                <View style={styles.paginationControls}>
                  {/* Previous Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={page === 1}
                    style={[
                      styles.pageBtn,
                      page === 1 && styles.pageBtnDisabled,
                    ]}
                    onPress={goToPrevPage}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={18}
                      color={page === 1 ? '#94A3B8' : '#334155'}
                    />
                    <Text
                      style={[
                        styles.pageBtnText,
                        page === 1 && styles.pageBtnTextDisabled,
                      ]}
                    >
                      Prev
                    </Text>
                  </TouchableOpacity>

                  {/* Page Indicator */}
                  <View style={styles.pageIndicatorPill}>
                    <Text style={styles.pageIndicatorText}>
                      Page {page} of {totalPages}
                    </Text>
                  </View>

                  {/* Next Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={page >= totalPages}
                    style={[
                      styles.pageBtn,
                      page >= totalPages && styles.pageBtnDisabled,
                    ]}
                    onPress={goToNextPage}
                  >
                    <Text
                      style={[
                        styles.pageBtnText,
                        page >= totalPages && styles.pageBtnTextDisabled,
                      ]}
                    >
                      Next
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={page >= totalPages ? '#94A3B8' : '#0F172A'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          }
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  backBtn: {
    marginRight: spacing.md,
    padding: 4,
  },
  headerTitle: {
    ...typography.headlineMd,
    color: '#0F172A',
    fontWeight: '800',
    letterSpacing: -0.5,
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
    ...typography.bodySm,
    color: '#64748B',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  companyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarText: {
    ...typography.titleLg,
    color: '#334155',
    fontWeight: '800',
  },
  companyName: {
    ...typography.titleMd,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 16,
  },
  tradeName: {
    ...typography.bodySm,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    ...typography.labelSm,
    color: '#059669',
    fontWeight: '800',
    fontSize: 9,
    marginLeft: 2,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  metaBox: {
    flex: 1,
    alignItems: 'flex-start',
  },
  metaBoxRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  verticalDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E2E8F0',
    marginHorizontal: spacing.sm,
  },
  metaLabel: {
    ...typography.labelCaps,
    color: '#94A3B8',
    fontSize: 9,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  metaValMono: {
    ...typography.monoSm,
    color: '#334155',
    fontWeight: '700',
    fontSize: 11,
  },
  metaVal: {
    ...typography.bodySm,
    color: '#334155',
    fontWeight: '600',
    fontSize: 11,
  },
  metaValBold: {
    ...typography.titleMd,
    color: '#0D9488',
    fontWeight: '800',
    fontSize: 14,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A', // Navy Blue Button
    paddingVertical: 12,
    borderRadius: 10,
  },
  ctaText: {
    ...typography.labelMd,
    color: '#FFFFFF',
    fontWeight: '700',
    marginRight: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.headlineSm,
    color: '#0F172A',
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    ...typography.bodyMd,
    color: '#64748B',
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    lineHeight: 22,
  },
  onboardNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488', // Teal
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  onboardNowBtnText: {
    ...typography.labelLg,
    color: '#FFFFFF',
    fontWeight: '700',
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
});

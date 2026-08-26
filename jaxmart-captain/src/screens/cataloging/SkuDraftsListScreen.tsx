// src/screens/cataloging/SkuDraftsListScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useSkuWizardStore } from '../../store/useSkuWizardStore';
import { listingApi } from '../../api/listingApi';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';

interface SkuDraftsListScreenProps {
  navigation: any;
}

export const SkuDraftsListScreen: React.FC<SkuDraftsListScreenProps> = ({ navigation }) => {
  const { startNewWizard } = useSkuWizardStore();
  const [skus, setSkus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSkus, setTotalSkus] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debounced search logic could be added, but for simplicity we'll fetch on button press or blur

  const fetchSkus = async (pageNumber = 1, searchStr = searchQuery) => {
    try {
      setLoading(true);
      const res = await listingApi.getCaptainListings({ page: pageNumber, limit: 10, search: searchStr });
      
      if (res && res.success) {
        setSkus(res.listings || []);
        setTotalSkus(res.total || 0);
        setTotalPages(res.totalPages || 1);
        setPage(pageNumber);
      }
    } catch (err) {
      console.error('Failed to fetch SKUs', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSkus(1, '');
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSkus(1, searchQuery);
  };

  const handleSearchSubmit = () => {
    fetchSkus(1, searchQuery);
  };

  const handleStartNew = () => {
    startNewWizard();
    navigation.navigate('CompanySelect');
  };

  const goToNextPage = () => {
    if (page < totalPages) fetchSkus(page + 1);
  };

  const goToPrevPage = () => {
    if (page > 1) fetchSkus(page - 1);
  };

  const renderSkuItem = ({ item }: { item: any }) => (
    <AppCard style={styles.skuCard}>
      <View style={styles.cardHeader}>
        <View style={styles.imageContainer}>
          {item.media && item.media.length > 0 ? (
            <Image source={{ uri: item.media[0].url }} style={styles.skuImage} />
          ) : (
            <Ionicons name="image-outline" size={24} color={colors.textPlaceholder} />
          )}
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={styles.skuTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.merchantName} numberOfLines={1}>
            <Ionicons name="storefront-outline" size={12} color={colors.textSecondary} />{' '}
            {item.seller?.businessProfile?.businessName || item.seller?.fullName || 'General Merchant'}
          </Text>
        </View>
        <View style={[styles.statusBadge, item.status === 'ACTIVE' ? styles.statusActive : styles.statusDraft]}>
          <View style={[styles.statusDot, item.status === 'ACTIVE' ? { backgroundColor: '#059669' } : { backgroundColor: '#D97706' }]} />
          <Text style={[styles.statusText, item.status === 'ACTIVE' ? { color: '#059669' } : { color: '#D97706' }]}>
            {item.status || 'ACTIVE'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metaRow}>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>SKU Code</Text>
          <Text style={styles.metaValMono}>{item.productDetail?.sku || 'N/A'}</Text>
        </View>
        <View style={styles.metaColCenter}>
          <Text style={styles.metaLabel}>Category</Text>
          <Text style={styles.metaVal} numberOfLines={1}>{item.category?.name || 'General'}</Text>
        </View>
        <View style={styles.metaColRight}>
          <Text style={styles.metaLabel}>Price</Text>
          <Text style={styles.metaValPrice}>₹{item.productDetail?.pricePerUnit || item.productDetail?.mrp || 0}</Text>
        </View>
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header matching Merchant Directory */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Cataloged SKUs</Text>
          <View style={styles.subtitleRow}>
            <View style={styles.activeDot} />
            <Text style={styles.headerSubtitle}>
              {totalSkus} Total Items
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.onboardHeaderBtn} onPress={handleStartNew} activeOpacity={0.85}>
          <Ionicons name="add" size={15} color="#FFFFFF" style={{ marginRight: 5 }} />
          <Text style={styles.onboardHeaderBtnText}>New SKU</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Search Input matching Merchant Directory */}
        <AppInput
          placeholder="Search SKUs by title or code..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon="search-outline"
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          containerStyle={{ marginBottom: spacing.sm }}
        />

        {loading && page === 1 ? (
          <View style={styles.loaderCenter}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={skus}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={renderSkuItem}
            contentContainerStyle={{ paddingBottom: spacing.xxl, paddingTop: spacing.xs }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="cube-outline" size={32} color={colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>No SKUs Found</Text>
                <Text style={styles.emptySubtitle}>
                  You haven't cataloged any SKUs yet. Tap "New SKU" to begin cataloging for merchants.
                </Text>
                <TouchableOpacity style={styles.emptyCta} onPress={handleStartNew}>
                  <Text style={styles.emptyCtaText}>Create First SKU</Text>
                </TouchableOpacity>
              </View>
            }
            ListFooterComponent={
              totalSkus > 0 ? (
                <View style={styles.paginationContainer}>
                  <Text style={styles.paginationRangeText}>
                    Showing {(page - 1) * 10 + 1}-{Math.min(page * 10, totalSkus)} of {totalSkus} SKUs
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
        )}
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
    borderBottomColor: colors.outlineVariant,
    zIndex: 10,
    ...shadows.card,
  },
  headerTitle: {
    ...typography.headlineMd,
    color: colors.primaryDark,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
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
  onboardHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  onboardHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  loaderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  skuImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  skuTitle: {
    ...typography.titleMd,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 15,
    lineHeight: 20,
  },
  merchantName: {
    ...typography.bodySm,
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusDraft: {
    backgroundColor: '#FEF3C7',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    ...typography.labelSm,
    fontWeight: '800',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: 10,
  },
  metaCol: {
    flex: 1,
    alignItems: 'flex-start',
  },
  metaColCenter: {
    flex: 1,
    alignItems: 'center',
  },
  metaColRight: {
    flex: 1,
    alignItems: 'flex-end',
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
    fontSize: 12,
  },
  metaVal: {
    ...typography.bodySm,
    color: '#334155',
    fontWeight: '600',
    fontSize: 12,
  },
  metaValPrice: {
    ...typography.titleMd,
    color: '#0D9488',
    fontWeight: '800',
    fontSize: 15,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.headlineSm,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  emptySubtitle: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    lineHeight: 22,
  },
  emptyCta: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    ...shadows.card,
  },
  emptyCtaText: {
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

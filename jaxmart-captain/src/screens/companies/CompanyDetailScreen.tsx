// src/screens/companies/CompanyDetailScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useCompanyStore } from '../../store/useCompanyStore';
import { useSkuWizardStore } from '../../store/useSkuWizardStore';
import { useCatalogStore } from '../../store/useCatalogStore';
import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { StatusBadge } from '../../components/common/StatusBadge';

interface CompanyDetailScreenProps {
  route: any;
  navigation: any;
}

export const CompanyDetailScreen: React.FC<CompanyDetailScreenProps> = ({ route, navigation }) => {
  const { savedCompanies, activeCompany, setActiveCompany } = useCompanyStore();
  const { setCompanyContext, resetWizard } = useSkuWizardStore();
  const catalog = useCatalogStore((s) => s.catalog);

  const companyId = route.params?.companyId || activeCompany?.id;
  const company = savedCompanies.find((c) => c.id === companyId) || activeCompany;

  const [activeTab, setActiveTab] = useState<'profile' | 'catalog'>('profile');

  const catalogItems = catalog.filter((item) =>
    (companyId && item.companyId === companyId) ||
    (company && item.companyId === company.id) ||
    (company && item.companyName && item.companyName.toLowerCase() === company.legalName.toLowerCase())
  );
  const displayCatalog = catalogItems.length > 0 ? catalogItems : company?.skuCount && company.skuCount > 0 ? [
    {
      id: 'demo_sku',
      sku: 'JAX-SKU-94021',
      title: 'High Tensile Hex Bolt Grade 8.8 (M12 x 50mm)',
      categoryName: company.category || 'Industrial Fasteners',
      hsnCode: '73181500',
      b2bPrice: 18.50,
      minOrderQty: 100,
      unitOfMeasure: 'pcs',
      stockQuantity: 500,
      status: 'PENDING' as const,
    }
  ] : [];

  if (!company) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Company details not found.</Text>
          <AppButton title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const handleStartSkuForCompany = () => {
    resetWizard();
    setActiveCompany(company);
    setCompanyContext(company.id, company.legalName);
    navigation.navigate('SkuWizardTab', {
      screen: 'Step1BasicProduct',
      params: { companyId: company.id, companyName: company.legalName },
    });
  };

  const handleCallOwner = () => {
    if (company.phone) {
      Linking.openURL(`tel:${company.phone}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{company.legalName}</Text>
          <Text style={styles.headerSubtitle}>{company.city}, {company.state}</Text>
        </View>
        <StatusBadge status={company.kycStatus} size="sm" />
      </View>

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'profile' && styles.tabBtnActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons
            name="business"
            size={16}
            color={activeTab === 'profile' ? colors.primary : colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabBtnText, activeTab === 'profile' && styles.tabBtnTextActive]}>
            Merchant Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'catalog' && styles.tabBtnActive]}
          onPress={() => setActiveTab('catalog')}
        >
          <Ionicons
            name="cube"
            size={16}
            color={activeTab === 'catalog' ? colors.primary : colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabBtnText, activeTab === 'catalog' && styles.tabBtnTextActive]}>
            SKU Catalog ({displayCatalog.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'profile' ? (
          <>
            {/* Storefront Image */}
            {company.storefrontImage && (
              <View style={styles.storefrontImageBox}>
                <Image source={{ uri: company.storefrontImage }} style={styles.storefrontImg} resizeMode="cover" />
                <View style={styles.storefrontBadge}>
                  <Ionicons name="location" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.storefrontBadgeText}>Verified Physical Store</Text>
                </View>
              </View>
            )}

            {/* Quick Actions Bar */}
            <View style={styles.quickActionsBar}>
              <TouchableOpacity style={styles.quickActionBtn} onPress={handleCallOwner}>
                <Ionicons name="call" size={18} color={colors.primary} />
                <Text style={styles.quickActionLabel}>Call Merchant</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionBtn} onPress={handleStartSkuForCompany}>
                <Ionicons name="add-circle" size={18} color={colors.secondary} />
                <Text style={[styles.quickActionLabel, { color: colors.secondary }]}>Add SKU</Text>
              </TouchableOpacity>
            </View>

            {/* Identity & Legal Info Card */}
            <AppCard style={styles.infoCard}>
              <Text style={styles.cardSectionTitle}>Business & Tax Identifiers</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Trade Display Name</Text>
                <Text style={styles.infoVal}>{company.tradeName || company.legalName}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>GSTIN Number</Text>
                <Text style={styles.infoValMono}>{company.gstin || 'Unregistered'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>PAN Number</Text>
                <Text style={styles.infoValMono}>{company.pan || 'N/A'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Primary Category</Text>
                <Text style={styles.infoVal}>{company.category || 'General Industrial'}</Text>
              </View>
            </AppCard>

            {/* Contact & Location Card */}
            <AppCard style={styles.infoCard}>
              <Text style={styles.cardSectionTitle}>Contact & Location</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Owner / Contact Person</Text>
                <Text style={styles.infoVal}>{company.ownerName}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Mobile Number</Text>
                <Text style={styles.infoVal}>+91 {company.phone}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Email Address</Text>
                <Text style={styles.infoVal}>{company.email || 'N/A'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Registered Location</Text>
                <Text style={styles.infoVal}>{company.city}, {company.state} - {company.pincode}</Text>
              </View>
            </AppCard>
          </>
        ) : (
          /* Catalog Tab */
          <View style={styles.catalogContainer}>
            <View style={styles.catalogHeaderRow}>
              <Text style={styles.catalogTitle}>Cataloged Products</Text>
              <TouchableOpacity
                style={styles.addSkuSmallBtn}
                onPress={handleStartSkuForCompany}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.addSkuSmallBtnText}>Catalog SKU</Text>
              </TouchableOpacity>
            </View>

            {displayCatalog.length === 0 ? (
              <View style={styles.emptyCatalogBox}>
                <Ionicons name="cube-outline" size={48} color={colors.textPlaceholder} />
                <Text style={styles.emptyCatalogTitle}>No SKUs Cataloged Yet</Text>
                <Text style={styles.emptyCatalogSubtitle}>
                  Add the merchant's first product SKU using the 8-step cataloging wizard.
                </Text>
                <AppButton
                  title={`+ Catalog First SKU for ${company.tradeName || 'this Merchant'}`}
                  variant="primary"
                  onPress={handleStartSkuForCompany}
                  style={{ marginTop: spacing.md }}
                />
              </View>
            ) : (
              <View style={styles.catalogItemsList}>
                {displayCatalog.map((item) => (
                  <AppCard key={item.id} style={styles.skuItemCard}>
                    <View style={styles.skuHeader}>
                      <View style={{ flex: 1, marginRight: spacing.sm }}>
                        <Text style={styles.skuTitle}>{item.title}</Text>
                        {Boolean(item.categoryName) && (
                          <Text style={styles.categoryPillText}>Category: {item.categoryName}</Text>
                        )}
                      </View>
                      <StatusBadge status={item.status || 'PENDING'} label={item.status === 'ACTIVE' ? 'Active' : 'Under Review'} size="sm" />
                    </View>
                    <Text style={styles.skuSubtitle}>SKU: {item.sku} · HSN: {item.hsnCode}</Text>
                    <View style={styles.skuPriceRow}>
                      <Text style={styles.skuPrice}>
                        ₹{item.b2bPrice ? item.b2bPrice.toFixed(2) : '18.50'}{' '}
                        <Text style={styles.skuMoq}>/ {item.unitOfMeasure || 'pcs'} (MOQ: {item.minOrderQty || 1})</Text>
                      </Text>
                      <Text style={styles.skuStock}>Stock: {item.stockQuantity || 100} {item.unitOfMeasure || 'pcs'}</Text>
                    </View>
                  </AppCard>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Add SKU CTA */}
      <View style={styles.footerCtaBox}>
        <AppButton
          title={`+ Catalog New SKU for ${company.tradeName || 'this Company'}`}
          variant="secondary"
          icon="add-circle"
          onPress={handleStartSkuForCompany}
          fullWidth
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
    fontSize: 16,
  },
  headerSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: colors.primary,
  },
  tabBtnText: {
    ...typography.labelMd,
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  storefrontImageBox: {
    height: 180,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    position: 'relative',
  },
  storefrontImg: {
    width: '100%',
    height: '100%',
  },
  storefrontBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 19, 88, 0.75)',
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  storefrontBadgeText: {
    ...typography.labelCaps,
    color: '#FFFFFF',
    fontSize: 10,
  },
  quickActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  quickActionLabel: {
    ...typography.labelMd,
    color: colors.primaryDark,
    fontWeight: '700',
    marginLeft: 6,
  },
  infoCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardSectionTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoKey: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  infoVal: {
    ...typography.bodySm,
    color: colors.textPrimary,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  infoValMono: {
    ...typography.monoSm,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  catalogContainer: {
    flex: 1,
  },
  catalogHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  catalogTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  addSkuSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.sm,
  },
  addSkuSmallBtnText: {
    ...typography.labelCaps,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 2,
  },
  emptyCatalogBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  emptyCatalogTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  emptyCatalogSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  catalogItemsList: {
    marginTop: spacing.xs,
  },
  skuItemCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  skuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  skuTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
    marginRight: spacing.sm,
  },
  skuSubtitle: {
    ...typography.monoSm,
    color: colors.textSecondary,
    fontSize: 11,
    marginVertical: 4,
  },
  skuPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  skuPrice: {
    ...typography.headlineMd,
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 16,
  },
  skuMoq: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '400',
  },
  skuStock: {
    ...typography.labelCaps,
    color: colors.secondary,
    fontWeight: '700',
  },
  footerCtaBox: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  notFoundText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});

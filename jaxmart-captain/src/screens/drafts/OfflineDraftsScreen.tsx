// src/screens/drafts/OfflineDraftsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useSellerWizardStore } from '../../store/useSellerWizardStore';
import { useSkuWizardStore } from '../../store/useSkuWizardStore';
import { AppCard } from '../../components/common/AppCard';

interface OfflineDraftsScreenProps {
  navigation: any;
}

export const OfflineDraftsScreen: React.FC<OfflineDraftsScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'seller' | 'sku'>('seller');

  const { drafts: sellerDrafts, loadDraft: loadSellerDraft, deleteDraft: deleteSellerDraft } = useSellerWizardStore();
  const { drafts: skuDrafts, loadDraft: loadSkuDraft, deleteDraft: deleteSkuDraft } = useSkuWizardStore();

  const handleResumeSeller = async (draftId: string) => {
    await loadSellerDraft(draftId);
    navigation.navigate('SellerWizardTab', { screen: 'Step1BasicProfile' });
  };

  const handleResumeSku = async (draftId: string) => {
    await loadSkuDraft(draftId);
    navigation.navigate('SkuWizardTab', { screen: 'Step1BasicProduct' });
  };

  const handleDeleteSeller = (draftId: string) => {
    Alert.alert('Delete Draft', 'Are you sure you want to discard this onboarding draft?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSellerDraft(draftId) },
    ]);
  };

  const handleDeleteSku = (draftId: string) => {
    Alert.alert('Delete Draft', 'Are you sure you want to discard this SKU draft?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSkuDraft(draftId) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Offline Saved Drafts</Text>
          <Text style={styles.headerSubtitle}>Resume incomplete on-site onboarding or SKU cataloging</Text>
        </View>
      </View>

      {/* Segmented Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'seller' && styles.tabBtnActive]}
          onPress={() => setActiveTab('seller')}
        >
          <Ionicons
            name="business"
            size={16}
            color={activeTab === 'seller' ? colors.primary : colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabBtnText, activeTab === 'seller' && styles.tabBtnTextActive]}>
            Seller Drafts ({sellerDrafts.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'sku' && styles.tabBtnActive]}
          onPress={() => setActiveTab('sku')}
        >
          <Ionicons
            name="cube"
            size={16}
            color={activeTab === 'sku' ? colors.primary : colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabBtnText, activeTab === 'sku' && styles.tabBtnTextActive]}>
            SKU Drafts ({skuDrafts.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'seller' ? (
          <FlatList
            data={sellerDrafts}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <AppCard style={styles.draftCard} onPress={() => handleResumeSeller(item.id)}>
                <View style={styles.draftCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.draftTitle}>{item.step1?.legalBusinessName || 'Untitled Merchant'}</Text>
                    <Text style={styles.draftSubtitle}>
                      {item.step1?.tradeName ? `${item.step1.tradeName} · ` : ''}
                      Step {item.step || 1} of 7
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteSeller(item.id)} style={styles.deleteTouch}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.draftFooterRow}>
                  <Text style={styles.draftDateText}>Saved on {new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleDateString()}</Text>
                  <View style={styles.resumeRow}>
                    <Text style={styles.resumeText}>Resume Wizard</Text>
                    <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                  </View>
                </View>
              </AppCard>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="documents-outline" size={48} color={colors.textPlaceholder} />
                <Text style={styles.emptyTitle}>No Saved Seller Drafts</Text>
                <Text style={styles.emptySubtitle}>All merchant onboarding entries are submitted or none started.</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={skuDrafts}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <AppCard style={styles.draftCard} onPress={() => handleResumeSku(item.id)}>
                <View style={styles.draftCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.draftTitle}>{item.step1?.title || 'Untitled Product SKU'}</Text>
                    <Text style={styles.draftSubtitle}>
                      Company: {item.step1?.companyName || 'General Merchant'} · Step {item.step || 1} of 8
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteSku(item.id)} style={styles.deleteTouch}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.draftFooterRow}>
                  <Text style={styles.draftDateText}>Saved on {new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleDateString()}</Text>
                  <View style={styles.resumeRow}>
                    <Text style={styles.resumeText}>Resume Wizard</Text>
                    <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                  </View>
                </View>
              </AppCard>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={48} color={colors.textPlaceholder} />
                <Text style={styles.emptyTitle}>No Saved SKU Drafts</Text>
                <Text style={styles.emptySubtitle}>All cataloged SKUs have been submitted to the review queue.</Text>
              </View>
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
    backgroundColor: colors.background,
  },
  header: {
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
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  draftCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  draftCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  draftTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 15,
  },
  draftSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  deleteTouch: {
    padding: 4,
    marginLeft: spacing.sm,
  },
  draftFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  draftDateText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 11,
  },
  resumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumeText: {
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
  },
});

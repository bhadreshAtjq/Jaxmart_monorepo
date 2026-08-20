// src/screens/cataloging/SkuDraftsListScreen.tsx
import React from 'react';
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
import { spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useSkuWizardStore } from '../../store/useSkuWizardStore';
import { AppCard } from '../../components/common/AppCard';

interface SkuDraftsListScreenProps {
  navigation: any;
}

export const SkuDraftsListScreen: React.FC<SkuDraftsListScreenProps> = ({ navigation }) => {
  const { drafts, loadDraft, deleteDraft, startNewWizard } = useSkuWizardStore();

  const handleResumeDraft = async (draftId: string) => {
    await loadDraft(draftId);
    navigation.navigate('Step1BasicProduct');
  };

  const handleStartNew = () => {
    startNewWizard();
    navigation.navigate('CompanySelect');
  };

  const handleDelete = (draftId: string) => {
    Alert.alert('Delete Draft', 'Are you sure you want to discard this SKU draft?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteDraft(draftId) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>SKU Cataloging Drafts</Text>
          <Text style={styles.headerSubtitle}>Resume unfinished product listings</Text>
        </View>

        <TouchableOpacity style={styles.newDraftBtn} onPress={handleStartNew}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.newDraftBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <FlatList
          data={drafts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <AppCard style={styles.draftCard} onPress={() => handleResumeDraft(item.id)}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.draftTitle}>{item.step1?.title || 'Untitled SKU'}</Text>
                  <Text style={styles.draftSubtitle}>
                    Company: {item.step1?.companyName || 'General Merchant'} · Step {item.step || 1} of 8
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteTouch}>
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.dateText}>
                  Saved {new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleDateString()}
                </Text>
                <View style={styles.resumeRow}>
                  <Text style={styles.resumeText}>Resume Step {item.step || 1}</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                </View>
              </View>
            </AppCard>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={48} color={colors.textPlaceholder} />
              <Text style={styles.emptyTitle}>No Pending SKU Drafts</Text>
              <Text style={styles.emptySubtitle}>
                Tap "+ New" to select a merchant and catalog new product SKUs.
              </Text>
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
  newDraftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  newDraftBtnText: {
    ...typography.labelMd,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 2,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  draftCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dateText: {
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

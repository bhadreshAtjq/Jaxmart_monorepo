// src/screens/drafts/SyncManagerScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useOfflineSyncStore, SyncQueueItem } from '../../store/useOfflineSyncStore';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { AppCard } from '../../components/common/AppCard';

interface SyncManagerScreenProps {
  navigation: any;
}

export const SyncManagerScreen: React.FC<SyncManagerScreenProps> = ({ navigation }) => {
  const { queue, isSyncing, processQueue, removeFromQueue, retryItem, clearCompleted } = useOfflineSyncStore();
  const { isOnline, connectionType } = useNetworkStatus();

  const pendingCount = queue.filter((i) => i.status === 'PENDING' || i.status === 'ERROR').length;
  const completedCount = queue.filter((i) => i.status === 'COMPLETED').length;

  const handleSyncAll = () => {
    if (!isOnline) {
      Alert.alert('Device Offline', 'Please connect to Wi-Fi or Cellular Data to synchronize records.');
      return;
    }
    processQueue();
  };

  const renderQueueItem = ({ item }: { item: SyncQueueItem }) => {
    const isError = item.status === 'ERROR';
    const isCompleted = item.status === 'COMPLETED';
    const isItemSyncing = item.status === 'SYNCING';

    return (
      <AppCard style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemTypeBadge}>
            <Ionicons
              name={item.type === 'SELLER_ONBOARDING' ? 'business' : 'cube'}
              size={14}
              color={colors.primary}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.itemTypeText}>
              {item.type === 'SELLER_ONBOARDING' ? 'Seller KYC' : 'SKU Submission'}
            </Text>
          </View>

          {/* Status Indicator */}
          <View
            style={[
              styles.statusChip,
              isCompleted && styles.statusChipSuccess,
              isError && styles.statusChipError,
              isItemSyncing && styles.statusChipSyncing,
            ]}
          >
            {isItemSyncing ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 4 }} />
            ) : null}
            <Text
              style={[
                styles.statusText,
                isCompleted && styles.statusTextSuccess,
                isError && styles.statusTextError,
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>

        {isError && (
          <View style={styles.errorBox}>
            <Ionicons name="warning" size={14} color={colors.error} style={{ marginRight: 4 }} />
            <Text style={styles.errorBoxText}>{item.lastError || item.errorMessage || 'Network dispatch failed'}</Text>
          </View>
        )}

        <View style={styles.itemFooter}>
          <Text style={styles.timestampText}>
            {item.syncedAt
              ? `Synced ${new Date(item.syncedAt).toLocaleTimeString()}`
              : `Queued ${new Date(item.createdAt).toLocaleTimeString()}`}
          </Text>

          <View style={styles.itemActions}>
            {isError && (
              <TouchableOpacity onPress={() => retryItem(item.id)} style={styles.retryBtn}>
                <Ionicons name="refresh" size={14} color={colors.primary} style={{ marginRight: 2 }} />
                <Text style={styles.retryBtnText}>Retry ({item.retryCount || item.attempts || 0})</Text>
              </TouchableOpacity>
            )}

            {!isItemSyncing && (
              <TouchableOpacity onPress={() => removeFromQueue(item.id)} style={styles.removeTouch}>
                <Ionicons name="trash-outline" size={16} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </AppCard>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Offline Sync Manager</Text>
          <Text style={styles.headerSubtitle}>FIFO queue of on-ground uploads & API sync</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Network Connectivity Card */}
        <View style={[styles.networkCard, isOnline ? styles.networkOnline : styles.networkOffline]}>
          <View style={styles.networkLeft}>
            <Ionicons
              name={isOnline ? 'cloud-done' : 'cloud-offline'}
              size={24}
              color={isOnline ? colors.secondary : colors.error}
            />
            <View style={{ marginLeft: spacing.sm }}>
              <Text style={styles.networkTitle}>
                {isOnline ? `Online (${connectionType.toUpperCase()})` : 'Device is Offline'}
              </Text>
              <Text style={styles.networkSubtitle}>
                {isOnline ? 'Auto-sync active · Real-time pipeline connected' : 'Changes safely stored on device storage'}
              </Text>
            </View>
          </View>

          {isOnline && pendingCount > 0 && (
            <TouchableOpacity
              style={styles.syncNowBtn}
              onPress={handleSyncAll}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="sync" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.syncNowBtnText}>Sync All</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending Sync</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: colors.secondary }]}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          {completedCount > 0 && (
            <TouchableOpacity style={styles.clearCompletedBtn} onPress={clearCompleted}>
              <Text style={styles.clearCompletedText}>Clear Completed</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Queue List */}
        <FlatList
          data={queue}
          keyExtractor={(item) => item.id}
          renderItem={renderQueueItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={56} color={colors.secondary} />
              <Text style={styles.emptyTitle}>All Records Synchronized</Text>
              <Text style={styles.emptySubtitle}>
                Your local submissions are up to date with the Jaxmart backend database.
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
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  networkCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  networkOnline: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  networkOffline: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  networkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  networkTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
  networkSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 11,
  },
  syncNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  syncNowBtnText: {
    ...typography.labelMd,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statBox: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statVal: {
    ...typography.headlineMd,
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 16,
  },
  statLabel: {
    ...typography.labelCaps,
    color: colors.textSecondary,
    fontSize: 9,
  },
  clearCompletedBtn: {
    marginLeft: 'auto',
    padding: spacing.xs,
  },
  clearCompletedText: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  itemCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryFixed,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.xs,
  },
  itemTypeText: {
    ...typography.labelCaps,
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '700',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  statusChipSuccess: {
    backgroundColor: colors.secondaryContainer,
  },
  statusChipError: {
    backgroundColor: '#FEE2E2',
  },
  statusChipSyncing: {
    backgroundColor: colors.primaryFixed,
  },
  statusText: {
    ...typography.labelCaps,
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
  },
  statusTextSuccess: {
    color: colors.onSecondaryContainer,
  },
  statusTextError: {
    color: colors.error,
  },
  itemTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 14,
    marginTop: 2,
  },
  itemSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: spacing.xs,
    borderRadius: borderRadius.xs,
    marginTop: spacing.xs,
  },
  errorBoxText: {
    ...typography.bodySm,
    color: colors.error,
    fontSize: 10,
    flex: 1,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timestampText: {
    ...typography.bodySm,
    color: colors.textPlaceholder,
    fontSize: 10,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: spacing.xs + 2,
    backgroundColor: colors.primaryFixed,
    borderRadius: borderRadius.xs,
    marginRight: spacing.sm,
  },
  retryBtnText: {
    ...typography.labelCaps,
    color: colors.primaryDark,
    fontSize: 9,
    fontWeight: '700',
  },
  removeTouch: {
    padding: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.headlineMd,
    color: colors.primaryDark,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  emptySubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
});

// src/screens/dashboard/ShiftHistoryScreen.tsx
import React from 'react';
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
import { borderRadius, spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useShiftStore, ShiftRecord } from '../../store/useShiftStore';
import { formatDurationSeconds } from '../../utils/formatters';
import { AppCard } from '../../components/common/AppCard';

interface ShiftHistoryScreenProps {
  navigation: any;
}

export const ShiftHistoryScreen: React.FC<ShiftHistoryScreenProps> = ({ navigation }) => {
  const history = useShiftStore((s) => s.history);

  const renderShiftItem = ({ item }: { item: ShiftRecord }) => {
    const startDate = new Date(item.startTime);
    const endDate = item.endTime ? new Date(item.endTime) : null;

    return (
      <AppCard style={styles.shiftCard}>
        <View style={styles.cardHeader}>
          <View style={styles.dateBadge}>
            <Ionicons name="calendar-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.dateText}>{startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          </View>

          <View style={styles.durationBadge}>
            <Ionicons name="time" size={14} color={colors.secondary} style={{ marginRight: 4 }} />
            <Text style={styles.durationText}>{formatDurationSeconds(item.durationSeconds)}</Text>
          </View>
        </View>

        <View style={styles.timeRangeRow}>
          <Text style={styles.timeLabel}>Clocked In: <Text style={styles.timeVal}>{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text></Text>
          <Text style={styles.timeLabel}>Clocked Out: <Text style={styles.timeVal}>{endDate ? endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In Progress'}</Text></Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricVal}>{item.sellersOnboardedCount}</Text>
            <Text style={styles.metricLabel}>Sellers</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={[styles.metricVal, { color: colors.secondary }]}>{item.skusCatalogedCount}</Text>
            <Text style={styles.metricLabel}>SKUs</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.locationVal} numberOfLines={1}>
              {item.startLocation?.city || 'GPS Locked'}
            </Text>
            <Text style={styles.metricLabel}>Territory</Text>
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
          <Text style={styles.headerTitle}>Shift Attendance History</Text>
          <Text style={styles.headerSubtitle}>Verified on-ground shifts & attendance timestamps</Text>
        </View>
      </View>

      <View style={styles.content}>
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderShiftItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={colors.textPlaceholder} />
              <Text style={styles.emptyTitle}>No Completed Shifts</Text>
              <Text style={styles.emptySubtitle}>
                Completed shifts and field metrics will be logged here.
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
  shiftCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 14,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  durationText: {
    ...typography.monoSm,
    color: colors.secondary,
    fontWeight: '700',
  },
  timeRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  timeLabel: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 11,
  },
  timeVal: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    ...typography.headlineMd,
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 16,
  },
  locationVal: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 12,
  },
  metricLabel: {
    ...typography.labelCaps,
    color: colors.textSecondary,
    fontSize: 9,
    marginTop: 2,
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

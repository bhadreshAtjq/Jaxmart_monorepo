// src/screens/profile/ProfileScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, elevation } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { useShiftStore } from '../../store/useShiftStore';
import { useCompanyStore } from '../../store/useCompanyStore';
import { useOfflineSyncStore } from '../../store/useOfflineSyncStore';
import { useSellerWizardStore } from '../../store/useSellerWizardStore';
import { useSkuWizardStore } from '../../store/useSkuWizardStore';
import { AppCard } from '../../components/common/AppCard';
import { showM3Alert } from '../../store/useAlertStore';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { history } = useShiftStore();
  const { savedCompanies } = useCompanyStore();
  const { queue } = useOfflineSyncStore();
  const sellerDrafts = useSellerWizardStore((s) => s.drafts);
  const skuDrafts = useSkuWizardStore((s) => s.drafts);

  const pendingSyncCount = queue.filter((i) => i.status === 'PENDING' || i.status === 'ERROR').length;
  const totalDraftsCount = (sellerDrafts?.length || 0) + (skuDrafts?.length || 0);

  const handleLogout = () => {
    showM3Alert(
      'Sign Out Confirmation',
      'Are you sure you want to sign out from Jaxmart Captains?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
      ],
      'warning'
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return 'FC';
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Captain Profile & Ops</Text>
          <Text style={styles.headerSubtitle}>Field credentials, offline sync & attendance</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('SettingsScreen')}
          style={styles.settingsTouch}
        >
          <Ionicons name="settings-outline" size={22} color={colors.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Identity Card */}
        <AppCard variant="outlined" style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{getInitials(user?.fullName)}</Text>
          </View>

          <Text style={styles.profileName}>{user?.fullName || 'Bhadresh S.'}</Text>
          <Text style={styles.profileRole}>Field Operations Captain & Cataloging Lead</Text>

          <View style={styles.badgeRow}>
            <View style={styles.employeeBadge}>
              <Text style={styles.employeeBadgeText}>{user?.employeeId || 'CAPT-849201'}</Text>
            </View>
            <Text style={styles.territoryPill}>{user?.territory || 'Mumbai Industrial Hub'}</Text>
          </View>

          <View style={styles.contactDetailsBox}>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={15} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.contactItemText}>+91 {user?.phone || '9820198201'}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={15} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.contactItemText}>{user?.email || 'captain@jaxmart.in'}</Text>
            </View>
          </View>
        </AppCard>

        {/* Lifetime Performance Metric Strip */}
        <Text style={styles.sectionHeader}>Lifetime Performance</Text>
        <View style={styles.metricsGrid}>
          <AppCard variant="outlined" style={styles.metricCard}>
            <Text style={styles.metricNumber}>{savedCompanies.length}</Text>
            <Text style={styles.metricLabel}>Merchants</Text>
          </AppCard>

          <AppCard variant="outlined" style={styles.metricCard}>
            <Text style={[styles.metricNumber, { color: colors.secondary }]}>
              {savedCompanies.reduce((acc: number, c: any) => acc + (c.skuCount || 0), 0)}
            </Text>
            <Text style={styles.metricLabel}>Cataloged SKUs</Text>
          </AppCard>

          <AppCard variant="outlined" style={styles.metricCard}>
            <Text style={[styles.metricNumber, { color: colors.tertiary }]}>{history.length}</Text>
            <Text style={styles.metricLabel}>Shifts</Text>
          </AppCard>
        </View>

        {/* Operations Hub Navigation List */}
        <Text style={styles.sectionHeader}>Operations & Offline Tools</Text>
        <AppCard variant="outlined" style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('OfflineDrafts')}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: colors.primaryContainer }]}>
              <Ionicons name="document-text-outline" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuItemText}>Offline Saved Drafts</Text>
              <Text style={styles.menuItemSub}>Local merchant & SKU records</Text>
            </View>
            {totalDraftsCount > 0 && (
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>{totalDraftsCount}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={16} color={colors.outline} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('SyncManager')}
          >
            <View
              style={[
                styles.menuIconCircle,
                { backgroundColor: pendingSyncCount > 0 ? colors.errorContainer : colors.secondaryContainer },
              ]}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={18}
                color={pendingSyncCount > 0 ? colors.onErrorContainer : colors.onSecondaryContainer}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuItemText}>Cloud Sync Queue</Text>
              <Text style={styles.menuItemSub}>
                {pendingSyncCount > 0 ? `${pendingSyncCount} records pending synchronization` : 'All records synced'}
              </Text>
            </View>
            {pendingSyncCount > 0 && (
              <View style={[styles.badgePill, { backgroundColor: colors.errorContainer }]}>
                <Text style={[styles.badgePillText, { color: colors.onErrorContainer }]}>
                  {pendingSyncCount}
                </Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={16} color={colors.outline} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ShiftHistory')}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: colors.surfaceContainerHigh }]}>
              <Ionicons name="calendar-outline" size={18} color={colors.onSurface} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuItemText}>Shift Attendance Logs</Text>
              <Text style={styles.menuItemSub}>GPS clock-in durations & records</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.outline} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate('SettingsScreen')}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: colors.surfaceContainerHigh }]}>
              <Ionicons name="hardware-chip-outline" size={18} color={colors.onSurface} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuItemText}>Hardware & Backend API</Text>
              <Text style={styles.menuItemSub}>Endpoint configuration & diagnostics</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.outline} />
          </TouchableOpacity>
        </AppCard>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={colors.error} style={{ marginRight: 6 }} />
          <Text style={styles.logoutButtonText}>Sign Out of Captains App</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerTitle: {
    ...typography.titleMedium,
    color: colors.onSurface,
    fontWeight: '700',
    fontSize: 16,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 1,
  },
  settingsTouch: {
    padding: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerLow,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 96,
  },
  profileCard: {
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs + 2,
  },
  avatarInitials: {
    ...typography.headlineSmall,
    color: colors.onPrimaryContainer,
    fontWeight: '800',
  },
  profileName: {
    ...typography.titleMedium,
    color: colors.onSurface,
    fontWeight: '700',
    fontSize: 18,
  },
  profileRole: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs + 2,
  },
  employeeBadge: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.extraSmall,
    marginRight: spacing.xs,
  },
  employeeBadgeText: {
    ...typography.labelSmall,
    color: colors.onSurface,
    fontWeight: '700',
    fontSize: 10,
  },
  territoryPill: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },
  contactDetailsBox: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.small,
    padding: spacing.sm,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  contactItemText: {
    ...typography.bodySmall,
    color: colors.onSurface,
    fontSize: 11.5,
  },
  sectionHeader: {
    ...typography.titleSmall,
    color: colors.onSurface,
    fontWeight: '700',
    marginBottom: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  metricCard: {
    flex: 1,
    padding: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: borderRadius.medium,
  },
  metricNumber: {
    ...typography.headlineSmall,
    color: colors.onSurface,
    fontWeight: '800',
    fontSize: 20,
  },
  metricLabel: {
    ...typography.labelSmall,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    fontSize: 10,
    marginTop: 2,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
  },
  menuItemText: {
    ...typography.titleSmall,
    color: colors.onSurface,
    fontSize: 13,
    fontWeight: '600',
  },
  menuItemSub: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 1,
  },
  badgePill: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
  },
  badgePillText: {
    ...typography.labelSmall,
    color: colors.onPrimaryContainer,
    fontWeight: '700',
    fontSize: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorContainer,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.15)',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.xl,
  },
  logoutButtonText: {
    ...typography.labelLarge,
    color: colors.onErrorContainer,
    fontWeight: '700',
    fontSize: 13,
  },
});

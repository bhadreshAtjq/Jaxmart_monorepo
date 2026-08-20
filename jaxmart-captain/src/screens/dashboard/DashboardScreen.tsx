// src/screens/dashboard/DashboardScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, elevation } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { useShiftStore } from '../../store/useShiftStore';
import { useOfflineSyncStore } from '../../store/useOfflineSyncStore';
import { useCompanyStore } from '../../store/useCompanyStore';
import { useSkuWizardStore } from '../../store/useSkuWizardStore';
import { useLocation } from '../../hooks/useLocation';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDurationSeconds } from '../../utils/formatters';
import { showM3Alert } from '../../store/useAlertStore';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const captain = useAuthStore((s) => s.user);
  const { isActive, startShift, endShift, activeShift, elapsedSeconds } = useShiftStore();
  const { queue } = useOfflineSyncStore();
  const { savedCompanies, setActiveCompany } = useCompanyStore();
  const { setCompanyContext, resetWizard } = useSkuWizardStore();
  const { getCurrentLocation, loading: locLoading } = useLocation();

  const [refreshing, setRefreshing] = useState(false);
  const [clockModalVisible, setClockModalVisible] = useState(false);
  const [clockLocation, setClockLocation] = useState<any>(null);

  const pendingSyncCount = queue.filter((i) => i.status === 'PENDING' || i.status === 'ERROR').length;
  const recentCompanies = savedCompanies.slice(0, 3);

  const handleOpenClockModal = async () => {
    setClockModalVisible(true);
    const loc = await getCurrentLocation();
    setClockLocation(loc);
  };

  const handleConfirmClockIn = () => {
    if (!clockLocation) {
      showM3Alert(
        'GPS Coordinate Required',
        'Please wait for a verified GPS coordinate lock before clocking in.',
        undefined,
        'warning'
      );
      return;
    }
    startShift(clockLocation);
    setClockModalVisible(false);
  };

  const handleConfirmClockOut = async () => {
    const loc = await getCurrentLocation();
    endShift(loc || undefined);
    setClockModalVisible(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const navigateProtected = (screenName: string, params?: any) => {
    if (!isActive) {
      showM3Alert(
        'Shift Clock-In Required',
        'You must Clock-In with verified GPS coordinates before initiating on-ground field actions.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clock In Now', onPress: handleOpenClockModal },
        ],
        'warning'
      );
      return;
    }
    navigation.navigate(screenName, params);
  };

  const handleAddSkuForMerchant = (company: any) => {
    if (!isActive) {
      navigateProtected('SkuWizardTab');
      return;
    }
    resetWizard();
    setActiveCompany(company);
    setCompanyContext(company.id, company.legalName);
    navigation.navigate('SkuWizardTab', {
      screen: 'Step1BasicProduct',
      params: { companyId: company.id, companyName: company.legalName },
    });
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
      {/* Unified Minimalist Top App Bar */}
      <View style={styles.unifiedTopBar}>
        <View style={styles.officerProfileRow}>
          <View style={styles.officerAvatar}>
            <Text style={styles.officerAvatarText}>{getInitials(captain?.fullName)}</Text>
          </View>
          <View style={{ marginLeft: spacing.sm }}>
            <Text style={styles.officerName} numberOfLines={1}>
              {captain?.fullName || 'Bhadresh S.'}
            </Text>
            <Text style={styles.officerTerritory} numberOfLines={1}>
              {captain?.territory || 'Mumbai Industrial Hub'}
            </Text>
          </View>
        </View>

        <View style={styles.topRightActions}>
          {/* Interactive Shift Pill */}
          <TouchableOpacity
            style={[
              styles.shiftTogglePill,
              isActive ? styles.shiftPillActive : styles.shiftPillInactive,
            ]}
            onPress={handleOpenClockModal}
            activeOpacity={0.8}
          >
            <View style={[styles.statusDot, isActive ? styles.dotActive : styles.dotInactive]} />
            <Text style={[styles.shiftToggleText, isActive ? styles.textActive : styles.textInactive]}>
              {isActive ? formatDurationSeconds(elapsedSeconds) : 'Clock In'}
            </Text>
          </TouchableOpacity>

          {/* Sync Icon Button */}
          <TouchableOpacity
            style={styles.syncIconButton}
            onPress={() => navigation.navigate('SyncTab')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={pendingSyncCount > 0 ? 'cloud-upload' : 'cloud-done-outline'}
              size={18}
              color={pendingSyncCount > 0 ? colors.error : colors.onSurfaceVariant}
            />
            {pendingSyncCount > 0 && <View style={styles.syncBadgeDot} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Sleek 3-Metric Horizon Bar (Lightweight, No Bulk) */}
        <View style={styles.horizonMetricBar}>
          <View style={styles.metricColumn}>
            <Text style={styles.metricNumber}>{activeShift?.sellersOnboardedCount || 0}</Text>
            <Text style={styles.metricCaption}>Merchants</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricColumn}>
            <Text style={styles.metricNumber}>{activeShift?.skusCatalogedCount || 0}</Text>
            <Text style={styles.metricCaption}>SKUs</Text>
          </View>

          <View style={styles.metricDivider} />

          <TouchableOpacity
            style={styles.metricColumn}
            onPress={() => navigation.navigate('SyncTab')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.metricNumber,
                pendingSyncCount > 0 && { color: colors.error },
              ]}
            >
              {pendingSyncCount}
            </Text>
            <Text style={styles.metricCaption}>Queue</Text>
          </TouchableOpacity>
        </View>

        {/* 2-Column Responsive Action Grid */}
        <Text style={styles.sectionHeading}>Field Operations</Text>
        <View style={styles.actionGridRow}>
          {/* Action Tile 1: Onboard Merchant */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.actionTile}
            onPress={() => navigateProtected('OnboardSellerTab', { screen: 'Step1BasicProfile' })}
          >
            <View style={[styles.actionIconBubble, { backgroundColor: colors.primaryContainer }]}>
              <Ionicons name="person-add" size={20} color={colors.primary} />
            </View>
            <Text style={styles.actionTileTitle}>Onboard Merchant</Text>
            <Text style={styles.actionTileDesc}>
              Fast-Track GST, KYC & Storefront Photos
            </Text>
            <View style={styles.actionTileFooter}>
              <Text style={styles.actionLinkText}>Start Onboarding</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </View>
          </TouchableOpacity>

          {/* Action Tile 2: Catalog SKUs */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.actionTile}
            onPress={() => navigateProtected('SkuWizardTab', { screen: 'CompanySelect' })}
          >
            <View style={[styles.actionIconBubble, { backgroundColor: colors.secondaryContainer }]}>
              <Ionicons name="barcode" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.actionTileTitle}>Catalog SKUs</Text>
            <Text style={styles.actionTileDesc}>
              Barcode OCR, Slabs & Variant Matrix
            </Text>
            <View style={styles.actionTileFooter}>
              <Text style={[styles.actionLinkText, { color: colors.secondary }]}>Scan & Add</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.secondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Merchants Section */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeaderRow}>
            <Text style={styles.sectionHeading}>Recent Merchants</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CompaniesTab')}>
              <Text style={styles.viewAllText}>View All ({savedCompanies.length})</Text>
            </TouchableOpacity>
          </View>

          {recentCompanies.length > 0 ? (
            recentCompanies.map((c) => (
              <AppCard
                key={c.id}
                variant="outlined"
                style={styles.recentItemCard}
                onPress={() => {
                  setActiveCompany(c);
                  navigation.navigate('CompaniesTab', { screen: 'CompanyDetail', params: { companyId: c.id } });
                }}
              >
                <View style={styles.recentItemHeader}>
                  <View style={{ flex: 1, marginRight: spacing.sm }}>
                    <Text style={styles.recentItemTitle} numberOfLines={1}>{c.legalName}</Text>
                    <Text style={styles.recentItemSub}>{c.city}, {c.state} · {c.skuCount} SKUs</Text>
                  </View>
                  <StatusBadge status={c.kycStatus} size="sm" />
                </View>

                <View style={styles.recentItemFooter}>
                  <Text style={styles.recentItemGstin}>{c.gstin || 'Unregistered'}</Text>
                  <TouchableOpacity
                    style={styles.addSkuQuickBtn}
                    onPress={() => handleAddSkuForMerchant(c)}
                  >
                    <Ionicons name="add" size={13} color={colors.primary} />
                    <Text style={styles.addSkuQuickText}>Add SKU</Text>
                  </TouchableOpacity>
                </View>
              </AppCard>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="business-outline" size={32} color={colors.outline} />
              <Text style={styles.emptyCardTitle}>No Merchants Onboarded Yet</Text>
              <Text style={styles.emptyCardSubtitle}>
                Tap Onboard Merchant above to register your first seller.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sleek M3 GPS Clock Modal Sheet */}
      <Modal visible={clockModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.modalHeader}>
              <View
                style={[
                  styles.modalIconWrap,
                  { backgroundColor: isActive ? colors.errorContainer : colors.secondaryContainer },
                ]}
              >
                <Ionicons
                  name={isActive ? 'exit-outline' : 'enter-outline'}
                  size={22}
                  color={isActive ? colors.onErrorContainer : colors.onSecondaryContainer}
                />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.modalTitle}>
                  {isActive ? 'Clock-Out Shift' : 'Clock-In Shift'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {isActive
                    ? 'Finalize field hours and lock attendance log'
                    : 'Locks GPS coordinates and unlocks merchant onboarding'}
                </Text>
              </View>
            </View>

            {/* GPS Telemetry Readout */}
            <View style={styles.gpsReadoutBox}>
              <Ionicons name="navigate" size={16} color={colors.secondary} style={{ marginRight: spacing.xs + 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.gpsReadoutLabel}>VERIFIED GPS TELEMETRY</Text>
                <Text style={styles.gpsReadoutVal}>
                  {clockLocation
                    ? `${clockLocation.city || 'Detected Hub'} (${clockLocation.latitude?.toFixed(4)}, ${clockLocation.longitude?.toFixed(4)})`
                    : locLoading
                    ? 'Acquiring GPS fix...'
                    : 'GPS coordinates locked'}
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <AppButton
                title={isActive ? 'Confirm Clock-Out' : 'Confirm Clock-In'}
                variant={isActive ? 'danger' : 'filled'}
                onPress={isActive ? handleConfirmClockOut : handleConfirmClockIn}
                fullWidth
                style={{ marginBottom: spacing.xs + 2 }}
              />
              <AppButton
                title="Cancel"
                variant="outlined"
                onPress={() => setClockModalVisible(false)}
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  unifiedTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  officerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  officerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  officerAvatarText: {
    ...typography.labelLarge,
    color: colors.onPrimaryContainer,
    fontWeight: '800',
    fontSize: 13,
  },
  officerName: {
    ...typography.titleSmall,
    color: colors.onSurface,
    fontWeight: '700',
    fontSize: 14,
  },
  officerTerritory: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 1,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shiftTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
  },
  shiftPillActive: {
    backgroundColor: colors.secondaryContainer,
  },
  shiftPillInactive: {
    backgroundColor: colors.warningContainer,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  dotActive: {
    backgroundColor: colors.secondary,
  },
  dotInactive: {
    backgroundColor: colors.warning,
  },
  shiftToggleText: {
    ...typography.labelSmall,
    fontSize: 11,
    fontWeight: '700',
  },
  textActive: {
    color: colors.onSecondaryContainer,
  },
  textInactive: {
    color: colors.onWarningContainer,
  },
  syncIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    position: 'relative',
  },
  syncBadgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.error,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 96,
  },
  horizonMetricBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  metricColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricDivider: {
    width: 1,
    height: '70%',
    backgroundColor: colors.outlineVariant,
    alignSelf: 'center',
  },
  metricNumber: {
    ...typography.headlineSmall,
    color: colors.onSurface,
    fontWeight: '800',
    fontSize: 20,
  },
  metricCaption: {
    ...typography.labelSmall,
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeading: {
    ...typography.titleSmall,
    color: colors.onSurface,
    fontWeight: '700',
    marginBottom: spacing.xs + 2,
  },
  actionGridRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    justifyContent: 'space-between',
    minHeight: 140,
  },
  actionIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs + 2,
  },
  actionTileTitle: {
    ...typography.titleSmall,
    color: colors.onSurface,
    fontWeight: '700',
    fontSize: 13,
  },
  actionTileDesc: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    fontSize: 10.5,
    lineHeight: 14,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  actionTileFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  actionLinkText: {
    ...typography.labelSmall,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 11,
    marginRight: 2,
  },
  recentSection: {
    marginTop: spacing.xs,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  viewAllText: {
    ...typography.labelSmall,
    color: colors.primary,
    fontWeight: '700',
  },
  recentItemCard: {
    padding: spacing.sm + 2,
    marginBottom: spacing.xs + 2,
    borderRadius: borderRadius.medium,
  },
  recentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recentItemTitle: {
    ...typography.titleSmall,
    color: colors.onSurface,
    fontWeight: '700',
    fontSize: 13,
  },
  recentItemSub: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 1,
  },
  recentItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs + 2,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerLow,
  },
  recentItemGstin: {
    ...typography.monoSmall,
    color: colors.onSurfaceVariant,
    fontSize: 10,
  },
  addSkuQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  addSkuQuickText: {
    ...typography.labelSmall,
    color: colors.onPrimaryContainer,
    fontWeight: '700',
    fontSize: 10,
    marginLeft: 2,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  emptyCardTitle: {
    ...typography.titleSmall,
    color: colors.onSurface,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  emptyCardSubtitle: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.extraLarge,
    borderTopRightRadius: borderRadius.extraLarge,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sheetHandle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.outlineVariant,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    ...typography.titleMedium,
    color: colors.onSurface,
    fontWeight: '700',
  },
  modalSubtitle: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 1,
  },
  gpsReadoutBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: borderRadius.small,
    padding: spacing.sm + 2,
    marginVertical: spacing.md,
  },
  gpsReadoutLabel: {
    ...typography.labelSmall,
    color: colors.secondary,
    fontSize: 9.5,
    fontWeight: '800',
  },
  gpsReadoutVal: {
    ...typography.bodySmall,
    color: colors.onSurface,
    fontSize: 11,
    marginTop: 1,
  },
  modalActions: {
    marginTop: spacing.xs,
  },
});

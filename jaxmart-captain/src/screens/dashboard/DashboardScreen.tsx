// src/screens/dashboard/DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';
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
  const { isActive, startShift, endShift, activeShift, elapsedSeconds, tickElapsed } = useShiftStore();
  const { queue } = useOfflineSyncStore();
  const { savedCompanies, setActiveCompany, fetchCompanies, totalCompanies, totalSkus } = useCompanyStore();
  const { setCompanyContext, resetWizard } = useSkuWizardStore();
  const { getCurrentLocation, loading: locLoading } = useLocation();

  const [refreshing, setRefreshing] = useState(false);
  const [clockModalVisible, setClockModalVisible] = useState(false);
  const [clockLocation, setClockLocation] = useState<any>(null);

  const pendingSyncCount = queue.filter((i) => i.status === 'PENDING' || i.status === 'ERROR').length;
  const recentCompanies = savedCompanies.slice(0, 3);

  // Fetch real onboarded companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Live timer interval for active shift
  useEffect(() => {
    let timer: any = null;
    if (isActive) {
      timer = setInterval(() => {
        tickElapsed();
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, tickElapsed]);

  // Auto-prompt Punch-In modal on dashboard load if not clocked in
  useEffect(() => {
    if (!isActive) {
      handleOpenClockModal();
    }
  }, []);

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
    fetchCompanies().finally(() => setRefreshing(false));
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
      {/* 🌟 Ultra-Clean Modern Header */}
      <View style={styles.topAppHeader}>
        <View style={styles.profileInfoGroup}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{getInitials(captain?.fullName)}</Text>
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.profileName} numberOfLines={1}>
              {captain?.fullName || 'Field Captain'}
            </Text>
            <View style={styles.verifiedBadgeRow}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text style={styles.verifiedBadgeText}>Field Officer</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={[styles.statusBadgePill, isActive ? styles.badgeActive : styles.badgeInactive]}
            onPress={handleOpenClockModal}
            activeOpacity={0.8}
          >
            <View style={[styles.pulseDot, isActive ? styles.dotGreen : styles.dotAmber]} />
            <Text style={[styles.statusBadgeText, isActive ? styles.textGreen : styles.textAmber]}>
              {isActive ? 'Active' : 'Off Duty'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.syncIconButton}
            onPress={() => navigation.navigate('SyncManager')}
            activeOpacity={0.75}
          >
            <Ionicons
              name={pendingSyncCount > 0 ? 'cloud-upload' : 'cloud-done-outline'}
              size={18}
              color={pendingSyncCount > 0 ? '#EF4444' : '#64748B'}
            />
            {pendingSyncCount > 0 && <View style={styles.syncBadgeDot} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E293B" />}
      >
        {/* 📊 1. Vibrant 3-Card Metrics Bar */}
        <View style={styles.metricsGridRow}>
          {/* Metric 1: Merchants */}
          <View style={[styles.metricCardTile, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
            <View style={styles.metricHeaderRow}>
              <Ionicons name="business" size={16} color="#4F46E5" />
              <Text style={styles.metricLabelText}>Merchants</Text>
            </View>
            <Text style={[styles.metricValueText, { color: '#3730A3' }]}>
              {totalCompanies || savedCompanies.length}
            </Text>
          </View>

          {/* Metric 2: SKUs */}
          <View style={[styles.metricCardTile, { backgroundColor: '#F0FDFA', borderColor: '#99F6E4' }]}>
            <View style={styles.metricHeaderRow}>
              <Ionicons name="barcode" size={16} color="#0D9488" />
              <Text style={styles.metricLabelText}>SKUs</Text>
            </View>
            <Text style={[styles.metricValueText, { color: '#0F766E' }]}>
              {totalSkus}
            </Text>
          </View>

          {/* Metric 3: Queue */}
          <TouchableOpacity
            style={[styles.metricCardTile, { backgroundColor: '#FAF5FF', borderColor: '#E9D5FF' }]}
            onPress={() => navigation.navigate('SyncManager')}
            activeOpacity={0.8}
          >
            <View style={styles.metricHeaderRow}>
              <Ionicons name="cloud-upload" size={16} color="#9333EA" />
              <Text style={styles.metricLabelText}>Queue</Text>
            </View>
            <Text style={[styles.metricValueText, { color: pendingSyncCount > 0 ? '#DC2626' : '#6B21A8' }]}>
              {pendingSyncCount}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ⚡ 2. Integrated Shift Attendance HUD Card */}
        <View style={[styles.shiftCardBox, isActive ? styles.shiftCardActive : styles.shiftCardInactive]}>
          <View style={styles.shiftCardLeft}>
            <View style={[styles.shiftIconWrap, isActive ? styles.shiftIconActive : styles.shiftIconInactive]}>
              <Ionicons
                name={isActive ? 'shield-checkmark' : 'finger-print'}
                size={22}
                color={isActive ? '#FFFFFF' : '#D97706'}
              />
            </View>

            <View style={styles.shiftCardTextContainer}>
              <Text
                style={[styles.shiftCardTitle, isActive ? styles.titleActive : styles.titleInactive]}
                numberOfLines={1}
              >
                {isActive ? 'Shift Clocked In' : 'Shift Punch In Required'}
              </Text>

              <View style={styles.shiftCardSubRow}>
                {isActive && (
                  <View style={styles.timerBadge}>
                    <Ionicons name="time-outline" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
                    <Text style={styles.timerBadgeText}>{formatDurationSeconds(elapsedSeconds)}</Text>
                  </View>
                )}
                <Text
                  style={[styles.shiftCardSubtitle, isActive ? styles.subActive : styles.subInactive]}
                  numberOfLines={1}
                >
                  📍 {activeShift?.startLocation?.city || captain?.territory || 'GPS Verified'}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.shiftActionButton, isActive ? styles.shiftBtnOut : styles.shiftBtnIn]}
            onPress={handleOpenClockModal}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isActive ? 'log-out-outline' : 'log-in-outline'}
              size={15}
              color="#FFFFFF"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.shiftActionBtnText}>
              {isActive ? 'Punch Out' : 'Punch In'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 🚀 3. Field Operations Grid */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Field Operations</Text>
          <Text style={styles.sectionSubheading}>Quick On-Ground Actions</Text>
        </View>

        <View style={styles.actionGridRow}>
          {/* Tile 1: Onboard Merchant */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.actionTile}
            onPress={() => navigateProtected('OnboardSellerTab', { screen: 'Step1BasicProfile' })}
          >
            <View style={[styles.actionIconBubble, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="person-add" size={20} color="#2563EB" />
            </View>
            <Text style={styles.actionTileTitle}>Onboard Merchant</Text>
            <Text style={styles.actionTileDesc}>
              Fast-Track GST, KYC & Storefront Photos
            </Text>
            <View style={styles.actionTileFooter}>
              <Text style={styles.actionLinkText}>Start Onboarding</Text>
              <Ionicons name="arrow-forward" size={13} color="#2563EB" />
            </View>
          </TouchableOpacity>

          {/* Tile 2: Catalog SKUs */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.actionTile}
            onPress={() => navigateProtected('SkuWizardTab', { screen: 'CompanySelect' })}
          >
            <View style={[styles.actionIconBubble, { backgroundColor: '#CCFBF1' }]}>
              <Ionicons name="barcode" size={20} color="#0D9488" />
            </View>
            <Text style={styles.actionTileTitle}>Catalog SKUs</Text>
            <Text style={styles.actionTileDesc}>
              Barcode OCR, Slabs & Variant Matrix
            </Text>
            <View style={styles.actionTileFooter}>
              <Text style={[styles.actionLinkText, { color: '#0D9488' }]}>Scan & Catalog</Text>
              <Ionicons name="arrow-forward" size={13} color="#0D9488" />
            </View>
          </TouchableOpacity>
        </View>

        {/* 🏢 4. Recent Merchants Section */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeaderRow}>
            <Text style={styles.sectionHeading}>Recent Merchants</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CompaniesTab')}>
              <Text style={styles.viewAllText}>View All ({totalCompanies || savedCompanies.length})</Text>
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
                  <View style={styles.companyInitCircle}>
                    <Text style={styles.companyInitText}>
                      {c.legalName ? c.legalName.substring(0, 2).toUpperCase() : 'CO'}
                    </Text>
                  </View>
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
                    <Ionicons name="add" size={13} color="#2563EB" />
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

      {/* Sleek GPS Clock Modal Sheet */}
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
                  {isActive ? 'Shift Punch Out' : 'Shift Punch In'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {isActive
                    ? 'Finalize field hours and log end of shift'
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
                title={isActive ? 'Confirm Punch-Out' : 'Confirm Punch-In'}
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
    backgroundColor: '#F8FAFC',
  },

  /* 🌟 Ultra-Clean Top App Header */
  topAppHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  profileInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.xs,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  avatarInitial: {
    ...typography.labelLarge,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  profileName: {
    ...typography.titleSmall,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 15,
  },
  verifiedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  verifiedBadgeText: {
    ...typography.bodySmall,
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 3,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    marginRight: 8,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  badgeInactive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  dotGreen: {
    backgroundColor: '#10B981',
  },
  dotAmber: {
    backgroundColor: '#F59E0B',
  },
  statusBadgeText: {
    ...typography.labelSmall,
    fontSize: 11,
    fontWeight: '800',
  },
  textGreen: {
    color: '#047857',
  },
  textAmber: {
    color: '#B45309',
  },
  syncIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  syncBadgeDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },

  scrollContent: {
    padding: spacing.md,
    paddingBottom: 96,
  },

  /* 📊 Vibrant 3-Card Metrics Bar */
  metricsGridRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  metricCardTile: {
    flex: 1,
    borderRadius: borderRadius.medium,
    padding: 12,
    borderWidth: 1,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  metricLabelText: {
    ...typography.labelSmall,
    color: '#475569',
    fontSize: 10.5,
    fontWeight: '700',
  },
  metricValueText: {
    ...typography.headlineSmall,
    fontWeight: '800',
    fontSize: 20,
  },

  /* ⚡ Shift Attendance HUD Card */
  shiftCardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.large,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  shiftCardActive: {
    backgroundColor: '#059669',
    borderColor: '#10B981',
  },
  shiftCardInactive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  shiftCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  shiftIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  shiftIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  shiftIconInactive: {
    backgroundColor: '#FEF3C7',
  },
  shiftCardTextContainer: {
    flex: 1,
  },
  shiftCardTitle: {
    ...typography.titleSmall,
    fontWeight: '800',
    fontSize: 14.5,
  },
  titleActive: {
    color: '#FFFFFF',
  },
  titleInactive: {
    color: '#78350F',
  },
  shiftCardSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
    gap: 6,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: borderRadius.full,
  },
  timerBadgeText: {
    ...typography.monoSmall,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  shiftCardSubtitle: {
    ...typography.bodySmall,
    fontSize: 11,
    fontWeight: '600',
    flexShrink: 1,
  },
  subActive: {
    color: '#D1FAE5',
  },
  subInactive: {
    color: '#92400E',
  },
  shiftActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs + 3,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    elevation: 2,
  },
  shiftBtnIn: {
    backgroundColor: '#0F172A',
  },
  shiftBtnOut: {
    backgroundColor: '#E11D48',
  },
  shiftActionBtnText: {
    ...typography.labelMedium,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },

  /* 🚀 Operations & Recent Cards */
  sectionHeaderRow: {
    marginBottom: spacing.xs + 2,
  },
  sectionHeading: {
    ...typography.titleSmall,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 14,
  },
  sectionSubheading: {
    ...typography.bodySmall,
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  actionGridRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.large,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
    minHeight: 145,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs + 2,
  },
  actionTileTitle: {
    ...typography.titleSmall,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 13.5,
  },
  actionTileDesc: {
    ...typography.bodySmall,
    color: '#64748B',
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
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 11,
    marginRight: 3,
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
    color: '#2563EB',
    fontWeight: '800',
  },
  recentItemCard: {
    padding: spacing.sm + 3,
    marginBottom: spacing.xs + 2,
    borderRadius: borderRadius.large,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recentItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyInitCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  companyInitText: {
    ...typography.labelMedium,
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 12,
  },
  recentItemTitle: {
    ...typography.titleSmall,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 13.5,
  },
  recentItemSub: {
    ...typography.bodySmall,
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  recentItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs + 2,
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  recentItemGstin: {
    ...typography.monoSmall,
    color: '#64748B',
    fontSize: 10,
  },
  addSkuQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 3,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.full,
  },
  addSkuQuickText: {
    ...typography.labelSmall,
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 10.5,
    marginLeft: 2,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyCardTitle: {
    ...typography.titleSmall,
    color: '#0F172A',
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  emptyCardSubtitle: {
    ...typography.bodySmall,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.extraLarge,
    borderTopRightRadius: borderRadius.extraLarge,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
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
    color: '#0F172A',
    fontWeight: '800',
  },
  modalSubtitle: {
    ...typography.bodySmall,
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  gpsReadoutBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.medium,
    padding: spacing.sm + 2,
    marginVertical: spacing.md,
  },
  gpsReadoutLabel: {
    ...typography.labelSmall,
    color: '#0D9488',
    fontSize: 9.5,
    fontWeight: '800',
  },
  gpsReadoutVal: {
    ...typography.bodySmall,
    color: '#0F172A',
    fontSize: 11,
    marginTop: 1,
  },
  modalActions: {
    marginTop: spacing.xs,
  },
});

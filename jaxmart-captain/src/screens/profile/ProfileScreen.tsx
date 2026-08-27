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
import { borderRadius, spacing, shadows } from '../../theme/spacing';
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
  const { savedCompanies, totalSkus } = useCompanyStore();
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
      {/* 🌟 Ultra-Clean App Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Captain Profile & Ops</Text>
          <Text style={styles.headerSubtitle}>Field credentials, attendance & cloud sync</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('SettingsScreen')}
          style={styles.settingsTouchBtn}
        >
          <Ionicons name="settings-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 🏢 Hero Profile Identity Card */}
        <View style={styles.heroProfileCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{getInitials(user?.fullName)}</Text>
            </View>
          </View>

          <Text style={styles.profileName}>{user?.fullName || 'pipaliya'}</Text>
          
          <View style={styles.verifiedOfficerBadge}>
            <Ionicons name="checkmark-circle" size={13} color="#10B981" style={{ marginRight: 4 }} />
            <Text style={styles.verifiedOfficerText}>Verified Field Officer</Text>
          </View>

          <View style={styles.badgeRow}>
            <View style={styles.employeeBadge}>
              <Text style={styles.employeeBadgeText}>ID: {user?.employeeId || 'CAPT-849201'}</Text>
            </View>
            <View style={styles.territoryBadge}>
              <Ionicons name="location" size={11} color="#64748B" style={{ marginRight: 3 }} />
              <Text style={styles.territoryText}>{user?.territory || 'Surat Industrial Hub'}</Text>
            </View>
          </View>

          {/* Contact Details Sub-Box */}
          <View style={styles.contactDetailsBox}>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={14} color="#0D9488" style={{ marginRight: 6 }} />
              <Text style={styles.contactItemText}>+91 {user?.phone || '9979998797'}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={14} color="#0D9488" style={{ marginRight: 6 }} />
              <Text style={styles.contactItemText}>{user?.email || 'captain@jaxmart.in'}</Text>
            </View>
          </View>
        </View>

        {/* 📊 3 Vibrant Color-Coded Performance Cards */}
        <Text style={styles.sectionHeader}>Field Performance</Text>
        <View style={styles.metricsGrid}>
          {/* Card 1: Merchants */}
          <View style={[styles.metricCard, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#4338CA' }]}>
              <Ionicons name="business" size={16} color="#FFFFFF" />
            </View>
            <Text style={[styles.metricNumber, { color: '#3730A3' }]}>{savedCompanies.length}</Text>
            <Text style={[styles.metricLabel, { color: '#4338CA' }]}>Merchants</Text>
          </View>

          {/* Card 2: Cataloged SKUs */}
          <View style={[styles.metricCard, { backgroundColor: '#F0FDFA', borderColor: '#99F6E4' }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#0D9488' }]}>
              <Ionicons name="barcode" size={16} color="#FFFFFF" />
            </View>
            <Text style={[styles.metricNumber, { color: '#115E59' }]}>
              {totalSkus}
            </Text>
            <Text style={[styles.metricLabel, { color: '#0D9488' }]}>SKUs Uploaded</Text>
          </View>

          {/* Card 3: Shifts */}
          <View style={[styles.metricCard, { backgroundColor: '#FAF5FF', borderColor: '#E9D5FF' }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#7E22CE' }]}>
              <Ionicons name="time" size={16} color="#FFFFFF" />
            </View>
            <Text style={[styles.metricNumber, { color: '#6B21A8' }]}>{history.length || 1}</Text>
            <Text style={[styles.metricLabel, { color: '#7E22CE' }]}>Shifts</Text>
          </View>
        </View>

        {/* ⚙️ Operations & Offline Tools List */}
        <Text style={styles.sectionHeader}>Operations & Offline Tools</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.menuItem}
            onPress={() => navigation.navigate('OfflineDrafts')}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="document-text" size={18} color="#4338CA" />
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
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.menuItem}
            onPress={() => navigation.navigate('SyncManager')}
          >
            <View
              style={[
                styles.menuIconCircle,
                { backgroundColor: pendingSyncCount > 0 ? '#FEE2E2' : '#CCFBF1' },
              ]}
            >
              <Ionicons
                name="cloud-upload"
                size={18}
                color={pendingSyncCount > 0 ? '#DC2626' : '#0D9488'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuItemText}>Cloud Sync Queue</Text>
              <Text style={styles.menuItemSub}>
                {pendingSyncCount > 0 ? `${pendingSyncCount} records pending synchronization` : 'All records synced'}
              </Text>
            </View>
            {pendingSyncCount > 0 && (
              <View style={[styles.badgePill, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.badgePillText, { color: '#991B1B' }]}>
                  {pendingSyncCount}
                </Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.menuItem}
            onPress={() => navigation.navigate('ShiftHistory')}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="calendar-clear" size={18} color="#0F172A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuItemText}>Shift Attendance Logs</Text>
              <Text style={styles.menuItemSub}>GPS clock-in durations & records</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate('SettingsScreen')}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="hardware-chip" size={18} color="#0F172A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuItemText}>Hardware & Backend API</Text>
              <Text style={styles.menuItemSub}>Endpoint configuration & diagnostics</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* 🚪 Sign Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color="#DC2626" style={{ marginRight: 6 }} />
          <Text style={styles.logoutButtonText}>Sign Out of Captains App</Text>
        </TouchableOpacity>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md - 2,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  settingsTouchBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 96,
  },
  heroProfileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.card,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#0D9488',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  profileName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedOfficerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedOfficerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  employeeBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  employeeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  territoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  territoryText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  contactDetailsBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  contactItemText: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    marginTop: 4,
    letterSpacing: -0.1,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.md,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 1,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  menuItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  badgePill: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
  },
  badgePillText: {
    fontSize: 10,
    color: '#4338CA',
    fontWeight: '800',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: spacing.xl,
  },
  logoutButtonText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '800',
  },
});

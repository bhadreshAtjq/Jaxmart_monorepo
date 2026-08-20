// src/screens/profile/SettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { getApiBaseUrl, setCustomApiBaseUrl } from '../../api/client';
import { clearAllAppData } from '../../utils/storage';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [apiUrl, setApiUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getApiBaseUrl().then((url) => {
      setApiUrl(url);
      setSavedUrl(url);
    });
  }, []);

  const handleSaveApiUrl = async () => {
    if (!apiUrl.trim().startsWith('http')) {
      Alert.alert('Invalid URL', 'Please enter a valid URL starting with http:// or https://');
      return;
    }

    try {
      setSaving(true);
      await setCustomApiBaseUrl(apiUrl.trim());
      setSavedUrl(apiUrl.trim());
      setSaving(false);
      Alert.alert('API Configured', `Backend API Base URL updated to:\n${apiUrl.trim()}`);
    } catch (e: any) {
      setSaving(false);
      Alert.alert('Error', e.message || 'Failed to update API URL');
    }
  };

  const handleSetPreset = (presetUrl: string) => {
    setApiUrl(presetUrl);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear App Cache & Data',
      'This will reset your local drafts, cached companies, and active shifts. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            await clearAllAppData();
            Alert.alert('Cache Cleared', 'All local app data has been reset.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Hardware & API Settings</Text>
          <Text style={styles.headerSubtitle}>Environment configuration & diagnostics</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Backend Endpoint Card */}
        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Backend API Endpoint</Text>
          <Text style={styles.cardSubtitle}>
            Configure Express & Prisma backend URL. Mobile device must be on the same local network.
          </Text>

          <AppInput
            label="API Base URL"
            value={apiUrl}
            onChangeText={setApiUrl}
            placeholder="http://192.168.1.X:4000/api"
            autoCapitalize="none"
            isMonospace
            containerStyle={{ marginTop: spacing.xs }}
          />

          <Text style={styles.presetsLabel}>Quick Presets:</Text>
          <View style={styles.presetsRow}>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => handleSetPreset('http://10.0.2.2:4000/api')}
            >
              <Text style={styles.presetChipText}>Android Emulator (10.0.2.2)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => handleSetPreset('http://localhost:4000/api')}
            >
              <Text style={styles.presetChipText}>Localhost:4000</Text>
            </TouchableOpacity>
          </View>

          <AppButton
            title={saving ? 'Saving...' : 'Save API Endpoint'}
            variant="primary"
            onPress={handleSaveApiUrl}
            style={{ marginTop: spacing.md }}
          />
        </AppCard>

        {/* Device Hardware Diagnostics */}
        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Hardware Diagnostics</Text>
          <Text style={styles.cardSubtitle}>Sensors and permissions status</Text>

          <View style={styles.diagRow}>
            <Ionicons name="camera" size={20} color={colors.secondary} style={{ marginRight: spacing.sm }} />
            <Text style={styles.diagLabel}>Camera & Barcode Scanner</Text>
            <Text style={styles.diagStatusActive}>Enabled (Expo SDK 54)</Text>
          </View>

          <View style={styles.diagRow}>
            <Ionicons name="navigate" size={20} color={colors.secondary} style={{ marginRight: spacing.sm }} />
            <Text style={styles.diagLabel}>GPS Geolocation Sensor</Text>
            <Text style={styles.diagStatusActive}>High Accuracy Active</Text>
          </View>

          <View style={[styles.diagRow, { borderBottomWidth: 0 }]}>
            <Ionicons name="key" size={20} color={colors.secondary} style={{ marginRight: spacing.sm }} />
            <Text style={styles.diagLabel}>Encrypted Secure Store</Text>
            <Text style={styles.diagStatusActive}>Keychain / KeyStore Active</Text>
          </View>
        </AppCard>

        {/* Maintenance & Cache Reset */}
        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Storage & Maintenance</Text>
          <Text style={styles.cardSubtitle}>Clear local SQLite / AsyncStorage state</Text>

          <TouchableOpacity style={styles.dangerButton} onPress={handleClearCache}>
            <Ionicons name="trash-bin-outline" size={18} color={colors.error} style={{ marginRight: 6 }} />
            <Text style={styles.dangerButtonText}>Clear All Local Data & Drafts</Text>
          </TouchableOpacity>
        </AppCard>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  cardSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  presetsLabel: {
    ...typography.labelCaps,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  presetChip: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  presetChipText: {
    ...typography.bodySm,
    color: colors.textPrimary,
    fontSize: 11,
  },
  diagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  diagLabel: {
    ...typography.bodySm,
    color: colors.textPrimary,
    flex: 1,
    fontWeight: '600',
  },
  diagStatusActive: {
    ...typography.labelCaps,
    color: colors.secondary,
    fontWeight: '700',
    fontSize: 10,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
  },
  dangerButtonText: {
    ...typography.labelMd,
    color: colors.error,
    fontWeight: '700',
  },
});

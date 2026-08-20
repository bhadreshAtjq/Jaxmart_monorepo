// src/screens/cataloging/SkuSuccessScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useSkuWizardStore } from '../../store/useSkuWizardStore';
import { useCompanyStore } from '../../store/useCompanyStore';
import { AppButton } from '../../components/common/AppButton';
import { StatusBadge } from '../../components/common/StatusBadge';

interface SkuSuccessScreenProps {
  route: any;
  navigation: any;
}

export const SkuSuccessScreen: React.FC<SkuSuccessScreenProps> = ({ route, navigation }) => {
  const { sku, title, companyName, companyId } = route.params || {
    sku: 'JAX-SKU-94021',
    title: 'High Tensile Hex Bolt Grade 8.8',
    companyName: 'Apex Industrial Pvt Ltd',
    companyId: 'COMP-1',
  };

  const { startNewWizard, setCompanyContext } = useSkuWizardStore();
  const { setActiveCompany, savedCompanies } = useCompanyStore();

  const handleAddAnotherForSameCompany = () => {
    startNewWizard();
    setCompanyContext(companyId, companyName);
    const foundComp = savedCompanies.find((c) => c.id === companyId);
    if (foundComp) setActiveCompany(foundComp);

    navigation.navigate('Step1BasicProduct', {
      companyId,
      companyName,
    });
  };

  const handleGoToCompanyCatalog = () => {
    startNewWizard();
    navigation.navigate('CompaniesTab', {
      screen: 'CompanyDetail',
      params: { companyId },
    });
  };

  const handleReturnToDashboard = () => {
    startNewWizard();
    navigation.navigate('DashboardTab');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark-done" size={56} color="#FFFFFF" />
        </View>

        <Text style={styles.successTitle}>SKU Submitted for Review!</Text>
        <Text style={styles.successSubtitle}>
          The product listing has been synchronized to the Jaxmart Admin Review Queue and tagged to the merchant.
        </Text>

        {/* SKU Meta Card */}
        <View style={styles.skuCard}>
          <Text style={styles.skuLabel}>ASSIGNED SKU IDENTIFIER</Text>
          <Text style={styles.skuCode}>{sku}</Text>

          <View style={styles.divider} />

          <Text style={styles.productTitle}>{title}</Text>

          <View style={styles.companyRow}>
            <Ionicons name="business" size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.companyNameText}>{companyName}</Text>
          </View>

          <View style={styles.statusRow}>
            <StatusBadge status="PENDING" label="Under Admin Review" size="md" />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <AppButton
            title={`+ Catalog Another SKU for ${companyName}`}
            variant="secondary"
            icon="add-circle"
            onPress={handleAddAnotherForSameCompany}
            fullWidth
            style={{ marginBottom: spacing.sm }}
          />

          <AppButton
            title="View Company Profile & Catalog"
            variant="outline"
            icon="list"
            onPress={handleGoToCompanyCatalog}
            fullWidth
            style={{ marginBottom: spacing.sm }}
          />

          <AppButton
            title="Return to Field Dashboard"
            variant="primary"
            icon="home"
            onPress={handleReturnToDashboard}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  successIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  successTitle: {
    ...typography.headlineLg,
    color: colors.primaryDark,
    fontWeight: '800',
    textAlign: 'center',
  },
  successSubtitle: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    lineHeight: 22,
    paddingHorizontal: spacing.sm,
  },
  skuCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  skuLabel: {
    ...typography.labelCaps,
    color: colors.textPlaceholder,
    fontSize: 10,
  },
  skuCode: {
    ...typography.monoLg,
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 22,
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  productTitle: {
    ...typography.titleMd,
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  companyNameText: {
    ...typography.bodySm,
    color: colors.primary,
    fontWeight: '600',
  },
  statusRow: {
    marginTop: 2,
  },
  actionsContainer: {
    width: '100%',
  },
});

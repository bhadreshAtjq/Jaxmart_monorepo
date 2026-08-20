// src/components/common/ShiftHudBanner.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, elevation } from '../../theme/spacing';
import { useShiftStore } from '../../store/useShiftStore';
import { formatDurationSeconds } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

interface ShiftHudBannerProps {
  onClockPress?: () => void;
}

export const ShiftHudBanner: React.FC<ShiftHudBannerProps> = ({ onClockPress }) => {
  const isActive = useShiftStore((s) => s.isActive);
  const activeShift = useShiftStore((s) => s.activeShift);
  const elapsedSeconds = useShiftStore((s) => s.elapsedSeconds);
  const tickElapsed = useShiftStore((s) => s.tickElapsed);

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

  const locationText = activeShift?.startLocation?.city
    ? `${activeShift.startLocation.city}`
    : 'GPS Active';

  if (!isActive) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onClockPress}
        style={[styles.banner, styles.inactiveBanner]}
      >
        <View style={styles.leftRow}>
          <View style={styles.warningIconCircle}>
            <Ionicons name="alert" size={14} color={colors.onWarningContainer} />
          </View>
          <Text style={styles.inactiveText}>
            Shift Inactive · Clock-in required for field actions
          </Text>
        </View>
        <View style={styles.clockInPill}>
          <Text style={styles.clockInPillText}>Clock In</Text>
          <Ionicons name="arrow-forward" size={12} color={colors.onWarningContainer} style={{ marginLeft: 2 }} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onClockPress}
      style={[styles.banner, styles.activeBanner]}
    >
      <View style={styles.leftRow}>
        <View style={styles.pulseDot} />
        <Text style={styles.activeTitle}>Active Shift</Text>
        <Text style={styles.divider}>·</Text>
        <Ionicons name="time-outline" size={13} color={colors.secondary} style={{ marginRight: 3 }} />
        <Text style={styles.timerText}>{formatDurationSeconds(elapsedSeconds)}</Text>
        <Text style={styles.divider}>·</Text>
        <Ionicons name="navigate" size={12} color={colors.primaryFixedDim} style={{ marginRight: 2 }} />
        <Text style={styles.locationText} numberOfLines={1}>
          {locationText}
        </Text>
      </View>
      <View style={styles.clockOutPill}>
        <Text style={styles.clockOutPillText}>Manage</Text>
        <Ionicons name="chevron-forward" size={12} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  activeBanner: {
    backgroundColor: colors.primaryDark,
    borderBottomColor: colors.outlineVariant,
  },
  inactiveBanner: {
    backgroundColor: colors.warningContainer,
    borderBottomColor: colors.outlineVariant,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  warningIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(181, 71, 8, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs + 2,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
    marginRight: spacing.xs + 2,
  },
  activeTitle: {
    ...typography.labelSmall,
    color: colors.secondary,
    fontWeight: '800',
    fontSize: 11,
  },
  divider: {
    color: colors.outline,
    marginHorizontal: spacing.xs,
    fontSize: 12,
  },
  timerText: {
    ...typography.monoSmall,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  locationText: {
    ...typography.bodySmall,
    color: colors.primaryFixedDim,
    fontSize: 11,
    flexShrink: 1,
  },
  inactiveText: {
    ...typography.labelSmall,
    color: colors.onWarningContainer,
    fontWeight: '700',
    fontSize: 11,
    flexShrink: 1,
  },
  clockInPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(181, 71, 8, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  clockInPillText: {
    ...typography.labelSmall,
    color: colors.onWarningContainer,
    fontWeight: '800',
    fontSize: 10,
  },
  clockOutPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  clockOutPillText: {
    ...typography.labelSmall,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
    marginRight: 2,
  },
});

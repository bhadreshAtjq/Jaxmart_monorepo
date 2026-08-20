// src/components/camera/MultiImageCaptureGrid.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { ExpoCameraModal } from './ExpoCameraModal';

export interface PhotoSlot {
  key: string;
  label: string;
  uri?: string;
  isPrimary?: boolean;
  required?: boolean;
  instruction?: string;
  description?: string;
}

export interface MultiImageCaptureGridProps {
  slots: PhotoSlot[];
  photos?: Record<string, string>;
  onCapture?: (key: string, uri: string) => void;
  onRemove?: (key: string) => void;
  onUpdateSlot?: (key: string, uri: string) => void;
  onRemoveSlot?: (key: string) => void;
}

export const MultiImageCaptureGrid: React.FC<MultiImageCaptureGridProps> = ({
  slots,
  photos = {},
  onCapture,
  onRemove,
  onUpdateSlot,
  onRemoveSlot,
}) => {
  const [activeSlotKey, setActiveSlotKey] = useState<string | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);

  const activeSlot = slots.find((s) => s.key === activeSlotKey);

  const handleOpenSlot = (key: string) => {
    setActiveSlotKey(key);
    setCameraVisible(true);
  };

  const handlePhotoCaptured = (uri: string) => {
    if (activeSlotKey) {
      if (onCapture) onCapture(activeSlotKey, uri);
      if (onUpdateSlot) onUpdateSlot(activeSlotKey, uri);
      setActiveSlotKey(null);
    }
  };

  const handleRemovePhoto = (key: string) => {
    if (onRemove) onRemove(key);
    if (onRemoveSlot) onRemoveSlot(key);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.gridTitle}>Multi-Angle Product Photos</Text>
      <Text style={styles.gridSubtitle}>
        Capture crisp, well-lit photos. Minimum 2 photos required.
      </Text>

      <View style={styles.gridWrap}>
        {slots.map((slot) => {
          const photoUri = photos[slot.key] || slot.uri;
          const hasPhoto = Boolean(photoUri);

          return (
            <View key={slot.key} style={styles.slotCard}>
              <View style={styles.slotHeaderRow}>
                <Text style={styles.slotLabel}>
                  {slot.label} {slot.required && <Text style={{ color: colors.error }}>*</Text>}
                </Text>
                {slot.isPrimary && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>PRIMARY</Text>
                  </View>
                )}
              </View>

              {(slot.instruction || slot.description) && (
                <Text style={styles.slotInstruction}>{slot.instruction || slot.description}</Text>
              )}

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleOpenSlot(slot.key)}
                style={[
                  styles.imageBox,
                  hasPhoto && styles.imageBoxFilled,
                ]}
              >
                {hasPhoto ? (
                  <>
                    <Image source={{ uri: photoUri }} style={styles.image} resizeMode="cover" />
                    <TouchableOpacity
                      style={styles.deleteBadge}
                      onPress={() => handleRemovePhoto(slot.key)}
                    >
                      <Ionicons name="trash" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.placeholderBox}>
                    <Ionicons name="camera-outline" size={28} color={colors.primary} />
                    <Text style={styles.placeholderText}>Tap to Capture</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Hardware Camera Modal */}
      {activeSlot && (
        <ExpoCameraModal
          visible={cameraVisible}
          onClose={() => {
            setCameraVisible(false);
            setActiveSlotKey(null);
          }}
          onCapture={(uri) => {
            handlePhotoCaptured(uri);
            setCameraVisible(false);
          }}
          title={activeSlot.label}
          subtitle={activeSlot.instruction || activeSlot.description || 'Position item clearly in frame'}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  gridTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  gridSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontSize: 12,
  },
  gridWrap: {
    flexDirection: 'column',
  },
  slotCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  slotLabel: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
    flex: 1,
  },
  primaryBadge: {
    backgroundColor: colors.secondaryContainer,
    paddingVertical: 1,
    paddingHorizontal: spacing.xs + 2,
    borderRadius: borderRadius.xs,
  },
  primaryBadgeText: {
    ...typography.labelCaps,
    color: colors.onSecondaryContainer,
    fontSize: 9,
    fontWeight: '700',
  },
  slotInstruction: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: spacing.sm,
  },
  imageBox: {
    width: '100%',
    height: 140,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  imageBoxFilled: {
    borderStyle: 'solid',
    borderColor: colors.primary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    ...typography.bodySm,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
    fontSize: 11,
  },
  deleteBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(186, 26, 26, 0.85)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

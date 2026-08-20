// src/components/scanner/BarcodeScannerModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { CameraView, BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../common/AppButton';

interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onBarcodeScanned: (data: string, type: string) => void;
  title?: string;
  instruction?: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  visible,
  onClose,
  onBarcodeScanned,
  title = 'Scan Product Barcode',
  instruction = 'Align EAN-13, UPC, or QR Code within the box',
}) => {
  const [torch, setTorch] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanned, setScanned] = useState(false);

  // Animated laser line
  const laserAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible && !scanned && !manualMode) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(laserAnim, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible, scanned, manualMode, laserAnim]);

  const handleScan = (result: BarcodeScanningResult) => {
    if (scanned || !result.data) return;
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onBarcodeScanned(result.data, result.type || 'BARCODE');
    onClose();
    setTimeout(() => setScanned(false), 800);
  };

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      onBarcodeScanned(manualBarcode.trim(), 'MANUAL');
      setManualBarcode('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <TouchableOpacity onPress={() => setTorch(!torch)} style={styles.iconBtn}>
            <Ionicons name={torch ? 'flash' : 'flash-off'} size={22} color={torch ? colors.secondary : '#FFFFFF'} />
          </TouchableOpacity>
        </View>

        {/* Body Scanner or Manual */}
        {manualMode ? (
          <View style={styles.manualContainer}>
            <View style={styles.manualIconCircle}>
              <Ionicons name="barcode-outline" size={48} color={colors.primary} />
            </View>
            <Text style={styles.manualTitle}>Manual Barcode / SKU Entry</Text>
            <Text style={styles.manualSubtitle}>Type the EAN-13 or SKU printed on the package label</Text>

            <TextInput
              value={manualBarcode}
              onChangeText={setManualBarcode}
              placeholder="e.g. 8901030829148"
              placeholderTextColor={colors.textPlaceholder}
              keyboardType="default"
              autoCapitalize="characters"
              autoFocus
              style={styles.manualInput}
            />

            <AppButton
              title="Apply Barcode"
              variant="primary"
              onPress={handleManualSubmit}
              disabled={!manualBarcode.trim()}
              fullWidth
              style={{ marginTop: spacing.md }}
            />

            <TouchableOpacity onPress={() => setManualMode(false)} style={styles.backToCamBtn}>
              <Ionicons name="camera" size={16} color={colors.secondary} style={{ marginRight: 6 }} />
              <Text style={styles.backToCamText}>Switch to Camera Scanner</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraWrapper}>
            <CameraView
              style={styles.camera}
              facing="back"
              enableTorch={torch}
              barcodeScannerSettings={{
                barcodeTypes: ['qr', 'ean13', 'upc_a', 'code128', 'ean8', 'code39', 'pdf417'],
              }}
              onBarcodeScanned={scanned ? undefined : handleScan}
            >
              {/* Dimmed Overlay with Cutout */}
              <View style={styles.overlayTop} />
              <View style={styles.overlayCenterRow}>
                <View style={styles.overlaySide} />

                {/* Focus Reticle Target */}
                <View style={styles.targetFrame}>
                  <View style={[styles.targetCorner, styles.cornerTL]} />
                  <View style={[styles.targetCorner, styles.cornerTR]} />
                  <View style={[styles.targetCorner, styles.cornerBL]} />
                  <View style={[styles.targetCorner, styles.cornerBR]} />

                  {/* Animated Laser Line */}
                  <Animated.View
                    style={[
                      styles.laserLine,
                      {
                        transform: [
                          {
                            translateY: laserAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 210],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                </View>

                <View style={styles.overlaySide} />
              </View>
              <View style={styles.overlayBottom}>
                <Text style={styles.instructionText}>{instruction}</Text>
                <TouchableOpacity onPress={() => setManualMode(true)} style={styles.manualEntryBtn}>
                  <Ionicons name="keypad-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.manualEntryText}>Enter Barcode Manually</Text>
                </TouchableOpacity>
              </View>
            </CameraView>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#0F172A',
  },
  headerTitle: {
    ...typography.titleMd,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  iconBtn: {
    padding: spacing.xs,
  },
  cameraWrapper: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  overlayCenterRow: {
    flexDirection: 'row',
    height: 220,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  targetFrame: {
    width: 280,
    height: 220,
    position: 'relative',
    overflow: 'hidden',
  },
  targetCorner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: colors.secondary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  laserLine: {
    height: 2,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  overlayBottom: {
    flex: 1.2,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  instructionText: {
    ...typography.bodyMd,
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  manualEntryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  manualEntryText: {
    ...typography.labelMd,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  manualContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  manualTitle: {
    ...typography.headlineMd,
    color: colors.primaryDark,
    textAlign: 'center',
    fontWeight: '700',
  },
  manualSubtitle: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  manualInput: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
    textAlign: 'center',
    letterSpacing: 2,
    backgroundColor: colors.surfaceContainerLow,
  },
  backToCamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    padding: spacing.sm,
  },
  backToCamText: {
    ...typography.labelMd,
    color: colors.secondary,
    fontWeight: '700',
  },
});

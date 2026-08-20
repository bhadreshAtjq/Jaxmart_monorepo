// src/components/camera/GstOcrScannerModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { ocrApi } from '../../api/ocrApi';
import { showM3Alert } from '../../store/useAlertStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCAN_FRAME_WIDTH = SCREEN_WIDTH * 0.88;
const SCAN_FRAME_HEIGHT = 160;

interface GstOcrScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onGstDetected: (gstin: string) => void;
}

export const GstOcrScannerModal: React.FC<GstOcrScannerModalProps> = ({
  visible,
  onClose,
  onGstDetected,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Align printed / written GSTIN within the box');

  const cameraRef = useRef<any>(null);
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Start laser scan looping animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(laserAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      laserAnim.setValue(0);
      setIsProcessing(false);
      setTorchOn(false);
    }
  }, [visible]);

  if (!permission?.granted) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={colors.primary} />
          <Text style={styles.permTitle}>Camera Access Required</Text>
          <Text style={styles.permSubtitle}>
            Camera permission is required to read and detect written GST numbers from physical certificates and bills.
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Grant Camera Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeTextBtn} onPress={onClose}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  const handleCaptureAndScan = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      setStatusMessage('Reading text from document photo...');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: true,
      });

      if (photo && photo.uri) {
        processImageUri(photo.uri);
      } else {
        setIsProcessing(false);
        setStatusMessage('Capture failed. Please try again.');
      }
    } catch (e: any) {
      setIsProcessing(false);
      setStatusMessage('Capture error. Please try again.');
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setIsProcessing(true);
        setStatusMessage('Scanning selected photo for GSTIN...');
        processImageUri(result.assets[0].uri);
      }
    } catch (e: any) {
      showM3Alert('Image Selection Error', 'Failed to select image from album.', undefined, 'error');
    }
  };

  const processImageUri = async (uri: string) => {
    try {
      const ocrResult = await ocrApi.extractGstinFromImage(uri);
      setIsProcessing(false);

      if (ocrResult.success && ocrResult.gstin) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onGstDetected(ocrResult.gstin);
        onClose();
      } else {
        // Offer quick confirmation or manual fallback
        showM3Alert(
          'Document Text Scanned',
          'Document photo captured. Select an option below to proceed:',
          [
            {
              text: 'Try Again',
              style: 'cancel',
              onPress: () => setStatusMessage('Align printed / written GSTIN within the box'),
            },
            {
              text: 'Use Demo (29AAECA2190C1ZZ)',
              onPress: () => {
                onGstDetected('29AAECA2190C1ZZ');
                onClose();
              },
            },
          ],
          'info'
        );
      }
    } catch (err: any) {
      setIsProcessing(false);
      setStatusMessage('Scan completed. Please verify.');
    }
  };

  const handleBarcodeScanned = (scanningResult: any) => {
    if (isProcessing) return;
    const rawData = scanningResult?.data;
    if (rawData) {
      const extracted = ocrApi.extractGstinFromText(rawData);
      if (extracted) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onGstDetected(extracted);
        onClose();
      }
    }
  };

  const laserTranslateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_FRAME_HEIGHT - 4],
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={torchOn}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'code128', 'ean13', 'pdf417'],
          }}
          onBarcodeScanned={handleBarcodeScanned}
        />

        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTitleCol}>
            <Text style={styles.headerTitle}>Optical GST Text Scanner</Text>
            <Text style={styles.headerSubtitle}>Point at signboard, invoice, or certificate</Text>
          </View>

          <TouchableOpacity
            style={[styles.headerIconBtn, torchOn && styles.headerIconBtnActive]}
            onPress={() => setTorchOn(!torchOn)}
          >
            <Ionicons name={torchOn ? 'flash' : 'flash-off'} size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Scanner Viewfinder Box */}
        <View style={styles.viewfinderCenter}>
          <View style={styles.scanFrame}>
            {/* 4 Corner Accents */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Animated Laser Line */}
            <Animated.View
              style={[
                styles.laserLine,
                { transform: [{ translateY: laserTranslateY }] },
              ]}
            />

            <View style={styles.frameLabelBox}>
              <Ionicons name="scan-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.frameLabelText}>GSTIN 15-CHAR TEXT</Text>
            </View>
          </View>

          {/* Dynamic Status Pill */}
          <View style={styles.statusPill}>
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="information-circle" size={16} color={colors.secondary} style={{ marginRight: 6 }} />
            )}
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        </View>

        {/* Bottom Control Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.galleryBtn}
            onPress={handlePickFromGallery}
            disabled={isProcessing}
          >
            <Ionicons name="images-outline" size={24} color="#FFFFFF" />
            <Text style={styles.galleryBtnText}>Gallery</Text>
          </TouchableOpacity>

          {/* Giant Capture Trigger */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.captureTriggerOuter, isProcessing && styles.captureTriggerDisabled]}
            onPress={handleCaptureAndScan}
            disabled={isProcessing}
          >
            <View style={styles.captureTriggerInner}>
              <Ionicons name="scan" size={32} color={colors.primaryDark} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sampleFillBtn}
            onPress={() => {
              onGstDetected('29AAECA2190C1ZZ');
              onClose();
            }}
          >
            <Ionicons name="flash-outline" size={22} color={colors.secondary} />
            <Text style={styles.sampleFillText}>Demo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconBtnActive: {
    backgroundColor: colors.secondary,
  },
  headerTitleCol: {
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.titleMd,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  headerSubtitle: {
    ...typography.bodySm,
    color: colors.primaryFixedDim,
    fontSize: 11,
    marginTop: 1,
  },
  viewfinderCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: SCAN_FRAME_WIDTH,
    height: SCAN_FRAME_HEIGHT,
    borderRadius: borderRadius.md,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: colors.secondary,
  },
  cornerTL: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: borderRadius.md,
  },
  cornerTR: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: borderRadius.md,
  },
  cornerBL: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: borderRadius.md,
  },
  cornerBR: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: borderRadius.md,
  },
  laserLine: {
    position: 'absolute',
    left: 4,
    right: 4,
    top: 2,
    height: 2.5,
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  frameLabelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.xs,
  },
  frameLabelText: {
    ...typography.labelCaps,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 9,
    letterSpacing: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statusText: {
    ...typography.bodySm,
    color: '#FFFFFF',
    fontSize: 12,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 40,
    paddingTop: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  galleryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
  },
  galleryBtnText: {
    ...typography.labelCaps,
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 4,
  },
  captureTriggerOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureTriggerDisabled: {
    opacity: 0.5,
  },
  captureTriggerInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.modal,
  },
  sampleFillBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
  },
  sampleFillText: {
    ...typography.labelCaps,
    color: colors.secondary,
    fontSize: 10,
    marginTop: 4,
    fontWeight: '800',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  permTitle: {
    ...typography.headlineMd,
    color: colors.primaryDark,
    fontWeight: '800',
    marginTop: spacing.md,
  },
  permSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  permBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  permBtnText: {
    ...typography.labelMd,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  closeTextBtn: {
    padding: spacing.sm,
  },
  closeText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
});

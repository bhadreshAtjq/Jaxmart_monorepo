// src/components/camera/ExpoCameraModal.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { CameraView, CameraType, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../common/AppButton';

interface ExpoCameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (photoUri: string) => void;
  title?: string;
  subtitle?: string;
  initialFacing?: CameraType;
}

export const ExpoCameraModal: React.FC<ExpoCameraModalProps> = ({
  visible,
  onClose,
  onCapture,
  title = 'Take Photo',
  subtitle = 'Ensure good lighting and steady focus',
  initialFacing = 'back',
}) => {
  const [facing, setFacing] = useState<CameraType>(initialFacing);
  const [flash, setFlash] = useState<FlashMode>('off');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleCapture = async () => {
    if (cameraRef.current && !isCapturing) {
      try {
        setIsCapturing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.85,
          skipProcessing: false,
        });

        if (photo?.uri) {
          setCapturedUri(photo.uri);
        }
      } catch (e) {
        console.error('Camera capture failed:', e);
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!res.canceled && res.assets && res.assets[0]?.uri) {
        setCapturedUri(res.assets[0].uri);
      }
    } catch (e) {
      console.warn('Gallery picker failed:', e);
    }
  };

  const handleConfirm = () => {
    if (capturedUri) {
      onCapture(capturedUri);
      setCapturedUri(null);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedUri(null);
  };

  const toggleFacing = () => {
    setFacing((cur) => (cur === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash((cur) => (cur === 'off' ? 'on' : cur === 'on' ? 'auto' : 'off'));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Viewfinder or Preview */}
        <View style={styles.viewfinderContainer}>
          {capturedUri ? (
            <Image source={{ uri: capturedUri }} style={styles.previewImage} resizeMode="contain" />
          ) : (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
              flash={flash}
              enableTorch={flash === 'on'}
            >
              <View style={styles.cameraOverlay}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
              </View>
            </CameraView>
          )}
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {capturedUri ? (
            <View style={styles.previewActionsRow}>
              <AppButton
                title="Retake"
                variant="secondary"
                icon="refresh"
                onPress={handleRetake}
                style={{ flex: 1, marginRight: spacing.md }}
              />
              <AppButton
                title="Use Photo"
                variant="success"
                icon="checkmark"
                onPress={handleConfirm}
                style={{ flex: 1 }}
              />
            </View>
          ) : (
            <View style={styles.shutterRow}>
              <TouchableOpacity onPress={toggleFlash} style={styles.controlIconBtn}>
                <Ionicons
                  name={flash === 'on' ? 'flash' : flash === 'auto' ? 'flash-outline' : 'flash-off'}
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.controlLabel}>{flash.toUpperCase()}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCapture}
                disabled={isCapturing}
                style={styles.shutterOuter}
              >
                <View style={[styles.shutterInner, isCapturing && styles.shutterCapturing]} />
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleFacing} style={styles.controlIconBtn}>
                <Ionicons name="camera-reverse" size={24} color="#FFFFFF" />
                <Text style={styles.controlLabel}>FLIP</Text>
              </TouchableOpacity>
            </View>
          )}

          {!capturedUri && (
            <TouchableOpacity onPress={handlePickFromGallery} style={styles.galleryButton}>
              <Ionicons name="images-outline" size={18} color="#CBD5E1" style={{ marginRight: 6 }} />
              <Text style={styles.galleryText}>Upload from Gallery</Text>
            </TouchableOpacity>
          )}
        </View>
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
  headerTitles: {
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.titleMd,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerSubtitle: {
    ...typography.bodySm,
    color: '#94A3B8',
  },
  iconBtn: {
    padding: spacing.xs,
  },
  viewfinderContainer: {
    flex: 1,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  cameraOverlay: {
    width: '84%',
    height: '75%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.secondary,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.secondary,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.secondary,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.secondary,
    borderBottomRightRadius: 8,
  },
  bottomControls: {
    backgroundColor: '#0F172A',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.md,
  },
  controlIconBtn: {
    alignItems: 'center',
    width: 60,
  },
  controlLabel: {
    ...typography.labelCaps,
    color: '#94A3B8',
    marginTop: 4,
    fontSize: 10,
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.secondary,
  },
  shutterCapturing: {
    backgroundColor: '#EF4444',
    transform: [{ scale: 0.9 }],
  },
  previewActionsRow: {
    flexDirection: 'row',
    width: '100%',
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  galleryText: {
    ...typography.bodySm,
    color: '#CBD5E1',
    fontWeight: '500',
  },
});

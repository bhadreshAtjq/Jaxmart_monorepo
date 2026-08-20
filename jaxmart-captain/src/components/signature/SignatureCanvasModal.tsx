// src/components/signature/SignatureCanvasModal.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../common/AppButton';

interface SignatureCanvasModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveSignature: (signatureDataUrl: string) => void;
  signerName?: string;
  agreementTitle?: string;
}

export const SignatureCanvasModal: React.FC<SignatureCanvasModalProps> = ({
  visible,
  onClose,
  onSaveSignature,
  signerName = 'Seller Authorized Signatory',
  agreementTitle = 'Jaxmart Merchant Onboarding Agreement',
}) => {
  const webViewRef = useRef<any>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
          body, html { width: 100%; height: 100%; overflow: hidden; background: #FFFFFF; }
          #canvas { width: 100%; height: 100%; touch-action: none; display: block; cursor: crosshair; }
        </style>
      </head>
      <body>
        <canvas id="canvas"></canvas>
        <script>
          const canvas = document.getElementById('canvas');
          const ctx = canvas.getContext('2d');
          let drawing = false;
          let hasDrawn = false;

          function resize() {
            canvas.width = window.innerWidth * 2;
            canvas.height = window.innerHeight * 2;
            ctx.scale(2, 2);
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#121358';
          }
          window.addEventListener('resize', resize);
          resize();

          function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            if (e.touches && e.touches[0]) {
              return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
            }
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
          }

          function start(e) {
            e.preventDefault();
            drawing = true;
            const p = getPos(e);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            if (!hasDrawn) {
              hasDrawn = true;
              window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DRAW_START' }));
            }
          }

          function move(e) {
            if (!drawing) return;
            e.preventDefault();
            const p = getPos(e);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }

          function end(e) {
            if (!drawing) return;
            e.preventDefault();
            drawing = false;
          }

          canvas.addEventListener('touchstart', start, { passive: false });
          canvas.addEventListener('touchmove', move, { passive: false });
          canvas.addEventListener('touchend', end, { passive: false });
          canvas.addEventListener('mousedown', start);
          canvas.addEventListener('mousemove', move);
          canvas.addEventListener('mouseup', end);

          window.clearCanvas = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            hasDrawn = false;
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CLEARED' }));
          };

          window.getSignatureData = function() {
            const dataUrl = canvas.toDataURL('image/png');
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DATA_URL', data: dataUrl }));
          };
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'DRAW_START') {
        setHasDrawn(true);
      } else if (data.type === 'CLEARED') {
        setHasDrawn(false);
      } else if (data.type === 'DATA_URL') {
        onSaveSignature(data.data);
        onClose();
      }
    } catch (e) {
      console.warn('Signature message parsing error:', e);
    }
  };

  const handleClear = () => {
    if (webViewRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      webViewRef.current.injectJavaScript('window.clearCanvas(); true;');
    }
  };

  const handleSave = () => {
    if (webViewRef.current && hasDrawn) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      webViewRef.current.injectJavaScript('window.getSignatureData(); true;');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>Digital Signature Capture</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {signerName}
            </Text>
          </View>
          <TouchableOpacity onPress={handleClear} style={styles.clearHeaderBtn}>
            <Ionicons name="trash-outline" size={18} color={colors.error} style={{ marginRight: 4 }} />
            <Text style={styles.clearHeaderText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Agreement Note */}
        <View style={styles.noteBanner}>
          <Ionicons name="shield-checkmark" size={18} color={colors.secondary} style={{ marginRight: spacing.sm }} />
          <Text style={styles.noteText}>
            Signing: <Text style={{ fontWeight: '700' }}>{agreementTitle}</Text>. All legal declarations apply.
          </Text>
        </View>

        {/* Canvas Area */}
        <View style={styles.canvasContainer}>
          {Platform.OS === 'web' ? (
            <View style={styles.webFallbackContainer}>
              <Text style={styles.webFallbackText}>Sign in the box below</Text>
              <iframe
                srcDoc={htmlContent}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Signature Canvas"
              />
            </View>
          ) : (
            (() => {
              const WebViewComp = WebView as any;
              return (
                <WebViewComp
                  ref={webViewRef}
                  originWhitelist={['*']}
                  source={{ html: htmlContent }}
                  onMessage={handleMessage}
                  scrollEnabled={false}
                  javaScriptEnabled={true}
                  style={styles.webView}
                />
              );
            })()
          )}

          <View style={styles.guidelineRow}>
            <View style={styles.guideline} />
            <Text style={styles.signHereText}>Sign along this line</Text>
          </View>
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <AppButton
            title="Clear Pad"
            variant="secondary"
            icon="refresh"
            onPress={handleClear}
            style={{ flex: 1, marginRight: spacing.md }}
          />
          <AppButton
            title="Confirm Signature"
            variant="success"
            icon="checkmark-done"
            onPress={handleSave}
            disabled={!hasDrawn}
            style={{ flex: 1.4 }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitles: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  headerTitle: {
    ...typography.titleMd,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  clearHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
  },
  clearHeaderText: {
    ...typography.labelMd,
    color: colors.error,
    fontWeight: '600',
  },
  noteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#B2DFDB',
  },
  noteText: {
    ...typography.bodySm,
    color: colors.onSecondaryContainer,
    flex: 1,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    overflow: 'hidden',
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webFallbackContainer: {
    flex: 1,
    position: 'relative',
  },
  webFallbackText: {
    position: 'absolute',
    top: 8,
    left: 12,
    ...typography.bodySm,
    color: colors.textPlaceholder,
    pointerEvents: 'none',
  },
  guidelineRow: {
    position: 'absolute',
    bottom: 50,
    left: 24,
    right: 24,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  guideline: {
    width: '100%',
    height: 1,
    backgroundColor: colors.outlineVariant,
    borderStyle: 'dashed',
  },
  signHereText: {
    ...typography.labelCaps,
    color: colors.textPlaceholder,
    marginTop: 6,
    fontSize: 10,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

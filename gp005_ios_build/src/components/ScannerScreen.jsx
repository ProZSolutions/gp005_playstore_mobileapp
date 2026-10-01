import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Platform,
  PermissionsAndroid,
  Animated,
  Easing,
} from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import Icon from 'react-native-vector-icons/Feather';
import { scale, verticalScale, fontScale, screen } from '../utils/scale';

const TEAL = '#2DD4BF';
const SCRIM = 'rgba(30, 41, 59, 0.45)';
const FRAME_FILL = 'rgba(71, 85, 105, 0.25)';
const FRAME_BORDER = 'rgba(45, 212, 191, 0.35)';
const ERROR_BG = 'rgba(217, 55, 55, 0.85)';

const FRAME_SIZE = Math.min(screen.width * 0.68, 260);
const FRAME_RADIUS = scale(18);
const CORNER_LEN = scale(24);
const CORNER_THICK = 2.5;

export default function ScannerScreen({ onScanSuccess, onClose, visible = true }) {
  const [hasPermission, setHasPermission] = useState(Platform.OS === 'ios');
  const [status, setStatus] = useState('scanning'); // scanning | loading | error
  const [errorMessage, setErrorMessage] = useState('');

  const isProcessing = useRef(false);
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
   }, [visible]);

  useEffect(() => {
   }, [status, errorMessage]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    (async () => {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera permission',
          message: 'Camera access is needed to scan Qone device codes.',
          buttonPositive: 'Allow',
        }
      );
       setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
    })();
  }, []);

  // Reset scan state every time this screen becomes visible again.
  useEffect(() => {
    if (visible) {
       isProcessing.current = false;
      setStatus('scanning');
      setErrorMessage('');
    }
  }, [visible]);

  useEffect(() => {
    if (status !== 'scanning') return;
    scanAnim.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [status, scanAnim]);

  const scanLineTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [scale(36), FRAME_SIZE - scale(36)],
  });

  const resumeScanning = useCallback(() => {
     isProcessing.current = false;
    setStatus('scanning');
    setErrorMessage('');
  }, []);

  const handleScannedCode = useCallback(
    (rawCode) => {
 
      if (isProcessing.current) {
         return;
      }
      isProcessing.current = true;
 
      if (!rawCode) {
         setStatus('error');
        setErrorMessage('Could not read this code. Please try again.');
        setTimeout(resumeScanning, 1800);
        return;
      }

      setStatus('loading');
       onScanSuccess(rawCode);
    },
    [onScanSuccess, resumeScanning, status],
  );

  const onReadCode = useCallback(
    (event) => {
      const value = event?.nativeEvent?.codeStringValue;
       if (status !== 'scanning' || isProcessing.current) {
         return;
      }
      if (value) handleScannedCode(value);
    },
    [status, handleScannedCode],
  );

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Icon name="camera-off" size={scale(40)} color={TEAL} />
        <Text style={styles.permissionText}>
          Camera access is needed to scan Qone device codes.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        cameraType={CameraType.Back}
        scanBarcode
        onReadCode={onReadCode}
        showFrame={false}
      />

      <View style={StyleSheet.absoluteFill} pointerEvents="none" />
      <View style={[StyleSheet.absoluteFill, styles.scrim]} pointerEvents="none" />

      <Pressable
        style={styles.closeButton}
        onPress={onClose}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Close scanner"
      >
        <Icon name="x" size={scale(22)} color="#fff" />
      </Pressable>

      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.frame}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          <View style={styles.frameContent}>
            {status === 'scanning' && (
              <Text style={styles.scanningLabel}>SCANNING…</Text>
            )}

            {status === 'loading' && (
              <View style={styles.inlineStatus}>
                <ActivityIndicator size="small" color={TEAL} />
                <Text style={styles.scanningLabel}>SCANNING…</Text>
              </View>
            )}

            {status === 'error' && (
              <Icon name="alert-circle" size={scale(22)} color="#fff" />
            )}
          </View>

          {status === 'scanning' && (
            <Animated.View
              style={[
                styles.scanLineWrap,
                { transform: [{ translateY: scanLineTranslateY }] },
              ]}
            >
              <FadeLine />
            </Animated.View>
          )}
        </View>

        {status === 'error' && (
          <View style={[styles.statusPill, styles.statusPillError]}>
            <Text style={styles.statusPillText}>{errorMessage}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function FadeLine() {
  const opacities = [0.05, 0.2, 0.45, 0.9, 1, 0.9, 0.45, 0.2, 0.05];
  return (
    <View style={styles.fadeLineRow}>
      {opacities.map((o, i) => (
        <View key={i} style={[styles.fadeLineSeg, { opacity: o }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  scrim: { backgroundColor: SCRIM },
  closeButton: {
    position: 'absolute',
    top: verticalScale(Platform.OS === 'ios' ? 50 : 20),
    right: scale(16),
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(24),
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderRadius: FRAME_RADIUS,
    backgroundColor: FRAME_FILL,
    borderWidth: 1,
    borderColor: FRAME_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  frameContent: { alignItems: 'center', justifyContent: 'center' },
  inlineStatus: { alignItems: 'center', justifyContent: 'center', gap: verticalScale(8) },
  scanningLabel: { color: TEAL, fontSize: fontScale(13), fontWeight: '600', letterSpacing: 2 },
  corner: { position: 'absolute', width: CORNER_LEN, height: CORNER_LEN, borderColor: TEAL },
  cornerTL: { top: scale(10), left: scale(10), borderTopWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderTopLeftRadius: scale(6) },
  cornerTR: { top: scale(10), right: scale(10), borderTopWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderTopRightRadius: scale(6) },
  cornerBL: { bottom: scale(10), left: scale(10), borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderBottomLeftRadius: scale(6) },
  cornerBR: { bottom: scale(10), right: scale(10), borderBottomWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderBottomRightRadius: scale(6) },
  scanLineWrap: { position: 'absolute', left: scale(20), right: scale(20), height: 2 },
  fadeLineRow: { flex: 1, flexDirection: 'row' },
  fadeLineSeg: { flex: 1, backgroundColor: TEAL },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    borderRadius: scale(20),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(16),
    marginTop: verticalScale(20),
    maxWidth: '100%',
  },
  statusPillError: { backgroundColor: ERROR_BG },
  statusPillText: { color: '#fff', fontSize: fontScale(12), flexShrink: 1 },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#070B14',
    paddingHorizontal: scale(32),
    gap: verticalScale(12),
  },
  permissionText: { color: '#fff', fontSize: fontScale(14), textAlign: 'center' },
});
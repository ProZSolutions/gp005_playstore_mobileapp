import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StatusBar,
  SafeAreaView,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppColors } from '../../theme/theme';
import GlobalStyles from '../styles';
import createStyles from '../styles/ManageOperationsStyles';
import { useResponsive } from '../../utils/responsive';
import ScannerScreen from '../../components/ScannerScreen';
import deviceSwapService from '../../api/services/deviceSwapService';
import { showAlert } from '../../utils/AlertService';

const { container, text, button } = GlobalStyles;

// Pulls the raw QR value out of whatever shape the scanner hands back.
function extractCode(raw) {
  return typeof raw === 'string' ? raw.trim() : raw?.value ?? raw?.data ?? null;
}

export default function TLSDeviceMappingScreen({ navigation }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs } = useResponsive();
  const styles = createStyles(ms, mvs, fs);

  // device:  data from getdevicedetails  -> { tls_id, tls_code, mac_id, machine_no, line_name, ... }
  // machine: data from getmachinedetails -> { machine_id, machine_no, code, machine_type_name, ... }
  const [device, setDevice] = useState(null);
  const [machine, setMachine] = useState(null);

  const [deviceLoading, setDeviceLoading] = useState(false);
  const [machineLoading, setMachineLoading] = useState(false);

  // Which scanner modal is open: 'device' | 'machine' | null
  const [scannerFor, setScannerFor] = useState(null);

  const deviceDone = !!device?.tls_id;
  const machineDone = !!machine?.machine_no;
  const bothScanned = deviceDone && machineDone;

  const closeScanner = useCallback(() => setScannerFor(null), []);

  // ---- Step 1a: scan Qone device (QR = tls_code), look it up, keep tls_id ----
  const handleDeviceScanned = useCallback(async (raw) => {
    const code = extractCode(raw);
    closeScanner();
    if (!code) {
      showAlert('error', 'Scan Failed', 'Could not read that QR code. Please try again.');
      return;
    }
    setDeviceLoading(true);
    try {
      // The service already alerts on API failure; only guard against a
      // "success" response that has no usable device data.
      const result = await deviceSwapService.scanDevice(code);
      if (result?.success) {
        if (result.data?.tls_id) {
          setDevice(result.data);
        } else {
          showAlert('error', 'Device Not Found', 'Could not fetch details for this device.');
        }
      }
    } finally {
      setDeviceLoading(false);
    }
  }, [closeScanner]);

  // ---- Step 1b: scan machine (QR = machine_no), only reachable once device is verified ----
  const handleMachineScanned = useCallback(async (raw) => {
    const code = extractCode(raw);
    closeScanner();
    if (!code) {
      showAlert('error', 'Scan Failed', 'Could not read that QR code. Please try again.');
      return;
    }
    setMachineLoading(true);
    try {
      const result = await deviceSwapService.scanMachine(code);
      if (result?.success) {
        if (result.data?.machine_no) {
          setMachine(result.data);
        } else {
          showAlert('error', 'Machine Not Found', 'Could not fetch details for this machine.');
        }
      }
    } finally {
      setMachineLoading(false);
    }
  }, [closeScanner]);

  const handleRescanDevice = () => {
    Alert.alert(
      'Rescan Qone Device?',
      'This will discard the currently scanned Qone device. The machine will need to be verified again too.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rescan',
          style: 'destructive',
          onPress: () => {
            setDevice(null);
            setMachine(null); // machine step was gated on the device, so reset it too
            setScannerFor('device');
          },
        },
      ],
    );
  };

  const handleRescanMachine = () => {
    Alert.alert(
      'Rescan Machine?',
      'This will discard the currently scanned machine.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rescan',
          style: 'destructive',
          onPress: () => {
            setMachine(null);
            setScannerFor('machine');
          },
        },
      ],
    );
  };

  const handleReviewDetails = () => {
    if (!bothScanned) return;
    // No API call here — the review screen renders straight from these two
    // objects and only calls the swap API when "Confirm Swap" is pressed.
    navigation?.navigate('TLSDeviceSwapReviewScreen', { device, machine });
  };

  let infoText;
  if (bothScanned) {
    infoText = 'Device and machine are both verified. Continue to review and confirm the swap.';
  } else if (deviceDone && !machineDone) {
    infoText = 'Qone device verified. Now scan the machine to continue.';
  } else {
    infoText = 'Scan the Qone device first. The machine scan unlocks once the device is verified.';
  }

  return (
    <SafeAreaView style={container.safe_primary}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.primary} />

      <View style={[styles.header, { marginTop: 25 }]}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerTopRow}>
            <Pressable
              onPress={() => navigation?.goBack?.()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={({ pressed }) => [styles.backPill, pressed && { opacity: 0.85 }]}
            >
              <Ionicons name="chevron-back" size={ms(15)} color={AppColors.onPrimary} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>TLS Device Swapping</Text>
        </SafeAreaView>
      </View>

      <View style={[container.safe, { flex: 1 }]}>
        <View style={[container.screenBody, { flex: 1 }]}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {/* ---- Qone Device card ---- */}
            <View style={container.card_pro_top}>
              <View style={container.cardHeaderRowGG}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={container.iconChipSm}>
                    <Ionicons name="phone-portrait-outline" size={20} color={AppColors.primary} />
                  </View>
                  <Text style={text.cardSectionTitle}>Qone Details</Text>
                </View>
              </View>

              {deviceLoading ? (
                <View style={local.loadingRow}>
                  <ActivityIndicator size="small" color={AppColors.primary} />
                  <Text style={local.loadingText}>Verifying device…</Text>
                </View>
              ) : deviceDone ? (
                <>
                  <View style={{ flexDirection: 'row', marginTop: 12 }}>
                    <View style={container.detailCell}>
                      <Text style={text.detailLabel}>Qone ID</Text>
                      <Text style={text.detailValue}>{device.tls_id ?? '—'}</Text>
                    </View>
                    <View style={container.detailCell}>
                      <Text style={text.detailLabel}>Qone CODE</Text>
                      <Text style={text.detailValue}>{device.tls_code ?? '—'}</Text>
                    </View>
                  </View>
                  <ScanButton label="Rescan Device" onPress={handleRescanDevice} button={button} text={text} />
                </>
              ) : (
                <ScanButton label="Scan Device" onPress={() => setScannerFor('device')} button={button} text={text} />
              )}
            </View>

            <View style={container.connectorRow}>
              <View style={[container.connectorLine, { backgroundColor: deviceDone ? AppColors.primary : '#E5E7EB' }]} />
              <View style={container.connectorBadge}>
                <Ionicons name="link" size={16} color={AppColors.onPrimary} />
              </View>
              <View style={[container.connectorLine, { backgroundColor: machineDone ? '#A78BFA' : '#E5E7EB' }]} />
            </View>

            {/* ---- Machine card — locked until the device is verified ---- */}
            <View style={[container.card_pro_bottom, !deviceDone && local.cardDisabled]}>
              <View style={container.cardHeaderRowGG}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={container.iconChipSm}>
                    <Ionicons name="hardware-chip-outline" size={20} color={AppColors.primary} />
                  </View>
                  <Text style={text.cardSectionTitle}>Machine Details</Text>
                </View>
              </View>

              {machineLoading ? (
                <View style={local.loadingRow}>
                  <ActivityIndicator size="small" color={AppColors.primary} />
                  <Text style={local.loadingText}>Verifying machine…</Text>
                </View>
              ) : machineDone ? (
                <>
                  <View style={{ flexDirection: 'row', marginTop: 12 }}>
                    <View style={container.detailCell}>
                      <Text style={text.detailLabel}>MACHINE NO.</Text>
                      <Text style={text.detailValue}>{machine.machine_no}</Text>
                    </View>
                    <View style={container.detailCell}>
                      <Text style={text.detailLabel}>MACHINE TYPE</Text>
                      <Text style={text.detailValue}>{machine.machine_type_name ?? '—'}</Text>
                    </View>
                  </View>
                  <ScanButton label="Rescan Machine" onPress={handleRescanMachine} button={button} text={text} />
                </>
              ) : (
                <ScanButton
                  label="Scan Machine"
                  disabled={!deviceDone}
                  onPress={() => deviceDone && setScannerFor('machine')}
                  button={button}
                  text={text}
                />
              )}
            </View>

            <View style={container.warningBox}>
              <Ionicons
                name={bothScanned ? 'alert-circle-outline' : 'information-circle-outline'}
                size={18}
                color={AppColors.warningIcon}
                style={{ marginTop: 1 }}
              />
              <Text style={text.warningText}>{infoText}</Text>
            </View>
          </ScrollView>
        </View>
      </View>

      <View style={container.footer}>
        <Pressable
          disabled={!bothScanned}
          style={[button.submitBtn, bothScanned && button.submitBtnActive]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={handleReviewDetails}
        >
          <Text style={[text.submitBtnText, bothScanned && text.submitBtnTextActive]}>
            Review Details
          </Text>
        </Pressable>
      </View>

      {/* Single scanner modal, reused for both the device and machine steps */}
      <Modal visible={!!scannerFor} animationType="slide" onRequestClose={closeScanner}>
        <ScannerScreen
          visible={!!scannerFor}
          onScanSuccess={scannerFor === 'device' ? handleDeviceScanned : handleMachineScanned}
          onClose={closeScanner}
        />
      </Modal>
    </SafeAreaView>
  );
}

function ScanButton({ label, onPress, disabled, button, text }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={({ pressed }) => [
        button.scanBtn,
        disabled && { opacity: 0.4 },
        pressed && !disabled && { opacity: 0.85 },
      ]}
    >
      <Ionicons name="scan-outline" size={16} color={AppColors.onPrimary} />
      <Text style={text.scanBtnText}>{label}</Text>
    </Pressable>
  );
}

const local = StyleSheet.create({
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 4,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  cardDisabled: {
    opacity: 0.5,
  },
});
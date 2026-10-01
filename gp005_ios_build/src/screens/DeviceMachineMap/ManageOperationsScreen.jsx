import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, Modal, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import { normalizeScannedDevice } from '../../utils/auditData';
import ScannerScreen from '../../components/ScannerScreen';
import AddMappingSheet from './AddDeviceMachineScreen';
import ConfirmDeviceModal from '../../components/ConfirmDeviceModal';
import createStyles from '../styles/ManageOperationsStyles';

const TEAL = AppColors.primary;

export default function ManageOperationsScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs } = useResponsive();
  const styles = createStyles(ms, mvs, fs);


  const { order, operation } = route?.params ?? {};
 
  const [devices, setDevices] = useState(() => operation?.devices ?? []); 
  const [mappingVisible, setMappingVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanTarget, setScanTarget] = useState(null);
  const [scannedDevice, setScannedDevice] = useState(null);
  const [scannedMachine, setScannedMachine] = useState(null);
  const [pendingDevice, setPendingDevice] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

   const openAddMapping = useCallback(() => {
    setScannedDevice(null);
    setScannedMachine(null);
    setMappingVisible(true);
  }, []);

  const closeAddMapping = useCallback(() => setMappingVisible(false), []);
 
  const requestScan = useCallback((target) => {
    setScanTarget(target);
    setMappingVisible(false);
    setScannerVisible(true);
  }, []);

 
  const handleScanSuccess = useCallback((data) => {
    const normalized = normalizeScannedDevice(data);

    if (scanTarget === 'device') {
      if (!normalized?.id) {
        setScannerVisible(false);
        setMappingVisible(true);
        Alert.alert('Scan failed', 'Could not read a valid Qone device ID from that code.');
        return;
      }
      setScannedDevice({ id: normalized.id });
    } else if (scanTarget === 'machine') {
      if (!normalized?.machineNo) {
        setScannerVisible(false);
        setMappingVisible(true);
        Alert.alert('Scan failed', 'Could not read a valid machine number from that code.');
        return;
      }
      setScannedMachine({ machineNo: normalized.machineNo, machineType: normalized.machineType });
    }
    setScannerVisible(false);
    setMappingVisible(true);
  }, [scanTarget]);
 
  const closeScanner = useCallback(() => {
    setScannerVisible(false);
    setMappingVisible(true);
  }, []); 
   const handleMappingContinue = useCallback(() => {
    if (!scannedDevice?.id || !scannedMachine?.machineNo) return;
    setPendingDevice({
      id: scannedDevice.id,
      machineNo: scannedMachine.machineNo,
      machineType: scannedMachine.machineType,
    });
    setMappingVisible(false);
    setConfirmVisible(true);
  }, [scannedDevice, scannedMachine]);

  const handleConfirmAdd = useCallback(() => {
    if (!pendingDevice?.id || !pendingDevice?.machineNo) return;
    setDevices((prev) => {
      if (prev.some((d) => d.id === pendingDevice.id)) return prev; // no duplicates
      return [...prev, pendingDevice];
    });
    setConfirmVisible(false);
    setPendingDevice(null);
    setScannedDevice(null);
    setScannedMachine(null);
  }, [pendingDevice]);

  const handleRemoveDevice = useCallback((deviceId) => {
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
  }, []);

  const handleSaveMapping = useCallback(() => { 
    Alert.alert('Mapping saved', `${devices.length} device(s) mapped to ${operation?.name}.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }, [devices.length, operation?.name, navigation]);

  const hasDevices = devices.length > 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />

      <View style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerTopRow}>
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={({ pressed }) => [styles.backPill, pressed && { opacity: 0.85 }]}
            >
              <Ionicons name="chevron-back" size={ms(15)} color={AppColors.onPrimary} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>Manage Operations</Text>
        </SafeAreaView>
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionLabel}>Operation Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailsIconWrap}>
            <Ionicons name="construct-outline" size={ms(20)} color={AppColors.primary} />
          </View>
          <View>
            <Text style={styles.detailsName}>{operation?.name}</Text>
            <View style={styles.detailsSubRow}>
              <Text style={styles.detailsSubText}>Seq. No: #{operation?.sequence}</Text>
              <Text style={[styles.detailsSubText, styles.detailsSubDivider]}>|</Text>
              <Text style={styles.detailsSubText}>Type: {operation?.machineType}</Text>
            </View>
          </View>
        </View>

        <View style={styles.mappedHeaderRow}>
          <Text style={styles.sectionLabel}>
            Mapped Devices{hasDevices ? ` (${devices.length})` : ''}
          </Text>
          <View style={styles.headerBtnsRow}>
            <Pressable style={styles.iconBtn} hitSlop={6} onPress={() => {}}>
              <Ionicons name="refresh" size={ms(15)} color={AppColors.textSecondary} />
            </Pressable>
            {hasDevices && (
              <Pressable
                style={[styles.iconBtn, styles.iconBtnPrimary]}
                hitSlop={6}
                onPress={openAddMapping}
              >
                <Ionicons name="add" size={ms(18)} color={AppColors.onPrimary} />
              </Pressable>
            )}
          </View>
        </View>

        {!hasDevices ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="phone-portrait-outline" size={ms(28)} color={AppColors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No device mapped</Text>
            <Text style={styles.emptySubtitle}>
              Scan a Qone device QR code to map it to this operation
            </Text>
            <Pressable
              style={({ pressed }) => [styles.addDeviceBtn, pressed && { opacity: 0.9 }]}
              onPress={openAddMapping}
            >
              <Ionicons name="add" size={ms(16)} color={AppColors.onPrimary} />
              <Text style={styles.addDeviceBtnText}>Add Qone Device</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.deviceList}>
            {devices.map((device) => (
              <View key={device.id} style={styles.deviceRow}>
                <View style={styles.deviceIconWrap}>
                  <Ionicons name="phone-portrait-outline" size={ms(16)} color={AppColors.primary} />
                </View>
                <View style={styles.deviceBody}>
                  <Text style={styles.deviceId}>{device.id}</Text>
                  <Text style={styles.deviceMachine}>{device.machineNo}</Text>
                </View>
                <Pressable
                  style={styles.deleteBtn}
                  hitSlop={6}
                  onPress={() => handleRemoveDevice(device.id)}
                >
                  <Ionicons name="trash-outline" size={ms(17)} color="#DC2626" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {hasDevices && (
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.92 }]}
            onPress={handleSaveMapping}
          >
            <Text style={styles.saveBtnText}>Save Mapping</Text>
          </Pressable>
        </View>
      )}

      <AddMappingSheet
        visible={mappingVisible}
        onClose={closeAddMapping}
        device={scannedDevice}
        machine={scannedMachine}
        onScanDevice={() => requestScan('device')}
        onScanMachine={() => requestScan('machine')}
        onContinue={handleMappingContinue}
        styles={styles}
      />

      <Modal
        visible={scannerVisible}
        animationType="slide"
        onRequestClose={closeScanner}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <ScannerScreen onScanSuccess={handleScanSuccess} onClose={closeScanner} />
      </Modal>

      <ConfirmDeviceModal
        visible={confirmVisible}
        device={pendingDevice}
        onClose={() => {
          setConfirmVisible(false);
          setPendingDevice(null);
        }}
        onConfirm={handleConfirmAdd}
        styles={styles}
      />
    </View>
  );
}
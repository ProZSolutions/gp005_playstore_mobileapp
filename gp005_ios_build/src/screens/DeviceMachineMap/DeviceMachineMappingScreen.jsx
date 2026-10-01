import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, Modal, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import { normalizeScannedDevice } from '../../utils/auditData';
import ScannerScreen from '../../components/ScannerScreen';
import DeviceMappingFlowScreen from './DeviceMappingFlowScreen';
import createStyles from '../styles/ManageOperationsStyles';
import { usePermissions, GROUP, ACTION } from '../../context/PermissionsContext';

import {
  createDeviceMapping,
  listDeviceMapping, 
  listDeviceList,
  listMachineList,
} from '../../api/services/deviceMappingService';
import { getShiftData } from '../../api/storage/authStorage';
import { showAlert } from '../../utils/AlertService';

const TEAL = AppColors.primary;
const SCAN_SIMULATION_DELAY_MS = 3000;
const PER_PAGE = 30;

function buildMockScanResult(target) {
  if (target === 'device') {
    return { id: `TLS-${Math.floor(1000 + Math.random() * 9000)}` };
  }
  return { machineNo: `MC-${Math.floor(1000 + Math.random() * 9000)}` };
}

 
const normalizeCode = (v) => (v === null || v === undefined ? '' : String(v).trim().toUpperCase());

function findDeviceRecord(deviceList, scannedId) {
  const target = normalizeCode(scannedId);
  if (!target) return null;
  return deviceList.find(
    (d) =>
      normalizeCode(d.tls_id) === target 
  );
}

function findMachineRecord(machineList, scannedMachineNo) {
   const target = normalizeCode(scannedMachineNo);
  if (!target) return null;
  return machineList.find(
    (m) => normalizeCode(m.machine_no) === target,
  );
}

const isAlreadyMapped = (record) => Number(record?.is_mapped) !== 0;

export default function DeviceMachineMappingScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs } = useResponsive();
  const styles = createStyles(ms, mvs, fs);
 
  const { can } = usePermissions();
  const canCreateMapping = can(GROUP.DEVICEMAPPING, ACTION.CREATE);
  const canListMapping = can(GROUP.DEVICEMAPPING, ACTION.LIST);

  const { order, operation } = route?.params ?? {};

   const [devices, setDevices] = useState(() => operation?.devices ?? []);

  // ── Pagination state for the mapped-devices list ──
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // ── Candidate pools used to validate scans (from /devicelist, /machinelist) ──
  const [deviceCandidates, setDeviceCandidates] = useState([]);
  const [machineCandidates, setMachineCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  // Flow modal is either closed (null) or open ('scan') — single step now.
  const [flowOpen, setFlowOpen] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);

  const [scannedDevice, setScannedDevice] = useState(null);
  const [scannedMachine, setScannedMachine] = useState(null);

  const scanTargetRef = useRef(null);
  const scanTimeoutRef = useRef(null); 
  const loadDeviceMappings = useCallback(async (pageNum, append) => {
    if (append) setLoadingMore(true);
    else setLoadingInitial(true);

    try {
      const result = await listDeviceMapping({
        tlsId: 'all',
        machineId: 'all',
        status: 'active',
        page: pageNum,
        perPage: PER_PAGE,
      });

      if (result.success) {
        const rows = result.data?.data ?? [];
        const pagination = result.data?.pagination ?? {};

        const mapped = rows.map((row) => ({
          id: row.tls_id ?? row.id,
          tls_code : row.tls_code,
          machineNo: row.machine_no ?? row.machine_id,
          machineType: row.machine_type ?? row.machineType,
          machineTypeName:row.machine_type_master?? 'No Name'
        }));

        setDevices((prev) => {
          const base = append ? prev : [];
          const existingIds = new Set(base.map((d) => d.id));
          const merged = [...base, ...mapped.filter((d) => !existingIds.has(d.id))];
          return merged;
        });

        setPage(pageNum);
        setHasMore(
          typeof pagination.totalPages === 'number'
            ? pageNum < pagination.totalPages
            : rows.length === PER_PAGE,
        );
      } else {
        setHasMore(false);
      }
    } finally {
      setLoadingInitial(false);
      setLoadingMore(false);
    }
  }, []);
 
  const loadCandidateLists = useCallback(async () => {
    setLoadingCandidates(true);
    try {
      const [deviceRes, machineRes] = await Promise.all([listDeviceList(), listMachineList()]);
      setDeviceCandidates(deviceRes.success ? deviceRes.data ?? [] : []);
      setMachineCandidates(machineRes.success ? machineRes.data ?? [] : []);
    } finally {
      setLoadingCandidates(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch the mapped-devices list if the user actually has list
    // permission for this group — no point calling an endpoint they'll
    // get a 403 from.
    if (canListMapping) {
      loadDeviceMappings(1, false);
    } else {
      setLoadingInitial(false);
    }
    loadCandidateLists();
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canListMapping]);

  const handleListScroll = useCallback(
    ({ nativeEvent }) => {
      if (loadingMore || !hasMore) return;

      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      const distanceFromBottom =
        contentSize.height - (contentOffset.y + layoutMeasurement.height);

      if (distanceFromBottom < 200) {
        loadDeviceMappings(page + 1, true);
      }
    },
    [loadingMore, hasMore, page, loadDeviceMappings],
  );

  const openAddMapping = useCallback(() => {
    if (!canCreateMapping) return;  
    setScannedDevice(null);
    setScannedMachine(null);
    setFlowOpen(true);
  }, [canCreateMapping]);

  const closeFlow = useCallback(() => {
    setFlowOpen(false);
    setScannedDevice(null);
    setScannedMachine(null);
  }, []);

   const handleScanSuccess = useCallback(
    (data, target) => {
      if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
            scanTimeoutRef.current = null;
        }
      const resolvedTarget = target ?? scanTargetRef.current;
      const normalized = normalizeScannedDevice(data);

      if (resolvedTarget === 'device') {
        const scannedId = normalized?.id;

        if (!scannedId) {
           setScannerVisible(false);
          setFlowOpen(true);
          return;
        }

        const matched = findDeviceRecord(deviceCandidates, scannedId);

        if (!matched) {
          showAlert('error', 'Device Not Found', 'Qone Device not found.');
          setScannerVisible(false);
          setFlowOpen(true);
          return;
        }

        if (isAlreadyMapped(matched)) {
          showAlert('error', 'Already Mapped', 'This device is already mapped.');
          setScannerVisible(false);
          setFlowOpen(true);
          return;
        }

        setScannedDevice({
          id: matched.code ?? scannedId,
          dbId: matched.tls_id,
          raw: matched,
        });
      } else if (resolvedTarget === 'machine') {
        const scannedMachineNo = normalized?.machineNo;

        if (!scannedMachineNo) {
          showAlert('error', 'Scan Failed', 'Could not read a machine number from that code. Please try again.');
          setScannerVisible(false);
          setFlowOpen(true);
          return;
        }

        const matched = findMachineRecord(machineCandidates, scannedMachineNo);

        if (!matched) {
          showAlert('error', 'Machine Not Found', 'Machine not found.');
          setScannerVisible(false);
          setFlowOpen(true);
          return;
        }

        if (isAlreadyMapped(matched)) {
          showAlert('error', 'Already Mapped', 'This machine is already mapped.');
          setScannerVisible(false);
          setFlowOpen(true);
          return;
        }

        setScannedMachine({
          machineNo: matched.machine_no,
          machineType: matched.machine_type_id ?? matched.machine_type ?? null,
          dbId: matched.id,
          raw: matched,
        });
      }

      setScannerVisible(false);
      setFlowOpen(true);
    },
    [deviceCandidates, machineCandidates],
  );

  const requestScan = useCallback(
    (target) => {
      if (loadingCandidates) {
        showAlert('info', 'Please Wait', 'Still loading device and machine data — try again in a moment.');
        return;
      }
      scanTargetRef.current = target;
      setFlowOpen(false);
      setScannerVisible(true);

      scanTimeoutRef.current = setTimeout(() => {
        handleScanSuccess(buildMockScanResult(target), target);
      }, SCAN_SIMULATION_DELAY_MS);
    },
    [handleScanSuccess, loadingCandidates],
  );

  const closeScanner = useCallback(() => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    setScannerVisible(false);
    setFlowOpen(true);
  }, []);

  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    };
  }, []);
 
  const handleConfirmMapping = useCallback(async () => {
    if (!scannedDevice?.id || !scannedMachine?.machineNo) return;

    const newDevice = {
      id: scannedDevice.id,
      machineNo: scannedMachine.machineNo,
      machineType: scannedMachine.machineType ?? operation?.machineType,
    };

    setDevices((prev) => {
      if (prev.some((d) => d.id === newDevice.id)) return prev;
      return [...prev, newDevice];
    });

    closeFlow();

    try {
      const shift = await getShiftData();
      const result = await createDeviceMapping({
        tlsId: scannedDevice.dbId,
        machineId: scannedMachine.dbId,
        shiftId: shift?.shift_id ?? null,
      });

      console.log("DEVICE Mappind resu "+JSON.stringify(result));
      if (result.success) { 
        if (canListMapping) {
          await Promise.all([loadDeviceMappings(1, false), loadCandidateLists()]);
        } else {
          await loadCandidateLists();
        }
      }
    } catch (e) {
      console.warn('createDeviceMapping failed:', e.message);
    }
  }, [scannedDevice, scannedMachine, operation?.machineType, closeFlow, loadDeviceMappings, loadCandidateLists, canListMapping]);

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
          <Text style={styles.title}>Device & Machine Mapping</Text>
        </SafeAreaView>
      </View>

      <View style={styles.body}>
        <View style={[styles.mappedHeaderRow, { justifyContent: 'flex-end' }]}>
          {hasDevices && canCreateMapping && (
            <Pressable
              style={[styles.iconBtn, styles.iconBtnPrimary]}
              hitSlop={6}
              onPress={openAddMapping}
            >
              <Ionicons name="add" size={ms(18)} color={AppColors.onPrimary} />
            </Pressable>
          )}
        </View>

        {!canListMapping ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="lock-closed-outline" size={ms(28)} color={AppColors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Access</Text>
            <Text style={styles.emptySubtitle}>
              You do not have permission to view device mappings.
            </Text>
          </View>
        ) : loadingInitial ? (
          <View style={{ paddingTop: 40, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={AppColors.primary} />
          </View>
        ) : hasDevices ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.deviceList}
            onScroll={handleListScroll}
            scrollEventThrottle={100}
          >
            {devices.map((device) => (
              <View key={device.id} style={styles.deviceRow}>
                <View style={styles.deviceIconWrap}>
                  <Ionicons name="phone-portrait-outline" size={ms(16)} color={AppColors.primary} />
                </View>
                <View style={styles.deviceBody}>
                  <Text style={styles.deviceId}> {`${device.id} - ${device.tls_code}`}</Text>
                  <Text style={styles.deviceMachine}>{`${device.machineNo} - ${device.machineTypeName}`}</Text>
                </View>
              </View>
            ))}
            {loadingMore && (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={AppColors.primary} />
              </View>
            )}
          </ScrollView>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="phone-portrait-outline" size={ms(28)} color={AppColors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No mappings yet</Text>
            <Text style={styles.emptySubtitle}>
              {canCreateMapping
                ? 'Scan a Qone device and a machine to create your first device-machine mapping.'
                : 'You do not have permission to create device mappings.'}
            </Text>
            {canCreateMapping && (
              <Pressable
                style={({ pressed }) => [styles.addDeviceBtn, pressed && { opacity: 0.9 }]}
                onPress={openAddMapping}
              >
                <Text style={styles.addDeviceBtnText}>Start Scanning</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      <Modal
        visible={flowOpen}
        animationType="slide"
        onRequestClose={closeFlow}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <DeviceMappingFlowScreen
          onCancel={closeFlow}
          device={scannedDevice}
          machine={scannedMachine}
          onScanDevice={() => requestScan('device')}
          onScanMachine={() => requestScan('machine')}
          onConfirm={handleConfirmMapping}
        />
      </Modal>

      <Modal
        visible={scannerVisible}
        animationType="slide"
        onRequestClose={closeScanner}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <ScannerScreen
          onScanSuccess={(data) => handleScanSuccess(data, scanTargetRef.current)}
          onClose={closeScanner}
        />
      </Modal>
    </View>
  );
}
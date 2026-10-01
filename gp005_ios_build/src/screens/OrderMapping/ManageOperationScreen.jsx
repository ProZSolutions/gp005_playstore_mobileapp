import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, Modal, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import { normalizeScannedDevice } from '../../utils/auditData';
import ScannerScreen from '../../components/ScannerScreen';
import ConfirmDeviceModal from '../../components/ConfirmDeviceModal';
import createStyles from '../styles/ManageOperationsStyles';
import { listDeviceMapping } from '../../api/services/deviceMappingService';
import { createLineMapping,deleteLineMapping } from '../../api/services/lineMappingService';
import { getUser, getShiftData } from '../../api/storage/authStorage';
import { showAlert } from '../../utils/AlertService';
import { mapMappingToDevice } from '../../utils/orderMappingHelpers';
import { PAGE_SIZE } from '../../api/storage/authStorage';
import { usePermissions, GROUP, ACTION } from '../../context/PermissionsContext';
 
const TEAL = AppColors.primary;
const DEVICEMAPPING_LOOKUP_PAGE_SIZE = PAGE_SIZE;

const normalizeCode = (v) => (v === null || v === undefined ? '' : String(v).trim().toUpperCase());

function getRows(result) {
  return Array.isArray(result?.data?.data) ? result.data.data : [];
}

function findDeviceMachineRecord(records, scannedId) {
  console.log("records "+JSON.stringify(records)+" scanned "+scannedId);
  const target = normalizeCode(scannedId);
  if (!target) return null;
  return records.find(
    (r) => normalizeCode(r.tls_code) === target || normalizeCode(r.tls_id) === target,
  );
}

export default function ManageOperationsScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs } = useResponsive();
  const styles = createStyles(ms, mvs, fs);

  const { can } = usePermissions();
    const canCreateMapping = can(GROUP.LINEMAPPING, ACTION.CREATE);
    const canDelete = can(GROUP.LINEMAPPING, ACTION.DELETE); 
  const { user, order, operation, lineId, lineName, shiftId, zoneIds, zoneNames } = route?.params ?? {};
  const [deletingId, setDeletingId] = useState(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [pendingDevice, setPendingDevice] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
 
  const [devices, setDevices] = useState(() =>
    Array.isArray(operation?.mappings) ? operation.mappings.map(mapMappingToDevice) : [],
  );

   useEffect(() => {
    setDevices(Array.isArray(operation?.mappings) ? operation.mappings.map(mapMappingToDevice) : []);
  }, [operation?.mappings]);

  const [deviceMachineRecords, setDeviceMachineRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  const loadDeviceMachineRecords = useCallback(async () => {
    setLoadingRecords(true);
    try {
      const result = await listDeviceMapping({
        tlsId: 'all',
        machineId: 'all',
        status: 'active',
        page: 1,
        perPage: DEVICEMAPPING_LOOKUP_PAGE_SIZE,
      });

      setDeviceMachineRecords(result.success ? getRows(result) : []);
    } catch (e) {
      console.warn('[loadDeviceMachineRecords] failed:', e.message);
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  useEffect(() => {
    loadDeviceMachineRecords();
  }, []);

   const handleResetDevices = useCallback(() => {
    setDevices(Array.isArray(operation?.mappings) ? operation.mappings.map(mapMappingToDevice) : []);
  }, [operation?.mappings]);

  const handleScanSuccess = useCallback(
    (data) => {
      setScannerVisible(false);

      try {
        const normalized = normalizeScannedDevice(data);
        const scannedId = normalized?.id ?? (typeof data === 'string' ? data.trim() : null);

        if (!scannedId) {
          showAlert('error', 'Scan Failed', 'Could not read a Qone device ID from that code. Please try again.');
          return;
        }

        const matched = findDeviceMachineRecord(deviceMachineRecords, scannedId);

        if (!matched) {
          showAlert(
            'error',
            'Device Not Found',
            'This Qone device is not mapped to a machine yet. Map it first before adding it to an operation.',
          );
          return;
        }

        const alreadyOnThisOperation = devices.some(
          (d) => normalizeCode(d.id) === normalizeCode(matched.tls_code ?? matched.tls_id),
        );
        if (alreadyOnThisOperation) {
          showAlert('error', 'Already Added', 'This device is already mapped to this operation.');
          return;
        }
         setPendingDevice({
          id: matched.tls_id ?? matched.tls_id ?? scannedId,
          tls_code:matched.tls_code,
          dbId: matched.tls_id,
          machineNo: matched.machine_no,
          machineType: matched.machine_type ??matched.machine_type_name ?? operation?.machineType,
          machineDbId: matched.machine_id,
          raw: matched,
        });
        setConfirmVisible(true);
      } catch (e) {
        console.warn('[handleScanSuccess] threw:', e.message);
        showAlert('error', 'Scan Error', 'Something went wrong reading that device. Please try again.');
      }
    },
    [deviceMachineRecords, devices, operation?.machineType],
  );

  const openScanner = useCallback(() => {
    if (loadingRecords) {
      showAlert('info', 'Please Wait', 'Still loading device data — try again in a moment.');
      return;
    }
    setScannerVisible(true);
  }, [loadingRecords]);

  const closeScanner = useCallback(() => {
    setScannerVisible(false);
  }, []);

  const handleConfirmAdd = useCallback(async () => {
    console.log('handleConfirmAdd');
    if (!pendingDevice?.dbId) return;

    setSubmitting(true);
    try {
      const shift = await getShiftData();
       const payload = {
        order_id: order?.id,
        style_id: order?.styleId,
        line_id: lineId ?? order?.lineId,
        operation_id: operation?.id,
        seq_no: operation?.sequence,
        color: order?.colour,
        tls_id: pendingDevice.dbId,
        machine_id: pendingDevice.machineDbId,
        shift_id: shiftId ?? shift?.shift_id,
      };
      console.log('create line mapping ', JSON.stringify(payload));
      const result = await createLineMapping(payload);

      if (!result.success) {
        showAlert('error', 'Mapping Failed', result.message ?? 'Could not create the mapping. Please try again.');
        return;
      }

      setConfirmVisible(false);
      setPendingDevice(null);

      showAlert('success', 'Mapping Saved', `Qone device mapped to ${operation?.name}.`);
      navigation.reset({
        index: 0,
        routes: [{
          name: 'OperationListScreen',
          params: {
            user,
            order,
            zoneIds,
            zoneNames,
            lineId: lineId ?? order?.lineId,
            lineName,
            shiftId: shiftId ?? shift?.shift_id,
          },
        }],
      });
    } catch (e) {
      console.warn('[handleConfirmAdd] failed:', e.message);
      showAlert('error', 'Mapping Failed', 'Could not create the mapping. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [pendingDevice, order, operation, lineId, shiftId, navigation, user]);

  const handleRemoveDevice = useCallback((device) => {
  showAlert('confirm', 'Remove Device', 'Are you sure you want to remove this device from the operation?', {
    icon: 'delete-outline',
    buttons: [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          if (!device?.uuid) {
            showAlert('error', 'Remove Failed', 'Missing mapping reference for this device.');
            return;
          }

          setDeletingId(device.id);
          try {
            console.log("delete device ID "+JSON.stringify(device.uuid));
            const result = await deleteLineMapping(device.uuid);
            console.log(" deleted response "+JSON.stringify(result));
            if (!result.success) {
              showAlert('error', 'Remove Failed', result.message ?? 'Could not remove the device. Please try again.');
              return;
            }

            setDevices((prev) => prev.filter((d) => d.id !== device.id));
            showAlert('success', 'Device Removed', 'The device has been unmapped from this operation.');
          } catch (e) {
            console.warn('[handleRemoveDevice] failed:', e.message);
            showAlert('error', 'Remove Failed', 'Could not remove the device. Please try again.');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ],
  });
}, []);

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
           <View style={styles.titleRow}>
                      <Text style={styles.title}>Manage Operations</Text>
                      <View style={styles.lineBadge}>
                        <Text style={styles.lineBadgeText}>{lineName}</Text>
                      </View>
                    </View>
        </SafeAreaView>
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionLabelHeader}>Operation Details</Text>
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
          <Text style={styles.sectionLabelHeader}>
            Mapped Devices{hasDevices ? ` (${devices.length})` : ''}
          </Text>
          <View style={styles.headerBtnsRow}>
          {/*   <Pressable style={styles.iconBtn} hitSlop={6} onPress={handleResetDevices}>
              <Ionicons name="refresh" size={ms(15)} color={AppColors.textSecondary} />
            </Pressable>*/}
            {hasDevices && canCreateMapping && (
              <Pressable
                style={[styles.iconBtn, styles.iconBtnPrimary]}
                hitSlop={6}
                onPress={openScanner}
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
              onPress={openScanner}
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
        <Text style={styles.deviceId}>{`${device.id} - ${device.tls_no}`}</Text>
        <Text style={styles.deviceMachine}>{`${device.machineNo} - ${device.machineType}`}</Text>
      </View>

      {canDelete && (
        <Pressable
          style={styles.deleteBtn}
          hitSlop={6}
          disabled={deletingId === device.id}
          onPress={() => handleRemoveDevice(device)}
        >
          {deletingId === device.id ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <Ionicons name="trash-outline" size={ms(17)} color="#DC2626" />
          )}
        </Pressable>
      )}
    </View>
  ))}
</ScrollView>
        )}
      </View>

      <Modal
        visible={scannerVisible}
        animationType="slide"
        onRequestClose={closeScanner}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <ScannerScreen visible={scannerVisible} onScanSuccess={handleScanSuccess} onClose={closeScanner} />
      </Modal>

      <ConfirmDeviceModal
        visible={confirmVisible}
        device={pendingDevice}
        loading={submitting}
        onClose={() => {
          if (submitting) return;
          setConfirmVisible(false);
          setPendingDevice(null);
        }}
        onConfirm={handleConfirmAdd}
        styles={styles}
      />
    </View>
  );
}
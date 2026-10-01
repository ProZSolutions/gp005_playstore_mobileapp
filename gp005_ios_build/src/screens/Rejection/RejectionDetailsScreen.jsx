import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StatusBar,
  Switch,
  TextInput,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

import reworkService, { mapOrderSizes } from '../../api/services/rejectionService';
import { getShiftData, PAGE_SIZE ,getSelectedLineId} from '../../api/storage/authStorage';
import { verifyAndGetSlot } from '../../utils/slotVerification';
import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import createStyles from '../styles/InputManagementStyles';
import ScannerScreen from '../../components/ScannerScreen';

import DefectEntrySheet from '../../components/DefectSingleEntrySheet';
import SelectSizeSheet from '../../components/SelectSizeSheet';
import SelectOperatorSheet from '../../components/SelectOperatorSheet';
import SelectOperationSheet from '../../components/SelectOperationSheet';
import { getCategoryDropdown } from '../../api/services/tlsService';
import { usePermissions, GROUP, ACTION } from '../../context/PermissionsContext';
import { reworklistDeviceMapping } from '../../api/services/deviceMappingService';
import { normalizeScannedDevice } from '../../utils/auditData';
import { showAlert } from '../../utils/AlertService';

const TEAL = AppColors.primary;

const SEVERITY_RANK = { Critical: 3, Major: 2, Minor: 1 };
 
const DEVICEMAPPING_LOOKUP_PAGE_SIZE = PAGE_SIZE;

const normalizeCode = (v) => (v === null || v === undefined ? '' : String(v).trim().toUpperCase());

function getRows(result) {
  return Array.isArray(result?.data?.data) ? result.data.data : [];
}

function findDeviceMachineRecord(records, scannedId) {
  console.log("Scanned Details "+JSON.stringify(records));
  const target = normalizeCode(scannedId);
  if (!target) return null;
  return records.find(
    (r) =>  normalizeCode(r.tls_id) === target,
  );
}

function DetailRow({ label, value, onPress, chevron, placeholder, disabled, styles }) {
  const isEmpty = value === undefined || value === null || value === '';
  const content = (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, disabled && styles.detailLabelDisabled]}>{label}</Text>
      <View style={styles.detailValueRow}>
        <Text
          style={[
            styles.detailValue,
            isEmpty && styles.detailValuePlaceholder,
            disabled && styles.detailValueDisabled,
          ]}
        >
          {isEmpty ? placeholder ?? '—' : value}
        </Text>
        {chevron && (
          <Icon
            name="chevron-right"
            size={16}
            color={disabled ? AppColors.border : AppColors.primaryDark}
            style={styles.detailChevron}
          />
        )}
      </View>
    </View>
  );

  if (!onPress || disabled) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.7 }}>
      {content}
    </Pressable>
  );
}

export default function ReworkDetailsScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs } = useResponsive();
  const styles = createStyles(ms, mvs, fs);

  const {
    order,
    operator,
    user,
    zone,
    line,
    scannedTlsId,
  } = route?.params ?? {};
 
  const { can } = usePermissions();
  const canCreateRework = can(GROUP.REJECTION, ACTION.CREATE);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [sizeSheetVisible, setSizeSheetVisible] = useState(false);
  const [defectSheetVisible, setDefectSheetVisible] = useState(false);
  const [operatorSheetVisible, setOperatorSheetVisible] = useState(false);
  const [operationSheetVisible, setOperationSheetVisible] = useState(false);
  const [outputBalance, setOutputBalance] = useState('—');
  const [wipVal, setwipVal] = useState('—');
  const [balanceLoading, setBalanceLoading] = useState(false);

  const [selectedSize, setSelectedSize] = useState(null); 
  const [defectEntries, setDefectEntries] = useState({});
  const [notes, setNotes] = useState('');
  const [autoAssign, setAutoAssign] = useState(true);
  const [assignManually, setAssignManually] = useState(false);

  const [selectedOperator, setSelectedOperator] = useState(null);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [shiftId, setShiftId] = useState(null);
  const teamId = null; 
  const [slotInfo, setSlotInfo] = useState(null); 
  const [deviceMachineRecords, setDeviceMachineRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  useEffect(() => {
  let cancelled = false;
  (async () => {
    const storedLineId = await getSelectedLineId();
    console.log(" stored id "+storedLineId);

    if (!storedLineId) {
      console.warn('Rejection DetailsScreen: no stored lineId available for slot verification');
      return;
    }
    const { slot } = await verifyAndGetSlot({
      lineId: storedLineId,
      navigation,
      listRouteName: 'RejectionTrackerList',
    });
    if (!cancelled) setSlotInfo(slot);
  })();

  return () => { cancelled = true; };
}, [navigation]);
  const loadDeviceMachineRecords = useCallback(async () => {
    setLoadingRecords(true);
    try {
      const result = await reworklistDeviceMapping({
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
  }, [loadDeviceMachineRecords]);

  const sizeOptions = useMemo(
    () => mapOrderSizes(order?.orderSizes),
    [order?.orderSizes],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCategoriesLoading(true);
      try {
        const cats = await getCategoryDropdown();
        if (!cancelled) setCategories(cats);
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const shift = await getShiftData();
        if (!cancelled) setShiftId(shift?.shift_id ?? null);
      } catch (e) {
        console.warn('Rejection DetailsScreen: failed to load shift data', e.message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const totalDefectCount = useMemo(
    () => Object.values(defectEntries).reduce((sum, e) => sum + (e.qty ?? 0), 0),
    [defectEntries],
  );

  const topDefect = useMemo(() => {
    const list = Object.values(defectEntries);
    if (list.length === 0) return null;
    return [...list].sort((a, b) => {
      const rankDiff = (SEVERITY_RANK[b.severity_name] ?? 0) - (SEVERITY_RANK[a.severity_name] ?? 0);
      if (rankDiff !== 0) return rankDiff;
      return (b.qty ?? 0) - (a.qty ?? 0);
    })[0];
  }, [defectEntries]);
 
  const handleAutoAssignToggle = (val) => {
    setAutoAssign(val);
    if (val) {
      setAssignManually(false);
      setSelectedOperator(null);
      setSelectedOperation(null);
    }
  }; 
  const handleAssignManuallyToggle = (val) => {
    setAssignManually(val);
    if (val) {
      setAutoAssign(false);
    }
  };

  useEffect(() => {
    if (!order?.id) return;

    const lineId = Array.isArray(line) ? line[0] : line;

    let cancelled = false;
    (async () => {
      setBalanceLoading(true); 
      try {
        const result = await reworkService.getWipBalance({
          orderId: order.id,
          lineId,
        });
        if (!cancelled && result.success) {
          setOutputBalance(result.wipCount);
          setwipVal(result.wipCount);
        }
      } finally {
        if (!cancelled) setBalanceLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [order?.id, line]); 
  const operatorSectionDisabled = !assignManually;
  const requiresManualAssignment = assignManually;

  const submitDisabled =
    scannerVisible ||
    !selectedSize ||
    totalDefectCount === 0 || wipVal ===0 ||
    (requiresManualAssignment && (!selectedOperator || !selectedOperation)); 
  const requiresScan = autoAssign ; 
  const submitButtonText = requiresScan ? 'Scan Qone QR' : 'Submit';
  const goToOperationDetails = useCallback((scanResult) => {
    const lineId = Array.isArray(line) ? line[0] : line;
     navigation.navigate('RejectionOperationDetailsScreen', {
      order,
      operator,
      user,
      zone,
      line,
      lineId,
      shiftId,
      teamId,
      slotId: slotInfo?.id ?? null,
      slot: slotInfo,
      scannedTlsId,
      outputBalance,
      wipVal,
      selectedSize,
      totalDefectCount,
      topDefect,
      notes,
      machineType: scanResult?.machine_type_name ??selectedOperation?.machineType  ,
      autoAssign,
      assignManually,
      selectedOperator: requiresManualAssignment ? selectedOperator : null,
      selectedOperation: requiresManualAssignment ? selectedOperation : null,
      tlsId: scanResult?.tlsId ?? null,
      machineId: scanResult?.machineId ?? null,
      machineTypeId: scanResult?.machineTypeId ?? null,
    });
  }, [
    navigation,
    order,
    operator,
    user,
    zone,
    line,
    shiftId,
    teamId,
    slotInfo,
    scannedTlsId,
    outputBalance,
    selectedSize,
    totalDefectCount,
    topDefect,
    notes,
    autoAssign,
    assignManually,
    requiresManualAssignment,
    selectedOperator,
    selectedOperation,
  ]);
 
  const handleSubmit = useCallback(() => {
    if (submitDisabled) return;
    if (requiresScan) {
      if (loadingRecords) {
        showAlert('info', 'Please Wait', 'Still loading device data — try again in a moment.');
        return;
      }
      setScannerVisible(true);
    } else {
      goToOperationDetails(null);
    }
  }, [submitDisabled, requiresScan, loadingRecords, goToOperationDetails]); 
  const handleScanSuccess = useCallback((data) => {
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
          'This Qone device is not mapped to a machine yet. Map it first before using it here.',
        );
        return;
      }

      goToOperationDetails({
        tlsId: matched.tls_id ?? scannedId,
        machineId: matched.machine_id ?? null,
        machineTypeId: matched.machine_type_id ?? null,
        machine_type_name :matched.machine_type_name ?? 'No name'
      });
    } catch (e) {
      console.warn('[handleScanSuccess] threw:', e.message);
      showAlert('error', 'Scan Error', 'Something went wrong reading that device. Please try again.');
    }
  }, [deviceMachineRecords, goToOperationDetails]);

  const closeScanner = useCallback(() => {
    setScannerVisible(false);
  }, []);

  if (!order) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={TEAL} />
        <SafeAreaView style={styles.emptyWrap}>
          <Icon name="alert-circle" size={ms(28)} color={AppColors.textTertiary} />
          <Text style={styles.emptyText}>No order selected.</Text>
          <Pressable onPress={() => navigation?.goBack?.()} style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>Back</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />

      <View style={styles.headerWrap}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTopLeft}>
              <Pressable
                onPress={() => navigation?.goBack?.()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}
              >
                <Icon name="chevron-left" size={ms(18)} color={AppColors.onPrimary} />
              </Pressable>
              {/* <Text style={styles.orderIdText} numberOfLines={1}>{order.tlsCode}</Text>*/}
            </View>
          </View>

          <Text style={styles.titleText}>Rejection</Text>

          <View style={styles.metaWrap}>
            <View style={styles.metaRow}>
              <Icon name="layers" size={ms(14)} color={AppColors.onPrimary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{operator?.lineNo ?? line ?? '—'}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>WIP - {wipVal}</Text>
             {/*  {slotInfo?.slot_name ? (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>Slot - {slotInfo.slot_name}</Text>
                </>
              ) : null} */}
            </View>
            <View style={styles.metaRow}>
              <Icon name="tag" size={ms(14)} color={AppColors.onPrimary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{order.orderCode ?? order.tlsCode}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{order.colour}</Text>
            </View>
            <View style={styles.metaRow}>
              <Icon name="shopping-bag" size={ms(14)} color={AppColors.onPrimary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{order.buyer}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{order.styleNo}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{order.style}</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.body}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="corner-up-left" size={ms(15)} color={AppColors.primaryDark} />
              <Text style={styles.sectionHeaderText}>OUTPUT DETAILS</Text>
            </View>
            <View style={styles.sectionBody}>
              <DetailRow
                styles={styles}
                label="Output Balance"
                value={balanceLoading ? 'Loading…' : String(outputBalance)}
              />
            </View>
          </View>

           <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="file-text" size={ms(15)} color={AppColors.primaryDark} />
              <Text style={styles.sectionHeaderText}>REJECTION DETAILS</Text>
              <Text style={styles.requiredDot}>*</Text>
            </View>
            <View style={styles.sectionBody}>
              <DetailRow
                styles={styles}
                label="Size"
                value={selectedSize?.label}
                placeholder="Select Size"
                onPress={() => setSizeSheetVisible(true)}
                chevron
              />
              <DetailRow
                styles={styles}
                label="Defect Found"
                value={totalDefectCount > 0 ? String(totalDefectCount) : undefined}
                placeholder="Select Defects"
                onPress={() => setDefectSheetVisible(true)}
                chevron
              />
               
              <DetailRow
                styles={styles}
                label="Defect Category"
                value={topDefect?.category_name}
                placeholder="—"
              />
            </View>
          </View>

          {/* ASSIGN OPERATOR */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="user" size={ms(15)} color={AppColors.primaryDark} />
              <Text style={styles.sectionHeaderText}>ASSIGN OPERATOR</Text>
            </View>
            <View style={styles.sectionBody}>
              <View style={styles.switchRow}>
                <Text style={styles.detailLabel}>Auto Assign Operator</Text>
                <Switch
                  value={autoAssign}
                  onValueChange={handleAutoAssignToggle}
                  trackColor={{ true: TEAL, false: AppColors.border }}
                  thumbColor={AppColors.onPrimary}
                />
              </View>
              <View style={[styles.switchRow, styles.switchRowBorder]}>
                <Text style={styles.detailLabel}>Assign Manually</Text>
                <Switch
                  value={assignManually}
                  onValueChange={handleAssignManuallyToggle}
                  trackColor={{ true: TEAL, false: AppColors.border }}
                  thumbColor={AppColors.onPrimary}
                />
              </View>
            </View>
          </View>

          {/* OPERATOR & OPERATION DETAILS — always visible; fields disabled
              unless Assign Manually is on (both-off and auto-assign cases
              don't require them). */}
          <View style={[styles.sectionCard, operatorSectionDisabled && styles.sectionCardDisabled]}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="user" size={ms(15)} color={operatorSectionDisabled ? AppColors.textTertiary : AppColors.primaryDark} />
              <Text style={[styles.sectionHeaderText, operatorSectionDisabled && styles.sectionHeaderTextDisabled]}>
                OPERATOR & OPERATION DETAILS
              </Text>
              {!operatorSectionDisabled && <Text style={styles.requiredDot}>*</Text>}
            </View>
            <View style={styles.sectionBody}>
              <DetailRow
                styles={styles}
                label="Employee Name"
                value={selectedOperator?.name}
                placeholder="Select Employee"
                onPress={() => setOperatorSheetVisible(true)}
                chevron
                disabled={operatorSectionDisabled}
              />
              <DetailRow
                styles={styles}
                label="Operation"
                value={selectedOperation?.label ?? deviceMachineRecords?.operation_name  }
                placeholder="Select Operation"
                onPress={() => setOperationSheetVisible(true)}
                chevron
                disabled={operatorSectionDisabled}
              />
              <DetailRow
                styles={styles}
                label="Machine Type"
                value={selectedOperation?.machineType ?? deviceMachineRecords?.machine_type_name }
                placeholder="-"
                disabled={operatorSectionDisabled}
              />
            </View>
          </View>

        {/*  <View style={styles.sectionCard}>
            <Text style={styles.notesLabel}>NOTES</Text>
            <View style={styles.notesInputWrap}>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Enter your notes..."
                placeholderTextColor={AppColors.textTertiary}
                style={styles.notesInput}
                multiline
              />
            </View>
          </View>*/}  
        </ScrollView>
      </View>

      {canCreateRework ? (
        <View style={styles.footer}>
          <Pressable
            disabled={submitDisabled}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitBtn,
              submitDisabled && styles.submitBtnDisabled,
              pressed && !submitDisabled && { opacity: 0.9 },
            ]}
          >
            {scannerVisible ? (
              <ActivityIndicator size="small" color={AppColors.onPrimary} />
            ) : (
              <Text style={[styles.submitBtnText, submitDisabled && styles.submitBtnTextDisabled]}>
                {submitButtonText}
              </Text>
            )}
          </Pressable>
        </View>
      ) : (
        <View style={styles.footer}>
          <Text style={styles.emptyText}>You do not have permission to submit rejection.</Text>
        </View>
      )}

      <SelectSizeSheet
        visible={sizeSheetVisible}
        onClose={() => setSizeSheetVisible(false)}
        sizes={sizeOptions}
        selectedId={selectedSize?.id}
        onApply={setSelectedSize}
        emptylabel="rejection"
      />

      <DefectEntrySheet
        visible={defectSheetVisible}
        onClose={() => setDefectSheetVisible(false)}
        categories={categories}
        initialEntries={defectEntries}
        onApply={setDefectEntries}
        maxSelections={1}
      />

      <SelectOperatorSheet
        visible={operatorSheetVisible}
        onClose={() => setOperatorSheetVisible(false)}
        selectedId={selectedOperator?.id}
        onApply={setSelectedOperator}
        teamId={teamId}
        shiftId={shiftId}
      />

      <SelectOperationSheet
        visible={operationSheetVisible}
        onClose={() => setOperationSheetVisible(false)}
        selectedId={selectedOperation?.id}
        onApply={setSelectedOperation}
        teamId={teamId}
        shiftId={shiftId}
        order={order}
      />

      {canCreateRework && (
        <Modal
          visible={scannerVisible}
          animationType="slide"
          onRequestClose={closeScanner}
          statusBarTranslucent={Platform.OS === 'android'}
        >
          <ScannerScreen visible={scannerVisible} onScanSuccess={handleScanSuccess} onClose={closeScanner} />
        </Modal>
      )}
    </View>
  );
}
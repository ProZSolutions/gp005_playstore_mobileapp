import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, Modal, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import createStyles from '../styles/IssueDetailStyles';
import { checkDeviceMapping } from '../../api/services/tlsService';
import { showAlert } from '../../utils/AlertService';
import { usePermissions, GROUP, ACTION } from '../../context/PermissionsContext';
import { verifyAndGetSlot } from '../../utils/slotVerification';

import ScannerScreen from '../../components/ScannerScreen';
import OrderDetailsSheet from '../../components/OrderDetailsSheet';
import ManagerOverrideMenu from '../../components/ManagerOverrideMenu';
import CloseWithoutCapModal from '../../components/CloseWithoutCapModal';
import { getSelectedLineId } from '../../api/storage/authStorage';
const TEAL = AppColors.primary;

function formatStopwatch(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function DetailRow({ label, value, styles, bordered, italic, live, multiline }) {
  if (multiline) {
    return (
      <View style={[styles.detailRowMultiline, bordered && styles.detailRowBorder]}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[  italic && styles.detailValueItalic]}>
          {value}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.detailRow, bordered && styles.detailRowBorder]}>
      <Text style={styles.detailLabel} numberOfLines={1}>
        {label}
      </Text>

      {live ? (
        <View style={styles.liveValueRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveValueText} numberOfLines={1} ellipsizeMode="tail">
            {value}
          </Text>
        </View>
      ) : (
        <Text
          style={[styles.detailValue, italic && styles.detailValueItalic]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value}
        </Text>
      )}
    </View>
  );
}

 
const createChipStyles = (ms, mvs, fs, isLargeScreen) =>
  StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: isLargeScreen ? 16 : ms(14),
      paddingHorizontal: isLargeScreen ? 14 : ms(10),
      paddingVertical: isLargeScreen ? 8 : mvs(5),
      marginLeft: isLargeScreen ? 8 : ms(6),
      marginBottom: isLargeScreen ? 8 : mvs(6),
      maxWidth: isLargeScreen ? 220 : ms(140),
    },
    chipText: {
      fontSize: isLargeScreen ? 23 : fs(14),
      fontWeight: '600',
      color: AppColors.black ?? AppColors.primary,
    },
    moreChip: { backgroundColor: AppColors.lineOrange },
    moreChipText: { color: AppColors.white },
  });

function CapChipsRow({ items = [], styles, chipStyles, onPressMore, ms }) {
  const visible = items.slice(0, 1);
  const remaining = items.length - visible.length;

  return (
    <View style={[styles.detailRow, styles.detailRowBorder]}>
      <Text style={styles.detailLabel}>CAP Taken</Text>
      {items.length === 0 ? (
        <Text style={styles.detailValue}>—</Text>
      ) : (
        <Pressable
          onPress={onPressMore}
          style={chipStyles.wrap}
          disabled={remaining === 0}
        >
          {visible.map((label, i) => (
            <View key={`${label}-${i}`} style={chipStyles.chip}>
              <Text style={chipStyles.chipText} numberOfLines={1}>
                {label}
              </Text>
            </View>
          ))}

          {remaining > 0 && (
            <View style={[chipStyles.chip, chipStyles.moreChip]}>
              <Text style={[chipStyles.chipText, chipStyles.moreChipText]}>
                +{remaining}
              </Text>
            </View>
          )}

          <Ionicons
            name="chevron-forward"
            size={ms(16)}
            color={AppColors.primary}
            style={{
              marginLeft: ms(4),
              alignSelf: 'center',
            }}
          />
        </Pressable>
      )}
    </View>
  );
}

function CapTakenListModal({ visible, items = [], onClose, styles, chipStyles, ms, mvs, isLargeScreen }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.capTakenOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.capTakenSheet,
            isLargeScreen && { maxWidth: 640, alignSelf: 'center', width: '100%', borderRadius: 24 },
          ]}
          onPress={() => {}}
        >
          <View style={styles.sheetLabelRow}>
            <Text style={styles.sheetLabel}>CAP Taken ({items.length})</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={ms(20)} color={AppColors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView style={{ maxHeight: isLargeScreen ? 420 : 320 }} showsVerticalScrollIndicator={false}>
            {items.map((item, i) => (
              <View key={`${item}-${i}`} style={[styles.capOptionRow, { marginBottom: mvs(8) }]}>
                <Text style={styles.capOptionText}>{item}</Text>
              </View>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function QCDefectInformationScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs, isLargeScreen } = useResponsive();
  const styles = createStyles(ms, mvs, fs);
  const chipStyles = React.useMemo(
    () => createChipStyles(ms, mvs, fs, isLargeScreen),
    [ms, mvs, fs, isLargeScreen],
  );

  const issue = route?.params?.issue;
   const auditDate = new Date(issue.raw.work_audit_at);
  const currentDate = new Date();
   const diffMs = currentDate - auditDate;  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const activeLineId = issue?.raw?.line_id;
  // Permission gate: viewing an individual QC issue's detail.
  const { canView, can, loading: permsLoading } = usePermissions();
  const canViewDefect = canView(GROUP.QCVERIFICATION) && can(GROUP.QCVERIFICATION, ACTION.SHOW);

  const [detailsVisible, setDetailsVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [closeCapVisible, setCloseCapVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [capListVisible, setCapListVisible] = useState(false);
  const [checkingDevice, setCheckingDevice] = useState(false);
  const [slotInfo, setSlotInfo] = useState(null);
 const user =  route?.params?.user; 
   const userinfo = user?.name+" ("+user?.employee_code+")";
  const defectScreenEntryRef = useRef(new Date().toISOString());
  const scanSuccessTimeRef = useRef(null);
const baseElapsedSeconds = issue?.elapsedBaseSeconds ?? 0;
const baseCapturedAtRef = useRef(issue?.elapsedCapturedAt ?? Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(baseElapsedSeconds);
useEffect(() => {
  const tick = () => {
    const extraSeconds = Math.floor((Date.now() - baseCapturedAtRef.current) / 1000);
    setElapsedSeconds(baseElapsedSeconds + extraSeconds);
  };
  tick();
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, [baseElapsedSeconds]);

useEffect(() => {
  let cancelled = false;

  (async () => {
    const storedLineId = await getSelectedLineId();

    if (!storedLineId) {
      console.warn('QCDefectInformationScreen: no stored lineId available for slot verification');
      return;
    }

    const { slot } = await verifyAndGetSlot({
      lineId: storedLineId,
      navigation,
      listRouteName: 'QCVerification',
    });
    if (!cancelled) setSlotInfo(slot);
  })();

  return () => { cancelled = true; };
}, [navigation]);
  const handleScanTLSQR = useCallback(() => {
    setScannerVisible(true);
  }, []);

  const closeScanner = useCallback(() => {
    setScannerVisible(false);
  }, []);

 const handleScanSuccess = useCallback(async (scannedCode) => {
 
   const expectedTlsId = issue?.tlsDeviceId;
   if (expectedTlsId && String(scannedCode).trim() !== String(expectedTlsId).trim()) {
    setScannerVisible(false); 
    showAlert(
      'error',
      'Device Mismatch',
      `Scanned device (${scannedCode}) does not match the expected Qone Device ID for this order.`,
    );
    setCheckingDevice(false);
    return;
  }

  // Step 2: normal flow — hit device mapping API with machineNo
  setCheckingDevice(true);
  try {
    const result = await checkDeviceMapping({
      tlsId: scannedCode,
      machineId: issue?.machineNo,
    });

    if (result.success) {
      scanSuccessTimeRef.current = new Date().toISOString();
      setScannerVisible(false);
      navigation.navigate('QCCapinformation', {
        issue,
        scannedTlsId: scannedCode,
        activeLineId,
        scanTime: scanSuccessTimeRef.current,
        elapsedTimeAtEntry: defectScreenEntryRef.current,
        user
      });
    } else {
      setScannerVisible(false); // close scanner here too, since device check failed
      showAlert(
        'error',
        'Device Check Failed',
        result?.message ?? 'This device is not mapped to the selected machine. Please rescan.',
      );
    }
  } catch (e) {
    setScannerVisible(false);
    showAlert('error', 'Device Check Failed', e.message ?? 'Something went wrong while checking the device.');
  } finally {
    setCheckingDevice(false);
  }
}, [issue, navigation]);

  const handleCloseWithReason = useCallback((_reason) => {
    setCloseCapVisible(false);
    navigation.navigate('QCVerification');
  }, [navigation]);

  if (!issue) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: AppColors.textTertiary }}>Issue not found.</Text>
        </SafeAreaView>
      </View>
    );
  }

  if (permsLoading) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={AppColors.primary} />
        </SafeAreaView>
      </View>
    );
  }

  if (!canViewDefect) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={TEAL} />
        <View style={styles.headerWrap}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
            <View style={styles.headerTopRow}>
              <Pressable
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}
              >
                <Ionicons name="chevron-back" size={ms(16)} color={AppColors.onPrimary} />
              </Pressable>
              <Text style={styles.orderIdText} numberOfLines={1}>{issue.displayId}</Text>
            </View>
          </SafeAreaView>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: ms(24) }}>
          <Ionicons name="lock-closed-outline" size={ms(28)} color={AppColors.textTertiary} />
          <Text style={{ color: AppColors.textTertiary, marginTop: mvs(8), textAlign: 'center' }}>
            You don't have permission to view this issue.
          </Text>
        </View>
      </View>
    );
  }

  const capTakenItems = Array.isArray(issue.capTaken) ? issue.capTaken : [];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />

      <View style={styles.headerWrap}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTopLeft}>
              <Pressable
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}
              >
                <Ionicons name="chevron-back" size={ms(16)} color={AppColors.onPrimary} />
              </Pressable>
             </View>

            <View style={styles.headerTopRight}>
              <View style={[styles.severityPill, { backgroundColor: issue.light_hexcode ? issue.light_hexcode : AppColors.white }]}>
                <Ionicons name="warning" size={ms(12)} color={issue.light_hexcode ? '#FFFFFF' : AppColors.primary} />
                <Text style={[styles.severityPillText, {  color: issue.light_hexcode ? '#FFFFFF' : AppColors.primary,}]}>{issue.severity.label}</Text>
              </View>
            </View>
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.screenTitle}>QC Verification</Text>
            <View style={styles.lineBadge}>
              <Text style={styles.lineBadgeText}>{issue.lineLabel}</Text>
            </View>
          </View>

          <View style={styles.progressRow}>
            <View style={[styles.progressSeg, styles.progressSegActive]} />
            <View style={styles.progressSeg} />
          </View>

          <View style={styles.summaryWrap}>
            <View style={styles.summaryRow}>
              <Ionicons name="person-outline" size={ms(14)} color={AppColors.onPrimary} />
              <Text style={styles.summaryText} numberOfLines={1}>{userinfo}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="construct-outline" size={ms(14)} color={AppColors.onPrimary} />
              <Text style={styles.summaryText} numberOfLines={1}>{issue.operator.machineSummary}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="color-palette-outline" size={ms(14)} color={AppColors.onPrimary} />
              <Text style={styles.summaryText} numberOfLines={1}>{issue.swatch}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => setDetailsVisible(true)}
            style={({ pressed }) => [styles.viewAllPill, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.viewAllText}>View all</Text>
            <Ionicons name="chevron-down" size={ms(12)} color={AppColors.onPrimary} />
          </Pressable>
        </SafeAreaView>
      </View>

      <View style={styles.body}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="document-text-outline" size={ms(15)} color={AppColors.primaryDark ?? AppColors.primary} />
              <Text style={styles.sectionHeaderText}>Defect Information</Text>
            </View>
            <View style={styles.sectionBody}>
              <DetailRow styles={styles} label="Defect Category" value={issue.defectCategory} />
              <DetailRow styles={styles} label="Defect" value={issue.defect} bordered />
              <DetailRow styles={styles} label="Defect Quantity" value={String(issue.defectQuantity)} bordered />
              <DetailRow styles={styles} label="Qone Device ID" value={issue.tlsDeviceId} bordered />
              <DetailRow styles={styles} label="Machine No." value={issue.machineID} bordered />
              <DetailRow styles={styles} label="Audited by" value={issue.auditDet} bordered />
              <DetailRow styles={styles} label="Audit Time" value={issue.auditTime} bordered />
              <DetailRow styles={styles} label="Notes" value={issue.notes  } bordered italic multiline />
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="document" size={ms(15)} color={AppColors.primaryDark ?? AppColors.primary} />
              <Text style={styles.sectionHeaderText}>CAP Information</Text>
            </View>
            <View style={styles.sectionBody}>
              <DetailRow styles={styles} label="Work Category" value={issue.workcategory} />
              <CapChipsRow
                items={capTakenItems}
                styles={styles}
                chipStyles={chipStyles}
                onPressMore={() => setCapListVisible(true)}
                ms={ms}
              />
              <DetailRow styles={styles} label="Performed By" value={issue.perDet} bordered />
              <DetailRow styles={styles} label="Performed On" value={issue.performedon} bordered />
              <DetailRow
                styles={styles}
                label="Response Time"
                value={issue.responseTime}
                bordered
                 
              />
              <DetailRow
                styles={styles}
                label="Elapsed Time"
                value={`${formatStopwatch(elapsedSeconds)} (Live)`}
                bordered
                live
              />
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={handleScanTLSQR}
          disabled={checkingDevice}
          style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.primaryBtnText}>{checkingDevice ? 'Checking device…' : 'Scan Qone QR'}</Text>
        </Pressable>
      </View>

      <OrderDetailsSheet
        visible={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        order={issue.order}
        operator={issue.operator}
        lineId={activeLineId}
        navigation={navigation}
        listRouteName="QCVerification"
      />

      <ManagerOverrideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onCloseWithoutCap={() => setCloseCapVisible(true)}
        styles={styles}
        ms={ms}
      />

      <CloseWithoutCapModal
        visible={closeCapVisible}
        onClose={() => setCloseCapVisible(false)}
        onCloseIssue={handleCloseWithReason}
        styles={styles}
      />

      <CapTakenListModal
        visible={capListVisible}
        items={capTakenItems}
        onClose={() => setCapListVisible(false)}
        styles={styles}
        chipStyles={chipStyles}
        ms={ms}
        mvs={mvs}
        isLargeScreen={isLargeScreen}
      />

      <Modal visible={scannerVisible} animationType="slide" onRequestClose={closeScanner} statusBarTranslucent={Platform.OS === 'android'}>
        <ScannerScreen onScanSuccess={handleScanSuccess} onClose={closeScanner} />
      </Modal>
    </View>
  );
}
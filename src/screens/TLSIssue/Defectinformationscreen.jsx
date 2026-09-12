import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import createStyles from '../styles/IssueDetailStyles';
import { checkDeviceMapping } from '../../api/services/tlsService';
import { showAlert } from '../../utils/AlertService';
import { verifyAndGetSlot } from '../../utils/slotVerification';
import { useElapsedTimer } from '../../utils/elapsedTime';
// NOTE: confirm these two export names match your defectTimeStorage.js —
// they're assumed here to follow the same pattern as clearDefectEntryTime.
import { getDefectEntryTime, setDefectEntryTime } from '../../api/storage/defectTimeStorage';

import ScannerScreen from '../../components/ScannerScreen';
import OrderDetailsSheet from '../../components/OrderDetailsSheet';
import ManagerOverrideMenu from '../../components/ManagerOverrideMenu';
import CloseWithoutCapModal from '../../components/CloseWithoutCapModal';
import { getSelectedLineId } from '../../api/storage/authStorage';
const TEAL = AppColors.primary; 
 
function getEntryKey(issue) {
  return issue?.raw?.qc_audit_id ?? issue?.id ?? issue?.displayId ?? null;
}

function DetailRow({ label, value, styles, bordered, italic, live, multiline }) {
  if (multiline) {
    return (
      <View style={[styles.detailRowMultiline, bordered && styles.detailRowBorder]}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[ italic && styles.detailValueItalic]}>
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

export default function DefectInformationScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs } = useResponsive();
  const styles = createStyles(ms, mvs, fs);

  const issue = route?.params?.issue;
    const activeLineId = issue?.raw?.line_id;
  const user =  route?.params?.user; 
   const userinfo = user?.name+" ("+user?.employee_code+")";
  const auditAt = issue?.raw?.work_audit_at ?? issue?.raw?.audit_at ?? null;

  const [detailsVisible, setDetailsVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [closeCapVisible, setCloseCapVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [checkingDevice, setCheckingDevice] = useState(false);
  const [slotInfo, setSlotInfo] = useState(null);

  const scanTimer = useRef(null);
  const scanSuccessTimeRef = useRef(null);
 
  const { formatted: elapsedFormatted } = useElapsedTimer(auditAt);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const storedLineId = await getSelectedLineId();

      if (!storedLineId) {
        console.warn('DefectInformationScreen: no stored lineId available for slot verification');
        return;
      }

      const { slot } = await verifyAndGetSlot({
        lineId: storedLineId,
        navigation,
        listRouteName: 'TLSIssueTracker',
      });
      if (!cancelled) setSlotInfo(slot);
    })();

    return () => { cancelled = true; };
  }, [navigation]);

  const handleScanTLSQR = useCallback(() => {
    setScannerVisible(true);
  }, []);

  const closeScanner = useCallback(() => {
    if (scanTimer.current) clearTimeout(scanTimer.current);
    setScannerVisible(false);
  }, []);

  const handleScanSuccess = useCallback(async (scannedCode) => {

    const mappedTlsId = issue?.device?.tlsDeviceId
                    ?? issue?.raw?.tls_id;

    if (!mappedTlsId) {
      showAlert('error', 'Device Not Mapped', 'No Qone device is mapped to this issue.');
      return;
    }

    if (String(scannedCode).trim() !== String(mappedTlsId).trim()) {
      showAlert(
        'error',
        'Wrong Device',
        `Please scan the mapped Qone device`,
      );
      setScannerVisible(false);
      return;
    }

    setCheckingDevice(true);
    try {
      const result = await checkDeviceMapping({
        tlsId: scannedCode,
        machineId: issue?.raw?.machine_id,
      });

      if (result.success) {
        const entryKey = getEntryKey(issue);
        let effectiveScanTime = new Date().toISOString();

        if (entryKey) {
          try { 
            const existing = await getDefectEntryTime(entryKey);
            if (existing) {
              effectiveScanTime = existing;
            } else {
              await setDefectEntryTime(entryKey, effectiveScanTime);
            }
          } catch (storageErr) { 
            console.warn('DefectInformationScreen: scan time storage failed', storageErr);
          }
        } else {
          console.warn('DefectInformationScreen: no entry key available, scan time will not persist');
        }

        scanSuccessTimeRef.current = effectiveScanTime;
        setScannerVisible(false);
        navigation.navigate('CapInformation', {
          issue,
          scannedTlsId: scannedCode,
          scanTime: scanSuccessTimeRef.current,
          elapsedTimeAtEntry: auditAt,
          closeWithoutCap: false,
          reasonForClosure: '',
          activeLineId,user
        });
      } else {
        showAlert(
          'error',
          'Device Check Failed',
          result?.message ?? 'This device is not mapped to the selected machine. Please rescan.',
        );
      }
    } catch (e) {
      showAlert('error', 'Device Check Failed', e.message ?? 'Something went wrong while checking the device.');
    } finally {
      setCheckingDevice(false);
    }

  }, [issue, navigation, auditAt, activeLineId]);

  const handleCloseWithReason = useCallback((reason) => {
    if (!issue) return;
    setCloseCapVisible(false);
    navigation.navigate('CapInformation', {
      issue,
      scannedTlsId: null,
      scanTime: new Date().toISOString(),
      elapsedTimeAtEntry: auditAt,
      closeWithoutCap: true,
      reasonForClosure: reason,
    });
  }, [issue, navigation, auditAt]);

  if (!issue) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: AppColors.textTertiary }}>Issue not found.</Text>
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
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}
              >
                <Ionicons name="chevron-back" size={ms(16)} color={AppColors.onPrimary} />
              </Pressable>

            </View>

            <View style={styles.headerTopRight}>
              <View style={[styles.severityPill, { backgroundColor: issue.light_hexcode ? issue.light_hexcode : AppColors.white }]}>
                <Ionicons name="warning" size={ms(12)}  color={issue.light_hexcode ? '#FFFFFF' : AppColors.primary} />
                <Text style={[styles.severityPillText,{  color: issue.light_hexcode ? '#FFFFFF' : AppColors.primary,}]}>{issue.severity.label}</Text>
              </View>
              <Pressable
                onPress={() => setMenuVisible(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.dotsBtn}
                accessibilityRole="button"
                accessibilityLabel="More options"
              >
                <Ionicons name="ellipsis-vertical" size={ms(18)} color={AppColors.onPrimary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.screenTitle}>TLS Issue</Text>
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
              <Text style={styles.sectionHeaderText}>DEFECT INFORMATION</Text>
            </View>
            <View style={styles.sectionBody}>
              <DetailRow styles={styles} label="Defect Category" value={issue.defectCategory} />
              <DetailRow styles={styles} label="Defect" value={issue.defect} bordered />
              <DetailRow styles={styles} label="Defect Quantity" value={String(issue.defectQuantity)} bordered />
              <DetailRow styles={styles} label="Qone Device ID" value={issue.tlsDeviceId} bordered />
              <DetailRow styles={styles} label="Machine No." value={issue.machineID} bordered />
              <DetailRow styles={styles} label="Audited by" value={issue.auditedBy} bordered />
              <DetailRow styles={styles} label="Audit Time" value={issue.auditTime} bordered />
              <DetailRow styles={styles} label="Notes" value={issue.notes } bordered italic multiline/>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="person-add-outline" size={ms(15)} color={AppColors.primaryDark ?? AppColors.primary} />
              <Text style={styles.sectionHeaderText}>WORK ASSIGNMENT</Text>
            </View>
            <View style={styles.sectionBody}>
              <DetailRow styles={styles} label="Assigned to" value={issue.assignedTo} />
              <DetailRow
                styles={styles}
                label="Elapsed Time"
                value={!auditAt ? '—' : `${elapsedFormatted} (Live)`}
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
        navigation={navigation}
        listRouteName="TLSIssueTracker"
        lineId={activeLineId}
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

      <Modal visible={scannerVisible} animationType="slide" onRequestClose={closeScanner} statusBarTranslucent={Platform.OS === 'android'}>
        <ScannerScreen onScanSuccess={handleScanSuccess} onClose={closeScanner} />
      </Modal>
    </View>
  );
}
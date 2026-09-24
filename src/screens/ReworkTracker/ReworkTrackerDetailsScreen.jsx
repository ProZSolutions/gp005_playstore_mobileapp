import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, Switch, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import createStyles from '../styles/ReworkTrackerDetailsStyles';
import { showAlert } from '../../utils/AlertService';
import reworkService from '../../api/services/reworkService';
import { getElapsedTime } from '../../api/services/elapsedTime';
import { clearSelectedLineId, getShiftData } from '../../api/storage/authStorage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ScannerScreen from '../../components/ScannerScreen';
import rejectionService from '../../api/services/rejectionService';
import SelectSizeSheet from '../../components/SelectSizeSheet';
import DefectEntrySheet from '../../components/DefectEntrySheet';

const TEAL = AppColors.primary;
const LISTING_SCREEN = 'ReworkTrackerList';

const MOCK_CATEGORIES = [
  { id: 1, value: 'Handling' },
  { id: 2, value: 'Fabric' },
  { id: 3, value: 'Sewing' },
  { id: 4, value: 'Machine' },
  { id: 5, value: 'Skill' },
  { id: 6, value: 'Method' },
];

function formatStopwatch(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds ?? 0));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function DetailRow({ label, value, styles, bordered, placeholder, onPress, chevron, live }) {
  const isEmpty = value === undefined || value === null || value === '';
  const content = (
    <View style={[styles.detailRow, bordered && styles.detailRowBorder]}>
      <Text style={styles.detailLabel}>{label}</Text>
      {live ? (
        <View style={styles.liveValueRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveValueText}>{value}</Text>
        </View>
      ) : (
        <View style={styles.detailValueRow}>
          <Text style={[styles.detailValue, isEmpty && styles.detailValuePlaceholder]}>
            {isEmpty ? placeholder ?? '—' : value}
          </Text>
          {chevron && (
            <Ionicons name="chevron-forward" size={16} color={AppColors.primaryDark} style={styles.detailChevron} />
          )}
        </View>
      )}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.7 }}>
      {content}
    </Pressable>
  );
}

const VERDICTS = [
  {
    key: 'pass', label: 'Done', icon: 'checkmark',
    iconWrapKey: 'verdictIconWrapPass', iconWrapActiveKey: 'verdictIconWrapActivePass',
    cardActiveKey: 'verdictCardActivePass', labelActiveKey: 'verdictLabelActivePass',
    iconColor: AppColors.success ?? '#16A34A',
  },
  {
    key: 'fail', label: 'Redo', icon: 'close',
    iconWrapKey: 'verdictIconWrapFail', iconWrapActiveKey: 'verdictIconWrapActiveFail',
    cardActiveKey: 'verdictCardActiveFail', labelActiveKey: 'verdictLabelActiveFail',
    iconColor: AppColors.error,
  },
  {
    key: 'reject', label: 'Reject', icon: 'ban-outline',
    iconWrapKey: 'verdictIconWrapReject', iconWrapActiveKey: 'verdictIconWrapActiveReject',
    cardActiveKey: 'verdictCardActiveReject', labelActiveKey: 'verdictLabelActiveReject',
    iconColor: AppColors.errorLight,
  },
];

function VerdictSelector({ value, onChange, styles }) {
  return (
    <View style={styles.verdictWrap}>
      <View style={styles.verdictRow}>
        {VERDICTS.map((v) => {
          const active = value === v.key;
          return (
            <Pressable
              key={v.key}
              onPress={() => onChange(v.key)}
              style={({ pressed }) => [
                styles.verdictCard,
                active && styles[v.cardActiveKey],
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={[styles.verdictIconWrap, styles[v.iconWrapKey], active && styles[v.iconWrapActiveKey]]}>
                <Ionicons name={v.icon} size={20} color={active ? '#FFFFFF' : v.iconColor} />
              </View>
              <Text style={[styles.verdictLabel, active && styles[v.labelActiveKey]]}>{v.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function formatMinSecond(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(minutes)}.${pad(seconds)}`;
}

export default function ReworkTrackerDetailsScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs } = useResponsive();
  const styles = createStyles(ms, mvs, fs);
  const [shiftData, setShiftData] = useState(null);

  const { issue: routeIssue, user, scannedTlsId } = route?.params ?? {};
  const issue = routeIssue;
  const [scannerVisible, setScannerVisible] = useState(false);
  const [checkingDevice, setCheckingDevice] = useState(false);
  const [rejectionQR, setRejectionQR] = useState(null);
  const [verdict, setVerdict] = useState(issue?.verdict ?? null);
  const [escalation, setEscalation] = useState(issue?.escalation ?? false);
  const [submitting, setSubmitting] = useState(false);

  const orderId = issue?.raw?.order_id;
  const lineId = issue?.raw?.line_id;
  const uuid = issue?.raw?.uuid;

  const [sizeSheetVisible, setSizeSheetVisible] = useState(false);
  const [defectSheetVisible, setDefectSheetVisible] = useState(false);

  const [selectedSize, setSelectedSize] = useState(
    issue?.size ? { id: issue.size, label: issue.size } : null,
  );
  const [defectEntries, setDefectEntries] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const shift = await getShiftData();
        console.log("shift details " + JSON.stringify(shift));
        if (!cancelled && shift) setShiftData(shift);
      } catch (e) {
        console.warn('Could not read saved shift data on mount:', e.message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const sizeOptions = useMemo(
    () => [
      { id: 'XS', label: 'XS' }, { id: 'S', label: 'S' }, { id: 'M', label: 'M' },
      { id: 'L', label: 'L' }, { id: 'XL', label: 'XL' }, { id: 'XXL', label: 'XXL' },
      { id: '3XL', label: '3XL' }, { id: '4XL', label: '4XL' },
    ],
    [],
  );

  const totalDefectCount = useMemo(() => {
    const enteredTotal = Object.values(defectEntries).reduce((sum, e) => sum + (e.qty ?? 0), 0);
    return enteredTotal > 0 ? enteredTotal : issue?.defectFound ?? 0;
  }, [defectEntries, issue]);

  const editedDefect = useMemo(() => {
    const list = Object.values(defectEntries);
    return list.length ? list[0] : null;
  }, [defectEntries]);

  const handleApplyDefects = (payload) => {
    setDefectEntries(payload);
  };

  // ── Elapsed time now comes from the server ────────────────────────────
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [elapsedLoading, setElapsedLoading] = useState(true);
  const elapsedBaseRef = useRef(null); // { baseSeconds, fetchedAtMs }

  useEffect(() => {
    let cancelled = false;

    const bailOut = (message) => {
      showAlert('error', 'Load Failed', message ?? 'Could not load elapsed time.');
      navigation?.goBack?.();
    };

    if (!orderId || !lineId) {
      bailOut('Missing order or line information.');
      return () => { cancelled = true; };
    }

    (async () => {
      setElapsedLoading(true);
      try {
        const result = await getElapsedTime({
          orderId,
          lineId,
          type: 'rework',uuid
        });

        if (cancelled) return;

        if (!result?.success) {
          bailOut(result?.message);
          return;
        }

        const baseSeconds = Number(
          result?.data?.elapsed_seconds ?? result?.data?.elapsed_time ?? 0,
        );

        elapsedBaseRef.current = {
          baseSeconds: Number.isFinite(baseSeconds) ? baseSeconds : 0,
          fetchedAtMs: Date.now(),
        };
        setElapsedSeconds(elapsedBaseRef.current.baseSeconds);
      } catch (e) {
        if (!cancelled) bailOut(e?.message);
      } finally {
        if (!cancelled) setElapsedLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, lineId]);

  useEffect(() => {
    if (!elapsedBaseRef.current) return undefined;

    const tick = () => {
      const { baseSeconds, fetchedAtMs } = elapsedBaseRef.current;
      const extra = Math.floor((Date.now() - fetchedAtMs) / 1000);
      setElapsedSeconds(baseSeconds + extra);
    };

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [elapsedLoading]);

  const showRejectionDetails = verdict === 'fail' || verdict === 'reject';

  const submitDisabled =
    submitting ||
    !verdict ||
    !issue?.raw ||
    (showRejectionDetails && (!selectedSize || totalDefectCount === 0));

  const performSubmit = useCallback(async (rejectionQRCode) => {
    setSubmitting(true);
    try {
      const raw = issue?.raw ?? {};
      const nowIso = new Date().toISOString();
      const elapsedTime = formatMinSecond(elapsedSeconds);
      const payload = {
        shift_id: shiftData.shift_id ?? null,
        slot_id: raw.slot_id ?? null,
        line_id: raw.line_id ?? null,
        order_id: raw.order_id ?? null,
        style_id: raw.style_id ?? null,
        color_id: raw.color_id ?? null,
        qr_id: raw.qr_id ?? null,
        qr_code: raw.qr_code ?? scannedTlsId ?? null,
        qr_details: raw.qr_details ?? null,
        size: selectedSize?.label ?? raw.size ?? null,
        category_id: editedDefect?.category_id ?? raw.category_id ?? null,
        defect_id: editedDefect?.defect_id ?? raw.defect_id ?? null,
        severity_id: editedDefect?.severity_id ?? raw.severity_id ?? null,
        qty: totalDefectCount ?? 0,
        category_name: editedDefect?.category_name ?? raw.category_name ?? null,
        defect_name: editedDefect?.defect_name ?? raw.defect_name ?? null,
        severity_name: editedDefect?.severity_name ?? raw.severity_name ?? null,
        is_assign_auto: raw.is_assign_auto ?? 0,
        is_assign_manual: raw.is_assign_manual ?? 0,
        machine_id: raw.machine_id ?? null,
        tls_id: raw.tls_id ?? null,
        emp_id: raw.emp_id ?? null,
        operation_id: raw.operation_id ?? null,
        machine_type_id: raw.machine_type_id ?? null,
        is_escalate: escalation ? 1 : 0,
        notes: raw.notes ?? '',
        work_audit_by: user?.employee_code ?? user?.id ?? raw.work_audit_by ?? '',
        work_audit_at: nowIso,
        rework_status: verdict,
        elapsed_time: elapsedTime,
        rework_id: raw.rework_id ?? issue?.reworkId ?? issue?.id ?? null,
        rejection_qr: rejectionQRCode ?? rejectionQR ?? null,
      };

      const result = await reworkService.createReworkTracker(payload);

      if (!result.success) {
        showAlert('error', 'Submit failed', result.message || 'Could not update status.');
        return;
      }

      showAlert('success', 'Success', 'Status updated successfully.');
      await clearSelectedLineId();
      navigation.reset({
        index: 0,
        routes: [{ name: LISTING_SCREEN }],
      });
    } catch (e) {
      showAlert('error', 'Submit failed', e?.message || 'Could not update status.');
    } finally {
      setSubmitting(false);
    }
  }, [issue, scannedTlsId, rejectionQR, verdict, escalation, selectedSize, totalDefectCount, editedDefect, user, navigation, elapsedSeconds, shiftData]);

  const extractScannedTlsId = (data) => {
    if (data === null || data === undefined) return null;
    if (typeof data === 'string') return data.trim();
    if (typeof data === 'object') return data.tls_id ?? data.tlsId ?? data.id ?? null;
    return null;
  };

  const closeScanner = useCallback(() => {
    setScannerVisible(false);
  }, []);

  const handleScanSuccess = useCallback(async (data) => {
    const scannedCode = extractScannedTlsId(data);
    setScannerVisible(false);

    if (!scannedCode) {
      showAlert('error', 'Scan Failed', 'Could not read a Qone device ID from that code. Please try again.');
      return;
    }

    setCheckingDevice(true);
    try {
      const checkResult = await reworkService.checkTlsDevice({ qr_code: scannedCode, type: 'rejection' });

      if (!checkResult?.success) {
        showAlert('error', 'Device Validation Failed', checkResult?.message ?? 'This device could not be verified. Please try again.');
        return;
      }

      setRejectionQR(scannedCode);
      await performSubmit(scannedCode);
    } catch (e) {
      showAlert('error', 'Device Check Failed', e?.message ?? 'Something went wrong while checking the device.');
    } finally {
      setCheckingDevice(false);
    }
  }, [performSubmit]);

  const handleSubmit = useCallback(() => {
    if (submitDisabled) return;

    if (verdict === 'reject') {
      showAlert('block', 'Do you want to reject this?', 'This action cannot be undone.', {
        icon: 'block',
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Reject', style: 'destructive', onPress: () => setScannerVisible(true) },
        ],
      });
      return;
    }

    performSubmit();
  }, [submitDisabled, verdict, performSubmit]);

  if (!issue) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={TEAL} />
        <SafeAreaView style={styles.emptyWrap}>
          <Ionicons name="alert-circle-outline" size={ms(28)} color={AppColors.textTertiary} />
          <Text style={styles.emptyText}>No record selected.</Text>
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
                <Ionicons name="chevron-back" size={ms(16)} color={AppColors.onPrimary} />
              </Pressable>
            </View>

            {issue.severity && (
              <View style={[styles.severityPill, { backgroundColor: AppColors.error }]}>
                <Ionicons name="warning" size={ms(12)} color={issue.severity.text} />
                <Text style={[styles.severityPillText, { color: issue.severity.text }]}>{issue.severity.label}</Text>
              </View>
            )}
          </View>

          <Text style={styles.titleText}>Rework Tracker</Text>

          <View style={styles.metaWrap}>
            <View style={styles.metaRow}>
              <Ionicons name="layers-outline" size={ms(14)} color={AppColors.onPrimary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{issue.lineLabel ?? '—'}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>WIP - {issue.wip ?? '0'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="color-palette-outline" size={ms(14)} color={AppColors.onPrimary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{issue.tlsCode ?? '—'}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{issue.swatchName ?? '—'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="cube-outline" size={ms(14)} color={AppColors.onPrimary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{issue.buyer ?? '—'}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{issue.styleNo ?? '—'}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{issue.style ?? '—'}</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.body}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="document-text-outline" size={ms(15)} color={AppColors.primaryDark} />
              <Text style={styles.sectionHeaderText}>Operator & Operation Details</Text>
            </View>
            <View style={styles.sectionBody}>
              <DetailRow
                styles={styles}
                label="Employee"
                value={
                  issue.raw.assignemp_name
                    ? `${issue.raw.assignemp_name}${issue.raw.assignemp_code ? ` (${issue.raw.assignemp_code})` : ''}`
                    : '-'
                }
              />
              <DetailRow styles={styles} label="Operation" value={issue.raw.operation_name ?? '-'} bordered />
              <DetailRow styles={styles} label="Machine Type" value={issue.raw.machine_type_name ?? '-'} bordered />
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="document-text-outline" size={ms(15)} color={AppColors.primaryDark} />
              <Text style={styles.sectionHeaderText}>DEFECT INFORMATION</Text>
            </View>
            <View style={styles.sectionBody}>
              <DetailRow styles={styles} label="Defect Category" value={issue.defectCategory} />
              <DetailRow styles={styles} label="Size" value={issue.raw.size} bordered />
              <DetailRow styles={styles} label="Defect" value={issue.defect} bordered />
              <DetailRow styles={styles} label="Quantity" value={String(issue.quantity ?? '—')} bordered />
              <DetailRow styles={styles} label="Entered by" value={issue.name} bordered />
              <DetailRow styles={styles} label="Audit Time" value={issue.createdOn} bordered />
              <DetailRow
                styles={styles}
                label="Elapsed Time (min)"
                value={elapsedLoading ? '—' : formatStopwatch(elapsedSeconds)}
                bordered
                live
              />
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={[styles.sectionBody, { paddingTop: mvs(10), paddingBottom: mvs(10) }]}>
              <View style={styles.escalateRow}>
                <View style={styles.escalateLeft}>
                  <View style={styles.escalateIconWrap}>
                    <MaterialCommunityIcons name="shield-alert-outline" size={ms(16)} color={AppColors.secondary} />
                  </View>
                  <Text style={styles.escalateLabel}>Escalation</Text>
                </View>
                <Switch
                  value={escalation}
                  onValueChange={setEscalation}
                  trackColor={{ true: TEAL, false: AppColors.border }}
                  thumbColor={AppColors.onPrimary}
                />
              </View>
            </View>
          </View>
          <VerdictSelector value={verdict} onChange={setVerdict} styles={styles} />
        </ScrollView>
      </View>

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
          {submitting ? (
            <ActivityIndicator size="small" color={AppColors.onPrimary} />
          ) : (
            <Text style={[styles.submitBtnText, submitDisabled && styles.submitBtnTextDisabled]}>Submit</Text>
          )}
        </Pressable>
      </View>

      <SelectSizeSheet
        visible={sizeSheetVisible}
        onClose={() => setSizeSheetVisible(false)}
        sizes={sizeOptions}
        selectedId={selectedSize?.id}
        onApply={setSelectedSize}
      />

      <DefectEntrySheet
        visible={defectSheetVisible}
        onClose={() => setDefectSheetVisible(false)}
        categories={MOCK_CATEGORIES}
        initialEntries={defectEntries}
        onApply={handleApplyDefects}
      />
      <Modal
        visible={scannerVisible}
        animationType="slide"
        onRequestClose={closeScanner}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <ScannerScreen onScanSuccess={handleScanSuccess} onClose={closeScanner} />
      </Modal>
    </View>
  );
}

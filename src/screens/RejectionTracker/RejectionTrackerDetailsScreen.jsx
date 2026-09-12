import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, TextInput, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import createStyles from '../styles/ReworkTrackerDetailsStyles';
import { showAlert } from '../../utils/AlertService';
import rejectionService from '../../api/services/rejectionService';
import { clearSelectedLineId,getShiftData } from '../../api/storage/authStorage';
//import { getDefectEntryTime, setDefectEntryTime } from '../../api/storage/defectTimeStorage';

const TEAL = AppColors.primary;
const LISTING_SCREEN = 'RejectionTrackerList';

function formatStopwatch(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
} 
/*function getEntryKey(issue) {
  return issue?.raw?.rejection_id ?? issue?.raw?.id ?? issue?.id ?? issue?.displayId ?? null;
}
*/
function DetailRow({ label, value, styles, bordered, placeholder, live }) {
  const isEmpty = value === undefined || value === null || value === '';
  return (
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
        </View>
      )}
    </View>
  );
}

const ACTIONS = [
  {
    key: 'reject',
    label: 'Confirm Reject',
    icon: 'checkmark',
    iconWrapKey: 'actionIconWrapReject', 
    iconWrapActiveKey: 'actionIconWrapActiveReject',
    cardActiveKey: 'actionCardActiveReject',
    labelActiveKey: 'actionLabelActiveReject',
    iconColor: AppColors.error ?? '#16A34A',
  },
  {
    key: 'bulk',
    label: 'Move to Bulk',
    icon: 'arrow-forward',
    iconWrapKey: 'actionIconWrapBulk',
    iconWrapActiveKey: 'actionIconWrapActiveBulk',
    cardActiveKey: 'actionCardActiveBulk',
    labelActiveKey: 'actionLabelActiveBulk',
    iconColor: AppColors.warning ?? '#F59E0B',
  },
];

function ActionSelector({ value, onChange, styles }) {
  return (
    <View style={styles.actionWrap}>
      <View style={styles.actionRow}>
        {ACTIONS.map((a) => {
          const active = value === a.key;
          return (
            <Pressable
              key={a.key}
              onPress={() => onChange(a.key)}
              style={({ pressed }) => [
                styles.actionCard,
                active && styles[a.cardActiveKey],
                pressed && { opacity: 0.85 },
              ]}
            >
              <View
                style={[
                  styles.actionIconWrap,
                  styles[a.iconWrapKey],
                  active && styles[a.iconWrapActiveKey],
                ]}
              >
                <Ionicons name={a.icon} size={18} color={active ? '#FFFFFF' : a.iconColor} />
              </View>
              <Text style={[styles.actionLabel, active && styles[a.labelActiveKey]]}>{a.label}</Text>
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
export default function RejectionTrackerDetailsScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs } = useResponsive();
  const styles = createStyles(ms, mvs, fs);

  const { issue: routeIssue, user, scannedTlsId } = route?.params ?? {};
  const issue = routeIssue;

  const [action, setAction] = useState(issue?.action ?? null);
  const [notes, setNotes] = useState(issue?.notes ?? '');
  const [escalation, setEscalation] = useState(issue?.escalation ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [shiftData, setShiftData] = useState(null);


  const createdAt = issue?.raw?.created_at ?? null;
const [elapsedSeconds, setElapsedSeconds] = useState(0);

 useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const shift = await getShiftData();
          console.log("shift details "+JSON.stringify(shift));
          if (!cancelled && shift) setShiftData(shift);
        } catch (e) {
          console.warn('Could not read saved shift data on mount:', e.message);
        }
      })();
      return () => { cancelled = true; };
    }, []);
  /*const entryKey = getEntryKey(issue);
  const [capturedTime, setCapturedTime] = useState(null);
  const [resolvingEntryTime, setResolvingEntryTime] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0); 
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setResolvingEntryTime(true);
      if (!entryKey) {
        if (!cancelled) {
          setCapturedTime(new Date().toISOString());
          setResolvingEntryTime(false);
        }
        return;
      }
      try {
        const existing = await getDefectEntryTime(entryKey);
        if (cancelled) return;
        if (existing) {
          setCapturedTime(existing);
        } else {
          const now = new Date().toISOString();
          await setDefectEntryTime(entryKey, now);
          if (!cancelled) setCapturedTime(now);
        }
      } catch (e) {
        console.warn('Failed to resolve rejection entry time:', e.message);
        if (!cancelled) setCapturedTime(new Date().toISOString());
      } finally {
        if (!cancelled) setResolvingEntryTime(false);
      }
    })();
    return () => { cancelled = true; };
  }, [entryKey]);
*/
   useEffect(() => {
  if (!createdAt) return;

  const tick = () => {
    const startMs = new Date(createdAt).getTime();
    const diffSeconds = Math.floor((Date.now() - startMs) / 1000);

    setElapsedSeconds(Math.max(0, diffSeconds));
  };

  tick();

  const interval = setInterval(tick, 1000);

  return () => clearInterval(interval);
}, [createdAt]);

const submitDisabled =
  submitting ||
  !action ||
  !issue?.raw;
  const performSubmit = useCallback(async (chosenAction) => {
    const finalAction = chosenAction ?? action;
    setSubmitting(true);
    try {
      const raw = issue?.raw ?? {};
      const nowIso = new Date().toISOString();

      //const elapsedTime =  Math.round(elapsedSeconds  / 60);
      // team_id: raw.team_id ?? null,
       //branch_id: raw.branch_id ?? null,
      const elapsedTime = formatMinSecond(elapsedSeconds);
      const payload = {
        rejection_id: raw.rejection_id ?? issue?.rejectionId ?? issue?.id ?? null,
        
        shift_id: shiftData.shift_id ?? null,       
        slot_id: raw.slot_id ?? null,
        line_id: raw.line_id ?? null,
        order_id: raw.order_id ?? null,
        style_id: raw.style_id ?? null,
        color_id: raw.color_id ?? null,
        qr_id: raw.qr_id ?? null,
        qr_code: raw.qr_code ?? scannedTlsId ?? null,
        qr_details: raw.qr_details ?? null,
        size: raw.size ?? null,
        category_id: raw.category_id ?? null,
        defect_id: raw.defect_id ?? null,
        severity_id: raw.severity_id ?? null,
        qty: raw.qty ?? issue?.quantity ?? 0,
        category_name: raw.category_name ?? null,
        defect_name: raw.defect_name ?? null,
        severity_name: raw.severity_name ?? null,
        is_assign_auto: raw.is_assign_auto ?? 0,
        is_assign_manual: raw.is_assign_manual ?? 0,
        machine_id: raw.machine_id ?? null,
        tls_id: raw.tls_id ?? null,
        emp_id: raw.emp_id ?? null,
        operation_id: raw.operation_id ?? null,
        machine_type_id: raw.machine_type_id ?? null,
        is_escalate: escalation ? 1 : 0,
        notes: notes?.trim() || raw.notes || '',
        work_audit_by: user?.employee_code ?? user?.id ?? raw.work_audit_by ?? '',
        work_audit_at: nowIso,
        elapsed_time:elapsedTime, // minutes since this record's stored entry time
        rejection_status: finalAction === 'bulk' ? 'bulk' : 'rejected',
      };

      const result = await rejectionService.createRejectionTracker(payload);

      if (!result.success) {
        showAlert('error', 'Submit failed', result.message || 'Could not update status.');
        return;
      }

      showAlert('success', 'Success', 'Rejection updated successfully.');
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
  }, [issue, scannedTlsId, action, notes, escalation, user, navigation, elapsedSeconds]);

  const handleSubmit = useCallback(() => {
    if (submitDisabled) return;

    if (action === 'bulk') {
      showAlert('warning', 'Move to Bulk?', 'This item will be moved to bulk instead of being rejected.', {
        icon: 'arrow-forward',
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Move to Bulk',
            style: 'move',
            onPress: () => performSubmit('bulk'),
          },
        ],
      });
      return;
    }

    // Confirm Reject submits directly — no popup.
    performSubmit('reject');
  }, [submitDisabled, action, performSubmit]);

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
             {/* <Text style={styles.orderIdText} numberOfLines={1}>{issue.tlsCode}</Text>*/} 
            </View>

            {issue.severity && (
              <View style={[styles.severityPill, { backgroundColor: AppColors.error }]}>
                <Ionicons name="warning" size={ms(12)} color={issue.severity.text} />
                <Text style={[styles.severityPillText, { color: issue.severity.text }]}>{issue.severity.label}</Text>
              </View>
            )}
          </View>

          <Text style={styles.titleText}>Rejection Tracker</Text>

          <View style={styles.metaWrap}>
            <View style={styles.metaRow}>
              <Ionicons name="layers-outline" size={ms(14)} color={AppColors.onPrimary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{issue.lineLabel ?? '—'}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>WIP - {issue.wip ?? '—'}</Text>
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
                      ? `${issue.raw.assignemp_name}${
                          issue.raw.assignemp_code
                            ? ` (${issue.raw.assignemp_code})`
                            : ''
                        }`
                      : '-'
                  }
                />

              <DetailRow
                styles={styles}
                label="Operation"
                value={issue.raw.operation_name ?? '-'}
                bordered
              />

              <DetailRow
                styles={styles}
                label="Machine Type"
                value={issue.raw.machine_type_name ?? '-'}
                bordered
              />            
            </View>
          </View>   




           <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="document-text-outline" size={ms(15)} color={AppColors.primaryDark} />
              <Text style={styles.sectionHeaderText}>Rejection Tracker</Text>
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
                 value={!createdAt ? '—' : formatStopwatch(elapsedSeconds)}
                bordered
                live 
              />
            </View>
          </View>
 
          <View style={styles.sectionCard}>
            <View style={[styles.sectionBody, { paddingTop: mvs(12), paddingBottom: mvs(12) }]}>
              <View style={styles.escalateRow}>
                <View style={styles.escalateLeft}>
                  <View style={styles.escalateIconWrap}>
                    <Ionicons name="shield-checkmark-outline" size={ms(15)} color={AppColors.primaryDark} />
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

          {/* CONFIRM REJECT / MOVE TO BULK */}
          <ActionSelector value={action} onChange={setAction} styles={styles} />

          {/* NOTES */}
          <View style={styles.notesWrap}>
            <Text style={styles.notesLabel}>NOTES</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add any observations or notes..."
              placeholderTextColor={AppColors.textTertiary}
              multiline
              value={notes}
              onChangeText={setNotes}
            />
          </View>
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
            <Text style={[styles.submitBtnText, submitDisabled && styles.submitBtnTextDisabled]}>
              Submit
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import createStyles from '../styles/IssueDetailStyles';
import { createTLSISSue } from '../../api/services/tlsService';
import { showAlert } from '../../utils/AlertService';
import { clearDefectEntryTime } from '../../api/storage/defectTimeStorage';
import { usePermissions, GROUP, ACTION } from '../../context/PermissionsContext';
import { formatElapsedTime,calculateElapsedSeconds } from '../../utils/elapsedTime';
 
 import { getUser,getShiftData } from '../../api/storage/authStorage';
import OrderDetailsSheet from '../../components/OrderDetailsSheet';
import SelectCapModal from '../../components/SelectCapModal';

const TEAL = AppColors.primary;

const POST_SUBMIT_NAV_DELAY_MS = 3000;

/*function formatStopwatch(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return h > 0
    ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
*/
function formatStopwatch(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/*function diffInMinutes(fromIso, toIso) {
  if (!fromIso || !toIso) return 0;
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Math.max(0, Math.round(ms / 60000));
}
function diffInSeconds(fromIso, toIso) {
  if (!fromIso || !toIso) return 0;
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Math.max(0, Math.round(ms / 1000));
} */

  function diffInSeconds(fromIso, toIso) {
  if (!fromIso || !toIso) return 0;
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Math.max(0, Math.round(ms / 1000));
}

function formatMinSec(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(minutes)}.${pad(seconds)}`;
} 
function getEntryKey(issue) {
  return issue?.raw?.qc_audit_id ?? issue?.id ?? issue?.displayId ?? null;
}

function DetailRow({ label, value, styles, bordered, live }) {
  return (
    <View style={[styles.detailRow, bordered && styles.detailRowBorder]}>
      <Text style={styles.detailLabel}>{label}</Text>
      {live ? (
        <View style={styles.liveValueRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveValueText}>{value}</Text>
        </View>
      ) : (
        <Text style={styles.detailValue}>{value}</Text>
      )}
    </View>
  );
}

export default function CapInformationScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs } = useResponsive();
  const styles = createStyles(ms, mvs, fs);

  const issue = route?.params?.issue;
     const scannedTlsId = route?.params?.scannedTlsId;
   const activeLineId = route?.params?.activeLineId; 
  const scanTime = route?.params?.scanTime; 
  const capturedTime = route?.params?.elapsedTimeAtEntry ?? new Date().toISOString();
  const closeWithoutCap = route?.params?.closeWithoutCap ?? false;
  const reasonForClosure = route?.params?.reasonForClosure ?? '';
  const [shiftData, setShiftData] = useState(null);

    const user =  route?.params?.user; 
   const userinfo = user?.name+" ("+user?.employee_code+")";
  const capOptions = useMemo(() => (Array.isArray(issue?.cap) ? issue.cap : []), [issue]);
   const { can } = usePermissions();
  const canCreateAudit = can(GROUP.TLSISSUE, ACTION.CREATE); 
  const [auditByUserId, setAuditByUserId] = useState(null);
  useEffect(() => {
    let cancelled = false;
    getUser()
      .then((u) => {
        if (!cancelled) setAuditByUserId(u?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setAuditByUserId(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectCapVisible, setSelectCapVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [chosenCaps, setChosenCaps] = useState([]);

  const navTimeoutRef = useRef(null);
  useEffect(() => () => {
    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
  }, []);
 
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    const tick = () => {
      const startMs = new Date(capturedTime).getTime();
      setElapsedSeconds(Math.floor((Date.now() - startMs) / 1000));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [capturedTime]);

  const canSubmit = (closeWithoutCap || chosenCaps.length > 0) && !submitting && canCreateAudit;

  const handleApplyCap = useCallback((selectedIds, customText) => {
    const fromCatalogue = capOptions.filter((o) => selectedIds.includes(o.id));
    const custom = customText
      ? [{ id: `custom_${Date.now()}`, cap_name: customText, short_name: customText }]
      : [];
    setChosenCaps((prev) => {
      const prevIds = new Set(prev.map((c) => c.id));
      const merged = [...prev];
      [...fromCatalogue, ...custom].forEach((c) => {
        if (!prevIds.has(c.id)) merged.push(c);
      });
      return merged;
    });
    setSelectCapVisible(false);
  }, [capOptions]);

  const removeCap = useCallback((id) => {
    setChosenCaps((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !issue) return;
    setSubmitting(true);
    try {
      const auditAt = issue.raw?.audit_at ?? issue.raw?.created_at;
      const now = new Date().toISOString();
 
    /*const responseTime = diffInMinutes(auditAt, scanTime ?? now);
    const elapsedTime = diffInMinutes(auditAt, now); */

    const responseTime = formatMinSec(diffInSeconds(auditAt, scanTime ?? now));
    const elapsedTime = formatMinSec(diffInSeconds(auditAt, now));


            console.log("scan time "+scanTime+" audit at "+auditAt+" capture  "+capturedTime+
              " response time "+responseTime+" elapes time "+elapsedTime
            );

      const payload = {
        proaudit_uuid:issue.raw?.uuid,
        qc_audit_id: issue.raw?.qc_audit_id,
        order_id: issue.raw?.order_id,
        operation_id: issue.raw?.operation_id,
        style_id: issue.raw?.style_id,
        color: issue.colour,
        line_id: issue.raw?.line_id,
        tls_id: scannedTlsId ?? issue.raw?.tls_id,
        machine_id: issue.raw?.machine_id,
        branch_id: issue.raw?.branch_id,
        team_id: issue.raw?.team_id,
        shift_id: shiftData.shift_id,
        slot_id: issue.raw?.slot_id,
         work_category_id: issue.raw?.work_category_id ?? issue.raw?.work_cat_id,
        work_cat_id: issue.raw?.work_category_id ?? issue.raw?.work_cat_id,
         audit_by: auditByUserId,
         audit_at: now, 
        category_id: issue.raw?.category_id,
        defect_id: issue.raw?.defect_id,
        severity_id: issue.raw?.severity_id,
        category_name: issue.raw?.category_name,
        defect_name: issue.raw?.defect_name,
        severity_name: issue.raw?.severity_name,
        cap: capOptions,
        selected_cap: chosenCaps.map((c) => ({
          id: typeof c.id === 'string' && c.id.startsWith('custom_') ? null : c.id,
          cap_name: c.cap_name ?? c.label,
          short_name: c.short_name ?? c.cap_name ?? c.label,
        })),
        scan_time: scanTime ?? now,
        close_without_cap: closeWithoutCap ? 'TRUE' : 'FALSE',
        reason_for_closure: closeWithoutCap ? reasonForClosure : '',
        response_time: String(responseTime),
        elapsed_time: String(elapsedTime),
      };

      const result = await createTLSISSue(payload);

      if (result.success) { 
        const entryKey = getEntryKey(issue);
        if (entryKey) {
          clearDefectEntryTime(entryKey).catch(() => {});
        }

        showAlert(
          'success',
          closeWithoutCap ? 'Issue Closed' : 'Submitted',
          result.message ?? (closeWithoutCap ? 'Issue closed without CAP successfully.' : 'Audit submitted successfully.'),
        );

        navTimeoutRef.current = setTimeout(() => {
          navigation.navigate('TLSIssueTracker');
        }, POST_SUBMIT_NAV_DELAY_MS);
      } else {
        showAlert('error', 'Submission Failed', result.message ?? 'Something went wrong while submitting.');
        setSubmitting(false);
      }
    } catch (e) {
      showAlert('error', 'Submission Failed', e.message ?? 'Something went wrong while submitting.');
      setSubmitting(false);
    }
  }, [
    canSubmit,
    issue,
    scannedTlsId,
    scanTime,
    capturedTime,
    capOptions,
    chosenCaps,
    closeWithoutCap,
    reasonForClosure,
    auditByUserId,
    navigation,
  ]);

  const initialSelectedIds = useMemo(
    () => chosenCaps.map((c) => c.id).filter((id) => !(typeof id === 'string' && id.startsWith('custom_'))),
    [chosenCaps],
  );

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
                <Text style={[styles.severityPillText,  {  color: issue.light_hexcode ? '#FFFFFF' : AppColors.primary,}]}>{issue.severity.label}</Text>
              </View>
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
            <View style={[styles.progressSeg, styles.progressSegActive]} />
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
              <DetailRow styles={styles} label="Response Time (min)" value={issue.res_time_min} bordered />
              <DetailRow
                styles={styles}
                label="Elapsed Time (min)"
                value={`${formatStopwatch(elapsedSeconds)} (Live)`}
                bordered
                live
              />
            </View>
          </View>

          {closeWithoutCap ? (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="close-circle-outline" size={ms(15)} color={AppColors.error ?? AppColors.primary} />
                <Text style={styles.sectionHeaderText}>CLOSING WITHOUT CAP</Text>
              </View>
              <View style={styles.sectionBody}>
                <DetailRow styles={styles} label="Reason for Closure" value={reasonForClosure || '—'} />
              </View>
            </View>
          ) : null}

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="document-text-outline" size={ms(15)} color={AppColors.primaryDark ?? AppColors.primary} />
              <Text style={styles.sectionHeaderText}>
                CORRECTIVE ACTION PLAN (CAP)
                {!closeWithoutCap ? (
                  <Text style={{ color: AppColors.error }}>*</Text>
                ) : (
                  <Text style={{ color: AppColors.textTertiary, fontWeight: '400' }}> (optional)</Text>
                )}
              </Text>
            </View>

            {chosenCaps.length === 0 ? (
              <Pressable
                onPress={() => setSelectCapVisible(true)}
                style={({ pressed }) => [styles.capDashedBtn, pressed && { opacity: 0.8 }]}
              >
                <Ionicons name="add" size={ms(16)} color={AppColors.primary} />
                <Text style={styles.capDashedBtnText}>Select Corrective Action Plan</Text>
              </Pressable>
            ) : (
              <View style={{ paddingTop: mvs(12) }}>
                {chosenCaps.map((c) => (
                  <View key={c.id} style={styles.capChosenRow}>
                    <Text style={styles.capChosenText} numberOfLines={2}>{c.cap_name}</Text>
                    <Pressable onPress={() => removeCap(c.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close-circle-outline" size={ms(18)} color={AppColors.textTertiary} />
                    </Pressable>
                  </View>
                ))}
                <Pressable
                  onPress={() => setSelectCapVisible(true)}
                  style={({ pressed }) => [styles.capDashedBtn, { marginTop: 0 }, pressed && { opacity: 0.8 }]}
                >
                  <Ionicons name="add" size={ms(16)} color={AppColors.primary} />
                  <Text style={styles.capDashedBtnText}>Add More CAP</Text>
                </Pressable>
              </View>
            )}
          </View>

          {!canCreateAudit && (
            <View style={{ paddingHorizontal: ms(4), paddingTop: mvs(4) }}>
              <Text style={{ color: AppColors.error, fontSize: fs(12) }}>
                You don't have permission to submit audits.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
        >
          <Text style={[styles.primaryBtnText, !canSubmit && styles.primaryBtnTextDisabled]}>
            {submitting ? (closeWithoutCap ? 'Closing…' : 'Submitting…') : (closeWithoutCap ? 'Close Issue' : 'Submit')}
          </Text>
        </Pressable>
      </View>

      <OrderDetailsSheet
        visible={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        order={issue.order}
        operator={issue.operator}
        listRouteName="TLSIssueTracker"
        lineId={activeLineId}
      />

      <SelectCapModal
        visible={selectCapVisible}
        onClose={() => setSelectCapVisible(false)}
        options={capOptions}
        initialSelectedIds={initialSelectedIds}
        onApply={handleApplyCap}
        styles={styles}
        ms={ms}
      />
    </View>
  );
}
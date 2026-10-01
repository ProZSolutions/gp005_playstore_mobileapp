import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
 import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import createStyles from '../styles/IssueDetailStyles';
import { createQCAudit } from '../../api/services/tlsService';
import { showAlert } from '../../utils/AlertService';
import { usePermissions, GROUP, ACTION } from '../../context/PermissionsContext';
import {clearSelectedLineId,getShiftData} from '../../api/storage/authStorage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import OrderDetailsSheet from '../../components/OrderDetailsSheet';

const TEAL = AppColors.primary;
const SUCCESS = AppColors.success ?? '#16A34A';
const DANGER = AppColors.error ?? '#DC2626';
const POST_SUBMIT_NAV_DELAY_MS = 3000;

function formatStopwatch(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatMinSec(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(minutes)}.${pad(seconds)}`;
}
function formatMinSecond(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(minutes)}.${pad(seconds)}`;
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

function CapActionRow({ label, styles, ms }) {
  return (
    <View style={styles.capActionRow}>
      <Ionicons name="checkmark" size={ms(17)} color={SUCCESS} />
      <Text style={styles.capActionText}>{label}</Text>
    </View>
  );
}

function VerdictButton({ label, active, tone, onPress, styles, ms }) {
  const activeStyle =
    tone === 'pass'
      ? { borderColor: SUCCESS, backgroundColor: 'rgba(22,163,74,0.10)' }
      : { borderColor: DANGER, backgroundColor: 'rgba(220,38,38,0.08)' };
  const activeTextColor = tone === 'pass' ? SUCCESS : DANGER;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.verdictBtn, active && activeStyle, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.verdictBtnText, active && { color: activeTextColor }]}>{label}</Text>
    </Pressable>
  );
}
export default function QCCapInformationScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs } = useResponsive();
  const styles = createStyles(ms, mvs, fs);
  const issue = route?.params?.issue;
    const [shiftData, setShiftData] = useState(null);
  
   const scannedTlsId = route?.params?.scannedTlsId;
   const activeLineId = route?.params?.activeLineId;
  const scanTime = route?.params?.scanTime;
  const elapsedTimeAtEntry = route?.params?.elapsedTimeAtEntry; 
  const { can } = usePermissions();
  const canCreateQCAudit = can(GROUP.QCVERIFICATION, ACTION.CREATE);
const user =  route?.params?.user; 
   const userinfo = user?.name+" ("+user?.employee_code+")";
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [verdict, setVerdict] = useState(null); // 'pass' | 'fail' | null
  const [escalate, setEscalate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navTimeoutRef = useRef(null);
  useEffect(() => () => {
    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
  }, []);

  // ── Elapsed Time is anchored to the value the API returned on the Defect
  // Information screen (elapsedTimeAtEntry), not recalculated from scratch here.
  // It keeps ticking live on this screen, same as Defect Information.
  const baseCapturedAtRef = useRef(
    elapsedTimeAtEntry ? new Date(elapsedTimeAtEntry).getTime() : Date.now(),
  );

  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    Math.max(0, Math.floor((Date.now() - baseCapturedAtRef.current) / 1000)),
  );

  useEffect(() => {
    const tick = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - baseCapturedAtRef.current) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Response Time is a STATIC snapshot of Elapsed Time, captured once at
  // screen entry. It does not tick afterwards, even while Elapsed Time
  // keeps ticking on this screen.
  const responseTimeSecondsRef = useRef(
    Math.max(0, Math.floor((Date.now() - baseCapturedAtRef.current) / 1000)),
  );

  const responseTimeDisplay = formatMinSec(responseTimeSecondsRef.current);

  const capTakenItems = Array.isArray(issue?.capTaken) ? issue.capTaken : [];
  const canSubmit = verdict !== null && !submitting && canCreateQCAudit;
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
  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !issue) return;
    setSubmitting(true);
    try {
      // Elapsed Time keeps ticking and reflects live time on submit.
      // Response Time stays frozen to its value at screen entry (or the
      // previously stored value, if one exists) — it does not tick.
      const responseTime = responseTimeDisplay;
      const elapsedTime = formatMinSecond(elapsedSeconds);

      /* branch_id: issue.raw?.branch_id,
        team_id: issue.raw?.team_id, */


      const payload = { 
        proaudit_uuid:issue.raw?.proaudit_uuid,
        issue_uuid:issue.raw?.uuid,
        qc_audit_id: issue.raw?.qc_audit_id,
        order_id: issue.raw?.order_id,
        operation_id: issue.raw?.operation_id,
        style_id: issue.raw?.style_id,
        color_id: issue.colour,
        line_id: issue.raw?.line_id,
        tls_id: scannedTlsId ?? issue.raw?.tls_id,
        machine_id: issue.raw?.machine_id,
       
        shift_id: shiftData.shift_id,
        slot_id: issue.raw?.slot_id,
        category_id: issue.raw?.category_id,
        defect_id: issue.raw?.defect_id,
        severity_id: issue.raw?.severity_id,
        category_name: issue.raw?.category_name,
        defect_name: issue.raw?.defect_name,
        severity_name: issue.raw?.severity_name,
        cap: issue.raw?.cap ? issue.cap : [],
        selected_cap: issue.capTakenRaw ?? [],
        scan_time: scanTime ?? new Date().toISOString(),
        close_without_cap: 'FALSE',
        reason_for_closure: '',
        response_time: String(responseTime),
        elapsed_time: String(elapsedTime), 
        qc_verdict: verdict, // 'pass' | 'fail'
        is_escalate: escalate ? 'TRUE' : 'FALSE',
      };

      const result = await createQCAudit(payload);

      if (result.success) {
        showAlert(
          'success',
          verdict === 'pass' ? 'QC Passed' : 'QC Failed',
          result.message ?? 'QC verdict submitted successfully.',
        );
         await clearSelectedLineId();
          navigation.reset({
        index: 0,
        routes: [{ name: 'QCVerification' }],
      }); 
      } else {
        showAlert('error', 'Submission Failed', result.message ?? 'Something went wrong while submitting.');
        setSubmitting(false);
      }
    } catch (e) {
      showAlert('error', 'Submission Failed', e.message ?? 'Something went wrong while submitting.');
      setSubmitting(false);
    }
  }, [canSubmit, issue, scannedTlsId, scanTime, elapsedSeconds, responseTimeDisplay, verdict, escalate, navigation]);

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
              <View style={[styles.severityPill,{ backgroundColor: issue.light_hexcode ? issue.light_hexcode : AppColors.white }]}>
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
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="document-text-outline" size={ms(15)} color={AppColors.primaryDark ?? AppColors.primary} />
              <Text style={styles.sectionHeaderText}>QC Verification</Text>
            </View>
            <View style={styles.sectionBody}>
              <DetailRow styles={styles} label="Work Category" value={issue.workcategory} />
              <DetailRow styles={styles} label="Performed by" value={issue.perDet} bordered />
               <DetailRow
                styles={styles}
                label="Response Time (min)"
                value={responseTimeDisplay}
                bordered
                 
              />
              <DetailRow
                styles={styles}
                label="Elapsed Time (min)"
                value={`${formatStopwatch(elapsedSeconds)} (Live)`}
                bordered
                live
              />
            </View>
          </View>

          {capTakenItems.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="document-text-outline" size={ms(15)} color={AppColors.primaryDark ?? AppColors.primary} />
                <Text style={styles.sectionHeaderText}>CAP ACTION TAKEN</Text>
              </View>
              <View style={styles.capActionList}>
                {capTakenItems.map((label, i) => (
                  <CapActionRow key={`${label}-${i}`} label={label} styles={styles} ms={ms} />
                ))}
              </View>
            </View>
          )}

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="document-text-outline" size={ms(15)} color={AppColors.primaryDark ?? AppColors.primary} />
              <Text style={styles.sectionHeaderText}>
                QC VERDICT <Text style={{ color: AppColors.error }}>*</Text>
              </Text>
            </View>
            <View style={styles.verdictWrap}>
              <View style={styles.verdictRow}>
                <VerdictButton label="Pass" tone="pass" active={verdict === 'pass'} onPress={() => setVerdict('pass')} styles={styles} ms={ms} />
                <VerdictButton label="Fail" tone="fail" active={verdict === 'fail'} onPress={() => setVerdict('fail')} styles={styles} ms={ms} />
              </View>

              {verdict && (
                <View style={[styles.statusUpdatedPill, verdict === 'pass' ? styles.statusUpdatedPillPass : styles.statusUpdatedPillFail]}>
                  <View style={[styles.statusUpdatedDot, { backgroundColor: verdict === 'pass' ? SUCCESS : DANGER }]} />
                  <Text style={[styles.statusUpdatedText, { color: verdict === 'pass' ? SUCCESS : DANGER }]}>
                    TLS Status Updated to {verdict === 'pass' ? 'Green' : 'Red'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.escalateCard}>
            <View style={styles.escalateLeft}>
              <View style={styles.escalateIconWrap}>
              <MaterialCommunityIcons name="shield-alert-outline" size={ms(16)} color={AppColors.textSecondary} />
               
              </View>
              <Text style={styles.escalateLabel}>Escalate Issue</Text>
            </View>
            <Switch
              value={escalate}
              onValueChange={setEscalate}
              trackColor={{ false: '#D7DEDE', true: AppColors.primary }}
              thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
            />
          </View>

          {!canCreateQCAudit && (
            <View style={{ paddingHorizontal: ms(4), paddingTop: mvs(4) }}>
              <Text style={{ color: AppColors.error, fontSize: fs(12) }}>
                You don't have permission to submit a QC verdict.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <Pressable onPress={handleSubmit} disabled={!canSubmit} style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}>
          <Text style={[styles.primaryBtnText, !canSubmit && styles.primaryBtnTextDisabled]}>
            {submitting ? 'Submitting…' : 'Submit'}
          </Text>
        </Pressable>
      </View>

      <OrderDetailsSheet
        visible={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        order={issue.order}
        operator={issue.operator}
        lineId={activeLineId}
        listRouteName="QCVerification"
      />
    </View>
  );
}
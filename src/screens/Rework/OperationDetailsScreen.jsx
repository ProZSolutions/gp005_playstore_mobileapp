import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StatusBar,TextInput,
  ActivityIndicator,Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import GlobalStyles from '../styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import createStyless from '../styles/ReworkTrackerDetailsStyles';
import { AppInput } from '../../components/CommandBox';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import createStyles from '../styles/InputManagementStyles';
import { showAlert } from '../../utils/AlertService';
import reworkService from '../../api/services/reworkService';
import { usePermissions, GROUP, ACTION } from '../../context/PermissionsContext';
import {clearSelectedLineId} from '../../api/storage/authStorage';

const TEAL = AppColors.primary;
const LISTING_SCREEN = 'ReworkListScreen';

function DetailRow({ label, value, placeholder = '—', styles }) {
  const isEmpty = value === undefined || value === null || value === '';
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, isEmpty && styles.detailValuePlaceholder]}>
        {isEmpty ? placeholder : value}
      </Text>
    </View>
  );
}
 
function pickFirst(obj, keys) {
  if (!obj) return undefined;
  for (const key of keys) {
    const val = obj[key];
    if (val !== undefined && val !== null && val !== '') return val;
  }
  return undefined;
}

function normalizeAutoOperatorResponse(res) {
  const records = res?.data ?? res ?? {};
  // Some APIs nest operator details under an `operator` object instead
  // of flattening them onto the top-level record.
  const operatorObj = records.operator ?? records.employee ?? {};

  return {
    success: true,
    operation_id: pickFirst(records, ['operation_id', 'operationId']) ?? null,
    operation_name: pickFirst(records, ['operation_name', 'operationName']) ?? '',
    machine_type_id: pickFirst(records, ['machine_type_id', 'machineTypeId']) ?? null,
    machine_type_name: pickFirst(records, ['machine_type_name', 'machineTypeName']) ?? '',
    operator_name:
      pickFirst(records, ['operator_name', 'emp_name', 'employee_name', 'operatorName']) ??
      pickFirst(operatorObj, ['name', 'operator_name', 'emp_name', 'employee_name']) ??
      null,
    operator_id:
      pickFirst(records, ['operator_id', 'emp_id', 'employee_id', 'operatorId']) ??
      pickFirst(operatorObj, ['id', 'operator_id', 'emp_id', 'employee_id']) ??
      null,
    operator_code:
      pickFirst(records, ['operator_code', 'emp_code', 'employee_code', 'operatorCode']) ??
      pickFirst(operatorObj, ['code', 'operator_code', 'emp_code']) ??
      null,
  };
}

export default function OperationDetailsScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs } = useResponsive();
  const styles = createStyles(ms, mvs, fs);
 const styles_re = createStyless(ms, mvs, fs);
  const { can } = usePermissions();
  const canCreateRework = can(GROUP.REWORK, ACTION.CREATE);

  const {
    order,
    operator,
    line,
    lineId,
    shiftId,
    teamId,
    slotId,
    slot,
    scannedTlsId,
    outputBalance: passedOutputBalance,
    wipval,
    selectedSize,
    totalDefectCount,
    topDefect,
    notes,
    machineType,
    autoAssign,
    assignManually,
    selectedOperator,
    selectedOperation,
    tlsId,
    machineId,
    machineTypeId,
  } = route?.params ?? {};
  const [note, setNote] = useState('');

 
  const [submitting, setSubmitting] = useState(false);
  const [autoOperatorData, setAutoOperatorData] = useState(null);
  const [loadingAutoOperator, setLoadingAutoOperator] = useState(false);
  const [escalation, setEscalation] = useState(false);

  const outputBalance = passedOutputBalance ?? order?.balQty ?? order?.outputBalance ?? '—';

  const resolvedLineId = lineId ?? (Array.isArray(line) ? line[0] : line);
  const resolvedMachineId = machineId ?? selectedOperation?.raw?.machine_id ?? null;
  const resolvedTlsId = tlsId ?? scannedTlsId ?? null;

  // `autoAssign` sometimes arrives as a string ("true"/"false") through
  // navigation params instead of a real boolean — normalize it so the
  // guard below behaves correctly either way.
  const isAutoAssign = autoAssign === true || autoAssign === 'true';
  const isAssignManually = assignManually === true || assignManually === 'true';

  const baseResolvedMachineType = machineTypeId ?? machineType ?? selectedOperation?.machineType;

  console.log('[OperationDetailsScreen] selectedOperation (manual scan):', JSON.stringify(selectedOperation));
  console.log('[OperationDetailsScreen] isAutoAssign:', isAutoAssign, 'raw autoAssign:', autoAssign);

  // Fetch auto-operator details
  useEffect(() => {
    let cancelled = false;

    async function loadAutoOperator() {
      if (!order?.id || !isAutoAssign) return;

      const payload = {
        tls_id: resolvedTlsId,
        machine_id: resolvedMachineId,
        lineId: resolvedLineId,
        order_id: order?.id,
      };
      console.log('[OperationDetailsScreen] getAutoOperator payload:', JSON.stringify(payload));

      setLoadingAutoOperator(true);
      try {
        const res = await reworkService.getAutoOperator(payload);
        console.log('[OperationDetailsScreen] getAutoOperator raw response:', JSON.stringify(res));

        // Some backends put success at the top level, some nest it
        // under `data`. Check both before giving up.
        const isSuccess = res?.success === true || res?.data?.success === true;

        if (!cancelled && isSuccess) {
          const normalized = normalizeAutoOperatorResponse(res);
          console.log('[OperationDetailsScreen] normalized autoOperatorData:', JSON.stringify(normalized));
          setAutoOperatorData(normalized);
        } else if (!cancelled) {
          console.log('[OperationDetailsScreen] getAutoOperator did not report success, clearing data');
          setAutoOperatorData(null);
        }
      } catch (e) {
        console.log('[OperationDetailsScreen] getAutoOperator error:', e?.message);
        if (!cancelled) setAutoOperatorData(null);
      } finally {
        if (!cancelled) setLoadingAutoOperator(false);
      }
    }

    loadAutoOperator();

    return () => {
      cancelled = true;
    };
  }, [order?.id, resolvedTlsId, resolvedMachineId, resolvedLineId, isAutoAssign]);

  // Manual-assign values, taken straight from selectedOperation
  const manualOperationId = selectedOperation?.raw?.operation_id ?? selectedOperation?.id ?? null;
  const manualOperationName = selectedOperation?.raw?.operation?.operation_name ?? selectedOperation?.label ?? null;
  const manualMachineTypeId = selectedOperation?.raw?.machine_type_id ?? machineTypeId ?? null;
  const manualMachineTypeName = selectedOperation?.raw?.machine_type_name ?? selectedOperation?.raw?.machine?.type_name ?? null;

    console.log(" auto sssign "+JSON.stringify(autoOperatorData)+"  operation "+JSON.stringify(selectedOperator));

  // Resolved values for the UI + payload — single branch used everywhere
  const resolvedOperationId = isAutoAssign
    ? autoOperatorData?.operation_id ?? null
    : isAssignManually
      ? manualOperationId
      : selectedOperation?.id ?? null;

  

  const resolvedOperationName = isAutoAssign
    ? autoOperatorData?.operation_name
    : isAssignManually
      ? manualOperationName
      : selectedOperation?.label;

  const resolvedMachineTypeId = isAutoAssign
    ? autoOperatorData?.machine_type_id ?? null
    : isAssignManually
      ? manualMachineTypeId
      : machineTypeId ?? null;

  const resolvedMachineType = isAutoAssign
    ? autoOperatorData?.machine_type_name
    : isAssignManually
      ? manualMachineTypeName
      : baseResolvedMachineType;

  const resolveEmpName = isAutoAssign
    ? autoOperatorData?.operator_name
    : isAssignManually
      ? selectedOperator?.name
      : '-';

  const resolveCode = isAutoAssign ? autoOperatorData?.operator_code :isAssignManually ?selectedOperator?.code:'-';

  const resolveID = isAutoAssign
    ? autoOperatorData?.operator_id
    : isAssignManually
      ? selectedOperator?.id
      : '';

  const assignmentPlaceholder = isAutoAssign
    ? 'Auto Assigned'
    : isAssignManually
      ? '—'
      : 'Not Required';

  const handleSubmit = useCallback(async () => {
    if (submitting || !order || !canCreateRework) return;
    setSubmitting(true);
    try {
      const payload = {
        shift_id: shiftId ?? null,
         slot_id: slotId ?? null,
        line_id: resolvedLineId ?? null,
        order_id: order?.id ?? null,
        style_id: order?.styleId ?? order?.style_id ?? null,
        color_id: order?.colour ?? null,
        qr_id: null,
        qr_code: scannedTlsId ?? null,
        qr_details: null,
        size: selectedSize?.label ?? selectedSize?.id ?? null,
        category_id: topDefect?.category_id ?? null,
        defect_id: topDefect?.defect_id ?? null,
        severity_id: topDefect?.severity_id ?? null,
        qty: totalDefectCount ?? 0,
        category_name: topDefect?.category_name ?? null,
        defect_name: topDefect?.defect_name ?? null,
        severity_name: topDefect?.severity_name ?? null,
        is_assign_auto: isAutoAssign ? 1 : 0,
        is_assign_manual: isAssignManually ? 1 : 0,
        machine_id: resolvedMachineId ?? null,
        tls_id: tlsId ?? null,
        emp_id: resolveID ?? null,
         operation_id: resolvedOperationId,
        operation_name: resolvedOperationName ?? null,
        machine_type_id: resolvedMachineTypeId,
        machine_type_name: resolvedMachineType ?? null,
        is_escalate: escalation ? 1 : 0,
        notes: note ?? '',
      };

      const result = await reworkService.createRework(payload);

      if (!result.success) {
        showAlert('error', 'Submit failed', result.message || 'Could not submit rework.');
        return;
      }

      showAlert('success', 'Success', 'Rework submitted successfully.');
      navigation.reset({
        index: 0,
        routes: [{ name: LISTING_SCREEN }],
      });

    } catch (e) {
      showAlert('error', 'Submit failed', e?.message || 'Could not submit rework.');
    } finally {
      setSubmitting(false);
    }
  }, [
    submitting,
    order,
    canCreateRework,
    shiftId,
    teamId,
    slotId,
    resolvedLineId,
    scannedTlsId,
    selectedSize,
    totalDefectCount,
    topDefect,
    note,
    isAutoAssign,
    isAssignManually,
    selectedOperator,
    tlsId,
    resolvedMachineId,
    resolvedOperationId,
    resolvedOperationName,
    resolvedMachineTypeId,
    resolvedMachineType,
    resolveID,
    escalation,
    navigation,
  ]);

  if (!order) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={TEAL} />
        <SafeAreaView style={styles.emptyWrap}>
          <Icon name="alert-circle" size={ms(28)} color={AppColors.textTertiary} />
          <Text style={styles.emptyText}>No order details available.</Text>
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
            {/*   <Text style={styles.orderIdText} numberOfLines={1}>{order.tlsCode}</Text>*/}
            </View>

            {topDefect && (
              <View style={styles.badge}>
                <Icon name="alert-triangle" size={ms(11)} color={AppColors.onPrimary} style={styles.badgeIcon} />
                <Text style={styles.badgeText} numberOfLines={1}>
                  {topDefect.defect_name} - {topDefect.qty} ({topDefect.severity_name})
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.titleText}>Rework</Text>

          <View style={styles.metaWrap}>
            <View style={styles.metaRow}>
              <Icon name="layers" size={ms(14)} color={AppColors.onPrimary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{operator?.lineNo ?? line ?? '—'}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>WIP - {wipval}</Text>
           {/*    {slot?.slot_name ? (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>Slot - {slot.slot_name}</Text>
                </>
              ) : null}*/}
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
          {/* OUTPUT DETAILS */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="corner-up-left" size={ms(15)} color={AppColors.primaryDark} />
              <Text style={styles.sectionHeaderText}>OUTPUT DETAILS</Text>
            </View>
            <View style={styles.sectionBody}>
              <DetailRow styles={styles} label="Output Balance" value={String(outputBalance)} />
            </View>
          </View>

          {/* REWORK DETAILS (read-only) */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="file-text" size={ms(15)} color={AppColors.primaryDark} />
              <Text style={styles.sectionHeaderText}>REWORK DETAILS</Text>
            </View>
            <View style={styles.sectionBody}>
              <DetailRow styles={styles} label="Size" value={selectedSize?.label} />
              <DetailRow styles={styles} label="Defect Found" value={totalDefectCount > 0 ? String(totalDefectCount) : undefined} />
             {/* <DetailRow styles={styles} label="Slot" value={slot?.slot_name} />
               Category picked in the DefectEntrySheet's left rail —
                  matches the fix applied on ReworkDetailsScreen. */}
              <DetailRow styles={styles} label="Defect Category" value={topDefect?.category_name} />
            </View>
          </View>

          {/* OPERATOR & OPERATION DETAILS (read-only) */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="user" size={ms(15)} color={AppColors.primaryDark} />
              <Text style={styles.sectionHeaderText}>OPERATOR & OPERATION DETAILS</Text>
              {loadingAutoOperator ? (
                <ActivityIndicator size="small" color={AppColors.primaryDark} style={{ marginLeft: ms(6) }} />
              ) : null}
            </View>
            <View style={styles.sectionBody}>
              <DetailRow styles={styles} label="Auto Assign Operator" value={isAutoAssign ? 'Yes' : 'No'} />
              <DetailRow styles={styles} label="Assign Manually" value={isAssignManually ? 'Yes' : 'No'} />
              <DetailRow
                styles={styles}
                label="Employee Name"
                  value={
                  resolveEmpName && resolveCode
                    ? `${resolveEmpName} (${resolveCode})`
                    : autoAssign
                      ? ''
                      : "-"
                }
                placeholder={assignmentPlaceholder}
              />
              <DetailRow
                styles={styles}
                label="Operation"
                value={resolvedOperationName}
                placeholder={assignmentPlaceholder}
              />
              <DetailRow styles={styles} label="Machine Type" value={resolvedMachineType} />
            </View>
          </View>


          {/* SCAN DETAILS (read-only) — only shown when a scan actually
              happened (Auto Assign or Assign Manually was on). */}
          {tlsId ? (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Icon name="maximize" size={ms(15)} color={AppColors.primaryDark} />
                <Text style={styles.sectionHeaderText}>SCAN DETAILS</Text>
              </View>
              <View style={styles.sectionBody}>
                <DetailRow styles={styles} label="Qone ID" value={tlsId} />
              </View>
            </View>
          ) : null}


             {autoAssign ?(<View >
                     <View style={styles_re.sectionCard}>

                     
                     
                          <AppInput
                            label="NOTES"
                            value={note}
                            onChangeText={setNote}
                            placeholder="Add any observation or notes…"
                            multiline
                            numberOfLines={4}
                            maxLength={200}
                            showCharCount
                            containerStyle={{ marginBottom: 0 }}
                            style=""
                          />                         
                          </View>

                      <View style={styles_re.sectionCard}>
                        <View style={[styles_re.sectionBody, { paddingTop: mvs(10), paddingBottom: mvs(10) }]}>
                          <View style={styles_re.escalateRow}>
                            <View style={styles_re.escalateLeft}>
                              <View style={styles_re.escalateIconWrap}>
                               <MaterialCommunityIcons name="shield-alert-outline" size={ms(16)} color={AppColors.secondary} />
                              
                              </View>
                              <Text style={styles_re.escalateLabel}>Escalate Issue</Text>
                            </View>
                            <Switch
                              value={escalation}
                              onValueChange={setEscalation}
                              trackColor={{ true: TEAL, false: AppColors.border }}
                              thumbColor={AppColors.onPrimary}
                            />
                          </View>
                        </View></View>
                      </View>):null}



           <View style={GlobalStyles.text.warningBox}>

            <Text style={[GlobalStyles.text.warningText,GlobalStyles.text.mt]}>
              Select a valid Qone scan that has been mapped to retrieve employee and operation information{'\n'}
            </Text>
          </View>




          {/*
          <View style={styles.sectionCard}>
            <Text style={styles.notesLabel}>NOTES</Text>
            <Text style={[styles.notesText, !notes && styles.notesTextEmpty]}>
              {notes ? notes : 'No notes added.'}
            </Text>
          </View> */}
        </ScrollView>
      </View>

      {canCreateRework ? (
        <View style={styles.footer}>
          <Pressable
            disabled={submitting}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitBtn,
              submitting && styles.submitBtnDisabled,
              pressed && !submitting && { opacity: 0.9 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={AppColors.onPrimary} />
            ) : (
              <Text style={styles.submitBtnText}>Submit</Text>
            )}
          </Pressable>
        </View>
      ) : (
        <View style={styles.footer}>
          <Text style={styles.emptyText}>You do not have permission to submit rework.</Text>
        </View>
      )}
    </View>
  );
} 
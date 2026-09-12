import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StatusBar,
  ActivityIndicator,Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import createStyles from '../styles/InputManagementStyles';
import { showAlert } from '../../utils/AlertService';
import reworkService from '../../api/services/rejectionService';
import { usePermissions, GROUP, ACTION } from '../../context/PermissionsContext';
import rejectionService from '../../api/services/reworkService';
import {clearSelectedLineId} from '../../api/storage/authStorage';
import GlobalStyles from '../styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import createStyless from '../styles/ReworkTrackerDetailsStyles';
import { AppInput } from '../../components/CommandBox';

const TEAL = AppColors.primary;
const LISTING_SCREEN = 'RejectionListScreen';

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

export default function OperationDetailsScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs } = useResponsive();
  const styles = createStyles(ms, mvs, fs);
   const styles_re = createStyless(ms, mvs, fs);
  const { can } = usePermissions();
  const canCreateRework = can(GROUP.REJECTION, ACTION.CREATE);
  const [note, setNote] = useState('');

  const {
    order,
    operator,
    line,
    lineId,
    shiftId,
    teamId,
    slotId,
    wipVal,
    slot,
    scannedTlsId,
    outputBalance: passedOutputBalance,
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
  const [escalation, setEscalation] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [autoOperatorData, setAutoOperatorData] = useState(null);
  const [loadingAutoOperator, setLoadingAutoOperator] = useState(false);

  const outputBalance = passedOutputBalance ?? order?.balQty ?? order?.outputBalance ?? '—';

  const resolvedLineId = lineId ?? (Array.isArray(line) ? line[0] : line);
  const resolvedMachineId = machineId ?? selectedOperation?.raw?.machine_id ?? null;
  const resolvedTlsId = tlsId ?? scannedTlsId ?? null;

  const baseResolvedMachineType = machineTypeId ?? machineType ?? selectedOperation?.machineType;

  // Fetch machine type / operation name from auto-operator endpoint
  useEffect(() => {
    let cancelled = false;

    async function loadAutoOperator() {
      if (!order?.id || !autoAssign) return;

      setLoadingAutoOperator(true);
      try {
        const res = await rejectionService.getAutoOperator({
          tls_id: resolvedTlsId,
          machine_id: resolvedMachineId,
          lineId: resolvedLineId,
          order_id: order?.id,
        });
          console.log("rejection manual details response "+JSON.stringify(res))

        if (!cancelled && res?.success) {
           const records = res?.data ?? res ?? {};

          setAutoOperatorData({
            success: true,
            operation_id: records.operation_id ?? null,
            operation_name: records.operation_name ?? '',
            machine_type_id: records.machine_type_id ?? null,
            machine_type_name: records.machine_type_name ?? '',
            operator_name:records.operator_name ??null,
            operator_id:records.operator_id??null,
            operator_code:records.operator_code ??null,
          });
        }
      } finally {
        if (!cancelled) setLoadingAutoOperator(false);
      }
    }

    loadAutoOperator();

    return () => {
      cancelled = true;
    };
  }, [order?.id, resolvedTlsId, resolvedMachineId, resolvedLineId, autoAssign]);
  const manualOperationId = selectedOperation?.raw?.operation_id ?? selectedOperation?.id ?? null;
    console.log(" auto sssign "+JSON.stringify(autoOperatorData)+"  operation "+JSON.stringify(selectedOperation));
   const resolvedMachineType = autoAssign
    ? autoOperatorData?.machine_type_name
    : assignManually
      ? selectedOperation?.raw?.machine_type_name
      : baseResolvedMachineType;
  const resolvedOperationId = autoAssign
    ? autoOperatorData?.operation_id ?? null
    : assignManually
      ? manualOperationId
      : selectedOperation?.id ?? null;
  const resolvedOperationName = autoAssign
    ? autoOperatorData?.operation_name
    : assignManually
      ? selectedOperation?.raw?.operation?.operation_name
      : selectedOperation?.label;


  const resolveEmpName = autoAssign
    ? autoOperatorData?.operator_name
    : assignManually
      ? selectedOperator?.name
      : '-';
const resolveCode = autoAssign ? autoOperatorData?.operator_code :assignManually ?selectedOperator?.code:'-';
  const resolveID = autoAssign
    ? autoOperatorData?.operator_id
    : assignManually
      ? selectedOperator?.id
      : '';


  const assignmentPlaceholder = autoAssign
    ? 'Auto Assigned'
    : assignManually
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
        is_assign_auto: autoAssign ? 1 : 0,
        is_assign_manual: assignManually ? 1 : 0,
        machine_id: resolvedMachineId ?? null,
        tls_id: tlsId ?? null,
        emp_id: resolveID ?? null,

        // Conditional machine/operation mapping
        operation_id: autoAssign
          ? autoOperatorData?.operation_id
          : assignManually
            ? selectedOperation?.raw?.operation_id
            : selectedOperation?.id ?? null,

        machine_type_id: autoAssign
          ? autoOperatorData?.machine_type_id
          : assignManually
            ? selectedOperation?.raw?.machine_type_id
            : machineTypeId ?? null,

        operation_name: autoAssign
          ? autoOperatorData?.operation_name
          : assignManually
            ? selectedOperation?.raw?.operation?.operation_name
            : selectedOperation?.label ?? null,

        machine_type_name: autoAssign
          ? autoOperatorData?.machine_type_name
          : assignManually
            ? selectedOperation?.raw?.machine?.type_name
            : resolvedMachineType ?? null,

        is_escalate: escalation ? 1 : 0,
        notes: note ?? '',
      };

      const result = await reworkService.createRework(payload);

      if (!result.success) {
        showAlert('error', 'Submit failed', result.message || 'Could not submit rejection.');
        return;
      }

      showAlert('success', 'Success', 'Rejection submitted successfully.');
      await clearSelectedLineId();
       navigation.reset({
        index: 0,
        routes: [{ name: LISTING_SCREEN }],
      });
    } catch (e) {
      showAlert('error', 'Submit failed', e?.message || 'Could not submit rejection.');
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
    autoAssign,
    assignManually,
    selectedOperator,
    selectedOperation,
    tlsId,
    resolvedMachineId,
    machineTypeId,
    autoOperatorData,
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
             {/*  <Text style={styles.orderIdText} numberOfLines={1}>{order.tlsCode}</Text>*/}
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

          <Text style={styles.titleText}>Rejection</Text>

          <View style={styles.metaWrap}>
            <View style={styles.metaRow}>
              <Icon name="layers" size={ms(14)} color={AppColors.onPrimary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{operator?.lineNo ?? line ?? '—'}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>WIP - {wipVal}</Text>
             {/*  {slot?.slot_name ? (
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
              <Text style={styles.sectionHeaderText}>REJECTION DETAILS</Text>
            </View>
            <View style={styles.sectionBody}>
              <DetailRow styles={styles} label="Size" value={selectedSize?.label} />
              <DetailRow styles={styles} label="Defect Found" value={totalDefectCount > 0 ? String(totalDefectCount) : undefined} />
             {/* <DetailRow styles={styles} label="Slot" value={slot?.slot_name} /> */}
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
              <DetailRow styles={styles} label="Auto Assign Operator" value={autoAssign ? 'Yes' : 'No'} />
              <DetailRow styles={styles} label="Assign Manually" value={assignManually ? 'Yes' : 'No'} />
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
              Select a valid Qone scan that has been mapped to retrieve employee and operation information
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
          <Text style={styles.emptyText}>You do not have permission to submit rejection.</Text>
        </View>
      )}
    </View>
  );
}
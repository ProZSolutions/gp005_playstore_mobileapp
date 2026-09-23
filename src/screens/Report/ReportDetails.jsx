import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, StatusBar, StyleSheet, FlatList,
  ActivityIndicator, BackHandler, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { showAlert } from '../../utils/AlertService';
import { usePermissions, GROUP, ACTION } from '../../context/PermissionsContext';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import createStyles from '../styles/IssueDetailStyles';
import createStyless from '../styles/ReworkTrackerDetailsStyles';
import CommonBottomModal from '../../components/CommonBottomModal';
// ASSUMPTION: same "retrieve" action as Escalation, just repointed at a
// report-scoped endpoint. Swap this import if Report has its own service.
import { retrieveReport } from '../../api/services/aqlAuditService';

const TEAL = AppColors.primary;

const TABLET_BREAKPOINT = 850;
const MAX_CONTENT_WIDTH = 750;

const RECORD_TYPE_META = {
  product_audit: { title: 'TLS Audit Details', icon: 'aperture-outline' },
  audit: { title: 'TLS Audit Details', icon: 'aperture-outline' },
  rework: { title: 'Rework Details', icon: 'construct-outline' },
  rework_tracker: { title: 'Rework Tracker Details', icon: 'time-outline' },
  rejection: { title: 'Rejection Details', icon: 'close-circle-outline' },
  rejection_tracker: { title: 'Rejection Tracker Details', icon: 'time-outline' },
  qc_verification: { title: 'QC Verification Details', icon: 'shield-checkmark-outline' },
  aql_audit: { title: 'AQL Audit', icon: 'clipboard-outline' },
};
const DEFAULT_META = { title: 'Additional Details', icon: 'document-text-outline' };

const AUDIT_RECORD_TYPES = new Set(['product_audit', 'audit']);

const RECORD_ID_FIELD = {
  product_audit: 'process_audit_id',
  audit: 'process_audit_id',
  rework: 'rework_id',
  rework_tracker: 'rework_tracker_id',
  rejection: 'rejection_id',
  rejection_tracker: 'rejection_tracker_id',
  qc_verification: 'uuid',
};

function getRecordIdentifier(record) {
  const field = RECORD_ID_FIELD[record?.record_type];
  const value = field ? record?.[field] : undefined;
  return value ?? record?.uuid ?? record?.id ?? null;
}

const ORDER_FIELD_DEFS = [
  ['order_no', 'Order No.'],
  ['buyer_name', 'Buyer'],
  ['style_name', 'Style'],
  ['colour', 'Colour', 'color_id'],
  ['operation_name', 'Operation'],
  ['line_name', 'Line'],
  ['branch_name', 'Branch'],
  ['team_name', 'Team'],
  ['shift_name', 'Shift'],
  ['machine_no', 'Machine No.'],
  ['auditor_name', 'Auditor'],
  ['operator_name', 'Operator'],
];
const DETAIL_OBJECT_KEYS = {
  rework: ['rework_details'],
  rework_tracker: ['rework_details', 'rework_tracker_details'],
  rejection: ['rejection_details'],
  rejection_tracker: ['rejection_details', 'rejection_tracker_details'],
};

const NESTED_CARD_META = {
  rework_details: { title: 'Rework Details', icon: 'construct-outline' },
  rework_tracker_details: { title: 'Tracker Update', icon: 'time-outline' },
  rejection_details: { title: 'Rejection Details', icon: 'close-circle-outline' },
  rejection_tracker_details: { title: 'Tracker Update', icon: 'time-outline' },
};

const NESTED_SKIP_KEYS = {
  rework_details: ['status'],
  rework_tracker_details: ['status', 'work_audit_by_name'],
  rejection_details: ['status'],
  rejection_tracker_details: [
    'status', 'qty', 'size', 'defect_name', 'category_name', 'severity_name', 'notes', 'work_audit_by_name',
  ],
};

const DUPLICATE_TOP_LEVEL_KEYS = [
  'category_id', 'category_name', 'defect_id', 'defect_name', 'severity_id', 'severity_name', 'selected_cap',
];

const HIDDEN_KEYS = new Set([
  'record_type', 'is_escalate', 'is_active', 'created_by', 'updated_by',
  'created_at', 'updated_at', 'uuid', 'issue_uuid', 'tls_issue_uuid',
  'proaudit_uuid', 'rework_source_table', 'rework_tracker_source_table',
  'rejection_source_table', 'rejection_tracker_source_table', 'is_completed',
  'total_minor', 'total_major', 'total_critical', 'process_status', 'product_source_table',
  'audit_by', 'work_audit_by', 'inspection_status', 'aql_result',
  ...ORDER_FIELD_DEFS.flatMap(([k, , alt]) => (alt ? [k, alt] : [k])),
]);
const ID_KEY_EXEMPTIONS = new Set(['tls_id']);
const isIdKey = (key) => (key === 'id' || key.endsWith('_id')) && !ID_KEY_EXEMPTIONS.has(key);

const isSourceTableKey = (key) => key === 'source_table' || key.endsWith('_source_table');

const MULTILINE_KEYS = new Set(['comments', 'notes']);
const BOOLEANISH_KEYS = new Set(['is_completed']);

const LABEL_OVERRIDES = {
  qty: 'Quantity', size: 'Size', status: 'Status', notes: 'Notes',
  is_completed: 'Completed', category_name: 'Category', defect_name: 'Defect',
  severity_name: 'Severity', work_audit_at: 'Worked At',
  work_audit_by_name: 'Audit by',
  spi_count: 'SPI Count', total_minor: 'Minor', total_major: 'Major',
  total_critical: 'Critical', qc_verdict: 'QC Verdict', tls_id: 'Qone Device Id',
  comments: 'Comments', selected_cap: 'CAP', cap: 'CAP',
  quality_check: 'Quality Checks', defect_details: 'Defects',
  level_minor: 'AQL Level Minor',
  level_major: 'AQL Level Major',
  level_critical: 'AQL Level Critical',
  allow_minor: 'Allowed Minor',
  allow_major: 'Allowed Major',
  allow_critical: 'Allowed Critical',
};
const ITEM_HIDDEN_KEYS = new Set([
  'uuid', 'is_escalate', 'product_is_completed', 'product_created_by', 'product_updated_by',
]);

const SEVERITY_CHIP_STYLES = {
  critical: { bg: '#FDECEA', text: '#C62828' },
  major: { bg: '#FFF3E0', text: '#E65100' },
  minor: { bg: '#FFFDE7', text: '#F9A825' },
};
const getSeverityChipStyle = (name) => {
  const key = (name || '').trim().toLowerCase();
  return SEVERITY_CHIP_STYLES[key] ?? { bg: '#EEEEEE', text: '#616161' };
};

function humanizeKey(key) {
  if (LABEL_OVERRIDES[key]) return LABEL_OVERRIDES[key];
  return String(key).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function displayOrDash(value) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

function formatValueForKey(key, value) {
  if (key.endsWith('_at')) return formatDate(value);
  if (key === 'aql_result') {
    if (value === 0 || value === '0') return 'Pass';
    if (value === 1 || value === '1') return 'Fail';
    return displayOrDash(value);
  }
  if (BOOLEANISH_KEYS.has(key)) {
    const truthy = value === true || value === 1 || value === '1';
    return truthy ? 'Yes' : 'No';
  }
  return displayOrDash(value);
}

function safeParseArray(value) {
  if (!value) return null;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : null;
    } catch (e) {
      return null;
    }
  }
  return null;
}

function splitObjectFields(obj, { skipKeys = [] } = {}) {
  const rows = [];
  const multilineRows = [];
  const arraySections = [];
  const skip = new Set(skipKeys);

  Object.entries(obj ?? {}).forEach(([key, value]) => {
    if (skip.has(key) || HIDDEN_KEYS.has(key) || isIdKey(key) || isSourceTableKey(key)) return;
    if (value === null || value === undefined) return;

    const arr = safeParseArray(value);
    if (arr) {
      if (arr.length) arraySections.push({ key, label: humanizeKey(key), items: arr });
      return;
    }
    if (typeof value === 'object') return;

    const row = { label: humanizeKey(key), value: formatValueForKey(key, value), multiline: MULTILINE_KEYS.has(key) };
    if (row.multiline) multilineRows.push(row);
    else rows.push(row);
  });

  return { rows: [...rows, ...multilineRows], arraySections };
}

function DetailRow({ label, value, styles, bordered, multiline }) {
  if (multiline) {
    return (
      <View style={[styles.detailRowMultiline, bordered && styles.detailRowBorder]}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.detailRow, bordered && styles.detailRowBorder]}>
      <Text style={styles.detailLabel} numberOfLines={1}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">{value}</Text>
    </View>
  );
}

function createExtraStyles(ms, mvs, fs) {
  return StyleSheet.create({
    defectMainRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
    severityInlineChip: { paddingHorizontal: ms(8), paddingVertical: mvs(4), borderRadius: ms(10), flexShrink: 0 },
    severityInlineText: { fontSize: fs(11), fontWeight: '700' },
    defectRight: { flex: 1, alignItems: 'flex-end', marginLeft: ms(10) },
    defectCategoryDefect: { fontSize: fs(12), fontWeight: '600', color: '#222', textAlign: 'right' },
    capChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: ms(6), marginTop: mvs(8) },
    capChip: {
      backgroundColor: 'transparent', borderWidth: 1, borderColor: '#C7D2FE',
      borderRadius: ms(10), paddingHorizontal: ms(8), paddingVertical: mvs(3),
    },
    capChipText: { fontSize: fs(11), color: '#3730A3', fontWeight: '600' },
    arrayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: mvs(10) },
    arrayLeft: { flexDirection: 'row', alignItems: 'center' },
    countBadge: {
      minWidth: ms(22), height: ms(22), borderRadius: ms(11), paddingHorizontal: ms(6),
      alignItems: 'center', justifyContent: 'center', marginRight: ms(8),
    },
    countBadgeText: { fontSize: fs(12), fontWeight: '700', color: AppColors.onPrimary },
    arrayLabel: { fontSize: fs(13), fontWeight: '600', color: AppColors.textPrimary ?? '#222' },
    chevron: { marginLeft: ms(6) },
    itemList: { paddingBottom: mvs(4), width: '100%', alignSelf: 'center', maxWidth: MAX_CONTENT_WIDTH },
    itemCard: {
      marginHorizontal: ms(12), marginTop: mvs(6), padding: ms(8), borderRadius: ms(10),
      backgroundColor: 'transparent', borderWidth: 1, borderColor: '#E5E7EB',
    },
    itemIndexText: { fontSize: fs(11), fontWeight: '700', color: AppColors.primary, marginBottom: mvs(4) },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: mvs(2) },
    itemLabel: { fontSize: fs(12), color: '#767676', flex: 1 },
    itemValue: { fontSize: fs(12), color: '#222', flex: 1, textAlign: 'right' },
    severityChip: { paddingHorizontal: ms(8), paddingVertical: mvs(3), borderRadius: ms(10), marginBottom: mvs(6) },
    severityChipText: { fontSize: fs(11), fontWeight: '700' },
    capModalWrap: {
      flexDirection: 'row', flexWrap: 'wrap', gap: ms(8),
      paddingHorizontal: ms(16), paddingVertical: mvs(12),
      width: '100%', alignSelf: 'center', maxWidth: MAX_CONTENT_WIDTH,
    },
    qcListWrap: {
      flexDirection: 'row', flexWrap: 'wrap', gap: ms(8),
      paddingHorizontal: ms(16), paddingTop: mvs(12), paddingBottom: mvs(8),
      width: '100%', alignSelf: 'center', maxWidth: MAX_CONTENT_WIDTH,
    },
    qcPill: {
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: ms(10), paddingVertical: mvs(6),
      borderRadius: ms(14), gap: ms(5),
    },
    qcPillPass: { backgroundColor: '#ECFDF5' },
    qcPillFail: { backgroundColor: '#FEF2F2' },
    qcPillText: { fontSize: fs(12), fontWeight: '600' },
    bottomBar: {
      paddingHorizontal: ms(16), paddingTop: mvs(10), paddingBottom: mvs(14),
      backgroundColor: AppColors.surface ?? '#FFFFFF',
      borderTopWidth: 1, borderTopColor: '#ECECEC',
      alignItems: 'center',
    },
    bottomBarInner: { width: '100%', maxWidth: MAX_CONTENT_WIDTH },
    retrieveButton: {
      height: ms(48), borderRadius: ms(12), backgroundColor: AppColors.primary,
      alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
    },
    retrieveButtonDisabled: { opacity: 0.6 },
    retrieveButtonText: { color: AppColors.onPrimary, fontSize: fs(15), fontWeight: '700', marginLeft: ms(8) },
  });
}

function ArraySummaryRow({ label, items, styles, extraStyles, ms, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [extraStyles.arrayRow, styles.detailRowBorder, pressed && { opacity: 0.7 }]}
    >
      <View style={extraStyles.arrayLeft}>
        <View style={[extraStyles.countBadge, { backgroundColor: AppColors.primary }]}>
          <Text style={extraStyles.countBadgeText}>{items.length}</Text>
        </View>
        <Text style={extraStyles.arrayLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={ms(16)} color={AppColors.textTertiary} style={extraStyles.chevron} />
    </Pressable>
  );
}

function DefectItemCard({ item, extraStyles }) {
  const capList = safeParseArray(item?.cap) ?? [];
  const capNames = [...new Set(capList.map((c) => c?.cap_name).filter(Boolean))];

  const severity = displayOrDash(item?.severity_name);
  const quantity = displayOrDash(item?.qty);
  const category = displayOrDash(item?.category_name);
  const defect = displayOrDash(item?.defect_name);

  const severityStyle = item?.severity_name ? getSeverityChipStyle(item.severity_name) : null;

  return (
    <View style={extraStyles.itemCard}>
      <View style={extraStyles.defectMainRow}>
        {severityStyle ? (
          <View style={[extraStyles.severityInlineChip, { backgroundColor: severityStyle.bg }]}>
            <Text style={[extraStyles.severityInlineText, { color: severityStyle.text }]}>
              {severity !== '-' && quantity !== '-' ? `${severity} - ${quantity}` : severity !== '-' ? severity : quantity !== '-' ? quantity : '-'}
            </Text>
          </View>
        ) : (
          <View style={extraStyles.severityInlineChip}>
            <Text style={extraStyles.severityInlineText}>
              {severity !== '-' && quantity !== '-' ? `${severity} - ${quantity}` : severity !== '-' ? severity : quantity !== '-' ? quantity : '-'}
            </Text>
          </View>
        )}

        <View style={extraStyles.defectRight}>
          <Text style={extraStyles.defectCategoryDefect} numberOfLines={1} ellipsizeMode="tail">
            {category} - {defect}
          </Text>
        </View>
      </View>

      {capNames.length > 0 && (
        <View style={extraStyles.capChipsRow}>
          {capNames.map((name, idx) => (
            <View key={`${name}-${idx}`} style={extraStyles.capChip}>
              <Text style={extraStyles.capChipText}>{name}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function ArrayDetailModal({ visible, onClose, title, items, ms, sectionKey, extraStyles }) {
  const isQualityCheck = sectionKey === 'quality_check';
  const isCapSection = sectionKey === 'cap' || sectionKey === 'selected_cap';

  return (
    <CommonBottomModal visible={visible} onClose={onClose} title={`${title ?? ''} (${items?.length ?? 0})`} ms={ms}>
      {isQualityCheck ? (
        <View style={extraStyles.qcListWrap}>
          {(items ?? []).map((c, idx) => {
            const pass = String(c?.status).toLowerCase() === 'pass';
            return (
              <View key={`${c?.check_name}-${idx}`} style={[extraStyles.qcPill, pass ? extraStyles.qcPillPass : extraStyles.qcPillFail]}>
                <Ionicons name={pass ? 'checkmark-circle' : 'close-circle'} size={ms(14)} color={pass ? '#16A34A' : AppColors.error} />
                <Text style={[extraStyles.qcPillText, { color: pass ? '#16A34A' : AppColors.error }]}>{c?.check_name}</Text>
              </View>
            );
          })}
        </View>
      ) : isCapSection ? (
        <View style={extraStyles.capModalWrap}>
          {[...new Set((items ?? []).map((c) => c?.cap_name).filter(Boolean))].map((name, idx) => (
            <View key={`${name}-${idx}`} style={extraStyles.capChip}>
              <Text style={extraStyles.capChipText}>{name}</Text>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={extraStyles.itemList}
          renderItem={({ item }) => <DefectItemCard item={item} extraStyles={extraStyles} />}
        />
      )}
    </CommonBottomModal>
  );
}

function SectionCard({ icon, title, rows, arraySections, styles, extraStyles, ms, onOpenArray, emptyText }) {
  const hasContent = (rows && rows.length) || (arraySections && arraySections.length);

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeaderRow}>
        <Ionicons name={icon} size={ms(15)} color={AppColors.primaryDark ?? AppColors.primary} />
        <Text style={styles.sectionHeaderText}>{title.toUpperCase()}</Text>
      </View>
      <View style={styles.sectionBody}>
        {!hasContent && <Text style={styles.detailValue}>{emptyText ?? 'No additional details available.'}</Text>}
        {rows?.map((row, i) => (
          <DetailRow key={row.label} styles={styles} label={row.label} value={row.value} bordered={i > 0} multiline={row.multiline} />
        ))}
        {arraySections?.map((section) => (
          <ArraySummaryRow
            key={section.key}
            label={section.label}
            items={section.items}
            styles={styles}
            extraStyles={extraStyles}
            ms={ms}
            onPress={() => onOpenArray(section)}
          />
        ))}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------------ */
/*  Screen                                                                    */
/* ------------------------------------------------------------------------ */

export default function ReportDetailsScreen({ navigation, route }) {
  const { canView, can, loading: permsLoading } = usePermissions();
  // ASSUMPTION: reuse the Escalation permission group for the retrieve
  // action. Swap to a dedicated GROUP.REPORT (+ ACTION) once one exists.
  const canViewGroup = canView(GROUP.ESCALATION);
  const canRetrieve = canViewGroup && can(GROUP.ESCALATION, ACTION.RET);

  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs } = useResponsive();
  const styles = createStyles(ms, mvs, fs);
  const styles_re = createStyless(ms, mvs, fs);
  const extraStyles = useMemo(() => createExtraStyles(ms, mvs, fs), [ms, mvs, fs]);

  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= TABLET_BREAKPOINT;
  const contentWidthStyle = isTablet
    ? { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' }
    : null;

  const record = route?.params?.issue?.raw ?? route?.params?.issue ?? {};
  const recordType = record.record_type;
  const meta = RECORD_TYPE_META[recordType] ?? DEFAULT_META;

  const [activeArray, setActiveArray] = useState(null);
  const [retrieving, setRetrieving] = useState(false);
  const val = useCallback(
    (key, alt) => displayOrDash(record[key] ?? (alt ? record[alt] : undefined)),
    [record],
  );

  const { nestedCards, additional } = useMemo(() => {
    const cards = [];
    const nestedKeys = DETAIL_OBJECT_KEYS[recordType] ?? [];

    nestedKeys.forEach((key) => {
      const obj = record[key];
      if (!obj || typeof obj !== 'object') return;
      const { rows, arraySections } = splitObjectFields(obj, { skipKeys: NESTED_SKIP_KEYS[key] ?? ['status'] });
      const nmeta = NESTED_CARD_META[key] ?? { title: humanizeKey(key), icon: 'document-text-outline' };
      cards.push({ ...nmeta, rows, arraySections });
    });

    const skipTopLevel = [
      ...ORDER_FIELD_DEFS.map(([k]) => k),
      ...nestedKeys,
      ...(nestedKeys.length ? DUPLICATE_TOP_LEVEL_KEYS : []),
      'status',
    ];
    const { rows, arraySections } = splitObjectFields(record, { skipKeys: skipTopLevel });

    return { nestedCards: cards, additional: { rows, arraySections } };
  }, [record, recordType]);

  const hasFallbackContent = additional.rows.length > 0 || additional.arraySections.length > 0;
  const showFallbackCard = hasFallbackContent && nestedCards.length === 0;
  const noSpecificDetails = nestedCards.length === 0 && !hasFallbackContent;

  const handleRetrieve = async () => {
    if (retrieving) return;
    const uuid = record?.uuid;
    const recType = record?.record_type;
    const qc_audit_id = AUDIT_RECORD_TYPES.has(recType) ? (record?.qc_audit_id ?? null) : null;

    if (!uuid || !recordType) {
      showAlert('success', 'Unable to Retrieve', 'Could not determine an identifier for this record.');
      return;
    }
    setRetrieving(true);
    try {
      const result = await retrieveReport({ uuid, type: recType, qc_audit_id });
      if (result?.success) {
        showAlert('success', 'Submition Success', result.message ?? 'Could not submit the report.');
      }
    } finally {
      setRetrieving(false);
      handleBackReset();
    }
  };

  const handleBackReset = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'ReportList' }],
    });
    return true;
  }, [navigation]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackReset);
    return () => subscription.remove();
  }, [handleBackReset]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />

      <View style={styles.headerWrap}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={[styles.headerTopRow, isTablet && { alignItems: 'center' }]}>
            <Pressable
              onPress={handleBackReset}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}
            >
              <Ionicons name="chevron-back" size={ms(16)} color={AppColors.onPrimary} />
            </Pressable>
          </View>
          <View style={[styles.titleRow, contentWidthStyle]}>
            <Text style={styles.screenTitle}>Report Details</Text>
          </View>
          <View style={[styles_re.metaWrap, contentWidthStyle]}>
            <View style={styles_re.metaRow}>
              <Ionicons name="layers-outline" size={ms(14)} color={AppColors.onPrimary} style={styles_re.metaIcon} />
              <Text style={styles_re.metaText}>{val('line_name')}</Text>
              <Text style={styles_re.metaDot}>•</Text>
              <Text style={styles_re.metaText}>{val('order_no')}</Text>
              <Text style={styles_re.metaDot}>•</Text>
              <Text style={styles_re.metaText}>{val('colour', 'color_id')}</Text>
            </View>
            <View style={styles_re.metaRow}>
              <Ionicons name="cube-outline" size={ms(14)} color={AppColors.onPrimary} style={styles_re.metaIcon} />
              <Text style={styles_re.metaText}>{val('buyer_name')}</Text>
              <Text style={styles_re.metaDot}>•</Text>
              <Text style={styles_re.metaText}>{val('style_name')}</Text>

              {val('operation_name') && val('operation_name') !== '-' && (
                <>
                  <Text style={styles_re.metaDot}>•</Text>
                  <Text style={styles_re.metaText}>{val('operation_name')}</Text>
                </>
              )}
            </View>
            <View style={styles_re.metaRow}>
              <Ionicons name="business-outline" size={ms(14)} color={AppColors.onPrimary} style={styles_re.metaIcon} />
              <Text style={styles_re.metaText}>{val('branch_name')}</Text>
              <Text style={styles_re.metaDot}>•</Text>
              <Text style={styles_re.metaText}>{val('team_name')}</Text>
            </View>
            <View style={styles_re.metaRow}>
              <Ionicons name="hardware-chip-outline" size={ms(14)} color={AppColors.onPrimary} style={styles_re.metaIcon} />
              {val('auditor_name') && val('auditor_name') !== '-' && (
                <Text style={styles_re.metaText}>{val('auditor_name')}</Text>
              )}
              {val('machine_no') && val('machine_no') !== '-' && (
                <>
                  <Text style={styles_re.metaDot}>•</Text>
                  <Text style={styles_re.metaText}>{val('machine_no')}</Text>
                </>
              )}
              {val('operator_name') && val('operator_name') !== '-' && (
                <>
                  <Text style={styles_re.metaDot}>•</Text>
                  <Text style={styles_re.metaText}>{val('operator_name')}</Text>
                </>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.body}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, isTablet && { alignItems: 'center' }]}
        >
          <View style={[{ width: '100%' }, contentWidthStyle]}>
            {nestedCards.map((card) => (
              <SectionCard
                key={card.title}
                icon={card.icon}
                title={card.title}
                rows={card.rows}
                arraySections={card.arraySections}
                styles={styles}
                extraStyles={extraStyles}
                ms={ms}
                onOpenArray={setActiveArray}
              />
            ))}

            {showFallbackCard && (
              <SectionCard
                icon={meta.icon}
                title={meta.title}
                rows={additional.rows}
                arraySections={additional.arraySections}
                styles={styles}
                extraStyles={extraStyles}
                ms={ms}
                onOpenArray={setActiveArray}
              />
            )}

            {noSpecificDetails && (
              <SectionCard
                icon={meta.icon}
                title={meta.title}
                rows={[]}
                arraySections={[]}
                styles={styles}
                extraStyles={extraStyles}
                ms={ms}
                onOpenArray={setActiveArray}
                emptyText="No additional details available for this record."
              />
            )}
          </View>
        </ScrollView>
      </View>

      {canRetrieve && (
        <View style={extraStyles.bottomBar}>
          <View style={extraStyles.bottomBarInner}>
            <Pressable
              onPress={handleRetrieve}
              disabled={retrieving}
              style={({ pressed }) => [
                extraStyles.retrieveButton,
                retrieving && extraStyles.retrieveButtonDisabled,
                pressed && !retrieving && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
            >
              {retrieving ? (
                <ActivityIndicator color={AppColors.onPrimary} />
              ) : (
                <Ionicons name="download-outline" size={ms(18)} color={AppColors.onPrimary} />
              )}
              <Text style={extraStyles.retrieveButtonText}>{retrieving ? 'Retrieving…' : 'Retrieve'}</Text>
            </Pressable>
          </View>
        </View>
      )}

      <ArrayDetailModal
        visible={!!activeArray}
        onClose={() => setActiveArray(null)}
        title={activeArray?.label}
        items={activeArray?.items ?? []}
        ms={ms}
        sectionKey={activeArray?.key}
        extraStyles={extraStyles}
      />
    </View>
  );
}
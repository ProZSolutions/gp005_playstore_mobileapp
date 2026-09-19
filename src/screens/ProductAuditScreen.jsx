import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  SafeAreaView,
  ActivityIndicator, Switch,
  Modal,
} from 'react-native';
import { ms, mvs, fs } from '../utils/scale';
import { AppInput } from '../components/CommandBox';
import { AppColors } from '../theme/theme';
import { scale, verticalScale, fontScale, moderateScale } from '../utils/scale';
import GlobalStyles from './styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  QUALITY_CHECKS,
  getAuditGrade,
  GRADE_COLORS,
  GRADE_BG,
} from '../utils/auditData';
import {
  AuditHeader,
  FooterBar,
  OperatorOrderCard,
  SeverityBadge,
  SectionLabel,
} from '../components/SharedComponents';
import OrderDetailsSheet from '../components/OrderDetailsSheet';
import DefectEntrySheet from '../components/DefectEntrySheet';
import PossibleDefectsSheet from '../components/PossibleDefectsSheet';
import Icon from '../components/Icon';
import Vector from 'react-native-vector-icons/Ionicons';
import createStyles from '../screens/styles/IssueDetailStyles';
import useAuditLayout from '../hooks/useAuditLayout';

import {
  getOperationDefects,
  getCategoryDropdown,
  getSeverityDropdown,
  createAudit,
} from '../api/services/tlsService';
import { getSelectedShiftId, getShiftData, getSelectedLineId, getUser } from '../api/storage/authStorage';
import { showAlert } from '../utils/AlertService';
import { verifyAndGetSlot } from '../utils/slotVerification';
const SCANNER_ROUTE_NAME = 'TLSAuditScreen';

const SEVERITY_PALETTE = [
  { color: AppColors.Blue, bg: AppColors.BlueLight },
  { color: AppColors.warning, bg: AppColors.warningLight },
  { color: AppColors.error, bg: AppColors.errorContainer },
  { color: '#8E24AA', bg: '#8E24AA1A' },
  { color: '#00897B', bg: '#00897B1A' },
];

const severityLabel = (s) => s?.value ?? s?.name ?? s?.label ?? String(s?.id ?? '');

function AuditRow({ icon, label, required, onInfo, onPress, children }) {
  const Inner = (
    <View style={GlobalStyles.container.auditRow}>
      <View style={GlobalStyles.container.auditRowLeft}>
        <Icon name={icon} style={GlobalStyles.icon.auditRowIcon} size={18} />
        <View style={{ flex: 1 }}>
          <View style={GlobalStyles.container.auditRowLabelWrap}>
            <Text style={GlobalStyles.text.auditRowLabel}>{label}</Text>
            {required && <View style={GlobalStyles.text.requiredDot} />}
          </View>
          {children}
        </View>
      </View>
      {onInfo && (
        <TouchableOpacity onPress={onInfo} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
          <View style={GlobalStyles.text.infoBadge}>
            <Icon name="info" />
          </View>
        </TouchableOpacity>
      )}
      {onPress && !onInfo && <Text style={GlobalStyles.text.chevron}>›</Text>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
        {Inner}
      </TouchableOpacity>
    );
  }
  return Inner;
}

function Chip({ label, variant = 'defect', bg, color }) {
  const chipStyle =
    variant === 'assignee' ? GlobalStyles.text.chipAssignee :
    variant === 'cap'      ? GlobalStyles.text.chipCap      :
    variant === 'piece'    ? GlobalStyles.text.chipPiece    :
    variant === 'more'     ? GlobalStyles.text.chipMore     :
                             GlobalStyles.text.chipDefect;
  const textStyle =
    variant === 'assignee' ? GlobalStyles.text.chipTextAssignee :
    variant === 'cap'      ? GlobalStyles.text.chipTextCap      :
    variant === 'piece'    ? GlobalStyles.text.chipTextPiece    :
    variant === 'more'     ? GlobalStyles.text.chipTextMore     :
                             GlobalStyles.text.chipTextDefect;
  return (
    <View style={[GlobalStyles.container.chip, chipStyle, bg && { backgroundColor: bg }]}>
      <Text style={[GlobalStyles.text.chipText, textStyle, color && { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function ChipRow({ items, variant, emptyText, itemStyleResolver, maxVisible = 2, wrap = false }) {
  if (!items || items.length === 0) {
    return emptyText
      ? <Text style={GlobalStyles.text.placeholderText}>{emptyText}</Text>
      : null;
  }

  const visible = items.slice(0, maxVisible);
  const extra = items.length - visible.length;
  return (
    <View style={[GlobalStyles.container.chipRow, wrap ? styles_chipRowWrap : styles_chipRowNoWrap]}>
      {visible.map((item, i) => {
        const label = typeof item === 'string' ? item : item.label;
        const override = itemStyleResolver ? itemStyleResolver(item) : null;
        return (
          <Chip
            key={i}
            label={label}
            variant={variant}
            bg={override?.bg}
            color={override?.color}
          />
        );
      })}
      {extra > 0 && <Chip label={`+${extra} more`} variant="more" />}
    </View>
  );
}

const styles_chipRowNoWrap = { flexWrap: 'nowrap', overflow: 'hidden' };
const styles_chipRowWrap = { flexWrap: 'wrap', rowGap: 6 };

const AUTO_CLOSE_MS = 3000;

function AuditSuccessOverlay({ visible, message }) {
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={successStyles.backdrop} pointerEvents="box-none">
        <SafeAreaView style={successStyles.sheetSafeArea} pointerEvents="box-none">
          <View style={successStyles.sheet}>
            <View style={successStyles.iconWrap}>
              <Vector name="checkmark-circle" size={scale(44)} color={AppColors.success ?? '#22C55E'} />
            </View>
            <Text style={successStyles.title}>Audit Submitted</Text>
            <Text style={successStyles.subtitle}>{message}</Text>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function InfoListSheet({ visible, onClose, title, items, emptyText, variant }) {
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={infoSheetStyles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <SafeAreaView style={infoSheetStyles.sheetSafeArea}>
          <View style={infoSheetStyles.sheet}>
            <View style={infoSheetStyles.headerRow}>
              <Text style={infoSheetStyles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Vector name="close" size={scale(22)} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {(!items || items.length === 0) ? (
              <Text style={infoSheetStyles.emptyText}>{emptyText ?? 'Nothing to show yet.'}</Text>
            ) : (
              <ScrollView style={{ maxHeight: verticalScale(320) }} showsVerticalScrollIndicator={false}>
                <View style={infoSheetStyles.chipsWrap}>
                  {items.map((label, i) => (
                    <Chip key={i} label={label} variant={variant} />
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export default function ProductAuditScreen({ route, navigation }) {
  const incomingParams = route?.params ?? {};
  const styles = createStyles(ms, mvs, fs);

  // Layout only: same pickStyle(largePortrait, largeLandscape, mobilePortrait, mobileLandscape)
  // you already use on the other screens, shared through one hook.
  const { isLargeScreen, isLandscape, pickStyle, pinOperatorCard } = useAuditLayout();

  const contaa = pickStyle(GlobalStyles.container.scrollContentLarge, GlobalStyles.container.scrollContentLand, GlobalStyles.container.scrollContent
    , GlobalStyles.container.scrollContent);
  const fixed = pickStyle(GlobalStyles.container.fixedCardWrapLarge, GlobalStyles.container.fixedCardWrapLand, GlobalStyles.container.fixedCardWrap
    , GlobalStyles.container.fixedCardWrap);
  const foooo = pickStyle(GlobalStyles.container.footerpor, GlobalStyles.container.footerLand, GlobalStyles.container.footer
    , GlobalStyles.container.footer);

  const zone = route?.params?.zone ?? { id: 'zone_a', name: 'Zone A' };
  const line = route?.params?.line ?? { id: 'la1', name: 'Line A1' };
  const selectedLine = route?.params?.selectedLine;
  const order = route?.params?.order ?? {
    tlsCode: 'ORD-2026-0392', colour: 'Golden Yellow', colourHex: '#E8B400',
    buyer: 'ABC Corp.', style: 'Polo T-Shirt', styleNo: 'ST-001',
    createdOn: '30 May, 2026',
  };
  const operator = route?.params?.operator ?? {
    name: 'Suresh Kumar', employeeId: 'EMP-50034', lineNo: 'Line A1',
    slot: '09:00 AM – 10:30 AM', operation: 'Side Seam',
    machineType: 'Overlock', zone: 'Zone A',
  };
  const [escalate, setEscalate] = useState(false);
  const routeUser = route?.params?.user ?? null;
  const [user, setUser] = useState(routeUser);

  useEffect(() => {
    const routeUserIsUsable = routeUser?.employee_name || routeUser?.name || routeUser?.branch_id;
    if (routeUserIsUsable) return;

    let cancelled = false;
    (async () => {
      try {
        const storedUser = await getUser();
        if (!cancelled && storedUser) setUser(storedUser);
      } catch (e) {
        console.warn('ProductAuditScreen: falling back to stored user failed:', e.message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const scannedTlsId = route?.params?.scannedTlsId ?? null;
  const spiCount = route?.params?.spiCount ?? 0;
  const qcResults = route?.params?.qcResults ?? {};

  const [comments, setComments] = useState('');
  const [header] = useState('Product Audit - ' + operator.lineNo);

  const [showDetails, setShowDetails] = useState(false);
  const [showPossibleDefects, setShowPossibleDefects] = useState(false);
  const [showDefectEntry, setShowDefectEntry] = useState(false);
  const [showAssignedSheet, setShowAssignedSheet] = useState(false);
  const [showCapSheet, setShowCapSheet] = useState(false);

  const [defectEntries, setDefectEntries] = useState({});
  const [selectedDefectIds, setSelectedDefectIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [operationDefects, setOperationDefects] = useState([]);
  const [loadingOperationDefects, setLoadingOperationDefects] = useState(true);
  const [categories, setCategories] = useState([]);

  // ── Severities (dynamic — replaces the old hardcoded Minor/Major/Critical) ──
  const [severities, setSeverities] = useState([]);
  const [loadingSeverities, setLoadingSeverities] = useState(true);

  const [shiftId, setShiftId] = useState(null);
  const [slotInfo, setSlotInfo] = useState(null);
  const [successVisible, setSuccessVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const storedLineId = await getSelectedLineId();

      if (!storedLineId) {
        console.warn('ProductAuditScreen: no storedLineId available for slot verification');
        return;
      }

      const { slot } = await verifyAndGetSlot({
        lineId: storedLineId,
        navigation,
        listRouteName: 'TLSAuditScreen',
      });
      if (!cancelled) setSlotInfo(slot);
    })();

    return () => { cancelled = true; };
  }, [navigation]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingOperationDefects(true);
      try {
        const list = await getOperationDefects(order?.operation_id);
        if (!cancelled) {
          setOperationDefects(list);
          setSelectedDefectIds((list ?? []).map((d) => d.id));
        }
      } finally {
        if (!cancelled) setLoadingOperationDefects(false);
      }
    })();
    return () => { cancelled = true; };
  }, [order?.operation_id]);

  // Load /mobile/dropdown/categorydropdown once — drives the DefectEntrySheet left rail.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await getCategoryDropdown();
      if (!cancelled) setCategories(list);
    })();
    return () => { cancelled = true; };
  }, []);

  // Load severity dropdown once — drives the summary badges, 7-piece chip
  // colors, and is passed down to DefectEntrySheet so both stay in sync.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingSeverities(true);
      try {
        const list = await getSeverityDropdown();
        if (!cancelled) setSeverities(list);
      } finally {
        if (!cancelled) setLoadingSeverities(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [selected, shiftData] = await Promise.all([getSelectedShiftId(), getShiftData()]);
      if (!cancelled) setShiftId(selected ?? shiftData?.shift_id ?? null);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!successVisible) return;
    const timer = setTimeout(() => {
      setSuccessVisible(false);

      if (pendingAction === 'exit') {
        navigation?.navigate('TLSAuditScreen', { refresh: true });
        return;
      }

      if (pendingAction === 'continue') {
        try {
          navigation?.reset({
            index: 0,
            routes: [{ name: SCANNER_ROUTE_NAME, params: { ...incomingParams, autoScan: true } }],
          });
        } catch (e) {
          console.warn(
            `navigation.reset failed — "${SCANNER_ROUTE_NAME}" is not a registered screen name. ` +
            `Update SCANNER_ROUTE_NAME at the top of ProductAuditScreen.js.`,
            e,
          );
          showAlert(
            'error',
            'Navigation Error',
            `Screen "${SCANNER_ROUTE_NAME}" was not found. Falling back to list.`,
          );
          navigation?.navigate('TLSAuditScreen');
        }
      }
    }, AUTO_CLOSE_MS);
    return () => clearTimeout(timer);
  }, [successVisible, pendingAction, navigation, incomingParams]);

  const severityStyleFor = useCallback((severityId) => {
    const idx = severities.findIndex((s) => s.id === severityId);
    return SEVERITY_PALETTE[idx >= 0 ? idx % SEVERITY_PALETTE.length : 0];
  }, [severities]);

  const severityStyleForName = useCallback((name) => {
    const idx = severities.findIndex(
      (s) => severityLabel(s).toLowerCase() === (name ?? '').toLowerCase(),
    );
    return idx === -1 ? null : SEVERITY_PALETTE[idx % SEVERITY_PALETTE.length];
  }, [severities]);

  // Totals keyed dynamically by severity_id instead of hardcoded minor/major/critical.
  const globalTotals = useMemo(() => {
    const t = {};
    Object.values(defectEntries).forEach((e) => {
      t[e.severity_id] = (t[e.severity_id] ?? 0) + e.qty;
    });
    return t;
  }, [defectEntries]);

  const countByName = useCallback((name) => {
    const sev = severities.find((s) => severityLabel(s).toLowerCase() === name);
    if (!sev) return 0;
    return globalTotals[sev.id] ?? 0;
  }, [severities, globalTotals]);

  const grade = getAuditGrade(countByName('minor'), countByName('major'), countByName('critical'));
  const gradeColor = GRADE_COLORS[grade];
  const gradeBg = GRADE_BG[grade];

  const filledEntries = useMemo(() => Object.values(defectEntries), [defectEntries]);
  // const canSubmit = filledEntries.length > 0;
  const canSubmit = true;
  const openDefectSheet = useCallback(() => setShowDefectEntry(true), []);

  const handleApplyDefects = useCallback((entries) => {
    console.log("Defect Return Entry " + JSON.stringify(entries));
    setDefectEntries(entries);
  }, []);

  const assignedToLabels = useMemo(() => {
    const names = new Set();
    filledEntries.forEach((e) => { if (e.workcategory_name) names.add(e.workcategory_name); });
    return Array.from(names);
  }, [filledEntries]);

  const capLabels = useMemo(() => {
    const seen = new Map();
    filledEntries.forEach((e) => {
      (e.cap ?? []).forEach((c) => {
        if (!seen.has(c.id)) seen.set(c.id, c.cap_name ?? c.short_name);
      });
    });
    return Array.from(seen.values());
  }, [filledEntries]);

  const defectChipItems = useMemo(
    () => filledEntries.map((e) => ({
      label: `${e.severity_name} · ${e.qty} · ${e.defect_name}`,
      severity: e.severity_name,
    })),
    [filledEntries],
  );

  const possibleDefectLabels = useMemo(
    () =>
      selectedDefectIds
        .map((id) => operationDefects.find((d) => d.id === id)?.defect_name)
        .filter(Boolean),
    [selectedDefectIds, operationDefects],
  );

  const buildPayload = useCallback(() => {
    const defect_entry = filledEntries.map((e) => ({
      category_id: String(e.category_id),
      defect_id: String(e.defect_id),
      severity_id: String(e.severity_id),
      workcategory_id: String(e.workcategory_id),
      qty: e.qty,
      cap: e.cap ?? [],
    }));

    const quality_check = QUALITY_CHECKS.map((c) => ({
      check_name: c.name ?? c.label ?? c.id,
      status: qcResults[c.id] === 'pass' ? 'Pass' : qcResults[c.id] === 'fail' ? 'Fail' : null,
    }));
    return {
      order_id: String(order?.order_id ?? ''),
      operation_id: String(order?.operation_id ?? ''),
      style_id: String(order?.style_id ?? ''),
      color: order?.color ?? order?.colour,
      line_id: String(order?.line_id ?? order?.lineId ?? ''),
      tls_id: scannedTlsId ?? order?.tls_id,
      machine_id: order?.machine_id,
      branch_id: String(user?.branch_id ?? ''),
      team_id: String(user?.team_id ?? ''),
      shift_id: String(shiftId ?? ''),
      spi_count: String(spiCount),
      quality_check,
      total_minor: String(countByName('minor')),
      total_major: String(countByName('major')),
      total_critical: String(countByName('critical')),
      defect_entry,
      comments,
      is_escalate: escalate ? 'TRUE' : 'FALSE',
    };
  }, [
    filledEntries, qcResults, order, scannedTlsId, user,
    shiftId, spiCount, countByName, comments, escalate
  ]);

  const submitAudit = useCallback(async (action) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = buildPayload();

      const result = await createAudit(payload);
      if (result?.success) {
        setPendingAction(action);
        setSuccessVisible(true);
      } else {

      }
    } finally {
      setSubmitting(false);
    }
  }, [submitting, buildPayload]);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    submitAudit('continue');
  }, [canSubmit, submitAudit]);

  const handleSubmitExit = useCallback(() => {
    if (!canSubmit) return;
    submitAudit('exit');
  }, [canSubmit, submitAudit]);

  // Prefer the freshly-verified slot name over whatever came through route params.
  const operatorWithSlot = useMemo(
    () => ({
      ...operator,
      slot: slotInfo?.slot_name ?? operator.slot,
    }),
    [operator, slotInfo],
  );

  // Extracted so the operator card can be pinned above the scroll area, or scroll
  // with the content on a phone in landscape. Content itself is unchanged.
  const operatorCard = (
    <OperatorOrderCard
      styless={styles}
      order={order}
      operator={operatorWithSlot}
      onViewAll={() => setShowDetails(true)}
      isLandscape={isLandscape}
      isLargeScreen={isLargeScreen}
    />
  );

  return (
    // Same structure as ProcessAuditScreen: plain root View, AuditHeader (paints its own
    // teal + status-bar inset), body View, footer. The old root + nested SafeAreaView with
    // scroll_bg is gone, so the header no longer depends on what colour the root is.
    <View style={GlobalStyles.container.safe}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.primary} />

      <AuditHeader
        title={header}
        step={2}
        totalSteps={2}
        onBack={() => navigation?.goBack()}
        onCancel={() => navigation?.navigate('Dashboard')}
        isLandscape={isLandscape}
        isLargeScreen={isLargeScreen}
      />

      <View style={GlobalStyles.container.safe}>
        {pinOperatorCard && (
          <View style={[GlobalStyles.container.fixedCardWrap, fixed]}>
            {operatorCard}
          </View>
        )}

        <ScrollView
          style={GlobalStyles.container.scroll}
          contentContainerStyle={[GlobalStyles.container.scrollContent, contaa]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!pinOperatorCard && operatorCard}

          <View style={GlobalStyles.container.card_pro}>
            <View style={GlobalStyles.container.summaryHeader}>
              <SectionLabel label="AUDIT SUMMARY" />
              <View style={[GlobalStyles.container.gradePill, { backgroundColor: gradeBg }]}>
                <Text style={[GlobalStyles.text.gradeText, { color: gradeColor }]}>{grade}</Text>
              </View>
            </View>

            <View style={GlobalStyles.container.severityRow}>
              {loadingSeverities ? (
                <ActivityIndicator color={AppColors.primary} />
              ) : (
                severities.map((sev) => {
                  const style = severityStyleFor(sev.id);
                  return (
                    <SeverityBadge
                      key={sev.id}
                      label={severityLabel(sev)}
                      count={globalTotals[sev.id] ?? 0}
                      color={style.color}
                      bg={style.bg}
                    />
                  );
                })
              )}
            </View>

            <View style={GlobalStyles.container.cardDivider} />

            <AuditRow icon="search" label="POSSIBLE DEFECTS" onInfo={() => setShowPossibleDefects(true)}>
              <View style={{ flexDirection: 'row' }}>
                <ChipRow
                  items={possibleDefectLabels}
                  variant="defect"
                  emptyText={loadingOperationDefects ? 'Loading…' : 'No known defect types for this operation'}
                />
              </View>
            </AuditRow>

            <View style={GlobalStyles.container.cardDivider} />

            <AuditRow icon="shirt_gray" label="7-PIECE AUDIT" required onPress={openDefectSheet}>
              {filledEntries.length === 0 ? (
                <Text style={GlobalStyles.text.placeholderText}>Start to record the piece audit…</Text>
              ) : (
                <ChipRow
                  items={defectChipItems}
                  variant="piece"
                  maxVisible={filledEntries.length}
                  wrap
                  itemStyleResolver={(item) => severityStyleForName(item?.severity)}
                />
              )}
            </AuditRow>

            <View style={GlobalStyles.container.cardDivider} />

            <AuditRow icon="user_round_search" label="ASSIGNED TO" onInfo={() => setShowAssignedSheet(true)}>
              <ChipRow items={assignedToLabels} variant="assignee" emptyText="Enter defects to auto-fill" />
            </AuditRow>

            <View style={GlobalStyles.container.cardDivider} />

            <AuditRow icon="layout_list" label="PRE-DEFINED CAP" onInfo={() => setShowCapSheet(true)}>
              <ChipRow items={capLabels} variant="cap" emptyText="Enter defects to auto-fill" />
            </AuditRow>

            <View style={GlobalStyles.container.cardDivider} />
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

          <View style={[GlobalStyles.container.card_pro, { padding: 3 }]}>
            <AppInput
              label="COMMENTS"
              value={comments}
              onChangeText={setComments}
              placeholder="Add any observations or notes…"
              multiline
              numberOfLines={4}
              maxLength={200}
              showCharCount
              containerStyle={{ marginBottom: 0 }}
              style=""
            />
          </View>
          <View style={{ height: verticalScale(8) }} />
        </ScrollView>
      </View>

      <FooterBar footerStyle={[GlobalStyles.container.footer, foooo]}>
        <TouchableOpacity
          style={GlobalStyles.button.submitExitBtn}
          onPress={handleSubmitExit}
          activeOpacity={canSubmit ? 0.85 : 1}
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={AppColors.textSecondary} />
          ) : (
            <Text style={GlobalStyles.text.submitExitText}>Submit & Exit</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[GlobalStyles.button.submitBtn, canSubmit && GlobalStyles.button.submitBtnActive]}
          onPress={handleSubmit}
          activeOpacity={canSubmit ? 0.85 : 1}
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={AppColors.onPrimary} />
          ) : (
            <Text style={[GlobalStyles.text.submitBtnText, canSubmit && GlobalStyles.text.submitBtnTextActive]}>
              Submit
            </Text>
          )}
        </TouchableOpacity>
      </FooterBar>

      <OrderDetailsSheet
        visible={showDetails}
        onClose={() => setShowDetails(false)}
        order={order}
        operator={operatorWithSlot}
        navigation={navigation}
        listRouteName="TLSAuditScreen"
        lineId={selectedLine}
        isLandscape={isLandscape}
        isLargeScreen={isLargeScreen}
      />

      <PossibleDefectsSheet
        visible={showPossibleDefects}
        onClose={() => setShowPossibleDefects(false)}
        defects={operationDefects}
        loading={loadingOperationDefects}
        selected={selectedDefectIds}
        readOnly
      />

      <DefectEntrySheet
        visible={showDefectEntry}
        onClose={() => setShowDefectEntry(false)}
        categories={categories}
        initialEntries={defectEntries}
        onApply={handleApplyDefects}
        severities={severities}
        loadingSeverities={loadingSeverities}
      />

      <InfoListSheet
        visible={showAssignedSheet}
        onClose={() => setShowAssignedSheet(false)}
        title="Assigned To"
        items={assignedToLabels}
        emptyText="Enter defects to auto-fill assignees."
        variant="assignee"
      />

      <InfoListSheet
        visible={showCapSheet}
        onClose={() => setShowCapSheet(false)}
        title="Pre-defined CAP"
        items={capLabels}
        emptyText="Enter defects to auto-fill CAP entries."
        variant="cap"
      />

      <AuditSuccessOverlay
        visible={successVisible}
        message={
          pendingAction === 'exit'
            ? 'Returning to list…'
            : 'Opening scanner for the next piece…'
        }
      />
    </View>
  );
}

const successStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheetSafeArea: {
    backgroundColor: 'transparent',
  },
  sheet: {
    width: '100%',
    backgroundColor: AppColors.surface ?? '#FFFFFF',
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingTop: verticalScale(28),
    paddingBottom: verticalScale(22),
    paddingHorizontal: scale(24),
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 16 },
      android: { elevation: 12 },
    }),
  },
  iconWrap: {
    marginBottom: verticalScale(12),
  },
  title: {
    fontSize: fontScale(18),
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: verticalScale(6),
  },
  subtitle: {
    fontSize: fontScale(14),
    color: AppColors.textTertiary,
    textAlign: 'center',
  },
});

const infoSheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheetSafeArea: {
    backgroundColor: 'transparent',
  },
  sheet: {
    width: '100%',
    backgroundColor: AppColors.surface ?? '#FFFFFF',
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(28),
    paddingHorizontal: scale(20),
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 16 },
      android: { elevation: 12 },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(14),
  },
  title: {
    fontSize: fontScale(16),
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  emptyText: {
    fontSize: fontScale(13),
    color: AppColors.textTertiary,
    paddingVertical: verticalScale(16),
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
});
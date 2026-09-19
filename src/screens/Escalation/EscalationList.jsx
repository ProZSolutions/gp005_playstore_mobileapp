import React, { useCallback, useEffect, useMemo, useState, useRef, } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StatusBar, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useBackToDashboard } from '../../hooks/useBackToDashboard';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import { STATUS_STYLES, lineAbbrev } from '../../utils/tlsIssueData';
import { getEscalationList } from '../../api/services/aqlAuditService';
import { getUser, PAGE_SIZE } from '../../api/storage/authStorage';
import { usePermissions, GROUP, ACTION } from '../../context/PermissionsContext';
import createStyles from '../styles/TLSIssueTrackerStyles';
 import { useOrientation } from '../../hooks/useOrientation';
const TEAL = AppColors.primary;
const SEARCH_DEBOUNCE_MS = 400;

const DEFAULT_STATUS_STYLE = { bg: '#EEEEEE', dot: '#9E9E9E', text: '#616161', border: '#E0E0E0' };
const getStatusStyle = (status) => STATUS_STYLES?.[status] ?? DEFAULT_STATUS_STYLE;

const RECORD_TYPE_META = {
  all: { label: 'All', icon: 'apps-outline' },
  product_audit: { label: 'Audit', icon: 'aperture-outline' },
  process_audit: { label: 'Process Audit', icon: 'aperture-outline' },
  audit: { label: 'Audit', icon: 'aperture-outline' },
  rework: { label: 'Rework', icon: 'construct-outline' },
  rework_tracker: { label: 'Rework Tracker', icon: 'time-outline' },
  rejection: { label: 'Rejection', icon: 'close-circle-outline' },
  rejection_tracker: { label: 'Rejection Tracker', icon: 'time-outline' },
  qc_verification: { label: 'QC Verification', icon: 'shield-checkmark-outline' },
   aql_audit: {  label: 'AQL Audit', icon: 'clipboard-outline'},
};
const RECORD_TYPE_ORDER = [
  'all',
  'product_audit',
  'rework',
  'rework_tracker',
  'rejection',
  'rejection_tracker',
  'qc_verification',
  'aql_audit',
];
const getRecordTypeMeta = (type) => RECORD_TYPE_META[type] ?? RECORD_TYPE_META.product_audit;

const AUDIT_RECORD_TYPES = ['product_audit', 'process_audit', 'audit'];
const isAuditRecordType = (type) => AUDIT_RECORD_TYPES.includes(type); 
const toApiDateString = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const toDisplayDateString = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const isSameDay = (a, b) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

 function buildCalendarGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0 = Sunday
  const gridStart = new Date(year, month, 1 - startOffset);

  const weeks = [];
  let cursor = new Date(gridStart);
  for (let w = 0; w < 6; w += 1) {
    const week = [];
    for (let d = 0; d < 7; d += 1) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

let issuesCache = { type: 'all', query: '', fromDate: null, toDate: null, data: [], page: 1, hasMore: false };
const cacheKey = (type, query, fromDate, toDate) =>
  `${type ?? 'all'}|${query ?? ''}|${toApiDateString(fromDate)}|${toApiDateString(toDate)}`;

// Called from DashboardScreen whenever it gains focus, so the date filter
// is guaranteed to be cleared as soon as the user lands back on the
// Dashboard — regardless of whether TLSIssueTrackerScreen itself unmounts,
// stays alive in the background (tabs/drawers), or has stale closures.
// TLSIssueTrackerScreen re-reads this cache every time IT gains focus (see
// its useFocusEffect below), so this is the single source of truth both
// sides sync against.
export function clearEscalationDateFilter() {
  issuesCache = {
    ...issuesCache,
    fromDate: null,
    toDate: null,
    data: [],
    page: 1,
    hasMore: false,
  };
}

function safeParseArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function StatusPill({ status, status_name, styles }) {
  const s = getStatusStyle(status);
  return (
    <View style={[styles.statusPill, { backgroundColor: s.bg, borderColor: s.border }]}>
      <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
      <Text style={[styles.statusText, { color: s.text }]}>{status_name}</Text>
    </View>
  );
}

function IssueCard({ issue, onPress, styles, ms }) {
  const meta = getRecordTypeMeta(issue?.raw?.record_type);
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(10,158,150,0.06)' }}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.96 }]}
      accessibilityRole="button"
    >
      <View style={styles.cardTopRow}>
        <Text style={styles.orderId} numberOfLines={1}>
          {issue.displayId} {lineAbbrev(issue.lineLabel)}
        </Text>
      </View>

      <View style={styles.defectChip}>
        <Ionicons name={meta.icon} size={ms(15)} color={AppColors.error} />
        <Text style={styles.defectChipText} numberOfLines={1}>{meta.label}</Text>
      </View>

      <View style={styles.cardGridRow}>
       <View style={styles.cardGridCell}>
            <Text style={styles.fieldLabel}>
              {issue?.raw?.operation_name ? 'OPERATION' : 'ORDER NO'}
            </Text>

            <Text style={styles.fieldValue} numberOfLines={1}>
              {issue?.raw?.operation_name || issue?.raw?.order_no || '-'}
            </Text>
          </View>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>STYLE</Text>
          <Text style={styles.fieldValue} numberOfLines={1}>{issue?.raw?.style_name ?? "-"}</Text>
        </View>
      </View>

      <View style={styles.cardGridRow}>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>COLOUR</Text>
          <View style={styles.fieldValueRow}>
            <View style={[styles.colourDot, { backgroundColor: issue.colourHex }]} />
            <Text style={styles.fieldValue} numberOfLines={1}>{issue?.raw?.colour ?? "-"}</Text>
          </View>
        </View>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>BUYER</Text>
          <Text style={styles.fieldValue} numberOfLines={1}>{issue?.raw?.buyer_name ?? "-"}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function SeverityBadge({ label, count, color, styles }) {
  return (
    <View style={[styles.severityBadge, { borderColor: color }]}>
      <Text style={[styles.severityBadgeCount, { color }]}>{count}</Text>
      <Text style={styles.severityBadgeLabel}>{label}</Text>
    </View>
  );
}

function ProductAuditCard({ issue, onPress, styles, ms }) {
  const raw = issue?.raw ?? {};
  const meta = getRecordTypeMeta(raw.record_type);
  const checks = safeParseArray(raw.quality_check);
  const defects = Array.isArray(raw.defect_details) ? raw.defect_details : [];

  const minor = Number(raw.total_minor ?? 0);
  const major = Number(raw.total_major ?? 0);
  const critical = Number(raw.total_critical ?? 0);
 
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(10,158,150,0.06)' }}
      style={({ pressed }) => [styles.card, styles.auditCard, pressed && { opacity: 0.96 }]}
      accessibilityRole="button"
    >
      <View style={styles.cardTopRow}>
        <Text style={styles.orderId} numberOfLines={1}>
          {issue.displayId ?? raw.order_no} {lineAbbrev(issue.lineLabel ?? raw.line_name)}
        </Text>
      </View>

      <View style={styles.defectChip}>
        <Ionicons name={meta.icon} size={ms(15)} color={AppColors.error} />
        <Text style={styles.defectChipText} numberOfLines={1}>{meta.label}</Text>
      </View>

      <View style={styles.cardGridRow}>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>AUDITOR</Text>
          <Text style={styles.fieldValue} numberOfLines={1}>{raw.auditor_name ?? '-'}</Text>
        </View>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>MACHINE</Text>
          <Text style={styles.fieldValue} numberOfLines={1}>{raw.machine_no ?? '-'}</Text>
        </View>
      </View>

      <View style={styles.cardGridRow}>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>COLOUR</Text>
          <View style={styles.fieldValueRow}>
            <View style={[styles.colourDot, { backgroundColor: issue.colourHex }]} />
            <Text style={styles.fieldValue} numberOfLines={1}>{raw.colour ?? '-'}</Text>
          </View>
        </View>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>BUYER</Text>
          <Text style={styles.fieldValue} numberOfLines={1}>{raw.buyer_name ?? '-'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function MiniCalendar({ value, onSelect, minDate, maxDate, styles, ms }) {
  const initialMonth = value ?? new Date();
  const [viewYear, setViewYear] = useState(initialMonth.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialMonth.getMonth());

  const weeks = useMemo(() => buildCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const min = minDate ? startOfDay(minDate) : null;
  const max = maxDate ? startOfDay(maxDate) : null;

  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  return (
    <View style={styles.calendarWrap}>
      <View style={styles.calendarHeaderRow}>
        <Pressable onPress={goPrevMonth} hitSlop={8} style={styles.calendarNavBtn}>
          <Ionicons name="chevron-back" size={ms(16)} color={AppColors.textPrimary ?? '#212121'} />
        </Pressable>
        <Text style={styles.calendarHeaderText}>{MONTH_NAMES[viewMonth]} {viewYear}</Text>
        <Pressable onPress={goNextMonth} hitSlop={8} style={styles.calendarNavBtn}>
          <Ionicons name="chevron-forward" size={ms(16)} color={AppColors.textPrimary ?? '#212121'} />
        </Pressable>
      </View>

      <View style={styles.calendarWeekRow}>
        {WEEKDAY_LABELS.map((label, idx) => (
          <Text key={`wd-${idx}`} style={styles.calendarWeekdayText}>{label}</Text>
        ))}
      </View>

      {weeks.map((week, wIdx) => (
        <View key={`week-${wIdx}`} style={styles.calendarWeekRow}>
          {week.map((day, dIdx) => {
            const inMonth = day.getMonth() === viewMonth;
            const dayStart = startOfDay(day);
            const disabled = (min && dayStart < min) || (max && dayStart > max);
            const selected = isSameDay(day, value);
            return (
              <Pressable
                key={`day-${wIdx}-${dIdx}`}
                disabled={disabled}
                onPress={() => onSelect(day)}
                style={[
                  styles.calendarDayCell,
                  selected && styles.calendarDayCellSelected,
                ]}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    !inMonth && styles.calendarDayTextMuted,
                    disabled && styles.calendarDayTextDisabled,
                    selected && styles.calendarDayTextSelected,
                  ]}
                >
                  {day.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ---- date range filter modal -------------------------------------------
function DateFilterModal({
  visible,
  onClose,
  tempFromDate,
  tempToDate,
  setTempFromDate,
  setTempToDate,
  onApply,
  onClear,
  styles,
  ms,
}) {
  const [pickerTarget, setPickerTarget] = useState(null); // 'from' | 'to' | null

  const handleCalendarSelect = (selectedDate) => {
    if (pickerTarget === 'from') setTempFromDate(selectedDate);
    if (pickerTarget === 'to') setTempToDate(selectedDate);
    setPickerTarget(null);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.filterModalBackdrop} onPress={onClose}>
        <Pressable style={styles.filterModalCard} onPress={() => {}}>
          <Text style={styles.filterModalTitle}>Filter by Date</Text>

          <Text style={styles.filterFieldLabel}>From</Text>
          <Pressable style={styles.filterDateInput} onPress={() => setPickerTarget('from')}>
            <Ionicons name="calendar-outline" size={ms(16)} color={AppColors.textTertiary} />
            <Text style={styles.filterDateInputText}>
              {tempFromDate ? toDisplayDateString(tempFromDate) : 'Select date'}
            </Text>
          </Pressable>

          <Text style={styles.filterFieldLabel}>To</Text>
          <Pressable style={styles.filterDateInput} onPress={() => setPickerTarget('to')}>
            <Ionicons name="calendar-outline" size={ms(16)} color={AppColors.textTertiary} />
            <Text style={styles.filterDateInputText}>
              {tempToDate ? toDisplayDateString(tempToDate) : 'Select date'}
            </Text>
          </Pressable>

          {pickerTarget && (
            <MiniCalendar
              value={pickerTarget === 'from' ? tempFromDate : tempToDate}
              onSelect={handleCalendarSelect}
              maxDate={pickerTarget === 'from' ? (tempToDate ?? new Date()) : new Date()}
              minDate={pickerTarget === 'to' ? tempFromDate : undefined}
              styles={styles}
              ms={ms}
            />
          )}

          <View style={styles.filterModalActions}>
            <Pressable style={styles.filterClearBtn} onPress={onClear}>
              <Text style={styles.filterClearBtnText}>Clear</Text>
            </Pressable>
            <Pressable style={styles.filterApplyBtn} onPress={onApply}>
              <Text style={styles.filterApplyBtnText}>Apply</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function TLSIssueTrackerScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs, isLargeScreen } = useResponsive();
   const { isLandscape } = useOrientation();
  
  const styles = createStyles(ms, mvs, fs, isLargeScreen);
 const pickStyle = (largePortrait, largeLandscape, mobilePortrait, mobileLandscape) =>
    isLargeScreen
      ? (isLandscape ? largeLandscape : largePortrait)
      : (isLandscape ? mobileLandscape : mobilePortrait);

 const tlsTitleStyle = pickStyle(styles.titlelarge,
    styles.titlelandscape,
    styles.title,
    styles.title, 
  ); 
const tlsSearchStyle = pickStyle(styles.searchOuterlarge,
    styles.searchOuterlarge,
    styles.searchOuter,
    styles.searchOuter,
  );
const tlsSearchBarStyle = pickStyle(styles.searchBarLarge,
    styles.searchBarLarge,
     styles.searchBar,
    styles.searchBar,
  );
  const tlsSearchBarInput = pickStyle(styles.searchInputLarge,
    styles.searchInputLarge,
    styles.searchInput,
    styles.searchInput,
  );
 const tlsSearchChio= pickStyle(styles.lineChipTextLarge,
    styles.lineChipTextLarge,
     styles.lineChipText,
    styles.lineChipText,
  );
  const { canView, can, loading: permsLoading } = usePermissions();
  const canViewGroup = canView(GROUP.ESCALATION);
  const canListIssues = canViewGroup && can(GROUP.ESCALATION, ACTION.LISTES);

  const [user, setUser] = useState(null);

  const [activeType, setActiveType] = useState('all');
  const [query, setQuery] = useState(() => issuesCache.query ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(() => issuesCache.query ?? '');

  // Applied filter dates (used for API calls). Empty (null) until the user applies a filter.
  const [fromDate, setFromDate] = useState(() => issuesCache.fromDate ?? null);
  const [toDate, setToDate] = useState(() => issuesCache.toDate ?? null);
  // Working copies edited inside the modal, committed on "Apply".
  const [tempFromDate, setTempFromDate] = useState(fromDate);
  const [tempToDate, setTempToDate] = useState(toDate);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const hasActiveDateFilter = !!(fromDate || toDate);

  const [issues, setIssues] = useState(() => issuesCache.data ?? []);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(() => issuesCache.page ?? 1);
  const [hasMore, setHasMore] = useState(() => issuesCache.hasMore ?? false);

  const requestId = useRef(0);
  const lastFetchedKeyRef = useRef(
    issuesCache.data?.length ? cacheKey(issuesCache.type, issuesCache.query, issuesCache.fromDate, issuesCache.toDate) : null
  );

  // Always holds the CURRENT fromDate/toDate/debouncedQuery, updated every
  // render. The useFocusEffect callback below is memoized with a narrow
  // dependency array (by design, so it doesn't re-fire on every keystroke),
  // which means its own closure over fromDate/toDate/debouncedQuery goes
  // stale after the first time it's created. Reading from this ref instead
  // of the closed-over variables guarantees refocus always uses the latest
  // values, even if this screen is kept mounted in the background (tabs,
  // drawers) rather than unmounted (stacks).
  const filtersRef = useRef({ fromDate, toDate, debouncedQuery, activeType });
  useEffect(() => {
    filtersRef.current = { fromDate, toDate, debouncedQuery, activeType };
  }, [fromDate, toDate, debouncedQuery, activeType]);

  // Declared BEFORE useBackToDashboard so it's initialized in time to be
  // passed in as the onLeave callback (avoids the TDZ ReferenceError).
  const clearDateFilterOnExit = useCallback(() => {
    // Invalidate any in-flight fetch so its late resolution can't
    // repopulate issuesCache with the filtered dates we're about to clear.
    // Without this, a request kicked off just before navigating away can
    // resolve after we reset the cache and overwrite it right back with
    // the stale filtered fromDate/toDate + data.
    requestId.current += 1;

    // Reset the ACTUAL component state, not just the module cache. If this
    // screen is reached via a tab/drawer navigator that keeps screens
    // mounted in the background, the component never unmounts, so relying
    // on issuesCache alone (read only via useState initializers on mount)
    // would never take effect. This makes the fix work regardless of
    // whether the screen unmounts or stays mounted.
    setFromDate(null);
    setToDate(null);
    setTempFromDate(null);
    setTempToDate(null);

    // Wipe the module-level cache so that if the screen DOES unmount and
    // remount later (stack navigators), it starts with no date filter and
    // refetches fresh, unfiltered data.
    issuesCache = {
      type: activeType,
      query: debouncedQuery,
      fromDate: null,
      toDate: null,
      data: [],
      page: 1,
      hasMore: false,
    };
  }, [activeType, debouncedQuery]);

  const goBack = useBackToDashboard(navigation, 'Dashboard', undefined, clearDateFilterOnExit);

  const loadPage = useCallback(async (targetPage, {
    append,
    type = activeType,
    search = debouncedQuery,
    from = fromDate,
    to = toDate,
  } = {}) => {
    if (!canListIssues) return;
    const myRequestId = ++requestId.current;
    if (targetPage === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const result = await getEscalationList({
        page: targetPage,
        pageSize: PAGE_SIZE,
        type: type === 'all' ? '' : type,
        search,
        from_date: toApiDateString(from),
        to_date: toApiDateString(to),
      });
      if (myRequestId !== requestId.current) return;

      setIssues((prev) => {
        const next = append ? [...prev, ...result.data] : result.data;
        issuesCache = { type, query: search, fromDate: from, toDate: to, data: next, page: result.page, hasMore: result.hasMore };
        return next;
      });
      setPage(result.page);
      setHasMore(result.hasMore);
      lastFetchedKeyRef.current = cacheKey(type, search, from, to);
    } finally {
      if (myRequestId === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [activeType, debouncedQuery, fromDate, toDate, canListIssues]);

useFocusEffect(
  useCallback(() => {
    if (permsLoading || !canListIssues) return;

    let cancelled = false;

    (async () => {
      try {
        const savedUser = await getUser();
        if (savedUser) setUser(savedUser);
      } catch (e) {
        console.warn('Could not refresh user data:', e.message);
      }

      if (cancelled) return;

      const typeToLoad = issuesCache.type ?? 'all';
      setActiveType(typeToLoad);

      // Re-sync the date filter from the shared cache on every focus, not
      // just on mount. This is what makes clearing the filter from
      // Dashboard (via clearEscalationDateFilter) actually take effect: if
      // this screen never unmounted (tab/drawer navigators keep screens
      // alive in the background), its local fromDate/toDate state would
      // otherwise keep showing whatever was last applied, since useState
      // initializers only run once. Reading the cache fresh here, every
      // time the screen becomes focused, removes that dependency on
      // mount/unmount timing entirely.
      const cachedFrom = issuesCache.fromDate ?? null;
      const cachedTo = issuesCache.toDate ?? null;
      setFromDate(cachedFrom);
      setToDate(cachedTo);
      setTempFromDate(cachedFrom);
      setTempToDate(cachedTo);

      // Force a real refetch, bypassing the other effect's "already have this key" check
      lastFetchedKeyRef.current = null;

      loadPage(1, {
        append: false,
        type: typeToLoad,
        search: filtersRef.current.debouncedQuery,
        from: cachedFrom,
        to: cachedTo,
      });
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permsLoading, canListIssues])
);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (permsLoading) return;
    if (!canListIssues) {
      setLoading(false);
      return;
    }
    const key = cacheKey(activeType, debouncedQuery, fromDate, toDate);
    if (lastFetchedKeyRef.current === key) return;

    loadPage(1, { append: false });
  }, [debouncedQuery, permsLoading, canListIssues, activeType, fromDate, toDate]);

  const handleTypeSelect = useCallback((type) => {
    if (type === activeType) return;
    setActiveType(type);
    lastFetchedKeyRef.current = cacheKey(type, debouncedQuery, fromDate, toDate);
    loadPage(1, { append: false, type });
  }, [activeType, debouncedQuery, fromDate, toDate, loadPage]);

  const handleEndReached = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    loadPage(page + 1, { append: true });
  }, [loading, loadingMore, hasMore, page, loadPage]);

  const handleScrollEnd = useCallback(({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const paddingToBottom = 48;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    if (isCloseToBottom) handleEndReached();
  }, [handleEndReached]);

  const openFilterModal = useCallback(() => {
    // seed the modal's working copies with whatever is currently applied
    setTempFromDate(fromDate);
    setTempToDate(toDate);
    setShowFilterModal(true);
  }, [fromDate, toDate]);

  const handleApplyFilter = useCallback(() => {
    setShowFilterModal(false);
    setFromDate(tempFromDate);
    setToDate(tempToDate);
  }, [tempFromDate, tempToDate]);

  const handleClearFilter = useCallback(() => {
    setShowFilterModal(false);
    setTempFromDate(null);
    setTempToDate(null);
    setFromDate(null);
    setToDate(null);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />

      <View style={styles.headerWrap}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerTopRow}>
            <Pressable
              onPress={goBack}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={({ pressed }) => [styles.backPill, pressed && { opacity: 0.85 }]}
            >
              <Ionicons name="chevron-back" size={ms(15)} color={AppColors.onPrimary} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          </View>

         <View style={styles.headerRow}>
            <Text style={[styles.title,tlsTitleStyle]}>Escalation</Text>

            <Pressable
              onPress={openFilterModal}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={({ pressed }) => [
                styles.filterIconBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Ionicons
                name="options-outline"
                size={ms(20)}
                color={AppColors.onPrimary}
              />
              {hasActiveDateFilter && <View style={styles.filterActiveDot} />}
            </Pressable>
          </View>
        </SafeAreaView>

        {canListIssues && (
          <>
            <View style={[styles.searchOuter,tlsSearchStyle]}>
              <View style={[styles.searchBar,tlsSearchBarStyle]}>
                <Ionicons name="search-outline" size={ms(16)} color={AppColors.textTertiary} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search"
                  placeholderTextColor={AppColors.textTertiary}
                  style={[styles.searchInput,tlsSearchBarInput]}
                  returnKeyType="search"
                  autoCorrect={false}
                />
              </View>

           
            </View>

            <View style={styles.chipsRowOuter}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {RECORD_TYPE_ORDER.map((type) => {
                  const active = activeType === type;
                  const meta = getRecordTypeMeta(type);
                  return (
                    <Pressable
                      key={type}
                      onPress={() => handleTypeSelect(type)}
                      style={({ pressed }) => [styles.lineChip, active && styles.lineChipActive, pressed && { opacity: 0.85 }]}
                    >
                      {active && (
                        <Ionicons name="checkmark" size={ms(12)} color={AppColors.onPrimary} style={{ marginRight: ms(4) }} />
                      )}
                      <Text  style={[styles.lineChipText,tlsSearchChio, active && styles.lineChipTextActive]} numberOfLines={1}>
                        {meta.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </>
        )}
      </View>

      <View style={styles.body}>
        {permsLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={AppColors.primary} />
          </View>
        ) : !canListIssues ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="lock-closed-outline" size={ms(28)} color={AppColors.textTertiary} />
            <Text style={styles.emptyText}>You don't have permission to view TLS issues.</Text>
          </View>
        ) : loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={AppColors.primary} />
          </View>
        ) : issues.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="file-tray-outline" size={ms(28)} color={AppColors.textTertiary} />
            <Text style={styles.emptyText}>
              {query || hasActiveDateFilter ? 'No issues match your filters.' : 'No issues found for this type.'}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onScroll={handleScrollEnd}
            scrollEventThrottle={200}
          >
            {issues.map((issue) => {
              const CardComponent = isAuditRecordType(issue?.raw?.record_type) ? ProductAuditCard : IssueCard;
              return (
                <CardComponent
                  key={issue.id}
                  issue={issue}
                  styles={styles}
                  ms={ms}
                  onPress={() => navigation.navigate('EscalationDetails', { issue, activeType, user })}
                />
              );
            })}
            {loadingMore && (
              <View style={{ paddingVertical: mvs(16) }}>
                <ActivityIndicator color={AppColors.primary} />
              </View>
            )}
          </ScrollView>
        )}
      </View>

      <DateFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        tempFromDate={tempFromDate}
        tempToDate={tempToDate}
        setTempFromDate={setTempFromDate}
        setTempToDate={setTempToDate}
        onApply={handleApplyFilter}
        onClear={handleClearFilter}
        styles={styles}
        ms={ms}
      />
    </View>
  );
}
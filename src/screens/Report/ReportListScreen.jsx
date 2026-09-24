import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  View, Text, TextInput, ScrollView, FlatList, Pressable, StatusBar, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useBackToDashboard } from '../../hooks/useBackToDashboard';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import { STATUS_STYLES, lineAbbrev } from '../../utils/tlsIssueData';
// Dedicated report service (list + retrieve).
import { getReportList } from '../../api/services/reportService';
import { getUser, PAGE_SIZE } from '../../api/storage/authStorage';
import { usePermissions, GROUP } from '../../context/PermissionsContext';
import createStyles from '../styles/TLSIssueTrackerStyles';
import { useOrientation } from '../../hooks/useOrientation';

const TEAL = AppColors.primary;
const SEARCH_DEBOUNCE_MS = 400;

const DEFAULT_STATUS_STYLE = { bg: '#EEEEEE', dot: '#9E9E9E', text: '#616161', border: '#E0E0E0' };
const getStatusStyle = (status) => STATUS_STYLES?.[status] ?? DEFAULT_STATUS_STYLE;

const RECORD_TYPE_META = {
  product_audit: { label: 'Audit', icon: 'aperture-outline' },
  process_audit: { label: 'Process Audit', icon: 'aperture-outline' },
  audit: { label: 'Audit', icon: 'aperture-outline' },
  tls_audit: { label: 'Audit', icon: 'aperture-outline' },
  tls_issue: { label: 'TLS Issue', icon: 'alert-circle-outline' },
  rework: { label: 'Rework', icon: 'construct-outline' },
  rework_tracker: { label: 'Rework Tracker', icon: 'time-outline' },
  rejection: { label: 'Rejection', icon: 'close-circle-outline' },
  rejection_tracker: { label: 'Rejection Tracker', icon: 'time-outline' },
  qc_verification: { label: 'QC Verification', icon: 'shield-checkmark-outline' },
  aql_audit: { label: 'AQL Audit', icon: 'clipboard-outline' },
};
const getRecordTypeMeta = (type) => RECORD_TYPE_META[type] ?? RECORD_TYPE_META.product_audit;

// Only these report/module groups are eligible to appear as chips at all.
// Order here drives the left-to-right order of the chips.
const GROUP_RECORD_TYPE_MAP = [
  { group: GROUP.TLSAUDIT, type: 'product_audit' },
  { group: GROUP.TLSISSUE, type: 'tls_issue' },
  { group: GROUP.QCVERIFICATION, type: 'qc_verification' },
  { group: GROUP.REWORK, type: 'rework' },
  { group: GROUP.REWORKTRACKER, type: 'rework_tracker' },
  { group: GROUP.REJECTION, type: 'rejection' },
  { group: GROUP.REJECTIONTRACKER, type: 'rejection_tracker' },
  { group: GROUP.AQLAUDIT, type: 'aql_audit' },
];

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
const MONTH_SHORT = MONTH_NAMES.map((m) => m.slice(0, 3));
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// "24 Sep 2026, 04:38 PM" (device local time)
const formatCreatedAt = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const h = d.getHours();
  const h12 = h % 12 || 12;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${dd} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}, ${String(h12).padStart(2, '0')}:${mm} ${h >= 12 ? 'PM' : 'AM'}`;
};

const isSameDay = (a, b) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

function buildCalendarGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
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

const mergeUnique = (prev, next) => {
  const seen = new Set(prev.map((i) => i.key));
  return [...prev, ...next.filter((i) => !seen.has(i.key))];
};

// `type` starts as null: it is resolved to the first permission-eligible
// chip as soon as permissions have loaded (see useFocusEffect below).
let reportCache = { type: null, query: '', fromDate: null, toDate: null, data: [], page: 1, hasMore: false };
const cacheKey = (type, query, fromDate, toDate) =>
  `${type ?? 'none'}|${query ?? ''}|${toApiDateString(fromDate)}|${toApiDateString(toDate)}`;

export function clearReportDateFilter() {
  reportCache = {
    ...reportCache,
    fromDate: null,
    toDate: null,
    data: [],
    page: 1,
    hasMore: false,
  };
}

/* ------------------------------------------------------------------------ */
/*  Card                                                                      */
/* ------------------------------------------------------------------------ */

// One card for every record type: Order, Buyer, Colour, Style, Created At.
function ReportCard({ issue, onPress, styles, ms }) {
  const raw = issue?.raw ?? {};
  const meta = getRecordTypeMeta(raw.record_type);

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(10,158,150,0.06)' }}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.96 }]}
      accessibilityRole="button"
    >
      <View style={styles.cardTopRow}>
        <Text style={styles.orderId} numberOfLines={1}>
          {issue.displayId ?? raw.order_no} {lineAbbrev(issue.lineLabel ?? raw.line_name)}
        </Text>
      </View>

      {/* <View style={styles.defectChip}>
        <Ionicons name={meta.icon} size={ms(15)} color={AppColors.error} />
        <Text style={styles.defectChipText} numberOfLines={1}>{meta.label}</Text>
      </View>*/}

      <View style={styles.cardGridRow}>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>ORDER</Text>
          <Text style={styles.fieldValue} numberOfLines={1}>{raw.order_code || '-'}</Text>
        </View>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>BUYER</Text>
          <Text style={styles.fieldValue} numberOfLines={1}>{raw.buyer_name || '-'}</Text>
        </View>
      </View>

      <View style={styles.cardGridRow}>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>COLOUR</Text>
          <View style={styles.fieldValueRow}>
            <View style={[styles.colourDot, { backgroundColor: issue.colourHex }]} />
            <Text style={styles.fieldValue} numberOfLines={1}>{raw.colour || '-'}</Text>
          </View>
        </View>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>STYLE</Text>
          <Text style={styles.fieldValue} numberOfLines={1}>{raw.style_name || '-'}</Text>
        </View>
      </View>
      <View style={styles.cardDivider} />

      <View style={styles.cardGridRow}>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>CREATED AT</Text>
          <Text style={styles.fieldValue} numberOfLines={1}>
            {formatCreatedAt(issue.createdAt ?? raw.created_at)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------------ */
/*  Date filter                                                               */
/* ------------------------------------------------------------------------ */

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
                style={[styles.calendarDayCell, selected && styles.calendarDayCellSelected]}
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

function DateFilterModal({
  visible, onClose, tempFromDate, tempToDate, setTempFromDate, setTempToDate, onApply, onClear, styles, ms,
}) {
  const [pickerTarget, setPickerTarget] = useState(null);

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


export default function ReportListScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs, isLargeScreen } = useResponsive();
  const { isLandscape } = useOrientation();

  const styles = createStyles(ms, mvs, fs, isLargeScreen);
  const pickStyle = (largePortrait, largeLandscape, mobilePortrait, mobileLandscape) =>
    isLargeScreen ? (isLandscape ? largeLandscape : largePortrait) : (isLandscape ? mobileLandscape : mobilePortrait);

  const tlsTitleStyle = pickStyle(styles.titlelarge, styles.titlelandscape, styles.title, styles.title);
  const tlsSearchStyle = pickStyle(styles.searchOuterlarge, styles.searchOuterlarge, styles.searchOuter, styles.searchOuter);
  const tlsSearchBarStyle = pickStyle(styles.searchBarLarge, styles.searchBarLarge, styles.searchBar, styles.searchBar);
  const tlsSearchBarInput = pickStyle(styles.searchInputLarge, styles.searchInputLarge, styles.searchInput, styles.searchInput);
  const tlsSearchChio = pickStyle(styles.lineChipTextLarge, styles.lineChipTextLarge, styles.lineChipText, styles.lineChipText);

  const { canView, loading: permsLoading } = usePermissions();

  // Dynamic filter chips: ONLY the eligible report/module types the user has
  // permission for. There is no "All" chip — the first eligible chip acts
  // as the default request_type on load.
  const accessibleRecordTypes = useMemo(
    () =>
      GROUP_RECORD_TYPE_MAP
        .filter(({ group }) => canView(group))
        .map(({ type }) => type),
    [canView],
  );
  const availableRecordTypes = accessibleRecordTypes;
  const canListReports = accessibleRecordTypes.length > 0;

  const [user, setUser] = useState(null);
  // No default type until permissions resolve; the first permitted chip is
  // selected automatically once availableRecordTypes is known (see the
  // useFocusEffect below).
  const [activeType, setActiveType] = useState(null);
  const [query, setQuery] = useState(() => reportCache.query ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(() => reportCache.query ?? '');

  const today = new Date();

const [fromDate, setFromDate] = useState( () => reportCache.fromDate ?? today);
const [toDate, setToDate] = useState(() => reportCache.toDate ?? today);
  const [tempFromDate, setTempFromDate] = useState(fromDate);
  const [tempToDate, setTempToDate] = useState(toDate);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const hasActiveDateFilter = !!(fromDate || toDate);

  const [issues, setIssues] = useState(() => reportCache.data ?? []);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(() => reportCache.page ?? 1);
  const [hasMore, setHasMore] = useState(() => reportCache.hasMore ?? false);

  const requestId = useRef(0);
  // Always-current copy of the list so appends never depend on a stale
  // closure, and so reportCache is written outside a state updater.
  const issuesRef = useRef(issues);
  // Synchronous guard: state updates are async, so onEndReached can fire
  // twice before `loadingMore` flips to true.
  const loadingMoreRef = useRef(false);
  const lastFetchedKeyRef = useRef(
    reportCache.data?.length ? cacheKey(reportCache.type, reportCache.query, reportCache.fromDate, reportCache.toDate) : null,
  );

  const filtersRef = useRef({ fromDate, toDate, debouncedQuery, activeType });
  useEffect(() => {
    filtersRef.current = { fromDate, toDate, debouncedQuery, activeType };
  }, [fromDate, toDate, debouncedQuery, activeType]);
 
const clearDateFilterOnExit = useCallback(() => {
  requestId.current += 1;

  // Clear selected chip/type when leaving Report screen
  setActiveType(null);

  setFromDate(null);
  setToDate(null);
  setTempFromDate(null);
  setTempToDate(null);

  reportCache = {
    type: null, // <-- clear selected chip
    query: '',
    fromDate: null,
    toDate: null,
    data: [],
    page: 1,
    hasMore: false,
  };

  // Clear search state too, if desired
  setQuery('');
  setDebouncedQuery('');

  issuesRef.current = [];
  setIssues([]);
  setPage(1);
  setHasMore(false);

  lastFetchedKeyRef.current = null;
}, []); 


  const goBack = useBackToDashboard(navigation, 'Dashboard', undefined, clearDateFilterOnExit);

  // targetPage === 1 (append=false) replaces the list; append=true adds the
  // next page to what is already on screen. `type` here is the selected
  // chip's value and is sent as the request_type filter to the API.
  const loadPage = useCallback(async (targetPage, {
    append = false,
    type = activeType,
    search = debouncedQuery,
    from = fromDate,
    to = toDate,
  } = {}) => {
    if (!canListReports || !type) return;
    if (append && loadingMoreRef.current) return;

    const myRequestId = ++requestId.current;
    if (append) {
      loadingMoreRef.current = true;
      setLoadingMore(true);
    } else {
      loadingMoreRef.current = false;
      setLoadingMore(false);
      setLoading(true);
    }

    try {
      const result = await getReportList({
        page: targetPage,
        pageSize: PAGE_SIZE,
        type,
        search,
        from_date: toApiDateString(from),
        to_date: toApiDateString(to),
      });
      if (myRequestId !== requestId.current) return;

      if (!result.success) {
        // A failed "load more" leaves the current list and page untouched so
        // the user can scroll again to retry; a failed first page clears it.
        if (!append) {
          issuesRef.current = [];
          setIssues([]);
          setPage(1);
          setHasMore(false);
        }
        return;
      }

      const next = append ? mergeUnique(issuesRef.current, result.data) : result.data;
      issuesRef.current = next;
      reportCache = { type, query: search, fromDate: from, toDate: to, data: next, page: result.page, hasMore: result.hasMore };

      setIssues(next);
      setPage(result.page);
      setHasMore(result.hasMore);
      lastFetchedKeyRef.current = cacheKey(type, search, from, to);
    } finally {
      if (myRequestId === requestId.current) {
        loadingMoreRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [activeType, debouncedQuery, fromDate, toDate, canListReports]);

  useFocusEffect(
    useCallback(() => {
      if (permsLoading || !canListReports) return;

      let cancelled = false;

      (async () => {
        try {
          const savedUser = await getUser();
          if (savedUser) setUser(savedUser);
        } catch (e) {
          console.warn('Could not refresh user data:', e.message);
        }

        if (cancelled) return;

        // If the previously-active type is no longer permitted (permissions
        // changed, e.g. re-login as a different role), or there is no cached
        // type yet, fall back to the FIRST permission-eligible chip rather
        // than an "all" option — there isn't one.
        const cachedType = reportCache.type;
        const typeToLoad = cachedType && availableRecordTypes.includes(cachedType)
          ? cachedType
          : availableRecordTypes[0];
        setActiveType(typeToLoad);
        const today = new Date();
        const cachedFrom = reportCache.fromDate ?? today;
        const cachedTo = reportCache.toDate ?? today;
        setFromDate(cachedFrom);
        setToDate(cachedTo);
        setTempFromDate(cachedFrom);
        setTempToDate(cachedTo);

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
    }, [permsLoading, canListReports]),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (permsLoading) return;
    if (!canListReports) {
      setLoading(false);
      return;
    }
    // Wait until the default chip has been resolved by the focus effect
    // above before firing a query-driven reload.
    if (!activeType) return;

    const key = cacheKey(activeType, debouncedQuery, fromDate, toDate);
    if (lastFetchedKeyRef.current === key) return;

    loadPage(1, { append: false });
  }, [debouncedQuery, permsLoading, canListReports, activeType, fromDate, toDate]);

  const handleTypeSelect = useCallback((type) => {
    if (type === activeType) return;
    setActiveType(type);
    lastFetchedKeyRef.current = cacheKey(type, debouncedQuery, fromDate, toDate);
    loadPage(1, { append: false, type });
  }, [activeType, debouncedQuery, fromDate, toDate, loadPage]);

  // Fired by FlatList when the user reaches the end of the loaded rows.
  // Requests the next page and appends it to the existing list.
  const handleEndReached = useCallback(() => {
    if (loading || loadingMore || loadingMoreRef.current || !hasMore) return;
    loadPage(page + 1, { append: true });
  }, [loading, loadingMore, hasMore, page, loadPage]);

  const openFilterModal = useCallback(() => {
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

  const renderItem = useCallback(({ item }) => (
    <ReportCard
      issue={item}
      styles={styles}
      ms={ms}
      onPress={() => navigation.navigate('ReportDetails', { issue: item, activeType, user })}
    />
  ), [styles, ms, navigation, activeType, user]);

  const keyExtractor = useCallback((item) => item.key, []);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={{ paddingVertical: mvs(16) }}>
        <ActivityIndicator color={AppColors.primary} />
      </View>
    );
  }, [loadingMore, mvs]);

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
            <Text style={[styles.title, tlsTitleStyle]}>Report</Text>

            <Pressable
              onPress={openFilterModal}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={({ pressed }) => [styles.filterIconBtn, pressed && { opacity: 0.85 }]}
            >
              <Ionicons name="options-outline" size={ms(20)} color={AppColors.onPrimary} />
              {hasActiveDateFilter && <View style={styles.filterActiveDot} />}
            </Pressable>
          </View>
        </SafeAreaView>

        {canListReports && (
          <>
            <View style={[styles.searchOuter, tlsSearchStyle]}>
              <View style={[styles.searchBar, tlsSearchBarStyle]}>
                <Ionicons name="search-outline" size={ms(16)} color={AppColors.textTertiary} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search"
                  placeholderTextColor={AppColors.textTertiary}
                  style={[styles.searchInput, tlsSearchBarInput]}
                  returnKeyType="search"
                  autoCorrect={false}
                />
              </View>
            </View>
 
            <View style={styles.chipsRowOuter}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {availableRecordTypes.map((type) => {
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
                      <Text style={[styles.lineChipText, tlsSearchChio, active && styles.lineChipTextActive]} numberOfLines={1}>
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
        ) : !canListReports ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="lock-closed-outline" size={ms(28)} color={AppColors.textTertiary} />
            <Text style={styles.emptyText}>You don't have permission to view any report modules.</Text>
          </View>
        ) : loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={AppColors.primary} />
          </View>
        ) : issues.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="file-tray-outline" size={ms(28)} color={AppColors.textTertiary} />
            <Text style={styles.emptyText}>
              {query || hasActiveDateFilter ? 'No records match your filters.' : 'No records found for this type.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={issues}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
          />
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
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { AppColors } from '../theme/theme';
import { scale, verticalScale, fontScale, moderateScale } from '../utils/scale';
import { GRADE_COLORS, GRADE_BG } from '../utils/auditData';
import { getDefectList, getSeverityDropdown } from '../api/services/tlsService';
import {
  getRecentDefects,
  addRecentDefect,
} from '../api/storage/authStorage';
import BottomSheet from './BottomSheet';

const TEAL = '#0D939D';
const TEAL_LIGHT = '#0D939D1A';

const RECENT_CATEGORY_ID = '__recent__';
const RECENT_CATEGORY = { id: RECENT_CATEGORY_ID, value: 'Recent' };
const SEVERITY_PALETTE = [
  { color: GRADE_COLORS.Blue,   bg: GRADE_BG.Blue },
  { color: GRADE_COLORS.Yellow, bg: GRADE_BG.Yellow },
  { color: GRADE_COLORS.Red,    bg: GRADE_BG.Red },
  { color: '#8E24AA',           bg: '#8E24AA1A' },
  { color: '#00897B',           bg: '#00897B1A' },
];

const severityLabel = (s) => s?.value ?? s?.name ?? s?.label ?? String(s?.id ?? '');

function Counter({ value, onInc, onDec }) {
  return (
    <View style={styles.counterBox}>
      <TouchableOpacity
        style={styles.counterBtn}
        onPress={onDec}
        activeOpacity={0.6}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Text style={styles.counterBtnText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.counterValue}>{value}</Text>
      <TouchableOpacity
        style={styles.counterBtn}
        onPress={onInc}
        activeOpacity={0.6}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Text style={styles.counterBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const entryKey = (defectId, severityId) => `${defectId}::${severityId}`;
const recentKey = (d) => `${d?.defect_id}::${d?.severity_id}`;

export default function DefectEntrySheet({
  visible,
  onClose,
  categories = [],
  initialEntries = {},
  onApply,
  severities: severitiesProp,               // optional — pass from parent to keep in sync
  loadingSeverities: loadingSeveritiesProp,  // optional — parent's loading flag
}) {
  // ── Severity: use parent-provided list if given, else self-fetch ──────
  const [severitiesOwn, setSeveritiesOwn] = useState([]);
  const [loadingSeveritiesOwn, setLoadingSeveritiesOwn] = useState(false);
  const [activeSeverityId, setActiveSeverityId] = useState(null);

  const usingOwnFetch = severitiesProp === undefined;
  const severities = usingOwnFetch ? severitiesOwn : severitiesProp;
  const loadingSeverities = usingOwnFetch ? loadingSeveritiesOwn : !!loadingSeveritiesProp;

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [defectList, setDefectList] = useState([]);
  const [loadingDefects, setLoadingDefects] = useState(false);
  const [entries, setEntries] = useState({ ...initialEntries });

  const [recentDefects, setRecentDefects] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const displayCategories = useMemo(
    () => [RECENT_CATEGORY, ...categories],
    [categories],
  );
  // Quick lookup: real category id -> display name (from getCategoryDropdown,
  // e.g. {id: 111, value: 'SOP sub', ...}). This is the single source of
  // truth for category_name — we never persist a separate name string that
  // could drift from this list.
  const categoryNameById = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.value ?? c.name ?? c.label;
    });
    return map;
  }, [categories]);

  // Self-fetch severities only if the parent didn't provide them.
  useEffect(() => {
    if (!usingOwnFetch) return;
    if (!visible || severitiesOwn.length) return;
    let cancelled = false;
    (async () => {
      setLoadingSeveritiesOwn(true);
      try {
        const list = await getSeverityDropdown();
        if (!cancelled) setSeveritiesOwn(list);
      } finally {
        if (!cancelled) setLoadingSeveritiesOwn(false);
      }
    })();
    return () => { cancelled = true; };
  }, [usingOwnFetch, visible, severitiesOwn.length]);

  // Default the active tab to the first severity whenever the resolved list changes.
  useEffect(() => {
    if (severities.length && activeSeverityId == null) {
      setActiveSeverityId(severities[0].id);
    }
  }, [severities, activeSeverityId]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    (async () => {
      setLoadingRecent(true);
      try {
        const recent = await getRecentDefects();
        if (!cancelled) setRecentDefects(Array.isArray(recent) ? recent : []);
      } finally {
        if (!cancelled) setLoadingRecent(false);
      }
    })();
    return () => { cancelled = true; };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    setEntries(initialEntries ? { ...initialEntries } : {});

    if (severities.length) setActiveSeverityId(severities[0].id);
    if (!selectedCategoryId) {
      setSelectedCategoryId(RECENT_CATEGORY_ID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (!visible || !activeSeverityId) return;

    if (selectedCategoryId === RECENT_CATEGORY_ID) {
     
      const list = recentDefects
        .filter((d) => d.severity_id === activeSeverityId)
        .map((d) => ({
          id: d.defect_id,
          defect_name: d.defect_name,
          category_id: d.category_id ?? null,
          workcategory_id: d.workcategory_id ?? null,
          workcategory_name: d.workcategory_name ?? null,
          caps: d.cap ?? [],
        }));
      setDefectList(list);
      setLoadingDefects(false);
      return;
    }

    if (!selectedCategoryId) return;
    let cancelled = false;
    (async () => {
      setLoadingDefects(true);
      try {
        const list = await getDefectList(selectedCategoryId, activeSeverityId);
        if (!cancelled) setDefectList(list);
      } finally {
        if (!cancelled) setLoadingDefects(false);
      }
    })();
    return () => { cancelled = true; };
  }, [visible, selectedCategoryId, activeSeverityId, recentDefects]);

  const activeSeverity = useMemo(
    () => severities.find((s) => s.id === activeSeverityId) ?? null,
    [severities, activeSeverityId],
  );

  const severityStyle = useCallback((severityId) => {
    const idx = severities.findIndex((s) => s.id === severityId);
    return SEVERITY_PALETTE[idx >= 0 ? idx % SEVERITY_PALETTE.length : 0];
  }, [severities]);

  const handleChange = useCallback((def, delta) => {
    if (!activeSeverity) return;
    const key = entryKey(def.id, activeSeverity.id);

    const isRecentTab = selectedCategoryId === RECENT_CATEGORY_ID;

    // Work-category fields always come from the defect's own work-category
    // data — never fall back to the audit category, in either tab.
    const workCategoryId = def.workcategory_id ?? null;
    const workCategoryName = def.workcategory_name ?? null;

    // Audit-category fields always come from the real audit category:
    // - Normal tab: whichever category is currently selected.
    // - Recent tab: the category_id the defect was originally picked under
    //   (stored on the recent entry itself — never derived from
    //   workcategory_id).
    // category_name is always looked up fresh from categoryNameById (the
    // getCategoryDropdown data), never a separately-stored string, so it
    // can never drift out of sync with the dropdown.
    const categoryId = isRecentTab ? (def.category_id ?? null) : selectedCategoryId;
    const categoryName = categoryId != null ? (categoryNameById[categoryId] ?? null) : null;

    setEntries((prev) => {
      const current = prev[key]?.qty ?? 0;
      const qty = Math.max(0, current + delta);
      const next = { ...prev };
      if (qty === 0) {
        delete next[key];
      } else {
        next[key] = {
          qty,
          category_id: categoryId,
          category_name: categoryName,
          defect_id: def.id,
          defect_name: def.defect_name,
          severity_id: activeSeverity.id,
          severity_name: severityLabel(activeSeverity),
          workcategory_id: workCategoryId,
          workcategory_name: workCategoryName,
          cap: def.caps ?? [],
        };
      }
      return next;
    });

    if (delta > 0) {
      // Recent entries now persist BOTH the audit category_id and the
      // work-category fields, so re-picking from Recent can correctly
      // restore category_id/category_name instead of losing them.
      const recentEntry = {
        defect_id: def.id,
        defect_name: def.defect_name,
        category_id: categoryId,
        severity_id: activeSeverity.id,
        severity_name: severityLabel(activeSeverity),
        workcategory_id: workCategoryId,
        workcategory_name: workCategoryName,
        cap: def.caps ?? [],
      };
      const alreadyInRecent = recentDefects.some(
        (d) => recentKey(d) === recentKey(recentEntry),
      );
      if (!alreadyInRecent) {
        setRecentDefects((prev) => [recentEntry, ...prev].slice(0, 5));
        addRecentDefect(recentEntry).catch((e) => {
          console.warn('addRecentDefect failed:', e?.message);
        });
      }
    }
  }, [selectedCategoryId, activeSeverity, recentDefects, categoryNameById]);

  const totals = useMemo(() => {
    const t = {};
    Object.values(entries).forEach((e) => {
      t[e.severity_id] = (t[e.severity_id] ?? 0) + e.qty;
    });
    return t;
  }, [entries]);

  const handleApply = () => {
    onApply?.(entries);
    onClose();
  };

  const handleClose = () => {
    if (severities.length) setActiveSeverityId(severities[0].id);
    onClose();
  };

  const emptyDefectListText = selectedCategoryId === RECENT_CATEGORY_ID
    ? 'No recent defects yet — items you add will show up here.'
    : 'No defects configured for this category.';

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title="Defect Entry"
      subtitle="Select category · Count by severity"
      maxHeight={verticalScale(620)}
    >
      <View style={styles.totalsRow}>
        {severities.length === 0 ? (
          loadingSeverities ? (
            <ActivityIndicator color={AppColors.primary} style={{ paddingVertical: verticalScale(10) }} />
          ) : (
            <Text style={styles.emptyText}>No severities configured.</Text>
          )
        ) : (
          severities.map((sev) => {
            const style = severityStyle(sev.id);
            return (
              <View key={sev.id} style={[styles.totalCell, { backgroundColor: style.bg }]}>
                <Text style={styles.totalLabel} numberOfLines={1}>{severityLabel(sev)}</Text>
                <Text style={[styles.totalCount, { color: style.color }]}>
                  {totals[sev.id] ?? 0}
                </Text>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.body}>
        <ScrollView style={styles.leftNav} showsVerticalScrollIndicator={false} nestedScrollEnabled>
          {displayCategories.map((cat) => {
            const active = selectedCategoryId === cat.id;
            const isRecent = cat.id === RECENT_CATEGORY_ID;
            const hasEntries = isRecent
              ? Object.keys(entries).length > 0
              : Object.values(entries).some((e) => e.category_id === cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.leftNavItem, active && styles.leftNavItemActive]}
                onPress={() => setSelectedCategoryId(cat.id)}
                activeOpacity={0.7}
              >
                <View style={styles.leftNavLabelRow}>
                  <Text
                    style={[styles.leftNavLabel, active && styles.leftNavLabelActive]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {isRecent ? cat.value : (cat.value ?? cat.name ?? cat.label)}
                  </Text>
                  {hasEntries && <View style={styles.leftNavDot} />}
                </View>
                <View style={[styles.leftNavIndicator, active && styles.leftNavIndicatorActive]} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.rightContent}>
          <View style={styles.tabRow}>
            {loadingSeverities ? (
              <ActivityIndicator color={AppColors.primary} style={{ paddingVertical: verticalScale(8) }} />
            ) : (
              severities.map((sev) => (
                <TouchableOpacity
                  key={sev.id}
                  style={[styles.tab, activeSeverityId === sev.id && styles.tabActive]}
                  onPress={() => setActiveSeverityId(sev.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.tabText, activeSeverityId === sev.id && styles.tabTextActive]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                  >
                    {severityLabel(sev)}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          <ScrollView
            style={{ maxHeight: verticalScale(300) }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {(selectedCategoryId === RECENT_CATEGORY_ID ? loadingRecent : loadingDefects) ? (
              <ActivityIndicator color={AppColors.primary} style={{ marginTop: verticalScale(24) }} />
            ) : defectList.length === 0 ? (
              <Text style={styles.emptyText}>{emptyDefectListText}</Text>
            ) : (
              defectList.map((def) => {
                const key = entryKey(def.id, activeSeverityId);
                return (
                  <View key={def.id} style={styles.defectRow}>
                    <Text
                      style={styles.defectLabel}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {def.defect_name}
                    </Text>
                    <Counter
                      value={entries[key]?.qty ?? 0}
                      onInc={() => handleChange(def, +1)}
                      onDec={() => handleChange(def, -1)}
                    />
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>

      <View style={styles.applyWrap}>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.85}>
          <Text style={styles.applyBtnText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  totalsRow: {
    flexDirection: 'row',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(10),
    gap: scale(8),
  },
  totalCell: { flex: 1, borderRadius: moderateScale(10), paddingVertical: verticalScale(8), alignItems: 'center' },
  totalLabel: { fontSize: fontScale(14), fontWeight: '700', color: AppColors.labrlcolo },
  totalCount: { fontSize: fontScale(20), fontWeight: '600', letterSpacing: -0.5 },

  body: { flexDirection: 'row', height: verticalScale(330) },

  leftNav: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderRightColor: AppColors.divider,
  },
  leftNavItem: {
    paddingVertical: verticalScale(14),
    paddingLeft: scale(10),
    paddingRight: scale(4),
  },
  leftNavItemActive: { backgroundColor: TEAL_LIGHT },
  leftNavLabel: { fontSize: fontScale(13.5), fontWeight: '600', color: AppColors.textTertiary },
  leftNavLabelRow: { flexDirection: 'row', alignItems: 'center', gap: scale(4), flexWrap: 'nowrap' },
  leftNavDot: { width: scale(6), height: scale(6), borderRadius: scale(3), backgroundColor: GRADE_COLORS.Red },
  leftNavLabelActive: { color: TEAL, fontWeight: '800' },
  leftNavIndicator: { width: scale(3), height: verticalScale(4), backgroundColor: 'transparent', marginTop: verticalScale(4) },
  leftNavIndicatorActive: { backgroundColor: TEAL },

  rightContent: { flex: 3, paddingLeft: scale(14), paddingRight: scale(16), paddingTop: verticalScale(10) },

  tabRow: {
    flexDirection: 'row',
    marginBottom: verticalScale(10),
    backgroundColor: '#F1F5F9',
    borderRadius: moderateScale(10),
    padding: scale(3),
  },
  tab: {
    flex: 1,
    minWidth: 0,
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(4),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: { backgroundColor: TEAL },
  tabText: { fontSize: fontScale(14), fontWeight: '600', color: AppColors.textSecondary, textAlign: 'center' },
  tabTextActive: { color: AppColors.onPrimary, fontWeight: '700' },

  listContent: { paddingBottom: verticalScale(8) },
  emptyText: {
    fontSize: fontScale(15.5),
    color: AppColors.textTertiary,
    paddingVertical: verticalScale(16),
    textAlign: 'center',
  },
  defectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(11),
    gap: scale(8),
  },
  defectLabel: {
    fontSize: fontScale(15),
    color: AppColors.textPrimary,
    fontWeight: '500',
    flex: 1,
    flexShrink: 1,
  },
  counterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(6),
    width: scale(88),
    height: scale(34),
    backgroundColor: AppColors.surface,
    flexShrink: 0,
  },
  counterBtn: {
    width: scale(22),
    height: scale(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    fontSize: fontScale(20),
    fontWeight: '500',
    color: AppColors.textSecondary,
    lineHeight: fontScale(18),
    includeFontPadding: false,
  },
  counterValue: {
    flex: 1,
    fontSize: fontScale(16.5),
    fontWeight: '700',
    color: AppColors.labrlcolo,
    textAlign: 'center',
  },
  applyWrap: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: AppColors.divider,
  },
  applyBtn: {
    backgroundColor: TEAL,
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(15),
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: TEAL, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10 },
      android: { elevation: 5 },
    }),
  },
  applyBtnText: { fontSize: fontScale(16), fontWeight: '600', color: AppColors.onPrimary },
});
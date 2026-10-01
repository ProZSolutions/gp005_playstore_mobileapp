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
import { useResponsive } from '../utils/responsive';
import { GRADE_COLORS, GRADE_BG } from '../utils/auditData';
import { getDefectList, getSeverityDropdown } from '../api/services/tlsService';
import {
  getRecentDefects,
  addRecentDefect,
  getDefectEntries,
  saveDefectEntries,
} from '../api/storage/authStorage';
import BottomSheet from './BottomSheet';
 import { useOrientation } from '../hooks/useOrientation';
const SEVERITY_PALETTE = [
  { color: GRADE_COLORS.Blue, bg: GRADE_BG.Blue },
  { color: GRADE_COLORS.Yellow, bg: GRADE_BG.Yellow },
  { color: GRADE_COLORS.Red, bg: GRADE_BG.Red },
  { color: '#8E24AA', bg: '#8E24AA1A' },
  { color: '#00897B', bg: '#00897B1A' },
];

const severityLabel = (s) =>
  s?.value ?? s?.name ?? s?.label ?? String(s?.id ?? '');
const TEAL = '#0D939D';
const TEAL_LIGHT = '#0D939D1A';
 
const RECENT_CATEGORY_ID = '__recent__';
const RECENT_CATEGORY = { id: RECENT_CATEGORY_ID, value: 'Recent' };

function Counter({ value, onInc, onDec, incDisabled, styles }) {
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
        style={[styles.counterBtn, incDisabled && styles.counterBtnDisabled]}
        onPress={incDisabled ? undefined : onInc}
        activeOpacity={incDisabled ? 1 : 0.6}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Text style={[styles.counterBtnText, incDisabled && styles.counterBtnTextDisabled]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const entryKey = (defectId, sevTab) => `${defectId}::${sevTab}`; 
const recentKey = (d) => `${d?.defect_id}::${d?.severity_id}`;

export default function DefectEntrySheet({
  visible,
  onClose,
  categories = [],
  initialEntries = {},
  onApply,
  maxSelections,
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [defectList, setDefectList] = useState([]);
  const [loadingDefects, setLoadingDefects] = useState(false);
  const [entries, setEntries] = useState({ ...initialEntries });
  const [severities, setSeverities] = useState([]);
  const [loadingSeverities, setLoadingSeverities] = useState(false);
  const [activeSeverityId, setActiveSeverityId] = useState(null);

  const [recentDefects, setRecentDefects] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const { scale, verticalScale, fontScale, moderateScale, isLargeScreen } = useResponsive();
  const styles = useMemo(
    () => createStyles({ scale, verticalScale, fontScale, moderateScale, isLargeScreen }),
    [scale, verticalScale, fontScale, moderateScale, isLargeScreen],
  );
      const { isLandscape } = useOrientation();

const pickStyle = (largePortrait, largeLandscape, mobilePortrait, mobileLandscape) =>   isLargeScreen ? (isLandscape ? largeLandscape : largePortrait): 
(isLandscape ? mobileLandscape : mobilePortrait);

  const isSingleSelect = maxSelections === 1;

  const persistTag = isSingleSelect ? 'single' : undefined;

  const displayCategories = useMemo(
    () => [RECENT_CATEGORY, ...categories],
    [categories],
  );
 
  const categoryNameById = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.value ?? c.name ?? c.label;
    });
    return map;
  }, [categories]);

  useEffect(() => {
    if (visible) {
      const hasParentEntries = initialEntries && Object.keys(initialEntries).length > 0;

      if (hasParentEntries) {
        setEntries({ ...initialEntries });
      } else if (isSingleSelect) {
        setEntries({});
      } else {
        let cancelled = false;
        (async () => {
          try {
            const stored = await getDefectEntries(persistTag);
            if (!cancelled) {
              setEntries(stored && Object.keys(stored).length ? stored : {});
            }
          } catch {
            if (!cancelled) setEntries({});
          }
        })();
      }

      if (severities.length) {
        setActiveSeverityId(severities[0].id);
      }
      if (!selectedCategoryId) {
        setSelectedCategoryId(RECENT_CATEGORY_ID);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    (async () => {
      setLoadingRecent(true);
      try {
        const recent = await getRecentDefects(persistTag);
        if (!cancelled) setRecentDefects(Array.isArray(recent) ? recent : []);
      } finally {
        if (!cancelled) setLoadingRecent(false);
      }
    })();
    return () => { cancelled = true; };
  }, [visible, persistTag]);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;

    (async () => {
      setLoadingSeverities(true);
      try {
        const list = await getSeverityDropdown();
        if (!cancelled) {
          setSeverities(list);
          if (list.length) {
            setActiveSeverityId(list[0].id);
          }
        }
      } finally {
        if (!cancelled) {
          setLoadingSeverities(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
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

  const selectedCategoryName = useMemo(() => {
    if (selectedCategoryId === RECENT_CATEGORY_ID) return RECENT_CATEGORY.value;
    return categoryNameById[selectedCategoryId] ?? '';
  }, [categoryNameById, selectedCategoryId]);

  const activeSeverity = useMemo(
    () => severities.find((s) => s.id === activeSeverityId) ?? null,
    [severities, activeSeverityId],
  );

  const selectedKey = useMemo(() => {
    if (!isSingleSelect) return null;
    const keys = Object.keys(entries);
    return keys.length ? keys[0] : null;
  }, [isSingleSelect, entries]);

  const handleChange = useCallback((def, delta) => {
    if (!activeSeverity) return;

    const key = entryKey(def.id, activeSeverityId);

    const isRecentTab = selectedCategoryId === RECENT_CATEGORY_ID;

    const categoryId = isRecentTab ? (def.category_id ?? null) : selectedCategoryId;
    const categoryName = categoryId != null ? (categoryNameById[categoryId] ?? null) : null;

    const workCategoryId = def.workcategory_id ?? null;
    const workCategoryName = def.workcategory_name ?? null;

    setEntries((prev) => {
      const current = prev[key]?.qty ?? 0;
      const qty = isSingleSelect
        ? Math.min(1, Math.max(0, current + delta))
        : Math.max(0, current + delta);

      let base = prev;

      if (isSingleSelect && delta > 0 && current === 0) {
        base = {};
      }

      const next = { ...base };

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
      setRecentDefects((prev) => {
        const filtered = prev.filter((d) => recentKey(d) !== recentKey(recentEntry));
        return [recentEntry, ...filtered].slice(0, 5);
      });
      addRecentDefect(recentEntry, persistTag).catch((e) => {
        console.warn('addRecentDefect failed:', e?.message);
      });
    }
  }, [
    selectedCategoryId,
    categoryNameById,
    activeSeverity,
    activeSeverityId,
    isSingleSelect,
    persistTag,
  ]);

  const totals = useMemo(() => {
    const t = {};
    Object.values(entries).forEach((e) => {
      t[e.severity_id] = (t[e.severity_id] ?? 0) + e.qty;
    });
    return t;
  }, [entries]);

  const handleApply = () => {
    onApply?.(entries);
    saveDefectEntries(entries, persistTag).catch((e) => {
      console.warn('saveDefectEntries failed:', e?.message);
    });
    onClose();
  };

  const handleClose = () => {
    if (severities.length) {
      setActiveSeverityId(severities[0].id);
    }
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
      maxHeight={isLargeScreen ? 700 : verticalScale(620)}
    >
      <View style={styles.totalsRow}>
        {loadingSeverities ? (
          <ActivityIndicator
            color={AppColors.primary}
            style={{ paddingVertical: isLargeScreen ? 12 : verticalScale(10) }}
          />
        ) : (
          severities.map((sev, index) => {
            const palette = SEVERITY_PALETTE[index % SEVERITY_PALETTE.length];

            return (
              <View
                key={sev.id}
                style={[styles.totalCell, { backgroundColor: palette.bg }]}
              >
                <Text style={styles.totalLabel} numberOfLines={1}>
                  {severityLabel(sev)}
                </Text>

                <Text style={[styles.totalCount, { color: palette.color }]}>
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
            {severities.map((sev) => (
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
                  minimumFontScale={0.9}
                >
                  {severityLabel(sev)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isSingleSelect && selectedKey && (
            <Text style={styles.singleSelectHint}>
              Only one defect can be selected. Choosing another will replace it.
            </Text>
          )}

          <ScrollView
            style={{ maxHeight: isLargeScreen ? 360 : verticalScale(300) }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {(selectedCategoryId === RECENT_CATEGORY_ID ? loadingRecent : loadingDefects) ? (
              <ActivityIndicator color={AppColors.primary} style={{ marginTop: isLargeScreen ? 28 : verticalScale(24) }} />
            ) : defectList.length === 0 ? (
              <Text style={styles.emptyText}>{emptyDefectListText}</Text>
            ) : (
              defectList.map((def) => {
                const key = entryKey(def.id, activeSeverityId);
                const qty = entries[key]?.qty ?? 0;

                const incDisabled = isSingleSelect ? qty >= 1 : false;

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
                      value={qty}
                      incDisabled={incDisabled}
                      onInc={() => handleChange(def, +1)}
                      onDec={() => handleChange(def, -1)}
                      styles={styles}
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

 
const createStyles = ({ scale, verticalScale, fontScale, moderateScale, isLargeScreen }) =>
  StyleSheet.create({
    totalsRow: {
      flexDirection: 'row',
      paddingHorizontal: isLargeScreen ? 6 : scale(20),
      paddingTop: isLargeScreen ? 16 : verticalScale(14),
      paddingBottom: isLargeScreen ? 12 : verticalScale(10),
      gap: isLargeScreen ? 10 : scale(8),
      maxWidth: isLargeScreen ? 750 : undefined,
      alignSelf: isLargeScreen ? 'center' : 'stretch',
      width: '100%',
    },
    totalCell: {
      flex: 1,
      borderRadius: isLargeScreen ? 12 : moderateScale(10),
      paddingVertical: isLargeScreen ? 15 : verticalScale(8),
      alignItems: 'center',
    },
    totalLabel: { fontSize: isLargeScreen ? 18 : fontScale(14), fontWeight: '700', color: AppColors.labrlcolo,fontFamily:'Inter-Regular' },
    totalCount: { fontSize: isLargeScreen ? 22 : fontScale(20), fontWeight: '800', letterSpacing: -0.5,fontFamily:'Inter-Regular' },

    body: {
      flexDirection: 'row',
      height: isLargeScreen ? 380 : verticalScale(330),
      maxWidth: isLargeScreen ? 750 : undefined,
      alignSelf: isLargeScreen ? 'center' : 'stretch',
      width: '100%',
    },

    leftNav: {
      flex: 1,
      backgroundColor: '#F8FAFC',
      borderRightWidth: 1,
      borderRightColor: AppColors.divider,
    },
    leftNavItem: {
      paddingVertical: isLargeScreen ? 16 : verticalScale(14),
      paddingLeft: isLargeScreen ? 12 : scale(10),
      paddingRight: isLargeScreen ? 6 : scale(4),
    },
    leftNavItemActive: { backgroundColor: TEAL_LIGHT },
    leftNavLabel: { fontSize: isLargeScreen ? 17 : fontScale(13.5), fontWeight: '600', color: AppColors.textTertiary,fontFamily:'Inter-Regular' },
    leftNavLabelRow: { flexDirection: 'row', alignItems: 'center', gap: isLargeScreen ? 5 : scale(4), flexWrap: 'nowrap' },
    leftNavDot: {
      width: isLargeScreen ? 7 : scale(6),
      height: isLargeScreen ? 7 : scale(6),
      borderRadius: isLargeScreen ? 3.5 : scale(3),
      backgroundColor: GRADE_COLORS.Red,
    },
    leftNavLabelActive: { color: TEAL, fontWeight: '800' },
    leftNavIndicator: {
      width: isLargeScreen ? 3 : scale(3),
      height: isLargeScreen ? 4 : verticalScale(4),
      backgroundColor: 'transparent',
      marginTop: isLargeScreen ? 5 : verticalScale(4),
    },
    leftNavIndicatorActive: { backgroundColor: TEAL },

    rightContent: {
      flex: 3,
      paddingLeft: isLargeScreen ? 18 : scale(14),
      paddingRight: isLargeScreen ? 20 : scale(16),
      paddingTop: isLargeScreen ? 14 : verticalScale(10),
    },

    tabRow: {
      flexDirection: 'row',
      marginBottom: isLargeScreen ? 14 : verticalScale(12),
      backgroundColor: '#F1F5F9',
      borderRadius: isLargeScreen ? 12 : moderateScale(10),
      padding: isLargeScreen ? 4 : scale(4),
      gap: isLargeScreen ? 6 : scale(4),
    },
    tab: {
      flex: 1,
      minWidth: 0,
      minHeight: isLargeScreen ? 44 : scale(42),
      paddingVertical: isLargeScreen ? 15 : verticalScale(11),
      paddingHorizontal: isLargeScreen ? 12 : scale(6),
      borderRadius: isLargeScreen ? 10 : moderateScale(8),
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabActive: {
      backgroundColor: TEAL,
      ...Platform.select({
        ios: { shadowColor: TEAL, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
        android: { elevation: 2 },
      }),
    },
    tabText: {
      fontSize: isLargeScreen ? 17 : fontScale(15),
      fontWeight: '600',
      color: AppColors.textSecondary,
      textAlign: 'center',
      fontFamily:'Inter-Regular'
    },
    tabTextActive: { color: AppColors.onPrimary, fontWeight: '700' },

    singleSelectHint: {
      fontSize: isLargeScreen ? 16 : fontScale(11.5),
      color: AppColors.textTertiary,
      marginBottom: isLargeScreen ? 8 : verticalScale(6),
    },

    listContent: { paddingBottom: isLargeScreen ? 10 : verticalScale(8) },
    emptyText: {
      fontSize: isLargeScreen ? 16.5 : fontScale(15.5),
      color: AppColors.textTertiary,
      paddingVertical: isLargeScreen ? 18 : verticalScale(16),
      textAlign: 'center',
    },
    defectRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: isLargeScreen ? 13 : verticalScale(11),
      gap: isLargeScreen ? 10 : scale(8),
    },
    defectLabel: {
      fontSize: isLargeScreen ? 18 : fontScale(15),
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
      borderRadius: isLargeScreen ? 9 : moderateScale(8),
      paddingHorizontal: isLargeScreen ? 7 : scale(6),
      width: isLargeScreen ? 96 : scale(88),
      height: isLargeScreen ? 38 : scale(34),
      backgroundColor: AppColors.surface,
      flexShrink: 0,
    },
    counterBtn: {
      width: isLargeScreen ? 24 : scale(22),
      height: isLargeScreen ? 32 : scale(30),
      alignItems: 'center',
      justifyContent: 'center',
    },
    counterBtnDisabled: { opacity: 0.35 },
    counterBtnText: {
      fontSize: isLargeScreen ? 21 : fontScale(20),
      fontWeight: '500',
      color: AppColors.textSecondary,
      lineHeight: isLargeScreen ? 19 : fontScale(18),
      includeFontPadding: false,
    },
    counterBtnTextDisabled: { color: AppColors.textTertiary },
    counterValue: {
      flex: 1,
      fontSize: isLargeScreen ? 17.5 : fontScale(16.5),
      fontWeight: '700',
      color: AppColors.labrlcolo,
      textAlign: 'center',
    },
    applyWrap: {
      paddingHorizontal: isLargeScreen ? 24 : scale(20),
      paddingTop: isLargeScreen ? 14 : verticalScale(12),
      borderTopWidth: 1,
      borderTopColor: AppColors.divider,
    },
    applyBtn: {
      backgroundColor: TEAL,
      borderRadius: isLargeScreen ? 16 : moderateScale(14),
      paddingVertical: isLargeScreen ? 17 : verticalScale(15),
      alignItems: 'center',
      ...Platform.select({
        ios: { shadowColor: TEAL, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10 },
        android: { elevation: 5 },
      }),
    },
    applyBtnText: { fontSize: isLargeScreen ? 18 : fontScale(16), fontWeight: '600', color: AppColors.onPrimary },
  });
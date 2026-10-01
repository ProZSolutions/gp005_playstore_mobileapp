import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
 
import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import { STATUS_STYLES, lineAbbrev } from '../../utils/tlsIssueData';
import { getAuditList } from '../../api/services/tlsService';
import { useOrientation } from '../../hooks/useOrientation';
import {
  getLineIds,
  getLineNames,
  getSelectedLineId,
  getUser,
  saveSelectedLineId,
  PAGE_SIZE,
} from '../../api/storage/authStorage';
import { useBackToDashboard } from '../../hooks/useBackToDashboard';

import { usePermissions, GROUP, ACTION } from '../../context/PermissionsContext';
import createStyles from '../styles/TLSIssueTrackerStyles';

const TEAL = AppColors.primary;
const SEARCH_DEBOUNCE_MS = 400;

const DEFAULT_STATUS_STYLE = { bg: '#EEEEEE', dot: '#9E9E9E', text: '#616161', border: '#E0E0E0' };
const getStatusStyle = (status) => STATUS_STYLES?.[status] ?? DEFAULT_STATUS_STYLE;

 
let issuesCache = { lineId: null, query: '', data: [], page: 1, hasMore: false };
const cacheKey = (lineId, query) => `${lineId ?? ''}|${query ?? ''}`;
 
const buildLineChips = (ids, names) => {
  if (!Array.isArray(ids) || !ids.length) return [];
  return ids
    .map((id, i) => ({ id, name: names?.[i] ?? id }))
    .sort((a, b) => {
      const numA = Number(a.id);
      const numB = Number(b.id);
      if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
        return numA - numB;
      }
      return String(a.id).localeCompare(String(b.id));
    });
};

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
        <StatusPill status={issue.status} status_name={issue.status_name} styles={styles} />
      </View>

      <View style={styles.defectChip}>
        <Ionicons name="warning-outline" size={ms(15)} color={AppColors.error} />
        <Text style={styles.defectChipText} numberOfLines={1}>{issue.defectTitle}</Text>
      </View>

      <View style={styles.cardGridRow}>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>OPERATION</Text>
          <Text style={styles.fieldValue} numberOfLines={1}>{issue.operation}</Text>
        </View>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>TYPE</Text>
          <Text style={styles.fieldValue} numberOfLines={1}>{issue.raw.machine_type_name}</Text>
        </View>
      </View>

      <View style={styles.cardGridRow}>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>COLOUR</Text>
          <View style={styles.fieldValueRow}>
            <View style={[styles.colourDot, { backgroundColor: issue.colourHex }]} />
            <Text style={styles.fieldValue} numberOfLines={1}>{issue.colour}</Text>
          </View>
        </View>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>ELAPSED TIME</Text>
          <Text style={styles.fieldValue} numberOfLines={1}>{issue.elasedTimeNew ?? issue.res_hr_format}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function TLSIssueTrackerScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs, isLargeScreen } = useResponsive();
  const styles = createStyles(ms, mvs, fs, isLargeScreen);
 const { isLandscape } = useOrientation();
  // Permission gate: viewing the group at all, and specifically listing it.
  const { canView, can, loading: permsLoading } = usePermissions();
  const canViewGroup = canView(GROUP.TLSISSUE);
  const canListIssues = canViewGroup && can(GROUP.TLSISSUE, ACTION.LIST);
    const goBack = useBackToDashboard(navigation);


  const pickStyle = (largePortrait, largeLandscape, mobilePortrait, mobileLandscape) =>   isLargeScreen ? (isLandscape ? largeLandscape : largePortrait): 
(isLandscape ? mobileLandscape : mobilePortrait);
   const textStyle = pickStyle(styles.titleLarge,styles.titleLarge,styles.title,styles.title);








 
  const [lines, setLines] = useState(() => buildLineChips(route?.params?.lineIds, route?.params?.lineNames));

    const [user, setUser] = useState(null);
  
  const [activeLineId, setActiveLineId] = useState(() => issuesCache.lineId ?? null);
  const [query, setQuery] = useState(() => issuesCache.query ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(() => issuesCache.query ?? '');

  const [issues, setIssues] = useState(() => (issuesCache.lineId ? issuesCache.data : []));
  const [loading, setLoading] = useState(() => !issuesCache.lineId);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(() => (issuesCache.lineId ? issuesCache.page : 1));
  const [hasMore, setHasMore] = useState(() => (issuesCache.lineId ? issuesCache.hasMore : false));

  // Guards against an in-flight page fetch overlapping with a filter change.
  const requestId = useRef(0); 
  const lastFetchedKeyRef = useRef(issuesCache.lineId ? cacheKey(issuesCache.lineId, issuesCache.query) : null);
 
  // dependency array during render.
  const loadPage = useCallback(async (targetPage, { append, lineId = activeLineId, search = debouncedQuery } = {}) => {
    if (!canListIssues || !lineId) return;
    const myRequestId = ++requestId.current;
    if (targetPage === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const result = await getAuditList({
        page: targetPage,
        pageSize: PAGE_SIZE,
        lineId,
        search,
      });
      if (myRequestId !== requestId.current) return; // a newer filter change superseded this fetch

      setIssues((prev) => {
        const next = append ? [...prev, ...result.data] : result.data;
        issuesCache = { lineId, query: search, data: next, page: result.page, hasMore: result.hasMore };
        return next;
      });
      setPage(result.page);
      setHasMore(result.hasMore);
      lastFetchedKeyRef.current = cacheKey(lineId, search);
    } finally {
      if (myRequestId === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [activeLineId, debouncedQuery, canListIssues]);

 
  useFocusEffect(
    useCallback(() => {
      if (permsLoading || !canListIssues) return;
      let cancelled = false;
      (async () => {

            try {
                    const savedUser = await getUser();
                    if (savedUser) {
                      setUser(savedUser);
                    }
                  } catch (e) {
                    console.warn('Could not refresh user data:', e.message);
                  }


        let resolvedLineId = activeLineId;
        try {
          const [ids, names] = await Promise.all([getLineIds(), getLineNames()]);
          if (cancelled) return;
          const chips = buildLineChips(ids, names);
          setLines(chips);

          if (resolvedLineId && !chips.some((c) => c.id === resolvedLineId)) { 
            resolvedLineId = null;
            setActiveLineId(null);
            setIssues([]);
            setPage(1);
            setHasMore(false);
            lastFetchedKeyRef.current = null;
            issuesCache = { lineId: null, query: '', data: [], page: 1, hasMore: false };
            await saveSelectedLineId(null);
          } else if (!resolvedLineId) {
            
            const savedLineId = await getSelectedLineId();
            if (savedLineId && chips.some((c) => c.id === savedLineId)) {
              resolvedLineId = savedLineId;
              setActiveLineId(savedLineId);
            }



          }
        } catch (e) {
          console.warn('Failed to load line filters:', e.message);
          setLines([]);
        }

        if (cancelled || !resolvedLineId) return;

       
        loadPage(1, { append: false, lineId: resolvedLineId, search: debouncedQuery });
      })();
      return () => { cancelled = true; };
     }, [permsLoading, canListIssues, activeLineId, debouncedQuery, loadPage])
  );

   useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);
 
  useEffect(() => {
    if (permsLoading) return;
    if (!canListIssues || !activeLineId) {
      setLoading(false);
      return;
    }
    const key = cacheKey(activeLineId, debouncedQuery);
    if (lastFetchedKeyRef.current === key) return;

    loadPage(1, { append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, permsLoading, canListIssues, activeLineId]);
 
  const handleLineSelect = useCallback((id) => {
    if (id === activeLineId) return;
    setActiveLineId(id);
    saveSelectedLineId(id);
    lastFetchedKeyRef.current = cacheKey(id, debouncedQuery);
    loadPage(1, { append: false, lineId: id });
  }, [activeLineId, debouncedQuery, loadPage]);

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

          <Text style={[styles.title,textStyle]}>TLS Issue Tracker</Text>
        </SafeAreaView>

        {canListIssues && (
          <>
            <View style={styles.searchOuter}>
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={ms(16)} color={AppColors.textTertiary} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search"
                  placeholderTextColor={AppColors.textTertiary}
                  style={styles.searchInput}
                  returnKeyType="search"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.chipsRowOuter}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {lines.map((line) => {
                  const active = activeLineId === line.id;
                  return (
                    <Pressable
                      key={line.id}
                      onPress={() => handleLineSelect(line.id)}
                      style={({ pressed }) => [styles.lineChip, active && styles.lineChipActive, pressed && { opacity: 0.85 }]}
                    >
                      {active && (
                        <Ionicons name="checkmark" size={ms(12)} color={AppColors.onPrimary} style={{ marginRight: ms(4) }} />
                      )}
                      <Text style={[styles.lineChipText, active && styles.lineChipTextActive]} numberOfLines={1}>
                        {line.name}
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
        ) : !activeLineId ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="git-network-outline" size={ms(28)} color={AppColors.textTertiary} />
            <Text style={styles.emptyText}>Select a line above to view its issues.</Text>
          </View>
        ) : loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={AppColors.primary} />
          </View>
        ) : issues.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="file-tray-outline" size={ms(28)} color={AppColors.textTertiary} />
            <Text style={styles.emptyText}>{query ? 'No issues match your search.' : 'No issues found for this line.'}</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onScroll={handleScrollEnd}
            scrollEventThrottle={200}
          >
            {issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                styles={styles}
                ms={ms}
                onPress={() => {
                   navigation.navigate('DefectInformation', { issue, activeLineId,user })}}
              />
            ))}
            {loadingMore && (
              <View style={{ paddingVertical: mvs(16) }}>
                <ActivityIndicator color={AppColors.primary} />
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
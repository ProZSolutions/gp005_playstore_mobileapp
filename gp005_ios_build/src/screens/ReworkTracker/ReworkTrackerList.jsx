import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StatusBar,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScannerScreen from '../../components/ScannerScreen';
import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import reworkService from '../../api/services/reworkService';
import { useOrientation } from '../../hooks/useOrientation';

import {
  getShiftData,
  getLineIds,
  getLineNames,
  getSelectedLineId,
  saveSelectedLineId,
  PAGE_SIZE,
} from '../../api/storage/authStorage';
import { showAlert } from '../../utils/AlertService';
import { SkeletonList } from '../../components/SkeletonListItem';
import createStyles from '../../screens/styles/TLSAuditStyles';
import btnStyles from '../../components/styles/ActionButtonStyles';
import { usePermissions, GROUP, ACTION } from '../../context/PermissionsContext';
import { STATUS_STYLES, lineAbbrev } from '../../utils/tlsIssueData';
import {ActionButton} from '../../components/ActionButton'; 
import { useBackToDashboard } from '../../hooks/useBackToDashboard';

const TEAL = AppColors.primary;
const SEARCH_DEBOUNCE_MS = 400;
const toArray = (v) => (Array.isArray(v) ? v : []);

const DEFAULT_STATUS_STYLE = { bg: '#EEEEEE', dot: '#9E9E9E', text: '#616161', border: '#E0E0E0' };
const getStatusStyle = (status) => STATUS_STYLES?.[status] ?? DEFAULT_STATUS_STYLE;
const normalizeCode = (v) => (v === null || v === undefined ? '' : String(v).trim().toUpperCase());

 
function StatusPill({ status, status_name, styles ,type}) {
   const s = getStatusStyle(status);
  return (
    <View style={[styles.statusPill, { backgroundColor: s.bg, borderColor: s.border }]}>
       {type === 'qr' ? (
        <Ionicons
          name="qr-code-outline"
          size={14}
          color={s.dot}
          style={{ marginRight: 6 }}
        />
      ) : (
        <View
          style={[
            styles.statusDot,
            { backgroundColor: s.dot },
          ]}
        />
      )}
      <Text style={[styles.statusText, { color: s.text }]}>{status_name}</Text>
    </View>
  );
}
function OrderCard({ order, selected, onPress, styles,isLandscape,isLargeScreen }) {
  const { moderateScale: ms } = useResponsive();

   const pickStyle = (largePortrait, largeLandscape, mobilePortrait, mobileLandscape) =>
    isLargeScreen
      ? (isLandscape ? largeLandscape : largePortrait)
      : (isLandscape ? mobileLandscape : mobilePortrait);
  const tlsCodeStyle = pickStyle(styles.tlsCodeLarge,styles.tlsCodeLarge, styles.tlsCode,styles.tlsCode);
   const tlsValueStyle = pickStyle(styles.fieldValueLarge,styles.fieldValueLarge, styles.fieldValue,styles.fieldValue);
   const tlsdateStyle = pickStyle(styles.createdOnTextLarge,styles.createdOnTextLarge, styles.createdOnText,styles.createdOnText);



  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(10,158,150,0.06)' }}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && { opacity: 0.96 },
      ]}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
    >
      <View style={styles.cardTopRow}>
        <View style={{flexDirection:'row',paddingLeft:ms(10)}}>
        <Text style={[styles.tlsCode,tlsCodeStyle]}>{order.tlsCode}</Text>
        <StatusPill status={order.status} status_name={order.status_name} styles={styles} type="status"/>
        </View>
        <View
          style={[
            styles.radioOuter,
            selected && styles.radioOuterSelected,
            styles.cardCheckbox,
          ]}
        >
          {selected && <View style={styles.radioInnerDot} />}
        </View>
      </View>
           {order.extraLabel ? (  
                          <View style={styles.defectChip}>
                            <Ionicons name="warning-outline" size={ms(15)} color={AppColors.error} />
                            <Text style={styles.defectChipText} numberOfLines={1}>{order.extraLabel}</Text>
                          </View>
            ) : null}
  <View style={{marginBottom:10}}>
                 <StatusPill status={'success'} status_name={order.qr_code} styles={styles} type="qr"/>
                </View>
      <View style={styles.cardGridRow}>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>COLOUR</Text>
          <View style={styles.fieldValueRow}>
            <View style={[styles.colourDot, { backgroundColor: order.colourHex }]} />
            <Text style={[styles.fieldValue,tlsValueStyle, { marginLeft: ms(5) }]} numberOfLines={1}>{order.colour}</Text>
          </View>
        </View>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>BUYER</Text>
          <View style={styles.fieldValueRow}>
            <Ionicons name="people-outline" size={ms(13)} color={AppColors.primary} />
            <Text  style={[styles.fieldValue,tlsValueStyle, { marginLeft: ms(5) }]} numberOfLines={1}>{order.buyer}</Text>
          </View>
        </View>
      </View>
      <View>
    
           

      </View>
      <View style={styles.cardGridRow}>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>STYLE</Text>
          <View style={styles.fieldValueRow}>
            <Ionicons name="shirt-outline" size={ms(13)} color={AppColors.primary} />
            <Text  style={[styles.fieldValue,tlsValueStyle, { marginLeft: ms(5) }]} numberOfLines={1}>{order.style}</Text>
          </View>
        </View>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>STYLE NO.</Text>
          <View style={styles.fieldValueRow}>
            <Ionicons name="pricetag-outline" size={ms(13)} color={AppColors.primary} />
            <Text style={[styles.fieldValue,tlsValueStyle, { marginLeft: ms(5) }]} numberOfLines={1}>{order.styleNo}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardFooterRow}>
        <Ionicons name="time-outline" size={ms(12)} color={AppColors.textTertiary} />
        <Text  style={[styles.createdOnText,tlsdateStyle]}>Created on {order.formatDate}</Text>

      </View>
    </Pressable>
  );
}

export default function RejectionTrackerList({ navigation, route }) {
    const { isLandscape } = useOrientation();

  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs, isLargeScreen } = useResponsive();
  const styles = createStyles(ms, mvs, fs, isLargeScreen);
  const insets = useSafeAreaInsets();
  const [scannerVisible, setScannerVisible] = useState(false);
  const [checkingDevice, setCheckingDevice] = useState(false);
 const pickStyle = (largePortrait, largeLandscape, mobilePortrait, mobileLandscape) =>
    isLargeScreen
      ? (isLandscape ? largeLandscape : largePortrait)
      : (isLandscape ? mobileLandscape : mobilePortrait);

 const tlsTitleStyle = pickStyle(styles.titlelarge,
    styles.titlelandscape,
    null,
    styles.title, 
  ); 
const tlsSearchStyle = pickStyle(styles.searchOuterlarge,
    styles.searchOuterlarge,
    styles.searchOuter,
    styles.searchOuter
  );
const tlsSearchBarStyle = pickStyle(styles.searchBarLarge,
    styles.searchBarLarge,
    styles.searchBar,
    styles.searchBar
  );
  const tlsSearchBarInput = pickStyle(styles.searchInputLarge,
    styles.searchInputLarge,
    styles.searchInput,
    styles.searchInput,
  );
 const tlsSearchChio= pickStyle(styles.lineChipTextLarge,
    styles.lineChipTextLarge,
    styles.lineChipText,
    styles.lineChipText
  );

  const { can } = usePermissions();
  const canListTlsAudit = can(GROUP.REWORKTRACKER, ACTION.LIST); 
  const canCreateRework = can(GROUP.REWORKTRACKER, ACTION.CREATE);

  const {
    user,
    lineIds: routeLineIds = [],
    lineNames: routeLineNames = [],
    zoneIds = [],
    zoneNames = [],
    order: incomingOrder,
    zone: incomingZone,
    line: incomingLine,
    autoScan = false,
  } = route?.params ?? {};

  const [lineIds, setLineIds] = useState(routeLineIds);
  const [lineNames, setLineNames] = useState(routeLineNames);
  const goBack = useBackToDashboard(navigation);

  useEffect(() => {
    const routeIsComplete =
      routeLineIds.length > 0 &&
      routeLineNames.length > 0 &&
      routeLineIds.length === routeLineNames.length;

    if (routeIsComplete) return;

    let cancelled = false;
    (async () => {
      try {
        const [storedIds, storedNames] = await Promise.all([
          getLineIds(),
          getLineNames(),
        ]);
        if (cancelled) return;

        const storedIsComplete =
          storedIds.length > 0 &&
          storedNames.length > 0 &&
          storedIds.length === storedNames.length;

        if (storedIsComplete) {
          setLineIds(storedIds);
          setLineNames(storedNames);
        }
      } catch (e) {
        console.warn('Falling back to stored line data failed:', e.message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const fetchOrders = useCallback(async () => {
  if (!activeLineId || !canListTlsAudit) {
    setAllOrders([]);
    setLoading(false);
    setHasMore(false); 
    return;
  }

  const requestId = ++requestIdRef.current;
  setLoading(true);
  try {
    const result = await reworkService.getReworkList({
      lineId: activeLineId,
      shiftId,
      search: debouncedQuery,
      page: 1,
    });
    if (requestId !== requestIdRef.current) return;

    if (result.success) {
      setAllOrders(result.data);
      setPage(result.page);
      setHasMore(result.hasMore);
    } else {
      setAllOrders([]);
      setHasMore(false);
    }
  } catch (e) {
    console.warn('reworkService.getReworkList:', e.message);
  } finally {
    if (requestId === requestIdRef.current) setLoading(false);
  }
}, [activeLineId, canListTlsAudit, debouncedQuery, shiftId]);
  const lines = useMemo(
    () =>
      toArray(lineIds)
        .map((id, i) => ({ id, name: toArray(lineNames)[i] ?? id }))
        .sort((a, b) => {
          const numA = Number(a.id);
          const numB = Number(b.id);
          if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
            return numA - numB;
          }
          return String(a.id).localeCompare(String(b.id));
        }),
    [lineIds, lineNames],
  );

  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(false);         
  const [loadingMore, setLoadingMore] = useState(false); 
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [activeLineId, setActiveLineId] = useState(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

   const [shiftId, setShiftId] = useState(null);

  const pendingOrderRef = useRef(null);
  const requestIdRef = useRef(0);  
  const handleLineChange = useCallback((id) => {
    setActiveLineId(id);
    setSelectedOrderId(null);
    saveSelectedLineId(id);
  }, []);
 
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const shift = await getShiftData();
        if (!cancelled) setShiftId(shift?.shift_id ?? null);
      } catch (e) {
        console.warn('TLSAuditScreen: failed to load shift data', e.message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch page 1 whenever the active line or the (debounced) search term
  // changes. This is the "filter changed -> page=1" reset — same shape as
  // the regular Rework TLSAuditScreen's equivalent effect.
  //
  // ASSUMPTION: team_id has no confirmed source in this flow yet — passed
  // through as undefined for now (same open item noted previously on
  // ReworkDetailsScreen).
  useEffect(() => {
    if (!activeLineId) {
      setAllOrders([]);
      setLoading(false);
      setHasMore(false);
      setPage(1);
      return;
    }

    // Guard: don't hit the API if the user lacks list permission.
    if (!canListTlsAudit) {
      setAllOrders([]);
      setLoading(false);
      setHasMore(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const result = await reworkService.getReworkList({
          lineId: activeLineId,
          shiftId,
          search: debouncedQuery,
          page: 1,
        });
        if (cancelled || requestId !== requestIdRef.current) return;

        if (result.success) {
          setAllOrders(result.data);
          setPage(result.page);
          setHasMore(result.hasMore);
        } else {
          setAllOrders([]);
          setHasMore(false);
        }
      } catch (e) {
        if (!cancelled) console.warn('reworkService.getReworkList:', e.message);
      } finally {
        if (!cancelled && requestId === requestIdRef.current) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [activeLineId, canListTlsAudit, debouncedQuery, shiftId]); 
  const handleLoadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore || !activeLineId || !canListTlsAudit) return;

    const nextPage = page + 1;
    const requestId = requestIdRef.current;
    setLoadingMore(true);
    try {
      const result = await reworkService.getReworkList({
        lineId: activeLineId,
        shiftId,
        search: debouncedQuery,
        page: nextPage,
      });
       if (requestId !== requestIdRef.current) return;

      if (result.success) {
        setAllOrders((prev) => [...prev, ...result.data]);
        setPage(result.page);
        setHasMore(result.hasMore);
      }
    } catch (e) {
      console.warn('reworkService.getReworkList (loadMore):', e.message);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, page, activeLineId, debouncedQuery, shiftId, canListTlsAudit]);

  const visibleOrders = allOrders;

  const selectedOrder = allOrders.find((o) => o.id === selectedOrderId) ?? null;

  const startScanFor = useCallback((orderForAudit) => {
    pendingOrderRef.current = orderForAudit;
    setScannerVisible(true);
  }, []);

  const handleStartAudit = () => {
    if (!selectedOrder) return;
    startScanFor(selectedOrder);
  }; 
  const extractScannedTlsId = (data) => {
    if (data === null || data === undefined) return null;
    if (typeof data === 'string') return data.trim();
    if (typeof data === 'object') {
      return data.tls_id ?? data.tlsId ?? data.id ?? null;
    }
    return null;
  };
 
  const handleScanSuccess = useCallback(async (data) => {
    const orderForAudit = pendingOrderRef.current;
    if (!orderForAudit) {
      setScannerVisible(false);
      return;
    }

    const scannedTlsId = extractScannedTlsId(data);

    console.log("scanned data "+scannedTlsId);

    if (!scannedTlsId) {
      setScannerVisible(false);
      showAlert('error', 'Scan Failed', 'Could not read a Qone device ID from that code. Please try again.');
      return;
    }

    setCheckingDevice(true);
    try {
      const scannedCode = normalizeCode(scannedTlsId);
      const expectedTlsId = normalizeCode(orderForAudit.raw.qr_code);
      console.log("orderforaudit "+JSON.stringify(orderForAudit) +" expected id "+expectedTlsId);
      const isMatch = 
        (expectedTlsId && scannedCode === expectedTlsId) ;
 
      if (!isMatch) {
        setScannerVisible(false);
        pendingOrderRef.current = null;
        showAlert(
          'error',
          'Device Mismatch',
          `Scanned device (${scannedTlsId}) does not match the Rework device mapped to this record.`,
        );
        return;
      }

      setScannerVisible(false);
      pendingOrderRef.current = null;

      navigation.navigate('ReworkTrackerDetailsScreen', {
        user,
        issue: orderForAudit,
        scannedTlsId,
      });
    } catch (e) {
      setScannerVisible(false);
      showAlert('error', 'Device Check Failed', e.message ?? 'Something went wrong while checking the device.');
    } finally {
      setCheckingDevice(false);
    }
  }, [navigation, user]);

  const closeScanner = useCallback(() => {
    setScannerVisible(false);
    pendingOrderRef.current = null;
  }, []);

  const autoScanTriggered = useRef(false);

  useEffect(() => {
    if (autoScan && incomingLine && !activeLineId) {
      setActiveLineId(incomingLine);
    }
  }, [autoScan, incomingLine, activeLineId]);

  // Restore the previously selected line (persisted in authStorage) if this
  // screen doesn't already have one active — mirrors the regular Rework
  // TLSAuditScreen. Skipped whenever an explicit incomingLine was passed
  // in, since the effect above already owns that case.
  useEffect(() => {
    if (activeLineId || lines.length === 0 || incomingLine) return;

    let cancelled = false;
    (async () => {
      try {
        const savedLineId = await getSelectedLineId();
        if (!cancelled && savedLineId && lines.some((l) => l.id === savedLineId)) {
          setActiveLineId(savedLineId);
        }
      } catch (e) {
        console.warn('TLSAuditScreen: failed to restore saved lineId', e.message);
      }
    })();
    return () => { cancelled = true; };
  }, [lines, activeLineId, incomingLine]);

  useEffect(() => {
    if (autoScan && !autoScanTriggered.current) {
      const orderForAudit = incomingOrder ?? selectedOrder;
      if (orderForAudit) {
        autoScanTriggered.current = true;
        startScanFor(orderForAudit);
      }
    }
  }, [autoScan, incomingOrder, selectedOrder, startScanFor]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{ paddingVertical: mvs(16) }}>
        <ActivityIndicator color={AppColors.primary} />
      </View>
    );
  };

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

          <View style={styles.headerTopRow}>
            <View>
              <Text style={[styles.title,tlsTitleStyle]}>Rework Tracker</Text>
             </View>
            
          </View>
        </SafeAreaView>

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

        {lines.length > 0 && (
          <View style={styles.chipsRowOuter}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {lines.map((line) => {
                const active = activeLineId === line.id;
                return (
                  <Pressable
                    key={line.id}
                    onPress={() => handleLineChange(line.id)}
                    style={({ pressed }) => [
                      styles.lineChip,
                      active && styles.lineChipActive,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    {active && (
                      <Ionicons
                        name="checkmark"
                        size={ms(12)}
                        color={AppColors.onPrimary}
                        style={{ marginRight: ms(4) }}
                      />
                    )}
                    <Text
                      style={[styles.lineChipText,tlsSearchChio, active && styles.lineChipTextActive]}
                      numberOfLines={1}
                    >
                      {line.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.body}>
        {!canListTlsAudit ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="lock-closed-outline" size={ms(28)} color={AppColors.textTertiary} />
            <Text style={styles.emptyText}>You do not have permission to view TLS audit orders.</Text>
          </View>
        ) : loading ? (
          <View style={{ paddingHorizontal: ms(16), paddingTop: mvs(16) }}>
            <SkeletonList count={3} />
          </View>
        ) : !activeLineId ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="list-outline" size={ms(28)} color={AppColors.textTertiary} />
            <Text style={styles.emptyText}>Select a line above to view orders.</Text>
          </View>
        ) : visibleOrders.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="file-tray-outline" size={ms(28)} color={AppColors.textTertiary} />
            <Text style={styles.emptyText}>
              {query ? 'No orders match your search.' : 'No orders found for this line.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={visibleOrders}
            keyExtractor={(order) => String(order.id)}
            renderItem={({ item: order }) => (
              <OrderCard
                order={order}
                selected={selectedOrderId === order.id}
                onPress={() => setSelectedOrderId(order.id)}
                styles={styles}
                isLandscape={isLandscape}
                isLargeScreen={isLargeScreen}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.4}
            ListFooterComponent={renderFooter}
          />
        )}
      </View> 
      {canListTlsAudit && canCreateRework && (
        <View style={styles.footer}>
          <ActionButton
            label="Scan Rework QR"
            disabled={!selectedOrder || checkingDevice}
            loading={checkingDevice}
            onPress={handleStartAudit}
          />
        </View>
      )}

      <Modal
        visible={scannerVisible}
        animationType="slide"
        onRequestClose={closeScanner}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <ScannerScreen onScanSuccess={handleScanSuccess} onClose={closeScanner} />
      </Modal>
    </View>
  );
}
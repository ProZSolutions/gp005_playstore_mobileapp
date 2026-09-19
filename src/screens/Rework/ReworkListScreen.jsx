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
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScannerScreen from '../../components/ScannerScreen';
import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import reworkService from '../../api/services/reworkService';
import { useBackToDashboard } from '../../hooks/useBackToDashboard';
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
import { ActionButton } from '../../components/ActionButton';

const TEAL = AppColors.primary;
 
const SEARCH_DEBOUNCE_MS = 400;
const toArray = (v) => (Array.isArray(v) ? v : []); 

{/** function ActionButton({ label, onPress, disabled, loading }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      android_ripple={disabled ? undefined : { color: 'rgba(255,255,255,0.18)' }}
      style={({ pressed }) => [
        btnStyles.btn,
        btnStyles.primary,
        disabled && btnStyles.disabled,
        pressed && !disabled && btnStyles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {loading ? (
        <ActivityIndicator color={AppColors.onPrimary} />
      ) : (
        <Text
          style={[btnStyles.label, disabled && btnStyles.labelDisabled]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
*/}
function OrderCard({ order, selected, onPress, styles,isLandscape,isLargeScreen  }) {
  const { moderateScale: ms } = useResponsive();
   const pickStyle = (largePortrait, largeLandscape, mobilePortrait, mobileLandscape) =>
    isLargeScreen
      ? (isLandscape ? largeLandscape : largePortrait)
      : (isLandscape ? mobileLandscape : mobilePortrait);
   const tlsCodeStyle = pickStyle(styles.tlsCodeLarge,styles.tlsCodeLarge, null,styles.tlsCode,);
   const tlsValueStyle = pickStyle(styles.fieldValueLarge,styles.fieldValueLarge, null,styles.fieldValue,);
   const tlsdateStyle = pickStyle(styles.createdOnTextLarge,styles.createdOnTextLarge, null,styles.createdOnText,);

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
        <Text style={[styles.tlsCode,tlsCodeStyle]}>{order.tlsCode}</Text>
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
        <Text style={[styles.createdOnText,tlsdateStyle]}>Created on {order.createdOn}</Text>
      </View>
    </Pressable>
  );
}

export default function ReworkList({ navigation, route }) {

  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs, isLargeScreen } = useResponsive();
  const { isLandscape } = useOrientation();
  const styles = createStyles(ms, mvs, fs, isLargeScreen);
  const insets = useSafeAreaInsets();
  const [scannerVisible, setScannerVisible] = useState(false);
  const [checkingDevice, setCheckingDevice] = useState(false);
  const goBack = useBackToDashboard(navigation);

  const { can } = usePermissions();
  const canListTlsAudit = can(GROUP.REWORK, ACTION.LIST);
  // Gates the "Scan Rework QR" footer below — separate from list visibility.
  // A user can be allowed to *view* rework orders without being allowed to
  // *create* a rework entry for one.
  const canCreateRework = can(GROUP.REWORK, ACTION.CREATE);
const pickStyle = (largePortrait, largeLandscape, mobilePortrait, mobileLandscape) =>   isLargeScreen ? (isLandscape ? largeLandscape : largePortrait): 
(isLandscape ? mobileLandscape : mobilePortrait);
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


          const tlsTitleStyle = pickStyle(styles.titlelarge,
            styles.titlelandscape,
            null,
            styles.title, 
          ); 
        const tlsSearchStyle = pickStyle(styles.searchOuterlarge,
            styles.searchOuterlarge,
            null,
            styles.searchOuter,
          );
        const tlsSearchBarStyle = pickStyle(styles.searchBarLarge,
            styles.searchBarLarge,
            null,
            styles.searchBar,
          );
          const tlsSearchBarInput = pickStyle(styles.searchInputLarge,
            styles.searchInputLarge,
            null,
            styles.searchInput,
          );
        const tlsSearchChio= pickStyle(styles.lineChipTextLarge,
            styles.lineChipTextLarge,
            null,
            styles.lineChipText,
          );

  const [lineIds, setLineIds] = useState(routeLineIds);
  const [lineNames, setLineNames] = useState(routeLineNames);

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
  const [loading, setLoading] = useState(false);      // first-page / filter-change load
  const [loadingMore, setLoadingMore] = useState(false); // subsequent-page load
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [activeLineId, setActiveLineId] = useState(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const pendingOrderRef = useRef(null);
  const requestIdRef = useRef(0); // guards against out-of-order responses

  // Persist the chip selection (mirrors TLSIssueTrackerScreen.handleLineSelect)
  // so returning to this screen — or opening it fresh elsewhere — can
  // restore the line the user was last working on instead of defaulting to
  // "no line selected".
  const handleLineChange = useCallback((id) => {
    setActiveLineId(id);
    setSelectedOrderId(null);
    saveSelectedLineId(id);
  }, []);

  // Debounce free-text search so we don't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  // Reusable page-1 fetch — called from the filter-change effect below AND
  // from the focus listener so coming back to this screen (e.g. after
  // creating a rework entry on ReworkDetailsScreen) always shows fresh data.
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
      const result = await reworkService.getOrders({
        lineId: activeLineId,
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
      console.warn('reworkService.getOrders:', e.message);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [activeLineId, debouncedQuery, canListTlsAudit]);

  // Fetch page 1 whenever the active line or the (debounced) search term
  // changes. This is the "filter changed -> page=1" reset.
  useEffect(() => {
    if (!activeLineId) {
      setAllOrders([]);
      setLoading(false);
      setHasMore(false);
      setPage(1);
      return;
    }

    // Guard: don't hit the API if the user lacks list permission for TLS Audit.
    if (!canListTlsAudit) {
      setAllOrders([]);
      setLoading(false);
      setHasMore(false);
      return;
    }

    fetchOrders();
  }, [activeLineId, debouncedQuery, canListTlsAudit, fetchOrders]);

  // Re-fetch page 1 every time this screen regains focus — e.g. navigating
  // back here after creating a rework entry on ReworkDetailsScreen. React
  // Navigation re-focuses the existing screen instance instead of
  // remounting it, so none of the deps above change on their own; this is
  // what actually makes the list refresh on return.
  useFocusEffect(
    useCallback(() => {
      if (activeLineId && canListTlsAudit) {
        fetchOrders();
      }
    }, [activeLineId, canListTlsAudit, fetchOrders])
  );

  // Send the Android hardware/system back button to Dashboard instead of
  // letting it pop to whatever screen pushed this one. Only attached while
  // this screen is focused, and removed on blur/unmount so it doesn't leak
  // into other screens' back handling.
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (scannerVisible) {
          closeScanner();
          return true;
        }
        navigation.navigate('Dashboard');
        return true; // prevent default pop behavior
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation, scannerVisible])
  );

  // Called when the FlatList scrolls near the bottom — loads page + 1 and
  // appends the results to what's already on screen.
  const handleLoadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore || !activeLineId || !canListTlsAudit) return;

    const nextPage = page + 1;
    const requestId = requestIdRef.current;
    setLoadingMore(true);
    try {
      const result = await reworkService.getOrders({
        lineId: activeLineId,
        search: debouncedQuery,
        page: nextPage,
      });
      // Bail out if a filter change started a new page-1 request meanwhile.
      if (requestId !== requestIdRef.current) return;

      if (result.success) {
        setAllOrders((prev) => [...prev, ...result.data]);
        setPage(result.page);
        setHasMore(result.hasMore);
      }
    } catch (e) {
      console.warn('reworkService.getOrders (loadMore):', e.message);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, page, activeLineId, debouncedQuery, canListTlsAudit]);
 
  const visibleOrders = allOrders;

  const selectedOrder = allOrders.find((o) => o.id === selectedOrderId) ?? null;
  const buildOperator = useCallback(async (orderForAudit) => {
    const activeLine = lines.find((l) => l.id === activeLineId);
    let shiftData = null;
    try {
      shiftData = await getShiftData();
    } catch (e) {
      console.warn('getShiftData failed:', e.message);
    }

    const shiftLabel = Array.isArray(shiftData?.shift_names)
      ? shiftData.shift_names.join(', ')
      : (shiftData?.shift_names ?? '—');

    const zoneLabel = Array.isArray(zoneNames) ? zoneNames.join(', ') : (zoneNames ?? '—');

    return {
      name: user?.employee_name ?? user?.name ?? '—',
      employeeId: user?.employee_code ?? '—',
      lineNo: activeLine?.name ?? lineNames?.[0] ?? '—',
      slot: shiftLabel,
      operation: orderForAudit?.operation_name ?? '—',
      machineType: orderForAudit?.machine_type_name ?? '—',
      zone: zoneLabel,
    };
  }, [user, lines, activeLineId, lineNames, zoneNames]);

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

    if (!scannedTlsId) {
      setScannerVisible(false);
      showAlert('error', 'Scan Failed', 'Could not read a Qone device ID from that code. Please try again.');
      return;
    }

    setCheckingDevice(true);
    setScannerVisible(false);

    console.log("scanned result "+scannedTlsId);

    try {
       const checkResult = await reworkService.checkTlsDevice({
        qr_code: scannedTlsId,
        type: 'rework',
      });
      console.log("check scan result "+JSON.stringify(checkResult));
       if (!checkResult?.success) {
        showAlert(
          'error',
          'Device Validation Failed',
          checkResult?.message ?? 'This device could not be verified. Please try again.'
        );
        return;
      }

      // --- Step 3: success branch -> build context, then navigate -------
      pendingOrderRef.current = null;

      const operator = await buildOperator(orderForAudit);

      navigation.navigate('ReworkDetailsScreen', {
        user,
        order: orderForAudit,
        zone: incomingZone ?? zoneNames,
        line: incomingLine ?? activeLineId ?? lineIds,
        operator,
        scannedTlsId,
      });
    } catch (e) {
      // Network/unexpected error -> treat the same as a failed check.
      showAlert('error', 'Device Check Failed', e?.message ?? 'Something went wrong while checking the device.');
    } finally {
      setCheckingDevice(false);
    }
  }, [buildOperator, navigation, user, zoneNames, lineIds, incomingZone, incomingLine, activeLineId]);


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
              <Text style={[styles.title,tlsTitleStyle]}>Rework</Text>
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
                 isLandscape
                isLargeScreen
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
          {/*<ActionButton
            label="Scan Rework QR"
            disabled={!selectedOrder || checkingDevice}
            loading={checkingDevice}
            onPress={handleStartAudit}
          /> */}

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
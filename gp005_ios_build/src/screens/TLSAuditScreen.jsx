import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StatusBar,
  Modal,
  Platform,  
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScannerScreen from '../components/ScannerScreen';
import { AppColors } from '../theme/theme';
import { useResponsive } from '../utils/responsive';
import { useOrientation } from '../hooks/useOrientation';

import { getLineMappingOrders ,getLineMappingOperation } from '../api/services/tlsService';
import {
  getShiftData,
  getUser,
} from '../api/storage/authStorage';
import { useLineSelection, toArray } from '../hooks/useLineSelection';
import { showAlert } from '../utils/AlertService';
import { SkeletonList } from '../components/SkeletonListItem';
import createStyles from './styles/TLSAuditStyles';
import btnStyles from '../components/styles/ActionButtonStyles';
import { usePermissions, GROUP, ACTION } from '../context/PermissionsContext';
import {ActionButton} from '../components/ActionButton';
const TEAL = AppColors.primary;
const SEARCH_DEBOUNCE_MS = 350;
import { useBackToDashboard } from '../hooks/useBackToDashboard';

const normalizeCode = (v) => (v === null || v === undefined ? '' : String(v).trim().toUpperCase());

let ordersCache = { lineId: null, query: '', page: 1, data: [] };
const ordersCacheKey = (lineId, query, page) => `${lineId ?? ''}|${query ?? ''}|${page ?? 1}`;

// Same line-chip builder used by TLSIssueTrackerScreen, so both screens sort
// and label line chips identically (numeric-aware sort, falls back to name).
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

function OrderCard({ order, selected, onPress, styles,isLandscape,isLargeScreen }) {
  const { moderateScale: ms } = useResponsive();
 const pickStyle = (largePortrait, largeLandscape, mobilePortrait, mobileLandscape) =>
    isLargeScreen
      ? (isLandscape ? largeLandscape : largePortrait)
      : (isLandscape ? mobileLandscape : mobilePortrait);
  const tlsCodeStyle = pickStyle(styles.tlsCodeLarge,styles.tlsCodeLarge, styles.tlsCode,styles.tlsCode,);
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
        <Text style={[styles.tlsCode,tlsCodeStyle]}>{order.orderrCode}</Text>
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
            <Text style={[styles.fieldValue,tlsValueStyle, { marginLeft: ms(5) }]} numberOfLines={1}>{order.buyer}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardGridRow}>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>STYLE</Text>
          <View style={styles.fieldValueRow}>
            <Ionicons name="shirt-outline" size={ms(13)} color={AppColors.primary} />
            <Text style={[styles.fieldValue, tlsValueStyle,{ marginLeft: ms(5) }]} numberOfLines={1}>{order.style}</Text>
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

export default function TLSAuditScreen({ navigation, route }) {

  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs, isLargeScreen } = useResponsive();
  const { isLandscape } = useOrientation();

  const styles = createStyles(ms, mvs, fs, isLargeScreen);
  const insets = useSafeAreaInsets();
  const [scannerVisible, setScannerVisible] = useState(false);
  const [checkingDevice, setCheckingDevice] = useState(false);

  const { can } = usePermissions();
  const canListTlsAudit = can(GROUP.TLSAUDIT, ACTION.LIST);
  const goBack = useBackToDashboard(navigation);
  

  const {
    user: routeUser,
    lineIds: routeLineIdsRaw = [],
    lineNames: routeLineNamesRaw = [],
    zoneIds = [],
    zoneNames = [],
    order: incomingOrder,
    zone: incomingZone,
    line: incomingLine, 
    selectedLine: incomingSelectedLine,
    autoScan = false,
  } = route?.params ?? {}; 
  const routeLineIds = toArray(routeLineIdsRaw);
  const routeLineNames = toArray(routeLineNamesRaw);

  const [user, setUser] = useState(routeUser ?? null);

  useEffect(() => {
    const routeUserIsUsable = routeUser?.employee_name || routeUser?.name;
    if (routeUserIsUsable) return;

    let cancelled = false;
    (async () => {
      try {
        const storedUser = await getUser();
        if (!cancelled && storedUser) {
          setUser(storedUser);
        }
      } catch (e) {
        console.warn('Falling back to stored user data failed:', e.message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

   
  const {
    lineIds,
    lineNames,
    activeLineId,
    handleLineChange: setLineSelection,
  } = useLineSelection({
    routeLineIds,
    routeLineNames,
    initialActiveLineId: ordersCache.lineId ?? null,
    restoreSavedSelection: !autoScan,
    persistSelection: true,
  });

  // Derive chips the same way TLSIssueTrackerScreen does, instead of relying
  // on whatever shape useLineSelection's own `lines` value happens to be in.
  const lines = useMemo(
    () => buildLineChips(lineIds, lineNames),
    [lineIds, lineNames],
  );

   
  const [allOrders, setAllOrders] = useState(() => (ordersCache.lineId ? ordersCache.data : []));
  const [loading, setLoading] = useState(() => !ordersCache.lineId);
  const [query, setQuery] = useState(() => ordersCache.query ?? '');
  const [page, setPage] = useState(() => ordersCache.page ?? 1);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [lineCounts, setLineCounts] = useState({});
  const pendingOrderRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const requestSeqRef = useRef(0);  
  const lastFetchedOrdersKeyRef = useRef(
    ordersCache.lineId ? ordersCacheKey(ordersCache.lineId, ordersCache.query, ordersCache.page) : null,
  );

  const handleLineChange = useCallback((id) => {
    setLineSelection(id);
    setSelectedOrderId(null);
    setQuery('');
    setPage(1);
    lastFetchedOrdersKeyRef.current = null; // force a fresh fetch for the newly selected line
  }, [setLineSelection]);
 
  const fetchOrders = useCallback(async (lineId, searchTerm, pageNum) => {
    if (!lineId || !canListTlsAudit) {
      setAllOrders([]);
      setLoading(false);
      return;
    }

    const seq = ++requestSeqRef.current;
    setLoading(true);
    try { 
      const { data } = await getLineMappingOrders([lineId], {
        search: searchTerm,
        page: pageNum,
      });
       if (seq === requestSeqRef.current) {
        setAllOrders(toArray(data));
        ordersCache = { lineId, query: searchTerm, page: pageNum, data: toArray(data) };
        lastFetchedOrdersKeyRef.current = ordersCacheKey(lineId, searchTerm, pageNum);
      }
    } catch (e) {
      console.warn('getLineMappingOrders:', e.message);
    } finally {
      if (seq === requestSeqRef.current) {
        setLoading(false);
      }
    }
  }, [canListTlsAudit]);
 
  useEffect(() => {
    if (!activeLineId) {
      setAllOrders([]);
      setLoading(false);
      return;
    }
    const key = ordersCacheKey(activeLineId, query, page);
    if (lastFetchedOrdersKeyRef.current === key) return;

    fetchOrders(activeLineId, query, page); 
  }, [activeLineId, page, canListTlsAudit]);

   useEffect(() => {
    if (!activeLineId) return;

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(() => {
      setPage(1);
      fetchOrders(activeLineId, query, 1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(searchDebounceRef.current);
   }, [query]);
 
  useFocusEffect(
    useCallback(() => {
      if (!activeLineId || !canListTlsAudit) return;
      lastFetchedOrdersKeyRef.current = null;
      fetchOrders(activeLineId, query, page);
     }, [activeLineId, canListTlsAudit])
  );


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
      operator_name: orderForAudit?.operator_name ?? '—',
      operator_code:orderForAudit?.operator_code ?? '—',
      machineType: orderForAudit?.machine_type_name ?? '—',
      zone: zoneLabel,
    };
  }, [user, lines, activeLineId, lineNames, zoneNames]);

  const startScanFor = useCallback((orderForAudit) => {
    pendingOrderRef.current = orderForAudit;
    setScannerVisible(true);
  }, []);

  const handleStartAuditList = () =>{
     navigation.navigate('ProcessAuditScreen', {
      user,
      order: '',
      zone: incomingZone ?? zoneNames,
      line: incomingLine ?? lineIds,
      selectedLine: activeLineId,
      operator:'',
      expectedTlsId: 'dlsdngsd',
    });
  };
  
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
 if (!activeLineId || !canListTlsAudit) {
      setAllOrders([]);
      setLoading(false);
      return;
    }
  const scannedTlsId = extractScannedTlsId(data);

  if (!scannedTlsId) {
    setScannerVisible(false);
    showAlert('error', 'Scan Failed', 'Could not read a Qone device ID from that code. Please try again.');
    return;
  }

  setCheckingDevice(true);
  try {
    const scannedCode = normalizeCode(scannedTlsId);

    const res = await getLineMappingOperation([activeLineId], {
        search: '',
        page: 1,
        orderId:orderForAudit.order_id,
        tlsId:scannedCode
      });
    const matchedOrder = toArray(res?.data)[0] ?? null;

    if (!res?.success || !matchedOrder) {
    console.log("message "+res.message);
      setScannerVisible(false);
      pendingOrderRef.current = null;
      showAlert('error', 'Failed', res?.message ?? 'Invalid Qone ID');
      return;
    }

    setScannerVisible(false);
    pendingOrderRef.current = null;

    const operator = await buildOperator(matchedOrder);
    console.log("operator result "+JSON.stringify(operator));
    const targetScreen = matchedOrder?.process_audit != 1 ? 'ProductAuditScreen' : 'ProcessAuditScreen';

    navigation.navigate(targetScreen, {
      user,
      order: matchedOrder,
      zone: incomingZone ?? zoneNames,
      line: incomingLine ?? lineIds,
      selectedLine: activeLineId,
      operator,
      expectedTlsId: normalizeCode(matchedOrder.tls_id),
    });
  } catch (e) {
    setScannerVisible(false);
    showAlert('error', 'Device Check Failed', e.message ?? 'Something went wrong while checking the device.');
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
    const targetLineId = incomingSelectedLine ?? incomingLine;
    if (autoScan && targetLineId && activeLineId !== targetLineId) {
      handleLineChange(targetLineId);
    }
  }, [autoScan, incomingLine, incomingSelectedLine, activeLineId, handleLineChange]);

  useEffect(() => {
    if (autoScan && !autoScanTriggered.current) {
      const orderForAudit = incomingOrder ?? selectedOrder;
      if (orderForAudit) {
        autoScanTriggered.current = true;
        startScanFor(orderForAudit);
      }
    }
  }, [autoScan, incomingOrder, selectedOrder, startScanFor]);

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
              <Text style={[styles.title,tlsTitleStyle]}>TLS Audit</Text>
              <Text style={styles.subtitle}>Select an order to start audit</Text>
            </View>
           {/*<View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>Total: {visibleOrders.length}</Text>
            </View> */} 
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
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {visibleOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                selected={selectedOrderId === order.id}
                onPress={() => setSelectedOrderId(order.id)}
                styles={styles}
                isLandscape={isLandscape}
                isLargeScreen={isLargeScreen}
               />
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.footer}>
        <ActionButton
          label="Start Audit"
          disabled={!selectedOrder || checkingDevice}
          loading={checkingDevice}
          onPress={handleStartAudit}//handleStartAudit
        />
      </View>
     
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
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SkeletonList } from '../../components/SkeletonListItem';
import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import { useOrientation } from '../../hooks/useOrientation';
 
import {
  getShiftData,
  PAGE_SIZE,
} from '../../api/storage/authStorage';
import { useLineSelection } from '../../hooks/useLineSelection';
import { fetchOrderSizes, mapSizesWithLimit } from '../../api/services/aqlAuditService'; 
import {normalizeOrder, resolveShiftId} from '../../api/services/checkingService';
import { usePermissions, GROUP, ACTION } from '../../context/PermissionsContext';
import createStyles from '../../screens/styles/TLSAuditStyles';
import { useBackToDashboard } from '../../hooks/useBackToDashboard';

const TEAL = AppColors.primary;
const SEARCH_DEBOUNCE_MS = 400; 

function OrderCard({ order, processing, disabled, onPress, styles ,isLandscape,isLargeScreen}) {
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
      onPress={disabled ? undefined : onPress}
      android_ripple={{ color: 'rgba(10,158,150,0.06)' }}
      style={({ pressed }) => [
        styles.card,
        pressed && !disabled && { opacity: 0.96 },
        disabled && !processing && { opacity: 0.5 },
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <View style={styles.cardTopRow}>
        <Text style={[styles.tlsCode,tlsCodeStyle]}>{order.orderNo}</Text>
        {processing ? (
          <ActivityIndicator size="small" color={AppColors.primary} />
        ) : (
          <Ionicons name="chevron-forward" size={ms(18)} color={AppColors.textTertiary} />
        )}
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
            <Text style={[styles.fieldValue,tlsValueStyle, { marginLeft: ms(5) }]} numberOfLines={1}>{order.style}</Text>
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
        <Text style={[styles.createdOnText,tlsdateStyle]}>Created On {order.createdOn}</Text>
      </View>
    </Pressable>
  );
}

export default function InputListScreen({ navigation, route }) {
  const { isLandscape } = useOrientation();

  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs, isLargeScreen } = useResponsive();
  const styles = createStyles(ms, mvs, fs, isLargeScreen);
  const insets = useSafeAreaInsets();
  const [selname,Setselname] = useState(null);
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
    settingstype,
    output
  } = route?.params ?? {};
   const goBack = useBackToDashboard(navigation);

  const { canView, can, loading: permissionsLoading } = usePermissions();
  const canViewInput = canView(GROUP.AQLAUDIT);
  const canCreateAudit = can(GROUP.AQLAUDIT, ACTION.CREATE);

  const {
    lines,
    lineIds,
    lineNames,
    activeLineId,
    setActiveLineId,
    handleLineChange: setLineSelection,
  } = useLineSelection({ routeLineIds, routeLineNames });
 
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
 
  const [navigatingOrderId, setNavigatingOrderId] = useState(null);

   useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const handleLineChange = useCallback((id) => {
    setLineSelection(id);
    setOrders([]);
    setNavigatingOrderId(null);
    setPage(1);
    setHasMore(true);
  }, [setLineSelection]);



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


  const fetchPage = useCallback(async ({ lineId, pageNum, searchTerm, append }) => {
    if (!lineId) return;
    if (append) setLoadingMore(true); else setLoading(true);
    setError(null);

    try { 
      const shiftId = await resolveShiftId();
      const payload = await fetchOrderSizes({
        shiftId,
        lineId,
        page: pageNum,
        pageSize: PAGE_SIZE,
        search: searchTerm,
      });
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

 
      const records = Array.isArray(payload?.data?.records) ? payload.data.records : [];
      const normalized = records.map(normalizeOrder);

      setOrders((prev) => (append ? [...prev, ...normalized] : normalized)); 
      setHasMore(records.length === PAGE_SIZE);
      setPage(pageNum);
    } catch (e) {
      setError(e?.message || 'Failed to load orders.');
      if (!append) setOrders([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

   useEffect(() => {
    if (!activeLineId || !canViewInput) {
      setOrders([]);
      setHasMore(false);
      return;
    }
    fetchPage({ lineId: activeLineId, pageNum: 1, searchTerm: debouncedQuery, append: false });
    }, [activeLineId, debouncedQuery, canViewInput]);

  
  useFocusEffect(
    useCallback(() => {
      if (activeLineId && canViewInput) {
        fetchPage({ lineId: activeLineId, pageNum: 1, searchTerm: debouncedQuery, append: false });
       }
    }, [activeLineId, canViewInput, debouncedQuery, fetchPage])
  );

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore || !activeLineId) return;
    fetchPage({ lineId: activeLineId, pageNum: page + 1, searchTerm: debouncedQuery, append: true });
  }, [loading, loadingMore, hasMore, activeLineId, page, debouncedQuery, fetchPage]);

  const handleRetry = useCallback(() => {
    if (!activeLineId) return;
    fetchPage({ lineId: activeLineId, pageNum: 1, searchTerm: debouncedQuery, append: false });
  }, [activeLineId, debouncedQuery, fetchPage]);

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
 
    const raw = orderForAudit?._raw ?? orderForAudit ?? {};

    return {
      name: user?.employee_name ?? user?.name ?? '—',
      employeeId: user?.employee_code ?? '—',
      lineNo: activeLine?.name ?? lineNames?.[0] ?? '—',
      slot: shiftLabel,
      operation: orderForAudit?.operation_name ?? raw.operation_name ?? '—',
      machineType: orderForAudit?.machine_type_name ?? raw.machine_type_name ?? '—',
      zone: zoneLabel,
    };
  }, [user, lines, activeLineId, lineNames, zoneNames]); 
 
  const buildOrderAndStyleInfo = useCallback((order, activeLine) => {
    const raw = order?._raw ?? order?.raw ?? order ?? {};

    const orderInfo = {
      id:order?.id,
      lineLabel: activeLine?.name ?? lineNames?.[0] ?? '—',
      orderNo: order?.orderNo ?? raw.order_no ?? '—',
      colour: order?.colour ?? raw.colour ?? raw.color ?? '—',
      outputBalance: raw.wip ?? raw.tot_prd_ord_qty ?? order?.outputBalance ?? '—', 
      sizesWithLimit: mapSizesWithLimit(raw.sizes_with_limit ?? order?.sizesWithLimit ?? []),
    };

    const styleInfo = {
     id:raw.style?.id,
      buyer: order?.buyer ?? raw.buyer ?? raw.style?.buyer ?? '—',
      styleNo: order?.styleNo ?? raw.style_no ?? raw.style?.style_no ?? '—',
      styleName: order?.style ?? raw.style_name ?? raw.style?.style_name ?? '—',
    };

    return { orderInfo, styleInfo };
  }, [lineNames]);

  const handleOrderPress = useCallback(async (order) => {
    if (navigatingOrderId) return;

    if (!canCreateAudit) {
      Alert.alert('Permission required', "You don't have permission to perform aql audit.");
      return;
    }

    setNavigatingOrderId(order.id);
    try {
      const activeLine = lines.find((l) => String(l.id) === String(activeLineId));
      const operator = await buildOperator(order);
      const { orderInfo, styleInfo } = buildOrderAndStyleInfo(order, activeLine);
       navigation.navigate('AQLOrderDetailsScreen', {
        user,
        orderInfo,
        styleInfo,
        zone: incomingZone ?? zoneNames,
        line: incomingLine ?? lineIds,
        lineId: activeLineId,
        lineNames,
        lineName: activeLine?.name ?? lineNames?.[0] ?? '—',
        operator,
        settingstype,
        output
      });
    } finally {
      setNavigatingOrderId(null);
    }
  }, [navigatingOrderId, canCreateAudit, buildOperator, buildOrderAndStyleInfo, navigation, user, zoneNames, lineIds, incomingZone, incomingLine, activeLineId, lines, lineNames]);

  const autoNavTriggered = useRef(false);

  useEffect(() => {
    if (autoScan && incomingLine && !activeLineId) {
      setActiveLineId(incomingLine);
    }
  }, [autoScan, incomingLine, activeLineId, setActiveLineId]);

  useEffect(() => {
    if (autoScan && !autoNavTriggered.current && incomingOrder) {
      autoNavTriggered.current = true; 
      const orderToOpen = incomingOrder?.tlsCode ? incomingOrder : normalizeOrder(incomingOrder);
      handleOrderPress(orderToOpen);
    }
  }, [autoScan, incomingOrder, handleOrderPress]);

  const renderBody = () => {
    if (permissionsLoading) {
      return (
        <View style={styles.emptyWrap}>
          <ActivityIndicator size="small" color={AppColors.primary} />
        </View>
      );
    }

    if (!canViewInput) {
      return (
        <View style={styles.emptyWrap}>
          <Ionicons name="lock-closed-outline" size={ms(28)} color={AppColors.textTertiary} />
          <Text style={styles.emptyText}>You don't have permission to view this module.</Text>
        </View>
      );
    }

    if (!activeLineId) {
      return (
        <View style={styles.emptyWrap}>
          <Ionicons name="list-outline" size={ms(28)} color={AppColors.textTertiary} />
          <Text style={styles.emptyText}>Select a line above to view orders.</Text>
        </View>
      );
    }

    if (loading && orders.length === 0) {
      return (
        <View style={{ paddingHorizontal: ms(16), paddingTop: mvs(16) }}>
              <SkeletonList count={3} />
       </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyWrap}>
          <Ionicons name="alert-circle-outline" size={ms(28)} color={AppColors.textTertiary} />
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable
            onPress={handleRetry}
            style={{
              marginTop: mvs(12),
              paddingHorizontal: ms(16),
              paddingVertical: mvs(8),
              backgroundColor: AppColors.primary,
              borderRadius: ms(8),
            }}
          >
            <Text style={{ color: AppColors.onPrimary, fontWeight: '600' }}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    if (orders.length === 0) {
      return (
        <View style={styles.emptyWrap}>
          <Ionicons name="file-tray-outline" size={ms(28)} color={AppColors.textTertiary} />
          <Text style={styles.emptyText}>
            {debouncedQuery ? 'No orders match your search.' : 'No orders found for this line.'}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            processing={navigatingOrderId === item.id}
            disabled={!!navigatingOrderId || !canCreateAudit}
            onPress={() => handleOrderPress(item)}
            styles={styles}
            isLandscape={isLandscape}
                isLargeScreen={isLargeScreen}       />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReachedThreshold={0.4}
        onEndReached={handleLoadMore}
        ListFooterComponent={loadingMore ? (
          <View style={{ paddingVertical: mvs(16) }}>
            <ActivityIndicator size="small" color={AppColors.primary} />
          </View>
        ) : null}
      />
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
              <Text style={[styles.title,tlsTitleStyle]}>AQL Audit List</Text>
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
        {renderBody()}
      </View>
    </View>
  );
}
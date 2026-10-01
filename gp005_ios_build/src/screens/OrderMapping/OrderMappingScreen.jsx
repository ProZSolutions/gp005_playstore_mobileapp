import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import { listOrderList } from '../../api/services/orderMappingService';
import { mapOrderRecord } from '../../utils/orderMappingHelpers';
import {formatDateTime12Hour} from '../../utils/commonFunctions';
import { useBackToDashboard } from '../../hooks/useBackToDashboard';
import { useOrientation } from '../../hooks/useOrientation';

import {
  getShiftData,
  getLineIds,
  getLineNames,
  getZoneIds,
  getZoneNames,
  PAGE_SIZE,
} from '../../api/storage/authStorage';
import { usePermissions, GROUP, ACTION } from '../../context/PermissionsContext';

import { SkeletonList } from '../../components/SkeletonListItem';
import createStyles from '../styles/TLSAuditStyles';

const TEAL = AppColors.primary;
const SEARCH_DEBOUNCE_MS = 350;

function OrderCard({ order, onPress, styles,isLandscape,isLargeScreen  }) {
  console.log("Order details "+JSON.stringify(order));
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
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.96 }]}
      accessibilityRole="button"
    >
      <View style={styles.cardTopRow}>
        <Text style={[styles.tlsCode,tlsCodeStyle]}>{order.orderNo}</Text>
        <Ionicons name="chevron-forward" size={ms(18)} color={AppColors.textTertiary} />
      </View>

      <View style={styles.cardGridRow}>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>COLOUR</Text>
          <View style={styles.fieldValueRow}>
            <View style={[styles.colourDot, { backgroundColor: order.colourHex }]} />
            <Text style={[styles.fieldValue,tlsValueStyle, { marginLeft: ms(5) }]}  numberOfLines={1}>{order.colour}</Text>
          </View>
        </View>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>BUYER</Text>
          <View style={styles.fieldValueRow}>
            <Ionicons name="people-outline" size={ms(13)} color={AppColors.primary} />
            <Text style={[styles.fieldValue,tlsValueStyle, { marginLeft: ms(5) }]} numberOfLines={1}>{order.buyer ?? 'No Name'}</Text>
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
            <Text style={[styles.fieldValue,tlsValueStyle, { marginLeft: ms(5) }]}  numberOfLines={1}>{order.styleNo}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardFooterRow}>
        <Ionicons name="time-outline" size={ms(12)} color={AppColors.textTertiary} />
        <Text style={[styles.createdOnText,tlsdateStyle]}>{order.createdOn ? `Created on ${formatDateTime12Hour(order.createdOn)}` : ' - '}</Text>
      </View>
    </Pressable>
  );
}

export default function OrderMappingScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs, isLargeScreen } = useResponsive();
  const styles = createStyles(ms, mvs, fs, isLargeScreen);
  const goBack = useBackToDashboard(navigation);
  const { isLandscape } = useOrientation();
 
  const { can } = usePermissions();
  const canListMapping = can(GROUP.LINEMAPPING, ACTION.LIST);

  const { user } = route?.params ?? {};
  const [lineIds, setLineIds] = useState([]);
  const [lineNames, setLineNames] = useState([]);
  const [zoneIds, setZoneIds] = useState([]);
  const [zoneNames, setZoneNames] = useState([]);
  const [selectionLoaded, setSelectionLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [storedLineIds, storedLineNames, storedZoneIds, storedZoneNames] = await Promise.all([
          getLineIds(),
          getLineNames(),
          getZoneIds(),
          getZoneNames(),
        ]);
        if (cancelled) return;

         

        setLineIds(storedLineIds ?? []);
        setLineNames(storedLineNames ?? []);
        setZoneIds(storedZoneIds ?? []);
        setZoneNames(storedZoneNames ?? []);
      } catch (e) {
        console.warn('Could not load line/zone selection:', e.message);
      } finally {
        if (!cancelled) setSelectionLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

const lines = useMemo(
  () => lineIds
    .map((id, i) => ({ id, name: lineNames[i] ?? id }))
    .sort((a, b) => {
      const numA = Number(a.id);
      const numB = Number(b.id);
      if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB;
      return String(a.id).localeCompare(String(b.id));
    }),
  [lineIds, lineNames],
);

  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeLineId, setActiveLineId] = useState(null);
  const [query, setQuery] = useState('');

  const fetchOrders = async (pageToFetch, { append, lineId, search } = { append: false }) => {
    // Guard: don't call the API at all if the user lacks list permission,
    // or if no line has been selected yet (nothing to fetch for).
    if (!canListMapping || lineId === null || lineId === undefined) {
      setAllOrders([]);
      setHasMore(false);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const result = await listOrderList({
        orderId: '',
        lineId,
        search,
        page: pageToFetch,
        perPage: PAGE_SIZE,
      });
      if (result.success) {
        const records = result.data?.records ?? [];
        const mapped = records.map(mapOrderRecord);

        setAllOrders((prev) => (append ? [...prev, ...mapped] : mapped));
        setHasMore(records.length === PAGE_SIZE);
        setPage(pageToFetch);
      } else if (!append) {
        setAllOrders([]);
        setHasMore(false);
      }
    } finally {
      if (append) setLoadingMore(false);
      else setLoading(false);
    }
  };

  // Line change: fetch immediately (page 1), no debounce.
  useEffect(() => {
    if (!canListMapping) return;
    setHasMore(true);
    fetchOrders(1, { append: false, lineId: activeLineId, search: query });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLineId, canListMapping]);

  // Search text change: debounce, then reset to page 1 and fetch.
  useEffect(() => {
    if (!canListMapping || activeLineId === null) return;

    const timeoutId = setTimeout(() => {
      setHasMore(true);
      fetchOrders(1, { append: false, lineId: activeLineId, search: query });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const loadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    fetchOrders(page + 1, { append: true, lineId: activeLineId, search: query });
  };

  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const distanceFromBottom = contentSize.height - (layoutMeasurement.height + contentOffset.y);
    if (distanceFromBottom < 120) {
      loadMore();
    }
  };

   const visibleOrders = allOrders;

  const handleOrderPress = async (order) => {
    const line = lines.find((l) => l.id === activeLineId) ?? null;

    let shiftId = 44;
    try {
      const shift = await getShiftData();
      shiftId = shift?.shift_id ?? null;
    } catch (e) {
      console.warn('Could not read shift data:', e.message);
    }
    navigation.navigate('OperationListScreen', {
      user,
      order,
      zoneIds,
      zoneNames,
      lineId: line?.id ?? null,
      lineName: line?.name ?? null,
      shiftId,
    });
  };

  // Back always goes to the Dashboard, regardless of navigation stack history.
  const handleBackPress = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard', params: { user } }],
    });
  };


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
            <Text style={[styles.title,tlsTitleStyle]}>Order Mapping</Text>
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
                    onPress={() => setActiveLineId(line.id)}
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
        {!selectionLoaded ? (
          <View style={{ paddingHorizontal: ms(16), paddingTop: mvs(16) }}>
            <SkeletonList count={4} showCheckbox={false} />
          </View>
        ) : !canListMapping ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="lock-closed-outline" size={ms(28)} color={AppColors.textTertiary} />
            <Text style={styles.emptyText}>
              You do not have permission to view order mappings.
            </Text>
          </View>
        ) : activeLineId === null ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="layers-outline" size={ms(28)} color={AppColors.textTertiary} />
            <Text style={styles.emptyText}>
              {lines.length > 0
                ? 'Select a line above to view its orders.'
                : 'No lines found for your check-in.'}
            </Text>
          </View>
        ) : loading ? (
          <View style={{ paddingHorizontal: ms(16), paddingTop: mvs(16) }}>
            <SkeletonList count={4} showCheckbox={false} />
          </View>
        ) : visibleOrders.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="file-tray-outline" size={ms(28)} color={AppColors.textTertiary} />
            <Text style={styles.emptyText}>
              {query ? 'No orders match your search.' : 'No orders found.'}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onScroll={handleScroll}
            scrollEventThrottle={200}
          >
            {visibleOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() => handleOrderPress(order)}
                styles={styles}
                isLandscape={isLandscape}
                isLargeScreen={isLargeScreen}
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
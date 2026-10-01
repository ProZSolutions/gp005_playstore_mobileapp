import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { showAlert } from '../../utils/AlertService';
import { useFocusEffect } from '@react-navigation/native';
import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
 import {
  getOperationStatus,
  STATUS_COLORS,
  MACHINE_TYPE_FILTERS,
  STATUS_FILTERS,
} from '../../utils/auditData';
import { mapOperationRecord } from '../../utils/orderMappingHelpers';
import FilterModal from '../../components/FilterModal';
import createStyles from '../styles/OperationListStyles';
import { listOperationList } from '../../api/services/orderMappingService';
import { SkeletonList } from '../../components/SkeletonListItem';
import { PAGE_SIZE } from '../../api/storage/authStorage';

const TEAL = AppColors.primary;

function OperationCard({ op, onPress, styles }) {
  const { moderateScale: ms } = useResponsive();
  const status = getOperationStatus(op);
  const statusColor = STATUS_COLORS[status];
  const mappedCount = op.mappings?.length ?? op.mappingCount ?? 0;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(10,158,150,0.06)' }}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.96 }]}
    >
      <View style={styles.cardTopRow}>
        <Text style={styles.opName}>{op.name}</Text>
        <Pressable style={styles.gearBtn} onPress={onPress} hitSlop={6}>
          <Ionicons name="settings-outline" size={ms(16)} color={AppColors.primary} />
        </Pressable>
      </View>

      <View style={styles.cardGridRow}>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>SEQUENCE</Text>
          <Text style={styles.fieldValue}>{op.sequence}</Text>
        </View>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>MACHINE TYPE</Text>
          <Text style={styles.fieldValue}>{op.machineType}</Text>
        </View>
      </View>

      <View style={styles.cardGridRow}>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>MAPPED DEVICES</Text>
          <Text style={styles.fieldValue}>{mappedCount}</Text>
        </View>
        <View style={styles.cardGridCell}>
          <Text style={styles.fieldLabel}>STATUS</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function OperationListScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs } = useResponsive();
  const styles = createStyles(ms, mvs, fs);

const { user, order, lineId, lineName, shiftId, zoneIds, zoneNames } = route?.params ?? {};
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({ machineType: 'All', status: 'All' });

  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);       // initial / filter-change load
  const [loadingMore, setLoadingMore] = useState(false); // pagination load
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

   const requestIdRef = useRef(0);
  const isFetchingRef = useRef(false);
useFocusEffect(
  useCallback(() => {
    setHasMore(true);
    fetchOperations({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, lineId, shiftId, filters.status]),
);
  const fetchOperations = useCallback(
    async ({ reset }) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      const currentRequestId = ++requestIdRef.current;
      const pageToFetch = reset ? 1 : page + 1;

      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const result = await listOperationList({
          orderId: order?.id ?? '',
          styleId: order?.styleId ?? '',
          lineId: lineId ?? '',
          shiftId: shiftId ?? '',
          status: filters.status,
          page: pageToFetch,
          perPage: PAGE_SIZE,
        });

         if (currentRequestId !== requestIdRef.current) return;

        if (result.success) {
          const records = result.data?.records ?? [];
          const mapped = records.map(mapOperationRecord);

          setOperations((prev) => (reset ? mapped : [...prev, ...mapped]));
          setPage(pageToFetch);
          setHasMore(records.length === PAGE_SIZE);
        } else if (reset) {
          setOperations([]);
          setHasMore(false);
        }
      } catch (e) {
        console.warn('Could not load operations:', e.message);
        if (reset) setOperations([]);
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
        isFetchingRef.current = false;
      }
    },
    [order?.id, order?.styleId, lineId, shiftId, filters.status, page],
  );

 

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    fetchOperations({ reset: false });
  };

  const activeFilterCount = filters.status !== 'All' ? 1 : 0;

  const handleOperationPress = (op) => {
    navigation.navigate('ManageOperationScreen', {
      user,
    order,
    operation: op,
    lineId,
    lineName,
    shiftId,
    zoneIds,
    zoneNames,
    });
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{ paddingVertical: mvs(16) }}>
        <ActivityIndicator size="small" color={AppColors.primary} />
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
              onPress={() => { 
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('OrderMappingScreen', { user });  
                }
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={({ pressed }) => [styles.backPill, pressed && { opacity: 0.85 }]}
            >
              <Ionicons name="chevron-back" size={ms(15)} color={AppColors.onPrimary} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>

            <Pressable
              onPress={() => setFilterVisible(true)}
              style={({ pressed }) => [styles.filterBtn, pressed && { opacity: 0.85 }]}
            >
              <Ionicons name="filter" size={ms(16)} color={AppColors.onPrimary} />
              {activeFilterCount > 0 && (
                <View
                  style={{
                    position: 'absolute', top: -2, right: -2,
                    width: ms(8), height: ms(8), borderRadius: ms(4),
                    backgroundColor: '#DC2626',
                  }}
                />
              )}
            </Pressable>
          </View>
           <View style={styles.titleRow}>
            <Text style={styles.screenTitle}>Operation List</Text>
            <View style={styles.lineBadge}>
              <Text style={styles.lineBadgeText}>{lineName}</Text>
            </View>
          </View>
          {/* <Text style={styles.title}>Operation List</Text>*/}
        </SafeAreaView>
      </View>

      <View style={styles.body}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoCell}>
              <View style={styles.infoIconWrap}>
                <Ionicons name="pricetag-outline" size={ms(15)} color={AppColors.primary} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Order No.</Text>
                <Text style={styles.infoValue}>{order?.orderNo}</Text>
              </View>
            </View>
            <View style={styles.infoCell}>
              <View style={styles.infoIconWrap}>
                <Ionicons name="layers-outline" size={ms(15)} color={AppColors.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Line </Text>
                <Text style={styles.infoValue}> {`${lineName}`}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoCell}>
              <View style={styles.infoIconWrap}>
                <Ionicons name="barcode-outline" size={ms(15)} color={AppColors.primary} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Style No.</Text>
                <Text style={styles.infoValue}>{order?.styleNo}</Text>
              </View>
            </View>
            <View style={styles.infoCell}>
              <View style={styles.infoIconWrap}>
                <Ionicons name="shirt-outline" size={ms(15)} color={AppColors.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Style Name</Text>
                <Text style={styles.infoValue}>{order?.style}</Text>
              </View>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={{ paddingHorizontal: ms(16), paddingTop: mvs(16) }}>
            <SkeletonList count={4} showCheckbox={false} />
          </View>
        ) : operations.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="construct-outline" size={ms(28)} color={AppColors.textTertiary} />
            <Text style={styles.emptyText}>
              {filters.status === 'All'
                ? 'No operations found for this order.'
                : 'No operations match the selected filters.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={operations}
            keyExtractor={(op) => String(op.id)}
            renderItem={({ item }) => (
              <OperationCard
                op={item}
                onPress={() => handleOperationPress(item)}
                styles={styles}
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

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        machineTypes={MACHINE_TYPE_FILTERS}
        statuses={STATUS_FILTERS}
        value={filters}
        onApply={setFilters}
        styles={styles}
      />
    </View>
  );
}
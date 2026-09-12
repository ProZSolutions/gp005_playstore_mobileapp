import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AppColors } from '../theme/theme';
import { useResponsive } from '../utils/responsive';
import BottomSheet from './BottomSheet';
import Icon from '../components/Icon';
import { verifyAndGetSlot } from '../utils/slotVerification';
import { getSelectedLineId } from '../api/storage/authStorage';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ROWS = [
  { icon: 'user',       label: 'Employee Name', opKey: 'operator_name',        src: 'operator' ,type:'local'},
  { icon: 'id_card',    label: 'Employee ID',   opKey: 'operator_code',  src: 'operator',type:'local' },
  { icon: 'layers',     label: 'Line No.',      opKey: 'lineNo',      src: 'operator' ,type:'local'},
  { icon: 'clock',      label: 'Slot',          opKey: 'slot',        src: 'operator' ,type:'local'},
  { icon: 'wrench',     label: 'Operation',     opKey: 'operation',   src: 'operator',type:'local' },
  { icon: 'machine_type',    label: 'Machine Type',  opKey: 'machineType', src: 'operator' ,type:'local'},
  { icon: 'order_user', label: 'Buyer',         opKey: 'buyer',       src: 'order'   ,type:'local' },
  { icon: 'hash',       label: 'Order No.',     opKey: 'order_no',     src: 'order',type:'local'    },
  { icon: 'color-palette-outline',    label: 'Color',         opKey: 'colour',      src: 'order', isColor: true ,type:'ionic'},
  { icon: 'shirt',      label: 'Style Name',    opKey: 'style',       src: 'order'   ,type:'local' },
  { icon: 'tag',        label: 'Style No.',     opKey: 'styleNo',     src: 'order'  ,type:'feather'  },
];
const formatTime = (time) => {
  if (!time || time === '00:00:00') return '';

  const [hours, minutes] = time.split(':');
  const date = new Date();
  date.setHours(hours, minutes);

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};
export default function OrderDetailsSheet({
  visible,
  onClose,
  order,
  operator,
  navigation,
  lineId,  
  listRouteName = 'OrderList',
  listRouteParams,
  onSlotResolved,  
}) {
  const [slotName, setSlotName] = useState('-'); 
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);
 
  const { scale, verticalScale, fontScale, moderateScale, isLargeScreen } = useResponsive();
  const styles = React.useMemo(
    () => createStyles({ scale, verticalScale, fontScale, moderateScale, isLargeScreen }),
    [scale, verticalScale, fontScale, moderateScale, isLargeScreen],
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!visible) { 
      requestIdRef.current += 1;
      return;
    }

    requestIdRef.current += 1;
    const myRequestId = requestIdRef.current;

    const isStale = () => !isMountedRef.current || myRequestId !== requestIdRef.current;

    (async () => { 
      let effectiveLineId = lineId;

      if (!effectiveLineId) {
        try {
          effectiveLineId = await getSelectedLineId();
        } catch (error) {
          console.warn('OrderDetailsSheet: failed to read stored lineId:', error);
        }
      }

      if (isStale()) return;

      if (!effectiveLineId) {
        console.warn('OrderDetailsSheet: no lineId available for slot verification');
        setSlotName('-');
        return;
      }

      try {
        const { slot } = await verifyAndGetSlot({
          lineId: effectiveLineId,
          navigation,
          listRouteName,
          listRouteParams,
        });

        if (isStale()) return;
        console.log("slot details "+JSON.stringify(slot));
        if (slot?.slot_name) {
          const startTime = formatTime(slot.start);
          const endTime = formatTime(slot.end);

          setSlotName(startTime && endTime ? `${startTime} - ${endTime}` : '' );
          onSlotResolved?.(slot);
        } else {
          setSlotName('-');
        }
      } catch (error) {
        console.warn('OrderDetailsSheet: slot verification failed:', error);
        if (!isStale()) setSlotName('-');
      }
    })();
   }, [visible, lineId]);

  const getValue = (row) => {
    if (row.opKey === 'slot') {
      return slotName;
    }

    return row.src === 'operator'
      ? operator?.[row.opKey] ?? '—'
      : order?.[row.opKey] ?? '—';
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Order & Operator Details"
      subtitle="Detailed view with all information"
      maxHeight={isLargeScreen ? 750 : verticalScale(675)}
     >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {ROWS.map((row, idx) => (
          <View key={row.opKey}>
            <View style={styles.row}>
              <View style={styles.iconWrap}>
               {row.type === 'feather' ? (
              <Feather style={styles.iconNew} name={row.icon} color={AppColors.primary}   />
            ) : row.type === 'ionic' ? (
              <Ionicons style={styles.iconNew} name={row.icon} color={AppColors.primary}   />
            ) : (
              <Icon style={styles.icon} name={row.icon} size={isLargeScreen ? 23 : 18} />
            )}
              </View>

              <Text style={styles.rowLabel}>{row.label}</Text>

              <View style={styles.valueWrap}>
                {row.isColor && order?.colourHex ? (
                  <View
                    style={[styles.colorDot, { backgroundColor: order.colourHex }]}
                  />
                ) : null}
                <Text style={styles.rowValue} numberOfLines={1}>
                  {getValue(row)}
                </Text>
              </View>
            </View>

            {idx < ROWS.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </ScrollView>
    </BottomSheet>
  );
} 
const createStyles = ({ scale, verticalScale, fontScale, moderateScale, isLargeScreen }) =>
  StyleSheet.create({
    listContent: {
      paddingHorizontal: isLargeScreen ? 0 : scale(20),
      paddingTop: isLargeScreen ? 8 : verticalScale(4),
      paddingBottom: isLargeScreen ? 0 : verticalScale(12),
      maxWidth: undefined,
      alignSelf: 'stretch',
      width: '100%',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: isLargeScreen ? 16 : verticalScale(6),
      paddingHorizontal: isLargeScreen ? 20 : 0,
      gap: isLargeScreen ? 16 : scale(10),
    },
    iconWrap: {
      width: isLargeScreen ? 48 : scale(34),
      height: isLargeScreen ? 48 : scale(34),
      borderRadius: isLargeScreen ? 12 : moderateScale(9),
      backgroundColor: AppColors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: { fontSize: isLargeScreen ? 17 : fontScale(12) },
    iconNew: { fontSize: isLargeScreen ? 25 : fontScale(19) },

    rowLabel: {
      flex: 1,
      fontSize: isLargeScreen ? 20 : fontScale(13.8),
      color: AppColors.textSecondary,
      fontWeight: '500',
    },
    valueWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isLargeScreen ? 9 : scale(6),
      maxWidth: isLargeScreen ? 300 : scale(170),
    },
    colorDot: {
      width: isLargeScreen ? 15 : scale(10),
      height: isLargeScreen ? 15 : scale(10),
      borderRadius: isLargeScreen ? 7.5 : scale(5),
    },
    rowValue: {
      fontSize: isLargeScreen ? 20 : fontScale(13.8),
      fontWeight: '700',
      color: AppColors.textPrimary,
      textAlign: 'right',
      flexShrink: 1,
    },
    divider: {
      height: 1,
      backgroundColor: AppColors.divider,
      marginHorizontal: isLargeScreen ? 20 : 0,
    },
  });
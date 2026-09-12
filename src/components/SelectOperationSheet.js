// components/SelectOperationSheet.js
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useResponsive } from '../utils/responsive';
import { AppColors } from '../theme/theme';
import BottomSheet from './BottomSheet';
import reworkService from '../api/services/reworkService';

const TEAL = '#0D939D';

export default function SelectOperationSheet({
  visible,
  onClose,
  selectedId = null,
  onApply, 
  branchId,
  teamId,
  shiftId,
  order
}) {
   const [query, setQuery] = useState('');
  const [picked, setPicked] = useState(selectedId);
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(false);
const orderId = order?.id;
const styleId = order?.styleId;

  const { scale, verticalScale, fontScale, moderateScale, isLargeScreen } = useResponsive();
  const styles = useMemo(
    () => createStyles({ scale, verticalScale, fontScale, moderateScale, isLargeScreen }),
    [scale, verticalScale, fontScale, moderateScale, isLargeScreen],
  );

  useEffect(() => {
    if (!visible) return;
    setPicked(selectedId);
    setQuery('');

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const result = await reworkService.getOperationList({ shiftId ,orderId,styleId});
         if (!cancelled && result.success) {
          setOperations(result.data);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [visible, selectedId, branchId, teamId, shiftId,orderId,styleId]);

  const visibleOps = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return operations;
    return operations.filter((op) => op.label.toLowerCase().includes(q));
  }, [operations, query]);

  const handleDone = () => {
    const chosen = operations.find((op) => op.id === picked);
    if (!chosen) return;
    onApply?.(chosen);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Select Operation"
      maxHeight={isLargeScreen ? 680 : verticalScale(620)}
    >
      <View style={styles.searchBar}>
        <Icon name="search" size={isLargeScreen ? 18 : scale(15)} color={AppColors.textTertiary ?? '#9CA3AF'} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search Operation..."
          placeholderTextColor={AppColors.textTertiary ?? '#9CA3AF'}
          style={styles.searchInput}
          autoCorrect={false}
        />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={TEAL} style={{ marginTop: isLargeScreen ? 28 : verticalScale(24) }} />
        ) : (
          <>
            {visibleOps.map((op) => {
               const active = picked === op.id;
              return (
                <TouchableOpacity
                  key={op.id}
                  style={[styles.row, active && styles.rowActive]}
                  onPress={() => setPicked(op.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                    {active && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>{op.label}</Text>
                </TouchableOpacity>
              );
            })}
            {visibleOps.length === 0 && (
              <Text style={styles.emptyText}>
                {query ? 'No operations match your search.' : 'No operations found.'}
              </Text>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.doneWrap}>
        <TouchableOpacity
          style={[styles.doneBtn, !picked && styles.doneBtnDisabled]}
          onPress={handleDone}
          disabled={!picked}
          activeOpacity={0.85}
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const createStyles = ({ scale, verticalScale, fontScale, moderateScale, isLargeScreen }) =>
  StyleSheet.create({
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F1F5F9',
      borderRadius: isLargeScreen ? 12 : moderateScale(10),
      paddingHorizontal: isLargeScreen ? 16 : scale(12),
      marginHorizontal: isLargeScreen ? 24 : scale(16),
      height: isLargeScreen ? 48 : verticalScale(40),
      gap: isLargeScreen ? 10 : scale(8),
      marginBottom: isLargeScreen ? 16 : verticalScale(14),
    },
    searchInput: {
      flex: 1,
      fontSize: isLargeScreen ? 16 : fontScale(14),
      color: AppColors.textPrimary ?? '#111827',
      padding: 0,
    },
    list: {
      paddingHorizontal: isLargeScreen ? 24 : scale(16),
      paddingBottom: isLargeScreen ? 14 : verticalScale(10),
      gap: isLargeScreen ? 12 : verticalScale(12),
      maxWidth: isLargeScreen ? 760 : undefined,
      alignSelf: isLargeScreen ? 'center' : 'stretch',
      width: '100%',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: AppColors.border ?? '#E5E7EB',
      borderRadius: isLargeScreen ? 12 : moderateScale(10),
      paddingVertical: isLargeScreen ? 16 : verticalScale(14),
      paddingHorizontal: isLargeScreen ? 18 : scale(16),
    },
    rowActive: { borderColor: TEAL, backgroundColor: '#0D939D0D' },
    radioOuter: {
      width: isLargeScreen ? 22 : scale(18),
      height: isLargeScreen ? 22 : scale(18),
      borderRadius: isLargeScreen ? 11 : scale(9),
      borderWidth: 2,
      borderColor: '#CBD5E1',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: isLargeScreen ? 14 : scale(12),
    },
    radioOuterActive: { borderColor: TEAL },
    radioInner: {
      width: isLargeScreen ? 11 : scale(9),
      height: isLargeScreen ? 11 : scale(9),
      borderRadius: isLargeScreen ? 5.5 : scale(4.5),
      backgroundColor: TEAL,
    },
    rowLabel: {
      fontSize: isLargeScreen ? 16.5 : fontScale(14.5),
      fontWeight: '600',
      color: AppColors.textPrimary ?? '#111827',
    },
    rowLabelActive: { color: TEAL },
    emptyText: {
      fontSize: isLargeScreen ? 15 : fontScale(13.5),
      color: AppColors.textTertiary ?? '#9CA3AF',
      textAlign: 'center',
      paddingVertical: isLargeScreen ? 24 : verticalScale(20),
    },
    doneWrap: {
      paddingHorizontal: isLargeScreen ? 24 : scale(20),
      paddingTop: isLargeScreen ? 14 : verticalScale(10),
      borderTopWidth: 1,
      borderTopColor: AppColors.divider ?? '#E5E7EB',
    },
    doneBtn: {
      backgroundColor: TEAL,
      borderRadius: isLargeScreen ? 16 : moderateScale(14),
      paddingVertical: isLargeScreen ? 17 : verticalScale(15),
      alignItems: 'center',
    },
    doneBtnDisabled: { backgroundColor: '#CBD5E1' },
    doneBtnText: {
      fontSize: isLargeScreen ? 18 : fontScale(16),
      fontWeight: '600',
      color: '#fff',
    },
  });
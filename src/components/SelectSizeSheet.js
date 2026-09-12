// components/SelectSizeSheet.js
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useResponsive } from '../utils/responsive';
import { AppColors } from '../theme/theme';
import BottomSheet from './BottomSheet';

const TEAL = '#0D939D';


export default function SelectSizeSheet({ visible, onClose, sizes = [], selectedId = null, onApply, emptylabel = null }) {
  const [picked, setPicked] = useState(selectedId);

  const { scale, verticalScale, fontScale, moderateScale, isLargeScreen } = useResponsive();
  const styles = useMemo(
    () => createStyles({ scale, verticalScale, fontScale, moderateScale, isLargeScreen }),
    [scale, verticalScale, fontScale, moderateScale, isLargeScreen],
  );

  useEffect(() => {
    if (visible) setPicked(selectedId);
  }, [visible, selectedId]);

  const normalized = sizes.map((s) =>
    typeof s === 'string' ? { id: s, label: s } : { id: s.id ?? s.label, label: s.label ?? s.size ?? String(s) }
  );

  const isEmpty = normalized.length === 0;

  const handleApply = () => {
    const chosen = normalized.find((s) => s.id === picked);
    if (!chosen) return;
    onApply?.(chosen);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Select Size"
      maxHeight={isLargeScreen ? 580 : verticalScale(520)}
    >
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {isEmpty ? (
          emptylabel ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>All size present in this order has WIP 0</Text>
            </View>
          ) : null
        ) : (
          normalized.map((s) => {
            const active = picked === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.row, active && styles.rowActive]}
                onPress={() => setPicked(s.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                  {active && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>{s.label}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {!isEmpty && (
        <View style={styles.applyWrap}>
          <TouchableOpacity
            style={[styles.applyBtn, !picked && styles.applyBtnDisabled]}
            onPress={handleApply}
            disabled={!picked}
            activeOpacity={0.85}
          >
            <Text style={styles.applyBtnText}>Apply</Text>
          </TouchableOpacity>
        </View>
      )}
    </BottomSheet>
  );
}

const createStyles = ({ scale, verticalScale, fontScale, moderateScale, isLargeScreen }) =>
  StyleSheet.create({
    list: {
      paddingHorizontal: isLargeScreen ? 24 : scale(20),
      paddingTop: isLargeScreen ? 8 : verticalScale(6),
      paddingBottom: isLargeScreen ? 14 : verticalScale(10),
      gap: isLargeScreen ? 12 : verticalScale(10),
      maxWidth: isLargeScreen ? 750 : undefined,
      alignSelf: isLargeScreen ? 'center' : 'stretch',
      width: '100%',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: AppColors.border ?? '#E5E7EB',
      borderRadius: isLargeScreen ? 12 : moderateScale(10),
      paddingVertical: isLargeScreen ? 13 : verticalScale(13),
      paddingHorizontal: isLargeScreen ? 14 : scale(14),
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
      fontSize: isLargeScreen ? 20.5 : fontScale(14.5),
      fontWeight: '600',
      color: AppColors.textPrimary ?? '#111827',
    },
    rowLabelActive: { color: TEAL },
    emptyWrap: {
      paddingVertical: isLargeScreen ? 40 : verticalScale(32),
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontSize: isLargeScreen ? 17 : fontScale(14.5),
      fontWeight: '500',
      color: AppColors.textSecondary ?? '#6B7280',
      textAlign: 'center',
    },
    applyWrap: {
      paddingHorizontal: isLargeScreen ? 24 : scale(20),
      paddingTop: isLargeScreen ? 14 : verticalScale(10),
      borderTopWidth: 1,
      borderTopColor: AppColors.divider ?? '#E5E7EB',
    },
    applyBtn: {
      backgroundColor: TEAL,
      borderRadius: isLargeScreen ? 16 : moderateScale(14),
      paddingVertical: isLargeScreen ? 17 : verticalScale(15),
      alignItems: 'center',
    },
    applyBtnDisabled: { backgroundColor: '#CBD5E1' },
    applyBtnText: {
      fontSize: isLargeScreen ? 18 : fontScale(16),
      fontWeight: '600',
      color: '#fff',
    },
  });
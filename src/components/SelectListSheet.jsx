import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { scale, verticalScale, fontScale, moderateScale } from '../utils/scale';
import { AppColors } from '../theme/theme';
import BottomSheet from './BottomSheet';
import { useResponsive } from '../utils/responsive'; 
import { useOrientation } from '../hooks/useOrientation';
import { Dialog } from 'react-native-paper';
const TEAL = AppColors.primary ?? '#0D939D';

export default function SelectListSheet({
  visible,
  onClose,
  title = 'Select',
  data = [],              // [{ id, value }]
  selectedId = null,
  onApply,                // (item) => void
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  emptyText = 'No options available.',
  getRightText,           // optional (item) => string — right-aligned subtext per row
}) {
  
 const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs, isLargeScreen } = useResponsive();
    const { isLandscape } = useOrientation();
    const pickStyle = (largePortrait, largeLandscape, mobilePortrait, mobileLandscape) =>   isLargeScreen ? (isLandscape ? largeLandscape : largePortrait): 
(isLandscape ? mobileLandscape : mobilePortrait);


    const textStyle = pickStyle(styles.searchInputLarge,styles.searchInputLarge,null,styles.searchInput);
    const circlestyle = pickStyle(styles.checkCircleLarge,styles.checkCircleLarge,null,styles.checkCircle);
    const checkedQTy = pickStyle(styles.rowRightTextLarge,styles.rowRightTextLarge,null,styles.rowRightText);
    const rawte = pickStyle(styles.rowLabelLarge,styles.rowLabelLarge,null,styles.rowLabel);

    const hgt = pickStyle(560,400,null,560);



  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState(selectedId);

  useEffect(() => {
    if (!visible) return;
    setPicked(selectedId);
    setQuery('');
  }, [visible, selectedId]);

  const visibleData = useMemo(() => {
     const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((item) => String(item.value ?? '').toLowerCase().includes(q));
  }, [data, query]);

  const handleDone = () => {
    const chosen = data.find((item) => item.id === picked);
    if (!chosen) return;
    onApply?.(chosen);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} maxHeight={verticalScale(hgt)}>
      {searchable && (
        <View style={styles.searchBar}>
          <Icon name="search" size={scale(15)} color={AppColors.textTertiary ?? '#9CA3AF'} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={searchPlaceholder}
            placeholderTextColor={AppColors.textTertiary ?? '#9CA3AF'}
            style={[styles.searchInput,textStyle]}
            autoCorrect={false}
          />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={TEAL} style={{ marginTop: verticalScale(24) }} />
        ) : (
          <>
            {visibleData.map((item) => {
              const active = picked === item.id;
              const rightText = getRightText ? getRightText(item) : null;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.row, active && styles.rowActive]}
                  onPress={() => setPicked(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkCircle,circlestyle, active && styles.checkCircleActive]}>
                    {active && <Icon name="check" size={scale(12)} color="#fff" />}
                  </View>
                  <Text style={[styles.rowLabel,rawte]}>{item.value}</Text>
                  {rightText != null && (
                    <Text style={[styles.rowRightText,checkedQTy]} numberOfLines={1}>
                      {rightText}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
            {visibleData.length === 0 && (
              <Text style={styles.emptyText}>{query ? 'No matches found.' : emptyText}</Text>
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

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(12),
    marginHorizontal: scale(20),
    height: verticalScale(40),
    gap: scale(8),
    marginBottom: verticalScale(12),
  },
   
  searchInputLarge: { flex: 1, fontSize: fontScale(18), color: AppColors.textPrimary ?? '#111827', padding: 0 },
  searchInput: { flex: 1, fontSize: fontScale(14), color: AppColors.textPrimary ?? '#111827', padding: 0 },
  list: { paddingHorizontal: scale(20), paddingBottom: verticalScale(10), gap: verticalScale(8) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.border ?? '#E5E7EB',
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(12),
  },
  rowActive: { borderColor: TEAL, backgroundColor: '#0D939D0D' },
  checkCircle: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
   checkCircleLarge: {
    width: scale(15),
    height: scale(15),
    borderRadius: scale(10),
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  checkCircleActive: { borderColor: TEAL, backgroundColor: TEAL },
  rowLabel: { fontSize: fontScale(14.5), fontWeight: '600', color: AppColors.textPrimary ?? '#111827', flexShrink: 1 },
  rowLabelLarge: { fontSize: fontScale(18.5), fontWeight: '600', color: AppColors.textPrimary ?? '#111827', flexShrink: 1 },
  rowRightText: {
    marginLeft: 'auto',
    fontSize: fontScale(12.5),
    fontWeight: '500',
    color: AppColors.textTertiary ?? '#9CA3AF',
  },
  rowRightTextLarge: {
    marginLeft: 'auto',
    fontSize: fontScale(15.5),
    fontWeight: '500',
    color: AppColors.textTertiary ?? '#9CA3AF',
  },
  emptyText: { fontSize: fontScale(13.5), color: AppColors.textTertiary ?? '#9CA3AF', textAlign: 'center', paddingVertical: verticalScale(20) },
  doneWrap: { paddingHorizontal: scale(20), paddingTop: verticalScale(10), borderTopWidth: 1, borderTopColor: AppColors.divider ?? '#E5E7EB' },
  doneBtn: { backgroundColor: TEAL, borderRadius: moderateScale(14), paddingVertical: verticalScale(15), alignItems: 'center' },
  doneBtnDisabled: { backgroundColor: '#CBD5E1' },
  doneBtnText: { fontSize: fontScale(16), fontWeight: '600', color: '#fff' },
});
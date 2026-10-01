// components/SelectOperatorSheet.js
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useResponsive } from '../utils/responsive';
import { AppColors } from '../theme/theme';
import BottomSheet from './BottomSheet';
import reworkService from '../api/services/reworkService';

const TEAL = '#0D939D';

export default function SelectOperatorSheet({
  visible,
  onClose,
  selectedId = null,
  onApply, 
  branchId,
  teamId,
  shiftId,
}) {
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState(selectedId);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(false);

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
        const result = await reworkService.getEmployeeList({  shiftId });
        if (!cancelled && result.success) {
          setOperators(result.data);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [visible, selectedId, branchId, teamId, shiftId]);

const visibleOperators = useMemo(() => {
  const q = query.trim().toLowerCase();

  if (!q) return operators;

  return operators.filter((o) => {
    const id = String(o.id ?? '').toLowerCase();
    const name = String(o.name ?? '').toLowerCase();

    const empCode =
      String(
        o.code ??
        o.role ?? 
        ''
      ).toLowerCase();

    return (
      id.includes(q) ||
      name.includes(q) ||
      empCode.includes(q)
    );
  });
}, [operators, query]);

  const handleDone = () => {
    const chosen = operators.find((o) => o.id === picked);
    if (!chosen) return;
    onApply?.(chosen);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Select Operator"
      maxHeight={isLargeScreen ? 680 : verticalScale(620)}
    >
      <View style={styles.searchBar}>
        <Icon name="search" size={isLargeScreen ? 18 : scale(15)} color={AppColors.textTertiary ?? '#9CA3AF'} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by ID or Name..."
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
            {visibleOperators.map((o) => {
              const active = picked === o.id;
              return (
                <TouchableOpacity
                  key={o.id}
                  style={[styles.row, active && styles.rowActive]}
                  onPress={() => setPicked(o.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkCircle, active && styles.checkCircleActive]}>
                    {active && <Icon name="check" size={isLargeScreen ? 14 : scale(12)} color="#fff" />}
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowLabel}> {o.code} - {o.name}</Text>
                    <Text style={styles.rowSub}>{o.raw.department_name}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            {visibleOperators.length === 0 && (
              <Text style={styles.emptyText}>
                {query ? 'No operators match your search.' : 'No operators found.'}
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

// Mobile keeps the original ratio-based scale() path (unchanged values —
// that's what was already working). Tablet uses small FIXED bumps
// instead of scale(), since scale()/fontScale() multiply by
// (width / 375) and on a wide tablet that ratio compounds badly with an
// already-larger tablet number (see OrderDetailsSheet/BottomSheet for
// the same fix applied earlier). Content is also capped/centered on
// tablet, matching BottomSheet's own dialog-style width cap.
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
      width:'100%',
      borderColor: AppColors.border ?? '#E5E7EB',
      borderRadius: isLargeScreen ? 12 : moderateScale(10),
      paddingVertical: isLargeScreen ? 14 : verticalScale(12),
      paddingHorizontal: isLargeScreen ? 16 : scale(14),
    },
    rowActive: { borderColor: TEAL, backgroundColor: '#0D939D0D' },
    checkCircle: {
      width: isLargeScreen ? 24 : scale(20),
      height: isLargeScreen ? 24 : scale(20),
      borderRadius: isLargeScreen ? 12 : scale(10),
      borderWidth: 2,
      borderColor: '#CBD5E1',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: isLargeScreen ? 14 : scale(12),
    },
    checkCircleActive: { borderColor: TEAL, backgroundColor: TEAL },
    rowText: { flex: 1 },
    rowLabel: {
      fontSize: isLargeScreen ? 16 : fontScale(14),
      fontWeight: '600',
      color: AppColors.textPrimary ?? '#111827',
    },
    rowSub: {
      fontSize: isLargeScreen ? 13 : fontScale(11.5),
      color: AppColors.textTertiary ?? '#9CA3AF',
      marginTop: 2,
    },
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
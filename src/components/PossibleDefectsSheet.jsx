import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { AppColors } from '../theme/theme';
import { scale, verticalScale, fontScale, moderateScale } from '../utils/scale';
import BottomSheet from './BottomSheet';

/**
 * defects: [{ id, defect_name, defect_code }] from /audit/operation-defects
 * selected: array of currently-selected defect ids
 * onConfirm(ids): fires immediately on every toggle (multi-select, no separate confirm step).
 *   Ignored when readOnly is true.
 * readOnly: when true, every defect renders pre-selected and taps do nothing —
 *   the sheet becomes a pure "view what's known for this operation" popup.
 */
export default function PossibleDefectsSheet({
  visible,
  onClose,
  defects = [],
  loading = false,
  selected = [],
  onConfirm,
  readOnly = false,
}) {
  const [local, setLocal] = useState(selected);

  useEffect(() => {
    if (visible) setLocal(selected);
  }, [visible, selected]);

  const toggle = (id) => {
    if (readOnly) return;
    const next = local.includes(id)
      ? local.filter((x) => x !== id)
      : [...local, id];
    setLocal(next);
    onConfirm?.(next);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Possible Defects"
      subtitle="Known defect types for this operation"
      maxHeight={verticalScale(480)}
    >
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={AppColors.primary} />
        </View>
      ) : defects.length === 0 ? (
        <Text style={styles.emptyText}>No defect types found for this operation.</Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.chipGrid}
          showsVerticalScrollIndicator={false}
        >
          {defects.map((def) => {
            const isSelected = readOnly ? true : local.includes(def.id);
            return (
              <TouchableOpacity
                key={def.id}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggle(def.id)}
                activeOpacity={readOnly ? 1 : 0.75}
                disabled={readOnly}
                accessibilityRole={readOnly ? 'text' : 'button'}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {def.defect_name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(20),
    gap: scale(8),
  },
  chip: {
    borderRadius: moderateScale(14),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    backgroundColor: '#FEF3C7',
    borderColor: '#F0D060',
  },
  chipSelected: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primaryDark,
  },
  chipText: { fontSize: fontScale(15.5), fontWeight: '600', color: '#92400E' },
  chipTextSelected: { color: AppColors.onPrimary },
  loadingWrap: { paddingVertical: verticalScale(40), alignItems: 'center' },
  emptyText: {
    fontSize: fontScale(15.5),
    color: AppColors.textTertiary,
    textAlign: 'center',
    paddingVertical: verticalScale(30),
  },
});
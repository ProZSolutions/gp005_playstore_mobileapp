import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import BottomSheet from './BottomSheet';
import { scale, verticalScale } from '../utils/scale';

export default function FilterModal({
  visible,
  onClose,
  machineTypes,
  statuses,
  value,
  onApply,
  styles,
}) {
  const [machineType, setMachineType] = useState(
    value?.machineType ?? 'All'
  );
  const [status, setStatus] = useState(
    value?.status ?? 'All'
  );

  useEffect(() => {
    if (visible) {
      setMachineType(value?.machineType ?? 'All');
      setStatus(value?.status ?? 'All');
    }
  }, [visible, value]);

  const handleReset = () => {
    setMachineType('All');
    setStatus('All');

    onApply?.({
      machineType: 'All',
      status: 'All',
    });

    onClose?.();
  };

  const handleApply = () => {
    onApply?.({
      machineType,
      status,
    });

    onClose?.();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Filters"
    >
      <View
        style={{
          paddingHorizontal: scale(20),
          paddingTop: verticalScale(16),
        }}
      >
        <Text style={styles.sectionLabel}>Status</Text>

        <View style={styles.optionsRow}>
          {statuses.map((st) => {
            const active = status === st;

            return (
              <Pressable
                key={st}
                onPress={() => setStatus(st)}
                style={[
                  styles.optionChip,
                  active && styles.optionChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    active && styles.optionChipTextActive,
                  ]}
                >
                  {st}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sheetFooterRow}>
          <Pressable
            style={styles.resetBtn}
            onPress={handleReset}
          >
            <Text style={styles.resetBtnText}>
              Reset
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.applyBtn,
              styles.applyBtnActive,
            ]}
            onPress={handleApply}
          >
            <Text
              style={[
                styles.applyBtnText,
                styles.applyBtnTextActive,
              ]}
            >
              Apply
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}
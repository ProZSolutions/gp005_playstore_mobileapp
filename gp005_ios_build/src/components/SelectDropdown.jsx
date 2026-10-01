import React, { useState } from 'react';
import { Modal, View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Colors } from '../theme/common';
import { scale, verticalScale } from '../utils/scale';

export default function SelectDropdown({ value, options, onChange, accessibilityLabel }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        style={styles.trigger}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Text style={styles.triggerText}>{value}</Text>
        <Icon name="chevron-down" size={scale(15)} color={Colors.inkSecondary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.popover} onPress={() => {}}>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item)}
              style={{ maxHeight: verticalScale(260) }}
              renderItem={({ item }) => {
                const selected = item === value;
                return (
                  <Pressable
                    style={[styles.option, selected && styles.optionSelected]}
                    onPress={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {item}
                    </Text>
                    {selected && (
                      <Icon name="check" size={scale(15)} color={Colors.teal} />
                    )}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: scale(8),
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: scale(8),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(9),
    minWidth: scale(80),
    backgroundColor: Colors.white,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.ink,
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(40),
  },
  popover: {
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    paddingVertical: verticalScale(6),
    width: scale(180),
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
  },
  optionSelected: { backgroundColor: Colors.tealLight },
  optionText: { fontSize: 14, color: Colors.ink },
  optionTextSelected: { color: Colors.tealText, fontWeight: '700' },
});
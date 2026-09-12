// src/components/AppChip.jsx
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { AppColors } from '../theme/theme';

/**
 * AppChip — single selectable/filter chip
 * Props:
 *  - label    (string) required
 *  - selected (bool)   teal filled when true
 *  - onPress  (func)
 *  - icon     (node)   element left of label
 *  - disabled (bool)
 *  - style    (object)
 *
 * Example:
 *  <AppChip label="React Native" selected={true} onPress={toggle} />
 */
export function AppChip({ label, selected = false, onPress, icon, disabled = false, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.76}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? AppColors.primary : AppColors.surface,
          borderColor:     selected ? AppColors.primary : AppColors.border,
          opacity:         disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.label, { color: selected ? AppColors.white : AppColors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection:  'row',
    alignItems:     'center',
    borderWidth:    1.5,
    borderRadius:   20,
    paddingHorizontal: 14,
    paddingVertical:   7,
    marginRight:    8,
    marginBottom:   8,
  },
  icon:  { marginRight: 6 },
  label: { fontSize: 13, fontWeight: '500' },
});

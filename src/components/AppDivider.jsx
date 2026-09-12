// src/components/AppDivider.jsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { AppColors } from '../theme/theme';

/**
 * AppDivider — horizontal separator with optional centred label
 * Props:
 *  - label  (string) e.g. "OR", "INPUTS"
 *  - style  (object)
 *
 * Examples:
 *  <AppDivider />
 *  <AppDivider label="OR" />
 *  <AppDivider label="INPUTS" />
 */
export function AppDivider({ label, style }) {
  if (!label) {
    return <View style={[styles.plain, style]} />;
  }

  return (
    <View style={[styles.row, style]}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  plain: {
    height:          1,
    backgroundColor: AppColors.divider,
    marginVertical:  16,
  },
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    marginVertical:16,
  },
  line: {
    flex:            1,
    height:          1,
    backgroundColor: AppColors.divider,
  },
  label: {
    fontSize:      11,
    fontWeight:    '600',
    color:         AppColors.textTertiary,
    letterSpacing: 0.8,
    marginHorizontal: 12,
  },
});

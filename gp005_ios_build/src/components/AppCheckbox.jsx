// src/components/AppCheckbox.jsx
import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Platform } from 'react-native';
import { AppColors } from '../theme/theme';

/**
 * AppCheckbox
 * Props:
 *  - label         (string) required — text beside the checkbox
 *  - checked       (bool)   required — controlled state
 *  - onToggle      (func)   required — (newValue: bool) => void
 *  - disabled      (bool)   grays out, blocks press
 *  - indeterminate (bool)   dash state
 *  - error         (string) red helper below
 *  - hint          (string) grey helper below
 *  - style         (object) outer wrapper style
 *
 * Examples:
 *  <AppCheckbox label="Accept terms" checked={agreed} onToggle={setAgreed} />
 *  <AppCheckbox label="Remember me"  checked={true}   onToggle={setRemember} />
 *  <AppCheckbox label="Disabled"     checked={false}  onToggle={() => {}} disabled />
 */
export function AppCheckbox({
  label,
  checked,
  onToggle,
  disabled      = false,
  indeterminate = false,
  error,
  hint,
  style,
}) {
  const handlePress = () => {
    if (!disabled) onToggle(!checked);
  };

  const boxBg     = !disabled && (checked || indeterminate) ? AppColors.primary : AppColors.surface;
  const boxBorder = disabled
    ? AppColors.neutral300
    : error
    ? AppColors.error
    : checked || indeterminate
    ? AppColors.primary
    : AppColors.outline;

  const labelColor = disabled
    ? AppColors.textTertiary
    : error
    ? AppColors.error
    : AppColors.textPrimary;

  return (
    <View style={[styles.wrapper, style]}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.75}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        style={styles.row}
      >
        {/* Box */}
        <View style={[styles.box, { backgroundColor: boxBg, borderColor: boxBorder }]}>
          {indeterminate && !checked ? (
            <View style={styles.dash} />
          ) : checked ? (
            <Text style={styles.tick}>✓</Text>
          ) : null}
        </View>

        {/* Label */}
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      </TouchableOpacity>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 10 },
  row:     { flexDirection: 'row', alignItems: 'center' },
  box: {
    width:         22,
    height:        22,
    borderRadius:  5,
    borderWidth:   2,
    justifyContent:'center',
    alignItems:    'center',
    marginRight:   10,
  },
  tick: {
    fontSize:   12,
    fontWeight: '700',
    color:      AppColors.white,
    lineHeight: 14,
  },
  dash: {
    width:        10,
    height:       2,
    borderRadius: 1,
    backgroundColor: AppColors.white,
  },
  label: {
    flex:          1,
    fontSize:      15,
    fontWeight:    '400',
    letterSpacing: 0.1,
  },
  errorText: { fontSize: 12, color: AppColors.error, marginTop: 3, marginLeft: 32 },
  hintText:  { fontSize: 12, color: AppColors.textTertiary, marginTop: 3, marginLeft: 32 },
});

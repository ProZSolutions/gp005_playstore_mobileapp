// src/components/AppRadioGroup.jsx
import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { AppColors } from '../theme/theme';

/**
 * AppRadioGroup
 * Props:
 *  - label          (string) optional heading
 *  - options        (array)  required — [{ label, value, disabled?, description? }]
 *  - value          (string) selected value
 *  - onChange       (func)   called with (value)
 *  - direction      (string) 'row' | 'column'  (default: 'column')
 *  - variant        (string) 'default' | 'card'  card = full card row  (default: 'default')
 *  - containerStyle (object)
 *
 * Examples:
 *  <AppRadioGroup label="Shift" options={shiftOpts} value={shift} onChange={setShift} />
 *  <AppRadioGroup label="Shift" options={shiftOpts} value={shift} onChange={setShift} variant="card" />
 *  <AppRadioGroup options={opts} value={v} onChange={setV} direction="row" />
 */
export function AppRadioGroup({
  label,
  options,
  value,
  onChange,
  direction    = 'column',
  variant      = 'default',
  containerStyle,
}) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text style={styles.groupLabel}>{label}</Text>
      ) : null}

      <View style={direction === 'row' ? styles.rowWrap : undefined}>
        {options.map(opt => {
          const isSelected = opt.value === value;
          const isDisabled = opt.disabled ?? false;

          if (variant === 'card') {
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => !isDisabled && onChange(opt.value)}
                disabled={isDisabled}
                activeOpacity={0.76}
                style={[
                  styles.card,
                  {
                    borderColor:     isSelected ? AppColors.primary : AppColors.border,
                    borderWidth:     isSelected ? 1.5 : 1,
                    backgroundColor: isSelected ? AppColors.primaryLight : AppColors.surface,
                    opacity:         isDisabled ? 0.5 : 1,
                  },
                ]}
              >
                <View style={[
                  styles.radioCircle,
                  { borderColor: isSelected ? AppColors.primary : AppColors.outline },
                ]}>
                  {isSelected ? (
                    <View style={[styles.radioInner, { backgroundColor: AppColors.primary }]} />
                  ) : null}
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.cardLabel, { color: isDisabled ? AppColors.textTertiary : AppColors.textPrimary }]}>
                    {opt.label}
                  </Text>
                  {opt.description ? (
                    <Text style={styles.cardDesc}>{opt.description}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          }

          // Default inline radio
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => !isDisabled && onChange(opt.value)}
              disabled={isDisabled}
              activeOpacity={0.76}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected, disabled: isDisabled }}
              style={[
                styles.option,
                direction === 'row' && styles.optionRow,
                { opacity: isDisabled ? 0.5 : 1 },
              ]}
            >
              <View style={[
                styles.radioCircle,
                { borderColor: isSelected ? AppColors.primary : AppColors.outline },
              ]}>
                {isSelected ? (
                  <View style={[styles.radioInner, { backgroundColor: AppColors.primary }]} />
                ) : null}
              </View>
              <Text style={[styles.optionLabel, { color: isDisabled ? AppColors.textTertiary : AppColors.textPrimary }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:    { marginBottom: 14 },
  groupLabel: {
    fontSize:      13,
    fontWeight:    '500',
    color:         AppColors.textSecondary,
    marginBottom:  8,
    letterSpacing: 0.2,
  },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap' },

  // Default radio row
  option: {
    flexDirection:  'row',
    alignItems:     'center',
    marginBottom:   10,
  },
  optionRow: { marginRight: 20 },
  optionLabel: {
    fontSize:   15,
    fontWeight: '400',
    marginLeft: 8,
  },

  // Card radio row
  card: {
    flexDirection:  'row',
    alignItems:     'center',
    borderRadius:   14,
    padding:        14,
    marginBottom:   10,
  },
  cardLabel: {
    fontSize:   15,
    fontWeight: '600',
  },
  cardDesc: {
    fontSize:   13,
    color:      AppColors.textSecondary,
    marginTop:  2,
  },

  // Shared radio indicator
  radioCircle: {
    width:          22,
    height:         22,
    borderRadius:   11,
    borderWidth:    2,
    justifyContent: 'center',
    alignItems:     'center',
  },
  radioInner: {
    width:        10,
    height:       10,
    borderRadius: 5,
  },
});

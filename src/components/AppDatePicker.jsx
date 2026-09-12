// src/components/AppDatePicker.jsx
// Requires: npm install react-native-date-picker
import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Platform } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { AppColors } from '../theme/theme';

/**
 * AppDatePicker
 * Props:
 *  - label          (string)  label above the field
 *  - value          (Date|undefined) controlled value
 *  - onChange       (func)    called with (Date) on confirm
 *  - mode           (string)  'date' | 'time' | 'datetime'  (default: 'date')
 *  - minimumDate    (Date)
 *  - maximumDate    (Date)
 *  - error          (string)  red helper text
 *  - hint           (string)  grey helper text
 *  - placeholder    (string)  text when no value set
 *  - disabled       (bool)
 *  - containerStyle (object)
 *
 * Example:
 *  <AppDatePicker label="Date of Birth" value={dob} onChange={setDob} mode="date" />
 *  <AppDatePicker label="Check-In Time" value={time} onChange={setTime} mode="time" />
 */
export function AppDatePicker({
  label,
  value,
  onChange,
  mode         = 'date',
  minimumDate,
  maximumDate,
  error,
  hint,
  placeholder  = 'Select…',
  disabled     = false,
  containerStyle,
}) {
  const [open, setOpen] = useState(false);

  const icon = mode === 'time' ? '🕐' : '📅';

  const formatDate = (d) => {
    if (!d) return '';
    if (mode === 'date')
      return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    if (mode === 'time')
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const displayText = value ? formatDate(value) : '';

  const borderColor = error ? AppColors.error : AppColors.border;
  const labelColor  = error ? AppColors.error : AppColors.textSecondary;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={[styles.label, { color: labelColor }]}>{label}</Text> : null}

      <TouchableOpacity
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        activeOpacity={0.78}
        style={[
          styles.field,
          {
            borderColor,
            backgroundColor: disabled ? AppColors.neutral100 : AppColors.surface,
          },
        ]}
      >
        <Text style={displayText ? styles.valueText : styles.placeholder}>
          {displayText || placeholder}
        </Text>
        <Text style={styles.icon}>{icon}</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text>
        : hint ? <Text style={styles.hintText}>{hint}</Text>
        : null}

      <DatePicker
        modal
        open={open}
        date={value ?? new Date()}
        mode={mode}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onConfirm={(d) => { setOpen(false); onChange(d); }}
        onCancel={() => setOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: {
    fontSize:      13,
    fontWeight:    '500',
    letterSpacing: 0.2,
    marginBottom:  6,
    marginLeft:    2,
  },
  field: {
    flexDirection:  'row',
    alignItems:     'center',
    borderWidth:    1.5,
    borderRadius:   12,
    paddingHorizontal: 14,
    height:         52,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  valueText: {
    flex: 1, fontSize: 15, color: AppColors.textPrimary,
  },
  placeholder: {
    flex: 1, fontSize: 15, color: AppColors.neutral400,
  },
  icon: { fontSize: 18 },
  errorText: { fontSize: 12, color: AppColors.error, marginTop: 4, marginLeft: 2 },
  hintText:  { fontSize: 12, color: AppColors.textTertiary, marginTop: 4, marginLeft: 2 },
});

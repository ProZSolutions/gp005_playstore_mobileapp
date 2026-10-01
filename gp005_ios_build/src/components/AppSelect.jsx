// src/components/AppSelect.jsx
import React, { useState } from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text,
  Modal, FlatList, Platform, SafeAreaView,
} from 'react-native';
import { AppColors } from '../theme/theme';

/**
 * AppSelect — Dropdown / Select
 * Props:
 *  - label          (string)  label above trigger
 *  - options        (array)   required — [{ label, value, description?, rightBadge?, badgeColor? }]
 *  - value          (any)     selected value
 *  - onChange       (func)    called with (value)
 *  - error          (string)  red helper text
 *  - hint           (string)  grey helper text
 *  - placeholder    (string)  text when nothing selected
 *  - disabled       (bool)
 *  - containerStyle (object)
 *
 * Examples:
 *  <AppSelect label="Fruit" options={fruitOpts} value={fruit} onChange={setFruit} />
 *
 *  // with badge labels (like line picker)
 *  <AppSelect label="Production Line" options={lineOpts} value={line} onChange={setLine} />
 *  // lineOpts = [{ label: 'Line 1', value: 'l1', description: '17254 · M&S Polo',
 *  //              rightBadge: 'Green', badgeColor: AppColors.lineGreen }]
 */
export function AppSelect({
  label,
  options,
  value,
  onChange,
  error,
  hint,
  placeholder  = 'Select an option',
  disabled     = false,
  containerStyle,
}) {
  const [open, setOpen] = useState(false);

  const selected = options.find(o => o.value === value);

  const borderColor = error ? AppColors.error : AppColors.border;
  const labelColor  = error ? AppColors.error : AppColors.textSecondary;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={[styles.label, { color: labelColor }]}>{label}</Text> : null}

      {/* Trigger */}
      <TouchableOpacity
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        activeOpacity={0.78}
        style={[
          styles.trigger,
          {
            borderColor,
            backgroundColor: disabled ? AppColors.neutral100 : AppColors.surface,
          },
        ]}
      >
        <View style={styles.triggerInner}>
          <View style={{ flex: 1 }}>
            <Text style={selected ? styles.selectedText : styles.placeholder} numberOfLines={1}>
              {selected?.label ?? placeholder}
            </Text>
            {selected?.description ? (
              <Text style={styles.triggerDesc} numberOfLines={1}>{selected.description}</Text>
            ) : null}
          </View>
          {selected?.rightBadge ? (
            <Text style={[styles.triggerBadge, { color: selected.badgeColor ?? AppColors.primary }]}>
              {selected.rightBadge}
            </Text>
          ) : null}
        </View>
        <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text>
        : hint ? <Text style={styles.hintText}>{hint}</Text>
        : null}

      {/* Bottom-sheet modal */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        {/* Dimmed overlay tap to close */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        />

        <View style={[styles.sheet, { backgroundColor: AppColors.surface }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: AppColors.neutral300 }]} />

          {label ? (
            <Text style={styles.sheetTitle}>{label}</Text>
          ) : null}

          <FlatList
            data={options}
            keyExtractor={item => String(item.value)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => {
              const isSelected = item.value === value;
              return (
                <TouchableOpacity
                  onPress={() => { onChange(item.value); setOpen(false); }}
                  activeOpacity={0.76}
                  style={[
                    styles.optionRow,
                    {
                      backgroundColor: isSelected ? AppColors.primaryLight : AppColors.surface,
                      borderColor:     isSelected ? AppColors.primary : AppColors.border,
                      borderWidth:     isSelected ? 1.5 : 1,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionLabel, isSelected && { color: AppColors.primary }]}>
                      {item.label}
                    </Text>
                    {item.description ? (
                      <Text style={styles.optionDesc}>{item.description}</Text>
                    ) : null}
                  </View>
                  {item.rightBadge ? (
                    <Text style={[styles.optionBadge, { color: item.badgeColor ?? AppColors.primary }]}>
                      {item.rightBadge}
                    </Text>
                  ) : null}
                  {isSelected ? <Text style={styles.checkmark}>✓</Text> : null}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
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
  trigger: {
    flexDirection:  'row',
    alignItems:     'center',
    borderWidth:    1.5,
    borderRadius:   12,
    paddingHorizontal: 14,
    paddingVertical:   13,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  triggerInner: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  selectedText: { fontSize: 15, color: AppColors.textPrimary, fontWeight: '400' },
  placeholder:  { fontSize: 15, color: AppColors.neutral400 },
  triggerDesc:  { fontSize: 12, color: AppColors.textSecondary, marginTop: 1 },
  triggerBadge: { fontSize: 13, fontWeight: '600', marginHorizontal: 8 },
  chevron:      { fontSize: 10, color: AppColors.textTertiary },
  errorText: { fontSize: 12, color: AppColors.error, marginTop: 4, marginLeft: 2 },
  hintText:  { fontSize: 12, color: AppColors.textTertiary, marginTop: 4, marginLeft: 2 },

  // Modal
  overlay: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: AppColors.scrim,
  },
  sheet: {
    position:        'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding:         20,
    paddingBottom:   Platform.OS === 'ios' ? 36 : 20,
    maxHeight:       '72%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 16,
  },
  sheetTitle: {
    fontSize:      17,
    fontWeight:    '700',
    color:         AppColors.textPrimary,
    marginBottom:  14,
  },
  optionRow: {
    flexDirection:  'row',
    alignItems:     'center',
    borderRadius:   14,
    padding:        14,
    marginBottom:   10,
  },
  optionLabel: { fontSize: 15, fontWeight: '600', color: AppColors.textPrimary },
  optionDesc:  { fontSize: 12, color: AppColors.textSecondary, marginTop: 2 },
  optionBadge: { fontSize: 13, fontWeight: '600', marginRight: 8 },
  checkmark:   { fontSize: 16, color: AppColors.primary, marginLeft: 4 },
});

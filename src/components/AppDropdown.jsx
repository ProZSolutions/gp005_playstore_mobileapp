// src/components/AppDropdown.jsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  FlatList,
} from 'react-native';
import { AppColors } from '../theme/theme';

/**
 * AppDropdown
 * Props:
 *  - label        (string) placeholder / label
 *  - value        (string | number)
 *  - items        (array)  [{ label, value }]
 *  - onSelect     (func)   (value) => void
 *  - disabled     (bool)
 *  - error        (string)
 *  - hint         (string)
 *  - style        (object)
 */

export function AppDropdown({
  label = 'Select',
  value,
  items = [],
  onSelect,
  disabled = false,
  error,
  hint,
  style,
}) {
  const [open, setOpen] = useState(false);

  const selectedItem = items.find(i => i.value === value);

  const toggleDropdown = () => {
    if (!disabled) setOpen(!open);
  };

  const handleSelect = (item) => {
    onSelect(item.value);
    setOpen(false);
  };

  return (
    <View style={[styles.wrapper, style]}>
      {/* Dropdown box */}
      <TouchableOpacity
        style={[
          styles.box,
          {
            borderColor: error
              ? AppColors.error
              : open
              ? AppColors.primary
              : AppColors.outline,
            backgroundColor: disabled
              ? AppColors.neutral100
              : AppColors.surface,
          },
        ]}
        onPress={toggleDropdown}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.label,
            {
              color: selectedItem
                ? AppColors.textPrimary
                : AppColors.textTertiary,
            },
          ]}
        >
          {selectedItem ? selectedItem.label : label}
        </Text>

        <Text style={styles.arrow}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Dropdown list */}
      {open && (
        <View style={styles.dropdown}>
          <FlatList
            data={items}
            keyExtractor={(item) => item.value.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.itemText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Error / Hint */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },

  box: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  label: {
    fontSize: 15,
    fontWeight: '400',
  },

  arrow: {
    fontSize: 12,
    color: AppColors.textTertiary,
  },

  dropdown: {
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.outline,
    maxHeight: 180,
  },

  item: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  itemText: {
    fontSize: 14,
    color: AppColors.textPrimary,
  },

  errorText: {
    fontSize: 12,
    color: AppColors.error,
    marginTop: 4,
    marginLeft: 4,
  },

  hintText: {
    fontSize: 12,
    color: AppColors.textTertiary,
    marginTop: 4,
    marginLeft: 4,
  },
});
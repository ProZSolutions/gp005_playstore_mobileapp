// src/components/AppChipGroup.jsx
import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { AppChip } from './AppChip';

/**
 * AppChipGroup
 * Props:
 *  - chips      (array)  required — [{ id, label, icon? }]
 *  - selected   (array)  selected ids  e.g. ['react', 'ts']
 *  - onSelect   (func)   called with (id) on tap
 *  - scrollable (bool)   horizontal scroll (default: true)
 *  - style      (object) outer container style
 *
 * Example:
 *  const chips = [
 *    { id: 'react', label: 'React Native' },
 *    { id: 'ts',    label: 'TypeScript' },
 *  ];
 *  const [sel, setSel] = useState([]);
 *  const toggle = id =>
 *    setSel(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
 *
 *  <AppChipGroup chips={chips} selected={sel} onSelect={toggle} />
 */
export function AppChipGroup({ chips, selected = [], onSelect, scrollable = true, style }) {
  const items = chips.map(chip => (
    <AppChip
      key={chip.id}
      label={chip.label}
      selected={selected.includes(chip.id)}
      onPress={() => onSelect && onSelect(chip.id)}
    />
  ));

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.scroll, style]}
        contentContainerStyle={styles.scrollContent}
      >
        {items}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.wrap, style]}>{items}</View>
  );
}

const styles = StyleSheet.create({
  scroll:        { paddingVertical: 4 },
  scrollContent: { flexDirection: 'row', alignItems: 'center' },
  wrap:          { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 4 },
});

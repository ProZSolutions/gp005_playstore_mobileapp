import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Keyboard } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomSheet from './BottomSheet';
import { verticalScale } from '../utils/scale';
import { AppColors } from '../theme/theme';
import { CAP_OPTIONS } from '../utils/tlsIssueData';

const BASE_HEIGHT = verticalScale(600);

export default function SelectCapModal({
  visible,
  onClose,
  initialSelectedIds = [],
  onApply,
  styles,
  ms,
  options,
}) {
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  const [customCap, setCustomCap] = useState('');

  const capList = Array.isArray(options) && options.length ? options : [];
  const getLabel = (opt) => opt.cap_name ?? opt.label ?? '';

  useEffect(() => {
    if (visible) {
      setSelectedIds(initialSelectedIds);
      setCustomCap('');
    }
  }, [visible]);

  const toggle = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const canApply = selectedIds.length > 0 || customCap.trim().length > 0;

  const handleApply = () => {
    if (!canApply) return;
    Keyboard.dismiss();
    onApply(selectedIds, customCap.trim());
  };

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  // Keyboard handling now lives entirely in BottomSheet, so this just
  // renders normally — no keyboardHeight tracking, no KeyboardAvoidingView.
  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title="Select CAP"
      subtitle="Corrective Action Plan"
      maxHeight={BASE_HEIGHT}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 4 }}>
        {capList.length === 0 ? (
          <Text style={styles.customCapLabel}>No CAP options available for this issue.</Text>
        ) : (
          capList.map((opt) => {
            const active = selectedIds.includes(opt.id);
            return (
              <Pressable
                key={opt.id}
                onPress={() => toggle(opt.id)}
                style={[styles.capOptionRow, active && styles.capOptionRowActive]}
              >
                {active ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={ms(20)}
                    color={AppColors.primary}
                    style={{ marginRight: ms(10) }}
                  />
                ) : (
                  <View style={styles.capRadio} />
                )}
                <Text style={[styles.capOptionText, active && styles.capOptionTextActive]} numberOfLines={2}>
                  {getLabel(opt)}
                </Text>
              </Pressable>
            );
          })
        )}

        <Text style={styles.customCapLabel}>CUSTOM CAP</Text>
        <TextInput
          value={customCap}
          onChangeText={setCustomCap}
          placeholder="Enter Custom CAP if not listed above"
          placeholderTextColor="#9CA3AF"
          style={styles.customCapInput}
        />
      </ScrollView>

      <Pressable
        onPress={handleApply}
        disabled={!canApply}
        style={[styles.applyBtn, canApply && styles.applyBtnActive]}
      >
        <Text style={[styles.applyBtnText, canApply && styles.applyBtnTextActive]}>Apply</Text>
      </Pressable>
    </BottomSheet>
  );
}
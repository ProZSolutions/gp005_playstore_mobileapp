import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, TextInput, KeyboardAvoidingView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import createStyles from '../../screens/styles/Sizewiseqtymodalstyles';
import TextStyles from '../../screens/styles/Text';

export default function SizeWiseQtyModal({
  visible,
  onClose,
  title,
  subtitle = 'Update Size-wise Quantities',
  balanceLabel,
  sizes = [],
  inputType = 'input',
  onApply,
}) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs } = useResponsive();
  const styles = createStyles(ms, mvs, fs);
 
  const [quantities, setQuantities] = useState({});
 
  // Reset/pre-fill quantities every time the sheet is opened.
  useEffect(() => {
    if (!visible) return;
    const initial = {};
    sizes.forEach((s) => {
      initial[s.id] = Math.min(Math.max(s.initialValue ?? 0, 0), s.max ?? 0);
    });
    setQuantities(initial);
  }, [visible, sizes]);
 
  const total = useMemo(
    () => Object.values(quantities).reduce((sum, n) => sum + (Number(n) || 0), 0),
    [quantities],
  );
 
  const clamp = (value, max) => Math.min(Math.max(value, 0), max ?? 0);
 
  const handleStep = (size, delta) => {
    if ((size.max ?? 0) <= 0) return;
    setQuantities((prev) => ({
      ...prev,
      [size.id]: clamp((prev[size.id] ?? 0) + delta, size.max),
    }));
  };
 
  const handleManualChange = (size, text) => {
    if ((size.max ?? 0) <= 0) return;
    const digitsOnly = text.replace(/[^0-9]/g, '');
    const parsed = digitsOnly === '' ? 0 : parseInt(digitsOnly, 10);
    setQuantities((prev) => ({
      ...prev,
      [size.id]: clamp(parsed, size.max),
    }));
  };
 
  // Same rule the Submit button on InputManagementScreen uses: disabled
  // until at least one unit has been entered.
  const applyDisabled = total === 0;
 
  const handleApply = () => {
    if (applyDisabled) return;
    const payload = sizes.map((s) => ({
      id: s.id,
      size: s.label,
      enter_values: quantities[s.id] ?? 0,
      input_type: inputType,
    }));
    onApply?.(payload);
    onClose?.();
  };
 
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Stop backdrop press from closing when tapping inside the sheet */}
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardWrap}
        >
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>
 
          <View style={styles.headerRow}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={ms(18)} color={AppColors.textSecondary} />
            </Pressable>
          </View>
 
          {!!balanceLabel && (
            <View style={styles.balanceLabelWrap}>
              <Text style={styles.balanceLabelText}>{balanceLabel}</Text>
            </View>
          )}
 
          {/*
            scrollArea gets flex:1 + minHeight:0 so it takes up whatever
            space is left after header/footer, and the ScrollView itself
            also needs style={{flex:1}} (not just its parent) — on Android,
            Yoga can otherwise resolve this to zero height and collapse the
            whole grid, which is what caused the "grid disappears / footer
            jumps up under the subtitle" bug. `sheet` also needs a fixed
            `height` (not just maxHeight) so this flex chain has something
            determinate to resolve against.
          */}
          <View style={styles.scrollArea}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.grid}>
                {sizes.map((size) => {
                  const disabled = (size.max ?? 0) <= 0;
                  const value = quantities[size.id] ?? 0;
                  const atMax = value >= (size.max ?? 0);
                  const atMin = value <= 0;
 
                  return (
                    <View key={size.id} style={styles.chipCol}>
                      <View style={[styles.chip, disabled && styles.chipDisabled]}>
                        <View style={styles.chipTopRow}>
                          <View style={styles.chipLabelPill}>
                            <Text style={styles.chipLabelText}>{size.label}</Text>
                          </View>
                          <Text style={styles.chipBalText}>
                            {size.balancePrefix ?? 'Bal'} {size.max ?? 0}
                          </Text>
                        </View>
 
                        <View style={styles.stepperRow}>
                          <Pressable
                            onPress={() => handleStep(size, -1)}
                            disabled={disabled || atMin}
                            style={[styles.stepperBtn, (disabled || atMin) && styles.stepperBtnDisabled]}
                          >
                            <Ionicons
                              name="remove"
                              size={ms(18)}
                              color={disabled || atMin ? AppColors.onSurfaceDisabled : AppColors.textPrimary}
                            />
                          </Pressable>
 
                          <View style={styles.stepperValueWrap}>
                            <TextInput
                              value={String(value)}
                              onChangeText={(text) => handleManualChange(size, text)}
                              editable={!disabled}
                              keyboardType="number-pad"
                              style={[styles.stepperValueInput, disabled && styles.stepperValueInputDisabled]}
                            />
                          </View>
 
                          <Pressable
                            onPress={() => handleStep(size, 1)}
                            disabled={disabled || atMax}
                            style={[styles.stepperBtn, (disabled || atMax) && styles.stepperBtnDisabled]}
                          >
                            <Ionicons
                              name="add"
                              size={ms(18)}
                              color={disabled || atMax ? AppColors.onSurfaceDisabled : AppColors.textPrimary}
                            />
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
 
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>{total}</Text>
            </View>
            {/*
              Apply button now mirrors the Submit button on
              InputManagementScreen exactly: disabled prop drives real
              non-interactivity, a dedicated disabled style swaps the
              background/text color, and press feedback (opacity) only
              applies while enabled.
            */}
            <Pressable
              onPress={handleApply}
              disabled={applyDisabled}
              style={({ pressed }) => [
                styles.applyBtn,
                applyDisabled && styles.applyBtnDisabled,
                pressed && !applyDisabled && { opacity: 0.9 },
              ]}
            >
              <Text style={[styles.applyBtnText, applyDisabled && styles.applyBtnTextDisabled]}>
                Apply
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
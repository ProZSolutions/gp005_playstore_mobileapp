import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { AppColors } from '../theme/theme';
import { useResponsive } from '../utils/responsive';
import btnStyles from './styles/ActionButtonStyles';
import { useOrientation } from '../hooks/useOrientation';


export function ActionButton({ label, onPress, disabled, loading }) {
  const { isLargeScreen } = useResponsive();
 const { isLandscape } = useOrientation();

  // Only apply the tablet-portrait "large" styling when we're NOT
  // in landscape — otherwise a tablet rotated sideways still gets
  // the 95px-tall button meant for a tall portrait screen.
  const applyLarge = isLargeScreen && !isLandscape;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      android_ripple={disabled ? undefined : { color: 'rgba(255,255,255,0.18)' }}
      style={({ pressed }) => [
        btnStyles.btn,
        btnStyles.primary,
        disabled && btnStyles.disabled,
        pressed && !disabled && btnStyles.pressed,
        applyLarge && tabletStyles.btnLarge,
        isLandscape && tabletStyles.btnLandscape,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {loading ? (
        <ActivityIndicator color={AppColors.onPrimary} />
      ) : (
        <Text
          style={[
            btnStyles.label,
            disabled && btnStyles.labelDisabled,
            applyLarge && tabletStyles.labelLarge,
            isLandscape && tabletStyles.labelLandscape,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export default ActionButton;

const tabletStyles = StyleSheet.create({
  btnLarge: {
    minHeight: 95,
    paddingVertical: 10,
    borderRadius: 25,
  },
  labelLarge: {
    fontSize: 25,
  },
  // Compact footer button for landscape, phone or tablet alike
  btnLandscape: {
    minHeight: 44,
    paddingVertical: 10,
    borderRadius: 12,
  },
  labelLandscape: {
    fontSize: 16,
  },
});
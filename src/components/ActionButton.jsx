// src/components/ActionButton.jsx
import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { AppColors } from '../theme/theme';
import { useResponsive } from '../utils/responsive';
import btnStyles from './styles/ActionButtonStyles';
 
export function ActionButton({ label, onPress, disabled, loading }) {
  const { isLargeScreen } = useResponsive();

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      android_ripple={disabled ? undefined : { color: 'rgba(255,255,255,0.18)' }}
      style={({ pressed }) => [
        btnStyles.btn,
        btnStyles.primary,
        disabled && btnStyles.disabled,
        pressed && !disabled && btnStyles.pressed, 
        isLargeScreen && tabletStyles.btnLarge,
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
            isLargeScreen && tabletStyles.labelLarge,
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
    paddingVertical: 15,
    borderRadius: 25,
  },
  labelLarge: {
    fontSize: 25,
  },
});
import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { AppColors } from '../theme/theme';
import { useResponsive } from '../utils/responsive';
import { useOrientation } from '../hooks/useOrientation';
import btnStyles from './styles/ActionButtonStyles';

export function ActionButton({
  label,
  onPress,
  disabled = false,
  loading = false,
}) {
  const { isLargeScreen } = useResponsive();
  const { isLandscape } = useOrientation();

  const isDisabled = disabled || loading;

  const buttonStyle = isLargeScreen
    ? styles.tabletButton
    : styles.mobileButton;

  const textStyle = isLargeScreen
    ? btnStyles.labellarge
    : btnStyles.label;

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      android_ripple={
        isDisabled
          ? undefined
          : { color: 'rgba(255,255,255,0.18)' }
      }
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      style={({ pressed }) => [
        btnStyles.btn,
        isLargeScreen && btnStyles.btnLarge,
        btnStyles.primary,
        buttonStyle,
        isDisabled && btnStyles.disabled,
        pressed && !isDisabled && btnStyles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={AppColors.onPrimary ?? '#FFFFFF'} />
      ) : (
        <Text
          style={[
            btnStyles.label,
            textStyle,
            isDisabled && btnStyles.labelDisabled,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export default ActionButton;

const styles = StyleSheet.create({
  mobileButton: {
    minHeight: 48,
    paddingVertical: 8,
    flexGrow: 0,
    flexShrink: 0,
  },

  tabletButton: {
    minHeight: 52,
    paddingVertical: 10,
    flexGrow: 0,
    flexShrink: 0,
  },
});
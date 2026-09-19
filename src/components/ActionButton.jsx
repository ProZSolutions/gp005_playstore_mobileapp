import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { AppColors } from '../theme/theme';
import { useResponsive } from '../utils/responsive';
import btnStyles from './styles/ActionButtonStyles';
import { useOrientation } from '../hooks/useOrientation';


export function ActionButton({ label, onPress, disabled, loading }) {
  const { isLargeScreen } = useResponsive();
 const { isLandscape } = useOrientation();
 
  const applyLarge = isLargeScreen && !isLandscape;
const pickStyle = (largePortrait, largeLandscape, mobilePortrait, mobileLandscape) =>
    isLargeScreen
      ? (isLandscape ? largeLandscape : largePortrait)
      : (isLandscape ? mobileLandscape : mobilePortrait);

  const textStyle = pickStyle(btnStyles.labellarge,btnStyles.labellarge,null,btnStyles.label);
    const btnStyle = pickStyle(btnStyles.btnLarge,btnStyles.btnLarge,null,btnStyles.btn);




  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      android_ripple={disabled ? undefined : { color: 'rgba(255,255,255,0.18)' }}
      style={({ pressed }) => [
        btnStyles.btn,
        btnStyles.primary,
        disabled && btnStyles.disabled,
        pressed && !disabled && btnStyles.pressed,
        btnStyle
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
            textStyle,
            disabled && btnStyles.labelDisabled,
            
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
    minHeight: 60,
     borderRadius: 25,
     paddingVertical: 20,  },
  labelLarge: {
    fontSize: 15,
  },
  // Compact footer button for landscape, phone or tablet alike
  btnLandscape: {
    minHeight: 60,
    paddingVertical: 20,
    borderRadius: 12,
  },
  labelLandscape: {
    fontSize: 15,
  },
});
// src/components/AppButton.jsx
import React from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, View, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { AppColors } from '../theme/theme';
import { useResponsive } from '../utils/responsive';

export function AppButton({
  label,
  variant = 'contained',
  size = 'md',
  status = 'primary',
  fullWidth = false,
  onPress,
  disabled = false,
  loading = false,
  icon,
  style,
}) {
  const { isLargeScreen } = useResponsive();

   const statusBase = {
    primary: AppColors.primary,
    success: AppColors.success,
    error:   AppColors.error,
    warning: AppColors.warning,
    info:    AppColors.info,
  }[status] ?? AppColors.primary;

  const statusLight = {
    primary: AppColors.primaryLight,
    success: AppColors.successLight,
    error:   AppColors.errorContainer,
    warning: AppColors.warningLight,
    info:    AppColors.infoLight,
  }[status] ?? AppColors.primaryLight;

  const isDisabled = disabled || loading;

  // ── Size map ──────────────────────────────────────────────────────────────
  // Mobile values are UNCHANGED from before. Large-screen values are
  // separate fixed numbers rather than the mobile numbers run through a
  // ratio-based scale() — that compounding is what made things blow up
  // in other components on wide tablets, so each size just gets its own
  // explicit tablet variant here instead.
  const sizeMap = {
    sm: { height: 36, fontSize: 15, paddingH: 14, radius: 10 },
    md: { height: 46, fontSize: 17, paddingH: 20, radius: 12 },
    lg: { height: 54, fontSize: 19, paddingH: 24, radius: 12 },
  };
  const sizeMapLarge = {
    sm: { height: 44, fontSize: 20, paddingH: 18, radius: 11 },
    md: { height: 56, fontSize: 25.5, paddingH: 26, radius: 14 },
    lg: { height: 64, fontSize: 30, paddingH: 30, radius: 14 },
  };
  const sz = (isLargeScreen ? sizeMapLarge[size] : sizeMap[size]) ?? sizeMap.md;

  // ── Derived colours ───────────────────────────────────────────────────────
  const bgColor = isDisabled
    ? AppColors.neutral200
    : variant === 'contained' ? statusBase
    : variant === 'tonal'     ? statusLight
    : AppColors.transparent;

  const textColor = isDisabled
    ? AppColors.neutral400
    : variant === 'contained' ? AppColors.white
    : statusBase;

  const borderColor =
    variant === 'outlined' && !isDisabled ? statusBase : AppColors.transparent;

  // Subtle teal glow on primary contained only
  const shadowStyle =
    variant === 'contained' && !isDisabled && status === 'primary'
      ? styles.shadowPrimary
      : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      accessibilityRole="button"
      style={[
        styles.base,
        {
          height:          sz.height,
          paddingHorizontal: sz.paddingH,
          backgroundColor: bgColor,
          borderRadius:    sz.radius,
          borderWidth:     variant === 'outlined' ? (isLargeScreen ? 2 : 1.5) : 0,
          borderColor,
        },
        shadowStyle,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size={isLargeScreen ? 'small' : 'small'}
          color={variant === 'contained' ? AppColors.white : statusBase}
        />
      ) : (
        <View style={styles.inner}>
          {icon ? (
            <View style={[styles.iconWrap, isLargeScreen && styles.iconWrapLarge]}>
              {icon}
            </View>
          ) : null}
          <Text
            style={[
              styles.label,
              { fontSize: sz.fontSize, color: textColor },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
  },
  fullWidth: { width: '100%' },
  inner:     { flexDirection: 'row', alignItems: 'center' },
  iconWrap:  { marginRight: 8 },
  iconWrapLarge: { marginRight: 10 },
  label: {
    fontWeight:    '600',
    letterSpacing: 0.5,
    textAlign:     'center',
  },
  shadowPrimary: Platform.select({
    ios: {
      shadowColor:   '#1A9E96',
      shadowOffset:  { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius:  10,
    },
    android: { elevation: 5 },
    default: {},
  }),
});
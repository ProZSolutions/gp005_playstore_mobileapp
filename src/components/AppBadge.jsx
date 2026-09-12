// src/components/AppBadge.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppColors } from '../theme/theme';

/**
 * AppBadge
 *
 * Two modes:
 *   numeric  → small circular red dot with count (e.g. notification badge)
 *   status   → pill label with tinted background  (e.g. "Green", "Blue", "Morning ✓")
 *
 * Props:
 *  - count   (number)  numeric value — shows '99+' above 99  [numeric mode]
 *  - label   (string)  text to display — overrides count     [status mode]
 *  - color   (string)  pill text + border colour  (default: AppColors.primary)
 *  - variant (string)  'ghost' | 'filled' | 'outline'  (default: 'ghost')
 *  - size    (number)  badge circle size in numeric mode  (default: 20)
 *  - visible (bool)    show / hide  (default: true)
 *  - dot     (bool)    show colour dot before label
 *  - style   (object)
 *
 * Examples:
 *  // Screenshot 1 — line status
 *  <AppBadge label="Green" color={AppColors.lineGreen} />
 *  <AppBadge label="Blue"  color={AppColors.lineBlue} />
 *  <AppBadge label="Red"   color={AppColors.lineRed} />
 *
 *  // Screenshot 1 — shift chip
 *  <AppBadge label="✓ Morning" color={AppColors.primary} variant="ghost" />
 *
 *  // Numeric notification dot
 *  <AppBadge count={7} />
 *  <AppBadge count={120} />  // shows "99+"
 */
export function AppBadge({
  count,
  label,
  color   = AppColors.primary,
  variant = 'ghost',
  size    = 20,
  visible = true,
  dot     = false,
  style,
}) {
  if (!visible) return null;

  // ── Numeric mode ──────────────────────────────────────────────────────────
  if (label === undefined && count !== undefined) {
    const display = count > 99 ? '99+' : String(count);
    return (
      <View
        style={[
          styles.numericBadge,
          { width: size, height: size, borderRadius: size / 2,
            backgroundColor: AppColors.error },
          style,
        ]}
      >
        <Text style={[styles.numericText, { fontSize: size * 0.52 }]}>
          {display}
        </Text>
      </View>
    );
  }

  // ── Status pill ───────────────────────────────────────────────────────────
  const pillBg = variant === 'filled'
    ? color
    : variant === 'outline'
    ? AppColors.transparent
    : `${color}18`;              // ghost: 9 % opacity tint

  const pillText = variant === 'filled' ? AppColors.white : color;

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: pillBg,
          borderColor:     variant === 'outline' ? color : AppColors.transparent,
          borderWidth:     variant === 'outline' ? 1 : 0,
        },
        style,
      ]}
    >
      {dot ? (
        <View style={[styles.dot, { backgroundColor: pillText }]} />
      ) : null}
      <Text style={[styles.pillText, { color: pillText }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Numeric
  numericBadge: {
    justifyContent: 'center',
    alignItems:     'center',
  },
  numericText: {
    color:      AppColors.white,
    fontWeight: '700',
  },

  // Status pill
  pill: {
    flexDirection:  'row',
    alignItems:     'center',
    alignSelf:      'flex-start',
    borderRadius:   20,
    paddingHorizontal: 10,
    paddingVertical:   4,
  },
  dot: {
    width:        6,
    height:       6,
    borderRadius: 3,
    marginRight:  5,
  },
  pillText: {
    fontSize:      13,
    fontWeight:    '600',
    letterSpacing: 0.1,
  },
});

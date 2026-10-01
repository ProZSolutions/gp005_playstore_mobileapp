// src/components/AppSnackbar.jsx
import React, { useEffect, useRef } from 'react';
import {
  StyleSheet, Animated, Text, TouchableOpacity,
  View, Platform,
} from 'react-native';
import { AppColors } from '../theme/theme';

/**
 * AppSnackbar — toast-style notification at bottom of screen
 * Props:
 *  - visible   (bool)   show / hide
 *  - message   (string) required
 *  - onDismiss (func)   called on auto-dismiss or action
 *  - duration  (number) ms before auto-dismiss (default: 3000)
 *  - action    (object) { label, onPress }  optional action button
 *  - status    (string) 'default' | 'success' | 'error' | 'warning'
 *
 * Example:
 *  <AppSnackbar
 *    visible={snackVisible}
 *    message="Saved successfully!"
 *    onDismiss={() => setSnackVisible(false)}
 *    action={{ label: 'Undo', onPress: handleUndo }}
 *    status="success"
 *  />
 */
export function AppSnackbar({
  visible,
  message,
  onDismiss,
  duration = 3000,
  action,
  status   = 'default',
}) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
      const t = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(
          () => onDismiss?.()
        );
      }, duration);
      return () => clearTimeout(t);
    } else {
      opacity.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const statusColor = {
    success: AppColors.success,
    error:   AppColors.error,
    warning: AppColors.warning,
    default: AppColors.neutral800,
  }[status] ?? AppColors.neutral800;

  const leftAccent = status !== 'default' ? statusColor : null;

  return (
    <Animated.View
      style={[
        styles.snack,
        { opacity },
        leftAccent && { borderLeftColor: leftAccent, borderLeftWidth: 4 },
      ]}
    >
      <Text style={styles.message} numberOfLines={2}>{message}</Text>
      {action ? (
        <TouchableOpacity
          onPress={() => { action.onPress?.(); onDismiss?.(); }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.actionLabel}>{action.label}</Text>
        </TouchableOpacity>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  snack: {
    position:        'absolute',
    bottom:          Platform.OS === 'ios' ? 48 : 28,
    left:            16,
    right:           16,
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: AppColors.neutral900,
    borderRadius:    12,
    paddingHorizontal: 16,
    paddingVertical:   14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  message: {
    flex:          1,
    fontSize:      14,
    color:         AppColors.white,
    fontWeight:    '400',
    letterSpacing: 0.1,
    marginRight:   12,
  },
  actionLabel: {
    fontSize:      14,
    fontWeight:    '700',
    color:         AppColors.primaryLight,
    letterSpacing: 0.3,
  },
});

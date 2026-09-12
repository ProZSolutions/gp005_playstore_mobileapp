import React, { useEffect, useRef } from 'react';
import {
  Animated, StyleSheet, Text, View, Pressable, Platform, useWindowDimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppColors } from '../theme/theme';

const AUTO_DISMISS_MS = 3000;

export default function WelcomeToast({ visible, name, onHide }) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(hide, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -120, duration: 250, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onHide && onHide());
  };

  // NOTE: we intentionally do NOT `return null` when !visible.
  // Unmounting this Animated.View right as a native-driven transform
  // finishes is what was leaving a stale painted layer behind on
  // Android (the white/blank header). Instead we keep it mounted at
  // all times, parked off-screen (translateY: -120, opacity: 0) and
  // non-interactive, and only animate it in/out.

  return (
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
      style={[
        styles.wrapper,
        isLargeScreen && styles.wrapperTablet,
        { transform: [{ translateY }], opacity },
      ]}
    >
      <Pressable
        style={[styles.card, isLargeScreen && styles.cardTablet]}
        onPress={hide}
      >
        <View style={[styles.iconCircle, isLargeScreen && styles.iconCircleTablet]}>
          <Ionicons
            name="checkmark-circle"
            size={isLargeScreen ? 26 : 22}
            color={AppColors.primary}
          />
        </View>
        <View style={styles.textWrap}>
          <Text
            style={[styles.title, isLargeScreen && styles.titleTablet]}
            numberOfLines={1}
          >
            Welcome back{name ? `, ${name}` : ''} 👋
          </Text>
          <Text style={[styles.subtitle, isLargeScreen && styles.subtitleTablet]}>
            Glad to see you again
          </Text>
        </View>

      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 30,
    left: 16,
    right: 16,
    zIndex: 999,
    // elevation removed from the animated wrapper on purpose: combining
    // Android `elevation` (which forces its own compositing layer) with
    // a native-driven transform on a view that mounts/unmounts caused
    // the stale white layer over the header. Shadow/elevation now lives
    // only on the inner, non-animated `card` below.
  },
  // Tablet: don't stretch edge-to-edge — center a fixed-width card instead.
  wrapperTablet: {
    left: 0,
    right: 0,
    top: 40,
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  cardTablet: {
    width: 460,
    maxWidth: '90%',
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 20,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF7F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconCircleTablet: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 16,
  },
  textWrap: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  titleTablet: { fontSize: 17 },
  subtitle: { fontSize: 12.5, color: '#6B7280', marginTop: 2 },
  subtitleTablet: { fontSize: 14, marginTop: 3 },
});
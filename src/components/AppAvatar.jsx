// src/components/AppAvatar.jsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { AppColors } from '../theme/theme';

/**
 * AppAvatar
 * Props:
 *  - type    (string)  'image' | 'icon' | 'text'  (default: 'text')
 *  - source  (string)  image URI — used when type='image'
 *  - icon    (node)    React element icon — used when type='icon'
 *  - label   (string)  1–2 char initials — used when type='text'
 *  - size    (number)  diameter in px (default: 48)
 *  - color   (string)  background color override
 *  - style   (object)  extra container style
 *
 * Examples:
 *  // Screenshot 1 — "RK" avatar top-right
 *  <AppAvatar type="text" label="RK" size={48} />
 *
 *  <AppAvatar type="image" source="https://i.pravatar.cc/100" size={52} />
 *  <AppAvatar type="icon"  icon={<Icon name="account" size={24} color="#fff" />} size={52} />
 */
export function AppAvatar({ type = 'text', source, icon, label, size = 48, color, style }) {
  const bg     = color ?? AppColors.primaryContainer;
  const radius = size / 2;

  if (type === 'image' && source) {
    return (
      <Image
        source={{ uri: source }}
        style={[
          { width: size, height: size, borderRadius: radius },
          style,
        ]}
      />
    );
  }

  if (type === 'icon' && icon) {
    return (
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: radius, backgroundColor: bg },
          style,
        ]}
      >
        {icon}
      </View>
    );
  }

  // text / initials
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: radius, backgroundColor: bg },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38, color: AppColors.onPrimaryContainer }]}>
        {(label ?? '?').toUpperCase().slice(0, 2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    justifyContent: 'center',
    alignItems:     'center',
    overflow:       'hidden',
  },
  initials: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

// src/components/AppHeader.jsx
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { AppColors } from '../theme/theme';

/**
 * AppHeader
 * Props:
 *  - title        (string)
 *  - subtitle     (string)
 *  - leftIcon     (node)   custom element (e.g. back arrow)
 *  - rightIcon    (node)   custom element (e.g. menu, profile)
 *  - onLeftPress  (func)
 *  - onRightPress (func)
 *  - center       (bool)   center title
 *  - style        (object)
 *
 * Example:
 *  <AppHeader
 *    title="Home"
 *    leftIcon={<Icon name="arrow-back" />}
 *    onLeftPress={() => navigation.goBack()}
 *  />
 */

export function AppHeader({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  center = false,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      {/* Left */}
      <View style={styles.side}>
        {leftIcon ? (
          <TouchableOpacity onPress={onLeftPress} style={styles.iconBtn}>
            {leftIcon}
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Center */}
      <View style={[styles.center, center && { alignItems: 'center' }]}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Right */}
      <View style={[styles.side, { alignItems: 'flex-end' }]}>
        {rightIcon ? (
          <TouchableOpacity onPress={onRightPress} style={styles.iconBtn}>
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    paddingHorizontal: 16,
    backgroundColor: AppColors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  side: {
    width: 40,
    justifyContent: 'center',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },

  subtitle: {
    fontSize: 12,
    color: AppColors.textTertiary,
    marginTop: 2,
  },

  iconBtn: {
    padding: 6,
  },
});
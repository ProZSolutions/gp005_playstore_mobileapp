// src/components/AppListItem.jsx
import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Platform } from 'react-native';
import { AppColors } from '../theme/theme';

/**
 * AppListItem
 * Props:
 *  - title          (string)  required — primary text  e.g. "Line 1"
 *  - description    (string)  secondary text e.g. "17254 · M&S Polo"
 *  - index          (number|string) number shown in the left circle
 *  - leftIcon       (node)    custom left element (overrides index circle)
 *  - rightLabel     (string)  coloured right text e.g. "Green", "Blue"
 *  - rightLabelColor(string)  hex colour for rightLabel
 *  - rightIcon      (node)    custom right element (overrides rightLabel)
 *  - onPress        (func)    makes item pressable
 *  - selected       (bool)    teal left accent + border
 *  - showDivider    (bool)    thin divider below (default: false)
 *  - disabled       (bool)
 *  - style          (object)
 *  - titleStyle     (object)
 *  - descriptionStyle (object)
 *
 * Examples:
 *  // Screenshot 1 — production line row
 *  <AppListItem index={1} title="Line 1" description="17254 · M&S Polo"
 *    rightLabel="Green" rightLabelColor={AppColors.lineGreen} onPress={() => pick(1)} />
 *
 *  // Classic icon list row
 *  <AppListItem leftIcon={<Icon name="inbox" />} title="Inbox"
 *    description="5 items" rightIcon={<Icon name="chevron-right" />} onPress={go} />
 */
export function AppListItem({
  title,
  description,
  index,
  leftIcon,
  rightLabel,
  rightLabelColor,
  rightIcon,
  onPress,
  selected     = false,
  showDivider  = false,
  disabled     = false,
  style,
  titleStyle,
  descriptionStyle,
}) {
  const Container = onPress ? TouchableOpacity : View;
  const containerProps = onPress
    ? { onPress, activeOpacity: 0.76, disabled, accessibilityRole: 'button' }
    : {};

  return (
    <>
      <Container
        {...containerProps}
        style={[
          styles.row,
          {
            borderColor:     selected ? AppColors.primary : AppColors.border,
            borderWidth:     selected ? 1.5 : 1,
            backgroundColor: selected ? AppColors.primaryLight : AppColors.surface,
          },
          disabled && styles.disabled,
          style,
        ]}
      >
        {/* Left: number circle or custom icon */}
        {(index !== undefined || leftIcon) ? (
          <View style={[
            styles.leftCircle,
            { backgroundColor: AppColors.surfaceVariant },
          ]}>
            {leftIcon ?? (
              <Text style={styles.indexText}>{String(index)}</Text>
            )}
          </View>
        ) : null}

        {/* Centre: title + description */}
        <View style={styles.textBlock}>
          <Text
            style={[styles.title, titleStyle]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {description ? (
            <Text
              style={[styles.description, descriptionStyle]}
              numberOfLines={1}
            >
              {description}
            </Text>
          ) : null}
        </View>

        {/* Right: coloured label or custom node */}
        {rightIcon ?? (rightLabel ? (
          <Text style={[styles.rightLabel, { color: rightLabelColor ?? AppColors.primary }]}>
            {rightLabel}
          </Text>
        ) : null)}
      </Container>

      {showDivider ? (
        <View style={styles.divider} />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    borderRadius:   14,
    paddingHorizontal: 14,
    paddingVertical:   14,
    marginBottom:   10,
    ...Platform.select({
      ios: {
        shadowColor:   '#000',
        shadowOffset:  { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius:  4,
      },
      android: { elevation: 1 },
    }),
  },
  disabled: { opacity: 0.5 },

  // Left circle
  leftCircle: {
    width:          36,
    height:         36,
    borderRadius:   18,
    justifyContent: 'center',
    alignItems:     'center',
    marginRight:    12,
  },
  indexText: {
    fontSize:   14,
    fontWeight: '600',
    color:      AppColors.textSecondary,
  },

  // Centre
  textBlock: { flex: 1, marginRight: 8 },
  title: {
    fontSize:      15,
    fontWeight:    '600',
    color:         AppColors.textPrimary,
    marginBottom:  2,
  },
  description: {
    fontSize:  13,
    color:     AppColors.textSecondary,
  },

  // Right
  rightLabel: {
    fontSize:      14,
    fontWeight:    '600',
  },
  divider: {
    height:            1,
    backgroundColor:   AppColors.divider,
    marginHorizontal:  16,
    marginBottom:      10,
  },
});

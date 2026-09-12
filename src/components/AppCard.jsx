// src/components/AppCard.jsx
import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { AppColors } from '../theme/theme';

/**
 * AppCard
 * Props:
 *  - title       (string)  required — card heading
 *  - subtitle    (string)  smaller grey text under title
 *  - content     (string)  body paragraph text
 *  - coverImage  (string)  image URI for top cover (uses Paper Card.Cover)
 *  - onPress     (func)    makes whole card pressable
 *  - actions     (node)    elements for the bottom actions row
 *  - selected    (bool)    highlights card with teal border
 *  - style       (object)  extra card container style
 *  - elevation   (number)  0–5 (default: 1)
 *  - children    (node)    custom body (replaces title/subtitle/content)
 *
 * Examples:
 *  // Basic info card
 *  <AppCard title="React Native Paper" subtitle="Material Design 3"
 *    content="Build beautiful cross-platform apps." onPress={doSomething} />
 *
 *  // Custom body
 *  <AppCard selected onPress={selectLine}>
 *    <Text>Line 1</Text>
 *  </AppCard>
 *
 *  // With action buttons
 *  <AppCard title="Order #17254" actions={<AppButton label="View" onPress={view} />} />
 */
export function AppCard({
  title,
  subtitle,
  content,
  coverImage,
  onPress,
  actions,
  selected  = false,
  style,
  elevation = 1,
  children,
}) {
  const Container = onPress ? TouchableOpacity : View;

  const containerProps = onPress
    ? { onPress, activeOpacity: 0.78, accessibilityRole: 'button' }
    : {};

  return (
    <Container
      {...containerProps}
      style={[
        styles.card,
        {
          borderColor:     selected ? AppColors.primary : AppColors.border,
          borderWidth:     selected ? 1.5 : 1,
          backgroundColor: AppColors.surface,
        },
        elevation > 0 && shadowForElevation(elevation),
        style,
      ]}
    >
      {children ? (
        <View style={styles.body}>{children}</View>
      ) : (
        <>
          {/* Header */}
          {(title || subtitle) ? (
            <View style={styles.header}>
              {title ? (
                <Text style={styles.title}>{title}</Text>
              ) : null}
              {subtitle ? (
                <Text style={styles.subtitle}>{subtitle}</Text>
              ) : null}
            </View>
          ) : null}

          {/* Body text */}
          {content ? (
            <View style={styles.body}>
              <Text style={styles.content}>{content}</Text>
            </View>
          ) : null}

          {/* Actions */}
          {actions ? (
            <View style={styles.actions}>{actions}</View>
          ) : null}
        </>
      )}
    </Container>
  );
}

function shadowForElevation(e) {
  return Platform.select({
    ios: {
      shadowColor:   '#000',
      shadowOffset:  { width: 0, height: e },
      shadowOpacity: 0.04 + e * 0.02,
      shadowRadius:  e * 3,
    },
    android: { elevation: e },
    default: {},
  });
}

const styles = StyleSheet.create({
  card: {
    borderRadius:  16,
    marginBottom:  12,
    overflow:      'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop:    16,
    paddingBottom: 8,
  },
  title: {
    fontSize:      16,
    fontWeight:    '600',
    color:         AppColors.textPrimary,
    marginBottom:  2,
  },
  subtitle: {
    fontSize:  13,
    color:     AppColors.textSecondary,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom:     16,
  },
  content: {
    fontSize:     14,
    lineHeight:   22,
    color:        AppColors.textSecondary,
  },
  actions: {
    flexDirection:  'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom:  12,
    gap:            8,
  },
});

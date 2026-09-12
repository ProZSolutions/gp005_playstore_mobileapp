// src/components/AppModal.jsx
import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Modal, Platform } from 'react-native';
import { AppColors } from '../theme/theme';

/**
 * AppModal
 * Props:
 *  - visible     (bool)   required
 *  - onDismiss   (func)   required — backdrop tap or back button
 *  - title       (string) optional heading
 *  - children    (node)   body content
 *  - dismissable (bool)   tap backdrop to close (default: true)
 *  - style       (object) container override
 *
 * Example:
 *  <AppModal visible={show} onDismiss={() => setShow(false)} title="Confirm">
 *    <Text>Are you sure?</Text>
 *    <AppButton label="Yes" onPress={confirm} />
 *  </AppModal>
 */
export function AppModal({ visible, onDismiss, title, children, dismissable = true, style }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissable ? onDismiss : undefined}
    >
      {/* Scrim */}
      {dismissable ? (
        <TouchableOpacity
          style={styles.scrim}
          activeOpacity={1}
          onPress={onDismiss}
        />
      ) : (
        <View style={styles.scrim} />
      )}

      {/* Card */}
      <View style={styles.centreWrap} pointerEvents="box-none">
        <View style={[styles.card, style]}>
          {title ? (
            <View style={styles.titleRow}>
              <Text style={styles.title}>{title}</Text>
            </View>
          ) : null}
          <View style={styles.body}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position:        'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: AppColors.scrim,
  },
  centreWrap: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
    padding:        24,
  },
  card: {
    width:           '100%',
    backgroundColor: AppColors.surface,
    borderRadius:    20,
    overflow:        'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24 },
      android: { elevation: 12 },
    }),
  },
  titleRow: {
    borderBottomWidth: 1,
    borderBottomColor: AppColors.divider,
    paddingHorizontal: 24,
    paddingVertical:   18,
  },
  title: {
    fontSize:      18,
    fontWeight:    '700',
    color:         AppColors.textPrimary,
    letterSpacing: -0.3,
  },
  body: {
    padding: 24,
  },
});

import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { AppColors } from '../theme/theme';

/**
 * CommonBottomModal
 * A generic bottom-sheet modal shell — title + close button + scrollable
 * body — meant to be reused anywhere a screen needs a slide-up sheet
 * (array details, filters, confirmations, etc.), instead of every screen
 * defining its own <Modal> markup inline.
 *
 * Usage:
 *   <CommonBottomModal visible={open} onClose={() => setOpen(false)} title="Defects (3)">
 *     ...any content...
 *   </CommonBottomModal>
 */
export default function CommonBottomModal({ visible, onClose, title, ms = (n) => n, children }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={ms(20)} color={AppColors.textTertiary} />
            </Pressable>
          </View>
          <View style={styles.body}>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  title: { fontSize: 15, fontWeight: '700', color: AppColors.textPrimary ?? '#222', flex: 1, marginRight: 12 },
  body: { flexShrink: 1 },
});
import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppColors } from '../theme/theme';

export default function ManagerOverrideMenu({ visible, onClose, onCloseWithoutCap, styles, ms }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.menuOverlay} onPress={onClose}>
        <View style={styles.menuCard}>
          <View style={styles.menuHeaderRow}>
            <Ionicons name="warning-outline" size={ms(14)} color={AppColors.textTertiary} />
            <Text style={styles.menuHeaderText}>MANAGER OVERRIDE</Text>
          </View>
          <View style={styles.menuDivider} />
          <Pressable
            onPress={() => {
              onClose();
              onCloseWithoutCap();
            }}
            style={({ pressed }) => [styles.menuItemRow, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="close-circle-outline" size={ms(16)} color={AppColors.error} />
            <Text style={styles.menuItemText}>Close without CAP</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
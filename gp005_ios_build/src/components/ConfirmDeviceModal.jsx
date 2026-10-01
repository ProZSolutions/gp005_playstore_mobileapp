import React, { useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppColors } from '../theme/theme';
import { scale, verticalScale } from '../utils/scale';
import BottomSheet from './BottomSheet';

export default function ConfirmDeviceModal({ visible, onClose, device, onConfirm, styles, loading = false }) {
 
  useEffect(() => {
   }, [device]);

  useEffect(() => {
   }, [visible]);

  useEffect(() => {
   }, [loading]);

  if (!device) {
     return null;
  }

 
  const handleConfirmPress = () => {
     onConfirm?.();
  };

  const handleClosePress = () => {
     onClose?.();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClosePress}
      title="Confirm Device"
      subtitle="Review details before adding"
    >
      <View style={{ paddingHorizontal: scale(20), paddingTop: verticalScale(16) }}>
        <View style={styles.sheetFieldRow}>
          <View style={styles.sheetFieldIconWrap}>
            <Ionicons name="phone-portrait-outline" size={16} color={AppColors.primary} />
          </View>
          <View>
            <Text style={styles.sheetFieldLabel}>Qone Device ID</Text>
            <Text style={styles.sheetFieldValue}>{`${device.id} - ${device.tls_code}` }</Text>
          </View>
        </View>

        <View style={styles.sheetFieldRow}>
          <View style={styles.sheetFieldIconWrap}>
            <Ionicons name="phone-portrait-outline" size={16} color={AppColors.primary} />
          </View>
          <View>
            <Text style={styles.sheetFieldLabel}>Machine No.</Text>
            <Text style={styles.sheetFieldValue}>{`${device.machineNo} - ${device.machineType}`}</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.sheetAddBtn,
            (pressed || loading) && { opacity: 0.7 },
          ]}
          onPress={handleConfirmPress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sheetAddBtnText}>+ Add Device</Text>
          )}
        </Pressable>
      </View>
    </BottomSheet>
  );
}
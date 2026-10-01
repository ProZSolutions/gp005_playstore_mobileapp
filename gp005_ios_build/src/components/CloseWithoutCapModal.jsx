import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Keyboard } from 'react-native';
import BottomSheet from './BottomSheet';
import { verticalScale } from '../utils/scale';

const MAX_LEN = 300;
const BASE_HEIGHT = verticalScale(420);

export default function CloseWithoutCapModal({ visible, onClose, onCloseIssue, styles }) {
  const [reason, setReason] = useState('');

  const handleClose = () => {
    Keyboard.dismiss();
    setReason('');
    onClose();
  };

  const handleContinue = () => {
    const value = reason;
    Keyboard.dismiss();
    setReason('');
    onCloseIssue(value); // parent now navigates to CapInformation with this reason
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title="Close without CAP"
      subtitle="This will close the issue without a CAP. A reason is required."
      maxHeight={BASE_HEIGHT}
    >
      <View style={styles.horizontalPadd}>
        <View style={styles.sheetLabelRow}>
          <Text style={styles.sheetLabel}>
            Reason for Closure<Text style={styles.requiredMark}>*</Text>
          </Text>
          <Text style={styles.sheetCounter}>{reason.length}/{MAX_LEN}</Text>
        </View>

        <TextInput
          value={reason}
          onChangeText={(t) => setReason(t.slice(0, MAX_LEN))}
          placeholder="Enter the reason for closing without CAP..."
          placeholderTextColor="#9CA3AF"
          multiline
          style={styles.reasonInput}
        />

        <View style={styles.sheetFooterRow}>
          <Pressable
            style={({ pressed }) => [styles.sheetCancelBtn, pressed && { opacity: 0.85 }]}
            onPress={handleClose}
          >
            <Text style={styles.sheetCancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.sheetDangerBtn,
              pressed && { opacity: 0.85 },
              !reason.trim() && { opacity: 0.5 },
            ]}
            onPress={handleContinue}
            disabled={!reason.trim()}
          >
            <Text style={styles.sheetDangerBtnText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}
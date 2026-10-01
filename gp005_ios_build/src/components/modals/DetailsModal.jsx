import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { scale, verticalScale, screen } from '../../utils/scale';

const FIELD_ROWS = [
  [
    { icon: 'zap', label: 'Line No.', key: 'lineNo' },
    { icon: 'monitor', label: 'Workstation', key: 'workstationDisplay' },
  ],
  [
    { icon: 'hash', label: 'TLS ID', key: 'tlsId' },
    { icon: 'user', label: 'Buyer', key: 'buyer' },
  ],
  [
    { icon: 'list', label: 'Order No', key: 'orderNo' },
    { icon: 'tag', label: 'Style Number', key: 'styleNumber' },
  ],
  [
    { icon: 'shopping-bag', label: 'Style Name', key: 'styleName' },
    { icon: 'droplet', label: 'Color', key: 'color' },
  ],
  [
    { icon: 'calendar', label: 'Audit Date', key: 'auditDate' },
    { icon: 'clock', label: 'Slot', key: 'slot' },
  ],
];

export default function DetailsModal({ visible, details, onClose, onProceed }) {
  const insets = useSafeAreaInsets();

  if (!details) return null;

  const data = {
    ...details,
    workstationDisplay: `${details.workstation} (${details.workstationNo})`,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            { maxHeight: screen.height * 0.82, paddingBottom: insets.bottom || verticalScale(14) },
          ]}
        >
          <View style={styles.grabber} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Details</Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Icon name="x" size={scale(18)} color="#1F2937" />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {FIELD_ROWS.map((row, i) => (
              <View style={styles.row} key={i}>
                {row.map((field) => (
                  <View style={styles.cell} key={field.key}>
                    <Icon
                      name={field.icon}
                      size={scale(15)}
                      color="#11A9A0"
                      style={styles.cellIcon}
                    />
                    <View style={styles.cellText}>
                      <Text style={styles.cellValue} numberOfLines={1}>
                        {data[field.key]}
                      </Text>
                      <Text style={styles.cellLabel}>{field.label}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>

          <Pressable style={styles.proceedButton} onPress={onProceed}>
            <Text style={styles.proceedButtonText}>Proceed to Process Audit</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: scale(18),
    borderTopRightRadius: scale(18),
    paddingHorizontal: scale(18),
    paddingTop: verticalScale(8),
    width: '100%',
    alignSelf: 'center',
    maxWidth: screen.isTablet ? 560 : undefined,
  },
  grabber: {
    width: scale(34),
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: verticalScale(10),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
  },
  headerTitle: {
    // was 18 — reduced
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  scrollContent: { paddingBottom: verticalScale(6) },
  row: {
    flexDirection: 'row',
    marginBottom: verticalScale(14),
    gap: scale(10),
  },
  cell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(6),
  },
  cellIcon: { marginTop: 2 },
  cellText: { flex: 1 },
  cellValue: {
    // was 14 — reduced
    fontSize: 12.5,
    fontWeight: '600',
    color: '#111827',
  },
  cellLabel: {
    // was 11 — reduced
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
  },

  proceedButton: {
    backgroundColor: '#11A9A0',
    borderRadius: scale(8),
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    marginTop: verticalScale(2),
  },
  proceedButtonText: {
    // was 15 — reduced
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },
});
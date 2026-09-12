
import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { Colors } from '../../theme/common';
import { scale, verticalScale, screen } from '../../utils/scale';

export default function ProductDetailsModal({ visible, details, onClose }) {
  const insets = useSafeAreaInsets();

  if (!details) return null;

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
            { paddingBottom: insets.bottom || verticalScale(14) },
          ]}
        >
          <View style={styles.grabber} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Product Details</Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Icon name="x" size={scale(18)} color={Colors.ink} />
            </Pressable>
          </View>

          <View style={styles.rowFull}>
            <Icon name="shopping-bag" size={scale(16)} color={Colors.teal} style={styles.icon} />
            <View style={styles.cellText}>
              <Text style={styles.cellValue}>
                {details.buyer} | {details.styleName}
              </Text>
              <Text style={styles.cellLabel}>Buyer & Style Name</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.cell}>
              <Icon name="monitor" size={scale(15)} color={Colors.teal} style={styles.icon} />
              <View style={styles.cellText}>
                <Text style={styles.cellValue}>{details.lineNo}</Text>
                <Text style={styles.cellLabel}>Line</Text>
              </View>
            </View>
            <View style={styles.cell}>
              <Icon name="list" size={scale(15)} color={Colors.teal} style={styles.icon} />
              <View style={styles.cellText}>
                <Text style={styles.cellValue}>{details.orderNo}</Text>
                <Text style={styles.cellLabel}>Order No</Text>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.cell}>
              <Icon name="tag" size={scale(15)} color={Colors.teal} style={styles.icon} />
              <View style={styles.cellText}>
                <Text style={styles.cellValue}>{details.styleNumber}</Text>
                <Text style={styles.cellLabel}>Style Number</Text>
              </View>
            </View>
            <View style={styles.cell}>
              <Icon name="droplet" size={scale(15)} color={Colors.teal} style={styles.icon} />
              <View style={styles.cellText}>
                <Text style={styles.cellValue}>{details.color}</Text>
                <Text style={styles.cellLabel}>Color</Text>
              </View>
            </View>
          </View>
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
    backgroundColor: Colors.white,
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
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: verticalScale(10),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
  },

  rowFull: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(8),
    marginBottom: verticalScale(18),
  },
  row: {
    flexDirection: 'row',
    marginBottom: verticalScale(16),
    gap: scale(10),
  },
  cell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(6),
  },
  icon: { marginTop: 2 },
  cellText: { flex: 1 },
  cellValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.ink,
  },
  cellLabel: {
    fontSize: 10,
    color: Colors.muted,
    marginTop: 1,
  },
});
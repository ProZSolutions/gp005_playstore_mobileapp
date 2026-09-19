import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import createStyles from '../styles/InputManagementStyles';
import { createInputEntry, resolveShiftId } from '../../api/services/inputModuleService';
import { usePermissions, GROUP, ACTION } from '../../context/PermissionsContext';
import SizeWiseQtyModal from '../../components/modals/SizewiseQtyModal';
import { showAlert } from '../../utils/AlertService';
import reworkService, { mapOrderSizes } from '../../api/services/rejectionService';
import { useKeyboardOverlap } from '../../hooks/useKeyboardOverlap';

const TEAL = AppColors.primary;
const LISTING_SCREEN = 'InputListScreen';

function DetailRow({ label, value, styles, bordered, accent }) {
  return (
    <View style={[styles.detailRow, bordered && styles.detailRowBorder]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, accent && styles.detailValueAccent]}>{value}</Text>
    </View>
  );
}

export default function InputManagementScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs } = useResponsive();
  const styles = createStyles(ms, mvs, fs);
  const {
    order,
    operator,
    user,
    zone,
    line,
    lineId,
    shiftID,
    lineNames,
    lineName,
  } = route?.params ?? {};
  console.log("line id " + lineId + "order " + JSON.stringify(order) + "  operator " + JSON.stringify(operator));
  const { can, loading: permissionsLoading } = usePermissions();
  const canCreate = can(GROUP.INPUTMODULE, ACTION.CREATE);

  const [outputBalance, setOutputBalance] = useState('0');
  const [notes, setNotes] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [qtyModalVisible, setQtyModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [entries, setEntries] = useState({});

  // ---- Keyboard handling: keep the Notes field visible ----
  const contentRef = useRef(null);      // wraps body + footer (everything under the header)
  const scrollRef = useRef(null);
  const notesFocusedRef = useRef(false);
  const keyboardOverlap = useKeyboardOverlap(contentRef);

  // Notes is the last section, so "scroll to end" brings it into view. Called
  // when the ScrollView shrinks (keyboard opened) and when the multiline input
  // grows while typing.
  const scrollNotesIntoView = useCallback(() => {
    if (notesFocusedRef.current) {
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  }, []);

  const handleBack = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: LISTING_SCREEN }],
    });
  }, [navigation]);
  const rawSizes = Array.isArray(order?.sizes) ? order.sizes : [];

  const sizes = useMemo(
    () => rawSizes.map((s) => ({
      id: s.id,
      label: s.size,
      balQty: s.bal_qty,
      qty: entries[s.id] ?? 0,
    })),
    [rawSizes, entries],
  );

  const modalSizes = useMemo(
    () =>
      rawSizes.map((s) => ({
        id: s.id,
        label: s.size,
        max: s.bal_qty ?? 0,
        initialValue: entries[s.id] ?? 0,
        balancePrefix: 'Bal',
      })),
    [rawSizes, entries],
  );
  const fetchWipBalance = useCallback(async () => {
    if (!order?.id) return;

    const currentLineId = Array.isArray(line) ? line[0] : line;

    try {
      const result = await reworkService.getWipBalance({
        orderId: order.id,
        lineId: lineId,
      });

      if (result?.success) {
        setOutputBalance(result.wipCount ?? '0');
      }
    } catch (error) {
      console.log('WIP Balance Error:', error);
    } finally {
    }
  }, [order?.id, line]);
  useEffect(() => {
    fetchWipBalance();
  }, []);
  const totalEnteredQty = useMemo(
    () => sizes.reduce((sum, s) => sum + (s.qty ?? 0), 0),
    [sizes],
  );
  const submitDisabled = totalEnteredQty === 0 || !canCreate || submitting;

  const handleEnterQty = () => {
    if (!canCreate) {
      showAlert('error', 'Permission required', "You don't have permission to create input entries.");
      return;
    }
    setQtyModalVisible(true);
  };

  const handleApplyQty = (payload) => {
    // payload: [{ id, size, enter_values, input_type: 'input' }]
    const nextEntries = {};
    payload.forEach((row) => {
      nextEntries[row.id] = row.enter_values;
    });
    setEntries(nextEntries);
  };

  const handleInputReturn = () => {
    setMenuVisible(false);
    navigation.navigate('Inputreturnscreen', { order, zone, line, lineId, lineName });
  };

  const handleSubmit = useCallback(async () => {
    if (submitDisabled || !order) return;

    setSubmitting(true);
    try {
      const shiftId = await resolveShiftId();
      console.log(" size lost " + JSON.stringify(sizes));
      const inputSizes = sizes
        .filter((s) => (s.qty ?? 0) > 0)
        .map((s) => ({ size: s.label, qty: s.qty }));

      if (inputSizes.length === 0) {
        showAlert('error', 'Nothing to submit', 'Enter a size-wise quantity before submitting.');
        return;
      }
      await createInputEntry({
        orderId: order.id,
        color: order.colour,
        styleId: order.styleId,
        shiftId,
        line_id: lineId,
        sizes: inputSizes,
      });

      showAlert('success', 'Success', 'Input entry submitted successfully.');
      handleBack();
    } catch (e) {
      showAlert('error', 'Submit failed', e?.message || 'Could not submit input entry.');
    } finally {
      setSubmitting(false);
    }
  }, [submitDisabled, order, sizes, handleBack]);
  if (!order) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={TEAL} />
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: ms(24) }}>
          <Ionicons name="alert-circle-outline" size={ms(28)} color={AppColors.textTertiary} />
          <Text style={[styles.detailLabel, { marginTop: mvs(8), textAlign: 'center' }]}>
            No order selected.
          </Text>
          <Pressable
            onPress={handleBack}
            style={{
              marginTop: mvs(16),
              paddingHorizontal: ms(20),
              paddingVertical: mvs(10),
              backgroundColor: AppColors.primary,
              borderRadius: ms(8),
            }}
          >
            <Text style={{ color: AppColors.onPrimary, fontWeight: '600' }}>Back to Orders</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />

      <View style={styles.headerWrap}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTopLeft}>
              <Pressable
                onPress={handleBack}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}
              >
                <Ionicons name="chevron-back" size={ms(16)} color={AppColors.onPrimary} />
              </Pressable>
              {/*  <Text style={styles.orderIdText} numberOfLines={1}>{order.orderNo}</Text>*/}
            </View>

            <Pressable
              onPress={() => setMenuVisible(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.dotsBtn}
              accessibilityRole="button"
              accessibilityLabel="More options"
            >
              <Ionicons name="ellipsis-vertical" size={ms(18)} color={AppColors.onPrimary} />
            </Pressable>
          </View>

          <Text style={styles.titleText}>Input Management</Text>

          <View style={styles.metaWrap}>
            <View style={styles.metaRow}>
              <Ionicons name="layers-outline" size={ms(14)} color={AppColors.onPrimary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{operator?.lineNo ?? line ?? '—'}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>WIP - {order?._raw?.wip ?? '0'}</Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="color-palette-outline" size={ms(14)} color={AppColors.onPrimary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{order.orderNo ?? order.tlsCode}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{order.colour}</Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="cube-outline" size={ms(14)} color={AppColors.onPrimary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{order.buyer}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{order.styleNo}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{order.style}</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Everything under the header lives in one container. When the keyboard
          opens, its bottom padding lifts the body + Submit footer above it. */}
      <View
        ref={contentRef}
        collapsable={false}
        style={{ flex: 1, paddingBottom: keyboardOverlap }}
      >
        <View style={styles.body}>
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            onLayout={scrollNotesIntoView}
            onContentSizeChange={scrollNotesIntoView}
          >
            {permissionsLoading ? (
              <View style={{ paddingVertical: mvs(16), alignItems: 'center' }}>
                <ActivityIndicator size="small" color={AppColors.primary} />
              </View>
            ) : !canCreate ? (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="lock-closed-outline" size={ms(15)} color={AppColors.primaryDark} />
                  <Text style={styles.sectionHeaderText}>PERMISSION REQUIRED</Text>
                </View>
                <View style={styles.sectionBody}>
                  <Text style={styles.detailLabel}>
                    You don't have permission to create input entries. You can still view order details below.
                  </Text>
                </View>
              </View>
            ) : null}

            {/* ORDER DETAILS */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="document-text-outline" size={ms(15)} color={AppColors.primaryDark} />
                <Text style={styles.sectionHeaderText}>ORDER DETAILS</Text>
              </View>
              <View style={styles.sectionBody}>
                <DetailRow styles={styles} label="Order Quantity" value={String(order.orderQty ?? '—')} />
                <DetailRow styles={styles} label="Production Quantity" value={String(order.prodQty ?? '—')} bordered />
                <DetailRow styles={styles} label="Input Issued" value={String(order.totalInput ?? '—')} bordered />
                <DetailRow styles={styles} label="Input Balance" value={String(order.balQty ?? '—')} bordered accent />
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="document-text-outline" size={ms(15)} color={AppColors.primaryDark} />
                <Text style={styles.sectionHeaderText}>INPUT ENTRY</Text>
                <Text style={styles.requiredDot}>*</Text>
              </View>
              <View style={styles.sectionBody}>
                <Pressable
                  onPress={handleEnterQty}
                  disabled={!canCreate}
                  style={({ pressed }) => [styles.enterQtyRow, pressed && { opacity: 0.7 }, !canCreate && { opacity: 0.5 }]}
                >
                  <Text style={styles.enterQtyLabel}>Size-wise Qty</Text>
                  <View style={styles.enterQtyRight}>
                    <Text style={styles.enterQtyValue}>
                      {totalEnteredQty > 0 ? String(totalEnteredQty) : 'Enter Qty'}
                    </Text>
                    <Ionicons name="chevron-forward" size={ms(17)} color={AppColors.primary} />
                  </View>
                </Pressable>

                <View style={styles.sizeGrid}>
                  {sizes.map((size) => (
                    <View key={size.id} style={styles.sizeChip}>
                      <View style={styles.sizeChipInner}>
                        <Text style={styles.sizeChipText}>{size.label} - </Text>
                        <Text style={styles.sizeChipQty}>{size.qty}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.notesLabel}>NOTES</Text>
              <View style={styles.notesInputWrap}>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  onFocus={() => { notesFocusedRef.current = true; }}
                  onBlur={() => { notesFocusedRef.current = false; }}
                  placeholder="Enter your notes..."
                  placeholderTextColor={AppColors.textTertiary}
                  style={styles.notesInput}
                  multiline
                />
              </View>
            </View>
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <Pressable
            disabled={submitDisabled}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitBtn,
              submitDisabled && styles.submitBtnDisabled,
              pressed && !submitDisabled && { opacity: 0.9 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={AppColors.onPrimary} />
            ) : (
              <Text style={[styles.submitBtnText, submitDisabled && styles.submitBtnTextDisabled]}>
                Submit
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      {/* Overflow menu — dims the screen and surfaces "Input Return" */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuVisible(false)}>
          <Pressable style={styles.menuPill} onPress={handleInputReturn}>
            <Ionicons name="arrow-undo-outline" size={ms(16)} style={styles.menuPillIcon} />
            <Text style={styles.menuPillText}>Input Return</Text>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Size-wise quantity entry sheet — input_type: 'input' */}
      <SizeWiseQtyModal
        visible={qtyModalVisible}
        onClose={() => setQtyModalVisible(false)}
        title="Input Entry"
        subtitle="Update Size-wise Quantities"
        sizes={modalSizes}
        inputType="input"
        onApply={handleApplyQty}
      />
    </View>
  );
}
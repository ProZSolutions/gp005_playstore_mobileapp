import React, { useCallback, useMemo, useState ,useEffect} from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import createStyles from '../styles/InputManagementStyles';
import { createInputReturn, resolveShiftId } from '../../api/services/inputModuleService'; 
import { usePermissions, GROUP, ACTION } from '../../context/PermissionsContext';
import SizeWiseQtyModal from '../../components/modals/SizewiseQtyModal';
import { showAlert } from '../../utils/AlertService';
const LISTING_SCREEN = 'InputListScreen';
import reworkService, { mapOrderSizes } from '../../api/services/rejectionService';


const TEAL = AppColors.primary;

function DetailRow({ label, value, styles, bordered, accent }) {
  return (
    <View style={[styles.detailRow, bordered && styles.detailRowBorder]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, accent && styles.detailValueAccent]}>{value}</Text>
    </View>
  );
}
 
function computeWip(rawSize = {}) {
  return 100;
}

export default function InputReturnScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs } = useResponsive();
  const styles = createStyles(ms, mvs, fs);
 
  const {
    order,
    operator,
    user,
    zone,
    line,
    lineId,lineName
  } = route?.params ?? {}; 
  console.log("input return line id "+lineId);
  const { can, loading: permissionsLoading } = usePermissions();
  const canReturn = can(GROUP.INPUTMODULE, ACTION.CREATE);
 const [outputBalance, setOutputBalance] = useState('0');

  const [notes, setNotes] = useState('');
  const [qtyModalVisible, setQtyModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
   const [entries, setEntries] = useState({});

  const rawSizes = Array.isArray(order?.sizes) ? order.sizes : [];

  const sizes = useMemo(
    () => rawSizes.map((s) => ({
      id: s.id,
      label: s.size,
      wip: s.wip,
      qty: entries[s.id] ?? 0,
    })),
    [rawSizes, entries],
  );


  const modalSizes = useMemo(
    () =>
      rawSizes.map((s) => ({
        id: s.id,
        label: s.size,
        max: s.wip,
        initialValue: entries[s.id] ?? 0,
        balancePrefix: 'WIP:',
      })),
    [rawSizes, entries],
  );

  const totalWip = useMemo(
    () => sizes.reduce((sum, s) => sum + (s.wip ?? 0), 0),
    [sizes],
  );

  const totalEnteredQty = useMemo(
    () => sizes.reduce((sum, s) => sum + (s.qty ?? 0), 0),
    [sizes],
  );
  const submitDisabled = totalEnteredQty === 0 || !canReturn || submitting;

  const handleEnterQty = () => {
    if (!canReturn) {
      showAlert('error', 'Permission required', "You don't have permission to submit an input return.");
      return;
    }
    setQtyModalVisible(true);
  };

  const handleApplyQty = (payload) => {
     const nextEntries = {};
    payload.forEach((row) => {
      nextEntries[row.id] = row.enter_values;
    });
    setEntries(nextEntries);
  };
 
  const handleSubmit = useCallback(async () => { 
    if (submitDisabled || !order) return;

    if (!lineId) {
      showAlert('error', 'Missing line', 'No line is associated with this return. Please go back and try again.');
      return;
    }

    setSubmitting(true);
    try { 
      const shiftId = await resolveShiftId();

      const inputSizes = sizes
        .filter((s) => (s.qty ?? 0) > 0)
        .map((s) => ({ size: s.label, qty: s.qty }));

      if (inputSizes.length === 0) {
        showAlert('error', 'Nothing to submit', 'Enter a size-wise quantity before submitting.');
        return;
      }

      await createInputReturn({
        orderId: order.id,
        color: order.colour,
        styleId: order.styleId,
        shiftId,
        line_id: lineId,
        sizes: inputSizes,
      });

      showAlert('success', 'Success', 'Input return submitted successfully.');
       navigation.reset({
        index: 0,
        routes: [{ name: LISTING_SCREEN }],
      });

    } catch (e) {
      showAlert('error', 'Submit failed', e?.message || 'Could not submit input return.');
    } finally {
      setSubmitting(false);
    }
  }, [submitDisabled, order, sizes, lineId, navigation]);

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
            onPress={() => navigation?.goBack?.()}
            style={{
              marginTop: mvs(16),
              paddingHorizontal: ms(20),
              paddingVertical: mvs(10),
              backgroundColor: AppColors.primary,
              borderRadius: ms(8),
            }}
          >
            <Text style={{ color: AppColors.onPrimary, fontWeight: '600' }}>Back</Text>
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
                onPress={() => navigation?.goBack?.()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}
              >
                <Ionicons name="close" size={ms(16)} color={AppColors.onPrimary} />
              </Pressable>
             {/*  <Text style={styles.orderIdText} numberOfLines={1}>{order.tlsCode}</Text>*/}
            </View>
          </View>

          <Text style={styles.titleText}>Input Return</Text>

          <View style={styles.metaWrap}>
            <View style={styles.metaRow}>
              <Ionicons name="layers-outline" size={ms(14)} color={AppColors.onPrimary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{lineName ?? '—'}</Text>
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

      <View style={styles.body}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {permissionsLoading ? (
            <View style={{ paddingVertical: mvs(16), alignItems: 'center' }}>
              <ActivityIndicator size="small" color={AppColors.primary} />
            </View>
          ) : !canReturn ? (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="lock-closed-outline" size={ms(15)} color={AppColors.primaryDark} />
                <Text style={styles.sectionHeaderText}>PERMISSION REQUIRED</Text>
              </View>
              <View style={styles.sectionBody}>
                <Text style={styles.detailLabel}>
                  You don't have permission to submit an input return. You can still view order details below.
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
              <DetailRow styles={styles} label="Input Balance (WIP)" value={String(order.balQty ?? '—')} bordered accent />
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="arrow-undo-outline" size={ms(15)} color={AppColors.primaryDark} />
              <Text style={styles.sectionHeaderText}>INPUT RETURN</Text>
              <Text style={styles.requiredDot}>*</Text>
            </View>
            <View style={styles.sectionBody}>
              <Pressable
                onPress={handleEnterQty}
                disabled={!canReturn}
                style={({ pressed }) => [styles.enterQtyRow, pressed && { opacity: 0.7 }, !canReturn && { opacity: 0.5 }]}
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
 {/* balanceLabel={`Input Balance - ${totalWip} (WIP)`}*/}
       <SizeWiseQtyModal
        visible={qtyModalVisible}
        onClose={() => setQtyModalVisible(false)}
        title="Input Return"
        subtitle="Update Size-wise Quantities"
       
        sizes={modalSizes}
        inputType="return"
        onApply={handleApplyQty}
      />
    </View>
  );
}
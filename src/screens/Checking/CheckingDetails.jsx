import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import createStyles, { RESULT_COLORS } from '../styles/SizeWiseResultStyles';
import { usePermissions, GROUP, ACTION } from '../../context/PermissionsContext';
import { showAlert } from '../../utils/AlertService';
import reworkService from '../../api/services/rejectionService';
import {
  createSize,
  getSettingList,
  resolveShiftId,
  fetchOrderDetails,
} from '../../api/services/checkingService';
import { getBranchId, getTeamId } from '../../api/storage/authStorage';
import Orientation from 'react-native-orientation-locker';
import {
   getUser
} from '../../api/storage/authStorage';
const TEAL = AppColors.primary;
const LISTING_SCREEN = 'CheckingList';
const REWORK_SCREEN = 'ReworkListScreen';
const REJECTION_SCREEN = 'RejectionListScreen';

const RESULT = { PASS: 'pass', REWORK: 'rework', REJECT: 'reject' };
const RESULT_LABEL = { pass: 'Pass', rework: 'Rework', reject: 'Rejection' };
const RESULT_ICON = { pass: 'checkmark-circle-outline', rework: 'refresh-outline', reject: 'close-circle-outline' };

function SizeCard({ size, active, disabled, onSelect, styles }) {
  return (
    <View style={styles.chipCol}>
      <Pressable
        onPress={() => !disabled && onSelect(size)}
        disabled={disabled}
        style={({ pressed }) => [
          styles.chip,
          active && styles.chipActive,
          disabled && { opacity: 0.4 },
          pressed && !disabled && { opacity: 0.85 },
        ]}
      >
        <View style={[styles.chipLabelPill, active && styles.chipLabelPillActive]}>
          <Text style={[styles.chipLabelText, active && styles.chipLabelTextActive]}>
            Size - {size.label}
          </Text>
        </View>

        <View style={styles.chipMetaCol}>
          <Text style={[styles.chipMetaText, active && styles.chipMetaTextActive]}>P.Qty - {size.oQty}</Text>
          <Text style={[styles.chipMetaText, active && styles.chipMetaTextActive]}>WIP - {size.wip}</Text>
        </View>
      </Pressable>
    </View>
  );
}

export default function SizeWiseResultScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs, isLargeScreen } = useResponsive();
  const styles = createStyles(ms, mvs, fs, isLargeScreen);

  const {
    order: initialOrder,
    operator,
    user,
    zone,
    line,
    lineId,
    lineNames,
    lineName,
  } = route?.params ?? {};
  const [order, setOrder] = useState(initialOrder);

  const { can, loading: permissionsLoading } = usePermissions();
  const canCreate = can(GROUP.CHECKING, ACTION.CREATE);

  const [outputBalance, setOutputBalance] = useState('0');
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [range, setRange] = useState('0');
  const [branchId, setBranchId] = useState(null);
  const [teamId, setTeamId] = useState(null);
  const [shiftId, setShiftId] = useState(null);
  const [selectedSizeId, setSelectedSizeId] = useState(null);
  const [submittingResult, setSubmittingResult] = useState(null);  
  const [refreshingOrder, setRefreshingOrder] = useState(false);
  const [userinfo, setUserInfo] = useState(null);

  useFocusEffect(
    useCallback(() => {
       if (!isLargeScreen) return;

      Orientation.lockToLandscape();

      return () => {
        Orientation.lockToPortrait();
      };
    }, [isLargeScreen])
  );

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await getUser();
        console.log("stored User info", storedUser);

        const employeeInfo =
          storedUser?.employee_name && storedUser?.employee_code
            ? `${storedUser.name} | ${storedUser.employee_code}`
            : '';
        setUserInfo(employeeInfo);
      } catch (e) {
        console.warn(
          "ProductAuditScreen: falling back to stored user failed:",
          e?.message || e
        );
      }
    };

    loadUser();
  }, []);

  const handleBack = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: LISTING_SCREEN }] });
  }, [navigation]);

  const rawSizes = Array.isArray(order?.sizeslimit) ? order.sizeslimit : [];
  const sizes = useMemo(
    () => rawSizes
      .map((s) => ({
        id: s.id,
        label: s.size,
        oQty: s.o_qty ?? s.orderQty ?? 0,
        wip: s.wip ?? s.wip ?? 0,
      }))
      .sort((a, b) => a.id - b.id),
    [rawSizes],
  );

  const numericRange = Number(range) || 0;

  const isSizeDisabled = useCallback(
    (size) => size.oQty === 0 || size.wip === 0 || numericRange > size.wip,
    [numericRange],
  );

  const selectedSize = useMemo(
    () => sizes.find((s) => s.id === selectedSizeId) ?? null,
    [sizes, selectedSizeId],
  );
 
  useEffect(() => {
    if (selectedSize && isSizeDisabled(selectedSize)) {
      setSelectedSizeId(null);
    }
  }, [selectedSize, isSizeDisabled]);

  const fetchSettings = useCallback(async () => {
    setBalanceLoading(true);
    try {
      const payload = await getSettingList();
      if (payload?.success && payload?.data?.length > 0) {
        setRange(payload.data[0].checking_range);
      }
    } catch (e) {
      console.log('Settings Error:', e?.message);
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  const fetchBranchTeam = useCallback(async () => {
    try {
      const [bId, tId] = await Promise.all([getBranchId(), getTeamId()]);
      setBranchId(bId);
      setTeamId(tId);
    } catch (e) {
      console.log('Branch/Team Error:', e?.message);
    }
  }, []);
 
  const fetchShiftId = useCallback(async () => {
    try {
      const id = await resolveShiftId();
      setShiftId(id);
      return id;
    } catch (e) {
      console.log('Shift Id Error:', e?.message);
      return null;
    }
  }, []);

  const fetchWipBalance = useCallback(async () => {
    if (!order?.id) return;
    
    const currentLineId = Array.isArray(line) ? line[0] : line;
    setBalanceLoading(true);
    try {
      const result = await reworkService.getWipBalance({ orderId: order.id, lineId: lineId });
      if (result?.success) setOutputBalance(result.wip ?? '0');
    } catch (error) {
      console.log('WIP Balance Error:', error);
    } finally {
      setBalanceLoading(false);
    }
  }, [order?.id, line]);
 
  const refreshOrderData = useCallback(async () => {
    if (!order?.id || !lineId) return null;
    setRefreshingOrder(true);
    try {
      const [, , , freshShiftId] = await Promise.all([
        fetchWipBalance(),
        fetchSettings(),
        fetchBranchTeam(),
        fetchShiftId(),
      ]);

      const result = await fetchOrderDetails({
        orderId: order.id,
        lineId,
        shiftId: freshShiftId, 
      });
      if (result?.success && result?.data) {
        setOrder(result.data);
        return result.data;
      }
      return null;
    } catch (e) {
      console.log('Refresh order error:', e?.message);
      return null;
    } finally {
      setRefreshingOrder(false);
    }
  }, [order?.id, lineId, fetchWipBalance, fetchSettings, fetchBranchTeam, fetchShiftId]);
 
   useEffect(() => {
    refreshOrderData();
   }, []);
 
  const handleSelectSize = useCallback((size) => {
    if (isSizeDisabled(size)) return;
    setSelectedSizeId((prev) => (prev === size.id ? null : size.id));
  }, [isSizeDisabled]);
 
  const passDisabled =
    !selectedSize || isSizeDisabled(selectedSize) || !canCreate || !!submittingResult;
  const otherResultDisabled = !canCreate || !!submittingResult;

  const isResultDisabled = useCallback(
    (type) => (type === RESULT.PASS ? passDisabled : otherResultDisabled),
    [passDisabled, otherResultDisabled],
  );

  const handleResultPress = useCallback(async (resultType) => {
    if (isResultDisabled(resultType)) return;

    if (resultType === RESULT.REWORK) {
      navigation.navigate(REWORK_SCREEN, {
        order, operator, user, zone, line, lineId, shiftId,
        lineNames, lineName, branchId, teamId, selectedSize,
      });
      return;
    }

    if (resultType === RESULT.REJECT) {
      navigation.navigate(REJECTION_SCREEN, {
        order, operator, user, zone, line, lineId, shiftId,
        lineNames, lineName, branchId, teamId, selectedSize,
      });
      return;
    }

     const submittedLabel = selectedSize.label;  
    setSubmittingResult(resultType);
    try {
      const response = await createSize({
        orderId: order.id,
        orderNo: order.orderNo ?? order.tlsCode,
        styleId: order.styleId,
        lineId,
        buyer: order.buyer,
        branchId,
        shiftId,
        teamId,
        size: selectedSize.label,
        qty: numericRange,
        outputQty: selectedSize.oQty,
        wip: selectedSize.wip,
      });

       if (response?.success) {
        showAlert('success', 'Success', `Recorded as ${RESULT_LABEL[resultType]}.`);

       
        const freshOrder = await refreshOrderData();
        const freshRawSizes = Array.isArray(freshOrder?.sizeslimit) ? freshOrder.sizeslimit : [];
        const stillThere = freshRawSizes.find((s) => s.size === submittedLabel);
        setSelectedSizeId(stillThere ? stillThere.id : null);
      }
    } finally {
      setSubmittingResult(null);
    }
  }, [
    isResultDisabled,
    selectedSize,
    order,
    lineId,
    shiftId,
    branchId,
    teamId,
    numericRange,
    navigation,
    operator,
    user,
    zone,
    line,
    lineNames,
    lineName,
    refreshOrderData,
  ]);

  if (!order) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={TEAL} />
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: ms(24) }}>
          <Ionicons name="alert-circle-outline" size={ms(28)} color={AppColors.textTertiary} />
          <Text style={{ marginTop: mvs(8), textAlign: 'center', color: AppColors.textTertiary }}>
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
            </View>
          </View>

          <Text style={styles.titleText}>Checking</Text>

          <View style={styles.metaWrap}>
            <View style={styles.metaRow}>
              <Ionicons name="layers-outline" size={ms(14)} color={AppColors.onPrimary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{operator?.lineNo ?? lineName ?? line ?? '—'}</Text>
                 {!!userinfo && (
                  <>
                                <Text style={styles.metaDot}>•</Text>

                    <Ionicons
                      name="person-outline"
                      size={ms(14)}
                      color={AppColors.onPrimary}
                      style={styles.metaIcon}
                    />
                    <Text style={styles.metaText}>{userinfo}</Text>
                  </>
                )}
                            </View>

            <View style={styles.metaRow}>
              <Ionicons name="document-text-outline" size={ms(14)} color={AppColors.onPrimary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{order.orderNo ?? order.tlsCode}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Ionicons name="color-palette-outline" size={ms(14)} color={AppColors.onPrimary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{order.colour}</Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="cube-outline" size={ms(14)} color={AppColors.onPrimary} style={styles.metaIcon} />
              <Text style={styles.metaText}>{order.buyer}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{order.style ?? order.style}</Text>
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
          ) : !canCreate ? (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="lock-closed-outline" size={ms(15)} color={AppColors.primaryDark} />
                <Text style={styles.sectionHeaderText}>PERMISSION REQUIRED</Text>
              </View>
              <View style={styles.sectionBody}>
                <Text style={{ color: AppColors.textTertiary }}>
                  You don't have permission to record results. You can still view sizes below.
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="grid-outline" size={ms(15)} color={AppColors.primaryDark} />
              <Text style={styles.sectionHeaderText}>CHECKING QTY</Text>
              {refreshingOrder ? (
                <ActivityIndicator size="small" color={AppColors.primary} style={{ marginLeft: ms(8) }} />
              ) : null}
            </View>
            <View style={styles.sectionBody}>
              {balanceLoading ? (
                <View style={{ paddingVertical: mvs(12), alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={AppColors.primary} />
                </View>
              ) : null}
              <View style={styles.grid}>
                {sizes.map((size) => (
                  <SizeCard
                    key={size.id}
                    size={size}
                    active={selectedSizeId === size.id}
                    disabled={isSizeDisabled(size)}
                    onSelect={handleSelectSize}
                    styles={styles}
                  />
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        {[RESULT.PASS, RESULT.REWORK, RESULT.REJECT].map((type) => {
          const colors = RESULT_COLORS[type];
          const isThisSubmitting = submittingResult === type;
          const disabled = isResultDisabled(type);
          return (
            <Pressable
              key={type}
              onPress={() => handleResultPress(type)}
              disabled={disabled}
              style={({ pressed }) => [
                styles.resultBtn,
                { backgroundColor: colors.bg },
                disabled && styles.resultBtnDisabled,
                pressed && !disabled && { opacity: 0.9 },
              ]}
            >
              {isThisSubmitting ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <>
                  <Ionicons name={RESULT_ICON[type]} size={ms(18)} color={colors.text} />
                  <Text style={[styles.resultBtnText, { color: colors.text, marginTop: mvs(2) }]}>
                    {RESULT_LABEL[type]}
                  </Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
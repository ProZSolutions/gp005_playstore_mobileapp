import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import createStyles from '../styles/TLSDeviceSwapStyles';
import deviceSwapService from '../../api/services/deviceSwapService';
import { showAlert } from '../../utils/AlertService';

const TEAL = AppColors.primary;

// Maps one side of the review response (scan_one / scan_two) into the
// display lines used on the review card.
function buildDisplayLines(record) {
  if (!record) return [];
  return [
    `TLS MAC ID - ${record.mac_id || '—'}`,
    `${record.line_name || record.line_id || '—'}`,
    `${record.order_no || '—'} | ${record.color || '—'}`,
    `${record.buyer || '—'} | ${record.style_no || '—'} | ${record.style_name || '—'}`,
    `${record.machine_type || '—'} | ${record.machine_name || '—'}`,
  ];
}

function DeviceReviewCard({ kind, record, styles }) {
  const isCurrent = kind === 'current';
  const lines = buildDisplayLines(record);

  return (
    <View>
      <Text style={styles.deviceCardSectionLabel}>{isCurrent ? 'CURRENT DEVICE DATA' : 'NEW DEVICE DATA'}</Text>
      <View style={styles.deviceCard}>
        <View style={[styles.deviceBanner, isCurrent ? styles.deviceBannerCurrent : styles.deviceBannerNew]}>
          <Text style={styles.deviceBannerText}>Machine.no - {record?.machine_no || '—'}</Text>
        </View>
        <View style={styles.deviceLineWrap}>
          {lines.map((line, idx) => (
            <Text
              key={idx}
              style={[styles.deviceLine, idx === lines.length - 1 && styles.deviceLineLast]}
              numberOfLines={1}
            >
              {line}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

// route.params expects { device, machine } handed off from
// TLSDeviceMappingScreen: device = { id, raw: {...} }, machine = { id, machineNo, raw: {...} }
export default function TLSDeviceSwapReviewScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs } = useResponsive();
  const styles = createStyles(ms, mvs, fs);

  const { device, machine } = route?.params ?? {};
  const deviceId = device?.id;
  const machineId = machine?.id ?? machine?.machineNo;

  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState(null); // { scan_one, scan_two }
  const [swapping, setSwapping] = useState(false);

  const loadReview = useCallback(async () => {
    if (!deviceId || !machineId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await deviceSwapService.getSwapReview({ deviceId, machineId });
      if (result?.success && result.data) {
        setReviewData(result.data);
      } else {
        showAlert('error', 'Could Not Load Details', result?.message || 'Could not fetch the swap details.');
      }
    } finally {
      setLoading(false);
    }
  }, [deviceId, machineId]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  const handleSwap = useCallback(async () => {
    if (!deviceId || !machineId || swapping) return;
    setSwapping(true);
    try {
      const result = await deviceSwapService.createDeviceSwap({ deviceId, machineId });
      if (result?.success) {
        showAlert('success', 'Swapped', 'The devices were swapped successfully.');
        // Confirmed — drop the mapping/review screens off the stack and land on the dashboard.
        navigation?.reset?.({ index: 0, routes: [{ name: 'Dashboard' }] });
      } else {
        showAlert('error', 'Swap Failed', result?.message || 'Could not complete the swap. Please try again.');
      }
    } finally {
      setSwapping(false);
    }
  }, [deviceId, machineId, swapping, navigation]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />

      <View style={styles.headerWrap}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerTopRow}>
            <Pressable
              onPress={() => navigation?.goBack?.()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}
            >
              <Icon name="chevron-left" size={ms(18)} color={AppColors.onPrimary} />
            </Pressable>
            <Text style={styles.titleText}>TLS Device Swapping</Text>
          </View>
          <Text style={[styles.stepperLabel, { paddingHorizontal: ms(16), marginTop: mvs(10) }]}>
            Review Details
          </Text>
        </SafeAreaView>
      </View>

      <View style={styles.body}>
        {loading ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator size="large" color={TEAL} />
            <Text style={styles.emptyText}>Loading swap details…</Text>
          </View>
        ) : reviewData ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <DeviceReviewCard kind="current" record={reviewData.scan_one} styles={styles} />
            <DeviceReviewCard kind="new" record={reviewData.scan_two} styles={styles} />
          </ScrollView>
        ) : (
          <View style={styles.emptyWrap}>
            <Icon name="alert-triangle" size={ms(28)} color={AppColors.textTertiary} />
            <Text style={styles.emptyText}>Could not load the swap details.</Text>
          </View>
        )}
      </View>

      {!loading && reviewData && (
        <View style={styles.footer}>
          <Pressable
            disabled={swapping}
            onPress={handleSwap}
            style={({ pressed }) => [
              styles.primaryBtn,
              styles.primaryBtnFull,
              swapping && styles.primaryBtnDisabled,
              pressed && !swapping && { opacity: 0.9 },
            ]}
          >
            {swapping ? (
              <ActivityIndicator size="small" color={AppColors.onPrimary} />
            ) : (
              <Text style={styles.primaryBtnText}>Confirm Swap</Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}
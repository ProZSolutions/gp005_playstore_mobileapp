import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, Modal, TextInput, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import createStyles from '../../screens/styles/AQLAuditStyles';
import { showAlert } from '../../utils/AlertService';
import SelectListSheet from '../../components/SelectListSheet';
import {
  getInspectionLevelList,
  getAQLLevelList,
  getAQLAllowedDefects,
  fetchAqlOrderById,
  buildOrderAndStyleInfo,
} from '../../api/services/aqlAuditService';
import { useBackToDashboard } from '../../hooks/useBackToDashboard'; // adjust path

const TEAL = AppColors.primary;

function InfoRow({ label, value, styles, bordered }) {
  return (
    <View style={[styles.detailRow, bordered && styles.detailRowBorder]}>
      <Text style={styles.detailLabel} numberOfLines={1}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">{value ?? '—'}</Text>
    </View>
  );
}

function SelectableRow({ label, value, placeholder = 'Select', styles, bordered, onPress, manualTag, disabled, type }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.selectableRow,
        bordered && styles.detailRowBorder,
        disabled,
        pressed && !disabled && { opacity: 0.7 },
      ]}
    >
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.selectableRight}>
        {manualTag && (
          <View style={styles.manualPill}>
            <Text style={styles.manualPillText}>Manual Entry</Text>
          </View>
        )}
        <Text style={[styles.selectableValue, !value && styles.selectablePlaceholder]}>
          {value ?? placeholder}
        </Text>

        {!type && (
          <Ionicons
            name="chevron-forward"
            size={14}
            color={AppColors.textTertiary ?? '#9CA3AF'}
          />
        )}
      </View>
    </Pressable>
  );
}

function ManualQtyModal({ visible, initialValue, maxValue, onClose, onSave, settingstype, wip, output }) {
  
  const [text, setText] = useState(String(initialValue ?? ''));

  useEffect(() => {
    if (visible) setText(String(initialValue ?? ''));
  }, [visible, initialValue]);

  const hasLimit = maxValue != null && maxValue > 0;

  const handleSave = () => {
    const n = parseInt(text, 10);
    if (!Number.isFinite(n) || n <= 0) {
      showAlert('error', 'Invalid Quantity', 'Enter a whole number greater than 0.');
      return;
    }

    const settingTypeNum = Number(settingstype);
    const outputNum = Number(output);

    if (settingTypeNum === 3 && outputNum === 2) {  
      if (!hasLimit) {
        showAlert(
          'error',
          'Limit Not Configured',
          'No inspection qty limit is configured for the selected size and line.'
        );
        return;
      } else {
        if (hasLimit && n > maxValue) {
          showAlert('error', 'Limit Exceeded', `Inspection qty should not exceed Checking Qty`);
          return;
        }
      }
    } else if (hasLimit && n > maxValue) {
      showAlert('error', 'Limit Exceeded', `Inspection qty cannot exceed ${maxValue} for the selected size and line.`);
      return;
    }

    const wipNum = Number(wip);
    if (n > wipNum) {
      showAlert('error', 'Limit Exceeded', `Inspection qty cannot exceed WIP ${wip} for the selected size and line.`);
      return;
    }

    onSave(n);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 }}
      >
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: AppColors.textPrimary ?? '#111827', marginBottom: 4 }}>
            Manual Inspection Qty
          </Text>
          {hasLimit && (
            <Text style={{ fontSize: 12, color: AppColors.textTertiary ?? '#9CA3AF', marginBottom: 12 }}>
              Max allowed for this size: {maxValue}
            </Text>
          )}
          <TextInput
            value={text}
            onChangeText={setText}
            keyboardType="number-pad"
            autoFocus
            style={{
              borderWidth: 1,
              borderColor: AppColors.border ?? '#E5E7EB',
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 10,
              fontSize: 16,
              color: AppColors.textPrimary ?? '#111827',
              marginTop: hasLimit ? 0 : 12,
              marginBottom: 16,
            }}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={onClose}
              style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, backgroundColor: '#F1F5F9' }}
            >
              <Text style={{ fontWeight: '600', color: AppColors.textSecondary ?? '#475569' }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, backgroundColor: TEAL }}
            >
              <Text style={{ fontWeight: '700', color: '#fff' }}>Save</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function AQLOrderDetailsScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs } = useResponsive();
  const styles = createStyles(ms, mvs, fs);
  const {
    orderInfo: initialOrderInfo,
    styleInfo: initialStyleInfo,
    user,
    lineId,
    lineName,
    settingstype,
    output,
  } = route?.params ?? {};
 
  const [orderInfo, setOrderInfo] = useState(initialOrderInfo);
  const [styleInfo, setStyleInfo] = useState(initialStyleInfo);
  const [refreshingOrder, setRefreshingOrder] = useState(false);

 
  const [sizeList, setSizeList] = useState([]);
  const [levelList, setLevelList] = useState([]);
  const [majorList, setMajorList] = useState([]);
  const [minorList, setMinorList] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);

  const branchId =
    user?.branch_id ??
    user?.branchId ??
    user?.branch?.id ??
    orderInfo?.branch_id ??
    styleInfo?.branch_id ??
    null;

  // Dropdown option lists only depend on branchId — fetch once, not on every
  // order refresh (they don't change per-order).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingLists(true);
      try {
        const [levels, aqlLevels] = await Promise.all([
          getInspectionLevelList(branchId),
          getAQLLevelList(branchId),
        ]);
        if (cancelled) return;
        setLevelList(levels ?? []);
        setMajorList(aqlLevels ?? []);
        setMinorList(aqlLevels ?? []);
      } catch (e) {
        showAlert('error', 'Failed to Load', e.message ?? 'Could not load inspection setup options.');
      } finally {
        if (!cancelled) setLoadingLists(false);
      }
    })();
    return () => { cancelled = true; };
  }, [branchId]);

  // Size list depends on orderInfo, so it stays in sync whenever orderInfo
  // is refreshed with new WIP/limit data.
  useEffect(() => {
 
    setSizeList(orderInfo?.sizesWithLimit ?? []);
   }, [orderInfo]);

  const [size, setSize] = useState(null);
  const [level, setLevel] = useState(null);
  const [aqlMajor, setAqlMajor] = useState(null);
  const [aqlMinor, setAqlMinor] = useState(null);
  const aqlCritical = 0;
  const [qty, setQty] = useState(null);
  const [qtyManual, setQtyManual] = useState(false);
  const [loadingQty, setLoadingQty] = useState(false);

  const [sampleSize, setSampleSize] = useState(null);
  const [allowedDefects, setAllowedDefects] = useState(null);
   const sizeQtyLimit = size?.inspectionQtyLimit ?? 0;
  const sizeWIP = size?.wip ?? 0;

  console.log("AQL ORDER SELECTED ORDER "+JSON.stringify(size));

  const refreshOrder = useCallback(async () => {
    const orderId = orderInfo?.id;
    if (!orderId || !lineId) return;

    setRefreshingOrder(true);
    try {
      const result = await fetchAqlOrderById({ orderId, lineId });
      if (result?.success && result?.data) {
        const rebuilt = buildOrderAndStyleInfo(
          result.data,
          lineName ?? orderInfo?.lineLabel
        );
        setOrderInfo(rebuilt.orderInfo);
        setStyleInfo(rebuilt.styleInfo);

        setSize(null);
        setLevel(null);
        setAqlMajor(null);
        setAqlMinor(null);
        setQty(null);
        setQtyManual(false);
        setAllowedDefects(null);
        setSampleSize(null);
      }
    } catch (e) {
      console.log('Refresh order error:', e?.message);
    } finally {
      setRefreshingOrder(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderInfo?.id, lineId, lineName]);

  useFocusEffect(
    useCallback(() => {
      refreshOrder();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  useEffect(() => {
    if (
      !qty ||
      !level ||
      !aqlMajor ||
      !aqlMinor
    ) {
      return;
    }

    let cancelled = false;

    (async () => {
      setLoadingQty(true);

      try {
        const result = await getAQLAllowedDefects(
          qty,
          level?.value,
          aqlMajor?.value,
          aqlMinor?.value,
          0,
          branchId
        );

        console.log('AQL RESULT', result);

        if (!cancelled) {
          setAllowedDefects(result);
          setSampleSize(result?.sample_size ?? 0);
        }
      } catch (e) {
        if (!cancelled) {
          showAlert(
            'error',
            'AQL',
            e.message ?? 'Could not fetch allowed defects.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingQty(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [qty, level, aqlMajor, aqlMinor, branchId]);

  const [activeSheet, setActiveSheet] = useState(null); // 'size' | 'level' | 'major' | 'minor' | 'critical'
  const [manualQtyVisible, setManualQtyVisible] = useState(false);

  const sheetConfig = useMemo(() => ({

    size: {
      title: 'Select Size',
      data: sizeList,
      selectedId: size?.id,       
      getRightText: (item) => item.inspectionQtyLimit != null ? `Checked Qty - ${item.inspectionQtyLimit}`: '',
      onApply: (item) => {
         setSize(item);
        setQtyManual(false);
        setQty(null);
      },
    },
    level: { title: 'Select Inspection Level', data: levelList, selectedId: level?.id, onApply: (item) => { setLevel(item); setQtyManual(false); } },
    major: { title: 'AQL Level - Major', data: majorList, selectedId: aqlMajor?.id, onApply: (item) => setAqlMajor(item) },
    minor: { title: 'AQL Level - Minor', data: minorList, selectedId: aqlMinor?.id, onApply: (item) => setAqlMinor(item) },
  }), [sizeList, levelList, majorList, minorList, size, level, aqlMajor, aqlMinor]);

  const closeSheet = useCallback(() => setActiveSheet(null), []);

  const allSelected = size && level && aqlMajor && aqlMinor && qty > 0&&
  !loadingQty &&
  sampleSize != null &&
  sampleSize > 0;

  const handleContinue = useCallback(() => {
    navigation.navigate('AQLAuditDetailsScreen', {
      orderInfo,
      styleInfo,
      user,
      lineId,
      settingstype,  
      output,
      inspectionSetup: {
        size,
        level,
        aqlMajor,
        aqlMinor,

        qty,
        qtyManual,

        sampleSize: allowedDefects?.sample_size ?? 0,
        allowMajor: allowedDefects?.allow_major ?? 0,
        allowMinor: allowedDefects?.allow_minor ?? 0,
        allowCritical: allowedDefects?.allow_critical ?? 0,
      },
    });
  }, [allSelected, navigation, orderInfo, styleInfo, user, lineId, size, level, aqlMajor, aqlMinor,
     aqlCritical, qty, qtyManual, allowedDefects, loadingQty, sampleSize]);
 
  const handleOpenManualQty = useCallback(() => {
    console.log("setting type "+settingstype+" output "+output);
    if (!size) return;
    if ((sizeQtyLimit == null || sizeQtyLimit <= 0) && settingstype ===3 ) {
      showAlert(
        'error',
        'Checked Qty Not Available',
        `The selected size${size?.value ? ` (${size.value})` : ''} has Checked Qty 0.`
      );
      return;
    }

    setManualQtyVisible(true);
  }, [size, sizeQtyLimit]);
 
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
      }
      return true; // mark as handled so the app doesn't exit
    });
    return () => sub.remove();
  }, [navigation]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />

      <View style={styles.headerWrap}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTopLeft}>
              <Pressable
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}
              >
                <Ionicons name="chevron-back" size={ms(16)} color={AppColors.onPrimary} />
              </Pressable>
              <Text style={styles.screenTitle}>AQL Audit</Text>
            </View>
          </View>

          <View style={styles.stepSubRow}>
            <Text style={styles.stepSubText}>Step 1 of 2 : Order Details</Text>
          </View>

          <View style={styles.progressRow}>
            <View style={[styles.progressSeg, styles.progressSegActive]} />
            <View style={styles.progressSeg} />
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.body}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="document-text-outline" size={ms(15)} color={AppColors.primaryDark ?? TEAL} />
              <Text style={styles.sectionHeaderText}>ORDER INFO</Text>
              {refreshingOrder ? (
                <ActivityIndicator size="small" color={AppColors.primary} style={{ marginLeft: ms(8) }} />
              ) : null}
            </View>
            <View style={styles.sectionBody}>
              <InfoRow styles={styles} label="Line no" value={orderInfo?.lineLabel} />
              <InfoRow styles={styles} label="Order no" value={orderInfo?.orderNo} bordered />
              <InfoRow styles={styles} label="Colour" value={orderInfo?.colour} bordered />
              <InfoRow styles={styles} label="WIP" value={orderInfo?.outputBalance} bordered />
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="shirt-outline" size={ms(15)} color={AppColors.primaryDark ?? TEAL} />
              <Text style={styles.sectionHeaderText}>STYLE INFO</Text>
            </View>
            <View style={styles.sectionBody}>
              <InfoRow styles={styles} label="Buyer" value={styleInfo?.buyer} />
              <InfoRow styles={styles} label="Style no" value={styleInfo?.styleNo} bordered />
              <InfoRow styles={styles} label="Style Name" value={styleInfo?.styleName} bordered />
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="settings-outline" size={ms(15)} color={AppColors.primaryDark ?? TEAL} />
              <Text style={styles.sectionHeaderText}>INSPECTION SETUP</Text>
            </View>
            <View style={styles.sectionBody}>
              <SelectableRow
                styles={styles}
                label="Size"
                value={size?.value}
                onPress={() => setActiveSheet('size')}
              />
               <SelectableRow
                styles={styles}
                label="Inspection Qty"
                bordered
                disabled={!size}
                placeholder={!size ? 'Select size first' : 'Enter'}
                value={!size ? null : (loadingQty ? 'Calculating…' : (qty != null ? String(qty) : null))}
                settingstype={settingstype}
                wip={sizeWIP}
                output={output}
                manualTag={!!size}
                onPress={handleOpenManualQty}
              />
              <SelectableRow
                styles={styles}
                label="Inspection Level"
                bordered
                value={level?.value}
                onPress={() => setActiveSheet('level')}
              />
              <SelectableRow
                styles={styles}
                label="AQL Level - Minor"
                bordered
                value={aqlMinor?.value}
                onPress={() => setActiveSheet('minor')}
              />
              <SelectableRow
                styles={styles}
                label="AQL Level - Major"
                bordered
                value={aqlMajor?.value}
                onPress={() => setActiveSheet('major')}
              />
              <SelectableRow
                styles={styles}
                label="AQL Level - Critical"
                bordered
                value={aqlCritical}
                type={true}
              />
             
              <SelectableRow
                styles={styles}
                label="Sample Size"
                disabled={true}
                bordered
                value={sampleSize ? String(sampleSize) : '—'}
                onPress={() => setActiveSheet('sample')}
                type={true}
              />
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.primaryBtn,
            !allSelected && styles.primaryBtnDisabled,
            pressed && allSelected && { opacity: 0.9 },
          ]}
        >
          <Ionicons name="options-outline" size={18} color={AppColors.onPrimary} />
          <Text style={styles.primaryBtnText}>Select Defects</Text>
        </Pressable>
      </View>

      {Object.entries(sheetConfig).map(([key, cfg]) => (
        <SelectListSheet
          key={key}
          visible={activeSheet === key}
          onClose={closeSheet}
          title={cfg.title}
          data={cfg.data}
          selectedId={cfg.selectedId}
          onApply={cfg.onApply}
          loading={loadingLists}
          getRightText={cfg.getRightText}
        />
      ))}

      <ManualQtyModal
        visible={manualQtyVisible}
        initialValue={qty}
        maxValue={sizeQtyLimit > 0 ? sizeQtyLimit : null}
        settingstype={settingstype}
        wip={sizeWIP}
        output={output}
        onClose={() => setManualQtyVisible(false)}
        onSave={(n) => { setQty(n); setQtyManual(true); }}
      />
    </View>
  );
}
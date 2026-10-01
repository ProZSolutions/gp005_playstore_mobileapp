import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import createStyles from '../styles/Continuitymappingstyles';
import SelectOptionSheet from '../../components/SelectOptionSheet';
import continuityService, { isSelected } from '../../api/services/continuityService';
import { showAlert } from '../../utils/AlertService';
import { usePermissions, GROUP, ACTION } from '../../context/PermissionsContext';
import { useOrientation } from '../../hooks/useOrientation';

const TEAL = AppColors.primary;


function InfoChipRow({ icon, label, value, onPress, chevron, placeholder, disabled, badge, styles, ms }) {
  const isEmpty = value === undefined || value === null || value === '';
  const content = (
    <View style={[styles.infoRow  ]}>
      <View style={[styles.iconBadge ]}>
        <Icon name={icon} size={ms(15)} color={AppColors.primary} />
      </View>
      <View style={styles.infoTextCol}>
        <Text style={[styles.infoLabel]}>{label}</Text>
        <Text
          style={[
            styles.infoValue,
            isEmpty && styles.infoValuePlaceholder,
           ]}
          numberOfLines={1}
        >
          {isEmpty ? placeholder ?? '—' : value}
        </Text>
      </View>
      <View style={styles.infoRight}>
        {badge}
        {chevron && !disabled && (
          <Icon name="chevron-right" size={16} color={AppColors.primaryDark} />
        )}
      </View>
    </View>
  );

  if (!onPress || disabled) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.7 }}>
      {content}
    </Pressable>
  );
}

function AutoSyncBadge({ styles }) {
  return (
    <View style={styles.autoSyncBadge}>
      <Icon name="check-circle" size={11} color="#16A34A" style={styles.autoSyncIcon} />
      <Text style={styles.autoSyncText}>Auto Sync</Text>
    </View>
  );
}

const UNSET = { id: 0, label: null };

export default function OrderContinuityMappingScreen({ navigation }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs, isLargeScreen } = useResponsive();
  const { isLandscape } = useOrientation();

  // Side-by-side ONLY when it's a large screen AND in landscape.
  // Large+portrait, mobile+portrait, mobile+landscape all stack.
  const useSideBySide = isLargeScreen && isLandscape;

  // IMPORTANT: pass `useSideBySide` into the 4th param — createStyles only
  // takes 4 args (ms, mvs, fs, isLargeScreen) and uses that 4th value to
  // decide row vs column layout. Passing the raw `isLargeScreen` here was
  // the bug that kept tablet-portrait side-by-side.
  const styles = createStyles(ms, mvs, fs, useSideBySide);

  const { canView, can, loading: permissionsLoading } = usePermissions();
  const canCreateAudit = can(GROUP.CONTINUITY, ACTION.CREATE);

  // ---- From Order state ----
  const [fromLine, setFromLine] = useState(UNSET);
  const [fromStyle, setFromStyle] = useState(UNSET);
  const [fromOrder, setFromOrder] = useState(UNSET);
  const [fromColor, setFromColor] = useState(UNSET);
  const [fromOrderList, setFromOrderList] = useState([]); // orders for the selected line+style
  const [fromColorList, setFromColorList] = useState([]); // colors mapped to the selected from-order

  // ---- To Order state (populated after Process) ----
  const [processed, setProcessed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [toOrder, setToOrder] = useState(UNSET);
  const [toColor, setToColor] = useState(UNSET);
  const [toOrderList, setToOrderList] = useState([]);
  const [toColorList, setToColorList] = useState([]);
  const [saving, setSaving] = useState(false);

  // ---- Sheet visibility ----
  const [lineSheetVisible, setLineSheetVisible] = useState(false);
  const [styleSheetVisible, setStyleSheetVisible] = useState(false);
  const [fromOrderSheetVisible, setFromOrderSheetVisible] = useState(false);
  const [fromColorSheetVisible, setFromColorSheetVisible] = useState(false);
  const [toOrderSheetVisible, setToOrderSheetVisible] = useState(false);
  const [toColorSheetVisible, setToColorSheetVisible] = useState(false);

  const resetDownstreamFromLine = () => {
    setFromStyle(UNSET);
    setFromOrder(UNSET);
    setFromColor(UNSET);
    setFromOrderList([]);
    setFromColorList([]);
    resetToOrder();
  };
  const resetDownstreamFromStyle = () => {
    setFromOrder(UNSET);
    setFromColor(UNSET);
    setFromColorList([]);
    resetToOrder();
  };
  const resetToOrder = () => {
    setProcessed(false);
    setToOrder(UNSET);
    setToColor(UNSET);
    setToOrderList([]);
    setToColorList([]);
  };

  // ---- Field pickers ----

  const handlePickLine = useCallback((line) => {
    setFromLine(line);
    resetDownstreamFromLine();
  }, []);

  const handlePickStyle = useCallback((style) => {
    setFromStyle(style);
    resetDownstreamFromStyle();
  }, []);

  const handlePickFromOrder = useCallback((orderItem) => {
    setFromOrder(orderItem);
    const colors = orderItem?.colorOptions ?? [];
    setFromColorList(colors);
    setFromColor(colors.length === 1 ? colors[0] : UNSET);
    resetToOrder();
  }, []);

  const handlePickFromColor = useCallback((color) => {
    setFromColor(color);
    resetToOrder();
  }, []);

  const handlePickToOrder = useCallback((orderItem) => {
    setToOrder(orderItem);
    const colors = orderItem?.colorOptions ?? [];
    setToColorList(colors);
    setToColor(colors.length === 1 ? colors[0] : UNSET);
  }, []);

  const handlePickToColor = useCallback((color) => {
    setToColor(color);
  }, []);

  // ---- Fetchers passed into SelectOptionSheet ----

  const fetchLines = useCallback(() => continuityService.getLineList(), []);

  const fetchStyles = useCallback(
    () => continuityService.getStyleList({ lineId: fromLine.id }),
    [fromLine.id],
  );

  const fetchFromOrders = useCallback(async () => {
    const result = await continuityService.getOrderDetails({ lineId: fromLine.id, styleId: fromStyle.id });
    if (result?.success) setFromOrderList(result.data ?? []);
    return result;
  }, [fromLine.id, fromStyle.id]);

  // ---- Derived enable/disable flags ----

  const styleEnabled = isSelected(fromLine);
  const fromOrderEnabled = isSelected(fromStyle);
  const fromColorEnabled = isSelected(fromOrder);

  const fromOrderComplete =
    isSelected(fromLine) && isSelected(fromStyle) && isSelected(fromOrder) && isSelected(fromColor);

  // Mutual exclusivity: once Process has succeeded (processed === true),
  // Process disables and only Save is active. Changing ANY From Order
  // field calls resetToOrder() (via resetDownstreamFromLine/Style or the
  // order/color pick handlers), which flips processed back to false —
  // that immediately re-enables Process and disables Save again.
  const processDisabled = !fromOrderComplete || processing || processed;

  const toOrderSectionEnabled = processed;
  const toColorEnabled = processed && isSelected(toOrder);

  const saveDisabled = !processed || !isSelected(toOrder) || !isSelected(toColor) || saving;

  // ---- Process ----

  const handleProcess = useCallback(async () => {
    if (processDisabled) return;
    setProcessing(true);
    try {
      const result = await continuityService.processFromOrder({
        lineId: fromLine.id,
        styleId: fromStyle.id,
        orderId: fromOrder.id,
        colorId: fromColor.id,
        colorName: fromColor.label,
      });
      if (result?.success) {
        setToOrderList(result.data ?? []);
        setToOrder(UNSET);
        setToColor(UNSET);
        setToColorList([]);
        setProcessed(true);
      }
    } finally {
      setProcessing(false);
    }
  }, [processDisabled, fromLine, fromStyle, fromOrder, fromColor]);



  const handleSave = useCallback(async () => {
    if (saveDisabled) return;
    setSaving(true);
    try {
      const result = await continuityService.saveContinuityMapping({
        lineId: fromLine.id,
        styleId: fromStyle.id,
        fromOrderNo: fromOrder.label,
        fromColor: fromColor.label,
        toOrderNo: toOrder.label,
        toColor: toColor.label,
      });
      if (result?.success) {
        showAlert('success', 'Saved', 'Continuity mapping saved successfully.');
        // TODO: confirm the actual route name for the Continuity Mapping
        // list screen in your navigator — replace 'ContinuityMappingList'
        // below if it differs.
        navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
      }
    } finally {
      setSaving(false);
    }
  }, [saveDisabled, fromLine, fromStyle, fromOrder, fromColor, toOrder, toColor, navigation]);

  // ---- Permission gate ----
  // While permissions are still resolving, avoid flashing the no-access
  // screen before canCreateAudit has a real value.
  if (permissionsLoading) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={TEAL} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="small" color={AppColors.primary} />
        </View>
      </View>
    );
  }

  if (!canCreateAudit) {
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
              <Text style={styles.titleText}>Continuity Mapping</Text>
            </View>
          </SafeAreaView>
        </View>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: ms(24) }}>
          <Icon name="lock" size={ms(28)} color={AppColors.textTertiary} />
          <Text
            style={{
              marginTop: mvs(10),
              textAlign: 'center',
              color: AppColors.textTertiary,
              fontSize: fs(14),
              fontWeight: '500',
            }}
          >
            You do not have permission to access this.
          </Text>
        </View>
      </View>
    );
  }

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
            <Text style={styles.titleText}>Continuity Mapping</Text>
          </View>
        </SafeAreaView>
      </View>




      <View style={styles.body}>
         <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.sectionsRow}>
            {/* ---------------- FROM ORDER ---------------- */}
            <View style={styles.sectionColumn}>
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Icon name="file-text" size={ms(15)} color={AppColors.primaryDark} />
                  <Text style={styles.sectionHeaderText}>FROM ORDER</Text>
                  <Text style={styles.requiredDot}>*</Text>
                </View>
                <View style={styles.sectionBody}>
                  <InfoChipRow
                    styles={styles}
                    ms={ms}
                    icon="list"
                    label="Line No"
                    value={fromLine.label}
                    placeholder="Select Line"
                    onPress={() => setLineSheetVisible(true)}
                    chevron
                  />
                  <InfoChipRow
                    styles={styles}
                    ms={ms}
                    icon="user"
                    label="Buyer & Style"
                    value={fromStyle.label}
                    placeholder={styleEnabled ? 'Select Style' : 'Select Line first'}
                    onPress={() => setStyleSheetVisible(true)}
                    chevron
                    disabled={!styleEnabled}
                  />
                  <InfoChipRow
                    styles={styles}
                    ms={ms}
                    icon="hash"
                    label="Order Number"
                    value={fromOrder.label}
                    placeholder={fromOrderEnabled ? 'Select Order Number' : 'Select Style first'}
                    onPress={() => setFromOrderSheetVisible(true)}
                    chevron
                    disabled={!fromOrderEnabled}
                  />
                  <InfoChipRow
                    styles={styles}
                    ms={ms}
                    icon="droplet"
                    label="Colour"
                    value={fromColor.label}
                    placeholder={fromColorEnabled ? 'Select Colour' : 'Select Order first'}
                    onPress={() => setFromColorSheetVisible(true)}
                    chevron
                    disabled={!fromColorEnabled}
                  />
                </View>
              </View>

              {!useSideBySide && (
                <View style={styles.flowDivider}>
                  <View style={styles.flowDividerLine} />
                  <View style={styles.flowDividerIconWrap}>
                    <ActivityIndicator
                      animating={processing}
                      color={AppColors.primaryDark}
                      style={{ display: processing ? 'flex' : 'none' }}
                    />
                    {!processing && <Icon name="arrow-down" size={ms(15)} color={AppColors.primaryDark} />}
                  </View>
                  <View style={styles.flowDividerLine} />
                </View>
              )}

              <Pressable
                disabled={processDisabled}
                onPress={handleProcess}
                style={({ pressed }) => [
                  styles.submitBtn,
                  processDisabled && styles.submitBtnDisabled,
                  { marginBottom: mvs(14) },
                  pressed && !processDisabled && { opacity: 0.9 },
                ]}
              >
                {processing ? (
                  <ActivityIndicator size="small" color={AppColors.onPrimary} />
                ) : (
                  <Text style={[styles.submitBtnText, processDisabled && styles.submitBtnTextDisabled]}>
                    {processed ? 'Processed' : 'Process'}
                  </Text>
                )}
              </Pressable>
            </View>

            {/* ---------------- TO ORDER ---------------- */}
            <View style={styles.sectionColumn}>
              <View style={[styles.sectionCard, !toOrderSectionEnabled && styles.sectionCardDisabled]}>
                <View style={styles.sectionHeaderRow}>
                  <Icon
                    name="file-text"
                    size={ms(15)}
                    color={toOrderSectionEnabled ? AppColors.primaryDark : AppColors.textTertiary}
                  />
                  <Text
                    style={[styles.sectionHeaderText, !toOrderSectionEnabled && styles.sectionHeaderTextDisabled]}
                  >
                    TO ORDER
                  </Text>
                  {toOrderSectionEnabled && <Text style={styles.requiredDot}>*</Text>}
                </View>
                <View style={styles.sectionBody}>
                  <InfoChipRow
                    styles={styles}
                    ms={ms}
                    icon="list"
                    label="Line No"
                    value={toOrderSectionEnabled ? fromLine.label : undefined}
                    placeholder="—"
                    disabled
                    badge={toOrderSectionEnabled ? <AutoSyncBadge styles={styles} /> : null}
                  />
                  <InfoChipRow
                    styles={styles}
                    ms={ms}
                    icon="user"
                    label="Buyer & Style"
                    value={toOrderSectionEnabled ? fromStyle.label : undefined}
                    placeholder="—"
                    disabled
                    badge={toOrderSectionEnabled ? <AutoSyncBadge styles={styles} /> : null}
                  />
                  <InfoChipRow
                    styles={styles}
                    ms={ms}
                    icon="hash"
                    label="Order Number"
                    value={toOrder.label}
                    placeholder={toOrderSectionEnabled ? 'Select Order Number' : 'Run Process first'}
                    onPress={() => setToOrderSheetVisible(true)}
                    chevron
                    disabled={!toOrderSectionEnabled}
                  />
                  <InfoChipRow
                    styles={styles}
                    ms={ms}
                    icon="droplet"
                    label="Colour"
                    value={toColor.label}
                    placeholder={toColorEnabled ? 'Select Colour' : 'Select Order first'}
                    onPress={() => setToColorSheetVisible(true)}
                    chevron
                    disabled={!toColorEnabled}
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <Pressable onPress={() => navigation?.goBack?.()} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>

        <Pressable
          disabled={saveDisabled}
          onPress={handleSave}
          style={({ pressed }) => [
            styles.submitBtn,
            saveDisabled && styles.submitBtnDisabled,
            pressed && !saveDisabled && { opacity: 0.9 },
          ]}
        >
          {saving ? (
            <ActivityIndicator size="small" color={AppColors.onPrimary} />
          ) : (
            <Text style={[styles.submitBtnText, saveDisabled && styles.submitBtnTextDisabled]}>Save Changes</Text>
          )}
        </Pressable>
      </View>


      {/* ---- From Order sheets ---- */}
      <SelectOptionSheet
        visible={lineSheetVisible}
        onClose={() => setLineSheetVisible(false)}
        title="Line"
        selectedId={fromLine.id || null}
        onApply={handlePickLine}
        fetchOptions={fetchLines}
      />
      <SelectOptionSheet
        visible={styleSheetVisible}
        onClose={() => setStyleSheetVisible(false)}
        title="Style"
        selectedId={fromStyle.id || null}
        onApply={handlePickStyle}
        fetchOptions={fetchStyles}
      />
      <SelectOptionSheet
        visible={fromOrderSheetVisible}
        onClose={() => setFromOrderSheetVisible(false)}
        title="Order Number"
        selectedId={fromOrder.id || null}
        onApply={handlePickFromOrder}
        fetchOptions={fetchFromOrders}
      />
      <SelectOptionSheet
        visible={fromColorSheetVisible}
        onClose={() => setFromColorSheetVisible(false)}
        title="Colour"
        selectedId={fromColor.id || null}
        onApply={handlePickFromColor}
        options={fromColorList}
        searchable={false}
        emptyMessage="No colours mapped to this order."
      />

      {/* ---- To Order sheets ---- */}
      <SelectOptionSheet
        visible={toOrderSheetVisible}
        onClose={() => setToOrderSheetVisible(false)}
        title="Order Number"
        selectedId={toOrder.id || null}
        onApply={handlePickToOrder}
        options={toOrderList}
        emptyMessage="No matching orders found to continue onto."
      />
      <SelectOptionSheet
        visible={toColorSheetVisible}
        onClose={() => setToColorSheetVisible(false)}
        title="Colour"
        selectedId={toColor.id || null}
        onApply={handlePickToColor}
        options={toColorList}
        searchable={false}
        emptyMessage="No colours mapped to this order."
      />
    </View>
  );
}
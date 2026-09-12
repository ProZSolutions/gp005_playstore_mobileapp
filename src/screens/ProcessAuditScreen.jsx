import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Slider from '../components/CustomSlider';
import { ms, mvs, fs } from '../utils/scale';
import {getSelectedLineId} from '../api/storage/authStorage';
import { AppColors } from '../theme/theme';
import { scale, verticalScale, fontScale, moderateScale } from '../utils/scale';
import { QUALITY_CHECKS, SPI_MIN, SPI_MAX } from '../utils/auditData';
import GlobalStyles from './styles';
import { verifyAndGetSlot } from '../utils/slotVerification';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {
  AuditHeader,
  OperatorOrderCard,
  SectionLabel, SectionLabelNew
} from '../components/SharedComponents';
import OrderDetailsSheet from '../components/OrderDetailsSheet';

function QualityCheckRow({ check, result, onPass, onFail }) {
  const accentColor =
    result === 'pass' ? AppColors.success :
    result === 'fail' ? AppColors.error   : AppColors.border;

  return (
    <View style={GlobalStyles.container.qcRow}>
      <View style={[GlobalStyles.container.qcAccent, { backgroundColor: accentColor }]} />

      <View style={GlobalStyles.container.kav}>
        <Text style={GlobalStyles.text.qcName}>{check.name}</Text>
        <Text style={GlobalStyles.text.qcDesc}>{check.description}</Text>
      </View>

      <View style={GlobalStyles.container.qcBtns}>
        <TouchableOpacity
          style={[GlobalStyles.button.qcBtn, result === 'pass' && GlobalStyles.text.qcBtnPassActive]}
          onPress={onPass}
          activeOpacity={0.75}
        >
          <Text
            style={[GlobalStyles.text.qcBtnText, result === 'pass' && GlobalStyles.text.qcBtnTextPass]}
          >
            Pass
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[GlobalStyles.button.qcBtn, result === 'fail' && GlobalStyles.text.qcBtnFailActive]}
          onPress={onFail}
          activeOpacity={0.75}
        >
          <Text
            style={[GlobalStyles.text.qcBtnText, result === 'fail' && GlobalStyles.text.qcBtnTextFail]}
          >
            Fail
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ProcessAuditScreen({ route, navigation }) {
  const zone = route?.params?.zone ?? { id: 'zone_a', name: 'Zone A' };
  const line = route?.params?.line ?? { id: 'la1', name: 'Line A1' };
  const selectedLine = route?.params?.selectedLine;
    console.log("selected line in process "+selectedLine);

   const order = route?.params?.order ?? {
    tlsCode:   'ORD-2026-0392',
    colour:    'Golden Yellow',
    colourHex: '#E8B400',
    buyer:     'ABC Corp.',
    style:     'Polo T-Shirt',
    styleNo:   'ST-001',
    createdOn: '30 May, 2026',
  };
  const operator = route?.params?.operator ;

  console.log(" operator details "+JSON.stringify(operator));
  const user = route?.params?.user ?? null;
  const scannedTlsId = route?.params?.scannedTlsId ?? null;

   
  const [spiCount, setSpiCount]     = useState(0);
  const [qcResults, setQcResults]   = useState({ spi: null, trim: null, tension: null });
  const [showDetails, setShowDetails] = useState(false);
  const [header, setHeader] = useState("Process Audit - " + operator.lineNo);
  const [slotInfo, setSlotInfo] = useState(null);
  const [slotChecked, setSlotChecked] = useState(false);

/*useEffect(() => {
  let isMounted = true;

  const checkSlot = async () => {
    const storedLineId = await getSelectedLineId();

    if (!storedLineId) {
      console.warn('ProcessAuditScreen: no stored lineId available for slot verification');
      if (isMounted) setSlotChecked(true);
      return;
    }

    const { slot } = await verifyAndGetSlot({
      lineId: storedLineId,
      navigation,
      listRouteName: 'TLSAuditScreen',
    });

    if (isMounted) {
      setSlotInfo(slot);
      setSlotChecked(true);
    }
  };

  checkSlot();

  return () => {
    isMounted = false;
  };
}, [navigation]); */

 /* const allChecked = useMemo(
    () => QUALITY_CHECKS.every((c) => qcResults[c.id] !== null),
    [qcResults],
  ); */
  const allChecked = true;

 const handleQC = useCallback((id, result) => {
  setQcResults((prev) => ({
    ...prev,
    [id]: prev[id] === result ? null : result,
  }));
}, []);
  const handleProceed = useCallback(() => {
    if (!allChecked) return;
    navigation?.navigate('ProductAuditScreen', {
      user,
      zone,
      line,
      order,
      operator,
      spiCount,
      qcResults,
      scannedTlsId, 
      selectedLine,
    });
  }, [allChecked, user, zone, line, order, operator, spiCount, qcResults, scannedTlsId, selectedLine, navigation]);

  // Prefer the freshly-verified slot name over whatever was passed in via operator
  const operatorWithSlot = useMemo(
    () => ({
      ...operator,
      slot: slotInfo?.slot_name ?? operator.slot,
     }),
    [operator, slotInfo],
  );

  return (
    <SafeAreaView style={GlobalStyles.container.safe_primary}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.primary} />

      <AuditHeader
        title={header}
        header='TLS Audit'
        step={1}
        totalSteps={2}
        onCancel={() => navigation?.navigate('TLSAuditScreen')}
      />
 
      <View style={GlobalStyles.container.safe}>
        <View style={GlobalStyles.container.fixedCardWrap}>
          <OperatorOrderCard
            order={order}
            operator={operatorWithSlot}
            onViewAll={() => setShowDetails(true)}
          />
        </View>

        <ScrollView
          style={GlobalStyles.container.scroll}
          contentContainerStyle={GlobalStyles.container.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={GlobalStyles.container.card_pro}>
            <View style={GlobalStyles.container.spiHeaderRow}>
              <SectionLabelNew label="SPI COUNT" />
              <View style={GlobalStyles.container.spiValueWrap}>
                <Text style={GlobalStyles.text.spiValue}>{spiCount}</Text>
                <Text style={GlobalStyles.text.spiUnit}> stitches / inch</Text>
              </View>
            </View>
   
            <View style={GlobalStyles.container.sliderRow}>
              <Text style={GlobalStyles.text.sliderBound}>{SPI_MIN}</Text>
              <Slider
                style={GlobalStyles.container.slider}
                minimumValue={SPI_MIN}
                maximumValue={SPI_MAX}
                step={1}
                value={spiCount}
                onValueChange={(v) => setSpiCount(v)}
                minimumTrackTintColor={AppColors.primary}
                maximumTrackTintColor={AppColors.border}
                thumbTintColor={AppColors.primary}
              />
   
              <Text style={GlobalStyles.text.sliderBound}>{SPI_MAX}</Text>
            </View>
          </View>

          <View style={GlobalStyles.container.card_pro}>
            <View style={{marginLeft:10}}>
              <SectionLabel label="QUALITY CHECKS" />
            </View>
            <View style={{ marginTop: verticalScale(10) }}>
              {QUALITY_CHECKS.map((check, idx) => (
                <View key={check.id}>
                  <QualityCheckRow
                    check={check}
                    result={qcResults[check.id]}
                    onPass={() => handleQC(check.id, 'pass')}
                    onFail={() => handleQC(check.id, 'fail')}
                  />
                  {idx < QUALITY_CHECKS.length - 1 && (
                    <View style={GlobalStyles.container.cardDivider} />
                  )}
                </View>
              ))}
            </View>
          </View>
          <View style={GlobalStyles.text.warningBox}>
            <Ionicons
              name="alert-circle-outline"
              style={[GlobalStyles.text.auditRowIconShield,GlobalStyles.text.mt]}
            />

            <Text style={[GlobalStyles.text.warningText,,GlobalStyles.text.mt]}>
              Un-selected checks will be treated as{'\n'}
              <Text style={{ fontWeight: '700' }}>N/A</Text>
            </Text>
          </View>

          <View style={{ height: verticalScale(8) }} />
        </ScrollView>
      </View>

      <View style={GlobalStyles.container.footer}>
        <TouchableOpacity
          style={[GlobalStyles.button.submitBtn, allChecked && GlobalStyles.button.submitBtnActive]}
          onPress={handleProceed}
          activeOpacity={allChecked ? 0.85 : 1}
          disabled={!allChecked}
        >
          <Text
            style={[
              GlobalStyles.text.submitBtnText,
              allChecked && GlobalStyles.text.submitBtnTextActive,
            ]}
          >
            Proceed to Product Audit
          </Text>
        </TouchableOpacity>
      </View>

      <OrderDetailsSheet
        visible={showDetails}
        onClose={() => setShowDetails(false)}
        order={order}
        operator={operatorWithSlot}
        navigation={navigation}
        lineId={selectedLine}
        listRouteName="TLSAuditScreen"
      />
    </SafeAreaView>
  );
}
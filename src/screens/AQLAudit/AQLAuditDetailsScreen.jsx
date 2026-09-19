import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, ActivityIndicator, SafeAreaView,TextInput, 
  StyleSheet ,Switch, BackHandler } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { AppColors } from '../../theme/theme';
import { useResponsive } from '../../utils/responsive';
import createStyles from '../../screens/styles/AQLAuditStyles';
import { showAlert } from '../../utils/AlertService';
import DefectEntrySheet from '../../components/DefectEntrySheet';
import { submitAqlAudit } from '../../api/services/aqlAuditService'; 
import { getCategoryDropdown, getSeverityDropdown } from '../../api/services/tlsService';
import createStyless from '../styles/ReworkTrackerDetailsStyles';
import { useOrientation } from '../../hooks/useOrientation';

const TEAL = AppColors.primary;

// NOTE: set this to the exact route name registered in your navigator for
// the AQL order-list screen (InputListScreen). Used only in the post-submit
// navigation.reset below so the stack has something to pop back to.
const AQL_LIST_ROUTE_NAME = 'AQLAuditList';

function InfoRow({ styles, icon, text }) {
  return (
    <View style={styles.summaryRow}>
      <Ionicons name={icon} size={14} color={AppColors.onPrimary} />
      <Text style={styles.summaryText} numberOfLines={1}>{text}</Text>
    </View>
  );
}

function ResultRow({ styles, label, value, bordered, danger, onPress, chevron }) {
  const content = (
    <View style={[styles.detailRow, bordered && styles.detailRowBorder]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={[styles.detailValue, danger && styles.detailValueDanger]}>{value}</Text>
        {chevron && <Ionicons name="chevron-forward" size={14} color={AppColors.textTertiary ?? '#9CA3AF'} />}
      </View>
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.7 }}>
      {content}
    </Pressable>
  );
}

export default function AQLAuditDetailsScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs ,isLargeScreen} = useResponsive();
  const styles = createStyles(ms, mvs, fs);
   const styles_re = createStyless(ms, mvs, fs);
  const [notes, setNotes] = useState('');
  const { isLandscape } = useOrientation();
  const pickStyle = (largePortrait, largeLandscape, mobilePortrait, mobileLandscape) =>   isLargeScreen ? (isLandscape ? largeLandscape : largePortrait): 
(isLandscape ? mobileLandscape : mobilePortrait);
 const textStyle = pickStyle(styles.headerTopRowLarge,styles.headerTopRowLarge,null,styles.headerTopRow);

const { orderInfo, styleInfo, user, lineId, inspectionSetup, settingstype, output } = route?.params ?? {};
  const {
    size,
    level,
    aqlMajor,        
    aqlMinor,         
         
    qty,
    sampleSize,
    allowMajor,     
    allowMinor,      
    allowCritical,   
  } = inspectionSetup ?? {};
  const sizeWip = size?.wip ?? 0;
  console.log("size wip "+sizeWip);
    const [escalation, setEscalation] = useState(false);
  
  const aqlCritical =0;
  const allowedMajor = Number(allowMajor) || 0;
  const allowedMinor = Number(allowMinor) || 0;
  const allowedCritical = Number(allowCritical) || 0;
  console.log("style info "+JSON.stringify(styleInfo));

   const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingCategories(true);
      try {
        const list = await getCategoryDropdown();
        if (!cancelled) setCategories(list ?? []);
      } catch (e) {
        if (!cancelled) showAlert('error', 'Failed to Load', e.message ?? 'Could not load defect categories.');
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);
 
  const [severities, setSeverities] = useState([]);
  const [loadingSeverities, setLoadingSeverities] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingSeverities(true);
      try {
        const list = await getSeverityDropdown();
        if (!cancelled) setSeverities(list ?? []);
      } catch (e) {
        if (!cancelled) showAlert('error', 'Failed to Load', e.message ?? 'Could not load severities.');
      } finally {
        if (!cancelled) setLoadingSeverities(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const severityLabel = (s) => s?.value ?? s?.name ?? s?.label ?? String(s?.id ?? '');

  // ── Defect entries ─────────────────────────────────────────────
  const [entries, setEntries] = useState({});
  const [sheetVisible, setSheetVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totals = useMemo(() => {
    const t = {};
    Object.values(entries).forEach((e) => {
      t[e.severity_id] = (t[e.severity_id] ?? 0) + e.qty;
    });
    return t;
  }, [entries]);

  // Match totals by severity NAME (major/minor/critical) resolved against
  // the real severity list, instead of a hardcoded id that never matched.
  const countByName = useCallback((name) => {
    const sev = severities.find((s) => severityLabel(s).toLowerCase() === name);
    return sev ? (totals[sev.id] ?? 0) : 0;
  }, [severities, totals]);

  const foundMajor = countByName('major');
  const foundMinor = countByName('minor');
  const foundCritical = countByName('critical');
  const totalFound = foundMajor + foundMinor + foundCritical;

  const isFail = foundCritical > allowedCritical || foundMajor > allowedMajor || foundMinor > allowedMinor;

  // Safety net: if this screen is ever the root of the stack (e.g. reached
  // via navigation.reset) there's nothing to pop, and on Android the
  // default hardware-back behavior in that case is to exit the app. This
  // guard makes sure back always lands somewhere inside the app instead.
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

  {/**   const handleSubmit = useCallback(async (destination = 'list') => {
    setSubmitting(true);
    try { 
      const res = await submitAqlAudit({
        lineId,
        orderInfo,
        styleInfo,
        inspectionSetup,
        entries: Object.values(entries),
        submittedBy: user,
        notes:notes,
        is_escalate:escalation?1:0,
      });
      if (res?.success) {
        showAlert('success', 'Submitted',res?.message);
       }
       if (destination === 'exit') {
            navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
          } else {
            navigation.reset({ index: 0, routes: [{ name: 'AQLAuditList' }] });
          }
    } catch (e) {
      showAlert('error', 'Submit Failed', e.message ?? 'Something went wrong while submitting the audit.');
    } finally {
      setSubmitting(false);
    }
  }, [lineId, orderInfo, styleInfo, inspectionSetup, entries, isFail, user, navigation]); */}
const handleSubmit = useCallback(async (destination = 'list') => {
    setSubmitting(true);
    try { 
      const res = await submitAqlAudit({
        lineId,
        orderInfo,
        styleInfo,
        inspectionSetup,
        entries: Object.values(entries),
        submittedBy: user,
        notes: notes,
        is_escalate: escalation ? 1 : 0,
      });
      if (res?.success) {
        showAlert('success', 'Submitted', res?.message);
      }
      if (destination === 'exit') {
        navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
      } else { 
        // FIX: previously this reset put AQLOrderDetailsScreen alone at the
        // root (index: 0), leaving nothing underneath it. That meant the
        // next back press (hardware or header) had nowhere to pop to, and
        // Android's default behavior for a rootless nav stack is to close
        // the app. Now the order list is kept underneath at index 0, with
        // AQLOrderDetailsScreen on top at index 1 — same screen shown to
        // the user, but back now goes to the order list instead of exiting.
        navigation.reset({
          index: 1,
          routes: [
            {
              name: AQL_LIST_ROUTE_NAME,
              params: {
                user,
                lineId: [lineId],
                lineName: [orderInfo?.lineLabel],
                settingstype,
                output,
              },
            },
            {
              name: 'AQLOrderDetailsScreen',
              params: {
                orderInfo,
                styleInfo,
                user,
                lineId,
                lineName: orderInfo?.lineLabel,
                settingstype, 
                output,  
              },
            },
          ],
        });
      }
    } catch (e) {
      showAlert('error', 'Submit Failed', e.message ?? 'Something went wrong while submitting the audit.');
    } finally {
      setSubmitting(false);
    }
  }, [lineId, orderInfo, styleInfo, inspectionSetup, entries, isFail, user, notes, escalation, navigation]);
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />

      <View style={styles.headerWrap}>
        <View edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={[styles.headerTopRow,textStyle]}>
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
            <Text style={styles.stepSubText}>Step 2 of 2 : Audit Details</Text>
          </View>

          <View style={styles.progressRow}>
            <View style={[styles.progressSeg, styles.progressSegActive]} />
            <View style={[styles.progressSeg, styles.progressSegActive]} />
          </View>

           
          <View style={styles_re.metaWrap}>
            <View style={styles_re.metaRow}>
              <Ionicons name="layers-outline" size={ms(14)} color={AppColors.onPrimary} style={styles_re.metaIcon} />
              <Text style={styles_re.metaText}>{orderInfo?.lineLabel ?? '—'}</Text>
               <Text style={styles_re.metaDot}>•</Text>
               <Text style={styles_re.metaText}>{orderInfo?.orderNo ?? '—'}</Text>
              <Text style={styles_re.metaDot}>•</Text>
              <Text style={styles_re.metaText}>{orderInfo?.colour ?? '—'}</Text>
            </View>
            <View style={styles_re.metaRow}>
              <Ionicons name="cube-outline" size={ms(14)} color={AppColors.onPrimary} style={styles_re.metaIcon} />
              <Text style={styles_re.metaText}>{styleInfo?.buyer ?? '—'}</Text>
              <Text style={styles_re.metaDot}>•</Text>
              <Text style={styles_re.metaText}>{styleInfo?.styleNo ?? '—'}</Text>
              <Text style={styles_re.metaDot}>•</Text>
              <Text style={styles_re.metaText}>{styleInfo?.styleName ?? '—'}</Text>
            </View>
            <View style={styles_re.metaRow}>
              <Ionicons name="cube-outline" size={ms(14)} color={AppColors.onPrimary} style={styles_re.metaIcon} />
              <Text style={styles_re.metaText}>Inspection Level - {level?.value ?? '—'}</Text>
            </View>
            <View style={styles_re.metaRow}>
              <Ionicons name="color-palette-outline" size={ms(14)} color={AppColors.onPrimary} style={styles_re.metaIcon} />
              <Text style={styles_re.metaText}>AQL Level {`Minor -${aqlMinor?.value ?? '—'} | Major -${aqlMajor?.value ?? '—'} | Critical -${aqlCritical?? '—'}`}</Text>
               
            </View>

            
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="settings-outline" size={ms(15)} color={AppColors.primaryDark ?? TEAL} />
              <Text style={styles.sectionHeaderText}>OUTPUT DETAILS</Text>
            </View>
            <View style={styles.sectionBody}>
               <ResultRow styles={styles} label="WIP" value={sizeWip?? '—'} bordered/>              
            </View>
          </View>
            
            <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="time-outline" size={ms(15)} color={AppColors.primaryDark ?? TEAL} />
              <Text style={styles.sectionHeaderText}>ENTERED INSPECTION QTY</Text>
            </View>
            <View style={styles.sectionBody}>
                <ResultRow styles={styles} label="Size" value={size?.value ?? '—'} />
              <ResultRow styles={styles} label="Inspection Qty" value={qty ?? '—'} bordered />
              <ResultRow styles={styles} label="Sample Size" value={sampleSize ?? '—'} bordered />          
            </View>
          </View>

           <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="shirt-outline" size={ms(15)} color={AppColors.primaryDark ?? TEAL} />
              <Text style={styles.sectionHeaderText}>ALLOWED DEFECTS</Text>
            </View>
            <View style={styles.sectionBody}>
                <ResultRow styles={styles} label="Allowed Minor Defects" value={allowedMinor} bordered />
              <ResultRow styles={styles} label="Allowed Major Defects" value={allowedMajor} bordered />
              <ResultRow styles={styles} label="Allowed Critical Defects" value={allowedCritical} bordered />         
            </View>
          </View>
            



          
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="bar-chart-outline" size={ms(15)} color={AppColors.primaryDark ?? TEAL} />
              <Text style={styles.sectionHeaderText}>AQL RESULT</Text>
            </View>
            <View style={styles.sectionBody}>
             
            
              <ResultRow
                styles={styles}
                label="Defect Found"
                value={totalFound}
                bordered
                chevron
                onPress={() => setSheetVisible(true)}
              />
            </View>

            <View style={styles.resultBandRow}>
              <Text style={styles.resultBandText}>Major -{foundMajor}   |   Minor -{foundMinor}   |</Text>                
                <Text style={[styles.resultBandText, { color: '#DC2626' }]}>Critical -{foundCritical}</Text>
              
            </View>

            <View style={[styles.resultBanner, isFail ? styles.resultBannerFail : styles.resultBannerPass]}>
              <Ionicons
                name={isFail ? 'close-circle' : 'checkmark-circle'}
                size={18}
                color={isFail ? '#DC2626' : '#059669'}
              />
              <Text style={[styles.resultBannerText, isFail ? styles.resultBannerTextFail : styles.resultBannerTextPass]}>
                Inspection Result - {isFail ? 'Fail' : 'Pass'} {qty ? `( ${qty} Pieces )` : ''}
              </Text>
            </View>
            <View style={{marginLeft:10,marginRight:10}}>
             <Text style={styles.detailLabel}>Notes</Text>
                <View style={styles.sectionCardN}>
                            <TextInput
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Enter your notes..."
                            placeholderTextColor={AppColors.textTertiary}
                            style={styles.notesInput}
                            multiline
                          />
                       </View>
            <View style={styles_re.sectionCard}>
                                              <View style={[styles_re.sectionBody, { paddingTop: mvs(10), paddingBottom: mvs(10) }]}>
                                                <View style={styles_re.escalateRow}>
                                                  <View style={styles_re.escalateLeft}>
                                                    <View style={styles_re.escalateIconWrap}>
                                                     <MaterialCommunityIcons name="shield-alert-outline" size={ms(16)} color={AppColors.secondary} />
                                                    
                                                    </View>
                                                    <Text style={styles_re.escalateLabel}>Escalate Issue</Text>
                                                  </View>
                                                  <Switch
                                                    value={escalation}
                                                    onValueChange={setEscalation}
                                                    trackColor={{ true: TEAL, false: AppColors.border }}
                                                    thumbColor={AppColors.onPrimary}
                                                  />
                                                </View>
                                              </View>
                                            </View>
            </View>
            


          </View>
        </ScrollView>
      </View>

     <View style={[styles.footer, { flexDirection: 'row', gap: 12 }]}>
                      <Pressable
                        onPress={() => handleSubmit('list')}
                        disabled={submitting}
                        style={({ pressed }) => [
                          styles.primaryBtn,
                          { flex: 1 },
                          submitting && { opacity: 0.7 },
                          pressed && !submitting && { opacity: 0.9 },
                        ]}
                      >
                        {submitting ? (
                          <ActivityIndicator color={AppColors.onPrimary} />
                        ) : (
                          <Text style={styles.primaryBtnText}>Submit</Text>
                        )}
                      </Pressable>

                      <Pressable
                        onPress={() => handleSubmit('exit')}
                        disabled={submitting}
                        style={({ pressed }) => [
                          styles.primaryBtn,
                          { flex: 1 },
                          submitting && { opacity: 0.7 },
                          pressed && !submitting && { opacity: 0.9 },
                        ]}
                      >
                        {submitting ? (
                          <ActivityIndicator color={AppColors.onPrimary} />
                        ) : (
                          <Text style={styles.primaryBtnText}>Submit & Exit</Text>
                        )}
                      </Pressable>
</View>

      <DefectEntrySheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        categories={categories}
        initialEntries={entries}
        onApply={(next) => setEntries(next)}
        // FIX: severities now passed down (same pattern as ProductAuditScreen)
        // so the sheet's tabs/totals and this screen's Major/Minor/Critical
        // totals are guaranteed to be keyed by the exact same severity_id.
        severities={severities}
        loadingSeverities={loadingSeverities}
      />
    </SafeAreaView>
  );
}
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Platform,
  Pressable,
  Animated,
  StyleSheet,
  BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getZones, getLinesByZoneIds } from '../api/services/dropdownApi';
import { useOrientation } from '../hooks/useOrientation';
import { useResponsive } from '../utils/responsive';
import { sortIds, sortById } from '../utils/sortById';


import { SkeletonList } from '../components/SkeletonListItem';
import { AppColors } from '../theme/theme';
import screenStyles, { landscapeStyles } from './styles/ZoneLineCheckInStyles';
import rowStyles       from '../components/styles/SelectableRowStyles';
import btnStyles       from '../components/styles/ActionButtonStyles';
import cbStyles        from '../components/styles/SelectionCheckboxStyles';
import { chipStyles, badgeStyles } from '../components/styles/ChipPillStyles';
import Icon from '../components/Icon';
import { ActionButton } from '../components/ActionButton';
import {
  getZoneIds,
  saveZoneIds,
  saveZoneNames,
  getZoneNames,
  getLineIds,
  saveLineIds,
  saveLineNames,
  getLineNames,
  clearOnlyBraLine,
  getLines,
  saveLines,
} from '../api/storage/authStorage';

const TEAL = AppColors.primary ?? '#0A9E96';

const asArray = (value) => (Array.isArray(value) ? value : []);

function SelectionCheckbox({ checked, size = 24 }) {
  const scale = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue:         checked ? 1 : 0,
      useNativeDriver: true,
      speed:           24,
      bounciness:      5,
    }).start();
  }, [checked, scale]);

  return (
    <View
      style={[
        cbStyles.outer,
        { width: size, height: size, borderRadius: size / 2 },
        checked && cbStyles.outerChecked,
      ]}
    >
      {checked && (
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="checkmark" size={size * 0.6} color="#fff" />
        </Animated.View>
      )}
    </View>
  );
}

function SelectableRow({ icon = 'location-outline', title, subtitle, selected, onPress, testID, disabled }) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      android_ripple={{ color: 'rgba(10,158,150,0.08)' }}
      style={({ pressed }) => [
        rowStyles.row,
        selected && rowStyles.rowSelected,
        pressed  && rowStyles.rowPressed,
      ]}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
    >
      <View style={rowStyles.iconWrap}>
        <Icon name={icon} size={18} />
      </View>
      <View style={rowStyles.textBlock}>
        <Text style={rowStyles.title} numberOfLines={1}>{title}</Text>
        {!!subtitle && (
          <Text style={rowStyles.subtitle} numberOfLines={1}>{subtitle}</Text>
        )}
      </View>
      <SelectionCheckbox checked={selected} size={24} />
    </Pressable>
  );
}

function StepBadge({ step }) {
  return (
    <View style={badgeStyles.badge}>
      <Text style={badgeStyles.text}>STEP {step} OF 2</Text>
    </View>
  );
}

function HeaderBackButton({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(255,255,255,0.18)' }}
      style={({ pressed }) => [
        localStyles.backBtn,
        pressed && { opacity: 0.85 },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Back"
    >
      <Ionicons name="chevron-back" size={16} color="#fff" />
      <Text style={localStyles.backText}>Back</Text>
    </Pressable>
  );
}

function SelectedChip({ label ,isLandscape}) {
  return (
    <View style={[chipStyles.chip ]}>
      <Ionicons name="checkmark" size={11} color="#fff" style={{ marginRight: 3 }} />
      <Text style={[chipStyles.text,isLandscape&&chipStyles.textLarge]}>{label}</Text>
    </View>
  );
}

const STEP_ZONES = 1;
const STEP_LINES = 2;

export default function ZoneLineCheckInScreen({ route, navigation }) {
  const {
    user,
    isChangeZone = false,
    currentZoneIds: rawCurrentZoneIds = [],
    currentLineIds: rawCurrentLineIds = [],
    currentZoneNames: rawCurrentZoneNames = [],
    currentLineNames: rawCurrentLineNames = [],
    branch_screen
  } = route.params ?? {};
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs, isLargeScreen } = useResponsive();

  const { isLandscape } = useOrientation();
  const insets = useSafeAreaInsets();

  const currentZoneIds = asArray(rawCurrentZoneIds);
  const currentLineIds = asArray(rawCurrentLineIds);
  const currentZoneNames = asArray(rawCurrentZoneNames);
  const currentLineNames = asArray(rawCurrentLineNames);

  const [step,            setStep]            = useState(STEP_ZONES);
  const [zones,           setZones]           = useState([]);
  const [zonesLoading,    setZonesLoading]    = useState(true);
const [selectedZoneIds, setSelectedZoneIds] = useState(() => sortIds(currentZoneIds));
  const [lines,           setLines]           = useState([]);
  const [linesLoading,    setLinesLoading]    = useState(false);
const [selectedLineIds, setSelectedLineIds] = useState(() => sortIds(currentLineIds));

   const pickStyle = (largePortrait, largeLandscape, mobilePortrait, mobileLandscape) =>
    isLargeScreen
      ? (isLandscape ? largeLandscape : largePortrait)
      : (isLandscape ? mobileLandscape : mobilePortrait);


  const hydratedRef = useRef(false);

  const zoneNameCacheRef = useRef(
    Object.fromEntries(
      currentZoneIds
        .map((id, i) => [id, currentZoneNames[i]])
        .filter(([, name]) => !!name),
    ),
  );
  const lineNameCacheRef = useRef(
    Object.fromEntries(
      currentLineIds
        .map((id, i) => [id, currentLineNames[i]])
        .filter(([, name]) => !!name),
    ),
  );

  const performLogout = async () => {
    try {
      await clearOnlyBraLine();
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      if (branch_screen) {
        navigation.reset({ index: 0, routes: [{ name: 'BranchSelectionScreen' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    }
  };

  const hasExistingSelection =
    isChangeZone || currentZoneIds.length > 0 || currentLineIds.length > 0;

  const goBackToZones = () => setStep(STEP_ZONES);
  const handleBackPress = useCallback(() => {
    if (step === STEP_LINES) {
      goBackToZones();
      return true;
    }

    if (hasExistingSelection) {
      navigation.navigate('Dashboard', { user });
    } else {
      performLogout();
    }
    return true;
  }, [step, hasExistingSelection, navigation, user]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => sub.remove();
    }, [handleBackPress])
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setZonesLoading(true);
      try {
        const data = await getZones();
        if (!cancelled) setZones(asArray(data));
      } catch (e) {
        console.warn('getZones:', e.message);
      } finally {
        if (!cancelled) setZonesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const savedZoneIds = asArray(await getZoneIds());
        const savedZoneNames = asArray(await getZoneNames());
        savedZoneIds.forEach((id, i) => {
          if (savedZoneNames[i]) zoneNameCacheRef.current[id] = savedZoneNames[i];
        });
        if (currentZoneIds.length === 0 && savedZoneIds.length) {
          setSelectedZoneIds(sortIds(savedZoneIds));

        }

        const savedLineIds = asArray(await getLineIds());
        const savedLineNames = asArray(await getLineNames());
        savedLineIds.forEach((id, i) => {
          if (savedLineNames[i]) lineNameCacheRef.current[id] = savedLineNames[i];
        });
        if (currentLineIds.length === 0 && savedLineIds.length) {
          setSelectedLineIds(sortIds(savedLineIds));

        }
      } catch (e) {
        console.warn('Failed to load saved zone/line selection:', e.message);
      } finally {
        hydratedRef.current = true;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    asArray(zones).forEach((z) => { zoneNameCacheRef.current[z.id] = z.name; });
  }, [zones]);

  useEffect(() => {
    asArray(lines).forEach((l) => { lineNameCacheRef.current[l.id] = l.name; });
  }, [lines]);

  useEffect(() => {
    if (!hydratedRef.current || zonesLoading) return;
    saveZoneIds(selectedZoneIds);
    saveZoneNames(selectedZoneNames);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedZoneIds, zones, zonesLoading]);

  useEffect(() => {
    if (!hydratedRef.current || linesLoading) return;

    const pairs = selectedLineIds
      .map((id) => ({
        id,
        name: lineNameById.get(id) ?? lineNameCacheRef.current[id] ?? String(id),
      }))
      .sort((a, b) => {
        const numA = Number(a.id);
        const numB = Number(b.id);
        if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB;
        return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
      });

    const sortedIds = pairs.map((p) => p.id);
    const sortedNames = pairs.map((p) => p.name);

    saveLineIds(sortedIds);
    saveLineNames(sortedNames);
    saveLines(pairs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLineIds, lines, linesLoading]);

  const loadLines = useCallback(async (zoneIds) => {
    setLinesLoading(true);
    setLines([]);
    try {
const data = sortById(asArray(await getLinesByZoneIds(zoneIds)));
      setLines(data);

      const validLineIds = new Set(data.map((l) => l.id));
setSelectedLineIds((prev) => sortIds(asArray(prev).filter((id) => validLineIds.has(id))));
    } catch (e) {
      console.warn('getLinesByZoneIds:', e.message);
    } finally {
      setLinesLoading(false);
    }
  }, []);

  const toggleZone = (id) =>
  setSelectedZoneIds((prev) => {
    const list = asArray(prev);
    return sortIds(list.includes(id) ? list.filter((z) => z !== id) : [...list, id]);
  });
const toggleLine = (id) =>
  setSelectedLineIds((prev) => {
    const list = asArray(prev);
    return sortIds(list.includes(id) ? list.filter((l) => l !== id) : [...list, id]);
  });

  const goToLines = () => {
    setStep(STEP_LINES);
    loadLines(selectedZoneIds);
  };
   const headertitleStyle = pickStyle(
    landscapeStyles.portitle,
    landscapeStyles.title,
    null,
     screenStyles.title,
  );

  const zoneNameById = new Map(asArray(zones).map((z) => [z.id, z.name]));
  const selectedZoneNames = asArray(selectedZoneIds).map(
    (id) => zoneNameById.get(id) ?? zoneNameCacheRef.current[id] ?? String(id),
  );

  const lineNameById = new Map(asArray(lines).map((l) => [l.id, l.name]));
  const selectedLineNames = asArray(selectedLineIds).map(
    (id) => lineNameById.get(id) ?? lineNameCacheRef.current[id] ?? String(id),
  );

  const zoneChipNames = asArray(selectedZoneIds)
    .map((id) => zoneNameById.get(id) ?? zoneNameCacheRef.current[id] ?? null)
    .filter(Boolean);

  const lineChipNames = asArray(selectedLineIds)
    .map((id) => lineNameById.get(id) ?? lineNameCacheRef.current[id] ?? null)
    .filter(Boolean);

  const handleDone = () => {
    const payload = {
      user,
      zoneIds: selectedZoneIds,
      lineIds: selectedLineIds,
      zoneNames: selectedZoneNames,
      lineNames: selectedLineNames,
    };

    if (isChangeZone) {
      navigation.navigate('Dashboard', payload);
    } else {
      navigation.replace('Dashboard', payload);
    }
  };

  const isZoneStep = step === STEP_ZONES;
  const chipNames  = isZoneStep ? zoneChipNames : lineChipNames;

  return (
    <SafeAreaView style={screenStyles.safe} edges={['top' ]}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />

      <View
        style={[
          screenStyles.header,
          isLandscape && landscapeStyles.header,
          isLandscape && { paddingTop: (landscapeStyles.header.paddingTop ?? 0) + insets.top },
          isLandscape && { paddingLeft: insets.left + 16, paddingRight: insets.right + 16 },
        ]}
      >
        <View style={localStyles.headerTopRow}>
          <StepBadge step={step} />
          <HeaderBackButton onPress={handleBackPress} />
        </View>

        <Text style={[screenStyles.title,headertitleStyle]}>
          {isZoneStep ? 'Select Zones' : 'Select Lines'}
        </Text>
        <Text style={[screenStyles.subtitle, isLandscape && landscapeStyles.subtitle ,isLargeScreen &&landscapeStyles.subtitleLand]}>
          {isZoneStep ? 'Choose one or more zones' : 'Choose lines within your selected zones'}
        </Text>

        {chipNames.length > 0 && (
          <View style={screenStyles.chipRow}>
            {chipNames.map((n) => <SelectedChip key={n} label={n} isLandscape/>)}
          </View>
        )}
      </View>

      <View
        style={[
          screenStyles.body,
          isLandscape && landscapeStyles.body,
          isLandscape && { paddingLeft: insets.left + 16, paddingRight: insets.right + 16 },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={screenStyles.listContent}
        >
          {isZoneStep ? (
            zonesLoading ? (
              <SkeletonList count={4} />
            ) : zones.length === 0 ? (
              <Text style={screenStyles.emptyText}>
                No Zones found
              </Text>
            ) : (
              zones.map((zone, i) => (
                <View key={zone.id} style={i > 0 ? { marginTop: 10 } : undefined}>
                  <SelectableRow
                    testID={`zone-row-${zone.id}`}
                    icon="mapicon"
                    title={zone.name}
                    subtitle={`${zone.lineCount} ${Number(zone.lineCount) > 1 ? 'Lines' : 'Line'}`}
                    selected={selectedZoneIds.includes(zone.id)}
                    onPress={() => toggleZone(zone.id)}
                    disabled={zone.lineCount === 0}
                  />
                </View>
              ))
            )
          ) : linesLoading ? (
            <SkeletonList count={5} />
          ) : lines.length === 0 ? (
            <Text style={screenStyles.emptyText}>
              No lines found for selected zones.
            </Text>
          ) : (
            lines.map((line, i) => (
              <View key={line.id} style={i > 0 ? { marginTop: 10 } : undefined}>
                <SelectableRow
                  testID={`line-row-${line.id}`}
                  icon="listicon"
                  title={line.name}
                  subtitle={`${line.zoneName} · ${line.device_count} ${Number(line.device_count) > 1 ? 'Machines' : 'Machine'}`}
                  selected={selectedLineIds.includes(line.id)}
                  onPress={() => toggleLine(line.id)}
                />
              </View>
            ))
          )}
          <View style={{ height: 16 }} />
        </ScrollView>
      </View>

      <View
        style={[
          screenStyles.footer,
          isLandscape && landscapeStyles.footer,
          isLandscape && { paddingBottom: (landscapeStyles.footer.paddingBottom ?? 0) + insets.bottom },
          isLandscape && { paddingLeft: insets.left + 16, paddingRight: insets.right + 16 },
        ]}
      >
        <ActionButton
          label={
            isZoneStep
              ? (selectedZoneIds.length === 0 ? 'Select a Zone to Continue' : 'Next')
              : (selectedLineIds.length === 0 ? 'Select a Line' : `Done `)
          }
          disabled={isZoneStep ? selectedZoneIds.length === 0 : selectedLineIds.length === 0}
          onPress={isZoneStep ? goToLines : handleDone}
        />
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  headerTopRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  backBtn: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical:  6,
    borderRadius:     16,
  },
  backText: {
    color:      '#fff',
    fontSize:   15,
    fontWeight: '600',
    marginLeft: 4,
  },
});
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  FlatList,
  Pressable,
  Modal,
  Animated,
  Platform,
} from 'react-native';

 import {
  ZONES,
  LINES_BY_ZONE,
  getWorkstationsByLineIds,
} from '../utils/zoneLineData';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppColors } from '../theme/theme';
 import BottomNav from '../components/BottomNav';
import ScannerScreen from '../components/ScannerScreen';
import DetailsModal from '../components/modals/DetailsModal';

 import S from './styles/TLSLineStyles';
 
 
const TEAL = AppColors.primary ?? '#0A9E96';
const ALL_KEY = '__all__';
 
function WsSkeleton() {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1,   duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View style={[S.skeletonRow, { opacity }]}>
      <View style={S.skeletonAccent} />
      <View style={S.skeletonBody}>
        <View style={S.skeletonTitle} />
        <View style={S.skeletonSub}   />
      </View>
    </Animated.View>
  );
}

 function WorkstationRow({ item }) {
  return (
    <View style={S.wsRow}>
      <View style={S.wsAccent} />
      <View style={S.wsBody}>
        <Text style={S.wsName} numberOfLines={1}>{item.name}</Text>
        <View style={S.wsMeta}>
          <Text style={S.wsLineName}>{item.lineName}</Text>
          <Text style={S.wsDot}>·</Text>
          <Text style={S.wsTls}>{item.tlsCode}</Text>
          <Text style={S.wsDot}>·</Text>
          <Text style={S.wsNum}>{item.wsNumber}</Text>
        </View>
      </View>
    </View>
  );
}

 function FilterChip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[S.filterChip, active && S.filterChipActive]}
      android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: true }}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
    >
     <Text style={[S.filterChipText, active && S.filterChipTextActive]}>
      {active ? `✓ ${label}` : label}
    </Text>
    </Pressable>
  );
}
 function FilterChipRow({ label, active, onPress }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <FilterChip label={label} active={active} onPress={onPress} />
    </View>
  );
}

 function ZoneDropdown({ visible, zones, selectedZoneId, onSelect, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <Pressable style={S.modalOverlay} onPress={onClose}>
        <Pressable onPress={() => {}} style={S.dropdown}>
          {/* "All Zones" option */}
          <Pressable
            style={S.dropdownItem}
            onPress={() => onSelect(ALL_KEY)}
            android_ripple={{ color: 'rgba(10,158,150,0.08)' }}
          >
            <Text style={[
              S.dropdownItemText,
              selectedZoneId === ALL_KEY && S.dropdownItemTextActive,
            ]}>
              All Zones
            </Text>
            <Text style={[S.dropdownItemSub]}>
              {zones.reduce((a, z) => a + (z.workstationCount ?? 0), 0)} workstations
            </Text>
            {selectedZoneId === ALL_KEY && (
              <Text style={S.dropdownCheck}>✓</Text>
            )}
          </Pressable>

          {/* Individual zone options */}
          {zones.map((zone) => (
            <Pressable
              key={zone.id}
              style={[S.dropdownItem, S.dropdownItemBorder]}
              onPress={() => onSelect(zone.id)}
              android_ripple={{ color: 'rgba(10,158,150,0.08)' }}
            >
              <Text style={[
                S.dropdownItemText,
                selectedZoneId === zone.id && S.dropdownItemTextActive,
              ]}>
                {zone.name}
              </Text>
              <Text style={S.dropdownItemSub}>
                {zone.workstationCount} workstations
              </Text>
              {selectedZoneId === zone.id && (
                <Text style={S.dropdownCheck}>✓</Text>
              )}
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

 
export default function TLSLineScreen({ route, navigation }) {
  const { user, zoneIds = [], lineIds = [] } = route.params ?? {};

   const selectedZones = ZONES.filter((z) => zoneIds.includes(z.id));

   const selectedLines = zoneIds.flatMap(
    (zid) => (LINES_BY_ZONE[zid] ?? []).filter((l) => lineIds.includes(l.id)),
  );

   const [dropdownOpen,    setDropdownOpen]    = useState(false);
  const [activeZoneId,    setActiveZoneId]    = useState(ALL_KEY); // dropdown selection
  const [activeLineId,    setActiveLineId]    = useState(ALL_KEY); // chip selection
  const [workstations,    setWorkstations]    = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [activeTab, setActiveTab] = useState('audit');
 
  const [scannerVisible, setScannerVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [scannedDetails, setScannedDetails] = useState(null);

   useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getWorkstationsByLineIds(lineIds);
        if (!cancelled) setWorkstations(data);
      } catch (e) {
        console.warn('getWorkstationsByLineIds:', e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

   const handleZoneSelect = useCallback((zoneId) => {
    setActiveZoneId(zoneId);
    setActiveLineId(ALL_KEY);
    setDropdownOpen(false);
  }, []);

  const handleScanSuccess = useCallback((data) => {
    setScannerVisible(false);
    setScannedDetails(data);
    setDetailsVisible(true);
     setActiveTab('audit');
  }, []);

  const closeScanner = useCallback(() => {
    setScannerVisible(false);
    setActiveTab('audit');
  }, []);

  const closeDetails = useCallback(() => {
    setDetailsVisible(false);
  }, []);

  const proceedToAudit = useCallback(() => {
    setDetailsVisible(false);
    navigation.navigate('ProcessAuditScreen', { details: scannedDetails });
  }, [navigation, scannedDetails]);

   const visibleLines =
    activeZoneId === ALL_KEY
      ? selectedLines
      : selectedLines.filter((l) => {
          // find which zone this line belongs to
          const ownerZone = zoneIds.find((zid) =>
            (LINES_BY_ZONE[zid] ?? []).some((l2) => l2.id === l.id),
          );
          return ownerZone === activeZoneId;
        });

   const visibleLineIds = visibleLines.map((l) => l.id);

  const filteredWs =
    activeLineId === ALL_KEY
      ? workstations.filter((ws) => visibleLineIds.includes(ws.lineId))
      : workstations.filter((ws) => ws.lineId === activeLineId);

   const dropdownLabel =
    activeZoneId === ALL_KEY
      ? 'All Zones'
      : (selectedZones.find((z) => z.id === activeZoneId)?.name ?? 'All Zones');

   return (
    <SafeAreaView style={S.safe}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />

       <View style={S.header}>
         <View style={S.headerRow}>
          <Pressable
            style={S.zoneDropdownBtn}
            onPress={() => setDropdownOpen(true)}
            android_ripple={{ color: 'rgba(255,255,255,0.15)', borderless: true }}
            accessibilityRole="button"
            accessibilityLabel={`Zone filter: ${dropdownLabel}`}
          >
            <View style={S.zoneBG}>
                <Ionicons
                  name="location-outline"
                  size={15}
                  color={AppColors.textInverse}
                />
            </View>
             <Text style={S.zoneDropdownText}>{dropdownLabel}</Text>
            <Text style={S.zoneChevron}><Ionicons  name='chevron-down-outline' size={10}  color={AppColors.textInverse} /></Text>
          </Pressable>

          <Pressable
            style={S.bellBtn}
            accessibilityLabel="Notifications"
          >
            <Text style={S.bellIcon}><Ionicons name='notifications-outline' size={20}/></Text>
          </Pressable>
        </View>

         <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={S.lineFilterScroll}
          contentContainerStyle={S.lineFilterContent}
        >
           <FilterChip
            label="All"
            active={activeLineId === ALL_KEY}
            onPress={() => setActiveLineId(ALL_KEY)}
          />

           {visibleLines.map((line) => (
            <FilterChip
              key={line.id}
              label={line.name}
              active={activeLineId === line.id}
              onPress={() => setActiveLineId(line.id)}
            />
          ))}
        </ScrollView>
      </View>

       <View style={S.body}>
         <View style={S.totalBar}>
          <Text style={S.totalText}>
            Total Workstations:{' '}
            <Text style={S.totalCount}>{loading ? '—' : filteredWs.length}</Text>
          </Text>
        </View>

         {loading ? (
          <ScrollView>
            {Array.from({ length: 8 }).map((_, i) => (
              <WsSkeleton key={i} />
            ))}
          </ScrollView>
        ) : filteredWs.length === 0 ? (
          <View style={S.emptyContainer}>
            <Text style={S.emptyIcon}>📭</Text>
            <Text style={S.emptyText}>
              No workstations found for the selected filters.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredWs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <WorkstationRow item={item} />}
            contentContainerStyle={S.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={12}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        )}
      </View>

       <BottomNav
        activeTab={activeTab}
        onTabPress={(key) => {
          setActiveTab(key);
          if (key === 'scanner') {
            setScannerVisible(true);
            return;
          }
         }}
      />

       <ZoneDropdown
        visible={dropdownOpen}
        zones={selectedZones}
        selectedZoneId={activeZoneId}
        onSelect={handleZoneSelect}
        onClose={() => setDropdownOpen(false)}
      />

       <Modal
        visible={scannerVisible}
        animationType="slide"
        onRequestClose={closeScanner}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <ScannerScreen onScanSuccess={handleScanSuccess} onClose={closeScanner} />
      </Modal>

       <DetailsModal
        visible={detailsVisible}
        details={scannedDetails}
        onClose={closeDetails}
        onProceed={proceedToAudit}
      />
    </SafeAreaView>
  );
}
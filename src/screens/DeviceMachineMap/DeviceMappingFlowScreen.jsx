import React from 'react';
import { View, Text, Pressable, StatusBar, SafeAreaView, Alert, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppColors } from '../../theme/theme';
import GlobalStyles from '../styles';
import createStyles from '../styles/ManageOperationsStyles';
import { useResponsive } from '../../utils/responsive';
import { useOrientation } from '../../hooks/useOrientation';
import createStyless from '../styles/TLSAuditStyles';
import {ActionButton} from '../../components/ActionButton';

const { container, text, button } = GlobalStyles;

export default function DeviceMappingFlowScreen({
  onCancel,
  device,
  machine,
  onScanDevice,
  onScanMachine,
  onConfirm,
}) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs,isLargeScreen } = useResponsive();
      const { isLandscape } = useOrientation();

  const styles = createStyles(ms, mvs, fs);
  const styless = createStyles(ms, mvs, fs, isLargeScreen);

 
  
  const deviceDone = !!device?.id;
  const machineDone = !!machine?.machineNo;
  const bothScanned = deviceDone && machineDone;
  console.log("machine details "+JSON.stringify(machine));
  let infoText;
  if (bothScanned) {
    infoText =
      'This will create a permanent mapping between the Qone device and machine. Any existing mapping for this device will be replaced.';
  } else if (deviceDone && !machineDone) {
    infoText = 'Qone device scanned. Now scan the machine to complete the mapping.';
  } else if (machineDone && !deviceDone) {
    infoText = 'Machine scanned. Now scan the Qone device to complete the mapping.';
  } else {
    infoText = 'Scan the Qone device and the machine to build the mapping below.';
  }
const pickStyle = (largePortrait, largeLandscape, mobilePortrait, mobileLandscape) =>   isLargeScreen ? (isLandscape ? largeLandscape : largePortrait): 
(isLandscape ? mobileLandscape : mobilePortrait);
  const handleConfirmPress = () => {
    if (!bothScanned) return;  
    onConfirm?.();
  };
 
  const handleRescanDevice = () => {
    Alert.alert(
      'Rescan Qone Device?',
      'This will discard the currently scanned Qone device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Rescan', style: 'destructive', onPress: () => onScanDevice?.() },
      ],
    );
  };

  const handleRescanMachine = () => {
    Alert.alert(
      'Rescan Machine?',
      'This will discard the currently scanned machine.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Rescan', style: 'destructive', onPress: () => onScanMachine?.() },
      ],
    );
  };

  return (
    <SafeAreaView style={container.safe_primary}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.primary} />

      <View style={[styles.header, { marginTop: 25 }]}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerTopRow}>
            <Pressable
              onPress={() => onCancel?.()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={({ pressed }) => [styles.backPill, pressed && { opacity: 0.85 }]}
            >
              <Ionicons name="chevron-back" size={ms(15)} color={AppColors.onPrimary} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>Device & Machine Mapping</Text>
        </SafeAreaView>
      </View>

      <View style={[container.safe, { flex: 1 }]}>
        <View style={[container.screenBody, { flex: 1 }]}>
          <MappingCard
            device={device}
            machine={machine}
            onScanDevice={onScanDevice}
            onScanMachine={onScanMachine}
            onRescanDevice={handleRescanDevice}
            onRescanMachine={handleRescanMachine}
            isLandscape
            isLargeScreen
          />

          <View style={container.warningBox}>
            <Ionicons
              name={bothScanned ? 'alert-circle-outline' : 'information-circle-outline'}
              size={18}
              color={AppColors.warningIcon}
              style={{ marginTop: 1 }}
            />
            <Text style={text.warningText}>{infoText}</Text>
          </View>
        </View>
      </View>

    <View style={styless.footer}>
              <ActionButton
                label="Confirm Mapping"
                disabled={!bothScanned}
                 onPress={handleConfirmPress}
              />
      </View>

     
    </SafeAreaView>
  );
}

function MappingCard({
  device,
  machine,
  onScanDevice,
  onScanMachine,
  onRescanDevice,
  onRescanMachine,
  isLandscape,
  isLargeScreen
}) {
  const deviceDone = !!device?.id;
  const machineDone = !!machine?.machineNo;
   const machineTypeName =
    machine?.raw?.machine_type_name ?? machine?.machine_type_name ?? machine?.machineType ?? '—';

  const pickStyle = (largePortrait, largeLandscape, mobilePortrait, mobileLandscape) =>   isLargeScreen ? (isLandscape ? largeLandscape : largePortrait): 
(isLandscape ? mobileLandscape : mobilePortrait);
 const textStyle = pickStyle(text.cardSectionTitleLarge,text.cardSectionTitleLarge,null,text.cardSectionTitle);
 const dtextStyle = pickStyle(text.detailLabelLarge,text.detailLabelLarge,null,text.detailLabel);
 const vtextStyle = pickStyle(text.detailValueLarge,text.detailValueLarge,null,text.detailValue);






  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={container.card_pro_top}>
          <View style={container.cardHeaderRowGG}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={container.iconChipSm}>
                <Ionicons name="phone-portrait-outline" size={20} color={AppColors.primary} />
              </View>
              <Text style={[text.cardSectionTitle,textStyle]}>Qone Details</Text>
            </View>
          </View>

          {deviceDone ? (
            <>
                {console.log('Device:', JSON.stringify(device))}

            <View style={{ flexDirection: 'row', marginTop: 12 }}>
                <View style={container.detailCell}>
                  <Text style={[text.detailLabel,dtextStyle]}>Qone ID</Text>
                  <Text style={[text.detailValue,vtextStyle]}>{device.raw.tls_id}</Text>
                </View>
                <View style={container.detailCell}>
                  <Text style={[text.detailLabel,dtextStyle]}>Qone CODE</Text>
                  <Text style={[text.detailValue,vtextStyle]}>{device.raw.code}</Text>
                </View>
              </View>
              <ScanButton label="Rescan Device" onPress={onRescanDevice} />
            </>
           
          ) : (
            <ScanButton label="Scan Device" onPress={onScanDevice} />
          )}
        </View>

        <View style={container.connectorRow}>
          <View
            style={[
              container.connectorLine,
              { backgroundColor: deviceDone ? AppColors.primary : '#E5E7EB' },
            ]}
          />
          <View style={container.connectorBadge}>
            <Ionicons name="link" size={16} color={AppColors.onPrimary} />
          </View>
          <View
            style={[
              container.connectorLine,
              { backgroundColor: machineDone ? '#A78BFA' : '#E5E7EB' },
            ]}
          />
        </View>

        <View style={container.card_pro_bottom}>
          <View style={container.cardHeaderRowGG}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={container.iconChipSm}>
                <Ionicons name="hardware-chip-outline" size={20} color={AppColors.primary} />
              </View>
              <Text style={[text.cardSectionTitle,textStyle]}>Machine Details</Text>
            </View>
          </View>

          {machineDone ? (
            <>
              <View style={{ flexDirection: 'row', marginTop: 12 }}>
                <View style={container.detailCell}>
                  <Text style={[text.detailLabel,dtextStyle]}>MACHINE NO.</Text>
                  <Text style={[text.detailValue,vtextStyle]}>{machine.machineNo}</Text>
                </View>
                <View style={container.detailCell}>
                  <Text style={[text.detailLabel,dtextStyle]}>MACHINE TYPE</Text>
                  <Text style={[text.detailValue,vtextStyle]}>{machineTypeName}</Text>
                </View>
              </View>
              <ScanButton label="Rescan Machine" onPress={onRescanMachine} />
            </>
          ) : (
            <ScanButton label="Scan Machine" onPress={onScanMachine} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function ScanButton({ label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={({ pressed }) => [button.scanBtn, pressed && { opacity: 0.85 }]}
    >
      <Ionicons name="scan-outline" size={16} color={AppColors.onPrimary} />
      <Text style={text.scanBtnText}>{label}</Text>
    </Pressable>
  );
}
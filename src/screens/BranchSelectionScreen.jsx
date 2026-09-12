import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Pressable,
  Animated,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useResponsive } from '../utils/responsive';

import { getBranches } from '../api/services/dropdownApi';
import { SkeletonList } from '../components/SkeletonListItem';
import { AppColors } from '../theme/theme';
import screenStyles from './styles/ZoneLineCheckInStyles';
import rowStyles from '../components/styles/SelectableRowStyles';
import btnStyles from '../components/styles/ActionButtonStyles';
import cbStyles from '../components/styles/SelectionCheckboxStyles';
import { chipStyles } from '../components/styles/ChipPillStyles';
import Icon from '../components/Icon';
import {
  saveBranchId,
  saveBranchName,
  saveTeamId,
  saveTeamName,
  updateStoredUserBranch,
} from '../api/storage/authStorage';
import createStyles from './styles/TLSAuditStyles';
import {ActionButton} from '../components/ActionButton';

const TEAL = AppColors.primary ?? '#0A9E96';

function SelectionRadio({ checked, size = 24 }) {
  const scale = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: checked ? 1 : 0,
      useNativeDriver: true,
      speed: 24,
      bounciness: 5,
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

function SelectableRow({ icon = 'location-outline', title, subtitle, selected, onPress, testID }) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      android_ripple={{ color: 'rgba(10,158,150,0.08)' }}
      style={({ pressed }) => [
        rowStyles.row,
        selected && rowStyles.rowSelected,
        pressed && rowStyles.rowPressed,
      ]}
      accessibilityRole="radio"
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
      <SelectionRadio checked={selected} size={24} />
    </Pressable>
  );
}

 

function SelectedChip({ label }) {
  return (
    <View style={chipStyles.chip}>
      <Ionicons name="checkmark" size={11} color="#fff" style={{ marginRight: 3 }} />
      <Text style={chipStyles.text}>{label}</Text>
    </View>
  );
}

export default function BranchSelectionScreen({ route, navigation }) {
  const {
    user,
    isChangeBranch = false,
    currentBranchId = null,
  } = route.params ?? {};

  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs, isLargeScreen } = useResponsive();
  const styles = createStyles(ms, mvs, fs, isLargeScreen);

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState(currentBranchId);

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
    }
    return true;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => sub.remove();
    }, [handleBackPress])
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getBranches();
        if (!cancelled) setBranches(data);
      } catch (e) {
        console.warn('getBranches:', e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const toggleBranch = (id) => setSelectedBranchId(id);

  const selectedBranch = branches.find((b) => b.id === selectedBranchId);
  const selectedBranchName = selectedBranch?.name
    ?? (selectedBranchId != null ? String(selectedBranchId) : null);

  const selectedTeamId = selectedBranch?.team_id ?? null;
  const selectedTeamName = selectedBranch?.team_name ?? null;

  const handleContinue = async () => {
    if (selectedBranchId == null) return;

    try {
      await saveBranchId(selectedBranchId);
      await saveBranchName(selectedBranchName);
      if (selectedTeamId != null) {
        await saveTeamId(selectedTeamId);
        await saveTeamName(selectedTeamName);
      }
      await updateStoredUserBranch(selectedBranchId, selectedBranchName, selectedTeamId, selectedTeamName);
    } catch (e) {
      console.warn('Failed to persist branch selection:', e.message);
    }

    const updatedUser = {
      ...user,
      branch_id: selectedBranchId,
      branch_name: selectedBranchName,
      ...(selectedTeamId != null ? { team_id: selectedTeamId, team_name: selectedTeamName } : {}),
    };

    if (isChangeBranch) {
      navigation.navigate('CheckIn', { user: updatedUser ,branch_screen:"selected"});
    } else {
      navigation.replace('CheckIn', { user: updatedUser ,branch_screen:"selected"});
    }
  };

  return (
    <SafeAreaView style={screenStyles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />

      <View style={screenStyles.header}>
            <Pressable
        onPress={handleBackPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={({ pressed }) => [
          styles.backPill,
          { alignSelf: 'flex-start' },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Ionicons name="chevron-back" size={ms(15)} color={AppColors.onPrimary} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

        <Text style={screenStyles.title}>Select Branch</Text>
        <Text style={screenStyles.subtitle}>Choose your branch to continue</Text>

        {!!selectedBranchName && (
          <View style={screenStyles.chipRow}>
            <SelectedChip label={selectedBranchName} />
          </View>
        )}
      </View>

      <View style={screenStyles.body}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={screenStyles.listContent}
        >
          {loading ? (
            <SkeletonList count={4} />
          ) : branches.length === 0 ? (
            <Text style={screenStyles.emptyText}>No branches found.</Text>
          ) : (
            branches.map((branch, i) => (
              <View key={branch.id} style={i > 0 ? { marginTop: 10 } : undefined}>
                <SelectableRow
                  testID={`branch-row-${branch.id}`}
                  icon="mapicon"
                  title={branch.name}
                  subtitle={branch.teams?.[0]?.name}
                  selected={selectedBranchId === branch.id}
                  onPress={() => toggleBranch(branch.id)}
                />
              </View>
            ))
          )}
          <View style={{ height: 16 }} />
        </ScrollView>
      </View>

      <View style={screenStyles.footer}>
        <ActionButton
          label={selectedBranchId == null ? 'Select a Branch to Continue' : 'Next'}
          disabled={selectedBranchId == null}
          onPress={handleContinue}
        />
      </View>
    </SafeAreaView>
  );
}
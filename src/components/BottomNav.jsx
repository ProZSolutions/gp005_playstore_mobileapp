import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // swap for your icon set
import styles from './styles/BottomNavStyles';

const LEFT_TABS = [
  { key: 'audit', label: 'Audit', icon: 'clipboard' },
  { key: 'rework', label: 'Rework', icon: 'corner-up-left' },
];
const RIGHT_TABS = [
  { key: 'rejection', label: 'Rejection', icon: 'x-circle' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
];
const SCANNER_KEY = 'scanner';

export default function BottomNav({ activeTab, onTabPress }) {
  const renderTab = ({ key, label, icon }) => { 
    const isActive = activeTab === key;
    return (
      <Pressable
        key={key}
        style={styles.tabItem}
        onPress={() => onTabPress(key)}
        android_ripple={{ color: 'rgba(17,169,160,0.10)', borderless: true }}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
        accessibilityLabel={label}
      >
        <Icon
          name={icon}
          size={22}
          color={isActive ? styles.colors.active : styles.colors.inactive}
        />
        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {LEFT_TABS.map(renderTab)}

      {/* Spacer so the two side groups don't collide under the floating FAB */}
      <View style={styles.fabSpacer} />

      {RIGHT_TABS.map(renderTab)}

       
      <View style={styles.fabWrapper} pointerEvents="box-none">
        <View style={styles.fabHalo}>
          <Pressable
            onPress={() => onTabPress(SCANNER_KEY)}
            android_ripple={{ color: 'rgba(255,255,255,0.25)', borderless: true }}
            accessibilityRole="button"
            accessibilityLabel="Scanner"
          >
            <View style={styles.fab}>
              <Icon name="maximize" size={24} color="#fff" />
            </View>
          </Pressable>
        </View>
        <Text style={styles.fabLabel}>Scan</Text>
      </View>
    </View>
  );
}   
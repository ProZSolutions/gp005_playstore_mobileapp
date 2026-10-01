// src/screens/DemoScreen.jsx
import React, { useState } from 'react';
import {
  ScrollView, StyleSheet, View, Text,
  TouchableOpacity, Switch, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { AppColors } from '../theme/theme';

import {
  AppButton,
  AppInput, 
  AppCheckbox,
  AppDatePicker,
  AppListItem,
  AppCard,
  AppChip,
  AppChipGroup,
  AppRadioGroup,
  AppSelect,
  AppModal,
  AppSnackbar,
  AppDivider,
  AppAvatar,
  AppBadge,
} from '../components';

// ── Section heading ────────────────────────────────────────────
function SectionHeader({ label }) {
  return (
    <View style={sectionStyles.wrap}>
      <View style={sectionStyles.bar} />
      <Text style={sectionStyles.text}>{label}</Text>
    </View>
  );
}
const sectionStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, marginTop: 4 },
  bar:  { width: 3, height: 18, borderRadius: 2, backgroundColor: AppColors.primary, marginRight: 10 },
  text: { fontSize: 15, fontWeight: '700', color: AppColors.primary, letterSpacing: 0.2 },
});

// ── Main Screen ────────────────────────────────────────────────
export function AllComponents({ route }) {
  const { toggleTheme, isDark } = route.params;
  const theme = useTheme();

  // Inputs
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [bio,       setBio]       = useState('');
  const [nameError, setNameError] = useState('');

  // Checkboxes
  const [checkA, setCheckA] = useState(false);
  const [checkB, setCheckB] = useState(true);

  // Date
  const [date, setDate] = useState(undefined);
  const [time, setTime] = useState(undefined);

  // Chips
  const [chips, setChips] = useState([]);

  // Radio
  const [radio, setRadio] = useState('morning');

  // Select
  const [fruit, setFruit] = useState(undefined);
  const [line,  setLine]  = useState(undefined);

  // Modal / Snack
  const [modalOpen,  setModalOpen]  = useState(false);
  const [snackOpen,  setSnackOpen]  = useState(false);
  const [snackStatus, setSnackStatus] = useState('default');

  // ── Data ──────────────────────────────────────────────────────
  const chipOptions = [
    { id: 'react',  label: 'React Native' },
    { id: 'ts',     label: 'TypeScript' },
    { id: 'paper',  label: 'Paper UI' },
    { id: 'nav',    label: 'Navigation' },
  ];

  const radioOptions = [
    { label: 'Morning', value: 'morning', description: '06:00 – 14:00' },
    { label: 'Evening', value: 'evening', description: '14:00 – 22:00' },
    { label: 'Night',   value: 'night',   description: '22:00 – 06:00', disabled: true },
  ];

  const fruitOptions = [
    { label: 'Apple',  value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Durian', value: 'durian' },
  ];

  const lineOptions = [
    { label: 'Line 1', value: 'l1', description: '17254 · M&S Polo',         rightBadge: 'Green', badgeColor: AppColors.lineGreen },
    { label: 'Line 2', value: 'l2', description: '18235 · Nike T-Shirt',     rightBadge: 'Blue',  badgeColor: AppColors.lineBlue },
    { label: 'Line 3', value: 'l3', description: '19257 · Adidas Hoodie',    rightBadge: 'Red',   badgeColor: AppColors.lineRed },
    { label: 'Line 4', value: 'l4', description: '20268 · Puma Track Pants', rightBadge: 'Black', badgeColor: AppColors.lineBlack },
  ];

  const listItems = [
    { id: 1, title: 'Inbox',   description: '5 items',  rightBadge: '5',  badgeColor: AppColors.primary },
    { id: 2, title: 'Starred', description: '2 items',  rightBadge: '2',  badgeColor: AppColors.warning },
    { id: 3, title: 'Sent',    description: '0 items' },
    { id: 4, title: 'Trash',   description: '12 items', rightBadge: '12', badgeColor: AppColors.error },
  ];

  // ── Handlers ─────────────────────────────────────────────────
  const toggleChip = id =>
    setChips(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const handleValidate = () => {
    if (!name.trim()) {
      setNameError('Full name is required');
    } else {
      setNameError('');
      setSnackStatus('success');
      setSnackOpen(true);
    }
  };

  const showSnack = (status = 'default') => {
    setSnackStatus(status);
    setSnackOpen(true);
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>

      {/* ── Top bar ──────────────────────────────────────── */}
      <View style={[styles.topBar, { backgroundColor: AppColors.primary }]}>
        <View>
          <Text style={styles.topBarTitle}>Component Library</Text>
          <Text style={styles.topBarSub}>react-native-paper · teal design</Text>
        </View>
        <View style={styles.themeToggle}>
          <Text style={styles.toggleLabel}>{isDark ? '🌙' : '☀️'}</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ true: AppColors.primaryDark, false: 'rgba(255,255,255,0.4)' }}
            thumbColor={AppColors.white}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ══ AVATARS ══════════════════════════════════════ */}
        <SectionHeader label="Avatars" />
        <View style={styles.row}>
          <AppAvatar type="text"  label="RK"  size={52} />
          <AppAvatar type="text"  label="JD"  size={52} color={AppColors.secondary} />
          <AppAvatar type="icon"
            icon={<Text style={{ fontSize: 22 }}>🔔</Text>}
            size={52}
          />
          <AppAvatar type="image" source="https://i.pravatar.cc/100" size={52} />
          <View style={{ position: 'relative' }}>
            <AppAvatar type="icon"
              icon={<Text style={{ fontSize: 22 }}>✉️</Text>}
              size={52}
            />
            <View style={styles.badgeWrap}>
              <AppBadge count={7} size={20} />
            </View>
          </View>
        </View>

        <AppDivider label="BADGES" />

        {/* ══ BADGES ═══════════════════════════════════════ */}
        <SectionHeader label="Badges" />
        {/* Status labels from screenshot */}
        <View style={styles.row}>
          <AppBadge label="Green"  color={AppColors.lineGreen} />
          <AppBadge label="Blue"   color={AppColors.lineBlue} />
          <AppBadge label="Red"    color={AppColors.lineRed} />
          <AppBadge label="Black"  color={AppColors.lineBlack} />
        </View>
        <View style={[styles.row, { marginTop: 8 }]}>
          <AppBadge label="✓ Morning" color={AppColors.primary} variant="ghost" />
          <AppBadge label="QC Inspector" color={AppColors.secondary} variant="outline" />
          <AppBadge label="Success" color={AppColors.success} variant="filled" />
        </View>
        <View style={[styles.row, { marginTop: 8 }]}>
          <AppBadge label="● Active"  color={AppColors.success} dot />
          <AppBadge label="● Pending" color={AppColors.warning} dot />
          <AppBadge label="● Offline" color={AppColors.error}   dot />
        </View>

        <AppDivider label="INPUTS" />

        {/* ══ TEXT INPUTS ══════════════════════════════════ */}
        <SectionHeader label="Text Inputs" />

        <AppInput
          label="Employee ID"
          value={name}
          onChangeText={t => { setName(t); setNameError(''); }}
          placeholder="Enter your Employee ID"
          error={nameError}
        />
        <AppInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@company.com"
          keyboardType="email-address"
          autoCapitalize="none"
          hint="We'll never share your email"
        />
        <AppInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />
        <AppInput
          label="Notes (multiline)"
          value={bio}
          onChangeText={setBio}
          placeholder="Write something…"
          multiline
          numberOfLines={3}
          maxLength={200}
          showCharCount
        />
        <AppInput
          label="Disabled Input"
          value="read only value"
          onChangeText={() => {}}
          disabled
        />

        <AppButton label="Validate Name" onPress={handleValidate} style={styles.mb12} />

        <AppDivider label="BUTTONS" />

        {/* ══ BUTTONS ══════════════════════════════════════ */}
        <SectionHeader label="Buttons" />
        <AppButton label="Login" onPress={() => showSnack('default')} size="lg" fullWidth style={styles.mb12} />
        <View style={styles.row}>
          <AppButton label="Contained" variant="contained" onPress={() => showSnack('default')} style={styles.flex} />
          <AppButton label="Outlined"  variant="outlined"  onPress={() => {}}                   style={[styles.flex, styles.mh8]} />
          <AppButton label="Text"      variant="text"      onPress={() => {}}                   style={styles.flex} />
        </View>
        <View style={[styles.row, { marginTop: 8 }]}>
          <AppButton label="Success" status="success" onPress={() => showSnack('success')} style={styles.flex} size="sm" />
          <AppButton label="Error"   status="error"   onPress={() => showSnack('error')}   style={[styles.flex, styles.mh8]} size="sm" />
          <AppButton label="Warning" status="warning" onPress={() => showSnack('warning')} style={styles.flex} size="sm" />
        </View>
        <View style={[styles.row, { marginTop: 8 }]}>
          <AppButton label="Tonal"    variant="tonal"    onPress={() => {}} style={styles.flex} />
          <AppButton label="Loading"  loading            onPress={() => {}} style={[styles.flex, styles.mh8]} />
          <AppButton label="Disabled" disabled           onPress={() => {}} style={styles.flex} />
        </View>
        <AppButton label="Open Modal" fullWidth onPress={() => setModalOpen(true)} style={{ marginTop: 8 }} />

        <AppDivider label="CHECKBOXES" />

        {/* ══ CHECKBOXES ═══════════════════════════════════ */}
        <SectionHeader label="Checkboxes" />
        <AppCheckbox label="Accept Terms & Conditions" checked={checkA} onToggle={() => setCheckA(v => !v)} />
        <AppCheckbox label="Subscribe to newsletter"  checked={checkB} onToggle={() => setCheckB(v => !v)} />
        <AppCheckbox label="Indeterminate state"      checked={false}  onToggle={() => {}} indeterminate />
        <AppCheckbox label="Disabled unchecked"       checked={false}  onToggle={() => {}} disabled />
        <AppCheckbox label="Disabled checked"         checked          onToggle={() => {}} disabled />
        <AppCheckbox label="With error"               checked={false}  onToggle={() => {}} error="You must agree to continue" />

        <AppDivider label="DATE / TIME" />

        {/* ══ DATE PICKERS ════════════════════════════════ */}
        <SectionHeader label="Date / Time Pickers" />
        <AppDatePicker label="Date of Birth"  value={date} onChange={setDate} mode="date" placeholder="Select date" />
        <AppDatePicker label="Check-In Time"  value={time} onChange={setTime} mode="time" placeholder="Select time" />
        <AppDatePicker label="Meeting (error)" value={undefined} onChange={() => {}} error="Date is required" />

        <AppDivider label="CHIPS" />

        {/* ══ CHIPS ════════════════════════════════════════ */}
        <SectionHeader label="Chip Group (multi-select)" />
        <AppChipGroup chips={chipOptions} selected={chips} onSelect={toggleChip} />
        {/* Wrap (non-scrollable) */}
        <AppChipGroup chips={chipOptions} selected={chips} onSelect={toggleChip} scrollable={false} />

        <AppDivider label="RADIO" />

        {/* ══ RADIO ════════════════════════════════════════ */}
        <SectionHeader label="Radio Group" />
        {/* Default inline */}
        <AppRadioGroup
          label="Inline (row)"
          options={[
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' },
          ]}
          value={radio === 'a' || radio === 'b' ? radio : 'a'}
          onChange={setRadio}
          direction="row"
        />
        {/* Card variant */}
        <AppRadioGroup
          label="Shift (card)"
          options={radioOptions}
          value={radio}
          onChange={setRadio}
          variant="card"
        />

        <AppDivider label="SELECT" />

        {/* ══ SELECT ═══════════════════════════════════════ */}
        <SectionHeader label="Dropdown Select" />
        <AppSelect
          label="Favourite Fruit"
          options={fruitOptions}
          value={fruit}
          onChange={setFruit}
          placeholder="Choose a fruit…"
          hint="Opens a bottom sheet"
        />
        <AppSelect
          label="Production Line"
          options={lineOptions}
          value={line}
          onChange={setLine}
          placeholder="Select a line…"
        />
        <AppSelect
          label="With Error"
          options={fruitOptions}
          value={undefined}
          onChange={() => {}}
          error="Please select an option"
        />

        <AppDivider label="CARDS" />

        {/* ══ CARDS ════════════════════════════════════════ */}
        <SectionHeader label="Cards" />
        <AppCard
          title="React Native Paper"
          subtitle="Material Design 3 for RN"
          content="Build beautiful, accessible Android and iOS apps with a consistent set of reusable components."
          onPress={() => showSnack('default')}
          actions={
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <AppButton label="Learn"       variant="text"      size="sm" onPress={() => {}} />
              <AppButton label="Get Started" variant="contained" size="sm" onPress={() => setModalOpen(true)} />
            </View>
          }
        />
        <AppCard title="Selected card" subtitle="Teal border highlight" selected />
        <AppCard title="Pressable card" subtitle="Tap for ripple" onPress={() => showSnack('default')} />

        <AppDivider label="LIST ITEMS" />

        {/* ══ LIST ITEMS ═══════════════════════════════════ */}
        <SectionHeader label="List Items" />
        {/* Screenshot-style production line rows */}
        {lineOptions.map((item, i) => (
          <AppListItem
            key={item.value}
            index={i + 1}
            title={item.label}
            description={item.description}
            rightLabel={item.rightBadge}
            rightLabelColor={item.badgeColor}
            onPress={() => showSnack('default')}
          />
        ))}

        <AppDivider />

        {/* Generic icon rows */}
        {listItems.map(item => (
          <AppListItem
            key={item.id}
            title={item.title}
            description={item.description}
            rightLabel={item.rightBadge}
            rightLabelColor={item.badgeColor}
            onPress={() => showSnack('default')}
          />
        ))}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ── MODAL ────────────────────────────────────────── */}
      <AppModal
        visible={modalOpen}
        onDismiss={() => setModalOpen(false)}
        title="Reusable Modal"
      >
        <Text style={modalStyles.body}>
          Drop any content inside — forms, confirmations, custom layouts.
        </Text>
        <AppButton label="Close" onPress={() => setModalOpen(false)} />
      </AppModal>

      {/* ── SNACKBAR ─────────────────────────────────────── */}
      <AppSnackbar
        visible={snackOpen}
        message={
          snackStatus === 'success' ? 'Action completed successfully!' :
          snackStatus === 'error'   ? 'Something went wrong.' :
          snackStatus === 'warning' ? 'Please review your input.' :
          'Action triggered!'
        }
        onDismiss={() => setSnackOpen(false)}
        action={{ label: 'Undo', onPress: () => {} }}
        status={snackStatus}
      />
    </SafeAreaView>
  );
}

const modalStyles = StyleSheet.create({
  body: { fontSize: 15, color: AppColors.textSecondary, lineHeight: 22, marginBottom: 20 },
});

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical:   14,
  },
  topBarTitle: { fontSize: 17, fontWeight: '700', color: AppColors.white },
  topBarSub:   { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  themeToggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleLabel: { fontSize: 18 },

  // Content
  scroll: { paddingHorizontal: 18, paddingTop: 18 },
  row:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  flex:   { flex: 1 },
  mh8:    { marginHorizontal: 6 },
  mb12:   { marginBottom: 12 },
  badgeWrap: { position: 'absolute', top: -4, right: -4 },
});

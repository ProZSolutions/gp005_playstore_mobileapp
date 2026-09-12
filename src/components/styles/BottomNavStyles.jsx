// components/styles/BottomNavStyles.js
import { StyleSheet, Platform } from 'react-native';

const TEAL = '#11A9A0';
const GREY = '#9CA3AF';

export default StyleSheet.create({
  colors: { active: TEAL, inactive: GREY },

  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ECECEC',
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    position: 'relative', // anchors the absolutely-positioned FAB below
  },

  // ── Regular tab item — fixed size, only color changes on selection ──
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // was 'center' — caused the extra gap
    gap: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: GREY,
    marginTop: 2, // was 4 — tightened
  },
  tabLabelActive: {
    color: TEAL,
    fontWeight: '600', // bolder, NOT bigger
  },

  // Reserves room in the row so side tabs don't sit under the floating FAB
  fabSpacer: {
    flex: 1.1,
  },

  // ── Centre FAB — fixed prominent style, never tied to selection state ──
  fabWrapper: {
    position: 'absolute',
    top: -28, // floats above the bar's top edge
    left: '50%',
    marginLeft: -36, // half of fabHalo width, centers it
    alignItems: 'center',
  },
  fabHalo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff', // the white "cutout" ring behind the teal button
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: TEAL,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: { elevation: 5 },
    }),
  },
  fabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: TEAL,
    marginTop: -2,
  },
});
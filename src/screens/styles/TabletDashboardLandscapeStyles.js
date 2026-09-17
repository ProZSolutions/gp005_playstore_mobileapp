import { StyleSheet } from 'react-native';

// Landscape-only overrides, layered ON TOP of GlobalStyles and (if
// applicable) TabletDashboardStyles. Kept in their own file so neither
// portrait phone nor portrait tablet is touched by anything here —
// these only apply when isLandscape is true.

// ── Phone landscape (isLargeScreen === false) ──────────────────────────
const phoneLandscape = StyleSheet.create({
  headerTopRow: {
    paddingTop: 4,
    paddingBottom: 6,
  },
  inspectionCardOuter: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 10,
  },
  inspectorCard: {
    marginTop: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginRight: 10,
  },
  avatarText: {
    fontSize: 15,
  },
  inspectorName: {
    fontSize: 15,
  },
  inspectorRole: {
    fontSize: 12,
    marginTop: 0,
  },
  empBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  empBadgeText: {
    fontSize: 11,
  },
  shiftPill: {
    marginTop: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  shiftText: {
    fontSize: 12,
  },
  sectionLabel_dash: {
    fontSize: 13,
    marginTop: 10,
    marginBottom: 8,
  },
  mainOpCard: {
    width: '31%',
    height: 108,
    padding: 10,
  },
  mainOpIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    marginBottom: 6,
  },
  mainOpTitle: {
    fontSize: 13,
  },
  mainOpSubtitle: {
    fontSize: 11,
    lineHeight: 14,
  },
  configCard: {
    width: '31%',
    height: 64,
  },
  configTitle: {
    fontSize: 13,
    marginBottom: 0,
  },
});

// ── Tablet landscape (isLargeScreen === true) ──────────────────────────
// Bigger than phone-landscape (tablets have the room) but shorter than
// portrait-tablet (TabletDashboardStyles), since landscape viewport
// height is limited compared to a tablet held upright.
const tabletLandscape = StyleSheet.create({
  body: {
    maxWidth: 1100,
    paddingHorizontal: 24,
  },
  inspectionCardOuter: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginHorizontal: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    marginRight: 12,
  },
  avatarText: {
    fontSize: 19,
  },
  inspectorName: {
    fontSize: 19,
  },
  inspectorRole: {
    fontSize: 15,
  },
  empBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  empBadgeText: {
    fontSize: 13,
  },
  shiftPill: {
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  shiftText: {
    fontSize: 15,
  },
  sectionLabel_dash: {
    fontSize: 17,
    marginTop: 14,
    marginBottom: 10,
  },
  mainOpCard: {
    width: '23%',
    height: 132,
    padding: 14,
  },
  mainOpIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    marginBottom: 10,
  },
  mainOpTitle: {
    fontSize: 16.5,
  },
  mainOpSubtitle: {
    fontSize: 13.5,
    lineHeight: 16,
  },
  configCard: {
    width: '23%',
    height: 92,
  },
  configTitle: {
    fontSize: 15,
    marginBottom: 0,
  },
});

export default { phoneLandscape, tabletLandscape };
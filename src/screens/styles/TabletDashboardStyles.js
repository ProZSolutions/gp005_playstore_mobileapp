import { StyleSheet } from 'react-native';
import { AppColors } from '../../theme/theme';
import Dimensions from '../../theme/dimensions';

// Applied ONLY when isLargeScreen is true. Mobile keeps using
// GlobalStyles.container / GlobalStyles.text exactly as-is.
const TabletDashboardStyles = StyleSheet.create({ 
  mainOpCard: {
    width: '31%',
    height: 172,
    maxWidth: 260,
    padding: 20,
    justifyContent: 'flex-start',
  },
  mainOpIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginBottom: 14,
  },
  mainOpTitle: {
    fontSize: 22.5,
    marginBottom: 3,
  },
  mainOpSubtitle: {
    fontSize: 18.5,
    lineHeight: 20,
  },

  // Config tools grid — same fixed-height treatment
  configCard: {
    width: '31%',
    height: 150,
    maxWidth: 260,
    justifyContent: 'space-between',
     flexDirection: 'row',
  },
  configTitle: {
    fontSize: 20,
    marginBottom:60
  },
 
  body: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
 
  inspectionCardOuter: {
    maxWidth: 800 - 48,
    alignSelf: 'center',
    width: '100%',
    marginHorizontal: 24,
    paddingVertical: 20,
    paddingHorizontal: 22,
  },
  // Header row: "Change Zone" pill text + zone summary + bell/profile icons
  changeZoneText: {
    fontSize: 20.5,
  },
  zoneSummaryText: {
    fontSize: 18,
    marginTop: 4,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  headerIconButtonProfile: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },

  // Inspector card: more breathing room + bigger avatar/badge
  inspectorCard: {
    marginTop: 10,
    marginHorizontal: 6,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 18,
    marginRight: 16,
  },
  empBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  empBadgeText: {
    fontSize: 17,
  },
  shiftPill: {
    marginHorizontal: 6,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  avatarText: {
    fontSize: 25,
  },
  inspectorName: {
    fontSize: 25,
  },
  inspectorRole: {
    fontSize: 20,
  },
  shiftText: {
    fontSize: 20,
  },
  sectionLabel_dash: {
    fontSize: 22,
    marginTop: 22,
    marginBottom: 14,
  },
});

export default TabletDashboardStyles;
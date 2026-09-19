import { StyleSheet } from 'react-native';
import { AppColors } from '../../theme/theme';
import Dimensions from '../../theme/dimensions';
 
const TabletDashboardStyles = StyleSheet.create({ 
  mainOpCard: {
    width: '29%',
    height: 215,
     padding: 40,
    justifyContent: 'flex-start',
  },
  mainOpIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginBottom: 5,
  },
  mainOpTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 22.5,
    marginBottom: 3,
  },
  mainOpSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 18.5,
    lineHeight: 20,
  },

   configCard: {
    width: '29%',
    height: 165,
    maxWidth: 260,
    justifyContent: 'space-between',
     flexDirection: 'row',
  },
  configTitle: {
    fontFamily: 'Inter-Regular',
    fontWeight:800,
    fontSize: 20,
    marginBottom:20
  },
     configIcon: { alignSelf: 'flex-end', marginTop:'auto' },
 configIconP: { alignSelf: 'flex-end', marginTop:'auto' ,marginBottom:10,marginRight:10},
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
   changeZoneText: {
    fontSize: 20.5,
  },
  zoneSummaryText: {
    fontFamily: 'Inter-Regular',
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
    paddingHorizontal: 25,
    paddingVertical: 4,
   },
  empBadgeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    fontWeight:600
  },
  shiftPill: {
    marginHorizontal: 6,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  avatarText: {
    fontFamily: 'Inter-Regular',
    fontSize: 25,
  },
  inspectorName: {
    fontSize: 22,
  },
  inspectorRole: {
    fontSize: 20,
  },
  shiftText: {
    fontFamily: 'Inter-Regular',
    fontSize: 19,
  },
  sectionLabel_dash: {
    fontSize: 22,
    marginTop: 22,
    marginBottom: 14,
  },

  // ---- LANDSCAPE (large screen) variants ----
  // 4 cards per row: narrower card, and text/icon sizes trimmed down to
  // match the smaller card so nothing clips or wraps awkwardly.
  mainOpCardLandscape: {
    width: '22%',
    height: 180,
    padding: 28,
    justifyContent: 'flex-start',
  },
  mainOpIconWrapLandscape: {
    width: 46,
    height: 46,
    borderRadius: 14,
    marginBottom: 4,
  },
  mainOpTitleLandscape: {
    fontFamily: 'Inter-Regular',
    fontSize: 19,
    marginBottom: 3,
  },
  mainOpSubtitleLandscape: {
    fontFamily: 'Inter-Regular',
    fontSize: 15.5,
    lineHeight: 18,
  },
  configCardLandscape: {
    width: '25%',
    height: 175,
    maxWidth: 220,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
    configCardPscape: {
    width: '29%',
    height: 175,
    maxWidth: 220,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  configTitleLandscape: {
    fontFamily: 'Inter-Regular',
    fontWeight: 800,
    fontSize: 18,
    marginBottom: 12,
    marginRight:12 
  },
  configIconLandscape: { alignSelf: 'flex-end', marginTop: 'auto',marginBottom: 12,marginRight:12 },
  bodyLandscape: {
    maxWidth: 1150,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  inspectionCardOuterLandscape: {
    maxWidth: 1150  ,
    alignSelf: 'center',
    width: '100%',
    marginHorizontal: 24,
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
});

export default TabletDashboardStyles;
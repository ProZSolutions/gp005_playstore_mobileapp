import { StyleSheet, Platform, Dimensions } from 'react-native';
import { AppColors } from '../../theme/theme';

const { width: W } = Dimensions.get('window');
const H_PAD = Math.min(Math.max(W * 0.042, 14), 20);
export const HAIRLINE = 'rgba(0,0,0,0.08)';

export default function createStyles(ms, mvs, fs, isLargeScreen) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: AppColors.background },

    headerWrap: {
      backgroundColor: AppColors.primary,
      paddingBottom: mvs(16), 
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: ms(16),
      paddingTop: mvs(6),
    },
    backPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.20)',
      paddingHorizontal: ms(12),
      paddingVertical: mvs(6),
      borderRadius: ms(16),
    },
    backText: { color: AppColors.onPrimary, fontSize: fs(14), fontWeight: '600', marginLeft: ms(4) },
    filterBtn: {
      width: ms(34),
      height: ms(34),
      borderRadius: ms(17),
      backgroundColor: 'rgba(255,255,255,0.20)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: AppColors.onPrimary,
      fontSize: fs(22),
      fontWeight: '800',
      marginTop: mvs(10),
      marginHorizontal: ms(16),
    },

    titleLarge: {
      color: AppColors.onPrimary,
      fontSize: fs(17),
      fontWeight: '800',
      marginTop: mvs(10),
      marginHorizontal: ms(16),
    },
    searchOuterlarge: { marginHorizontal: ms(16), marginTop: mvs(14) },
  titlelarge: {
      color: AppColors.onPrimary,
      fontSize: fs(20),
      fontWeight: '800',
      marginTop: mvs(10),
      marginHorizontal: ms(16),
    },  titlelandscape: {
      color: AppColors.onPrimary,
      fontSize: fs(18),
      fontWeight: '800',
      marginTop: mvs(10),
      marginHorizontal: ms(16),
    }, searchBarLarge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: AppColors.surface,
      borderRadius: ms(22),
      paddingHorizontal: ms(14),
      height: mvs(42),
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: ms(6),
      shadowOffset: { width: 0, height: mvs(2) },
      elevation: 2,
    },
    searchOuter: { marginHorizontal: ms(16), marginTop: mvs(14) },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: AppColors.surface,
      borderRadius: ms(22),
      paddingHorizontal: ms(14),
      height: mvs(46),
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: ms(6),
      shadowOffset: { width: 0, height: mvs(2) },
      elevation: 2,
    },
    searchInput: { flex: 1, marginLeft: ms(8), fontSize: fs(16.5), color: AppColors.textPrimary, padding: 0 },
  searchInputLarge: {
      flex: 1,
      marginLeft: ms(8),
      fontSize: fs(15),
      color: AppColors.textPrimary,
      padding: 0,
    },
     lineChipTextLarge: { color: AppColors.textPrimary, fontSize: fs(11.5), fontWeight: '600' },

    chipsRowOuter: { marginTop: mvs(14) },
    chipsRow: { flexDirection: 'row', paddingHorizontal: ms(16) },
    lineChip: {
      flexDirection: 'row',
      alignItems: 'center',
        
      borderColor:AppColors.white,
      borderWidth:ms(0.4),
      borderRadius: ms(18),
      paddingHorizontal: ms(12),
      paddingVertical: mvs(7),
      marginRight: ms(8),
    },
    lineChipActive: {   backgroundColor: AppColors.primaryDarkLTh,borderWidth:ms(0)},
    lineChipText: { color: 'rgba(255,255,255,0.9)', fontSize: fs(13), fontWeight: '600' },
    lineChipTextActive: { color: AppColors.onPrimary },
    chipCountBadge: {
      marginLeft: ms(6),
      minWidth: ms(20),
      height: ms(20),
      borderRadius: ms(10),
      paddingHorizontal: ms(5),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: AppColors.white,
    },
    chipCountBadgeActive: { backgroundColor: AppColors.onPrimary },
    chipCountText: { fontSize: fs(11.5), fontWeight: '800', color: AppColors.primary },
    chipCountTextActive: { color: AppColors.primary ,fontSize: fs(11.5), fontWeight: '800', },

    body: { flex: 1 },
    listContent: { paddingHorizontal: ms(16), paddingTop: mvs(16), paddingBottom: mvs(24) },
    emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: mvs(60) },
    emptyText: { color: AppColors.textTertiary, fontSize: fs(15), marginTop: mvs(8), textAlign: 'center' },

    card: {
      backgroundColor: AppColors.surface,
      borderRadius: ms(16),
      padding: ms(16),
      marginBottom: mvs(14),
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: ms(8),
      shadowOffset: { width: 0, height: mvs(3) },
      elevation: 2,
    },
    cardTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: mvs(10),
    },
    orderId: { fontSize: fs(15.5), fontWeight: '800', color: AppColors.textPrimary },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: ms(10),
      paddingVertical: mvs(4),
      borderRadius: ms(10),
      borderWidth:ms(1)
    },
    statusDot: { width: ms(6), height: ms(6), borderRadius: ms(3), marginRight: ms(5) },
    statusText: { fontSize: fs(11.5), fontWeight: '700' },

    defectChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: AppColors.primaryLight ?? '#E6F6F5',
      borderRadius: ms(10),
      borderWidth:ms(0.5),
      borderColor:AppColors.primaryDarkLTh,
      paddingHorizontal: ms(12),
      paddingVertical: mvs(9),
      marginBottom: mvs(12),
    },
    defectChipText: { color: AppColors.black ?? AppColors.black, fontSize: fs(14), fontWeight: '600', marginLeft: ms(8) },

    cardGridRow: { flexDirection: 'row', marginBottom: mvs(8),marginTop:ms(4) },
    cardGridCell: { flex: 1 },
    fieldLabel: {
      color: AppColors.textTertiary,
      fontSize: fs(11.5),
      fontWeight: '700',
      letterSpacing: 0.3,
      marginBottom: mvs(3),
    },
    fieldValueRow: { flexDirection: 'row', alignItems: 'center' },
    fieldValue: { color: AppColors.textPrimary, fontSize: fs(14.5), fontWeight: '600' },
    colourDot: { width: ms(8), height: ms(8), borderRadius: ms(4), marginRight: ms(6) },
    auditCard: {},
 
qualityCheckRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: mvs(6),
  marginTop: mvs(8),
},
qcPill: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: ms(8),
  paddingVertical: mvs(4),
  borderRadius: ms(12),
  gap: ms(4),
},
qcPillPass: { backgroundColor: '#ECFDF5' },
qcPillFail: { backgroundColor: '#FEF2F2' },
qcPillText: { fontSize: fs(11) },
qcPillTextPass: { color: '#16A34A' },
qcPillTextFail: { color: AppColors.error },
 
severityRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: ms(8),
  marginTop: mvs(8),
},
severityBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: ms(4),
  paddingHorizontal: ms(8),
  paddingVertical: mvs(3),
  borderRadius: ms(10),
  borderWidth: 1,
},
severityBadgeCount: { fontSize: fs(12), fontWeight: '700' },
severityBadgeLabel: { fontSize: fs(10), color: AppColors.textTertiary },
 
defectCountPill: {
  marginLeft: 'auto',
  backgroundColor: AppColors.surfaceVariant ?? '#F3F4F6',
  paddingHorizontal: ms(8),
  paddingVertical: mvs(3),
  borderRadius: ms(10),
},
defectCountPillText: { fontSize: fs(10), color: AppColors.textSecondary ?? '#4B5563' },
// 1) Update your existing `searchOuter` style to lay out the search bar
//    and the new filter icon side by side, e.g.:
//
// searchOuter: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   gap: ms(8),
//   paddingHorizontal: ms(16),
//   ...
// },
// searchBar: {
//   flex: 1,          // <-- add this so it shrinks to make room for the icon
//   ...(keep your existing searchBar properties)
// },

// 2) Add these new style keys anywhere in the returned StyleSheet object:

filterIconBtn: {
  width: ms(38),
  marginRight:ms(15),
  height: ms(38),
  borderRadius: ms(10),
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255,255,255,0.16)',
},
filterActiveDot: {
  position: 'absolute',
  top: ms(6),
  right: ms(6),
  width: ms(8),
  height: ms(8),
  borderRadius: ms(4),
  backgroundColor: AppColors.error ?? '#E53935',
  borderWidth: 1,
  borderColor: '#fff',
},

filterModalBackdrop: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  alignItems: 'center',
  justifyContent: 'center',
  padding: ms(24),
},
filterModalCard: {
  width: '100%',
  maxWidth: ms(360),
  backgroundColor: '#fff',
  borderRadius: ms(14),
  padding: ms(20),
},
filterModalTitle: {
  fontSize: fs(16),
  fontWeight: '700',
  color: AppColors.textPrimary ?? '#212121',
  marginBottom: mvs(14),
},
filterFieldLabel: {
  fontSize: fs(12),
  fontWeight: '600',
  color: AppColors.textTertiary ?? '#757575',
  marginBottom: mvs(6),
  marginTop: mvs(10),
},
filterDateInput: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: ms(8),
  borderWidth: 1,
  borderColor: '#E0E0E0',
  borderRadius: ms(10),
  paddingHorizontal: ms(12),
  paddingVertical: mvs(10),
},
filterDateInputText: {
  fontSize: fs(14),
  color: AppColors.textPrimary ?? '#212121',
},
filterModalActions: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  gap: ms(10),
  marginTop: mvs(20),
},
filterClearBtn: {
  paddingHorizontal: ms(16),
  paddingVertical: mvs(10),
  borderRadius: ms(10),
  borderWidth: 1,
  borderColor: '#E0E0E0',
},
filterClearBtnText: {
  fontSize: fs(13),
  fontWeight: '600',
  color: AppColors.textPrimary ?? '#212121',
},
filterApplyBtn: {
  paddingHorizontal: ms(18),
  paddingVertical: mvs(10),
  borderRadius: ms(10),
  backgroundColor: AppColors.primary,
},
filterApplyBtnText: {
  fontSize: fs(13),
  fontWeight: '700',
  color: AppColors.onPrimary ?? '#fff',
},

// --- pure-JS calendar (no native datetimepicker dependency) ---
calendarWrap: {
  marginTop: mvs(10),
  borderWidth: 1,
  borderColor: '#EEEEEE',
  borderRadius: ms(10),
  padding: ms(10),
},
calendarHeaderRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: mvs(8),
},
calendarNavBtn: {
  width: ms(28),
  height: ms(28),
  borderRadius: ms(14),
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#F5F5F5',
},
calendarHeaderText: {
  fontSize: fs(13),
  fontWeight: '700',
  color: AppColors.textPrimary ?? '#212121',
},
calendarWeekRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},
calendarWeekdayText: {
  width: ms(30),
  textAlign: 'center',
  fontSize: fs(11),
  fontWeight: '600',
  color: AppColors.textTertiary ?? '#9E9E9E',
  marginBottom: mvs(4),
},
calendarDayCell: {
  width: ms(30),
  height: ms(30),
  borderRadius: ms(15),
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: mvs(2),
},
calendarDayCellSelected: {
  backgroundColor: AppColors.primary,
},
headerRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
},
calendarDayText: {
  fontSize: fs(13),
  color: AppColors.textPrimary ?? '#212121',
},
calendarDayTextMuted: {
  color: '#CCCCCC',
},
calendarDayTextDisabled: {
  color: '#E0E0E0',
},
calendarDayTextSelected: {
  color: AppColors.onPrimary ?? '#fff',
  fontWeight: '700',
},
  });
}
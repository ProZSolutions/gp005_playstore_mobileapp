
import { StyleSheet,Dimensions } from 'react-native';
import { AppColors } from '../../theme/theme';

const { width: W } = Dimensions.get('window');
export const CHIP_ACTIVE_BG = AppColors.lineHighligher ?? '#067A72';
export const HAIRLINE = 'rgba(0,0,0,0.08)';
const RADIO_BORDER_IDLE = '#D6E2E2';
const H_PAD = Math.min(Math.max(W * 0.042, 14), 20);

export default function createStyles(ms, mvs, fs, isLargeScreen) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: AppColors.background },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',  
      paddingHorizontal: ms(10),
      paddingVertical: mvs(4),
      borderRadius: ms(10),
      borderWidth:ms(1),       
    },
    statusDot: { width: ms(6), height: ms(6), borderRadius: ms(3), marginRight: ms(5) },
    statusText: { fontSize: fs(11.5), fontWeight: '700',color: AppColors.black  },
    orderId: { fontSize: fs(15.5), fontWeight: '800', color: AppColors.textPrimary,marginRight:ms(7) },
    defectChipText: { color: AppColors.black ?? AppColors.black, fontSize: fs(14), fontWeight: '600', marginLeft: ms(8) },

    cardTopRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: mvs(10),
        },
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
     headerWrap: {
      backgroundColor: AppColors.primary,
      paddingBottom: mvs(14),
      borderBottomLeftRadius: ms(20),
      borderBottomRightRadius: ms(20),
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
      backgroundColor: 'rgba(255, 255, 255, 0.20)',
      paddingHorizontal: ms(12),
      paddingVertical: mvs(6),
      borderRadius: ms(16),
    },
    backText: { color: AppColors.onPrimary, fontSize: fs(14), fontWeight: '600', marginLeft: ms(4) },
    totalBadge: {
      backgroundColor: 'rgba(12, 92, 92, 0.50)',
      paddingHorizontal: ms(10),
      paddingVertical: mvs(5),
      borderRadius: ms(15),
    },
    totalBadgeText: { color: AppColors.onPrimary, fontSize: fs(12.5), fontWeight: '700' },

    title: {
      color: AppColors.onPrimary,
      fontSize: fs(22),
      fontWeight: '800',
      marginTop: mvs(10),
      marginHorizontal: ms(16),
    },
     titlelarge: {
      color: AppColors.onPrimary,
      fontSize: fs(20),
      fontWeight: '800',
      marginTop: mvs(10),
      marginHorizontal: ms(16),
    },
     titlelandscape: {
      color: AppColors.onPrimary,
      fontSize: fs(18),
      fontWeight: '800',
      marginTop: mvs(10),
      marginHorizontal: ms(16),
    },
    subtitle: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: fs(15.5),
      marginHorizontal: ms(16),
    },

    /* ── Search bar ── */
    searchOuter: { marginHorizontal: ms(16), marginTop: mvs(14) },
    searchOuterlarge: { marginHorizontal: ms(16), marginTop: mvs(14) },
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
     searchBarLarge: {
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
    searchInput: {
      flex: 1,
      marginLeft: ms(8),
      fontSize: fs(17.5),
      color: AppColors.textPrimary,
      padding: 0,
    },
     searchInputLarge: {
      flex: 1,
      marginLeft: ms(8),
      fontSize: fs(15),
      color: AppColors.textPrimary,
      padding: 0,
    },

    /* ── Line filter chips ── */
    chipsRowOuter: { marginTop: mvs(12) },
    chipsRow: {
      flexDirection: 'row',
      paddingHorizontal: ms(16),
    },
    lineChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: AppColors.surface,
      borderRadius: ms(18),
      paddingHorizontal: ms(14),
      paddingVertical: mvs(8),
      marginRight: ms(8),
    },
    lineChipActive: {
      backgroundColor: CHIP_ACTIVE_BG,
    },
    lineChipText: { color: AppColors.textPrimary, fontSize: fs(13.5), fontWeight: '600' },
     lineChipTextLarge: { color: AppColors.textPrimary, fontSize: fs(11.5), fontWeight: '600' },
    lineChipTextActive: { color: AppColors.onPrimary },

    /* ── Body / list ── */
    body: { flex: 1 },
    listContent: { paddingHorizontal: ms(16), paddingTop: mvs(16), paddingBottom: mvs(24) },

    emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: mvs(60) },
    emptyText: { color: AppColors.textTertiary, fontSize: fs(17), marginTop: mvs(8) },

    /* ── Order card ── */
    card: {
      backgroundColor: AppColors.surface,
      borderRadius: ms(16),
      padding: ms(16),
      marginBottom: mvs(14),
      borderWidth: 1.5,
      borderColor: 'transparent',
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: ms(8),
      shadowOffset: { width: 0, height: mvs(3) },
      elevation: 2,
    },
    cardSelected: {
      borderColor: AppColors.primary,
    },
    cardTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: mvs(12),
    },
    tlsCode: { color: AppColors.textPrimary, fontSize: fs(15.5), fontWeight: '800',marginRight:ms(7) },
    tlsCodeLarge: { color: AppColors.textPrimary, fontSize: fs(13.5), fontWeight: '800',marginRight:ms(7) },
    cardCheckbox: { marginLeft: ms(8) },

    /* Radio control for single-select order cards.
       Always has a visible ring (RADIO_BORDER_IDLE) when idle —
       width/height/borderRadius are explicit so the ring actually renders. */
    radioOuter: {
      width: ms(22),
      height: ms(22),
      borderRadius: ms(11),
      borderWidth: 1.5,
      borderColor: RADIO_BORDER_IDLE,
      backgroundColor: AppColors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOuterSelected: {
      borderColor: AppColors.primary,
    },
    radioInnerDot: {
      width: ms(11),
      height: ms(11),
      borderRadius: ms(5.5),
      backgroundColor: AppColors.primary,
    },

    cardGridRow: {
      flexDirection: 'row',
      marginBottom: mvs(10),
    },
    cardGridCell: { flex: 1, minWidth: 0,        // NEW — lets flex children actually shrink below content size
  paddingRight: ms(10),},
    fieldLabel: {
      color: AppColors.textTertiary,
      fontSize: fs(12.5),
      fontWeight: '700',
      letterSpacing: 0.4,
      marginBottom: mvs(4),
    },
    fieldValueRow: { flexDirection: 'row', alignItems: 'center',minWidth: 0,     },
    fieldValue: { color: AppColors.textPrimary, fontSize: fs(16), fontWeight: '600',flexShrink: 1,  },
    fieldValueLarge: { color: AppColors.textPrimary, fontSize: fs(13), fontWeight: '600',flexShrink: 1,  },
    colourDot: { width: ms(15), height: ms(15), borderRadius: ms(8.5), marginRight: ms(6) },

    cardDivider: { height: 1, backgroundColor: HAIRLINE, marginVertical: mvs(8) },

    cardFooterRow: { flexDirection: 'row', alignItems: 'center' },
    createdOnText: { color: AppColors.textTertiary, fontSize: fs(14), marginLeft: ms(5) },
    createdOnTextLarge: { color: AppColors.textTertiary, fontSize: fs(13), marginLeft: ms(5) },

     footer: {
        backgroundColor:   AppColors.surface ?? '#fff',
        paddingHorizontal: H_PAD,
          paddingTop:        15,
        paddingBottom:     Platform.OS === 'ios' ? 26 : 32,
        borderTopWidth:    1,
        borderTopColor:    '#E8EDED',
        ...Platform.select({
          ios: {
            shadowColor:   '#000',
            shadowOffset:  { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius:  6,
          },
          android: { elevation: 6 },
        }),
      },
      footerRow: {
        flexDirection: 'row',
        alignItems:    'center',
        gap:           10,
      },
  });
}
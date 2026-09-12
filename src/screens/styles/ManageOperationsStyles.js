import { StyleSheet, Platform, Dimensions } from 'react-native';
import { AppColors } from '../../theme/theme';

const { width: W } = Dimensions.get('window');
const H_PAD = Math.min(Math.max(W * 0.042, 14), 20);

export default function createStyles(ms, mvs, fs) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: AppColors.background },

    header: {
      backgroundColor: AppColors.primary,
      paddingHorizontal: H_PAD,
      paddingTop: Platform.OS === 'android' ? mvs(10) : mvs(4),
      paddingBottom: mvs(16),
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: mvs(10),
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
    title: { color: AppColors.onPrimary, fontSize: fs(22), fontWeight: '800' },

     titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
       flexWrap: 'wrap',
    },
    screenTitle: { color: AppColors.onPrimary, fontSize: fs(18), fontWeight: '800' },
    lineBadge: {
      marginLeft: ms(10),
      paddingHorizontal: ms(10),
      paddingVertical: mvs(3),
      borderRadius: ms(10),
      backgroundColor: 'rgba(255,255,255,0.22)',
    },
    lineBadgeText: { color: AppColors.onPrimary, fontSize: fs(11.5), fontWeight: '700' },


    body: { flex: 1, paddingHorizontal: H_PAD, paddingTop: mvs(16) },

    sectionLabel: {
      fontSize: fs(12.5),
      fontWeight: '700',
      letterSpacing: 0.6,
      color: AppColors.textTertiary,
      textTransform: 'uppercase',
      marginBottom: mvs(8),
    }, sectionLabelHeader: {
      fontSize: fs(14.5),
      fontWeight: '700',
      letterSpacing: 0.6,
      color: AppColors.textTertiary,
      textTransform: 'uppercase',
      marginBottom: mvs(8),
    },

    detailsCard: {
      backgroundColor: AppColors.surface,
      borderRadius: ms(16),
      padding: ms(16),
      marginBottom: mvs(20),
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: ms(8),
      shadowOffset: { width: 0, height: mvs(3) },
      elevation: 2,
    },
    detailsIconWrap: {
      width: ms(42),
      height: ms(42),
      borderRadius: ms(12),
      backgroundColor: AppColors.primaryLight ?? '#E6F6F5',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: ms(12),
    },
    detailsName: { fontSize: fs(16.5), fontWeight: '800', color: AppColors.textPrimary },
    detailsSubRow: { flexDirection: 'row', alignItems: 'center', marginTop: mvs(4) },
    detailsSubText: { fontSize: fs(13), color: AppColors.textTertiary, fontWeight: '500' },
    detailsSubDivider: { marginHorizontal: ms(6), color: AppColors.textTertiary },

    mappedHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: mvs(10),
    },
    headerBtnsRow: { flexDirection: 'row', alignItems: 'center', gap: ms(8) },
    iconBtn: {
      width: ms(30),
      height: ms(30),
      borderRadius: ms(15),
      backgroundColor: '#F0F3F3',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBtnPrimary: { backgroundColor: AppColors.primary },

    /* ── Empty state ── */
    emptyCard: {
      backgroundColor: AppColors.surface,
      borderRadius: ms(16),
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: mvs(40),
      paddingHorizontal: ms(24),
    },
    emptyIconWrap: {
      width: ms(64),
      height: ms(64),
      borderRadius: ms(16),
      backgroundColor: AppColors.primaryLight ?? '#E6F6F5',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: mvs(16),
    },
    emptyTitle: { fontSize: fs(16), fontWeight: '700', color: AppColors.textPrimary, marginBottom: mvs(6) },
    emptySubtitle: {
      fontSize: fs(13.5),
      color: AppColors.textTertiary,
      textAlign: 'center',
      lineHeight: fs(19),
      marginBottom: mvs(22),
    },
    addDeviceBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: AppColors.primary,
      paddingHorizontal: ms(22),
      paddingVertical: mvs(13),
      borderRadius: ms(10),
      gap: ms(8),
    },
    addDeviceBtnText: { color: AppColors.onPrimary, fontSize: fs(15), fontWeight: '700' },

    /* ── Device rows ── */
    deviceList: { paddingBottom: mvs(24) },
    deviceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: AppColors.surface,
      borderRadius: ms(14),
      padding: ms(14),
      marginBottom: mvs(10),
    },
    deviceIconWrap: {
      width: ms(38),
      height: ms(38),
      borderRadius: ms(10),
      backgroundColor: '#F0F3F3',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: ms(12),
    },
    deviceBody: { flex: 1 },
    deviceId: { fontSize: fs(15), fontWeight: '800', color: AppColors.textPrimary },
    deviceMachine: { fontSize: fs(13), color: AppColors.textTertiary, marginTop: mvs(2) },
    deleteBtn: {
      width: ms(34),
      height: ms(34),
      borderRadius: ms(17),
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* ── Footer ── */
    footer: {
      backgroundColor: AppColors.surface,
      paddingHorizontal: H_PAD,
      paddingTop: mvs(14),
      paddingBottom: Platform.OS === 'ios' ? mvs(26) : mvs(20),
      borderTopWidth: 1,
      borderTopColor: '#E8EDED',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        },
        android: { elevation: 6 },
      }),
    },
    saveBtn: {
      backgroundColor: AppColors.primary,
      paddingVertical: mvs(14),
      borderRadius: ms(26),
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveBtnText: { color: AppColors.onPrimary, fontSize: fs(16), fontWeight: '800' },

  
    addButtonsRow: {
      flexDirection: 'row',
      gap: ms(10),
      marginTop: mvs(6),
      marginBottom:mvs(6)
    },
    addButtonHalf: { flex: 1 },
    addButtonIconWrap: { marginRight: ms(6) },

     mapRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F7F9F9',
      borderRadius: ms(14),
      padding: ms(14),
      marginBottom: mvs(12),
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    mapRowDone: {
      backgroundColor: AppColors.primaryLight ?? '#E6F6F5',
      borderColor: AppColors.primary,
    },
    mapRowIconWrap: {
      width: ms(38),
      height: ms(38),
      borderRadius: ms(10),
      backgroundColor: AppColors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: ms(12),
    },
    mapRowBody: { flex: 1 },
    mapRowLabel: {
      fontSize: fs(12),
      fontWeight: '700',
      color: AppColors.textTertiary,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
    mapRowValue: { fontSize: fs(15.5), fontWeight: '800', color: AppColors.textPrimary, marginTop: mvs(2) },
    mapRowPlaceholder: {
      fontSize: fs(14),
      fontWeight: '500',
      color: AppColors.textTertiary,
      fontStyle: 'italic',
      marginTop: mvs(2),
    },
    mapRowAction: {
      width: ms(30),
      height: ms(30),
      borderRadius: ms(15),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: AppColors.primary,
    },
    mapRowActionDone: { backgroundColor: '#DCF5E9' },
    continueBtn: {
      paddingVertical: mvs(14),
      borderRadius: ms(26),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#D7DEDE',
      marginTop: mvs(6),
    },
    continueBtnActive: { backgroundColor: AppColors.primary },
    continueBtnText: { fontSize: fs(15.5), fontWeight: '800', color: '#8A9898' },
    continueBtnTextActive: { color: AppColors.onPrimary },

    /* ── Confirm Device sheet content (chrome — backdrop/handle/header/
       close — now lives in the shared components/BottomSheet.js) ── */
    sheetFieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F7F9F9',
      borderRadius: ms(12),
      padding: ms(12),
      marginBottom: mvs(12),
    },
    sheetFieldIconWrap: {
      width: ms(30),
      height: ms(30),
      borderRadius: ms(8),
      backgroundColor: AppColors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: ms(10),
    },
    sheetFieldLabel: {
      fontSize: fs(11.5),
      fontWeight: '700',
      color: AppColors.textTertiary,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    sheetFieldValue: { fontSize: fs(15.5), fontWeight: '800', color: AppColors.textPrimary, marginTop: mvs(2) },
    sheetAddBtn: {
      backgroundColor: AppColors.primary,
      paddingVertical: mvs(14),
      borderRadius: ms(26),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: mvs(6),
    },
    sheetAddBtnText: { color: AppColors.onPrimary, fontSize: fs(15.5), fontWeight: '800' },
  });
}
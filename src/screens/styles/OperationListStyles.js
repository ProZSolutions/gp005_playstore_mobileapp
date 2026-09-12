import { StyleSheet, Platform, Dimensions } from 'react-native';
import { AppColors } from '../../theme/theme';

const { width: W } = Dimensions.get('window');
const H_PAD = Math.min(Math.max(W * 0.042, 14), 20);

export default function createStyles(ms, mvs, fs) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: AppColors.background },



     titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: mvs(14),
      marginHorizontal: ms(16),
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





    headerWrap: {
      backgroundColor: AppColors.primary,
      paddingBottom: mvs(36), 
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

    /* ── Order info card — overlaps the bottom of the teal header ── */
    infoCard: {
      backgroundColor: AppColors.surface,
       marginTop: mvs(22),       
      padding: ms(14),       
      shadowOffset: { width: 0, height: mvs(3) },
     },
    infoRow: { flexDirection: 'row' },
    infoCell: { flex: 1, flexDirection: 'row', alignItems: 'flex-start'  },
    infoTextContainer: {
      flex: 1,
      flexShrink: 1,
    },
    infoIconWrap: {
      width: ms(28),
      height: ms(28),
      borderRadius: ms(15),
      backgroundColor: AppColors.primaryLight ?? '#E6F6F5',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: ms(4),
    },
    infoLabel: { fontSize: fs(12), color: AppColors.textTertiary, fontWeight: '600', letterSpacing: 0.3 },
    infoValue: { fontSize: fs(14.5), color: AppColors.textPrimary, fontWeight: '600', marginTop: mvs(1) ,flexShrink: 1,  flexWrap: 'wrap',},
    infoDivider: { height: mvs(12) },

     body: { flex: 1, marginTop: -mvs(22) },
    listContent: { paddingHorizontal: ms(16), paddingTop: mvs(16), paddingBottom: mvs(24) },
    emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: mvs(60) },
    emptyText: { color: AppColors.textTertiary, fontSize: fs(15), marginTop: mvs(8), textAlign: 'center' },

    /* ── Operation card ── */
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
      marginBottom: mvs(12),
    },
    opName: { fontSize: fs(16.5), fontWeight: '800', color: AppColors.textPrimary },
    gearBtn: {
      width: ms(30),
      height: ms(30),
      borderRadius: ms(15),
      backgroundColor: AppColors.primaryLight ?? '#E6F6F5',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardGridRow: { flexDirection: 'row', marginBottom: mvs(10) },
    cardGridCell: { flex: 1 },
    fieldLabel: {
      color: AppColors.textTertiary,
      fontSize: fs(12),
      fontWeight: '700',
      letterSpacing: 0.4,
      marginBottom: mvs(4),
    },
    fieldValue: { color: AppColors.textPrimary, fontSize: fs(15.5), fontWeight: '700' },
    statusRow: { flexDirection: 'row', alignItems: 'center' },
    statusDot: { width: ms(8), height: ms(8), borderRadius: ms(4), marginRight: ms(6) },
    statusText: { fontSize: fs(14.5), fontWeight: '700' },

    /* ── Filter modal ── */
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: AppColors.surface,
      borderTopLeftRadius: ms(22),
      borderTopRightRadius: ms(22),
      paddingHorizontal: ms(20),
      paddingTop: mvs(10),
      paddingBottom: Platform.OS === 'ios' ? mvs(28) : mvs(20),
    },
    sheetHandle: {
      alignSelf: 'center',
      width: ms(40),
      height: mvs(4),
      borderRadius: ms(2),
      backgroundColor: '#E2E8E8',
      marginBottom: mvs(14),
    },
    sheetHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: mvs(18),
    },
    sheetTitle: { fontSize: fs(19), fontWeight: '800', color: AppColors.textPrimary },
    sheetCloseBtn: {
      width: ms(28),
      height: ms(28),
      borderRadius: ms(14),
      backgroundColor: '#F0F3F3',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionLabel: {
      fontSize: fs(13.5),
      fontWeight: '700',
      color: AppColors.textPrimary,
      marginBottom: mvs(10),
    },
    optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: ms(8), marginBottom: mvs(20) },
    optionChip: {
      paddingHorizontal: ms(16),
      paddingVertical: mvs(9),
      borderRadius: ms(20),
      backgroundColor: '#F0F3F3',
    },
    optionChipActive: { backgroundColor: AppColors.primary },
    optionChipText: { fontSize: fs(13.5), fontWeight: '600', color: AppColors.textPrimary },
    optionChipTextActive: { color: AppColors.onPrimary },
    sheetDivider: { height: 1, backgroundColor: '#EEF2F2', marginBottom: mvs(18) },
    sheetFooterRow: { flexDirection: 'row', gap: ms(12) },
    resetBtn: {
      flex: 1,
      paddingVertical: mvs(13),
      borderRadius: ms(24),
      borderWidth: 1.5,
      borderColor: '#E2E8E8',
      alignItems: 'center',
      justifyContent: 'center',
    },
    resetBtnText: { fontSize: fs(15), fontWeight: '700', color: AppColors.textSecondary },
    applyBtn: {
      flex: 1,
      paddingVertical: mvs(13),
      borderRadius: ms(24),
      backgroundColor: '#D7DEDE',
      alignItems: 'center',
      justifyContent: 'center',
    },
    applyBtnActive: { backgroundColor: AppColors.primary },
    applyBtnText: { fontSize: fs(15), fontWeight: '700', color: '#8A9898' },
    applyBtnTextActive: { color: AppColors.onPrimary },
  });
}
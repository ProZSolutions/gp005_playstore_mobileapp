import { StyleSheet, Platform } from 'react-native';
import { AppColors } from '../../theme/theme';
const TEAL = AppColors.primary;
const TEAL_DARK = AppColors.primaryDark;
const ON_PRIMARY = AppColors.onPrimary;
const TEXT_PRIMARY = AppColors.textPrimary;
const TEXT_SECONDARY = AppColors.textSecondary;
const TEXT_TERTIARY = AppColors.textTertiary;
const BORDER = AppColors.border;
const SURFACE = AppColors.surface;
const BACKGROUND = AppColors.background;
const DANGER = AppColors.error;
const CHIP_BG = AppColors.surfaceVariant;
const SECTION_HEADER_BG = AppColors.primaryLight;
const RETURN_ACCENT = AppColors.chipDefectText;
const DISABLED_BG = AppColors.neutral300;
const DISABLED_TEXT = AppColors.onSurfaceDisabled;
 export default function createStyles(ms, mvs, fs) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: AppColors.background ?? '#F4F6F8' },

     headerWrap: {
      backgroundColor: TEAL,
      borderBottomLeftRadius: ms(20),
      borderBottomRightRadius: ms(20),
      paddingBottom: mvs(14),
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: ms(16),
      paddingTop: mvs(6),
    },
    manualTitle:{
      fontSize: 16, fontWeight: '700', color: AppColors.textPrimary ?? '#111827', marginBottom: 4 ,fontFamily:'Inter-Regular'
    },
    manualTitleLarge:{
      fontSize: 20, fontWeight: '700', color: AppColors.textPrimary ?? '#111827', marginBottom: 4 ,fontFamily:'Inter-Regular'
    },
    limit:{
       fontSize: 12, color: AppColors.textTertiary ?? '#9CA3AF', marginBottom: 12 ,fontFamily:'Inter-Regular'    },
        limitLarge:{
       fontSize: 15, color: AppColors.textTertiary ?? '#9CA3AF', marginBottom: 12 ,fontFamily:'Inter-Regular'    },
       btncancel:{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, backgroundColor: '#F1F5F9' },
       btncancellarge:{ flex: 1, paddingVertical: 16, alignItems: 'center', borderRadius: 10, backgroundColor: '#F1F5F9' },
       btnsubmitt:{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, backgroundColor: TEAL },
        btnsubmittlarge:{ flex: 1, paddingVertical: 16, alignItems: 'center', borderRadius: 10, backgroundColor: TEAL },

        btncantext:{ fontWeight: '600', color: AppColors.textSecondary ?? '#475569',fontFamily:'Inter-Regular',fontSize:12 },
        btncantextlarge:{ fontWeight: '600', color: AppColors.textSecondary ?? '#475569' ,fontFamily:'Inter-Regular',fontSize:17},
        btnsavetxt:{ fontWeight: '700', color: '#fff' ,fontFamily:'Inter-Regular',fontSize:12},
        btnsavetxtlarge:{ fontWeight: '700', color: '#fff' ,fontFamily:'Inter-Regular',fontSize:17},
        
        manbg:{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
         manbglng:{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 70 },

     headerTopRowLarge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: ms(16),
      paddingTop: mvs(45),
    },
    headerTopLeft: { flexDirection: 'row', alignItems: 'center' },
    backBtn: {
      width: ms(30),
      height: ms(30),
      borderRadius: ms(15),
      backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTopRight: { flexDirection: 'row', alignItems: 'center', gap: ms(10) },
    headerIconBadge: {
      width: ms(34),
      height: ms(34),
      borderRadius: ms(10),
      backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(10),
      paddingHorizontal: ms(16),
      marginTop: mvs(10),
    },
    screenTitle: { fontSize: fs(19), fontWeight: '700', color: AppColors.onPrimary,marginLeft:ms(5) },
    stepBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: ms(6) },
    stepDot: {
      width: ms(22),
      height: ms(22),
      borderRadius: ms(11),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.18)',
    },
    stepDotActive: { backgroundColor: AppColors.onPrimary },
    stepDotText: { fontSize: fs(12), fontWeight: '700', color: AppColors.onPrimary },
    stepDotTextActive: { color: TEAL },

    stepSubRow: {
      paddingHorizontal: ms(16),
      marginTop: mvs(2),
    },
    stepSubText: { fontSize: fs(12.5), color: 'rgba(255,255,255,0.85)', fontWeight: '500' },

    progressRow: {
      flexDirection: 'row',
      gap: ms(6),
      width:ms(100),
      paddingHorizontal: ms(16),
      marginTop: mvs(10),
    },
    progressSeg: {
      flex: 1,
      height: mvs(4),
      borderRadius: mvs(2),
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
    progressSegActive: { backgroundColor: AppColors.onPrimary },

    // ── Header summary card (Step 2 order/style recap) ────────────────
    summaryCard: {
      marginHorizontal: ms(16),
      marginTop: mvs(12),
       borderRadius: ms(14),
      padding: ms(14),
      gap: mvs(9),
    },
    summaryCardTitle: {
      fontSize: fs(11.5),
      fontWeight: '700',
      letterSpacing: 0.4,
      color: 'rgba(255,255,255,0.85)',
      marginBottom: mvs(2),
    },
    summaryRow: { flexDirection: 'row', alignItems: 'center', gap: ms(8) },
    summaryText: { fontSize: fs(13.5), color: AppColors.onPrimary, fontWeight: '600', flexShrink: 1 },

    // ── Body / cards ───────────────────────────────────────────────
    body: { flex: 1 },
    scrollContent: { padding: ms(16), paddingBottom: mvs(28), gap: mvs(14) },

    sectionCard: {
      backgroundColor: AppColors.surface ?? '#fff',
      borderRadius: ms(14),
      overflow: 'hidden',
      ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
        android: { elevation: 2 },
      }),
    },
    sectionCardN: {
      backgroundColor: SURFACE,
      borderRadius: ms(14),
      marginBottom: mvs(14), 
      borderWidth: 1,
      borderColor: BORDER,
      overflow: 'hidden',
      marginTop:mvs(2)
    },
     notesInputWrap: {
      margin: ms(14),
      marginTop: mvs(8),
      borderRadius: ms(10),
        minHeight: mvs(64),
      padding: ms(10),
    },
    notesInput: {
        fontSize: fs(13),
        color: TEXT_PRIMARY,
        textAlignVertical: 'top',
        minHeight: mvs(44),
        borderWidth: 0,
        paddingTop: 5,
        paddingLeft:5,
        paddingBottom: 5,
        minHeight:60,
      },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(8),
      paddingHorizontal: ms(14),
      paddingVertical: mvs(11),
      borderBottomWidth: 1,
      borderBottomColor: AppColors.divider ?? '#EEF1F4',
      backgroundColor: '#F8FAFC',
    },
    sectionHeaderText: {
      fontSize: fs(12.5),
      fontWeight: '700',
      letterSpacing: 0.4,
      color: AppColors.primaryDark ?? TEAL,
    },
    sectionBody: { paddingHorizontal: ms(14) },

    // ── Rows ───────────────────────────────────────────────────────
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: mvs(11),
      gap: ms(10),
    },
    detailRowBorder: { borderTopWidth: 1, borderTopColor: AppColors.divider ?? '#EEF1F4' },
    detailLabel: { fontSize: fs(13.5), color: AppColors.textSecondary ?? '#6B7280', flexShrink: 0 },
    detailValue: { fontSize: fs(14), color: AppColors.textPrimary ?? '#111827', fontWeight: '600', flexShrink: 1, textAlign: 'right' },
    detailValueItalic: { fontStyle: 'italic', color: AppColors.textTertiary ?? '#9CA3AF' },
    detailValueDanger: { color: AppColors.danger ?? '#DC2626' },

    selectableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: mvs(12),
    },
    selectableRight: { flexDirection: 'row', alignItems: 'center', gap: ms(6) },
    selectableValue: { fontSize: fs(14), color: AppColors.black ?? '#111827', fontWeight: '600' },
    selectablePlaceholder: { color: AppColors.textSecondary ?? '#9CA3AF', fontWeight: '500' },
    manualPill: {
      backgroundColor: '#F1F5F9',
      borderRadius: ms(8),
      paddingHorizontal: ms(8),
      paddingVertical: mvs(3),
      marginRight: ms(4),
    },
    manualPillText: { fontSize: fs(10.5), fontWeight: '700', color: AppColors.textTertiary ?? '#64748B' },

    // ── Result banner ──────────────────────────────────────────────
    resultBandRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: ms(14),
      paddingVertical: mvs(9),
      backgroundColor: '#F8FAFC',
      borderTopWidth: 1,
      borderTopColor: AppColors.divider ?? '#EEF1F4',
    },
    resultBandText: { fontSize: fs(12.5), fontWeight: '600', color: AppColors.textSecondary ?? '#475569' },

    resultBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: ms(8),
      marginHorizontal: ms(14),
      marginTop: mvs(12),
      marginBottom: mvs(14),
      paddingVertical: mvs(12),
      borderRadius: ms(10),
      borderWidth: 1,
    },
    resultBannerPass: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
    resultBannerFail: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
    resultBannerText: { fontSize: fs(14.5), fontWeight: '700' },
    resultBannerTextPass: { color: '#059669' },
    resultBannerTextFail: { color: '#DC2626' },

    // ── Footer ─────────────────────────────────────────────────────
    footer: {
      padding: ms(16),
      backgroundColor: AppColors.surface ?? '#fff',
      borderTopWidth: 1,
      borderTopColor: AppColors.divider ?? '#EEF1F4',
    },
    primaryBtn: {
      backgroundColor: TEAL,
      borderRadius: ms(14),
      paddingVertical: mvs(15),
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: ms(8),
    },
    primaryBtnDisabled: { backgroundColor: '#B9C4CC' },
    primaryBtnText: { fontSize: fs(16), fontWeight: '700', color: AppColors.onPrimary },
  });
}
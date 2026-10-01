import { StyleSheet, Platform } from 'react-native';
import { AppColors } from '../../theme/theme';

const TEAL = AppColors.primary;
const ON_PRIMARY = AppColors.onPrimary;
const TEXT_PRIMARY = AppColors.textPrimary;
const TEXT_TERTIARY = AppColors.textTertiary;
const BORDER = AppColors.border;
const SURFACE = AppColors.surface;

 export const RESULT_COLORS = {
  pass: { bg: '#16A34A', text: '#FFFFFF' },
  rework: { bg: '#F5A623', text: '#FFFFFF' },
  reject: { bg: '#DC2626', text: '#FFFFFF' },
};

// isLargeScreen defaults to false so any other caller that hasn't been
// updated to pass it still gets the original mobile (2-per-row) behavior.
export default function createStyles(ms, mvs, fs, isLargeScreen = false) {
  return StyleSheet.create({ 
    root: { flex: 1, backgroundColor: SURFACE },
 
    headerWrap: {
      backgroundColor: TEAL,
      borderBottomLeftRadius: ms(18),
      borderBottomRightRadius: ms(18),
      paddingBottom: mvs(14),
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: isLargeScreen ? ms(28) : ms(16),
      paddingTop: mvs(6),
    },
    headerTopLeft: { flexDirection: 'row', alignItems: 'center', gap: ms(8) },
    backBtn: {
      width: ms(30),
      height: ms(30),
      borderRadius: ms(15),
      backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dotsBtn: {
      width: ms(30),
      height: ms(30),
      borderRadius: ms(15),
      backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleText: {
      fontSize: isLargeScreen ? fs(22) : fs(19),
      fontWeight: '700',
      color: ON_PRIMARY,
      paddingHorizontal: isLargeScreen ? ms(28) : ms(16),
      marginTop: mvs(8),
    },
    metaWrap: {
      paddingHorizontal: isLargeScreen ? ms(28) : ms(16),
      marginTop: mvs(8),
      gap: mvs(6),
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    metaIcon: { marginRight: ms(6) },
    metaText: { fontSize: isLargeScreen ? fs(14.5) : fs(13), color: ON_PRIMARY, fontWeight: '600' },
    metaDot: { fontSize: fs(13), color: 'rgba(255,255,255,0.6)', marginHorizontal: ms(6) },

    body: { flex: 1, backgroundColor: SURFACE },
    // Extra outer padding on large screens so the cards/grid don't sit
    // flush against a wide screen's edges.
    scrollContent: {
      padding: isLargeScreen ? ms(28) : ms(16),
      paddingBottom: isLargeScreen ? mvs(32) : mvs(24),
      gap: mvs(14),
    },

    sectionCard: {
      backgroundColor: SURFACE,
      borderRadius: ms(14),
      overflow: 'hidden',
      ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
        android: { elevation: 2 },
      }),
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(8),
      paddingHorizontal: isLargeScreen ? ms(18) : ms(14),
      paddingVertical: mvs(11),
      borderBottomWidth: 1,
      borderBottomColor: AppColors.divider ?? '#EEF1F4',
      backgroundColor: '#F8FAFC',
    },
    sectionHeaderText: {
      fontSize: isLargeScreen ? fs(14) : fs(12.5),
      fontWeight: '700',
      letterSpacing: 0.4,
      color: AppColors.primaryDark ?? TEAL,
    },
    sectionBody: { padding: isLargeScreen ? ms(16) : ms(12) },

     grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: isLargeScreen ? -ms(7) : -ms(5),
    },
    // 4-per-row on large screens (25% width) vs 2-per-row on mobile (50%).
    chipCol: {
      width: isLargeScreen ? '25%' : '50%',
      paddingHorizontal: isLargeScreen ? ms(7) : ms(5),
      marginBottom: mvs(10),
    },
    chip: {
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: ms(12),
      paddingVertical: isLargeScreen ? mvs(20) : mvs(16),
      paddingHorizontal: ms(10),
      backgroundColor: SURFACE,
      alignItems: 'center',
    },
    chipActive: {
      backgroundColor: TEAL,
      borderColor: TEAL,
    },
    chipLabelPill: {
      backgroundColor: AppColors.primaryLight ?? '#0D939D1A',
      borderRadius: ms(8),
      paddingHorizontal: ms(12),
      paddingVertical: mvs(6),
      marginBottom: mvs(12),
    },
    chipLabelPillActive: { backgroundColor: 'rgba(255,255,255,0.22)' },
    chipLabelText: { fontSize: isLargeScreen ? fs(16) : fs(14.5), fontWeight: '700', color: AppColors.primaryDark ?? TEAL },
    chipLabelTextActive: { color: ON_PRIMARY },

    chipMetaCol: { alignItems: 'center' },
    chipMetaText: { fontSize: isLargeScreen ? fs(14) : fs(13), color: TEXT_TERTIARY, fontWeight: '500', textAlign: 'center', marginTop: mvs(2) },
    chipMetaTextActive: { color: 'rgba(255,255,255,0.9)' },

     footer: {
      flexDirection: 'row',
      gap: ms(10),
      padding: isLargeScreen ? ms(24) : ms(16),
      backgroundColor: SURFACE,
      borderTopWidth: 1,
      borderTopColor: AppColors.divider ?? '#EEF1F4',
    },
    resultBtn: {
      flex: 1,
      borderRadius: ms(12),
      paddingVertical: isLargeScreen ? mvs(18) : mvs(14),
      flexDirection:'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    resultBtnDisabled: { opacity: 0.4 },
    resultBtnText: { fontSize: isLargeScreen ? fs(16) : fs(14.5), fontWeight: '700',paddingLeft:ms(3) },
  });
}
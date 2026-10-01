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
const SECTION_HEADER_BG = AppColors.primaryLight;
const DISABLED_BG = AppColors.neutral300;
const DISABLED_TEXT = AppColors.onSurfaceDisabled;

  
const PASS_COLOR = AppColors.success ?? '#16A34A';
const PASS_BG = AppColors.successLight ?? '#E8F5E9';
const FAIL_COLOR = AppColors.error;
const FAIL_BG = AppColors.errrLight ?? '#FEE2E2';
const REJECT_COLOR = AppColors.errrLight;
const REJECT_BG = AppColors.surfaceVariant ?? '#F1F5F5';
const Main_Reject = AppColors.erNewLight??AppColors.errrLight;
const ACTION_REJECT_COLOR = AppColors.err ?? '#16A34A';
const ACTION_REJECT_BG = AppColors.erNewLight ?? '#E8F5E9';
const ACTION_BULK_COLOR = AppColors.warning ?? '#F59E0B';
const ACTION_BULK_BG = AppColors.warningLight ?? '#FFF3E0';
const TextCLR = AppColors.white;

export default function createStyles(ms, mvs, fs) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: BACKGROUND,
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
    headerWrap: {
      backgroundColor: TEAL,
      paddingBottom: mvs(16),
      borderBottomLeftRadius: ms(20),
      borderBottomRightRadius: ms(20),
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: ms(16),
      marginTop: mvs(6),
    },
    headerTopLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
    },
    backBtn: {
      width: ms(30),
      height: ms(30),
      borderRadius: ms(15),
      backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: ms(10),
    },
    orderIdText: {
      color: ON_PRIMARY,
      fontSize: fs(15.5),
      fontWeight: '700',
      flexShrink: 1,
    },

    // Severity pill, top-right of the header (e.g. "Red (Major)").
    severityPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: ms(10),
      paddingVertical: mvs(5),
      borderRadius: ms(12),
      marginLeft: ms(8),
    },
    severityPillText: {
      fontSize: fs(11.5),
      fontWeight: '700',
      marginLeft: ms(4),
    },

    titleText: {
      color: ON_PRIMARY,
      fontSize: fs(20),
      fontWeight: '800',
      paddingHorizontal: ms(16),
      marginTop: mvs(8),
    },

    metaWrap: {
      paddingHorizontal: ms(16),
      marginTop: mvs(12),
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: mvs(6),
    },
    metaIcon: {
      marginRight: ms(8),
      opacity: 0.9,
    },
    metaText: {
      color: 'rgba(255,255,255,0.92)',
      fontSize: fs(12.5),
      fontWeight: '500',
    },
    metaDot: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: fs(12),
      marginHorizontal: ms(6),
    },

    body: {
      flex: 1,
    },
    scrollContent: {
      padding: ms(16),
      paddingBottom: mvs(24),
    },

    sectionCard: {
      backgroundColor: SURFACE,
      borderRadius: ms(14),
      marginBottom: mvs(14),
      borderWidth: 1,
      borderColor: BORDER,
      overflow: 'hidden',
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: ms(14),
      paddingVertical: mvs(12),
      backgroundColor: SECTION_HEADER_BG,
    },
    sectionHeaderText: {
      marginLeft: ms(8),
      fontSize: fs(12),
      fontWeight: '700',
      letterSpacing: 0.4,
      color: TEAL_DARK,
    },
    requiredDot: {
      color: DANGER,
      fontSize: fs(12),
      marginLeft: ms(3),
    },
    sectionBody: {
      paddingHorizontal: ms(14),
      paddingBottom: mvs(6),
    },

    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: mvs(11),
    },
    detailRowBorder: {
      borderTopWidth: 1,
      borderTopColor: BORDER,
    },
    detailLabel: {
      fontSize: fs(13),
      color: TEXT_SECONDARY,
      fontWeight: '500',
    },
    detailValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    detailValue: {
      fontSize: fs(13.5),
      color: TEXT_PRIMARY,
      fontWeight: '700',
    },
    detailValuePlaceholder: {
      color: TEXT_TERTIARY,
      fontWeight: '500',
      fontStyle: 'italic',
    },
    detailChevron: {
      marginLeft: ms(4),
    },

    // Live elapsed-time row (red dot + red mm:ss text).
    liveValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    liveDot: {
      width: ms(7),
      height: ms(7),
      borderRadius: ms(3.5),
      backgroundColor: DANGER,
      marginRight: ms(5),
    },
    liveValueText: {
      fontSize: fs(13.5),
      fontWeight: '700',
      color: DANGER,
    },

    // --- Pass / Fail / Reject verdict selector ---------------------------
    verdictWrap: {
      marginBottom: mvs(14),
    },
    verdictRow: {
      flexDirection: 'row',
      gap: ms(10),
    },
    verdictCard: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: mvs(14),
      borderRadius: ms(16),
      borderWidth: 1.5,
      borderColor: 'transparent',
      backgroundColor: SURFACE,
    },
    verdictCardActivePass: { borderColor: PASS_COLOR, backgroundColor: PASS_BG },
    verdictCardActiveFail: { borderColor: FAIL_COLOR, backgroundColor: FAIL_BG },
    verdictCardActiveReject: { borderColor: REJECT_COLOR, backgroundColor: Main_Reject },
     verdictIconWrap: {
      width: ms(40),
      height: ms(40),
      borderRadius: ms(20),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: mvs(8),
    },
     verdictIconWrapPass: { backgroundColor: PASS_BG },
    verdictIconWrapFail: { backgroundColor: FAIL_BG },
    verdictIconWrapReject: { backgroundColor: REJECT_COLOR },
     verdictIconWrapActivePass: { backgroundColor: PASS_COLOR },
    verdictIconWrapActiveFail: { backgroundColor: FAIL_COLOR },
    verdictIconWrapActiveReject: { backgroundColor: AppColors.rejectLight },

    verdictLabel: {
      fontSize: fs(13.5),
      fontWeight: '700',
      color: TEXT_SECONDARY,
    },
    verdictLabelActivePass: { color: PASS_COLOR },
    verdictLabelActiveFail: { color: FAIL_COLOR },
    verdictLabelActiveReject: { color: AppColors.white },

     escalateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: mvs(4),
    },
    escalateLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    escalateIconWrap: {
      width: ms(30),
      height: ms(30),
      borderRadius: ms(15),
      backgroundColor: AppColors.secondaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: ms(10),
    },
    escalateLabel: {
      fontSize: fs(14),
      fontWeight: '700',
      color: TEXT_PRIMARY,
    },

    // --- Confirm Reject / Move to Bulk action selector (Rejection Tracker) -
    actionWrap: {
      marginBottom: mvs(14),
    },
    actionRow: {
      flexDirection: 'row',
      gap: ms(10),
    },
    actionCard: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: mvs(16),
      borderRadius: ms(14),
      borderWidth: 1.5,
      borderColor: BORDER,
      backgroundColor: SURFACE,
    },
    actionCardActiveReject: {
      borderColor: REJECT_COLOR, backgroundColor: Main_Reject
    },
    actionCardActiveBulk: {
      borderColor: ACTION_BULK_COLOR,
      backgroundColor: ACTION_BULK_BG,
    },

    actionIconWrap: {
      width: ms(36),
      height: ms(36),
      borderRadius: ms(18),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: mvs(8),
    },
    // Inactive state — light tint circle, icon coloured (see actionIconColor* below).
    actionIconWrapReject: { backgroundColor: REJECT_COLOR },
    actionIconWrapBulk: { backgroundColor: ACTION_BULK_BG },
    // Active state — solid fill circle, icon goes white (see ActionSelector).
    actionIconWrapActiveReject: { backgroundColor: AppColors.rejectLight },
    actionIconWrapActiveBulk: { backgroundColor: ACTION_BULK_COLOR },

    actionLabel: {
      fontSize: fs(13.5),
      fontWeight: '700',
      color: TEXT_PRIMARY,
    },
    actionLabelActiveReject: { color: TextCLR },
    actionLabelActiveBulk: { color: ACTION_BULK_COLOR },

    // --- Notes (Rejection Tracker) ------------------------------------------
    notesWrap: {
      marginBottom: mvs(20),
    },
    notesLabel: {
      fontSize: fs(12),
      fontWeight: '700',
      letterSpacing: 0.4,
      color: TEXT_SECONDARY,
      marginBottom: mvs(8),
    },
    notesInput: {
      backgroundColor: SURFACE,
      borderRadius: ms(14),
      borderWidth: 1,
      borderColor: BORDER,
      paddingHorizontal: ms(14),
      paddingVertical: mvs(12),
      fontSize: fs(13.5),
      color: TEXT_PRIMARY,
      minHeight: mvs(90),
      textAlignVertical: 'top',
    },

    footer: {
      paddingHorizontal: ms(16),
      paddingTop: mvs(10),
      paddingBottom: mvs(Platform.OS === 'ios' ? 20 : 14),
      backgroundColor: BACKGROUND,
      borderTopWidth: 1,
      borderTopColor: BORDER,
    },
    submitBtn: {
      backgroundColor: TEAL,
      borderRadius: ms(26),
      paddingVertical: mvs(14),
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitBtnDisabled: {
      backgroundColor: DISABLED_BG,
    },
    submitBtnText: {
      color: ON_PRIMARY,
      fontSize: fs(15),
      fontWeight: '700',
    },
    submitBtnTextDisabled: {
      color: DISABLED_TEXT,
    },

    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: ms(24),
    },
    emptyText: {
      marginTop: mvs(8),
      fontSize: fs(13),
      color: TEXT_TERTIARY,
      textAlign: 'center',
    },
    emptyBtn: {
      marginTop: mvs(16),
      paddingHorizontal: ms(20),
      paddingVertical: mvs(10),
      backgroundColor: TEAL,
      borderRadius: ms(8),
    },
    emptyBtnText: {
      color: ON_PRIMARY,
      fontWeight: '600',
      fontSize: fs(13.5),
    },
  });
}
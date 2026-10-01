import { StyleSheet, Platform } from 'react-native';
import { AppColors } from '../../theme/theme';

const ON_PRIMARY = AppColors.onPrimary;
const TEXT_PRIMARY = AppColors.textPrimary;
const TEXT_SECONDARY = AppColors.textSecondary;
const TEXT_TERTIARY = AppColors.textTertiary;
const BORDER = AppColors.border;
const SURFACE = AppColors.surface;
const CHIP_BG = AppColors.surfaceVariant;
const TEAL_DARK = AppColors.primaryDark;
const DISABLED_BG = AppColors.neutral300;
const DISABLED_TEXT = AppColors.onSurfaceDisabled;

export default function createStyles(ms, mvs, fs) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: AppColors.scrim,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: SURFACE,
      borderTopLeftRadius: ms(22),
      borderTopRightRadius: ms(22),
      // FIX: was `maxHeight: '85%'`. On Android, Yoga needs a determinate
      // size somewhere in the flex chain — with only maxHeight and no
      // height, scrollArea's flex:1 below could resolve to 0 and collapse
      // the grid entirely. `height` fixes the sheet at a real size so the
      // ScrollView correctly gets the remaining space.
      height: '85%',
      paddingBottom: mvs(Platform.OS === 'ios' ? 20 : 14),
      flexDirection: 'column',
    },
    // Fills the sheet so KeyboardAvoidingView participates in the same
    // flex column (handle -> header -> scrollArea -> footer). Without this,
    // KeyboardAvoidingView defaults to its own sizing and can squeeze or
    // hide the footer instead of shrinking scrollArea first.
    keyboardWrap: {
      flex: 1,
      flexDirection: 'column',
    },
    scrollArea: {
      flex: 1,
      minHeight: 0, // required on Android alongside flex:1 to let it shrink instead of overflow
    },
    // FIX: give the ScrollView component itself flex:1, not just its
    // parent View. Some Android RN versions won't propagate the parent's
    // resolved height down to the ScrollView without this.
    scrollView: {
      flex: 1,
    },
    handleWrap: {
      alignItems: 'center',
      paddingTop: mvs(10),
      paddingBottom: mvs(4),
    },
    handle: {
      width: ms(38),
      height: mvs(4),
      borderRadius: ms(2),
      backgroundColor: BORDER,
    },

    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: ms(18),
      paddingTop: mvs(6),
    },
    headerTextWrap: {
      flexShrink: 1,
    },
    title: {
      fontSize: fs(20),
      fontWeight: '800',
      color: TEXT_PRIMARY,
    },
    subtitle: {
      fontSize: fs(14),
      color: TEXT_TERTIARY,
      marginTop: mvs(3),
    },
    closeBtn: {
      width: ms(32),
      height: ms(32),
      borderRadius: ms(16),
      backgroundColor: CHIP_BG,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: ms(10),
    },

    balanceLabelWrap: {
      marginHorizontal: ms(18),
      marginTop: mvs(12),
      backgroundColor: AppColors.primaryLight,
      borderRadius: ms(10),
      paddingVertical: mvs(9),
      paddingHorizontal: ms(12),
    },
    balanceLabelText: {
      fontSize: fs(14),
      fontWeight: '700',
      color: TEAL_DARK,
    },

    scrollContent: {
      paddingHorizontal: ms(14),
      paddingTop: mvs(14),
      paddingBottom: mvs(12),
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -ms(5),
    },
    chipCol: {
      width: '50%',
      paddingHorizontal: ms(5),
      marginBottom: mvs(12),
    },
    chip: {
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: ms(12),
      padding: ms(10),
      backgroundColor: SURFACE,
    },
    chipDisabled: {
      backgroundColor: CHIP_BG,
      borderColor: CHIP_BG,
    },

    chipTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: mvs(10),
    },
    chipLabelPill: {
      backgroundColor: AppColors.primaryLight,
      borderRadius: ms(6),
      paddingHorizontal: ms(8),
      paddingVertical: mvs(3),
    },
    chipLabelText: {
      fontSize: fs(14),
      fontWeight: '700',
      color: TEAL_DARK,
    },
    chipBalText: {
      fontSize: fs(13.5),
      color: TEXT_TERTIARY,
      fontWeight: '500',
    },

    stepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    stepperBtn: {
      width: ms(38),
      height: ms(38),
      borderRadius: ms(9),
      borderWidth: 1,
      borderColor: BORDER,
      backgroundColor: CHIP_BG,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperBtnDisabled: {
      opacity: 0.45,
    },
    stepperValueWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: ms(6),
    },
    stepperValueInput: {
      minWidth: ms(34),
      textAlign: 'center',
      fontSize: fs(18),
      fontWeight: '700',
      color: TEXT_PRIMARY,
      paddingVertical: 0,
    },
    stepperValueInputDisabled: {
      color: DISABLED_TEXT,
    },

    footer: {
      backgroundColor: AppColors.surface,
      borderTopWidth: 1,
      borderTopColor: AppColors.border,
      paddingHorizontal: ms(18),
      paddingTop: mvs(10),
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: mvs(12),
    },
    totalLabel: {
      fontSize: fs(13.5),
      fontWeight: '700',
      letterSpacing: 0.4,
      color: TEXT_SECONDARY,
    },
    totalValue: {
      fontSize: fs(20),
      fontWeight: '800',
      color: TEXT_PRIMARY,
    },

    // Apply button — mirrors the Submit button pattern used on
    // InputManagementScreen (styles.submitBtn / submitBtnDisabled /
    // submitBtnText / submitBtnTextDisabled) so enabled/disabled behavior
    // and visuals are consistent across the two screens.
    applyBtn: {
      backgroundColor: AppColors.primary,
      borderRadius: ms(26),
      paddingVertical: mvs(14),
      alignItems: 'center',
      justifyContent: 'center',
    },
    applyBtnDisabled: {
      backgroundColor: DISABLED_BG,
    },
    applyBtnText: {
      color: ON_PRIMARY,
      fontSize: fs(15),
      fontWeight: '700',
    },
    applyBtnTextDisabled: {
      color: DISABLED_TEXT,
    },
  });
}
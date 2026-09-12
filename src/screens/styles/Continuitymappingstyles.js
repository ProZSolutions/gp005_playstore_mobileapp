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
const NEWSURFACE = AppColors.onSurface;
const SECTION_HEADER_BG = AppColors.primaryLight;
const DISABLED_BG = AppColors.neutral300;
const DISABLED_TEXT = AppColors.onSurfaceDisabled;
const SUCCESS = AppColors.success ?? '#16A34A';
const SUCCESS_BG = AppColors.successLight ?? '#ECFDF5';

export default function createStyles(ms, mvs, fs, isLargeScreen) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: BACKGROUND,
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
      paddingHorizontal: ms(16),
      marginTop: mvs(6),
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
    titleText: {
      color: ON_PRIMARY,
      fontSize: fs(18),
      fontWeight: '800',
      letterSpacing: 0.3,
    },

    body: {
      flex: 1,
    },
    scrollContent: {
      padding: ms(16),
      paddingBottom: mvs(24),
    },

    // On tablets the From/To sections sit side by side (as in the web
    // reference); on phones they stack vertically.
    sectionsRow: {
      flexDirection: isLargeScreen ? 'row' : 'column',
      alignItems: isLargeScreen ? 'flex-start' : 'stretch',
      gap: isLargeScreen ? ms(16) : 0,
    },
    sectionColumn: {
      flex: isLargeScreen ? 1 : undefined,
    },

    sectionCard: {
      backgroundColor: SURFACE,
      borderRadius: ms(14),
      marginBottom: mvs(14),
      borderWidth: 1,
      borderColor: BORDER,
      overflow: 'hidden',
    },
    sectionCardDisabled: {
      opacity: 0.55,
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
    sectionHeaderTextDisabled: {
      color: TEXT_TERTIARY,
    },
    requiredDot: {
      color: AppColors.error,
      fontSize: fs(12),
      marginLeft: ms(3),
    },
    sectionBody: {
      paddingHorizontal: ms(12),
      paddingTop: mvs(12),
      paddingBottom: mvs(4),
    },

    // ---- Chip-style info rows (icon badge + label/value stack) ----
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: BACKGROUND,
      borderRadius: ms(12),
      paddingVertical: mvs(10),
      paddingHorizontal: ms(12),
      marginBottom: mvs(10),
    },
    infoRowDisabled: {
       
    },
    iconBadge: {
      width: ms(34),
      height: ms(34),
      borderRadius: ms(17),
      borderWidth: 1.5,
      borderColor: TEAL,
      backgroundColor: SURFACE,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: ms(12),
    },
    iconBadgeDisabled: {
      borderColor: BORDER,
      backgroundColor: BACKGROUND,
    },
    infoTextCol: {
      flex: 1,
    },
    infoLabel: {
      fontSize: fs(11.5),
      color: TEXT_TERTIARY,
      fontWeight: '600',
      marginBottom: mvs(2),
    },
    infoLabelDisabled: {
      color: TEXT_TERTIARY,
    },
    infoValue: {
      fontSize: fs(14),
      color: TEXT_PRIMARY,
      fontWeight: '700',
    },
    infoValuePlaceholder: {
      color: TEXT_TERTIARY,
      fontWeight: '500',
      fontStyle: 'italic',
    },
    infoValueDisabled: {
      color: TEXT_TERTIARY,
    },
    infoRight: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: ms(6),
    },

    // Small "read-only, copied from From Order" indicator shown on the
    // Line/Style rows in the To Order section after Process.
    autoSyncBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: SUCCESS_BG,
      borderRadius: ms(20),
      paddingHorizontal: ms(8),
      paddingVertical: mvs(3),
      marginRight: ms(4),
    },
    autoSyncIcon: {
      marginRight: ms(4),
    },
    autoSyncText: {
      color: SUCCESS,
      fontSize: fs(10.5),
      fontWeight: '700',
    },

    // Divider with an arrow icon between From Order and To Order on phones.
    flowDivider: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: mvs(4),
    },
    flowDividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: BORDER,
    },
    flowDividerIconWrap: {
      width: ms(30),
      height: ms(30),
      borderRadius: ms(15),
      backgroundColor: SECTION_HEADER_BG,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: ms(8),
    },

    footer: {
      flexDirection: 'row',
      gap: ms(12),
      paddingHorizontal: ms(16),
      paddingTop: mvs(10),
      paddingBottom: mvs(Platform.OS === 'ios' ? 20 : 14),
      backgroundColor: BACKGROUND,
      borderTopWidth: 1,
      borderTopColor: BORDER,
    },
    cancelBtn: {
      flex: 1,
      borderRadius: ms(26),
      paddingVertical: mvs(14),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: BORDER,
      backgroundColor: SURFACE,
    },
    cancelBtnText: {
      color: TEXT_SECONDARY,
      fontSize: fs(15),
      fontWeight: '700',
    },
    submitBtn: {
      flex: 1,
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
  });
}
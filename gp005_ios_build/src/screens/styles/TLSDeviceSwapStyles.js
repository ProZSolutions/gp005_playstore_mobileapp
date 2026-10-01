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
const SECTION_HEADER_BG = AppColors.primaryLight;
const DISABLED_BG = AppColors.neutral300;
const DISABLED_TEXT = AppColors.onSurfaceDisabled;
const CURRENT_BG = AppColors.error ?? '#DC2626';
const NEW_BG = AppColors.success ?? '#16A34A';
const NEW_BG_LIGHT = AppColors.successLight ?? '#ECFDF5';

export default function createStyles(ms, mvs, fs) {
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

    // ---- Stepper ----
    stepperWrap: {
      paddingHorizontal: ms(16),
      marginTop: mvs(12),
    },
    stepperLabel: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: fs(12.5),
      fontWeight: '600',
      marginBottom: mvs(8),
    },
    stepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    stepDot: {
      width: ms(22),
      height: ms(22),
      borderRadius: ms(11),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.18)',
    },
    stepDotActive: {
      backgroundColor: ON_PRIMARY,
    },
    stepDotDone: {
      backgroundColor: 'rgba(255,255,255,0.55)',
    },
    stepDotText: {
      fontSize: fs(11),
      fontWeight: '700',
      color: ON_PRIMARY,
    },
    stepDotTextActive: {
      color: TEAL_DARK,
    },
    stepConnector: {
      flex: 1,
      height: 2,
      backgroundColor: 'rgba(255,255,255,0.25)',
      marginHorizontal: ms(6),
    },
    stepConnectorDone: {
      backgroundColor: 'rgba(255,255,255,0.7)',
    },

    body: {
      flex: 1,
    },
    scrollContent: {
      padding: ms(16),
      paddingBottom: mvs(24),
    },

    // ---- Scan card ----
    scanCard: {
      backgroundColor: SURFACE,
      borderRadius: ms(16),
      borderWidth: 1,
      borderColor: BORDER,
      overflow: 'hidden',
      marginBottom: mvs(14),
    },
    scanCardHeader: {
      paddingHorizontal: ms(14),
      paddingVertical: mvs(10),
      backgroundColor: SECTION_HEADER_BG,
    },
    scanCardHeaderText: {
      fontSize: fs(12),
      fontWeight: '700',
      letterSpacing: 0.4,
      color: TEAL_DARK,
    },
    scannerFrame: {
      height: mvs(320),
      backgroundColor: '#111827',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    scannerOverlayText: {
      position: 'absolute',
      bottom: mvs(14),
      left: 0,
      right: 0,
      textAlign: 'center',
      color: '#F3F4F6',
      fontSize: fs(12.5),
      fontWeight: '600',
    },
    scannedResultWrap: {
      height: mvs(320),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: NEW_BG_LIGHT,
      paddingHorizontal: ms(20),
    },
    scannedCheckCircle: {
      width: ms(56),
      height: ms(56),
      borderRadius: ms(28),
      backgroundColor: NEW_BG,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: mvs(12),
    },
    scannedResultTitle: {
      fontSize: fs(15),
      fontWeight: '700',
      color: TEXT_PRIMARY,
      marginBottom: mvs(4),
      textAlign: 'center',
    },
    scannedResultCode: {
      fontSize: fs(12.5),
      color: TEXT_SECONDARY,
      textAlign: 'center',
    },
    scanCardFooter: {
      flexDirection: 'row',
      gap: ms(10),
      padding: ms(14),
    },
    retryBtn: {
      flex: 1,
      borderRadius: ms(24),
      paddingVertical: mvs(13),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: BORDER,
      backgroundColor: BACKGROUND,
    },
    retryBtnText: {
      color: TEXT_SECONDARY,
      fontSize: fs(14),
      fontWeight: '700',
    },

    primaryBtn: {
      flex: 1,
      backgroundColor: TEAL,
      borderRadius: ms(24),
      paddingVertical: mvs(13),
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnFull: {
      flex: undefined,
      width: '100%',
    },
    primaryBtnDisabled: {
      backgroundColor: DISABLED_BG,
    },
    primaryBtnText: {
      color: ON_PRIMARY,
      fontSize: fs(14.5),
      fontWeight: '700',
    },
    primaryBtnTextDisabled: {
      color: DISABLED_TEXT,
    },

    // ---- Review (step 3) device cards ----
    deviceCard: {
      backgroundColor: SURFACE,
      borderRadius: ms(14),
      borderWidth: 1,
      borderColor: BORDER,
      overflow: 'hidden',
      marginBottom: mvs(14),
    },
    deviceCardSectionLabel: {
      fontSize: fs(11.5),
      fontWeight: '700',
      letterSpacing: 0.4,
      color: TEXT_TERTIARY,
      marginBottom: mvs(6),
      marginLeft: ms(2),
    },
    deviceBanner: {
      paddingVertical: mvs(10),
      alignItems: 'center',
      justifyContent: 'center',
    },
    deviceBannerCurrent: {
      backgroundColor: CURRENT_BG,
    },
    deviceBannerNew: {
      backgroundColor: NEW_BG,
    },
    deviceBannerText: {
      color: ON_PRIMARY,
      fontSize: fs(14),
      fontWeight: '800',
    },
    deviceLineWrap: {
      paddingVertical: mvs(10),
    },
    deviceLine: {
      textAlign: 'center',
      fontSize: fs(13),
      color: TEXT_PRIMARY,
      fontWeight: '600',
      paddingVertical: mvs(6),
      borderBottomWidth: 1,
      borderBottomColor: BORDER,
    },
    deviceLineLast: {
      borderBottomWidth: 0,
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
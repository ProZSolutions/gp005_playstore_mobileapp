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
      fontSize: fs(15),fontFamily:'Inter-Regular',
      fontWeight: '700',
      flexShrink: 1,
    },
    dotsBtn: {
      width: ms(30),
      height: ms(30),
      borderRadius: ms(15),
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Small status badge shown in the header row (e.g. top defect summary
    // on OperationDetailsScreen). Pinned to the right via the
    // space-between on headerTopRow.
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: DANGER,
      borderRadius: ms(20),
      paddingHorizontal: ms(10),
      paddingVertical: mvs(4),
      marginLeft: 'auto',
      maxWidth: '55%',
    },
    badgeIcon: {
      marginRight: ms(4),
    },
    badgeText: {
      color: ON_PRIMARY,
      fontSize: fs(10.5),fontFamily:'Inter-Regular',
      fontWeight: '700',
      flexShrink: 1,
    },

    titleText: {
      color: ON_PRIMARY,
      fontSize: fs(20),fontFamily:'Inter-Regular',
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
      fontSize: fs(12.5),fontFamily:'Inter-Regular',
      fontWeight: '500',
    },
    metaDot: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: fs(12),fontFamily:'Inter-Regular',
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
    notesLabel: {
      fontSize: fs(12),fontFamily:'Inter-Regular',
      fontWeight: '700',
      letterSpacing: 0.4,
      color: TEXT_SECONDARY,
      paddingHorizontal: ms(14),
      paddingTop: mvs(12),
    },
    notesInputWrap: {
      margin: ms(14),
      marginTop: mvs(8),
      borderRadius: ms(10),
      borderWidth: 1,
      borderColor: BORDER,
      minHeight: mvs(64),
      padding: ms(10),
    },
    // Dimmed variant for sections that are conditionally inactive, e.g.
    // Operator & Operation Details while Auto Assign is on.
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
      fontSize: fs(12),fontFamily:'Inter-Regular',
      fontWeight: '700',
      letterSpacing: 0.4,
      color: TEAL_DARK,
    },
    sectionHeaderTextDisabled: {
      color: TEXT_TERTIARY,
    },
    requiredDot: {
      color: DANGER,
      fontSize: fs(12),fontFamily:'Inter-Regular',
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
      paddingVertical: mvs(12),
    },
    detailRowBorder: {
      borderTopWidth: 1,
      borderTopColor: BORDER,
    },
    detailLabel: {
      fontSize: fs(13.5),fontFamily:'Inter-Bold',
      color: TEXT_SECONDARY,
       flexShrink: 0,  
      fontWeight: '600',
      marginRight: ms(10),
    },
    detailLabelDisabled: {
      color: TEXT_TERTIARY,
      fontSize: fs(12.5),fontFamily:'Inter-Regular',
    },
    detailValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      
       flex: 1,  
        justifyContent: 'flex-end',
         overflow: 'visible',
    },
    detailValue: {
      marginTop:2,      
      fontSize: fs(14.5),fontFamily:'Inter-Regular',
       color: TEXT_PRIMARY,
      fontWeight: '600',
       flexShrink: 1,  
    },
    detailValueAccent: {
      color: TEAL_DARK,
    },
    detailValuePlaceholder: {
      color: TEXT_TERTIARY,
       paddingRight: ms(4),
      fontWeight: '500',
       fontSize: fs(12.5)
       ,fontFamily:'Inter-Regular',
       
    },
    detailValueDisabled: {
      color: TEXT_TERTIARY,
       fontSize: fs(12.5),fontFamily:'Inter-Regular',
    },
    detailChevron: {
      marginLeft: ms(4),
    },

     enterQtyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: mvs(10),
    },
    enterQtyLabel: {
      fontSize: fs(13.5),fontFamily:'Inter-Regular',
      color: TEXT_SECONDARY,
      fontWeight: '400',
    },
    enterQtyRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    enterQtyValue: {
      fontSize: fs(13),fontFamily:'Inter-Regular',
      color: AppColors.black,
      marginRight: ms(4),
      fontWeight: '500',
    },
    sizeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingBottom: mvs(12),
      marginHorizontal: -ms(3),
    },
    sizeChip: {
      width: '25%',
      paddingHorizontal: ms(3),
      marginBottom: mvs(8),
    },
    sizeChipInner: {
      backgroundColor: CHIP_BG,
      borderRadius: ms(8),
      paddingVertical: mvs(8),
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection:'row'
    },
    sizeChipText: {
      fontSize: fs(11.5),fontFamily:'Inter-Regular',
      color: TEXT_PRIMARY,
      fontWeight: '600',
    },
     sizeChipQty: {
      fontSize: fs(11.5),fontFamily:'Inter-Regular',
      color: TEXT_SECONDARY,
      fontWeight: '600',
    },

    // Switch rows — used by ReworkDetailsScreen's "Assign Operator" card.
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: mvs(10),
    },
    switchRowBorder: {
      borderTopWidth: 1,
      borderTopColor: BORDER,
    },

     notesLabel: {
      fontSize: fs(12),fontFamily:'Inter-Regular',
      fontWeight: '700',
      letterSpacing: 0.4,
      color: TEXT_SECONDARY,
      paddingHorizontal: ms(14),
      paddingTop: mvs(12),
    },
    notesInputWrap: {
      margin: ms(14),
      marginTop: mvs(8),
      borderRadius: ms(10),
      borderWidth: 1,
      borderColor: BORDER,
      minHeight: mvs(64),
      padding: ms(10),
    },
    notesInput: {
      fontSize: fs(13),fontFamily:'Inter-Regular',
      color: TEXT_PRIMARY,
      textAlignVertical: 'top',
      minHeight: mvs(44),
      borderWidth:0
    },
    // Read-only notes display (OperationDetailsScreen confirmation view).
    notesText: {
      fontSize: fs(13.5),fontFamily:'Inter-Regular',
      color: TEXT_PRIMARY,
      lineHeight: fs(19),
      paddingHorizontal: ms(14),
      paddingBottom: mvs(14),
    },
    notesTextEmpty: {
      color: TEXT_TERTIARY,
      fontStyle: 'italic',
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
      fontSize: fs(15),fontFamily:'Inter-Regular',
      fontWeight: '700',
    },
    submitBtnTextDisabled: {
      color: DISABLED_TEXT,
    },

    // Empty-state (no order passed via route params).
    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: ms(24),
    },
    emptyText: {
      marginTop: mvs(8),
      fontSize: fs(13),fontFamily:'Inter-Regular',
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
      fontSize: fs(13.5),fontFamily:'Inter-Regular',
    },

      
     menuBackdrop: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    menuPill: {
      position: 'absolute',
      top: mvs(46),
      right: ms(16),
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: SURFACE,
      paddingVertical: mvs(11),
      paddingHorizontal: ms(16),
      borderRadius: ms(24),
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    menuPillIcon: {
      marginRight: ms(8),
      color: RETURN_ACCENT,
    },
    menuPillText: {
      fontSize: fs(13.5),fontFamily:'Inter-Regular',
      fontWeight: '700',
      color: RETURN_ACCENT,
    },
  });
}
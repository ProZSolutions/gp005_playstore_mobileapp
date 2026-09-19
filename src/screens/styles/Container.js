import { Platform, StyleSheet } from 'react-native';
import { AppColors } from '../../theme/theme';
import Dimensions from '../../theme/dimensions';
import { bottomSpace,scale,verticalScale,moderateScale,moderateVerticalScale,fontScale,  ms,mvs,fs,screen} from '../../utils/scale';

const CARD_RADIUS   = Dimensions.radius.card;
const HEADER_RADIUS = Dimensions.radius.header;
const TEAL = AppColors.primary;
const PURPLE_LIGHT = '#EFE9FE';
const ContainerStyles = StyleSheet.create({
     safe:   { flex: 1, backgroundColor: AppColors.background },
    safe_primary:{ flex: 1, backgroundColor: AppColors.primary },

    kav:    { flex: 1 },
    scroll: { flexGrow: 1 },
    scroll_bg:        { flex: 1, backgroundColor: AppColors.background,
       padding: Dimensions.spacing.screenPaddingH },
     scroll_bgLarge:{ flex: 1, backgroundColor: AppColors.background
        },
    scrollContent: {   paddingTop: Dimensions.spacing.scrollContentPaddingTop 
      , padding: Dimensions.spacing.screenPaddingH, maxWidth: 640, alignSelf: 'center', width: '100%',},
      scrollContentLarge: {   paddingTop: Dimensions.spacing.scrollContentPaddingTop 
      , padding: Dimensions.spacing.screenPaddingH, maxWidth: 800, alignSelf: 'center', width: '100%',},
       scrollContentLand: {   paddingTop: Dimensions.spacing.scrollContentPaddingTop 
      , padding: Dimensions.spacing.screenPaddingH, maxWidth: 1200, alignSelf: 'center', width: '100%',},
    heroWrapper: {
        width: '100%', height: Dimensions.spacing.heroHeight,
        backgroundColor: AppColors.heroBg, overflow: 'hidden',
    },
    card: {
        flex: 1,
        backgroundColor: AppColors.surface,
        borderTopLeftRadius: Dimensions.radius.cardTop, borderTopRightRadius: Dimensions.radius.cardTop,
        marginTop: Dimensions.spacing.cardMarginTop, paddingTop: Dimensions.spacing.cardPaddingTop,
        paddingHorizontal: Dimensions.spacing.cardPaddingHorizontal, paddingBottom: Dimensions.spacing.cardPaddingBottom,
        ...Platform.select({
          ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: Dimensions.shadow.card.offsetY }, shadowOpacity: Dimensions.shadow.card.opacity, shadowRadius: Dimensions.shadow.card.radius },
          android: { elevation: Dimensions.elevation.card },
        }),
      },
      card_bg: {
        alignContent: 'center', alignSelf: 'center', textAlign: 'center',
        backgroundColor: AppColors.cardBlue,
        borderRadius: Dimensions.radius.cardBg, marginBottom: Dimensions.spacing.cardBgMarginBottom, padding: Dimensions.spacing.cardBgPadding,
        flexDirection: 'row',
        ...Platform.select({
          ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: Dimensions.shadow.card.offsetY }, shadowOpacity: Dimensions.shadow.card.opacity, shadowRadius: Dimensions.shadow.card.radius },
          android: { elevation: Dimensions.elevation.card },
        }),
      },
      forgotRow:    { alignItems: 'right', marginTop: Dimensions.spacing.forgotRowMarginTop, marginBottom: Dimensions.spacing.forgotRowMarginBottom },
      helpContainer: { flexDirection: 'row', justifyContent: 'center',  alignItems: 'center',  marginTop: Dimensions.spacing.helpContainerMarginTop,},
    //login style

    ///product Audit
      auditRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingVertical: Dimensions.spacing.auditRowPaddingV,
        paddingLeft: Dimensions.spacing.auditRowPaddingH,
        paddingRight: Dimensions.spacing.auditRowPaddingH,
        gap: Dimensions.spacing.auditRowGap,
      },
       auditRowLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Dimensions.spacing.auditRowLeftGap,
        flex: 1,
    },
    auditRowLabelWrap:{ flexDirection: 'row', alignItems: 'center', gap: Dimensions.spacing.auditRowLabelGap, marginBottom: Dimensions.spacing.auditRowLabelMarginBottom },
     chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Dimensions.spacing.chipRowGap,
  },  chip: {
    borderRadius: Dimensions.radius.chip,
    paddingHorizontal: Dimensions.spacing.chipPaddingHorizontal,
    paddingVertical: Dimensions.spacing.chipPaddingVertical,
     maxWidth: Dimensions.spacing.chipMaxWidth,
  },
 header: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: Dimensions.spacing.headerPaddingH,
    paddingTop: Platform.OS === 'android' ? Dimensions.spacing.headerPaddingTopAndroid : Dimensions.spacing.headerPaddingTopIOS,
    paddingBottom: Dimensions.spacing.headerPaddingBottom,
    borderBottomLeftRadius: HEADER_RADIUS,
    borderBottomRightRadius: HEADER_RADIUS,
  },
  headerlarge: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: Dimensions.spacing.headerPaddingH,
    paddingTop: Platform.OS === 'android' ? Dimensions.spacing.headerPaddingTopAndroidLar : Dimensions.spacing.headerPaddingTopIOSLar,
    paddingBottom: Dimensions.spacing.headerPaddingBottom,
    borderBottomLeftRadius: HEADER_RADIUS,
    borderBottomRightRadius: HEADER_RADIUS,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Dimensions.spacing.headerTopRowMarginBottom,
  },
   headerTopRowL: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop:20,
   },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `rgba(255,255,255,${Dimensions.opacity.headerPillBg})`,
    borderRadius: Dimensions.radius.headerPill,
    paddingHorizontal: Dimensions.spacing.headerPillPaddingH,
    paddingVertical: Dimensions.spacing.headerPillPaddingV,
    gap: Dimensions.spacing.headerPillGap,
  },
  headerPillL: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `rgba(255,255,255,${Dimensions.opacity.headerPillBg})`,
    borderRadius: Dimensions.radius.headerPill,
    paddingHorizontal: Dimensions.spacing.headerPillPaddingHL,
    paddingVertical: Dimensions.spacing.headerPillPaddingVL,
    gap: Dimensions.spacing.headerPillGap,
  },
  headerPillBack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `rgba(255,255,255,${Dimensions.opacity.headerPillBg})`,
    borderRadius: Dimensions.radius.gradePill,
    paddingHorizontal: Dimensions.spacing.headerPillPaddingH,
    paddingVertical: Dimensions.spacing.headerPillPaddingVBack,
   },
    headerPillBackLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `rgba(255,255,255,${Dimensions.opacity.headerPillBg})`,
    borderRadius: Dimensions.radius.gradePill,
    paddingHorizontal: Dimensions.spacing.headerPillPaddingH,
    paddingVertical: Dimensions.spacing.headerPillPaddingVBack,
   },
  card_pro: {
    backgroundColor: AppColors.surface,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden', // important
    marginBottom: Dimensions.spacing.cardProMarginBottom,
    borderWidth: Dimensions.border.cardPro,
    borderColor: `rgba(0,0,0,${Dimensions.opacity.cardProBorder})`,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: Dimensions.shadow.cardPro.opacity,
        shadowRadius: Dimensions.shadow.cardPro.radius,
        shadowOffset: { width: 0, height: Dimensions.shadow.cardPro.offsetY },
      },
      android: {
        elevation: Dimensions.elevation.cardPro,
      },
    }),
  },
  card_proLarge: {
    backgroundColor: AppColors.surface,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden', // important
    marginBottom: Dimensions.spacing.cardProMarginBottom,
    borderWidth: Dimensions.border.cardPro,
    borderColor: `rgba(0,0,0,${Dimensions.opacity.cardProBorder})`,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: Dimensions.shadow.cardPro.opacity,
        shadowRadius: Dimensions.shadow.cardPro.radius,
        shadowOffset: { width: 0, height: Dimensions.shadow.cardPro.offsetY },
      },
      android: {
        elevation: Dimensions.elevation.cardPro,
      },
    }),
  },
  card_pro_top:{
    backgroundColor: AppColors.surface,
    borderTopRightRadius:CARD_RADIUS,
    borderTopLeftRadius:CARD_RADIUS,
    overflow: 'hidden',  
     paddingVertical: Dimensions.spacing.cardHeaderRowPaddingV,
    paddingLeft: Dimensions.spacing.cardHeaderRowPaddingH,
    paddingRight: Dimensions.spacing.cardHeaderRowPaddingH,
    borderWidth: Dimensions.border.cardPro,
    borderColor: `rgba(0,0,0,${Dimensions.opacity.cardProBorder})`,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: Dimensions.shadow.cardPro.opacity,
        shadowRadius: Dimensions.shadow.cardPro.radius,
        shadowOffset: { width: 0, height: Dimensions.shadow.cardPro.offsetY },
      },
      android: {
        elevation: Dimensions.elevation.cardPro,
      },
    }),}
    ,
    warningBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: AppColors.warningBg,
      borderWidth: 1,
      borderColor: AppColors.warningBorder,
      borderRadius: 12,
      paddingLeft: Dimensions.spacing.cardHeaderRowPaddingH,
      paddingRight: Dimensions.spacing.cardHeaderRowPaddingH,
      paddingTop:Dimensions.spacing.cardHeaderRowPaddingV,
      paddingBottom:Dimensions.spacing.cardProMarginBottom,
     },
    card_pro_bottom:{
    backgroundColor: AppColors.surface,
    borderBottomRightRadius:CARD_RADIUS,
    borderBottomLeftRadius:CARD_RADIUS,
    overflow: 'hidden', // important
    marginBottom: Dimensions.spacing.cardProMarginBottom,
       paddingVertical: Dimensions.spacing.cardHeaderRowPaddingV,
    paddingLeft: Dimensions.spacing.cardHeaderRowPaddingH,
    paddingRight: Dimensions.spacing.cardHeaderRowPaddingH,
    borderWidth: Dimensions.border.cardPro,
    borderColor: `rgba(0,0,0,${Dimensions.opacity.cardProBorder})`,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: Dimensions.shadow.cardPro.opacity,
        shadowRadius: Dimensions.shadow.cardPro.radius,
        shadowOffset: { width: 0, height: Dimensions.shadow.cardPro.offsetY },
      },
      android: {
        elevation: Dimensions.elevation.cardPro,
      },
    }),},
     sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: AppColors.primaryLight ?? '#E6F6F5',
      paddingVertical: mvs(11),
      paddingHorizontal: ms(14),
    },
       sectionHeaderRowL: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: AppColors.primaryLight ?? '#E6F6F5',
      paddingVertical: mvs(11),
      paddingHorizontal: ms(14),
    },

  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.headerRowBg, // gray
    paddingVertical: Dimensions.spacing.cardHeaderRowPaddingV,
    paddingLeft: Dimensions.spacing.cardHeaderRowPaddingH,
    paddingRight: Dimensions.spacing.cardHeaderRowPaddingH,
   },
   cardHeaderRowNew: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'rgba(255,255,255,0.22)',
  borderTopLeftRadius: Dimensions.spacing.cardRadius || 12,
  borderTopRightRadius: Dimensions.spacing.cardRadius || 12,
  paddingVertical: Dimensions.spacing.cardHeaderRowPaddingV,
  paddingLeft: Dimensions.spacing.cardHeaderRowPaddingH,
  paddingRight: Dimensions.spacing.cardHeaderRowPaddingH,
},
  cardHeaderRowGG: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
     paddingVertical: Dimensions.spacing.cardHeaderRowPaddingV,
    paddingLeft: Dimensions.spacing.cardHeaderRowPaddingH,
    paddingRight: Dimensions.spacing.cardHeaderRowPaddingH,
  },
  detailCell: { flex: 1 },
  severityBadge: {
    flex: 1,
    borderRadius: Dimensions.radius.severityBadge,
    paddingVertical: Dimensions.spacing.severityBadgePaddingV,
    alignItems: 'center',
  },
   summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Dimensions.spacing.summaryHeaderMarginBottom,
    paddingLeft: Dimensions.spacing.summaryHeaderPaddingLeft,
    paddingEnd: Dimensions.spacing.summaryHeaderPaddingEnd
  },

  gradePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Dimensions.spacing.gradePillPaddingH,
    paddingVertical: Dimensions.spacing.gradePillPaddingV,
    borderRadius: Dimensions.radius.gradePill,
    marginRight: Dimensions.spacing.gradePillMarginRight,
    marginTop: Dimensions.spacing.gradePillMarginTop,
    gap: Dimensions.spacing.gradePillGap,
    paddingRight: Dimensions.spacing.gradePillPaddingRight
  },
    severityRow: {
    flexDirection: 'row',
    gap: Dimensions.spacing.severityRowGap,
    marginBottom: Dimensions.spacing.severityRowMarginBottom,
    paddingLeft: Dimensions.spacing.severityRowPaddingH,
    paddingRight: Dimensions.spacing.severityRowPaddingH
  },
   cardDivider: {
    height: Dimensions.border.hairline,
    backgroundColor: AppColors.divider,
    marginVertical: Dimensions.spacing.cardDividerMarginV,
  },
   pieceDots: {
    flexDirection: 'row',
    gap: Dimensions.spacing.pieceDotsGap,
    marginTop: Dimensions.spacing.pieceDotsMarginTop,
    flexWrap: 'wrap',
  },
  pieceDot: {
    width: Dimensions.spacing.pieceDotSize,
    height: Dimensions.spacing.pieceDotSize,
    borderRadius: Dimensions.radius.pieceDot,
    borderWidth: Dimensions.border.pieceDot,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pieceDotFilled: {
    backgroundColor: AppColors.errorContainer,
    borderColor: AppColors.error,
  },
  pieceDotActive: {
    borderColor: AppColors.primary,
    borderWidth: Dimensions.border.pieceDotActive,
  },
    pieceDotTextFilled: { color: AppColors.error },
   pieceDotRedDot: {
      position: 'absolute',
      top: -Dimensions.spacing.pieceDotRedDotOffset,
      right: -Dimensions.spacing.pieceDotRedDotOffset,
      width: Dimensions.spacing.pieceDotRedDotSize,
      height: Dimensions.spacing.pieceDotRedDotSize,
      borderRadius: Dimensions.radius.pieceDotRedDot,
      backgroundColor: AppColors.error,
      borderWidth: Dimensions.border.pieceDot,
      borderColor: AppColors.surface,
    },

    // ── Footer ──
    footer: {
      flexDirection: 'row',
      gap: Dimensions.spacing.footerGap,
      backgroundColor: AppColors.surface,
      paddingHorizontal: Dimensions.spacing.footerPaddingH,
      paddingTop: Dimensions.spacing.footerPaddingTop,
      paddingBottom: Platform.OS === 'ios' ? Dimensions.spacing.footerPaddingBottomIOS : Dimensions.spacing.footerPaddingBottomAndroid,
      borderTopWidth: Dimensions.border.footerTop,
      borderTopColor: AppColors.border,
      maxWidth: 640,
      alignSelf: 'center',
      width: '100%',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: Dimensions.shadow.footer.offsetY },
          shadowOpacity: Dimensions.shadow.footer.opacity,
          shadowRadius: Dimensions.shadow.footer.radius,
        },
        android: { elevation: Dimensions.elevation.footer },
      }),
    },
    footerLand: {
      flexDirection: 'row',
      gap: Dimensions.spacing.footerGap,
      backgroundColor: AppColors.surface,
      paddingHorizontal: Dimensions.spacing.footerPaddingH,
      paddingTop: Dimensions.spacing.footerPaddingTop,
      paddingBottom: Platform.OS === 'ios' ? Dimensions.spacing.footerPaddingBottomIOS : Dimensions.spacing.footerPaddingBottomAndroid,
      borderTopWidth: Dimensions.border.footerTop,
      borderTopColor: AppColors.border,
      maxWidth: 1350,
      alignSelf: 'center',
      width: '100%',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: Dimensions.shadow.footer.offsetY },
          shadowOpacity: Dimensions.shadow.footer.opacity,
          shadowRadius: Dimensions.shadow.footer.radius,
        },
        android: { elevation: Dimensions.elevation.footer },
      }),
    },
    footerpor: {
      flexDirection: 'row',
      gap: Dimensions.spacing.footerGap,
      backgroundColor: AppColors.surface,
      paddingHorizontal: Dimensions.spacing.footerPaddingH,
      paddingTop: Dimensions.spacing.footerPaddingTop,
      paddingBottom: Platform.OS === 'ios' ? Dimensions.spacing.footerPaddingBottomIOS : Dimensions.spacing.footerPaddingBottomAndroid,
      borderTopWidth: Dimensions.border.footerTop,
      borderTopColor: AppColors.border,
      maxWidth: 800,
      alignSelf: 'center',
      width: '100%',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: Dimensions.shadow.footer.offsetY },
          shadowOpacity: Dimensions.shadow.footer.opacity,
          shadowRadius: Dimensions.shadow.footer.radius,
        },
        android: { elevation: Dimensions.elevation.footer },
      }),
    },
    //product audit
    //process Audit
      fixedCardWrap: {
        paddingHorizontal: Dimensions.spacing.screenPaddingH,
        paddingTop: Dimensions.spacing.fixedCardWrapPaddingTop,
        backgroundColor: AppColors.background,
        maxWidth: 640,
        alignSelf: 'center',
        width: '100%',
      },
      fixedCardWrapLarge: {
        paddingHorizontal: Dimensions.spacing.screenPaddingH,
        paddingTop: Dimensions.spacing.fixedCardWrapPaddingTop,
        backgroundColor: AppColors.background,
        maxWidth: 800,
        alignSelf: 'center',
        width: '100%',
      },
       fixedCardWrapLand: {
        paddingHorizontal: Dimensions.spacing.screenPaddingH,
        paddingTop: Dimensions.spacing.fixedCardWrapPaddingTop,
        backgroundColor: AppColors.background,
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
      },
      spiHeaderRow: {
        flexDirection: 'row',
        marginLeft: Dimensions.spacing.spiHeaderMarginLeft,
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: Dimensions.spacing.spiHeaderMarginBottom,
         paddingTop:Dimensions.spacing.headerPaddingH,
      },
      spiValueWrap: { flexDirection: 'row', alignItems: 'baseline' },
      sliderRow:  { flexDirection: 'row', alignItems: 'center', gap: Dimensions.spacing.sliderRowGap, marginLeft: Dimensions.spacing.sliderRowMarginLeft },
      slider: { flex: 1, height: Dimensions.spacing.sliderHeight, marginBottom: Dimensions.spacing.sliderMarginBottom },
       qcRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Dimensions.spacing.qcRowGap,
        paddingVertical: Dimensions.spacing.qcRowPaddingV,
      },
       qcAccent: {
        width: Dimensions.spacing.qcAccentWidth,
        alignSelf: 'stretch',
        marginLeft: Dimensions.spacing.qcAccentMarginLeft,
        marginRight: Dimensions.spacing.qcAccentMarginRight,
        borderRadius: Dimensions.radius.qcAccent,
        minHeight: Dimensions.spacing.qcAccentMinHeight,
      },
        qcBtns: { flexDirection: 'row', gap: Dimensions.spacing.qcBtnsGap, marginRight: Dimensions.spacing.qcBtnsMarginRight },

    sectionBody: { paddingHorizontal: ms(14), paddingVertical: mvs(6) },
          sectionBodyLarger: { paddingHorizontal: ms(5), paddingVertical: mvs(6) },

    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: mvs(5),
    },
    detailRowMultiline: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: mvs(10),
  },
   detailValueMultiline: {
    color: AppColors.textPrimary,
    fontSize: fs(14.5),
    fontWeight: '600',
    textAlign: 'left',
    marginTop: mvs(6),
    lineHeight: fs(20),
    width: '100%',
  },
    detailRowBorder: { borderTopWidth: 1, borderTopColor: '#EEF2F2' },
    detailLabel: { color: AppColors.textSecondary, fontSize: fs(14), flexShrink: 0, paddingRight: ms(10),paddingLeft:ms(4) },
    detailValue: { color: AppColors.textPrimary, fontSize: fs(14.5), fontWeight: '500', textAlign: 'right', flexShrink: 1,flex: 1 },
    detailValueItalic: { fontStyle: 'italic', fontWeight: '500', color: AppColors.textPrimary },
    liveDot: { width: ms(7), height: ms(7), borderRadius: ms(3.5), backgroundColor: AppColors.error, marginRight: ms(5) },
    liveValueRow: { flexDirection: 'row', alignItems: 'center' },
    liveValueText: { color: AppColors.error, fontSize: fs(14.5), fontWeight: '500' },

    //process Audit

      //Dashboard
        headerWrap: {
          backgroundColor: TEAL,
          paddingBottom: Dimensions.spacing.dashHeaderPaddingBottom,
          borderBottomLeftRadius: Dimensions.radius.dashboardHeader,
          borderBottomRightRadius: Dimensions.radius.dashboardHeader,
        },
          headerTopRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: Dimensions.spacing.dashHeaderTopRowPaddingH,
            paddingTop: Dimensions.spacing.dashHeaderTopRowPaddingTop,
          },
          zoneSelector: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
              headerIconsRow: { flexDirection: 'row', alignItems: 'center' },
           zoneOuter:{
       maxWidth: '70%',
      flexDirection:'column'
    }, inspectionCardOuter:{
      flexDirection:'column',
       backgroundColor: AppColors.surface,
       marginBottom: Dimensions.spacing.inspectionCardMarginV, marginLeft: Dimensions.spacing.inspectionCardMarginH,
       marginTop: Dimensions.spacing.inspectionCardMarginV, marginRight: Dimensions.spacing.inspectionCardMarginH,
       borderRadius: Dimensions.radius.inspectionCardOuter, paddingVertical: Dimensions.spacing.inspectionCardPaddingV, paddingHorizontal: Dimensions.spacing.inspectionCardPaddingH,
      shadowColor: '#000', shadowOpacity: Dimensions.shadow.inspectionCardOuter.opacity, shadowRadius: Dimensions.shadow.inspectionCardOuter.radius,
      shadowOffset: { width: 0, height: Dimensions.shadow.inspectionCardOuter.offsetY }, elevation: Dimensions.elevation.inspectionCardOuter,
    },
    scrollContent_dash:{
        paddingBottom: Dimensions.spacing.cardProMarginBottom * 2,
    },
    inspectorCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: AppColors.surface,
      marginHorizontal: Dimensions.spacing.inspectorCardMarginH, marginTop: Dimensions.spacing.inspectorCardMarginTop,
    },
    inspectorInfo: { flex: 1 },
    inspectorNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    shiftPill: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: AppColors.primaryLight,
      marginHorizontal: Dimensions.spacing.shiftPillMarginHIK, marginTop: Dimensions.spacing.shiftPillMarginTop,
      borderRadius: Dimensions.radius.shiftPill, paddingVertical: Dimensions.spacing.shiftPillPaddingV, paddingHorizontal: Dimensions.spacing.shiftPillPaddingH,
    },
    shiftItem: { flexDirection: 'row', alignItems: 'center' },
    shiftDivider: { width: Dimensions.border.shiftDivider, height: Dimensions.spacing.shiftDividerHeight, backgroundColor: AppColors.primary, opacity: Dimensions.opacity.shiftDivider, marginHorizontal: Dimensions.spacing.shiftDividerMarginHI },
    body: { flex: 1, paddingHorizontal: Dimensions.spacing.bodyPaddingH },
     mainOpsSection: { flex: Dimensions.flexRatio.mainOpsSection },
    mainOpsGrid: {flexDirection: 'row',  flexWrap: 'wrap',  justifyContent: 'flex-start',gap:Dimensions.spacing.mainCardGap},
    mainOpCard: {
     width: Dimensions.percent.mainOpCardWidth,
  minHeight: Dimensions.spacing.mainOpCardMinHeight,  backgroundColor: AppColors.surface,  borderRadius: Dimensions.radius.mainOpCard,
  padding: Dimensions.spacing.mainOpCardPadding, marginBottom: Dimensions.spacing.mainOpCardMarginBottom,  shadowColor: '#000',
  shadowOpacity: Dimensions.shadow.mainOpCard.opacity,  shadowRadius: Dimensions.shadow.mainOpCard.radius,
  shadowOffset: {
    width: 0,
    height: Dimensions.shadow.mainOpCard.offsetY,
  },
  elevation: Dimensions.elevation.mainOpCard,
    },
    mainOpIconWrap: { width: Dimensions.spacing.mainOpIconWrapSize, height: Dimensions.spacing.mainOpIconWrapSize, borderRadius: Dimensions.radius.mainOpIconWrap, alignItems: 'center', justifyContent: 'center', marginBottom: Dimensions.spacing.mainOpIconWrapMarginBottom },
 configSection: { flex: Dimensions.flexRatio.configSection },
    configGrid: { flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'flex-start', gap:Dimensions.spacing.mainCardGap},
   configCard: {
  width: Dimensions.percent.configCardWidth,

  minHeight: Dimensions.spacing.configCardMinHeight,

  backgroundColor: AppColors.surface,
  borderRadius: Dimensions.radius.configCard,

  paddingHorizontal: Dimensions.spacing.configCardPaddingH,
  paddingVertical: Dimensions.spacing.configCardPaddingV,

  marginBottom: Dimensions.spacing.configCardMarginBottom,

  shadowColor: '#000',
  shadowOpacity: Dimensions.shadow.configCard.opacity,
  shadowRadius: Dimensions.shadow.configCard.radius,
  shadowOffset: {
    width: 0,
    height: Dimensions.shadow.configCard.offsetY,
  },
  elevation: Dimensions.elevation.configCard,
},
      //Dashborad
//device mapping
// ── Device/Machine mapping (full-screen Add + Confirm) ──
  screenBody: {
    flex: 1,
    paddingHorizontal: Dimensions.spacing.screenPaddingH,
    paddingLeft:Dimensions.spacing.screenPaddingH,
    paddingTop: Dimensions.spacing.scrollContentPaddingTop,
  },
  
  iconChipSm: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Dimensions.spacing.auditRowLeftGap,
  },
  actionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBadgeDone: {
    backgroundColor: AppColors.primaryLight,
  },
  rowDone: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primaryLight,
  },
  connectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Dimensions.spacing.cardTopBottomPAddings,

   },
  connectorLine: {
    flex: 1,
    height: Dimensions.border.hairline,
  },
  connectorBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Dimensions.spacing.chipRowGap,
  },
//device mapping


});
export default ContainerStyles;
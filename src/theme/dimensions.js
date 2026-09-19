import { bottomSpace,scale,verticalScale,moderateScale,moderateVerticalScale,fontScale,  ms,mvs,fs,screen} from '../utils/scale';

const Dimensions = {
  radius: {
    card: ms(16),
     cardL: ms(5),          // CARD_RADIUS
    header: ms(24), 
    headerLarge: ms(5),        // HEADER_RADIUS
    cardBg: ms(10),
    cardTop: ms(28),       // card borderTopLeft/RightRadius
    chip: ms(14),
    pieceDot: ms(18),
    pieceDotRedDot: ms(4),
    qcAccent: ms(2),
    dashboardHeader: ms(20), // headerWrap bottom radius
    mainOpCard: ms(16),
    configCard: ms(12),
    inspectionCardOuter: ms(16),
    shiftPill: ms(12),
    severityBadge: ms(10),
    gradePill: ms(20),
    headerPill: ms(16),
    requiredDot: scale(3),
    colourDot: ms(4.5),
    gradeDot: scale(3.5),
    empBadge: ms(8),
    headerIconButton: ms(17),
    avatar: ms(12),
    mainOpIconWrap: ms(12),
    submitBtn: moderateScale(14),
    qcBtn: moderateScale(20),
  },

  spacing: {
    mainCardGap:ms(12),
    mainOpCardGap:'4%',
    heroHeight: verticalScale(220),

    // global screen padding (scroll_bg, scrollContent, fixedCardWrap)
    screenPaddingH: scale(14),
    screenPaddingHq: scale(5),
    screenPaddingHL: scale(0),
    scrollContentPaddingTop: verticalScale(8),

    cardMarginTop: -ms(28),
    cardPaddingTop: mvs(32),
    cardPaddingHorizontal: ms(24),
    cardPaddingBottom: mvs(40),

    cardBgMarginBottom: mvs(20),
    cardBgPadding: ms(10),

    forgotRowMarginTop: -mvs(8),
    forgotRowMarginBottom: mvs(20),

    helpContainerMarginTop: mvs(26),

    chipMaxWidth: scale(160),
    chipPaddingHorizontal: ms(10),
    chipPaddingVertical: mvs(4),
    chipRowGap: scale(4),

    inspectionCardMarginH: ms(20),
    inspectionCardMarginV: mvs(16),
    inspectionCardPaddingV: mvs(12),
    inspectionCardPaddingH: ms(14),

    pieceDotSize: scale(36),
    pieceDotRedDotSize: scale(8),
    pieceDotRedDotOffset: scale(2),
    pieceDotsGap: scale(6),
    pieceDotsMarginTop: verticalScale(10),

    shiftDividerHeight: mvs(14),
    shiftDividerMarginH: ms(12),
    shiftDividerMarginHI: ms(10),

    // ── product audit: auditRow / auditRowLeft / auditRowLabelWrap ──
    auditRowPaddingV: verticalScale(20),
    auditRowPaddingH: ms(16),
    auditRowGap: scale(6),
    auditRowLeftGap: scale(9),
    auditRowLabelGap: scale(5),
    auditRowLabelMarginBottom: verticalScale(6),

    // ── header (product audit) ──
    headerPaddingH: ms(16),
    headerPaddingHI: ms(2),
    headerPaddingTopAndroid: mvs(15),
     headerPaddingTopAndroidLar: mvs(50),
    headerPaddingTopIOS: mvs(7),
     headerPaddingTopIOSL: mvs(2),
     headerPaddingTopIOSLar: mvs(12),
    headerPaddingBottom: mvs(22),
    headerTopRowMarginBottom: mvs(10),
     headerTopRowMarginBottomL: mvs(20),
    headerPillPaddingH: ms(14),
    headerPillPaddingHL: ms(10),
    headerPillPaddingV: mvs(7),
    headerPillPaddingVL: mvs(2),
    headerPillPaddingVBack: mvs(4),
    headerPillGap: ms(5),

    // ── card_pro / cardHeaderRow ──
    cardProMarginBottom: mvs(12),
    cardHeaderRowPaddingV: mvs(9),
    cardRadius:mvs(10),
    cardHeaderRowPaddingH: ms(16),
    cardTopBottomPAddings:mvs(20),

    // ── severityBadge / summaryHeader / gradePill / severityRow ──
    severityBadgePaddingV: mvs(8),
    summaryHeaderMarginBottom: verticalScale(12),
    summaryHeaderPaddingLeft: ms(16),
    summaryHeaderPaddingEnd: ms(12),

    gradePillPaddingH: scale(10),
    gradePillPaddingV: verticalScale(2),
    gradePillMarginRight: ms(5),
    gradePillMarginTop: ms(5),
    gradePillGap: scale(4),
    gradePillPaddingRight: ms(12),

    severityRowGap: scale(8),
    severityRowMarginBottom: verticalScale(14),
    severityRowPaddingH: ms(16),

    cardDividerMarginV: verticalScale(2),

    // ── footer ──
    footerGap: scale(10),
    footerPaddingH: scale(16),
    footerPaddingTop: verticalScale(12),
    footerPaddingBottomIOS: verticalScale(28),
    footerPaddingBottomAndroid: verticalScale(20),

    // ── process audit: fixedCardWrap / spiHeaderRow / sliderRow / slider / qcRow / qcAccent / qcBtns ──
    fixedCardWrapPaddingTop: verticalScale(16),
    spiHeaderMarginLeft: ms(7),
    spiHeaderMarginBottom: verticalScale(12),
    sliderRowGap: scale(7),
    sliderRowMarginLeft: ms(7),
    sliderHeight: verticalScale(40),
    sliderHeightLarge: verticalScale(60),
    sliderMarginBottom: ms(8),
    qcRowGap: scale(10),
    qcRowPaddingV: verticalScale(12),
    qcAccentWidth: scale(4),
    qcAccentMarginLeft: ms(10),
    qcAccentMarginRight: ms(7),
    qcAccentMinHeight: verticalScale(40),
    qcBtnsGap: scale(7),
    qcBtnsMarginRight: ms(6),

    // ── dashboard: headerWrap / headerTopRow / inspectorCard / shiftPill / body ──
    dashHeaderPaddingBottom: mvs(5),
    dashHeaderTopRowPaddingH: ms(10),
    dashHeaderTopRowPaddingTop: mvs(4),
    inspectorCardMarginH: ms(16),
    inspectorCardMarginTop: mvs(4),
    shiftPillMarginH: ms(16),
    shiftPillMarginHIK: ms(10),
    shiftPillMarginTop: mvs(10),
    shiftPillPaddingV: mvs(9),
    shiftPillPaddingH: ms(14),
    bodyPaddingH: ms(16),

    // ── dashboard: mainOpCard / mainOpIconWrap / configCard ──
    mainOpCardMinHeight: mvs(90),
    mainOpCardPadding: ms(10),
    mainOpCardMarginBottom: mvs(12),
    mainOpIconWrapSize: ms(40),
    mainOpIconWrapMarginBottom: mvs(10),
    configCardMinHeight: mvs(80),
    configCardPaddingH: ms(12),
    configCardPaddingV: ms(7),
    configCardMarginBottom: mvs(10),

    // ── requiredDot / infoBadge ──
    requiredDotSize: scale(6),
    gradeDotSize: scale(7),
    infoBadgeSize: scale(18),
    infoBadgeMarginTop: verticalScale(2),

    // ── stepDots / dot ──
    stepDotsGap: ms(7),
    stepDotsGapL: ms(12),
    dotWidth: ms(20),
    dotHeight: mvs(4),
    dotActiveWidth: ms(32),

    // ── fieldValueRow ──
    fieldValueRowGap: ms(5),
    fieldValueRowPaddingV: ms(4),
    fieldValueRowPaddingLeft: ms(10),
    fieldValueRowPaddingRight: ms(12),
    fieldSepMarginH: ms(2),

    // ── detailLabel / detailValueRow / colourDot ──
    detailLabelMarginBottom: mvs(3),
    detailValueRowGap: ms(5),
    colourDotSize: ms(9),

    // ── spiUnit / sliderBound ──
    spiUnitMarginRight: ms(8),
    spiUnitMarginLeft: scale(3),
    sliderBoundMinWidth: scale(14),
    sliderBoundMarginRight: ms(8),
    sliderBoundMarginBottom: ms(8),

    // ── qcName / qcDesc ──
    qcNameMarginBottom: verticalScale(3),

    // ── dashboard text spacing ──
    changeZoneTextMarginH: ms(5),
    zoneSummaryTextPaddingH: ms(16),
    zoneSummaryTextMarginTop: mvs(2),
    inspectorNameMarginRight: ms(8),
    empBadgePaddingH: ms(8),
    empBadgePaddingV: mvs(2),
    inspectorRoleMarginTop: mvs(2),
    shiftTextMarginLeft: ms(6),
    sectionLabelDashMarginTop: mvs(10),
    sectionLabelDashMarginBottom: mvs(12),
    mainOpSubtitleMarginTop: mvs(2),

    // ── sectionLabel / viewAllText ──
    sectionLabelMarginTop: ms(5),
    sectionLabelMarginLeft: ms(5),

    // ── headerTitle ──
    headerTitleMarginBottom: mvs(3),
        headerTitleMarginBottomL: mvs(20),


    // ── auditRowIconShield / pieceDotText ──
    auditRowIconShieldMarginTop: verticalScale(1),

    // ── buttons: submitExitBtn / submitBtn / qcBtn ──
    submitBtnPaddingVertical: verticalScale(15),
    qcBtnPaddingH: scale(14),
    qcBtnPaddingV: verticalScale(7),

    // ── headerIconButton / avatar (button styles) ──
    headerIconButtonSize: ms(34),
    avatarBtnSize: ms(44),
    avatarBtnMarginRight: ms(12),
  },

  border: {
    hairline: 1,
    cardPro: 1,
    footerTop: 1,
    shiftDivider: 1,
    pieceDot: 1.5,
    pieceDotActive: 2,
    headerIconButton: 0.5, // borderWidthThin, reused via Dimensions.button
  },

  shadow: {
    // reusable opacity/radius/offset presets — spread into Platform.select ios blocks
    card: { opacity: 0.07, radius: ms(12), offsetY: -4 },
    cardPro: { opacity: 0.05, radius: ms(8), offsetY: mvs(3) },
    footer: { opacity: 0.06, radius: 6, offsetY: -2 },
    inspectionCardOuter: { opacity: 0.08, radius: ms(10), offsetY: mvs(4) },
    mainOpCard: { opacity: 0.04, radius: ms(6), offsetY: 2 },
    configCard: { opacity: 0.03, radius: ms(4), offsetY: 1 },
  },

  elevation: {
    card: 8,
    cardPro: 2,
    footer: 8,
    inspectionCardOuter: 3,
    mainOpCard: 1,
    configCard: 1,

  },

  opacity: {
    headerPillBg: 0.18,      // rgba(255,255,255,0.18)
    cardProBorder: 0.06,     // rgba(0,0,0,0.06)
    shiftDivider: 0.25,
    dotInactive: 0.35,       // step dot (inactive) background
    zoneSummaryText: 0.85,   // zoneSummaryText color
  },

  flexRatio: {
    mainOpsSection: 1.05,
    configSection: 0.9,
  },

  percent: {
    mainOpCardWidth: '47%',
    configCardWidth: '31%',
  },

  icon: {
    auditRowFontSize: fs(11),
    auditRowMarginTop: mvs(1),
    pillFontSize: fs(11),
    fieldFontSize: fs(12),
    fieldPaddingH: ms(5),
    fieldMarginLeft: ms(5),
     fieldMarginLeftM: ms(12),
  },

  text: {
    shiftTitleMarginLeft: ms(10),
    shiftFontSize: fs(16),

    titleFontSize: fs(26),
    titleMarginBottom: mvs(2),

    subtitleFontSize: fs(15),
    subtitleMarginBottom: mvs(30),

    forgotTitleFontSize: fs(17),
    forgotTitleMarginBottom: mvs(6),

    helpTextFontSize: fs(16),

    contactTextFontSize: fs(16),
    contactTextMarginLeft: ms(4),

    labelFontSize: fs(10.5),
    labelMarginBottom: mvs(8),
    labelMarginLeft: ms(2),

    submitTextFontSize: fs(17),

    // ── product audit ──
    auditRowLabelFontSize: fontScale(14.5),
    chevronFontSize: fontScale(25),
    chevronMarginTop: verticalScale(4),
    chipTextFontSize: fontScale(14),
    placeholderTextFontSize: fontScale(14.5),
    pillTextFontSize: fs(17),
    headerTitleFontSize: fs(22),
    sectionLabelFontSize: fs(14.5),
    sectionLabelFontSizeL: fs(22),
    viewAllTextFontSize: fs(14),
     viewAllTextFontSizeL: fs(25),
     viewAllTextFontSizeLL: fs(30),
    fieldValueFontSize: fs(16),
    fieldSepFontSize: fs(16),
    detailLabelFontSize: fs(12),
    detailLabelFontSizeL: fs(17),
    detailValueFontSize: fs(15),
     detailValueFontSizeL: fs(19),
     detailValueFontSizeL: fs(20),
    severityLabelFontSize: fs(15),
    severityCountFontSize: fs(18),
    gradeTextFontSize: fontScale(10),
    auditRowIconShieldFontSize: fontScale(17),
    pieceDotTextFontSize: fontScale(15),
    pieceDefectPadding:fs(15),
    // ── process audit ──
    spiValueFontSize: fontScale(16),
    spiUnitFontSize: fontScale(12),
    sliderBoundFontSize: fontScale(16),
    qcNameFontSize: fontScale(17.8),
    qcDescFontSize: fontScale(15),
    qcDescLineHeight: fontScale(22),
    qcBtnTextFontSize: fontScale(16),

    changeZoneTextFontSize: fs(15),
    zoneSummaryTextFontSize: fs(14),
    avatarTextFontSize: fs(19),
    inspectorNameFontSize: fs(16),
    empBadgeTextFontSize: fs(12),
    inspectorRoleFontSize: fs(14),
    shiftTextFontSize: fs(13),
    sectionLabelDashFontSize: fs(14.5),
    mainOpTitleFontSize: fs(16.5),
    mainOpSubtitleFontSize: fs(13.5),
    configTitleFontSize: fs(13.5),
  },

  letterSpacing: {
    tight: 0.1,
    narrow: 0.2,
    medium: 0.3,
    standard: 0.5,
    wide: 0.8,
    negativeTight: -0.5,
  },

  warningLabel: {
    paddingH: ms(15),
    paddingV: ms(2),
    radius: ms(2),
  },

  button: {
    borderWidthThick: 1.5,
    borderWidthThin: 0.5,
    activeShadow: { opacity: 0.35, radius: ms(10), offsetY: 4 },
    activeElevation: 6,
  },
};

export default Dimensions;
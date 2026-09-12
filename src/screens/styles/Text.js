import { StyleSheet } from 'react-native';
import { AppColors } from '../../theme/theme';
import Dimensions from '../../theme/dimensions';
import { ms } from '../../utils/scale';

const TextStyles = StyleSheet.create({
    //login style
     shift_title: { marginLeft: Dimensions.text.shiftTitleMarginLeft, fontSize: Dimensions.text.shiftFontSize, fontWeight: '700', color: AppColors.primary },
      shift_desc:  { marginLeft: Dimensions.text.shiftTitleMarginLeft, fontSize: Dimensions.text.shiftFontSize, fontWeight: '700', color: AppColors.onSurfaceDisabled },
      title:    { fontSize: Dimensions.text.titleFontSize, 
        fontWeight: '700', color: AppColors.textPrimary, fontFamily:'Inter-Regular',
         marginBottom: Dimensions.text.titleMarginBottom, letterSpacing: Dimensions.letterSpacing.tight },
      subtitle: { fontFamily: 'Inter-Regular',fontSize: Dimensions.text.subtitleFontSize, fontWeight: '400', color: AppColors.textSecondary,   marginBottom: Dimensions.text.subtitleMarginBottom, letterSpacing: Dimensions.letterSpacing.tight },
      forgot_title: {
        fontSize: Dimensions.text.forgotTitleFontSize,
        fontWeight: '800',
        color: AppColors.primary,
        textAlign: 'right',
        marginBottom: Dimensions.text.forgotTitleMarginBottom,
        letterSpacing: Dimensions.letterSpacing.narrow,
      },
      helpText: {
        fontSize: Dimensions.text.helpTextFontSize,
        color: AppColors.helpText,
        fontWeight: '400',
      },

      contactText: {
        fontSize: Dimensions.text.contactTextFontSize,
        color:AppColors.primary,
        fontWeight: '600',
        marginLeft: Dimensions.text.contactTextMarginLeft,
      },
    //login style
    //product audit
     auditRowLabel: {
        fontSize: Dimensions.text.auditRowLabelFontSize,
        fontWeight: '800',
        color: AppColors.textSecondary,
        letterSpacing: Dimensions.letterSpacing.wide,
        textTransform: 'uppercase',
        textAlignVertical:'center'
       },
       requiredDot: {
           width: Dimensions.spacing.requiredDotSize,
           height: Dimensions.spacing.requiredDotSize,
           borderRadius: Dimensions.radius.requiredDot,
           backgroundColor: AppColors.error,
         },
       infoBadge: {
             width: Dimensions.spacing.infoBadgeSize,
             height: Dimensions.spacing.infoBadgeSize,
            alignItems: 'center',
             justifyContent: 'center',
             marginTop: Dimensions.spacing.infoBadgeMarginTop,
        },
         chevron: {
            fontSize: Dimensions.text.chevronFontSize,
            color: AppColors.textTertiary,
            marginTop: Dimensions.text.chevronMarginTop,
          },

            chipText: { fontSize: Dimensions.text.chipTextFontSize, fontWeight: '600' },
         chipDefect:      { backgroundColor: AppColors.chipDefectBg, borderColor: AppColors.chipDefectBorder,borderRadius:Dimensions.text.pieceDefectPadding },
        chipTextDefect:  { color: AppColors.chipDefectText },
        chipPiece:       { backgroundColor: AppColors.errorContainer, borderColor: AppColors.error + '66',borderRadius:Dimensions.text.pieceDefectPadding },
        chipTextPiece:   { color: AppColors.error },
        chipAssignee:    { backgroundColor: AppColors.primaryLight, borderColor: AppColors.primaryContainer
           ,borderRadius:Dimensions.text.pieceDefectPadding},
        chipTextAssignee:{ color: AppColors.primaryDark },
        chipCap:         { backgroundColor: AppColors.chipCapBg, borderColor: AppColors.chipCapBorder,borderRadius:Dimensions.text.pieceDefectPadding },
        chipTextCap:     { color: AppColors.chipCapText },
        chipMore:        { backgroundColor: AppColors.surfaceVariant, borderColor: AppColors.border,borderRadius:Dimensions.text.pieceDefectPadding },
        chipTextMore:    { color: AppColors.textSecondary },
        placeholderText: {
            fontSize: Dimensions.text.placeholderTextFontSize,
            color: AppColors.textTertiary,
            fontStyle: 'italic',
          },
          pillTextBack: { color: AppColors.onPrimary, fontSize: Dimensions.text.headerTitleFontSize, fontWeight: '600' },

            pillText: { color: AppColors.onPrimary, fontSize: Dimensions.text.pillTextFontSize, fontWeight: '600' },
          headerTitle: {
            color: AppColors.onPrimary,
            fontSize: Dimensions.text.headerTitleFontSize,
            fontWeight: '800',
            marginBottom: Dimensions.spacing.headerTitleMarginBottom,
            marginTop:Dimensions.spacing.headerPaddingTopIOS
          },
          stepDots: { flexDirection: 'row', gap: Dimensions.spacing.stepDotsGap },
           dot: {
            width: Dimensions.spacing.dotWidth,
            height: Dimensions.spacing.dotHeight,
            borderRadius: Dimensions.radius.qcAccent,
            backgroundColor: `rgba(255,255,255,${Dimensions.opacity.dotInactive})`,
          },
         dotActive: { width: Dimensions.spacing.dotActiveWidth, backgroundColor: AppColors.onPrimary },
          sectionLabel: {
            fontSize: Dimensions.text.sectionLabelFontSize,
            fontWeight: '800',
            letterSpacing: Dimensions.letterSpacing.wide,
               color: AppColors.textSecondary,
            textTransform: 'uppercase',
            paddingTop:Dimensions.spacing.headerPaddingH,
            marginLeft: Dimensions.spacing.sectionLabelMarginLeft
        },
         sectionLabelNew: {
            fontSize: Dimensions.text.sectionLabelFontSize,
            fontWeight: '800',
            letterSpacing: Dimensions.letterSpacing.wide,
               color: AppColors.textSecondary,
            textTransform: 'uppercase',
             marginLeft: Dimensions.spacing.sectionLabelMarginLeft
        },
          viewAllText: { fontSize: Dimensions.text.viewAllTextFontSize, fontWeight: '700', color: AppColors.primary },
          fieldValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            gap: Dimensions.spacing.fieldValueRowGap, paddingBottom: Dimensions.spacing.fieldValueRowPaddingV, 
            paddingLeft: Dimensions.spacing.fieldValueRowPaddingLeft,
                   paddingRight: Dimensions.spacing.fieldValueRowPaddingRight, 
                   paddingTop: Dimensions.spacing.fieldValueRowPaddingV,
                   paddingBottom:Dimensions.spacing.fieldValueRowPaddingV
          },
          fieldValue: { fontSize: Dimensions.text.fieldValueFontSize, fontWeight: '500', color: AppColors.textPrimary },
          fieldSep: { fontSize: Dimensions.text.fieldSepFontSize, color: AppColors.textTertiary, marginHorizontal: Dimensions.spacing.fieldSepMarginH },
          detailLabel: {
              fontSize: Dimensions.text.detailLabelFontSize,
              fontWeight: '700',
              letterSpacing: Dimensions.letterSpacing.standard,
              color: AppColors.textTertiary,
              textTransform: 'uppercase',
              marginBottom: Dimensions.spacing.detailLabelMarginBottom,
          },
           detailValueRow: { flexDirection: 'row', alignItems: 'center', gap: Dimensions.spacing.detailValueRowGap },
          colourDot: { width: Dimensions.spacing.colourDotSize, height: Dimensions.spacing.colourDotSize, borderRadius: Dimensions.radius.colourDot },
          detailValue: { fontSize: Dimensions.text.detailValueFontSize, fontWeight: '700', color: AppColors.textPrimary, flexShrink: 1 },
          severityLabel: { fontSize: Dimensions.text.severityLabelFontSize, fontWeight: '400'},
          severityCount: { fontSize: Dimensions.text.severityCountFontSize, fontWeight: '800' },
           label: {
              fontSize:      Dimensions.text.labelFontSize,
              fontWeight:    '400',
              letterSpacing: Dimensions.letterSpacing.wide,
              textTransform: 'uppercase',
              marginBottom:  Dimensions.text.labelMarginBottom,
              marginLeft:    Dimensions.text.labelMarginLeft,
            },
              gradeDot: {
                width: Dimensions.spacing.gradeDotSize,
                height: Dimensions.spacing.gradeDotSize,
                borderRadius: Dimensions.radius.gradeDot,
              },
              gradeText: {
                fontSize: Dimensions.text.gradeTextFontSize,
                fontWeight: '600',
                letterSpacing: Dimensions.letterSpacing.medium,
              },
              mt:{marginTop:10,marginBottom:10},
               
            auditRowIconShield:  { fontSize: Dimensions.text.auditRowIconShieldFontSize, marginTop: Dimensions.spacing.auditRowIconShieldMarginTop, color:AppColors.labrlcolo ,textAlign:'center'},
            warningLabel:{
              paddingRight: Dimensions.warningLabel.paddingH,
              paddingLeft: Dimensions.warningLabel.paddingH,
              paddingTop: Dimensions.warningLabel.paddingV,
              paddingBottom: Dimensions.warningLabel.paddingV,
              borderRadius: Dimensions.warningLabel.radius,
              backgroundColor: AppColors.warningLabelBg,
            },
            pieceDotText: {
              fontSize: Dimensions.text.pieceDotTextFontSize,
              fontWeight: '700',
              color: AppColors.textSecondary,
            },
             submitExitText: {
                fontSize: Dimensions.text.submitTextFontSize,
                fontWeight: '700',
                color: AppColors.textSecondary,
            },
           submitBtnText:      { fontSize: Dimensions.text.submitTextFontSize, fontWeight: '800', color: AppColors.textTertiary },
            submitBtnTextActive:{ color: AppColors.onPrimary },
    //product audit
    //process audit
      spiValue: {
          fontSize: Dimensions.text.spiValueFontSize,
          fontWeight: '800',
          color: AppColors.textPrimary,
          letterSpacing: Dimensions.letterSpacing.negativeTight,
      },
      spiUnit: {
        fontSize: Dimensions.text.spiUnitFontSize,
        marginRight: Dimensions.spacing.spiUnitMarginRight,
        color: AppColors.textTertiary,
        fontWeight: '500',
        marginLeft: Dimensions.spacing.spiUnitMarginLeft,
      },
        sliderBound:{
          fontSize: Dimensions.text.sliderBoundFontSize,
          fontWeight: '600',
          color: AppColors.textTertiary,
          minWidth: Dimensions.spacing.sliderBoundMinWidth,
          marginRight: Dimensions.spacing.sliderBoundMarginRight,
          marginBottom: Dimensions.spacing.sliderBoundMarginBottom,
          textAlign: 'center',
         },
        qcName: {
              fontSize: Dimensions.text.qcNameFontSize,
              fontWeight: '700',
              color: AppColors.textPrimary,
              marginBottom: Dimensions.spacing.qcNameMarginBottom,
        },
         qcDesc: {
            fontSize: Dimensions.text.qcDescFontSize,
            color: AppColors.textSecondary,
            lineHeight: Dimensions.text.qcDescLineHeight,
        },
        qcBtnText: {
          fontSize: Dimensions.text.qcBtnTextFontSize,
          fontWeight: '700',
          color: AppColors.textSecondary,
        },
          qcBtnPassActive: {
            backgroundColor: AppColors.successLight,
            borderColor: AppColors.success,
          },
          qcBtnTextPass: { color: AppColors.success },
          qcBtnFailActive: {
            backgroundColor: AppColors.errorContainer,
            borderColor: AppColors.error,
          },
          qcBtnTextFail: { color: AppColors.error },
    //process audit
    //dashboard
        changeZoneText: { color: AppColors.onPrimary, fontSize: Dimensions.text.changeZoneTextFontSize, fontWeight: '700', marginHorizontal: Dimensions.spacing.changeZoneTextMarginH },
        zoneSummaryText: {
      color: `rgba(255,255,255,${Dimensions.opacity.zoneSummaryText})`, fontSize: Dimensions.text.zoneSummaryTextFontSize,
      paddingHorizontal: Dimensions.spacing.zoneSummaryTextPaddingH, marginTop: Dimensions.spacing.zoneSummaryTextMarginTop,
    },
        avatarText: { color: AppColors.onPrimary, fontSize: Dimensions.text.avatarTextFontSize, fontWeight: '700' },
    inspectorName: { color: AppColors.textPrimary, fontSize: Dimensions.text.inspectorNameFontSize, fontWeight: '800', marginRight: Dimensions.spacing.inspectorNameMarginRight },
    empBadge: { backgroundColor: AppColors.primaryLight, paddingHorizontal: Dimensions.spacing.empBadgePaddingH, paddingVertical: Dimensions.spacing.empBadgePaddingV, borderRadius: Dimensions.radius.empBadge },
    empBadgeText: { color: AppColors.primary, fontSize: Dimensions.text.empBadgeTextFontSize, fontWeight: '600' },
    inspectorRole: { color: AppColors.textSecondary, fontSize: Dimensions.text.inspectorRoleFontSize, marginTop: Dimensions.spacing.inspectorRoleMarginTop },
 shiftText: { color: AppColors.textPrimary, fontSize: Dimensions.text.shiftTextFontSize, fontWeight: '400', marginLeft: Dimensions.spacing.shiftTextMarginLeft },
   sectionLabel_dash: {
      color: AppColors.textSecondary, fontSize: Dimensions.text.sectionLabelDashFontSize, fontWeight: '700',
      letterSpacing: Dimensions.letterSpacing.standard, marginTop: Dimensions.spacing.sectionLabelDashMarginTop, marginBottom: Dimensions.spacing.sectionLabelDashMarginBottom,
    },
     mainOpTitle: { color: AppColors.textPrimary, fontSize: Dimensions.text.mainOpTitleFontSize, fontWeight: '700' },
    mainOpSubtitle: { color: AppColors.textTertiary, fontSize: Dimensions.text.mainOpSubtitleFontSize, marginTop: Dimensions.spacing.mainOpSubtitleMarginTop },
    configTitle: { color: AppColors.textPrimary, fontSize: Dimensions.text.configTitleFontSize, fontWeight: '600' },
    configIcon: { alignSelf: 'flex-end', marginTop:'auto' },
    //dashboard

    //device mapping 
// ── Device/Machine mapping (full-screen Add + Confirm) ──
  cardSectionTitle: {
    fontSize: Dimensions.text.detailValueFontSize,
    fontWeight: '700',
    color: AppColors.primary,
    marginLeft: Dimensions.spacing.auditRowLabelGap,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Dimensions.spacing.auditRowGap,
    backgroundColor: AppColors.chipDefectBg,
    borderRadius: Dimensions.warningLabel.radius,
     marginTop: Dimensions.spacing.cardProMarginBottom,
    borderColor:AppColors.warning,
    borderWidth:ms(0.5),
    paddingLeft: Dimensions.spacing.cardHeaderRowPaddingH,
    paddingRight: Dimensions.spacing.cardHeaderRowPaddingH,
  },
  warningText: {
    flex: 1,
    fontSize: Dimensions.text.qcDescFontSize,
    color: AppColors.textSecondary,
    lineHeight: Dimensions.text.qcDescLineHeight,
  },
   scanBtnText: {
    color: AppColors.onPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
    //device mapping

});
export default TextStyles;
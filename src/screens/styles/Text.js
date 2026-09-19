import { StyleSheet } from 'react-native';
import { AppColors } from '../../theme/theme';
import Dimensions from '../../theme/dimensions';
import { ms,screen } from '../../utils/scale';
 
const TextStyles = StyleSheet.create({
    //login style
     shift_title: { marginLeft: Dimensions.text.shiftTitleMarginLeft,fontFamily:'Inter-Regular' , fontSize: Dimensions.text.shiftFontSize, fontWeight: '700', color: AppColors.primary },
      shift_desc:  { marginLeft: Dimensions.text.shiftTitleMarginLeft,fontFamily:'Inter-Regular' , fontSize: Dimensions.text.shiftFontSize, fontWeight: '700', color: AppColors.onSurfaceDisabled },
      title:    { fontSize: Dimensions.text.titleFontSize,fontFamily:'Inter-Regular' , 
        fontWeight: '700', color: AppColors.textPrimary, fontFamily:'Inter-Regular',
         marginBottom: Dimensions.text.titleMarginBottom, letterSpacing: Dimensions.letterSpacing.tight },
      subtitle: { fontFamily: 'Inter-Regular',fontFamily:'Inter-Regular' ,fontSize: Dimensions.text.subtitleFontSize, fontWeight: '400', color: AppColors.textSecondary,   marginBottom: Dimensions.text.subtitleMarginBottom, letterSpacing: Dimensions.letterSpacing.tight },
      forgot_title: {
        fontSize: Dimensions.text.forgotTitleFontSize,fontFamily:'Inter-Regular' ,
        fontWeight: '800',
        color: AppColors.primary,
        textAlign: 'right',
        marginBottom: Dimensions.text.forgotTitleMarginBottom,
        letterSpacing: Dimensions.letterSpacing.narrow,
      },
      helpText: {
        fontSize: Dimensions.text.helpTextFontSize,fontFamily:'Inter-Regular' ,
        color: AppColors.helpText,
        fontWeight: '400',
      },

      contactText: {
        fontSize: Dimensions.text.contactTextFontSize,fontFamily:'Inter-Regular' ,
        color:AppColors.primary,
        fontWeight: '600',
        marginLeft: Dimensions.text.contactTextMarginLeft,
      },
    //login style
    //product audit
     auditRowLabel: {
        fontSize: screen.isTablet ? Dimensions.text.sectionLabelFontSizeL :Dimensions.text.auditRowLabelFontSize,fontFamily:'Inter-Regular' ,
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
            fontSize: Dimensions.text.chevronFontSize,fontFamily:'Inter-Regular' ,
            color: AppColors.textTertiary,
            marginTop: Dimensions.text.chevronMarginTop,
          },

            chipText: { fontSize: screen.isTablet ? Dimensions.text.submitTextFontSize :Dimensions.text.chipTextFontSize, fontWeight: '600' ,fontFamily:'Inter-Regular' },
         chipDefect:      { backgroundColor: AppColors.chipDefectBg, borderColor: AppColors.chipDefectBorder,borderRadius:Dimensions.text.pieceDefectPadding },
        chipTextDefect:  { color: AppColors.chipDefectText },
        chipPiece:       { backgroundColor: AppColors.errorContainer, borderColor: AppColors.error + '66',borderRadius:Dimensions.text.pieceDefectPadding },
        chipTextPiece:   { color: AppColors.error },
        chipAssignee:    { backgroundColor: AppColors.primaryLight, borderColor: AppColors.primaryContainer
           ,borderRadius:Dimensions.text.pieceDefectPadding},
        chipTextAssignee:{ color: AppColors.primaryDark },
        chipCap:         { backgroundColor: AppColors.chipCapBg, borderColor: AppColors.chipCapBorder,
          borderRadius:Dimensions.text.pieceDefectPadding },
        chipTextCap:     { color: AppColors.chipCapText },
        chipMore:        { backgroundColor: AppColors.surfaceVariant, borderColor: AppColors.border,borderRadius:Dimensions.text.pieceDefectPadding },
        chipTextMore:    { color: AppColors.textSecondary },
        placeholderText: {
            fontSize: screen.isTablet ? Dimensions.text.sectionLabelFontSizeL : Dimensions.text.placeholderTextFontSize,fontFamily:'Inter-Regular' ,
            color: AppColors.textTertiary,
            fontStyle: 'italic',
          },
          pillTextBack: { color: AppColors.onPrimary, fontSize: Dimensions.text.headerTitleFontSize, fontWeight: '600' ,fontFamily:'Inter-Regular' },

        pillTextLL: { color: AppColors.onPrimary,
               fontSize: screen.isTablet ? Dimensions.text.viewAllTextFontSizeLL :Dimensions.text.pillTextFontSize,
               fontWeight: '600',fontFamily:'Inter-Bold'  },
            pillText: { color: AppColors.onPrimary,
               fontSize: screen.isTablet ? Dimensions.text.viewAllTextFontSizeL :Dimensions.text.pillTextFontSize,
               fontWeight: '600',fontFamily:'Inter-Bold'  },
                pillTextLarge: { color: AppColors.onPrimary, fontSize: Dimensions.text.viewAllTextFontSizeL,
               fontWeight: '600',fontFamily:'Inter-Bold'  },
          headerTitle: {
            color: AppColors.onPrimary,
            fontSize: screen.isTablet ? Dimensions.text.titleFontSize :  Dimensions.text.headerTitleFontSize,fontFamily:'Inter-Regular' ,
            fontWeight: '800',
            marginBottom: Dimensions.spacing.headerTitleMarginBottom,
            marginTop:Dimensions.spacing.headerPaddingTopIOS
          },
           headerTitleL: {
            color: AppColors.onPrimary,
            fontSize: Dimensions.text.viewAllTextFontSizeL,fontFamily:'Inter-Regular' ,
            fontWeight: '800',
            marginBottom: Dimensions.spacing.headerTitleMarginBottomL,
            marginTop:Dimensions.spacing.headerPaddingTopIOS
          },
          stepDots: { flexDirection: 'row', gap: screen.isTablet ? Dimensions.spacing.stepDotsGapL: Dimensions.spacing.stepDotsGap },
           dot: {
            width: Dimensions.spacing.dotWidth,
            height: Dimensions.spacing.dotHeight,
            borderRadius: Dimensions.radius.qcAccent,
            backgroundColor: `rgba(255,255,255,${Dimensions.opacity.dotInactive})`,
          },
         dotActive: { width: Dimensions.spacing.dotActiveWidth, backgroundColor: AppColors.onPrimary },
          sectionLabel: {
            fontSize:screen.isTablet ? Dimensions.text.chevronFontSize : Dimensions.text.sectionLabelFontSize,
            fontFamily:'Inter-Regular' ,
            fontWeight: '800',
            letterSpacing: Dimensions.letterSpacing.wide,
               color: AppColors.textSecondary,
            textTransform: 'uppercase',
            paddingTop:Dimensions.spacing.headerPaddingH,
            marginLeft: Dimensions.spacing.sectionLabelMarginLeft
        },
         sectionLabelNew: {
            fontSize:screen.isTablet ? Dimensions.text.sectionLabelFontSizeL : Dimensions.text.sectionLabelFontSize ,
            fontFamily:'Inter-Regular' ,
            fontWeight: '800',
            letterSpacing: Dimensions.letterSpacing.wide,
               color: AppColors.textSecondary,
            textTransform: 'uppercase',
             marginLeft: Dimensions.spacing.sectionLabelMarginLeft
        },
         viewAllTextLarge: { fontSize: Dimensions.text.viewAllTextFontSizeL,fontFamily:'Inter-Regular' , fontWeight: '700', color: AppColors.primary },

          viewAllText: { fontSize: screen.isTablet?Dimensions.text.detailValueFontSizeL:Dimensions.text.viewAllTextFontSize
            ,fontFamily:'Inter-Regular' , fontWeight: '700', color: AppColors.primary },
          fieldValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            gap: Dimensions.spacing.fieldValueRowGap, paddingBottom: Dimensions.spacing.fieldValueRowPaddingV, 
            paddingLeft: Dimensions.spacing.fieldValueRowPaddingLeft,
                   paddingRight: Dimensions.spacing.fieldValueRowPaddingRight, 
                   paddingTop: Dimensions.spacing.fieldValueRowPaddingV,
                   paddingBottom:Dimensions.spacing.fieldValueRowPaddingV
          },
          fieldValue: { fontSize: Dimensions.text.fieldValueFontSize,fontFamily:'Inter-Regular' , fontWeight: '500', color: AppColors.textPrimary },
          fieldSep: { fontSize: Dimensions.text.fieldSepFontSize,fontFamily:'Inter-Regular' , color: AppColors.textTertiary, marginHorizontal: Dimensions.spacing.fieldSepMarginH },
          detailLabel: {
              fontSize: screen.isTablet ? Dimensions.text.detailValueFontSizeL : Dimensions.text.detailLabelFontSize,fontFamily:'Inter-Regular' ,
              fontWeight: '700',
              letterSpacing: Dimensions.letterSpacing.standard,
              color: AppColors.textTertiary,
              textTransform: 'uppercase',
              marginBottom: Dimensions.spacing.detailLabelMarginBottom,
          },
          detailLabelLarge: {
              fontSize: Dimensions.text.detailLabelFontSizeL,fontFamily:'Inter-Regular' ,
              fontWeight: '700',
              letterSpacing: Dimensions.letterSpacing.standard,
              color: AppColors.textTertiary,
              textTransform: 'uppercase',
              marginBottom: Dimensions.spacing.detailLabelMarginBottom,
          },





           detailValueRow: { flexDirection: 'row', alignItems: 'center', gap: Dimensions.spacing.detailValueRowGap },
          colourDot: { width: Dimensions.spacing.colourDotSize, height: Dimensions.spacing.colourDotSize, borderRadius: Dimensions.radius.colourDot },
          detailValue: { fontSize: screen.isTablet ? Dimensions.text.detailValueFontSizeL : Dimensions.text.detailValueFontSize,fontFamily:'Inter-Regular' , fontWeight: '700', color: AppColors.textPrimary, flexShrink: 1 },
          detailValueLarge: { fontSize: Dimensions.text.detailValueFontSizeL,fontFamily:'Inter-Regular' , fontWeight: '700', color: AppColors.textPrimary, flexShrink: 1 },

          severityLabel: { fontSize: screen.isTablet ? Dimensions.text.headerTitleFontSize :Dimensions.text.severityLabelFontSize, 
            fontWeight: '400',fontFamily:'Inter-Regular' },
          severityCount: { fontSize: screen.isTablet ? Dimensions.text.headerTitleFontSize : Dimensions.text.severityCountFontSize, fontWeight: '800',fontFamily:'Inter-Regular'  },
           label: {
              fontSize:      Dimensions.text.labelFontSize,fontFamily:'Inter-Regular' ,
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
                fontSize: screen.isTablet ? Dimensions.text.severityCountFontSize: Dimensions.text.gradeTextFontSize,fontFamily:'Inter-Regular' ,
                fontWeight: '600',
                letterSpacing: Dimensions.letterSpacing.medium,
              },
              mt:{marginTop:10,marginBottom:10},
               
            auditRowIconShield:  { fontSize: screen.isTablet ? Dimensions.text.qcDescLineHeight :Dimensions.text.auditRowIconShieldFontSize,fontFamily:'Inter-Regular' , marginTop: Dimensions.spacing.auditRowIconShieldMarginTop, color:AppColors.labrlcolo ,textAlign:'center'},
            warningLabel:{
              paddingRight: Dimensions.warningLabel.paddingH,
              paddingLeft: Dimensions.warningLabel.paddingH,
              paddingTop: Dimensions.warningLabel.paddingV,
              paddingBottom: Dimensions.warningLabel.paddingV,
              borderRadius: Dimensions.warningLabel.radius,
              backgroundColor: AppColors.warningLabelBg,
            },
            pieceDotText: {
              fontSize: Dimensions.text.pieceDotTextFontSize,fontFamily:'Inter-Regular' ,
              fontWeight: '700',
              color: AppColors.textSecondary,
            },
             submitExitText: {
                fontSize: screen.isTablet ? Dimensions.text.sectionLabelFontSizeL :Dimensions.text.submitTextFontSize,fontFamily:'Inter-Regular' ,
                fontWeight: '700',
                color: AppColors.textSecondary,
            },
           submitBtnText:      { fontSize: screen.isTablet ?  Dimensions.text.viewAllTextFontSizeL : Dimensions.text.submitTextFontSize,fontFamily:'Inter-Regular' , fontWeight: '800', color: AppColors.textTertiary },
            submitBtnTextActive:{ color: AppColors.onPrimary },
    //product audit
    //process audit
      spiValue: {
          fontSize: screen.isTablet ?Dimensions.text.detailValueFontSizeL :Dimensions.text.spiValueFontSize,
          fontFamily:'Inter-Regular' ,
          fontWeight: '800',
          color: AppColors.textPrimary,
          letterSpacing: Dimensions.letterSpacing.negativeTight,
      },
      spiUnit: {
        fontSize: screen.isTablet ? Dimensions.text.detailValueFontSizeL:Dimensions.text.spiUnitFontSize,
        fontFamily:'Inter-Regular' ,
        marginRight: Dimensions.spacing.spiUnitMarginRight,
        color: AppColors.textTertiary,
        fontWeight: '500',
        marginLeft: Dimensions.spacing.spiUnitMarginLeft,
      },
        sliderBound:{
          fontSize: screen.isTablet ? Dimensions.text.qcDescLineHeight: Dimensions.text.sliderBoundFontSize,
          fontFamily:'Inter-Regular' ,
          fontWeight: '600',
          color: AppColors.textTertiary,
          minWidth: Dimensions.spacing.sliderBoundMinWidth,
          marginRight: Dimensions.spacing.sliderBoundMarginRight,
          marginBottom: Dimensions.spacing.sliderBoundMarginBottom,
          textAlign: 'center',
         },
        qcName: {
              fontSize: screen.isTablet ? Dimensions.text.qcDescLineHeight:Dimensions.text.qcNameFontSize,
              fontFamily:'Inter-Regular' ,
              fontWeight: '700',
              color: AppColors.textPrimary,
              marginBottom: Dimensions.spacing.qcNameMarginBottom,
        },
         qcDesc: {
            fontSize: screen.isTablet ? Dimensions.text.qcDescLineHeight: Dimensions.text.qcDescFontSize,fontFamily:'Inter-Regular' ,
            color: AppColors.textSecondary,
            lineHeight:screen.isTablet ?Dimensions.text.chevronFontSize :Dimensions.text.qcDescLineHeight,
        },
        qcBtnText: {
          fontSize: screen.isTablet ? Dimensions.text.qcDescLineHeight : Dimensions.text.qcBtnTextFontSize,fontFamily:'Inter-Regular' ,
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
        changeZoneText: { color: AppColors.onPrimary, fontSize: Dimensions.text.changeZoneTextFontSize, fontWeight: '700', marginHorizontal: Dimensions.spacing.changeZoneTextMarginH,fontFamily:'Inter-Regular' },
        zoneSummaryText: {
      color: `rgba(255,255,255,${Dimensions.opacity.zoneSummaryText})`, fontSize: Dimensions.text.zoneSummaryTextFontSize,
      paddingHorizontal: Dimensions.spacing.zoneSummaryTextPaddingH, marginTop: Dimensions.spacing.zoneSummaryTextMarginTop,
    },
        avatarText: { color: AppColors.onPrimary, fontSize: Dimensions.text.avatarTextFontSize, fontWeight: '700',fontFamily:'Inter-Regular'  },
    inspectorName: { color: AppColors.textPrimary, fontSize: Dimensions.text.inspectorNameFontSize, fontWeight: '800', marginRight: Dimensions.spacing.inspectorNameMarginRight },
    empBadge: { backgroundColor: AppColors.primaryLight, paddingHorizontal: Dimensions.spacing.empBadgePaddingH, paddingVertical: Dimensions.spacing.empBadgePaddingV, borderRadius: Dimensions.radius.empBadge },
    empBadgeText: { color: AppColors.primary, fontSize: Dimensions.text.empBadgeTextFontSize, fontWeight: '600' ,fontFamily:'Inter-Regular' },
    inspectorRole: { color: AppColors.textSecondary, fontSize: Dimensions.text.inspectorRoleFontSize, marginTop: Dimensions.spacing.inspectorRoleMarginTop,fontFamily:'Inter-Regular'  },
 shiftText: { color: AppColors.textPrimary, fontSize: Dimensions.text.shiftTextFontSize, fontWeight: '400', marginLeft: Dimensions.spacing.shiftTextMarginLeft ,fontFamily:'Inter-Regular' },
   sectionLabel_dash: {
      color: AppColors.textSecondary, fontSize: Dimensions.text.sectionLabelDashFontSize, fontWeight: '700',
      letterSpacing: Dimensions.letterSpacing.standard, marginTop: Dimensions.spacing.sectionLabelDashMarginTop, marginBottom: Dimensions.spacing.sectionLabelDashMarginBottom,fontFamily:'Inter-Regular' 
    },
     mainOpTitle: { color: AppColors.textPrimary,fontFamily:'Inter-Regular' , fontSize: Dimensions.text.mainOpTitleFontSize, fontWeight: '700' },
    mainOpSubtitle: { color: AppColors.textTertiary,fontFamily:'Inter-Regular' , fontSize: Dimensions.text.mainOpSubtitleFontSize, marginTop: Dimensions.spacing.mainOpSubtitleMarginTop },
    configTitle: { color: AppColors.textPrimary , 
      fontSize: Dimensions.text.configTitleFontSize, fontWeight: '600',fontFamily:'Inter-Bold' },
    configIcon: { alignSelf: 'flex-end', marginTop:'auto' },
    //dashboard

    //device mapping 
// ── Device/Machine mapping (full-screen Add + Confirm) ──
  cardSectionTitle: {
    fontSize: screen.isTablet ? Dimensions.text.sectionLabelFontSizeL : Dimensions.text.detailValueFontSize,
    fontWeight: '700',fontFamily:'Inter-Regular' ,
    color: AppColors.primary,
    marginLeft: Dimensions.spacing.auditRowLabelGap,
  },
   cardSectionTitleLarge: {
    fontSize: Dimensions.text.detailValueFontSizeL,
    fontWeight: '700',fontFamily:'Inter-Regular' ,
    color: AppColors.primary,
    marginLeft: Dimensions.spacing.auditRowLabelGap,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Dimensions.spacing.auditRowGap,
    backgroundColor: AppColors.chipDefectBg,
    borderRadius: Dimensions.warningLabel.radius,
     marginTop: screen.isTablet ? Dimensions.spacing.cardTopBottomPAddings : Dimensions.spacing.cardProMarginBottom,
    borderColor:AppColors.warning,
    borderWidth:ms(0.5),
    paddingLeft: Dimensions.spacing.cardHeaderRowPaddingH,
    paddingRight: Dimensions.spacing.cardHeaderRowPaddingH,
  },
  warningText: {
    flex: 1,
    fontSize: screen.isTablet ?  Dimensions.text.qcDescLineHeight : Dimensions.text.qcDescFontSize,fontFamily:'Inter-Regular' ,
    color: AppColors.textSecondary,
    lineHeight: Dimensions.text.qcDescLineHeight,
  },
   scanBtnText: {
    color: AppColors.onPrimary,
    fontWeight: '600',
    fontSize: screen.isTablet ? 22 :16,fontFamily:'Inter-Regular' ,
  },
    //device mapping

});
export default TextStyles;
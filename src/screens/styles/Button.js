import { AppColors } from '../../theme/theme';
import { Platform, StyleSheet } from 'react-native';
import Dimensions from '../../theme/dimensions';

const TextStyles = StyleSheet.create({


submitExitBtn: {
    flex: 1,
    paddingVertical: Dimensions.spacing.submitBtnPaddingVertical,
    borderRadius: Dimensions.radius.submitBtn,
    borderWidth: Dimensions.button.borderWidthThick,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface,
  },
  submitBtn: {
     flex: 1,
    paddingVertical: Dimensions.spacing.submitBtnPaddingVertical,
    borderRadius: Dimensions.radius.submitBtn,
    backgroundColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnActive: {
    backgroundColor: AppColors.primary,
    ...Platform.select({
      ios: {
        shadowColor: AppColors.primary,
        shadowOffset: { width: 0, height: Dimensions.button.activeShadow.offsetY },
        shadowOpacity: Dimensions.button.activeShadow.opacity,
        shadowRadius: Dimensions.button.activeShadow.radius,
      },
      android: { elevation: Dimensions.button.activeElevation },
    }),
  },
  //Process Audit
  qcBtn: {
    paddingHorizontal: Dimensions.spacing.qcBtnPaddingH,
    paddingVertical: Dimensions.spacing.qcBtnPaddingV,
    borderRadius: Dimensions.radius.qcBtn,
    borderWidth: Dimensions.button.borderWidthThick,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surfaceVariant,
  },
  //Process Audit
//dashboard
    headerIconButton: {
      width: Dimensions.spacing.headerIconButtonSize, height: Dimensions.spacing.headerIconButtonSize, 
      borderRadius: Dimensions.radius.headerIconButton, borderColor: AppColors.onPrimary, borderWidth: Dimensions.button.borderWidthThin,
      backgroundColor: `rgba(255,255,255,${Dimensions.opacity.headerPillBg})`, alignItems: 'center', justifyContent: 'center',
    },
    headerIconButtonProfile: {
        marginLeft: 10,
        width: Dimensions.spacing.headerIconButtonSize,
        height: Dimensions.spacing.headerIconButtonSize,
        borderRadius: Dimensions.radius.headerIconButton,
        borderWidth: 1,

        backgroundColor: AppColors.onProfBg,
        borderColor: AppColors.onProfOuter,

        alignItems: 'center',
        justifyContent: 'center',

        shadowColor:AppColors.shadowClr,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    avatar: {
      width: Dimensions.spacing.avatarBtnSize, height: Dimensions.spacing.avatarBtnSize, borderRadius: Dimensions.radius.avatar,
      backgroundColor: AppColors.primary, alignItems: 'center', justifyContent: 'center', marginRight: Dimensions.spacing.avatarBtnMarginRight,
    },
//dashboard
scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 12,
    marginBottom: 20,
    gap: 8,
  },

});
export default TextStyles;
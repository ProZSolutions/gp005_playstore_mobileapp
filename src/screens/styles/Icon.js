import { StyleSheet } from 'react-native';
import { AppColors } from '../../theme/theme';
import Dimensions from '../../theme/dimensions';
import { ms,screen } from '../../utils/scale';

const IconStyles = StyleSheet.create({
    //login style
    heroImage:  { width: '100%', height: '100%' },
    icon_style: { alignContent: 'center', alignItems: 'center', textAlign: 'center' },
    //login style
    //product audit
      auditRowIcon:     { fontSize: Dimensions.icon.auditRowFontSize, marginTop: Dimensions.icon.auditRowMarginTop, color:AppColors.secondary ,textAlign:'center'},
      pillIcon: { color: AppColors.onPrimary,
         fontSize: screen.isTablet ? Dimensions.icon.fieldMarginLeftM : Dimensions.icon.pillFontSize },
      fieldIcon: { fontSize: Dimensions.icon.fieldFontSize, color: AppColors.primary, paddingLeft: Dimensions.icon.fieldPaddingH, paddingRight: Dimensions.icon.fieldPaddingH, marginLeft: Dimensions.icon.fieldMarginLeft },
    //product audit

});
export default IconStyles;
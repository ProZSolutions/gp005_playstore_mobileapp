import { Platform, StyleSheet } from 'react-native';
import { AppColors } from '../../theme/theme';
import Dimensions from '../../theme/dimensions';
import { mvs } from '../../utils/scale';
 
const HEADER_RADIUS = Dimensions.radius.header;

 
export const HEADER_MAX_WIDTH = {
  mobile: 640,
  largePortrait: '100%',
  largeLandscape: '100%',
};

const AuditLayoutStyles = StyleSheet.create({ 
  headerWrap: {
    backgroundColor: AppColors.primary,
    paddingBottom: Dimensions.spacing.headerPaddingBottom,
    borderBottomLeftRadius: HEADER_RADIUS,
    borderBottomRightRadius: HEADER_RADIUS,
  },
   headerWrapLarge: {
    backgroundColor: AppColors.primary,
    paddingBottom: Dimensions.spacing.headerPaddingBottom,
    borderBottomLeftRadius: Dimensions.radius.headerLarge,
    borderBottomRightRadius: Dimensions.radius.headerLarge,
  },
  // Keeps header content on the same centred column as the body on tablets.
  headerInner: {
    width: '100%',
    alignSelf: 'center',
  }, 
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Dimensions.spacing.headerTopRowMarginBottom,
  },
  headerTopRowLarge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,  
  },
  headerTopRowCompact: {
    marginBottom: mvs(6),
  },
 
  footerBar: {
    backgroundColor: AppColors.surface,
    borderTopWidth: Dimensions.border.footerTop,
    borderTopColor: AppColors.border,
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
  footerInner: {
    borderTopWidth: 0,
    ...Platform.select({
      ios: { shadowOpacity: 0 },
      android: { elevation: 0 },
    }),
  },
});

export default AuditLayoutStyles;
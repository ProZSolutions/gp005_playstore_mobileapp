import { StyleSheet } from 'react-native';
import { AppColors } from '../../theme/theme';
import { bottomSpace,scale,verticalScale,moderateScale,moderateVerticalScale,fontScale,  ms,mvs,fs,screen} from '../../utils/scale';

const TEAL = AppColors.primary ?? '#0A9E96';

export default StyleSheet.create({
  outer: {
    borderWidth:     1.5,
    borderColor:     '#D6E2E2',
    backgroundColor: '#fff',
    alignItems:      'center',
    justifyContent:  'center',
  },
  outerChecked: {
    borderColor:     TEAL,
    backgroundColor: TEAL,
  },
});
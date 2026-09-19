import { StyleSheet } from 'react-native';
import { AppColors } from '../../theme/theme';
import { bottomSpace,scale,verticalScale,moderateScale,moderateVerticalScale,fontScale,  ms,mvs,fs,screen} from '../../utils/scale';

const TEAL = AppColors.primary ?? '#0A9E96';

export default StyleSheet.create({
  btn: {
    flex:            1,
    borderRadius:    10,
    paddingVertical: 12,
    alignItems:      'center',
    justifyContent:  'center',
    minHeight:       46,    
  },
    btnLarge: {
    flex:            1,
    borderRadius:    10,
    paddingVertical: 22,
    alignItems:      'center',
    justifyContent:  'center',
    minHeight:       72,    
  },
  primary: {
    backgroundColor: TEAL,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth:     1.5,
    borderColor:     TEAL,
  },
  disabled: {
    backgroundColor: '#D5E8E7',
    borderColor:     '#D5E8E7',
  },
  pressed: {
    opacity: 0.86,
  },
  label: {
    fontSize:      17,
    fontWeight:    '600',
    color:         '#fff',
    letterSpacing: 0.1,
     fontFamily: 'Inter-Bold' 
  },
   labellarge: {
    fontSize:      20,
    fontWeight:    '600',
    color:         '#fff',
    letterSpacing: 0.1,
     fontFamily: 'Inter-Bold' 
  },
  labelGhost: {
    color: TEAL,
  },
  labelDisabled: {
    color: '#9BBCBA',
  },
});
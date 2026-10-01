import { StyleSheet } from 'react-native';
import { AppColors } from '../../theme/theme';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { bottomSpace,scale,verticalScale,moderateScale,moderateVerticalScale,fontScale,  ms,mvs,fs,screen} from '../../utils/scale';

const TEAL = AppColors.onPrimary ?? '#0A9E96';

 export const chipStyles = StyleSheet.create({
  chip: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   'rgba(255,255,255,0.20)',
    borderRadius:      14,
    paddingHorizontal: 10,
    paddingVertical:   5,
    marginRight:       6,
    marginBottom:      6,
  },
   chipLarge: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   'rgba(255,255,255,0.20)',
    borderRadius:      14,
    paddingHorizontal: 10,
    paddingVertical:   5,
    marginRight:       6,
    marginBottom:      6,
  },
  text: {
    color:      '#fff',
    fontSize:   fontScale(13),
    fontWeight: '600',
  },
  textLarge: {
    color:      '#fff',
    fontSize:   fontScale(16),
    fontWeight: '600',
  },
});

export const pillStyles = StyleSheet.create({
  pill: {
    backgroundColor:  'rgba(10,158,150,0.10)',
    borderRadius:     16,
    paddingHorizontal: 8,
    paddingVertical:   3,
    alignSelf:        'flex-start',
  },
  text: {
    fontSize:   10,
    fontWeight: '700',
    color:      TEAL,
  },
});

// "STEP 1 OF 2" badge shown at the top of the header
export const badgeStyles = StyleSheet.create({
  badge: {
    alignSelf:         'flex-start',
    backgroundColor:    AppColors.step,
    borderRadius:      14,
    paddingHorizontal: 10,
    paddingVertical:   4,
  },
  text: {
    color:         '#fff',
    fontSize:      fontScale(13),
    fontWeight:    '700',
    letterSpacing: 0.4,
    fontFamily:'Inter-Regular'
  },
});
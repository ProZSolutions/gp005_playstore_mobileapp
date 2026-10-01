import { StyleSheet } from 'react-native';
import { AppColors } from '../../theme/theme';
import { bottomSpace,scale,verticalScale,moderateScale,moderateVerticalScale,fontScale,  ms,mvs,fs,screen} from '../../utils/scale';

const TEAL = AppColors.primary ?? '#0A9E96';

export default StyleSheet.create({
  row: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   '#fff',
    borderRadius:      12,
    paddingVertical:   14,
    paddingHorizontal: 14,
    borderWidth:       1.3,
    borderColor:       '#E8EDED',
  },
  rowSelected: {
    borderColor:     TEAL,
    backgroundColor: 'rgba(10,158,150,0.04)',
  },
  rowPressed: {
    opacity: 0.75,
  },
  iconWrap: {
    width:           34,
    height:          34,
    borderRadius:    10,
    backgroundColor: '#F0F5F5',
    alignItems:      'center',
    justifyContent:  'center',
    marginRight:     12,
  },
  textBlock: {
    flex:        1,
    marginRight: 10,
  },
  title: {
    fontSize:     16.5,
    fontWeight:   '700',
    color:        '#1A2E2D',
    marginBottom: 2,
  },
  subtitle: {
    fontSize:   14,
    color:      '#7A9090',
    fontWeight: '400',
  },
});
import { StyleSheet, Platform, Dimensions } from 'react-native';
import { AppColors } from '../../theme/theme';

const { width: W } = Dimensions.get('window');
const H_PAD = Math.min(Math.max(W * 0.042, 14), 20);

const TEAL = AppColors.primary ?? '#0A9E96';

export default StyleSheet.create({
   safe: {
    flex:            1,
    backgroundColor: TEAL,
  },

  header: {
    backgroundColor:   TEAL,
    paddingHorizontal: H_PAD,
    paddingTop:        Platform.OS === 'android' ? 14 : 6,
    paddingBottom:     20,
    paddingTop: 50
  },

  title: {
    fontSize:     24,
    fontWeight:   '700',
    color:        '#fff',
    marginTop:    10,
    marginBottom: 2,
  },
  subtitle: {
    fontSize:     15,
    color:        'rgba(255,255,255,0.78)',
    marginBottom: 10,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    marginTop:     4,
  },

  body: {
    flex:                 1,
    backgroundColor:      AppColors.background ?? '#F3F6F6',
    borderTopLeftRadius:  20,
    borderTopRightRadius: 20,
    paddingTop:           18,
    paddingHorizontal:    H_PAD,
  },

  listContent: {
    paddingBottom: 8,
  },

  emptyText: {
    fontSize:  15,
    color:     '#7A9090',
    textAlign: 'center',
    marginTop: 36,
  },

  footer: {
    backgroundColor:   AppColors.surface ?? '#fff',
    paddingHorizontal: H_PAD,
      paddingTop:        15,
    paddingBottom:     Platform.OS === 'ios' ? 26 : 35,
    borderTopWidth:    1,
    borderTopColor:    '#E8EDED',
    ...Platform.select({
      ios: {
        shadowColor:   '#000',
        shadowOffset:  { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius:  6,
      },
      android: { elevation: 6 },
    }),
  },
  footerRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
});
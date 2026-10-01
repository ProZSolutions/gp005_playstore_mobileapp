import { StyleSheet } from 'react-native';
import { AppColors } from '../../theme/theme';

const TEAL = AppColors.primary ?? '#0A9E96';

export default StyleSheet.create({
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    alignSelf:       'stretch',    
    marginTop:       10,
    marginBottom:    2,
    paddingHorizontal: 4,
  },
  locationBG: {
    width: 30,
    height: 30,
    borderColor:     '#fff',
    backgroundColor: AppColors.transparentBG,
      borderRadius: 12
  },
  stepItem: {
  flexDirection: 'row',
  alignItems: 'center',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,  
  },
  circleBlue: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#55b3ba',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,  
  },
  circleActive: {
    borderColor: '#fff',
  },
  
  circleDone: {
    borderColor:     '#fff',
    backgroundColor: '#FFF',
  },
  circleActiveDot: {
    width:           7,
    height:          7,
    borderRadius:    4,
    backgroundColor: '#fff',
  },
  circleTick: {
    color:      TEAL,
    fontSize:   12,
    fontWeight: '800',
    lineHeight: 14,
  },
  label: {
  marginLeft: 4,
  color: 'rgba(255,255,255,0.60)',
  fontSize: 13,
  fontWeight: '500',
},
  labelActive: {
    color:      '#fff',
    fontWeight: '700',
  },
  connector: {
  flex: 1,
  height: 2,
  backgroundColor: 'rgba(255,255,255,0.28)',
  marginHorizontal: 12,
  borderRadius: 1,
},
  connectorDone: {
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
});
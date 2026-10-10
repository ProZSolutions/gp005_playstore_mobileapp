import { StyleSheet, Platform } from 'react-native';
import { AppColors } from '../../theme/theme';

const TEAL = AppColors.primary ?? '#0A9E96';

export default StyleSheet.create({
  // Standard button — mobile portrait and landscape
  btn: {
    width: '100%',
    minHeight: 48,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    flexGrow: 0,
    flexShrink: 0,
  },

  // Large button — iPad
  btnLarge: {
    width: '100%',
    minHeight: 52,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    flexGrow: 0,
    flexShrink: 0,
  },

  primary: {
    backgroundColor: TEAL,
  },

  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: TEAL,
  },

  disabled: {
    backgroundColor: '#D5E8E7',
    borderColor: '#D5E8E7',
  },

  pressed: {
    opacity: 0.86,
  },

  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.1,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },

  labellarge: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.1,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },

  labelGhost: {
    color: TEAL,
  },

  labelDisabled: {
    color: '#9BBCBA',
  },
});
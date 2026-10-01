import { StyleSheet, Platform } from 'react-native';
import { scale, verticalScale } from '../utils/scale';

export const Colors = {
  teal: '#11A9A0',
  tealDark: '#0A9E96',
  tealLight: '#E1F5EE',
  tealText: '#085041',

  red: '#E24B4A',
  redLight: '#FCEBEB',
  redText: '#A32D2D',

  ink: '#111827',
  inkSecondary: '#4B5563',
  muted: '#9CA3AF',
  border: '#E5E7EB',
  surface: '#F4F6F7',
  white: '#FFFFFF',
};

export const common = StyleSheet.create({
   screen: {
    flex: 1,
    backgroundColor: Colors.surface,
  },

   header: {
    backgroundColor: Colors.tealDark,
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(Platform.OS === 'ios' ? 8 : 14),
    paddingBottom: verticalScale(16),
  },
  headerBackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  headerBackButton: {
    marginRight: scale(10),
    padding: scale(2),
  },
  headerStepLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 2,
  },

   card: {
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: scale(16),
    borderWidth: 0.5,
    borderColor: Colors.border,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: verticalScale(12),
  },

  // ── Buttons ──
  buttonPrimary: {
    backgroundColor: Colors.teal,
    borderRadius: scale(10),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimaryDisabled: {
    backgroundColor: '#D9E4E3',
  },
  buttonPrimaryText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  buttonPrimaryTextDisabled: {
    color: '#9FB0AE',
  },
  buttonOutline: {
    borderWidth: 1.5,
    borderColor: Colors.teal,
    borderRadius: scale(10),
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  buttonOutlineText: {
    color: Colors.teal,
    fontSize: 13.5,
    fontWeight: '700',
  },

  // ── Badge (Passed / Failed pills) ──
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: scale(10),
    paddingVertical: 4,
    borderRadius: scale(20),
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeNeutral: { backgroundColor: '#EEF0F1' },
  badgeNeutralText: { color: Colors.inkSecondary },
  badgePass: { backgroundColor: Colors.tealLight },
  badgePassText: { color: Colors.tealText },
  badgeFail: { backgroundColor: Colors.redLight },
  badgeFailText: { color: Colors.redText },
});
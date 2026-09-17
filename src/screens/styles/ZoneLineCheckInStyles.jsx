import { StyleSheet, Platform, Dimensions } from 'react-native';
import { AppColors } from '../../theme/theme';

const { width: W } = Dimensions.get('window');
const H_PAD = Math.min(Math.max(W * 0.042, 14), 20);

const TEAL = AppColors.primary ?? '#0A9E96';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: TEAL,
  },

  header: {
    backgroundColor: TEAL,
    paddingHorizontal: H_PAD,
    // Fixed: was a duplicate key before (paddingTop set twice, the
    // platform-based value was dead code and always got overridden
    // by a flat 50). Now there's one value, and it responds to
    // orientation instead of always being 50.
    paddingTop: Platform.OS === 'android' ? 14 : 6,
    paddingBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 10,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.78)',
    marginBottom: 10,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },

  body: {
    flex: 1,
    backgroundColor: AppColors.background ?? '#F3F6F6',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 18,
    paddingHorizontal: H_PAD,
  },

  listContent: {
    paddingBottom: 8,
  },

  emptyText: {
    fontSize: 15,
    color: '#7A9090',
    textAlign: 'center',
    marginTop: 36,
  },

  footer: {
    backgroundColor: AppColors.surface ?? '#fff',
    paddingHorizontal: H_PAD,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 26 : 35,
    borderTopWidth: 1,
    borderTopColor: '#E8EDED',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 6 },
    }),
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});

// ── Landscape-only overrides ──────────────────────────────────────────────
// Kept as a SEPARATE object rather than editing the values above, so
// portrait is guaranteed untouched — the screen only merges these in
// when width > height.
export const landscapeStyles = StyleSheet.create({
  header: {
    paddingTop: 2,
    paddingBottom: 5,
  },
  title: {
    fontSize: 19,
    marginTop: 2,
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 6,
  },
  body: {
    paddingTop: 10,
  },
  footer: {
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 25,
  },
});

export default styles;
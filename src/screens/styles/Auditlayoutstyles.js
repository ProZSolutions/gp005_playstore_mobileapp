import { Platform, StyleSheet } from 'react-native';
import { AppColors } from '../../theme/theme';
import Dimensions from '../../theme/dimensions';
import { mvs } from '../../utils/scale';

/**
 * NEW styles only - nothing in GlobalStyles (container/text/button/icon) is edited.
 * Every value below reuses the same Dimensions / AppColors tokens your existing
 * header + footer styles already use, so the look stays the same.
 */

const HEADER_RADIUS = Dimensions.radius.header;

// Same max widths your body styles already use:
//   scrollContent / fixedCardWrap / footer            -> 640
//   scrollContentLarge / fixedCardWrapLarge / footerpor -> 800
//   scrollContentLand  / fixedCardWrapLand  / footerLand -> 1200 (footerLand is 1350)
export const HEADER_MAX_WIDTH = {
  mobile: 640,
  largePortrait: 800,
  largeLandscape: 1200,
};

const AuditLayoutStyles = StyleSheet.create({
  // ── Audit header ─────────────────────────────────────────────────────────
  // Same look as container.header (teal, bottom radius, bottom padding). The top
  // padding and the left/right padding are applied in the component because they
  // depend on the device safe-area insets.
  headerWrap: {
    backgroundColor: AppColors.primary,
    paddingBottom: Dimensions.spacing.headerPaddingBottom,
    borderBottomLeftRadius: HEADER_RADIUS,
    borderBottomRightRadius: HEADER_RADIUS,
  },
  // Keeps header content on the same centred column as the body on tablets.
  headerInner: {
    width: '100%',
    alignSelf: 'center',
  },
  // container.headerTopRow is defined twice in GlobalStyles (the Dashboard copy wins
  // and adds its own horizontal/top padding), so the audit header gets its own row.
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
    marginTop: 20, // same as container.headerTopRowL
  },
  headerTopRowCompact: {
    marginBottom: mvs(6),
  },

  // ── Footer bar ───────────────────────────────────────────────────────────
  // container.footer / footerpor / footerLand are centred with a maxWidth, so on a
  // tablet the strip beside them shows whatever is behind. This full-width bar
  // paints that strip. The border + shadow move up to the bar; the inner footer
  // keeps every other property exactly as it is.
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
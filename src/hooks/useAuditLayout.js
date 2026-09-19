import { useMemo } from 'react';
import { useResponsive } from '../utils/responsive';
import { useOrientation } from './useOrientation';
 
export default function useAuditLayout() {
  const { isLargeScreen } = useResponsive();
  const { isLandscape } = useOrientation();

  return useMemo(() => {
    const large = !!isLargeScreen;
    const land = !!isLandscape;

    const pickStyle = (largePortrait, largeLandscape, mobilePortrait, mobileLandscape) =>
      large ? (land ? largeLandscape : largePortrait) : (land ? mobileLandscape : mobilePortrait);

    return {
      isLargeScreen: large,
      isLandscape: land,
      isPhoneLandscape: land && !large,
      // A phone in landscape has no spare height for a pinned card, so the
      // operator card scrolls with the content there. Everywhere else it stays pinned.
      pinOperatorCard: !(land && !large),
      pickStyle,
    };
  }, [isLargeScreen, isLandscape]);
}
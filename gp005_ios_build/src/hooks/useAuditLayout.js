import { useMemo } from 'react';
import { useResponsive } from '../utils/responsive';
import { useOrientation } from './useOrientation';

export default function useAuditLayout() {
  const { isLargeScreen } = useResponsive();
  const { isLandscape } = useOrientation();

  return useMemo(() => { 
    const large = false;
    const land = !!isLandscape;

    const pickStyle = (largePortrait, largeLandscape, mobilePortrait, mobileLandscape) =>
      large ? (land ? largeLandscape : largePortrait) : (land ? mobileLandscape : mobilePortrait);

    return {
      isLargeScreen: large,
      isLandscape: land,
      isPhoneLandscape: land && !large,
      pinOperatorCard: !(land && !large),
      pickStyle,
    };
  }, [isLandscape]);
}
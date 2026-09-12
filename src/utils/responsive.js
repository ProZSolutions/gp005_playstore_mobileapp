import { useMemo } from 'react';
import { Platform, PixelRatio, useWindowDimensions } from 'react-native';

const GUIDELINE_BASE_WIDTH = 375;
const GUIDELINE_BASE_HEIGHT = 812;

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    // Scale off the short/long edge, not raw width/height. Raw width/height
    // swap when a screen is rotated (e.g. a landscape-locked screen), which
    // made widthRatio balloon from ~1.0 to ~2.16 and every moderateScale/
    // fontScale value roughly double. Using shortDim/longDim keeps scaling
    // consistent with the portrait-designed layout regardless of orientation.
    const shortDim = Math.min(width, height);
    const longDim = Math.max(width, height);

    const widthRatio = shortDim / GUIDELINE_BASE_WIDTH;
    const heightRatio = longDim / GUIDELINE_BASE_HEIGHT;

    const scale = (size) => widthRatio * size;
    const verticalScale = (size) => heightRatio * size;
    const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
    const moderateVerticalScale = (size, factor = 0.5) =>
      size + (verticalScale(size) - size) * factor;
    const fontScale = (size) => PixelRatio.roundToNearestPixel(moderateScale(size));

    // isLargeScreen still checks actual width so tablet-in-landscape and
    // tablet-in-portrait both register correctly (short-dim check would
    // misclassify a landscape phone as "large").
    const isLargeScreen = width >= 600;

    return {
      width,
      height,
      scale,
      verticalScale,
      moderateScale,
      moderateVerticalScale,
      fontScale,
      isLargeScreen,
    };
  }, [width, height]);
}
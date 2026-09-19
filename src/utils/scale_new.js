import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812; 
const EFFECTIVE_WIDTH = Math.min(SCREEN_WIDTH, BASE_WIDTH);
const EFFECTIVE_HEIGHT = Math.min(SCREEN_HEIGHT, BASE_HEIGHT);

export function scale(size) {
  return (EFFECTIVE_WIDTH / BASE_WIDTH) * size;
}

export function verticalScale(size) {
  return (EFFECTIVE_HEIGHT / BASE_HEIGHT) * size;
}

export function moderateScale(size, factor = 0.5) {
  return size + (scale(size) - size) * factor;
}

export function moderateVerticalScale(size, factor = 0.5) {
  return size + (verticalScale(size) - size) * factor;
}

export function fontScale(size) {
  return size;
}

export const ms  = scale;
export const mvs = verticalScale;
export const fs  = fontScale;

export const screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 360,
  isTablet: SCREEN_WIDTH >= 768,
};

export const bottomSpace = Platform.select({ ios: 24, android: 0, default: 0 });
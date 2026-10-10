import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  PanResponder,
  StyleSheet,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import { screen } from '../utils/scale';

export default function CustomSlider({
  minimumValue = 0,
  maximumValue = 24,
  step = 1,
  value = 0,
  onValueChange,
  gradientColors = ['#0D939D', '#0D939D'],
  maximumTrackTintColor = '#E5E7EB',
  thumbColor = '#FFFFFF',
  thumbBorderColor = '#0D939D',
  style,
}) {
  const [sliderWidth, setSliderWidth] = useState(0);
  const [internalValue, setInternalValue] = useState(value);

  const widthRef = useRef(0);
  const sliderPageX = useRef(0);
  const latestProps = useRef({});

  const thumbSize = screen.isTablet ? 25 : 20;
  const trackHeight = screen.isTablet ? 18 : 4;
  const containerHeight = screen.isTablet ? 100 : 40;

  latestProps.current = {
    minimumValue,
    maximumValue,
    step,
    onValueChange,
  };

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const updateFromPageX = (pageX) => {
    const {
      minimumValue: min,
      maximumValue: max,
      step: currentStep,
      onValueChange: onChange,
    } = latestProps.current;

    const width = widthRef.current;

    if (width <= 0 || max <= min) {
      return;
    }

    const usableWidth = Math.max(1, width - thumbSize);

    // Calculate position relative to the slider's left edge.
    const localX = pageX - sliderPageX.current;

    const adjustedX = Math.max(
      0,
      Math.min(usableWidth, localX - thumbSize / 2),
    );

    const ratio = adjustedX / usableWidth;

    const rawValue = min + ratio * (max - min);
    const safeStep = currentStep > 0 ? currentStep : 1;

    const steppedValue =
      min + Math.round((rawValue - min) / safeStep) * safeStep;

    const nextValue = Number(
      Math.max(min, Math.min(max, steppedValue)).toFixed(10),
    );

    setInternalValue(nextValue);
    onChange?.(nextValue);
  };

  const updateFromPageXRef = useRef(updateFromPageX);
  updateFromPageXRef.current = updateFromPageX;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,

      onPanResponderGrant: (event) => {
        updateFromPageXRef.current(event.nativeEvent.pageX);
      },

      onPanResponderMove: (event) => {
        updateFromPageXRef.current(event.nativeEvent.pageX);
      },
    }),
  ).current;

  const range = maximumValue - minimumValue;

  const ratio =
    range > 0
      ? Math.max(
          0,
          Math.min(1, (internalValue - minimumValue) / range),
        )
      : 0;

  const usableWidth = Math.max(0, sliderWidth - thumbSize);
  const thumbLeft = usableWidth * ratio;

  // Fill ends at the center of the thumb.
  const fillWidth = thumbSize / 2 + usableWidth * ratio;

  return (
    <View
      style={[
        styles.hitBox,
        { height: containerHeight },
        style,
      ]}
      onLayout={(event) => {
        widthRef.current = event.nativeEvent.layout.width;
        setSliderWidth(event.nativeEvent.layout.width);
      }}
      onStartShouldSetResponder={() => false}
      {...panResponder.panHandlers}
    >
      <View
        style={[
          styles.track,
          {
            height: trackHeight,
            backgroundColor: maximumTrackTintColor,
          },
        ]}
      >
        {ratio > 0 && (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.fill,
              {
                width: fillWidth,
                height: trackHeight,
              },
            ]}
          />
        )}
      </View>

      <View
        pointerEvents="none"
        style={[
          styles.thumb,
          {
            width: thumbSize,
            height: thumbSize,
            borderRadius: thumbSize / 2,
            left: thumbLeft,
            backgroundColor: thumbColor,
            borderColor: thumbBorderColor,
            top: (containerHeight - thumbSize) / 2 - (screen.isTablet ? 2 : 0),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hitBox: {
    width: '100%',
    justifyContent: 'center',
    position: 'relative',
  },

  track: {
     width: '100%',
  borderRadius: 8,
  overflow: 'hidden',
  alignSelf: 'center',
  },

  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 8,
  },

  thumb: {
    position: 'absolute',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
  },
});
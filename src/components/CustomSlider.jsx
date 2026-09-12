import React, { useRef, useState, useCallback } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
// If you're on Expo instead, swap the import above for:
// import { LinearGradient } from 'expo-linear-gradient';

export default function CustomSlider({
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  value = 0,
  onValueChange,
  // Gradient used for the filled portion of the track (left → thumb).
  // Defaults approximate the teal → green gradient in the design.
  gradientColors = ['#14B8A6', '#22C55E'],
  maximumTrackTintColor = '#E5E7EB',
  thumbColor = '#FFFFFF',
  thumbBorderColor = '#14B8A6',
  style,
}) {
  const widthRef = useRef(0);                         // always-current width
  const [sliderWidth, setSliderWidth] = useState(0);  // only for re-render/UI math
  const [internalValue, setInternalValue] = useState(value);

  const clampToStep = useCallback((v) => {
    const stepped = Math.round(v / step) * step;
    return Math.min(maximumValue, Math.max(minimumValue, stepped));
  }, [minimumValue, maximumValue, step]);

  const updateFromX = useCallback((x) => {
    const w = widthRef.current;            // read live ref, not stale state
    if (w <= 0) return;
    const ratio = Math.min(1, Math.max(0, x / w));
    const rawValue = minimumValue + ratio * (maximumValue - minimumValue);
    const finalValue = clampToStep(rawValue);
    setInternalValue(finalValue);
    onValueChange?.(finalValue);
  }, [minimumValue, maximumValue, clampToStep, onValueChange]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // Prevent the parent ScrollView from stealing the gesture mid-drag
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => updateFromX(e.nativeEvent.locationX),
      onPanResponderMove: (e) => updateFromX(e.nativeEvent.locationX),
    })
  ).current;

  const ratio = (internalValue - minimumValue) / (maximumValue - minimumValue);
  const filledWidth = sliderWidth * ratio;
  // Keep the thumb fully inside the track bounds at both ends
  const thumbLeft = Math.min(Math.max(filledWidth - 10, -2), sliderWidth - 18);

  return (
    <View
      style={[styles.hitBox, style]}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        widthRef.current = w;               // update ref immediately
        setSliderWidth(w);                  // trigger re-render for visuals
      }}
      hitSlop={{ top: 15, bottom: 15, left: 10, right: 10 }}
      {...panResponder.panHandlers}
    >
      <View style={[styles.track, { backgroundColor: maximumTrackTintColor }]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: filledWidth }]}
        />
      </View>
      <View
        style={[
          styles.thumb,
          {
            left: thumbLeft,
            backgroundColor: thumbColor,
            borderColor: thumbBorderColor,
          },
        ]}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hitBox: { height: 40, justifyContent: 'center' },
  track: { height: 4, borderRadius: 2, width: '100%', overflow: 'hidden' },
  fill: { position: 'absolute', height: 4, borderRadius: 2, left: 0, top: 0 },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    top: 10,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
  },
});
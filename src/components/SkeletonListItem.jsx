import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const SHIMMER_DURATION = 1100;
 
export function SkeletonListItem({ showCheckbox = true, style }) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: SHIMMER_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: SHIMMER_DURATION,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.row, { opacity }, style]}>
       <View style={styles.textBlock}>
        <View style={[styles.bone, styles.titleBone]} />
        <View style={[styles.bone, styles.subtitleBone]} />
      </View>
       {showCheckbox && <View style={styles.checkboxBone} />}
    </Animated.View>
  );
}
 
export function SkeletonList({ count = 5, showCheckbox = true }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonListItem
          key={i}
          showCheckbox={showCheckbox}
          style={i === 0 ? undefined : { marginTop: 10 }}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: '#F0F0F0',
    borderRadius:    12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  textBlock: {
    flex: 1,
  },
  bone: {
    backgroundColor: '#D8D8D8',
    borderRadius:    4,
  },
  titleBone: {
    height: 14,
    width:  '55%',
    marginBottom: 8,
  },
  subtitleBone: {
    height: 11,
    width:  '38%',
  },
  checkboxBone: {
    width:        20,
    height:       20,
    borderRadius: 4,
    backgroundColor: '#D8D8D8',
    marginLeft:   12,
  },
});
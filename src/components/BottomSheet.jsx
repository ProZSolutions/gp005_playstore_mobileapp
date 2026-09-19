import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Animated,
  StyleSheet,
  Platform,
  Keyboard,
} from 'react-native';
import { AppColors } from '../theme/theme';
import { useResponsive } from '../utils/responsive';
import { useOrientation } from '../hooks/useOrientation';

export default function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  maxHeight,
  children,
}) { 
  const { scale, verticalScale, fontScale, moderateScale, height: SCREEN_H, isLargeScreen } =
    useResponsive();
  const { isLandscape } = useOrientation();
  const TOP_SAFE_MARGIN = verticalScale(40);

  const styles = useMemo(
    () => createStyles({ scale, verticalScale, fontScale, moderateScale, isLargeScreen }),
    [scale, verticalScale, fontScale, moderateScale, isLargeScreen],
  );

  const pickStyle = (largePortrait, largeLandscape, mobilePortrait, mobileLandscape) =>   isLargeScreen ? (isLandscape ? largeLandscape : largePortrait): 
(isLandscape ? mobileLandscape : mobilePortrait);

  const translateY = useRef(new Animated.Value(SCREEN_H)).current;

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvt, (e) => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener(hideEvt, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 24,
        mass: 0.85,
        stiffness: 200,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_H,
        duration: 230,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, SCREEN_H]);

  const effectiveMaxHeight = keyboardHeight > 0
    ? Math.min(maxHeight ?? SCREEN_H, SCREEN_H - keyboardHeight - TOP_SAFE_MARGIN)
    : maxHeight;

  const handleBackdropPress = () => {
    if (keyboardHeight > 0) {
      Keyboard.dismiss();
      return;
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={[styles.kavWrapper, { paddingBottom: keyboardHeight }]} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.sheet,
            effectiveMaxHeight ? { maxHeight: effectiveMaxHeight } : {},
            { transform: [{ translateY }] },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
 
const createStyles = ({ scale, verticalScale, fontScale, moderateScale, isLargeScreen }) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: AppColors.scrim,
    },
    kavWrapper: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: isLargeScreen ? 'center' : 'stretch',
    },
    sheet: {
      backgroundColor: AppColors.surface,
      width: isLargeScreen ? '100%' : undefined, 
      maxWidth: isLargeScreen ? 820 : undefined,
      alignSelf: isLargeScreen ? 'center' : 'stretch',
      borderTopLeftRadius: isLargeScreen ? 24 : moderateScale(24),
      borderTopRightRadius: isLargeScreen ? 24 : moderateScale(24),       
      borderBottomLeftRadius: isLargeScreen ? 0 : 0,
      borderBottomRightRadius: isLargeScreen ? 0 : 0,
      marginBottom: isLargeScreen ? 0 : 0,
      paddingBottom: isLargeScreen
        ? 20
        : Platform.OS === 'ios' ? verticalScale(32) : verticalScale(20),
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -4 },
        },
        android: { elevation: 20 },
      }),
    },
    handle: {
      width: isLargeScreen ? 40 : scale(36),
      height: isLargeScreen ? 4 : verticalScale(4),
      borderRadius: 2,
      backgroundColor: AppColors.neutral300,
      alignSelf: 'center',
      marginTop: isLargeScreen ? 12 : verticalScale(10),
      marginBottom: isLargeScreen ? 6 : verticalScale(4),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: isLargeScreen ? 24 : scale(20),
      paddingVertical: isLargeScreen ? 16 : verticalScale(14),
      borderBottomWidth: 1,
      borderBottomColor: AppColors.divider,
      gap: isLargeScreen ? 10 : scale(8),
    },
    title: {
      fontSize: isLargeScreen ? 26 : fontScale(19),
      fontWeight: '800',
      color: AppColors.textPrimary,
      letterSpacing: -0.3,
      fontFamily:'Inter-Regular'
    },
    subtitle: {
      fontSize: isLargeScreen ? 20 : fontScale(15),
      color: AppColors.textTertiary,
      marginTop: isLargeScreen ? 3 : verticalScale(2),
      fontFamily:'Inter-Regular'
    },
    
    closeBtn: {
      width: isLargeScreen ? 32 : scale(28),
      height: isLargeScreen ? 32 : scale(28),
      borderRadius: isLargeScreen ? 16 : scale(14),
      backgroundColor: AppColors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeIcon: {
      fontSize: isLargeScreen ? 15 : fontScale(14),
      color: AppColors.textSecondary,
      fontWeight: '700',
    },
  });
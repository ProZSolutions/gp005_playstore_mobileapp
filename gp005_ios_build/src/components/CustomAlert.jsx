import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useResponsive } from '../utils/responsive';

const alertConfig = {
  success: { icon: 'check-circle', color: '#4CAF50' },
  error: { icon: 'cancel', color: '#F44336' },
  warning: { icon: 'warning', color: '#FF9800' },
  confirm: { icon: 'help', color: '#4A90E2' },
  info: { icon: 'info', color: '#4A90E2' },
  network: { icon: 'wifi-off', color: '#F44336' },
  block: { icon: 'block', color: '#F44336' },
};

const DEFAULT_PRIMARY_COLOR = '#4A90E2';

export default function CustomAlert({
  visible,
  type = 'success',
  icon,
  title,
  message,
  onClose,
  duration = 3000,
  buttons,
  primaryColor, // optional override
}) { 
  const { height } = useWindowDimensions();
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs, isLargeScreen } = useResponsive();
  const styles = React.useMemo(
    () => createStyles(ms, mvs, fs, isLargeScreen),
    [ms, mvs, fs, isLargeScreen],
  );

  const translateY = useRef(new Animated.Value(height)).current;
  const config = alertConfig[type] || alertConfig.success;
  const iconName = icon || config.icon;

  // 👇 Default button color now comes from alert type
  const buttonPrimaryColor = primaryColor || config.color || DEFAULT_PRIMARY_COLOR;

  const hasButtons = Array.isArray(buttons) && buttons.length > 0;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      if (!hasButtons) {
        const timer = setTimeout(() => {
          hideAlert();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const hideAlert = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose && onClose();
    });
  };

  const handleButtonPress = (btn) => {
    hideAlert();
    btn.onPress && setTimeout(() => btn.onPress(), 300);
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={hideAlert}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.alertBox,
            { transform: [{ translateY }] },
          ]}
        >
          <Icon name={iconName} size={isLargeScreen ? 52 : ms(40)} color={config.color} />
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <Text style={styles.message}>{message}</Text>

          {hasButtons && (
            <View style={styles.buttonRow}>
              {buttons.map((btn, idx) => {
                const isCancel = btn.style === 'cancel';
                const isDestructive = btn.style === 'destructive';
                const isWar = btn.style === 'move';
                const defaultBg = !isCancel && !isDestructive && !isWar
                  ? { backgroundColor: buttonPrimaryColor }
                  : null;

                return (
                  <Pressable
                    key={idx}
                    style={({ pressed }) => [
                      styles.button,
                      defaultBg,
                      isCancel && styles.cancelButton,
                      isDestructive && styles.destructiveButton,
                      isWar && styles.warninnButton,
                      pressed && { opacity: 0.8 },
                    ]}
                    onPress={() => handleButtonPress(btn)}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        isCancel && styles.cancelButtonText,
                        isDestructive && styles.destructiveButtonText,
                        isWar && styles.destructiveButtonText,
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}
 
const createStyles = (ms, mvs, fs, isLargeScreen) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: isLargeScreen ? 'stretch' : 'stretch',
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    alertBox: {
      backgroundColor: '#FFFFFF',
      width: isLargeScreen ? '100%' : undefined,
      maxWidth: isLargeScreen ? 480 : undefined,
      alignSelf: isLargeScreen ? 'center' : 'stretch',
      borderTopLeftRadius: isLargeScreen ? 20 : ms(16),
      borderTopRightRadius: isLargeScreen ? 20 : ms(16),
      borderBottomLeftRadius: isLargeScreen ? 20 : 0,
      borderBottomRightRadius: isLargeScreen ? 20 : 0,
      marginBottom: isLargeScreen ? 24 : 0,
      padding: isLargeScreen ? 32 : ms(24),
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 10,
    },
    title: {
      fontSize: isLargeScreen ? 22 : fs(18),
      fontWeight: 'bold',
      marginTop: isLargeScreen ? 14 : mvs(10),
      color: '#333',
    },
    message: {
      fontSize: isLargeScreen ? 16.5 : fs(14),
      color: '#555',
      textAlign: 'center',
      marginTop: isLargeScreen ? 8 : mvs(6),
      lineHeight: isLargeScreen ? 24 : undefined,
    },
    buttonRow: {
      flexDirection: 'row',
      marginTop: isLargeScreen ? 26 : mvs(20),
      width: '100%',
      gap: isLargeScreen ? 14 : ms(10),
    },
    button: {
      flex: 1,
      paddingVertical: isLargeScreen ? 15 : mvs(12),
      borderRadius: isLargeScreen ? 10 : ms(8),
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: isLargeScreen ? 16 : fs(14),
    },
    cancelButton: {
      backgroundColor: '#F0F0F0',
    },
    cancelButtonText: {
      color: '#333',
    },
    destructiveButton: {
      backgroundColor: '#F44336',
    },
    warninnButton: {
      backgroundColor: '#FF9800',
    },
    destructiveButtonText: {
      color: '#FFFFFF',
    },
  });
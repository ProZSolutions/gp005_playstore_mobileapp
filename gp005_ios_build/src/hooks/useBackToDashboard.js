import { useEffect, useCallback } from 'react';
import { BackHandler, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export function useBackToDashboard(navigation, targetScreen = 'Dashboard', guard, onLeave) {
  const goToDashboard = useCallback(() => {
    onLeave?.();
    navigation.navigate(targetScreen);
  }, [navigation, targetScreen, onLeave]);

  const handleBackPress = useCallback(() => {
    if (guard && guard()) return true; // guard already handled it (e.g. confirm dialog)

    if (navigation.canGoBack()) {
      navigation.goBack();   // real previous screen — the normal case
      return true;
    }

    goToDashboard();          // nothing to pop to — fallback instead of exiting
    return true;
  }, [navigation, guard, goToDashboard]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      const actionType = e.data.action.type;
      if (!['POP', 'POP_TO_TOP', 'GO_BACK'].includes(actionType)) return;
      if (guard && guard()) {
        e.preventDefault(); // only block when the guard says so
      }
      // otherwise let the normal back action proceed
    });
    return unsubscribe;
  }, [navigation, guard]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return undefined;
      const sub = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => sub.remove();
    }, [handleBackPress])
  );

  return goToDashboard;
}
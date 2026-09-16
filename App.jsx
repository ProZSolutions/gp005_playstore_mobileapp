// App.jsx
import React, { useState, useRef, useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { lightTheme, darkTheme, AppColors } from './src/theme/theme';
import { navigationRef } from './src/navigation/NavigationService';

import { AlertProvider } from './src/context/AlertContext';
import 'react-native-get-random-values';

import NotificationService from './src/api/services/NotificationService';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { SystemBars } from 'react-native-edge-to-edge';
import { AppState, Platform, BackHandler } from 'react-native';

// notifee channel creation now lives inside NotificationService.init() — removed duplicate here

function applyNavBarOnly() {
  if (Platform.OS !== 'android') return;
  SystemNavigationBar.navigationHide(); // hides ONLY the bottom nav bar
}


export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    NotificationService.init();
    applyNavBarOnly();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') applyNavBarOnly();
    });

    return () => {
      sub.remove();
      NotificationService.destroy();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onHardwareBack = () => {
     /* const nav = navigationRef.current;
      if (!nav) return false;

      if (nav.canGoBack()) {
        nav.goBack();
        return true; // handled — don't exit
      }
      nav.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
      return true; */

      applyNavBarOnly();
      if (!navigationRef.isReady()) return false;
      if (navigationRef.canGoBack()) {
        navigationRef.goBack();
        return true;
      }
      //navigationRef.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <SystemBars style="light" />
      <PaperProvider theme={theme}>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => NotificationService.consumePendingNavigation()}
        >
          <AlertProvider>
            <AppNavigator toggleTheme={() => setIsDark((d) => !d)} isDark={isDark} />
          </AlertProvider>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
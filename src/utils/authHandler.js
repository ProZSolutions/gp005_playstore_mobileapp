// utils/authHandler.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { navigationRef } from '../navigation/NavigationService';

export const handleUnauthorizedLogout = async (message = '') => {
  const normalizedMessage = message?.trim()?.toLowerCase();

  const invalidTokenMessages = [
    'invalid token',
    'jwt malformed',
    'jwt expired',
    'unauthorized',
    'token expired',
    'access denied'
  ];

  const shouldLogout = invalidTokenMessages.some((text) =>
    normalizedMessage.startsWith(text)
  );

  if (!shouldLogout) return false;

 
  // clear storage
  await AsyncStorage.multiRemove([
    'auth_token',
    'user',
  ]);

  // reset navigation
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
  }

  return true;
};
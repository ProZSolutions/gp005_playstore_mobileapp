import './disableFontScaling';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { applyGlobalFont } from './src/theme/applyGlobalFont';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';

const TAG = '[index.js]';

applyGlobalFont();

// Background handler — DO NOT call displayNotification here.
// The OS auto-displays notifications that include a `notification` block
// while the app is backgrounded/killed. Calling displayNotification here too
// causes DUPLICATE notifications.
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log(`${TAG} ========== BACKGROUND MESSAGE RECEIVED ==========`);
  console.log(`${TAG} Full remoteMessage:`, JSON.stringify(remoteMessage, null, 2));
  console.log(`${TAG} Notification block:`, JSON.stringify(remoteMessage?.notification));
  console.log(`${TAG} Data block:`, JSON.stringify(remoteMessage?.data));
  console.log(`${TAG} Android channelId sent by backend:`, remoteMessage?.android?.notification?.channelId);
  console.log(`${TAG} ==================================================`);


  /*await notifee.displayNotification({
    title: remoteMessage.notification?.title ?? remoteMessage.data?.title,
    body: remoteMessage.notification?.body ?? remoteMessage.data?.body,
    data: remoteMessage.data,
    android: {
      channelId: 'default_v3',
      pressAction: { id: 'default' },
      sound: 'custom_sound',
      smallIcon: 'ic_notification',
      color: '#0A9E96',
    },
  }); */

  // Intentionally NOT calling notifee.displayNotification() here —
  // see comment above.
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log(`${TAG} onBackgroundEvent() type=${type}`, JSON.stringify(detail));
  if (type === EventType.PRESS) {
    console.log(`${TAG} Notification pressed in background:`, JSON.stringify(detail.notification));
  }
});

AppRegistry.registerComponent(appName, () => App);
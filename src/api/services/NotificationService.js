import messaging from '@react-native-firebase/messaging';
import notifee, { EventType, AndroidImportance, AndroidStyle } from '@notifee/react-native';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from '../../navigation/NavigationService';
 import apiRequest from '../apiRequest';
import ENDPOINTS from '../../api/endpoints';
import { showAlert } from '../../utils/AlertService';
import { getUser, savePendingNotification, getPendingNotification, clearPendingNotification } from '../../api/storage/authStorage';
const PENDING_NOTIFICATION_KEY = 'pending_notification_data';
const CHANNEL_ID = 'default_v5'; // single source of truth — change ONLY here
const TAG = '[NotificationService]';

// Map request_type -> screen name (adjust to match your navigator's route names)
const REQUEST_TYPE_SCREEN_MAP = {
  tls_issue: 'TLSIssueTracker',
  tls_audit: 'TLSAuditScreen',
  aql_audit: 'AQLAuditList',
  checking: 'CheckingList',
  rework: 'ReworkListScreen',
  rework_tracker: 'ReworkTrackerList',
  rejection: 'RejectionListScreen',
  rejection_tracker: 'RejectionTrackerList',
  qc_verification: 'QCVerification',
  inputlist: 'InputListScreen',
};

class NotificationService {
  unsubscribeOnMessage = null;
  unsubscribeOnTokenRefresh = null;
  unsubscribeForegroundEvent = null;

  constructor() { 
    this._resolveInitialNotificationReady = null;
    this.initialNotificationReady = new Promise((resolve) => {
      this._resolveInitialNotificationReady = resolve;
    });
  }

  async init() {
    console.log(`${TAG} ========== INIT START ==========`);

   
    await this.checkInitialNotification();
    this._resolveInitialNotificationReady();

    await this.createChannel();
    await this.debugCheckChannel();       // confirms channel actually exists
    await this.requestPermission();
    await this.debugCheckPermission();    // confirms permission state
    await this.registerToken();
    this.listenForTokenRefresh();
    this.listenForForegroundMessages();
    this.listenForForegroundTaps();
    this.listenForBackgroundTaps();
    console.log(`${TAG} ========== INIT COMPLETE ==========`);
  }

  async createChannel() {
    try {
      const returnedId = await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
        lightColor: '#0A9E96',
        sound: 'custom_sound',
      });
      console.log(`${TAG} createChannel() success, returned id:`, returnedId);
    } catch (e) {
      console.log(`${TAG} createChannel() FAILED:`, e);
    }
  }

  // Reads back all channels currently registered on the device
  async debugCheckChannel() {
    try {
      const channels = await notifee.getChannels();
      console.log(`${TAG} All channels on device:`, JSON.stringify(channels, null, 2));

      const target = channels.find((c) => c.id === CHANNEL_ID);
      if (!target) {
        console.log(`${TAG} ⚠️ WARNING: Channel "${CHANNEL_ID}" NOT FOUND on device!`);
      } else {
        console.log(`${TAG} ✅ Channel "${CHANNEL_ID}" confirmed present:`, JSON.stringify(target));
      }
    } catch (e) {
      console.log(`${TAG} debugCheckChannel() error:`, e);
    }
  }

  async requestPermission() {
    console.log(`${TAG} Requesting permission...`);

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const alreadyGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      console.log(`${TAG} POST_NOTIFICATIONS already granted?`, alreadyGranted);

      if (!alreadyGranted) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Enable Notifications',
            message: 'We need permission to send you notifications about assigned issues.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );
        console.log(`${TAG} PermissionsAndroid.request() result:`, result);

        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log(`${TAG} ⚠️ POST_NOTIFICATIONS denied by user`);
          showAlert('error', 'Notifications Disabled', 'Please enable notification permission to receive updates.');
          return false;
        }
      }
    }

    const authStatus = await messaging().requestPermission();
    console.log(`${TAG} requestPermission() raw authStatus:`, authStatus);

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log(`${TAG} ⚠️ Permission DENIED`);
      showAlert('error', 'Notifications Disabled', 'Please enable notification permission to receive updates.');
      return false;
    }

    console.log(`${TAG} ✅ Permission granted`);

    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
      console.log(`${TAG} iOS registerDeviceForRemoteMessages() done`);
    }
    return true;
  }

  // Separate detailed check using Notifee's own permission API too
  async debugCheckPermission() {
    try {
      const settings = await notifee.getNotificationSettings();
      console.log(`${TAG} notifee.getNotificationSettings():`, JSON.stringify(settings, null, 2));
      // authorizationStatus: -1 = NOT_DETERMINED, 0 = DENIED, 1 = AUTHORIZED, 2 = PROVISIONAL
    } catch (e) {
      console.log(`${TAG} debugCheckPermission() error:`, e);
    }
  }

  async getUserId() {
    try {
      const savedUser = await getUser();
      console.log(`${TAG} getUserId() savedUser:`, JSON.stringify(savedUser));
      return savedUser?.id ?? null;
    } catch (e) {
      console.log(`${TAG} getUserId() error:`, e);
      return null;
    }
  }

  async sendTokenToBackend(userId, token) {
    console.log(`${TAG} sendTokenToBackend() userId=${userId} token=${token}`);
    try {
      const response = await apiRequest({
        method: 'POST',
        endpoint: ENDPOINTS.NOTIFICATION.REGISTER_TOKEN,
        body: { user_id: userId, fcm_token: token },
      });
      console.log(`${TAG} sendTokenToBackend() response:`, JSON.stringify(response));

      if (!response?.success) {
        showAlert('error', 'Notification Setup Failed', response?.message ?? 'Could not register this device.');
      }
      return response;
    } catch (err) {
      console.log(`${TAG} sendTokenToBackend() FAILED:`, err);
      showAlert('error', 'Notification Setup Failed', err?.message ?? 'Could not reach the server.');
      return null;
    }
  }

  async registerToken() {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        console.log(`${TAG} ⚠️ No userId, skipping token registration`);
        return;
      }

      const token = await messaging().getToken();

      console.log(`${TAG} ========================================`);
      console.log(`${TAG} CURRENT FCM TOKEN:`);
      console.log(token);
      console.log(`${TAG} ========================================`);

      if (!token) {
        console.log(`${TAG} ⚠️ Token is empty/null`);
        showAlert('error', 'Notification Token Invalid', 'Could not generate a valid device token.');
        return;
      }

      await this.sendTokenToBackend(userId, token);
    } catch (err) {
      console.log(`${TAG} registerToken() FAILED:`, err);
      showAlert('error', 'Notification Token Error', err?.message ?? 'Token may have expired.');
    }
  }

  listenForTokenRefresh() {
    this.unsubscribeOnTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
      console.log(`${TAG} onTokenRefresh() fired, newToken:`, newToken);
      const userId = await this.getUserId();
      if (!userId) return;

      if (!newToken) {
        console.log(`${TAG} ⚠️ Refreshed token is empty`);
        showAlert('error', 'Notification Token Expired', 'Your device token expired and could not be renewed.');
        return;
      }

      await this.sendTokenToBackend(userId, newToken);
    });
  }

  // ---- FOREGROUND: app open, must display manually via Notifee ----
 listenForForegroundMessages() {
  this.unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
    console.log(`${TAG} ========== onMessage (FOREGROUND) ==========`);
    console.log(`${TAG} Full remoteMessage:`, JSON.stringify(remoteMessage, null, 2));

    try {
      const rawBody = remoteMessage.data?.body ?? remoteMessage.notification?.body ?? '';
      const normalizedBody = rawBody.replace(/\r\n/g, '\n\n'); // normalize CRLF -> LF
      const largeIconUrl = remoteMessage.data?.image || remoteMessage.notification?.image;
      const title = remoteMessage.notification?.title ?? remoteMessage.data?.title ?? 'Qone';

      const androidConfig = {
        channelId: CHANNEL_ID,
        pressAction: { id: 'default' },
        sound: 'custom_sound',
        smallIcon: 'ic_notification',
        color: '#0A9E96',
        ...(largeIconUrl
          ? {
              style: {
                type: AndroidStyle.MESSAGING,
                person: {
                  name: title,
                  icon: largeIconUrl, // primary avatar-style visual
                },
                messages: [
                  {
                    text: normalizedBody,
                    timestamp: Date.now(),
                  },
                ],
              },
            }
          : {}),
      };

      const notificationId = await notifee.displayNotification({
        id: remoteMessage.messageId,
        title,
        body: normalizedBody,
        data: remoteMessage.data,
        android: androidConfig,
      });
      console.log(`${TAG} ✅ displayNotification() success, id:`, notificationId);
    } catch (e) {
      console.log(`${TAG} ❌ displayNotification() FAILED:`, e);
    }
  });
}

  // Tap while notification was shown by Notifee (foreground case)
  listenForForegroundTaps() {
    this.unsubscribeForegroundEvent = notifee.onForegroundEvent(({ type, detail }) => {
      console.log(`${TAG} onForegroundEvent() type=${type}`, JSON.stringify(detail));
      if (type === EventType.PRESS) {
        this.handleNavigation(detail.notification?.data);
      }
    });
  }

  // ---- BACKGROUND: app minimized, OS shows notification, user taps it ----
  listenForBackgroundTaps() {
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(`${TAG} onNotificationOpenedApp() fired:`, JSON.stringify(remoteMessage));
      if (remoteMessage) {
        this.handleNavigation(remoteMessage.data);
      }
    });
  }

  // ---- KILLED: app fully closed, OS shows notification, tap cold-starts app ----
  async checkInitialNotification() {
  const notifeeInitial = await notifee.getInitialNotification();
  const fcmInitial = await messaging().getInitialNotification();

  console.log(`${TAG} checkInitialNotification() notifeeInitial:`, JSON.stringify(notifeeInitial));
  console.log(`${TAG} checkInitialNotification() fcmInitial:`, JSON.stringify(fcmInitial));

  const data = notifeeInitial?.notification?.data ?? fcmInitial?.data ?? null;

  if (data && (data.request_type || data.screen)) {
    console.log(`${TAG} Cold-start notification data found, stashing for later nav:`, JSON.stringify(data));
    await savePendingNotification(data);
  } else {
    console.log(`${TAG} No cold-start notification data (normal app launch) — clearing any stale pending value`);
    await clearPendingNotification();
  }
}

  async consumePendingNavigation() {
  await this.initialNotificationReady;

  const data = await getPendingNotification();
  console.log(`${TAG} consumePendingNavigation() data:`, JSON.stringify(data));

  if (!data || (!data.request_type && !data.screen)) {
    console.log(`${TAG} No valid pending request_type — staying on landing page`);
    return;
  }

  const success = await this.handleNavigation(data);

  if (success) {
    await clearPendingNotification();
  }
}

  // ---- Central navigation resolver based on request_type ----
  handleNavigation(data, retriesLeft = 20) {
    console.log(`${TAG} handleNavigation() data:`, JSON.stringify(data), 'retriesLeft:', retriesLeft);

    if (!data) {
      console.log(`${TAG} ⚠️ handleNavigation: no data provided`);
      return false;
    }

    // navigationRef comes from createNavigationContainerRef(), which exposes
    // .navigate()/.isReady() directly — it is NOT a raw React ref, so there
    // is no .current here.
    if (!navigationRef.isReady?.()) {
      if (retriesLeft <= 0) {
        console.log(`${TAG} ❌ navigationRef never became ready — giving up`);
        return false;
      }
      console.log(`${TAG} navigationRef not ready yet, retrying in 300ms... (${retriesLeft} left)`);
      return new Promise((resolve) => {
        setTimeout(() => resolve(this.handleNavigation(data, retriesLeft - 1)), 300);
      });
    }

    const { request_type, screen, ...params } = data;
    const targetScreen = screen ?? REQUEST_TYPE_SCREEN_MAP[request_type];

    if (targetScreen) {
      console.log(`${TAG} ✅ Navigating to:`, targetScreen, 'params:', JSON.stringify(params));
      navigationRef.navigate(targetScreen, params);
      return true;
    } else {
      console.log(`${TAG} ⚠️ Unknown request_type, cannot navigate:`, request_type);
      return false;
    }
  }

  destroy() {
    console.log(`${TAG} destroy() called — cleaning up listeners`);
    this.unsubscribeOnMessage?.();
    this.unsubscribeOnTokenRefresh?.();
    this.unsubscribeForegroundEvent?.();
  }
}

export default new NotificationService();
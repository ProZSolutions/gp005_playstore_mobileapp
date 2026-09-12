// src/services/NotificationService.js
import notifee, { AndroidImportance, AndroidVisibility } from '@notifee/react-native';
import { Platform } from 'react-native';

// Bumped to v3 — forces Android to create a brand-new channel instead of
// reusing an old one that may have gotten locked to the default sound
// during earlier debug/release testing on this device.
const CHANNEL_ID = 'default-alert-channel-v3';

class NotificationService {
  channelCreated = false;

  async init() {
    await this.requestPermission();
    await this.createChannel();
  }

  async requestPermission() {
    const settings = await notifee.requestPermission();
    return settings;
  }

  async createChannel() {
    if (this.channelCreated || Platform.OS !== 'android') return;

    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'App Alerts',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      sound: 'custom_sound', // filename without extension, from res/raw
      vibration: true,
      vibrationPattern: [300, 500, 300, 500],
    });

    this.channelCreated = true;
  }

  async showNotification({ title, body, data = {} }) {
    await this.createChannel();

    await notifee.displayNotification({
      title,
      body,
      data,
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        pressAction: { id: 'default' },
        smallIcon: 'ic_launcher',
      },
      ios: {
        sound: 'custom_sound.caf',
      },
    });
  }
}

export default new NotificationService();
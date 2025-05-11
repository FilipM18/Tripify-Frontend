import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { API_URL } from './constants';
import { getToken } from './auth';

export async function requestUserPermission() {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      return true;
    }
    return false;
  }
  return true; // Android doesn't need permission for foreground notifications
}

export async function getFCMToken() {
  try {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    //console.log('FCM Token:', token);
    return token;
  } catch (error) {
    //console.error('Failed to get FCM token:', error);
    return null;
  }
}

export async function registerDeviceToken(fcmToken) {
  try {
    const authToken = await getToken();
    if (!authToken || !fcmToken) return false;

    const response = await fetch(`${API_URL}/register-device`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fcmToken })
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    //console.error('Error registering device token:', error);
    return false;
  }
}


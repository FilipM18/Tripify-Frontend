import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { getFCMToken, registerDeviceToken, requestUserPermission } from './firebaseConfig';
import { router } from 'expo-router'; 

export async function setupNotifications(): Promise<() => void> {
  const hasPermission = await requestUserPermission();
  if (!hasPermission) return () => {}; 

  const fcmToken = await getFCMToken();
  if (fcmToken) {
    await registerDeviceToken(fcmToken);
  }

  const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    console.log('Foreground notification received:', remoteMessage);
  });

  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification opened app from background state:', remoteMessage);
    
    if (remoteMessage.data) {
      const { type, contentType, contentId } = remoteMessage.data;
      
      if (type === 'like' && contentType === 'trip' && contentId) {
        router.push(`/(tabs)/home/trip/TripDetail?tripId=${contentId}`);
      }
    }
  });

  messaging().getInitialNotification().then(remoteMessage => {
    if (remoteMessage) {
      console.log('App opened from quit state by notification:', remoteMessage);
      
      if (remoteMessage.data) {
        const { type, contentType, contentId } = remoteMessage.data;
        
        if (type === 'like' && contentType === 'trip' && contentId) {
          router.push(`/(tabs)/home/trip/TripDetail?tripId=${contentId}`);
        }
      }
    }
  });

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background message handled:', remoteMessage);
  });

  return () => {
    if (unsubscribeForeground) {
      unsubscribeForeground();
    }
  };
}

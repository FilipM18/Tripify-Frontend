// app/_layout.tsx
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { getToken, removeToken } from '../utils/auth';
import { verifyToken } from '@/utils/api';
import { ThemeProvider } from '../app/ThemeContext';
import React from 'react';
import { WebSocketProvider } from '@/utils/WebSocketContext';
import { Text, View, ActivityIndicator, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import * as Notifications from 'expo-notifications';
import { getFCMToken, registerDeviceToken } from '../utils/firebaseConfig';
import { setupNotifications } from '@/utils/notificationService';

export default function RootLayout() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Request notification permissions
  const requestNotificationPermissions = async () => {
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Push notifications are disabled. To receive notifications, please enable them in your device settings.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  };

  // Setup FCM and register token with server
  const setupFCM = async () => {
    try {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) return;
      
      // Get FCM token
      const fcmToken = await getFCMToken();
      if (fcmToken) {
        console.log('FCM Token obtained:', fcmToken);
        // Register token with your server
        const success = await registerDeviceToken(fcmToken);
        if (success) {
          console.log('Device token registered successfully');
        } else {
          console.error('Failed to register device token with server');
        }
      }
      
      // Setup notification handlers
      const unsubscribe = await setupNotifications();
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up FCM:', error);
    }
  };

  useEffect(() => {
    const setupNavigationBar = async () => {
      if (Platform.OS === 'android') {
        await NavigationBar.setBackgroundColorAsync('#121212');
        await NavigationBar.setButtonStyleAsync('light');
      }
    };

    setupNavigationBar();
    let unsubscribeNotifications: (() => void) | undefined;

    const checkAuth = async () => {
      try {
        setIsReady(false); 
        const token = await getToken();
        if (!token) {
          //console.log("No token found");
          setAuthenticated(false);
        }
        
        else {
          // Fully verify token before proceeding
          const data = await verifyToken(token);
          setAuthenticated(data.success);
          

          if (data.success) {
            //console.log("Token valid");
            setAuthenticated(true);
            // Setup FCM when user is authenticated
            unsubscribeNotifications = await setupFCM();
          } else {
            //console.log("Token invalid");
            await removeToken();
            setAuthenticated(false);
          }
        }
      } catch (error) {
        //console.error("Auth check error:", error);
        await removeToken();
        setAuthenticated(false);
      } finally {
        setIsReady(true);
      }
    };
    
    checkAuth();
  }, []);

  // Add a listener for authentication changes to setup FCM when user logs in
  useEffect(() => {
    let unsubscribeNotifications: (() => void) | undefined;
    
    if (authenticated) {
      // Setup FCM when authentication state changes to true
      setupFCM().then(unsubscribe => {
        unsubscribeNotifications = unsubscribe;
      });
    }
    
    return () => {
      if (typeof unsubscribeNotifications === 'function') {
        unsubscribeNotifications();
      }
    };
  }, [authenticated]);


  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 20, color: "green" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <WebSocketProvider>
      <ThemeProvider>
        <StatusBar style="light" backgroundColor="#18191A" translucent={false} />
        <Stack 
          screenOptions={{ 
            headerShown: false,
            navigationBarColor: '#121212',
          }}
        >
          {authenticated ? (
            <Stack.Screen name="(tabs)" />
          ) : (
            <Stack.Screen name="(auth)" />
          )}
        </Stack>
      </ThemeProvider>
    </WebSocketProvider>
  );
}
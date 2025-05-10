import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { getToken, removeToken } from '../utils/auth';
import { verifyToken } from '@/utils/api';
import { ThemeProvider } from '../app/ThemeContext';
import React from 'react';
import { WebSocketProvider } from '@/utils/WebSocketContext';
import { Text, View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        if (!token) {
          console.log("No token found");
          setAuthenticated(false);
          return;
        }
        
        console.log("Token found, verifying...");
        const data = await verifyToken(token);
        
        if (data.success) {
          console.log("Token valid");
          setAuthenticated(true);
        } else {
          console.log("Token invalid");
          await removeToken();
          setAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        await removeToken();
        setAuthenticated(false);
      } finally {
        setIsReady(true);
      }
    };
    
    checkAuth();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 20 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <WebSocketProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
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
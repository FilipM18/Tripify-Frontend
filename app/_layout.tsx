import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { getToken, removeToken } from '../utils/auth';
import { verifyToken } from '@/utils/api';
import { ThemeProvider } from '../app/ThemeContext';
import React from 'react';
import { WebSocketProvider } from '@/utils/WebSocketContext';

export default function RootLayout() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

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
      }
    };
    
    checkAuth();
  }, []);

  if (authenticated === null) return null;

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

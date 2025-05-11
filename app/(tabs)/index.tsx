
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { getToken, removeToken } from '../../utils/auth';
import { verifyToken } from '@/utils/api';
import { Redirect } from 'expo-router';

export default function Index() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        if (!token) {
          setAuthenticated(false);
        } else {
          const data = await verifyToken(token);
          setAuthenticated(data.success);
          if (!data.success) {
            await removeToken();
          }
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 20, color: "#4CAF50" }}>Loading...</Text>
      </View>
    );
  }

  if (authenticated) {
    return <Redirect href="/(tabs)/home" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}
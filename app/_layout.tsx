import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { getToken, removeToken } from '../utils/auth';
import { verifyToken } from '@/utils/api';

export default function RootLayout() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      if (!token) {
        setAuthenticated(false);
        return;
      }
      try {
        const data = await verifyToken(token);
        if (data.success) {
          setAuthenticated(true);
        } else {
          await removeToken();
          setAuthenticated(false);
        }
      } catch {
        await removeToken();
        setAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (authenticated === null) return null; // Or a splash/loading screen

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {authenticated ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}

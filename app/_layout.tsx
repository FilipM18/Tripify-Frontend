import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { getToken, removeToken } from '../utils/auth';

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
        const resp = await fetch('http://192.168.1.32:3000/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await resp.json();
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

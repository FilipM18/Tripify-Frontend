import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { getToken } from '../utils/auth';

export default function RootLayout() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    getToken().then(token => setAuthenticated(!!token));
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

import { Stack } from 'expo-router';
import React from 'react';

export default function MemoriesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Memories Map',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="cluster"
        options={{
          title: 'Memory Cluster',
          headerShown: false,
        }}
      />
    </Stack>
  );
}

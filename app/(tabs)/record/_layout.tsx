import React from 'react';
import { Stack } from 'expo-router';

export default function RecordLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Record Trip',
          headerShown: false,
        }}
      />
    </Stack>
  );
}

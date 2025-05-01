import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { removeToken } from '@/utils/auth'; // You need to implement this

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await removeToken(); // Remove the token from storage
      router.replace('/(auth)/login'); // Redirect to login
    } catch (error) {
      Alert.alert('Logout failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile</Text>
      <Button title="Log Out" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, marginBottom: 24 },
});

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { saveToken } from '@/utils/auth';
import { login } from '@/utils/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Chyba', 'Prosím vyplňte všetky polia.');
      return;
    }
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.success) {
        await saveToken(data.token!);
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Prihlásenie zlyhalo', data.error || 'Neznáma chyba');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Prihlásenie zlyhalo', error.message);
      } else {
        Alert.alert('Prihlásenie zlyhalo', 'Neznáma chyba');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prihlásenie</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Heslo" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <Button title={loading ? "Prihlasujem..." : "Prihlásiť sa"} onPress={handleLogin} disabled={loading} />
      <TouchableOpacity onPress={() => router.replace('/(auth)/signup')}>
        <Text style={styles.switchText}>Ešte nemáš účet? Registruj sa!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  switchText: { color: '#4CAF50', marginTop: 16, textAlign: 'center' }
});

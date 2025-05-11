import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { saveToken } from '@/utils/auth';
import { login } from '@/utils/api';
import { useTheme } from '../ThemeContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme, visionMode } = useTheme();


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

  const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.background },
    text: { color: theme.secondText, fontSize: 16, marginBottom: 12 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center', color: theme.text },
    input: { borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: theme.inputBackground, color: theme.text },
    button: { backgroundColor: theme.primary, borderRadius: 8, padding: 12, marginBottom: 12 },
    switchText: { color: theme.primary, marginTop: 16, textAlign: 'center' }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prihlásenie</Text>
      <TextInput placeholder="Email" placeholderTextColor={theme.thirdText} value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Heslo" placeholderTextColor={theme.thirdText} value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <Button title={loading ? "Prihlasujem..." : "Prihlásiť sa"} onPress={handleLogin} disabled={loading} />
      <TouchableOpacity onPress={() => router.replace('/(auth)/signup')}>
        <Text style={styles.switchText}>Ešte nemáš účet? Registruj sa!</Text>
      </TouchableOpacity>
    </View>
  );
}

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { saveToken } from '@/utils/auth';
import { register } from '@/utils/api';
import { useTheme } from '../ThemeContext';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const { theme, visionMode } = useTheme();


  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images', 
      allowsEditing: true,
      quality: 0.7,
    });
    
    if (result.canceled) {
      // User canceled the picker
      return;
    }    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setPhoto(asset);
    }    
  };

  const handleSignup = async () => {
    if (!username || !email || !password) {
      Alert.alert('Chyba', 'Prosím vyplňte všetky povinné polia.');
      return;
    }
    if (password !== password2) {
      Alert.alert('Chyba', 'Heslá sa nezhodujú. Prosím skontrolujte ich.');
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('phoneNumber', phoneNumber);
    if (photo) {
      if (photo) {
        // Convert local image URI to Blob
        const response = await fetch(photo.uri);
        const blob = await response.blob();
        formData.append('pfp', blob, 'profile.jpg'); //Photo nefunguje bude treba opraviť
      } 
    }

    try {
      const data = await register(formData);
      if (data.success) {
        await saveToken(data.token!);
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Registrácia zlyhala', data.error || 'Neznáma chyba');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Registrácia zlyhala', error.message);
      } else {
        Alert.alert('Registrácia zlyhala', 'Neznáma chyba');
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
    imagePicker: { alignItems: 'center', marginBottom: 18 },
    switchText: { color: theme.primary, marginTop: 16, textAlign: 'center' }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrácia</Text>
      <TextInput placeholder="Username" placeholderTextColor={theme.thirdText} value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Email" value={email}placeholderTextColor={theme.thirdText} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Tel. číslo" value={phoneNumber} placeholderTextColor={theme.thirdText} onChangeText={setPhoneNumber} style={styles.input} keyboardType="phone-pad" />
      <TextInput placeholder="Heslo" value={password} placeholderTextColor={theme.thirdText} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <TextInput placeholder="Zopakuj heslo" value={password2} placeholderTextColor={theme.thirdText} onChangeText={setPassword2} style={styles.input} secureTextEntry />
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text>Vyber porfilovú fotku</Text>
        {photo && <Image source={{ uri: photo.uri }} style={{ width: 60, height: 60, borderRadius: 30 }} />}
      </TouchableOpacity>
      <Button title={loading ? "Registrácia..." : "Registruj sa"} onPress={handleSignup} disabled={loading} />
      <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
        <Text style={styles.switchText}>Už máš účet? Prihlás sa</Text>
      </TouchableOpacity>
    </View>
  );
}

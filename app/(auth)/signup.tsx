import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { saveToken } from '@/utils/auth';
import { register } from '@/utils/api';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images', // Use 'images' instead of the enum
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
      Alert.alert('Please fill all required fields.');
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
        Alert.alert('Signup failed', data.error || 'Unknown error');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Signup failed', error.message);
      } else {
        Alert.alert('Signup failed', 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} style={styles.input} keyboardType="phone-pad" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text>Select Profile Photo</Text>
        {photo && <Image source={{ uri: photo.uri }} style={{ width: 60, height: 60, borderRadius: 30 }} />}
      </TouchableOpacity>
      <Button title={loading ? "Registering..." : "Sign Up"} onPress={handleSignup} disabled={loading} />
      <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
        <Text style={styles.switchText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  imagePicker: { alignItems: 'center', marginBottom: 18 },
  switchText: { color: '#4CAF50', marginTop: 16, textAlign: 'center' }
});

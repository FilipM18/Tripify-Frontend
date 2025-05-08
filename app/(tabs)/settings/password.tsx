import { router } from 'expo-router';
import React, { useState } from 'react';
import { 
  StyleSheet, 
  SafeAreaView, 
  View, 
  Text, 
  Alert,
  ScrollView
} from 'react-native';
import { useTheme } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../theme';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { getToken } from '@/utils/auth';
import { apiRequest } from '@/utils/api';
import EditPasswordForm from './components/EditPasswordForm';

export default function PasswordScreen() {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { isTablet } = useScreenDimensions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordUpdate = async (currentPassword: string, newPassword: string) => {
    try {
      setIsSubmitting(true);
      const token = await getToken();
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await apiRequest('/auth/password', 'PUT', {
        currentPassword,
        newPassword
      }, token) as { success: boolean; message?: string };
      
      if (response.success) {
        Alert.alert('Success', 'Password updated successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      padding: isTablet ? 20 : 16,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: isTablet ? 24 : 20,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Zmena hesla</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <EditPasswordForm 
          onSubmit={handlePasswordUpdate}
          onCancel={() => router.back()}
          isSubmitting={isSubmitting}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

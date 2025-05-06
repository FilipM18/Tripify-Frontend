import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { getToken } from '@/utils/auth';
import { apiRequest } from '@/utils/api';
import { UserProfile } from '@/utils/types';
import EditHeader from './components/EditHeader';
import EditProfileForm from './components/EditProfileForm';
import EditPasswordForm from './components/EditPasswordForm';
import { API_URL } from '@/utils/constants';
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { isTablet } = useScreenDimensions();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await apiRequest<{ success: boolean; user: UserProfile }>(
        '/auth/verify',
        'GET',
        undefined,
        token
      );

      if (response.success && response.user) {
        setUserProfile(response.user);
      } else {
        Alert.alert('Error', 'Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (formData: FormData) => {
    try {
      setSubmitting(true);
      const token = await getToken();
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully');
        router.back();
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setSubmitting(true);
      const token = await getToken();
      if (!token || !userProfile) {
        router.replace('/(auth)/login');
        return;
      }
      
      const response = await apiRequest<{ success: boolean; error?: string }>(
        '/auth/password',
        'PUT',
        {
          userId: userProfile.id,
          currentPassword,
          newPassword
        },
        token
      );

      if (response.success) {
        Alert.alert('Success', 'Password updated successfully');
        setShowPasswordForm(false);
      } else {
        Alert.alert('Error', response.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Password update error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePasswordForm = () => {
    setShowPasswordForm(!showPasswordForm);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.card,
    },
    scrollContent: {
      flexGrow: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.card,
    },
    contentContainer: {
      maxWidth: isTablet ? 700 : '100%',
      width: isTablet ? '80%' : '100%',
      alignSelf: isTablet ? 'center' : undefined,
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
        <EditHeader 
          title={showPasswordForm ? "Zmena hesla" : "Upraviť profil"}
          onBackPress={() => showPasswordForm ? togglePasswordForm() : router.back()}
        />
        
        
        {userProfile && !showPasswordForm && (
          <EditProfileForm 
            userProfile={userProfile}
            onSubmit={handleUpdateProfile}
            onPasswordChangeRequest={togglePasswordForm}
            isSubmitting={submitting}
          />
        )}
        
        {userProfile && showPasswordForm && (
          <EditPasswordForm
            onSubmit={handleUpdatePassword}
            onCancel={togglePasswordForm}
            isSubmitting={submitting}
          />
        )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
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
import { apiRequest, updateUserProfile } from '@/utils/api';
import EditProfileForm from './components/EditProfileForm';
import EditPasswordForm from './components/EditPasswordForm';
import { UserProfile } from '@/utils/types';

export default function ProfileScreen() {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { isTablet } = useScreenDimensions();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
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
      setUserProfile(response.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Use the updateUserProfile function instead of apiRequest
      const response = await updateUserProfile(
        formData.get('username') as string,
        formData.get('email') as string,
        formData.get('phoneNumber') as string,
        formData.has('pfp') ? (formData.get('pfp') as any).uri : null
      );
      
      if (response.success) {
        Alert.alert('Success', 'Profile updated successfully');
        fetchUserProfile(); // Refresh profile data
        router.back();
      } else {
        Alert.alert('Error', response.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile');
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: isTablet ? 18 : 16,
      color: theme.text,
      marginTop: 10,
    },
  });

  if (isLoading || !userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Načítavam...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <EditProfileForm 
            userProfile={userProfile}
            onSubmit={handleProfileUpdate}
            isSubmitting={isSubmitting}
            onCancel={() => router.back()}
          />
      </ScrollView>
    </SafeAreaView>
  );
}

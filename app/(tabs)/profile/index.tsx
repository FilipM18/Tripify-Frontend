import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getToken, removeToken } from '@/utils/auth';
import { apiRequest } from '@/utils/api';
import { apiService } from '@/utils/api';
import ProfileHeader from './components/ProfileHeader';
import ProfileTabs from './components/ProfileTabs';
import ProfileStats from './components/ProfileStats';
import { UserProfile } from '@/utils/types';
import { API_URL } from '@/utils/constants';
import ProfileCalendarTab from './components/ProfileCalendarTab';
import ProfileStatsTab from './components/ProfileStatsTab';
import { Text } from 'react-native';
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('Kalendár');
  const [activityStreak, setActivityStreak] = useState(0);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { isTablet } = useScreenDimensions();

  useEffect(() => {
    fetchUserProfile();
    fetchUserStreak();
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
        Alert.alert('Error', 'Chyba pri načítaní profilu. Skúste to znova neskôr.');
      }
    } catch (error) {
      console.error('Chyba:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Neznáma chyba');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStreak = async () => {
    try {
      const { streak } = await apiService.getUserActivityStreak();
      setActivityStreak(streak);
    } catch (error) {
      setActivityStreak(0);
    }
  };

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.card,
    },
    tabContent: {
      flex: 1,
      padding: 16,
    },
    info: {
      textAlign: 'center',
      color: theme.secondText,
      marginTop: 16,
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary}/>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {userProfile && (
        <>
          <ProfileHeader 
            username={userProfile.username}
            photoUrl={userProfile.photo_url ? `${API_URL}${userProfile.photo_url}` : null}
            streak={activityStreak}
          />
          
          <ProfileStats 
            followers={0}
            following={0}
          />
          
          <ProfileTabs 
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          
         
          <View style={styles.tabContent}>
            {activeTab === 'Kalendár' && <ProfileCalendarTab />}
            {activeTab === 'Štatistiky' && <ProfileStatsTab />}
            {activeTab === 'Informácie' && (<Text style={styles.info}>Osobné informácie...</Text>)}

          </View>
        </>
      )}
    </ScrollView>
  );
}

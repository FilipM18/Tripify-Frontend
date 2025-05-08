import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { API_URL } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';

interface ProfileHeaderProps {
  username: string;
  photoUrl: string | null;
  streak: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  username,
  photoUrl,
  streak,
}) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { isTablet } = useScreenDimensions();

  const fullPhotoUrl = photoUrl ? `${API_URL}${photoUrl}` : null;

  const getStreakText = (count: number) => {
    if (count === 0) return "Active streak: 0 dní";
    if (count === 1) return "Active streak: 1 deň 🔥";
    else if (count < 5) return `Active streak: ${count} dni 🔥`;
    else return `Active streak: ${count} dní 🔥🔥`;
  };

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
    },
    headerBackground: {
      height: isTablet ? 120 : 100,
      backgroundColor: '#8BA872',
      width: '100%',
    },
    profileContent: {
      alignItems: 'center',
      paddingBottom: isTablet ? 20 : 16,
    },
    avatarContainer: {
      marginTop: isTablet ? -50 : -40,
    },
    avatar: {
      width: isTablet ? 100 : 80,
      height: isTablet ? 100 : 80,
      borderRadius: isTablet ? 50 : 40,
      borderWidth: 3,
      borderColor: theme.border,
      backgroundColor: theme.background,
    },
    avatarPlaceholder: {
      width: isTablet ? 100 : 80,
      height: isTablet ? 100 : 80,
      borderRadius: isTablet ? 50 : 40,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: theme.border,
    },
    avatarLetter: {
      fontSize: isTablet ? 40 : 32,
      fontWeight: 'bold',
      color: theme.text,
    },
    username: {
      fontSize: isTablet ? 22 : 18,
      fontWeight: 'bold',
      marginTop: isTablet ? 10 : 8,
      color: theme.text,
    },
    activeStreak: {
      fontSize: isTablet ? 16 : 14,
      color: theme.secondText,
      marginTop: 4,
    },
    actions: {
      flexDirection: 'row',
      marginTop: isTablet ? 16 : 12,
    },
    editButton: {
      flexDirection: 'row',
      backgroundColor: theme.primary,
      paddingVertical: 8,
      paddingHorizontal: isTablet ? 20 : 16,
      borderRadius: 20,
      alignItems: 'center',
      marginRight: 8,
    },
    editText: {
      color: theme.text,
      marginLeft: 4,
      fontWeight: '500',
      fontSize: isTablet ? 16 : 14,
    },
    logoutButton: {
      backgroundColor: theme.background,
      padding: isTablet ? 10 : 8,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerBackground} />
      <View style={styles.profileContent}>
        <View style={styles.avatarContainer}>
          {photoUrl ? (
            <Image source={{ uri: fullPhotoUrl ?? undefined }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarLetter}>
                {username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.username}>{username}</Text>
        <Text style={styles.activeStreak}>{getStreakText(streak)}</Text>

      </View>
    </View>
  );
};

export default ProfileHeader;
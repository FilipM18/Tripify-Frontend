import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { API_URL } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';

interface ProfileHeaderProps {
  username: string;
  photoUrl: string | null;
  onEditPress: () => void;
  onLogoutPress: () => void;
  streak: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  username,
  photoUrl,
  onEditPress,
  onLogoutPress,
  streak,
}) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme; 

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
      height: 100,
      backgroundColor: '#8BA872',
      width: '100%',
    },
    profileContent: {
      alignItems: 'center',
      paddingBottom: 16,
    },
    avatarContainer: {
      marginTop: -40, 
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: theme.border,
      backgroundColor: theme.background,
    },
    avatarPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: theme.border,
    },
    avatarLetter: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.text,
    },
    username: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 8,
      color: theme.text,
    },
    activeStreak: {
      fontSize: 14,
      color: theme.secondText,
      marginTop: 4,
    },
    actions: {
      flexDirection: 'row',
      marginTop: 12,
    },
    editButton: {
      flexDirection: 'row',
      backgroundColor: theme.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      alignItems: 'center',
      marginRight: 8,
    },
    editText: {
      color: theme.text,
      marginLeft: 4,
      fontWeight: '500',
    },
    logoutButton: {
      backgroundColor: theme.background,
      padding: 8,
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

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={onEditPress}
          >
            <Ionicons name="pencil-outline" size={18} color="#FFF" />
            <Text style={styles.editText}>Edit Profil</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={onLogoutPress}
          >
            <Ionicons name="log-out-outline" size={18} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ProfileHeader;
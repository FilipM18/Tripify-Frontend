import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { API_URL } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/ThemeContext';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { AccessibleText } from '@/components/AccessibleText';
import { useScaledStyles } from '@/utils/accessibilityUtils';

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
  const { theme, fontScale } = useTheme();
  const { isTablet } = useScreenDimensions();

  const fullPhotoUrl = photoUrl ? `${API_URL}${photoUrl}` : null;
  console.log('fullPhotoUrl', photoUrl);

  const getStreakText = (count: number) => {
    if (count === 0) return "Active streak: 0 dní";
    if (count === 1) return "Active streak: 1 deň 🔥";
    else if (count < 5) return `Active streak: ${count} dni 🔥`;
    else return `Active streak: ${count} dní 🔥🔥`;
  };

  const styles = useScaledStyles((scale) => ({
    container: {
      position: 'relative',
    },
    headerBackground: {
      height: isTablet ? 120 * Math.sqrt(scale) : 100 * Math.sqrt(scale),
      backgroundColor: theme.secondary,
      width: '100%',
    },
    profileContent: {
      alignItems: 'center',
      paddingBottom: isTablet ? 20 * Math.sqrt(scale) : 16 * Math.sqrt(scale),
    },
    avatarContainer: {
      marginTop: isTablet ? -50 * Math.sqrt(scale) : -40 * Math.sqrt(scale),
    },
    avatar: {
      width: isTablet ? 100 * Math.sqrt(scale) : 80 * Math.sqrt(scale),
      height: isTablet ? 100 * Math.sqrt(scale) : 80 * Math.sqrt(scale),
      borderRadius: isTablet ? 50 * Math.sqrt(scale) : 40 * Math.sqrt(scale),
      borderWidth: 3,
      borderColor: theme.border,
      backgroundColor: theme.background,
    },
    avatarPlaceholder: {
      width: isTablet ? 100 * Math.sqrt(scale) : 80 * Math.sqrt(scale),
      height: isTablet ? 100 * Math.sqrt(scale) : 80 * Math.sqrt(scale),
      borderRadius: isTablet ? 50 * Math.sqrt(scale) : 40 * Math.sqrt(scale),
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: theme.border,
    },
    avatarLetter: {
      fontSize: isTablet ? 40 * scale : 32 * scale,
      fontWeight: 'bold',
      color: theme.text,
    },
    username: {
      marginTop: isTablet ? 10 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
    },
    streak: {
      marginTop: 4 * Math.sqrt(scale),
    },
    actions: {
      flexDirection: 'row',
      marginTop: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale),
    },
    editButton: {
      flexDirection: 'row',
      backgroundColor: theme.primary,
      paddingVertical: 8 * Math.sqrt(scale),
      paddingHorizontal: isTablet ? 20 * Math.sqrt(scale) : 16 * Math.sqrt(scale),
      borderRadius: 20 * Math.sqrt(scale),
      alignItems: 'center',
      marginRight: 8 * Math.sqrt(scale),
    },
    editText: {
      color: theme.text,
      marginLeft: 4 * Math.sqrt(scale),
      fontWeight: '500',
    },
    logoutButton: {
      backgroundColor: theme.background,
      padding: isTablet ? 10 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
      borderRadius: 20 * Math.sqrt(scale),
      alignItems: 'center',
      justifyContent: 'center',
    },
  }));

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

        <AccessibleText 
          variant="header2" 
          style={styles.username}
        >
          {username}
        </AccessibleText>
        
        <AccessibleText 
          variant="caption" 
          style={styles.streak}
        >
          {getStreakText(streak)}
        </AccessibleText>
      </View>
    </View>
  );
};

export default ProfileHeader;
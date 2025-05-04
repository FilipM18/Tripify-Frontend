import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { API_URL } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';

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
  const fullPhotoUrl = photoUrl ? `${API_URL}${photoUrl}` : null;

  const getStreakText = (count: number) => {
    if (count === 0) return "No active streak";
    if (count === 1) return "Active streak: 1 deň 🔥";
    else if (count < 5) return `Active streak: ${count} dni 🔥`;
    else return `Active streak: ${count} dní 🔥`;
  };

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
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={onLogoutPress}
          >
            <Ionicons name="log-out-outline" size={18} color="#555" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
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
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarLetter: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#555',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  activeStreak: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 8,
  },
  editText: {
    color: '#FFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#F0F0F0',
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfileHeader;
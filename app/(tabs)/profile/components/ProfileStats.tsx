import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';

interface ProfileStatsProps {
  followers: number;
  following: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ followers, following }) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme; 

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
    },
    statContainer: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    statLabel: {
      fontSize: 14,
      color: theme.secondText,
      marginTop: 2,
    },
    divider: {
      width: 1,
      backgroundColor: theme.secondBackground,
      marginHorizontal: 24,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.statContainer}>
        <Text style={styles.statValue}>{followers}</Text>
        <Text style={styles.statLabel}>Followers</Text>
      </TouchableOpacity>
      
      <View style={styles.divider} />
      
      <TouchableOpacity style={styles.statContainer}>
        <Text style={styles.statValue}>{following}</Text>
        <Text style={styles.statLabel}>Following</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileStats;
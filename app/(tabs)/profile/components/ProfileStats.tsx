import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';

interface ProfileStatsProps {
  followers: number;
  following: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ followers, following }) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { isTablet } = useScreenDimensions();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: isTablet ? 16 : 12,
      backgroundColor: theme.card,
      borderRadius: 12,
      marginHorizontal: isTablet ? 20 : 16,
      marginVertical: 12,
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    statItem: {
      alignItems: 'center',
      paddingHorizontal: isTablet ? 20 : 16,
    },
    statValue: {
      fontSize: isTablet ? 20 : 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    statLabel: {
      fontSize: isTablet ? 14 : 12,
      color: theme.secondText,
      marginTop: 4,
    },
    divider: {
      width: 1,
      height: '80%',
      backgroundColor: theme.border,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.statItem}>
        <Text style={styles.statValue}>{followers}</Text>
        <Text style={styles.statLabel}>Followers</Text>
      </TouchableOpacity>
      
      <View style={styles.divider} />
      
      <TouchableOpacity style={styles.statItem}>
        <Text style={styles.statValue}>{following}</Text>
        <Text style={styles.statLabel}>Following</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileStats;
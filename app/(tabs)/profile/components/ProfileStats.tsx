import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/app/ThemeContext';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { AccessibleText } from '@/components/AccessibleText';
import { useScaledStyles } from '@/utils/accessibilityUtils';

interface ProfileStatsProps {
  followers: number;
  following: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ followers, following }) => {
  const { theme } = useTheme();
  const { isTablet } = useScreenDimensions();

  const styles = useScaledStyles((scale) => ({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale),
      backgroundColor: theme.card,
      borderRadius: 12,
      marginHorizontal: isTablet ? 20 : 16,
      marginVertical: 12 * Math.sqrt(scale),
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
    divider: {
      width: 1,
      height: '80%',
      backgroundColor: theme.border,
    },
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.statItem} accessibilityLabel={`${followers} sledovateľov`}>
        <AccessibleText variant="header2">{followers}</AccessibleText>
        <AccessibleText variant="caption">Followers</AccessibleText>
      </TouchableOpacity>
      
      <View style={styles.divider} />
      
      <TouchableOpacity style={styles.statItem} accessibilityLabel={`${following} sledovaných`}>
        <AccessibleText variant="header2">{following}</AccessibleText>
        <AccessibleText variant="caption">Following</AccessibleText>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileStats;
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';

interface StatsDisplayProps {
  duration: number;
  distance: number;
  pace: number;
}

export default function StatsDisplay({ duration, distance, pace }: StatsDisplayProps) {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme; 

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 15,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      zIndex: 10,
    },
    statBox: {
      alignItems: 'center',
      paddingHorizontal: 10,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    statLabel: {
      fontSize: 14,
      color: theme.thirdText,
      marginTop: 5,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.statBox}>
        <Text style={styles.statValue}>{formatDuration(duration)}</Text>
        <Text style={styles.statLabel}>Čas</Text>
      </View>
      
      <View style={styles.statBox}>
        <Text style={styles.statValue}>{distance.toFixed(2)}</Text>
        <Text style={styles.statLabel}>Vzdialenosť (km)</Text>
      </View>
      
      <View style={styles.statBox}>
        <Text style={styles.statValue}>{pace.toFixed(1)}</Text>
        <Text style={styles.statLabel}>Tempo (km/h)</Text>
      </View>
    </View>
  );
}

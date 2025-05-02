import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatsDisplayProps {
  duration: number;
  distance: number;
  pace: number;
}

export default function StatsDisplay({ duration, distance, pace }: StatsDisplayProps) {
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.statBox}>
        <Text style={styles.statValue}>{formatDuration(duration)}</Text>
        <Text style={styles.statLabel}>Time</Text>
      </View>
      
      <View style={styles.statBox}>
        <Text style={styles.statValue}>{distance.toFixed(2)}</Text>
        <Text style={styles.statLabel}>Distance (km)</Text>
      </View>
      
      <View style={styles.statBox}>
        <Text style={styles.statValue}>{pace.toFixed(1)}</Text>
        <Text style={styles.statLabel}>Pace (km/h)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
});

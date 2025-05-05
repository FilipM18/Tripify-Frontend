import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { apiService } from '@/utils/api';
import { Trip } from '@/utils/types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';

function estimateCalories(type: string, distanceKm: number): number {
  switch (type) {
    case 'running':
      return Math.round(distanceKm * 80);
    case 'walking':
      return Math.round(distanceKm * 50);
    case 'cycling':
      return Math.round(distanceKm * 59);
    default:
      return Math.round(distanceKm * 50);
  }
}

const ProfileStatsTab: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [totalKm, setTotalKm] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalTrips, setTotalTrips] = useState(0);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme; 

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const data = await apiService.getUserTrips();
      if (data.success) {
        setTrips(data.trips);
        setTotalTrips(data.trips.length);

        const km = data.trips.reduce((acc: number, t: Trip) => acc + Number(t.distance_km || 0), 0);
        setTotalKm(km);

        const calories = data.trips.reduce((acc: number, t: Trip) => {
          const typeKey = (t.type || '').toLowerCase(); 
          const distance = Number(t.distance_km || 0);
          return acc + estimateCalories(typeKey, distance);
        }, 0);
        setTotalCalories(calories);
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    }
  };

  const styles = StyleSheet.create({
    container: {
      padding: 18,
      paddingTop: 24,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      borderRadius: 24,
      borderWidth: 1.5,
      borderColor: theme.border,
      padding: 18,
      marginBottom: 18,
      shadowColor: theme.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2, 
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.secondBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 18,
    },
    cardDetails: {
      flex: 1,
      justifyContent: 'center',
    },
    statLabel: {
      fontSize: 15,
      color: theme.thirdText,
      marginBottom: 4,
      fontWeight: '500',
    },
    statValue: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.text,
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="map-outline" size={28} color={theme.primary} />
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.statLabel}>Počet výletov</Text>
          <Text style={styles.statValue}>{totalTrips}</Text>
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="walk-outline" size={28} color={theme.primary}/>
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.statLabel}>Prejdené km</Text>
          <Text style={styles.statValue}>{Number(totalKm).toFixed(2)} km</Text>
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="flame-outline" size={28} color={theme.primary} />
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.statLabel}>Spálené kalórie</Text>
          <Text style={styles.statValue}>{totalCalories}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileStatsTab;

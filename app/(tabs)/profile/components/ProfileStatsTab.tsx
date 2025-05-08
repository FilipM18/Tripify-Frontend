import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { apiService } from '@/utils/api';
import { Trip } from '@/utils/types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';

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

// Time period options
const TIME_PERIODS = [
  { id: 'all', label: 'Všetko' },
  { id: 'day', label: 'Posledný deň' },
  { id: 'week', label: 'Posledný týždeň' },
  { id: 'month', label: 'Posledný mesiac' }
];

// Exercise type options
const EXERCISE_TYPES = [
  { id: 'all', label: 'Všetky' },
  { id: 'running', label: 'Beh' },
  { id: 'walking', label: 'Chôdza' },
  { id: 'cycling', label: 'Cyklistika' }
];

const ProfileStatsTab: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [totalKm, setTotalKm] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalTrips, setTotalTrips] = useState(0);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('all');
  const [selectedExerciseType, setSelectedExerciseType] = useState('all');
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' or 'filters'
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trips, selectedTimePeriod, selectedExerciseType]);

  const fetchTrips = async () => {
    try {
      const data = await apiService.getUserTrips();
      if (data.success) {
        setTrips(data.trips);
      }
    } catch (err) {
      console.error('Error pri získavaní výletov:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...trips];

    // Apply time period filter
    if (selectedTimePeriod !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      if (selectedTimePeriod === 'day') {
        cutoffDate.setDate(now.getDate() - 1);
      } else if (selectedTimePeriod === 'week') {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (selectedTimePeriod === 'month') {
        cutoffDate.setMonth(now.getMonth() - 1);
      }
      
      filtered = filtered.filter(trip => {
        const tripDate = new Date(trip.ended_at);
        return tripDate >= cutoffDate && tripDate <= now;
      });
    }

    // Apply exercise type filter
    if (selectedExerciseType !== 'all') {
      filtered = filtered.filter(trip => {
        const tripType = (trip.type || '').toLowerCase();
        return tripType === selectedExerciseType;
      });
    }

    setFilteredTrips(filtered);
    setTotalTrips(filtered.length);
    
    const km = filtered.reduce((acc: number, t: Trip) => acc + Number(t.distance_km || 0), 0);
    setTotalKm(km);
    
    const calories = filtered.reduce((acc: number, t: Trip) => {
      const typeKey = (t.type || '').toLowerCase(); 
      const distance = Number(t.distance_km || 0);
      return acc + estimateCalories(typeKey, distance);
    }, 0);
    setTotalCalories(calories);
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
    tabsContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      borderRadius: 12,
      backgroundColor: theme.secondBackground,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: theme.background,
    },
    tabText: {
      color: theme.thirdText,
      fontWeight: '500',
    },
    activeTabText: {
      color: theme.text,
      fontWeight: '600',
    },
    filterSection: {
      marginBottom: 20,
    },
    filterTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 10,
    },
    filterOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 10,
    },
    filterOption: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: theme.secondBackground,
      borderWidth: 1,
      borderColor: theme.border,
    },
    selectedFilterOption: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    filterOptionText: {
      color: theme.thirdText,
      fontWeight: '500',
    },
    selectedFilterOptionText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });

  const renderStatsTab = () => (
    <>
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
    </>
  );

  const renderFiltersTab = () => (
    <>
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Časové obdobie</Text>
        <View style={styles.filterOptions}>
          {TIME_PERIODS.map(period => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.filterOption,
                selectedTimePeriod === period.id && styles.selectedFilterOption
              ]}
              onPress={() => setSelectedTimePeriod(period.id)}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selectedTimePeriod === period.id && styles.selectedFilterOptionText
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Typ aktivity</Text>
        <View style={styles.filterOptions}>
          {EXERCISE_TYPES.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.filterOption,
                selectedExerciseType === type.id && styles.selectedFilterOption
              ]}
              onPress={() => setSelectedExerciseType(type.id)}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selectedExerciseType === type.id && styles.selectedFilterOptionText
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {renderStatsTab()}
    </>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
            Štatistiky
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'filters' && styles.activeTab]}
          onPress={() => setActiveTab('filters')}
        >
          <Text style={[styles.tabText, activeTab === 'filters' && styles.activeTabText]}>
            Filtre
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'stats' ? renderStatsTab() : renderFiltersTab()}
    </ScrollView>
  );
};

export default ProfileStatsTab;

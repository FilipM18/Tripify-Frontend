import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { apiService } from '@/utils/api';
import { Trip } from '@/utils/types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/ThemeContext';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { AccessibleText } from '@/components/AccessibleText';
import { useScaledStyles } from '@/utils/accessibilityUtils';

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

const TIME_PERIODS = [
  { id: 'all', label: 'Všetko' },
  { id: 'day', label: 'Posledný deň' },
  { id: 'week', label: 'Posledný týždeň' },
  { id: 'month', label: 'Posledný mesiac' }
];

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
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' alebo 'filters'
  const { theme } = useTheme();
  const { isTablet } = useScreenDimensions();

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

  const getFilterOptionAccessibilityLabel = (option: any, type: string, isSelected: boolean) => {
    const selectedText = isSelected ? 'vybrané' : '';
    if (type === 'time') {
      return `${option.label} ${selectedText}`;
    } else {
      return `${option.label} aktivity ${selectedText}`;
    }
  };

  const styles = useScaledStyles((scale) => ({
    container: {
      padding: isTablet ? 24 * Math.sqrt(scale) : 18 * Math.sqrt(scale),
      paddingTop: isTablet ? 32 * Math.sqrt(scale) : 24 * Math.sqrt(scale),
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      borderRadius: isTablet ? 28 * Math.sqrt(scale) : 24 * Math.sqrt(scale),
      borderWidth: 1.5,
      borderColor: theme.border,
      padding: isTablet ? 24 * Math.sqrt(scale) : 18 * Math.sqrt(scale),
      marginBottom: isTablet ? 24 * Math.sqrt(scale) : 18 * Math.sqrt(scale),
      shadowColor: theme.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2, 
    },
    iconCircle: {
      width: isTablet ? 60 * Math.sqrt(scale) : 48 * Math.sqrt(scale),
      height: isTablet ? 60 * Math.sqrt(scale) : 48 * Math.sqrt(scale),
      borderRadius: isTablet ? 30 * Math.sqrt(scale) : 24 * Math.sqrt(scale),
      backgroundColor: theme.secondBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isTablet ? 24 * Math.sqrt(scale) : 18 * Math.sqrt(scale),
    },
    cardDetails: {
      flex: 1,
      justifyContent: 'center',
    },
    tabsContainer: {
      flexDirection: 'row',
      marginBottom: isTablet ? 26 * Math.sqrt(scale) : 20 * Math.sqrt(scale),
      borderRadius: isTablet ? 16 * Math.sqrt(scale) : 12 * Math.sqrt(scale),
      backgroundColor: theme.secondBackground,
      padding: isTablet ? 6 * Math.sqrt(scale) : 4 * Math.sqrt(scale),
    },
    tab: {
      flex: 1,
      paddingVertical: isTablet ? 14 * Math.sqrt(scale) : 10 * Math.sqrt(scale),
      alignItems: 'center',
      borderRadius: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
    },
    activeTab: {
      backgroundColor: theme.background,
    },
    filterSection: {
      marginBottom: isTablet ? 26 * Math.sqrt(scale) : 20 * Math.sqrt(scale),
    },
    filterSectionTitle: {
      marginBottom: isTablet ? 14 * Math.sqrt(scale) : 10 * Math.sqrt(scale),
      fontSize: isTablet ? 18 * scale : 16 * scale,
    },
    filterOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: isTablet ? 14 * Math.sqrt(scale) : 10 * Math.sqrt(scale),
    },
    filterOption: {
      paddingHorizontal: isTablet ? 20 * Math.sqrt(scale) : 16 * Math.sqrt(scale),
      paddingVertical: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
      borderRadius: isTablet ? 24 * Math.sqrt(scale) : 20 * Math.sqrt(scale),
      marginRight: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
      marginBottom: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
      backgroundColor: theme.secondBackground,
      borderWidth: 1,
      borderColor: theme.border,
    },
    selectedFilterOption: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    filterOptionText: {
      fontWeight: '500',
      fontSize: isTablet ? 16 * scale : 14 * scale,
    },
  }));

  const renderStatsTab = () => (
    <>
      <View 
        style={styles.card}
        accessibilityLabel={`Počet výletov: ${totalTrips}`}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="map-outline" size={isTablet ? 32 : 28} color={theme.primary} />
        </View>
        <View style={styles.cardDetails}>
          <AccessibleText variant="caption">Počet výletov</AccessibleText>
          <AccessibleText variant="header2">{totalTrips}</AccessibleText>
        </View>
      </View>
      
      <View 
        style={styles.card}
        accessibilityLabel={`Prejdené kilometre: ${Number(totalKm).toFixed(2)} km`}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="walk-outline" size={isTablet ? 32 : 28} color={theme.primary}/>
        </View>
        <View style={styles.cardDetails}>
          <AccessibleText variant="caption">Prejdené km</AccessibleText>
          <AccessibleText variant="header2">{Number(totalKm).toFixed(2)} km</AccessibleText>
        </View>
      </View>
      
      <View 
        style={styles.card}
        accessibilityLabel={`Spálené kalórie: ${totalCalories}`}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="flame-outline" size={isTablet ? 32 : 28} color={theme.primary} />
        </View>
        <View style={styles.cardDetails}>
          <AccessibleText variant="caption">Spálené kalórie</AccessibleText>
          <AccessibleText variant="header2">{totalCalories}</AccessibleText>
        </View>
      </View>
    </>
  );

  const renderFiltersTab = () => (
    <>
      <View style={styles.filterSection}>
        <AccessibleText 
          variant="bodyBold" 
          style={styles.filterSectionTitle}
          accessibilityLabel="Sekcia filtrov pre časové obdobie"
        >
          Časové obdobie
        </AccessibleText>
        
        <View 
          style={styles.filterOptions}
          accessibilityLabel="Možnosti časového obdobia"
        >
          {TIME_PERIODS.map(period => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.filterOption,
                selectedTimePeriod === period.id && styles.selectedFilterOption
              ]}
              onPress={() => setSelectedTimePeriod(period.id)}
              accessibilityLabel={getFilterOptionAccessibilityLabel(
                period, 'time', selectedTimePeriod === period.id
              )}
              accessibilityRole="radio"
              accessibilityState={{ checked: selectedTimePeriod === period.id }}
              accessibilityHint={`Filtrovať výlety za ${period.label.toLowerCase()}`}
            >
              <AccessibleText 
                variant="body"
                color={selectedTimePeriod === period.id ? '#FFFFFF' : theme.thirdText}
                style={[
                  styles.filterOptionText,
                  { fontWeight: selectedTimePeriod === period.id ? 'bold' : '500' }
                ]}
              >
                {period.label}
              </AccessibleText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.filterSection}>
        <AccessibleText 
          variant="bodyBold" 
          style={styles.filterSectionTitle}
          accessibilityLabel="Sekcia filtrov pre typ aktivity"
        >
          Typ aktivity
        </AccessibleText>
        
        <View 
          style={styles.filterOptions}
          accessibilityLabel="Možnosti typov aktivít"
        >
          {EXERCISE_TYPES.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.filterOption,
                selectedExerciseType === type.id && styles.selectedFilterOption
              ]}
              onPress={() => setSelectedExerciseType(type.id)}
              accessibilityLabel={getFilterOptionAccessibilityLabel(
                type, 'exercise', selectedExerciseType === type.id
              )}
              accessibilityRole="radio"
              accessibilityState={{ checked: selectedExerciseType === type.id }}
              accessibilityHint={`Filtrovať aktivity typu ${type.label.toLowerCase()}`}
            >
              <AccessibleText 
                variant="body"
                color={selectedExerciseType === type.id ? '#FFFFFF' : theme.thirdText}
                style={[
                  styles.filterOptionText,
                  { fontWeight: selectedExerciseType === type.id ? 'bold' : '500' }
                ]}
              >
                {type.label}
              </AccessibleText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {renderStatsTab()}
    </>
  );

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      accessibilityLabel="Štatistiky aktivít"
    >
      <View 
        style={styles.tabsContainer} 
        accessibilityRole="tablist"
        accessibilityLabel="Prepínač medzi štatistikami a filtrami"
      >
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
          onPress={() => setActiveTab('stats')}
          accessibilityLabel="Štatistiky"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'stats' }}
          accessibilityHint="Zobrazí základné štatistiky aktivít"
        >
          <AccessibleText 
            variant="body"
            color={activeTab === 'stats' ? theme.text : theme.thirdText}
            style={{ fontWeight: activeTab === 'stats' ? 'bold' : 'normal' }}
          >
            Štatistiky
          </AccessibleText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'filters' && styles.activeTab]}
          onPress={() => setActiveTab('filters')}
          accessibilityLabel="Filtre"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'filters' }}
          accessibilityHint="Zobrazí filtrovanie podľa obdobia a typu aktivity"
        >
          <AccessibleText
            variant="body"
            color={activeTab === 'filters' ? theme.text : theme.thirdText}
            style={{ fontWeight: activeTab === 'filters' ? 'bold' : 'normal' }}
          >
            Filtre
          </AccessibleText>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'stats' ? renderStatsTab() : renderFiltersTab()}
    </ScrollView>
  );
};

export default ProfileStatsTab;
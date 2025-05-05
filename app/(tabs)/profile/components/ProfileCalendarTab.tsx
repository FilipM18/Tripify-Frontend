import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService } from '@/utils/api';
import { Trip } from '@/utils/types';
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';

type MarkedDates = {
  [date: string]: {
    marked?: boolean;
    selected?: boolean;
    selectedColor?: string;
    dots?: Array<{ key: string; color: string }>;
  };
};

const activityLabels: Record<string, string> = {
  running: 'Beh',
  walking: 'Chôdza',
  cycling: 'Bicyklovanie',
  hiking: 'Turistika',
  other: 'Iné',
};

const activityIcons: Record<string, JSX.Element> = {
  running: <MaterialCommunityIcons name="run-fast" size={28} color="#fff" />,
  walking: <MaterialCommunityIcons name="shoe-print" size={28} color="#fff" />,
  cycling: <Ionicons name="bicycle" size={28} color="#fff" />,
  hiking: <MaterialCommunityIcons name="hiking" size={28} color="#fff" />,
  other: <Ionicons name="help" size={28} color="#fff" />,
};

const activityGradients: Record<string, string> = {
  running: '#B8E4D3',
  walking: '#B8E4D3',
  cycling: '#D4C2FC',
  hiking: '#F9D5A0',
  other: '#F9D300',
};

function formatDuration(seconds: any): string {
  const min = Math.floor(Number(seconds) / 60);
  return `${min} min`;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

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

const ProfileCalendarTab: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme; 

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    markCalendarDates();
  }, [trips, selectedDate]);

  const fetchTrips = async () => {
    try {
      const data = await apiService.getUserTrips();
      if (data.success) setTrips(data.trips);
    } catch (err) {
      // Handle error
    }
  };

  const markCalendarDates = () => {
    const marks: MarkedDates = {};
    const dotsByDate: Record<string, Array<{ key: string; color: string }>> = {};

    trips.forEach((trip, idx) => {
        const date = trip.ended_at.split('T')[0];
        if (!dotsByDate[date]) dotsByDate[date] = [];
        dotsByDate[date].push({
          key: `${trip.type}-${trip.id}`, 
          color: activityGradients[trip.type] || theme.primary,
        });
      });
      

    Object.keys(dotsByDate).forEach((date) => {
      marks[date] = {
        dots: dotsByDate[date],
        marked: true,
        ...(date === selectedDate ? { selected: true, selectedColor: theme.secondary } : {}),
      };
    });

    if (!marks[selectedDate]) {
      marks[selectedDate] = { selected: true, selectedColor: theme.secondary };
    }

    setMarkedDates(marks);
  };

  const dayTrips = trips.filter(
    (trip) => trip.ended_at.split('T')[0] === selectedDate
  );

  const styles = StyleSheet.create({
    activities: { flex: 1, padding: 12 },
    noActivities: { textAlign: 'center', color: theme.secondText, marginTop: 16 },
    activityCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 32,
      borderWidth: 1.5,
      borderColor: theme.border,
      padding: 20,
      marginBottom: 20,
      shadowColor: theme.shadow,
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 18,
    },
    activityDetails: {
      flex: 1,
      justifyContent: 'center',
    },
    activityType: {
      fontWeight: 'bold',
      fontSize: 19,
      color: theme.text,
    },
    activitySub: {
      color: theme.thirdText,
      fontSize: 15,
      marginTop: 2,
      fontWeight: '400',
    },
    activityStats: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      minWidth: 90,
    },
    kmText: {
      fontWeight: 'bold',
      fontSize: 17,
      color: theme.text,
    },
    kcalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    kcalIcon: {
      marginRight: 4,
    },
    kcalText: {
      color: theme.thirdText,
      fontSize: 15,
      fontWeight: '400',
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <Calendar
        key={`calendar-${isDarkMode ? 'dark' : 'light'}`}
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={(day: any) => setSelectedDate(day.dateString)}
        current={selectedDate}
        theme={{
          selectedDayBackgroundColor: theme.secondary,
          todayTextColor: theme.primary,
          arrowColor: theme.secondary,
          monthTextColor: theme.text,
          dayTextColor: theme.text,
          textDisabledColor: theme.thirdText,
          calendarBackground: theme.statBackground,
        }}
        style={{ marginBottom: 8 }}
      />

      <ScrollView style={styles.activities} contentContainerStyle={{ paddingBottom: 32 }}>
        {dayTrips.length === 0 ? (
          <Text style={styles.noActivities}>Žiadne aktivity v tento deň.</Text>
        ) : (
            dayTrips.map((trip) => {
                const typeKey = (trip.type || '').toLowerCase();
                const distance = Number(trip.distance_km || 0);
                const calories = estimateCalories(typeKey, distance);
              
                return (
                  <View key={trip.id} style={styles.activityCard}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: activityGradients[typeKey] || theme.background },
                      ]}
                    >
                      {activityIcons[typeKey] || (
                        <Ionicons name="walk-outline" size={28} color={theme.primary} />
                      )}
                    </View>
                    <View style={styles.activityDetails}>
                      <Text style={styles.activityType}>
                        {activityLabels[typeKey] || typeKey}
                      </Text>
                      <Text style={styles.activitySub}>{formatDuration(trip.duration_seconds)}</Text>
                    </View>
                    <View style={styles.activityStats}>
                      <Text style={styles.kmText}>
                        {distance.toFixed(2)} km
                      </Text>
                      <View style={styles.kcalRow}>
                        <Ionicons name="water-outline" size={16} color={theme.thirdText} style={styles.kcalIcon} />
                        <Text style={styles.kcalText}>
                          {calories} kcal
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
        )}              
      </ScrollView>
    </View>
  );
};

export default ProfileCalendarTab;

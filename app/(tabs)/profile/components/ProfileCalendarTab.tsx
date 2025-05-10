import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService } from '@/utils/api';
import { Trip } from '@/utils/types';
import { useTheme } from '@/app/ThemeContext';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { AccessibleText } from '@/components/AccessibleText';
import { useScaledStyles } from '@/utils/accessibilityUtils';
import { darkTheme } from '@/app/theme';

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
  const [renderKey, setRenderKey] = useState(Date.now());
  const { theme, fontScale, visionMode } = useTheme();
  const { isTablet } = useScreenDimensions();
  const isDarkMode = theme.background === darkTheme.background;

  useEffect(() => {
    setRenderKey(Date.now());
  }, [isDarkMode, visionMode, theme]);

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    markCalendarDates();
  }, [trips, selectedDate, visionMode, isDarkMode, theme]);

  const fetchTrips = async () => {
    try {
      const data = await apiService.getUserTrips();
      if (data.success) setTrips(data.trips);
    } catch (err) {
      // Handle error
    }
  };

  const getActivityColor = (activityType: string) => {
    const defaultColors: Record<string, string> = {
      running: '#B8E4D3',
      walking: '#B8E4D3',
      cycling: '#D4C2FC',
      hiking: '#F9D5A0',
      other: '#F9D300',
    };
    
    const highContrastColors: Record<string, string> = {
      running: isDarkMode ? '#00FFAA' : '#006600',
      walking: isDarkMode ? '#00DDFF' : '#004488',
      cycling: isDarkMode ? '#FFCC00' : '#884400',
      hiking: isDarkMode ? '#FF66FF' : '#660066',
      other: isDarkMode ? '#FFFFFF' : '#000000',
    };
    
    const deuteranopiaColors: Record<string, string> = {
      running: '#0066CC', 
      walking: '#5588CC', 
      cycling: '#9966CC', 
      hiking: '#CC6600', 
      other: '#CCAA00', 
    };
    
    const protanopiaColors: Record<string, string> = {
      running: '#0099CC',
      walking: '#66CCCC',
      cycling: '#6699CC', 
      hiking: '#FFCC00', 
      other: '#99CC00', 
    };
    
    const tritanopiaColors: Record<string, string> = {
      running: '#669900',
      walking: '#99CC00',
      cycling: '#CC9900',
      hiking: '#CC6600', 
      other: '#FF9933', 
    };
    
    switch(visionMode) {
      case 'high-contrast':
        return highContrastColors[activityType] || highContrastColors.other;
      case 'deuteranopia':
        return deuteranopiaColors[activityType] || deuteranopiaColors.other;
      case 'protanopia':
        return protanopiaColors[activityType] || protanopiaColors.other;
      case 'tritanopia':
        return tritanopiaColors[activityType] || tritanopiaColors.other;
      default:
        return defaultColors[activityType] || theme.primary;
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
        color: getActivityColor(trip.type) 
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

  const calendarTheme = useMemo(() => ({
    selectedDayBackgroundColor: theme.secondary,
    todayTextColor: theme.primary,
    arrowColor: theme.secondary,
    monthTextColor: theme.text,
    dayTextColor: theme.text,
    textDisabledColor: theme.thirdText,
    calendarBackground: theme.background,
    textDayFontSize: 14 * fontScale,
    textMonthFontSize: 16 * fontScale,
    textDayHeaderFontSize: 14 * fontScale,
    textSectionTitleColor: theme.text,
    dotColor: theme.primary,
    selectedDotColor: '#ffffff',
    indicatorColor: theme.primary,
  }), [theme, fontScale]);

  const styles = useScaledStyles((scale) => ({
    container: { 
      flex: 1,
      backgroundColor: theme.background,
    },
    calendar: {
      marginBottom: 8,
      backgroundColor: theme.background, 
    },
    activities: { 
      flex: 1, 
      padding: 12 * Math.sqrt(scale),
      backgroundColor: theme.background, 
    },
    noActivities: { 
      textAlign: 'center', 
      color: theme.secondText, 
      marginTop: isTablet ? 24 * Math.sqrt(scale) : 16 * Math.sqrt(scale), 
      fontSize: isTablet ? 16 * scale : 14 * scale,
    },
    activityCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 32,
      borderWidth: 1.5,
      borderColor: theme.border,
      padding: isTablet ? 24 * Math.sqrt(scale) : 20 * Math.sqrt(scale),
      marginBottom: isTablet ? 24 * Math.sqrt(scale) : 20 * Math.sqrt(scale),
      shadowColor: theme.shadow,
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    iconCircle: {
      width: isTablet ? 64 * Math.sqrt(scale) : 56 * Math.sqrt(scale),
      height: isTablet ? 64 * Math.sqrt(scale) : 56 * Math.sqrt(scale),
      borderRadius: isTablet ? 32 * Math.sqrt(scale) : 28 * Math.sqrt(scale),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isTablet ? 24 * Math.sqrt(scale) : 18 * Math.sqrt(scale),
    },
    activityDetails: {
      flex: 1,
      justifyContent: 'center',
    },
    activityStats: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      minWidth: isTablet ? 100 : 90,
    },
    kcalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4 * Math.sqrt(scale),
    },
    kcalIcon: {
      marginRight: 4 * Math.sqrt(scale),
    },
  }));

  console.log("Rendering calendar with theme:", isDarkMode ? "dark" : "light", "Vision mode:", visionMode);

  return (
    <View style={styles.container}>
      <Calendar
        key={`calendar-${renderKey}`}
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={(day: any) => setSelectedDate(day.dateString)}
        current={selectedDate}
        theme={calendarTheme}
        style={styles.calendar}
      />

      <ScrollView style={styles.activities} contentContainerStyle={{ paddingBottom: 32 }}>
        {dayTrips.length === 0 ? (
          <AccessibleText style={styles.noActivities}>
            Žiadne aktivity v tento deň.
          </AccessibleText>
        ) : (
            dayTrips.map((trip) => {
                const typeKey = (trip.type || '').toLowerCase();
                const distance = Number(trip.distance_km || 0);
                const calories = estimateCalories(typeKey, distance);
                const activityColor = getActivityColor(typeKey);
              
                return (
                  <TouchableOpacity 
                    key={trip.id} 
                    style={styles.activityCard}
                    accessibilityLabel={`${activityLabels[typeKey] || typeKey} na ${distance.toFixed(2)} kilometrov, ${formatDuration(trip.duration_seconds)}`}
                  >
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: activityColor },
                      ]}
                    >
                      {activityIcons[typeKey] || (
                        <Ionicons name="walk-outline" size={28} color={theme.card} />
                      )}
                    </View>
                    <View style={styles.activityDetails}>
                      <AccessibleText variant="bodyBold">
                        {activityLabels[typeKey] || typeKey}
                      </AccessibleText>
                      <AccessibleText variant="caption">
                        {formatDuration(trip.duration_seconds)}
                      </AccessibleText>
                    </View>
                    <View style={styles.activityStats}>
                      <AccessibleText variant="bodyBold">
                        {distance.toFixed(2)} km
                      </AccessibleText>
                      <View style={styles.kcalRow}>
                        <Ionicons name="water-outline" size={16} color={theme.thirdText} style={styles.kcalIcon} />
                        <AccessibleText variant="caption">
                          {calories} kcal
                        </AccessibleText>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
        )}              
      </ScrollView>
    </View>
  );
};

export default ProfileCalendarTab;
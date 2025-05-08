import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';

const ACTIVITIES = [
  { value: 'running', label: 'Beh' },
  { value: 'walking', label: 'Chôdza' },
  { value: 'cycling', label: 'Cyklistika' },
  { value: 'hiking', label: 'Túra' },
  { value: 'other', label: 'Ostatné' }
];

interface ActivityPickerProps {
  selectedActivity: string;
  onSelectActivity: (activity: string) => void;
  disabled: boolean;
}

export default function ActivityPicker({ selectedActivity, onSelectActivity, disabled }: ActivityPickerProps) {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;  

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 15,
      right: 15,
      left: 15,
      backgroundColor: theme.card,
      borderRadius: 10,
      padding: 10,
      elevation: 5,
      zIndex: 1,
    },
    disabled: {
      opacity: 0.5
    },
    label: {
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 10
    },
    scrollContent: {
      paddingVertical: 5,
    },
    activityItem: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      marginRight: 10,
      borderRadius: 20,
      backgroundColor: theme.background,
    },
    selectedActivity: {
      backgroundColor: theme.primary,
    },
    activityText: {
      color: theme.text,
      fontWeight: '500',
    },
    selectedActivityText: {
      color: theme.card,
    }
  });

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <Text style={styles.label}>Aktivita:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ACTIVITIES.map((activity) => (
          <TouchableOpacity
            key={activity.value}
            style={[
              styles.activityItem,
              selectedActivity === activity.value && styles.selectedActivity
            ]}
            onPress={() => onSelectActivity(activity.value)}
            disabled={disabled}
          >
            <Text
              style={[
                styles.activityText,
                selectedActivity === activity.value && styles.selectedActivityText
              ]}
            >
              {activity.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}


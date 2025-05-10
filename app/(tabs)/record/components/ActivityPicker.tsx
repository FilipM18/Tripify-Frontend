import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/app/ThemeContext';
import { AccessibleText } from '@/components/AccessibleText';
import { useScaledStyles } from '@/utils/accessibilityUtils';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';

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
  const { theme, fontScale } = useTheme();
  const { isTablet } = useScreenDimensions();

  const styles = useScaledStyles((scale) => ({
    container: {
      position: 'absolute',
      top: isTablet ? 25 * Math.sqrt(scale) : 15 * Math.sqrt(scale),
      right: isTablet ? 25 * Math.sqrt(scale) : 15 * Math.sqrt(scale),
      left: isTablet ? 25 * Math.sqrt(scale) : 15 * Math.sqrt(scale),
      backgroundColor: theme.card,
      borderRadius: isTablet ? 15 : 10,
      padding: isTablet ? 15 * Math.sqrt(scale) : 10 * Math.sqrt(scale),
      elevation: 5,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      zIndex: 1,
    },
    disabled: {
      opacity: 0.5
    },
    label: {
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: isTablet ? 15 * Math.sqrt(scale) : 10 * Math.sqrt(scale)
    },
    scrollContent: {
      paddingVertical: 5 * Math.sqrt(scale),
    },
    activityItem: {
      paddingHorizontal: isTablet ? 20 * Math.sqrt(scale) : 15 * Math.sqrt(scale),
      paddingVertical: isTablet ? 12 * Math.sqrt(scale) : 8 * Math.sqrt(scale),
      marginRight: isTablet ? 15 * Math.sqrt(scale) : 10 * Math.sqrt(scale),
      borderRadius: 20,
      backgroundColor: theme.background,
    },
    selectedActivity: {
      backgroundColor: theme.primary,
    },
    activityText: {
      color: theme.text,
      fontWeight: '500',
      fontSize: isTablet ? 18 * scale : 16 * scale,
    },
    selectedActivityText: {
      color: theme.card,
    }
  }));

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <AccessibleText 
        variant={isTablet ? "bodyBold" : "bodyBold"} 
        style={styles.label}
      >
        Aktivita:
      </AccessibleText>
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
            accessibilityLabel={activity.label}
            accessibilityState={{ selected: selectedActivity === activity.value }}
            accessibilityRole="radio"
          >
            <AccessibleText
              style={[
                styles.activityText,
                selectedActivity === activity.value && styles.selectedActivityText
              ]}
            >
              {activity.label}
            </AccessibleText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
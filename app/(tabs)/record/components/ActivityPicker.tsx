import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';

const ACTIVITIES = [
  { value: 'running', label: 'Running' },
  { value: 'walking', label: 'Walking' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'hiking', label: 'Hiking' },
  { value: 'other', label: 'Other' }
];

interface ActivityPickerProps {
  selectedActivity: string;
  onSelectActivity: (activity: string) => void;
  disabled: boolean;
}

export default function ActivityPicker({ selectedActivity, onSelectActivity, disabled }: ActivityPickerProps) {
  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <Text style={styles.label}>Activity:</Text>
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 15,
    right: 15,
    left: 15,
    backgroundColor: 'white',
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
    backgroundColor: '#f0f0f0',
  },
  selectedActivity: {
    backgroundColor: '#4CAF50',
  },
  activityText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedActivityText: {
    color: 'white',
  }
});

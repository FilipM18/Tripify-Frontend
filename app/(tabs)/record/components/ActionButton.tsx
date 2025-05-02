import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ActionButtonsProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
}

export default function ActionButtons({ isRecording, onStart, onStop }: ActionButtonsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.actionButton,
          isRecording ? styles.stopButton : styles.startButton
        ]}
        onPress={isRecording ? onStop : onStart}
      >
        <Text style={styles.buttonText}>
          {isRecording ? 'Finish' : 'Start'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

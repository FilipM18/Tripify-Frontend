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
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)', // Semi-transparent green
  },
  stopButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)', // Semi-transparent red
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

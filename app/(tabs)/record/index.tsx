import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import RecordMap from './components/RecordMap';
import StatsDisplay from './components/StatsDisplay';
import ActionButtons from './components/ActionButton';
import ActivityPicker from './components/ActivityPicker';
import PhotoButton from './components/PhotoButton';
import { useTrip } from '../../../hooks/useTrip';

export default function RecordTripScreen() {
  const {
    route,
    currentLocation,
    totalDistance,
    pace,
    duration,
    isRecording,
    photos,
    selectedActivity,
    startRecording,
    stopRecording,
    takePhoto,
    setSelectedActivity,
  } = useTrip();

  return (
    <SafeAreaView style={styles.container}>
      <RecordMap 
        route={route} 
        currentLocation={currentLocation}
        photos={photos}
      />
      
      <ActivityPicker 
        selectedActivity={selectedActivity}
        onSelectActivity={setSelectedActivity}
        disabled={isRecording}
      />
      
      <StatsDisplay 
        duration={duration}
        distance={totalDistance}
        pace={pace}
      />
      
      <PhotoButton 
        onPress={takePhoto}
        disabled={!isRecording}
      />
      
      <ActionButtons 
        isRecording={isRecording}
        onStart={startRecording}
        onStop={stopRecording}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});

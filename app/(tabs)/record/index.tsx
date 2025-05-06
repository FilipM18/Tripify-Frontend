import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import RecordMap from './components/RecordMap';
import StatsDisplay from './components/StatsDisplay';
import ActionButtons from './components/ActionButton';
import ActivityPicker from './components/ActivityPicker';
import PhotoButton from './components/PhotoButton';
import TripSaveModal from './components/TripSaveModal';
import { useTheme } from '@/app/ThemeContext';
import { lightTheme, darkTheme } from '@/app/theme';
import { useTrip } from '@/hooks/useTrip';

export default function RecordTripScreen() {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;  

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background
    },
    mapContainer: {
      ...StyleSheet.absoluteFillObject, // This makes the map fill the entire screen
    },
  });

  const {
    route,
    currentLocation,
    totalDistance,
    pace,
    duration,
    isRecording,
    photos,
    selectedActivity,
    showSaveModal,
    uploadInProgress,
    startRecording,
    stopRecording,
    takePhoto,
    setSelectedActivity,
    saveTripWithDetails,
    cancelSaveModal
  } = useTrip();

  return (
    <SafeAreaView style={styles.container}>
      {/* Map as background */}
      <View style={styles.mapContainer}>
        <RecordMap 
          route={route} 
          currentLocation={currentLocation}
          photos={photos}
        />
      </View>
      
      {/* Stats at the top */}
      <StatsDisplay 
        duration={duration}
        distance={totalDistance}
        pace={pace}
      />
      
      {/* Activity picker */}
      <ActivityPicker 
        selectedActivity={selectedActivity}
        onSelectActivity={setSelectedActivity}
        disabled={isRecording}
      />
      
      {/* Action button at bottom center */}
      <ActionButtons 
        isRecording={isRecording}
        onStart={startRecording}
        onStop={stopRecording}
      />

      {/* Photo button at bottom right */}
      <PhotoButton 
        onPress={takePhoto}
        disabled={!isRecording}
      />

      {/* Trip Save Modal */}
      <TripSaveModal
        visible={showSaveModal}
        onClose={cancelSaveModal}
        onSave={saveTripWithDetails}
        isLoading={uploadInProgress}
        distance={totalDistance}
        duration={duration}
      />
    </SafeAreaView>
  );
}
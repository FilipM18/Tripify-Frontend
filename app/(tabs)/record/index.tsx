import React from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import RecordMap from './components/RecordMap';
import StatsDisplay from './components/StatsDisplay';
import ActionButtons from './components/ActionButton';
import ActivityPicker from './components/ActivityPicker';
import PhotoButton from './components/PhotoButton';
import TripSaveModal from './components/TripSaveModal';
import { useTheme } from '@/app/ThemeContext';
import { useTrip } from '@/hooks/useTrip';
import { useScaledStyles } from '@/utils/accessibilityUtils';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';

export default function RecordTripScreen() {
  const { theme } = useTheme();
  const { isTablet, width, height } = useScreenDimensions();
  
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
    cancelSaveModal,
    elevationGain,
    stepCount,
    upwardSteps
  } = useTrip();
  
  const styles = useScaledStyles((scale) => ({
    container: {
      flex: 1,
      backgroundColor: theme.background
    },
    mapContainer: {
      ...StyleSheet.absoluteFillObject,
    },
    tabletContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    tabletContent: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    tabletMapContainer: {
      ...StyleSheet.absoluteFillObject,
    },
  }));

  //tablet skuska mozno netreba rovnako ako na mobile
  if (isTablet) {
    return (
      <SafeAreaView style={styles.tabletContainer}>
        <View style={styles.tabletContent}>
          <View style={styles.tabletMapContainer}>
            <RecordMap 
              route={route} 
              currentLocation={currentLocation}
              photos={photos}
            />
          </View>

          <StatsDisplay 
            duration={duration}
            distance={totalDistance}
            pace={pace}
            elevationGain={elevationGain}
          />

          <ActivityPicker 
            selectedActivity={selectedActivity}
            onSelectActivity={setSelectedActivity}
            disabled={isRecording}
          />

          <ActionButtons 
            isRecording={isRecording}
            onStart={startRecording}
            onStop={stopRecording}
          />

          <PhotoButton 
            onPress={takePhoto}
            disabled={!isRecording}
          />
        </View>

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <RecordMap 
          route={route} 
          currentLocation={currentLocation}
          photos={photos}
        />
      </View>

      <StatsDisplay 
        duration={duration}
        distance={totalDistance}
        pace={pace}
        elevationGain={elevationGain}
      />

      <ActivityPicker 
        selectedActivity={selectedActivity}
        onSelectActivity={setSelectedActivity}
        disabled={isRecording}
      />

      <ActionButtons 
        isRecording={isRecording}
        onStart={startRecording}
        onStop={stopRecording}
      />

      <PhotoButton 
        onPress={takePhoto}
        disabled={!isRecording}
      />

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
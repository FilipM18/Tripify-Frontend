import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
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
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
      padding: 20 * Math.sqrt(scale)
    },
    tabletContent: {
      width: '100%',
      maxWidth: 900,
      aspectRatio: 4/3,
      borderRadius: 20 * Math.sqrt(scale),
      overflow: 'hidden',
      backgroundColor: theme.card,
      elevation: 8,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8
    }
  }));

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

  if (isTablet) {
    return (
      <SafeAreaView style={styles.tabletContainer}>
        <View style={styles.tabletContent}>
          <View style={{ flex: 1, position: 'relative' }}>
            <RecordMap 
              route={route} 
              currentLocation={currentLocation}
              photos={photos}
            />
            
            <StatsDisplay 
              duration={duration}
              distance={totalDistance}
              pace={pace}
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
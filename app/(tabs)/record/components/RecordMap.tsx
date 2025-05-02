import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { PhotoUpload } from '../hooks/useTrip';

interface RecordMapProps {
  route: Array<{latitude: number, longitude: number}>;
  currentLocation: {latitude: number, longitude: number} | null;
  photos: PhotoUpload[];
}

export default function RecordMap({ route, currentLocation, photos }: RecordMapProps) {
  return (
    <MapView
      style={styles.map}
      region={currentLocation ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      } : undefined}
      showsUserLocation
      followsUserLocation
    >
      {route.length > 0 && (
        <Polyline
          coordinates={route}
          strokeColor="#4CAF50"
          strokeWidth={4}
        />
      )}
      
      {photos.map((photo, index) => (
        <Marker
          key={index}
          coordinate={{
            latitude: photo.latitude,
            longitude: photo.longitude,
          }}
          title={`Photo ${index + 1}`}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

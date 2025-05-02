import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { useLocalSearchParams } from 'expo-router';

// Updated interface to match server response
interface Trip {
  id: number;
  distance_km: number;
  duration_seconds: number;
  average_pace: number;
  route: {
    type: string;
    coordinates: [number, number][]; // Directly under route
  };
}

export default function TripDetailsScreen() {
  const params = useLocalSearchParams<{ tripId: string }>();
  const tripId = 2;

  const [trip, setTrip] = useState<{
    data: Trip;
    coordinates: { latitude: number; longitude: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) {
      setError('Missing trip ID');
      setLoading(false);
      return;
    }

    const fetchTrip = async () => {
      try {
        const response = await fetch(
          `http://192.168.1.216:3000/trips/${encodeURIComponent(tripId)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization' : `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjRiZTMzM2U1LTc1MWEtNDRkZS05ZWJkLWY2MThhY2VlOGEwNCIsImVtYWlsIjoidm9qYWtAZ21haWwuY29tIiwidXNlcm5hbWUiOiJqYW5rb192b2phayIsImlhdCI6MTc0NTgyOTE1MiwiZXhwIjoxNzQ1OTE1NTUyfQ.faTzUDEe_5GN4P2crKuLgLtPqpy_nq43_FzMJBDxjqM'}`
            },
          }
        );
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        if (!data.success) throw new Error(data.error || 'Unknown error');
        
        // Validate and transform coordinates
        if (!data.trip?.route?.coordinates) {
          throw new Error('Invalid trip data format');
        }

        const coordinates = data.trip.route.coordinates.map(
          (coord: [number, number]) => ({
            latitude: coord[1],  // Server sends [lng, lat]
            longitude: coord[0], // Convert to [lat, lng] for react-native-maps
          })
        );

        setTrip({ 
          data: data.trip,
          coordinates 
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trip Details</Text>

      {trip && (
        <>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: trip.coordinates[0].latitude,
              longitude: trip.coordinates[0].longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Polyline
              coordinates={trip.coordinates}
              strokeColor="#FF0000"
              strokeWidth={3}
            />
          </MapView>

        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: 300,
    marginVertical: 20,
  },
  details: {
    width: '100%',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    alignItems: 'center',
  },
  error: {
    color: 'red',
    fontSize: 18,
  },
});
